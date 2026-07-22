export const slugByExperienceId: Record<string, string> = {
  "2IPSqkhp12se46bDYSmflJ": "demo",
};

const experienceIdBySlug = new Map(
  Object.entries(slugByExperienceId).map(([id, slug]) => [slug, id]),
);

export const experienceIdForSlug = (slug: string): string | undefined =>
  experienceIdBySlug.get(slug);

export const allSlugs = (): string[] => Array.from(experienceIdBySlug.keys());
