# CAW Website Clone — Design

## Goal
Reproduce `https://earlier-today-217549.framer.app/` as a self-contained, plain
static HTML/CSS/JS project (no build step, no framework) at
`~/Documents/caw-website/`, matching the live site's appearance and behavior
exactly. This is a new, standalone project — separate from this
portfolio-website repo.

## Why
Framer does not provide a code export for this project. The only way to get
usable source code is to reconstruct it by reading the rendered/authored
output.

## Scope
- Every page/route reachable from the site's navigation.
- Visual layout, typography, colors, spacing, images, and fonts.
- Interactions/animations (scroll effects, hover states, transitions) as
  authored in Framer.
- Out of scope: CMS backend/forms functionality, Framer hosting/publishing.
  This is a static front-end copy only — no server, no live data binding.

## Approach: Hybrid extraction

1. **Discovery** — crawl the published site via Chrome browser automation,
   starting from the homepage, following all internal nav links to enumerate
   every distinct page/route.

2. **Structure & assets pass (automated, per page)**
   - Capture rendered DOM and computed styles.
   - Enumerate and download all referenced assets (images, fonts) into
     `caw-website/assets/`.

3. **Fidelity pass (editor-assisted, per page)**
   - Log into the Framer editor for this project (user authenticates in a
     Chrome tab; credentials are never shared with or seen by the agent).
   - Where scraped CSS looks approximate, use Framer's "Copy as Code" on the
     relevant component to get authored React/CSS as ground truth.
   - Pull exact design tokens (color/spacing/type scale) from the editor.
   - Inspect authored interactions/animations/variants in the editor rather
     than reverse-engineering them by triggering behavior on the live site.
   - Pull full-resolution source images where the published site serves
     optimized/responsive variants.

4. **Assembly** — merge both passes into clean static output:
   - One HTML file per route (or per-route folder if needed for clean URLs).
   - Shared `styles.css` (plus page-specific overrides only where needed).
   - `script.js` for interactions/animations.
   - `assets/` for images and fonts.

5. **Verification** — open the local static clone in Chrome side-by-side
   with the live site and visually compare each page.

## Error handling
If a page or component can't be faithfully reproduced with plain CSS/JS
(e.g. a Framer-specific effect with no clean equivalent), flag it explicitly
rather than silently approximating. Decide with the user whether to simplify
or hand-roll a substitute.

## Deliverable layout

```
caw-website/
  index.html
  <route>/index.html      (per additional page)
  styles.css
  script.js
  assets/
    images/...
    fonts/...
```
