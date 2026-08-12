<script>
  // TABLAS — la página de la familia DATA.
  //
  // Se lee como se usa: cada componente aparece primero funcionando, después
  // dice para qué existe, y sólo entonces muestra su markup. Los estados no
  // están al final como apéndice — están en el mismo interruptor que los datos,
  // porque un catálogo que sólo enseña el camino feliz es exactamente lo que
  // hace que un sistema de diseño se pudra.
  import Pill from '../../lib/Pill.svelte';
  import { Table, DataList, DataState, DataSkeleton } from '../../lib/data/index.js';

  // ── Formato ──────────────────────────────────────────────────────────────
  // Escrito acá y no en la librería a propósito: la moneda, la fecha y la
  // duración son del PRODUCTO. Una tabla que sabe formatear colones es una
  // tabla que no sirve para un inventario en dólares.
  const fmtMoney = (n) =>
    n == null ? null : '₡' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const fmtDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso + 'T12:00:00');
    return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`;
  };
  const fmtDur = (min) => {
    if (min == null) return null;
    if (min === 0) return 'sin paro';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h} h ${m ? `${m} m` : ''}`.trim() : `${m} m`;
  };

  // ── Datos de demostración ────────────────────────────────────────────────
  // Batidoras y camiones de verdad, con los códigos que los técnicos ya usan.
  const ESTADO = {
    done: { word: 'Completada', tone: 'positive' },
    open: { word: 'Sin cerrar', tone: 'attention' },
    void: { word: 'Cancelada', tone: 'neutral' }
  };

  const servicios = [
    { id: 'OT-0042', asset: 'BAT007', tipo: 'Preventiva', fecha: '2026-03-12', paro: 95, total: 148500, estado: 'done', rep: 96000, mo: 35400 },
    { id: 'OT-0041', asset: 'CL445926', tipo: 'Correctiva', fecha: '2026-03-10', paro: 320, total: 486300, estado: 'done', rep: 318000, mo: 112000 },
    { id: 'OT-0040', asset: 'BAT014', tipo: 'Preventiva', fecha: '2026-03-09', paro: 60, total: 92000, estado: 'open', rep: 54000, mo: 27400 },
    { id: 'OT-0039', asset: 'BAT002', tipo: 'Correctiva', fecha: '2026-03-05', paro: 0, total: 0, estado: 'void', rep: 0, mo: 0 },
    { id: 'OT-0038', asset: 'CL336793', tipo: 'Preventiva', fecha: '2026-02-27', paro: 145, total: 1248000, estado: 'done', rep: 890000, mo: 214000 },
    { id: 'OT-0037', asset: 'BAT019', tipo: 'Correctiva', fecha: '2026-02-24', paro: 480, total: 763450, estado: 'open', rep: 512000, mo: 163600 },
    { id: 'OT-0036', asset: 'BAT007', tipo: 'Preventiva', fecha: '2026-02-18', paro: 75, total: 118900, estado: 'done', rep: 71000, mo: 34200 },
    // Sin fecha y sin paro a propósito: es la fila que demuestra que los blancos
    // se van al final ordene como ordene la flecha.
    { id: 'OT-0035', asset: 'BAT022', tipo: 'Correctiva', fecha: null, paro: null, total: 54200, estado: 'open', rep: 48000, mo: 0 },
    { id: 'OT-0034', asset: 'CL445926', tipo: 'Preventiva', fecha: '2026-02-05', paro: 110, total: 315700, estado: 'done', rep: 201000, mo: 78400 },
    { id: 'OT-0033', asset: 'BAT011', tipo: 'Preventiva', fecha: '2026-01-29', paro: 45, total: 67800, estado: 'void', rep: 40000, mo: 20000 }
  ];

  const columns = [
    { key: 'id', label: 'Folio', id: true, sortable: true, min: '11ch', primary: true },
    { key: 'asset', label: 'Equipo', id: true, sortable: true, min: '12ch' },
    { key: 'tipo', label: 'Tipo', sortable: true, min: '12ch', optional: true, showAt: 820 },
    {
      key: 'fecha', label: 'Fecha', sortable: true, order: 'date', min: '13ch',
      value: (r) => fmtDate(r.fecha) ?? 'sin fecha',
      sortValue: (r) => r.fecha
    },
    {
      key: 'paro', label: 'Paro', numeric: true, sortable: true, min: '9ch',
      optional: true, showAt: 900,
      value: (r) => fmtDur(r.paro) ?? '—',
      sortValue: (r) => r.paro
    },
    {
      key: 'total', label: 'Total', numeric: true, sortable: true, min: '11ch',
      value: (r) => fmtMoney(r.total),
      sortValue: (r) => r.total
    },
    { key: 'estado', label: 'Estado', min: '13ch', value: (r) => ESTADO[r.estado].word }
  ];

  // ── El interruptor de estados ────────────────────────────────────────────
  // La misma tabla, seis realidades. Es lo único de esta página que hay que
  // tocar para entender la familia entera.
  const ESTADOS = [
    { k: 'datos', label: 'Con datos' },
    { k: 'buscando', label: 'Filtrada' },
    { k: 'nada', label: 'Filtrada a nada' },
    { k: 'vacio', label: 'Vacía' },
    { k: 'cargando', label: 'Cargando' },
    { k: 'error', label: 'Error' }
  ];
  let estado = 'datos';

  // `$:` y no `const`: un statement reactivo legacy sólo rastrea los nombres
  // escritos adentro, así que un helper que cierra sobre `estado` sería
  // invisible para quien lo llame. Es la trampa que ya costó tres bugs acá.
  $: filaSet =
    estado === 'datos' ? servicios
    : estado === 'buscando' ? servicios.filter((s) => s.asset === 'BAT007')
    : [];
  $: cargando = estado === 'cargando';
  $: fallo = estado === 'error'
    ? 'No se pudo leer el libro de servicios: el servidor no respondió a tiempo.'
    : '';
  $: consulta = estado === 'buscando' ? 'BAT007' : estado === 'nada' ? 'excavadora' : '';
  $: universo = estado === 'vacio' ? 0 : servicios.length;

  let sort = null;
  let selected = [];
  let expanded = [];
  let selectable = true;
  let expandable = true;
  let dense = false;
  let conLink = true;

  // El ancho del CONTENEDOR, no el de la ventana: es exactamente lo que la
  // tabla mide para decidir si todavía hay una comparación que hacer.
  let ancho = 1040;

  let abierto = null;      // la fila que se «abrió» desde el link
  let hecho = '';          // la última acción de fila
  const iva = (t) => Math.round(t * 0.13 / 1.13);
  const neto = (t) => t - iva(t);

  function abrir(e) {
    // El link es un link de verdad: se puede abrir en otra pestaña, copiar la
    // dirección, y el teclado lo alcanza solo. Acá lo interceptamos porque el
    // catálogo no navega a ningún lado.
    e.detail.event.preventDefault();
    abierto = e.detail.row.id;
  }

  // ── DataList: la bitácora de una máquina ─────────────────────────────────
  // Registros que NO son pares: una nota de tres líneas y un monto de ocho
  // caracteres no son columnas comparables, son un objeto con nombre.
  const bitacora = [
    {
      id: 'b1', titulo: 'Cambio de aceite y filtro', code: 'M-014',
      nota: 'Se cambió aceite 15W40 y el filtro primario. El secundario se dejó, tiene 40 h de vida útil todavía.',
      quien: 'José Leobardo González', fecha: '2026-03-12', horas: 1.6, monto: 148500, estado: 'done'
    },
    {
      id: 'b2', titulo: 'Golpeteo en el reductor', code: 'FCM-03',
      nota: 'El operador reporta un golpeteo al arrancar en carga. Se revisó el juego axial y está fuera de rango; falta el repuesto, que está pedido a Bodega Opra.',
      quien: 'José Leobardo González', fecha: '2026-03-09', horas: 0.8, monto: null, estado: 'open'
    },
    {
      id: 'b3', titulo: 'Lectura de horómetro', code: 'I-002',
      nota: 'Lectura tomada en obra: 4.128 h. La anterior fue hace 34 días, así que el consumo observado quedó en 6,1 h/día.',
      quien: 'Laura Acuña Vargas', fecha: '2026-03-01', horas: 0.1, monto: null, estado: 'done'
    },
    {
      id: 'b4', titulo: 'Revisión eléctrica de tablero', code: 'E-008',
      nota: 'Bornes reapretados y contactor principal medido. Sin novedad.',
      quien: 'José Leobardo González', fecha: '2026-02-18', horas: 0.5, monto: 34200, estado: 'done'
    }
  ];
  let bitacoraEstado = 'datos';
  $: bitacoraFilas = bitacoraEstado === 'datos' ? bitacora : [];
  let abiertosBitacora = [];

  // ── Bloques de código ────────────────────────────────────────────────────
  let copiado = '';
  async function copiar(src) {
    try {
      await navigator.clipboard.writeText(src);
      copiado = src;
      setTimeout(() => { if (copiado === src) copiado = ''; }, 2000);
    } catch {
      copiado = '';
    }
  }

  const CODE_TABLE = `<script>
  import { Table } from '@strix/frontend-lib/data';

  const columns = [
    { key: 'id',    label: 'Folio',  id: true, sortable: true, primary: true, min: '11ch' },
    { key: 'asset', label: 'Equipo', id: true, sortable: true, min: '12ch' },
    { key: 'tipo',  label: 'Tipo',   sortable: true, optional: true, showAt: 820 },
    { key: 'fecha', label: 'Fecha',  sortable: true, order: 'date',
      value: (r) => fmtDate(r.fecha) ?? 'sin fecha', sortValue: (r) => r.fecha },
    { key: 'total', label: 'Total',  numeric: true, sortable: true,
      value: (r) => fmtMoney(r.total), sortValue: (r) => r.total },
    { key: 'estado', label: 'Estado', value: (r) => ESTADO[r.estado].word }
  ];

  let sort = { key: 'fecha', dir: 'desc' };
  let selected = [];
<\/script>

<Table
  caption="Servicios"
  {columns}
  rows={visibles}
  total={todos.length}
  query={q}
  href={(r) => \`/servicios/\${r.id}\`}
  bind:sort
  bind:selected
  selectable
  expandable
  rowDisabled={(r) => r.estado === 'void' && 'Una orden cancelada no se puede cerrar en lote'}
  loading={cargando}
  error={fallo}
  noun="servicio" nounPlural="servicios"
  emptyTitle="Todavía no hay servicios registrados."
  emptyBody="Cuando un plan quede por vencer, generás el servicio desde su ficha."
  on:retry={cargar}
  on:clear={limpiar}
>
  <svelte:fragment slot="cell" let:row let:col let:value>
    {#if col.key === 'estado'}
      <Pill tone={ESTADO[row.estado].tone} size="sm">{value}</Pill>
    {:else}
      {value}
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="actions" let:row let:disabled>
    <button on:click={() => imprimir(row)} {disabled}>Imprimir</button>
  </svelte:fragment>

  <svelte:fragment slot="expand" let:row>
    <dl>…el desglose de costos…</dl>
  </svelte:fragment>
</Table>`;

  const CODE_STATES = `<!-- Los cuatro estados no se eligen: se derivan.
     Pasá \`total\` y la tabla sabe distinguir «no hay nada»
     de «tu filtro no encontró nada», que es otra noticia. -->

<Table {columns} rows={visibles}
       total={todos.length}      <!-- cuántos hay con los filtros apagados -->
       query={q}                 <!-- se cita de vuelta: «Ningún servicio coincide con «BAT099».» -->
       loading={cargando}        <!-- esqueleto con la forma de la respuesta -->
       error={fallo}             <!-- el problema... -->
       errorFix="Revisá la conexión y volvé a intentar."  <!-- ...y la salida -->
       on:retry={cargar} on:clear={limpiar} />

<!-- Y si el vacío merece una invitación propia: -->
<Table {columns} rows={[]} total={0}
       emptyTitle="Todavía no hay equipos."
       emptyBody="Registrá la primera máquina y su plan se arma solo.">
  <button slot="empty-action" on:click={nuevo}>Registrar equipo</button>
</Table>`;

  const CODE_LIST = `<DataList
  label="Bitácora de BAT007"
  items={entradas}
  itemKey={(e) => e.id}
  href={(e) => \`/bitacora/\${e.id}\`}
  title={(e) => e.titulo}
  code={(e) => e.code}
  note={(e) => e.nota}
  meta={(e) => [e.quien, fmtDate(e.fecha), \`\${e.horas} h\`]}
  value={(e) => fmtMoney(e.monto)}
  expandable
  total={todas.length}
  noun="entrada" nounPlural="entradas"
>
  <svelte:fragment slot="tag" let:item>
    <Pill tone={ESTADO[item.estado].tone} size="sm">{ESTADO[item.estado].word}</Pill>
  </svelte:fragment>
  <svelte:fragment slot="detail" let:item>…</svelte:fragment>
</DataList>`;

  const CODE_STATE = `<!-- Suelto, para cualquier superficie que no sea una lista todavía -->
<DataState kind="empty"
  title="Todavía no hay planes."
  body="Definí una familia, dale una plantilla, y cada máquina de esa familia hereda su plan.">
  <button>Configurar familias</button>
</DataState>

<DataState kind="filtered" noun="servicio" query="excavadora" total={340} on:clear={limpiar} />

<DataState kind="error"
  title="No se pudo leer el libro de servicios."
  body="Revisá la conexión. Si sigue igual, avisá a soporte con la hora exacta."
  on:retry={cargar} />`;
