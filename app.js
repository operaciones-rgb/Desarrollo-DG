const APPS_SCRIPT_URL = 'https://script.google.com/a/macros/imporvid.mx/s/AKfycbzEq_JZ3wm4_wwQKH9FMHDAi3dqagt5kGksaCIlghYHnPaICqwpbxuLr43GJvdqMftNmA/exec';

// ── STATE ─────────────────────────────────────────────────────────────────
let state = {};

function loadState() {
  try { state = JSON.parse(localStorage.getItem('dg_tracker_v1') || '{}'); } catch(e) { state = {}; }
}

function saveState() {
  try { localStorage.setItem('dg_tracker_v1', JSON.stringify(state)); } catch(e) {}
  showSaveIndicator();
  if (APPS_SCRIPT_URL) syncToSheets();
}

async function syncToSheets() {
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'progress', data: state })
    });
  } catch(e) { console.warn('Sheets sync failed:', e); }
}

function showSaveIndicator() {
  let el = document.getElementById('save-indicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'save-indicator';
    el.className = 'save-indicator';
    el.textContent = '✓ Guardado';
    document.body.appendChild(el);
  }
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

// ── WEEK UTILS ────────────────────────────────────────────────────────────
function currentWeekNum() {
  const now = new Date();
  const diff = Math.floor((now - START_DATE) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

function weekDateRange(n) {
  const s = new Date(START_DATE);
  s.setDate(s.getDate() + (n - 1) * 7);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  const fmt = d => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  return `${fmt(s)} – ${fmt(e)}`;
}

// ── ITEMS ─────────────────────────────────────────────────────────────────
function allItems() {
  const items = [];
  PHASES.forEach(ph => ph.weeks.forEach(wk => wk.items.forEach(it => items.push({ ...it, phase: ph.id }))));
  return items;
}

function phaseItems(phId) {
  const ph = PHASES.find(p => p.id === phId);
  const items = [];
  ph.weeks.forEach(wk => wk.items.forEach(it => items.push(it)));
  return items;
}

function phaseDone(phId) { return phaseItems(phId).filter(it => state[it.id]).length; }
function phaseTotal(phId) { return phaseItems(phId).length; }

// ── RENDER ────────────────────────────────────────────────────────────────
let currentFilter = 'all';

function renderKPIs() {
  const all = allItems();
  const total = all.length;
  const done = all.filter(it => state[it.id]).length;
  const pct = Math.round(done / total * 100);

  document.getElementById('kpi-pct').textContent = pct + '%';
  document.getElementById('kpi-done').textContent = `${done} / ${total}`;

  const wn = currentWeekNum();
  document.getElementById('current-week').textContent = wn;
  document.getElementById('modal-week-num').textContent = wn;
  document.getElementById('modal-week-dates').textContent = weekDateRange(wn);

  // Active phase
  let activePhase = 'Fase 1';
  if (wn >= 49) activePhase = 'Fase 3';
  else if (wn >= 21) activePhase = 'Fase 2';
  document.getElementById('kpi-fase').textContent = activePhase;

  // Reto countdown
  const reto = RETOS[0];
  const deadline = new Date(reto.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (24 * 60 * 60 * 1000));
  document.getElementById('kpi-reto-days').textContent = daysLeft > 0 ? `${daysLeft} días` : 'Vencido';
  document.getElementById('reto-deadline').textContent = `Entrega: ${deadline.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  // Progress bars
  const bars = [
    { id: 'f1', progId: 'prog-f1', txtId: 'prog-f1-txt' },
    { id: 'f2', progId: 'prog-f2', txtId: 'prog-f2-txt' },
    { id: 'f3', progId: 'prog-f3', txtId: 'prog-f3-txt' },
    { id: 'co', progId: 'prog-co', txtId: 'prog-co-txt' },
  ];
  bars.forEach(b => {
    const d = phaseDone(b.id), t = phaseTotal(b.id);
    const p = Math.round(d / t * 100);
    document.getElementById(b.progId).style.width = p + '%';
    document.getElementById(b.txtId).textContent = p + '%';
  });
}

function renderChecklist() {
  const wn = currentWeekNum();
  const container = document.getElementById('checklist-container');

  let phases = currentFilter === 'all' ? PHASES :
               currentFilter === 'now' ? PHASES :
               PHASES.filter(p => p.id === currentFilter);

  let html = '';

  phases.forEach(ph => {
    const d = phaseDone(ph.id), t = phaseTotal(ph.id);

    let weeks = ph.weeks;
    if (currentFilter === 'now') {
      weeks = ph.weeks.filter((wk, wi) => {
        const nextW = ph.weeks[wi + 1] ? ph.weeks[wi + 1].w : ph.endWeek + 1;
        return wn >= wk.w && wn < nextW;
      });
      if (!weeks.length) return;
    }

    html += `<div class="phase-block">
      <div class="phase-header">
        <span class="phase-title ${ph.color}">${ph.label}</span>
        <span class="phase-meta">${d} / ${t} completados</span>
      </div>`;

    weeks.forEach((wk, wi) => {
      const nextW = ph.weeks[wi + 1] ? ph.weeks[wi + 1].w : ph.endWeek + 1;
      const isCurrent = wn >= wk.w && wn < nextW;

      html += `<div class="week-group">
        <div class="week-label">
          ${wk.label} &nbsp; ${wk.start} – ${wk.end}
          ${isCurrent ? '<span class="current-week-badge">en curso</span>' : ''}
        </div>`;

      wk.items.forEach(it => {
        const checked = !!state[it.id];
        const tagClass = { curso: 'tag-curso', libro: 'tag-libro', accion: 'tag-accion', cert: 'tag-cert' }[it.tag] || 'tag-accion';
        const tagLabel = { curso: 'Curso', libro: 'Libro', accion: 'Acción', cert: 'Cert' }[it.tag] || it.tag;
        const link = it.url ? `<a href="${it.url}" target="_blank" rel="noopener" class="item-link" onclick="event.stopPropagation()" title="Abrir enlace">↗</a>` : '';

        html += `<div class="item${checked ? ' done' : ''}${isCurrent ? ' active-week' : ''}" onclick="toggleItem('${it.id}')">
          <div class="cb${checked ? ' checked' : ''}"></div>
          <div class="item-body">
            <div class="item-title">${it.t}</div>
            <div class="item-meta">
              <span class="tag ${tagClass}">${tagLabel}</span>
              <span class="item-dates">${it.dur}</span>
            </div>
          </div>
          ${link}
        </div>`;
      });

      html += '</div>';
    });

    html += '</div>';
  });

  if (!html) {
    html = '<p style="color:var(--text3);font-size:14px;padding:2rem 0">No hay items para mostrar en este filtro.</p>';
  }

  container.innerHTML = html;
}

function toggleItem(id) {
  state[id] = !state[id];
  saveState();
  renderKPIs();
  renderChecklist();
}

// ── TABS ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.phase;
    renderChecklist();
  });
});

// ── CHECK-IN MODAL ────────────────────────────────────────────────────────
function openCheckin() {
  document.getElementById('checkin-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  resetCheckinForm();
}

function closeCheckin() {
  document.getElementById('checkin-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function resetCheckinForm() {
  ['q1','q2','q3','q4'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  document.getElementById('coach-response').classList.add('hidden');
  document.getElementById('checkin-btn-text').textContent = 'Enviar al coach';
  document.getElementById('checkin-spinner').classList.add('hidden');
  document.getElementById('checkin-submit-btn').disabled = false;
}

async function submitCheckin() {
  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value.trim();
  const q3 = document.getElementById('q3').value.trim();
  const q4 = document.getElementById('q4').value.trim();

  if (!q1 && !q2 && !q3 && !q4) {
    alert('Escribe al menos una respuesta para continuar.');
    return;
  }

  const wn = currentWeekNum();
  const btn = document.getElementById('checkin-submit-btn');
  btn.disabled = true;
  document.getElementById('checkin-btn-text').textContent = 'Enviando...';
  document.getElementById('checkin-spinner').classList.remove('hidden');

  const all = allItems();
  const done = all.filter(it => state[it.id]).length;
  const pct = Math.round(done / all.length * 100);

  // Save to Sheets
  if (APPS_SCRIPT_URL) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkin',
          week: wn,
          date: new Date().toISOString(),
          q1, q2, q3, q4,
          progressPct: pct
        })
      });
    } catch(e) { console.warn('Sheets checkin sync failed:', e); }
  }

  // Get coaching response from Claude API
  const prompt = buildCheckinPrompt(wn, q1, q2, q3, q4, pct);
  const response = await callCoachAPI(prompt);

  document.getElementById('checkin-btn-text').textContent = 'Enviado ✓';
  document.getElementById('checkin-spinner').classList.add('hidden');

  document.getElementById('coach-bubble').textContent = response;
  document.getElementById('coach-response').classList.remove('hidden');
}

// ── RETO MODAL ────────────────────────────────────────────────────────────
function openReto() {
  document.getElementById('reto-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReto() {
  document.getElementById('reto-modal').classList.remove('open');
  document.body.style.overflow = '';
}

async function submitReto() {
  const input = document.getElementById('reto-input').value.trim();
  if (!input) { alert('Describe tu trabajo para continuar.'); return; }

  const btn = document.getElementById('reto-submit-btn');
  btn.disabled = true;
  document.getElementById('reto-btn-text').textContent = 'Enviando...';
  document.getElementById('reto-spinner').classList.remove('hidden');

  if (APPS_SCRIPT_URL) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reto', month: 1, date: new Date().toISOString(), content: input })
      });
    } catch(e) {}
  }

  const prompt = buildRetoPrompt(input);
  const response = await callCoachAPI(prompt);

  document.getElementById('reto-btn-text').textContent = 'Enviado ✓';
  document.getElementById('reto-spinner').classList.add('hidden');
  document.getElementById('reto-bubble').textContent = response;
  document.getElementById('reto-response').classList.remove('hidden');
}

// ── CLAUDE API ────────────────────────────────────────────────────────────
async function callCoachAPI(prompt) {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.response || 'No pude generar una respuesta. Intenta de nuevo.';
  } catch(e) {
    return 'Error al conectar con el coach. Verifica tu conexión e intenta de nuevo.';
  }
}

function buildCheckinPrompt(week, q1, q2, q3, q4, pct) {
  return `Eres un coach ejecutivo experto ayudando a Rodrigo Pedroza en su plan de desarrollo para llegar a Dirección General. Rodrigo trabaja en IMPORVID SAPI DE CV en Monterrey y también hace coaching ejecutivo a mandos medios (programa HUERPEL). Lleva ${week} semanas en el programa y va en ${pct}% de avance total.

Check-in semanal — Semana ${week}:

1. ¿Qué completó esta semana? ${q1 || '(no respondió)'}
2. ¿Qué no pudo hacer y por qué? ${q2 || '(no respondió)'}
3. ¿Qué insight ejecutivo se lleva? ${q3 || '(no respondió)'}
4. ¿Cómo lo aplicó en su trabajo real? ${q4 || '(no respondió)'}

Responde como su coach ejecutivo personal: directo, exigente pero empático. Máximo 4 párrafos. Valida lo que logró, confronta constructivamente lo que no hizo, conecta sus aprendizajes con el objetivo de DG, y dale UNA acción concreta y específica para la siguiente semana. No uses bullet points ni encabezados — solo prosa directa.`;
}

function buildRetoPrompt(content) {
  return `Eres un coach ejecutivo experto evaluando el primer reto mensual de Rodrigo Pedroza, quien trabaja hacia un rol de Dirección General. El reto era: preparar un diagnóstico financiero ejecutivo de IMPORVID SAPI DE CV como si se lo presentara al consejo de administración (5 slides con P&L, flujo de caja, 3 riesgos y 2 oportunidades).

Rodrigo entregó lo siguiente:
${content}

Evalúa como coach ejecutivo senior: ¿qué pensó bien? ¿qué pensó como operativo y no como DG? ¿qué le falta para tener una perspectiva de consejo? Sé directo y específico. Máximo 4 párrafos, sin bullet points. Termina con una pregunta poderosa que lo haga reflexionar profundamente.`;
}

// Close modals on overlay click
document.getElementById('checkin-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('checkin-modal')) closeCheckin();
});
document.getElementById('reto-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('reto-modal')) closeReto();
});

// ── INIT ──────────────────────────────────────────────────────────────────
loadState();
renderKPIs();
renderChecklist();
