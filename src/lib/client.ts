import {
  fetchExperience,
  type ExperienceOptions,
  type ResolveOptions,
} from "@contentful/experiences-react";

import { experienceConfig } from "@/lib/experience-config";

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENV_ID!;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_KEY!;
const previewToken = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_KEY!;

const PREVIEW_HOST = "https://preview.xdn.contentful.com";

export const getExperience = ({
  experienceId,
  locale = "en-US",
  preview = false,
  context,
}: {
  experienceId: string;
  locale?: string;
  preview?: boolean;
  context?: ResolveOptions["context"];
}) =>
  fetchExperience(
    {
      spaceId,
      environmentId,
      experienceId,
      locale,
    } satisfies ExperienceOptions,
    preview
      ? { accessToken: previewToken, host: PREVIEW_HOST }
      : { accessToken: deliveryToken },
    { config: experienceConfig, context: { isPreview: preview, ...context } },
  );
