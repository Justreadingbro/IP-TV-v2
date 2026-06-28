import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { get as httpsGet } from 'https';
import { get as httpGet } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const OUT = join(ROOT, 'generated');
const STREAMS_URL = 'https://iptv-org.github.io/api/streams.json';
const M3U_PLAYLISTS = [
  'https://iptv-org.github.io/iptv/index.m3u',
  'https://iptv-org.github.io/iptv/index.category.m3u',
  'https://iptv-org.github.io/iptv/index.language.m3u',
  'https://iptv-org.github.io/iptv/index.country.m3u',
];

function csvParse(text) {
  const rows = [];
  let i = 0, row = [], field = '', inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') { field += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else { field += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ',') { row.push(field.trim()); field = ''; i++; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++;
        row.push(field.trim()); field = '';
        if (row.length > 0 && row.some(f => f.length > 0)) rows.push(row);
        row = []; i++;
      } else if (ch === '\r') {
        row.push(field.trim()); field = '';
        if (row.length > 0 && row.some(f => f.length > 0)) rows.push(row);
        row = []; i++;
      } else { field += ch; i++; }
    }
  }
  if (field || row.length > 0) {
    row.push(field.trim());
    if (row.length > 0 && row.some(f => f.length > 0)) rows.push(row);
  }
  return rows;
}

function loadCSV(file) {
  const text = readFileSync(join(DATA, file), 'utf-8');
  const rows = csvParse(text);
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (r[i] || '').trim(); });
    return obj;
  });
}

