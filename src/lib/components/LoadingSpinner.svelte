<script>
  let { message = 'Loading…' } = $props();
</script>

<div class="loading-state" role="status">
  <div class="spinner"></div>
  <span class="msg">{message}</span>
</div>

<style>
  .loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;color:var(--muted);gap:16px}
  .spinner{width:32px;height:32px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .msg{font-size:14px}
</style>
