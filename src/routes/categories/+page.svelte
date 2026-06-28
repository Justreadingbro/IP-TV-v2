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
        <span class="cat-name">{cat.name}</span>
        <span class="cat-count">{cat.count.toLocaleString()} channels</span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--gap)}
  .cat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:var(--gap);transition:border-color .15s,transform .15s;display:flex;flex-direction:column;gap:4px}
  .cat-card:hover{border-color:var(--accent);transform:translateY(-1px)}
  .cat-name{font-size:15px;font-weight:600}
  .cat-count{font-size:12px;color:var(--muted);font-family:var(--font-mono)}
  @media(max-width:480px){.cat-grid{grid-template-columns:repeat(2,1fr)}}
</style>
