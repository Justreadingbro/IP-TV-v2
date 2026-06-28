<script>
  import ChannelCard from './ChannelCard.svelte';

  let { items, pageSize = 40 } = $props();

  let sentinelEl = $state(null);
  let visible = $state(40);

  function loadMore() {
    visible = Math.min(visible + pageSize, items.length);
  }

  $effect(() => {
    visible = Math.min(pageSize, items.length);
    if (sentinelEl && items.length > pageSize) {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
      }, { rootMargin: '600px' });
      obs.observe(sentinelEl);
      return () => obs.disconnect();
    }
  });
</script>

<div class="grid-wrapper">
  {#if !items || items.length === 0}
    <div class="empty-state">
      <div class="empty-icon">◬</div>
      <h3>No channels found</h3>
      <p>Try adjusting your search or filters.</p>
    </div>
  {:else}
    <div class="grid" role="list" aria-label="Channel grid">
      {#each items.slice(0, visible) as item (item.i)}
        <div role="listitem">
          <ChannelCard channel={item} />
        </div>
      {/each}
    </div>
    {#if visible < items.length}
      <div bind:this={sentinelEl} class="sentinel"></div>
    {:else}
      <div class="sentinel done">Showing all {items.length.toLocaleString()} channels</div>
    {/if}
  {/if}
</div>

<style>
  .grid-wrapper{width:100%}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--gap)}
  .empty-state{grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--muted)}
  .empty-icon{font-size:40px;margin-bottom:12px;opacity:.4}
  .empty-state h3{font-family:var(--font-display);color:var(--fg2);margin:0 0 6px}
  .empty-state p{font-size:14px;margin:0}
  .sentinel{height:1px}
  .sentinel.done{text-align:center;padding:20px;color:var(--muted);font-size:13px;font-family:var(--font-mono);height:auto}
  @media(max-width:800px){.grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}}
  @media(max-width:480px){.grid{grid-template-columns:repeat(2,1fr);gap:8px}}
  @media(min-width:1400px){.grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}}
  @media(min-width:2000px){.grid{grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}}
</style>
