<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fetchCategory } from '$lib/services/data.js';
  import { meta } from '$lib/stores/channels.js';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let cat = $state(null);
  let channels = $state([]);
  let errMsg = $state(null);

  onMount(async () => {
    try {
      cat = await fetchCategory($page.params.id);
      channels = cat.channels || [];
    } catch (e) {
      errMsg = `Category "${$page.params.id}" not found.`;
    }
    loading = false;
  });
</script>

<svelte:head>
  <title>{cat?.name || 'Category'} — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading category…" />
{:else if errMsg}
  <div class="not-found">
    <h2>Category not found</h2>
    <p>{errMsg}</p>
    <a href="/categories" class="back-link">All categories</a>
  </div>
{:else}
  <div class="page-header">
    <a href="/categories" class="back-nav">← Categories</a>
    <h1 class="page-title">{cat.name}</h1>
    <p class="page-desc">{cat.description || ''} {channels.length.toLocaleString()} channels</p>
  </div>
  <ChannelGrid items={channels} pageSize={40} />
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .back-nav{font-size:13px;color:var(--muted);margin-bottom:6px;display:inline-block}
  .back-nav:hover{color:var(--accent)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .not-found{text-align:center;padding:80px 20px}
  .not-found h2{font-family:var(--font-display);font-size:22px;margin-bottom:6px}
  .not-found p{color:var(--muted);margin-bottom:var(--gap-lg)}
  .back-link{display:inline-block;padding:10px 24px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px}
</style>
