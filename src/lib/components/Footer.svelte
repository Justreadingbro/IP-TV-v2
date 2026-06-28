<script>
  import { meta } from '$lib/stores/channels.js';
</script>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">IPTV <span>LUX</span></div>
    <div class="footer-links">
      <a href="/browse">Browse</a>
      <a href="/categories">Categories</a>
      <a href="/countries">Countries</a>
      <a href="/settings">Settings</a>
    </div>
    <div class="footer-stats">
      {#if $meta}
        <span>{$meta.total.toLocaleString()} channels</span>
        <span>·</span>
        <span>{$meta.countries.length} countries</span>
        <span>·</span>
        <span>{$meta.categories.length} categories</span>
      {/if}
    </div>
  </div>
</footer>

<style>
  .footer{border-top:1px solid var(--border);padding:var(--gap-lg);margin-top:var(--gap-xl);background:var(--surface)}
  .footer-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap)}
  .footer-brand{font-family:var(--font-display);font-size:16px;font-weight:600}
  .footer-brand span{color:var(--accent)}
  .footer-links{display:flex;gap:var(--gap)}
  .footer-links a{font-size:13px;color:var(--muted);transition:color .12s}
  .footer-links a:hover{color:var(--fg)}
  .footer-stats{font-size:12px;color:var(--muted);font-family:var(--font-mono);display:flex;gap:6px}
  @media(max-width:640px){.footer-inner{flex-direction:column;text-align:center}.footer-stats{flex-wrap:wrap;justify-content:center}}
</style>
