# 02 — Brand & Design System

---

## 1. The design brief in one paragraph

Ozmo should feel like a **premium clinic, not a wellness startup.** Calm, warm, exact. The public site is editorial and human — generous white space, real type, restrained motion, photography of people and food rather than stock salad bowls. The dashboard is the opposite register: dense, quiet, functional, numbers-first, zero decoration. Both share one palette and one type system so they read as one company.

**Two explicit bans:**
1. No green-leaf-and-stethoscope iconography. No "wellness gradient." No stock photo of a woman measuring her waist with a tape.
2. No dashboard that looks like a marketing page. The portal is a tool. Tools are quiet.

**The reference points:** the composure of a good private clinic's brochure + the information density of a well-made finance dashboard + Indian food photographed honestly.

---

## 2. Colour — derived from the logo

The logo settles this: **deep petrol navy ground, saturated yellow mark, white support.** Energetic and confident rather than clinical-green. The whole system is built out of those three.

### Core palette

| Token | Hex | Name | Use |
|---|---|---|---|
| `--ozmo-navy` | `#0F2E3D` | Ozmo Navy | Primary. The logo ground. Headlines, nav, dark sections, primary buttons |
| `--ozmo-navy-deep` | `#08202C` | Deep Navy | Darkest surfaces, dark-mode ground, footer |
| `--ozmo-navy-soft` | `#163B4D` | Navy Soft | Raised surfaces inside dark sections, hover states |
| `--ozmo-yellow` | `#F7D117` | Ozmo Yellow | THE accent. Buttons, highlights, progress, active states |
| `--ozmo-yellow-deep` | `#8A6D00` | Deep Gold | Yellow used as **text or icon on a light ground** — the only accessible way to do it |
| `--ozmo-paper` | `#FFFFFF` | Paper | Cards sit on white and are separated by a 1px line, not a fill |
| `--ozmo-ground` | `#FFFFFF` | Ground | **Page background — pure white.** Clean, and it makes the navy and yellow do all the work |
| `--ozmo-tint` | `#F2F6F7` | Tint | The only off-white. Alternating section bands, table stripes, inset panels. Blue-biased, never grey |
| `--ozmo-mist` | `#E6EDF0` | Mist | Section fills, table stripes, inactive chart bands |
| `--ozmo-slate` | `#4E6672` | Slate | Body text on light |
| `--ozmo-slate-soft` | `#7D939D` | Slate Soft | Labels, captions, secondary UI text |
| `--ozmo-line` | `#D3DFE4` | Line | Borders and rules |

### The yellow rule — read this before using it

`#F7D117` on white is roughly **1.6:1**. It fails every contrast threshold there is. So:

- ✅ **Yellow fill + navy text.** This is the primary button, and it's the logo's own logic inverted. High contrast, unmistakably Ozmo.
- ✅ **Yellow on navy** — text, icons, rules, the active nav underline. Around 10:1. This is where yellow sings.
- ✅ **Yellow as a non-semantic surface** — a highlight bar, a progress fill, a badge ground — always with navy text on it.
- ❌ **Never yellow text or yellow icons on white.** Use `--ozmo-yellow-deep` (`#8A6D00`, ~4.9:1) for that.
- ❌ **Never yellow as a status colour.** It reads as "warning" and it's already the brand. Status has its own hues below.

### Semantic / status

Deliberately separate from the brand accent, because yellow is taken.

| Token | Hex | Use |
|---|---|---|
| `--status-good` | `#0F7A5A` | On track, adherence ≥80%, goal met |
| `--status-watch` | `#B26B12` | Needs attention, adherence 50–79%, follow-up due |
| `--status-alert` | `#B3402F` | At risk, adherence <50%, overdue |
| `--status-neutral` | `#7D939D` | Not started, no data |

Alert is a **muted brick**, never pure red. This is a health product; red frightens people.

### Chart palette (Ozmo Track / Insights)

Navy-anchored, colour-blind safe, legible on both themes:
`#0F2E3D` · `#F7D117` · `#2E8FB0` · `#0F7A5A` · `#C4643A` · `#7A6FA8`

Sequential (adherence heatmaps), Ground → Yellow, 5 stops:
`#FFFFFF` · `#FCF0BE` · `#FBE384` · `#F9D949` · `#F7D117`

### Dark mode

The portal needs it — people log dinner at 10pm in bed. The logo is *already* a dark-mode logo, so this is the brand's native state.

- Ground `#08202C`, surface `#0F2E3D`, raised `#163B4D`, border `#21495C`
- Text `#E8F0F3` primary, `#9DB4BE` secondary
- **Yellow stays `#F7D117`** — it needs no adjustment on navy, which is the whole point of the logo
- Status colours lighten: good `#3CB08A`, watch `#DDA349`, alert `#DF8474`

