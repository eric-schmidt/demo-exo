<!-- BEGIN:project-docs -->
# Project context lives in `docs/`

Before proposing or changing anything architectural, read the relevant files in `docs/`:

- `docs/` — project context, design notes, and guides that aren't derivable from the code.
- `docs/adr/` — Architecture Decision Records, numbered `NNNN-kebab-case-title.md`. Each records a decision that is already binding: read its **Decision** and **Consequences** before touching the area it covers. An ADR marked _Accepted_ is the current rule even when another approach looks better; if you disagree, say so and propose a superseding ADR rather than silently diverging.

When a change invalidates an ADR, add a new ADR that supersedes it instead of editing the old one's Decision.
<!-- END:project-docs -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:contentful-exo-not-studio -->
# This is Experience Orchestration (ExO), NOT Studio

Contentful has two "Experiences" products. This repo uses **Experience Orchestration (ExO)**. Studio is a **separate, older** product with an overlapping vocabulary that will silently poison answers if you let it. Any guidance sourced from Studio must be treated as inapplicable, even when the language sounds identical.

**Authoritative sources for this repo (in priority order):**
1. The installed SDK — read `node_modules/@contentful/experiences-react/dist/*.d.ts` before answering any question about the SDK's API, types, or behavior. This is the only source that cannot drift.
2. `packages/adapter-react/README.md` in [`contentful/experiences`](https://github.com/contentful/experiences) — the ExO SDK's own repo.
3. `examples/nextjs/` in that same repo — a working ExO reference.
4. Internal Confluence pages that explicitly mention "ExO" or "Experience Orchestration" (e.g. "Manual Setup (Getting Started with ExO)", "Experiences SDK Suite Design Architecture").

**Studio signals — auto-reject if any appear in a proposed answer, doc snippet, or search result:**
- Package name: `@contentful/experiences-sdk-react` (note the extra `-sdk-`)
- APIs: `defineComponents` (plural), `ExperienceRoot`, `useFetchBySlug`, `fetchBySlug`, `detachExperienceStyles`, component `definition: { id, name, category, variables }`
- Options: `wrapComponent`, `wrapContainer`
- Blanket "all components must be `'use client'`" rules (ExO components are server-first; `'use client'` is only needed when a component calls a client-only hook like `useDesignValues` or `useExperience`)

**Correct ExO surface (for reference):**
- Package: `@contentful/experiences-react`
- APIs: `defineComponent` (singular) / `defineTemplate`, `fetchExperience`, `ServerExperienceRenderer` / `ClientExperienceRenderer`, `useDesignValues`, `toCss`, `useExperience`
- Registration shape: `defineComponent<Props>({ component, defaults?, resolveData? })`

**Verification step before answering any ExO-SDK question:** grep the relevant symbol in `node_modules/@contentful/experiences-react/dist/`. If it doesn't appear there, it's from Studio (or hallucinated); do not use it.
<!-- END:contentful-exo-not-studio -->
