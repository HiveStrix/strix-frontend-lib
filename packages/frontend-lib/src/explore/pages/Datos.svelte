<script>
  // DATOS Y TIEMPO — la familia donde el color de verdad carga información.
  //
  // Seis especímenes, los mismos en las ocho direcciones:
  //   1. barra de progreso con umbral (72 % / 88 % / 118 % vencido)
  //   2. medidor de dos relojes: calendario y uso, cuál llega primero
  //   3. línea de tiempo de planes sobre un eje de días compartido
  //   4. minigráfico de consumo semanal
  //   5. barra de distribución de la flota (8 / 14 / 62 / 4)
  //   6. tira de los próximos 14 días
  //
  // Todo en SVG o CSS puro. Ninguna medida, color ni radio escrito a mano: cada
  // valor sale de los tokens --d-*, y lo que el contrato no cubre (alto de una
  // barra, ancho del raíl de etiquetas) se declara aquí como --dv-* y se afina
  // por dirección. Las variaciones por dirección van con :global(), que es la
  // única forma de cruzar la frontera de Direction.svelte hasta [data-d].
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { PLANS, KPIS, markOf } from '../demo.js';

  export let directions = [];

  /* ── Estado, compartido por las ocho celdas ──────────────────────────────
     A propósito: si movés la ventana del eje en una dirección, las ocho se
     mueven juntas y la comparación sigue siendo honesta. */
  let scale = 60;   // días hacia adelante en el eje de la línea de tiempo
  let zones = true; // mostrar las tres zonas (al día / por vencer / vencido)
  let pick = 0;     // día elegido en la tira de calendario

  const WORD = {
    positive: 'Al día', attention: 'Por vencer', critical: 'Vencido',
    neutral: 'Sin lectura', info: 'Nota'
  };

  /* ── Eje de días ─────────────────────────────────────────────────────── */
  const BACK = 20; // días de historia siempre visibles a la izquierda
  const TICKS = { 30: [-20, 0, 15, 30], 60: [-20, 0, 15, 30, 60], 90: [-20, 0, 15, 45, 90] };
  const px = (day, fwd) => Math.max(0, Math.min(100, ((day + BACK) / (BACK + fwd)) * 100));
  const shift = (t, fwd) => (t <= -BACK ? '0%' : t >= fwd ? '-100%' : '-50%');
  const tickLab = (t) => (t === 0 ? 'hoy' : t > 0 ? '+' + t + ' d' : t + ' d');

  // Días hasta el vencimiento, leídos del "when" de cada plan de demo.js.
  const DAY = { 'BAT-014': -12, HRN001: 5, 'CAM-03': 47, 'MEZ-021': -3, 'GEN-02': 9, 'COM-07': null };
  const TL = PLANS.map((p) => ({ ...p, day: DAY[p.asset] }));

  // La misma línea de tiempo, dibujada con celdas de carácter para F.
  const tlCells = (day, fwd, n) =>
    Array.from({ length: n }, (_, i) => {
      const a = -BACK + (i / n) * (BACK + fwd);
      const b = -BACK + ((i + 1) / n) * (BACK + fwd);
      const mid = (a + b) / 2;
      const hit = day !== null && day >= a && day < b;
      const now = 0 >= a && 0 < b;
      return {
        z: mid < 0 ? 'critical' : mid < 15 ? 'attention' : 'positive',
        hit, now,
        ch: hit ? '█' : now ? '│' : day !== null && mid < day ? '─' : '·'
      };
    });

  /* ── 1 · Progreso con umbral ─────────────────────────────────────────── */
  const PMAX = 130; // el eje llega a 130 % para que el vencido tenga a dónde ir
  const pp = (v) => Math.min(100, (v / PMAX) * 100);
  const BARS = [
    { asset: 'CAM-03', task: 'Servicio 10 000 km', every: 'cada 10 000 km', at: 72,
      tone: 'positive', read: '7 210 km · lectura 4 ago', when: 'en 47 d' },
    { asset: 'HRN001', task: 'Revisión de quemador', every: 'cada 2 000 h', at: 88,
      tone: 'attention', read: 'sin lectura · 14 h/día declaradas', when: 'en 5 d' },
    { asset: 'BAT-014', task: 'Cambio de aceite', every: 'cada 250 h', at: 118,
      tone: 'critical', read: '312 h · lectura 2 ago', when: 'venció hace 12 d' }
  ];

  // La misma barra, en celdas de carácter para F.
  const monoBar = (at, n = 22) => {
    const thr = Math.round((100 / PMAX) * n);
    return Array.from({ length: n }, (_, i) => {
      const v = ((i + 1) / n) * PMAX;
      const on = v <= at + 0.01;
      if (i === thr) return { ch: on ? '▓' : '│', k: 'thr' };
      return { ch: on ? '█' : '·', k: on ? (v > 100 ? 'over' : 'on') : 'off' };
    });
  };

  /* ── 2 · Dos relojes ─────────────────────────────────────────────────── */
  const R_OUT = 50, R_IN = 34;
  const LEN_OUT = (Math.PI * R_OUT).toFixed(2), LEN_IN = (Math.PI * R_IN).toFixed(2);
  const dash = (at, len) => (len * (1 - Math.min(at, 100) / 100)).toFixed(2);
  const lane = (at) => Math.min(100, (at / 115) * 100); // el 100 % cae en el 87 % del carril
  const CLOCKS = [
    {
      asset: 'GEN-02', name: 'Generador Kohler 60REOZK', task: 'Cambio de refrigerante',
      every: 'cada 3 000 h', first: 'uso',
      cal: { key: 'cal', label: 'Calendario', at: 64, tone: 'positive', left: 'faltan 131 d' },
      use: { key: 'uso', label: 'Uso', at: 81, tone: 'attention', left: 'faltan 570 h · 2 430 h leídas' },
      verdict: 'Llega primero el uso · en 9 d al ritmo de 62 h por semana'
    },
    {
      asset: 'MEZ-021', name: 'Mezcladora Baumax BM-160', task: 'Engrase general',
      every: 'cada 90 d', first: 'calendario',
      cal: { key: 'cal', label: 'Calendario', at: 104, tone: 'critical', left: 'venció hace 3 d · último 18 jul' },
      use: { key: 'uso', label: 'Uso', at: 0, tone: 'neutral', left: 'sin horómetro: este plan no corre por uso' },
      verdict: 'Ganó el calendario · venció hace 3 d y el reloj de uso ni cuenta'
    }
  ];

  /* ── 4 · Consumo semanal ─────────────────────────────────────────────── */
  const SPARK = [21, 26, 18, 29, 33, 24, 8, 0, 14, 27, 35, 31];
  const SP_TOTAL = SPARK.reduce((s, v) => s + v, 0);
  const SP_TOP = Math.max(...SPARK);
  const SP_AVG = SP_TOTAL / SPARK.length;
  const SP_W = 240, SP_H = 56, SP_PAD = 6, SP_MAX = 36;
  const spx = (i) => 5 + (i * (SP_W - 10)) / (SPARK.length - 1);
  const spy = (v) => SP_H - SP_PAD - (v / SP_MAX) * (SP_H - SP_PAD * 2);
  const SP_PTS = SPARK.map((v, i) => [spx(i), spy(v)]);
  const SP_LINE = SP_PTS.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const SP_AREA =
    'M ' + SP_PTS[0][0].toFixed(1) + ' ' + (SP_H - SP_PAD) + ' L ' + SP_LINE.split(' ').join(' L ') +
    ' L ' + SP_PTS[SP_PTS.length - 1][0].toFixed(1) + ' ' + (SP_H - SP_PAD) + ' Z';
  // Catmull-Rom a bézier: la curva suave, sin ejes, que pide E.
  const SP_SMOOTH = (() => {
    const p = SP_PTS;
    let out = 'M ' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || p[i + 1];
      out += ' C ' + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] + (c[1] - a[1]) / 6).toFixed(1) +
             ', ' + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + ' ' + (c[1] - (e[1] - b[1]) / 6).toFixed(1) +
             ', ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
    }
    return out;
  })();
  const SP_SMOOTH_AREA = SP_SMOOTH + ' L ' + SP_W + ' ' + SP_H + ' L 0 ' + SP_H + ' Z';
  const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const block = (v) => (v === 0 ? '▁' : BLOCKS[Math.max(1, Math.min(7, Math.round((v / SP_MAX) * 7)))]);
  const barW = (SP_W - 10) / SPARK.length - 4;

  /* ── 5 · Distribución de la flota ────────────────────────────────────── */
  const FLEET_N = KPIS.reduce((s, k) => s + k.value, 0);
  const FLEET = KPIS.map((k) => ({ ...k, pct: Math.round((k.value / FLEET_N) * 100) }));
  const FLEET_SAY = FLEET.map((k) => k.value + ' ' + k.label.toLowerCase()).join(', ');
  const monoFleet = (n = 34) => {
    let used = 0;
    return FLEET.map((k, i) => {
      const cells = i === FLEET.length - 1 ? Math.max(1, n - used) : Math.max(1, Math.round((k.value / FLEET_N) * n));
      used += cells;
      return { ...k, cells: Array.from({ length: cells }, (_, j) => j) };
    });
  };

  /* ── 6 · Próximos 14 días ────────────────────────────────────────────── */
  const CAL = [
    { n: 6, dow: 'ju', full: 'jueves 6 de agosto', hoy: true, tone: 'critical', count: 2,
      items: [
        { t: 'critical', s: 'BAT-014 · Cambio de aceite · venció hace 12 d' },
        { t: 'critical', s: 'MEZ-021 · Engrase general · venció hace 3 d' }
      ], note: 'arrastrados de semanas anteriores' },
    { n: 7, dow: 'vi', full: 'viernes 7 de agosto', items: [] },
    { n: 8, dow: 'sá', full: 'sábado 8 de agosto', wknd: true, items: [] },
    { n: 9, dow: 'do', full: 'domingo 9 de agosto', wknd: true, items: [] },
    { n: 10, dow: 'lu', full: 'lunes 10 de agosto', items: [] },
    { n: 11, dow: 'ma', full: 'martes 11 de agosto', tone: 'attention', count: 1,
      items: [{ t: 'attention', s: 'HRN001 · Revisión de quemador · en 5 d' }] },
    { n: 12, dow: 'mi', full: 'miércoles 12 de agosto', items: [] },
    { n: 13, dow: 'ju', full: 'jueves 13 de agosto', items: [] },
    { n: 14, dow: 'vi', full: 'viernes 14 de agosto', items: [] },
    { n: 15, dow: 'sá', full: 'sábado 15 de agosto', wknd: true, tone: 'attention', count: 1,
      items: [{ t: 'attention', s: 'GEN-02 · Cambio de refrigerante · en 9 d' }], note: 'cae sábado' },
    { n: 16, dow: 'do', full: 'domingo 16 de agosto', wknd: true, items: [] },
    { n: 17, dow: 'lu', full: 'lunes 17 de agosto', items: [] },
    { n: 18, dow: 'ma', full: 'martes 18 de agosto', items: [] },
    { n: 19, dow: 'mi', full: 'miércoles 19 de agosto', items: [] }
  ];
  const calLab = (c) =>
    c.full + (c.hoy ? ', hoy' : '') + ', ' +
    (c.count ? c.count + (c.count === 1 ? ' vencimiento' : ' vencimientos') : 'sin vencimientos');
