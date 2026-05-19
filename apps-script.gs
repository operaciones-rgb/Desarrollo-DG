// ════════════════════════════════════════════════════════════════
// Google Apps Script — Plan DG Rodrigo Pedroza
// Deploy como: Web App → Anyone → Execute as Me
// ════════════════════════════════════════════════════════════════

const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI'; // ← reemplaza con tu ID

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (body.type === 'progress') {
      saveProgress(ss, body.data);
    } else if (body.type === 'checkin') {
      saveCheckin(ss, body);
    } else if (body.type === 'reto') {
      saveReto(ss, body);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── PROGRESO ──────────────────────────────────────────────────────────────
function saveProgress(ss, data) {
  let sheet = ss.getSheetByName('Progreso');
  if (!sheet) {
    sheet = ss.insertSheet('Progreso');
    sheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Item ID', 'Completado']]);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  // Clear existing progress and rewrite (simple approach)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);

  const rows = Object.entries(data).map(([id, done]) => [
    new Date().toISOString(), id, done ? 'Sí' : 'No'
  ]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

// ── CHECK-IN ──────────────────────────────────────────────────────────────
function saveCheckin(ss, data) {
  let sheet = ss.getSheetByName('Check-ins');
  if (!sheet) {
    sheet = ss.insertSheet('Check-ins');
    const headers = ['Fecha', 'Semana', 'Progreso %', '¿Qué completé?', '¿Qué no pude hacer?', '¿Qué insight?', '¿Cómo lo apliqué?'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(data.date).toLocaleString('es-MX'),
    `Semana ${data.week}`,
    `${data.progressPct}%`,
    data.q1 || '',
    data.q2 || '',
    data.q3 || '',
    data.q4 || ''
  ]);
}

// ── RETO ──────────────────────────────────────────────────────────────────
function saveReto(ss, data) {
  let sheet = ss.getSheetByName('Retos');
  if (!sheet) {
    sheet = ss.insertSheet('Retos');
    const headers = ['Fecha', 'Mes', 'Entrega'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(data.date).toLocaleString('es-MX'),
    `Mes ${data.month}`,
    data.content || ''
  ]);
}

// ── SETUP INICIAL ─────────────────────────────────────────────────────────
// Corre esta función UNA VEZ manualmente para crear el spreadsheet y las hojas
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetNames = ['Progreso', 'Check-ins', 'Retos'];
  sheetNames.forEach(name => {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });
  Logger.log('Spreadsheet configurado correctamente');
}