Define the complete light palette on bare `:root`, override tokens only inside `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`.

---

## 3. Typography

The logo is a heavy geometric sans with a lot of confidence. Pair with something that has character but doesn't fight it.

| Role | Family | Fallback | Notes |
|---|---|---|---|
| **Display** (headlines) | `Bricolage Grotesque` | `system-ui, sans-serif` | Variable, opsz + wdth axes. Weight 600–700, tracking −0.02em at large sizes. Enough personality to avoid feeling templated, enough neutrality to stay clinical |
| **UI / Body** | `Public Sans` | `-apple-system, system-ui, sans-serif` | Clean, civic, excellent in dense UI. The portal and admin use it exclusively |
| **Numerals** | `Public Sans` + `font-variant-numeric: tabular-nums` | — | **Mandatory** on every metric, weight, table column and axis. Numbers must not jitter when they change |

Both are on Google Fonts. Load with `display: swap` and preconnect.

### Scale

| Token | Size / line-height | Use |
|---|---|---|
| `display-xl` | 64 / 1.02 | Homepage hero only |
| `display-l` | 48 / 1.06 | Page heroes |
| `display-m` | 36 / 1.12 | Section headers |
| `heading-l` | 24 / 1.3 | Card titles, portal section heads |
| `heading-m` | 19 / 1.4 | Sub-heads |
| `body-l` | 17 / 1.65 | Public site body copy |
| `body` | 15 / 1.6 | Portal + admin body |
| `label` | 13 / 1.4, +0.02em, uppercase | Field labels, table headers, eyebrows |
| `metric` | 32 / 1 tabular | Dashboard numbers |
| `metric-l` | 52 / 1 tabular | Hero numbers (Ozmo Score, current weight) |

Mobile: display-xl → 40, display-l → 32, display-m → 27. Body never below 15px public, never below 14px in the portal.

---

## 3b. Working on pure white

With a white ground there is no fill to lean on, so separation has to come from **line, type and the dark bands**:

- Cards are white with a 1px `--ozmo-line` border. No drop shadows except on genuinely floating elements (menus, sheets).
- Section rhythm is `white → white → navy band → white`. The navy full-bleed section is the punctuation, roughly once or twice per page. Use `--ozmo-tint` sparingly, only where a panel must recede.
- Rules and generous whitespace do the work that background fills would otherwise do. Give sections 96–128px of vertical padding on desktop.
- The header is white with a 1px bottom line; it does **not** turn navy on scroll.

---

## 4. Layout & space

- **Grid:** 12 column, max content width `1200px`, wide sections `1400px`, reading measure `680px` (blog, condition pages)
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128
- **Radius:** `4px` inputs · `10px` cards · `999px` pills/badges · `0` on full-bleed sections
- **Elevation:** almost none. One shadow token only: `0 1px 2px rgba(11,35,28,.06), 0 8px 24px rgba(11,35,28,.05)`. Everything else uses a 1px `--ozmo-mist` border. Flat, layered by tone, not by shadow.
- **Breakpoints:** 480 / 768 / 1024 / 1280

### Public site section rhythm
Alternate `bone` → `paper` → `ink` (full-bleed dark section, roughly once per page for emphasis) → `bone`. Never two dark sections in a row.

---

## 5. Components

### Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | Ink fill, bone text, 10px radius, 48px tall | "Start Your Health Assessment", "Book Consultation" |
| Primary-pulse | Pulse fill, ink text | Portal positive actions: "Mark Complete", "Log Meal" |
| Secondary | Transparent, 1px ink border | "Learn more", "View plan" |
| Ghost | Text + clay underline on hover | Inline links, tertiary actions |
| Danger | Transparent, alert border+text; fill only on confirm dialog | Delete, cancel programme |

All buttons: 150ms ease transition, 2px pulse focus ring at 2px offset. Minimum 44×44px touch target.

### Cards
1px mist border, 10px radius, 24px padding, paper background. On hover (only when clickable): border → ink at 20% opacity, translateY(-2px).

### The Metric Tile (most-used portal component)
```
┌────────────────────────┐
│ CURRENT WEIGHT   [label]│
│ 78.4 kg          [metric]│
│ ↓ 2.9 kg since start    │  ← pulse if good direction, slate if flat
│ [sparkline, 60×20]      │
└────────────────────────┘
```
Rules: label uppercase 13px slate · metric 32px tabular ink · delta always states the *comparison period* in words ("since start", "vs last week") — never a bare arrow · sparkline is 1px, no axis, no fill.

### Status pill
13px, pill radius, 6px×12px padding, 10% tint background + full-strength text of its status colour. Text always: `On track` / `Needs attention` / `At risk` / `Not started`. **Never colour alone** — always a word, for accessibility.

