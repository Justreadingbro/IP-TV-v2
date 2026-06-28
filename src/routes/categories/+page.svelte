<script>
  import { meta } from '$lib/stores/channels.js';
</script>

<svelte:head>
  <title>Categories — IPTV LUX</title>
</svelte:head>

<div class="page-header">
  <h1 class="page-title">Categories</h1>
  <p class="page-desc">Browse channels by category</p>
</div>

{#if $meta}
  <div class="cat-grid">
    {#each $meta.categories as cat}
      <a href="/categories/{cat.id}" class="cat-card">
        <div class="cat-icon">{cat.id.substring(0, 2).toUpperCase()}</div>
        <div class="cat-info">
          <span class="cat-name">{cat.name}</span>
          <span class="cat-count">{cat.count.toLocaleString()} channels</span>
        </div>
        <span class="cat-arrow">→</span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--gap)}
  .cat-card{display:flex;align-items:center;gap:var(--gap);padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);transition:border-color .15s,transform .15s}
  .cat-card:hover{border-color:var(--accent-soft);transform:translateY(-1px)}
  .cat-icon{width:44px;height:44px;border-radius:var(--radius);background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:14px;font-weight:600;flex-shrink:0}
  .cat-info{flex:1;min-width:0}
  .cat-name{display:block;font-size:14px;font-weight:600}
  .cat-count{display:block;font-size:12px;color:var(--muted);margin-top:2px}
  .cat-arrow{color:var(--muted);font-size:16px;transition:transform .15s}
  .cat-card:hover .cat-arrow{transform:translateX(3px)}
  @media(max-width:640px){.cat-grid{grid-template-columns:1fr}}
</style>
