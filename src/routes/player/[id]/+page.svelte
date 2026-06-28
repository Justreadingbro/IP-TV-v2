<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { channels, loadChannels } from '$lib/stores/channels.js';

  let ch = $state(null);
  let ready = $state(false);
  let loadFailed = $state(false);
  let loadTimeout = $state(null);

  onMount(async () => {
    const id = $page.params.id;
    const found = $channels.find(c => c.i === id);
    if (found) {
      ch = found;
      ready = true;
    } else {
      await loadChannels();
      const found2 = $channels.find(c => c.i === id);
      if (found2) {
        ch = found2;
      }
      ready = true;
    }
  });

  const src = $derived($page.url.searchParams.get('src') || '');
  const feedName = $derived($page.url.searchParams.get('name') || '');
  const userAgent = $derived($page.url.searchParams.get('ua') || '');
  const referrer = $derived($page.url.searchParams.get('rf') || '');

  function iframeLoaded() {
    if (loadTimeout) clearTimeout(loadTimeout);
    loadTimeout = null;
    loadFailed = false;
  }

  function iframeError() {
    loadFailed = true;
    if (loadTimeout) clearTimeout(loadTimeout);
    loadTimeout = null;
  }

  $effect(() => {
    if (src) {
      loadFailed = false;
      if (loadTimeout) clearTimeout(loadTimeout);
      loadTimeout = setTimeout(() => {
        loadFailed = true;
        loadTimeout = null;
      }, 15000);
    }
    return () => {
      if (loadTimeout) clearTimeout(loadTimeout);
    };
  });
</script>

<svelte:head>
  <title>{ch?.n || 'Player'} — IPTV LUX</title>
</svelte:head>

{#if !ready}
  <div class="loading">Loading player…</div>
{:else if !src}
  <div class="error">
    <h2>No stream URL</h2>
    <p>This channel has no playable stream URL. The stream may be offline or unavailable.</p>
    {#if ch}
      <a href="/channel/{encodeURIComponent(ch.i)}" class="back">Try another feed</a>
    {:else}
      <a href="/browse" class="back">Browse channels</a>
    {/if}
  </div>
{:else}
  <div class="player-page">
    <div class="player-topbar">
      <button class="player-back" onclick={() => goto(ch ? `/channel/${encodeURIComponent(ch.i)}` : '/browse')} aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <div class="player-info">
        <span class="player-channel">{ch?.n || $page.params.id}</span>
        <span class="player-feed">{feedName || 'Live stream'}</span>
      </div>
    </div>
    {#if loadFailed}
      <div class="player-error-overlay">
        <p>Stream failed to load.</p>
        <p class="player-error-hint">The stream may be offline or require specific headers.</p>
        {#if ch}
          <a href="/channel/{encodeURIComponent(ch.i)}" class="back">Back to channel</a>
        {/if}
      </div>
    {:else}
      <iframe class="player-iframe" src={src}
        allow="autoplay;encrypted-media;fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Video player"
        onerror={iframeError}
        onload={iframeLoaded}
      ></iframe>
    {/if}
  </div>
{/if}

<style>
  .loading,.error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;color:var(--muted);min-height:60vh}
  .error h2{font-family:var(--font-display);color:var(--fg2);margin-bottom:8px}
  .error p{margin-bottom:var(--gap-lg)}
  .back{display:inline-block;padding:10px 24px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px;transition:opacity .12s}
  .back:hover{opacity:.85}
  .player-page{position:fixed;inset:0;z-index:200;background:#000;display:flex;flex-direction:column}
  .player-topbar{display:flex;align-items:center;gap:var(--gap);padding:var(--gap);background:rgba(0,0,0,.6);backdrop-filter:blur(12px);z-index:1}
  .player-back{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:#fff;background:rgba(255,255,255,.1);transition:background .12s}
  .player-back:hover{background:rgba(255,255,255,.2)}
  .player-info{display:flex;flex-direction:column;gap:2px;min-width:0}
  .player-channel{font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player-feed{font-size:11px;color:rgba(255,255,255,.5);font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player-iframe{width:100%;height:100%;border:0}
  .player-error-overlay{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;color:rgba(255,255,255,.6)}
  .player-error-overlay p{margin-bottom:8px;font-size:15px}
  .player-error-hint{font-size:13px;color:rgba(255,255,255,.4)}
  .player-error-overlay .back{margin-top:16px;display:inline-block;padding:8px 20px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px}
</style>
