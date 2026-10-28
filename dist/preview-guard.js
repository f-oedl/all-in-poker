(() => {
  const backendOrigin = 'https://okgvubkibtkgcofkdpsd.supabase.co';
  const originalFetch = window.fetch.bind(window);
  let editing = false;
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
    const method = (init?.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
    const isRead = ['GET', 'HEAD', 'OPTIONS'].includes(method) || (method === 'POST' && url.pathname.startsWith('/storage/v1/object/list/'));
    if (url.origin === backendOrigin && !isRead && !editing) {
      window.dispatchEvent(new CustomEvent('preview-write-blocked'));
      return new Response(JSON.stringify({message:'Geschützte Vorschau: Bearbeitung zuerst freigeben.',error:'preview_read_only',code:'PREVIEW_READ_ONLY'}), {status:403,headers:{'Content-Type':'application/json'}});
    }
    return originalFetch(input, init);
  };
  addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.className = 'preview-protection';
    bar.innerHTML = '<span>🔒 Geschützte Vorschau · echte Clubdaten</span><button type="button">Bearbeitung freigeben</button>';
    document.body.append(bar);
    bar.querySelector('button').addEventListener('click', () => {
      if (editing) { editing=false; update(); return; }
      if (confirm('Live-Bearbeitung aktivieren? Speichern, Löschen, Uploads und Live-Sessions ändern dann dieselben Daten wie die bestehende Website. Nur für diese geöffnete Vorschau freigeben?')) {editing=true;update();}
    });
    function update() {
      bar.classList.toggle('editing', editing);
      bar.querySelector('span').textContent = editing ? '● Live-Bearbeitung · Änderungen betreffen eure echten Daten' : '🔒 Geschützte Vorschau · echte Clubdaten';
      bar.querySelector('button').textContent = editing ? 'Bearbeitung sperren' : 'Bearbeitung freigeben';
    }
    addEventListener('preview-write-blocked', () => {bar.classList.add('blocked');setTimeout(()=>bar.classList.remove('blocked'),2000);});
  });
})();
