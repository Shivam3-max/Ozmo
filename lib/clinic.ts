/**
 * The clinic this deployment serves. Ozmo runs one clinic per deployment; every
 * record is still scoped by clinicId so a second clinic never needs a data
 * migration. Must match the Clinic row created by the seed (scripts/seed.ts).
 */
export const CLINIC_ID = "ozmo";
