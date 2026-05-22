// ── CONFIG ────────────────────────────────────────────────────────────────
// Set these in your Vercel environment variables:
// APPS_SCRIPT_URL  → your Google Apps Script deployment URL
// (Claude API key is handled server-side via /api/coach)

const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || '';

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

// ── ASISTENTE DE DUDAS ────────────────────────────────────────────────────
let askOpen = false;
let askHistory = []; // {role, content}

function toggleAskSection() {
  askOpen = !askOpen;
  const body = document.getElementById('ask-body');
  const chevron = document.getElementById('ask-chevron');
  body.classList.toggle('open', askOpen);
  chevron.classList.toggle('open', askOpen);
}

function openAsk() {
  if (!askOpen) toggleAskSection();
  setTimeout(() => document.getElementById('ask-input')?.focus(), 200);
}

function fillQuestion(text) {
  const ta = document.getElementById('ask-input');
  ta.value = text;
  ta.focus();
}

async function submitAsk() {
  const input = document.getElementById('ask-input');
  const question = input.value.trim();
  if (!question) return;

  input.value = '';
  const btn = document.getElementById('ask-send-btn');
  btn.disabled = true;
  document.getElementById('ask-btn-text').classList.add('hidden');
  document.getElementById('ask-spinner').classList.remove('hidden');

  // Mostrar mensaje del usuario
  appendAskMsg('user', question);

  // Typing indicator
  const typingId = appendTyping();

  // Construir prompt con historial
  askHistory.push({ role: 'user', content: question });

  const systemPrompt = `Eres el coach ejecutivo personal de Rodrigo Pedroza, quien está siguiendo un plan de desarrollo para llegar a Dirección General. Rodrigo trabaja en Monterrey, México, maneja IMPORVID SAPI DE CV (distribución de vino y panaderías Masa Madre) y hace coaching ejecutivo a mandos medios (programa HUERPEL). Su plan incluye cursos en Coursera y edX de universidades como Wharton, Harvard, Stanford, MIT y HEC Paris.

Cuando Rodrigo pregunta sobre inscripciones, cursos o decisiones del programa, responde de forma directa, práctica y amigable. Si pregunta cómo inscribirse a un curso, explica paso a paso. Si tiene dudas sobre pagar vs auditar, oriéntalo (generalmente auditar es suficiente al inicio). Sé conciso — máximo 3-4 párrafos o pasos numerados cuando sea necesario. Sin bullet points excesivos. Habla en español mexicano natural.`;

  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: question,
        system: systemPrompt,
        history: askHistory.slice(-6) // últimas 3 rondas
      })
    });
    const data = await res.json();
    const reply = data.response || 'No pude generar respuesta. Intenta de nuevo.';

    removeTyping(typingId);
    appendAskMsg('coach', reply);
    askHistory.push({ role: 'assistant', content: reply });

  } catch(e) {
    removeTyping(typingId);
    appendAskMsg('coach', 'Error de conexión. Verifica tu internet e intenta de nuevo.');
  }

  btn.disabled = false;
  document.getElementById('ask-btn-text').classList.remove('hidden');
  document.getElementById('ask-spinner').classList.add('hidden');
}

function appendAskMsg(role, text) {
  const conv = document.getElementById('ask-conversation');
  const div = document.createElement('div');
  div.className = `ask-msg ${role}`;
  const avatar = role === 'coach' ? 'Coach' : 'Tú';
  div.innerHTML = `
    <div class="ask-avatar">${avatar}</div>
    <div class="ask-bubble">${text}</div>
  `;
  conv.appendChild(div);
  conv.scrollTop = conv.scrollHeight;
  return div;
}

function appendTyping() {
  const conv = document.getElementById('ask-conversation');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'ask-msg coach';
  div.id = id;
  div.innerHTML = `
    <div class="ask-avatar">Coach</div>
    <div class="ask-bubble">
      <div class="ask-typing"><span></span><span></span><span></span></div>
    </div>`;
  conv.appendChild(div);
  conv.scrollTop = conv.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Enter para enviar (Shift+Enter = nueva línea)
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('ask-input');
  if (ta) {
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitAsk();
      }
    });
  }
});

