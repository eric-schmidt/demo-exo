import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type");
  const exoId = searchParams.get("id");

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!exoId) {
    return new Response("Missing experience id", { status: 400 });
  }

  const exoEndpoints = {
    experience: "/experiences",
    fragment: "/experience_fragments",
  };

  const isExoType = (value: string): value is keyof typeof exoEndpoints =>
    value in exoEndpoints;

  if (!type || !isExoType(type)) {
    return new Response("Missing preview type (experiences or fragments)", {
      status: 400,
    });
  }

  const draft = await draftMode();
  draft.enable();

  // Next.js sets __prerender_bypass with SameSite=Lax by default, which the
  // browser drops when the app is loaded in a cross-site iframe (the ExO
  // preview pane). Re-set the same value with SameSite=None; Secure so it
  // flows in the iframe.
  // https://www.contentful.com/developers/docs/tutorials/preview/live-preview/#my-page-has-an-authorization-cookie-for-logging-in
  const store = await cookies();
  const bypass = store.get("__prerender_bypass")!;
  store.set("__prerender_bypass", bypass.value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  redirect(`${exoEndpoints[type]}/${exoId}`);
}
