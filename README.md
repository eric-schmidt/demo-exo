This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Routing Experiences

There are two routes into the same renderer:

- **`/experiences/[id]`** — the canonical, ID-keyed route. Renders any published Experience by its Contentful sys ID. This is what Contentful's iframe-based preview URL points at, since the CMS only knows the Experience ID (not any downstream URL slug).
- **`/[slug]`** — the pretty public route. Looks up the corresponding Experience ID in [`src/lib/experiences.ts`](./src/lib/experiences.ts) and delegates to the same renderer. Every known slug is prerendered via `generateStaticParams`; unknown slugs return a 404.

The slug map is a **frontend-owned convenience layer**, not a source of truth. ExO does not yet store URL slugs on an Experience, so this app decides which experiences should also be reachable by a friendly URL — but every experience is always renderable at `/experiences/[id]` regardless of whether it's in the map.

The Contentful Preview URL points at [`/api/draft`](./src/app/api/draft/route.ts) with the Experience ID and a shared secret (`CONTENTFUL_PREVIEW_SECRET`). That Route Handler validates the secret, enables Draft Mode, and redirects to `/experiences/[id]` — no map lookup, so any experience can be previewed without being pre-registered here.

> **TODO:** When ExO supports slugs natively on an Experience:
> - Read the slug directly from the Experience payload; retire `src/lib/experiences.ts`.
> - Have `generateStaticParams` on `/[slug]` fetch the slug list from Contentful.
> - `/experiences/[id]` can stay as-is (it's still useful as an ID-keyed fallback), or redirect to the canonical slug for SEO.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
