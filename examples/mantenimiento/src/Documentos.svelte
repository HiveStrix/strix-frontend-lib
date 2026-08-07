<script>
  // TERCER EJEMPLO: la pantalla donde el software admite lo que no sabe.
  //
  // Las otras dos muestran datos y reciben datos. Esta muestra el caso que
  // decide si un módulo de ingesta se puede ofrecer o no: el lector sacó ocho
  // documentos de ocho PDF, algunos los sacó completos y otros no, y lo único
  // honesto que puede hacer con los que no es DECIRLO y esperar a una persona.
  //
  // Dos vocabularios distintos conviven acá y confundirlos es el error caro:
  //
  //   EL VEREDICTO DE LA LECTURA   leído · dudoso · bloqueado
  //     qué tan bien salió el documento del PDF. Es de la bandeja.
  //   LA PROCEDENCIA DE UN CAMPO   parsed · verified · disputed · inferred · manual
  //     de dónde salió ESE dato. Es del campo, no del documento.
  //
  // Un documento puede estar leído y aun así no escribirse nunca (SAL-118441 son
  // 24 puntales: no hay máquina a la cual acreditarle nada), y un campo puede
  // estar en disputa dentro de un documento que por lo demás salió perfecto.
  //
  // Como en los otros dos ejemplos, este archivo no define ni un color, ni un
  // radio, ni una sombra. Lo único que aporta es distribución.
  import {
    PageHeader, Alert, StatStrip, Stat, Panel, FileDrop, Button, Row, Divider,
    SearchField, FilterChips, Table, Pill, Input, NumberInput, Select, DateInput,
    ReviewPanel, EmptyState, Toast, today
  } from '@strix/frontend-lib';
  import { EQUIPOS } from './data.js';

  // ── El vocabulario de la procedencia ───────────────────────────────────────
  // Cinco procedencias sobre los cinco tonos del sistema, y el reparto no es
  // decorativo: `neutral` es «un hecho sin estado» (el lector lo sacó y ya),
  // `positive` es «está bien» (alguien lo miró), `attention` es «mirá esto antes
  // de que sea el problema» (nadie lo observó, se dedujo), `critical` es «pasó la
  // raya» (dos fuentes dicen cosas distintas y el sistema no puede elegir solo) e
  // `info` es «un hecho sobre el registro» (lo escribió una persona).
  //
  // Cada Pill lleva tono + marca + PALABRA, así que la columna se lee sin haberse
  // aprendido ningún color: la palabra dice lo mismo que el color, siempre.
  const TONO_PROC = {
    parsed: 'neutral',
    verified: 'positive',
    disputed: 'critical',
    inferred: 'attention',
    manual: 'info'
  };
  const PALABRA_PROC = {
    parsed: 'Leído del PDF',
    verified: 'Confirmado',
    disputed: 'En disputa',
    inferred: 'Supuesto',
    manual: 'Escrito a mano'
  };

  const VEREDICTO = {
    leido: { tono: 'positive', palabra: 'Leído' },
    dudoso: { tono: 'attention', palabra: 'Dudoso' },
    bloqueado: { tono: 'critical', palabra: 'Bloqueado' }
  };

  // ── Los documentos ─────────────────────────────────────────────────────────
  // Van acá y no en data.js porque son de esta pantalla; data.js lo comparten
  // tres ejemplos. Los equipos sí salen de ahí: el catálogo contra el que se
  // resuelve un documento es la flota, no una lista aparte.
  //
  // `indispensable` es lo que separa DUDOSO de BLOQUEADO. Un campo indispensable
  // sin valor no se puede suponer — sin código de artículo no hay máquina, y
  // acreditarle 96 h a la máquina equivocada es peor que no acreditárselas a
  // ninguna.
  //
  // `arreglo` viaja CON la lectura y no con la pantalla: el que sabe que el
  // código quedó en la casilla equivocada es el que leyó el PDF. Una pantalla que
  // hardcodea el remedio de un documento es una pantalla que hay que tocar cada
  // vez que el proveedor cambia la plantilla.
  const DOCUMENTOS = [
    {
      numero: 'SAL-118432',
      tipo: 'Salida',
      fecha: '2026-08-03',
      archivo: 'salida-118432.pdf',
      lineas: 6,
      horas: 0,
      resumen: 'Abre el período de COM-07 en la Obra 012. Una salida no acredita uso: lo acredita la devolución.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'SAL-118432', mono: true,
          fuente: 'Encabezado · «BOLETA DE SALIDA No. 118432».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de salida', valor: '2026-08-03', crudo: '2026-08-03', tipo: 'fecha',
          fuente: 'Encabezado · «03/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: 'COM-07 · Compactadora Wacker DPU-6555',
          crudo: 'COM-07', tipo: 'equipo', indispensable: true,
          fuente: 'Línea 1 · código de artículo ART-4471-CM, que apunta a COM-07 en el catálogo.',
          procedencia: 'parsed'
        },
        {
          clave: 'horometro', etiqueta: 'Horómetro de salida', valor: '0 h', crudo: '0',
          tipo: 'numero', unidad: 'h',
          fuente: 'Casilla HORÓMETRO SALIDA · «0». COM-07 nunca ha tenido una lectura registrada: esta sería la primera de la máquina.',
          procedencia: 'parsed'
        },
        {
          clave: 'obra', etiqueta: 'Obra', valor: 'Obra 012 · Santa Ana',
          fuente: 'Casilla DESTINO.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'SAL-118441',
      tipo: 'Salida',
      fecha: '2026-08-04',
      archivo: 'salida-118441.pdf',
      lineas: 3,
      horas: 0,
      omitir: true,
      resumen: 'Ningún renglón es una máquina. Se leyó completo y correctamente no se escribe.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'SAL-118441', mono: true,
          fuente: 'Encabezado · «BOLETA DE SALIDA No. 118441».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de salida', valor: '2026-08-04', crudo: '2026-08-04', tipo: 'fecha',
          fuente: 'Encabezado · «04/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'contenido', etiqueta: 'Contenido', valor: '24 puntales metálicos y 6 formaletas de 1,20 m',
          fuente: 'Líneas 1 a 3 · ninguna trae código de máquina, las tres traen código de material.',
          procedencia: 'parsed'
        },
        {
          clave: 'obra', etiqueta: 'Obra', valor: 'Obra 007 · Liberia',
          fuente: 'Casilla DESTINO.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'SAL-118447',
      tipo: 'Salida',
      fecha: '2026-08-04',
      archivo: 'salida-118447.pdf',
      lineas: 4,
      horas: 0,
      resumen: 'Abre el período de GEN-02 con el horómetro en 2 430 h.',
      remedio: 'El equipo y el horómetro son deducciones del lector, no lecturas. Confirmalos o corregilos en la bandeja antes de aplicar.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'SAL-118447', mono: true,
          fuente: 'Encabezado · «BOLETA DE SALIDA No. 118447».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de salida', valor: '2026-08-04', crudo: '2026-08-04', tipo: 'fecha',
          fuente: 'Encabezado · «04/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: 'GEN-02 · Generador Kohler 60REOZK',
          crudo: 'GEN-02', tipo: 'equipo', indispensable: true,
          fuente: 'Línea 2 · «GENERADOR KOHLER 60 REOZK 60KW». La línea no trae código de artículo; es el único generador Kohler de la flota, así que el lector lo dedujo del modelo.',
          procedencia: 'inferred'
        },
        {
          clave: 'horometro', etiqueta: 'Horómetro de salida', valor: '2 430 h', crudo: '2430',
          tipo: 'numero', unidad: 'h', piso: 2430,
          fuente: 'Sello de mano en el pie · el tercer dígito está borroso. Puede ser 2 430 o 2 480.',
          procedencia: 'inferred'
        },
        {
          clave: 'transportista', etiqueta: 'Transportista', valor: 'Randall Vega Solís',
          fuente: 'Casilla TRANSPORTISTA.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'DEV-8629',
      tipo: 'Devolución',
      fecha: '2026-08-04',
      archivo: 'devolucion-8629.pdf',
      lineas: 2,
      horas: 96,
      resumen: 'Le acredita 96 h a BAT-014 y adelanta «Cambio de aceite», que ya venía vencido.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'DEV-8629', mono: true,
          fuente: 'Encabezado · «DEVOLUCIÓN 8629».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de devolución', valor: '2026-08-04', crudo: '2026-08-04', tipo: 'fecha',
          fuente: 'Encabezado · «04/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: 'BAT-014 · Batidora Imer Syntesi 250',
          crudo: 'BAT-014', tipo: 'equipo', indispensable: true,
          fuente: 'Línea 1 · código de artículo ART-2210-BM.', procedencia: 'parsed'
        },
        {
          clave: 'uso', etiqueta: 'Uso del período', valor: '96 h', crudo: '96',
          tipo: 'numero', unidad: 'h',
          fuente: 'Horómetro de devolución 408 h menos horómetro de salida 312 h.',
          procedencia: 'verified', confirmadoPor: 'Kenneth Ureña · ayer 16:20'
        },
        {
          clave: 'obra', etiqueta: 'Obra', valor: 'Obra 012 · Santa Ana',
          fuente: 'Casilla PROCEDENCIA.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'DEV-8631',
      tipo: 'Devolución',
      fecha: '2026-08-05',
      archivo: 'devolucion-8631.pdf',
      lineas: 2,
      horas: 118,
      resumen: 'Cierra el período que abrió la salida 118432 · 118 h de uso.',
      remedio: 'La línea 1 llegó sin código de artículo, así que no hay máquina a la cual acreditarle esas horas. El código ART-4471-CM quedó escrito en la casilla TRANSPORTISTA: abrí el documento y movelo, o pedile al proveedor que reexporte la boleta.',
      nota: {
        titulo: 'Por qué llega así',
        texto: 'La plantilla del ERP del proveedor corre una columna cuando la descripción del artículo pasa de 38 caracteres, y el código termina en la casilla siguiente. Es el mismo defecto de las boletas 8604 y 8617.'
      },
      renglones: [
        { id: 'l1', etiqueta: 'Línea 1', texto: '(sin código) · 1 un · COMPACTADORA WACKER DPU-6555 REVERSIBLE', verdicto: 'block', mensaje: 'sin código de artículo' },
        { id: 'l2', etiqueta: 'Línea 2', texto: 'ACC-0912 · 1 un · Placa de compactación 500 mm', verdicto: 'write' }
      ],
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'DEV-8631', mono: true,
          fuente: 'Encabezado · «DEVOLUCIÓN 8631».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de devolución', valor: '2026-08-05', crudo: '2026-08-05', tipo: 'fecha',
          fuente: 'Encabezado · «05/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'articulo', etiqueta: 'Código de artículo · línea 1', valor: null, mono: true, indispensable: true,
          fuente: 'La casilla viene vacía en el PDF.', procedencia: 'parsed'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: null, tipo: 'equipo', indispensable: true,
          fuente: 'Se resuelve desde el código de artículo. Sin código, no se resuelve.',
          procedencia: 'parsed'
        },
        {
          clave: 'transportista', etiqueta: 'Transportista', valor: 'ART-4471-CM', mono: true,
          fuente: 'Casilla TRANSPORTISTA · lo que hay ahí es un código de artículo, no el nombre de una persona.',
          procedencia: 'disputed',
          arreglo: {
            texto: 'Mover el código a la línea 1',
            aplica: {
              articulo: {
                valor: 'ART-4471-CM', crudo: 'ART-4471-CM', procedencia: 'manual',
                fuente: 'Movido a mano desde la casilla TRANSPORTISTA, donde el documento lo trajo por error.'
              },
              transportista: {
                valor: null, crudo: '', procedencia: 'manual',
                fuente: 'El documento no trae transportista: lo que ocupaba esa casilla era el código de artículo.'
              },
              equipo: {
                valor: 'COM-07 · Compactadora Wacker DPU-6555', crudo: 'COM-07', procedencia: 'inferred',
                fuente: 'ART-4471-CM apunta a COM-07 en el catálogo. Es una deducción del sistema, no una lectura: sigue siendo una suposición hasta que alguien la confirme.'
              }
            }
          }
        },
        {
          clave: 'uso', etiqueta: 'Uso del período', valor: '118 h', crudo: '118',
          tipo: 'numero', unidad: 'h',
          fuente: 'Horómetro de devolución 118 h menos horómetro de salida 0 h, el de la boleta 118432.',
          procedencia: 'parsed'
        },
        {
          clave: 'obra', etiqueta: 'Obra', valor: 'Obra 012 · Santa Ana',
          fuente: 'Casilla PROCEDENCIA.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'SAL-118455',
      tipo: 'Salida',
      fecha: '2026-08-05',
      archivo: 'salida-118455.pdf',
      lineas: 5,
      horas: 0,
      resumen: 'Abre el período de MEZ-021 en la Obra 012.',
      remedio: 'La fecha es ambigua y el contador retrocede. Los dos mueven el plan, así que ninguno se aplica sin que alguien los mire.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'SAL-118455', mono: true,
          fuente: 'Encabezado · «BOLETA DE SALIDA No. 118455».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de salida', valor: '2026-08-05', crudo: '2026-08-05', tipo: 'fecha',
          fuente: 'Encabezado · «05/08/26». El proveedor exporta unas boletas en dd/mm y otras en mm/dd: puede ser el 5 de agosto o el 8 de mayo.',
          procedencia: 'inferred'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: 'MEZ-021 · Mezcladora Baumax BM-160',
          crudo: 'MEZ-021', tipo: 'equipo', indispensable: true,
          fuente: 'Línea 1 · código de artículo ART-1180-MZ.', procedencia: 'parsed'
        },
        {
          clave: 'horometro', etiqueta: 'Contador de salida', valor: '94 d', crudo: '94',
          tipo: 'numero', unidad: 'd', piso: 96,
          fuente: 'Casilla HORÓMETRO SALIDA · «94». La última lectura de MEZ-021 es 96 d, y un horómetro no retrocede: o lo escribieron mal o le cambiaron el instrumento.',
          procedencia: 'inferred'
        },
        {
          clave: 'obra', etiqueta: 'Obra', valor: 'Obra 012 · Santa Ana',
          fuente: 'Casilla DESTINO.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'DEV-8633',
      tipo: 'Devolución',
      fecha: '2026-08-05',
      archivo: 'devolucion-8633.pdf',
      lineas: 2,
      horas: 171,
      resumen: 'Le acredita el uso del período a HRN001 y adelanta la revisión del quemador.',
      remedio: 'El horno tiene un horario declarado de 14 h/día y el documento trae una medición, y no dicen lo mismo. Lo observado le gana a lo declarado, pero el sistema no pisa un número solo: alguien lo dice.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'DEV-8633', mono: true,
          fuente: 'Encabezado · «DEVOLUCIÓN 8633».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de devolución', valor: '2026-08-05', crudo: '2026-08-05', tipo: 'fecha',
          fuente: 'Encabezado · «05/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: 'HRN001 · Horno rotativo Salva KX-8',
          crudo: 'HRN001', tipo: 'equipo', indispensable: true,
          fuente: 'Línea 1 · código de artículo ART-0907-HR.', procedencia: 'parsed'
        },
        {
          clave: 'uso', etiqueta: 'Uso del período', valor: '196 h', crudo: '196',
          tipo: 'numero', unidad: 'h',
          fuente: 'El horario declarado del horno dice 14 h por día durante 14 días: 196 h. El horómetro del documento dice 171 h.',
          procedencia: 'disputed',
          arreglo: {
            texto: 'Tomar las 171 h del horómetro',
            aplica: {
              uso: {
                valor: '171 h', crudo: '171', procedencia: 'verified',
                confirmadoPor: 'la regla del sistema',
                fuente: 'Lo observado le gana a lo declarado. El horario de 14 h/día vuelve a ser lo que siempre fue: una suposición para los días en que nadie mide.'
              }
            }
          }
        },
        {
          clave: 'obra', etiqueta: 'Ubicación', valor: 'Planta Alajuela',
          fuente: 'Casilla PROCEDENCIA.', procedencia: 'parsed'
        }
      ]
    },
    {
      numero: 'SAL-118460',
      tipo: 'Salida',
      fecha: '2026-08-06',
      archivo: 'salida-118460.pdf',
      lineas: 3,
      horas: 0,
      resumen: 'Abre el período de CAM-03 con el odómetro en 7 210 km.',
      campos: [
        {
          clave: 'numero', etiqueta: 'Número de documento', valor: 'SAL-118460', mono: true,
          fuente: 'Encabezado · «BOLETA DE SALIDA No. 118460».', procedencia: 'parsed'
        },
        {
          clave: 'fecha', etiqueta: 'Fecha de salida', valor: '2026-08-06', crudo: '2026-08-06', tipo: 'fecha',
          fuente: 'Encabezado · «06/08/2026».', procedencia: 'parsed'
        },
        {
          clave: 'equipo', etiqueta: 'Equipo', valor: 'CAM-03 · Camión Hino 300 · placa C-148921',
          crudo: 'CAM-03', tipo: 'equipo', indispensable: true,
          fuente: 'Línea 1 · código de artículo ART-3301-CM y placa C-148921, que empatan con el mismo equipo.',
          procedencia: 'parsed'
        },
        {
          clave: 'odometro', etiqueta: 'Odómetro de salida', valor: '7 210 km', crudo: '7210',
          tipo: 'numero', unidad: 'km', piso: 7210,
          fuente: 'Casilla ODÓMETRO · «7210».', procedencia: 'parsed'
        },
        {
          clave: 'obra', etiqueta: 'Destino', valor: 'En ruta · Guápiles',
          fuente: 'Casilla DESTINO.', procedencia: 'parsed'
        }
      ]
    }
  ];

  const OPCIONES_EQUIPO = EQUIPOS.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` }));

  let archivos = [];
  let busqueda = '';
  let filtro = null;
  let seleccionado = 'DEV-8631';
  let editando = null;
  let borrador = '';
  let estadoLote = 'review';
  let toasts = [];
  let seq = 0;

  // Lo que una persona decidió, encima de lo que el lector leyó. La clave es
  // «documento·campo» y nunca el índice: un lote nuevo con los mismos números de
  // fila heredaría las decisiones del anterior.
  let cambios = {};

  // ── Todo lo derivado va ENTERO adentro de un `$:` ──────────────────────────
  // Una sentencia reactiva solo rastrea los nombres escritos DENTRO de ella. Un
  // `const camposDe = …` declarado afuera cierra sobre `cambios` sin que el
  // compilador se entere, y la bandeja se queda mostrando la primera lectura
  // para siempre. La librería declara sus propios ayudantes así por lo mismo.
  $: camposDe = (d) =>
    d.campos.map((c) => ({ ...c, ...(cambios[`${d.numero}·${c.clave}`] ?? {}) }));

  $: veredictoDe = (d) =>
    camposDe(d).some((c) => c.indispensable && !c.valor)
      ? 'bloqueado'
      : camposDe(d).some((c) => c.procedencia === 'inferred' || c.procedencia === 'disputed')
        ? 'dudoso'
        : 'leido';

  $: filas = DOCUMENTOS.map((d) => ({
    ...d,
    veredicto: veredictoDe(d),
    equipo: camposDe(d).find((c) => c.clave === 'equipo')?.valor ?? null
  }));

  $: visibles = filas.filter(
    (f) =>
      (filtro === null || f.veredicto === filtro) &&
      (busqueda === '' ||
        `${f.numero} ${f.tipo} ${f.equipo ?? ''} ${f.archivo}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()))
  );

  // Los conteos van sobre el conjunto COMPLETO. Si salieran de `visibles`,
  // presionar un chip cambiaría los números de los otros.
  $: chips = [
    { key: 'bloqueado', label: 'Bloqueado', tone: 'critical', count: filas.filter((f) => f.veredicto === 'bloqueado').length },
    { key: 'dudoso', label: 'Dudoso', tone: 'attention', count: filas.filter((f) => f.veredicto === 'dudoso').length },
    { key: 'leido', label: 'Leído', tone: 'positive', count: filas.filter((f) => f.veredicto === 'leido').length }
  ];

  $: porRevisar = filas.filter((f) => f.veredicto !== 'leido').length;
  $: bloqueados = filas.filter((f) => f.veredicto === 'bloqueado').length;
  $: aplicables = filas.filter((f) => f.veredicto === 'leido' && !f.omitir);
  $: horasPorAcreditar = filas
    .filter((f) => f.veredicto === 'leido' && !f.omitir)
    .reduce((n, f) => n + f.horas, 0);

  // El tono del encabezado es legal solo si el título ya dice la palabra. «Falta
  // confirmar» es la palabra de attention; lo bloqueado va en la banda de abajo,
  // que es donde vive el rojo.
  $: titular =
    porRevisar === 0
      ? 'La bandeja está al día.'
      : porRevisar === 1
        ? 'Falta confirmar 1 documento.'
        : `Faltan confirmar ${porRevisar} documentos.`;

  // Frase entera por rama, y no un plural pegado a un conteo: «1 documentos no se
  // pueden seguir» es exactamente la oración que tiene que leerse bien.
  $: tituloBloqueo =
    bloqueados === 1 ? '1 documento no se puede seguir' : `${bloqueados} documentos no se pueden seguir`;

  $: abierto = filas.find((f) => f.numero === seleccionado) ?? null;
  $: camposAbiertos = abierto ? camposDe(abierto) : [];
  $: faltanCampos = camposAbiertos.filter(
    (c) => c.procedencia === 'inferred' || c.procedencia === 'disputed' || (c.indispensable && !c.valor)
  ).length;

  // `new Date('2026-08-05')` se parsea como UTC y cae el día 4 para cualquiera al
  // oeste de Greenwich, que es Costa Rica todos los días del año. Las partes se
  // leen a mano por eso — es la misma trampa que documenta DateInput.
  $: enPalabras = (iso) =>
    new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)).toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  $: bajoElPiso = (() => {
    const c = camposAbiertos.find((x) => x.clave === editando);
    return !!c && c.piso != null && borrador !== '' && Number(borrador) < c.piso;
  })();

  // El lote que ReviewPanel va a escribir. El veredicto de la ESCRITURA no es el
  // de la lectura: SAL-118441 se leyó perfecto y aun así se omite, porque 24
  // puntales no son una máquina. Pintar eso de ámbar es cómo se enseña a la gente
  // a ignorar el ámbar.
  $: propuestas = filas.map((f) => ({
    id: f.numero,
    kind: f.tipo,
    code: f.numero,
    title: f.archivo,
    meta: [`${f.lineas} líneas`, f.equipo ?? 'sin equipo resuelto', f.horas ? `${f.horas} h` : 'sin uso que acreditar'],
    verdict: f.omitir
      ? 'skip'
      : f.veredicto === 'bloqueado'
        ? 'block'
        : f.veredicto === 'dudoso'
          ? 'question'
          : 'write',
    message: f.resumen,
    fix: f.veredicto === 'leido' ? '' : f.remedio ?? '',
    lines: (f.renglones ?? []).map((r) => ({
      id: r.id,
      label: r.etiqueta,
      text: r.texto,
      verdict: r.verdicto,
      message: r.mensaje
    })),
    footnote: f.nota ? { label: f.nota.titulo, text: f.nota.texto } : undefined
  }));

  const columnas = [
    { key: 'numero', label: 'Documento', id: true, primary: true, min: '13ch' },
    { key: 'tipo', label: 'Tipo', min: '12ch', optional: true, showAt: 560 },
    {
      key: 'fecha',
      label: 'Fecha',
      order: 'date',
      sortable: true,
      min: '9ch',
      value: (r) =>
        new Date(+r.fecha.slice(0, 4), +r.fecha.slice(5, 7) - 1, +r.fecha.slice(8, 10)).toLocaleDateString(
          'es-CR',
          { day: 'numeric', month: 'short' }
        ),
      sortValue: (r) => r.fecha
    },
    { key: 'equipo', label: 'Equipo resuelto', min: '26ch', optional: true, showAt: 620, wrap: true },
    {
      key: 'veredicto',
      label: 'Lectura',
      sortable: true,
      min: '15ch',
      // Se ordena por urgencia y no alfabéticamente: alfabéticamente «Bloqueado»
      // y «Dudoso» quedarían juntos por casualidad y «Leído» de último por suerte.
      sortValue: (r) => ({ bloqueado: 0, dudoso: 1, leido: 2 })[r.veredicto]
    }
  ];

  function avisar(texto, extra = {}) {
    toasts = [...toasts, { id: ++seq, tone: 'positive', text: texto, ...extra }];
  }

  function corregir(c) {
    editando = c.clave;
    borrador = c.crudo ?? c.valor ?? '';
  }

  function guardar(c) {
    const eq = EQUIPOS.find((e) => e.id === borrador);
    const valor =
      c.tipo === 'equipo'
        ? eq
          ? `${eq.id} · ${eq.nombre}`
          : ''
        : c.tipo === 'numero'
          ? `${Number(borrador).toLocaleString('es-CR')} ${c.unidad ?? ''}`.trim()
          : borrador;
    const clave = `${abierto.numero}·${c.clave}`;
    cambios = {
      ...cambios,
      [clave]: {
        valor,
        crudo: borrador,
        procedencia: 'manual',
        fuente: `Lo escribió una persona en esta pantalla. El lector había sacado «${c.valor ?? 'nada'}».`
      }
    };
    editando = null;
    avisar(`${c.etiqueta} de ${abierto.numero}: escrito a mano.`, { action: 'Deshacer', deshace: [clave] });
  }

  function confirmar(c) {
    const clave = `${abierto.numero}·${c.clave}`;
    cambios = {
      ...cambios,
      [clave]: { procedencia: 'verified', confirmadoPor: 'Kenneth Ureña · hoy' }
    };
    avisar(`${c.etiqueta} de ${abierto.numero}: confirmado.`, { action: 'Deshacer', deshace: [clave] });
  }

  function arreglar(c) {
    const claves = Object.keys(c.arreglo.aplica).map((k) => `${abierto.numero}·${k}`);
    cambios = {
      ...cambios,
      ...Object.fromEntries(Object.entries(c.arreglo.aplica).map(([k, v]) => [`${abierto.numero}·${k}`, v]))
    };
    editando = null;
    avisar(`${abierto.numero}: ${c.arreglo.texto.toLowerCase()}.`, { action: 'Deshacer', deshace: claves });
  }

  function deshacer(e) {
    const t = e.detail.toast;
    if (t.deshace) {
      const siguiente = { ...cambios };
      for (const k of t.deshace) delete siguiente[k];
      cambios = siguiente;
    }
    toasts = toasts.filter((x) => x.id !== t.id);
  }

  function leerArchivos() {
    const n = archivos.length;
    archivos = [];
    avisar(
      n === 1
        ? '1 PDF en cola de lectura. Aparece en la bandeja cuando el lector termine.'
        : `${n} PDF en cola de lectura. Aparecen en la bandeja cuando el lector termine.`
    );
  }

  // En producción los documentos aplicados SALEN de la bandeja y el registro
  // queda en el libro del módulo, no en un panel que se cierra — ReviewPanel lo
  // dice en su propio encabezado. Acá vuelven, porque un ejemplo que se vacía
  // solo se puede mirar una vez.
  function aplicar(e) {
    estadoLote = 'done';
    const n = e.detail.items.length;
    avisar(
      n === 1
        ? `1 documento aplicado · ${horasPorAcreditar} h acreditadas.`
        : `${n} documentos aplicados · ${horasPorAcreditar} h acreditadas.`
    );
  }
