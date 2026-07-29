import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared shape across Work / Games / Experiences on purpose: this is what
// makes the future unified, filterable "all work" catalog a template change
// later instead of a content re-architecture (see plan doc, Phase 2 note).
const projectSchema = z.object({
  title: z.string(),
  blurb: z.string(),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).default([]),
  link: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  source: z.string().url().optional(),
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

export const collections = { work, games, experiences };
