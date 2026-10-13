---
name: Berkah Alam Outdoor Organizer
description: A ruled ledger sheet for a camping-gear rental shop. One oxide-red margin rule, 1px rules that terminate every field, and monospaced figures for anything countable.
colors:
  oxide-red: "oklch(0.53 0.16 30)"
  oxide-red-ink: "oklch(0.985 0.005 90)"
  paper: "oklch(0.988 0.003 84)"
  card-white: "oklch(1 0 0)"
  ledger-ink: "oklch(0.26 0.009 56)"
  ledger-ink-soft: "oklch(0.52 0.014 56)"
  ledger-rule: "oklch(0.26 0.009 56 / 0.22)"
  ledger-rule-strong: "oklch(0.26 0.009 56 / 0.34)"
  tint-warm: "oklch(0.962 0.007 72)"
  tint-apricot: "oklch(0.95 0.028 66)"
  apricot-ink: "oklch(0.42 0.13 44)"
  hairline: "oklch(0.91 0.008 65)"
  alarm: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  display-mobile:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.14em"
  figure:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    letterSpacing: "normal"
rounded:
  none: "0px"
  xs: "2px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  "2xl": "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
  "4xl": "96px"
components:
  button-primary:
    backgroundColor: "{colors.oxide-red}"
    textColor: "{colors.oxide-red-ink}"
    rounded: "{rounded.xs}"
    padding: "0 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.xs}"
    padding: "0 24px"
    height: "48px"
  margin-rule:
    backgroundColor: "{colors.oxide-red}"
    width: "1px"
  field-rule:
    backgroundColor: "{colors.ledger-rule}"
    height: "1px"
---

# Design System: Berkah Alam Outdoor Organizer

## Overview

**Creative North Star: "The rental ledger."**

The page a visitor lands on is the shop's own bookkeeping sheet. A rental shop's real artefact is not a tent in a meadow, it is the ruled book where a tent is written down as going out on a date and coming back on another. That book is the mechanism: it is how "clean, checked, ready" stops being a promise and becomes a row you can read. So the visual world is the book, not the campsite.

Everything follows from that. The ground is ruled stock rather than a coloured panel, so structure is carried by 1px rules that terminate every field instead of by boxes floating on a fill. One hard oxide-red rule runs down the left inset of the whole page and carries the sheet's identity. Type is split by job rather than by mood: a workhorse grotesque reads, and a monospace carries every figure, price, date, count, and column header, because those are the things a ledger is actually about. There is no serif, no gradient, no shadow, and no corner softer than 2px on anything the reader acts on.

The shop's audience is a first-time renter on a phone who is really asking one question: is this gear actually clean and ready? The system answers by showing the mechanism instead of asking for trust. Density is airy and the rhythm is slow, because a ledger that is easy to read is a ledger that is believed.

**Key Characteristics:**
- One saturated accent, used sparingly enough that its rarity carries meaning.
- Depth comes from rules and spacing. Nothing casts a shadow.
- Monospace is reserved for countable things, never for decoration.
- A single authored motion: rules draw themselves as the sheet is read.
- Light only. There is no dark theme and no theme toggle.

## Colors

A warm off-white ground with near-black ink and exactly one saturated accent, chosen to sit under the type rather than compete with it.

### Primary
- **Oxide Red** (`oklch(0.53 0.16 30)` / `#b63c2e`): the margin rule down the left inset, the primary button fill, and the out-of-stock marker. Chosen over the previous terracotta (`#f54900`), which measured 3.46:1 against its own white label and failed WCAG AA. Oxide red measures 5.52:1 on the paper ground and 5.47:1 against `#fbfaf6` label ink.
- **Oxide Red Ink** (`oklch(0.985 0.005 90)` / `#fbfaf6`): text and icons on an oxide-red fill. Never used as a page background.

### Neutral
- **Paper** (`oklch(0.988 0.003 84)` / `#fcfbf9`): the page ground. The ruled ledger lives on this; it is never a card sitting on a different fill.
- **Card White** (`oklch(1 0 0)` / `#ffffff`): interactive surfaces that need to lift off the paper by tone alone, such as outline buttons and the category index cells.
- **Ledger Ink** (`oklch(0.26 0.009 56)` / `#282320`): body and heading text. 15.04:1 on paper.
- **Ledger Ink Soft** (`oklch(0.52 0.014 56)` / `#706761`): secondary text, labels, and stock figures. 5.34:1 on paper.
- **Ledger Rule** (`oklch(0.26 0.009 56 / 0.22)`): the horizontal rules that separate every field.
- **Ledger Rule Strong** (`oklch(0.26 0.009 56 / 0.34)`): scrollbar thumbs and quiet structural marks.
- **Tint Warm** (`oklch(0.962 0.007 72)` / `#f5f2ed`): muted fills, skeletons, category count chips.
- **Tint Apricot** (`oklch(0.95 0.028 66)`): row hover tint and the empty hero plate field.
- **Apricot Ink** (`oklch(0.42 0.13 44)`): text that sits on Tint Apricot.
- **Hairline** (`oklch(0.91 0.008 65)`): component borders on inputs, cards, and badges.
- **Alarm** (`oklch(0.577 0.245 27.325)`): destructive actions and error states only.

