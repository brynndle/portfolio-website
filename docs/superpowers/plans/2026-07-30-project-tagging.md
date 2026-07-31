# Project Tagging & Filtered Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project (work/games/experiences) 1-3 tags from a fixed vocabulary, and add a unified `/projects` catalog with live multi-select tag filtering plus a dedicated, pre-filtered page per tag.

**Architecture:** A shared `tags` field is added to the existing `projectSchema` in `src/content.config.ts`. A new `ProjectsGrid.astro` component (sibling to the existing `CollectionGrid.astro`, which is untouched) renders a combined grid across all three collections with a client-side (vanilla `<script>`, no framework) multi-select OR-logic filter bar. Two new routes — `/projects` and `/projects/[tag]` — both use this component; the latter pre-activates its tag server-side so there's no flash of unfiltered content.

**Tech Stack:** Astro 7 (content collections + `getStaticPaths`), Zod (schema), Tailwind v4 (existing design tokens in `src/styles/global.css`), vanilla JS (no client framework in this repo).

## Global Constraints

- Tag vocabulary is exactly: `Product Design`, `Games`, `Experiences`, `Marketing` (from the spec — `docs/superpowers/specs/2026-07-30-project-tagging-design.md`).
- Every project entry (`work`, `games`, `experiences` collections) must have 1-3 tags. `board` collection is untreated (not a project).
- No test runner exists in this repo (static Astro site, no Jest/Vitest). Verification is `npm run build` (validates Zod schema against all frontmatter and that static paths generate) plus manual browser checks, per the spec's Testing section.
- Follow existing house style: sharp corners (no radius), `border-rule-strong`/`border-rule`/`border-rule-soft` for borders, `label`/`font-mono text-xs uppercase tracking-[0.08em]` for small caps metadata text, `bg-blue text-paper` for the one accent/active state, `text-ink-2`/`text-ink-3` for secondary text. Match `CollectionGrid.astro` and `Board.astro` conventions exactly.
- `CollectionGrid.astro`, `/work`, `/games`, `/experiences` index pages must remain functionally and visually unchanged.

---

### Task 1: Shared tag constants

**Files:**
- Create: `src/data/tags.ts`

**Interfaces:**
- Produces: `export const TAGS: readonly ['Product Design', 'Games', 'Experiences', 'Marketing']`, `export type Tag = typeof TAGS[number]`, `export function tagToSlug(tag: Tag): string`, `export function slugToTag(slug: string): Tag | undefined`.
- Consumed by: Task 2 (`content.config.ts`), Task 4 (`ProjectsGrid.astro`), Task 6 (`/projects/[tag].astro`).

- [ ] **Step 1: Write `src/data/tags.ts`**

```ts
export const TAGS = ['Product Design', 'Games', 'Experiences', 'Marketing'] as const;

export type Tag = (typeof TAGS)[number];

export function tagToSlug(tag: Tag): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export function slugToTag(slug: string): Tag | undefined {
  return TAGS.find((tag) => tagToSlug(tag) === slug);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check` (or `npx tsc --noEmit` if `astro check` is slow/unavailable — either just needs to report no errors in `src/data/tags.ts`)
Expected: no type errors reported for `src/data/tags.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/tags.ts
git commit -m "Add shared tag vocabulary constants"
```

---

### Task 2: Add `tags` field to content schema

**Files:**
- Modify: `src/content.config.ts`

**Interfaces:**
- Consumes: `TAGS` from `src/data/tags.ts` (Task 1).
- Produces: `projectSchema` now requires `tags: Tag[]` (1-3 items) on every `work`/`games`/`experiences` entry. Later tasks (3) rely on this being enforced at build time.

- [ ] **Step 1: Add the import and field**

In `src/content.config.ts`, add the import at the top:

```ts
import { TAGS } from './data/tags';
```

