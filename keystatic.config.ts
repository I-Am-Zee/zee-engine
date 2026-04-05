import { config, fields, collection, singleton } from '@keystatic/core';

const brandId = (typeof process !== 'undefined' ? process.env.PUBLIC_BRAND_ID : undefined) || 'zelia-vance';

export default config({
  storage: { kind: 'local' },
  collections: {
    products: collection({
      label: 'Products',
      slugField: 'title',
      path: `src/content/${brandId}/products/*`,
      format: { data: 'frontmatter', content: 'none' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        sku: fields.text({ label: 'SKU' }),
        price: fields.number({ label: 'Price' }),
        image: fields.text({ label: 'Image URL' })
      }
    }),
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: `src/content/${brandId}/blog/*`,
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        publishDate: fields.date({ label: 'Publish Date' }),
        content: fields.mdx({ label: 'Content' })
      }
    })
  },
  singletons: {
    settings: singleton({
      label: 'Site Settings',
      path: `src/content/${brandId}/settings/site`,
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Brand Name' }),
        tagline: fields.text({ label: 'Tagline' }),
        monetization: fields.object({
          show_ads: fields.checkbox({ label: 'Show Ads on Blog' })
        })
      }
    })
  }
});
