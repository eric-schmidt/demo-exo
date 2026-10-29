// A coded Experience Template — the root node of an experience. It owns the
// page's SEO `<head>` and wraps the experience body.
//
// No `"use client"`: this reads only content props (never `useDesignValues()`),
// so it stays server-first per ADR 0001. `<title>` / `<meta>` rendered here are
// hoisted into `<head>` by React 19 / Next 16, so there is no route-level
// `generateMetadata` to keep in sync.
//
// `metaTitle` / `metaDescription` are content properties authored in ExO. The
// experience body arrives as the `content` slot prop (a slot's id becomes a prop
// of the same name — see @contentful/experiences-react types.d.ts).
export const SeoTemplate = ({ metaTitle, metaDescription, content }) => {
  return (
    <>
      {/* Guarded so a blank field emits no tag rather than an empty one, and the
          root layout's static fallback stays in effect. */}
      {metaTitle && <title>{metaTitle}</title>}
      {metaDescription && (
        <meta name="description" content={metaDescription} />
      )}
      {content}
    </>
  );
};

export default SeoTemplate;
