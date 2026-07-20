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

## Installing `@contentful/experience-delivery`

The ExO delivery SDK is not yet published to a public registry, so this app depends on a **local tarball** built from a sibling checkout of [`contentful-experience-delivery.js`](../contentful-experience-delivery.js):

```json
"@contentful/experience-delivery": "file:../contentful-experience-delivery.js/contentful-experience-delivery-0.0.0-fern-placeholder.4.tgz"
```

To (re)generate the tarball after pulling SDK changes:

```bash
cd ../contentful-experience-delivery.js
pnpm install
pnpm build
npm pack          # emits contentful-experience-delivery-<version>.tgz
```

Then, back in this project, reinstall so npm unpacks the fresh archive:

```bash
npm install
```

> A `file:` reference to the SDK's source directory (or a symlink into `node_modules`) does **not** work with Next 16's Turbopack — it can't resolve packages that live outside the project root. The tarball is unpacked into `node_modules/@contentful/experience-delivery` as a normal package, which Turbopack handles without special config.
>
> **TODO:** Switch to a normal semver dependency once the SDK is published to the internal (or public) npm registry, and delete this section.

## Routing Experiences by Slug

Contentful's Experiences (ExO) feature does not yet support storing a URL slug directly on an Experience, so this app maintains its own mapping between Experience IDs and slugs in [`src/lib/experiences.ts`](./src/lib/experiences.ts). Requests to `/[slug]` look up the corresponding Experience ID and fetch it via the delivery client. Every known slug is prerendered via `generateStaticParams` with `dynamicParams = false`, so unknown slugs return a 404 automatically.

The Contentful Preview URL points at [`/api/draft`](./src/app/api/draft/route.ts) with the Experience ID and a shared secret (`CONTENTFUL_PREVIEW_SECRET`). That Route Handler validates the secret, maps ID → slug, enables Draft Mode, and redirects to `/[slug]` — keeping the page component slug-only.

> **TODO:** Remove the local slug map once ExO supports slugs natively. When that lands:
> - Slugs should be read directly from the Experience.
> - `generateStaticParams` should fetch the full list from Contentful instead of enumerating a hardcoded object.
> - `/api/draft` can accept the slug directly from Contentful's preview URL and skip the ID → slug reverse lookup.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
