<script>
  import { meta } from '$lib/stores/channels.js';
  import { activeFilters, resetFilters } from '$lib/stores/filters.js';

  let openPanel = $state(null);

  function toggleFilter(type) {
    openPanel = openPanel === type ? null : type;
  }

  function setFilter(type, value) {
    activeFilters.update(f => ({ ...f, [type]: value }));
    openPanel = null;
  }

  function getFilterLabel(type) {
    const val = $activeFilters[type];
    if (!val && type !== 'nsfw') return type.charAt(0).toUpperCase() + type.slice(1);
    if (type === 'country') {
      const c = $meta?.countries.find(x => x.code === val);
      return c ? (c.flag || '') + ' ' + c.name : 'Country';
    }
    if (type === 'category') {
      const c = $meta?.categories.find(x => x.id === val);
      return c ? c.name : 'Category';
    }
    if (type === 'language') {
      const l = $meta?.languages.find(x => x.code === val);
      return l ? l.name : 'Language';
    }
    if (type === 'nsfw') {
      if (val === 1) return 'NSFW';
      if (val === 2) return 'Safe';
      return 'Content';
    }
    return type;
  }

  function isActive(type) {
    const val = $activeFilters[type];
    if (type === 'nsfw') return val !== 0;
    return val !== null;
  }

  function hasAnyFilter() {
    const f = $activeFilters;
    return f.country || f.category || f.language || f.nsfw !== 0;
  }

  function handleKeydown(e, type) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFilter(type);
    }
  }
</script>

<div class="filterbar" role="toolbar" aria-label="Filters">
  <button class="filter-select" class:active={isActive('country')} onclick={() => toggleFilter('country')} onkeydown={(e) => handleKeydown(e, 'country')} aria-haspopup="true">
    {getFilterLabel('country')} <span class="arrow">▾</span>
  </button>
  <button class="filter-select" class:active={isActive('category')} onclick={() => toggleFilter('category')} onkeydown={(e) => handleKeydown(e, 'category')} aria-haspopup="true">
    {getFilterLabel('category')} <span class="arrow">▾</span>
  </button>
  <button class="filter-select" class:active={isActive('language')} onclick={() => toggleFilter('language')} onkeydown={(e) => handleKeydown(e, 'language')} aria-haspopup="true">
    {getFilterLabel('language')} <span class="arrow">▾</span>
  </button>
  <button class="filter-select" class:active={isActive('nsfw')} onclick={() => toggleFilter('nsfw')} onkeydown={(e) => handleKeydown(e, 'nsfw')} aria-haspopup="true">
    {getFilterLabel('nsfw')} <span class="arrow">▾</span>
  </button>

  {#if hasAnyFilter()}
    <button class="filter-reset" onclick={resetFilters}>Reset</button>
  {/if}
</div>

{#if openPanel}
  <div class="filter-overlay" onclick={() => openPanel = null} role="presentation"></div>
  <div class="filter-panel" role="dialog" aria-label="{openPanel} filter">
    <div class="filter-panel-inner">
      <button
        class="filter-chip"
        class:active={!$activeFilters[openPanel] && openPanel !== 'nsfw'}
        onclick={() => setFilter(openPanel, openPanel === 'nsfw' ? 0 : null)}
      >
        Any {openPanel}
      </button>
      {#if openPanel === 'country' && $meta}
        {#each $meta.countries as item}
          <button
            class="filter-chip"
            class:active={$activeFilters.country === item.code}
            onclick={() => setFilter('country', item.code)}
          >
            {item.flag ? item.flag + ' ' : ''}{item.name}
            <span class="chip-count">{item.count.toLocaleString()}</span>
          </button>
        {/each}
      {:else if openPanel === 'category' && $meta}
        {#each $meta.categories as item}
          <button
            class="filter-chip"
            class:active={$activeFilters.category === item.id}
            onclick={() => setFilter('category', item.id)}
          >
            {item.name}
            <span class="chip-count">{item.count.toLocaleString()}</span>
          </button>
        {/each}
      {:else if openPanel === 'language' && $meta}
        {#each $meta.languages as item}
          <button
            class="filter-chip"
            class:active={$activeFilters.language === item.code}
            onclick={() => setFilter('language', item.code)}
          >
            {item.name}
            <span class="chip-count">{item.count.toLocaleString()}</span>
          </button>
        {/each}
      {:else if openPanel === 'nsfw'}
        <button class="filter-chip" class:active={$activeFilters.nsfw === 0} onclick={() => setFilter('nsfw', 0)}>All content</button>
        <button class="filter-chip" class:active={$activeFilters.nsfw === 1} onclick={() => setFilter('nsfw', 1)}>NSFW only</button>
        <button class="filter-chip" class:active={$activeFilters.nsfw === 2} onclick={() => setFilter('nsfw', 2)}>Safe only</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .filterbar{
    display:flex;align-items:center;gap:8px;padding:0 0 var(--gap);overflow-x:auto;
    -webkit-overflow-scrolling:touch;position:relative;z-index:10;
  }
  .filterbar::-webkit-scrollbar{display:none}
  .filter-select{
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius-sm);padding:7px 12px;font-size:13px;color:var(--fg2);
    white-space:nowrap;display:flex;align-items:center;gap:6px;
    transition:border-color .15s,color .15s;flex-shrink:0;
  }
  .filter-select:hover{border-color:var(--muted)}
  .filter-select.active{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
  .arrow{font-size:8px;opacity:.6}
  .filter-reset{margin-left:auto;font-size:12px;color:var(--muted);padding:6px 10px;border-radius:var(--radius-sm);transition:color .12s;flex-shrink:0}
  .filter-reset:hover{color:var(--fg)}
  .filter-overlay{position:fixed;inset:0;z-index:50;background:transparent}
  .filter-panel{
    position:relative;z-index:51;
    background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius);
    max-height:min(60vh,420px);overflow-y:auto;
    padding:var(--gap) var(--gap-lg);margin-bottom:var(--gap);
    box-shadow:0 12px 60px rgba(0,0,0,.5);
  }
  .filter-panel-inner{display:flex;flex-wrap:wrap;gap:6px}
  .filter-chip{
    padding:5px 12px;border-radius:var(--radius-sm);font-size:13px;
    background:var(--surface2);color:var(--fg2);border:1px solid var(--border);
    transition:all .12s;white-space:nowrap;
  }
  .filter-chip:hover{border-color:var(--muted)}
  .filter-chip.active{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
  .chip-count{font-family:var(--font-mono);font-size:11px;opacity:.5;margin-left:4px}
  @media(max-width:640px){.filterbar{gap:6px}.filter-select{font-size:12px;padding:6px 10px}.filter-panel{padding:var(--gap)}}
</style>
