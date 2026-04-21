import type { CollectionEntry } from "astro:content";
import { shuffle } from "./shuffle";

/**
 * Calculates Jaccard Similarity score between two products based on tags.
 * Score = Intersecting Tags / Union of Tags.
 * 
 * Why: Jewelry is an emotional/aesthetic purchase. Tags capture "minimalist", "gold", 
 * "vintage" better than a blunt category filter.
 */
export function getJaccardSimilarity(p1: CollectionEntry<"products">, p2: CollectionEntry<"products">): number {
  const tags1 = new Set(p1.data.tags || []);
  const tags2 = new Set(p2.data.tags || []);
  
  if (tags1.size === 0 && tags2.size === 0) return 0;
  
  const intersection = new Set([...tags1].filter(x => tags2.has(x)));
  const union = new Set([...tags1, ...tags2]);
  
  return intersection.size / union.size;
}

/**
 * Gets related products using a Relevance Waterfall (CHUNK G):
 * 1. Score all products by Tag Jaccard Similarity.
 * 2. Group by score to maintain hierarchy.
 * 3. Shuffle within score groups to prevent visual stagnation (Fisher-Yates).
 * 4. Backfill with remaining products if fewer than 'count' matches found.
 * 
 * Ensures exactly 'count' items are returned whenever the catalog is large enough.
 */
export function getRelatedProducts(
  currentProduct: CollectionEntry<"products">, 
  allProducts: CollectionEntry<"products">[], 
  count: number = 4
): CollectionEntry<"products">[] {
  // 1. Filter out self
  const candidates = allProducts.filter(p => p.id !== currentProduct.id);
  
  // 2. Map items to their similarity scores
  const scored = candidates.map(p => ({
    product: p,
    score: getJaccardSimilarity(currentProduct, p)
  }));
  
  // 3. Separate into "Similar" (score > 0) and "Others"
  const similar = scored.filter(s => s.score > 0);
  const others = scored.filter(s => s.score === 0);
  
  // 4. Group similar items by their exact score to preserve ranking
  const scoreMap: Record<number, CollectionEntry<"products">[]> = {};
  similar.forEach(item => {
    if (!scoreMap[item.score]) scoreMap[item.score] = [];
    scoreMap[item.score].push(item.product);
  });
  
  // 5. Flatten the groups: sort scores desc, shuffle within each score group
  const rankedSimilarity = Object.keys(scoreMap)
    .map(Number)
    .sort((a, b) => b - a)
    .flatMap(score => shuffle(scoreMap[score]));
  
  // 6. Final waterfall: ranked similarity -> shuffled others
  return [...rankedSimilarity, ...shuffle(others.map(o => o.product))].slice(0, count);
}

/**
 * Cross-Category Discovery Logic:
 * Filters out items from the current category to encourage exploring other sections.
 * Uses Fisher-Yates for unbiased random surprise.
 */
export function getCrossCategoryProducts(
  currentCategory: string,
  allProducts: CollectionEntry<"products">[],
  count: number = 4
): CollectionEntry<"products">[] {
  const others = allProducts.filter(p => p.data.category?.toLowerCase() !== currentCategory.toLowerCase());
  return shuffle(others).slice(0, count);
}
