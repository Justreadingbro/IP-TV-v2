<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { channels, loadChannels } from '$lib/stores/channels.js';
  import { toggleFavorite, isFavorite } from '$lib/stores/favorites.js';
  import { addToHistory } from '$lib/services/storage.js';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = $state(true);
  let ch = $state(null);
  let fav = $state(false);
  let logoFailed = $state(false);

  onMount(async () => {
    const c = $channels.find(x => x.i === $page.params.id);
    if (c) {
      ch = c;
      fav = isFavorite(c.i);
      addToHistory(c.i);
      loading = false;
    } else {
      await loadChannels();
      const found = $channels.find(x => x.i === $page.params.id);
      if (found) {
        ch = found;
        fav = isFavorite(found.i);
        addToHistory(found.i);
      }
      loading = false;
    }
  });

  function toggleFav() {
    if (!ch) return;
    fav = toggleFavorite(ch.i);
  }

  function openPlayer(feedId, feedName) {
    // Find the feed and use its resolved stream URL
    const feed = ch.f?.find(f => f.i === feedId);
    const src = feed?.u || '';
    if (!src) {
      alert('No playable stream URL available for this feed.');
      return;
    }
    const params = new URLSearchParams({ feed: feedId, name: feedName, src });
    if (feed?.ua) params.set('ua', feed.ua);
    if (feed?.rf) params.set('rf', feed.rf);
    goto(`/player/${encodeURIComponent(ch.i)}?${params}`);
  }
</script>

<svelte:head>
  <title>{ch?.n || 'Channel'} — IPTV LUX</title>
</svelte:head>

