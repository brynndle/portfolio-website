export const TAGS = ['Product Design', 'Games', 'Experiences', 'Marketing'] as const;

export type Tag = (typeof TAGS)[number];

export function tagToSlug(tag: Tag): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export function slugToTag(slug: string): Tag | undefined {
  return TAGS.find((tag) => tagToSlug(tag) === slug);
}
