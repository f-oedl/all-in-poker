(() => {
  const button = document.querySelector('#install-app');
  const guide = document.querySelector('#install-guide');
  let prompt;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  button.hidden = Boolean(standalone());
  addEventListener('beforeinstallprompt', event => { event.preventDefault(); prompt = event; });
  button.addEventListener('click', async () => {
    if (prompt) { await prompt.prompt(); await prompt.userChoice; prompt = null; }
    else guide.showModal();
  });
  document.querySelector('#close-install').addEventListener('click', () => guide.close());
  guide.addEventListener('click', event => { if (event.target === guide) guide.close(); });
  addEventListener('appinstalled', () => { button.hidden = true; });
  // No data cache: private records and live writes always use the original backend.
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
