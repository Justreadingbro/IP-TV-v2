export function escapeHtml(s) {
  if (!s && s !== 0) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function formatCount(n) {
  if (!n && n !== 0) return '';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + 's');
}

export function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '…' : str;
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
