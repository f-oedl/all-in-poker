// Phone helpers: header state on scroll and a dismissible install hint.
(() => {
  const root = document.documentElement;
  const onScroll = () => root.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const button = document.getElementById('install-app');
  if (!button) return;
  const KEY = 'allin_install_dismissed';
  const bar = document.createElement('div');
  bar.id = 'install-bar';
  button.replaceWith(bar);
  bar.append(button);
  const close = document.createElement('button');
  close.id = 'install-dismiss';
  close.type = 'button';
  close.setAttribute('aria-label', 'Hinweis ausblenden');
  close.textContent = '×';
  bar.append(close);
  let dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch {}
  // pwa.js hides the button when the app is installed; mirror that on the bar.
  const sync = () => { bar.hidden = button.hidden || (dismissed && matchMedia('(max-width:767px)').matches); };
  new MutationObserver(sync).observe(button, { attributes: true, attributeFilter: ['hidden'] });
  close.addEventListener('click', () => {
    dismissed = true;
    try { localStorage.setItem(KEY, '1'); } catch {}
    sync();
  });
  sync();
})();
