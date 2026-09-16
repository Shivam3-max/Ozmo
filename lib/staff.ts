/** Staff role labels and link lifetimes. Imported by client components — keep it free of server-only code. */
export const STAFF_ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Administrator", detail: "Everything, including staff accounts, privacy requests and sign-in activity." },
  { value: "DIETITIAN", label: "Dietitian", detail: "Clients, health records, plans, messages and portal invites." },
  { value: "ASSISTANT", label: "Assistant", detail: "Reads health records and messages; can't edit plans or issue portal access." },
  { value: "FRONT_DESK", label: "Front desk", detail: "Leads, appointments, enquiries and contact details. No health data." },
] as const;

export type StaffRole = (typeof STAFF_ROLE_OPTIONS)[number]["value"];
export const STAFF_ROLE_VALUES = STAFF_ROLE_OPTIONS.map((r) => r.value) as [StaffRole, ...StaffRole[]];

export const roleLabel = (role: string) => STAFF_ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

/** Setup and reset links for staff. Short-lived: staff accounts open every record. */
export const STAFF_INVITE_DAYS = 3;
export const STAFF_RESET_DAYS = 1;
