export function calculatePlagiarismScore(sourceText: string, otherTexts: string[], ngramSize: number = 3): number {
  if (!otherTexts || otherTexts.length === 0 || !sourceText) return 0;

  const sourceNgrams = generateNgrams(sourceText, ngramSize);
  if (sourceNgrams.size === 0) return 0;

  let highestScore = 0;

  for (const matchText of otherTexts) {
    if (!matchText) continue;
    
    const matchNgrams = generateNgrams(matchText, ngramSize);
    if (matchNgrams.size === 0) continue;

    // Calculate intersection
    let intersectionCount = 0;
    for (const ngram of sourceNgrams) {
      if (matchNgrams.has(ngram)) {
        intersectionCount++;
      }
    }

    // Similarity percentage (Jaccard similarity style or subset style)
    // We use subset style: how much of sourceText is found in matchText?
    const score = (intersectionCount / sourceNgrams.size) * 100;
    if (score > highestScore) {
      highestScore = score;
    }
  }

  return highestScore;
}

function generateNgrams(text: string, n: number): Set<string> {
  // Normalize text: lowercase, remove punctuation, split by whitespace
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  
  const ngrams = new Set<string>();
  
  if (words.length < n) {
    // If text is shorter than N words, just make it one ngram
    if (words.length > 0) ngrams.add(words.join(" "));
    return ngrams;
  }

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(" "));
  }

  return ngrams;
}