</script>

<Grid min="440px">
  {#each directions as d (d.id)}
    <Direction id={d.id} flush={d.id === 'G' || d.id === 'F'}>
      <div class="dv">

        <!-- ══ Barra de vista ══ -->
        <div class="dv-bar" role="group" aria-label="Ajustes de la vista de datos">
          <span class="dv-rail d-cap">Ventana</span>
          <span class="dv-fld">
            <label class="dv-fld-lab d-label" for="eje-{d.id}">Eje</label>
            <select class="d-select dv-sel" id="eje-{d.id}" bind:value={scale}>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
            </select>
          </span>
          <button
            type="button"
            class="d-btn d-btn--sm dv-tog"
            aria-pressed={zones}
            on:click={() => (zones = !zones)}
          >
            <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
              >{@html markOf(zones ? 'positive' : 'neutral')}</svg
            >Zonas {zones ? 'a la vista' : 'ocultas'}
          </button>
          <span class="dv-note d-cap">Corte 6 ago · 09:12</span>
        </div>

        <!-- ══ 1 · Progreso con umbral ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Consumo del plan</h4>
            <span class="d-cap">umbral 100 %</span>
          </header>
          <div class="d-panel-body dv-body dv-stack dv-bleed">
            {#if d.id === 'F'}
              {#each BARS as g}
                <div class="mrow" data-tone={g.tone}>
                  <span class="mlab d-id">{g.asset}</span>
                  <span class="mbar"
                    >[{#each monoBar(g.at) as c}<span class="mc mc--{c.k}">{c.ch}</span>{/each}]</span
                  >
                  <span class="mval d-num">{g.at} %</span>
                  <span class="mword">{WORD[g.tone]}</span>
                </div>
                <p class="mnote">{g.task} · {g.every} · {g.when}</p>
              {/each}
              <p class="mnote mnote--legend">│ umbral 100 % · ▓ pasado de rosca · el eje corre hasta 130 %</p>
            {:else}
              {#each BARS as g}
                <div class="pb" data-tone={g.tone}>
                  <div class="pb-head">
                    <span class="pb-name"><b class="d-id">{g.asset}</b> {g.task}</span>
                    <span class="pb-val d-num">{g.at} %</span>
                  </div>
                  <div
                    class="pb-track"
                    role="img"
                    aria-label="{g.at} por ciento del intervalo. Avisa en 85 y vence en 100 por ciento."
                  >
                    {#if zones}
                      <span class="pb-zone" data-tone="positive" style="left:0;width:{pp(85)}%"></span>
                      <span class="pb-zone" data-tone="attention" style="left:{pp(85)}%;width:{pp(100) - pp(85)}%"></span>
                      <span class="pb-zone" data-tone="critical" style="left:{pp(100)}%;right:0"></span>
                    {/if}
                    <span class="pb-fill" style="width:{pp(g.at)}%"></span>
                    <span class="pb-thr pb-thr--soft" style="left:{pp(85)}%"></span>
                    <span class="pb-thr" style="left:{pp(100)}%"></span>
                    <span class="pb-thr-lab d-cap d-num" style="left:{pp(100)}%">100</span>
                  </div>
                  <div class="pb-foot">
                    <span class="d-pill" data-tone={g.tone}
                      ><svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                        >{@html markOf(g.tone)}</svg
                      >{WORD[g.tone]}</span
                    >
                    <span class="pb-note">{g.read} · {g.every} · {g.when}</span>
                  </div>
                </div>
              {/each}
              <p class="dv-foot">85 % avisa · 100 % vence · el eje corre hasta 130 %</p>
            {/if}
          </div>
        </section>

        <!-- ══ 2 · Dos relojes ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Dos relojes</h4>
            <span class="d-cap">cuál llega primero</span>
          </header>
          <div class="d-panel-body dv-body dv-stack dv-bleed">
            {#each CLOCKS as c}
              <div class="ck">
                <p class="ck-title">
                  <b class="d-id">{c.asset}</b> {c.name}
                  <span class="ck-task">{c.task} · {c.every}</span>
                </p>

                {#if d.id === 'F'}
                  {#each [c.cal, c.use] as k}
                    <div class="mrow" data-tone={k.tone}>
                      <span class="mlab">{k.key}</span>
                      <span class="mbar"
                        >[{#each monoBar(k.at, 18) as x}<span class="mc mc--{x.k}">{x.ch}</span>{/each}]</span
                      >
                      <span class="mval d-num">{k.at} %</span>
                      <span class="mword">{c.first === k.key ? '◄ primero' : k.left}</span>
                    </div>
                  {/each}
                {:else if d.id === 'A' || d.id === 'C' || d.id === 'E' || d.id === 'H'}
                  <div class="ck-dial">
                    <svg
                      class="ck-svg"
                      viewBox="0 0 124 70"
                      role="img"
                      aria-label="Reloj de calendario en {c.cal.at} por ciento, reloj de uso en {c.use.at} por ciento."
                    >
                      <path class="ck-trk" d="M12 62 A {R_OUT} {R_OUT} 0 0 1 112 62" />
                      <path class="ck-trk" d="M28 62 A {R_IN} {R_IN} 0 0 1 96 62" />
                      <path
                        class="ck-arc"
                        data-tone={c.cal.tone}
                        style="stroke-dasharray:{LEN_OUT};stroke-dashoffset:{dash(c.cal.at, LEN_OUT)}"
                        d="M12 62 A {R_OUT} {R_OUT} 0 0 1 112 62"
                      />
                      <path
                        class="ck-arc"
                        data-tone={c.use.tone}
                        style="stroke-dasharray:{LEN_IN};stroke-dashoffset:{dash(c.use.at, LEN_IN)}"
                        d="M28 62 A {R_IN} {R_IN} 0 0 1 96 62"
                      />
                      {#if c.cal.at > 100}
                        <path class="ck-over" data-tone={c.cal.tone} d="M114 56 l9 6 l-9 6 z" />
                      {/if}
                      {#if c.use.at > 100}
                        <path class="ck-over" data-tone={c.use.tone} d="M98 56 l9 6 l-9 6 z" />
                      {/if}
                    </svg>
                    <p class="ck-verdict">
                      <span class="d-pill" data-tone={c.first === 'uso' ? c.use.tone : c.cal.tone}
                        ><svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                          >{@html markOf(c.first === 'uso' ? c.use.tone : c.cal.tone)}</svg
                        >Primero: {c.first}</span
                      >
                    </p>
                  </div>
                  <ul class="ck-legend">
                    <li data-tone={c.cal.tone}>
                      <svg class="ck-sw" viewBox="0 0 22 13" aria-hidden="true" focusable="false"
                        ><path d="M2 12 A 9 9 0 0 1 20 12" fill="none" stroke="currentColor" stroke-width="3" /></svg
                      >
                      <span class="ck-nm">{c.cal.label}</span>
                      <span class="ck-pc d-num">{c.cal.at} %</span>
                      <span class="ck-lf">{c.cal.left}</span>
                    </li>
                    <li data-tone={c.use.tone}>
                      <svg class="ck-sw" viewBox="0 0 22 13" aria-hidden="true" focusable="false"
                        ><path d="M6 12 A 5 5 0 0 1 16 12" fill="none" stroke="currentColor" stroke-width="3" /></svg
                      >
                      <span class="ck-nm">{c.use.label}</span>
                      <span class="ck-pc d-num">{c.use.at} %</span>
                      <span class="ck-lf">{c.use.left}</span>
                    </li>
                  </ul>
                {:else}
                  <div class="ck-lanes">
                    {#each [c.cal, c.use] as k}
                      <div class="ck-lane" data-tone={k.tone}>
                        <span class="ck-lane-lab d-cap">{k.label}</span>
                        <span class="ck-trklane" role="img" aria-label="{k.label}: {k.at} por ciento del intervalo">
                          <span class="ck-fill" style="width:{lane(k.at)}%"></span>
                          <span class="ck-fin" style="left:{lane(100)}%"></span>
                        </span>
                        <span class="ck-pc d-num">{k.at} %</span>
                        <span class="ck-lane-foot">
                          {#if c.first === k.key}
                            <span class="d-pill ck-first" data-tone={k.tone}
                              ><svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                                >{@html markOf(k.tone)}</svg
                              >Primero</span
                            >
                          {/if}
                          <span class="ck-lf">{k.left}</span>
                        </span>
                      </div>
                    {/each}
                  </div>
                {/if}
                <p class="ck-say">{c.verdict}</p>
              </div>
            {/each}
          </div>
        </section>

        <!-- ══ 3 · Línea de tiempo ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Línea de tiempo de planes</h4>
            <span class="d-cap">hoy · 6 ago</span>
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            {#if d.id === 'F'}
              <div class="tl-mono">
                {#each TL as p}
                  <div class="mrow mrow--tl" data-tone={p.tone}>
                    <span class="mlab d-id">{p.asset}</span>
                    <span class="mbar" aria-hidden="true"
                      >{#each tlCells(p.day, scale, 24) as x}<span
                        class="mc"
                        class:mc--hit={x.hit}
                        class:mc--now={x.now}
                        data-tone={zones ? x.z : undefined}>{x.ch}</span
                      >{/each}</span
                    >
                    <span class="mword">{p.when}</span>
                  </div>
                {/each}
                <p class="mnote mnote--legend">−{BACK} d ├── hoy ──┤ +{scale} d · █ vence · │ hoy · · sin dato</p>
              </div>
            {:else}
              <div class="tl">
                <div class="tl-axis" aria-hidden="true">
                  <span class="tl-lab"></span>
                  <span class="tl-plot tl-plot--axis">
                    {#each TICKS[scale] as t}
                      <span class="tl-tick" style="left:{px(t, scale)}%;transform:translateX({shift(t, scale)})"
                        >{tickLab(t)}</span
                      >
                    {/each}
                  </span>
                </div>
                {#each TL as p}
                  <div class="tl-row" data-tone={p.tone}>
                    <span class="tl-lab">
                      <b class="d-id">{p.asset}</b>
                      <span class="tl-task">{p.task}</span>
                    </span>
                    <span class="tl-plot">
                      <span
                        class="tl-track"
                        role="img"
                        aria-label="{p.task} de {p.asset}: {p.when}. Eje de menos {BACK} a más {scale} días."
                      >
                        {#if zones}
                          <span class="tl-zone" data-tone="critical" style="left:0;width:{px(0, scale)}%"></span>
                          <span class="tl-zone" data-tone="attention" style="left:{px(0, scale)}%;width:{px(15, scale) - px(0, scale)}%"></span>
                          <span class="tl-zone" data-tone="positive" style="left:{px(15, scale)}%;right:0"></span>
                        {/if}
                        {#if p.day === null}
                          <span class="tl-hatch"></span>
                        {:else}
                          <span class="tl-elapsed" style="width:{px(p.day, scale)}%"></span>
                        {/if}
                        <span class="tl-now" style="left:{px(0, scale)}%"></span>
                        {#if p.day !== null && p.day <= scale}
                          <span class="tl-dot" style="left:{px(p.day, scale)}%">
                            <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                              >{@html markOf(p.tone)}</svg
                            >
                          </span>
                        {/if}
                      </span>
                      {#if p.day !== null && p.day > scale}
                        <span class="tl-off d-num">+{p.day} d ▸</span>
                      {/if}
                      <span class="tl-when">{p.when} · {p.every}</span>
                    </span>
                  </div>
                {/each}
                <ul class="tl-key">
                  {#each [['positive', 'Al día'], ['attention', 'Por vencer'], ['critical', 'Vencido']] as z}
                    <li data-tone={z[0]}>
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(z[0])}</svg>
                      {z[1]}
                    </li>
                  {/each}
                  <li class="tl-key-now"><span class="tl-key-rule"></span>hoy</li>
                </ul>
              </div>
            {/if}
          </div>
        </section>

        <!-- ══ 4 · Consumo semanal ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Consumo · BAT-014</h4>
            <span class="d-cap">12 semanas</span>
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            <p class="d-sr">
              Horas por semana de la Batidora Imer Syntesi 250, de la semana del 17 de mayo a la del 2 de agosto:
              {SPARK.join(', ')} horas.
            </p>
            {#if d.id === 'F'}
              <div class="sp-mono" aria-hidden="true">
                {#each SPARK as v}
                  <span class="sp-ch" class:sp-ch--zero={v === 0} class:sp-ch--top={v === SP_TOP}>{block(v)}</span>
                {/each}
              </div>
            {:else if d.id === 'D'}
              <svg class="sp-svg" viewBox="0 0 {SP_W} {SP_H}" preserveAspectRatio="none" aria-hidden="true">
                {#each SPARK as v, i}
                  <rect class="sp-bar" x={spx(i) - barW / 2} y={spy(v)} width={barW} height={SP_H - SP_PAD - spy(v)} />
                {/each}
                <line class="sp-base" x1="0" y1={SP_H - SP_PAD} x2={SP_W} y2={SP_H - SP_PAD} vector-effect="non-scaling-stroke" />
              </svg>
            {:else if d.id === 'E'}
              <svg class="sp-svg" viewBox="0 0 {SP_W} {SP_H}" preserveAspectRatio="none" aria-hidden="true">
                <path class="sp-area" data-tone="info" d={SP_SMOOTH_AREA} />
                <path class="sp-curve" data-tone="info" d={SP_SMOOTH} vector-effect="non-scaling-stroke" />
                <circle class="sp-end" data-tone="info" cx={spx(SPARK.length - 1)} cy={spy(SPARK[SPARK.length - 1])} r="4" />
              </svg>
            {:else}
              <svg class="sp-svg" viewBox="0 0 {SP_W} {SP_H}" preserveAspectRatio="none" aria-hidden="true">
                {#if d.id === 'B'}
                  {#each SPARK as v, i}
                    <line class="sp-grid" x1={spx(i)} y1={SP_PAD} x2={spx(i)} y2={SP_H - SP_PAD} vector-effect="non-scaling-stroke" />
                  {/each}
                  <line class="sp-avg" x1="0" y1={spy(SP_AVG)} x2={SP_W} y2={spy(SP_AVG)} vector-effect="non-scaling-stroke" />
                {/if}
                <path class="sp-area" data-tone="info" d={SP_AREA} />
                <polyline class="sp-line" data-tone="info" points={SP_LINE} vector-effect="non-scaling-stroke" />
                <line class="sp-base" x1="0" y1={SP_H - SP_PAD} x2={SP_W} y2={SP_H - SP_PAD} vector-effect="non-scaling-stroke" />
                <circle class="sp-end" data-tone="info" cx={spx(SPARK.length - 1)} cy={spy(SPARK[SPARK.length - 1])} r="3" />
              </svg>
            {/if}
            <p class="sp-caps">
              <span>17 may</span>
              <span class="sp-mid">{SP_TOTAL} h en 12 semanas · pico {SP_TOP} h · 1 semana en cero</span>
              <span>2 ago</span>
            </p>
          </div>
        </section>

        <!-- ══ 5 · Distribución de la flota ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Flota por estado</h4>
            <span class="d-cap d-num">{FLEET_N} equipos</span>
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            {#if d.id === 'F'}
              <div class="ds-mono" aria-hidden="true">
                {#each monoFleet() as k}
                  <span class="ds-mgrp" data-tone={k.tone}
                    >{#each k.cells as _}<span class="ds-mc">█</span>{/each}</span
                  >
                {/each}
              </div>
            {:else}
              <div class="ds-bar" role="img" aria-label="Flota de {FLEET_N} equipos: {FLEET_SAY}.">
                {#each FLEET as k}
                  <span class="ds-seg" data-tone={k.tone} style="width:{k.pct}%"></span>
                {/each}
              </div>
            {/if}
            <ul class="ds-key">
              {#each FLEET as k}
                <li data-tone={k.tone}>
                  <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(k.tone)}</svg>
                  <span class="ds-nm">{k.label}</span>
                  <b class="ds-v d-num">{k.value}</b>
                  <span class="ds-pc d-num">{k.pct} %</span>
                  <span class="ds-note">{k.note}</span>
                </li>
              {/each}
            </ul>
          </div>
        </section>

        <!-- ══ 6 · Próximos 14 días ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Próximos 14 días</h4>
            <span class="d-cap">3 días con vencimiento</span>
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            <div class="cal-strip" role="group" aria-label="Del 6 al 19 de agosto">
              {#each CAL as c, i}
                <button
                  type="button"
                  class="cal-day"
                  class:cal-day--wknd={c.wknd}
                  class:cal-day--hoy={c.hoy}
                  class:cal-day--on={pick === i}
                  data-tone={c.tone}
                  aria-pressed={pick === i}
                  aria-label={calLab(c)}
                  on:click={() => (pick = i)}
                >
                  <span class="cal-dow">{c.hoy ? 'hoy' : c.dow}</span>
                  <span class="cal-n d-num">{c.n}</span>
                  {#if c.count}
                    <span class="cal-mk">
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                        >{@html markOf(c.tone)}</svg
                      >{#if c.count > 1}<b class="d-num">{c.count}</b>{/if}
                    </span>
                  {:else}
                    <span class="cal-mk cal-mk--void" aria-hidden="true">·</span>
                  {/if}
                </button>
              {/each}
            </div>
            <div class="cal-detail">
              <p class="cal-day-name">
                <b>{CAL[pick].full}</b>{#if CAL[pick].hoy} · hoy{/if}{#if CAL[pick].note} · {CAL[pick].note}{/if}
              </p>
              {#if CAL[pick].items.length}
                <ul class="cal-list">
                  {#each CAL[pick].items as it}
                    <li data-tone={it.t}>
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(it.t)}</svg>
                      {it.s}
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="cal-none">
                  Sin vencimientos.{CAL[pick].wknd ? ' Fin de semana: la cuadrilla no entra.' : ''}
                </p>
              {/if}
            </div>
            <p class="dv-foot">Después de la tira: CAM-03 · Servicio 10 000 km · 22 sep</p>
          </div>
        </section>
      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ══════════════════════════════════════════════════════════════════════
     BASE — escrita contra los tokens. Lo que el contrato no nombra se
     declara aquí como --dv-* y se afina por dirección más abajo.
     ══════════════════════════════════════════════════════════════════════ */
  .dv {
    display: grid;
    gap: var(--d-gap);
    container-type: inline-size;
    --dv-lab: 104px;  /* columna de etiquetas de la línea de tiempo */
    --dv-lane: 88px;  /* columna de etiquetas de los carriles del medidor */
    --dv-h: 10px;     /* alto de una barra */
    --dv-dot: 13px;   /* marca de vencimiento sobre el eje */
  }
  .mk { width: 9px; height: 9px; flex: none; }
  .dv-foot { margin: var(--d-p2) 0 0; font-size: var(--d-t-2xs); color: var(--d-ink-3); }
  .dv-body { display: grid; gap: var(--d-p2); min-width: 0; }

  /* ── Barra de vista ─────────────────────────────────────────────────── */
  .dv-bar {
    display: flex; align-items: center; flex-wrap: wrap;
    gap: var(--d-p2);
    padding: var(--d-p2) var(--d-p3);
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    min-width: 0;
  }
  .dv-fld { display: flex; align-items: center; gap: var(--d-p1); min-width: 0; }
  .dv-fld-lab { white-space: nowrap; }
  .dv-sel { width: auto; min-width: 96px; }
  .dv-tog { gap: var(--d-p1); }
  .dv-note { margin-left: auto; white-space: nowrap; }
  .dv-rail { white-space: nowrap; }

  /* ── 1 · Progreso con umbral ────────────────────────────────────────── */
  .pb { display: grid; gap: 5px; min-width: 0; position: relative; }
  .pb-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--d-p1); min-width: 0; }
  .pb-name { font-size: var(--d-t-sm); color: var(--d-ink-2); min-width: 0; overflow-wrap: anywhere; }
  .pb-name b { color: var(--d-ink); font-weight: var(--d-w-semi); }
  .pb-val { font-size: var(--d-t-sm); font-weight: var(--d-w-semi); color: var(--tone-fg); font-variant-numeric: var(--d-num); }
  .pb-track {
    position: relative;
    height: var(--dv-h);
    background: var(--d-sunk);
    border-radius: var(--d-r-pill);
    overflow: hidden;
  }
  .pb-zone { position: absolute; inset-block: 0; background: var(--tone-band); }
  .pb-fill { position: absolute; inset-block: 0; left: 0; background: var(--tone-fg); }
  .pb-thr { position: absolute; inset-block: 0; width: 2px; background: var(--d-ink); opacity: .5; }
  .pb-thr--soft { opacity: .22; }
  .pb-thr-lab { position: absolute; bottom: 100%; margin-left: 3px; display: none; }
  .pb-foot { display: flex; align-items: center; gap: var(--d-p1) var(--d-p2); flex-wrap: wrap; }
  .pb-note { font-size: var(--d-t-2xs); color: var(--d-ink-3); min-width: 0; overflow-wrap: anywhere; }

  /* ── 2 · Dos relojes ────────────────────────────────────────────────── */
  .ck { display: grid; gap: var(--d-p1); min-width: 0; }
  .ck + .ck { margin-top: var(--d-p2); }
  .ck-title { margin: 0; font-size: var(--d-t-sm); color: var(--d-ink-2); overflow-wrap: anywhere; }
  .ck-title b { color: var(--d-ink); font-weight: var(--d-w-semi); }
  .ck-task { display: block; color: var(--d-ink-3); font-size: var(--d-t-2xs); }
  .ck-dial { display: flex; align-items: center; gap: var(--d-p2); flex-wrap: wrap; }
  .ck-svg { width: 124px; height: 70px; flex: none; }
  .ck-trk { fill: none; stroke: var(--d-sunk); stroke-width: 10; }
  .ck-arc { fill: none; stroke: var(--tone-fg); stroke-width: 10; }
  .ck-over { fill: var(--tone-fg); }
  .ck-verdict { margin: 0; min-width: 0; }
  .ck-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; }
  .ck-legend li { display: flex; align-items: center; gap: var(--d-p1); font-size: var(--d-t-xs); color: var(--d-ink-2); min-width: 0; flex-wrap: wrap; }
  .ck-sw { width: 20px; height: 12px; flex: none; color: var(--tone-fg); }
  .ck-nm { font-weight: var(--d-w-med); }
  .ck-pc { color: var(--tone-fg); font-weight: var(--d-w-semi); font-variant-numeric: var(--d-num); }
  .ck-lf { color: var(--d-ink-3); font-size: var(--d-t-2xs); min-width: 0; overflow-wrap: anywhere; }
  .ck-lanes { display: grid; gap: var(--d-p1); }
  .ck-lane { display: grid; grid-template-columns: var(--dv-lane) minmax(0, 1fr) auto; align-items: center; gap: 3px var(--d-p2); }
  .ck-lane-lab { grid-column: 1; grid-row: 1; min-width: 0; overflow-wrap: anywhere; }
  .ck-trklane { position: relative; grid-column: 2; grid-row: 1; height: var(--dv-h); background: var(--d-sunk); }
  .ck-fill { position: absolute; inset-block: 0; left: 0; background: var(--tone-fg); }
  .ck-fin { position: absolute; inset-block: -3px; width: 2px; background: var(--d-ink); }
  .ck-lane > .ck-pc { grid-column: 3; grid-row: 1; }
  .ck-lane-foot {
    grid-column: 2 / span 2; grid-row: 2; min-width: 0;
    display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1);
  }
  .ck-say { margin: 0; font-size: var(--d-t-2xs); color: var(--d-ink-3); overflow-wrap: anywhere; }

  /* ── 3 · Línea de tiempo ────────────────────────────────────────────── */
  .tl { display: grid; gap: 2px; min-width: 0; }
  .tl-axis, .tl-row { display: grid; grid-template-columns: var(--dv-lab) minmax(0, 1fr); gap: var(--d-p2); align-items: center; }
  .tl-row { padding-block: 4px; }
  .tl-lab { font-size: var(--d-t-xs); min-width: 0; display: grid; gap: 1px; }
  .tl-lab b { font-weight: var(--d-w-semi); }
  .tl-task { color: var(--d-ink-3); font-size: var(--d-t-2xs); overflow-wrap: anywhere; }
  .tl-plot { position: relative; min-width: 0; display: grid; gap: 3px; }
  .tl-plot--axis { min-height: 1.4em; }
  .tl-tick { position: absolute; top: 0; font-size: var(--d-t-2xs); color: var(--d-ink-3); white-space: nowrap; font-variant-numeric: var(--d-num); }
  .tl-track { position: relative; height: var(--dv-h); background: var(--d-sunk); border-radius: var(--d-r-pill); }
  .tl-zone { position: absolute; inset-block: 0; background: var(--tone-band); }
  .tl-elapsed { position: absolute; inset-block: 35%; left: 0; background: var(--tone-fg); opacity: .5; }
  .tl-hatch {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(45deg, var(--d-neu-band) 0 var(--d-p1), transparent var(--d-p1) var(--d-p2));
  }
  .tl-now { position: absolute; inset-block: -3px; width: 1px; background: var(--d-ink); }
  .tl-dot {
    position: absolute; top: 50%; width: var(--dv-dot); height: var(--dv-dot);
    margin: calc(var(--dv-dot) / -2) 0 0 calc(var(--dv-dot) / -2);
    display: grid; place-items: center;
    border-radius: var(--d-r-pill);
    background: var(--d-surface); color: var(--tone-fg);
    box-shadow: 0 0 0 1px var(--tone-fg);
  }
  .tl-off { position: absolute; right: 0; top: 0; font-size: var(--d-t-2xs); color: var(--tone-fg); background: var(--d-surface); padding-left: 3px; }
  .tl-when { font-size: var(--d-t-2xs); color: var(--d-ink-3); overflow-wrap: anywhere; }
  .tl-key { list-style: none; margin: var(--d-p1) 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--d-p1) var(--d-p2); }
  .tl-key li { display: flex; align-items: center; gap: 4px; font-size: var(--d-t-2xs); color: var(--tone-fg, var(--d-ink-3)); }
  .tl-key-now { color: var(--d-ink-3); }
  .tl-key-rule { width: 1px; height: 10px; background: var(--d-ink); display: inline-block; }

  /* ── 4 · Consumo semanal ────────────────────────────────────────────── */
  .sp-svg { width: 100%; height: 56px; display: block; }
  .sp-area { fill: var(--tone-band); }
  .sp-line, .sp-curve { fill: none; stroke: var(--tone-fg); stroke-width: 1.6; }
  .sp-base { stroke: var(--d-line); stroke-width: 1; }
  .sp-grid { stroke: var(--d-line); stroke-width: 1; }
  .sp-avg { stroke: var(--d-ink-3); stroke-width: 1; stroke-dasharray: 3 3; }
  .sp-bar { fill: var(--d-ink); }
  .sp-end { fill: var(--tone-fg); }
  .sp-caps { display: flex; justify-content: space-between; gap: var(--d-p1); margin: 4px 0 0; font-size: var(--d-t-2xs); color: var(--d-ink-3); }
  .sp-mid { text-align: center; min-width: 0; }
  .sp-mono {
    font-size: var(--d-t-2xl); line-height: 1;
    color: var(--d-accent); background: var(--d-sunk);
    padding: var(--d-p2) var(--d-p1);
  }
  .sp-ch--zero { color: var(--d-ink-3); }
  .sp-ch--top { color: var(--d-att); background: var(--d-att-band); }

  /* ── 5 · Distribución de la flota ───────────────────────────────────── */
  .ds-bar {
    display: flex; height: calc(var(--dv-h) * 1.4);
    border-radius: var(--d-r-pill); overflow: hidden; background: var(--d-sunk);
  }
  .ds-seg { background: var(--tone-fg); min-width: 3px; }
  .ds-seg + .ds-seg { box-shadow: inset 1px 0 0 var(--d-surface); }
  .ds-key { list-style: none; margin: var(--d-p1) 0 0; padding: 0; display: grid; gap: 3px; }
  .ds-key li { display: flex; align-items: baseline; gap: var(--d-p1); font-size: var(--d-t-xs); color: var(--tone-fg); min-width: 0; }
  .ds-nm { color: var(--d-ink-2); font-weight: var(--d-w-med); }
  .ds-v { font-variant-numeric: var(--d-num); font-weight: var(--d-w-semi); }
  .ds-pc { color: var(--d-ink-3); font-size: var(--d-t-2xs); font-variant-numeric: var(--d-num); }
  .ds-note { color: var(--d-ink-3); font-size: var(--d-t-2xs); margin-left: auto; white-space: nowrap; }
  .ds-mono { font-size: var(--d-t-lg); line-height: 1.1; }
  .ds-mgrp { color: var(--tone-fg); }

  /* ── 6 · Próximos 14 días ───────────────────────────────────────────── */
  .cal-strip { display: grid; grid-template-columns: repeat(14, minmax(0, 1fr)); gap: 2px; }
  .cal-day {
    position: relative;
    display: grid; gap: 1px; justify-items: center; align-content: center;
    min-height: var(--d-touch); padding: var(--d-p1) 1px;
    font: inherit; color: var(--d-ink-2);
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    cursor: pointer; min-width: 0;
  }
  .cal-day[data-tone] { background: var(--tone-band); color: var(--tone-fg); border-color: var(--tone-edge); }
  .cal-day--wknd { background: var(--d-sunk); }
  .cal-day--wknd[data-tone] { background: var(--tone-band); }
  .cal-day--hoy { box-shadow: inset 0 0 0 1px var(--d-ink); }
  /* La selección va como marca, no como borde: así ninguna dirección tiene que
     inventarse un borde que su silueta prohíbe. */
  .cal-day--on::after {
    content: ''; position: absolute; left: 18%; right: 18%; bottom: 2px; height: 3px;
    background: var(--d-ink);
  }
  .cal-day--on .cal-n { font-weight: var(--d-w-bold); }
  .cal-day:hover { filter: brightness(.97); }
  .cal-dow { font-size: var(--d-t-2xs); color: var(--d-ink-3); line-height: 1; }
  .cal-n { font-size: var(--d-t-xs); font-weight: var(--d-w-semi); line-height: 1.1; font-variant-numeric: var(--d-num); }
  .cal-mk { display: flex; align-items: center; gap: 1px; height: 10px; color: var(--tone-fg); }
  .cal-mk b { font-size: var(--d-t-2xs); font-weight: var(--d-w-bold); line-height: 1; }
  .cal-mk--void { color: var(--d-ink-3); opacity: .4; font-size: var(--d-t-2xs); line-height: 10px; }
  .cal-detail { margin-top: var(--d-p2); min-width: 0; }
  .cal-day-name { margin: 0 0 3px; font-size: var(--d-t-sm); color: var(--d-ink-3); }
  .cal-day-name b { color: var(--d-ink); font-weight: var(--d-w-semi); }
  .cal-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  .cal-list li { display: flex; align-items: baseline; gap: var(--d-p1); font-size: var(--d-t-xs); color: var(--tone-fg); overflow-wrap: anywhere; }
  .cal-none { margin: 0; font-size: var(--d-t-xs); color: var(--d-ink-3); }

  /* ── Piezas de carácter (solo F las usa) ────────────────────────────── */
  .mrow { display: flex; align-items: center; gap: var(--d-p1); font-size: var(--d-t-xs); white-space: nowrap; overflow: hidden; }
  .mlab { color: var(--d-ink); width: 7ch; flex: none; overflow: hidden; }
  .mbar { color: var(--d-ink-3); flex: none; }
  .mval { color: var(--tone-fg); font-variant-numeric: var(--d-num); flex: none; }
  .mword { color: var(--d-ink-3); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .mc[data-tone] { background: var(--tone-band); color: var(--tone-fg); }
  .mc--hit { background: var(--tone-fg); color: var(--d-ink-on); }
  .mc--now { color: var(--d-accent); }
  .mc--on { color: var(--tone-fg); }
  .mc--over { color: var(--d-crit); background: var(--d-crit-band); }
  .mc--off { color: var(--d-line); }
  .mc--thr { color: var(--d-accent); }
  .mnote { margin: 0 0 var(--d-p1) 7ch; font-size: var(--d-t-2xs); color: var(--d-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mnote--legend { margin-left: 0; }

  /* ══════════════════════════════════════════════════════════════════════
     LAS OCHO DIRECCIONES.
     [data-d] vive en Direction.svelte: sin :global() no cruza la frontera y
     la variación se pierde en silencio.
     ══════════════════════════════════════════════════════════════════════ */

  /* ── A · ELEVACIÓN — todo flota, nada se toca ───────────────────────── */
  :global([data-d='A']) .dv-bar { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .dv-body { gap: var(--d-p3); }
  :global([data-d='A']) .cal-strip { gap: 3px; }
  :global([data-d='A']) .cal-day { box-shadow: var(--d-shadow); }
  :global([data-d='A']) .cal-day--hoy { box-shadow: var(--d-shadow), inset 0 0 0 1px var(--d-ink); }
  :global([data-d='A']) .cal-detail { padding: var(--d-p2) var(--d-p3); background: var(--d-sunk); border-radius: var(--d-r-lg); }
  :global([data-d='A']) .ds-bar { box-shadow: var(--d-shadow); }
  :global([data-d='A']) .tl-dot { box-shadow: 0 0 0 1px var(--tone-fg), var(--d-shadow); }

  /* ── B · INSTRUMENTO — marcos rectos, bordes compartidos, regla ─────── */
  :global([data-d='B']) .dv { --dv-h: 7px; --dv-lab: 92px; --dv-dot: 11px; }
  :global([data-d='B']) .dv-bar { padding: 0; gap: 0; border-color: var(--d-edge); }
  :global([data-d='B']) .dv-bar > * { display: flex; align-items: center; align-self: stretch; padding: var(--d-p1) var(--d-p2); border-right: 1px solid var(--d-line); }
  :global([data-d='B']) .dv-bar > :last-child { border-right: 0; }
  :global([data-d='B']) .dv-note { margin-left: 0; flex: 1; justify-content: flex-end; }
  :global([data-d='B']) .dv-stack { padding: 0; gap: 0; }
  :global([data-d='B']) .pb, :global([data-d='B']) .ck { padding: var(--d-p2) var(--d-p3); border-top: 1px solid var(--d-line); }
  :global([data-d='B']) .pb:first-child, :global([data-d='B']) .ck:first-child { border-top: 0; }
  :global([data-d='B']) .ck + .ck { margin-top: 0; }
  :global([data-d='B']) .pb-track, :global([data-d='B']) .tl-track, :global([data-d='B']) .ck-trklane {
    border-radius: 0; border: 1px solid var(--d-line); background: var(--d-surface);
  }
  :global([data-d='B']) .pb-track { overflow: visible; }
  :global([data-d='B']) .pb-thr { inset-block: -5px; width: 1px; opacity: 1; }
  :global([data-d='B']) .pb-thr--soft { background: transparent; border-left: 1px dashed var(--d-ink-3); }
  :global([data-d='B']) .pb-thr-lab { display: block; }
  :global([data-d='B']) .ck-fin { inset-block: -4px; width: 1px; }
  :global([data-d='B']) .tl { gap: 0; }
  :global([data-d='B']) .tl-row {
    border-top: 1px solid var(--d-line); padding-block: 5px;
    margin-inline: calc(-1 * var(--d-p3)); padding-inline: var(--d-p3);
  }
  :global([data-d='B']) .tl-now { inset-block: -5px; }
  :global([data-d='B']) .tl-dot { border-radius: 0; background: var(--d-surface); box-shadow: 0 0 0 1px var(--tone-fg); }
  :global([data-d='B']) .sp-svg { border: 1px solid var(--d-line); }
  :global([data-d='B']) .ds-bar { border-radius: 0; border: 1px solid var(--d-edge); }
  :global([data-d='B']) .cal-strip { gap: 0; }
  :global([data-d='B']) .cal-day { min-height: 38px; border-radius: 0; margin-left: -1px; }
  :global([data-d='B']) .cal-day:first-child { margin-left: 0; }
  :global([data-d='B']) .cal-day--hoy { z-index: 1; }

  /* ── C · MARCA — el teal es la estructura, no el adorno ─────────────── */
  :global([data-d='C']) .dv { --dv-h: 12px; }
  :global([data-d='C']) .dv-bar { background: var(--d-brand); border-color: var(--d-brand); }
  /* En C, .d-cap va en teal por token; sobre la cabecera teal desaparecería.
     La cabecera manda: dentro de ella, la etiqueta va en tinta clara. */
  :global([data-d='C']) .d-panel-head .d-cap,
  :global([data-d='C']) .dv-bar .d-cap,
  :global([data-d='C']) .dv-bar .dv-fld-lab { color: var(--d-brand-ink); }
  :global([data-d='C']) .dv-sel { border-color: transparent; }
  :global([data-d='C']) .pb-name b, :global([data-d='C']) .tl-lab b,
  :global([data-d='C']) .ck-title b, :global([data-d='C']) .cal-day-name b { color: var(--d-brand); }
  :global([data-d='C']) .tl-axis { background: var(--d-accent-soft); border-radius: var(--d-r); padding: 2px 0; }
  :global([data-d='C']) .tl-key, :global([data-d='C']) .ds-key { padding-top: var(--d-p1); border-top: 1px solid var(--d-line); }
  :global([data-d='C']) .cal-day--hoy { box-shadow: inset 0 0 0 2px var(--d-brand); }
  :global([data-d='C']) .sp-mid { color: var(--d-brand); }

  /* ── D · PESO — 2px de tinta, bloques macizos, nada difuso ──────────── */
  :global([data-d='D']) .dv { --dv-h: 18px; --dv-dot: 15px; }
  :global([data-d='D']) .dv-note, :global([data-d='D']) .pb-val { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='D']) .pb-track, :global([data-d='D']) .tl-track, :global([data-d='D']) .ck-trklane {
    border: var(--d-bw) solid var(--d-ink); border-radius: 0; background: var(--d-surface);
  }
  :global([data-d='D']) .pb-fill, :global([data-d='D']) .ck-fill {
    background: var(--tone-band); border-right: var(--d-bw) solid var(--d-ink);
  }
  :global([data-d='D']) .pb-val { color: var(--d-ink); }
  :global([data-d='D']) .pb-thr, :global([data-d='D']) .pb-thr--soft { width: 3px; opacity: 1; }
  :global([data-d='D']) .ck-fin { width: 3px; inset-block: -4px; }
  :global([data-d='D']) .tl-elapsed { inset-block: 0; opacity: 1; background: var(--tone-band); }
  :global([data-d='D']) .tl-now { width: var(--d-bw); inset-block: -4px; }
  :global([data-d='D']) .tl-dot { border-radius: 0; background: var(--tone-band); color: var(--d-ink); box-shadow: 0 0 0 var(--d-bw) var(--d-ink); }
  :global([data-d='D']) .ds-bar { border: var(--d-bw) solid var(--d-ink); border-radius: 0; }
  :global([data-d='D']) .ds-seg { background: var(--tone-band); }
  :global([data-d='D']) .ds-seg + .ds-seg { box-shadow: inset var(--d-bw) 0 0 var(--d-ink); }
  :global([data-d='D']) .ds-key li, :global([data-d='D']) .cal-list li, :global([data-d='D']) .tl-key li { color: var(--d-ink); }
  :global([data-d='D']) .sp-base { stroke: var(--d-ink); stroke-width: 2; }
  :global([data-d='D']) .cal-strip { gap: 0; }
  :global([data-d='D']) .cal-day { margin-left: calc(-1 * var(--d-bw)); border-color: var(--d-ink); }
  :global([data-d='D']) .cal-day:first-child { margin-left: 0; }
  :global([data-d='D']) .cal-day--hoy { background: var(--d-ink); color: var(--d-ink-on); box-shadow: none; }
  :global([data-d='D']) .cal-day--hoy .cal-dow, :global([data-d='D']) .cal-day--hoy .cal-mk { color: var(--d-ink-on); }
  :global([data-d='D']) .cal-day--hoy.cal-day--on::after { background: var(--d-ink-on); }
  :global([data-d='D']) .cal-day:active { transform: translate(2px, 2px); }
  :global([data-d='D']) .cal-detail { border: var(--d-bw) solid var(--d-ink); box-shadow: var(--d-shadow); padding: var(--d-p2); }

  /* ── E · AIRE — ni un borde en toda la celda, curva y espacio ───────── */
  :global([data-d='E']) .dv { --dv-h: 22px; --dv-lab: 124px; --dv-dot: 20px; }
  :global([data-d='E']) .dv-bar { background: transparent; box-shadow: none; padding: 0; }
  :global([data-d='E']) .dv-fld { background: var(--d-sunk); border-radius: var(--d-r-pill); padding-left: var(--d-p2); }
  :global([data-d='E']) .dv-sel { background: transparent; border-radius: var(--d-r-pill); }
  :global([data-d='E']) .dv-note { background: var(--d-sunk); border-radius: var(--d-r-pill); padding: var(--d-p1) var(--d-p2); }
  :global([data-d='E']) .dv-body { gap: var(--d-p3); }
  :global([data-d='E']) .pb-fill { border-radius: var(--d-r-pill); }
  :global([data-d='E']) .pb-zone { opacity: .6; }
  :global([data-d='E']) .pb-thr { width: 4px; background: var(--d-surface); opacity: 1; }
  :global([data-d='E']) .pb-thr--soft { display: none; }
  :global([data-d='E']) .ck-svg { width: 148px; height: 84px; }
  :global([data-d='E']) .ck-trk, :global([data-d='E']) .ck-arc { stroke-linecap: round; stroke-width: 12; }
  :global([data-d='E']) .tl { gap: var(--d-p1); }
  :global([data-d='E']) .tl-track { height: 16px; }
  :global([data-d='E']) .tl-elapsed { inset-block: 0; opacity: .22; border-radius: var(--d-r-pill); }
  :global([data-d='E']) .tl-now { inset-block: -4px; width: 6px; margin-left: -3px; border-radius: var(--d-r-pill); opacity: .16; }
  :global([data-d='E']) .tl-dot { box-shadow: none; background: var(--tone-band); }
  :global([data-d='E']) .sp-svg { height: 84px; }
  :global([data-d='E']) .sp-base, :global([data-d='E']) .sp-grid { display: none; }
  :global([data-d='E']) .sp-curve { stroke-width: 2.4; stroke-linecap: round; }
  :global([data-d='E']) .ds-bar { height: 20px; gap: 4px; background: transparent; overflow: visible; }
  :global([data-d='E']) .ds-seg { border-radius: var(--d-r-pill); }
  :global([data-d='E']) .ds-seg + .ds-seg { box-shadow: none; }
  :global([data-d='E']) .cal-strip { grid-template-columns: repeat(7, minmax(0, 1fr)); gap: var(--d-p1); }
  :global([data-d='E']) .cal-day { min-height: 56px; }
  :global([data-d='E']) .cal-day--hoy { box-shadow: none; background: var(--d-accent-soft); }
  :global([data-d='E']) .cal-detail { margin-top: var(--d-p3); }

  /* ── F · TERMINAL — todo carácter, el color como bloque tras el texto ─ */
  :global([data-d='F']) .dv { padding: var(--d-p2); gap: var(--d-p2); }
  :global([data-d='F']) .dv-bar { background: var(--d-sunk); border: 0; padding: var(--d-p1) var(--d-p2); }
  :global([data-d='F']) .dv-rail { text-transform: none; letter-spacing: 0; color: var(--d-accent); }
  :global([data-d='F']) .dv-rail::before { content: 'strix plan ▸ '; color: var(--d-ink-3); }
  :global([data-d='F']) .dv-body { gap: var(--d-p1); }
  :global([data-d='F']) .sp-mono { display: block; overflow-x: auto; }
  :global([data-d='F']) .ds-key li, :global([data-d='F']) .tl-key li, :global([data-d='F']) .cal-list li { font-size: var(--d-t-xs); }
  :global([data-d='F']) .cal-strip { gap: 0; }
  :global([data-d='F']) .cal-day {
    min-height: 26px; padding: 2px 0; gap: 0;
    border: 0; border-radius: 0; background: var(--d-sunk);
  }
  :global([data-d='F']) .cal-day[data-tone] { background: var(--tone-band); }
  :global([data-d='F']) .cal-day--wknd { background: var(--d-ground); }
  :global([data-d='F']) .cal-day--hoy { box-shadow: inset 0 0 0 1px var(--d-accent); }
  :global([data-d='F']) .cal-n { font-size: var(--d-t-xs); font-weight: var(--d-w); }
  :global([data-d='F']) .cal-detail { background: var(--d-sunk); padding: var(--d-p1) var(--d-p2); }

  /* ── G · BANDA — ninguna caja, a sangre, todo colgado del raíl ──────── */
  :global([data-d='G']) .dv { --dv-h: 8px; --dv-lab: var(--d-rail); --dv-lane: var(--d-rail); }
  :global([data-d='G']) .dv-bar { border: 0; border-bottom: 1px solid var(--d-line); border-radius: 0; box-shadow: none; }
  :global([data-d='G']) .dv-rail { width: var(--dv-lab); text-align: right; flex: none; }
  :global([data-d='G']) .dv-bleed { padding-inline: 0; }
  :global([data-d='G']) .pb {
    grid-template-columns: var(--dv-lab) minmax(0, 1fr);
    column-gap: var(--d-p3); align-items: center; padding-block: var(--d-p1);
  }
  :global([data-d='G']) .pb + .pb { border-top: 1px solid var(--d-line); }
  :global([data-d='G']) .pb::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg); }
  :global([data-d='G']) .pb-head { grid-column: 1; grid-row: 1 / span 2; flex-direction: column; align-items: flex-end; text-align: right; padding-left: var(--d-p3); }
  :global([data-d='G']) .pb-track { grid-column: 2; grid-row: 1; border-radius: 0; }
  :global([data-d='G']) .pb-foot { grid-column: 2; grid-row: 2; }
  :global([data-d='G']) .ck { padding: var(--d-p1) 0 var(--d-p2); }
  :global([data-d='G']) .ck + .ck { margin-top: 0; border-top: 1px solid var(--d-line); }
  :global([data-d='G']) .ck-title, :global([data-d='G']) .ck-say { padding-left: var(--d-p3); }
  :global([data-d='G']) .ck-lane { column-gap: var(--d-p3); padding-right: var(--d-p3); }
  :global([data-d='G']) .ck-lane-lab { text-align: right; }
  :global([data-d='G']) .ck-first { justify-self: end; }
  :global([data-d='G']) .tl { gap: 0; }
  :global([data-d='G']) .tl-axis, :global([data-d='G']) .tl-row { gap: var(--d-p3); }
  :global([data-d='G']) .tl-lab { text-align: right; justify-items: end; padding-left: var(--d-p3); }
  :global([data-d='G']) .tl-row { position: relative; border-top: 1px solid var(--d-line); padding-block: var(--d-p1); }
  :global([data-d='G']) .tl-row::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg); }
  :global([data-d='G']) .tl-track { border-radius: 0; }
  :global([data-d='G']) .tl-key, :global([data-d='G']) .ds-key, :global([data-d='G']) .sp-caps,
  :global([data-d='G']) .cal-detail, :global([data-d='G']) .dv-foot { padding-inline: var(--d-p3); }
  :global([data-d='G']) .ds-bar { border-radius: 0; }
  :global([data-d='G']) .cal-strip { gap: 0; }
  :global([data-d='G']) .cal-day { border: 0; border-left: 1px solid var(--d-line); border-radius: 0; }
  :global([data-d='G']) .cal-day:first-child { border-left: 0; }
  :global([data-d='G']) .cal-day[data-tone] { background: transparent; box-shadow: inset 3px 0 0 var(--tone-fg); }
  :global([data-d='G']) .cal-day--hoy { box-shadow: inset 3px 0 0 var(--tone-fg, var(--d-ink)), inset 0 -2px 0 var(--d-ink); }

  /* ── H · FICHA — manila, doble regla, canto apilado ─────────────────── */
  :global([data-d='H']) .dv { --dv-h: 12px; }
  :global([data-d='H']) .dv-bar { background: var(--d-sunk); border-color: var(--d-edge); box-shadow: 0 1px 0 var(--d-edge); }
  :global([data-d='H']) .pb-track, :global([data-d='H']) .tl-track, :global([data-d='H']) .ck-trklane,
  :global([data-d='H']) .ds-bar {
    border-radius: var(--d-r); border: 1px solid var(--d-edge); background: var(--d-sunk);
  }
  :global([data-d='H']) .pb + .pb, :global([data-d='H']) .ck + .ck {
    margin-top: var(--d-p2); padding-top: var(--d-p2);
    border-top: 1px solid var(--d-line);
    box-shadow: inset 0 2px 0 -1px var(--d-surface), inset 0 3px 0 -1px var(--d-line);
  }
  :global([data-d='H']) .tl-key, :global([data-d='H']) .ds-key {
    margin-top: var(--d-p2); padding-top: var(--d-p2);
    border-top: 1px solid var(--d-line);
    box-shadow: inset 0 2px 0 -1px var(--d-surface), inset 0 3px 0 -1px var(--d-line);
  }
  :global([data-d='H']) .sp-svg { border: 1px solid var(--d-edge); border-radius: var(--d-r); }
  :global([data-d='H']) .cal-day--hoy { box-shadow: inset 0 0 0 1px var(--d-accent); }
  :global([data-d='H']) .cal-detail { background: var(--d-sunk); border: 1px solid var(--d-edge); border-radius: var(--d-r); padding: var(--d-p2); }

  /* ══════════════════════════════════════════════════════════════════════
     ESTRECHO — manda el ancho de la CELDA, no el de la ventana. Por eso
     container queries: dos celdas de 400px en un monitor de 1600 también
     son estrechas, y una media query no se entera.
     ══════════════════════════════════════════════════════════════════════ */
  @container (max-width: 430px) {
    .tl, .pb, .dv-bar { --dv-lab: 88px; }
    .cal-strip { grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .ds-note { display: none; }
    .ck-svg { width: 104px; height: 60px; }
  }
  @container (max-width: 330px) {
    .tl, .pb { --dv-lab: 0px; }
    .tl-axis, .tl-row { grid-template-columns: minmax(0, 1fr); gap: 2px; }
    .tl-axis .tl-lab { display: none; }
    .tl-lab { text-align: left; justify-items: start; }
    .ck-dial { justify-content: center; }
    .ck-lanes { --dv-lane: 84px; }
    /* G pierde el raíl pero no la sangre: las barras siguen tocando los dos
       cantos y el texto se mete hacia adentro, para no pegarse a la franja
       de tono que lleva el estado en el canto izquierdo. */
    :global([data-d='G']) .pb, :global([data-d='G']) .tl-row, :global([data-d='G']) .tl-axis,
    :global([data-d='G']) .ck-lane { padding-left: var(--d-p3); }
    :global([data-d='G']) .tl-lab, :global([data-d='G']) .pb-head { padding-left: 0; }
    :global([data-d='G']) .dv-rail { width: auto; }
    :global([data-d='G']) .pb { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='G']) .pb-head { grid-row: auto; align-items: flex-start; text-align: left; }
    :global([data-d='G']) .pb-track, :global([data-d='G']) .pb-foot { grid-column: 1; grid-row: auto; }
    :global([data-d='G']) .tl-lab { text-align: left; justify-items: start; }
  }
</style>
