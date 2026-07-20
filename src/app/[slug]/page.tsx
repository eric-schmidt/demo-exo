import { experience } from "@/lib/client";
import { allSlugs, experienceIdForSlug } from "@/lib/experiences";

export const dynamicParams = false;

export const generateStaticParams = () => allSlugs().map((slug) => ({ slug }));

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = await experience({ experienceId: experienceIdForSlug(slug)! });

  console.log(exp);

  return (
    <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      <h1>HELLO WORLD</h1>
    </main>
  );
}
