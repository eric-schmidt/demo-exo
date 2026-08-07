// `useDesignValues` is a client-only hook, so this leaf crosses the RSC
// boundary. Token resolution itself still runs on the server.
"use client";

import Image from "next/image";
import { toCss, useDesignValues } from "@contentful/experiences-react";

export const Hero = ({
  heading,
  copy,
  ctaText,
  ctaLink,
  backgroundImage,
  alternativeText,
}) => {
  // Already viewport-cascaded and token-resolved, so these are plain CSS strings
  // like `var(--color-primary)`.
  const design = useDesignValues();

  return (
    <section className="container relative">
      {/* Design values land on the content div, not the section — this is what
          owns the padding and text color. `bg-gradient-to-r` sets
          background-image, so an inline background-color layers underneath the
          gradient rather than fighting it. */}
      <div
        className="relative z-10 md:max-w-lg px-10 py-20 md:px-10 md:py-40 bg-gradient-to-r from-black/75 via-black/50 to-transparent"
        style={toCss(design)}
      >
        <h1 className="text-4xl md:text-4xl font-bold tracking-tight drop-shadow-lg mb-4">
          {heading}
        </h1>
        {copy && <div className="text-md lg:text-lg mb-4">{copy}</div>}
      </div>

      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <Image
          className="object-cover"
          loading="eager" // prevent Largest Contentful Paint issues
          fill={true} // add object fit w/o height/width requirement
          sizes="(min-width: 1280px) 1024px, (min-width: 780px) calc(90.83vw - 121px), calc(100vw - 96px)"
          src={backgroundImage}
          alt={alternativeText}
        />
      </div>
    </section>
  );
};

export default Hero;
