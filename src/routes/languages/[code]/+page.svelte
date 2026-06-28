<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fetchLanguage } from '$lib/services/data.js';
  import ChannelGrid from '$lib/components/ChannelGrid.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let language = $state(null);
  let channels = $state([]);
  let errMsg = $state(null);

  onMount(async () => {
    try {
      language = await fetchLanguage($page.params.code);
      channels = language.channels || [];
    } catch (e) {
      errMsg = `Language "${$page.params.code}" not found.`;
    }
    loading = false;
  });
</script>

<svelte:head>
  <title>{language?.name || 'Language'} — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading…" />
{:else if errMsg}
  <div class="not-found">
    <h2>Language not found</h2>
    <p>{errMsg}</p>
    <a href="/languages" class="back-link">All languages</a>
  </div>
{:else}
  <div class="page-header">
    <a href="/languages" class="back-nav">← Languages</a>
    <h1 class="page-title">{language.name}</h1>
    <p class="page-desc">{channels.length.toLocaleString()} channels</p>
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
