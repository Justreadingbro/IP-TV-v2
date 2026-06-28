<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { loadMeta } from '$lib/stores/channels.js';

  let { children = () => '' } = $props();
  let ready = $state(false);
  let err = $state(null);

  onMount(async () => {
    try {
      await loadMeta();
      ready = true;
    } catch (e) {
      err = e.message;
    }
  });
</script>

<div class="app-shell">
  <Header />
  <main class="main-content">
    {#if err}
      <div class="error-screen">
        <strong>Failed to load data</strong>
        <span>{err}</span>
      </div>
    {:else if ready}
      {@render children()}
    {:else}
      <div class="loading-screen">
        <div class="spinner"></div>
        <span>Loading IPTV LUX…</span>
      </div>
    {/if}
  </main>
  <Footer />
</div>

<style>
  .app-shell{display:flex;flex-direction:column;min-height:100vh}
  .main-content{flex:1;margin-top:var(--header-h);padding:var(--gap-lg);min-height:calc(100vh - var(--header-h))}
  .error-screen{text-align:center;padding:80px 20px;color:var(--muted)}
  .error-screen strong{color:var(--red);display:block;margin-bottom:8px;font-size:18px}
  .loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 20px;color:var(--muted);gap:16px}
  .spinner{width:36px;height:36px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
