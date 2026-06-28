<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { channels, index, loadChannels, loadIndex } from '$lib/stores/channels.js';
  import { searchQuery, filteredIndices } from '$lib/stores/filters.js';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let searchLoaded = $state(false);

  onMount(async () => {
    await Promise.all([loadChannels(), loadIndex()]);
    searchLoaded = true;
    loading = false;
  });

  function doSearch(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const q = data.get('q')?.trim() || '';
    searchQuery.set(q);
    if (q.length >= 2 || q.length === 0) {
      history.replaceState(null, '', q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    }
  }
</script>

<svelte:head>
  <title>Search — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading search…" />
{:else}
  <div class="search-page">
    <form class="search-form" onsubmit={doSearch} role="search">
      <div class="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="search-icon"><circle cx="10" cy="10" r="7"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
        <input
          type="search"
          name="q"
          value={$page.url.searchParams.get('q') || ''}
          placeholder="Search channels, countries, categories…"
          autocomplete="off"
          aria-label="Search"
          oninput={(e) => {
            const v = e.target.value;
            searchQuery.set(v);
            if (v.length >= 2 || v.length === 0) {
              history.replaceState(null, '', v ? `/search?q=${encodeURIComponent(v)}` : '/search');
            }
          }}
        />
      </div>
    </form>

    {#if $filteredIndices.length > 0}
      <div class="results-header">
        <h2>{$filteredIndices.length.toLocaleString()} result{$filteredIndices.length !== 1 ? 's' : ''}</h2>
      </div>
      <ChannelGrid indices={$filteredIndices} channels={$channels} pageSize={40} />
    {:else if searchLoaded && $page.url.searchParams.get('q')}
      <div class="no-results">
        <div class="no-results-icon">◬</div>
        <h3>No results found</h3>
        <p>Try a different search term.</p>
      </div>
    {:else}
      <div class="search-hint">
        <h3>Search across {$channels.length.toLocaleString()} channels</h3>
        <p>Type at least 2 characters to search by name, country, category, or language.</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .search-page{max-width:1200px;margin:0 auto}
  .search-form{margin-bottom:var(--gap-lg)}
  .search-bar{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:12px 16px;transition:border-color .15s}
  .search-bar:focus-within{border-color:var(--accent)}
  .search-icon{color:var(--muted);flex-shrink:0;opacity:.6}
  .search-bar input{flex:1;font-size:16px;background:transparent;color:var(--fg);min-width:0}
  .search-bar input::placeholder{color:var(--muted)}
  .results-header{margin-bottom:var(--gap)}
  .results-header h2{font-family:var(--font-display);font-size:18px;font-weight:600}
  .no-results{text-align:center;padding:60px 20px;color:var(--muted)}
  .no-results-icon{font-size:40px;margin-bottom:12px;opacity:.4}
  .no-results h3{font-family:var(--font-display);color:var(--fg2);margin:0 0 6px}
  .no-results p{font-size:14px;margin:0}
  .search-hint{text-align:center;padding:60px 20px;color:var(--muted)}
  .search-hint h3{font-family:var(--font-display);color:var(--fg2);margin-bottom:8px}
  .search-hint p{font-size:14px;max-width:400px;margin:0 auto}
</style>
