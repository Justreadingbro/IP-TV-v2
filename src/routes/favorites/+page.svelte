<script>
  import { onMount } from 'svelte';
  import { favoriteIds } from '$lib/stores/favorites.js';
  import { fetchChannel } from '$lib/services/data.js';
  import ChannelCard from '$lib/components/ChannelCard.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let favChannels = $state([]);

  onMount(async () => {
    const ids = $favoriteIds;
    const results = [];
    for (const id of ids) {
      try {
        const ch = await fetchChannel(id);
        results.push(ch);
      } catch {}
    }
    favChannels = results;
    loading = false;
  });
</script>

<svelte:head>
  <title>Favorites — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading…" />
{:else}
  <div class="page-header">
    <h1 class="page-title">Favorites</h1>
    <p class="page-desc">Your saved channels</p>
  </div>

  {#if $favoriteIds.length === 0}
    <div class="empty-state">
      <div class="empty-icon">♡</div>
      <h3>No favorites yet</h3>
      <p>Click the heart icon on any channel to save it here.</p>
      <a href="/browse" class="browse-link">Browse channels</a>
    </div>
  {:else}
    <div class="fav-grid">
      {#each favChannels as item (item.i)}
        <ChannelCard {channel}={item} />
      {/each}
    </div>
  {/if}
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .empty-state{text-align:center;padding:80px 20px;color:var(--muted)}
  .empty-icon{font-size:48px;margin-bottom:12px;opacity:.3}
  .empty-state h3{font-family:var(--font-display);color:var(--fg2);margin:0 0 6px}
  .empty-state p{font-size:14px;margin:0 0 var(--gap)}
  .browse-link{display:inline-block;padding:10px 24px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px;font-weight:500;transition:opacity .12s}
  .browse-link:hover{opacity:.85}
  .fav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--gap)}
  @media(max-width:640px){.fav-grid{grid-template-columns:repeat(2,1fr);gap:8px}}
</style>
