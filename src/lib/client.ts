import {
  fetchExperience,
  type ExperienceOptions,
  type ResolveOptions,
} from "@contentful/experiences-react";

import { experienceConfig } from "@/lib/experience-config";

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENV_ID!;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_KEY!;

export const getExperience = ({
  experienceId,
  locale = "en-US",
  context,
}: {
  experienceId: string;
  locale?: string;
  context?: ResolveOptions["context"];
}) =>
  fetchExperience(
    { spaceId, environmentId, experienceId, locale } satisfies ExperienceOptions,
    { accessToken },
    { config: experienceConfig, context },
  );
