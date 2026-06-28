<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { channels } from '$lib/stores/channels.js';

  let playerContainer = $state(null);
  let ch = $state(null);
  let ready = $state(false);
  let streamStatus = $state('loading');
  let streamType = $state('');
  let errorMsg = $state('');
  let hlsInstance = null;
  let cleanupFns = [];

  function resolveStreamUrl(url) {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    return trimmed;
  }

  function detectStreamType(url) {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.includes('.m3u8') || u.includes('m3u8')) return 'hls';
    if (u.endsWith('.mp4')) return 'mp4';
    if (u.endsWith('.webm')) return 'webm';
    if (u.includes('.php')) return 'unsupported';
    if (u.includes('/html') || u.includes('.html')) return 'unsupported';
    return null;
  }

  function tryPlayNative(url) {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = false;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    video.style.background = '#000';
    if (playerContainer) {
      playerContainer.innerHTML = '';
      playerContainer.appendChild(video);
    }
    setTimeout(() => video.play().catch(() => {}), 100);
  }

  async function tryPlayHls(url) {
    try {
      const Hls = (await import('hls.js')).default;
      if (!Hls.isSupported()) {
        showUnsupported('HLS is not supported in this browser.');
        return;
      }
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = false;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'contain';
      video.style.background = '#000';
      if (playerContainer) {
        playerContainer.innerHTML = '';
        playerContainer.appendChild(video);
      }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        streamStatus = 'playing';
        setTimeout(() => video.play().catch(() => {}), 50);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          streamStatus = 'error';
          errorMsg = 'Stream failed to load. The channel may be offline.';
          video.remove();
          cleanupHls();
        }
      });
      cleanupFns.push(() => {
        hls.destroy();
        hlsInstance = null;
        video.remove();
      });
    } catch {
      showUnsupported('HLS.js failed to load.');
    }
  }

  function cleanupHls() {
    if (hlsInstance) {
      try { hlsInstance.destroy(); } catch {}
      hlsInstance = null;
    }
  }

  function showUnsupported(msg) {
    streamStatus = 'unsupported';
    errorMsg = msg || 'This stream cannot be played directly.';
    cleanupHls();
    if (playerContainer) playerContainer.innerHTML = '';
  }

  $effect(() => {
    if (streamStatus === 'loading' && ch && ready) {
      loadStream();
    }
  });

  function loadStream() {
    const feedId = $page.url.searchParams.get('feed');
    const feed = ch.f?.find(f => f.i === feedId) || ch.f?.[0];
    const url = resolveStreamUrl(feed?.u);
    if (!url) {
      streamStatus = 'unsupported';
      errorMsg = 'No playable stream URL available.';
      return;
    }
    streamType = detectStreamType(url) || 'unknown';
    if (streamType === 'hls') {
      tryPlayHls(url);
    } else if (streamType === 'mp4' || streamType === 'webm') {
      tryPlayNative(url);
      streamStatus = 'playing';
    } else if (streamType === 'unsupported') {
      showUnsupported('This stream cannot be played directly.');
    } else {
      tryPlayHls(url);
    }
  }

  const srcUrl = $derived($page.url.searchParams.get('src') || '');
  const feedName = $derived($page.url.searchParams.get('name') || '');
  const userAgent = $derived($page.url.searchParams.get('ua') || '');
  const referrer = $derived($page.url.searchParams.get('rf') || '');

  onMount(() => {
    const id = $page.params.id;
    const found = $channels.find(c => c.i === id);
    if (found) {
      ch = found;
      ready = true;
    } else {
      streamStatus = 'error';
      errorMsg = 'Channel not found.';
      ready = true;
    }
  });

  onDestroy(() => {
    cleanupHls();
    for (const fn of cleanupFns) fn();
    cleanupFns = [];
    if (playerContainer) playerContainer.innerHTML = '';
  });

  function goBack() {
    goto(ch ? `/channel/${encodeURIComponent(ch.i)}` : '/browse', { replaceState: true });
  }

  function copyUrl() {
    const u = ch?.f?.[0]?.u || srcUrl;
    if (u) navigator.clipboard.writeText(u).catch(() => {});
  }

  function openInVlc() {
    const u = ch?.f?.[0]?.u || srcUrl;
    if (u) {
      const a = document.createElement('a');
      a.href = u;
      a.target = '_blank';
      a.rel = 'noopener';
      a.click();
    }
  }

  function openStream() {
    const u = ch?.f?.[0]?.u || srcUrl;
    if (u) {
      window.open(u, '_blank', 'noopener');
    }
  }
