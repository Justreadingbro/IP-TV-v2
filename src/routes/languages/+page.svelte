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
    {#each $meta.languages as l}
      <a href="/languages/{l.code}" class="lang-card">
        <div class="lang-code">{l.code.toUpperCase()}</div>
        <div class="lang-info">
          <span class="lang-name">{l.name}</span>
          <span class="lang-count">{l.count.toLocaleString()} channels</span>
        </div>
        <span class="lang-arrow">→</span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .lang-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--gap)}
  .lang-card{display:flex;align-items:center;gap:var(--gap);padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);transition:border-color .15s,transform .15s}
  .lang-card:hover{border-color:var(--accent-soft);transform:translateY(-1px)}
  .lang-code{width:44px;height:44px;border-radius:var(--radius);background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:600;flex-shrink:0}
  .lang-info{flex:1;min-width:0}
  .lang-name{display:block;font-size:14px;font-weight:600}
  .lang-count{display:block;font-size:12px;color:var(--muted);margin-top:2px}
  .lang-arrow{color:var(--muted);font-size:16px;transition:transform .15s}
  .lang-card:hover .lang-arrow{transform:translateX(3px)}
  @media(max-width:640px){.lang-grid{grid-template-columns:1fr}}
</style>
