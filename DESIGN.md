---
name: SellHub Home — Export Declaration Surface
description: The SellHub marketing homepage (app/page.tsx) rebuilt as a completed, stamped Korean export declaration form.
colors:
  paper: "#f7f7f6"
  ink: "#1c1b29"
  brand: "#4fa8dd"
  brand-dark: "#2f7fb3"
  brand-bg: "#eef7fd"
  accent-coral: "#ff7a45"
  form-navy: "#060f1c"
  white: "#ffffff"
typography:
  headline:
    fontFamily: "SUSE Mono, IBM Plex Mono, monospace"
    fontSize: "clamp(20px, 3.6vw, 32px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  label:
    fontFamily: "SUSE Mono, IBM Plex Mono, monospace"
    fontSize: "8px-11px"
    fontWeight: 700
    letterSpacing: "0.08em-0.14em"
  body:
    fontFamily: "Pretendard Variable, Malgun Gothic, sans-serif"
    fontSize: "13.5px-14.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  field-box-label:
    backgroundColor: "rgba(28,27,41,0.03)"
    textColor: "rgba(28,27,41,0.55)"
    typography: "{typography.label}"
    padding: "6px 16px"
  candidate-slot-default:
    backgroundColor: "transparent"
    textColor: "rgba(28,27,41,0.4)"
    typography: "{typography.label}"
  candidate-slot-matched:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
  submit-button:
    backgroundColor: "{colors.white}"
    textColor: "{colors.form-navy}"
    typography: "{typography.label}"
    padding: "12px 32px"
  submit-button-hover:
    backgroundColor: "{colors.brand-bg}"
---

# Design System: SellHub Home — Export Declaration Surface

## Overview

**Creative North Star: "The Stamped Declaration"**

**Scope note: this file documents only `app/page.tsx`, the SellHub homepage rebuilt under this surface brief.** It is not a project-wide design system. `/pricing`, `/login`, `/profile`, `/brand`, and the sister Searching Hub surfaces (`/intentmate`, `/intent`) keep their pre-existing designs — the latter runs on the separate `--intent-violet` palette swapped in via `[data-brand="intent"]` in `globals.css` — and are unaffected by anything below.

The homepage abandons the hero/feature-grid/CTA scroll and instead renders as a single completed, approved Korean customs export declaration (수출신고필증): an off-white paper field (`#f7f7f6`), a full-bleed black-ink rule around every module, numbered field boxes, dashed cut-lines between declared items, and a rotated red-tinted "approved" stamp bleeding over the top-right corner. SellHub's existing brand blue is repurposed as the "matched/approved" status color; the existing coral accent is promoted to stamp-ink duty. Nothing here is a generic marketing layout with form styling applied on top — the form's own numbering and field grammar *is* the page structure, which is why the numbered boxes (01, 02, 07, 08, 09, 15, 18) are an earned exception to the platform's usual "no bare section numbers" default: the sequence is load-bearing, copied from a real declaration form's field order, not decorative.

**Key Characteristics:**
- Off-white paper ground, full-width black-ink rules, zero corner radius, zero shadow.
- Every content module is a numbered `FieldBox`: a thin label strip (`NN. Label`) over a padded content pane.
- One repeating grid of identical candidate slots with exactly one slot recolored solid brand-blue — the whole "AI found your match" story told by color alone, no card, no icon.
- SUSE Mono in a single weight (700, uppercase, tight tracking) carries every non-body string: headline, field labels, serial/reference numbers, market codes, CTA text.
- The final CTA is not a marketing banner; it's field 18, "Final authorisation," on a deep navy ground with a white rectangular "Submit" button.

## Colors

The palette is paper-and-ink with two inherited brand accents promoted to specific, narrow duties; nothing new was invented for this world.

### Primary
- **Signal Blue** (`#4fa8dd`, existing `--brand`): the single "matched/approved" color. Used only on the one highlighted candidate slot's fill and on `text-brand-dark` accents (market-code labels, the "After — SellHub" column heading, its checkmarks).
- **Signal Blue Dark** (`#2f7fb3`, existing `--brand-dark`): darker variant of the above for text-on-paper contexts where the fill-blue would fail contrast.

