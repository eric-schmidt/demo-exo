A [Next.js](https://nextjs.org) App Router demo of Contentful **Experience Orchestration** (ExO) — see [This is ExO, not Studio](#this-is-exo-not-studio) before trusting any SDK guidance you bring in from elsewhere.

## Getting Started

Node version is pinned in [`.nvmrc`](./.nvmrc); the lockfile is npm's.

```bash
cp .env.local.example .env.local   # then fill in the values below
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/` is a placeholder — the routes that actually render something are below.

| Variable                                              | Used for                                            |
| ----------------------------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` / `..._ENV_ID`      | every fetch                                         |
| `NEXT_PUBLIC_CONTENTFUL_DELIVERY_KEY`                 | published reads                                     |
| `NEXT_PUBLIC_CONTENTFUL_PREVIEW_KEY`                  | Draft Mode reads, and **all** Fragment reads        |
| `CONTENTFUL_PREVIEW_SECRET`                           | shared secret on the `/api/draft` preview URL       |

`.env.local.example` also carries `CONTENTFUL_REVALIDATION_SECRET` and
`CONTENTFUL_MANAGEMENT_TOKEN`; nothing in `src/` reads either one yet.

## Routing Experiences

Three routes into the same renderer:

- **`/experiences/[id]`** — the canonical, ID-keyed route. Renders any published Experience by its Contentful sys ID. This is what Contentful's iframe-based preview URL points at, since the CMS only knows the Experience ID (not any downstream URL slug).
- **`/[slug]`** — the pretty public route. Looks up the corresponding Experience ID in [`src/lib/experiences.ts`](./src/lib/experiences.ts) and delegates to the same renderer. Unknown slugs 404.
- **`/experience_fragments/[id]`** — one Fragment rendered on its own. A Fragment normally arrives already embedded in an Experience payload, so this is an authoring aid rather than a visitor-facing URL. Fragments are **preview-only** — the delivery host 404s a Fragment even when it's published — so [`getFragment`](./src/lib/client.ts) always uses the preview host and token and takes no `preview` flag to get wrong.

`generateStaticParams` on `/[slug]` enumerates the known slugs, but the route still
renders on demand — `next build` reports it as `ƒ (Dynamic)`. It reads `headers()`
(viewport sniffing) and `draftMode()` (preview), and both are request-time APIs that
opt a route out of prerendering. `generateStaticParams` is therefore doing nothing
for this route today; it's kept so the slugs are declared in one place and so the
route prerenders again if those two reads ever move.

The slug map is a **frontend-owned convenience layer**, not a source of truth. ExO does not yet store URL slugs on an Experience, so this app decides which experiences should also be reachable by a friendly URL — but every experience is always renderable at `/experiences/[id]` regardless of whether it's in the map.

### Initial viewport

`ServerExperienceRenderer` accepts an `initialViewportId` that decides which
viewport's design values the server renders, defaulting to the payload's first
viewport. `/[slug]` derives it from the User-Agent via
[`src/lib/detect-viewport.ts`](./src/lib/detect-viewport.ts) so first paint matches
the device, and the client renderer then transitions to live `matchMedia` — this is
what keeps SSR output from drifting against hydration. Only `/[slug]` does this;
`/experiences/[id]` and `/experience_fragments/[id]` let the default stand.

### Draft Mode and preview

Point the Contentful Preview URL at [`/api/draft`](./src/app/api/draft/route.ts)
with three query params:

| Param    | Value                                          |
| -------- | ---------------------------------------------- |
| `secret` | must equal `CONTENTFUL_PREVIEW_SECRET`         |
| `id`     | the Experience or Fragment sys ID              |
| `type`   | `experience` or `fragment`                     |

The Route Handler validates the secret, enables Draft Mode, and redirects to
`/experiences/:id` or `/experience_fragments/:id` accordingly. No map lookup, so
anything can be previewed without being pre-registered in the slug map.

One step there is load-bearing and easy to lose: Next sets its `__prerender_bypass`
cookie `SameSite=Lax`, which the browser drops when the app loads inside ExO's
cross-site preview iframe — Draft Mode then silently never turns on. The handler
re-sets the same cookie value with `SameSite=None; Secure`.

> **TODO:** When ExO supports slugs natively on an Experience:
> - Read the slug directly from the Experience payload; retire `src/lib/experiences.ts`.
> - Have `generateStaticParams` on `/[slug]` fetch the slug list from Contentful.
> - `/experiences/[id]` can stay as-is (it's still useful as an ID-keyed fallback), or redirect to the canonical slug for SEO.

## Design values and styling

A component reads its design properties with `useDesignValues()` and turns them
into a `style` object with `toCss()` — see [`src/components/Duplex.jsx`](./src/components/Duplex.jsx).

**`toCss()` filters by key name, not by value.** It keeps only keys that
normalize onto one of the 145 CSS property names in `CSS_PROPERTIES`
(`@contentful/experiences-design`) and drops everything else.

### The most common gotcha: two separate namespaces

|                        | Lives in                        | Must be named             | Example         |
| ---------------------- | ------------------------------- | ------------------------- | --------------- |
| **Design property id** | the ComponentType in Contentful | a **CSS property name**   | `padding`       |
| **Design token id**    | your `tokens.json` / ExO token  | your Tailwind theme path  | `spacing.small` |

These are easy to conflate because both describe "spacing," and the failure is
quiet. A design property named `spacing` holding token `spacing.small` resolves
**correctly** to `var(--spacing-small)` — and is then dropped, because `spacing`
is not a CSS property:

```js
// design property id: `spacing`  ✗
useDesignValues(); //=> { theme: 'Light', spacing: 'var(--spacing-small)' }
toCss(design);     //=> {}                        ← both keys dropped

// design property id: `padding`  ✓   (token id stays `spacing.small`)
useDesignValues(); //=> { theme: 'Light', padding: 'var(--spacing-small)' }
toCss(design);     //=> { padding: 'var(--spacing-small)' }
```

The value was never the problem. `var(--spacing-small)` is a valid CSS *value*;
`spacing` is not a valid CSS *property*.

### Dropped keys are a feature

Non-CSS design properties are meant to be dropped — that is how you pass
editorial switches (`theme`, `variant`, `layout`) to a component without
polluting `style`. Read them off the record directly.

**Map the value to a class; don't build the class from the value.** A shared
lookup keyed by the design property's own values, in
[`src/lib/theme.ts`](./src/lib/theme.ts):

```ts
const THEMES = {
  Dark: { surface: "bg-dark text-light", cta: "bg-light text-dark", … },
  Light: { surface: "bg-light text-dark", cta: "bg-dark text-light", … },
};

export const themeClasses = (theme) => THEMES[theme] ?? THEMES[DEFAULT_THEME];
```

**One theme resolves to a set of named slots, not a single class string** — the
key move once more than one element responds to it. The same theme means
*opposite* things on different surfaces: a Light panel needs a Dark CTA or the
button vanishes into it. Slots also let each component take only what applies —
[`Duplex.jsx`](./src/components/Duplex.jsx) uses `surface`,
[`Hero.jsx`](./src/components/Hero.jsx) uses `scrim` and `cta`:

```jsx
const design = useDesignValues();
const theme = themeClasses(design.theme);

<section
  style={toCss(design)}
  className={`${theme.surface} rounded-lg grid md:grid-cols-2`}
/>;
```

Three things that shape is buying:

- **Tailwind only generates classes it can see as source text.** The same
  build-time scanner that forces `@theme static` (below) also can't see a class
  name assembled at runtime — `` `bg-${design.theme.toLowerCase()}` `` compiles to
  nothing at all. Every class must appear as a literal *somewhere*, so the map
  holds whole literal strings rather than fragments.
- **Always give the lookup an explicit default.** `useDesignValues()` returns
  `{}` when there is nothing to read — a component rendered outside an
  experience, or a switch the editor never set. A bare ternary silently treats
  that `undefined` as the *other* branch; the `??` keeps the default the default,
  and won't emit `class="undefined …"` when someone adds a third option to the
  ComponentType without touching this file.
- **A class-based switch is a default, not a hard switch — but only where
  `toCss` lands.** Inline `style` outranks every utility, so if an editor sets a
  `backgroundColor` token on the same element, `theme` becomes a no-op for that
  one declaration. On a child that gets no `style` (Hero's CTA `<Link>`) the
  class is instead the final word. Same map, opposite precedence, depending on
  where you spread `toCss`.

**Match the slot to how the element is actually painted.** Hero's panel is a
gradient scrim over a photo, so its themed slot swaps the *gradient stops*
(`from-dark/75` ↔ `from-light/75`) and leaves the `bg-gradient-to-r` direction on
the component. A `bg-*` fill would have been the wrong move there — as the
existing note in `Hero.jsx` says, a background-color sits *underneath* the
gradient, so `bg-light` would be invisible while `text-dark` went unreadable
against a still-dark wash. Verified in the compiled CSS: Tailwind emits
`color-mix(in oklab, var(--color-light) 75%, transparent)` for those stops, so
the variable indirection (and paint-time re-theming) survives the opacity
modifier; the baked hex alongside it is only the fallback for browsers without
`color-mix()`.

### Naming and escape hatches

- **`toCssKey` normalizes** — it strips a leading `cf` (with an optional `-` or
  `_`), camelCases on `-` and `_`, and lowercases a leading capital. So
  `cf-padding`, `cf_padding`, `padding-block`, `padding_block`, `PaddingBlock`, and
  `paddingBlock` all land on the same property. Useful if you want design-property
  ids to look distinct in the editor.
- **One property, several declarations** — `toCss` can't express this. Merge
  explicitly: `style={{ ...toCss(design), padding: design.spacing, gap: design.spacing }}`.
- **A real CSS property the whitelist misses** — `CSS_PROPERTIES` is an exported,
  mutable `Set`; `.add('containerType')` and `toCss` will emit it. Only for genuine
  CSS properties. Adding a semantic alias like `spacing` just re-creates the
  silent failure one layer down.
- **`toCss(design, { include, exclude })`** takes key filters if you need to
  narrow further; both match against the original record key.

### Token vs. manual values

After `resolveToken` runs, a token-backed value and an author-typed string are
both plain strings — `toCss` cannot tell them apart. If a design property must
accept *only* tokens, constrain it with `allowedResources` on the ComponentType
rather than filtering at render time. If you do need the distinction in a
component, the raw envelopes are on `useContentfulComponent().design`,
discriminated on `type: 'DesignToken'` and cascade-resolved with
`getValueForViewport` (a property can be token-backed at one viewport and manual
at another).

### Client/server boundary

`useDesignValues()` is client-only, so a component that calls it needs
`'use client'`. **Only that leaf** — token resolution itself runs on the server.
There is no blanket "all ExO components must be client components" rule; that is
Studio guidance (see below).

## Design tokens

ExO stores design tokens as **opaque ids and discards their values**, so this app
owns every value. `resolveToken` in
[`src/lib/experience-config.tsx`](./src/lib/experience-config.tsx) maps a token id
onto a Tailwind v4 theme variable (`color.primary` → `var(--color-primary)`), with
a dev-only guard that warns on ids with no matching variable.

Two things are load-bearing and easy to break:

- `globals.css` must use **`@theme static`**. Plain `@theme` tree-shakes unused
  variables, and Tailwind's build-time scanner can never see a token an editor
  picks at runtime.
- **Token paths must mirror Tailwind's namespaces.** `spacing.small` works
  because `--spacing-small` exists.

Full rationale, rejected alternatives, and trade-offs:
[`docs/adr/0001-exo-design-tokens-via-tailwind-css-variables.md`](./docs/adr/0001-exo-design-tokens-via-tailwind-css-variables.md).

## Importing a design system

The Design System Import CLI (`experiences import`, or `--raw-tokens` for tokens
only) extracts tokens by static analysis of CSS custom properties, Tailwind
config, and Style Dictionary files.

**Extraction is intentionally exhaustive.** It has no concept of a token layer,
so it sweeps your whole palette — primitives, semantic roles, per-mode variants,
tenant overrides — and DTCG groups become `DesignTokenSet`s by dot-path. That's
expected output, not a bug. Curation happens afterward, at three gates that all
default to permissive:

1. The agent-driven generate step, where you shape the DTCG file
2. `experiences apply select` (`--select` / `--deselect`) in the CLI
3. The Tokens tab of the review modal in the web app

Practical guidance:

- **Prefer importing the semantic layer.** Values aren't stored, so an imported
  primitive delivers nothing at runtime that its semantic alias doesn't — it just
  adds a choice an author has to not make.
- **Don't import per-mode or per-tenant token sets.** ExO stores ids; your
  `resolveToken` and CSS own resolution. Import one `color.text.primary` and
  re-declare the variable per scope
  (`[data-theme="dark"] { --color-text-primary: … }`) rather than multiplying
  tokens by modes.
- **`allowedResources` on the design property is the real guardrail**, not a
  smaller import. Without it an author sees every token of a matching type as
  equally valid.

## This is ExO, not Studio

Contentful has two "Experiences" products with overlapping vocabulary. This repo
uses **Experience Orchestration**. Studio guidance will look plausible and be
wrong. Quick tells:

| | ExO (this repo)                     | Studio (does not apply)              |
| --- | ----------------------------------- | ------------------------------------ |
| Package | `@contentful/experiences-react`  | `@contentful/experiences-sdk-react`  |
| Registration | `defineComponent` (singular) | `defineComponents` (plural)          |
| Tokens | `resolveToken` on `Config`         | `defineDesignTokens`                 |
| Fetching | `fetchExperience`                | `useFetchBySlug` / `fetchBySlug`     |
| Renderer | `ServerExperienceRenderer`       | `ExperienceRoot`                     |
| Doc paths | `/experience-orchestration/`    | `/experiences/`                      |

Before trusting any SDK claim, grep the installed types — they cannot drift:

```bash
grep -rn "<symbol>" node_modules/@contentful/
```

Grep the whole scope, not `experiences-react/dist` alone. `experiences-react` is a
facade that re-exports from `experiences-sdk-core`, `experiences-design`,
`experiences-client`, and `experience-delivery`, so the narrower path reports real
APIs as missing — `client.fragment.getFragment` in
[`src/lib/client.ts`](./src/lib/client.ts) is only in `experience-delivery`.

Two corollaries on that Package row. Match `@contentful/experiences-sdk-react` as a
whole name: `-sdk-` is not the tell, because **`@contentful/experiences-sdk-core` is
real ExO** and sits in this repo's tree. And a symbol missing from every
`@contentful/` package is not automatically fake — it may be CMA-side, since
ComponentType authoring fields like `allowedResources` are defined by the Management
API and never appear in the render SDK.

## Learn More

This app is on a Next.js version whose APIs and conventions differ from what's
published on nextjs.org and from what most models were trained on. Read the guides
shipped with the installed version instead — they cannot drift:

```
node_modules/next/dist/docs/
```

- [`docs/`](./docs) — project context and design notes that aren't derivable from the code.
- [`docs/adr/`](./docs/adr) — Architecture Decision Records. An ADR marked _Accepted_ is the current rule; supersede it with a new ADR rather than diverging.
- [`AGENTS.md`](./AGENTS.md) — the same rules, condensed for coding agents. [`CLAUDE.md`](./CLAUDE.md) just imports it, so there is one copy to maintain.
