# 4. Preview through ExO Preview Sessions

Date: 2026-10-29

## Status

Accepted. Supersedes the consequence in ADR 0003 that a never-published node can
be previewed at `/experiences/[id]`; that route no longer exists.

## Context

`/api/draft` took `id` and `type` (`experience` | `fragment`), enabled Draft Mode,
and redirected to `/experiences/:id` or `/experience_fragments/:id`, which fetched
the *saved* entity from the preview host.

In October 2026 ExO moved preview onto sessions. A preview platform for "All
Experience entities" is one URL that covers experiences, fragments, components,
and templates. The canvas creates a Preview Session holding its current, unsaved
state and appends `preview_session_id` to that URL. `{entity.sys.*}` tokens are
optional, for routing only. Verified against the installed
`experiences-live-preview` and `experiences-react` 0.15.1:

- `fetchPreviewSession({ spaceId, environmentId, sessionId }, { previewToken },
  { config })` returns a render plan, and throws `NotFoundError` for an unknown or
  expired session or `PreviewSessionFetchError` otherwise.
- `useLivePreview` subscribes over WebSocket, re-resolves each update with the
  same config, and posts the live/static status the canvas waits for. Without
  that status, the canvas reloads the iframe after each save.
- The subscription runs in the browser and needs the Content Preview API token
  there.

The old route matched none of this. The configured URL sent `entityId` and
`entityType`, so every request was a 400. `{entity.sys.type}` expands to
`Experience` / `ExperienceFragment`, not `experience` / `fragment`. And the
redirect dropped `preview_session_id`, so unsaved edits never showed.

## Decision

- `/api/draft` checks `secret`, requires `preview_session_id`, enables Draft
  Mode, and redirects to `/preview?preview_session_id=…`. It ignores any
  `{entity.sys.*}` params.
- `/preview` 404s unless Draft Mode is on, so the secret is still the gate. It
  fetches the session server-side and hands the plan to a client component that
  runs `useLivePreview` → `ClientExperienceRenderer`.
- `/experiences/[id]`, `/experience_fragments/[id]`, and `getFragment` are
  deleted. The session renders every canvas type.
- `experience-config.tsx` becomes client-safe. The dev-only `globals.css` token
  check moves to `experience-config.server.ts`, which server code imports.
- The `__prerender_bypass` cookie is re-set `SameSite=None; Secure; Partitioned`.

## Consequences

- The Contentful preview URL is `/api/draft?secret=…` on an "All Experience
  entities" platform. Opening it outside the canvas (no session id) is a 400.
- Edits show in the iframe before save, for components and templates as well as
  experiences and fragments.
- A never-published Destination node is previewed from its canvas, not by URL.
  There is no longer a route that renders a saved entity by id.
- The unknown-token warning (ADR 0002) fires for the server-rendered initial plan
  only; live updates resolve in the browser, which can't read `globals.css`.
  Unknown tokens still resolve to `null` server-side and to an ignored
  `var(--…)` client-side.
- The preview token reaches the browser. It already did, as
  `NEXT_PUBLIC_CONTENTFUL_PREVIEW_KEY`; keeping it server-only would need a
  WebSocket relay.
- If a browser blocks even partitioned third-party cookies, Draft Mode never
  turns on inside the iframe and `/preview` 404s rather than showing stale
  content.
- `/[...slug]` in Draft Mode still shows saved draft content (ADR 0003); only
  `/preview` shows the session.
