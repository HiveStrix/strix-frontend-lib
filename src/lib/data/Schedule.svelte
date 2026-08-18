<script module>
  // Los tonos que un evento puede llevar — los mismos cinco del sistema. Un
  // valor fuera de esta lista cae a `neutral` en vez de pintar un color que no
  // significa nada.
  const TONES = new Set(['neutral', 'positive', 'attention', 'critical', 'info']);
</script>

<script>
  // SCHEDULE — un mes, y lo que cae en él. El calendario que se LEE, no el que
  // se elige.
  //
  // NO ES `Calendar`. `form/Calendar.svelte` resuelve el día que alguien
  // PICKEA — una grilla para elegir una fecha, con su patrón ARIA de grid y su
  // roving tabindex. Esto resuelve la pregunta de al lado: «¿qué hay agendado?»
  // — servicios programados, planes que vencen, órdenes con fecha. Los eventos
  // son el contenido; el día es sólo dónde se paran. Por eso vive en `data`
  // (una forma de LEER un conjunto de registros, como Table o DataList) y no en
  // `form` (donde una persona contesta algo). Reusa de `Calendar` lo que ya
  // estaba resuelto —la matemática del mes, la corrección de zona horaria de
  // `DateInput` (`parseLocalDate`/`today`)— en vez de reescribir el mismo mes
  // una segunda vez y que dos calendarios del sistema empiecen la semana en
  // días distintos.
  //
  //   <Schedule label="Agenda de mantenimiento" bind:view events={[
  //     { date: '2026-08-14', label: 'Servicio BAT014', tone: 'critical', time: '09:00', key: 'ot-42' },
  //     { date: '2026-08-14', label: 'Revisión OT-0040', time: '14:00' },
  //     { date: '2026-08-20', label: 'Vence plan BAT007', tone: 'attention' }
  //   ]} on:select={(e) => abrir(e.detail.event)} />
  //
  // DOS VISTAS, UN CONMUTADOR QUE YA EXISTE. `Segmented` es literalmente «la
  // misma cosa, dibujada de otra forma» (su propia cabecera lo dice), que es
  // exactamente la relación entre mes y agenda: los mismos eventos, una grilla
  // o una lista. Se reusa en vez de inventar un toggle propio.
  //
  //   · MES — la grilla del mes con los eventos de cada día en chips. Aire, no
  //     líneas (la ley de Nácar): las 7×N casillas se alinean por espaciado,
  //     nunca por bordes que compitan con lo que dice cada día.
  //   · AGENDA — la lista cronológica de TODOS los eventos, agrupada por día,
  //     con cabeceras relativas (Hoy · Mañana · la fecha). Sirve en una columna
  //     angosta donde una grilla no entra.
  //
  // EL COLOR DE UN CHIP NO VIAJA SOLO, PERO ACÁ LA PALABRA ES EL EVENTO. La
  // regla 2 pide que un tono llegue con su palabra; en un chip de evento la
  // palabra ES la etiqueta del evento («Servicio BAT014»), así que el tono es
  // agrupación, no el único portador del significado — a diferencia de un Pill
  // de estado, donde el tono ES la noticia y por eso Pill le suma una marca de
  // forma. Un chip lleva su banda de color + su canto + su etiqueta, y eso
  // basta: quien no separe el rojo del ámbar igual lee «Vence» y «Servicio».
  //
  // SIN DESBORDE. La etiqueta de un chip trunca con elipsis dentro de su casilla
  // (la cláusula 2 del CONTRACT), y un día con más eventos de los que entran
  // cierra con «+N más» en vez de estirar la fila. La grilla se mantiene lineal:
  // toda casilla tiene un piso de alto, así una semana no queda despareja
  // porque un día tenga tres eventos y otro ninguno.
  import { createEventDispatcher } from 'svelte';
  import { parseLocalDate, today } from '../form/DateInput.svelte';
  import Segmented from '../nav/Segmented.svelte';
  import IconButton from '../action/IconButton.svelte';
  import Glyph from '../shell/Glyph.svelte';

  /** [{ date:'YYYY-MM-DD', label, tone?, time?, key?, href? }] */
  export let events = [];
  /** 'month' | 'agenda'. Bindable. */
  export let view = 'month';
  /** 'YYYY-MM-DD' — qué mes abre. Sólo se lee al montar (como `defaultValue`);
   *  después Prev/Next y el botón Hoy son dueños de la vista. */
  export let viewDate = '';
  /** Nombra la región para un lector de pantalla. */
  export let label = '';
  /** Lo que dice la agenda cuando no hay ningún evento. */
  export let emptyLabel = 'No hay nada agendado.';
  /** Cuántos chips muestra una casilla de mes antes de cerrar con «+N más». */
  export let maxPerDay = 3;

  const dispatch = createEventDispatcher();

  // ── La matemática del mes, la misma que Calendar ──────────────────────────
  const WD_SHORT = new Intl.DateTimeFormat('es-CR', { weekday: 'short' });
  const WD_LONG = new Intl.DateTimeFormat('es-CR', { weekday: 'long' });
  const MONTH_YEAR = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' });
  const DAY_MED = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
  const DAY_FULL = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  function addMonths(d, n) {
    const day = d.getDate();
    const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    t.setDate(Math.min(day, last));
    return t;
  }
  // Lunes = 0 … domingo = 6: la semana arranca el lunes (es-CR), igual que Calendar.
  const mondayIndex = (d) => (d.getDay() + 6) % 7;
  const REF_MONDAY = new Date(2024, 0, 1);
  const weekdayHeaders = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(REF_MONDAY, i);
    return { short: WD_SHORT.format(d).replace(/\.$/, ''), long: WD_LONG.format(d) };
  });

  const toneOf = (e) => (TONES.has(e?.tone) ? e.tone : 'neutral');

  // Qué mes está en pantalla. `viewIso` es el único origen; Prev/Next/Hoy lo mueven.
  let viewIso = viewDate || today();

  $: todayIso = today();
  $: viewD = parseLocalDate(viewIso) ?? new Date();
  $: vy = viewD.getFullYear();
  $: vm = viewD.getMonth();
  $: monthStart = new Date(vy, vm, 1);
  $: monthYearLabel = cap1(MONTH_YEAR.format(monthStart));
  $: gridStart = addDays(monthStart, -mondayIndex(monthStart));
  $: monthEnd = new Date(vy, vm + 1, 0);
  $: gridEnd = addDays(monthEnd, 6 - mondayIndex(monthEnd));

  // Eventos indexados por fecha, ordenados por hora dentro de cada día (los sin
  // hora, al final).
  $: byDate = (() => {
    const m = new Map();
    for (const e of events) {
      if (!e || !e.date) continue;
      if (!m.has(e.date)) m.set(e.date, []);
      m.get(e.date).push(e);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
    }
    return m;
  })();

  $: weeks = (() => {
    const out = [];
    let cur = gridStart;
    while (cur <= gridEnd) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        const iso = today(cur);
        const evs = byDate.get(iso) || [];
        row.push({
          iso,
          day: cur.getDate(),
          inMonth: cur.getMonth() === vm,
          isToday: iso === todayIso,
          events: evs
        });
        cur = addDays(cur, 1);
      }
      out.push(row);
    }
    return out;
  })();

  // La agenda muestra TODOS los eventos, no sólo los del mes visible: es la
  // vista para «¿qué viene?», y recortarla al mes en pantalla escondería lo de
  // la semana que viene si cae en el mes siguiente. ISO ordena cronológicamente
  // como texto, así que basta con ordenar las claves.
  $: agenda = [...byDate.keys()].sort().map((iso) => ({
    iso,
    head: dayHead(iso),
    events: byDate.get(iso)
  }));

  function dayHead(iso) {
    const d = parseLocalDate(iso);
    if (!d) return iso;
    if (iso === todayIso) return 'Hoy';
    const tmr = today(addDays(parseLocalDate(todayIso) ?? new Date(), 1));
    if (iso === tmr) return 'Mañana';
    return cap1(DAY_MED.format(d));
  }

  function dayAria(d) {
    let s = cap1(DAY_FULL.format(parseLocalDate(d.iso) ?? new Date()));
    if (d.isToday) s += ', hoy';
    const n = d.events.length;
    s += n === 0 ? ', sin eventos' : n === 1 ? ', 1 evento' : `, ${n} eventos`;
    return s;
  }

  const panMonths = (n) => { viewIso = today(addMonths(parseLocalDate(viewIso) ?? new Date(), n)); };
  const goToday = () => { viewIso = today(); };

  // Un evento es un enlace si trae `href`, un botón si trae `key` (y avisa por
  // `on:select`), o texto plano si no es navegable — el mismo criterio que
  // SideRail/Calendar usan para no fabricar interactividad que no existe.
  function pick(ev, e) {
    if (ev.href) return; // que el navegador haga lo suyo
    if (ev.key == null) return;
    e.preventDefault();
    dispatch('select', { event: ev });
  }
  const tagFor = (ev) => (ev.href ? 'a' : ev.key != null ? 'button' : 'span');

  // El click se ata desde JS, no como `on:click` en el `<svelte:element>`: el
  // compilador no sabe a qué etiqueta resuelve y pide un `role` explícito — pero
  // las únicas que puede ser, `<a href>` y `<button>`, ya lo traen (y disparan
  // click desde Enter/Espacio); un `<span>` estático no navega y `pick` sale
  // temprano. Mover el listener en vez de la semántica es lo mismo que hace
  // SideRail, por la misma razón.
  function activate(node, ev) {
    let item = ev;
    const onclick = (e) => pick(item, e);
    node.addEventListener('click', onclick);
    return {
      update: (next) => (item = next),
      destroy: () => node.removeEventListener('click', onclick)
    };
  }
