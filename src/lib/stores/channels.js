import { writable } from 'svelte/store';
import { fetchMeta, fetchChannels, fetchIndex } from '$lib/services/data.js';

export const meta = writable(null);
export const channels = writable([]);
export const index = writable(null);
export const loading = writable(true);
export const error = writable(null);

export async function loadMeta() {
  try {
    const m = await fetchMeta();
    meta.set(m);
    return m;
  } catch (e) {
    error.set(e.message);
    throw e;
  }
}

export async function loadChannels() {
  try {
    loading.set(true);
    const c = await fetchChannels();
    channels.set(c);
    loading.set(false);
    return c;
  } catch (e) {
    error.set(e.message);
    loading.set(false);
    throw e;
  }
}

export async function loadIndex() {
  try {
    const i = await fetchIndex();
    index.set(i);
    return i;
  } catch (e) {
    error.set(e.message);
    throw e;
  }
}
