import { prisma } from "@/lib/db";
import { CLINIC_ID } from "@/lib/clinic";
import { clinicInbox, deliver, queue, siteLink } from "@/lib/notifications/outbox";
import * as email from "@/lib/notifications/templates";

/**
 * Emails triggered by the public website. They run after the submission has
 * been saved, and never fail the request: a mail outage must not lose a
 * booking. Outcomes are on record in the Notification table.
 */
async function send(items: Parameters<typeof queue>[1][]) {
  try {
    const ids = [];
    for (const item of items) ids.push(await queue(prisma, item));
    await deliver(ids);
  } catch {
    // Recorded rows keep their status; a failure here must not surface to the visitor.
  }
}

export function afterBooking(b: { name: string; email: string; when: string; mode: "clinic" | "video"; appointmentId: string }) {
  return send([
    { clinicId: CLINIC_ID, kind: "BOOKING_RECEIVED", to: b.email, email: email.bookingReceived(b.name, b.when, b.mode), related: { type: "Appointment", id: b.appointmentId } },
    { clinicId: CLINIC_ID, kind: "CLINIC_ALERT", to: clinicInbox(), email: email.clinicAlert("booking", b.when, siteLink("/admin/appointments")), related: { type: "Appointment", id: b.appointmentId } },
  ]);
}

export function afterAssessment(a: { email: string; token: string; leadId: string; caution: boolean }) {
  return send([
    { clinicId: CLINIC_ID, kind: "SNAPSHOT_READY", to: a.email, email: email.snapshotReady(siteLink(`/assessment/snapshot/${a.token}`)), related: { type: "Lead", id: a.leadId } },
    {
      clinicId: CLINIC_ID, kind: "CLINIC_ALERT", to: clinicInbox(),
      // "needs a doctor-first review" is a workflow flag, not a diagnosis — but still no condition names.
      email: email.clinicAlert("assessment", a.caution ? "flagged for a doctor-first review" : "", siteLink(`/admin/leads/${a.leadId}`)),
      related: { type: "Lead", id: a.leadId },
    },
  ]);
}

export function afterEnquiry(topic: string) {
  return send([
    { clinicId: CLINIC_ID, kind: "CLINIC_ALERT", to: clinicInbox(), email: email.clinicAlert("enquiry", topic.slice(0, 60), siteLink("/admin/enquiries")) },
  ]);
}

export function afterDeletionRequest(clinicId: string, requestId: string) {
  return send([
    {
      clinicId, kind: "CLINIC_ALERT", to: clinicInbox(),
      email: {
        subject: "A client has asked for their data to be deleted",
        text: `A data deletion request has been made from the client portal.\n\nReview it in Practice → Data requests and respond within the time stated in the privacy policy:\n${siteLink("/admin/data-requests")}`,
      },
      related: { type: "DataRequest", id: requestId },
    },
  ]);
}
