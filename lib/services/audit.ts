import type { Prisma, PrismaClient } from "@prisma/client";

export type Db = PrismaClient | Prisma.TransactionClient;
export type Actor = { sub: string; clinicId: string };

/**
 * One way to write an audit entry. Pass the transaction so the record commits
 * or rolls back with the change it describes. Record identifiers and field
 * names — never health values or message contents.
 */
export function audit(
  db: Db,
  actor: Actor,
  action: string,
  entity: { type: string; id: string },
  changes?: Prisma.InputJsonValue
) {
  return db.auditLog.create({
    data: { clinicId: actor.clinicId, actorId: actor.sub, action, entityType: entity.type, entityId: entity.id, changes },
  });
}
