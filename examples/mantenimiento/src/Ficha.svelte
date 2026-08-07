<script>
  // TERCER EJEMPLO: la ficha de UNA máquina.
  //
  // Flota enseña a mostrar muchos registros. Lectura enseña a recibir uno. Esta
  // enseña lo tercero, que es lo más difícil de las tres: JERARQUÍA. Una ficha
  // tiene cuarenta datos y los cuarenta son ciertos, así que el trabajo no es
  // mostrarlos — es decidir en qué orden.
  //
  // El orden de abajo sale de una escena concreta: alguien parado frente a la
  // batidora, con el teléfono en una mano y el horómetro a la vista. Lo que esa
  // persona necesita, en este orden:
  //
  //   1. ¿es esta la máquina?     → el código y el nombre, arriba de todo
  //   2. ¿qué le pasa?            → el estado, y una frase que lo explique
  //   3. ¿qué hago?               → las acciones, a la altura del estado
  //   4. ¿cuánto marca?           → los dos relojes
  //   5. ¿contra qué corre?       → los planes vigentes
  //   6. ¿qué le hicieron antes?  → el historial
  //   7. el papeleo               → identidad y códigos externos
  //
  // La identidad va de último a propósito, aunque sea lo que más se parece a una
  // ficha de papel. Quien abre esta pantalla ya tiene la máquina enfrente: el
  // encabezado le confirma en una línea que es la correcta, y el resto de la
  // identidad es papeleo que se consulta, no que se lee.
  //
  // Como en las otras dos pantallas: este archivo no define ni un color, ni un
  // radio, ni una sombra. Lo único que aporta es distribución, y los espacios
  // salen de la escala de tokens.
  import {
    PageHeader, Pill, Button, Menu, Glyph,
    Panel, Well, Stack, Divider,
    StatStrip, Stat, Bar,
    Alert, Tabs, Table, DataList,
    Dialog, DateInput, Textarea, Toast, today
  } from '@strix/frontend-lib';
  import { EQUIPOS } from './data.js';

  // La ficha lee el MISMO registro que la fila de la flota. Si el estado de
  // BAT-014 cambia en data.js, cambian las dos pantallas: una ficha que se
  // copiara los datos sería una segunda versión de la verdad.
  const EQUIPO = EQUIPOS.find((e) => e.id === 'BAT-014');

  // ── Lo que la ficha necesita y la fila de la flota no ────────────────────
  // Va acá como const y no en data.js: data.js es el índice de la flota, y
  // meterle el historial de una máquina lo convertiría en la base de datos.
  //
  // Todo lo de abajo está anclado a un «hoy» explícito —viernes 7 de agosto de
  // 2026— porque las cuentas tienen que cuadrar entre sí. Un ejemplo con fechas
  // relativas al reloj de quien lo abre es un ejemplo que miente a los seis meses.
  const HOY = '7 de agosto de 2026';

  const IDENTIDAD = [
    ['Familia', 'Batidoras'],
    ['Ubicación', 'Bodega San José · pasillo 3'],
    ['Disponibilidad', 'Disponible desde el 5 de agosto de 2026'],
    ['En la flota desde', '12 de agosto de 2025'],
    ['Serie', '250-SY-19477', true],
    ['Año', '2023'],
    ['Reloj', 'Horómetro mecánico, en horas. No retrocede y no se puede poner en cero.']
  ];

  // «Cliente» en Strix es el ESPACIO DE TRABAJO —acá, Alquileres del Valle—, no
  // la empresa que alquila la máquina. Estos son los códigos con los que BAT-014
  // aparece en la papelería de ese espacio de trabajo; la empresa que se lleva la
  // batidora a una obra sale más abajo, en «Salidas y devoluciones».
  const CODIGOS = [
    ['Código en el ERP', 'EQ-0001874', true],
    ['Nº de activo fijo', 'AF-2025-0311', true],
    ['Código en la boleta', 'B-14', true],
    ['Etiqueta QR pegada', 'BAT014-CR', true]
  ];

  const pct = (parte, tope) => Math.round((parte / tope) * 100);

  // Los tres planes vigentes, y los tres casos que hay que saber leer:
  //   · el de aceite lo venció el reloj de USO, 10 días antes que el calendario
  //   · el anual lo aprieta el CALENDARIO, con el uso todavía holgado
  //   · el de la corona no tiene calendario: corre solo contra horas
  const PLANES = [
    {
      id: 'aceite',
      nombre: 'Cambio de aceite de la reductora · cada 250 h o cada 6 meses',
      avance: pct(295, 250),
      tono: 'critical',
      palabra: 'Vencido',
      escala: '295 h de 250 h · mandó el reloj de uso',
      nota:
        'El uso pasó el tope el 26 de julio, entre la salida (261 h) y la devolución (312 h): ' +
        'la fecha exacta está interpolada, las 45 h de más no. Por calendario todavía faltaban 10 días.'
    },
    {
      id: 'paletas',
      nombre: 'Revisión de paletas, sellos y aro de descarga · cada 500 h o cada 12 meses',
      avance: pct(337, 365),
      tono: 'attention',
      palabra: 'En 28 días',
      escala: '337 d de 365 d · manda el reloj de calendario',
      nota:
        'Por uso va en 303 h de 500 h, holgado. Lo que aprieta es el año, que se cumple ' +
        'el 4 de setiembre.'
    },
    {
      id: 'corona',
      nombre: 'Cambio de corona y piñón · cada 1 000 h',
      avance: pct(312, 1000),
      tono: 'none',
      palabra: '',
      escala: '312 h de 1 000 h · este plan no corre contra calendario',
      nota:
        'Al ritmo del ciclo (1,7 h/día) cae a mediados de 2027; al de la obra 012 (4,3 h/día), ' +
        'en marzo. La proyección se recalcula con cada lectura.'
    }
  ];

  // El historial de lecturas. `orden` existe para ordenar sin depender de cómo se
  // escribió la fecha: la columna imprime «5 de agosto de 2026 · 08:40» y compara
  // un entero, que es justo para lo que Table separa `value` de `sortValue`.
  const LECTURAS = [
    { orden: 8, fecha: '5 de agosto de 2026 · 08:40', horometro: 312, delta: 51, fuente: 'DISPATCH', doc: 'DEV-2026-0913', quien: 'Kendall Rojas Solano' },
    { orden: 7, fecha: '24 de julio de 2026 · 06:15', horometro: 261, delta: 37, fuente: 'DISPATCH', doc: 'SAL-2026-0864', quien: 'Kendall Rojas Solano' },
    { orden: 6, fecha: '9 de julio de 2026 · 15:20', horometro: 224, delta: 52, fuente: 'DISPATCH', doc: 'DEV-2026-0790', quien: 'Kendall Rojas Solano' },
    { orden: 5, fecha: '11 de junio de 2026 · 07:50', horometro: 172, delta: 39, fuente: 'DISPATCH', doc: 'SAL-2026-0731', quien: 'Kendall Rojas Solano' },
    { orden: 4, fecha: '18 de mayo de 2026 · 16:05', horometro: 133, delta: 25, fuente: 'MANUAL', doc: '', quien: 'Marielos Vargas Chinchilla' },
    { orden: 3, fecha: '24 de abril de 2026 · 09:00', horometro: 108, delta: 47, fuente: 'SCHEDULE', doc: '1,4 h/día declarados', quien: '' },
    { orden: 2, fecha: '20 de marzo de 2026 · 09:00', horometro: 61, delta: 44, fuente: 'SCHEDULE', doc: '1,4 h/día declarados', quien: '' },
    { orden: 1, fecha: '17 de febrero de 2026 · 11:30', horometro: 17, delta: null, fuente: 'MANUAL', doc: 'OT-2026-0188', quien: 'Óscar Jiménez Mora' }
  ];

  // Una lectura es comparable con la siguiente —por eso es tabla— pero un
  // mantenimiento no: tiene un folio, una fecha, un monto y una nota en prosa de
  // tres líneas. Metidos en columnas, la nota queda ilegible y el monto invisible.
  // Eso es exactamente el caso que DataList describe en su encabezado.
  const MANTENIMIENTOS = [
    {
      ot: 'OT-2026-0245',
      tarea: 'Cambio de aceite de la reductora',
      fecha: '12 de mayo de 2026',
      horometro: null,
      tecnico: 'Marielos Vargas Chinchilla',
      costo: '',
      tono: 'neutral',
      palabra: 'Anulada',
      nota:
        'Se abrió contra BAT-014 por error: el aceite se le cambió a BAT-021, que estaba al lado. ' +
        'Queda en el historial anulada y no en blanco, porque un folio que desaparece es un folio que alguien va a buscar.'
    },
    {
      ot: 'OT-2026-0188',
      tarea: 'Cambio de aceite de la reductora',
      fecha: '17 de febrero de 2026',
      horometro: 17,
      tecnico: 'Óscar Jiménez Mora',
      costo: '₡42 800',
      tono: 'positive',
      palabra: 'Hecho',
      nota:
        'Se cambió también el retén del eje de salida. La manguera de retorno está reseca: ' +
        'hay que pedirla antes de que se raje.'
    },
    {
      ot: 'OT-2025-0904',
      tarea: 'Ajuste de la tapa y cambio del empaque de la boca de carga',
      fecha: '21 de noviembre de 2025',
      horometro: 14,
      tecnico: 'Kendall Rojas Solano',
      costo: '₡18 900',
      tono: 'positive',
      palabra: 'Hecho',
      nota: 'Correctivo, no de plan. Entró de la obra 004 con la tapa golpeada.'
    },
    {
      ot: 'OT-2025-0631',
      tarea: 'Revisión de paletas, sellos y aro de descarga',
      fecha: '4 de setiembre de 2025',
      horometro: 9,
      tecnico: 'Marielos Vargas Chinchilla',
      costo: '₡118 400',
      tono: 'positive',
      palabra: 'Hecho',
      nota:
        'Revisión de entrada a la flota. El sello del eje quedó con juego; se dejó anotado ' +
        'para la siguiente.'
    }
  ];

  // La columna se llama «Alquilada a» y no «Cliente» a propósito: en Strix el
  // cliente es el espacio de trabajo. Constructora Peñaranda no es el cliente —
  // es quien se llevó la máquina.
  const ALQUILERES = [
    { orden: 6, salida: '24 de julio de 2026', devolucion: '5 de agosto de 2026', dias: 12, aQuien: 'Constructora Peñaranda · obra 012, Santa Ana', horas: 51, boleta: 'SAL-2026-0864' },
    { orden: 5, salida: '11 de junio de 2026', devolucion: '9 de julio de 2026', dias: 28, aQuien: 'Grupo Alvarado · obra 007, Liberia', horas: 52, boleta: 'SAL-2026-0731' },
    { orden: 4, salida: '3 de abril de 2026', devolucion: '28 de abril de 2026', dias: 25, aQuien: 'Constructora Peñaranda · obra 004, Escazú', horas: null, boleta: 'SAL-2026-0498' },
    { orden: 3, salida: '6 de febrero de 2026', devolucion: '14 de febrero de 2026', dias: 8, aQuien: 'Constructora Peñaranda · obra 004, Escazú', horas: null, boleta: 'SAL-2026-0203' },
    { orden: 2, salida: '28 de octubre de 2025', devolucion: '20 de noviembre de 2025', dias: 23, aQuien: 'Constructora Peñaranda · obra 004, Escazú', horas: null, boleta: 'SAL-2025-0811' },
    { orden: 1, salida: '12 de setiembre de 2025', devolucion: null, dias: null, aQuien: 'Inversiones Tapezco · obra 001, Curridabat', horas: null, boleta: 'SAL-2025-0702' }
  ];

  // Las columnas se declaran una vez y el formato vive acá, no en cada celda.
  // `id: true` pone el registro monoespaciado: MANUAL, DISPATCH y SAL-2026-0864
  // son códigos que se leen carácter por carácter, no palabras que se leen de un
  // vistazo. Una fecha en cambio NO es identificador y NO es numeric: se lee.
  //
  // Solo la fecha es `sortable`. Ordenar un historial por horómetro es ordenarlo
  // por fecha con otro nombre —un horómetro no retrocede, así que las dos
  // columnas tienen exactamente el mismo orden— y ordenarlo por fuente rompe lo
  // único para lo que sirve un historial, que es la secuencia.
  const COLS_LECTURAS = [
    { key: 'fecha', label: 'Fecha', primary: true, min: '20ch', sortable: true, order: 'date', sortValue: (r) => r.orden },
    { key: 'horometro', label: 'Horómetro', numeric: true, min: '11ch', value: (r) => `${r.horometro.toLocaleString('es-CR')} h` },
    { key: 'delta', label: 'Desde la anterior', numeric: true, optional: true, showAt: 900, min: '14ch', value: (r) => (r.delta === null ? 'primera' : `+${r.delta} h`) },
    { key: 'fuente', label: 'Fuente', id: true, min: '12ch' },
    { key: 'quien', label: 'Registró', optional: true, showAt: 780, min: '22ch', wrap: true, value: (r) => r.quien || 'Automática' },
    { key: 'doc', label: 'De dónde salió', id: true, optional: true, showAt: 1000, min: '16ch' }
  ];

  const COLS_ALQUILERES = [
    { key: 'salida', label: 'Salida', primary: true, min: '15ch', sortable: true, order: 'date', sortValue: (r) => r.orden },
    { key: 'devolucion', label: 'Devolución', min: '18ch' },
    { key: 'dias', label: 'Días', numeric: true, min: '8ch', sortable: true, value: (r) => (r.dias === null ? '—' : `${r.dias} d`), sortValue: (r) => r.dias },
    { key: 'aQuien', label: 'Alquilada a', min: '28ch', wrap: true },
    { key: 'horas', label: 'Horas al horómetro', numeric: true, optional: true, showAt: 860, min: '14ch', value: (r) => (r.horas === null ? '—' : `+${r.horas} h`) },
    { key: 'boleta', label: 'Boleta', id: true, optional: true, showAt: 980, min: '14ch' }
  ];

  const PESTANAS = [
    { key: 'lecturas', label: 'Lecturas', count: LECTURAS.length },
    { key: 'mantenimientos', label: 'Mantenimientos', count: MANTENIMIENTOS.length },
    { key: 'alquileres', label: 'Salidas y devoluciones', count: ALQUILERES.length }
  ];

  // «Dar de baja» llega deshabilitado CON razón, que es lo que lo deja enfocable
  // y lo que hace que la razón se lea. Deshabilitado y mudo es un control que
  // obliga a adivinar.
  const ACCIONES = [
    { id: 'posponer', label: 'Posponer el plan vencido…' },
    { id: 'editar', label: 'Editar la ficha' },
    { sep: true },
    { id: 'baja', label: 'Dar de baja', tone: 'critical', disabled: true, reason: 'Tiene un plan vencido sin cerrar.' }
  ];

  let pestana = 'lecturas';
  let ordenLecturas = { key: 'fecha', dir: 'desc' };
  let ordenAlquileres = { key: 'salida', dir: 'desc' };

  let posponiendo = false;
  let nuevaFecha = today();
  let razon = '';
  let intentado = false;

  let toasts = [];
  let seq = 0;

  // La expresión completa dentro del $:. Un `const` auxiliar que cerrara sobre
  // `nuevaFecha` o sobre `intentado` sería invisible para el compilador y la
  // validación se quedaría congelada en el primer valor — el bug que este
  // ecosistema ya envió cinco veces.
  $: fechaSinMover = intentado && nuevaFecha <= today();
  $: sinRazon = intentado && razon.trim() === '';

  function avisar(t) {
    toasts = [...toasts, { id: ++seq, ...t }];
  }
  function quitar(id) {
    toasts = toasts.filter((t) => t.id !== id);
  }

  function marcarHecho() {
    // Toast con deshacer en vez de confirmar antes de guardar: confirmar
    // interrumpe siempre, deshacer solo molesta cuando de verdad hubo un error.
    avisar({
      tone: 'positive',
      text: 'Cambio de aceite marcado como hecho hoy, a las 312 h. Los dos relojes vuelven a cero desde ahí.',
      action: 'Deshacer'
    });
  }

  function enAccion(e) {
    if (e.detail.id === 'posponer') {
      posponiendo = true;
      return;
    }
    if (e.detail.id === 'editar') {
      // El ejemplo no tiene a dónde navegar, y un control que no hace nada
      // enseña justo lo contrario de lo que esta pantalla viene a enseñar.
      avisar({ tone: 'info', text: 'En un producto real, acá se abre la ficha en modo edición.' });
    }
  }

  function cerrarPosponer() {
    posponiendo = false;
    intentado = false;
    razon = '';
    nuevaFecha = today();
  }

  function guardarPosponer() {
    intentado = true;
    if (nuevaFecha <= today() || razon.trim() === '') return;
    avisar({
      tone: 'attention',
      text: 'Plan pospuesto. Se movió el calendario; el reloj de uso quedó donde estaba.',
      action: 'Deshacer'
    });
    cerrarPosponer();
  }
