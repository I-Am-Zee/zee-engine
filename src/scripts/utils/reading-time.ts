/**
 * calculateReadTime - Pure Utility
 * 
 * Estimates reading time based on word count.
 * Formula: Math.ceil(wordCount / 200)
 */
export function calculateReadTime(content: string): string {
  if (!content) return "1 min read";
  
  // Strip Markdown syntax (simplified)
  const cleanContent = content
    .replace(/[#*`_~]/g, '') // Remove simple MD characters
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text, remove URL
    .trim();

  const wordCount = cleanContent.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  
  return `${minutes} min read`;
}
