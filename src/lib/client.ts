import { ContentfulViewDeliveryClient } from "@contentful/experience-delivery";

const client = new ContentfulViewDeliveryClient({
  token: process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_KEY!,
});

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENV_ID!;

export const experience = ({
  experienceId,
  locale = "en-US",
}: {
  experienceId: string;
  locale?: string;
}) =>
  client.view.getExperience(spaceId, environmentId, experienceId, { locale });
