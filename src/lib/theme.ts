/**
 * `theme` is a non-CSS editorial design property, so `toCss` drops it and it
 * reaches the DOM only as class names. See docs/adr/0001-*.md.
 *
 * A theme is a *set of named slots*, not one class string, because the same
 * theme means opposite things on different surfaces: a Light hero needs a Dark
 * CTA, or the button disappears into the panel behind it. Components pick the
 * slots they need and ignore the rest.
 *
 * Every class here is a whole literal. Tailwind generates only what its scanner
 * finds as source text, so no part of these strings may be assembled at
 * runtime — that is why this is a lookup rather than string interpolation.
 */
export type ThemeSlots = {
  /** Flat panel: background plus the text color that reads on it. */
  surface: string;
  /**
   * Gradient stops for a scrim (the wash over a photo that keeps overlaid text
   * legible), plus its text color. Pair with a `bg-gradient-to-*` direction,
   * which is structural and lives on the component.
   */
  scrim: string;
  /** Inverted against `surface`, so a CTA advances instead of receding. */
  cta: string;
};

/** Applied when `theme` is unset — see `themeClasses`. */
export const DEFAULT_THEME = "Dark";

const THEMES: Record<string, ThemeSlots> = {
  Dark: {
    surface: "bg-dark text-light",
    scrim: "text-light from-dark/75 via-dark/50 to-transparent",
    cta: "bg-light text-dark",
  },
  Light: {
    surface: "bg-light text-dark",
    scrim: "text-dark from-light/75 via-light/50 to-transparent",
    cta: "bg-dark text-light",
  },
};

/**
 * Resolve a `theme` design value to its slots, falling back to
 * `DEFAULT_THEME`. The argument is `unknown` on purpose: `useDesignValues()`
 * returns `{}` outside an experience and its keys are untyped, so this is
 * reached with `undefined` whenever an editor has not set the property.
 */
export const themeClasses = (theme: unknown): ThemeSlots =>
  (typeof theme === "string" ? THEMES[theme] : undefined) ??
  THEMES[DEFAULT_THEME];
