<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status} — IPTV LUX</title>
</svelte:head>

<div class="error-page">
  <h1 class="error-code">{$page.status}</h1>
  <h2 class="error-title">
    {#if $page.status === 404}Page not found{:else}Something went wrong{/if}
  </h2>
  <p class="error-desc">
    {#if $page.status === 404}
      The page you're looking for doesn't exist.
    {:else}
      An unexpected error occurred. Please try again.
    {/if}
  </p>
  <a href="/" class="error-back">Go home</a>
</div>

<style>
  .error-page{text-align:center;padding:100px 20px}
  .error-code{font-family:var(--font-display);font-size:clamp(60px,12vw,120px);font-weight:700;color:var(--muted);line-height:1;margin:0 0 8px}
  .error-title{font-family:var(--font-display);font-size:24px;margin:0 0 8px}
  .error-desc{color:var(--muted);font-size:14px;margin:0 0 var(--gap-lg)}
  .error-back{display:inline-block;padding:10px 24px;background:var(--accent);color:#fff;border-radius:var(--radius);font-size:14px;font-weight:500;text-decoration:none}
  .error-back:hover{opacity:.85}
</style>
