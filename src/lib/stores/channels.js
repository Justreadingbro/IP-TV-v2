import { writable } from 'svelte/store';
import { fetchMeta } from '$lib/services/data.js';

export const meta = writable(null);
export const loading = writable(true);
export const error = writable(null);

export async function loadMeta() {
  try {
    const m = await fetchMeta();
    meta.set(m);
    loading.set(false);
    return m;
  } catch (e) {
    error.set(e.message);
    loading.set(false);
    throw e;
  }
}