</script>

<svelte:head>
  <title>{ch?.n || 'Player'} — IPTV LUX</title>
</svelte:head>

{#if !ready}
  <div class="loading">Loading player…</div>
{:else if streamStatus === 'unsupported' || streamStatus === 'error' || streamStatus === 'no-url'}
  <div class="player-page">
    <div class="player-topbar">
      <button class="player-back" onclick={goBack} aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <div class="player-info">
        <span class="player-channel">{ch?.n || $page.params.id}</span>
        <span class="player-feed">{feedName || 'Live stream'}</span>
      </div>
    </div>
    <div class="player-error">
      <div class="player-error-icon">◬</div>
      <p class="player-error-title">{errorMsg || 'Stream unavailable'}</p>
      <p class="player-error-hint">This stream cannot be played in the browser.</p>
      <div class="player-error-actions">
        <button class="error-action-btn" onclick={openStream}>Open Stream</button>
        {#if ch?.f?.[0]?.u || srcUrl}
          <button class="error-action-btn" onclick={copyUrl}>Copy URL</button>
          <button class="error-action-btn" onclick={openInVlc}>Open in VLC</button>
        {/if}
      </div>
      {#if ch}
        <a href="/channel/{encodeURIComponent(ch.i)}" class="back-link">Try another feed</a>
      {/if}
    </div>
  </div>
{:else}
  <div class="player-page">
    <div class="player-topbar">
      <button class="player-back" onclick={goBack} aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <div class="player-info">
        <span class="player-channel">{ch?.n || $page.params.id}</span>
        <span class="player-feed">{feedName || 'Live stream'}</span>
      </div>
      <div class="player-spacer"></div>
      <span class="player-status-indicator" class:playing={streamStatus === 'playing'}>
        {streamStatus === 'playing' ? '● Live' : 'Connecting…'}
      </span>
    </div>
    <div class="player-view" bind:this={playerContainer}>
      <div class="player-loading-overlay">
        <div class="spinner"></div>
        <span>Connecting to stream…</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .loading{display:flex;align-items:center;justify-content:center;padding:80px 20px;color:var(--muted);min-height:60vh}
  .player-page{position:fixed;inset:0;z-index:200;background:#000;display:flex;flex-direction:column}
  .player-topbar{display:flex;align-items:center;gap:var(--gap);padding:var(--gap);background:rgba(0,0,0,.6);backdrop-filter:blur(12px);z-index:2;flex-shrink:0}
  .player-back{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:#fff;background:rgba(255,255,255,.1);transition:background .12s;flex-shrink:0}
  .player-back:hover{background:rgba(255,255,255,.2)}
  .player-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
  .player-channel{font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player-feed{font-size:11px;color:rgba(255,255,255,.5);font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player-spacer{flex:1}
  .player-status-indicator{font-size:11px;color:rgba(255,255,255,.4);font-family:var(--font-mono)}
  .player-status-indicator.playing{color:#34d48c}
  .player-view{flex:1;position:relative;overflow:hidden;background:#000;min-height:0}
  .player-view :global(video){width:100%;height:100%;object-fit:contain;background:#000}
  .player-loading-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(255,255,255,.5);background:#000;z-index:1}
  .spinner{width:28px;height:28px;border:2px solid rgba(255,255,255,.15);border-top-color:rgba(255,255,255,.6);border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .player-error{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;color:rgba(255,255,255,.6)}
  .player-error-icon{font-size:36px;margin-bottom:12px;opacity:.4}
  .player-error-title{color:#fff;font-size:16px;font-weight:500;margin-bottom:4px}
  .player-error-hint{font-size:13px;color:rgba(255,255,255,.4);margin-bottom:var(--gap-lg)}
  .player-error-actions{display:flex;gap:8px;margin-bottom:var(--gap-lg);flex-wrap:wrap;justify-content:center}
  .error-action-btn{padding:8px 18px;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font-size:13px;transition:background .12s;font-weight:500}
  .error-action-btn:hover{background:rgba(255,255,255,.2)}
  .back-link{display:inline-block;padding:8px 18px;background:var(--accent);color:#fff;border-radius:6px;font-size:13px;transition:opacity .12s}
  .back-link:hover{opacity:.85}
</style>
