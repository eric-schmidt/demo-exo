import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ServerExperienceRenderer } from "@contentful/experiences-react";

import { getDestinationPaths, getExperienceByPath } from "@/lib/client";
import { experienceConfig } from "@/lib/experience-config";

// `/` is served by app/page.tsx; a required catch-all can't take an empty slug.
export const generateStaticParams = async () =>
  (await getDestinationPaths())
    .filter(({ path }) => path !== "/")
    .map(({ path }) => ({ slug: path.split("/").filter(Boolean) }));

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();

  // Destination node paths are absolute and must match exactly.
  const result = await getExperienceByPath({
    path: `/${slug.join("/")}`,
    preview,
  });

  if (!result) notFound();
  if ("redirect" in result) redirect(result.redirect.path);

  return (
    <ServerExperienceRenderer experience={result} config={experienceConfig} />
  );
}
