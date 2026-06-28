const DATA_BASE = '/generated';

export async function fetchMeta() {
  const res = await fetch(`${DATA_BASE}/meta.json`);
  if (!res.ok) throw new Error(`Failed to load metadata: HTTP ${res.status}`);
  return res.json();
}

export async function fetchChannels() {
  const res = await fetch(`${DATA_BASE}/channels.json`);
  if (!res.ok) throw new Error(`Failed to load channels: HTTP ${res.status}`);
  return res.json();
}

export async function fetchIndex() {
  const res = await fetch(`${DATA_BASE}/index.json`);
  if (!res.ok) throw new Error(`Failed to load search index: HTTP ${res.status}`);
  return res.json();
}

export function getChannelById(channels, id) {
  for (let i = 0; i < channels.length; i++) {
    if (channels[i].i === id) return { channel: channels[i], index: i };
  }
  return null;
}

export function getChannelsByCategory(channels, categoryId) {
  const result = [];
  for (let i = 0; i < channels.length; i++) {
    const ch = channels[i];
    if (ch.ct && ch.ct.indexOf(categoryId) !== -1) result.push(i);
  }
  return result;
}

export function getChannelsByCountry(channels, countryCode) {
  const result = [];
  for (let i = 0; i < channels.length; i++) {
    if (channels[i].cy === countryCode) result.push(i);
  }
  return result;
}

export function getChannelsByLanguage(channels, langCode) {
  const result = [];
  for (let i = 0; i < channels.length; i++) {
    const ch = channels[i];
    if (!ch.f) continue;
    for (const feed of ch.f) {
      if (feed.lg && feed.lg.indexOf(langCode) !== -1) {
        result.push(i);
        break;
      }
    }
  }
  return result;
}
