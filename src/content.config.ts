import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TAGS } from './data/tags';

// Shared shape across Work / Games / Experiences on purpose: this is what
// makes the future unified, filterable "all work" catalog a template change
// later instead of a content re-architecture (see plan doc, Phase 2 note).
const projectSchema = z.object({
  title: z.string(),
  listTitle: z.string().optional(),
  blurb: z.string(),
  tags: z.array(z.enum(TAGS)).min(1).max(3),
  thumbnail: z.string().optional(),
  hero: z.string().optional(),
  heroBg: z.string().optional(),
  link: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  source: z.string().url().optional(),
  role: z.string().optional(),
  client: z.string().optional(),
  methods: z.string().optional(),
  figures: z.array(z.object({
    src: z.string(),
    caption: z.string(),
    meta: z.string().optional(),
    alt: z.string().optional(),
  })).default([]),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: projectSchema,
});

const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: projectSchema,
});

const experiences = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiences' }),
  schema: projectSchema,
});

const board = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/board' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['planning', 'in-build', 'open', 'shipped', 'launched', 'looking-for-location', 'paused', 'coming-soon', 'in-progress']),
    lastMove: z.string(),
    movedAt: z.coerce.date(),
    project: z.string().optional(),
    thumbnail: z.string().optional(),
  }),
});

export const collections = { work, games, experiences, board };
