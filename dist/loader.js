// Hides the boot screen once the app shows real content (or the welcome / error view),
// after at least one full riffle so it never just flashes.
(() => {
  const loader = document.getElementById('boot-loader');
  if (!loader) return;
  const shownAt = performance.now();
  const MIN_MS = 1100, MAX_MS = 15000;
  let finished = false;
  const ready = () => {
    const app = document.querySelector('#root .club-app');
    if (!app) return false;
    if (app.classList.contains('route-welcome')) return true;
    const main = app.querySelector('.club-main');
    if (!main || !main.firstElementChild) return false;
    const waiting = main.querySelector('.loading-state');
    // The error view is a loading-state too, but it has a retry button and must be visible.
    return !waiting || !!waiting.querySelector('button');
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    observer.disconnect();
    setTimeout(() => {
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 600);
    }, Math.max(0, MIN_MS - (performance.now() - shownAt)));
  };
  const observer = new MutationObserver(() => { if (ready()) finish(); });
  observer.observe(document.getElementById('root'), { childList: true, subtree: true });
  setTimeout(finish, MAX_MS);
})();
