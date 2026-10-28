import {
  createClient,
  fetchDestinationSitemap,
  fetchExperience,
  NotFoundError,
  resolveExperience,
  type SitemapPathItem,
} from "@contentful/experiences-react";
import { experienceConfig } from "@/lib/experience-config";

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENV_ID!;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_KEY!;
const previewToken = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_KEY!;
const previewHost = "https://preview.xdn.contentful.com";

// Read lazily so a missing value fails with a message rather than as a
// `/destinations/undefined` 404, which would surface as every page not found.
const destinationId = () => {
  const id = process.env.NEXT_PUBLIC_CONTENTFUL_DESTINATION_ID;
  if (!id) throw new Error("NEXT_PUBLIC_CONTENTFUL_DESTINATION_ID is not set");
  return id;
};

export const getExperience = ({
  experienceId,
  locale = "en-US",
  preview = false,
}: {
  experienceId: string;
  locale?: string;
  preview?: boolean;
}) =>
  fetchExperience(
    {
      spaceId,
      environmentId,
      experienceId,
      locale,
    },
    preview
      ? { accessToken: previewToken, host: previewHost }
      : { accessToken: deliveryToken },
    { config: experienceConfig },
  );

/**
 * Every Experience node in the published Destination, across all sitemap
 * pages. Paths are absolute (`/product`) and locale-agnostic.
 */
export const getDestinationPaths = async (): Promise<SitemapPathItem[]> => {
  const items: SitemapPathItem[] = [];
  let pageNext: string | undefined;

  do {
    const page = await fetchDestinationSitemap(
      { spaceId, destinationId: destinationId() },
      { accessToken: deliveryToken },
      { limit: 1000, pageNext },
    );
    items.push(...page.items);
    pageNext = page.pages.next;
  } while (pageNext);

  return items.filter((item) => item.type === "DestinationExperienceNode");
};

/**
 * Resolve a URL path through the Destination: a render plan, a
 * `{ redirect: { path } }` for a redirect node, or `null` when no node claims
 * the path.
 *
 * The Destinations Delivery API has no preview host yet — the SDK throws
 * `DestinationPreviewNotSupportedError` on `preview: true` — so Draft Mode
 * looks the path up in the published sitemap and fetches that Experience by id
 * from the preview host. The path itself is therefore always the published
 * one: a node that has never been published can't be previewed by path, only
 * at `/experiences/[id]`. Paths the sitemap doesn't list (redirects included)
 * fall through to delivery resolution.
 */
export const getExperienceByPath = async ({
  path,
  preview = false,
}: {
  path: string;
  preview?: boolean;
}) => {
  try {
    if (preview) {
      const node = (await getDestinationPaths()).find((i) => i.path === path);
      if (node) {
        return await getExperience({ experienceId: node.experienceId, preview });
      }
    }

    return await fetchExperience(
      { spaceId, destinationId: destinationId(), path },
      { accessToken: deliveryToken },
      { config: experienceConfig },
    );
  } catch (err) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
};

/**
 * `fetchExperience` reaches `/experiences/:id` and the Destination endpoints but
 * has no Fragment branch, so a Fragment id handed to it 404s. Until the SDK grows a combined surface, compose the two
 * halves it would have composed for us: the delivery client's own Experience
 * Fragment endpoint, then the same `resolveExperience` pass.
 *
 * Use `experienceFragment`, not the legacy `fragment` client: the latter still
 * returns tree nodes keyed `componentType`, which the renderer silently drops
 * since the SPA-4822 rename.
 *
 * Fragments are preview-only — the endpoint 404s on the delivery host even for
 * a published Fragment — so this always uses the preview host and token, with
 * no `preview` flag to get wrong.
 */
const previewClient = createClient({
  accessToken: previewToken,
  host: previewHost,
});

export const getFragment = async ({
  fragmentId,
  locale = "en-US",
}: {
  fragmentId: string;
  locale?: string;
}) => {
  const payload = await previewClient.experienceFragment.get(
    spaceId,
    environmentId,
    fragmentId,
    { locale },
  );

  return resolveExperience(payload, experienceConfig);
};
