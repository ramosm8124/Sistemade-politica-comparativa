/*  db.js — Capa de base de datos
    Si Firebase está configurado → Firestore (compartido entre todos)
    Si no → localStorage (solo local, modo sin conexión)              */

let _db        = null;
let _useCloud  = false;
let _dbReady   = false;

const LOCAL_KEY = 'polComp_v2';

async function initDB() {
  try {
    const cfg = window.FIREBASE_CONFIG;
    if (cfg && cfg.apiKey && cfg.apiKey !== 'SIN_CONFIGURAR') {
      firebase.initializeApp(cfg);
      _db       = firebase.firestore();
      _useCloud = true;
      _dbReady  = true;
      // Test de conexión rápido
      await _db.collection('_ping').doc('ok').set({ ts: Date.now() });
      console.log('%c[DB] Firebase conectado ✓', 'color:#34d399;font-weight:bold');
    } else {
      _dbReady = true;
      console.log('%c[DB] Modo local (localStorage)', 'color:#fbbf24;font-weight:bold');
    }
  } catch (e) {
    _useCloud = false;
    _dbReady  = true;
    console.warn('[DB] Firebase falló, usando localStorage:', e.message);
  }
  return _useCloud;
}

function isCloud() { return _useCloud; }

// ── CRUD de países ────────────────────────────────────

async function dbGetAll() {
  if (_useCloud) {
    const snap = await _db.collection('paises').get();
    const out = {};
    snap.forEach(d => { out[d.id] = d.data(); });
    return out;
  }
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
}

async function dbGet(id) {
  if (_useCloud) {
    const d = await _db.collection('paises').doc(String(id)).get();
    return d.exists ? d.data() : null;
  }
  return (JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'))[id] || null;
}

async function dbSave(id, data) {
  if (_useCloud) {
    await _db.collection('paises').doc(String(id)).set(data);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  all[id] = data;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

async function dbDelete(id) {
  if (_useCloud) {
    await _db.collection('paises').doc(String(id)).delete();
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  delete all[id];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

async function dbExport() {
  const all = await dbGetAll();
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
  const a    = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(blob),
    download: `politica_comparada_${new Date().toISOString().slice(0,10)}.json`
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

async function dbImport(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const ids  = Object.keys(data);
  for (const id of ids) await dbSave(id, data[id]);
  return ids.length;
}

// ── Suscripción en tiempo real (solo con Firebase) ───
function dbOnChange(callback) {
  if (!_useCloud) return () => {};
  return _db.collection('paises').onSnapshot(() => callback());
}
