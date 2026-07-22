import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

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

  (await draftMode()).enable();
  redirect(`/experiences/${experienceId}`);
}
