const START_DATE = new Date('2026-05-19');

const PHASES = [
  {
    id: 'f1',
    label: 'Fase 1 — Fundamentos ejecutivos',
    color: 'f1',
    startWeek: 1, endWeek: 20,
    weeks: [
      { w: 1, label: 'Semana 1–2', start: '19 may', end: '1 jun 2026', items: [
        { id:'f1_1', t:'Enrólate y comienza Finance for Non-Finance — Wharton/Coursera', tag:'curso', dur:'2 sem', url:'https://www.coursera.org/learn/wharton-finance' },
        { id:'f1_2', t:'Estudia qué es un P&L y cómo se lee (unidades 1–2)', tag:'curso', dur:'4 hrs' },
        { id:'f1_3', t:'Analiza el estado de resultados de IMPORVID con los nuevos conceptos', tag:'accion', dur:'2 hrs' },
      ]},
      { w: 3, label: 'Semana 3–4', start: '2 jun', end: '15 jun 2026', items: [
        { id:'f1_4', t:'Completa módulos de flujo de caja y balance general — Wharton', tag:'curso', dur:'1 sem' },
        { id:'f1_5', t:'Enrólate en Financial Analysis & Decision Making — Babson/edX', tag:'curso', dur:'inicio', url:'https://www.edx.org/course/financial-analysis-decision-making' },
        { id:'f1_6', t:'Aplica análisis financiero a un proyecto o cliente real', tag:'accion', dur:'3 hrs' },
      ]},
      { w: 5, label: 'Semana 5–8', start: '16 jun', end: '13 jul 2026', items: [
        { id:'f1_7', t:'Completa Financial Analysis — Babson/edX (obtén el certificado)', tag:'cert', dur:'4 sem', url:'https://www.edx.org/course/financial-analysis-decision-making' },
        { id:'f1_8', t:'Enrólate en Business Strategy — Copenhagen/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/learn/strategic-management' },
        { id:'f1_9', t:'Haz análisis FODA y Porter de IMPORVID o un cliente clave', tag:'accion', dur:'3 hrs' },
      ]},
      { w: 9, label: 'Semana 9–12', start: '14 jul', end: '10 ago 2026', items: [
        { id:'f1_10', t:'Completa Business Strategy — Copenhagen/Coursera', tag:'curso', dur:'4 sem' },
        { id:'f1_11', t:'Enrólate en Exercising Leadership — Harvard/edX', tag:'curso', dur:'inicio', url:'https://www.edx.org/course/exercising-leadership-foundational-principles' },
        { id:'f1_12', t:'Publica tu primera reflexión ejecutiva en LinkedIn', tag:'accion', dur:'2 hrs' },
      ]},
      { w: 13, label: 'Semana 13–16', start: '11 ago', end: '7 sep 2026', items: [
        { id:'f1_13', t:'Completa Exercising Leadership — Harvard/edX (con certificado)', tag:'cert', dur:'4 sem' },
        { id:'f1_14', t:'Enrólate en Executive Communication — HEC Paris/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/learn/communication-presentation' },
        { id:'f1_15', t:'Lee The First 90 Days — Watkins (cap. 1–5)', tag:'libro', dur:'3 sem' },
      ]},
      { w: 17, label: 'Semana 17–20', start: '8 sep', end: '5 oct 2026', items: [
        { id:'f1_16', t:'Completa Executive Communication — HEC Paris/Coursera', tag:'curso', dur:'3 sem' },
        { id:'f1_17', t:'Termina The First 90 Days — Michael Watkins', tag:'libro', dur:'2 sem' },
        { id:'f1_18', t:'Revisa si calificas para ICF ACC con tus horas actuales', tag:'accion', dur:'1 hr', url:'https://coachingfederation.org/credentials-and-standards/acc' },
      ]},
    ]
  },
  {
    id: 'f2',
    label: 'Fase 2 — Visión de negocio completa',
    color: 'f2',
    startWeek: 21, endWeek: 48,
    weeks: [
      { w: 21, label: 'Semana 21–24', start: '6 oct', end: '2 nov 2026', items: [
        { id:'f2_1', t:'Enrólate en Marketing Fundamentals — Wharton/Coursera', tag:'curso', dur:'4 sem', url:'https://www.coursera.org/learn/wharton-marketing' },
        { id:'f2_2', t:'Define la propuesta de valor de IMPORVID usando frameworks del curso', tag:'accion', dur:'3 hrs' },
      ]},
      { w: 25, label: 'Semana 25–28', start: '3 nov', end: '30 nov 2026', items: [
        { id:'f2_3', t:'Completa Marketing Fundamentals — Wharton/Coursera', tag:'curso', dur:'4 sem' },
        { id:'f2_4', t:'Enrólate en Organizational Analysis — Stanford/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/learn/organizational-analysis' },
        { id:'f2_5', t:'Publica artículo #2 en LinkedIn: marketing o estrategia', tag:'accion', dur:'2 hrs' },
      ]},
      { w: 29, label: 'Semana 29–32', start: '1 dic', end: '28 dic 2026', items: [
        { id:'f2_6', t:'Completa Organizational Analysis — Stanford/Coursera', tag:'curso', dur:'4 sem' },
        { id:'f2_7', t:'Enrólate en Managing Talent — Michigan/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/learn/managing-talent' },
        { id:'f2_8', t:'Lee Executive Coaching with Backbone and Heart (cap. 1–6)', tag:'libro', dur:'3 sem' },
      ]},
      { w: 33, label: 'Semana 33–36', start: '29 dic', end: '26 ene 2027', items: [
        { id:'f2_9', t:'Completa Managing Talent — Michigan/Coursera', tag:'curso', dur:'4 sem' },
        { id:'f2_10', t:'Enrólate en AI for Everyone — DeepLearning.AI/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/learn/ai-for-everyone' },
        { id:'f2_11', t:'Termina Executive Coaching with Backbone and Heart', tag:'libro', dur:'2 sem' },
      ]},
      { w: 37, label: 'Semana 37–40', start: '27 ene', end: '23 feb 2027', items: [
        { id:'f2_12', t:'Completa AI for Everyone — Coursera', tag:'curso', dur:'2 sem' },
        { id:'f2_13', t:'Enrólate en Successful Negotiation — Michigan/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/learn/negotiation' },
        { id:'f2_14', t:'Inicia proceso formal de certificación ICF ACC', tag:'cert', dur:'inicio', url:'https://coachingfederation.org/credentials-and-standards/acc' },
      ]},
      { w: 41, label: 'Semana 41–44', start: '24 feb', end: '23 mar 2027', items: [
        { id:'f2_15', t:'Completa Successful Negotiation — Michigan/Coursera', tag:'curso', dur:'4 sem' },
        { id:'f2_16', t:'Enrólate en Digital Transformation — MIT Sloan/edX', tag:'curso', dur:'inicio', url:'https://www.edx.org/course/digital-transformation' },
        { id:'f2_17', t:'Consigue tu primer coachee de nivel director (pro-bono si es necesario)', tag:'accion', dur:'ongoing' },
      ]},
      { w: 45, label: 'Semana 45–48', start: '24 mar', end: '20 abr 2027', items: [
        { id:'f2_18', t:'Completa Digital Transformation — MIT Sloan/edX (con certificado)', tag:'cert', dur:'4 sem' },
        { id:'f2_19', t:'Consolida portafolio de certificados Fases 1 y 2', tag:'accion', dur:'2 hrs' },
        { id:'f2_20', t:'Publica artículo #6 en LinkedIn con aprendizajes del año', tag:'accion', dur:'2 hrs' },
      ]},
    ]
  },
  {
    id: 'f3',
    label: 'Fase 3 — Presencia de Dirección General',
    color: 'f3',
    startWeek: 49, endWeek: 80,
    weeks: [
      { w: 49, label: 'Semana 49–52', start: '21 abr', end: '18 may 2027', items: [
        { id:'f3_1', t:'Enrólate en Corporate Governance — Illinois/Coursera', tag:'curso', dur:'4 sem', url:'https://www.coursera.org/learn/corporate-governance' },
        { id:'f3_2', t:'Investiga HBS Online General Management y IPADE AD2', tag:'accion', dur:'3 hrs', url:'https://online.hbs.edu/courses/general-management/' },
      ]},
      { w: 53, label: 'Semana 53–56', start: '19 may', end: '15 jun 2027', items: [
        { id:'f3_3', t:'Completa Corporate Governance — Illinois/Coursera', tag:'curso', dur:'4 sem' },
        { id:'f3_4', t:'Inscríbete en HBS Online General Management Program', tag:'cert', dur:'decisión', url:'https://online.hbs.edu/courses/general-management/' },
        { id:'f3_5', t:'Conecta con 3 headhunters de ejecutivos en México/LATAM', tag:'accion', dur:'1 sem' },
      ]},
      { w: 57, label: 'Semana 57–64', start: '16 jun', end: '10 ago 2027', items: [
        { id:'f3_6', t:'Completa programa ejecutivo intensivo (HBS Online u otro)', tag:'cert', dur:'8 sem' },
        { id:'f3_7', t:'Aplica como panelista o speaker en un foro de tu industria', tag:'accion', dur:'ongoing' },
        { id:'f3_8', t:'Inicia certificación Hogan Assessments', tag:'cert', dur:'inicio', url:'https://www.hoganassessments.com/' },
      ]},
      { w: 65, label: 'Semana 65–72', start: '11 ago', end: '5 oct 2027', items: [
        { id:'f3_9', t:'Completa certificación Hogan Assessments', tag:'cert', dur:'8 sem' },
        { id:'f3_10', t:'Inicia certificación EQ-i 2.0', tag:'cert', dur:'inicio', url:'https://mhs.com/product/eq-i-2-0/' },
        { id:'f3_11', t:'Evalúa si ya tienes horas para ICF PCC', tag:'accion', dur:'1 hr' },
      ]},
      { w: 73, label: 'Semana 73–80', start: '6 oct', end: '30 nov 2027', items: [
        { id:'f3_12', t:'Completa certificación EQ-i 2.0', tag:'cert', dur:'8 sem' },
        { id:'f3_13', t:'Inicia proceso formal ICF PCC si calificas', tag:'cert', dur:'inicio', url:'https://coachingfederation.org/credentials-and-standards' },
        { id:'f3_14', t:'Consolida oferta de coaching C-suite en documento/web', tag:'accion', dur:'1 sem' },
      ]},
    ]
  },
  {
    id: 'co',
    label: 'Coaching ejecutivo — paralelo a las 3 fases',
    color: 'co',
    startWeek: 1, endWeek: 80,
    weeks: [
      { w: 1, label: 'Desde semana 1', start: '19 may', end: '1 jun 2026', items: [
        { id:'co_1', t:'Levanta inventario de horas de coaching actuales para ICF', tag:'accion', dur:'2 hrs' },
        { id:'co_2', t:'Consigue un supervisor de coaching (nivel MCC ideal)', tag:'accion', dur:'1 sem' },
        { id:'co_3', t:'Enrólate en Coaching Skills — UC Davis/Coursera', tag:'curso', dur:'inicio', url:'https://www.coursera.org/specializations/coaching-skills-manager' },
      ]},
      { w: 5, label: 'Desde semana 5', start: '16 jun', end: '27 jul 2026', items: [
        { id:'co_4', t:'Completa Coaching Skills Specialization — UC Davis/Coursera', tag:'curso', dur:'6 sem' },
        { id:'co_5', t:'Documenta 3 casos de coaching con resultados medibles para ICF', tag:'accion', dur:'ongoing' },
      ]},
      { w: 9, label: 'Desde semana 9', start: '14 jul', end: '25 ago 2026', items: [
        { id:'co_6', t:'Audita Inspiring Leadership — Case Western/Coursera', tag:'curso', dur:'3 sem', url:'https://www.coursera.org/learn/inspiring-leadership-character-courage' },
        { id:'co_7', t:'Audita Leadership Storytelling — Kellogg/Coursera', tag:'curso', dur:'3 sem', url:'https://www.coursera.org/learn/leadership-storytelling' },
      ]},
      { w: 17, label: 'Desde semana 17', start: '8 sep', end: '5 oct 2026', items: [
        { id:'co_8', t:'Solicita formalmente credencial ICF ACC', tag:'cert', dur:'proceso', url:'https://coachingfederation.org/credentials-and-standards/acc' },
        { id:'co_9', t:'Contacta a tu primer coachee potencial de nivel Director/C-suite', tag:'accion', dur:'1 sem' },
      ]},
      { w: 30, label: 'Desde semana 30', start: '9 nov', end: '23 nov 2026', items: [
        { id:'co_10', t:'Crea perfil de coaching ejecutivo diferenciado para nivel DG en LinkedIn', tag:'accion', dur:'1 sem' },
        { id:'co_11', t:'Solicita 3 recomendaciones en LinkedIn de coachees actuales', tag:'accion', dur:'1 sem' },
      ]},
    ]
  }
];

const RETOS = [
  {
    month: 1,
    title: 'Diagnóstico financiero ejecutivo',
    desc: 'Toma los estados financieros de IMPORVID del último trimestre y prepara una presentación de 5 slides como si se la presentaras al consejo. Incluye: resumen P&L, flujo de caja, 3 riesgos y 2 oportunidades.',
    deadline: '2026-06-19'
  }
];
