# Project Tagging & Filtered Catalog

## Problem

Work, Games, and Experiences are three separate content collections with three
separate, un-filterable index pages. There's no single place to browse every
project, and no way to slice the catalog by kind of work (e.g. "just show me
marketing-adjacent projects").

## Goals

- Every project (work, games, experiences) carries 1-3 tags from a fixed,
  small vocabulary.
- A new unified `/projects` page lists everything across all three
  collections, with live, multi-select filter buttons.
- Each tag also gets its own dedicated, linkable page (`/projects/[tag]`)
  that loads pre-filtered to that tag.
- Existing `/work`, `/games`, `/experiences` index pages are untouched.

## Data model

Add a `tags` field to the shared `projectSchema` in `src/content.config.ts`,
used by the `work`, `games`, and `experiences` collections (not `board`,
which isn't a project):

```ts
tags: z.array(z.enum(['Product Design', 'Games', 'Experiences', 'Marketing']))
  .min(1)
  .max(3),
```

The vocabulary is intentionally small and fixed to start. Extending it later
is a one-line schema change plus updating affected frontmatter.

Tags are assigned per project by hand, based on actual content — not
defaulted from the collection a file happens to live in. For example, an
experience that doubles as a promotional piece can carry both `Experiences`
and `Marketing`; an experience that's structured as a game can carry both
`Experiences` and `Games`.

**Tag assignments for existing content:**

| File | Tags |
|---|---|
| work/clover-task-flow.md | Product Design |
| work/habitat-for-humanity.md | Product Design, Marketing |
| work/health-care.md | Product Design |
| work/irregardlessly.md | Product Design |
| work/perka-app.md | Product Design |
| work/perka-enrollment.md | Product Design, Marketing |
| work/picme-dating-app.md | Product Design |
| work/real-estate-tool.md | Product Design |
| work/seeme-ios-app.md | Product Design |
| work/seeme-website.md | Product Design |
| work/sony-playstation.md | Product Design |
| games/raising-intelligences.md | Games |
| experiences/costumes.md | Experiences |
| experiences/employment-game.md | Experiences, Games |
| experiences/heart-of-the-carpathians.md | Experiences, Marketing |
| experiences/hi-mom.md | Experiences |
| experiences/how-we-see.md | Experiences |
| experiences/termtech.md | Experiences, Games |
| experiences/the-wizard.md | Experiences |
| experiences/tick-tock-chop-shop.md | Experiences |
| experiences/tickers-repair-service.md | Experiences |

## Pages

### `/projects` (new)

Unified grid combining `getCollection('work')`, `getCollection('games')`,
and `getCollection('experiences')`, sorted by each entry's `order`. Renders
a filter bar with one button per tag plus an "All" reset, and the combined
card grid below it. No tag active on load — everything shows.

### `/projects/[tag]` (new, static)

`getStaticPaths` generates one route per tag in the enum (slugified: e.g.
`Product Design` → `/projects/product-design`). Same component and same
combined entry set as `/projects`, but rendered with that tag pre-activated
server-side — so the page loads already filtered, no flash of unfiltered
content, and the URL is directly linkable/shareable per category.

Both routes reuse the same component so there's one filtering
implementation, not two.

## Component: `ProjectsGrid.astro`

New component, sibling to the existing `CollectionGrid.astro` (which is
left untouched and keeps powering `/work`, `/games`, `/experiences`).

**Props:**
- `entries: CollectionEntry<'work' | 'games' | 'experiences'>[]` — combined,
  pre-sorted list.
- `initialTag?: Tag` — when set (on `/projects/[tag]`), that tag's filter
  button starts active and only matching cards render visible.

**Behavior:**
- Card `href` is derived per-entry from its own `entry.collection` and
  `entry.id` (e.g. `/work/clover-task-flow`), since detail pages stay on
  their existing collection-scoped routes.
- Filter buttons are multi-select with OR logic: a card is visible if it has
  *any* currently-active tag, or if no tag is active (show all).
- Filtering happens client-side via a small inline `<script>`: tag buttons
  toggle an `is-active` class on themselves and toggle a `hidden` class on
  non-matching cards by reading each card's `data-tags` attribute. No
  framework, no page reload — this is what makes `/projects` buttons live
  even when arriving pre-filtered from a `/projects/[tag]` page.
- Initial visibility (respecting `initialTag`) is computed server-side in
  the Astro template, so there's no flash of unfiltered content before JS
  runs.

## Nav

Add a `Projects` link to `src/components/Nav.astro`, positioned before
Work/Games/Experiences as the new unified entry point:

```
Now · Projects · Work · Games · Experiences · About
```

## Testing

- Manual: load `/projects`, confirm all projects render; toggle each tag
  button individually and in combination, confirm OR-logic filtering and
  the "All" reset work.
- Manual: load each `/projects/[tag]` route directly, confirm it's
  pre-filtered on load and that toggling further tags from there still
  works live.
- Manual: confirm existing `/work`, `/games`, `/experiences` pages are
  visually and functionally unchanged.
- `npm run build` succeeds (validates the new zod schema against all
  existing frontmatter, and that static paths generate correctly).
