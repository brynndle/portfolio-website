# Field Manual — theme spec

A designer's technical-manual aesthetic: warm paper, hairline rules, zero border radius, monospace as a voice. Two accents only — ink blue for action, green for availability. One shadow, one grid module.

## Rules

1. **Radius is always 0.** No exceptions, including images and buttons.
2. **Rules, not shadows, divide the page.** 1px `--color-rule`. The single `--shadow-plate` (14px 14px, no blur) belongs to the floating offering card and nothing else.
3. **Mono is for labels only** — eyebrows, status, metadata, buttons. Never body copy.
4. **Every section is full-bleed** inside a 1px-bordered page frame; padding `48px 40px`, hero `64-76px 40px`.
5. **Two accents.** Blue = action/navigation. Green = availability/open. Nothing else gets colour.
6. **Alternate surfaces** `paper` → `paper-2` between adjacent sections rather than adding borders.

## Type scale

| Role | Size / weight / tracking | Font |
|---|---|---|
| Hero h2 | 56px / 600 / -0.03em / lh 1.02, `max-width: 18ch` | Sans |
| Hero lede | 18px / 400 / lh 1.65, `max-width: 52ch`, `text-wrap: pretty` | Sans |
| Offering title | 28px / 600 / -0.025em / lh 1.12 | Sans |
| Section h3 | 22px / 600 / -0.01em | Sans |
| Card title | 18px / 600 / -0.01em | Sans |
| Body | 14-15px / lh 1.6-1.65 / `--color-ink-2` | Sans |
| Eyebrow / label | 10-11px / 500-600 / 0.14em / uppercase | Mono |
| Featured label | 13px / 600 / 0.18em / uppercase / green | Mono |
| Button | 12.5px / 500 / 0.1em / uppercase | Mono |

## Components

### Nav
Row, `padding: 18px 40px`, bottom rule. Left: name 16/600 + mono role slug at `--color-ink-3`. Right: five mono links (12px, 0.08em, uppercase, gap 28px) then the blue consult button (`padding: 9px 16px`). Nav is the only place the button is small.

### Hero (two-column, 1fr / 560px)
Left: h2 + lede, vertically centred, `padding: 64px 44px 68px`.
Right: **ink-blue panel** with the doodle tile at `background-size: 260px; opacity: 0.35; filter: brightness(0) invert(1)` (knocks the tile to white), holding the offering card. Left border 1px rule.

### FeaturedOffering (the card)
White, 1px `--color-rule-strong`, `--shadow-plate`. Two stacked blocks:
1. Header — 10px green square + featured label; title; 14px supporting line. Bottom rule.
2. Action — green availability line, full-width blue button, mono fine print (`60 min · remote · recorded`).

(An optional 01/02/03 deliverables list sits between them in earlier explorations; the approved design omits it.)

This is the page's primary conversion unit; it repeats nowhere else. Availability text comes from one config value.

### ProjectCard
1px rule, `--color-paper-3` interior. 170px image band (bottom rule) with a mono caption bottom-left; body `padding: 20px`; blue mono eyebrow (`Game · 2 players`), 18px title, 13.5px blurb. Service variant inverts: blue fill, paper text, underlined mono link.

### Board
The public progress log. Header row + rows on a `1.6fr 0.8fr 2.2fr 0.7fr` grid, `padding: 18px 0`, hairline between. Status is a mono uppercase dot-prefixed token — blue `● In build`, green `● Taking bookings`, `--color-ink-3` `● Shipped`. Right column is a relative age (`3d`, `1w`, `—`).

Suggested collection:

```ts
// src/content.config.ts
const board = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    status: z.enum(['in-build', 'open', 'shipped', 'paused']),
    lastMove: z.string(),         // "Event generator writes the second act now"
    movedAt: z.coerce.date(),     // render as 3d / 1w / —
    project: z.string().optional() // slug into work/games/experiences
  })
});
```

### BioStrip
`300px 1fr` grid. Left: bordered portrait, rule on the right. Right: blue eyebrow, 22px h3, 15px paragraph, then a wrapped mono meta row (Clients / Shown at / link) above a top rule.

### ConsultCTA
`--color-paper-2` band, `1fr auto`, 28px h3 + 15px line, blue mono button.

### Footer
`--color-ink` background. Top block `1.4fr 1fr 1fr 1fr`, `padding: 52px 40px 44px`: identity + availability chip, then Work / More / Elsewhere link columns (mono column heads at 45% opacity, 14.5px links at 86%). Bottom bar `padding: 26px 40px 30px`: mono legal row (© , Colophon, Privacy, last deploy) and the consult button.

