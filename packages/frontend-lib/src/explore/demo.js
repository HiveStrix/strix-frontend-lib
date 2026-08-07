// The content every direction is judged on.
//
// Real maintenance content, not lorem and not "Card title / Some description".
// A direction that looks great holding "Button" and falls apart holding
// "Cambio de aceite hidráulico · 250 h" has not been tested, and the whole
// point of showing eight of them side by side is that the comparison is honest.

/** The five shapes of the maintenance vocabulary. Same in every direction. */
export const MARKS = {
  positive: '<path d="M2.5 6.4 5 8.9l4.6-5.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  attention: '<path d="M6 1.6 11.2 10.4H.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  critical: '<rect x="1.7" y="1.7" width="8.6" height="8.6" fill="currentColor"/>',
  info: '<circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  neutral: '<rect x="1.4" y="4.9" width="9.2" height="2.2" fill="currentColor"/>'
};

export const markOf = (tone) => MARKS[tone] ?? MARKS.neutral;

/** Machines, as they appear in the client's own paperwork. */
export const ASSETS = [
  {
    code: 'BAT-014', name: 'Batidora Imer Syntesi 250', family: 'Batidoras',
    location: 'Bodega San José', tone: 'critical', state: 'Vencido',
    plan: 'Cambio de aceite', due: 'hace 12 d', metric: '312 h', pct: 118,
    reading: '312 h · 2 ago', source: 'Salida/devolución'
  },
  {
    code: 'HRN001', name: 'Horno rotativo Salva KX-8', family: 'Hornos',
    location: 'Planta Alajuela', tone: 'attention', state: 'en 5 d',
    plan: 'Revisión de quemador', due: 'en 5 d', metric: '1 840 h', pct: 88,
    reading: 'sin lectura · 14 h/día declaradas', source: 'Horario declarado'
  },
  {
    code: 'CAM-03', name: 'Camión Hino 300 · placa C-148921', family: 'Flota',
    location: 'En ruta', tone: 'positive', state: 'Al día',
    plan: 'Servicio 10 000 km', due: 'en 47 d', metric: '7 210 km', pct: 72,
    reading: '7 210 km · 4 ago', source: 'Manual'
  },
  {
    code: 'MEZ-021', name: 'Mezcladora Baumax BM-160', family: 'Mezcladoras',
    location: 'Obra 012 · Santa Ana', tone: 'critical', state: 'Vencido',
    plan: 'Engrase general', due: 'hace 3 d', metric: '96 d', pct: 104,
    reading: '18 jul', source: 'Calendario'
  },
  {
    code: 'COM-07', name: 'Compactadora Wacker DPU-6555', family: 'Compactación',
    location: 'Bodega San José', tone: 'neutral', state: 'Sin lectura',
    plan: 'Cambio de filtro', due: '—', metric: '—', pct: 0,
    reading: 'nunca', source: '—'
  },
  {
    code: 'GEN-02', name: 'Generador Kohler 60REOZK', family: 'Generadores',
    location: 'Obra 007 · Liberia', tone: 'attention', state: 'en 9 d',
    plan: 'Cambio de refrigerante', due: 'en 9 d', metric: '2 430 h', pct: 81,
    reading: '2 430 h · 1 ago', source: 'Salida/devolución'
  }
];

/** The four counts that open the fleet screen. */
export const KPIS = [
  { label: 'Vencidos', value: 8, tone: 'critical', note: '3 más que ayer' },
  { label: 'Por vencer', value: 14, tone: 'attention', note: 'próximos 15 días' },
  { label: 'Al día', value: 62, tone: 'positive', note: '71 % de la flota' },
  { label: 'Sin lectura', value: 4, tone: 'neutral', note: 'nunca medidos' }
];

/** Plans on the two clocks — calendar and usage, whichever lands first. */
export const PLANS = [
  { asset: 'BAT-014', task: 'Cambio de aceite', every: 'cada 250 h', clock: 'uso', at: 118, tone: 'critical', when: 'venció hace 12 d' },
  { asset: 'HRN001', task: 'Revisión de quemador', every: 'cada 2 000 h', clock: 'uso', at: 88, tone: 'attention', when: 'en 5 d' },
  { asset: 'CAM-03', task: 'Servicio 10 000 km', every: 'cada 10 000 km', clock: 'uso', at: 72, tone: 'positive', when: 'en 47 d' },
  { asset: 'MEZ-021', task: 'Engrase general', every: 'cada 90 d', clock: 'calendario', at: 104, tone: 'critical', when: 'venció hace 3 d' },
  { asset: 'GEN-02', task: 'Cambio de refrigerante', every: 'cada 3 000 h', clock: 'uso', at: 81, tone: 'attention', when: 'en 9 d' },
  { asset: 'COM-07', task: 'Cambio de filtro', every: 'cada 200 h', clock: 'uso', at: 0, tone: 'neutral', when: 'sin lectura' }
];

export const FAMILIES = ['Batidoras', 'Hornos', 'Flota', 'Mezcladoras', 'Compactación', 'Generadores'];
export const LOCATIONS = ['Bodega San José', 'Planta Alajuela', 'Obra 012 · Santa Ana', 'Obra 007 · Liberia', 'En ruta'];

/** Copy that has to survive every direction without being re-written. */
export const COPY = {
  verdict: '8 equipos necesitan atención hoy. 3 llevan más de una semana vencidos.',
  emptyTitle: 'Todavía no hay equipos',
  emptyBody: 'Agregá el primero, o subí una salida en PDF y se crean solos.',
  errorTitle: 'No se pudo leer la devolución 8631',
  errorBody: 'La línea 1 no trae código de artículo. Revisá el documento o asigná el equipo a mano.',
  confirmTitle: '¿Eliminar la familia Batidoras?',
  confirmBody: 'Tiene 14 equipos y 3 tareas. Los equipos se quedan sin plan hasta que les asignés otra familia.'
};