function splitSemi(s) {
  if (!s || s.trim() === '') return [];
  return s.split(';').map(x => x.trim()).filter(Boolean);
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? httpsGet : httpGet;
    lib(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`)); return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseM3U(text) {
  const lines = text.split('\n');
  const entries = [];
  let currentTvgId = null, currentName = '', currentUA = '', currentRef = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#EXTVLCOPT:')) {
      const val = line.slice('#EXTVLCOPT:'.length);
      if (val.startsWith('http-user-agent=')) currentUA = val.slice('http-user-agent='.length);
      if (val.startsWith('http-referrer=')) currentRef = val.slice('http-referrer='.length);
      continue;
    }
    if (line.startsWith('#EXTINF:')) {
      currentUA = ''; currentRef = '';
      const tvgMatch = line.match(/tvg-id="([^"]*)"/);
      currentTvgId = tvgMatch ? tvgMatch[1] : null;
      const commaIdx = line.lastIndexOf(',');
      currentName = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : '';
      continue;
    }
    if (line.startsWith('#')) continue;
    if (currentTvgId || currentName) {
      entries.push({
        tvgId: currentTvgId ? currentTvgId.split('@')[0] : null,
        fullTvgId: currentTvgId || null,
        name: currentName,
        url: line,
        ua: currentUA || null,
        ref: currentRef || null,
      });
    }
    currentTvgId = null; currentName = ''; currentUA = ''; currentRef = '';
  }
  return entries;
}

// === LOAD DATA ===
const channels = loadCSV('channels.csv');
const feeds = loadCSV('feeds.csv');
const logos = loadCSV('logos.csv');
const countries = loadCSV('countries.csv');
const categories = loadCSV('categories.csv');
const languages = loadCSV('languages.csv');
const regions = loadCSV('regions.csv');
const subdivisions = loadCSV('subdivisions.csv');
const blocklist = loadCSV('blocklist.csv');

console.log(`Loaded ${channels.length} channels, ${feeds.length} feeds, ${logos.length} logos`);
console.log(`Loaded ${countries.length} countries, ${categories.length} categories, ${languages.length} languages`);

// === BUILD LOOKUP MAPS ===
const countryMap = {};
for (const c of countries) {
  countryMap[c.code] = { code: c.code, name: c.name, flag: c.flag, languages: splitSemi(c.languages) };
}
const categoryMap = {};
for (const c of categories) {
  categoryMap[c.id] = { id: c.id, name: c.name, description: c.description };
}
const languageMap = {};
for (const l of languages) {
  languageMap[l.code] = { code: l.code, name: l.name };
}
const blockedSet = new Set();
const blockedReasons = {};
for (const b of blocklist) {
  blockedSet.add(b.channel);
  blockedReasons[b.channel] = { reason: b.reason, ref: b.ref };
}

// === BUILD CHANNEL NAME LOOKUP (for M3U matching) ===
const channelByName = {};
for (const ch of channels) {
  const normalized = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized.length > 0) channelByName[normalized] = ch.id;
  for (const alias of splitSemi(ch.alt_names)) {
    const an = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (an.length > 0 && !channelByName[an]) channelByName[an] = ch.id;
  }
}

// === FETCH STREAMS FROM iptv-org API ===
console.log('Fetching stream URLs from iptv-org API...');
let streamMap = {};
try {
  const res = await fetch(STREAMS_URL);
  if (res.ok) {
    const streamData = await res.json();
    for (const s of streamData) {
      if (!s.channel) continue;
      const key = `${s.channel}::${s.feed || ''}`;
      if (!streamMap[key]) streamMap[key] = [];
      streamMap[key].push({
        url: s.url, ua: s.user_agent || null, ref: s.referrer || null,
        q: s.quality || null, label: s.label || null, title: s.title || null,
      });
    }
    console.log(`Loaded ${streamData.length} stream entries from API`);
  } else {
    console.warn(`Failed to fetch streams.json: HTTP ${res.status}`);
  }
} catch (e) {
  console.warn(`Could not fetch streams.json: ${e.message}`);
}

// === FETCH & PARSE ALL M3U PLAYLISTS ===
console.log('Fetching and parsing M3U playlists...');
const allM3UEntries = [];
for (const playlistUrl of M3U_PLAYLISTS) {
  console.log(`  Downloading ${playlistUrl}...`);
  try {
    const text = await fetchText(playlistUrl);
    const entries = parseM3U(text);
    allM3UEntries.push(...entries);
    console.log(`  Parsed ${entries.length} entries`);
  } catch (e) {
    console.warn(`  Failed: ${e.message}`);
  }
}
console.log(`Total M3U entries: ${allM3UEntries.length}`);

const seenUrls = new Set();
const uniqueM3U = [];
for (const e of allM3UEntries) {
  if (!seenUrls.has(e.url)) {
    seenUrls.add(e.url);
    uniqueM3U.push(e);
  }
}
console.log(`Unique M3U entries after dedup: ${uniqueM3U.length}`);

const m3uByTvgId = {};
const m3uByName = {};
for (const e of uniqueM3U) {
  if (e.tvgId) {
    if (!m3uByTvgId[e.tvgId]) m3uByTvgId[e.tvgId] = [];
    m3uByTvgId[e.tvgId].push(e);
  }
  if (e.name) {
    const normalized = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.length > 0) {
      if (!m3uByName[normalized]) m3uByName[normalized] = [];
      m3uByName[normalized].push(e);
    }
  }
}
console.log(`M3U index: ${Object.keys(m3uByTvgId).length} tvgIds, ${Object.keys(m3uByName).length} names`);

// === GROUP FEEDS BY CHANNEL ===
const feedMap = {};
for (const f of feeds) {
  const ch = f.channel;
  if (!feedMap[ch]) feedMap[ch] = [];
  const streamKey = `${ch}::${f.id}`;
  const streamEntries = streamMap[streamKey] || [];
  const bestStream = streamEntries.length > 0 ? streamEntries[0] : null;
  feedMap[ch].push({
    id: f.id, name: f.name, alt_names: splitSemi(f.alt_names),
    is_main: f.is_main === 'TRUE', broadcast_area: splitSemi(f.broadcast_area),
    timezones: splitSemi(f.timezones),
    languages: splitSemi(f.languages).map(lc => languageMap[lc] || { code: lc, name: lc }),
    format: f.format, url: bestStream ? bestStream.url : null,
    ua: bestStream ? bestStream.ua : null, ref: bestStream ? bestStream.ref : null,
    q: bestStream ? bestStream.q : null, label: bestStream ? bestStream.label : null,
  });
}

// === GROUP LOGOS BY CHANNEL ===
const logoMap = {};
for (const l of logos) {
  const ch = l.channel;
  if (!logoMap[ch]) logoMap[ch] = [];
  const w = parseInt(l.width) || 0;
  const h = parseInt(l.height) || 0;
  logoMap[ch].push({
    feed: l.feed || null, in_use: l.in_use === 'TRUE',
    tags: splitSemi(l.tags), width: w, height: h,
    format: l.format, url: l.url,
  });
}

function bestLogo(logos) {
  if (!logos || logos.length === 0) return null;
  const sorted = [...logos].sort((a, b) => {
    if (a.in_use !== b.in_use) return a.in_use ? -1 : 1;
    return (b.width || 0) - (a.width || 0);
  });
  const best = sorted[0];
  return { url: best.url, width: best.width, height: best.height, format: best.format };
}

// === ENRICH CHANNELS ===
console.log('Enriching channels...');
const enriched = [];
const termsIndex = {};

for (let i = 0; i < channels.length; i++) {
  const ch = channels[i];
  const id = ch.id;

  if (blockedSet.has(id) && blockedReasons[id].reason === 'dmca') continue;

  const countryCode = ch.country;
  const country = countryMap[countryCode] || null;
  const catNames = splitSemi(ch.categories).map(c => categoryMap[c] || { id: c, name: c });
  const chFeeds = feedMap[id] || [];
  const chLogo = bestLogo(logoMap[id]);
  const isNsfw = ch.is_nsfw === 'TRUE';
  const blockInfo = blockedSet.has(id) ? blockedReasons[id] : null;

  if (blockInfo && blockInfo.reason === 'nsfw') continue;

  const resolvedFeeds = chFeeds.map(f => {
    let feedUrl = f.url, feedUa = f.ua, feedRef = f.ref;

    if (!feedUrl) {
      const m3uMatches = m3uByTvgId[id];
      if (m3uMatches && m3uMatches.length > 0) {
        const qualSuffix = f.name ? '@' + f.name.replace(/[^a-zA-Z0-9]/g, '') : '';
        let found = null;
        for (const m of m3uMatches) {
          if (qualSuffix && m.fullTvgId && m.fullTvgId.endsWith(qualSuffix)) {
            found = m; break;
          }
        }
        if (!found) found = m3uMatches[0];
        if (found) { feedUrl = found.url; feedUa = found.ua; feedRef = found.ref; }
      }
    }

    if (!feedUrl) {
      const normalized = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameMatches = m3uByName[normalized];
      if (nameMatches && nameMatches.length > 0) {
        feedUrl = nameMatches[0].url;
        feedUa = nameMatches[0].ua;
        feedRef = nameMatches[0].ref;
      }
    }

    return {
      i: f.id, n: f.name, an: f.alt_names.length > 0 ? f.alt_names : undefined,
      m: f.is_main, ba: f.broadcast_area, tz: f.timezones,
      lg: f.languages.map(l => l.code), lgn: f.languages.map(l => l.name),
      fmt: f.format, u: feedUrl, ua: feedUa, rf: feedRef,
    };
  });

  const entry = {
    i: id, n: ch.name, a: splitSemi(ch.alt_names),
    w: ch.network || null, o: ch.owners || null,
    cy: countryCode, cn: country ? country.name : null, cf: country ? country.flag : null,
    ct: catNames.map(c => c.id), ctn: catNames.map(c => c.name),
    ns: isNsfw, la: ch.launched || null, cl: ch.closed || null,
    rb: ch.replaced_by || null, u: ch.website || null,
    f: resolvedFeeds, l: chLogo, bl: blockInfo ? blockInfo.reason : null,
  };

  enriched.push(entry);

  const searchable = [
    ch.name, id, ...splitSemi(ch.alt_names), ch.network,
    country ? country.name : '', country ? country.code : '',
    ...catNames.map(c => c.name), ...catNames.map(c => c.id),
  ].filter(Boolean).map(s => s.toLowerCase());

  const terms = new Set();
  for (const text of searchable) {
    if (text.length > 1) terms.add(text);
    for (const word of text.split(/[\s_\-./]+/)) {
      if (word.length > 1) {
        terms.add(word);
        for (let k = 2; k <= Math.min(word.length, 12); k++) {
          terms.add(word.substring(0, k));
        }
      }
    }
  }

  for (const term of terms) {
    if (!termsIndex[term]) termsIndex[term] = [];
    termsIndex[term].push(i);
  }
}

const channelsWithStreams = enriched.filter(e => e.f.some(f => f.u)).length;
console.log(`${channelsWithStreams}/${enriched.length} channels have at least one stream URL`);

// === BUILD SEARCH INDEX ===
console.log('Building search index...');
const index = {};
for (const [term, ids] of Object.entries(termsIndex)) {
  index[term] = [...new Set(ids)].sort((a, b) => a - b);
}

// === BUILD FILTER METADATA ===
const countryCounts = {};
const categoryCounts = {};
const languageCounts = {};
for (const ch of enriched) {
  if (ch.cy) countryCounts[ch.cy] = (countryCounts[ch.cy] || 0) + 1;
  for (const cat of ch.ct) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  for (const feed of ch.f) {
    for (const lang of feed.lg) {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    }
  }
}

const meta = {
  total: enriched.length, blocked: blockedSet.size,
  countries: Object.entries(countryCounts)
    .map(([code, count]) => ({ code, name: countryMap[code]?.name || code, flag: countryMap[code]?.flag || null, count }))
    .sort((a, b) => b.count - a.count),
  categories: Object.entries(categoryCounts)
    .map(([id, count]) => ({ id, name: categoryMap[id]?.name || id, description: categoryMap[id]?.description || null, count }))
    .sort((a, b) => b.count - a.count),
  languages: Object.entries(languageCounts)
    .map(([code, count]) => ({ code, name: languageMap[code]?.name || code, count }))
    .sort((a, b) => b.count - a.count),
};

// === WRITE OUTPUT ===
mkdirSync(OUT, { recursive: true });
mkdirSync(join(ROOT, 'static', 'generated'), { recursive: true });

console.log('Writing generated files...');
const channelsJson = JSON.stringify(enriched);
const indexJson = JSON.stringify(index);
const metaJson = JSON.stringify(meta);

writeFileSync(join(OUT, 'channels.json'), channelsJson);
writeFileSync(join(OUT, 'index.json'), indexJson);
writeFileSync(join(OUT, 'meta.json'), metaJson);
writeFileSync(join(ROOT, 'static', 'generated', 'channels.json'), channelsJson);
writeFileSync(join(ROOT, 'static', 'generated', 'index.json'), indexJson);
writeFileSync(join(ROOT, 'static', 'generated', 'meta.json'), metaJson);

const stats = {
  channels: enriched.length, feeds: feeds.length, logos: logos.length,
  countries: Object.keys(countryCounts).length,
  categories: Object.keys(categoryCounts).length,
  languages: Object.keys(languageCounts).length,
  blocklist: blocklist.length,
  channelsWithStreams,
  m3uPlaylists: M3U_PLAYLISTS.length,
  m3uUniqueEntries: uniqueM3U.length,
  m3uTvgIds: Object.keys(m3uByTvgId).length,
  indexTerms: Object.keys(index).length,
  indexEntries: Object.values(index).reduce((a, b) => a + b.length, 0),
};
writeFileSync(join(OUT, 'stats.json'), JSON.stringify(stats, null, 2));
writeFileSync(join(ROOT, 'static', 'generated', 'stats.json'), JSON.stringify(stats, null, 2));

const sizes = ['channels.json', 'index.json', 'meta.json', 'stats.json']
  .map(f => `${f}: ${(readFileSync(join(OUT, f)).length / 1024 / 1024).toFixed(2)} MB`);

console.log('Done!');
console.log(sizes.join('\n'));
console.log(`${channelsWithStreams} channels have resolved stream URLs (${(channelsWithStreams / enriched.length * 100).toFixed(1)}%)`);
