import { fetchExperience } from "@contentful/experiences-react";
import { experienceConfig } from "@/lib/experience-config";

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENV_ID!;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_KEY!;
const previewToken = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_KEY!;
const previewHost = "https://preview.xdn.contentful.com";

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
