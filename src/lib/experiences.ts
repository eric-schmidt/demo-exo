// Frontend-owned slug → Experience ID map for the /[slug] route, since ExO has
// no native slug field yet. Not a source of truth: every experience is always
// renderable at /experiences/[id] whether or not it's listed here. See the
// "Routing Experiences" section of the README; retire this file once ExO stores
// slugs on the Experience payload.
const experienceIdBySlug = new Map<string, string>([
  ["demo", "1LFlAUCxo9sisbNSDO9wFn"],
]);

export const experienceIdForSlug = (slug: string): string | undefined =>
  experienceIdBySlug.get(slug);

export const allSlugs = (): string[] => Array.from(experienceIdBySlug.keys());
