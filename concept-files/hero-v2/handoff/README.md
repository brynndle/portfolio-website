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
| `reference.html` | — | Static render of the approved home page. Open it side by side while building. |
| `reference-project.html` | — | Static render of the approved project detail page (8a). |

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
7. `ProjectDetail.astro` — interior project pages. Needs the `figures` frontmatter field (schema in THEME.md) and a one-time content migration of inline markdown images.

## Content gaps to fill before launch

- Portrait image for the bio strip.
- Real booking URL — replace `BOOK_A_CONSULT_URL` in `Nav.astro`, `FeaturedOffering.astro`, `ConsultCTA.astro`.
- `board` collection entries + `lastMove` / `since` values (see schema).
- Availability string ("2 slots left in August") — one place, `src/data/site.ts`.


## Header: option 4c (current)

The approved header is now **4c** — full-width hero with the offering card
floating up over the rule beneath it. It replaces the earlier two-column
(13g / 14b) header.

- `components/Hero.astro` — full-width hero band + card pulled up `-mt-[92px]`.
- `components/FeaturedOffering.astro` — horizontal three-part card (pitch / three numbered deliverables / action column).
- `components/Nav.astro` — CTA now `bg-accent`.
- `global.css` — new `--color-accent` (plum `#7b2f8f`, dark `#c47ad4`) for actions; `--color-green` brightened to `#00875a`; `--color-panel` kept but unused by this header.
- No hero background image: `mist.png` and `doodles.svg` are not used in 4c. Skip copying them unless another section needs them.
