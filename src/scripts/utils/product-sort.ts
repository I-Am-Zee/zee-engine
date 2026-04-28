import { getEntry } from "astro:content";

/**
 * Server-side product sorting utilities using Cumulative Weights
 */

export async function sortProductsByHierarchy(products: any[]) {
  // Fetch Weights from Tag Weights Singleton
  const entry = await getEntry("settings", "tag-weights");
  const weights = entry?.data || {};

  return [...products].sort((a, b) => {
    const getScore = (product: any) => {
      const badges = product.data.badges || [];
      const tags = product.data.tags || [];
      const combined = [...badges, ...tags];
      
      let score = 0;
      if (weights.w5?.some((t: string) => combined.includes(t))) score += 5;
      if (weights.w4?.some((t: string) => combined.includes(t))) score += 4;
      if (weights.w3?.some((t: string) => combined.includes(t))) score += 3;
      if (weights.w2?.some((t: string) => combined.includes(t))) score += 2;
      if (weights.w1?.some((t: string) => combined.includes(t))) score += 1;
      
      return score;
    };

    const scoreA = getScore(a);
    const scoreB = getScore(b);

    // Primary sort: Cumulative Weight Score
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Secondary sort: Publish Date (Newest first)
    const dateA = a.data.publishDate ? new Date(a.data.publishDate).getTime() : 0;
    const dateB = b.data.publishDate ? new Date(b.data.publishDate).getTime() : 0;
    
    if (dateA !== dateB) {
      return dateB - dateA;
    }

    // Tertiary sort: Alphabetical
    return (a.data.title || "").localeCompare(b.data.title || "");
  });
}
