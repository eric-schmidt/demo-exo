"use client";

import {
  ClientExperienceRenderer,
  useLivePreview,
  type PortableRenderPlan,
  type PreviewSessionOptions,
} from "@contentful/experiences-react";

import { experienceConfig } from "@/lib/experience-config";

/**
 * Subscribes to the Preview Session and re-renders on each canvas edit.
 * `useLivePreview` also posts the live/static status the canvas waits for;
 * without it, the canvas falls back to reloading this iframe after each save.
 */
export function Preview({
  initialPlan,
  previewSessionOptions,
}: {
  initialPlan: PortableRenderPlan;
  previewSessionOptions: PreviewSessionOptions;
}) {
  const preview = useLivePreview({
    initialPlan,
    previewSessionOptions,
    resolveOptions: { config: experienceConfig },
  });

  return (
    <>
      {preview.error && (
        <p role="status">
          Live updates are unavailable. Showing the last valid preview.
        </p>
      )}
      <ClientExperienceRenderer
        experience={preview.data}
        config={experienceConfig}
      />
    </>
  );
}
