<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { fetchChannel } from '$lib/services/data.js';

  let playerContainer = $state(null);
  let ch = $state(null);
  let ready = $state(false);
  let streamStatus = $state('loading');
  let errorMsg = $state('');
  let hlsInstance = null;
  let cleanupFns = [];
  let loadAbort = null;

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
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
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
      video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
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
        cleanupHls();
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

  function loadStream() {
    const feedId = $page.url.searchParams.get('feed');
    const feed = ch.f?.find(f => f.i === feedId) || ch.f?.[0];
    const url = feed?.u;
    if (!url) {
      streamStatus = 'unsupported';
      errorMsg = 'No playable stream URL available.';
      return;
    }
    const st = detectStreamType(url) || 'unknown';
    if (st === 'hls') { tryPlayHls(url); }
    else if (st === 'mp4' || st === 'webm') { tryPlayNative(url); streamStatus = 'playing'; }
    else if (st === 'unsupported') { showUnsupported('This stream cannot be played directly.'); }
    else { tryPlayHls(url); }
  }

  const srcUrl = $derived($page.url.searchParams.get('src') || '');
  const feedName = $derived($page.url.searchParams.get('name') || '');

  onMount(async () => {
    const id = $page.params.id;
    try {
      ch = await fetchChannel(id);
      ready = true;
      loadStream();
    } catch {
      ch = null;
      streamStatus = 'error';
      errorMsg = 'Channel not found.';
      ready = true;
    }
  });

  onDestroy(() => {
    cleanupHls();
    for (const fn of cleanupFns) {
      try { fn(); } catch {}
    }
    cleanupFns = [];
    if (playerContainer) { playerContainer.innerHTML = ''; }
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
    if (u) window.open(u, '_blank', 'noopener');
  }

  function openStream() {
    const u = ch?.f?.[0]?.u || srcUrl;
    if (u) window.open(u, '_blank', 'noopener');
  }
</script>

<svelte:head>
  <title>{ch?.n || 'Player'} — IPTV LUX</title>
</svelte:head>

{#if !ready}
  <div class="loading">Loading player…</div>
{:else if streamStatus === 'unsupported' || streamStatus === 'error'}
  <div class="player-page">
    <div class="player-topbar">
      <button class="player-back" onclick={goBack} aria-label="Back" style="background:none;border:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:#fff;background:rgba(255,255,255,.1)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1">
        <span style="font-size:14px;font-weight:500;color:#fff">{ch?.n || $page.params.id}</span>
        <span style="font-size:11px;color:rgba(255,255,255,.5)">{feedName || 'Live stream'}</span>
      </div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;color:rgba(255,255,255,.6)">
      <div style="font-size:36px;margin-bottom:12px;opacity:.4">◬</div>
      <p style="color:#fff;font-size:16px;font-weight:500;margin-bottom:4px">{errorMsg || 'Stream unavailable'}</p>
      <p style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:24px">This stream cannot be played in the browser.</p>
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;justify-content:center">
        <button onclick={openStream} style="padding:8px 18px;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font-size:13px;border:none;cursor:pointer">Open Stream</button>
        {#if ch?.f?.[0]?.u || srcUrl}
          <button onclick={copyUrl} style="padding:8px 18px;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font-size:13px;border:none;cursor:pointer">Copy URL</button>
          <button onclick={openInVlc} style="padding:8px 18px;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font-size:13px;border:none;cursor:pointer">Open in VLC</button>
        {/if}
      </div>
      {#if ch}
        <a href="/channel/{encodeURIComponent(ch.i)}" style="padding:8px 18px;background:var(--accent);color:#fff;border-radius:6px;font-size:13px;text-decoration:none">Try another feed</a>
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
      <div style="flex:1"></div>
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
  .player-back{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:#fff;background:rgba(255,255,255,.1);transition:background .12s;flex-shrink:0;border:none;cursor:pointer}
  .player-back:hover{background:rgba(255,255,255,.2)}
  .player-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
  .player-channel{font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player-feed{font-size:11px;color:rgba(255,255,255,.5);font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player-status-indicator{font-size:11px;color:rgba(255,255,255,.4);font-family:var(--font-mono)}
  .player-status-indicator.playing{color:#34d48c}
  .player-view{flex:1;position:relative;overflow:hidden;background:#000;min-height:0}
  .player-view :global(video){width:100%;height:100%;object-fit:contain;background:#000}
  .player-loading-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(255,255,255,.5);background:#000;z-index:1}
  .spinner{width:28px;height:28px;border:2px solid rgba(255,255,255,.15);border-top-color:rgba(255,255,255,.6);border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