</script>

<section class="sched" aria-label={label || 'Calendario'}>
  <header class="bar">
    <div class="lead">
      {#if view === 'month'}
        <p class="mth sx-num" aria-live="polite">{monthYearLabel}</p>
        <div class="nav">
          <IconButton label="Mes anterior" size="sm" on:click={() => panMonths(-1)}>
            <Glyph name="chevronLeft" size={16} />
          </IconButton>
          <button class="hoy" type="button" on:click={goToday}>Hoy</button>
          <IconButton label="Mes siguiente" size="sm" on:click={() => panMonths(1)}>
            <Glyph name="chevronRight" size={16} />
          </IconButton>
        </div>
      {:else}
        <p class="mth">Próximos eventos</p>
      {/if}
    </div>

    <Segmented
      label="Vista del calendario"
      size="sm"
      bind:value={view}
      items={[{ key: 'month', label: 'Mes' }, { key: 'agenda', label: 'Agenda' }]}
    />
  </header>

  {#if view === 'month'}
    <table class="grid" aria-label={label ? `${label}, ${monthYearLabel}` : monthYearLabel}>
      <thead>
        <tr>
          {#each weekdayHeaders as w (w.long)}
            <th scope="col"><span class="wd sx-cap" aria-hidden="true">{w.short}</span><span class="sr">{w.long}</span></th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each weeks as week, wi (wi)}
          <tr>
            {#each week as d (d.iso)}
              <td class="cell" class:out={!d.inMonth} class:today={d.isToday} aria-label={dayAria(d)}>
                <span class="num sx-num" class:dot={d.isToday} aria-hidden="true">{d.day}</span>
                {#if d.events.length}
                  <ul class="evs">
                    {#each d.events.slice(0, maxPerDay) as ev (ev.key ?? ev.label)}
                      <li>
                        <svelte:element
                          this={tagFor(ev)}
                          class="ev t-{toneOf(ev)}"
                          class:act={ev.href || ev.key != null}
                          href={ev.href || undefined}
                          type={ev.key != null && !ev.href ? 'button' : undefined}
                          title={ev.time ? `${ev.time} · ${ev.label}` : ev.label}
                          use:activate={ev}
                        >{#if ev.time}<b class="t sx-num">{ev.time}</b>{/if}{ev.label}</svelte:element>
                      </li>
                    {/each}
                    {#if d.events.length > maxPerDay}
                      <li class="more">+{d.events.length - maxPerDay} más</li>
                    {/if}
                  </ul>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    {#if agenda.length}
      <div class="agenda">
        {#each agenda as g (g.iso)}
          <section class="grp" aria-label={g.head}>
            <p class="ghead"><span class="gh sx-cap">{g.head}</span></p>
            <ul class="rows">
              {#each g.events as ev (ev.key ?? ev.label)}
                <li>
                  <svelte:element
                    this={tagFor(ev)}
                    class="row t-{toneOf(ev)}"
                    class:act={ev.href || ev.key != null}
                    href={ev.href || undefined}
                    type={ev.key != null && !ev.href ? 'button' : undefined}
                    use:activate={ev}
                  >
                    <span class="when sx-num">{ev.time || '—'}</span>
                    <span class="mk" aria-hidden="true"></span>
                    <span class="lbl">{ev.label}</span>
                  </svelte:element>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {:else}
      <p class="empty">{emptyLabel}</p>
    {/if}
  {/if}
</section>

<style>
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .sched {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
    min-width: 0;
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--sx-s-3) var(--sx-s-4);
    min-width: 0;
  }
  .lead { display: flex; align-items: center; gap: var(--sx-s-3); min-width: 0; }
  .mth { margin: 0; font-size: var(--sx-t-md); font-weight: var(--sx-w-semi); letter-spacing: -.01em; color: var(--sx-ink); }
  .nav { display: flex; align-items: center; gap: var(--sx-s-1); }

  .hoy {
    border: 0; background: var(--sx-sunk); color: var(--sx-ink-2);
    font: inherit; font-size: var(--sx-t-xs); font-weight: var(--sx-w-semi);
    padding: var(--sx-s-1) var(--sx-s-3); border-radius: var(--sx-r-pill); cursor: pointer;
    transition: color var(--sx-fast) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }
  .hoy:hover { color: var(--sx-ink); background: var(--sx-neutral-band); }
  .hoy:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  /* ── MES ──────────────────────────────────────────────────────────────────
     Sin bordes en la grilla: la ley de Nácar (aire, no líneas). Las columnas se
     alinean solas por ser una tabla; el ritmo lo da el espaciado. */
  .grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .grid th { padding: 0 var(--sx-s-1) var(--sx-s-2); text-align: start; }
  .wd { color: var(--sx-ink-3); }

  .cell {
    /* Un piso de alto para que una semana no quede despareja porque un día
       tenga tres eventos y otro ninguno — la cláusula de linealidad, aplicada a
       sí misma. */
    height: calc(var(--sx-s-20) + var(--sx-s-4));
    vertical-align: top;
    padding: var(--sx-s-1);
    border-radius: var(--sx-r-1);
  }
  .num {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 1.6em; height: 1.6em; padding: 0 .2em; margin-bottom: 2px;
    font-size: var(--sx-t-xs); color: var(--sx-ink-2); position: relative;
  }
  /* Hoy: la MISMA marca que Calendar — un punto BAJO la cifra, nunca un relleno
     encima (un relleno es lo que significaría «elegido» en el picker). */
  .num.dot { color: var(--sx-ink); font-weight: var(--sx-w-bold); }
  .num.dot::after {
    content: ''; position: absolute; inset-block-end: -1px; inset-inline-start: 50%;
    width: 3px; height: 3px; border-radius: var(--sx-r-pill);
    background: var(--sx-accent); transform: translateX(-50%);
  }
  .cell.out .num { color: var(--sx-ink-3); font-weight: var(--sx-w-normal); }
  .cell.out { opacity: .72; }

  .evs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; min-width: 0; }

  /* El chip: banda del tono + canto del tono + la etiqueta (la palabra que
     lleva el significado). Trunca dentro de su casilla — sin desborde. */
  .ev {
    display: flex; align-items: baseline; gap: var(--sx-s-1);
    width: 100%; min-width: 0;
    padding: 1px var(--sx-s-1);
    border: 0; border-inline-start: 2px solid var(--sx-neutral);
    border-radius: var(--sx-r-1);
    background: var(--sx-neutral-band); color: var(--sx-ink-2);
    font: inherit; font-size: var(--sx-t-2xs); line-height: 1.35;
    text-align: start; text-decoration: none;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ev .t { flex: none; font-weight: var(--sx-w-semi); color: var(--sx-ink-3); }
  .ev.act { cursor: pointer; }
  .ev.act:hover { filter: saturate(1.15) brightness(.98); }
  .ev.act:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 1px; }

  .t-positive  { background: var(--sx-positive-band);  border-inline-start-color: var(--sx-positive); }
  .t-attention { background: var(--sx-attention-band); border-inline-start-color: var(--sx-attention); }
  .t-critical  { background: var(--sx-critical-band);  border-inline-start-color: var(--sx-critical); }
  .t-info      { background: var(--sx-info-band);      border-inline-start-color: var(--sx-info); }
  .t-neutral   { background: var(--sx-neutral-band);   border-inline-start-color: var(--sx-neutral); }

  .more { font-size: var(--sx-t-2xs); color: var(--sx-ink-3); font-weight: var(--sx-w-medium); padding-inline-start: var(--sx-s-1); }

  /* ── AGENDA ────────────────────────────────────────────────────────────── */
  .agenda { display: flex; flex-direction: column; gap: var(--sx-s-4); }
  .grp { display: flex; flex-direction: column; gap: var(--sx-s-1); min-width: 0; }
  .ghead { margin: 0 0 var(--sx-s-1); }
  .gh { color: var(--sx-ink-3); }
  .rows { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }

  .row {
    display: flex; align-items: baseline; gap: var(--sx-s-3);
    width: 100%; min-width: 0;
    padding: var(--sx-s-2) var(--sx-s-2);
    border: 0; border-radius: var(--sx-r-1);
    background: none; color: var(--sx-ink); font: inherit;
    text-align: start; text-decoration: none;
  }
  .row.act { cursor: pointer; }
  .row.act:hover { background: var(--sx-sunk); }
  .row.act:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: -2px; }
  .when { flex: none; width: 5ch; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  /* La marca de tono: una barrita de color con su palabra al lado (la etiqueta).
     El color acompaña, no viaja solo. */
  .mk { flex: none; align-self: center; width: 3px; height: 1.1em; border-radius: var(--sx-r-pill); background: var(--sx-neutral); }
  .row.t-positive  .mk { background: var(--sx-positive); }
  .row.t-attention .mk { background: var(--sx-attention); }
  .row.t-critical  .mk { background: var(--sx-critical); }
  .row.t-info      .mk { background: var(--sx-info); }
  .lbl { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--sx-t-sm); }

  .empty { margin: 0; padding: var(--sx-s-6); text-align: center; color: var(--sx-ink-3); font-size: var(--sx-t-sm); }

  @media (pointer: coarse) {
    .row.act { padding-block: var(--sx-s-3); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hoy, .ev.act { transition: none; }
  }

  /* Angosto: la grilla del mes deja de tener sentido bajo cierto ancho —las
     casillas se vuelven ilegibles— así que las cifras encogen un punto. La
     agenda no necesita nada: ya es una lista. */
  @media (max-width: 560px) {
    .cell { height: calc(var(--sx-s-20) + var(--sx-s-1)); }
    .ev .t { display: none; }
  }
</style>
