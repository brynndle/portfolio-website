# Field Manual — theme handoff

Design source: `Theme Directions v2.dc.html` → option **5a**, group **Final Version**.
Target stack: Astro + Tailwind v4 (matches the existing `portfolio-website` repo).

## What's here

| File | Drop it at | Note |
|---|---|---|
| `global.css` | `src/styles/global.css` | Replaces the plum/amber theme. Same `@theme` pattern. |
| `doodles.svg` | `public/doodles.svg` | Two-tone doodle tile used behind the featured offering. |
| `components/*.astro` | `src/components/` | Ready to wire to the content collections. |
| `components/HomePage.astro` | body of `src/pages/index.astro` | Section order for the home page. |
| `THEME.md` | — | Rules, tokens, component specs, dark mode. |
| `reference.html` | — | Static render of the approved design. Open it side by side while building. |

## Fonts

Swap the fontsource imports:

```sh
npm rm @fontsource/space-grotesk @fontsource/archivo
npm i @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
```

## Order of work

1. `global.css` + fonts + `public/doodles.svg`.
2. `Nav.astro`, `Footer.astro` (site-wide, visible immediately).
3. `Hero.astro` + `FeaturedOffering.astro` — the consult conversion path; this is the point of the page.
4. `ProjectCard.astro` / `CollectionGrid.astro` restyle.
5. `Board.astro` — new. Needs a `board` content collection (schema in THEME.md).
6. `BioStrip.astro`, `ConsultCTA.astro`.

## Content gaps to fill before launch

- Portrait image for the bio strip.
- Real booking URL — replace `BOOK_A_CONSULT_URL` in `Nav.astro`, `FeaturedOffering.astro`, `ConsultCTA.astro`.
- `board` collection entries + `lastMove` / `since` values (see schema).
- Availability string ("2 slots left in August") — one place, `src/data/site.ts`.
