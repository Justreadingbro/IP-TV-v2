import { writable, derived } from 'svelte/store';
import { meta, channels, index } from './channels.js';
import { searchChannels } from '$lib/services/search.js';

export const activeFilters = writable({
  country: null,
  category: null,
  language: null,
  nsfw: 0
});

export const searchQuery = writable('');

export const visibleCount = writable(0);
export const pageSize = writable(40);

export const filteredIndices = derived(
  [activeFilters, searchQuery, channels, index],
  ([$filters, $query, $channels, $index]) => {
    if (!$channels || $channels.length === 0) return [];

    let ids = null;

    if ($query && $query.length >= 2 && $index) {
      ids = searchChannels($index, $query);
      if (ids && ids.length === 0) return [];
      const idSet = {};
      if (ids) for (const id of ids) idSet[id] = true;
      ids = idSet;
    }

    const result = [];
    for (let i = 0; i < $channels.length; i++) {
      if (ids && !ids[i]) continue;
      const ch = $channels[i];
      if ($filters.country && ch.cy !== $filters.country) continue;
      if ($filters.category && (!ch.ct || ch.ct.indexOf($filters.category) === -1)) continue;
      if ($filters.language) {
        let hasLang = false;
        if (ch.f) {
          for (const feed of ch.f) {
            if (feed.lg && feed.lg.indexOf($filters.language) !== -1) { hasLang = true; break; }
          }
        }
        if (!hasLang) continue;
      }
      if ($filters.nsfw === 1 && !ch.ns) continue;
      if ($filters.nsfw === 2 && ch.ns) continue;
      result.push(i);
    }
    return result;
  }
);

export function resetFilters() {
  activeFilters.set({ country: null, category: null, language: null, nsfw: 0 });
  searchQuery.set('');
}
