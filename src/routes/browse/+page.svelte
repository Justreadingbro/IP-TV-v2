<script>
  import { onMount } from 'svelte';
  import { channels, loadChannels } from '$lib/stores/channels.js';
  import { filteredIndices } from '$lib/stores/filters.js';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);

  onMount(async () => {
    await loadChannels();
    loading = false;
  });
</script>

<svelte:head>
  <title>Browse channels — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading channels…" />
{:else}
  <div class="browse-header">
    <h1 class="browse-title">Browse</h1>
    <span class="browse-count">{$filteredIndices.length.toLocaleString()} channels</span>
  </div>
  <FilterBar />
  <ChannelGrid indices={$filteredIndices} channels={$channels} pageSize={40} />
{/if}

<style>
  .browse-header{display:flex;align-items:baseline;gap:var(--gap);margin-bottom:var(--gap)}
  .browse-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .browse-count{font-family:var(--font-mono);font-size:13px;color:var(--muted)}
</style>
