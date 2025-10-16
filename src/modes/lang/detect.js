export function detectLang({ ext }) {
  const isLikely = /\.(js|mjs|cjs|ts)$/.test(ext);
  return { 
    id: 'lang', 
    confidence: isLikely ? 0.4 : 0.2, 
    reasons: isLikely ? ['ext'] : [] 
  };
}
