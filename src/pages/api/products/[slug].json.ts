import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

/**
 * Product Validation API Endpoint for Snipcart
 * 
 * This endpoint is called by Snipcart to validate product information
 * and prevent price manipulation on the client side.
 * 
 * @route /api/products/[slug].json
 * @method GET
 * @returns Product JSON in Snipcart-compatible format
 */

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Product slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Fetch all products from content collection
  const products = await getCollection('products');
  const product = products.find(p => p.slug === slug);
  
  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return Snipcart-compatible product JSON
  const productData = {
    id: product.slug,
    name: product.data.title,
    price: product.data.salePrice || product.data.price,
    url: `/products/${product.slug}`,
    description: product.data.description,
    image: product.data.image,
    ...(product.data.weight && { weight: product.data.weight }),
    ...(product.data.sku && { sku: product.data.sku }),
    ...(product.data.stock && { quantity: product.data.stock }),
    ...(product.data.taxable !== undefined && { taxable: product.data.taxable }),
    ...(product.data.dimensions && { 
      dimensions: {
        length: product.data.dimensions.length,
        width: product.data.dimensions.width,
        height: product.data.dimensions.height
      }
    }),
    // Custom fields for product options
    ...(product.data.options && {
      customFields: product.data.options.map(opt => ({
        name: opt.name,
        options: opt.values.join('|')
      }))
    })
  };
  
  return new Response(JSON.stringify(productData), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    }
  });
};

/**
 * Generate static paths for all products
 * This ensures product validation endpoints are pre-built at build time
 */
export async function getStaticPaths() {
  const products = await getCollection('products');
  return products.map(product => ({
    params: { slug: product.slug }
  }));
}