</script>

<div class="pantalla">
  <!-- «Cliente» acá es el espacio de trabajo, el tenant: la bandeja es de
       Maquinaria del Pacífico. La empresa que alquila la máquina aparece más
       abajo y se llama obra, que es como le dicen en los documentos. -->
  <PageHeader
    eyebrow="Documentos · Maquinaria del Pacífico"
    title={titular}
    tone={porRevisar > 0 ? 'attention' : 'neutral'}
    subtitle="El lector sacó 8 documentos de 8 PDF. Lo que no logró sacar quedó marcado, no inventado."
  />

  {#if bloqueados > 0}
    <Alert tone="critical" title={tituloBloqueo}>
      A la devolución 8631 le falta el código de artículo de la línea 1, así que no
      hay máquina a la cual acreditarle la devolución. El código está en el documento:
      quedó escrito en la casilla del transportista.
      <svelte:fragment slot="actions">
        <Button size="sm" on:click={() => (seleccionado = 'DEV-8631')}>Abrir la devolución 8631</Button>
      </svelte:fragment>
    </Alert>
  {/if}

  <StatStrip label="Estado de la bandeja">
    <Stat label="Falta revisar" value={porRevisar} tone="attention" note="dudosos y bloqueados" />
    <Stat label="Bloqueados" value={bloqueados} tone="critical" note="les falta algo indispensable" />
    <Stat label="Listos para aplicar" value={aplicables.length} outOf={DOCUMENTOS.length} tone="positive" />
    <Stat
      label="Horas por acreditar"
      value={horasPorAcreditar}
      unit="h"
      note="Una salida no acredita uso; lo acredita la devolución."
    />
  </StatStrip>

  <Panel
    title="Entrada"
    sub="Salidas y devoluciones tal como las imprime el ERP del proveedor."
    level={2}
    icon="file"
  >
    <FileDrop
      label="Documentos de despacho"
      bind:files={archivos}
      accept="application/pdf,.pdf"
      maxSize={10 * 1024 * 1024}
      note="PDF, hasta 10 MB cada uno"
      hint="El lector saca el número, la fecha, el equipo y el horómetro. Un PDF escaneado también entra, pero sale con más campos supuestos que uno exportado como texto."
    />

    <svelte:fragment slot="footer">
      <Row gap={3} justify="between">
        <span class="pie">Último lote: 8 PDF · hace 14 minutos · Kenneth Ureña</span>
        <Button
          disabled={archivos.length === 0}
          reason={archivos.length === 0 ? 'Todavía no hay archivos en la zona de entrada.' : ''}
          on:click={leerArchivos}
        >
          {archivos.length <= 1 ? 'Leer el documento' : `Leer los ${archivos.length} documentos`}
        </Button>
      </Row>
    </svelte:fragment>
  </Panel>

  <!-- La bandeja a la izquierda, el documento abierto a la derecha. Debajo de
       1060px la revisión pasa a ser la fila siguiente en vez de una columna de
       40ch, que es donde la fuente de un campo empieza a partirse en cinco
       líneas. -->
  <div class="tablero">
    <div class="bandeja">
      <div class="filtros">
        <SearchField
          bind:value={busqueda}
          label="Buscar documentos"
          placeholder="Número, equipo o archivo…"
          resultCount={visibles.length}
          noun="documentos"
        />
        <FilterChips
          options={chips}
          bind:value={filtro}
          label="Filtrar por veredicto de lectura"
          total={DOCUMENTOS.length}
          allLabel="Todos"
        />
      </div>

      <!-- FALTA EN LA LIBRERÍA: Table no sabe marcar la fila ACTIVA, la que está
           abierta en el panel de al lado. `selected` es selección múltiple con
           casilla, que es otra cosa. Acá se compensa con el panel diciendo el
           número del documento en el título, pero en una bandeja de 200 filas eso
           no alcanza. -->
      <Table
        columns={columnas}
        rows={visibles}
        rowKey={(r) => r.numero}
        caption="Documentos leídos y el veredicto de cada lectura"
        sort={{ key: 'veredicto', dir: 'asc' }}
        total={DOCUMENTOS.length}
        query={busqueda}
        filtered={filtro !== null}
        noun="documento"
        nounPlural="documentos"
        gender="m"
        open
        rowLabel={(r) => `Revisar ${r.numero}`}
        on:open={(e) => { seleccionado = e.detail.row.numero; editando = null; }}
        on:clear={() => { busqueda = ''; filtro = null; }}
      >
        <svelte:fragment slot="cell" let:row let:col let:value>
          {#if col.key === 'veredicto'}
            <Pill tone={VEREDICTO[row.veredicto].tono}>{VEREDICTO[row.veredicto].palabra}</Pill>
          {:else if col.key === 'equipo'}
            {value ?? 'sin resolver'}
          {:else}
            {value ?? '—'}
          {/if}
        </svelte:fragment>
      </Table>
    </div>

    <div class="revision">
      {#if abierto}
        <Panel
          title={abierto.numero}
          sub="{abierto.tipo} · {abierto.archivo} · {abierto.lineas} líneas"
          level={2}
        >
          <svelte:fragment slot="actions">
            <Pill tone={VEREDICTO[abierto.veredicto].tono}>{VEREDICTO[abierto.veredicto].palabra}</Pill>
          </svelte:fragment>

          {#if abierto.veredicto === 'bloqueado' && abierto.nota}
            <div class="banda">
              <Alert tone="critical" title={abierto.nota.titulo} live={false}>
                {abierto.nota.texto}
              </Alert>
            </div>
          {/if}

          <ul class="campos">
            {#each camposAbiertos as c, i (c.clave)}
              <li class="campo">
                {#if i > 0}<Divider />{/if}

                {#if editando === c.clave}
                  <!-- El control trae su propio <label for>, así que la etiqueta
                       del campo no se dibuja dos veces: mientras se corrige, la
                       que manda es la del control. -->
                  {#if c.tipo === 'equipo'}
                    <Select
                      label={c.etiqueta}
                      options={OPCIONES_EQUIPO}
                      bind:value={borrador}
                      placeholder="Elegí el equipo"
                      required
                      hint="Solo equipos de la flota. Un texto libre acá es cómo una máquina termina con tres nombres."
                    />
                  {:else if c.tipo === 'fecha'}
                    <DateInput
                      label={c.etiqueta}
                      bind:value={borrador}
                      max={today()}
                      relative
                      hint="Escribí la fecha real, no la que sugiere el formato del PDF."
                    />
                  {:else if c.tipo === 'numero'}
                    <NumberInput
                      label={c.etiqueta}
                      unit={c.unidad ?? ''}
                      bind:value={borrador}
                      align="right"
                      required
                      hint={c.piso != null
                        ? `Tiene que ser igual o mayor que ${c.piso.toLocaleString('es-CR')} ${c.unidad}.`
                        : ''}
                      error={bajoElPiso
                        ? `Un horómetro no retrocede. La última lectura registrada es ${c.piso.toLocaleString('es-CR')} ${c.unidad}.`
                        : ''}
                      fix={bajoElPiso
                        ? 'Revisá el número. Si le cambiaron el instrumento al equipo, eso se registra aparte y no como una lectura más baja.'
                        : ''}
                    />
                  {:else}
                    <Input label={c.etiqueta} bind:value={borrador} mono={!!c.mono} required />
                  {/if}

                  <Row gap={2}>
                    <Button
                      size="sm"
                      disabled={bajoElPiso}
                      reason={bajoElPiso ? 'La lectura no puede ser menor que la anterior.' : ''}
                      on:click={() => guardar(c)}
                    >
                      Guardar<span class="sx-sr"> {c.etiqueta} de {abierto.numero}</span>
                    </Button>
                    <Button size="sm" variant="ghost" on:click={() => (editando = null)}>
                      Cancelar<span class="sx-sr"> la corrección de {c.etiqueta}</span>
                    </Button>
                  </Row>
                {:else}
                  <Row gap={3} justify="between" align="baseline">
                    <span class="sx-cap">{c.etiqueta}</span>
                    <!-- Un campo sin valor no tiene procedencia: la procedencia
                         contesta «¿de dónde salió esto?» y acá no salió nada.
                         Decir «leído del PDF» de una casilla vacía sería la única
                         mentira que esta pantalla no se puede permitir. -->
                    {#if c.valor === null || c.valor === ''}
                      <Pill tone="critical" size="sm">No venía</Pill>
                    {:else}
                      <Pill tone={TONO_PROC[c.procedencia]} size="sm">{PALABRA_PROC[c.procedencia]}</Pill>
                    {/if}
                  </Row>

                  <!-- Los registros —mono para identificador, tabular para
                       cifra— valen sobre el VALOR. Cuando no hay valor, lo que
                       se imprime es una frase, y una frase en monoespaciado se
                       lee como si el documento trajera ese texto: dos campos
                       vacíos seguidos salían en dos tipografías distintas. -->
                  <p
                    class="dato"
                    class:vacio={c.valor === null || c.valor === ''}
                    class:sx-id={c.mono && c.valor}
                    class:sx-num={c.tipo === 'numero' && c.valor}
                  >
                    {#if c.valor === null || c.valor === ''}
                      El documento no lo trae.
                    {:else if c.tipo === 'fecha'}
                      {enPalabras(c.valor)}
                    {:else}
                      {c.valor}
                    {/if}
                  </p>

                  <p class="fuente">{c.fuente}</p>
                  {#if c.confirmadoPor}
                    <p class="fuente">Confirmado por {c.confirmadoPor}.</p>
                  {/if}

                  <Row gap={2}>
                    {#if c.arreglo}
                      <Button size="sm" on:click={() => arreglar(c)}>{c.arreglo.texto}</Button>
                    {/if}
                    {#if c.procedencia === 'inferred' || c.procedencia === 'disputed'}
                      <Button size="sm" on:click={() => confirmar(c)}>
                        Confirmar<span class="sx-sr"> {c.etiqueta} de {abierto.numero}</span>
                      </Button>
                    {/if}
                    <!-- Texto visible corto y el resto en .sx-sr: «Corregir» seis
                         veces deja a quien navega por lista de controles sin saber
                         cuál es cuál, y el nombre completo desborda la columna. -->
                    <Button size="sm" variant="ghost" on:click={() => corregir(c)}>
                      {c.valor ? 'Corregir' : 'Escribirlo a mano'}<span class="sx-sr"> · {c.etiqueta} de {abierto.numero}</span>
                    </Button>
                  </Row>
                {/if}
              </li>
            {/each}
          </ul>

          <svelte:fragment slot="footer">
            <Row gap={3} justify="between">
              <!-- No hay un botón que confirme los seis de un golpe, y la ausencia
                   es la decisión: confirmar es mirar. Un control que aprueba seis
                   suposiciones a la vez convierte la revisión en un trámite y deja
                   una suposición pisando una máquina que sí se mide. -->
              <span class="pie">
                {faltanCampos === 0
                  ? 'Todos los campos están leídos o confirmados.'
                  : faltanCampos === 1
                    ? 'Falta 1 campo. Se confirma de a uno.'
                    : `Faltan ${faltanCampos} campos. Se confirman de a uno.`}
              </span>
              <Button variant="ghost" size="sm" on:click={() => { seleccionado = null; editando = null; }}>
                Cerrar<span class="sx-sr"> el documento {abierto.numero}</span>
              </Button>
            </Row>
          </svelte:fragment>
        </Panel>
      {:else}
        <Panel title="Revisión" sub="Un documento a la vez." level={2}>
          <!-- La acción va por el slot y no por la prop `action`, que dibuja un
               botón sólido: el único sólido de esta pantalla es «Aplicar», abajo.
               Dos respuestas a «¿qué quiere esta pantalla que haga?» es ninguna. -->
          <EmptyState compact heading="h3" title="No hay ningún documento abierto.">
            Abrí una fila de la bandeja para ver, campo por campo, qué leyó el
            sistema y de dónde lo sacó.
            <svelte:fragment slot="actions">
              {#if porRevisar > 0}
                <Button
                  on:click={() => (seleccionado = filas.find((f) => f.veredicto !== 'leido')?.numero ?? null)}
                >
                  Abrir el primero que falta
                </Button>
              {/if}
            </svelte:fragment>
          </EmptyState>
        </Panel>
      {/if}
    </div>
  </div>

  <!-- El veredicto de la lectura y el de la escritura son dos preguntas
       distintas, y por eso son dos superficies distintas: arriba se revisa QUÉ
       ENTENDIÓ el lector de un documento, acá se revisa QUÉ VA A PASAR con los
       ocho. ReviewPanel existe para lo segundo — un lote de propuestas, ninguna
       escrita — y es el único lugar de la pantalla con un botón sólido. -->
  <ReviewPanel
    items={propuestas}
    state={estadoLote}
    selectable
    title="Lo que se le va a escribir a los equipos"
    note="Aplicar un documento le suma el uso al reloj del equipo y mueve la fecha del plan. Un plan corre contra dos relojes y vence con el que llegue primero, así que esto adelanta unos y no toca otros."
    noun={['documento', 'documentos']}
    verb={{
      infinitive: 'aplicar',
      commit: 'Aplicar',
      doing: 'Aplicando…',
      done: 'aplicado',
      donePlural: 'aplicados'
    }}
    cancelLabel="Volver a la bandeja"
    on:commit={aplicar}
    on:cancel={() => (seleccionado = null)}
    on:done={() => (estadoLote = 'review')}
  />
</div>

<Toast bind:toasts on:dismiss={(e) => (toasts = toasts.filter((t) => t.id !== e.detail.id))} on:action={deshacer} />

<style>
  /* Solo distribución, como en las otras dos pantallas. Ni un color, ni un radio,
     ni una sombra: los espacios salen de la escala de tokens y no de números
     sueltos, y por eso un cambio de tema no toca este archivo. */
  .pantalla {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-6);
    padding: var(--sx-s-6);
    max-width: 1240px;
    margin: 0 auto;
  }

  .tablero {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sx-s-6);
    align-items: start;
  }
  .bandeja {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
    min-width: 0;
  }
  .revision { min-width: 0; }

  @media (min-width: 1060px) {
    .tablero { grid-template-columns: minmax(0, 1.75fr) minmax(360px, 1fr); }
    /* La bandeja es larga y el documento abierto se lee contra ella; pegado
       arriba se puede saltar de fila en fila sin perder de vista lo que se está
       confirmando. Debajo de 1060px son dos filas y pegarlo no significa nada. */
    .revision { position: sticky; top: var(--sx-s-4); }
  }

  .filtros {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--sx-s-4);
  }
  .filtros :global(> *:first-child) { flex: 1 1 240px; min-width: 0; }

  .banda { margin-bottom: var(--sx-s-5); }

  .campos {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-5);
  }
  .campo {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    min-width: 0;
  }

  .dato {
    margin: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-medium);
    line-height: 1.4;
    color: var(--sx-ink);
    overflow-wrap: anywhere;
  }
  /* Que falte un dato no se dice solo con gris: la Pill de al lado dice «No
     venía» y el texto dice la frase entera. El gris es el tercer aviso, no el
     único. */
  .vacio { font-weight: var(--sx-w-normal); color: var(--sx-ink-3); }

  .fuente {
    margin: 0;
    font-size: var(--sx-t-xs);
    line-height: 1.55;
    color: var(--sx-ink-3);
    max-width: 62ch;
  }

  .pie {
    min-width: 0;
    font-size: var(--sx-t-xs);
    line-height: 1.5;
    color: var(--sx-ink-3);
  }

  @media (max-width: 420px) {
    .pantalla { padding: var(--sx-s-4); gap: var(--sx-s-5); }
  }
</style>
