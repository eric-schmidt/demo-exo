// `useDesignValues` is a client-only hook, so this leaf crosses the RSC
// boundary. Token resolution itself still runs on the server.
"use client";

import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { toCss, useDesignValues } from "@contentful/experiences-react";

import { themeClasses } from "@/lib/theme";

export const Duplex = ({ heading, copy, image, alternativeText, layout }) => {
  // Already viewport-cascaded and token-resolved, so these are plain CSS strings
  // like `var(--color-primary)`.
  const design = useDesignValues();

  const theme = themeClasses(design.theme);

  return (
    <section
      // The Tailwind classes are the defaults. Inline style outranks them, so an
      // editor-set token wins automatically — no class merging needed. Both
      // paths resolve the same `:root` variable.
      className={`${theme.surface} rounded-lg grid grid-cols-1 md:grid-cols-2 gap-12 p-10 mt-12`}
      style={toCss(design)}
    >
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl md:text-2xl font-bold tracking-tight drop-shadow-lg mb-4">
          {heading}
        </h2>
        {copy?.document && (
          <div className="max-w-none">
            {documentToReactComponents(copy.document)}
          </div>
        )}
      </div>

      <Image
        // TODO: Add proper height/width derived from image metadata
        // className={`order-first ${layout ? "md:order-first" : "md:order-last"}`}
        className="rounded-lg"
        width={1000}
        height={1000}
        sizes="(min-width: 1280px) 416px, (min-width: 780px) calc(45.42vw - 156px), calc(100vw - 240px)"
        src={image}
        alt={alternativeText}
      />
    </section>
  );
};

export default Duplex;
