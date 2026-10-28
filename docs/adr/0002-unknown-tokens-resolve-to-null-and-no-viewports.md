# 2. Unknown design tokens resolve to `null`; viewports are gone

Date: 2026-10-28

## Status

Accepted. Amends [0001](./0001-exo-design-tokens-via-tailwind-css-variables.md):
supersedes two of its Consequences (the "Failure is silent" bullet's claim about
`undefined`, and the `getValueForViewport` cascade in "Provenance is erased by
resolution"). 0001's Decision — resolve token ids to `var(--…)` over
`@theme static` — is unchanged.

## Context

Upgrading `@contentful/experiences-react` from 0.8.2 to 0.15.1 changed two things
0001 relied on.

**`undefined` no longer drops the key.** In 0.8.2 the `ResolveToken` contract
read: _"returning `undefined` means 'not resolvable' and the adapter drops the key
(with a warning)."_ Since core 0.12 / adapter 0.13 it reads: _"returning
`undefined` retains the raw token and records a diagnostic."_
`applyTokenResolver` now writes the raw `{ type: 'DesignToken', value }` envelope
back into the design bag. `toCss` skips only `null` and `undefined` values, so it
copies that object into the inline `style` object, which React then serializes as
`[object Object]`.

Verified against the installed packages:

| `resolveToken` returns | `toCss(design)` for an unknown `padding` token          | SDK warning |
| ---------------------- | ------------------------------------------------------- | ----------- |
| `undefined`            | `{ padding: { type: 'DesignToken', value: '…' } }`      | yes         |
| `null`                 | `{}` — key dropped                                      | no          |

**Viewports were removed** ([SPA-5275][spa5275], [contentful/experiences#220][pr220]).
Delivery sends one flat value per design property. `ValuesByViewport`,
`getValueForViewport`, `initialViewportId`, and `useActiveViewport` no longer
exist; responsive behavior is CSS media queries or app-owned `matchMedia`.

## Decision

The dev-only guard in `resolveToken` returns **`null`** for a token id with no
matching CSS variable, after its own `console.warn`.

`/[slug]` no longer sniffs the User-Agent; `src/lib/detect-viewport.ts` is
deleted. Responsive layout stays in Tailwind breakpoint classes.

## Consequences

- An unknown token produces the same visible outcome as under 0.8.2: the
  declaration is absent and the Tailwind class default shows through.
- The SDK's own `[@contentful/experiences] resolveToken returned undefined…`
  warning and plan diagnostic **no longer fire** for these tokens — `null` counts
  as resolved. The app's `[tokens] No CSS variable …` warning is now the only
  signal. Acceptable because the guard runs only where that warning is visible
  (dev), and production trusts every token as before.
- If `null` ever starts meaning something to the SDK, this guard will be the
  first thing to break; re-run the table above after an SDK upgrade.
- With `headers()` gone, `/[slug]` has no request-time read except `draftMode()`
  and is prerendered at build (`● SSG`). Published-content changes reach those
  slugs only on the next build until a `revalidate` is added; Draft Mode bypasses
  the prerender, so preview is unaffected.
- The only render-time way to tell a token-backed value from a manual one is
  still `useContentfulComponent().design`, now discriminated on `type` alone —
  there is no per-viewport mix to account for.

[spa5275]: https://contentful.atlassian.net/browse/SPA-5275
[pr220]: https://github.com/contentful/experiences/pull/220
