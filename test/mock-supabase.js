// Test double for the production Supabase project. Loaded before the app by
// test/server.py: every REST, storage and realtime call to the real backend is
// answered from an in-browser copy of a backup, so nothing reaches production.
(() => {
  const ORIGIN = 'https://okgvubkibtkgcofkdpsd.supabase.co';
  const KEY = '__mock_supabase_db';
  const realFetch = window.fetch.bind(window);
  const log = (window.__mockLog = []);
  window.__mockRealRequests = [];

  // --- database state (persisted in localStorage so reloads keep test data) ---
  let db;
  let nextId = 1;
  const ready = (async () => {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch {}
    if (!db) {
      const seed = await realFetch('/__test__/seed.json').then(r => r.json());
      db = { tables: seed.tables, files: Object.fromEntries(seed.photos.map(p => [p, { backup: true, updated_at: seed.backupAt }])) };
      save();
    }
    nextId = 1 + Math.max(0, ...Object.values(db.tables).flat().map(r => (typeof r.id === 'number' ? r.id : 0)));
  })();
  function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
  window.__mockDb = {
    get state() { return db; },
    reset() { localStorage.removeItem(KEY); location.reload(); },
    ready,
  };

  // --- PostgREST subset used by the app ---
  const parseValue = v => (v === 'null' ? null : v);
  const eqLoose = (a, b) => (a === null || b === null ? a === b : String(a) === String(b));
  function filters(params) {
    const out = [];
    for (const [col, expr] of params) {
      if (['select', 'order', 'limit', 'offset', 'columns', 'on_conflict'].includes(col)) continue;
      const m = expr.match(/^(not\.)?(eq|neq|in|is|gt|gte|lt|lte)\.(.*)$/);
      if (!m) throw new Error('Unsupported filter ' + col + '=' + expr);
      const [, not, op, raw] = m;
      const test = row => {
        const v = row[col];
        switch (op) {
          case 'eq': return eqLoose(v, parseValue(raw));
          case 'neq': return !eqLoose(v, parseValue(raw));
          case 'is': return raw === 'null' ? v == null : String(v) === raw;
          case 'in': return raw.replace(/^\(|\)$/g, '').split(',').map(s => s.replace(/^"|"$/g, '')).some(x => eqLoose(v, x));
          case 'gt': return v > raw; case 'gte': return v >= raw;
          case 'lt': return v < raw; case 'lte': return v <= raw;
        }
      };
      out.push(not ? r => !test(r) : test);
    }
    return row => out.every(f => f(row));
  }
  function project(rows, select) {
    if (!select || select === '*') return rows.map(r => ({ ...r }));
    const cols = select.split(',').map(s => s.trim());
    return rows.map(r => Object.fromEntries(cols.map(c => [c, r[c] ?? null])));
  }
  function order(rows, spec) {
    if (!spec) return rows;
    const keys = spec.split(',').map(s => { const [c, dir] = s.split('.'); return [c, dir === 'desc' ? -1 : 1]; });
    return [...rows].sort((a, b) => {
      for (const [c, d] of keys) { if (a[c] < b[c]) return -d; if (a[c] > b[c]) return d; }
      return 0;
    });
  }
  function defaults(table, row) {
    const r = { ...row };
    if (r.id === undefined) r.id = ['live_session_events', 'seating_history'].includes(table) ? nextId++ : crypto.randomUUID();
    if (r.created_at === undefined) r.created_at = new Date().toISOString();
    return r;
  }
  const json = (body, status = 200, headers = {}) =>
    new Response(body === null ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

  function rest(method, url, headers, body) {
    const table = url.pathname.replace('/rest/v1/', '');
    if (!db.tables[table]) db.tables[table] = [];
    const rows = db.tables[table];
    const params = [...url.searchParams];
    const match = filters(params);
    const prefer = headers.get('prefer') || '';
    const wantsRep = prefer.includes('return=representation');
    const single = (headers.get('accept') || '').includes('vnd.pgrst.object');
    const select = url.searchParams.get('select');
    const reply = result => {
      if (single) {
        if (result.length !== 1) return json({ code: 'PGRST116', details: `The result contains ${result.length} rows`, message: 'JSON object requested, multiple (or no) rows returned' }, 406);
        return json(result[0]);
      }
      return json(result);
    };
    let changed = [];
    if (method === 'GET' || method === 'HEAD') return reply(project(order(rows.filter(match), url.searchParams.get('order')), select));
    if (method === 'POST') {
      const list = (Array.isArray(body) ? body : [body]).map(r => defaults(table, r));
      const upsert = prefer.includes('resolution=merge-duplicates');
      const key = url.searchParams.get('on_conflict') || 'id';
      for (const r of list) {
        const i = upsert ? rows.findIndex(x => eqLoose(x[key], r[key])) : -1;
        if (i >= 0) { const old = rows[i]; rows[i] = { ...old, ...r }; changed.push(['UPDATE', rows[i], old]); }
        else {
          if (rows.some(x => eqLoose(x.id, r.id))) return json({ code: '23505', message: 'duplicate key value violates unique constraint' }, 409);
          rows.push(r); changed.push(['INSERT', r, {}]);
        }
      }
    } else if (method === 'PATCH') {
      rows.forEach((r, i) => { if (match(r)) { const old = r; rows[i] = { ...r, ...body }; changed.push(['UPDATE', rows[i], old]); } });
    } else if (method === 'DELETE') {
      const keep = [];
      rows.forEach(r => (match(r) ? changed.push(['DELETE', {}, r]) : keep.push(r)));
      db.tables[table] = keep;
    }
    save();
    changed.forEach(([type, n, o]) => realtime.emit(table, type, n, o));
    const result = changed.map(([t, n, o]) => (t === 'DELETE' ? o : n));
    if (!wantsRep && !single) return new Response(null, { status: method === 'POST' ? 201 : 204 });
    return reply(project(result, select));
  }

  // --- storage subset ---
  const uploads = {};
  window.__mockUploads = uploads;
  async function storage(method, url, headers, init) {
    const p = decodeURIComponent(url.pathname.replace('/storage/v1/', ''));
    if (method === 'POST' && p === 'object/list/poker-photos') {
      const { prefix = '' } = JSON.parse(init.body || '{}');
      const items = Object.entries(db.files)
        .filter(([name]) => name.startsWith(prefix + '/') && !name.slice(prefix.length + 1).includes('/'))
        .map(([name, f]) => ({ name: name.slice(prefix.length + 1), id: name, updated_at: f.updated_at, created_at: f.updated_at, metadata: { size: f.size || 1, mimetype: f.type || 'image/jpeg' } }));
      return json(items);
    }
    if (method === 'DELETE' && p === 'object/poker-photos') {
      const { prefixes = [] } = JSON.parse(init.body || '{}');
      const removed = prefixes.filter(x => db.files[x]);
      removed.forEach(x => { delete db.files[x]; delete uploads[x]; });
      save();
      return json(removed.map(name => ({ name })));
    }
    if ((method === 'POST' || method === 'PUT') && p.startsWith('object/poker-photos/')) {
      const name = p.slice('object/poker-photos/'.length);
      let blob = init.body;
      if (blob instanceof FormData) blob = [...blob.values()].find(v => v instanceof Blob);
      if (!(blob instanceof Blob)) blob = new Blob([blob]);
      if (db.files[name] && !(headers.get('x-upsert') === 'true')) return json({ statusCode: '409', error: 'Duplicate', message: 'The resource already exists' }, 400);
      uploads[name] = URL.createObjectURL(blob);
      db.files[name] = { updated_at: new Date().toISOString(), size: blob.size, type: blob.type };
      save();
      return json({ Key: 'poker-photos/' + name, Id: name });
    }
    if (method === 'GET' && p.startsWith('object/public/poker-photos/')) return realFetch(photoUrl(p.slice('object/public/poker-photos/'.length)));
    return json({ message: 'mock: unsupported storage call ' + method + ' ' + p }, 400);
  }
  // Images are loaded by <img>, not fetch: point them at the backup copy or the test upload.
  function photoUrl(name) {
    name = decodeURIComponent(name.split('?')[0]);
    return uploads[name] || (db.files[name] ? '/__test__/photos/' + name : '/__test__/missing.svg');
  }
  const PUBLIC = ORIGIN + '/storage/v1/object/public/poker-photos/';
  const rewrite = el => { const s = el.getAttribute && el.getAttribute('src'); if (s && s.startsWith(PUBLIC)) el.setAttribute('src', photoUrl(s.slice(PUBLIC.length))); };
  const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    get() { return srcDesc.get.call(this); },
    set(v) { srcDesc.set.call(this, typeof v === 'string' && v.startsWith(PUBLIC) ? photoUrl(v.slice(PUBLIC.length)) : v); },
  });
  const realSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    if (n === 'src' && this instanceof HTMLImageElement && typeof v === 'string' && v.startsWith(PUBLIC)) v = photoUrl(v.slice(PUBLIC.length));
    return realSetAttr.call(this, n, v);
  };
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { rewrite(n); n.querySelectorAll?.('img').forEach(rewrite); } })))
    .observe(document.documentElement, { childList: true, subtree: true });

  // --- fetch interception ---
  window.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : null;
    const url = new URL(req ? req.url : String(input), location.href);
    if (url.origin !== ORIGIN) return realFetch(input, init);
    await ready;
    const method = (init.method || req?.method || 'GET').toUpperCase();
    const headers = new Headers(init.headers || req?.headers);
    let body = init.body;
    if (body === undefined && req && !['GET', 'HEAD'].includes(method)) body = await req.text();
    const entry = { method, path: url.pathname + url.search };
    log.push(entry);
    try {
      if (url.pathname.startsWith('/rest/v1/')) {
        const parsed = typeof body === 'string' && body ? JSON.parse(body) : body;
        const res = rest(method, url, headers, parsed);
        entry.status = res.status;
        return res;
      }
      if (url.pathname.startsWith('/storage/v1/')) return storage(method, url, headers, { body });
      if (url.pathname.startsWith('/auth/v1/')) return json({});
    } catch (e) {
      entry.error = String(e);
      console.error('[mock-supabase]', e);
      return json({ message: String(e) }, 500);
    }
    // Anything else would be a real request: refuse instead of touching production.
    window.__mockRealRequests.push(entry);
    return json({ message: 'mock: blocked ' + url.pathname }, 501);
  };

  // --- realtime (Phoenix channels, serializer 1.0.0 and 2.0.0) ---
  const sockets = new Set();
  const realtime = {
    emit(table, eventType, record, old) {
      for (const s of sockets) s.emitChange(table, eventType, record, old);
    },
  };
  const RealWS = window.WebSocket;
  class MockSocket extends EventTarget {
    constructor(url) {
      super();
      this.url = url; this.readyState = 0; this.binaryType = 'blob';
      this.v2 = !String(url).includes('vsn=1.0.0');
      this.bindings = []; // {id, topic, event, schema, table, filter}
      sockets.add(this);
      setTimeout(() => { this.readyState = 1; this._fire('open', new Event('open')); }, 5);
    }
    _fire(type, ev) { this.dispatchEvent(ev); const h = this['on' + type]; if (h) h.call(this, ev); }
    _push(join_ref, ref, topic, event, payload) {
      const data = this.v2 ? JSON.stringify([join_ref, ref, topic, event, payload]) : JSON.stringify({ join_ref, ref, topic, event, payload });
      setTimeout(() => this._fire('message', new MessageEvent('message', { data })), 1);
    }
    send(raw) {
      if (typeof raw !== 'string') return;
      const m = JSON.parse(raw);
      const [join_ref, ref, topic, event, payload] = Array.isArray(m) ? m : [m.join_ref, m.ref, m.topic, m.event, m.payload];
      if (event === 'phx_join') {
        const pcs = (payload?.config?.postgres_changes || []).map(b => {
          const id = nextId++;
          this.bindings.push({ id, topic, ...b });
          return { id, ...b };
        });
        this._push(join_ref, ref, topic, 'phx_reply', { status: 'ok', response: { postgres_changes: pcs } });
      } else if (event === 'phx_leave') {
        this.bindings = this.bindings.filter(b => b.topic !== topic);
        this._push(join_ref, ref, topic, 'phx_reply', { status: 'ok', response: {} });
      } else {
        this._push(join_ref, ref, topic, 'phx_reply', { status: 'ok', response: {} });
      }
    }
    emitChange(table, eventType, record, old) {
      const byTopic = {};
      for (const b of this.bindings) {
        if (b.table !== table || !(b.event === '*' || b.event === eventType)) continue;
        (byTopic[b.topic] ||= []).push(b.id);
      }
      for (const [topic, ids] of Object.entries(byTopic)) {
        this._push(null, null, topic, 'postgres_changes', {
          ids,
          data: { schema: 'public', table, commit_timestamp: new Date().toISOString(), eventType, type: eventType, new: record, old, record, old_record: old, columns: [], errors: null },
        });
      }
    }
    close() { this.readyState = 3; sockets.delete(this); this._fire('close', new CloseEvent('close', { code: 1000 })); }
  }
  MockSocket.CONNECTING = 0; MockSocket.OPEN = 1; MockSocket.CLOSING = 2; MockSocket.CLOSED = 3;
  window.WebSocket = function (url, protocols) {
    if (String(url).includes('okgvubkibtkgcofkdpsd.supabase.co')) return new MockSocket(url);
    return new RealWS(url, protocols);
  };
  Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });

  // Visible marker so a test page can never be mistaken for the live site.
  addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.textContent = 'TESTUMGEBUNG · Kopie vom Backup · keine echten Daten';
    b.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:99999;background:#d97706;color:#fff;font:600 11px system-ui;padding:3px 10px;border-radius:0 0 6px 6px;pointer-events:none';
    document.body.append(b);
  });
})();
