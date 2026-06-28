<script>
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <div class="error-code">{$page.status}</div>
  <h1 class="error-title">{$page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
  <p class="error-desc">{$page.status === 404 ? 'This channel or page doesn\'t exist in the galaxy.' : 'An unexpected error occurred.'}</p>
  <a href="/" class="error-back">Return home</a>
</div>

<style>
  .error-page{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 20px;text-align:center;min-height:60vh}
  .error-code{font-family:var(--font-display);font-size:120px;line-height:1;color:var(--muted);opacity:.2;font-weight:700}
  .error-title{font-family:var(--font-display);font-size:28px;margin:0 0 8px;color:var(--fg2)}
  .error-desc{color:var(--muted);margin:0 0 32px;font-size:16px}
  .error-back{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px;font-weight:500;transition:opacity .15s}
  .error-back:hover{opacity:.85}
</style>
