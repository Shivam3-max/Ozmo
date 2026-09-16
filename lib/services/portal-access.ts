import { randomBytes } from "node:crypto";
import type { NotificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { can, isStaffRole } from "@/lib/policy";
import { conflict, forbidden, invalid, notFound, ServiceError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { passwordProblem, PASSWORD_MIN, STAFF_PASSWORD_MIN } from "@/lib/password-policy";
import { audit, type Actor } from "@/lib/services/audit";
import { deliver, queue, siteLink } from "@/lib/notifications/outbox";
import * as email from "@/lib/notifications/templates";
import { roleLabel, STAFF_INVITE_DAYS, STAFF_RESET_DAYS, STAFF_ROLE_VALUES, type StaffRole } from "@/lib/staff";

export const CLIENT_INVITE_DAYS = 14;
export const CLIENT_RESET_DAYS = 2;

const token = () => randomBytes(24).toString("base64url");
const daysFromNow = (days: number) => new Date(Date.now() + days * 864e5);
export type Emailed = NotificationStatus | "NO_ADDRESS";

type SessionRole = Actor & { role: string };

/** A one-time link for a client to set (or reset) their portal password — emailed when they have a real address. */
export async function issueClientLink(actor: SessionRole, clientId: string, opts: { reset: boolean }) {
  const client = await prisma.client.findFirst({ where: { id: clientId, clinicId: actor.clinicId, deletedAt: null }, include: { user: true } });
  if (!client || !client.user.isActive || client.user.deletedAt) throw notFound("Client");

  const hasPassword = Boolean(client.user.passwordHash);
  if (hasPassword && !opts.reset) throw conflict("This client already has portal access. Use a password reset if they're locked out.", { hasPassword });
  if (hasPassword && !can(actor.role, "portal.reset")) throw forbidden("Only the clinic administrator can reset a client's portal password.");

  const days = hasPassword ? CLIENT_RESET_DAYS : CLIENT_INVITE_DAYS;
  const t = token();
  const path = `/portal/setup/${t}`;

  const notificationId = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: client.userId }, data: { inviteToken: t, inviteExpiresAt: daysFromNow(days) } });
    await audit(tx, actor, hasPassword ? "PORTAL_RESET_ISSUED" : "PORTAL_INVITE_ISSUED", { type: "Client", id: clientId });
    return queue(tx, {
      clinicId: actor.clinicId,
      kind: hasPassword ? "PORTAL_RESET" : "PORTAL_INVITE",
      to: client.user.email,
      email: hasPassword ? email.portalReset(client.user.name, siteLink(path), days) : email.portalInvite(client.user.name, siteLink(path), days),
      related: { type: "Client", id: clientId },
      createdById: actor.sub,
    });
  });

  const emailed: Emailed = notificationId ? (await deliver([notificationId]))[notificationId] : "NO_ADDRESS";
  return { path, expiresInDays: days, hasPassword, emailed };
}

/** Adds a staff member; they choose their own password from an emailed/copied link. */
export async function createStaff(actor: Actor, input: { name: string; email: string; role: StaffRole }) {
  if (!STAFF_ROLE_VALUES.includes(input.role)) throw invalid("Choose a staff role.");
  if (await prisma.user.findUnique({ where: { email: input.email } })) throw conflict("That email already belongs to an account.");

  const t = token();
  const path = `/admin/setup/${t}`;
  const { user, notificationId } = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { clinicId: actor.clinicId, role: input.role, name: input.name, email: input.email, inviteToken: t, inviteExpiresAt: daysFromNow(STAFF_INVITE_DAYS) },
    });
    await audit(tx, actor, "STAFF_CREATED", { type: "User", id: created.id }, { role: input.role });
    const id = await queue(tx, {
      clinicId: actor.clinicId, kind: "STAFF_INVITE", to: input.email,
      email: email.staffInvite(input.name, siteLink(path), STAFF_INVITE_DAYS, roleLabel(input.role)),
      related: { type: "User", id: created.id }, createdById: actor.sub,
    });
    return { user: created, notificationId: id };
  });
  const emailed: Emailed = notificationId ? (await deliver([notificationId]))[notificationId] : "NO_ADDRESS";
  return { userId: user.id, path, expiresInDays: STAFF_INVITE_DAYS, emailed };
}

/** A fresh setup or reset link for a staff member. Their current password keeps working until it's used. */
export async function issueStaffLink(actor: Actor, userId: string) {
  if (userId === actor.sub) throw conflict("Change your own password from Account instead.");
  const target = await prisma.user.findFirst({ where: { id: userId, clinicId: actor.clinicId, deletedAt: null } });
  if (!target || !isStaffRole(target.role)) throw notFound("Staff member");
  if (!target.isActive) throw conflict("Enable this account before sending a link.");

  const isReset = Boolean(target.passwordHash);
  const days = isReset ? STAFF_RESET_DAYS : STAFF_INVITE_DAYS;
  const t = token();
  const path = `/admin/setup/${t}`;
  const notificationId = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { inviteToken: t, inviteExpiresAt: daysFromNow(days) } });
    await audit(tx, actor, isReset ? "STAFF_RESET_ISSUED" : "STAFF_INVITE_REISSUED", { type: "User", id: userId });
    return queue(tx, {
      clinicId: actor.clinicId, kind: isReset ? "STAFF_RESET" : "STAFF_INVITE", to: target.email,
      email: isReset ? email.staffReset(target.name, siteLink(path), days) : email.staffInvite(target.name, siteLink(path), days, roleLabel(target.role)),
      related: { type: "User", id: userId }, createdById: actor.sub,
    });
  });
  const emailed: Emailed = notificationId ? (await deliver([notificationId]))[notificationId] : "NO_ADDRESS";
  return { path, expiresInDays: days, isReset, emailed };
}

/**
 * Uses a one-time link to set a password. `kind` keeps client links and staff
 * links from being used on each other's form. Returns the user to sign in.
 */
export async function setPasswordFromLink(kind: "client" | "staff", linkToken: string, password: string) {
  const user = await prisma.user.findUnique({ where: { inviteToken: linkToken }, include: { client: true } });
  const roleOk = user && (kind === "client" ? user.role === "CLIENT" && user.client && !user.client.deletedAt : isStaffRole(user.role));
  if (!user || !roleOk || !user.isActive || user.deletedAt || !user.inviteExpiresAt || user.inviteExpiresAt < new Date()) {
    throw new ServiceError(400, kind === "client" ? "That link has expired. Ask the clinic for a new one." : "That link has expired. Ask the clinic administrator for a new one.");
  }

  const weak = passwordProblem(password, { name: user.name, email: user.email, phone: user.phone }, kind === "staff" ? STAFF_PASSWORD_MIN : PASSWORD_MIN);
  if (weak) throw invalid(weak);

  const hadPassword = Boolean(user.passwordHash);
  const passwordHash = await hashPassword(password);
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, inviteToken: null, inviteExpiresAt: null, lastLoginAt: new Date(), sessionVersion: { increment: 1 } },
    });
    const action = kind === "client" ? (hadPassword ? "PORTAL_PASSWORD_RESET" : "PORTAL_PASSWORD_SET") : hadPassword ? "STAFF_PASSWORD_RESET" : "STAFF_PASSWORD_SET";
    await audit(tx, { sub: user.id, clinicId: user.clinicId }, action, kind === "client" ? { type: "Client", id: user.client!.id } : { type: "User", id: user.id });
    return row;
  });
  return { ...updated, role: updated.role };
}
