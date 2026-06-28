<script>
  import { settings, updateSetting } from '$lib/stores/settings.js';
</script>

<svelte:head>
  <title>Settings — IPTV LUX</title>
</svelte:head>

<div class="page-header">
  <h1 class="page-title">Settings</h1>
  <p class="page-desc">Customize your experience</p>
</div>

<div class="settings-list">
  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-label">Theme</div>
      <div class="setting-desc">Choose between dark and light mode</div>
    </div>
    <select class="setting-select" value={$settings.theme} onchange={(e) => updateSetting('theme', e.target.value)}>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  </div>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-label">Auto-play</div>
      <div class="setting-desc">Automatically start streaming when opening a channel</div>
    </div>
    <label class="toggle">
      <input type="checkbox" checked={$settings.autoPlay} onchange={(e) => updateSetting('autoPlay', e.target.checked)} />
      <span class="toggle-slider"></span>
    </label>
  </div>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-label">Reduced motion</div>
      <div class="setting-desc">Disable animations for accessibility</div>
    </div>
    <label class="toggle">
      <input type="checkbox" checked={$settings.reducedMotion} onchange={(e) => updateSetting('reducedMotion', e.target.checked)} />
      <span class="toggle-slider"></span>
    </label>
  </div>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-label">Items per page</div>
      <div class="setting-desc">Number of channels to show per batch</div>
    </div>
    <select class="setting-select" value={$settings.pageSize} onchange={(e) => updateSetting('pageSize', parseInt(e.target.value))}>
      <option value="20">20</option>
      <option value="40">40</option>
      <option value="60">60</option>
      <option value="80">80</option>
    </select>
  </div>
</div>

<style>
  .page-header{margin-bottom:var(--gap-lg)}
  .page-title{font-family:var(--font-display);font-size:28px;font-weight:600}
  .page-desc{color:var(--muted);font-size:14px;margin-top:4px}
  .settings-list{max-width:600px}
  .setting-item{display:flex;justify-content:space-between;align-items:center;padding:var(--gap) 0;border-bottom:1px solid var(--border);gap:var(--gap)}
  .setting-info{min-width:0;flex:1}
  .setting-label{font-size:14px;font-weight:500}
  .setting-desc{font-size:12px;color:var(--muted);margin-top:2px}
  .setting-select{padding:6px 10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-size:13px}
  .toggle{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0}
  .toggle input{opacity:0;width:0;height:0}
  .toggle-slider{position:absolute;inset:0;background:var(--surface2);border-radius:11px;border:1px solid var(--border);transition:background .2s;cursor:pointer}
  .toggle input:checked+.toggle-slider{background:var(--accent);border-color:var(--accent)}
  .toggle-slider::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:2px;left:2px;transition:transform .2s}
  .toggle input:checked+.toggle-slider::after{transform:translateX(18px)}
</style>
