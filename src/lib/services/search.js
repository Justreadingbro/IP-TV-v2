let prefixIndex = null;

function buildPrefixIndex(index) {
  const pi = {};
  for (const term in index) {
    if (term.length < 2) continue;
    const key = term.substring(0, 2);
    if (!pi[key]) pi[key] = [];
    pi[key].push(term);
  }
  return pi;
}

function getIndexTermsByPrefix(prefix, pi) {
  if (!prefix || prefix.length < 2) return [];
  const key = prefix.substring(0, 2);
  const candidates = pi[key] || [];
  const result = [];
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].indexOf(prefix) === 0) {
      result.push(candidates[i]);
    }
  }
  return result;
}

export function searchChannels(index, query) {
  if (!query || query.length < 2) return null;
  if (!prefixIndex) prefixIndex = buildPrefixIndex(index);

  const q = query.toLowerCase().trim();
  const matches = {};

  const matchingTerms = getIndexTermsByPrefix(q, prefixIndex);
  for (let t = 0; t < matchingTerms.length; t++) {
    const term = matchingTerms[t];
    const ids = index[term];
    for (let k = 0; k < ids.length; k++) {
      if (!matches[ids[k]]) matches[ids[k]] = true;
    }
  }

  const keys = Object.keys(matches);
  if (keys.length > 0) return keys.map(Number);

  // Fuzzy fallback for longer queries
  if (q.length >= 3) {
    const firstChar = q.substring(0, 2);
    const candidates2 = (prefixIndex[firstChar] || []).slice(0, 100);
    const scored = [];
    for (let f = 0; f < candidates2.length; f++) {
      const tf = candidates2[f];
      let score = 0;
      const minLen = Math.min(tf.length, q.length);
      for (let c = 0; c < minLen; c++) {
        if (tf[c] === q[c]) score += 2;
        else break;
      }
      score -= Math.abs(tf.length - q.length);
      scored.push({ term: tf, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 5);
    const fuzzy = {};
    for (let s = 0; s < top.length; s++) {
      const fids = index[top[s].term];
      for (let k2 = 0; k2 < fids.length; k2++) {
        if (!fuzzy[fids[k2]]) fuzzy[fids[k2]] = true;
      }
    }
    const fkeys = Object.keys(fuzzy);
    if (fkeys.length > 0) return fkeys.map(Number);
  }

  return [];
}
