# 3. Route public paths through an ExO Destination

Date: 2026-10-28

## Status

Accepted.

## Context

`/[slug]` resolved a URL to an Experience through `src/lib/experiences.ts`, a
hand-maintained `slug → Experience ID` map, because ExO had no notion of a path.
Every new page needed a code change and a deploy.

`@contentful/experiences-react` 0.15.1 ships Channels and Destinations support.
A Destination (one per space, one Channel) holds a tree of Destination Nodes; an
Experience node binds a path to an Experience, and a redirect node binds a path
to another path. Verified against the installed `experiences-client`:

- `fetchExperience({ spaceId, destinationId, path })` resolves a path and returns
  a render plan, or `{ redirect: { path } }` as a plain value. An unclaimed path
  throws `NotFoundError`.
- `fetchDestinationSitemap` lists published paths with their `experienceId`,
  cursor-paginated (`limit` ≤ 1000).
- Both are space-scoped (no environment) and take no locale.
- Both throw `DestinationPreviewNotSupportedError` on `preview: true`: the
  Destinations Delivery API has no preview host yet.

The public docs recommend resolving through the Destination, not by extracted
Experience ID, because the node tracks which delivery artifacts belong to its
Experience while publishing settles.

## Decision

`/[slug]` becomes `/[...slug]`, so folder nodes' nested paths route. It resolves
`/${slug.join("/")}` through the Destination in `NEXT_PUBLIC_CONTENTFUL_DESTINATION_ID`.
A redirect node becomes Next's `redirect()` (307); `null` becomes `notFound()`.
`generateStaticParams` walks the sitemap. `src/lib/experiences.ts` is deleted.

In Draft Mode, `getExperienceByPath` looks the path up in the published sitemap
and fetches that Experience **by id** from the preview host. Paths the sitemap
doesn't list fall through to delivery resolution, so redirects still work.

## Consequences

- Paths are editorial data. Adding a page is a Destinations Management API change
  plus publishing the Destination and the node, with no deploy.
- Preview shows draft *content* at published *routes*. A node that has never been
  published 404s by path in preview; `/experiences/[id]` still renders it.
- Each Draft Mode request walks the full sitemap. Fine at demo scale; cache it if
  the Destination grows.
- `next build` fails without a Destination ID, or if the Destination isn't
  published. That is deliberate: a wrong ID would otherwise 404 every page.
- Redirects are always 307. The SDK result carries no status, so a permanent
  redirect would need a Channel node property and app code to read it.
- Locale is the app's job: strip any locale prefix before resolving.
- The Destination's `/` node isn't routed; `app/page.tsx` still owns `/`.
- When a preview host ships, delete the sitemap bridge and pass `preview` through.
