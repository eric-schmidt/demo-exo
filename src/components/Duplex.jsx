import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export const Duplex = ({ heading, copy, image, alternativeText, layout }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6 mt-12">
      <div className="text-white flex flex-col justify-center">
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
        // className={`order-first ${layout ? "md:order-first" : "md:order-last"}`}
        // TODO: Add proper height/width derived from image metadata
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
