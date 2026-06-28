<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fetchSearchIndex } from '$lib/services/data.js';
  import { searchQuery } from '$lib/stores/filters.js';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let fuse = $state(null);
  let searchData = $state([]);
  let results = $state([]);
  let query = $state('');

  async function doSearch(q) {
    if (!q || q.length < 2) { results = []; return; }
    if (!fuse) return;
    const r = fuse.search(q);
    results = r.slice(0, 200).map(x => x.item);
  }

  $effect(() => {
    const q = $page.url.searchParams.get('q') || '';
    query = q;
    if (q) searchQuery.set(q);
    if (fuse) doSearch(q);
  });

  onMount(async () => {
    const idx = await fetchSearchIndex();
    searchData = idx;
    const Fuse = (await import('fuse.js')).default;
    fuse = new Fuse(idx, {
      keys: ['n', 'a', 'cy', 'cn', 'ctn', 'ct'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    });
    const q = $page.url.searchParams.get('q') || '';
    if (q) doSearch(q);
    loading = false;
  });

  function onQueryChange(e) {
    const v = e.target.value;
    query = v;
    goto(`/search?q=${encodeURIComponent(v)}`, { replaceState: true });
  }
</script>

<svelte:head>
  <title>Search — IPTV LUX</title>
</svelte:head>

<div class="search-header">
  <h1 class="search-title">Search</h1>
  <div class="search-input-wrap">
    <input
      type="search"
      value={query}
      oninput={onQueryChange}
      placeholder="Search channels, countries, categories…"
      autocomplete="off"
      class="search-input"
    />
  </div>
</div>

{#if loading}
  <LoadingSpinner message="Loading search…" />
{:else if results.length > 0}
  <p class="result-count">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
  <ChannelGrid items={results} pageSize={20} />
{:else if query && query.length >= 2}
  <div class="empty-state">
    <h3>No results for "{query}"</h3>
    <p>Try a different search term.</p>
  </div>
{:else}
  <div class="empty-state hint">
    <h3>Search {searchData.length.toLocaleString()} channels</h3>
    <p>Type at least 2 characters to search by name, country, or category.</p>
  </div>
{/if}

<style>
  .search-header{margin-bottom:var(--gap-lg)}
  .search-title{font-family:var(--font-display);font-size:28px;font-weight:600;margin-bottom:var(--gap)}
  .search-input-wrap{max-width:600px}
  .search-input{width:100%;padding:10px 16px;font-size:15px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg);transition:border-color .15s}
  .search-input:focus{border-color:var(--accent);outline:none}
  .search-input::placeholder{color:var(--muted)}
  .result-count{font-size:13px;color:var(--muted);font-family:var(--font-mono);margin-bottom:var(--gap)}
  .empty-state{text-align:center;padding:60px 20px;color:var(--muted)}
  .empty-state.hint{padding-top:40px}
  .empty-state h3{font-family:var(--font-display);color:var(--fg2);margin:0 0 6px}
  .empty-state p{font-size:14px;margin:0}
</style>
