<script>
  import { goto } from '$app/navigation';
  import { favoriteIds, toggleFavorite } from '$lib/stores/favorites.js';
  import { onMount } from 'svelte';

  let { channel } = $props();

  let fav = $derived($favoriteIds.indexOf(channel.i) !== -1);
  let logoFailed = $state(false);
  let prefetched = $state(false);

  const flag = $derived(channel.cf || '');
  const country = $derived(channel.cn || channel.cy || '');
  const cats = $derived(channel.ctn ? channel.ctn.slice(0, 3) : []);
  const logoUrl = $derived(channel.l?.u || channel.l?.url || null);

  function openDetail() {
    const id = encodeURIComponent(channel.i);
    goto(`/channel/${id}`);
  }

  function toggleFav(e) {
    e.stopPropagation();
    toggleFavorite(channel.i);
  }

  function onKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetail();
    }
  }

  function prefetchChannel() {
    if (prefetched) return;
    prefetched = true;
    const sanitized = channel.i.replace(/[^a-zA-Z0-9._-]/g, '_');
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/generated/channel/${encodeURIComponent(sanitized)}.json`;
    document.head.appendChild(link);
    setTimeout(() => link.remove(), 4000);
  }
</script>

<div
  class="ch-card"
  role="button"
  tabindex="0"
  onclick={openDetail}
  onkeydown={onKeydown}
  onmouseenter={prefetchChannel}
  aria-label="{channel.n}, {country}"
>
  <div class="ch-card-logo">
    {#if logoUrl && !logoFailed}
      <img src={logoUrl} alt="{channel.n} logo" loading="lazy" onerror={() => logoFailed = true} />
    {/if}
    <span class="card-logo-letter" class:show={!logoUrl || logoFailed}>{channel.n?.charAt(0) || '?'}</span>
  </div>
  <div class="ch-card-body">
    <div class="ch-card-name" title={channel.n}>{channel.n}</div>
    <div class="ch-card-meta">
      {#if flag}<span class="ch-card-flag">{flag}</span>{/if}
      <span>{country}</span>
    </div>
    <div class="ch-card-badges">
      {#each cats as cat}
        <span class="ch-badge category">{cat}</span>
      {/each}
      {#if channel.ns}
        <span class="ch-badge nsfw">NSFW</span>
      {/if}
      {#if channel.bl}
        <span class="ch-badge blocked">Restricted</span>
      {/if}
    </div>
  </div>
  <button
    class="fav-btn"
    class:faved={fav}
    onclick={toggleFav}
    aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
    tabindex="-1"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  </button>
</div>

<style>
  .ch-card{
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius-lg);overflow:hidden;cursor:pointer;
    transition:transform .2s ease,box-shadow .2s ease,border-color .2s;
    position:relative;display:flex;flex-direction:column;
    content-visibility:auto;contain-intrinsic-size:280px;
  }
  .ch-card:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.4);border-color:var(--accent-soft)}
  .ch-card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .ch-card-logo{aspect-ratio:16/9;width:100%;background:var(--surface2);display:flex;align-items:center;justify-content:center;padding:16px;overflow:hidden}
  .ch-card-logo img{max-width:80%;max-height:80%;object-fit:contain;transition:transform .3s ease}
  .ch-card:hover .ch-card-logo img{transform:scale(1.05)}
  .card-logo-letter{display:none;font-size:28px;font-weight:600;color:var(--muted);font-family:var(--font-display)}
  .card-logo-letter.show{display:block}
  .ch-card-body{padding:10px 12px 12px;flex:1;display:flex;flex-direction:column;min-width:0}
  .ch-card-name{font-size:14px;font-weight:600;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ch-card-meta{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:12px;color:var(--muted)}
  .ch-card-flag{font-size:14px;line-height:1}
  .ch-card-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
  .ch-badge{font-size:10px;padding:2px 6px;border-radius:4px;background:var(--surface2);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
  .ch-badge.category{background:color-mix(in oklch, var(--accent) 12%, transparent);color:var(--accent)}
  .ch-badge.nsfw{background:color-mix(in oklch, var(--red) 12%, transparent);color:var(--red)}
  .ch-badge.blocked{background:color-mix(in oklch, var(--yellow) 12%, transparent);color:var(--yellow)}
  .fav-btn{position:absolute;top:8px;right:8px;z-index:2;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.5);color:var(--muted);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s,color .15s;backdrop-filter:blur(4px)}
  .ch-card:hover .fav-btn,.fav-btn:focus-visible{opacity:1}
  .fav-btn.faved{opacity:1;color:var(--red)}
  @media(max-width:480px){.ch-card-logo{padding:10px}.ch-card-name{font-size:12px}.ch-card-body{padding:8px}.fav-btn{opacity:1}}
</style>
