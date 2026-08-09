# Local Development Guide (Astro v7 + Tailwind v4)

Quick reference for working on this site locally.

## Starting the dev server

1. Open a terminal in the project root.
2. Run `npm run dev`. The server starts at `http://localhost:4321`.
3. Edit any `.astro`, `.md`, or `.css` file and save — the browser updates automatically (hot reload), no restart needed.
4. Press `Ctrl+C` to stop the server when you're done.

## Making edits

**Editing existing pages/components (code changes):**
- `src/pages/` — routes/URLs (file-based routing).
- `src/components/` — reusable `.astro` components (Nav, Hero, Footer, ProjectCard, etc).
- `src/layouts/` — shared page wrappers.
- `src/styles/global.css` — global styles.

**Adding a new project (no code changes needed):**
- Drop a new `.md` file into `src/content/work/`, `src/content/games/`, or `src/content/experiences/` (or `src/content/board/` for the board).
- Fill in frontmatter matching the schema in `src/content.config.ts`: `title`, `blurb`, `tags` (1–3, must be from `src/data/tags.ts`), plus optional `thumbnail`, `link`, `featured`, `order`, `figures`, etc.
- The site picks it up automatically on next dev-server reload/build.

## Key Astro concepts

- **Frontmatter fence:** every `.astro` file starts with a `--- ... ---` block for JS/TS logic (imports, data fetching), followed by HTML-like markup below it — same pattern as markdown frontmatter.
- **Static by default:** Astro ships plain HTML/CSS with no client-side JavaScript unless you explicitly add an interactive "island." This is why the site is fast — don't worry about JS bundles for typical edits.
- **Content collections:** `src/content.config.ts` defines the schema (via Zod) that every `.md` file in `src/content/work`, `games`, `experiences`, and `board` must match. If a new file's frontmatter doesn't match the schema, the dev server will show a validation error telling you what's wrong.

## Build & deploy

- `npm run build` — compiles the static site into `dist/`.
- `npm run preview` — serves that `dist/` build locally so you can sanity-check the production version before pushing.

### Deploying with Vercel

Your repo (`brynndle/portfolio-website` on GitHub) has no host connected yet. Vercel auto-detects Astro, so setup is config-free:

1. Go to vercel.com, sign in with your GitHub account.
2. **Add New → Project**, select `brynndle/portfolio-website`.
3. Leave the build settings as detected (Framework Preset: Astro, Build Command: `astro build`, Output Directory: `dist`) and click **Deploy**.
4. You'll get a live URL like `portfolio-website-xyz.vercel.app`. From now on, every `git push` to `main` auto-deploys to production; pushes to other branches get their own preview URL.

### Connecting your purchased domain

You said you already own the domain (e.g. `brynncaputo.com`, matching the `site` value in `astro.config.mjs`). To point it at Vercel:

1. In the Vercel project, go to **Settings → Domains** and add `brynncaputo.com` (and `www.brynncaputo.com` if you want both).
2. Vercel will show you DNS records to add. For a root/apex domain (`brynncaputo.com`) it's typically an **A record** pointing to `76.76.21.21`; for `www` it's a **CNAME** pointing to `cname.vercel-dns.com`. Vercel shows the exact current values on that screen — use those, they can change.
3. Log in to wherever you bought the domain (registrar — e.g. GoDaddy, Namecheap, Google Domains, Squarespace Domains) and find **DNS settings / Manage DNS**.
4. Add the records Vercel gave you, replacing any existing conflicting A/CNAME records on the same host (`@` for root, `www` for the subdomain).
5. Wait for DNS to propagate (usually minutes, sometimes up to ~24–48 hours). Vercel's Domains page will show a green checkmark once it verifies and auto-provisions HTTPS.
6. Optional: in **Settings → Domains**, set `brynncaputo.com` as the primary domain and redirect `www` → root (or vice versa) so you don't have duplicate URLs.
