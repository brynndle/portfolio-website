# brynncaputo.com — scraped content

Copy and images scraped from the live [brynncaputo.com](https://brynncaputo.com) (a
Squarespace site) on 2026-07-29, for reference while rebuilding the portfolio from
scratch. Each `.md` file corresponds 1:1 with a live page: front matter gives the
original `title` and source URL, and the body preserves the original text and image
order so the narrative/case-study flow is easy to follow. Images are downloaded
locally under `images/` and referenced with relative paths.

This is a content reference, not a design spec — layout, styling, and navigation
should be redesigned for the new site rather than copied.

## Site structure

The live site has three top-level sections (see nav: "Experiences & Installations",
"Product Design", "About") plus a landing/home page.

- **`landing/index.md`** — Home page. Hero statement + intro, a "Professional work"
  callout for the two featured case studies (Side, Healthcare Efficiency), and an
  "Other projects" grid linking to the remaining case studies.
- **`about/index.md`** — Bio + full work history/resume (Garner Health, Side Inc.,
  Habitat for Humanity Portland, MustWin, Perka, See.Me, Suka Design, freelance).
- **`projects/`** — "Product Design" case studies (professional UX/UI work):
  - `real-estate-tool.md` — Side Inc. real estate compliance auditing tool
  - `health-care.md` — Healthcare Efficiency (Garner Health, under NDA — light on images)
  - `habitat-for-humanity.md`
  - `sony-playstation.md` — PlayStation Parents Guide
  - `clover-task-flow.md` — Perka × Clover POS task flows
  - `perka-app.md` — Perka iOS App
  - `perka-enrollment.md` — Perka Enrollment Helper
  - `picme-dating-app.md`
  - `irregardlessly.md`
  - `seeme-ios-app.md` — See.Me iOS App
  - `seeme-website.md` — See.Me Website
- **`experiences-installations/`** — "Experiences & Installations" (personal/art
  projects, immersive festival experiences):
  - `index.md` — section landing/gallery page
  - `hi-mom.md`, `costumes.md`, `tickers-repair-service.md`,
    `tick-tock-chop-shop.md`, `heart-of-the-carpathians.md`, `the-wizard.md`,
    `termtech.md` (Crimlin's Foible), `how-we-see.md`, `employment-game.md`

## Images

`images/` mirrors the folder structure above (`images/landing/`, `images/about/`
[empty — no photos on the live About page], `images/projects/<slug>/`,
`images/experiences-installations/<slug>/`). 120 images total, downloaded at their
original resolution from Squarespace's CDN.

## Known gaps

- **Healthcare Efficiency** (`projects/health-care.md`) is under NDA on the live
  site — most interface screenshots are intentionally not shown; only one process
  diagram image exists.
- **Real Estate Compliance Auditing Tool** (`projects/real-estate-tool.md`) has no
  inline images on the page itself — it links out to a [Google Slides
  deck](https://docs.google.com/presentation/d/1eMQfAeTjyFQvLUjmmlMcl6X1gixezY8BBwO_N0ebpOc/edit?usp=sharing)
  for the visuals.
- **`experiences-installations/employment-game.md`** references a self-hosted
  Squarespace video embed (an old Flash game recorded as gameplay footage) whose
  source URL isn't present in the static HTML — it needs to be re-captured
  manually (e.g. screen-record from the live site) if you want to preserve it.
- A handful of external reference links are preserved inline in the relevant
  pages (e.g. a Google Drive slide deck on `heart-of-the-carpathians.md`, a
  YouTube timestamp on `tick-tock-chop-shop.md`, map/event links on
  `the-wizard.md`).
- Site-wide footer social links (not repeated per-page here): Dribbble
  ([dribbble.com/davecaputo](http://www.dribbble.com/davecaputo)), Medium
  ([medium.com/@brynncaputo](https://medium.com/@brynncaputo)), GitHub
  ([github.com/brynndle](https://github.com/brynndle)).
