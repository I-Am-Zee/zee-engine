globalThis.process ??= {}; globalThis.process.env ??= {};
import { k as createVNode, F as Fragment, aF as __astro_tag_component__ } from './astro/server_C0Zh7G4i.mjs';

const frontmatter = {
  "title": "Welcome to the World of Zelia Vance",
  "excerpt": "Discover our journey toward timeless elegance and ethical craftsmanship.",
  "publishDate": "2026-02-09T00:00:00.000Z",
  "author": "Zelia Vance Concierge",
  "image": "/images/products/1605100804763-247f67b3557e.jpg",
  "tags": ["Branding", "Luxury"],
  "isDraft": false
};
function getHeadings() {
  return [];
}
function _createMdxContent(props) {
  const _components = {
    p: "p",
    ...props.components
  };
  return createVNode(Fragment, {
    children: [createVNode(_components.p, {
      children: "At Zelia Vance, we believe that jewelry is more than just an accessory—it’s a story of craftsmanship, love, and timeless beauty."
    }), "\n", createVNode(_components.p, {
      children: "We are excited to share our passion for ethically sourced diamonds and exquisite design with you through this new space. Stay tuned for expert jewelry advice, styling tips, and updates on our latest collections."
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}

const url = "src/content/zelia-vance/blog/welcome-to-zaviona.mdx";
const file = "/app/src/content/zelia-vance/blog/welcome-to-zaviona.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/app/src/content/zelia-vance/blog/welcome-to-zaviona.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
