import { draftMode, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ServerExperienceRenderer } from "@contentful/experiences-react";

import { getExperience } from "@/lib/client";
import { experienceConfig } from "@/lib/experience-config";
import { allSlugs, experienceIdForSlug } from "@/lib/experiences";
import { detectViewportFromUserAgent } from "@/lib/detect-viewport";

export const generateStaticParams = () => allSlugs().map((slug) => ({ slug }));

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Temporary Experience ID to Slug mapping until native Slug support added to ExO.
  const experienceId = experienceIdForSlug(slug);
  if (!experienceId) notFound();

  // Deterimine if preview should be enabled.
  const { isEnabled: preview } = await draftMode();

  // Get initial viewport for SSR.
  const userAgent = (await headers()).get("user-agent") ?? "";
  const initialViewportId = detectViewportFromUserAgent(userAgent);

  const experience = await getExperience({ experienceId, preview });

  return (
    <ServerExperienceRenderer
      experience={experience}
      config={experienceConfig}
      initialViewportId={initialViewportId}
    />
  );
}
