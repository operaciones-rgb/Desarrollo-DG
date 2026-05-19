# Plan DG — Tracker de desarrollo ejecutivo
### Rodrigo Pedroza · Hacia Dirección General

---

## Stack
- **Frontend**: HTML + CSS + JS puro (sin frameworks)
- **Hosting**: Vercel
- **Backend**: Serverless function `/api/coach.js` (Vercel)
- **Base de datos**: Google Sheets via Apps Script
- **IA**: Claude API (coaching responses)

---

## Deploy paso a paso

### 1. GitHub
```bash
git init
git add .
git commit -m "Initial commit - Plan DG tracker"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/plan-dg-tracker.git
git push -u origin main
```

### 2. Google Sheets
1. Crea un Google Sheet nuevo en tu Drive
2. Copia el ID del URL: `https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`
3. Abre Extensions → Apps Script
4. Pega el contenido de `apps-script.gs`
5. Reemplaza `TU_SPREADSHEET_ID_AQUI` con tu ID real
6. Clic en **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copia la URL del deployment

### 3. Vercel
1. Ve a [vercel.com](https://vercel.com) → New Project → importa tu repo
2. En **Environment Variables** agrega:
   ```
   ANTHROPIC_API_KEY = sk-ant-...tu-key...
   ```
3. Deploy

### 4. Conectar Apps Script al frontend
En `app.js` línea 3, reemplaza:
```js
const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || '';
```
con:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
```

O mejor: agrega `APPS_SCRIPT_URL` como variable de entorno en Vercel y sirve un endpoint `/api/config.js` que la exponga.

---

## Variables de entorno necesarias en Vercel
| Variable | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic |

---

## Estructura del proyecto
```
/
├── index.html          # App principal
├── style.css           # Estilos
├── data.js             # Datos del programa (fases, items, fechas)
├── app.js              # Lógica: state, render, modales, API calls
├── api/
│   └── coach.js        # Serverless: llama a Claude API
├── apps-script.gs      # Google Apps Script (se pega en Google)
├── vercel.json         # Config Vercel
└── README.md
```

---

## Cómo funciona el coaching
1. Cada semana abres el sitio y marcas lo que completaste
2. Presionas "Check-in semanal" y respondes 4 preguntas
3. El sistema guarda tus respuestas en Google Sheets
4. Claude API genera retroalimentación personalizada en segundos
5. Los retos mensuales se entregan igual — escribes, Claude evalúa

---

## Desarrollo local
```bash
npm i -g vercel
vercel dev
```
Visita `http://localhost:3000`
