const FAVORITES_KEY = 'iptv-lux-favorites';
const HISTORY_KEY = 'iptv-lux-history';
const SETTINGS_KEY = 'iptv-lux-settings';
const MAX_HISTORY = 100;

export function getFavorites() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function setFavorites(ids) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); } catch {}
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
  } else {
    favs.splice(idx, 1);
  }
  setFavorites(favs);
  return favs.indexOf(id) !== -1;
}

export function isFavorite(id) {
  return getFavorites().indexOf(id) !== -1;
}

export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function addToHistory(id) {
  let history = getHistory();
  const idx = history.indexOf(id);
  if (idx !== -1) history.splice(idx, 1);
  history.unshift(id);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
}

export function clearHistory() {
  try { localStorage.setItem(HISTORY_KEY, '[]'); } catch {}
}

export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : defaultSettings();
  } catch { return defaultSettings(); }
}

export function setSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

function defaultSettings() {
  return {
    language: 'all',
    theme: 'dark',
    autoPlay: false,
    reducedMotion: false,
    pageSize: 40
  };
}
