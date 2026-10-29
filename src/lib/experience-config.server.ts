import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createExperienceConfig } from "@/lib/experience-config";

/**
 * The set of variable names declared in globals.css, read straight from the
 * stylesheet so there is no list to keep in sync. Dev only — it exists purely to
 * make a bad token id loud, and production never touches the filesystem.
 *
 * `null` means "cannot check", and the resolver then trusts every token.
 */
const readThemeVars = (): Set<string> | null => {
  try {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const block = css.match(/@theme[^{]*\{([\s\S]*?)\n\}/)?.[1];
    if (!block) return null;
    return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  } catch {
    return null;
  }
};

const knownVars =
  process.env.NODE_ENV === "production" ? null : readThemeVars();

/** Server-side config: same registrations, plus the dev-only token check. */
export const experienceConfig = createExperienceConfig(knownVars);