</script>

<div class="page">
  <!-- ── Portada ─────────────────────────────────────────────────────── -->
  <header class="lede">
    <p class="sx-cap">Familia</p>
    <h1>Tablas</h1>
    <p class="big">
      Una tabla no muestra registros: los <b>compara</b>. Todo lo que hay en esta familia sale de esa
      frase, y lo que no la servía se quedó afuera.
    </p>
    <p class="sub">
      Cuatro piezas: <code>Table</code> para comparar, <code>DataList</code> para cuando los registros
      no son pares, y <code>DataState</code> con <code>DataSkeleton</code> para las cuatro situaciones
      en que la lista no tiene filas — que son las que deciden si alguien confía en la pantalla.
    </p>
  </header>

  <!-- ── Las tres reglas, aplicadas acá ──────────────────────────────── -->
  <section class="rules" aria-label="Las tres reglas en esta familia">
    <article>
      <p class="sx-cap">Regla 1 · el cromo es acromático</p>
      <p>
        La tabla no tiene color propio: fondo, líneas y profundidad son neutros y elevación. El único
        color que aparece está <em>dentro</em> de una celda de estado, y lo pone el producto con un
        <code>Pill</code>. La selección usa <code>--sx-accent</code>, que es un hueco, no un tono.
      </p>
    </article>
    <article>
      <p class="sx-cap">Regla 2 · el color nunca viaja solo</p>
      <p>
        El orden se marca con una flecha que <em>gira</em>, no con un tinte; el estado de una fila es
        tono + marca + palabra. Alguien que no separa el verde del ámbar no pierde nada, y una tabla
        fotocopiada sigue diciendo lo mismo.
      </p>
    </article>
    <article>
      <p class="sx-cap">Regla 3 · las cifras se comparan con cifras</p>
      <p>
        Columna numérica: a la derecha, tabular, con cero cortado. La nota en prosa del
        <code>DataList</code>, en cambio, es deliberadamente <em>no</em> tabular — una frase corrida en
        cifras tabulares se lee como un tartamudeo.
      </p>
    </article>
  </section>

  <!-- ── Table ───────────────────────────────────────────────────────── -->
  <section class="comp">
    <div class="ctop">
      <h2 id="table">Table</h2>
      <p class="what">
        Columnas, cabecera fija, su propio scroll, orden con <code>aria-sort</code> de verdad,
        selección, una fila que es un link, una fila que se abre, y fichas cuando el contenedor deja
        de dar para comparar.
      </p>
    </div>

    <!-- El interruptor. Seis realidades, una tabla. -->
    <div class="lab">
      <div class="labhead">
        <p class="sx-cap">Estado</p>
        <div class="chips" role="group" aria-label="Estado de la tabla">
          {#each ESTADOS as e (e.k)}
            <button
              type="button"
              class="chip"
              class:on={estado === e.k}
              aria-pressed={estado === e.k}
              on:click={() => (estado = e.k)}
            >{e.label}</button>
          {/each}
        </div>
      </div>

      <div class="labhead">
        <p class="sx-cap">Opciones</p>
        <div class="chips" role="group" aria-label="Opciones de la tabla">
          <button type="button" class="chip" class:on={selectable} aria-pressed={selectable}
            on:click={() => (selectable = !selectable)}>Selección</button>
          <button type="button" class="chip" class:on={expandable} aria-pressed={expandable}
            on:click={() => (expandable = !expandable)}>Fila que se abre</button>
          <button type="button" class="chip" class:on={conLink} aria-pressed={conLink}
            on:click={() => (conLink = !conLink)}>Fila-link</button>
          <button type="button" class="chip" class:on={dense} aria-pressed={dense}
            on:click={() => (dense = !dense)}>Densa</button>
        </div>
      </div>

      <div class="labhead">
        <label class="wlab" for="ancho">
          <span class="sx-cap">Ancho del contenedor</span>
          <span class="wval sx-num">{ancho} px</span>
        </label>
        <input id="ancho" type="range" min="360" max="1040" step="10" bind:value={ancho} />
        <p class="hint">
          {#if ancho < 620}
            Debajo de 620 no queda comparación que hacer: cada fila es una ficha, con su propio
            control de orden.
          {:else if ancho < 900}
            <b>Paro</b> ya se fue{ancho < 820 ? ' y ' : '; a 820 se va también '}<b>Tipo</b>: son
            columnas opcionales y están en la ficha del servicio de todos modos.
          {:else}
            Angostalo. Las columnas opcionales caen a 900 y a 820, y a 620 la tabla deja de fingir.
          {/if}
        </p>
      </div>

      {#if abierto || hecho}
        <p class="say" role="status">
          {#if abierto}Se abriría <b class="sx-id">{abierto}</b>.{/if}
          {#if hecho}{hecho}{/if}
          <button type="button" class="linky" on:click={() => { abierto = null; hecho = ''; }}>Entendido</button>
        </p>
      {/if}

      <div class="stage" style="max-width:{ancho}px">
        <Table
          caption="Servicios de mantenimiento"
          {columns}
          rows={filaSet}
          total={universo}
          query={consulta}
          loading={cargando}
          error={fallo}
          errorFix="Puede ser la conexión del taller. Volvé a intentar; si sigue igual, avisá a soporte con la hora exacta."
          href={conLink ? (r) => `/servicios/${r.id}` : null}
          {selectable}
          {expandable}
          {dense}
          bind:sort
          bind:selected
          bind:expanded
          rowDisabled={(r) => r.estado === 'void' && 'Una orden cancelada no entra en un cierre en lote'}
          noun="servicio"
          nounPlural="servicios"
          gender="m"
          emptyTitle="Todavía no hay servicios registrados."
          emptyBody="Cuando un plan quede por vencer, generás el servicio desde su ficha y queda en este libro con su costo y su paro."
          maxHeight="440px"
          on:open={abrir}
          on:retry={() => (estado = 'cargando')}
          on:clear={() => (estado = 'datos')}
        >
          <svelte:fragment slot="cell" let:row let:col let:value>
            {#if col.key === 'estado'}
              <Pill tone={ESTADO[row.estado].tone} size="sm">{value}</Pill>
            {:else}
              {value}
            {/if}
          </svelte:fragment>

          <svelte:fragment slot="actions" let:row let:disabled>
            <button
              type="button"
              class="ract"
              {disabled}
              on:click={() => (hecho = `Se imprimiría ${row.id}.`)}
            >Imprimir</button>
          </svelte:fragment>

          <svelte:fragment slot="expand" let:row>
            <dl class="desglose">
              <div><dt class="sx-cap">Repuestos (REP)</dt><dd class="sx-num">{fmtMoney(row.rep)}</dd></div>
              <div><dt class="sx-cap">Mano de obra (MO)</dt><dd class="sx-num">{fmtMoney(row.mo)}</dd></div>
              <div><dt class="sx-cap">Subtotal</dt><dd class="sx-num">{fmtMoney(neto(row.total))}</dd></div>
              <div><dt class="sx-cap">IVA 13 %</dt><dd class="sx-num">{fmtMoney(iva(row.total))}</dd></div>
              <div class="tot"><dt class="sx-cap">Total</dt><dd class="sx-num">{fmtMoney(row.total)}</dd></div>
            </dl>
            <p class="dnote">
              Paro registrado: {fmtDur(row.paro) ?? 'sin dato'}. El desglose vive acá y no en una
              columna porque son cinco cifras que se leen juntas una vez, no una que se compara
              con las diez de abajo.
            </p>
          </svelte:fragment>
        </Table>
      </div>

      {#if selected.length}
        <p class="say" role="status">
          <b class="sx-num">{selected.length}</b>
          {selected.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}.
          La casilla de la cabecera promete sólo las filas que están acá, después de los filtros —
          nunca las otras trescientas.
          <button type="button" class="linky" on:click={() => (selected = [])}>Quitar la selección</button>
        </p>
      {/if}
    </div>

    <!-- Lo que hay que mirar -->
    <div class="notes">
      <h3>Lo que hay que mirar mientras lo tocás</h3>
      <ol>
        <li>
          <b>Ordená por Fecha y después invertí.</b> <span class="sx-id">OT-0035</span> no tiene fecha
          y se queda al final en las dos direcciones. «Sin fecha» no es la fecha más antigua, y una
          máquina sin lectura no es la que menos ha corrido: ponerlas arriba es cómo alguien termina
          trabajando las tres filas equivocadas.
        </li>
        <li>
          <b>La cabecera se queda.</b> Hay diez filas y un alto máximo de 440px justamente para que se
          vea: quien va por la fila cuarenta ya se le olvidó qué era la columna cuatro.
        </li>
        <li>
          <b>El botón «Imprimir» no abre la fila.</b> El link está estirado sobre todo el
          <code>&lt;tr&gt;</code> con un <code>::after</code>; la casilla, el triángulo y las acciones
          están levantados por encima. No hay <code>on:click</code> en la fila, así que no hay
          propagación que detener ni bug futuro que arreglar.
        </li>
        <li>
          <b>Marcá una fila sola.</b> La casilla de la cabecera pasa a rayita, no a tilde:
          <code>indeterminate</code> es una propiedad del DOM sin atributo HTML, y se pone con una
          action. Una tilde con tres de diez marcadas es una mentira que la siguiente acción en lote
          cobra cara.
        </li>
        <li>
          <b><span class="sx-id">OT-0039</span> y <span class="sx-id">OT-0033</span> están canceladas.</b>
          Su casilla está deshabilitada y dice por qué al pasar el mouse. La fila igual se abre: no
          poder cerrarla en lote no es no poder mirarla.
        </li>
        <li>
          <b>Andá con Tab.</b> El orden es cabecera → casilla → triángulo → link de la fila →
          acciones. Si el contenido se sale de lado, el marco del scroll se vuelve una región con
          nombre y también recibe foco; si todo cabe, desaparece del recorrido.
        </li>
      </ol>
    </div>

    <div class="code">
      <div class="chead">
        <p class="sx-cap">Markup</p>
        <button type="button" class="copy" on:click={() => copiar(CODE_TABLE)}>
          {copiado === CODE_TABLE ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre><code>{CODE_TABLE}</code></pre>
    </div>

    <div class="use">
      <article class="yes">
        <p class="sx-cap"><span class="mk" aria-hidden="true">✓</span> Cuándo sí</p>
        <ul>
          <li>Tres columnas o más, y al menos una es una cifra que se compara con la de arriba.</li>
          <li>El libro de servicios, el catálogo de repuestos con existencia y precio, las lecturas de
            un contador, las líneas de una factura.</li>
          <li>Cuando hace falta ordenar por una columna para contestar «¿cuál es el peor?».</li>
          <li>Cuando hay acciones en lote: cerrar seis órdenes, exportar las marcadas.</li>
        </ul>
      </article>
      <article class="no">
        <p class="sx-cap"><span class="mk" aria-hidden="true">✕</span> Cuándo no</p>
        <ul>
          <li><b>Dos columnas.</b> Eso es una lista de definiciones, y la tabla alrededor es andamio.</li>
          <li><b>Campos de peso distinto</b> — un título, una nota larga, un monto. Las columnas los
            obligan a ser pares y no lo son: <code>DataList</code>.</li>
          <li><b>Se edita celda por celda y se navega con las flechas.</b> Eso es un
            <code>role="grid"</code> con tabindex móvil: otro componente, más pesado. Éste es un
            documento a propósito.</li>
          <li><b>Miles de filas en una tablet barata.</b> Pinta lo que le den; paginá o ventaneá antes.</li>
          <li><b>Una sola fila.</b> Eso es una ficha.</li>
        </ul>
      </article>
    </div>
  </section>

  <!-- ── Los cuatro estados ──────────────────────────────────────────── -->
  <section class="comp">
    <div class="ctop">
      <h2 id="estados">Los cuatro estados</h2>
      <p class="what">
        Una tabla sin filas no es un estado: son tres, y juntarlos en una frase es el defecto más
        común del software operativo. El cuarto — cargando — es el que decide si la pantalla se
        siente rota mientras espera.
      </p>
    </div>

    <div class="quad">
      <article>
        <h3>Cargando</h3>
        <p>
          Un esqueleto con la <em>forma</em> de la respuesta, para que cuando lleguen los datos no se
          mueva nada. Se anuncia una sola vez, como frase; cuarenta barritas anunciándose cada una es
          una denegación de servicio contra un lector de pantalla. Con
          <code>prefers-reduced-motion</code> el brillo se detiene y la forma se queda, que es la
          mitad útil.
        </p>
        <div class="mini">
          <div class="skrow"><DataSkeleton w="9ch" /><DataSkeleton w="60%" /><DataSkeleton w="7ch" /></div>
          <div class="skrow"><DataSkeleton w="9ch" /><DataSkeleton w="45%" /><DataSkeleton w="7ch" /></div>
          <div class="skrow"><DataSkeleton w="9ch" /><DataSkeleton w="70%" /><DataSkeleton w="7ch" /></div>
        </div>
      </article>

      <article>
        <h3>Vacía</h3>
        <p>
          Nunca se creó nada. La respuesta correcta es una invitación a la acción <em>específica</em>
          que crea el primero — no «no hay datos», que no es una invitación a nada.
        </p>
        <div class="mini">
          <DataState kind="empty" compact
            title="Todavía no hay planes."
            body="El programa se arma solo: definí una familia de equipo y dale una plantilla.">
            <button type="button" class="ract">Configurar familias</button>
          </DataState>
        </div>
      </article>

      <article>
        <h3>Filtrada a nada</h3>
        <p>
          Sí existen; <em>esta vista</em> no encontró ninguno. Otra noticia y otra frase: se cita el
          filtro, se dice cuántos hay en total, y el control dice exactamente qué va a quitar. Decir
          «no hay servicios» acá manda a alguien a buscar un bug en los datos.
        </p>
        <div class="mini">
          <DataState kind="filtered" compact noun="servicio" nounPlural="servicios"
            query="excavadora" total={340} />
        </div>
      </article>

      <article>
        <h3>Error</h3>
        <p>
          No sabemos si hay algo, porque la lectura falló. Es el peligroso: un error dibujado como
          lista vacía convierte una pantalla rota en lo más tranquilo del monitor justo cuando alguien
          tiene que mirar. Nombra el problema <em>y</em> la salida, y trae el control que reintenta.
        </p>
        <div class="mini">
          <DataState kind="error" compact
            title="No se pudo leer el libro de servicios."
            body="El servidor no respondió a tiempo. Volvé a intentar; si sigue igual, avisá a soporte con la hora exacta." />
        </div>
      </article>
    </div>

    <p class="pull">
      El componente no te deja elegir mal por descuido: pasale <code>total</code> y él solo distingue
      «no hay nada» de «tu filtro no encontró nada».
    </p>

    <div class="code">
      <div class="chead">
        <p class="sx-cap">Markup</p>
        <button type="button" class="copy" on:click={() => copiar(CODE_STATES)}>
          {copiado === CODE_STATES ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre><code>{CODE_STATES}</code></pre>
    </div>
  </section>

  <!-- ── DataList ────────────────────────────────────────────────────── -->
  <section class="comp">
    <div class="ctop">
      <h2 id="datalist">DataList</h2>
      <p class="what">
        Cuando los registros no son pares. Una bitácora tiene un título, una nota de tres líneas, tres
        datos de contexto y a veces un monto: en columnas, la nota queda ilegible y el monto invisible.
      </p>
    </div>

    <div class="lab">
      <div class="labhead">
        <p class="sx-cap">Estado</p>
        <div class="chips" role="group" aria-label="Estado de la lista">
          {#each [{ k: 'datos', label: 'Con datos' }, { k: 'vacio', label: 'Vacía' }, { k: 'cargando', label: 'Cargando' }, { k: 'error', label: 'Error' }] as e (e.k)}
            <button type="button" class="chip" class:on={bitacoraEstado === e.k}
              aria-pressed={bitacoraEstado === e.k}
              on:click={() => (bitacoraEstado = e.k)}>{e.label}</button>
          {/each}
        </div>
      </div>

      <div class="stage">
        <DataList
          label="Bitácora de BAT007"
          items={bitacoraFilas}
          itemKey={(e) => e.id}
          href={(e) => `/bitacora/${e.id}`}
          title={(e) => e.titulo}
          code={(e) => e.code}
          note={(e) => e.nota}
          meta={(e) => [e.quien, fmtDate(e.fecha), `${e.horas} h`]}
          value={(e) => fmtMoney(e.monto)}
          expandable
          bind:expanded={abiertosBitacora}
          loading={bitacoraEstado === 'cargando'}
          error={bitacoraEstado === 'error'
            ? 'No se pudo leer la bitácora de BAT007.'
            : ''}
          total={bitacoraEstado === 'vacio' ? 0 : bitacora.length}
          noun="entrada"
          nounPlural="entradas"
          gender="f"
          emptyTitle="Esta máquina todavía no tiene bitácora."
          emptyBody="La primera entrada aparece sola cuando se cierre su primer servicio."
          on:open={(e) => { e.detail.event.preventDefault(); hecho = `Se abriría «${e.detail.item.titulo}».`; }}
          on:retry={() => (bitacoraEstado = 'cargando')}
        >
          <svelte:fragment slot="tag" let:item>
            <Pill tone={ESTADO[item.estado].tone} size="sm">{ESTADO[item.estado].word}</Pill>
          </svelte:fragment>
          <svelte:fragment slot="detail" let:item>
            <p class="dnote">
              Actividad <b class="sx-id">{item.code}</b>, ejecutada por {item.quien}. Tiempo cargado:
              <span class="sx-num">{item.horas} h</span>.
              {#if item.monto}Costo: <span class="sx-num">{fmtMoney(item.monto)}</span>, IVA incluido.{/if}
            </p>
          </svelte:fragment>
        </DataList>
      </div>
    </div>

    <div class="code">
      <div class="chead">
        <p class="sx-cap">Markup</p>
        <button type="button" class="copy" on:click={() => copiar(CODE_LIST)}>
          {copiado === CODE_LIST ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre><code>{CODE_LIST}</code></pre>
    </div>

    <div class="use">
      <article class="yes">
        <p class="sx-cap"><span class="mk" aria-hidden="true">✓</span> Cuándo sí</p>
        <ul>
          <li>Una bitácora, una bandeja de pendientes, un historial, una lista de documentos.</li>
          <li>Cuando cada registro tiene una nota en prosa que alguien de verdad va a leer.</li>
          <li>Cuando hay un solo número por registro y no se compara con el de al lado.</li>
        </ul>
      </article>
      <article class="no">
        <p class="sx-cap"><span class="mk" aria-hidden="true">✕</span> Cuándo no</p>
        <ul>
          <li><b>Si el punto es comparar una columna de cifras.</b> La lista pone cada total en un
            borde izquierdo distinto y la comparación desaparece: <code>Table</code>.</li>
          <li><b>Selección y acciones en lote.</b> No hay fila de cabecera donde colgar un
            «seleccionar todo», y ponerle una arriba es una tabla con pasos de más.</li>
          <li><b>Más de seis datos por registro.</b> Eso es una ficha, y una lista de fichas es una
            página que nadie termina de bajar.</li>
        </ul>
      </article>
    </div>
  </section>

  <!-- ── DataState / DataSkeleton sueltos ────────────────────────────── -->
  <section class="comp">
    <div class="ctop">
      <h2 id="sueltos">DataState y DataSkeleton, sueltos</h2>
      <p class="what">
        <code>Table</code> y <code>DataList</code> los usan por dentro, pero se exportan porque un
        panel, un mapa o un gráfico también se quedan sin datos, y «no encontré nada» tiene que leerse
        igual en todo el ecosistema.
      </p>
    </div>

    <div class="code">
      <div class="chead">
        <p class="sx-cap">Markup</p>
        <button type="button" class="copy" on:click={() => copiar(CODE_STATE)}>
          {copiado === CODE_STATE ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre><code>{CODE_STATE}</code></pre>
    </div>

    <p class="pull">
      <code>DataSkeleton</code> tiene una sola regla: nunca reclama un ancho que no puede cumplir. Una
      barra al 40 % donde va <span class="sx-num">₡1.480.000</span> enseña una mentira sobre el
      layout, y cuando llegan los datos todo salta.
    </p>
  </section>

  <!-- ── Los dos temas ───────────────────────────────────────────────── -->
  <section class="comp">
    <div class="ctop">
      <h2 id="temas">Los dos temas</h2>
      <p class="what">
        Oscuro no es una segunda hoja de estilos: es un re-amarre de los mismos roles. Nada de esta
        familia sabe de qué color es nada. Abajo está la misma tabla dentro de un contenedor
        <code>.sx-dark</code> — sin una sola línea distinta.
      </p>
    </div>

    <div class="darkstage sx-dark">
      <Table
        caption="Servicios de mantenimiento, en oscuro"
        columns={columns.filter((c) => !c.optional)}
        rows={servicios.slice(0, 4)}
        total={servicios.length}
        query="BAT"
        noun="servicio"
        nounPlural="servicios"
        gender="m"
        selectable
        selected={['OT-0041']}
        href={(r) => `/servicios/${r.id}`}
        maxHeight=""
        on:open={(e) => e.detail.event.preventDefault()}
      >
        <svelte:fragment slot="cell" let:row let:col let:value>
          {#if col.key === 'estado'}
            <Pill tone={ESTADO[row.estado].tone} size="sm">{value}</Pill>
          {:else}
            {value}
          {/if}
        </svelte:fragment>
      </Table>
    </div>
  </section>

  <!-- ── Lo que no trae ──────────────────────────────────────────────── -->
  <section class="comp last">
    <div class="ctop">
      <h2 id="fuera">Lo que esta familia no trae, y por qué</h2>
    </div>
    <ul class="out">
      <li>
        <b>Paginación y virtualización.</b> Son decisiones del producto: cuántas filas pedirle al
        servidor y qué hacer con el scroll no lo puede saber un componente. <code>Table</code> pinta
        lo que le den y te dice cuántas de cuántas está mostrando.
      </li>
      <li>
        <b>Buscador y filtros.</b> Viven arriba de la tabla y son de otra familia. Lo único que esta
        familia pide es que le pasen <code>query</code> y <code>total</code>, que es lo que le permite
        no mentir cuando el resultado es cero.
      </li>
      <li>
        <b>Edición en celda.</b> Otro componente, con <code>role="grid"</code>, foco por celda y
        navegación con flechas. Meterlo acá haría peor las dos cosas.
      </li>
      <li>
        <b>Columna de acciones pegada a la derecha.</b> Se puede, pero pelea con el link estirado y
        con las sombras del scroll horizontal. Cuando alguien la necesite de verdad, que se diseñe
        entera y no como un parche.
      </li>
      <li>
        <b>Exportar a CSV.</b> Lo que se exporta es lo que está filtrado en pantalla, y eso lo sabe
        la vista, no la tabla.
      </li>
    </ul>
  </section>
</div>

<style>
  /* La página del catálogo vive en el documento, no en un shadow root, así que
     puede apoyarse en base.css y en tokens.css. Los componentes de la librería
     no pueden, y por eso cada uno se declara sus reglas. */
  .page {
    max-width: 76rem;
    margin: 0 auto;
    padding: var(--sx-s-10) var(--sx-s-6) var(--sx-s-20);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-16);
  }

  /* ── Portada ─────────────────────────────────────────────────────── */
  .lede { display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .lede h1 {
    margin: 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.035em;
    line-height: 1.02;
  }
  .lede .sx-cap { margin: 0; }
  .big {
    margin: 0;
    font-size: var(--sx-t-lg);
    line-height: 1.5;
    max-width: 60ch;
    color: var(--sx-ink);
  }
  .big b { font-weight: var(--sx-w-bold); }
  .sub { margin: 0; font-size: var(--sx-t-md); color: var(--sx-ink-2); max-width: 68ch; line-height: 1.6; }

  /* ── Las tres reglas ─────────────────────────────────────────────── */
  .rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: var(--sx-s-4); }
  .rules article {
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-5);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
  }
  .rules p { margin: 0; }
  .rules article > p:last-child { font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.6; }

  /* ── Secciones ───────────────────────────────────────────────────── */
  .comp { display: flex; flex-direction: column; gap: var(--sx-s-6); }
  .ctop { display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .comp h2 {
    margin: 0;
    font-size: var(--sx-t-2xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.03em;
    line-height: 1.1;
  }
  .what { margin: 0; font-size: var(--sx-t-md); color: var(--sx-ink-2); max-width: 68ch; line-height: 1.6; }
  .comp h3 { margin: 0; font-size: var(--sx-t-md); font-weight: var(--sx-w-semi); letter-spacing: -.01em; }

  /* ── El laboratorio ──────────────────────────────────────────────── */
  .lab {
    background: var(--sx-sunk);
    border-radius: var(--sx-r-3);
    padding: var(--sx-s-5);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
  }
  .labhead { display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .labhead .sx-cap { margin: 0; }

  .chips { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); }
  .chip {
    display: inline-flex;
    align-items: center;
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-4);
    border: 1px solid transparent;
    border-radius: var(--sx-r-pill);
    background: var(--sx-surface);
    color: var(--sx-ink-2);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    box-shadow: var(--sx-e-1);
    transition: color var(--sx-fast) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }
  .chip:hover { color: var(--sx-ink); }
  .chip.on { background: var(--sx-accent); color: var(--sx-accent-ink); }

  .wlab { display: flex; align-items: baseline; justify-content: space-between; gap: var(--sx-s-3); }
  .wlab .sx-cap { margin: 0; }
  .wval { font-size: var(--sx-t-sm); font-weight: var(--sx-w-semi); color: var(--sx-ink); }
  input[type='range'] { width: 100%; accent-color: var(--sx-accent); cursor: pointer; }
  .hint { margin: 0; font-size: var(--sx-t-xs); color: var(--sx-ink-3); line-height: 1.5; }
  .hint b { color: var(--sx-ink-2); font-weight: var(--sx-w-semi); }

  .stage { min-width: 0; }

  .say {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sx-s-2);
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-info-band);
    color: var(--sx-info);
    border: 1px solid var(--sx-info-edge);
    border-radius: var(--sx-r-2);
    font-size: var(--sx-t-sm);
    line-height: 1.5;
  }
  .linky {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    font-weight: var(--sx-w-semi);
    color: inherit;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .ract {
    display: inline-flex;
    align-items: center;
    min-height: var(--sx-s-8);
    padding: var(--sx-s-1) var(--sx-s-3);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    background: var(--sx-surface);
    color: var(--sx-ink-2);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    white-space: nowrap;
    transition: color var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease);
  }
  .ract:hover { color: var(--sx-ink); border-color: var(--sx-ink-3); }
  .ract:disabled { opacity: .45; cursor: not-allowed; }

  /* ── El desglose de la fila abierta ──────────────────────────────── */
  .desglose { margin: 0 0 var(--sx-s-3); display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--sx-s-3); }
  .desglose div { display: flex; flex-direction: column; gap: 2px; }
  .desglose dt { margin: 0; }
  .desglose dd { margin: 0; font-size: var(--sx-t-md); font-weight: var(--sx-w-semi); color: var(--sx-ink); letter-spacing: -.01em; }
  .desglose .tot dd { color: var(--sx-ink); font-weight: var(--sx-w-bold); }
  .dnote { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-3); line-height: 1.55; max-width: 70ch; }

  /* ── Notas ───────────────────────────────────────────────────────── */
  .notes {
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-6);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
  }
  .notes ol { margin: 0; padding-left: var(--sx-s-5); display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .notes li { font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.6; max-width: 78ch; }
  .notes li::marker { color: var(--sx-ink-3); font-variant-numeric: tabular-nums; }
  .notes b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }

  /* ── Los cuatro estados ──────────────────────────────────────────── */
    /* Dos y dos a propósito: cuatro estados en tres columnas dejan uno solo
     abajo, y el que queda solo se lee como el importante. */
  .quad { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sx-s-6) var(--sx-s-5); }
  .quad article { display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .quad p { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.6; }
  .mini { margin-top: auto; }
  .skrow {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--sx-s-4);
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    box-shadow: inset 0 -1px 0 var(--sx-line);
  }
  .skrow:first-child { border-radius: var(--sx-r-2) var(--sx-r-2) 0 0; }
  .skrow:last-child { border-radius: 0 0 var(--sx-r-2) var(--sx-r-2); box-shadow: none; }

  .pull {
    margin: 0;
    font-size: var(--sx-t-lg);
    line-height: 1.5;
    max-width: 62ch;
    color: var(--sx-ink);
    padding-left: var(--sx-s-4);
    border-left: var(--sx-s-1) solid var(--sx-accent);
  }

  /* ── Cuándo sí / cuándo no ───────────────────────────────────────── */
  .use { display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: var(--sx-s-4); }
  .use article {
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-5);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
  }
  .use p { margin: 0; display: flex; align-items: center; gap: var(--sx-s-2); }
  /* El tono nunca viaja solo: marca + palabra, y la palabra es la que manda. */
  .mk {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--sx-s-5);
    height: var(--sx-s-5);
    border-radius: var(--sx-r-pill);
    font-size: var(--sx-t-2xs);
  }
  .yes .sx-cap { color: var(--sx-positive); }
  .yes .mk { background: var(--sx-positive-band); color: var(--sx-positive); }
  .no .sx-cap { color: var(--sx-critical); }
  .no .mk { background: var(--sx-critical-band); color: var(--sx-critical); }
  .use ul { margin: 0; padding-left: var(--sx-s-5); display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .use li { font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.55; }
  .use li::marker { color: var(--sx-edge); }
  .use b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }

  /* ── Código ──────────────────────────────────────────────────────── */
  .code {
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
  }
  .chead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sx-s-3);
    padding: var(--sx-s-3) var(--sx-s-4);
    box-shadow: inset 0 -1px 0 var(--sx-line);
  }
  .chead .sx-cap { margin: 0; }
  .copy {
    display: inline-flex;
    align-items: center;
    min-height: var(--sx-s-8);
    padding: var(--sx-s-1) var(--sx-s-4);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    background: var(--sx-surface);
    color: var(--sx-ink-2);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    transition: color var(--sx-fast) var(--sx-ease);
  }
  .copy:hover { color: var(--sx-ink); }
  .code pre {
    margin: 0;
    padding: var(--sx-s-4);
    overflow-x: auto;
    background: var(--sx-sunk);
  }
  .code code {
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-xs);
    line-height: 1.65;
    color: var(--sx-ink-2);
    white-space: pre;
  }

  /* ── Oscuro ──────────────────────────────────────────────────────── */
  .darkstage {
    background: var(--sx-ground);
    color: var(--sx-ink);
    border-radius: var(--sx-r-3);
    padding: var(--sx-s-6);
  }

  /* ── Lo que no trae ──────────────────────────────────────────────── */
  .out { margin: 0; padding-left: var(--sx-s-5); display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .out li { font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.6; max-width: 78ch; }
  .out li::marker { color: var(--sx-edge); }
  .out b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }
  .last { padding-bottom: var(--sx-s-8); }

  /* Inline code en la prosa. */
  code { font-family: var(--sx-font-mono); font-size: .92em; }
  .sub code, .what code, .rules code, .notes code, .use code, .out code, .pull code, .quad code {
    background: var(--sx-sunk);
    padding: 1px var(--sx-s-1);
    border-radius: var(--sx-r-1);
    color: var(--sx-ink);
  }

  /* Foco visible en todo lo que esta página inventa. */
  .chip:focus-visible,
  .copy:focus-visible,
  .ract:focus-visible,
  .linky:focus-visible,
  input[type='range']:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
  }

  @media (pointer: coarse) {
    .chip, .copy, .ract { min-height: var(--sx-touch); }
  }

  @media (max-width: 700px) {
    .page { padding: var(--sx-s-6) var(--sx-s-4) var(--sx-s-16); gap: var(--sx-s-12); }
    .lede h1 { font-size: var(--sx-t-2xl); }
    .comp h2 { font-size: var(--sx-t-xl); }
    .big { font-size: var(--sx-t-md); }
    .pull { font-size: var(--sx-t-md); }
    .lab { padding: var(--sx-s-4); }
    .quad { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .chip, .copy, .ract { transition: none; }
  }
</style>
