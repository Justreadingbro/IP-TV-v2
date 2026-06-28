<script>
  import { onMount } from 'svelte';
  import { meta, channels, loadChannels } from '$lib/stores/channels.js';
  import ChannelCard from '$lib/components/ChannelCard.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let recentChannels = $state([]);

  onMount(async () => {
    await loadChannels();
    // Show top channels by taking first 12
    recentChannels = $channels.slice(0, 12).map((_, i) => i);
    loading = false;
  });
</script>

<svelte:head>
  <title>IPTV LUX — premium channel browser</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading channels…" />
{:else}
  <section class="hero">
    <h1 class="hero-title">IPTV <span>LUX</span></h1>
    <p class="hero-desc">Browse {($meta?.total || 0).toLocaleString()} channels from {($meta?.countries.length || 0)} countries.</p>
    <div class="hero-actions">
      <a href="/browse" class="btn-primary">Browse channels</a>
      <a href="/categories" class="btn-secondary">Explore categories</a>
    </div>
  </section>

  <section class="stats-bar">
    {#if $meta}
      {#each [
        { label: 'Channels', value: $meta.total.toLocaleString(), icon: '▤' },
        { label: 'Countries', value: $meta.countries.length.toLocaleString(), icon: '⊕' },
        { label: 'Categories', value: $meta.categories.length.toLocaleString(), icon: '⊞' },
        { label: 'Languages', value: $meta.languages.length.toLocaleString(), icon: '≡' }
      ] as stat}
        <div class="stat-card">
          <span class="stat-icon">{stat.icon}</span>
          <span class="stat-value">{stat.value}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      {/each}
    {/if}
  </section>

  <section>
    <div class="section-header">
      <h2 class="section-title">Featured channels</h2>
      <a href="/browse" class="section-link">View all →</a>
    </div>
    <div class="home-grid">
      {#each recentChannels as idx (idx)}
        <ChannelCard channel={$channels[idx]} {idx} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .hero{text-align:center;padding:60px 20px 40px}
  .hero-title{font-family:var(--font-display);font-size:clamp(36px,6vw,64px);font-weight:700;letter-spacing:-.02em;line-height:1.1}
  .hero-title span{color:var(--accent)}
  .hero-desc{color:var(--muted);font-size:16px;margin:12px 0 28px;max-width:500px;margin-left:auto;margin-right:auto}
  .hero-actions{display:flex;gap:var(--gap);justify-content:center;flex-wrap:wrap}
  .btn-primary,.btn-secondary{padding:10px 24px;border-radius:var(--radius);font-size:14px;font-weight:500;transition:opacity .15s}
  .btn-primary{background:var(--accent);color:#fff}
  .btn-primary:hover{opacity:.85}
  .btn-secondary{background:var(--surface);border:1px solid var(--border);color:var(--fg2)}
  .btn-secondary:hover{border-color:var(--muted)}
  .stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--gap);max-width:800px;margin:0 auto var(--gap-xl);padding:0 var(--gap)}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;text-align:center}
  .stat-icon{display:block;font-size:20px;color:var(--muted);margin-bottom:4px;opacity:.5}
  .stat-value{display:block;font-family:var(--font-display);font-size:22px;font-weight:600}
  .stat-label{font-size:12px;color:var(--muted);margin-top:2px}
  .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--gap)}
  .section-title{font-family:var(--font-display);font-size:20px;font-weight:600}
  .section-link{font-size:13px;color:var(--accent);transition:opacity .12s}
  .section-link:hover{opacity:.75}
  .home-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--gap)}
  @media(max-width:640px){.hero{padding:40px 16px 24px}.stats-bar{grid-template-columns:repeat(2,1fr)}.home-grid{grid-template-columns:repeat(2,1fr);gap:8px}}
  @media(max-width:480px){.hero-title{font-size:28px}}
</style>