### Named Rules

**The One Red Rule.** Oxide red appears at most once per viewport: the margin rule, or the primary action, or an out-of-stock marker. Never two. Its scarcity is the point; a second red object in view reads as an alarm instead of an anchor.

**The Rules Are The Structure Rule.** If a boundary needs to be visible, it is a 1px rule. A border is not added on top of a rule, and a shadow is never substituted for one.

## Typography

**Display Font:** Geist Variable (with `sans-serif`)
**Body Font:** Geist Variable (with `sans-serif`)
**Label/Mono Font:** Geist Mono Variable (with `ui-monospace, monospace`)

**Character:** Two workhorse voices split strictly by job. Geist reads at every size from 3.75rem down to 0.875rem and never flattens because its tracking tightens as it grows. Geist Mono is the ledger's actual voice: it sets every price, stock count, date, and column header, because those are the columns a ledger is made of. Both are self-hosted through `@fontsource-variable`, never from a font CDN.

### Hierarchy
- **Display** (600, `3.75rem` desktop / `2.5rem` mobile, 1.02, `-0.025em`): the hero headline only. Sentence case. `text-balance` so it breaks in even lines; it is expected to run three lines, not forced into two.
- **Headline** (600, `1.875rem`, 1.1, `-0.02em`): every section heading.
- **Title** (600, `1rem`): the label side of a ledger row, such as a value-prop name or a contact field name.
- **Body** (400, `1rem`, 1.625): descriptions, held to `60ch` on the company statement, `52ch` inside ledger rows, and `62ch` for hero and section subtext.
- **Label** (400, `0.6875rem`, `0.14em`, uppercase): table column headers and contact field names, in Geist Mono.
- **Figure** (400, `0.875rem`, tabular): prices and stock counts, in Geist Mono with `font-variant-numeric: tabular-nums` so columns align on the decimal.

### Named Rules

**The Ledger Voice Rule.** Monospace is for data and measurement only: prices, stock counts, dates, column headers, and field names. Never for body copy, never as a costume for "technical", never for emphasis.

**The No Eyebrow Rule.** No small uppercase label sits above a heading anywhere on the page. Column headers label columns because columns have real headers; nothing labels a section that its own heading already names.

## Layout

Content is held by a `max-w-6xl` (72rem) container that centres itself and owns the page's right padding. The ledger's left inset is a separate, narrower gutter: the container carries `padding-left: 2rem` on mobile and `3rem` from `sm` up, while the oxide-red margin rule sits at `1rem` from the container's left edge (`1.5rem` from `sm` up). Content therefore sits one gutter to the right of its own spine, and the two line up at every breakpoint.

Sections are stacked `<section>` elements separated by a full-width `1px` rule rather than by alternating background fills. Spacing runs on a single rhythm: `py-16` on mobile, `py-24` from `md`, with hero content at `pt-16` / `pt-20` and never more. More space sits above a heading than below it.

Column work uses CSS Grid. Ledger rows are a three-column grid on mobile (`3rem 1fr auto`, where price and stock stack inside the third cell) that becomes a four-column ledger table from `sm` (`3rem 1fr 9rem 7rem`) with column headers aligned to the price and stock columns. The figure cell collapses with `sm:contents` at the breakpoint rather than being duplicated.

Breakpoints are Tailwind defaults: `sm` 640, `md` 768, `lg` 1024.

## Elevation & Depth

**This system uses no shadows at all.** Depth is conveyed entirely by tonal layering and by 1px rules. A surface sits above the paper because its fill differs from the paper, not because it is lifted. Interactive response is flat too: a catalog row tints to `bg-accent/40` on hover rather than rising. This is a deliberate rejection inherited from the ledger world, where paper does not float above itself.

### Named Rules

**The Flat-By-Default Rule.** No `box-shadow` anywhere. Overlay pun (dialog, dropdown, select, sheet) sekarang memakai garis 1px, bukan bayangan.

**Hue On Data, Not Chrome.** Warna status diperbolehkan pada badge karena status itu data kategorikal dan selalu berpasangan dengan teks status, bukan warna saja. Warna tidak lagi dipakai sebagai cucian latar pada `Alert`: permukaannya netral dan hue hanya pada ikon, sehingga makna tetap terbaca tanpa mengandalkan warna. `Alert success`, `warning`, dan `info` sekarang satu recession visual yang sama.

**The Flat-By-Default Rule.** No `box-shadow` on any resting surface. If something needs to separate from its neighbour, it gets a rule or a different fill.

**The Single Outline Rule.** A bordered element never also carries a shadow. There is no version of this system that has both.

## Shapes

Sharp by default. Ledger paper and its rules have no corners, so structural elements are `0px`. The only rounded things are the shadcn controls a visitor actually presses: buttons and cards use the token radius scale, and any primary action inside the ledger world is pulled down to `2px` so it matches the rules it sits against. Nothing on the landing page uses a radius above `4px`. Images are never rounded; they sit inside a hairline-bordered field.