Then inside `projectSchema`, add the `tags` field (place it right after `blurb` since it's core metadata, not a display detail like `figures`):

```ts
const projectSchema = z.object({
  title: z.string(),
  blurb: z.string(),
  tags: z.array(z.enum(TAGS)).min(1).max(3),
  thumbnail: z.string().optional(),
  // ...unchanged fields below
```

- [ ] **Step 2: Verify the build now fails (schema enforced, frontmatter not yet updated)**

Run: `npm run build`
Expected: FAIL — Zod validation errors for every file in `src/content/work`, `src/content/games`, `src/content/experiences` missing `tags`. This confirms the schema is wired up correctly before we backfill content in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "Require 1-3 tags on work/games/experiences entries"
```

---

### Task 3: Backfill `tags` frontmatter on existing content

**Files:**
- Modify: all 11 files in `src/content/work/*.md`
- Modify: `src/content/games/raising-intelligences.md`
- Modify: all 9 files in `src/content/experiences/*.md`

**Interfaces:**
- Consumes: `tags` schema from Task 2 (values must be exactly `Product Design`, `Games`, `Experiences`, or `Marketing`, 1-3 per file).
- Produces: nothing consumed by later tasks directly, but Task 5/6 grids render based on this data — verify the assignments below are what actually lands in each file.

Add a `tags:` array to each file's frontmatter, placed directly under `blurb:`. Use exactly these assignments (from the design spec):

- [ ] **Step 1: `src/content/work/clover-task-flow.md`** — add after `blurb:` line:
```yaml
tags: ["Product Design"]
```

- [ ] **Step 2: `src/content/work/habitat-for-humanity.md`**
```yaml
tags: ["Product Design", "Marketing"]
```

- [ ] **Step 3: `src/content/work/health-care.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 4: `src/content/work/irregardlessly.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 5: `src/content/work/perka-app.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 6: `src/content/work/perka-enrollment.md`**
```yaml
tags: ["Product Design", "Marketing"]
```

- [ ] **Step 7: `src/content/work/picme-dating-app.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 8: `src/content/work/real-estate-tool.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 9: `src/content/work/seeme-ios-app.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 10: `src/content/work/seeme-website.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 11: `src/content/work/sony-playstation.md`**
```yaml
tags: ["Product Design"]
```

- [ ] **Step 12: `src/content/games/raising-intelligences.md`**
```yaml
tags: ["Games"]
```

- [ ] **Step 13: `src/content/experiences/costumes.md`**
```yaml
tags: ["Experiences"]
```

- [ ] **Step 14: `src/content/experiences/employment-game.md`**
```yaml
tags: ["Experiences", "Games"]
```

- [ ] **Step 15: `src/content/experiences/heart-of-the-carpathians.md`**
```yaml
tags: ["Experiences", "Marketing"]
```

- [ ] **Step 16: `src/content/experiences/hi-mom.md`**
```yaml
tags: ["Experiences"]
```

- [ ] **Step 17: `src/content/experiences/how-we-see.md`**
```yaml
tags: ["Experiences"]
```

- [ ] **Step 18: `src/content/experiences/termtech.md`**
```yaml
tags: ["Experiences", "Games"]
```

- [ ] **Step 19: `src/content/experiences/the-wizard.md`**
```yaml
tags: ["Experiences"]
```

- [ ] **Step 20: `src/content/experiences/tick-tock-chop-shop.md`**
```yaml
tags: ["Experiences"]
```

- [ ] **Step 21: `src/content/experiences/tickers-repair-service.md`**
```yaml
tags: ["Experiences"]
```

- [ ] **Step 22: Verify the build passes**

Run: `npm run build`
Expected: PASS — no Zod validation errors. This confirms all 21 project files now satisfy the `tags` schema from Task 2.

- [ ] **Step 23: Commit**

```bash
git add src/content/work src/content/games src/content/experiences
git commit -m "Backfill tags on all existing projects"
```

---

### Task 4: `ProjectsGrid.astro` component

**Files:**
- Create: `src/components/ProjectsGrid.astro`

**Interfaces:**
- Consumes: `TAGS`, `Tag`, `tagToSlug` from `src/data/tags.ts` (Task 1). `CollectionEntry<'work' | 'games' | 'experiences'>` from `astro:content`.
- Props: `title: string`, `intro?: string`, `entries: CollectionEntry<'work' | 'games' | 'experiences'>[]`, `initialTag?: Tag`.
- Produces: renders a filter bar (`button[data-tag]` per tag + one `button[data-tag="all"]`) and a card grid (`a[data-tags]` per entry, `data-tags` = space-joined tag slugs) that Task 5 and Task 6 pages render directly. Card `href` is `/${entry.collection}/${entry.id}`.

This mirrors `CollectionGrid.astro`'s layout/typography exactly (same header block, same `grid gap-6 md:grid-cols-3` card grid, same `ProjectCard`-style card markup) but adds the filter bar and computes `href` per-entry instead of via a fixed `basePath`.

- [ ] **Step 1: Write the component**

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import { TAGS, tagToSlug, type Tag } from '../data/tags';

interface Props {
  title: string;
  intro?: string;
  entries: CollectionEntry<'work' | 'games' | 'experiences'>[];
  initialTag?: Tag;
}

const { title, intro, entries, initialTag } = Astro.props;
const sorted = [...entries].sort((a, b) => a.data.order - b.data.order);
const initialSlug = initialTag ? tagToSlug(initialTag) : undefined;
---

<BaseLayout title={title} description={intro}>
  <section class="border-b border-rule px-10 py-12">
    <div class="label mb-3 text-blue">Catalog</div>
    <h1 class="max-w-[24ch] text-[40px] font-semibold leading-[1.05] -tracking-[0.02em] text-balance max-md:text-3xl">{title}</h1>
    {intro && <p class="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-2 text-pretty">{intro}</p>}
  </section>

  <section class="flex flex-wrap gap-2.5 border-b border-rule px-10 py-6">
    <button
      type="button"
      data-tag="all"
      class:list={[
        'label border px-3.5 py-2 transition-colors duration-100',
        initialSlug ? 'border-rule-strong text-ink-2' : 'is-active border-rule-strong bg-blue text-paper',
      ]}
    >
      All
    </button>
    {TAGS.map((tag) => {
      const slug = tagToSlug(tag);
      const active = slug === initialSlug;
      return (
        <button
          type="button"
          data-tag={slug}
          class:list={[
            'label border px-3.5 py-2 transition-colors duration-100',
            active ? 'is-active border-rule-strong bg-blue text-paper' : 'border-rule-strong text-ink-2',
          ]}
        >
          {tag}
        </button>
      );
    })}
  </section>

  <section class="px-10 py-12">
    <div class="grid gap-6 md:grid-cols-3" id="projects-grid">
      {sorted.map((entry) => {
        const tagSlugs = entry.data.tags.map(tagToSlug);
        const hidden = initialSlug ? !tagSlugs.includes(initialSlug) : false;
        return (
          <a
            href={`/${entry.collection}/${entry.id}`}
            data-tags={tagSlugs.join(' ')}
            class:list={['block border border-rule-strong bg-paper-3', { hidden }]}
          >
            <div class="relative flex h-[170px] items-end overflow-hidden border-b border-rule-strong bg-paper-2 p-3">
              {entry.data.thumbnail
                ? <img src={entry.data.thumbnail} alt="" class="absolute inset-0 h-full w-full object-cover" />
                : <span class="label text-[10px]">image</span>}
            </div>
            <div class="p-5">
              <h3 class="text-lg font-semibold -tracking-[0.01em]">{entry.data.title}</h3>
              <p class="mt-2 text-[13.5px] leading-relaxed text-ink-3">{entry.data.blurb}</p>
            </div>
          </a>
        );
      })}
    </div>
  </section>
</BaseLayout>

<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-tag]');
  const cards = document.querySelectorAll<HTMLAnchorElement>('#projects-grid > [data-tags]');

  function activeTags(): string[] {
    return Array.from(buttons)
      .filter((b) => b.dataset.tag !== 'all' && b.classList.contains('is-active'))
      .map((b) => b.dataset.tag!);
  }

  function render() {
    const active = activeTags();
    const allButton = document.querySelector<HTMLButtonElement>('[data-tag="all"]');
    allButton?.classList.toggle('is-active', active.length === 0);
    allButton?.classList.toggle('bg-blue', active.length === 0);
    allButton?.classList.toggle('text-paper', active.length === 0);

    cards.forEach((card) => {
      const cardTags = (card.dataset.tags ?? '').split(' ');
      const visible = active.length === 0 || active.some((tag) => cardTags.includes(tag));
      card.classList.toggle('hidden', !visible);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.tag === 'all') {
        buttons.forEach((b) => {
          b.classList.remove('is-active', 'bg-blue', 'text-paper');
        });
      } else {
        button.classList.toggle('is-active');
        button.classList.toggle('bg-blue');
        button.classList.toggle('text-paper');
      }
      render();
    });
  });
</script>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: no type errors reported for `src/components/ProjectsGrid.astro`

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectsGrid.astro
git commit -m "Add ProjectsGrid component with client-side tag filtering"
```

---

### Task 5: `/projects` page

**Files:**
- Create: `src/pages/projects/index.astro`

**Interfaces:**
- Consumes: `ProjectsGrid` from Task 4 (props `title`, `intro`, `entries`).

- [ ] **Step 1: Write the page**

```astro
---
import { getCollection } from 'astro:content';
import ProjectsGrid from '../../components/ProjectsGrid.astro';

const [work, games, experiences] = await Promise.all([
  getCollection('work'),
  getCollection('games'),
  getCollection('experiences'),
]);
const entries = [...work, ...games, ...experiences];
---

<ProjectsGrid
  title="All Projects"
  intro="Everything in one place — product design case studies, games, and experiences. Filter by tag to narrow the view."
  entries={entries}
/>
```

- [ ] **Step 2: Verify with a build + manual check**

Run: `npm run build && npm run preview`
Then open `http://localhost:4321/projects` in a browser (or use the claude-in-chrome tools) and confirm:
- All 21 projects render (11 work + 1 game + 9 experiences).
- Clicking a tag button (e.g. "Games") hides non-matching cards and highlights the button.
- Clicking a second tag button adds its matches too (OR logic) — e.g. "Games" + "Marketing" shows the union.
- Clicking "All" clears filters and un-highlights every button.

Stop the preview server after checking (`Ctrl+C`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/projects/index.astro
git commit -m "Add unified /projects catalog page"
```

---

### Task 6: `/projects/[tag]` dedicated pages

**Files:**
- Create: `src/pages/projects/[tag].astro`

**Interfaces:**
- Consumes: `TAGS`, `tagToSlug`, `slugToTag`, `type Tag` from `src/data/tags.ts` (Task 1); `ProjectsGrid` from Task 4.

- [ ] **Step 1: Write the page**

```astro
---
import { getCollection } from 'astro:content';
import ProjectsGrid from '../../components/ProjectsGrid.astro';
import { TAGS, tagToSlug, slugToTag } from '../../data/tags';

export function getStaticPaths() {
  return TAGS.map((tag) => ({ params: { tag: tagToSlug(tag) } }));
}

const { tag: tagSlug } = Astro.params;
const tag = slugToTag(tagSlug!)!;

const [work, games, experiences] = await Promise.all([
  getCollection('work'),
  getCollection('games'),
  getCollection('experiences'),
]);
const entries = [...work, ...games, ...experiences];
---

<ProjectsGrid
  title={tag}
  intro={`Projects tagged "${tag}".`}
  entries={entries}
  initialTag={tag}
/>
```

- [ ] **Step 2: Verify with a build + manual check**

Run: `npm run build`
Expected: PASS, and build output lists 4 generated routes under `/projects/` (`product-design`, `games`, `experiences`, `marketing`) alongside `/projects/index.html`.

Run: `npm run preview`, then open `http://localhost:4321/projects/games` and confirm:
- Only the 3 projects tagged `Games` (`raising-intelligences`, `employment-game`, `termtech`) are visible on load, no flash of the other 18.
- The "Games" filter button is pre-highlighted.
- Clicking "All" reveals every project (still on the same URL).

Stop the preview server after checking.

- [ ] **Step 3: Commit**

```bash
git add src/pages/projects/[tag].astro
git commit -m "Add dedicated per-tag project pages"
```

---

### Task 7: Add "Projects" to nav

**Files:**
- Modify: `src/components/Nav.astro:3-9`

**Interfaces:**
- None (leaf change).

- [ ] **Step 1: Add the link**

In `src/components/Nav.astro`, update the `links` array to insert `Projects` before `Work`:

```ts
const links = [
  { href: '/#board', label: 'Now' },
  { href: '/projects', label: 'Projects' },
  { href: '/work', label: 'Work' },
  { href: '/games', label: 'Games' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/about', label: 'About' },
];
```

- [ ] **Step 2: Verify with a build + manual check**

Run: `npm run build && npm run preview`
Open `http://localhost:4321/` and confirm the nav now reads `Now · Projects · Work · Games · Experiences · About`, and that clicking "Projects" lands on `/projects`. Also spot-check `/work`, `/games`, `/experiences` still load correctly (unchanged).

Stop the preview server after checking.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro
git commit -m "Add Projects link to main nav"
```

---

## Final verification

- [ ] Run `npm run build` one more time from a clean state — expect a full PASS with no Zod or Astro errors.
- [ ] Confirm `git status` is clean (everything committed) and `git log --oneline -8` shows the 7 commits from this plan in order.