### Secondary
- **Stamp Coral** (`#ff7a45`, existing `--accent`): reserved for the rotated approval-stamp overlay text ("AI / 매칭 / 완료") sitting on the red stamp raster. Not used anywhere else on the page.

### Neutral
- **Declaration Paper** (`#f7f7f6`): the page background — off-white, not pure white, matching a physical form's stock.
- **Ink** (`#1c1b29`, existing `--foreground`): the sole rule/text-ink color, always applied through opacity steps rather than separate hex values — `/70` for structural module borders, `/25` for internal dashed dividers and inactive candidate-slot borders, `/55` for field-label strip text, `/80`/`/60`/`/50`/`/40`/`/35` for body-copy hierarchy from primary to faintest.
- **Form Navy** (`#060f1c`, existing `--navy`): background of the closing "Final authorisation" (CTA) field only — the one module that inverts to dark.
- **White** (`#ffffff`): the CTA button fill and its text-on-navy.

### Named Rules
**The Ink-Opacity Rule.** There is one ink color (`#1c1b29`). Every visual weight of border, divider, and secondary text is an opacity step of that ink, never a second gray hex. A new gray value is a violation, not a variant.

**The One Highlight Rule.** Signal Blue fills exactly one element on the page at a time (the matched candidate slot). Everything else that isn't ink-on-paper or the stamp's coral is either full ink or an ink opacity step.

## Typography

**Display/Label Font:** SUSE Mono (with IBM Plex Mono, monospace fallback) — self-hosted via `next/font/google`, weight 700 only, always uppercase with tracking between `0.08em` and `0.14em`.
**Body Font:** Pretendard Variable (with Malgun Gothic, sans-serif fallback) — the project's standing Korean body face, unchanged by this surface.

**Character:** A single heavy monospace voice for every structural/numeric string (headline, field labels, serial numbers, market codes, candidate IDs, CTA text) against a warm, readable Pretendard voice for every sentence of real Korean copy. The contrast between "stamped form data" and "written declaration text" is the entire typographic idea.

### Hierarchy
- **Headline** (700, `clamp(20px, 3.6vw, 32px)`, line-height 1.15): the masthead H1 only ("바이어 찾기부터 제안 메일까지"), uppercase, tight tracking.
- **Field label** (700, 10px, tracking 0.14em, uppercase): the `NN. Label` strip at the top of every `FieldBox` and section band.
- **Micro label** (700, 8-9px, tracking 0.08-0.1em, uppercase): serial numbers, market codes (JP/US/SEA), candidate slot numbers, footer reference code.
- **Body** (400, 13.5-14.5px, line-height 1.7, Pretendard): all field paragraph copy and pain-point/solution list items; unconstrained measure (page container caps at `max-w-5xl`, columns run well under 75ch in the two-column field grid).

### Named Rules
**The One-Weight Mono Rule.** SUSE Mono ships at a single weight (700) and a single case (uppercase) everywhere it appears. There is no regular-weight or mixed-case use of the display font on this surface.

## Layout

Single-column page shell (`max-w-5xl`, `px-4 sm:px-6`, `py-10 sm:py-14`) containing a stack of full-width bordered modules, each separated by `mt-6`. Two internal grid patterns recur: a `sm:grid-cols-2` split for paired fields (Product/Target market; Result/Turnaround; Before/After), and a `grid-cols-3 sm:grid-cols-9` repeating row for the nine identical candidate slots. Every module shares one outer rule (`border border-foreground/70`); internal field pairs share a single divider rather than doubling borders (`border-r-0 sm:border-r` on the left cell). The Before/After module uses `divide-dashed` — the OWN-WORLD's "점선 재단선" (dashed cut-line) motif — instead of a solid rule, marking it as a comparison/declaration rather than a plain field. Responsive collapse is column-stacking only: two-column field grids and the before/after comparison drop to one column below `sm`; the candidate row drops from 9 to 3 columns, keeping every slot present and square rather than reflowing into a list.

## Elevation & Depth

