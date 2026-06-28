<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { meta, channels, loadChannels } from '$lib/stores/channels.js';
  import { filteredIndices, activeFilters } from '$lib/stores/filters.js';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let langName = $state('');

  $effect(() => {
    const code = $page.params.code;
    if ($meta) {
      const l = $meta.languages.find(x => x.code === code);
      langName = l?.name || code;
    }
  });

  onMount(async () => {
    const code = $page.params.code;
    activeFilters.set({ country: null, category: null, language: code, nsfw: 0 });
    await loadChannels();
    loading = false;
  });
</script>

<svelte:head>
  <title>{langName} channels — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading channels…" />
{:else}
  <div class="page-header">
    <a href="/languages" class="back-link">← Languages</a>
    <h1 class="page-title">{langName}</h1>
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
