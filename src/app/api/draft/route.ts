import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { slugForExperienceId } from "@/lib/experiences";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const experienceId = searchParams.get("id");

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!experienceId) {
    return new Response("Missing experience id", { status: 400 });
  }

  const slug = slugForExperienceId(experienceId);
  if (!slug) {
    return new Response("Unknown experience id", { status: 404 });
  }

  (await draftMode()).enable();
  redirect(`/${slug}`);
}