</script>

<div class="pantalla">
  <PageHeader eyebrow="Ficha de equipo" title={EQUIPO.nombre} subtitle="{EQUIPO.familia} · {EQUIPO.ubicacion} · en la flota desde el 12 de agosto de 2025.">
    <svelte:fragment slot="crumbs">
      <!-- Un Breadcrumb acá sería ceremonia. La ruta real tiene dos niveles
           —Flota y esta ficha—, y un rastro de un solo salto es un botón de
           volver disfrazado; lo dice el encabezado de Breadcrumb. Y es un <a>
           y no un <button> porque navega: tiene que abrirse en otra pestaña
           con el clic del medio.

           HALLAZGO: el volver aterriza en el slot `crumbs` porque PageHeader no
           tiene otro sitio para él, y ese slot se llama y se documenta como el
           del rastro. Toda pantalla de detalle del ecosistema va a necesitar
           este control; el encabezado debería nombrarlo. -->
      <Button href="#flota" variant="ghost" size="sm">
        <svelte:fragment slot="icon"><Glyph name="chevronLeft" /></svelte:fragment>
        Volver a la flota
      </Button>
    </svelte:fragment>

    <svelte:fragment slot="meta">
      <span class="sx-id">{EQUIPO.id}</span>
      <Pill tone={EQUIPO.estado}>{EQUIPO.palabra}</Pill>
    </svelte:fragment>

    <svelte:fragment slot="actions">
      <!-- Una primaria por vista. Es «Registrar lectura» y no «Marcar hecho»
           porque el atraso se mide con una lectura: quien llega con la máquina
           enfrente todavía no sabe cuánto marca. -->
      <Button href="#lectura" variant="solid">Registrar lectura</Button>
      <Button on:click={marcarHecho}>Marcar hecho</Button>
      <Menu label="Más acciones" items={ACCIONES} on:select={enAccion} />
    </svelte:fragment>
  </PageHeader>

  <Alert tone="critical" title="El cambio de aceite venció hace 12 días">
    Mandó el reloj de uso: la batidora pasó las 250 h del plan el 26 de julio, diez días
    antes de que el calendario cumpliera los seis meses. Va en 295 h de uso, 45 h arriba
    del tope.
  </Alert>

  <div class="relojes">
    <StatStrip label="Los dos relojes de {EQUIPO.id}">
      <Stat
        label="Horómetro"
        value={EQUIPO.lectura}
        unit="h"
        note="Última lectura: 5 de agosto, 08:40, de la boleta de devolución."
      />
      <Stat
        label="Uso desde el último servicio"
        value={295}
        unit="h"
        outOf={250}
        note="El tope del plan de aceite. Se cruzó el 26 de julio."
      />
      <Stat
        label="Calendario desde el último servicio"
        value={171}
        unit="d"
        outOf={181}
        note="Los seis meses se cumplen el 17 de agosto."
      />
      <Stat
        label="Uso diario observado"
        value={1.7}
        unit="h/d"
        note="Promedio del ciclo. En la obra 012, del 24 de julio al 5 de agosto, promedió 4,3 h/día."
      />
    </StatStrip>

    <!-- Un Well y no un Alert: esto no es una condición que haya que atender, es
         la regla con la que se leen las cuatro cifras de arriba. Un Alert que
         explica en vez de avisar es una banda que en dos semanas nadie lee. -->
    <Well pad={4}>
      <p class="parrafo">
        Un plan corre contra los dos relojes de arriba y vence con el que llegue primero.
        En {EQUIPO.id} hoy manda el de uso: la batidora promedia 1,7 h por día en el ciclo y
        4,3 h por día cuando está en obra, así que las 250 h del plan de aceite llegaron antes
        que los seis meses. En la revisión anual manda el otro, porque ese plan no tiene tope
        de horas.
      </p>
    </Well>
  </div>

  <div class="cuerpo">
    <Panel
      level={2}
      title="Planes vigentes"
      sub="El avance es el del reloj que va adelante; la línea de abajo dice cuál es y contra qué."
    >
      <Stack gap={5}>
        <!-- Las tres barras comparten `max={100}` justamente porque acá SÍ se
             comparan: la pregunta es cuál plan está más cerca de vencer. El
             tope real de cada una —horas o días— va en `scale`, que existe para
             cuando «0 — 100» no es como se lee el límite de verdad. -->
        {#each PLANES as p (p.id)}
          <Bar
            label={p.nombre}
            value={p.avance}
            max={100}
            unit="%"
            tone={p.tono}
            toneWord={p.palabra}
            scale={p.escala}
            note={p.nota}
          />
        {/each}
      </Stack>
    </Panel>

    <Panel level={2} title="Identidad" icon="clipboard">
      <Stack gap={5}>
        <!-- Pares etiqueta/valor. La librería no tiene componente para esto: -->
        <!-- HALLAZGO: no hay nada entre Table (que su propio encabezado prohíbe
             para dos columnas) y escribir un <dl> a mano. Toda pantalla de
             detalle del ecosistema va a reinventar esta rejilla, y cada una la
             va a alinear distinto. Falta un DescriptionList en la familia data. -->
        <dl class="datos">
          {#each IDENTIDAD as [etiqueta, valor, esCodigo] (etiqueta)}
            <div>
              <dt class="sx-cap">{etiqueta}</dt>
              <dd class:sx-id={esCodigo}>{valor}</dd>
            </div>
          {/each}
        </dl>

        <Divider label="Códigos externos" />

        <dl class="datos">
          {#each CODIGOS as [etiqueta, valor, esCodigo] (etiqueta)}
            <div>
              <dt class="sx-cap">{etiqueta}</dt>
              <dd class:sx-id={esCodigo}>{valor}</dd>
            </div>
          {/each}
        </dl>

        <Well pad={4}>
          <p class="parrafo">
            Estos son los códigos con los que {EQUIPO.id} aparece en la papelería del cliente
            —el espacio de trabajo, Alquileres del Valle—, no de quien alquila la máquina.
            La empresa que se la lleva a una obra sale en las salidas.
          </p>
        </Well>
      </Stack>
    </Panel>
  </div>

  <!-- El historial ocupa el ancho completo y no la columna izquierda: sus tablas
       tienen seis columnas, y a 700px se le caen tres de ellas por angostas. -->
  <Panel level={2} title="Historial" sub="Todo lo que se le registró a {EQUIPO.id}, en orden.">
    <!-- Tabs y no Segmented: cada pestaña son registros distintos con columnas
         distintas, y a cualquiera de las tres se le podría mandar un enlace.
         Ese es el examen que Tabs pone en su encabezado. -->
    <Tabs items={PESTANAS} bind:value={pestana} label="Historial de {EQUIPO.id}">
      {#if pestana === 'lecturas'}
        <Stack gap={4}>
          <!-- HALLAZGO: las dos lecturas SCHEDULE son proyecciones, no medidas, y
               en esta tabla se ven exactamente igual que las otras seis. Stat,
               Bar y Sparkline comparten una marca de estimado —el trazo cortado
               y la palabra— y Table no tiene nada equivalente para una celda ni
               para una fila. Acá la diferencia la sostiene la prosa de abajo, que
               es justo lo que esa marca existe para no tener que hacer. -->
          <Table
            columns={COLS_LECTURAS}
            rows={LECTURAS}
            rowKey={(r) => r.orden}
            bind:sort={ordenLecturas}
            caption="Lecturas del horómetro de {EQUIPO.id}, de la más reciente a la más antigua"
            noun="lectura"
            nounPlural="lecturas"
            gender="f"
          />

          <Well pad={4}>
            <p class="parrafo">
              El reloj de uso lo escriben cuatro fuentes, y no todas valen lo mismo.
              MANUAL y DISPATCH son medidas: alguien leyó el horómetro, o venía en la boleta.
              SCHEDULE es declarada — 1,4 h/día que alguien escribió una vez.
            </p>
            <p class="parrafo">
              Lo observado le gana a lo declarado. El 18 de mayo llegó la primera lectura real y
              reemplazó la proyección: el horario declarado venía diez horas arriba. Desde entonces
              SCHEDULE no vuelve a escribir en {EQUIPO.id}, y no lo hará mientras haya medición.
              Por eso la columna «Desde la anterior» nunca es negativa: un horómetro no retrocede,
              y una suposición no pisa una medición.
            </p>
          </Well>
        </Stack>
      {:else if pestana === 'mantenimientos'}
        <DataList
          label="Mantenimientos de {EQUIPO.id}"
          items={MANTENIMIENTOS}
          itemKey={(m) => m.ot}
          title={(m) => m.tarea}
          code={(m) => m.ot}
          note={(m) => m.nota}
          meta={(m) => [m.fecha, m.tecnico, m.costo]}
          value={(m) => (m.horometro === null ? '' : `${m.horometro} h`)}
          noun="mantenimiento"
          nounPlural="mantenimientos"
          gender="m"
        >
          <svelte:fragment slot="tag" let:item>
            <Pill tone={item.tono} size="sm">{item.palabra}</Pill>
          </svelte:fragment>
        </DataList>
      {:else}
        <Stack gap={4}>
          <Table
            columns={COLS_ALQUILERES}
            rows={ALQUILERES}
            rowKey={(r) => r.boleta}
            bind:sort={ordenAlquileres}
            caption="Salidas y devoluciones de {EQUIPO.id} en los últimos doce meses"
            noun="salida"
            nounPlural="salidas"
            gender="f"
          >
            <svelte:fragment slot="cell" let:row let:col let:value>
              {#if col.key === 'devolucion' && row.devolucion === null}
                <!-- Estado, no ausencia: una salida sin devolución no es una
                     máquina perdida, es una boleta que nadie subió. El Pill lo
                     dice con tono, marca y palabra, que es lo que hace que se
                     entienda también en blanco y negro. -->
                <Pill tone="attention" size="sm">Sin boleta</Pill>
              {:else}
                {value ?? '—'}
              {/if}
            </svelte:fragment>
          </Table>

          <Well pad={4}>
            <p class="parrafo">
              Del 7 de agosto de 2025 al {HOY}: seis salidas y 96 días alquilada. La salida
              SAL-2025-0702 no suma días porque le falta la devolución, y el sistema no la
              inventa. Solo las dos últimas sumaron horas al horómetro: la boleta vieja no traía
              casilla de horómetro y el formato se cambió el 12 de mayo — por eso hasta entonces
              el reloj lo escribía SCHEDULE.
            </p>
          </Well>
        </Stack>
      {/if}
    </Tabs>
  </Panel>
</div>

{#if posponiendo}
  <!-- Montado, no escondido: el Dialog devuelve el foco a quien lo abrió cuando
       se destruye, y uno que se queda montado se guarda lo que el usuario
       escribió la vez pasada y se lo muestra a la siguiente.

       OJO con el nombre del slot: acá el pie es «foot», y en Panel es «footer».
       Un nombre de slot equivocado no es error de compilación — el pie
       simplemente no se dibuja. -->
  <Dialog
    title="Posponer el cambio de aceite"
    note="{EQUIPO.id} · {EQUIPO.nombre}"
    on:close={cerrarPosponer}
  >
    <Stack gap={4}>
      <Alert tone="attention" title="Posponer mueve un solo reloj" live={false}>
        La fecha nueva corre contra el calendario. El de uso queda donde está: {EQUIPO.id} ya
        lleva 295 h de las 250 del plan, así que el plan sigue vencido por uso aunque la fecha
        se mueva.
      </Alert>

      <DateInput
        label="Nueva fecha de vencimiento"
        bind:value={nuevaFecha}
        min={today()}
        relative
        required
        hint="Hasta cuándo se aguanta el reloj de calendario."
        error={fechaSinMover ? 'La fecha nueva es hoy o antes.' : ''}
        fix={fechaSinMover ? 'Elegí un día posterior a hoy, o cerrá el plan con «Marcar hecho» si ya se hizo.' : ''}
      />

      <Textarea
        label="Por qué se pospone"
        bind:value={razon}
        rows={3}
        limit={280}
        required
        hint="Queda en el historial del equipo, con tu nombre. «Se pospuso» no es una razón."
        error={sinRazon ? 'Falta la razón.' : ''}
        fix={sinRazon
          ? 'Escribí qué impidió hacer el mantenimiento. Sin eso, dentro de seis meses nadie sabe si la máquina se atendió tarde o nunca se atendió.'
          : ''}
      />
    </Stack>

    <svelte:fragment slot="foot">
      <Button variant="ghost" on:click={cerrarPosponer}>Cancelar</Button>
      <Button variant="solid" on:click={guardarPosponer}>Posponer el plan</Button>
    </svelte:fragment>
  </Dialog>
{/if}

<Toast {toasts} on:dismiss={(e) => quitar(e.detail.id)} on:action={(e) => quitar(e.detail.id)} />

<style>
  /* Todo lo que hay acá es distribución. Ni un color, ni un radio, ni una
     sombra: eso lo pone la librería, y por eso cambiar de marca o de tema no
     toca este archivo. Los espacios salen de la escala, no de números sueltos. */
  .pantalla {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-6);
    padding: var(--sx-s-6);
    max-width: 1180px;
    margin: 0 auto;
  }

  /* La tira de cifras y la frase que explica cómo se leen son una sola idea, así
     que van más juntas entre sí que con lo de arriba y lo de abajo. */
  .relojes {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
  }

  /* Planes a la izquierda, identidad a la derecha, y una sola columna abajo de
     900px. En un módulo de verdad esto sería una container query —el Shell le
     come 240px a la ventana— pero acá la pantalla ES la ventana. */
  .cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sx-s-6);
    align-items: start;
  }
  @media (min-width: 900px) {
    .cuerpo { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); }
  }

  .datos {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
  }
  .datos > div {
    display: grid;
    grid-template-columns: minmax(11ch, auto) minmax(0, 1fr);
    gap: var(--sx-s-1) var(--sx-s-4);
    align-items: baseline;
  }
  .datos dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  /* A 380px la etiqueta y el valor no caben lado a lado sin partir el valor en
     tres líneas de cuatro caracteres, así que se apilan. */
  @media (max-width: 460px) {
    .datos > div { grid-template-columns: minmax(0, 1fr); }
  }

  /* El Well ya pone su registro y su color; lo único que falta es que dos
     párrafos seguidos respiren y que la línea no se pase de largo. */
  .parrafo {
    margin: 0;
    max-width: 74ch;
  }
  .parrafo + .parrafo {
    margin-top: var(--sx-s-3);
  }
</style>