{#if loading}
  <LoadingSpinner message="Loading channel…" />
{:else if ch}
  <div class="detail-page">
    <button class="back-link" onclick={() => history.back()}>← Back</button>

    <div class="detail-header">
      <div class="detail-logo">
        {#if ch.l?.url && !logoFailed}
          <img src={ch.l.url} alt="{ch.n} logo" onerror={() => logoFailed = true} />
        {/if}
        <span class="logo-letter" class:show={!ch.l?.url || logoFailed}>{ch.n?.charAt(0) || '?'}</span>
      </div>
      <div class="detail-info">
        <h1 class="detail-name">{ch.n}</h1>
        <div class="detail-id">{ch.i}</div>
        <div class="detail-meta-row">
          {#if ch.cf}<span class="detail-flag">{ch.cf}</span>{/if}
          <span>{ch.cn || ch.cy || 'Unknown'}</span>
        </div>
        <div class="detail-tags">
          {#each (ch.ctn || []) as cat, i}
            <a href="/categories/{ch.ct[i]}" class="tag category">{cat}</a>
          {/each}
          {#if ch.ns}
            <span class="tag nsfw">NSFW</span>
          {/if}
          {#if ch.bl}
            <span class="tag blocked">Restricted</span>
          {/if}
        </div>
        <button class="fav-btn-lg" class:faved={fav} onclick={toggleFav}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {fav ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>

    <div class="detail-body">
      <section class="detail-section">
        <h2 class="section-heading">Streams ({ch.f?.length || 0})</h2>
        {#if ch.f && ch.f.length > 0}
          <div class="feeds-list">
            {#each ch.f as feed}
              <div class="feed-item">
                <div class="feed-info">
                  <div class="feed-name">{feed.n}</div>
                  <div class="feed-meta">
                    {#if feed.lgn && feed.lgn.length > 0}
                      <span>{feed.lgn.join(', ')}</span>
                    {/if}
                    {#if feed.ba && feed.ba.length > 0}
                      <span>{feed.ba.join(', ')}</span>
                    {/if}
                    {#if feed.fmt}
                      <span class="feed-format">{feed.fmt}</span>
                    {/if}
                  </div>
                </div>
                <button class="play-btn" class:disabled={!feed.u} onclick={() => feed.u && openPlayer(feed.i, feed.n)} disabled={!feed.u} title={feed.u ? 'Play stream' : 'No stream URL available'}>{feed.u ? 'Play' : 'Offline'}</button>
              </div>
            {/each}
          </div>
        {:else}
          <p class="no-data">No streams available for this channel.</p>
        {/if}
      </section>

      <section class="detail-section">
        <h2 class="section-heading">Information</h2>
        <table class="info-table">
          <tbody>
            {#if ch.w}<tr><td>Network</td><td>{ch.w}</td></tr>{/if}
            {#if ch.o}<tr><td>Owners</td><td>{ch.o}</td></tr>{/if}
            {#if ch.ns}<tr><td>NSFW</td><td>Yes</td></tr>{/if}
            {#if ch.bl}<tr><td>Restricted</td><td>{ch.bl}</td></tr>{/if}
            {#if ch.la}<tr><td>Launched</td><td>{ch.la}</td></tr>{/if}
            {#if ch.cl}<tr><td>Closed</td><td>{ch.cl}</td></tr>{/if}
            {#if ch.rb}<tr><td>Replaced by</td><td>{ch.rb}</td></tr>{/if}
            {#if ch.u}
              <tr><td>Website</td><td><a href={ch.u} target="_blank" rel="noopener">{ch.u}</a></td></tr>
            {/if}
          </tbody>
        </table>
      </section>
    </div>
  </div>
{:else}
  <div class="not-found">
    <h2>Channel not found</h2>
    <p>The channel "{decodeURIComponent($page.params.id)}" doesn't exist.</p>
    <a href="/browse" class="back-link">Browse channels</a>
  </div>
{/if}

<style>
  .detail-page{max-width:900px;margin:0 auto}
  .back-link{display:inline-block;font-size:13px;color:var(--muted);margin-bottom:var(--gap);transition:color .12s;cursor:pointer;background:none;border:none;padding:0;font-family:inherit}
  .back-link:hover{color:var(--accent)}
  .detail-header{display:flex;gap:var(--gap-lg);margin-bottom:var(--gap-xl)}
  .detail-logo{width:200px;height:112px;flex-shrink:0;background:var(--surface2);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;border:1px solid var(--border);overflow:hidden}
  .detail-logo img{max-width:80%;max-height:80%;object-fit:contain}
  .logo-letter{display:block;font-size:36px;font-weight:600;color:var(--muted);font-family:var(--font-display)}
  .logo-letter{display:none}
  .logo-letter.show{display:block}
  .detail-info{min-width:0;flex:1}
  .detail-name{font-family:var(--font-display);font-size:28px;line-height:1.2;margin-bottom:4px}
  .detail-id{font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-bottom:6px}
  .detail-meta-row{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--fg2);margin-bottom:var(--gap)}
  .detail-flag{font-size:20px}
  .detail-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:var(--gap)}
  .tag{font-size:11px;padding:3px 8px;border-radius:4px;background:var(--surface2);color:var(--muted)}
  .tag.category{background:var(--accent-soft);color:var(--accent)}
  .tag.nsfw{background:color-mix(in oklch, var(--red) 12%, transparent);color:var(--red)}
  .tag.blocked{background:color-mix(in oklch, var(--yellow) 12%, transparent);color:var(--yellow)}
  .fav-btn-lg{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-sm);background:var(--surface2);border:1px solid var(--border);font-size:13px;transition:all .12s}
  .fav-btn-lg:hover{border-color:var(--muted)}
  .fav-btn-lg.faved{background:color-mix(in oklch, var(--red) 12%, transparent);border-color:var(--red);color:var(--red)}
  .detail-body{display:flex;flex-direction:column;gap:var(--gap-xl)}
  .section-heading{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:var(--gap);font-family:var(--font-mono)}
  .feeds-list{display:flex;flex-direction:column;gap:6px}
  .feed-item{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--surface2);border-radius:var(--radius);border:1px solid var(--border)}
  .feed-info{min-width:0;flex:1}
  .feed-name{font-size:14px;font-weight:500}
  .feed-meta{font-size:12px;color:var(--muted);margin-top:3px;display:flex;flex-wrap:wrap;gap:8px}
  .feed-format{font-family:var(--font-mono);font-size:11px;color:var(--accent)}
  .play-btn{padding:8px 20px;border-radius:var(--radius-sm);background:var(--accent);color:#fff;font-size:13px;font-weight:500;transition:opacity .12s;flex-shrink:0;margin-left:var(--gap)}
  .play-btn:hover{opacity:.85}
  .no-data{color:var(--muted);font-size:14px;padding:20px 0}
  .info-table{width:100%;font-size:14px;border-collapse:collapse}
  .info-table td{padding:6px 12px;vertical-align:top;border-bottom:1px solid var(--border)}
  .info-table td:first-child{color:var(--muted);width:120px;white-space:nowrap;font-size:13px}
  .info-table a{color:var(--accent)}
  .info-table a:hover{text-decoration:underline}
  .not-found{text-align:center;padding:80px 20px}
  .not-found h2{font-family:var(--font-display);font-size:24px;margin-bottom:8px}
  .not-found p{color:var(--muted);margin-bottom:var(--gap-lg)}
  @media(max-width:640px){.detail-header{flex-direction:column}.detail-logo{width:100%;height:auto;aspect-ratio:16/9}.detail-name{font-size:22px}.feed-item{flex-direction:column;align-items:stretch;gap:8px}.play-btn{margin-left:0;text-align:center}}
</style>
