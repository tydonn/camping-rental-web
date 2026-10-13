---
version: 1
slug: "src-pages-landingpage-tsx"
primary_target: "src/pages/LandingPage.tsx"
related_targets: []
---

# Surface brief: Landing page `/`

## Scope

Public landing page of Camping Rental, route `/`, rendered full-bleed inside `Layout.tsx`'s `w-full flex-1` main. Mode: **Persuade**. Primary target `src/pages/LandingPage.tsx`. Shared surfaces deliberately out of scope: `Layout.tsx` header and footer, `components/ui/*`, `EquipmentCard`.

## Audience, job, action

First-time renters around Bandung who have never rented camping gear, on a phone, often the night before a weekend trip. Their deciding question is not price, it is "is this gear actually clean and ready to use". Job: answer that, then move them into the catalog. Proof on hand: real equipment records with names, descriptions, daily prices, stock and photos; real categories; the shop's real address, hours, phone, email; one admin-uploaded hero photo; a Google Maps embed. There is no testimonial, review count, customer logo, award, or verified statistic in the repository, and none may be invented.

## Direction and memorable moment

**Rental ledger book** (seed `c7cf9672`, assigned index 3). The page is the shop's rental ledger, not a brochure about camping: ruled stock is the literal ground, one hard oxide-red margin rule carries section labels and the primary action, and every field terminates in a 1px rule. Catalog items are dated ledger rows with real stock figures rather than a card grid.

Memorable moment: **the rule draws itself.** Horizontal rules extend from the left margin to their full width as each entry enters the viewport, so the page reads as a sheet being written rather than boxes being stacked. Transform-only, IntersectionObserver-triggered, collapses to a static sheet under reduced motion.

## Constraints

- Product truth and API contracts unchanged. Routes, nav labels, and the header wordmark are untouched.
- No new content. Every string on the page comes from data already rendered by the incumbent page or from `COMPANY_PROFILE`.
- Dark mode with near-black ground is a product commitment (PRD §2.1, §8) and is designed, not derived.
- PRD §2.1 asks for a full-bleed hero. The committed world seats the hero image as a ruled plate inside the field instead. Function kept: the image still comes from `GET /api/settings` and still has an intentional absent state. Flagged to the user as a deliberate visual deviation.
- No new dependencies. No animation library (PRD §2.2).

## Unresolved

- PRD §8 also requires a navbar fixed transparent over the hero that becomes solid on scroll. `Layout.tsx` shares that header across every route, so it is not touched here. Open as a separate scoped decision.

## Direction contract

THESIS: The page is the shop's rental ledger, not a brochure about camping. The category default is a photograph of a tent under a promise; this page is the instrument that actually tracks whether a tent is clean, out, and due back on a date. It refuses the equal-card grid, the centred photo hero, and the eyebrow.

OWN-WORLD: Ruled stock as literal ground, never a panel sitting on a neutral fill. One hard oxide-red margin rule down the left inset carries every section label and the primary action. Horizontal 1px rules terminate every field. No serif, no gradient, no shadow, no corner radius above 4px. Geist carries reading; Geist Mono carries every figure, price, date, count, and label. In the near-black dark mode the rules invert to low-opacity white and the margin rule stays the one saturated event on the sheet.

STORY: A first-time renter arrives distrustful of rented gear. The sheet reads top to bottom: the promise as the first entry, the three reasons as three ruled rows, the categories as index tabs, the eight featured items as ledger rows carrying their real price and stock figures, the shop's location as the closing record. Every row is checkable. Nothing asks for trust; it shows the mechanism that earns it.

FIRST VIEWPORT: The margin rule stands at the left inset at full sheet height. The headline sits in the field at `lg:text-6xl`, tracking `-0.025em`, two lines, sentence case. The subtext is one measure below at 65ch. The primary CTA is a filled oxide-red block seated in the margin rule, under its own mono label. The hero image, when settings provide one, is a ruled plate at the field's right on desktop and directly beneath the CTA on mobile; when absent, the plate holds the empty ruled slot with the shop name set as a ledger entry. Desktop top padding `pt-20`, never more.

FORM: Rental ledger book, position 3 of the grounded list. Seed key `c7cf9672`. Raises: material-as-ground from the azulejo station hall; live state grammar from the shareware installer; luminous dark from the CRT arcade; honest magnitude from the VU bridge; zip-tie and hazard discipline from the industrial streetwear challenger, which held product clarity and stays competitive as a full alternate.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