## Dark mode
Token flip only — see the `prefers-color-scheme` block in `global.css`. Blue lifts to `#7c97ff`, green to `#5fd39a`, paper collapses to `#16181c`. Layout, rules and radius are unchanged.

## Motion
Minimal and mechanical: 120ms colour transitions on links and buttons, no easing flourishes, no entrance animations. Board rows may animate a 1px left rule in on hover.

## ProjectDetail (interior project page)

Reference: `reference-project.html` (option 8a).

Three-band structure, all on the same 200px rail:

1. **Title block** — `paper-2`, `200px 1fr`, back link in the rail, 48px h1 (`max-width: 22ch`) + 19px blurb.
2. **Header image** — full-bleed band, `height: 520px`, `paper-2` field, image `object-contain` and centred so a 650×600 product shot and a 2000px-wide screenshot both sit correctly. No crop, no radius, bottom rule.
3. **Project record** — mono label in the rail, four-up `Role / Client / Methods / Live` grid, mono keys at `--color-ink-4`, sans values at 14px.

Then the article: **68ch prose column** at 17-17.5px / lh 1.72 with the rail carrying a sticky contents list (mono, blue for the active item). Blockquotes get a 3px blue left rule on `paper-2`.

**Figures are the point of this page.** Each figure is a `200px 1fr` row separated by a hairline: caption block in the rail (blue `Fig. 01`, 13.5px caption, mono file/meta line), image in the column at `width: 100%; height: auto`, 1px `--color-rule-strong`. The figcaption is `sticky top-6` so it stays with a tall swimlane as it scrolls past. Body images are hidden inside the prose (`prose-img:hidden`) — figures render from frontmatter instead, so captions can live in the rail.

Footer of the page: prev/next split 50/50 with hairlines, then `ConsultCTA`.

### Frontmatter addition

```ts
figures: z.array(z.object({
  src: z.string(),
  caption: z.string(),
  meta: z.string().optional(),   // "image-asset.png · swimlane"
  alt: z.string().optional(),
})).default([])
```

Migration: move each markdown `![alt](src)` (except the lead image, which becomes `thumbnail`) into `figures`, using the existing alt text or the italic line under the image as the caption.

### Responsive
Below `lg` the rail collapses: grid becomes one column, captions and contents render inline above their image, header band drops to 300px.


## Hero header (13g)

Left column (14b): `bg-paper-2` (#efeadd) under a 20px dot field —
`radial-gradient(rgb(20 22 26 / 0.26) 1.5px, transparent 1.6px)` — masked with
`radial-gradient(120% 130% at 100% 0%, #000 0 30%, transparent 78%)` so the dots
are dense behind the top-right corner and dissolve toward the headline. Two
outlined shapes sit on top: a 300px circle in `border-panel/30` bleeding off the
top-right, and a 150px square rotated 16° at the bottom. Decorative only —
`aria-hidden`, `pointer-events-none`; keep the mask so text never fights the dots.

Right column: 560px fixed, `bg-panel` (`--color-panel`, orchid `#8a4fd1`),
overlaid with `/mist.png` — a 300px tileable PNG of 1px light and dark specks
(~27% coverage, low alpha) that reads as a fine paper mist. Tile it at its
native 300px; do not scale. The doodle tile is no longer used in the hero.

The CTA stays `bg-blue` (`#2e4bec`) — the panel color is a surface, not an
action color. Panel and CTA are the only two saturated fields in the header.

Asset: copy `images/mist.png` to the site's `public/mist.png`.


## Hero header (4c) — supersedes the two-column 13g/14b header

Structure, top to bottom:

1. Nav band — hairline rule beneath, plum CTA (`bg-accent`).
2. Hero band — full width, `bg-paper-2`, `pt-[76px] pb-[132px]`. The oversized
   bottom padding exists to be overlapped; do not reduce it without also
   changing the card's negative margin.
3. Offering card — `-mt-[92px]`, `px-10`, so it lifts off the hero and hangs
   over the rule below. `shadow-plate` (14px hard offset, no blur) is what makes
   it read as a physical plate; there is no other shadow in the system.

`FeaturedOffering` in this header is the **horizontal** three-part card:
pitch (1.2fr) | three numbered deliverables (1.6fr) | action column (auto,
`bg-paper-2`). Hairline dividers between parts. Below `lg` it stacks to one
column and the dividers become bottom borders.

Green (`#00875a`) is availability only — the status square, the eyebrow, the
slots line. Plum (`--color-accent`) is action + the 01/02/03 numerals. Two
accents, no more.
