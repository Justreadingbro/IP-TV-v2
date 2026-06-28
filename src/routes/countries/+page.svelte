<script>
  import { meta } from '$lib/stores/channels.js';
</script>

<svelte:head>
  <title>Countries — IPTV LUX</title>
</svelte:head>

<div class="page-header">
  <h1 class="page-title">Countries</h1>
  <p class="page-desc">Browse channels by country</p>
</div>

{#if $meta}
  <div class="country-grid">
    {#each $meta.countries as c}
      <a href="/countries/{c.code}" class="country-card">
        <span class="country-flag">{c.flag || ''}</span>
        <span class="country-name">{c.name}</span>
        <span class="country-count">{c.count.toLocaleString()}</span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .country-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--gap)}
  .country-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:var(--gap);display:flex;align-items:center;gap:var(--gap);transition:border-color .15s}
  .country-card:hover{border-color:var(--accent)}
  .country-flag{font-size:24px;line-height:1;flex-shrink:0}
  .country-name{font-size:14px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .country-count{font-size:12px;color:var(--muted);font-family:var(--font-mono);flex-shrink:0}
  @media(max-width:480px){.country-grid{grid-template-columns:repeat(2,1fr)}}
</style>
