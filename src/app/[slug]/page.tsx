import { notFound } from "next/navigation";
import { ServerExperienceRenderer } from "@contentful/experiences-react";

import { getExperience } from "@/lib/client";
import { experienceConfig } from "@/lib/experience-config";
import { allSlugs, experienceIdForSlug } from "@/lib/experiences";

export const generateStaticParams = () => allSlugs().map((slug) => ({ slug }));

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experienceId = experienceIdForSlug(slug);
  if (!experienceId) notFound();

  const experience = await getExperience({ experienceId });
  return (
    <ServerExperienceRenderer
      experience={experience}
      config={experienceConfig}
    />
  );
}