### Progress ring (Ozmo Score, adherence)
2.5px stroke, mist track, pulse/watch/alert fill by band, number centred in `metric`. Animates from 0 on first paint only — never on re-render, and it respects `prefers-reduced-motion`.

---

## 6. Motion

Restrained. This is a clinic.

- Standard transition `180ms cubic-bezier(.2,.6,.2,1)`
- Section reveal on scroll: 12px rise + fade, 400ms, **once**, `IntersectionObserver`, threshold 0.15
- Number count-up on dashboard load: 600ms, only for the hero metric, only once per session
- Streak / badge unlock: single 400ms scale pop `1 → 1.06 → 1`. That's the *only* celebratory animation in the product
- **Every animation must be disabled under `prefers-reduced-motion: reduce`**

**Banned:** parallax, perpetual loops, floating blobs, animated gradients, auto-playing carousels, anything that runs when nobody's looking. (Also: perpetual CSS animation reliably blanks the preview pane during dev — noted in my working memory from previous builds.)

---

## 7. Imagery & illustration

### Photography direction
- Real people, mid-action, natural light. Someone cooking, someone walking, someone at a consultation table.
- Indian food shot honestly on real plates — a steel thali, a dal, a bowl of poha. Not a smoothie bowl with chia seeds arranged in a spiral.
- Portraits: warm, direct, un-retouched. Aman must look like a clinician you'd trust, not a lifestyle influencer.
- **No** tape measures around waists, no cut-in-half apples, no white-coat-with-crossed-arms, no "before/after" body shots without written consent.

### Placeholder strategy for the build
Until real photos exist, use generated abstract compositions in the Ozmo palette — soft ink/sand gradient meshes with a single clay or pulse element. Self-contained SVG/CSS, no external assets. Then swap in real photography. **Do not ship stock photos as a stopgap** — a wrong stock photo is worse than an honest abstract one.

### Icons
One set, one weight: 1.5px stroke, 24px, rounded caps. Lucide is the right pick. No filled icons except in active nav states.

---

## 8. Voice & tone

### The voice in five rules

1. **Talk like the dietitian, not like the marketing team.** "We'll build the plan around what you actually eat" beats "personalised nutrition solutions."
2. **Specific beats aspirational.** Not "transform your life" — "you'll know what dinner is before you're hungry."
3. **Never promise a number.** No "lose 10kg in 30 days." Ever. Legally and ethically wrong, and it attracts exactly the clients who churn.
4. **Warm, not chirpy.** No exclamation marks in the portal except in streak celebrations. No "Yay!" No "Oops!"
5. **Hinglish only where it's natural — and only in the portal, never on the public site.** "Ghar ka khana" is fine in a recipe tag. The homepage stays in clean English.

### Tone by surface

| Surface | Tone |
|---|---|
| Homepage / programmes | Confident, calm, human. Short sentences. Editorial |
| Condition pages | Educational, careful, plainly non-diagnostic |
| Assessment | Conversational, one question at a time, encouraging |
| Snapshot result | Personal, specific, honest — never alarming |
| Portal | Brief, supportive, practical. Second person. Present tense |
| Reminders | Short, kind, never nagging. Max 12 words |
| Admin | Neutral, dense, zero personality. It's a cockpit |
| Errors | Say what happened + what to do. Never blame the user |

### Words we use / don't use

| Use | Don't use |
|---|---|
| plan | diet chart |
| programme | package (except at checkout) |
| journey, progress | transformation (overused; keep it for the stories page only) |
| guidance, support | treatment, cure, prescription |
| dietitian | doctor, expert, coach |
| track, log | monitor, surveillance |
| your dietitian | our team (too corporate for a solo clinic) |

### Absolute copy bans (medico-legal)
Never write: *cure*, *treat*, *reverse* (as a promise), *guaranteed*, *medically proven*, *doctor-approved*, *no side effects*, *detox*, *toxins*, *boost immunity*, *melt fat*, *lose X kg in Y days*.
Acceptable framing: *"may support"*, *"is often part of"*, *"we work alongside your doctor"*, *"results vary from person to person."*

---

## 9. Accessibility (non-negotiable, this is a health product)

- WCAG 2.2 AA minimum. Body text ≥ 4.5:1, large text ≥ 3:1. `--ozmo-slate` on `--ozmo-bone` passes; verify every pairing before ship.
- Status is **never** communicated by colour alone — always colour + word + (optionally) icon.
- Every form input has a visible persistent label. Placeholder-as-label is banned.
- Full keyboard operability across the assessment, the portal and the admin. Visible 2px focus ring everywhere.
- Charts have an accessible text alternative and a "view as table" toggle.
- Target size ≥ 44px on all interactive elements.
- Test the assessment flow with a screen reader before launch — it's the highest-value flow on the site.
