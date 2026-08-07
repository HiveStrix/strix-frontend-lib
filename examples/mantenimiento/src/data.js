// Los datos que la pantalla muestra.
//
// Están aquí, sueltos y sin API, a propósito: este repo enseña cómo se CONSUME
// la librería, y meterle un fetch, un store y un estado de carga real solo
// escondería lo único que viene a mostrar. La forma de los objetos sí es la de
// verdad — es lo que devuelve el módulo de mantenimiento.

export const EQUIPOS = [
  {
    id: 'BAT-014', nombre: 'Batidora Imer Syntesi 250', familia: 'Batidoras',
    ubicacion: 'Bodega San José', lectura: 312, unidad: 'h', dias: -12,
    estado: 'critical', palabra: 'Vencido', tarea: 'Cambio de aceite', avance: 118
  },
  {
    id: 'HRN001', nombre: 'Horno rotativo Salva KX-8', familia: 'Hornos',
    ubicacion: 'Planta Alajuela', lectura: 1840, unidad: 'h', dias: 5,
    estado: 'attention', palabra: 'En 5 días', tarea: 'Revisión de quemador', avance: 88
  },
  {
    id: 'CAM-03', nombre: 'Camión Hino 300 · placa C-148921', familia: 'Flota',
    ubicacion: 'En ruta', lectura: 7210, unidad: 'km', dias: 47,
    estado: 'positive', palabra: 'Al día', tarea: 'Servicio 10 000 km', avance: 72
  },
  {
    id: 'MEZ-021', nombre: 'Mezcladora Baumax BM-160', familia: 'Mezcladoras',
    ubicacion: 'Obra 012 · Santa Ana', lectura: 96, unidad: 'd', dias: -3,
    estado: 'critical', palabra: 'Vencido', tarea: 'Engrase general', avance: 104
  },
  {
    id: 'COM-07', nombre: 'Compactadora Wacker DPU-6555', familia: 'Compactación',
    ubicacion: 'Bodega San José', lectura: null, unidad: '', dias: null,
    estado: 'neutral', palabra: 'Sin lectura', tarea: 'Cambio de filtro', avance: 0
  },
  {
    id: 'GEN-02', nombre: 'Generador Kohler 60REOZK', familia: 'Generadores',
    ubicacion: 'Obra 007 · Liberia', lectura: 2430, unidad: 'h', dias: 9,
    estado: 'attention', palabra: 'En 9 días', tarea: 'Cambio de refrigerante', avance: 81
  }
];

/** Los conteos van sobre el conjunto COMPLETO, no sobre lo que quedó filtrado. */
export const FAMILIAS = [...new Set(EQUIPOS.map((e) => e.familia))].map((f) => ({
  key: f,
  label: f,
  count: EQUIPOS.filter((e) => e.familia === f).length
}));

export const VEREDICTO = '2 equipos necesitan atención hoy. 1 lleva más de una semana vencido.';
