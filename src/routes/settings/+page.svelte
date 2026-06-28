<script>
  import { settings, updateSetting } from '$lib/stores/settings.js';
  import { clearHistory } from '$lib/services/storage.js';

  let historyCleared = $state(false);

  function clearHist() {
    clearHistory();
    historyCleared = true;
    setTimeout(() => historyCleared = false, 2000);
  }
</script>

<svelte:head>
  <title>Settings — IPTV LUX</title>
</svelte:head>

<div class="page-header">
  <h1 class="page-title">Settings</h1>
</div>

<div class="settings-list">
  <div class="setting-group">
    <h2 class="group-title">Playback</h2>
    <label class="setting-item">
      <span class="setting-label">Auto-play streams</span>
      <span class="setting-desc">Automatically start playing when opening a channel</span>
      <input type="checkbox" checked={$settings.autoPlay} onchange={(e) => updateSetting('autoPlay', e.target.checked)} class="toggle" />
    </label>
  </div>

  <div class="setting-group">
    <h2 class="group-title">Appearance</h2>
    <div class="setting-item">
      <span class="setting-label">Theme</span>
      <span class="setting-desc">Currently only dark theme is available</span>
      <span class="setting-value">Dark</span>
    </div>
    <label class="setting-item">
      <span class="setting-label">Reduced motion</span>
      <span class="setting-desc">Disable animations and transitions</span>
      <input type="checkbox" checked={$settings.reducedMotion} onchange={(e) => updateSetting('reducedMotion', e.target.checked)} class="toggle" />
    </label>
  </div>

  <div class="setting-group">
    <h2 class="group-title">Data</h2>
    <div class="setting-item">
      <span class="setting-label">Clear browsing history</span>
      <span class="setting-desc">Remove all recently viewed channels</span>
      <button class="action-btn" onclick={clearHist}>{historyCleared ? 'Cleared!' : 'Clear'}</button>
    </div>
  </div>

  <div class="setting-group">
    <h2 class="group-title">About</h2>
    <div class="setting-item static">
      <span>IPTV LUX v2.0</span>
      <span class="setting-desc">Powered by iptv-org data</span>
    </div>
    <div class="setting-item static">
      <span>Channels indexed</span>
      <span class="setting-desc">—</span>
    </div>
  </div>
</div>

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .settings-list{max-width:600px;display:flex;flex-direction:column;gap:var(--gap-lg)}
  .setting-group{}
  .group-title{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;font-family:var(--font-mono)}
  .setting-item{display:flex;align-items:center;gap:var(--gap);padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:4px}
  .setting-item.static{display:flex;justify-content:space-between}
  .setting-label{font-size:14px;font-weight:500;min-width:120px}
  .setting-desc{font-size:12px;color:var(--muted);flex:1;min-width:0}
  .setting-value{font-size:13px;color:var(--fg2)}
  .toggle{width:36px;height:20px;border-radius:10px;background:var(--surface3);border:1px solid var(--border);appearance:none;cursor:pointer;position:relative;transition:background .15s;flex-shrink:0}
  .toggle:checked{background:var(--accent);border-color:var(--accent)}
  .toggle::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:transform .15s,background .15s}
  .toggle:checked::after{transform:translateX(16px);background:#fff}
  .action-btn{padding:6px 14px;border-radius:var(--radius-sm);background:var(--surface2);border:1px solid var(--border);font-size:13px;transition:all .12s;flex-shrink:0}
  .action-btn:hover{border-color:var(--muted)}
  .action-btn:last-child{color:var(--red)}
</style>
