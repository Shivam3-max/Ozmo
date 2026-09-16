/**
 * Email wording. Rules for every template:
 * - no health details (conditions, weights, plans, notes) — email is not a
 *   secure channel and inboxes are shared;
 * - staff alerts carry no personal details at all, only "something arrived,
 *   open the practice area";
 * - plain text, short, and it says who it's from and what to do next.
 */
export type Email = { subject: string; text: string };

const CLINIC = "Ozmo Diet Clinic";
const signOff = `\n\n— ${CLINIC}\nThis is an automated message. Reply to the clinic directly if you have questions.`;
const first = (name: string) => name.trim().split(/\s+/)[0] || "there";

export function portalInvite(name: string, url: string, days: number): Email {
  return {
    subject: "Your Ozmo dashboard is ready",
    text: `Hi ${first(name)},\n\nYour dietitian has set up your Ozmo dashboard — your plan, daily tracking and messages in one place.\n\nChoose your password here (the link works once and expires in ${days} days):\n${url}${signOff}`,
  };
}

export function portalReset(name: string, url: string, days: number): Email {
  return {
    subject: "Reset your Ozmo password",
    text: `Hi ${first(name)},\n\nThe clinic has sent you a link to choose a new password. It works once and expires in ${days} ${days === 1 ? "day" : "days"}:\n${url}\n\nIf you didn't ask for this, ignore this email and tell the clinic — your current password keeps working until the link is used.${signOff}`,
  };
}

export function staffInvite(name: string, url: string, days: number, roleLabel: string): Email {
  return {
    subject: "Your Ozmo staff account",
    text: `Hi ${first(name)},\n\nAn Ozmo staff account (${roleLabel.toLowerCase()}) has been created for you. Choose your password here — the link works once and expires in ${days} days:\n${url}\n\nThis account opens client health records. Never share it or your password.${signOff}`,
  };
}

export function staffReset(name: string, url: string, days: number): Email {
  return {
    subject: "Reset your Ozmo staff password",
    text: `Hi ${first(name)},\n\nThe clinic administrator has issued a password reset for your Ozmo staff account. The link works once and expires in ${days} ${days === 1 ? "day" : "days"}:\n${url}\n\nIf you didn't expect this, tell the administrator straight away.${signOff}`,
  };
}

export function appointmentScheduled(name: string, when: string, mode: "IN_CLINIC" | "VIDEO", meetingUrl?: string | null): Email {
  const where =
    mode === "VIDEO"
      ? meetingUrl ? `It's a video call. Join here at the time:\n${meetingUrl}` : "It's a video call. The joining link will appear in your Ozmo dashboard before the appointment."
      : "It's at the clinic.";
  return {
    subject: `Your Ozmo appointment: ${when}`,
    text: `Hi ${first(name)},\n\nYour appointment is booked for ${when} (India time).\n${where}\n\nBefore you come: record this week's weight and log the last few days in your dashboard.${signOff}`,
  };
}

export function videoLinkAdded(name: string, when: string, meetingUrl: string): Email {
  return {
    subject: `Video link for your appointment: ${when}`,
    text: `Hi ${first(name)},\n\nHere's the link for your video appointment on ${when} (India time):\n${meetingUrl}${signOff}`,
  };
}

export function bookingReceived(name: string, when: string, mode: "clinic" | "video"): Email {
  return {
    subject: "We've received your consultation request",
    text: `Hi ${first(name)},\n\nThanks — we've received your request for a ${mode === "video" ? "video" : "clinic"} consultation on ${when} (India time).\n\nThe clinic will contact you to confirm. Nothing is final until they do.${signOff}`,
  };
}

export function snapshotReady(url: string): Email {
  return {
    subject: "Your Ozmo Health Snapshot",
    text: `Hi,\n\nYour Ozmo Health Snapshot is ready. Open it here — the link is private to you and expires in 30 days:\n${url}\n\nWhen you're ready, you can book a consultation from the snapshot page.${signOff}`,
  };
}

export function reportReady(name: string, periodLabel: string, url: string): Email {
  return {
    subject: `Your Ozmo progress report: ${periodLabel}`,
    text: `Hi ${first(name)},\n\nYour dietitian has shared your progress report for ${periodLabel}. Sign in to read it:\n${url}${signOff}`,
  };
}

/** Staff alerts: no names, phones or health details — just what arrived and where to look. */
export function clinicAlert(kind: "booking" | "assessment" | "enquiry", detail: string, url: string): Email {
  const what = { booking: "consultation request", assessment: "health assessment", enquiry: "enquiry" }[kind];
  return {
    subject: `New ${what} on the Ozmo website`,
    text: `A new ${what} has arrived${detail ? ` (${detail})` : ""}.\n\nOpen it in the practice area:\n${url}`,
  };
}
