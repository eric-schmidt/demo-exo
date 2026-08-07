# 1. Resolve ExO design tokens through Tailwind v4 CSS variables

Date: 2026-08-07

## Status

Accepted. Provisional — see Consequences.

## Context

Contentful Experience Orchestration stores design tokens as **opaque ids** and
discards their values at import. The DTCG `$value` is read only to validate
`$type`, then dropped ([RFC: Design Tokens API][rfc]: _"there will only be
'coded' design tokens, no resolution, and no storing of values. The system will
always only be aware of `colors.red-700`, no hex/rgba values"_).

The rendering app must therefore own every value and supply a `resolveToken`
function (`Config.resolveToken`, `@contentful/experiences-react`) to turn a
`{ type: 'DesignToken', value: 'color.primary' }` envelope into something
renderable.

Those values already exist in `src/app/globals.css` as Tailwind v4 theme
variables. Three options:

1. `resolveToken` returns `var(--color-primary)` — CSS variable indirection.
2. `resolveToken` returns `#1e40af` from a TypeScript lookup map.
3. `resolveToken` returns a Tailwind class name (`bg-primary`).

## Decision

**Option 1.** Switch `@theme inline` to `@theme static` so every theme variable
is emitted into `:root`, then resolve token ids to `var()` references:

```ts
const resolveToken: ResolveToken = (t) => `var(--${t.value.replaceAll(".", "-")})`;
```

DTCG token paths are required to mirror Tailwind's theme namespaces
(`color.primary` ↔ `--color-primary`) so this stays a one-liner.

The `@theme` mode is load-bearing, not incidental. Compiling `globals.css`
through `@tailwindcss/postcss@4.3.3`:

| `@theme` mode | This repo's 8 vars in `:root`     | `.bg-primary` compiles to             |
| ------------- | -------------------------------- | ------------------------------------- |
| `inline`      | **none**                         | `background-color: #1e40af`           |
| (plain)       | only _used_ ones (`accent` lost) | `background-color: var(--color-primary)` |
| `static`      | **all 8**                        | `background-color: var(--color-primary)` |

Plain `@theme` is insufficient: it tree-shakes unused variables, and Tailwind's
build-time scanner can never see a token an editor picks in Contentful at
runtime. `static` is the only safe mode.

## Rationale

- **Tailwind v4 namespaces are already dot-paths.** `--color-*`, `--spacing-*`,
  `--radius-*` are flat and kebab-cased — exactly a two-segment DTCG path
  kebab-cased. Under Tailwind v3's JS config there would be no CSS variable to
  point at and a map would be mandatory. Tailwind v4 is what makes this free.
- **One source of truth.** A literal map puts `#1e40af` in both `globals.css`
  (what `bg-primary` compiles to) and `design-tokens.ts` (what ExO renders).
  Divergence raises no error — a hardcoded section and an editor-styled section
  quietly disagree by a shade.
- **Both paths emit the identical declaration.** Under `@theme static`,
  `className="bg-primary"` and an editor picking `color.primary` both produce
  `background-color: var(--color-primary)`. They cannot disagree.
- **Adding a token requires no code change.** New token in Contentful, new CSS
  variable. The resolver is O(1) lines, not O(tokens).
- **Resolution moves to paint time.** Re-declaring a variable in any scope
  re-themes everything an editor chose —
  `[data-theme="hc"] { --color-primary: #000; }`. Baked literals cannot do this.
- **It is the documented ExO pattern.** The internal "Manual Setup (Getting
  Started with ExO)" guide and the SDK README both ship this exact line.
  [AIS-149][ais149] rejected the map shape by name: _"Asking customers to
  duplicate all of their design tokens into a JS/TS map is too much — especially
  for tokens that already exist as CSS custom properties, Tailwind config
  values... Forcing a copy introduces a maintenance burden and a divergence
  risk."_

Option 3 was rejected because `toCss()` drops keys that are not real CSS
properties, so it forces non-semantic design-property ids (`bg`, not
`backgroundColor`) — and it still requires a duplicated map.

## Consequences

- **`@theme inline` is lost.** Its purpose is flattening values that reference
  other variables; nothing here relies on that (colors are literals, spacing
  `calc()`s are self-contained). Verified output-equivalent. Cost: marginally
  larger CSS.
- **DTCG token paths become load-bearing.** A token whose path does not
  kebab-case onto an existing variable resolves to nothing. Mitigated by a
  dev-only guard in `resolveToken`.
- **Inline `style` outranks every Tailwind utility.** Desirable here — classes
  are defaults, tokens are overrides, with no `cn()` merging needed — but a
  utility can no longer override an editor-set value.
- **Failure is silent, and this is the real trade-off.** A map returning
  `undefined` makes the SDK drop the key and log a grouped warning;
  `var(--nope)` is a valid string that the browser discards at computed-value
  time with no diagnostic.

  Mitigated by a dev-only check in `resolveToken` that **parses the `@theme`
  block out of `globals.css` at startup**. Deriving the names rather than
  enumerating them is deliberate: a hand-maintained list would reintroduce
  exactly the sync burden this ADR rejects in option 2. Production skips the
  check entirely (no filesystem access), and a failed parse yields `null`, which
  makes the resolver trust every token — a missing diagnostic must never become
  a rendering failure.
- **Components reading design values need `'use client'`.** `useDesignValues()`
  is client-only. Token resolution itself still runs server-side:
  `nodes-renderer.js` has no `"use client"`, calls `applyTokenResolver`, and
  passes plain strings into `ResolvedDesignProvider` (which is `"use client"`).
  Only the leaf component crosses the boundary.
- **Provisional.** [AIS-358][ais358] is an open spike on the ExO styling
  contract (inline `toCss` vs. static stylesheet vs. CSS classes) and explicitly
  lists Tailwind interop as undecided. This is the best-supported pattern today,
  not a settled platform ADR. Revisit when AIS-358 lands.

## Notes

`@contentful/experiences-react` is pre-1.0 (0.5.3 here) and the design-token
surface only shipped in 0.3.1. Expect churn.

Beware Contentful **Studio** guidance, a separate older product with overlapping
vocabulary. `defineDesignTokens` and `@contentful/experiences-sdk-react` (note
the extra `-sdk-`) are Studio APIs and do not apply. Public doc paths
disambiguate: `/experiences/` is Studio, `/experience-orchestration/` is ExO.

[rfc]: https://contentful.atlassian.net/wiki/spaces/ECO/pages/6209568873
[ais149]: https://contentful.atlassian.net/browse/AIS-149
[ais358]: https://contentful.atlassian.net/browse/AIS-358
