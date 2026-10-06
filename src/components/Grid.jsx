// `useDesignValues` is a client-only hook, so this leaf crosses the RSC
// boundary. Token resolution itself still runs on the server.
"use client";

import { toCss, useDesignValues } from "@contentful/experiences-react";

import { themeClasses } from "@/lib/theme";

// A container. Its children are not props from Contentful — they arrive as a
// slot, populated editorially (e.g. a Looper repeating a Card). The SDK hands a
// slot in as a prop of the SAME NAME as the authored slot id, holding
// already-rendered React elements. This Grid's ExO component defines its slot
// as `items` (not the conventional default `children`), so the prop is `items`.
export const Grid = ({ items }) => {
  // Already viewport-cascaded and token-resolved, so these are plain CSS strings
  // like `var(--color-primary)`.
  const design = useDesignValues();

  const theme = themeClasses(design.theme);

  return (
    <div
      // The Tailwind classes are the defaults. Inline style outranks them, so an
      // editor-set token (e.g. gap, padding) wins automatically — no class
      // merging needed. One column on mobile, two at md, three at lg.
      className={`${theme.surface} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 mt-12 rounded-lg`}
      style={toCss(design)}
    >
      {items}
    </div>
  );
};

export default Grid;