Flat by construction: no shadow is used anywhere on this surface. Depth is conveyed the way a paper form conveys it — by ink weight and rule hierarchy, not light. The consistent `border-foreground/70` is the "cut" outer edge of a module; `border-foreground/25` is an internal, lighter division; a `bg-foreground/[0.03]` tint marks a label strip as a distinct plane from its content pane below it. The stamp and seal raster images are the only elements that read as "sitting on top" of the page, achieved by absolute positioning and rotation, not shadow.

### Named Rules
**The No-Shadow Rule.** This surface uses zero `box-shadow`. Any future addition to this page that reaches for a shadow for elevation has left the paper-and-ink world; use a border-weight or opacity step instead.

## Shapes

Every rectangle on the page is a true rectangle: zero border-radius throughout, including the CTA button, the field boxes, the candidate slots, and the market-code chips. The only non-rectangular forms on the page are the raster images (the circular stamp, rotated `-14deg`, and the seal icon), which are illustrated assets, not CSS shapes.

## Components

### FieldBox (signature component)
The page's one repeating structural unit: a top label strip (`NN. Label`, uppercase SUSE Mono, ink/55, on an ink/[0.03] tint, bottom-ruled with `border-b border-foreground/70`) over a padded content pane (`p-4 sm:p-5`). Every numbered section on the page (01 Product, 02 Target market, 08 Result, 09 Turnaround, 15 Declaration, 18 Final authorisation) is either a literal `FieldBox` or the same label-strip-over-pane pattern applied to a full-width section. The number is not decorative — it is the field's declaration-form field number and must stay sequential with meaning, per the OWN-WORLD contract.

### Candidate row (signature component)
Nine identical bordered cells in a `grid-cols-3 sm:grid-cols-9` row. Eight are plain (`border-foreground/25`, `text-foreground/40`, showing "ID:" and a `—`); exactly one (index 6 of 9, `MATCHED_SLOT`) is solid-filled `bg-brand text-white border-brand` and shows "Matched" with a check mark. The matching is told entirely through this one color swap across an otherwise uniform repeating row — never through a card, icon, or badge.

### Buttons
- **Shape:** rectangular, 0px radius.
- **Primary (Submit):** white fill, navy text (`text-navy`), `border border-white`, `px-8 py-3`, SUSE Mono label text ("Submit — 무료로 시작하기"), sitting on the navy "Final authorisation" field.
- **Hover:** background shifts to `--brand-bg` (`#eef7fd`), a plain `transition-colors`, no transform or shadow added.
- No secondary/ghost button variant exists on this surface.

### Masthead (signature component)
The header block: seal-icon raster (top-left) + org name/tagline (SUSE Mono two-line block) + H1 headline + serial number/barcode raster (top-right), all inside one bordered row, with the rotated coral-stamp raster bleeding over the row's top-right corner and into the field grid below it. This is the page's only place where a raster image, not a rule, carries the "official document" signal.

### Inputs / Navigation
Not part of this surface — the homepage has no form inputs, and navigation is the shared `SiteHeader`/`SiteFooter` components (out of scope for this rebuild; left untouched).

## Do's and Don'ts

### Do:
- **Do** use SUSE Mono at weight 700, uppercase, for every field label, serial number, market code, and CTA string — never for a full paragraph of Korean body copy.
- **Do** keep the single ink color (`#1c1b29`) and vary only its opacity for every border/divider/secondary-text weight; don't introduce a second gray.
- **Do** number a field only when the number is a real declaration-form field number carried by the page's own document metaphor; the exception exists because the sequence is load-bearing here, not by default for future pages.
- **Do** tell a "one match among many" story through a single solid-color fill inside an otherwise identical repeating grid row, not a card or badge.

### Don't:
- **Don't** add a `box-shadow` anywhere on this surface — depth is ink-weight and opacity, not light.
- **Don't** add corner radius to any box, chip, or button; the form's rectilinear grid is the whole shape language.
- **Don't** treat the numbered-field device or the SUSE Mono declaration voice as a global system rule — both are scoped to this one surface's document metaphor, not a precedent for other SellHub or Searching Hub pages.
- **Don't** carry the ✓ / ✕ Unicode glyphs used here for the candidate-match mark and the before/after list forward as this project's icon system; they are a defect of this build (see below), not a documented component.
