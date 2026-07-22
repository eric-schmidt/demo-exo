import {
  // defineComponent,
  type Components,
  type Config,
  // type ResolveToken,
  // type Templates,
} from "@contentful/experiences-react";

import { Duplex } from "@/components/Duplex";
import { Hero } from "@/components/Hero";

const components: Components = {
  duplex: Duplex,
  hero: Hero,
};

export const experienceConfig: Config = { components };

// const templates: Templates = {};
// const resolveToken: ResolveToken = () => undefined;
// export const experienceConfig: Config = { components, templates, resolveToken };
