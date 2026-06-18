/* ══════════════════════════════════════════════════
   app.js — Lógica compartida (auth, utilidades)
   ══════════════════════════════════════════════════ */

const USUARIOS = [
  { username: 'Mariano',       password: 'greninja8124', nombre: 'Mariano' },
  { username: 'Carmen',        password: '12345',        nombre: 'Carmen' },
  { username: 'Padrecito123',  password: '12345',        nombre: 'Padrecito123' },
  { username: 'Leonardo',      password: '12345',        nombre: 'Leonardo' },
];

const PAISES = {
  '032': { nombre: 'Argentina',            emoji: '🇦🇷' },
  '068': { nombre: 'Bolivia',              emoji: '🇧🇴' },
  '076': { nombre: 'Brasil',               emoji: '🇧🇷' },
  '084': { nombre: 'Belice',               emoji: '🇧🇿' },
  '152': { nombre: 'Chile',                emoji: '🇨🇱' },
  '170': { nombre: 'Colombia',             emoji: '🇨🇴' },
  '188': { nombre: 'Costa Rica',           emoji: '🇨🇷' },
  '192': { nombre: 'Cuba',                 emoji: '🇨🇺' },
  '214': { nombre: 'Rep. Dominicana',      emoji: '🇩🇴' },
  '218': { nombre: 'Ecuador',              emoji: '🇪🇨' },
  '222': { nombre: 'El Salvador',          emoji: '🇸🇻' },
  '320': { nombre: 'Guatemala',            emoji: '🇬🇹' },
  '332': { nombre: 'Haití',                emoji: '🇭🇹' },
  '340': { nombre: 'Honduras',             emoji: '🇭🇳' },
  '388': { nombre: 'Jamaica',              emoji: '🇯🇲' },
  '484': { nombre: 'México',               emoji: '🇲🇽' },
  '558': { nombre: 'Nicaragua',            emoji: '🇳🇮' },
  '591': { nombre: 'Panamá',              emoji: '🇵🇦' },
  '600': { nombre: 'Paraguay',             emoji: '🇵🇾' },
  '604': { nombre: 'Perú',                 emoji: '🇵🇪' },
  '724': { nombre: 'España',              emoji: '🇪🇸' },
  '780': { nombre: 'Trinidad y Tobago',    emoji: '🇹🇹' },
  '858': { nombre: 'Uruguay',              emoji: '🇺🇾' },
  '862': { nombre: 'Venezuela',            emoji: '🇻🇪' },
};

const SESSION_KEY = 'polComp_sesion';

// ── Auth ─────────────────────────────────────────────
function login(username, password) {
  const u = USUARIOS.find(x => x.username === username && x.password === password);
  if (!u) return null;
  const s = { username: u.username, nombre: u.nombre, ts: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

function getSesion() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function requireAuth() {
  const s = getSesion();
  if (!s) { window.location.href = 'index.html'; return null; }
  return s;
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, type = 'ok', ms = 3000) {
  let wrap = document.getElementById('toastArea');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastArea';
    wrap.className = 'toast-area';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = 'all .2s'; setTimeout(() => t.remove(), 200); }, ms);
}

// ── Utilidades ────────────────────────────────────────
function formatFecha(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-ES',
      { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}
