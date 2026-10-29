import {
  type Components,
  type Config,
  type ResolveToken,
  // defineComponent,
  // type Templates,
} from "@contentful/experiences-react";

import { Card } from "@/components/Card";
import { Duplex } from "@/components/Duplex";
import { Grid } from "@/components/Grid";
import { Hero } from "@/components/Hero";

/**
 * Client-safe: the live preview imports this module into the browser, so it
 * must not touch the filesystem. Server code imports
 * `experience-config.server.ts`, which adds the dev-only token check.
 */
const components: Components = {
  card: Card,
  duplex: Duplex,
  grid: Grid,
  hero: Hero,
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
 * `knownVars` is the set of variable names declared in globals.css, or `null`
 * for "cannot check", in which case every token is trusted. A missing
 * diagnostic must never become a rendering failure.
 */
export const createResolveToken =
  (knownVars: Set<string> | null): ResolveToken =>
  (token) => {
    const name = tokenToCssVar(token.value);

    // `var(--nope)` is a perfectly valid string that the browser silently
    // discards at computed-value time, so a bad token id would otherwise fail
    // with no diagnostic at all.
    //
    // Return null, not undefined: since SDK 0.13, undefined keeps the raw
    // `{ type: 'DesignToken' }` object in the design bag, and `toCss` would
    // copy it into inline style. `toCss` skips null, so the key is dropped.
    // See docs/adr/0002-*.md.
    if (knownVars && !knownVars.has(name)) {
      console.warn(
        `[tokens] No CSS variable ${name} for design token "${token.value}". ` +
          `Add it to the @theme block in globals.css, or fix the token path.`,
      );
      return null;
    }

    return `var(${name})`;
  };

export const createExperienceConfig = (
  knownVars: Set<string> | null,
): Config => ({ components, resolveToken: createResolveToken(knownVars) });

/**
 * Unchecked: the browser can't read globals.css, so live preview updates
 * resolve without the unknown-token warning. The server-rendered initial plan
 * still gets it.
 */
export const experienceConfig = createExperienceConfig(null);

// const templates: Templates = {};
// Add `templates` to the object `createExperienceConfig` returns.
