# OZMO — Digital Health & Nutrition Platform
## Master Brainstorm Report (Pre-Build)

**Client:** Ozmo Diet Clinic
**Prepared by:** Shivam Bhandari
**Date:** 28 August 2026
**Status:** Planning / pre-build. Nothing here is coded yet. Second pass = build.

---

## What this report is

This is the complete blueprint for turning `ozmodietclinic.com` from a website into a **product**.

It contains:

1. **Every word** that goes on the public website — written, not placeholder.
2. **Every screen** in the client portal — what's on it, what it says, what it does.
3. **Every module** in the admin — tables, fields, actions, permissions.
4. The data model, the roles, the tech stack, the legal guardrails and the build order.

The rule I followed while writing: **if a developer or a copywriter would have to invent it, it's written here.** If it's a fact only Aman can confirm, it's marked `[CONFIRM]` — never invented.

---

## The document set

| # | File | What it covers |
|---|------|----------------|
| 00 | `00-README-INDEX.md` | This file. Index + open questions. |
| 01 | `01-STRATEGY-POSITIONING.md` | The big idea, naming, moat, market read, business model |
| 02 | `02-BRAND-DESIGN-SYSTEM.md` | Voice, colour, type, components, motion, imagery rules |
| 03 | `03-SITEMAP-ROUTES.md` | Every route across all three layers |
| 04 | `04-CONTENT-HOME.md` | Homepage — full copy, section by section |
| 05 | `05-CONTENT-CORE-PAGES.md` | About, How It Works, Stories, Contact, FAQ, Legal — full copy |
| 06 | `06-CONTENT-PROGRAMS.md` | Programs hub + 6 program pages + pricing architecture |
| 07 | `07-CONTENT-CONDITIONS.md` | Conditions hub + 10 SEO landing pages — full copy |
| 08 | `08-CONTENT-BLOG-RECIPES-SEO.md` | Keyword clusters, 40 article briefs, recipes, schema |
| 09 | `09-HEALTH-ASSESSMENT-SPEC.md` | The 7-step assessment, question by question + Snapshot output |
| 10 | `10-CLIENT-PORTAL-SPEC.md` | Every portal screen, UI copy, empty states, notifications |
| 11 | `11-ADMIN-SPEC.md` | Every admin module, feature by feature |
| 12 | `12-DATA-MODEL-TECH.md` | Schema, roles matrix, stack, integrations, security, DPDP |
| 13 | `13-BUILD-ROADMAP.md` | Phasing, what ships in V1, acceptance criteria |

---

## The one-line pitch to Aman

> "We're not building you a website. We're building the system your clinic runs on — and the website is just its front door."

---

## Read this before anything else: three honest cautions

**1. The scope in the original idea is roughly 3 products, not 1.**
Public site + client portal + practice-management admin is genuinely a 3-product build. Everything in this report is *specified*, but Section 13 splits it into phases. Trying to ship all 52 routes at once is the single fastest way to ship none of them. V1 is defined tightly and deliberately.

**2. This is health data. It changes how we build.**
Weight, lab reports, medications, medical conditions — under India's DPDP Act 2023 this is personal data with real obligations around consent, retention, breach notification and deletion. That is not a "phase 2 checkbox." It's baked into the data model in Section 12. It also means: no analytics pixel ever fires on a portal page, no client data in URL parameters, no health data in WhatsApp payloads.

**3. We must never let the product make medical claims.**
Ozmo provides **nutrition and lifestyle guidance**. It does not diagnose, treat or cure. Every condition page in Section 07 is written to that line and the disclaimer copy is in Section 05. An AI layer that reads a lab report and tells a client what it means crosses that line — so the spec in Section 11 has AI extracting values *for the dietitian to interpret*, never for the client to read as advice.

---

## Open questions — need Aman's answers before build

These are the only blanks in the report. Everything else is written.

### Identity & credentials
1. **Exact legal name and spelling of the lead dietitian.** The source I was given points at a "Soni" profile, but the public web returns nothing that confirms "Ozmo Diet Clinic" or the first name. We will not publish credentials we can't verify — a wrong qualification on a health site is a real liability. Need: full name, degrees, registration/licence number (RD / IDA membership if applicable), years practising.
2. **Clinic legal entity name, GSTIN, registered address** (needed for invoices and T&Cs).
3. **Physical clinic address + Google Business Profile URL** (needed for LocalBusiness schema and the Contact page map).
4. **Is it one dietitian or a team?** This changes the role model and the "About" page structure significantly.

### Numbers we can't invent
5. Number of clients served to date (for the homepage proof bar).
6. Years in practice.
7. Any real, consented transformation stories + before/after numbers + whether clients consent to photos or numbers-only.
8. Average outcome data if it exists (e.g. "average 6.2 kg in 90 days"). If it doesn't exist yet — the platform will start generating it from month one, which is itself a selling point.

### Commercial
9. **Current pricing** for consultation and packages. Section 06 proposes a structure and price bands; Aman sets the numbers.
10. Does he want online payment (Razorpay) from day one, or keep collecting offline for V1?
11. Consultation mode: in-clinic, video, or both? Which is the default?
12. Does he currently use any software (Excel, WhatsApp, a diet-chart tool)? **We need one real existing client file to model the data on.**

### Clinical / operational
13. His actual workflow, start to finish: how does a new client go from enquiry → plan → follow-up today? The Diet Plan Builder in Section 11 must match how *he* thinks, not how software thinks.
14. Does he prescribe supplements? (Affects the plan model and the compliance line.)
15. Does he want food photo logging (high engagement, high review burden for him) or simple checkbox logging in V1? **My recommendation: checkbox in V1, photos in V2.**
16. Languages: English only, or English + Hindi? (Affects everything. Decide now, not later.)

### Brand
17. Is "Ozmo" locked as the name? Any existing logo, colour, or Instagram aesthetic we should inherit?
18. Domain confirmed as `ozmodietclinic.com`?

---

## How to use this in the build pass

Read `13-BUILD-ROADMAP.md` first, then build Phase 1 straight out of files 02 → 04 → 05 → 06 → 07 → 09. The copy in those files is production copy: paste it, don't rewrite it. Portal and admin come from files 10 → 11 → 12.
