<script>
  import { page } from '$app/stores';
  import { meta } from '$lib/stores/channels.js';
  import { searchQuery } from '$lib/stores/filters.js';

  let q = $state('');
  let timer;

  function onSearchInput(e) {
    q = e.target.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchQuery.set(q);
      if (q.length >= 2 || q.length === 0) {
        gotoSearch();
      }
    }, 200);
  }

  function clearSearch() {
    q = '';
    searchQuery.set('');
  }

  function gotoSearch() {
    const path = $page.url.pathname;
    if (path !== '/search') {
      window.location.href = '/search';
    }
  }

  function isActive(path) {
    return $page.url.pathname === path;
  }
</script>

<header class="header">
  <a href="/" class="header-brand" aria-label="IPTV LUX Home">IPTV <span>LUX</span></a>

  <div class="header-search" role="search">
    <span class="search-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="10" cy="10" r="7"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
    </span>
    <input
      type="search"
      value={q}
      oninput={onSearchInput}
      placeholder="Search channels, countries, categories…"
      autocomplete="off"
      aria-label="Search channels"
    />
    {#if q}
      <button class="search-clear" onclick={clearSearch} aria-label="Clear search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    {/if}
  </div>

  <nav class="header-nav" aria-label="Main navigation">
    <a href="/browse" class="nav-link" class:active={isActive('/browse')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      <span>Browse</span>
    </a>
    <a href="/favorites" class="nav-link" class:active={isActive('/favorites')} aria-label="Favorites">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    </a>
    <a href="/history" class="nav-link" class:active={isActive('/history')} aria-label="History">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    </a>
  </nav>

  <div class="header-meta">
    {#if $meta}
      <span class="header-count">{$meta.total.toLocaleString()} channels</span>
    {/if}
  </div>
</header>

<style>
  .header{
    position:fixed;top:0;left:0;right:0;z-index:100;
    height:var(--header-h);
    background:color-mix(in oklch, var(--bg) 88%, transparent);
    backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
    display:flex;align-items:center;padding:0 var(--gap-lg);gap:var(--gap-lg);
  }
  .header-brand{font-family:var(--font-display);font-size:20px;font-weight:600;white-space:nowrap;letter-spacing:-.01em}
  .header-brand span{color:var(--accent)}
  .header-search{
    flex:1;max-width:480px;position:relative;
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius);padding:0 12px;display:flex;align-items:center;gap:8px;
    transition:border-color .15s;
  }
  .header-search:focus-within{border-color:var(--accent)}
  .search-icon{color:var(--muted);flex-shrink:0;display:flex;opacity:.6}
  .header-search input{flex:1;height:36px;font-size:14px;background:transparent;color:var(--fg);min-width:0}
  .header-search input::placeholder{color:var(--muted)}
  .search-clear{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;color:var(--muted);flex-shrink:0;transition:background .12s,color .12s}
  .search-clear:hover{background:var(--surface2);color:var(--fg)}
  .header-nav{display:flex;align-items:center;gap:4px}
  .nav-link{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--radius-sm);color:var(--muted);font-size:13px;font-weight:500;transition:color .15s,background .15s;white-space:nowrap}
  .nav-link:hover{color:var(--fg);background:var(--surface2)}
  .nav-link.active{color:var(--accent);background:var(--accent-soft)}
  .nav-link span{display:none}
  @media(min-width:768px){.nav-link span{display:inline}}
  .header-meta{display:flex;align-items:center}
  .header-count{font-size:12px;color:var(--muted);font-family:var(--font-mono);white-space:nowrap;display:none}
  @media(min-width:1000px){.header-count{display:block}}
  @media(max-width:640px){.header{padding:0 var(--gap);gap:var(--gap)}.header-brand{font-size:16px}.header-search{max-width:none}}
</style>
