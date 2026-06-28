<script>
  import { meta } from '$lib/stores/channels.js';
</script>

<svelte:head>
  <title>Languages — IPTV LUX</title>
</svelte:head>

<div class="page-header">
  <h1 class="page-title">Languages</h1>
  <p class="page-desc">Browse channels by language</p>
</div>

{#if $meta}
  <div class="lang-grid">
    {#each $meta.languages as lang}
      <a href="/languages/{lang.code}" class="lang-card">
        <span class="lang-name">{lang.name}</span>
        <span class="lang-count">{lang.count.toLocaleString()} channels</span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .lang-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--gap)}
  .lang-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:var(--gap);display:flex;flex-direction:column;gap:4px;transition:border-color .15s}
  .lang-card:hover{border-color:var(--accent)}
  .lang-name{font-size:15px;font-weight:500}
  .lang-count{font-size:12px;color:var(--muted);font-family:var(--font-mono)}
  @media(max-width:480px){.lang-grid{grid-template-columns:repeat(2,1fr)}}
</style>
