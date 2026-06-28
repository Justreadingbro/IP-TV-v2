const BASE = '/generated';

export async function fetchMeta() {
  const res = await fetch(`${BASE}/meta.json`);
  if (!res.ok) throw new Error(`Failed to load metadata: HTTP ${res.status}`);
  return res.json();
}

export async function fetchFeatured() {
  const res = await fetch(`${BASE}/featured.json`);
  if (!res.ok) throw new Error(`Failed to load featured: HTTP ${res.status}`);
  return res.json();
}

export async function fetchPopular() {
  const res = await fetch(`${BASE}/popular.json`);
  if (!res.ok) throw new Error(`Failed to load popular: HTTP ${res.status}`);
  return res.json();
}

export async function fetchListing() {
  const res = await fetch(`${BASE}/listing.json`);
  if (!res.ok) throw new Error(`Failed to load listing: HTTP ${res.status}`);
  return res.json();
}

export async function fetchSearchIndex() {
  const res = await fetch(`${BASE}/search/index.json`);
  if (!res.ok) throw new Error(`Failed to load search index: HTTP ${res.status}`);
  return res.json();
}

export async function fetchChannel(id) {
  const sanitized = id.replace(/[^a-zA-Z0-9._-]/g, '_');
  const res = await fetch(`${BASE}/channel/${encodeURIComponent(sanitized)}.json`);
  if (!res.ok) throw new Error(`Failed to load channel ${id}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchCategory(id) {
  const sanitized = id.replace(/[^a-zA-Z0-9._-]/g, '_');
  const res = await fetch(`${BASE}/categories/${encodeURIComponent(sanitized)}.json`);
  if (!res.ok) throw new Error(`Failed to load category ${id}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchCountry(code) {
  const res = await fetch(`${BASE}/countries/${encodeURIComponent(code)}.json`);
  if (!res.ok) throw new Error(`Failed to load country ${code}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchLanguage(code) {
  const res = await fetch(`${BASE}/languages/${encodeURIComponent(code)}.json`);
  if (!res.ok) throw new Error(`Failed to load language ${code}: HTTP ${res.status}`);
  return res.json();
}
