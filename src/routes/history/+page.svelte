<script>
  import { onMount } from 'svelte';
  import { channels, loadChannels } from '$lib/stores/channels.js';
  import { getHistory, clearHistory } from '$lib/services/storage.js';
  import ChannelCard from '$lib/components/ChannelCard.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let historyIds = $state([]);

  onMount(async () => {
    await loadChannels();
    historyIds = getHistory();
    loading = false;
  });

  function clear() {
    clearHistory();
    historyIds = [];
  }
</script>

<svelte:head>
  <title>History — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading…" />
{:else}
  <div class="page-header">
    <h1 class="page-title">History</h1>
    <p class="page-desc">Recently viewed channels</p>
    {#if historyIds.length > 0}
      <button class="clear-btn" onclick={clear}>Clear history</button>
    {/if}
  </div>

  {#if historyIds.length === 0}
    <div class="empty-state">
      <div class="empty-icon">◷</div>
      <h3>No history yet</h3>
      <p>Channels you view will appear here.</p>
      <a href="/browse" class="browse-link">Browse channels</a>
    </div>
  {:else}
    <div class="history-grid">
      {#each historyIds as hid}
        {@const found = $channels.findIndex(c => c.i === hid)}
        {#if found !== -1}
          <ChannelCard channel={$channels[found]} index={found} />
        {/if}
      {/each}
    </div>
  {/if}
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg);position:relative}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .clear-btn{position:absolute;top:0;right:0;font-size:12px;color:var(--muted);padding:6px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);transition:all .12s}
  .clear-btn:hover{color:var(--red);border-color:var(--red)}
  .empty-state{text-align:center;padding:80px 20px;color:var(--muted)}
  .empty-icon{font-size:48px;margin-bottom:12px;opacity:.3}
  .empty-state h3{font-family:var(--font-display);color:var(--fg2);margin:0 0 6px}
  .empty-state p{font-size:14px;margin:0 0 var(--gap)}
  .browse-link{display:inline-block;padding:10px 24px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px;font-weight:500;transition:opacity .12s}
  .browse-link:hover{opacity:.85}
  .history-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--gap)}
  @media(max-width:640px){.history-grid{grid-template-columns:repeat(2,1fr);gap:8px}}
</style>
