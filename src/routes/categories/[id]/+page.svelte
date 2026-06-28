<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { meta, channels, loadChannels } from '$lib/stores/channels.js';
  import { filteredIndices, activeFilters } from '$lib/stores/filters.js';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);

  const catName = $derived.by(() => {
    const id = $page.params.id;
    if ($meta) {
      const c = $meta.categories.find(x => x.id === id);
      return c?.name || id;
    }
    return '';
  });

  onMount(() => {
    const id = $page.params.id;
    activeFilters.set({ country: null, category: id, language: null, nsfw: 0 });
    loadChannels().then(() => { loading = false; });
  });
</script>

<svelte:head>
  <title>{catName} — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading channels…" />
{:else}
  <div class="page-header">
    <a href="/categories" class="back-link">← Categories</a>
    <h1 class="page-title">{catName}</h1>
    <span class="page-count">{$filteredIndices.length.toLocaleString()} channels</span>
  </div>
  <ChannelGrid indices={$filteredIndices} channels={$channels} pageSize={40} />
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .back-link{display:inline-block;font-size:13px;color:var(--muted);margin-bottom:8px;transition:color .12s}
  .back-link:hover{color:var(--accent)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-count{font-family:var(--font-mono);font-size:13px;color:var(--muted);margin-top:4px;display:block}
</style>
