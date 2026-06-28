import { writable, derived } from 'svelte/store';

export const activeFilters = writable({
  country: null,
  category: null,
  language: null,
  nsfw: 0,
});

export const searchQuery = writable('');

export function filterListing(listing, filters) {
  if (!listing || listing.length === 0) return [];
  const result = [];
  for (let i = 0; i < listing.length; i++) {
    const ch = listing[i];
    if (filters.country && ch.cy !== filters.country) continue;
    if (filters.category && (!ch.ct || ch.ct.indexOf(filters.category) === -1)) continue;
    if (filters.language && (!ch.lg || ch.lg.indexOf(filters.language) === -1)) continue;
    result.push(i);
  }
  return result;
}

export function resetFilters() {
  activeFilters.set({ country: null, category: null, language: null, nsfw: 0 });
  searchQuery.set('');
}
