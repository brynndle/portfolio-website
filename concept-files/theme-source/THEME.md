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
