import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  type Components,
  type Config,
  type ExperienceTemplates,
  type ResolveToken,
  defineExperienceTemplate,
} from "@contentful/experiences-react";

import { Duplex } from "@/components/Duplex";
import { Hero } from "@/components/Hero";
import { SeoTemplate } from "@/components/SeoTemplate";

const components: Components = {
  duplex: Duplex,
  hero: Hero,
};

/**
 * Coded Experience Templates — the root node an experience is built from. Keyed
 * by `experienceTemplateId` (last slash-segment of the template node's
 * `experienceTemplate.sys.urn`). `seoPage` owns the page's SEO `<head>` and
 * wraps the body via its `content` slot; the id here must match the template
 * created in ExO.
 */
const experienceTemplates: ExperienceTemplates = {
  seoPage: defineExperienceTemplate({ component: SeoTemplate }),
};

/**
 * Contentful stores design tokens as opaque ids and discards their values, so
 * this app owns every value. Token paths mirror Tailwind v4's theme namespaces,
 * which are already flat and kebab-cased — so `color.primary` is exactly
 * `--color-primary` and the whole bridge is one string transform.
 *
 * Values live only in globals.css. See docs/adr/0001-*.md.
 */
const tokenToCssVar = (id: string) => `--${id.replaceAll(".", "-")}`;

/**
 * The set of variable names declared in globals.css, read straight from the
 * stylesheet so there is no list to keep in sync. Dev only — it exists purely to
 * make a bad token id loud, and production never touches the filesystem.
 *
 * `null` means "cannot check", and the resolver then trusts every token. A
 * missing diagnostic must never become a rendering failure.
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

const resolveToken: ResolveToken = (token) => {
  const name = tokenToCssVar(token.value);

  // `var(--nope)` is a perfectly valid string that the browser silently discards
  // at computed-value time, so a bad token id would otherwise fail with no
  // diagnostic at all. Returning undefined instead lets the SDK's own grouped
  // warning fire too.
  if (knownVars && !knownVars.has(name)) {
    console.warn(
      `[tokens] No CSS variable ${name} for design token "${token.value}". ` +
        `Add it to the @theme block in globals.css, or fix the token path.`,
    );
    return undefined;
  }

  return `var(${name})`;
};

export const experienceConfig: Config = {
  components,
  experienceTemplates,
  resolveToken,
};
