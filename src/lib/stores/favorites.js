import { writable } from 'svelte/store';
import { getFavorites, toggleFavorite as storageToggle, isFavorite as storageCheck } from '$lib/services/storage.js';

export const favoriteIds = writable(getFavorites());

export function toggleFavorite(id) {
  const isNow = storageToggle(id);
  favoriteIds.set(getFavorites());
  return isNow;
}

export function isFavorite(id) {
  return storageCheck(id);
}
