/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * 
 * Provides a truly uniform random distribution in O(n) time.
 * This is the gold standard for shuffling arrays in JavaScript.
 * Better than .sort(() => Math.random() - 0.5) which is biased and O(n log n).
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]; // Maintain immutability by shuffling a copy
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
