import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { NotFoundError } from "@contentful/experiences-react";

import { getPreviewSession, previewSessionOptions } from "@/lib/client";
import { Preview } from "./Preview";

export const dynamic = "force-dynamic";

/**
 * Renders a Preview Session: whatever the ExO canvas is editing, saved or not.
 * Reached through /api/draft, which checks the secret and turns on Draft Mode;
 * without that cookie this route 404s. See docs/adr/0004-*.md.
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ preview_session_id?: string | string[] }>;
}) {
  const { isEnabled } = await draftMode();
  const { preview_session_id: sessionId } = await searchParams;

  if (!isEnabled || typeof sessionId !== "string") notFound();

  // Only the fetch belongs in the try — JSX returned from inside one looks
  // guarded but isn't, since React renders it after the block has exited.
  let initialPlan;
  try {
    initialPlan = await getPreviewSession(sessionId);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <Preview
      initialPlan={initialPlan}
      previewSessionOptions={previewSessionOptions(sessionId)}
    />
  );
}
