import Image from "next/image";

export const Hero = ({
  heading,
  copy,
  ctaText,
  ctaLink,
  backgroundImage,
  alternativeText,
}) => {
  return (
    <section className="container relative">
      <div className="relative z-10 md:max-w-lg px-10 py-20 md:px-10 md:py-40 bg-gradient-to-r from-black/50 to-transparent">
        <h1 className="text-4xl md:text-4xl font-bold tracking-tight drop-shadow-lg mb-4">
          {heading}
        </h1>
        {copy && <div className="text-md lg:text-lg mb-4">{copy}</div>}
      </div>

      <Image
        className="object-cover rounded-lg"
        priority={true} // prevent Largest Contentful Paint issues
        fill={true} // add object fit w/o height/width requirement
        sizes="(min-width: 1280px) 1024px, (min-width: 780px) calc(90.83vw - 121px), calc(100vw - 96px)"
        src={backgroundImage}
        alt={alternativeText}
      />
    </section>
  );
};

export default Hero;