## Components

### Buttons
- **Shape:** `2px` inside the ledger world, `8px` (`rounded-lg`) elsewhere in the app. `h-12` (48px) for a landing-page action.
- **Primary:** Oxide Red fill, Oxide Red Ink label, `padding: 0 24px`, no border. Its left edge is pulled to the margin rule with `-ml-4` / `sm:-ml-6` so the action is seated on the spine rather than floating in the field.
- **Hover / Focus:** `opacity 0.8` on the fill. Focus is a `2px` `--ring` outline at `2px` offset, defined once in the base layer for every focusable element.
- **Secondary:** hairline-bordered card-white fill, Ledger Ink label. Tertiary and link variants drop the fill entirely and step down to `Ledger Ink Soft`.
- **Icon padding:** shadcn's `has-data-[icon=inline-end]:pr-2` and `inline-start` equivalents are overridden back to `24px` on landing-page buttons, otherwise the variant's own padding wins over the caller's.

### Cards / Containers
- **Corner Style:** `2px` in the ledger world, `14px` (`rounded-xl`) on the shared `EquipmentCard`.
- **Background:** Card White for anything interactive; Paper for anything structural.
- **Shadow Strategy:** none, per Elevation.
- **Border:** `1px` Hairline for media plates and thumbnails, `1px` Ledger Rule for fields.
- **Internal Padding:** `24px` / `32px` on a plate, `16px` on a row.

### Inputs / Fields
- **Style:** `8px` radius, `1px` Hairline border, transparent fill, `Ledger Ink Soft` placeholder.
- **Focus:** `--ring` outline at `2px` offset, consistent with every other focusable element.
- **Error / Disabled:** Alarm border and ring on `aria-invalid`; `opacity 0.5` when disabled.

### Navigation
Sticky, `h-14`, paper fill at 95% with a backdrop blur. Active route is an oxide-red pill (`bg-primary/10 text-primary`). Below `md` the links move into `AppSidebar` and the header keeps only the mark, the wordmark from `420px` up, and the account control.

### Ledger Row (signature component)
A catalog entry rendered as a row of a ruled table rather than a card. A `3rem` hairline-bordered thumbnail, the equipment name in Geist with its category beneath in Geist Mono as an uppercase label, then the price and stock as right-aligned tabular figures. A `1px` Ledger Rule closes every row and draws itself from the left when the row enters the viewport. Out-of-stock swaps the muted stock figure for Oxide Red `Kosong`.

### Kosakata Ledger (shared module)
`src/components/shared/ledger.tsx` adalah satu-satunya tempat kosakata ini tinggal, dipakai bersama oleh landing page dan sebelas halaman lainnya:

- `Sheet` - section dengan garis margin di tepi kiri
- `MarginRule` - garis margin vertikal untuk halaman non-landing
- `Rule` - garis horizontal 1px yang tergambar saat masuk viewport
- `LedgerLabel` - label kolom mono uppercase
- `Figure` - angka monospace dengan `tabular-nums`
- `PageHeader` - judul halaman + keterangan + aksi, ditutup `Rule`
- `LedgerPage` - wrapper halaman non-landing

**Primitive telah diselaraskan ke dunia ini, bukan ditimpa per halaman.** `Card`, `Badge`, `Alert`, `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Dialog`, `Sheet`, `DropdownMenu`, `Tabs`, `Label`, `Separator`, dan `Skeleton` sekarang membawa radius 2px dan garis, bukan ring dan shadow. `Label` menjadi mono uppercase, sehingga seluruh label formulir mewarisi itu tanpa satu pun perubahan per halaman.

### The Ruled Sheet (signature component)
The page wrapper. Its constant is a full-height `1px` Oxide Red rule at the left inset that writes itself downward once on mount. Every horizontal rule in the page is a `1px` Ledger Rule element, never a background gradient, and every one of them draws from the left on entry. Rules carry the entire visual identity of the world.

## Do's and Don'ts

### Do:
- **Do** put every price, stock count, date, and column header in Geist Mono with `tabular-nums`.
- **Do** separate fields with a `1px` Ledger Rule and keep that rule running the full content width.
- **Do** check any new accent use against The One Red Rule before adding it.
- **Do** keep body copy between `52ch` and `62ch`.
- **Do** honour `prefers-reduced-motion: reduce`: the system must render as a finished static sheet with every rule visible and no transition running.

### Don't:
- **Don't** add a shadow, a glow, or a gradient. The world is flat stock and ink.
- **Don't** add an eyebrow, kicker, or small uppercase label above a heading.
- **Don't** use oxide red twice in one viewport, and don't introduce a second accent hue.
- **Don't** use monospace for anything that isn't a figure, a date, a count, or a column header.
- **Don't** round a structural element, or exceed `4px` on anything the reader acts on.
- **Don't** build background rules out of `repeating-linear-gradient`. Real rule elements only; a decorative stripe grid that does not align to content is noise, and this system already rejected one.
- **Don't** re-introduce a dark theme or a theme toggle. The product is light-only by decision, and there is no `.dark` token block or `dark:` utility left in the codebase to support one.