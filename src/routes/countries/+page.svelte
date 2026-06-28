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
        <span class="country-flag">{c.flag || '◉'}</span>
        <div class="country-info">
          <span class="country-name">{c.name}</span>
          <span class="country-count">{c.count.toLocaleString()} channels</span>
        </div>
        <span class="country-arrow">→</span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .country-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--gap)}
  .country-card{display:flex;align-items:center;gap:var(--gap);padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);transition:border-color .15s,transform .15s}
  .country-card:hover{border-color:var(--accent-soft);transform:translateY(-1px)}
  .country-flag{font-size:28px;line-height:1;flex-shrink:0;width:36px;text-align:center}
  .country-info{flex:1;min-width:0}
  .country-name{display:block;font-size:14px;font-weight:600}
  .country-count{display:block;font-size:12px;color:var(--muted);margin-top:2px}
  .country-arrow{color:var(--muted);font-size:16px;transition:transform .15s}
  .country-card:hover .country-arrow{transform:translateX(3px)}
  @media(max-width:640px){.country-grid{grid-template-columns:1fr}}
</style>
