import { notFound } from "next/navigation";
import {
  NotFoundError,
  ServerExperienceRenderer,
} from "@contentful/experiences-react";

import { getExperience } from "@/lib/client";
import { experienceConfig } from "@/lib/experience-config";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const experience = await getExperience({ experienceId: id });
    return (
      <ServerExperienceRenderer
        experience={experience}
        config={experienceConfig}
      />
    );
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
}
