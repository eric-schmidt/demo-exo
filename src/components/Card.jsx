// `useDesignValues` is a client-only hook, so this leaf crosses the RSC
// boundary. Token resolution itself still runs on the server.
"use client";

import Image from "next/image";
import { toCss, useDesignValues } from "@contentful/experiences-react";

import { themeClasses } from "@/lib/theme";

export const Card = ({ heading, description, image, alternativeText }) => {
  // Already viewport-cascaded and token-resolved, so these are plain CSS strings
  // like `var(--color-primary)`.
  const design = useDesignValues();

  const theme = themeClasses(design.theme);

  return (
    <article
      // The Tailwind classes are the defaults. Inline style outranks them, so an
      // editor-set token wins automatically — no class merging needed.
      className={`${theme.surface} rounded-lg overflow-clip`}
      style={toCss(design)}
    >
      {image && (
        // Fixed-aspect box so cards line up in the grid regardless of the source
        // image's dimensions. `sizes` reflects a third of the content width at
        // three columns (lg), half at two (md), full below — the repo's
        // 1280/780 breakpoints.
        <div className="relative aspect-3/2">
          <Image
            className="object-cover"
            fill={true}
            sizes="(min-width: 1280px) 320px, (min-width: 780px) calc((90.83vw - 121px) / 2), calc(100vw - 96px)"
            src={image}
            alt={alternativeText}
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl md:text-xl font-bold tracking-tight mb-2">
          {heading}
        </h3>
        {description && <div className="text-md lg:text-lg">{description}</div>}
      </div>
    </article>
  );
};

export default Card;
