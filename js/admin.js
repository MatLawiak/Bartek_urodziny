// ============================================================
//  BARTEK 40 — admin.js
// ============================================================

const SESSION_KEY = 'bartek40_admin';

let allRSVPs = [];

// ============================================================
//  LOGIN
// ============================================================
function initLogin() {
  const form     = document.getElementById('loginForm');
  const errorEl  = document.getElementById('loginError');

  // Sprawdź sesję
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showDashboard();
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    if (user === CONFIG.ADMIN_USERNAME && pass === CONFIG.ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      errorEl.textContent = '';
      showDashboard();
    } else {
      errorEl.textContent = '❌ Nieprawidłowy login lub hasło. Wskazówka: imię Jubilata i temat urodzin 😉';
      document.getElementById('loginPass').value = '';
      document.getElementById('loginPass').focus();
    }
  });
}

// ============================================================
//  DASHBOARD
// ============================================================
function showDashboard() {
  document.getElementById('loginScreen').style.display    = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';

  loadRSVPs();
}

function hideDashboard() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display    = 'flex';
  document.getElementById('loginPass').value = '';
}

// ============================================================
//  LOAD RSVPs
// ============================================================
async function loadRSVPs() {
  const tbody = document.getElementById('rsvpTableBody');
  const demoEl = document.getElementById('demoBanner');

  if (!CONFIG.BACKEND_URL) {
    // Demo mode
    if (demoEl) demoEl.style.display = 'block';
    allRSVPs = getDemoData();
    renderTable(allRSVPs);
    updateStats(allRSVPs);
    return;
  }

  if (demoEl) demoEl.style.display = 'none';

  try {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 2rem;">Ładowanie...</td></tr>`;

    const res  = await fetch(CONFIG.BACKEND_URL + '?action=list&key=' + encodeURIComponent(CONFIG.ADMIN_PASSWORD));
    const json = await res.json();

    allRSVPs = json.list || [];
    renderTable(allRSVPs);
    updateStats(allRSVPs);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #f08080; padding: 2rem;">
      Błąd ładowania danych. Sprawdź połączenie i URL backendu.
    </td></tr>`;
  }
}

function getDemoData() {
  return [
    { timestamp: new Date('2026-03-15T14:32:00'), firstName: 'Anna',    lastName: 'Kowalska',  companions: 1, total: 2 },
    { timestamp: new Date('2026-03-16T09:15:00'), firstName: 'Marek',   lastName: 'Nowak',     companions: 0, total: 1 },
    { timestamp: new Date('2026-03-16T18:45:00'), firstName: 'Kasia',   lastName: 'Wiśniewska',companions: 2, total: 3 },
    { timestamp: new Date('2026-03-17T10:20:00'), firstName: 'Tomek',   lastName: 'Zielinski', companions: 1, total: 2 },
  ];
}

// ============================================================
//  RENDER TABLE
// ============================================================
function renderTable(data) {
  const tbody = document.getElementById('rsvpTableBody');

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="admin-empty">
            <div class="empty-icon">📭</div>
            <p>Brak potwierdzeń — jeszcze. Poczekaj na gości!</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map((r, i) => {
    const date = r.timestamp
      ? new Date(r.timestamp).toLocaleString('pl-PL', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : '—';

    const companions = parseInt(r.companions) || 0;
    const compText   = companions === 0
      ? '<span style="color: var(--text-muted)">solo</span>'
      : `+${companions}`;

    return `<tr>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
      <td><strong>${escHtml(r.firstName)} ${escHtml(r.lastName)}</strong></td>
      <td>${compText}</td>
      <td><span class="badge">${r.total || 1 + companions} os.</span></td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${date}</td>
    </tr>`;
  }).join('');
}

// ============================================================
//  STATS
// ============================================================
function updateStats(data) {
  const rsvpCount   = data.length;
  const peopleCount = data.reduce((sum, r) => sum + (parseInt(r.total) || 1), 0);
  const maxCapacity = 60;
  const spotsLeft   = Math.max(0, maxCapacity - peopleCount);

  setStatEl('statRSVPs',   rsvpCount);
  setStatEl('statPeople',  peopleCount);
  setStatEl('statSpotsLeft', spotsLeft);
}

function setStatEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ============================================================
//  CSV EXPORT
// ============================================================
function exportCSV() {
  if (!allRSVPs.length) {
    alert('Brak danych do eksportu.');
    return;
  }

  const header = ['Lp.', 'Imię', 'Nazwisko', 'Towarzyszące', 'Łącznie', 'Data potwierdzenia'];
  const rows   = allRSVPs.map((r, i) => [
    i + 1,
    r.firstName,
    r.lastName,
    r.companions,
    r.total,
    r.timestamp ? new Date(r.timestamp).toLocaleString('pl-PL') : '',
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bartek40_RSVP_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
//  UTILS
// ============================================================
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initLogin();

  document.getElementById('btnLogout')?.addEventListener('click', hideDashboard);
  document.getElementById('btnRefresh')?.addEventListener('click', loadRSVPs);
  document.getElementById('btnCSV')?.addEventListener('click', exportCSV);
});
