/* ══════════════════════════════════════════════════
   db.js — Supabase + localStorage fallback
   ══════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://wswftfvnuepspvtyymrf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzd2Z0ZnZudWVwc3B2dHl5bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM0ODUsImV4cCI6MjA5NzMxOTQ4NX0.xa7lDUsTBJK0toe5DV5WPl2y24A1EuQ6tFR34GdO1lI';
const TABLE      = 'paises';
const LS_KEY     = 'polComp_v2';

let _useCloud = false;

async function initDB() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?limit=1`, {
      headers: _headers()
    });
    if (r.ok) { _useCloud = true; }
  } catch (_) { _useCloud = false; }
  return _useCloud;
}

function isCloud() { return _useCloud; }

function _headers(extra = {}) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

/* ── localStorage helpers ── */
function _lsGetAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function _lsSet(all) { localStorage.setItem(LS_KEY, JSON.stringify(all)); }

/* ── GET ALL ── */
async function dbGetAll() {
  if (_useCloud) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=pais_id,datos`, {
      headers: _headers()
    });
    if (!r.ok) return {};
    const rows = await r.json();
    const out = {};
    rows.forEach(row => { out[row.pais_id] = row.datos; });
    return out;
  }
  return _lsGetAll();
}

/* ── GET ONE ── */
async function dbGet(id) {
  if (_useCloud) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?pais_id=eq.${encodeURIComponent(id)}&select=datos`,
      { headers: _headers() }
    );
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0]?.datos ?? null;
  }
  return _lsGetAll()[id] ?? null;
}

/* ── SAVE (upsert) ── */
async function dbSave(id, data) {
  if (_useCloud) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: _headers({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify({
        pais_id: id,
        datos: data,
        updated_at: new Date().toISOString()
      })
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(err);
    }
    return;
  }
  const all = _lsGetAll();
  all[id] = data;
  _lsSet(all);
}

/* ── DELETE ── */
async function dbDelete(id) {
  if (_useCloud) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?pais_id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE', headers: _headers() }
    );
    return;
  }
  const all = _lsGetAll();
  delete all[id];
  _lsSet(all);
}

/* ── EXPORT ── */
async function dbExport() {
  const data = await dbGetAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `politica-comparada-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

/* ── IMPORT ── */
async function dbImport(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  let count = 0;
  for (const [id, val] of Object.entries(data)) {
    await dbSave(id, val);
    count++;
  }
  return count;
}

/* ── REALTIME (polling cada 15s si es cloud) ── */
function dbOnChange(callback) {
  if (!_useCloud) return;
  setInterval(callback, 15000);
}
