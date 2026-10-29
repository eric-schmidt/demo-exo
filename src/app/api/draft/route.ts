import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Entry point for Contentful's "All Experience entities" preview URL. The canvas
 * appends `preview_session_id`, and the session decides what renders, for
 * experiences, fragments, components, and templates alike. Any `{entity.sys.*}`
 * tokens on the configured URL are ignored. See docs/adr/0004-*.md.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const sessionId = searchParams.get("preview_session_id");

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!sessionId) {
    return new Response(
      "Missing preview_session_id. Open this preview from the Experience Orchestration canvas.",
      { status: 400 },
    );
  }

  const draft = await draftMode();
  draft.enable();

  // Next.js sets __prerender_bypass with SameSite=Lax by default, which the
  // browser drops when the app is loaded in a cross-site iframe (the ExO
  // preview pane). Re-set the same value with SameSite=None; Secure so it
  // flows in the iframe, and Partitioned so browsers that block third-party
  // cookies still keep it. Without it /preview 404s inside the canvas.
  // https://www.contentful.com/developers/docs/tutorials/preview/live-preview/#my-page-has-an-authorization-cookie-for-logging-in
  const store = await cookies();
  const bypass = store.get("__prerender_bypass")!;
  store.set("__prerender_bypass", bypass.value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    path: "/",
  });

  redirect(`/preview?preview_session_id=${encodeURIComponent(sessionId)}`);
}
