import { describe, expect, it } from "vitest";
import * as t from "./templates";

/** Words that would mean health information leaked into an email. */
const HEALTH_WORDS = /diabet|pcos|thyroid|cholesterol|pressure|liver|pregnan|allerg|weight|\bkg\b|bmi|condition|diagnos|medic/i;

const all = [
  t.portalInvite("Asha Rao", "https://x.test/portal/setup/abc", 14),
  t.portalReset("Asha Rao", "https://x.test/portal/setup/abc", 2),
  t.staffInvite("Dr Mehta", "https://x.test/admin/setup/abc", 3, "Dietitian"),
  t.staffReset("Dr Mehta", "https://x.test/admin/setup/abc", 1),
  t.appointmentScheduled("Asha Rao", "Monday 3 March, 10:00 am", "VIDEO", "https://meet.test/abc"),
  t.appointmentScheduled("Asha Rao", "Monday 3 March, 10:00 am", "IN_CLINIC"),
  t.videoLinkAdded("Asha Rao", "Monday 3 March, 10:00 am", "https://meet.test/abc"),
  t.bookingReceived("Asha Rao", "Monday 3 March, 10:00 am", "clinic"),
  t.snapshotReady("https://x.test/assessment/snapshot/abc"),
  t.reportReady("Asha Rao", "1 Feb – 2 Mar 2026", "https://x.test/portal/reports/abc"),
  t.clinicAlert("booking", "Monday 3 March", "https://x.test/admin/appointments"),
  t.clinicAlert("assessment", "flagged for a doctor-first review", "https://x.test/admin/leads/1"),
  t.clinicAlert("enquiry", "Pricing", "https://x.test/admin/enquiries"),
];

describe("email templates", () => {
  it("never carry health details", () => {
    for (const email of all) {
      // "weigh" appears in a reminder to record weight before an appointment; that's an instruction, not data.
      const text = `${email.subject}\n${email.text}`.replace("record this week's weight", "");
      expect(text, email.subject).not.toMatch(HEALTH_WORDS);
    }
  });

  it("address people by first name only", () => {
    expect(t.portalInvite("Asha Rao", "u", 14).text).toContain("Hi Asha,");
    expect(t.portalInvite("Asha Rao", "u", 14).text).not.toContain("Rao");
  });

  it("keep personal details out of staff alerts", () => {
    const alert = t.clinicAlert("booking", "Monday 3 March", "https://x.test/admin/appointments");
    expect(alert.text).not.toMatch(/Asha|@|\+91/);
  });
});
