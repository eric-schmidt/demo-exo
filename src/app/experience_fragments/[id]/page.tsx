import { notFound } from "next/navigation";
import {
  NotFoundError,
  ServerExperienceRenderer,
} from "@contentful/experiences-react";

import { getFragment } from "@/lib/client";
import { experienceConfig } from "@/lib/experience-config";

export const dynamic = "force-dynamic";

/**
 * Renders a Fragment on its own, for previewing one in isolation. Normally a
 * Fragment arrives already embedded in an Experience payload, so this route is
 * an authoring aid rather than something a visitor should reach.
 *
 * There is no `draftMode()` check here: Fragments are served by the preview host
 * only, so `getFragment` is always a preview read.
 */
export default async function ExperienceFragmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Only the fetch belongs in the try — JSX returned from inside one looks
  // guarded but isn't, since React renders it after the block has exited.
  let fragment;
  try {
    fragment = await getFragment({ fragmentId: id });
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <ServerExperienceRenderer experience={fragment} config={experienceConfig} />
  );
}