// ── INIT ──────────────────────────────────────────────────────────────────
loadState();
renderKPIs();
renderChecklist();

// ── ASISTENTE ─────────────────────────────────────────────────────────────
let chatHistory = [];

function openAsistente() {
  document.getElementById('asistente-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('asistente-input').focus(), 200);
}

function closeAsistente() {
  document.getElementById('asistente-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('asistente-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('asistente-modal')) closeAsistente();
});

function handleAsisteEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAsistente();
  }
}

function askSugg(text) {
  document.getElementById('asistente-input').value = text;
  sendAsistente();
}

function appendMsg(role, text) {
  const history = document.getElementById('chat-history');
  const isUser = role === 'user';

  const msg = document.createElement('div');
  msg.className = 'chat-msg ' + (isUser ? 'user-msg' : 'coach-msg');

  if (isUser) {
    msg.innerHTML = `
      <div class="user-avatar">R</div>
      <div class="user-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  } else {
    msg.innerHTML = `
      <div class="coach-avatar">Coach</div>
      <div class="coach-bubble" id="bubble-${Date.now()}">${text.replace(/\n/g,'<br>')}</div>`;
  }

  history.appendChild(msg);
  history.scrollTop = history.scrollHeight;
  return msg;
}

function showTyping() {
  const history = document.getElementById('chat-history');
  const msg = document.createElement('div');
  msg.className = 'chat-msg coach-msg';
  msg.id = 'typing-indicator';
  msg.innerHTML = `
    <div class="coach-avatar">Coach</div>
    <div class="coach-bubble typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  history.appendChild(msg);
  history.scrollTop = history.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function sendAsistente() {
  const input = document.getElementById('asistente-input');
  const text = input.value.trim();
  if (!text) return;

  const sendBtn = document.getElementById('asistente-send');
  sendBtn.disabled = true;
  document.getElementById('send-text').classList.add('hidden');
  document.getElementById('send-spinner').classList.remove('hidden');

  input.value = '';
  appendMsg('user', text);
  chatHistory.push({ role: 'user', content: text });

  showTyping();

  const all = allItems();
  const done = all.filter(it => state[it.id]).length;
  const wn = currentWeekNum();
  const pct = Math.round(done / all.length * 100);

  const systemPrompt = `Eres el coach ejecutivo personal de Rodrigo Pedroza, quien está en un programa de desarrollo hacia Dirección General. Contexto clave:
- Trabaja en IMPORVID SAPI DE CV en Monterrey (distribución de vino y franquicia de panadería Masa Madre)
- Hace coaching ejecutivo a mandos medios (programa HUERPEL con 11 coaches)
- Objetivo: llegar a nivel Dirección General sin maestría, usando cursos online
- Semana actual del programa: ${wn} de 80
- Progreso: ${pct}% completado (${done} de ${all.length} items)
- Plataforma de cursos: Coursera y edX (auditar gratis, pagar solo certificado)
- Plan: Fase 1 (fundamentos: finanzas, estrategia, liderazgo), Fase 2 (marketing, talento, tech, negociación), Fase 3 (presencia DG, gobierno corporativo)

Responde preguntas prácticas sobre: cómo inscribirse a cursos, qué hacer cuando hay confusión en una plataforma, dudas sobre el programa, priorizaciones, cómo aplicar lo aprendido, etc. Sé directo, amigable y práctico. Máximo 3 párrafos. Sin bullet points excesivos. Si es una duda técnica de plataforma (Coursera, edX), da instrucciones paso a paso claras.`;

  const prompt = buildAsistePrompt(systemPrompt, chatHistory);

  const response = await callCoachAPI(prompt);
  removeTyping();

  chatHistory.push({ role: 'assistant', content: response });
  appendMsg('coach', response);

  sendBtn.disabled = false;
  document.getElementById('send-text').classList.remove('hidden');
  document.getElementById('send-spinner').classList.add('hidden');
}

function buildAsistePrompt(system, history) {
  const conv = history.map(m => `${m.role === 'user' ? 'Rodrigo' : 'Coach'}: ${m.content}`).join('\n\n');
  return `${system}\n\nConversación:\n${conv}\n\nResponde como Coach:`;
}
