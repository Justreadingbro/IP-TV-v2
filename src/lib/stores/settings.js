import { writable } from 'svelte/store';
import { getSettings, setSettings } from '$lib/services/storage.js';

const initial = getSettings();
export const settings = writable(initial);

export function updateSetting(key, value) {
  settings.update(s => {
    const next = { ...s, [key]: value };
    setSettings(next);
    return next;
  });
}
