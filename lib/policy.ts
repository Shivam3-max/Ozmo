/**
 * Who may do what — the one permission table for the whole app.
 *
 * Route handlers call `authorize(action)` (lib/auth.ts) and pages call
 * `can(role, action)`. Nothing else should compare role strings. Each action is
 * named for what the person is doing, so reading this file answers "can front
 * desk see health data?" without opening a single route.
 */

export const STAFF_ROLES = ["SUPER_ADMIN", "DIETITIAN", "ASSISTANT", "FRONT_DESK"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export type Role = StaffRole | "CLIENT";

const ADMIN = ["SUPER_ADMIN"] as const;
const CLINICAL = ["SUPER_ADMIN", "DIETITIAN"] as const;
const HEALTH = ["SUPER_ADMIN", "DIETITIAN", "ASSISTANT"] as const;
const STAFF = STAFF_ROLES;
const CLIENT = ["CLIENT"] as const;

export const PERMISSIONS = {
  // Practice area
  "practice.access": STAFF,
  "leads.manage": STAFF,
  "appointments.manage": STAFF,
  "enquiries.manage": STAFF,
  "clients.editContact": STAFF,

  // Health records — front desk is deliberately excluded.
  "health.read": HEALTH,
  "measurements.record": HEALTH,
  "messages.reply": HEALTH,
  "documents.read": HEALTH,
  "documents.upload": HEALTH,

  // Clinical decisions
  "clients.create": CLINICAL,
  "clients.convertLead": CLINICAL,
  "clients.editClinical": CLINICAL,
  "plans.edit": CLINICAL,
  "foods.edit": CLINICAL,
  "notes.write": CLINICAL,
  "reports.write": CLINICAL,
  "portal.invite": CLINICAL,

  // Clinic administration
  "portal.reset": ADMIN,
  "staff.manage": ADMIN,
  "privacy.manage": ADMIN,
  "security.read": ADMIN,
  "notifications.manage": ADMIN,
  "retention.run": ADMIN,

  // A client acting on their own record
  "portal.self": CLIENT,
} as const satisfies Record<string, readonly Role[]>;

export type Action = keyof typeof PERMISSIONS;

export function can(role: string | null | undefined, action: Action): boolean {
  return Boolean(role) && (PERMISSIONS[action] as readonly string[]).includes(role as string);
}

export const isStaffRole = (role: string | null | undefined): role is StaffRole =>
  Boolean(role) && (STAFF_ROLES as readonly string[]).includes(role as string);

/** Which session an action needs: the client's own portal session, or a staff one. */
export const scopeFor = (action: Action): "client" | "staff" => (action === "portal.self" ? "client" : "staff");
