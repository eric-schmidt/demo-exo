// `useDesignValues` is a client-only hook, so this leaf crosses the RSC
// boundary. Token resolution itself still runs on the server.
"use client";

import Image from "next/image";
import Link from "next/link";
import { toCss, useDesignValues } from "@contentful/experiences-react";

import { themeClasses } from "@/lib/theme";

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

  const theme = themeClasses(design.theme);

  return (
    <section className="container relative">
      {/* Design values land on the content div, not the section — this is what
          owns the padding and text color. `bg-gradient-to-r` sets
          background-image, so an inline background-color layers underneath the
          gradient rather than fighting it.

          The theme supplies the scrim's stops, not a `bg-*` fill: a flat
          background here would sit *under* the gradient and be invisible. */}
      <div
        className={`${theme.scrim} relative z-10 md:max-w-lg px-10 py-20 md:px-10 md:py-40 bg-gradient-to-r`}
        style={toCss(design)}
      >
        <h1 className="text-4xl md:text-4xl font-bold tracking-tight drop-shadow-lg mb-4">
          {heading}
        </h1>
        {copy && <div className="text-md lg:text-lg mb-4">{copy}</div>}
        {ctaText && ctaLink && (
          // `theme.cta` is inverted against the scrim so the button stays
          // legible either way. Note this element gets no `toCss(design)`, so
          // unlike the scrim above there is no inline style to outrank the
          // class — here the theme is the final word on color.
          <Link
            className={`${theme.cta} btn p-2 w-fit inline-block`}
            href={ctaLink}
          >
            {ctaText}
          </Link>
        )}
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
