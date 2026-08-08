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

  /* ── Qué familia de dibujo le toca a cada dirección ──────────────────────
     Tres reparticiones, y ninguna es de paleta: cambian el DIBUJO.
       · celdas de carácter, F y R. R es Terminal + Cristal: su densidad
         (fila de 26px, monoespaciada) sale de la misma rejilla de caracteres
         que F, solo que apoyada sobre vidrio oscuro.
       · dial de dos arcos, A, C, E, H, K y T. K entra porque dos arcos que
         irradian sobre negro es exactamente lo que Halo tiene para decir de
         un medidor; en carriles rectos ese resplandor se pierde. T entra por
         la misma razón y del otro lado de la luz: es Halo sobre papel, y si
         su tesis es que una cosa existe porque irradia, el medidor es donde
         esa tesis se puede probar. Es además lo que la separa de S, que con
         el mismo material claro se queda en carriles.
       · barras macizas en el minigráfico, D y Q. Q es Peso + Laca: la misma
         columna sólida, con el barrido húmedo encima. */
  const isMono = (id) => id === 'F' || id === 'R';
  const isDial = (id) =>
    id === 'A' || id === 'C' || id === 'E' || id === 'H' || id === 'K' || id === 'T';
  /* X entra en las barras macizas por una razón de dato y no de material: doce
     totales semanales son doce medidas discretas, no una serie continua. La
     curva dibuja horas entre semana y semana que nadie trabajó, y encima
     esconde la semana en cero dentro de una diagonal. Una columna por semana
     dice exactamente lo que se midió, y la semana en cero se reconoce porque
     no hay columna. */
  const isBarChart = (id) => id === 'D' || id === 'Q' || id === 'X';

  /* ── Eje de días ─────────────────────────────────────────────────────── */
  const BACK = 20; // días de historia siempre visibles a la izquierda
  const TICKS = { 30: [-20, 0, 15, 30], 60: [-20, 0, 15, 30, 60], 90: [-20, 0, 15, 45, 90] };
  const px = (day, fwd) => Math.max(0, Math.min(100, ((day + BACK) / (BACK + fwd)) * 100));
  const shift = (t, fwd) => (t <= -BACK ? '0%' : t >= fwd ? '-100%' : '-50%');
  const tickLab = (t) => (t === 0 ? 'hoy' : t > 0 ? '+' + t + ' d' : t + ' d');

  /* El tramo pintado de una fila iba del borde izquierdo del eje hasta el
     vencimiento, y eso se leía AL REVÉS: el plan que vence en 47 días pintaba
     una barra larguísima y el que venció hace 12 pintaba una corta, o sea que
     el que menos urge parecía el más lleno. Medido contra hoy, el largo ES la
     distancia y el lado dice si falta o si ya pasó, que es lo que un técnico
     necesita leer sin contar marcas. */
  const spanL = (day, fwd) => Math.min(px(0, fwd), px(day, fwd));
  const spanW = (day, fwd) => Math.abs(px(day, fwd) - px(0, fwd));

  // Días hasta el vencimiento, leídos del "when" de cada plan de demo.js.
  const DAY = { 'BAT-014': -12, HRN001: 5, 'CAM-03': 47, 'MEZ-021': -3, 'GEN-02': 9, 'COM-07': null };
  const TL = PLANS.map((p) => ({ ...p, day: DAY[p.asset] }));
  const TL_LATE = TL.filter((p) => p.tone === 'critical').length;

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
      tone: 'positive', read: 'lectura 7 210 km, 4 ago', when: 'en 47 d' },
    { asset: 'HRN001', task: 'Revisión de quemador', every: 'cada 2 000 h', at: 88,
      tone: 'attention', read: 'sin lectura, 14 h/día declaradas', when: 'en 5 d' },
    { asset: 'BAT-014', task: 'Cambio de aceite', every: 'cada 250 h', at: 118,
      tone: 'critical', read: 'lectura 312 h, 2 ago', when: 'venció hace 12 d' }
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
    /* Los dos veredictos abren con el mismo verbo a propósito: el técnico
       aprende una sola frase y la reconoce en las seis celdas. */
    {
      asset: 'MEZ-021', name: 'Mezcladora Baumax BM-160', task: 'Engrase general',
      every: 'cada 90 d', first: 'calendario',
      cal: { key: 'cal', label: 'Calendario', at: 104, tone: 'critical', left: 'venció hace 3 d · último 18 jul' },
      use: { key: 'uso', label: 'Uso', at: 0, tone: 'neutral', left: 'sin horómetro: este plan no corre por uso' },
      verdict: 'Llegó primero el calendario · venció hace 3 d y el reloj de uso no corre'
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

  /* ── 6 · Próximos 14 días ──────────────────────────────────────────────
     Cada vencimiento es equipo, tarea y plazo en campos separados, no una
     tira de texto con puntos en el medio: así el equipo va en monoespaciada,
     el plazo se alinea a la derecha y el ojo baja por una columna en vez de
     leer tres frases. */
  const CAL = [
    { n: 6, dow: 'ju', full: 'jueves 6 de agosto', hoy: true, tone: 'critical', count: 2,
      items: [
        { t: 'critical', id: 'BAT-014', task: 'Cambio de aceite', when: 'venció hace 12 d' },
        { t: 'critical', id: 'MEZ-021', task: 'Engrase general', when: 'venció hace 3 d' }
      ], note: 'arrastrados de semanas anteriores' },
    { n: 7, dow: 'vi', full: 'viernes 7 de agosto', items: [] },
    { n: 8, dow: 'sá', full: 'sábado 8 de agosto', wknd: true, items: [] },
    { n: 9, dow: 'do', full: 'domingo 9 de agosto', wknd: true, items: [] },
    { n: 10, dow: 'lu', full: 'lunes 10 de agosto', items: [] },
    { n: 11, dow: 'ma', full: 'martes 11 de agosto', tone: 'attention', count: 1,
      items: [{ t: 'attention', id: 'HRN001', task: 'Revisión de quemador', when: 'en 5 d' }] },
    { n: 12, dow: 'mi', full: 'miércoles 12 de agosto', items: [] },
    { n: 13, dow: 'ju', full: 'jueves 13 de agosto', items: [] },
    { n: 14, dow: 'vi', full: 'viernes 14 de agosto', items: [] },
    { n: 15, dow: 'sá', full: 'sábado 15 de agosto', wknd: true, tone: 'attention', count: 1,
      items: [{ t: 'attention', id: 'GEN-02', task: 'Cambio de refrigerante', when: 'en 9 d' }],
      note: 'cae sábado' },
    { n: 16, dow: 'do', full: 'domingo 16 de agosto', wknd: true, items: [] },
    { n: 17, dow: 'lu', full: 'lunes 17 de agosto', items: [] },
    { n: 18, dow: 'ma', full: 'martes 18 de agosto', items: [] },
    { n: 19, dow: 'mi', full: 'miércoles 19 de agosto', items: [] }
  ];
  const CAL_HITS = CAL.reduce((s, c) => s + (c.count ?? 0), 0);
  const calLab = (c) =>
    c.full + (c.hoy ? ', hoy' : '') + ', ' +
    (c.count ? c.count + (c.count === 1 ? ' vencimiento' : ' vencimientos') : 'sin vencimientos');

  /* ── X · COTA · las cifras ────────────────────────────────────────────────
     Cota lee la MEDIDA contra su tope y no el porcentaje. «118 %» obliga a
     reconstruir de qué; «312 h con la marca de 250 h atrás» ya dijo que se
     pasó 62 h y nadie restó. Por eso los dos primeros paneles se rearman acá
     con las tres cifras que el papel de bodega ya tiene: la lectura, la
     unidad y el «cada N» del plan, que ES el tope.

     EL RECORRIDO SE CALCULA DE ESAS DOS CIFRAS y no se escribe a mano, así el
     dibujo y los dos números impresos no pueden discrepar. Es la única razón
     por la que 312 h contra 250 h da 125 y no el 118 que trae la ficha: 312
     menos 250 son 62 h, o sea un 25 % de sobrepaso, y el relleno tiene que
     pasarse ese 25 % y no otro.

     Las tres cifras derivadas son restas de las que ya están: 10 000 menos
     7 210, 2 000 menos 1 840, 250 menos 312. La única reconstruida es el tope
     del reloj de calendario de GEN-02, que la ficha no nombra: con 64 % del
     intervalo recorrido y 131 d por delante, el único tope compatible es el
     año, 365 d, y quedan 234 d corridos. */
  const xat = (leido, tope) => Math.round((leido / tope) * 100);

  const XPLAN = [
    { asset: 'CAM-03', task: 'Servicio 10 000 km', tone: 'positive',
      fig: '7 210', unit: 'km', at: xat(7210, 10000),
      note: 'tope 10 000 km · faltan 2 790 km',
      due: 'en 47 d', src: 'lectura manual del 4 ago' },
    { asset: 'HRN001', task: 'Revisión de quemador', tone: 'attention',
      fig: '1 840', unit: 'h', at: xat(1840, 2000),
      note: 'tope 2 000 h · faltan 160 h',
      due: 'en 5 d', src: 'sin lectura de horómetro; 14 h por día declaradas' },
    { asset: 'BAT-014', task: 'Cambio de aceite', tone: 'critical',
      fig: '312', unit: 'h', at: xat(312, 250),
      note: 'tope 250 h · se pasó 62 h',
      due: 'venció hace 12 d', src: 'lectura del 2 ago, tomada en la devolución' }
  ];

  /* Los dos relojes de cada máquina, cada uno contra SU tope. Van en el mismo
     orden que la ficha (calendario y después uso) para que la columna del tope
     se lea de arriba abajo y el que llega primero sea el riel más largo.
     MEZ-021 por uso no lleva cota: no hay lectura, y una cota sin medida sería
     un riel vacío diciendo cero, que es exactamente lo contrario de lo que
     pasa. Se dice con palabras. */
  const XCLK = {
    'GEN-02': [
      { label: 'Calendario', tone: 'positive', at: xat(234, 365),
        fig: '234', unit: 'd', note: 'tope 365 d · faltan 131 d' },
      { label: 'Uso', tone: 'attention', at: xat(2430, 3000),
        fig: '2 430', unit: 'h', note: 'tope 3 000 h · faltan 570 h' }
    ],
    'MEZ-021': [
      { label: 'Calendario', tone: 'critical', at: xat(93, 90),
        fig: '93', unit: 'd', note: 'tope 90 d · se pasó 3 d' },
      { label: 'Uso', tone: 'neutral', at: null,
        none: 'Sin horómetro: este plan no corre por uso.' }
    ]
  };
</script>

<Grid min="440px">
  {#each directions as d (d.id)}
    <!-- P va a sangre como G: su silueta es una columna de marca de la que
         cuelgan franjas de borde a borde, y con 20px de aire alrededor deja de
         ser una espina y vuelve a ser una tarjeta. -->
    <Direction id={d.id} flush={d.id === 'G' || d.id === 'F' || d.id === 'P'}>
      <div class="dv">

        <!-- ══ Barra de vista ══
             El ÚNICO epígrafe de la página: «Ventana» nombra el grupo de
             controles y es además el gancho del que cuelgan el raíl de G y P
             y el prompt de F y R. Los otros nueve se fueron: una versalita
             sobre cada encabezado producía seis veces el mismo compás y no
             contestaba ninguna pregunta que el dibujo de abajo no contestara.
             El botón conserva una sola etiqueta, «Zonas», porque cambiarle el
             texto Y el aria-pressed a la vez lo anuncia dos veces y al revés;
             el estado lo dice la marca, que es el mismo par de formas que el
             resto de la página ya enseñó. -->
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
            >Zonas
          </button>
          <span class="dv-note d-num">Corte 6 ago · 09:12</span>
        </div>

        <!-- ══ 1 · Progreso con umbral ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Consumo del plan</h4>
          </header>
          <div class="d-panel-body dv-body dv-stack dv-bleed">
            <!-- X · el panel donde la firma del sistema hace su trabajo. Tres
                 planes, tres medidas, tres topes, y las tres marcas de tope
                 caen en la MISMA columna porque el riel de .d-cota normaliza:
                 leyendo para abajo, «cuál se pasó» es una sola mirada y no una
                 resta. Por eso el orden ascendente se queda: los rieles arman
                 una escalera y el último cruza la marca. -->
            {#if d.id === 'X'}
              <div class="xp-list">
                <p class="xt" aria-hidden="true"><span class="xt-lab">tope</span></p>
                {#each XPLAN as g}
                  <div class="xp">
                    <div class="xp-head">
                      <span class="xp-name"><b class="d-id">{g.asset}</b> {g.task}</span>
                      <!-- Plazo y estado viajan juntos: son la misma respuesta
                           partida en cuánto y en qué, y si se separan al
                           envolverse quedan uno a cada lado de la fila. -->
                      <span class="xp-flag">
                        <span class="xp-due">{g.due}</span>
                        <span class="d-pill" data-tone={g.tone}
                          ><svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                            >{@html markOf(g.tone)}</svg
                          >{WORD[g.tone]}</span
                        >
                      </span>
                    </div>
                    <div class="d-cota" data-tone={g.tone} style="--cota:{g.at}">
                      <div class="d-cota-fig"><b>{g.fig}</b> <span>{g.unit}</span></div>
                      <div class="d-cota-rail"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                      <div class="d-cota-note">{g.note}</div>
                    </div>
                    <p class="xp-src">{g.src}</p>
                  </div>
                {/each}
              </div>
              <p class="dv-foot">El riel llega al 150 % del tope, así que un sobrepaso tiene dónde dibujarse.</p>
            {:else if isMono(d.id)}
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
                    <span class="pb-thr-lab d-num" style="left:{pp(100)}%">100</span>
                  </div>
                  <!-- Estado y magnitud son dos cosas: la píldora dice QUÉ es
                       y el plazo dice CUÁNTO. Juntos y en ese orden contestan
                       la pregunta de los tres segundos; la procedencia de la
                       lectura baja a la línea terciaria. -->
                  <div class="pb-foot">
                    <span class="d-pill" data-tone={g.tone}
                      ><svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                        >{@html markOf(g.tone)}</svg
                      >{WORD[g.tone]}</span
                    >
                    <span class="pb-when">{g.when}</span>
                    <span class="pb-note">{g.every} · {g.read}</span>
                  </div>
                </div>
              {/each}
              <p class="dv-foot">Avisa en 85 %, vence en 100 %, el eje corre hasta 130 %.</p>
            {/if}
          </div>
        </section>

        <!-- ══ 2 · Dos relojes ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Dos relojes</h4>
          </header>
          <div class="d-panel-body dv-body dv-stack dv-bleed">
            {#each CLOCKS as c}
              <div class="ck">
                <p class="ck-title">
                  <b class="d-id">{c.asset}</b> {c.name}
                  <span class="ck-task">{c.task} · {c.every}</span>
                </p>

                <!-- X · dos cotas, una sobre la otra, con la marca del tope en
                     la misma columna. Con eso «cuál llega primero» deja de ser
                     una comparación de dos porcentajes y pasa a ser cuál de los
                     dos rieles está más cerca de la línea. El reloj sin lectura
                     no dibuja riel: dice por qué no lo hay. -->
                {#if d.id === 'X'}
                  <div class="xk">
                    <p class="xt" aria-hidden="true"><span class="xt-lab">tope</span></p>
                    {#each XCLK[c.asset] as k}
                      <span class="xk-lab">{k.label}</span>
                      {#if k.at === null}
                        <p class="xk-none" data-tone={k.tone}>
                          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
                            >{@html markOf(k.tone)}</svg
                          >{k.none}
                        </p>
                      {:else}
                        <div class="d-cota" data-tone={k.tone} style="--cota:{k.at}">
                          <div class="d-cota-fig"><b>{k.fig}</b> <span>{k.unit}</span></div>
                          <div class="d-cota-rail"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                          <div class="d-cota-note">{k.note}</div>
                        </div>
                      {/if}
                    {/each}
                  </div>
                {:else if isMono(d.id)}
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
                {:else if isDial(d.id)}
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
                        <span class="ck-lane-lab">{k.label}</span>
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
            <span class="dv-fig d-num">{TL_LATE} vencidos de {TL.length}</span>
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            {#if isMono(d.id)}
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
                          <span
                            class="tl-elapsed"
                            style="left:{spanL(p.day, scale)}%;width:{spanW(p.day, scale)}%"
                          ></span>
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
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            <p class="d-sr">
              Horas por semana de la Batidora Imer Syntesi 250, de la semana del 17 de mayo a la del 2 de agosto:
              {SPARK.join(', ')} horas.
            </p>
            {#if isMono(d.id)}
              <div class="sp-mono" aria-hidden="true">
                {#each SPARK as v}
                  <span class="sp-ch" class:sp-ch--zero={v === 0} class:sp-ch--top={v === SP_TOP}>{block(v)}</span>
                {/each}
              </div>
            {:else if isBarChart(d.id)}
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
              <span class="sp-mid">{SP_TOTAL} h en 12 semanas · pico {SP_TOP} h, una en cero</span>
              <span>2 ago</span>
            </p>
          </div>
        </section>

        <!-- ══ 5 · Distribución de la flota ══ -->
        <section class="d-panel">
          <header class="d-panel-head">
            <h4 class="d-panel-title">Flota por estado</h4>
            <span class="dv-fig d-num">{FLEET_N} equipos</span>
          </header>
          <div class="d-panel-body dv-body dv-bleed">
            {#if isMono(d.id)}
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
            <span class="dv-fig d-num">{CAL_HITS} vencimientos</span>
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
                    <!-- Un día sin vencimiento se queda VACÍO. El punto gris
                         que había acá reservaba el alto, sí, pero también
                         ponía once manchitas compitiendo con las tres marcas
                         que sí quieren decir algo. El hueco reserva igual. -->
                    <span class="cal-mk cal-mk--void" aria-hidden="true"></span>
                  {/if}
                </button>
              {/each}
            </div>
            <div class="cal-detail">
              <p class="cal-day-name">
                <b>{CAL[pick].full}</b>{#if CAL[pick].hoy}, hoy{/if}{#if CAL[pick].note} · {CAL[pick].note}{/if}
              </p>
              {#if CAL[pick].items.length}
                <ul class="cal-list">
                  {#each CAL[pick].items as it}
                    <li data-tone={it.t}>
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(it.t)}</svg>
                      <b class="cal-id d-id">{it.id}</b>
                      <span class="cal-task">{it.task}</span>
                      <span class="cal-when">{it.when}</span>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="cal-none">
                  Sin vencimientos.{CAL[pick].wknd ? ' Fin de semana: la cuadrilla no entra.' : ''}
                </p>
              {/if}
            </div>
            <p class="dv-foot">Después del 19 de agosto: CAM-03, Servicio 10 000 km, el 22 de setiembre.</p>
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

  /* Una CIFRA en la cabecera, no una versalita. La versalita chiquita sobre
     cada encabezado repetía el mismo compás seis veces y no contestaba nada
     que el dibujo de abajo no contestara. Solo la llevan los tres paneles
     cuya respuesta ES un conteo: cuántos vencidos, cuántos equipos, cuántos
     vencimientos. Los otros tres se leen fila por fila y no tienen un número
     que resuma, así que su cabecera va sola. */
  .dv-fig {
    font-size: var(--d-t-2xs); font-weight: var(--d-w-med);
    color: var(--d-ink-2); font-variant-numeric: var(--d-num);
    white-space: nowrap;
  }

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
  /* La hora del corte es un dato, no una etiqueta: en versalitas de 10px con
     .11em de tracking, «09:12» se lee peor que en cifra tabular. */
  .dv-note {
    margin-left: auto; white-space: nowrap;
    font-size: var(--d-t-2xs); color: var(--d-ink-3);
    font-variant-numeric: var(--d-num);
  }
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
  .pb-thr-lab {
    position: absolute; bottom: 100%; margin-left: 3px; display: none;
    font-size: var(--d-t-2xs); color: var(--d-ink-3);
    font-variant-numeric: var(--d-num);
  }
  .pb-foot { display: flex; align-items: center; gap: var(--d-p1) var(--d-p2); flex-wrap: wrap; }
  /* El plazo va en segunda posición y en tinta de lectura: la píldora dice el
     estado, esto dice cuánto. Es la respuesta de los tres segundos. */
  .pb-when { font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-2); white-space: nowrap; }
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
  /* «Calendario» y «Uso» son los nombres de los dos carriles, o sea lo que hay
     que reconocer de un vistazo. En versalitas de 10px tracked eran lo más
     lento de leer del panel; en caja normal y peso medio se reconocen sin
     deletrear. */
  .ck-lane-lab {
    grid-column: 1; grid-row: 1; min-width: 0; overflow-wrap: anywhere;
    font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-2);
  }
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
  /* El tramo va de HOY al vencimiento, no del borde del eje al vencimiento.
     Antes el plan de +47 d pintaba la barra más larga y el vencido hace 12
     la más corta: al lado de tres barras donde «más lleno» significa «más
     urgente», eso enseñaba lo contrario. Ahora el largo es la distancia y el
     lado dice si falta o si ya pasó. Las direcciones que lo repintan siguen
     mandando: solo cambió de dónde a dónde va. */
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

  /* LA ÚNICA ANIMACIÓN DE LA PÁGINA, y la frase que la justifica: cuando
     cambiás el eje de 30 a 90 días, los seis vencimientos se reacomodan sobre
     la misma pista, y si saltan de golpe hay que volver a buscar cuál era
     cuál. Deslizándose, el ojo sigue el punto rojo hasta su nueva posición y
     entiende que es la misma lista vista más lejos. Nada más se mueve: ni los
     paneles al entrar, ni las barras al cargar, ni una sola pulsación. */
  @media (prefers-reduced-motion: no-preference) {
    .tl-tick, .tl-zone, .tl-elapsed, .tl-now, .tl-dot {
      transition: left 240ms cubic-bezier(.22, .68, .28, 1),
                  width 240ms cubic-bezier(.22, .68, .28, 1);
    }
  }

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
  /* Reserva de alto, sin glifo: ver el comentario del marcado. */
  .cal-mk--void { height: 10px; }
  .cal-detail { margin-top: var(--d-p2); min-width: 0; }
  .cal-day-name { margin: 0 0 3px; font-size: var(--d-t-sm); color: var(--d-ink-3); }
  .cal-day-name b { color: var(--d-ink); font-weight: var(--d-w-semi); }
  .cal-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; }
  /* Tres columnas, no una frase: equipo, tarea y plazo. El plazo se ancla a
     la derecha para que dos vencimientos del mismo día se comparen bajando
     por una columna. Bajo 330px la fila se desarma y el plazo pasa abajo. */
  .cal-list li {
    display: grid; grid-template-columns: 9px auto minmax(0, 1fr) auto;
    align-items: baseline; gap: var(--d-p1);
    font-size: var(--d-t-xs); color: var(--tone-fg); min-width: 0;
  }
  .cal-list .mk { align-self: center; }
  /* El código es identidad, no estado: va en tinta. El tono se lo quedan la
     marca y el plazo, que son las dos piezas que sí dicen cómo está. */
  .cal-id { font-weight: var(--d-w-semi); color: var(--d-ink); }
  .cal-task { color: var(--d-ink-2); min-width: 0; overflow-wrap: anywhere; }
  .cal-when { font-size: var(--d-t-2xs); white-space: nowrap; }
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
  /* Las celdas vacías son el CARRIL de la barra, no decoración: sin ellas no
     se ve cuánto falta. Estaban en --d-line, que es un token de hairline y no
     de tinta: sobre el fondo de F daba 1.32:1 — la mitad de la barra
     desaparecía. --d-ink-3 la deja en 4.65:1 y el relleno sigue distinguiéndose
     porque es █ en color de tono contra · en gris. */
  .mc--off { color: var(--d-ink-3); }
  .mc--thr { color: var(--d-accent); }
  .mnote { margin: 0 0 var(--d-p1) 7ch; font-size: var(--d-t-2xs); color: var(--d-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mnote--legend { margin-left: 0; }

  /* ══════════════════════════════════════════════════════════════════════
     LAS OCHO DIRECCIONES.
     [data-d] vive en Direction.svelte: sin :global() no cruza la frontera y
     la variación se pierde en silencio.
     ══════════════════════════════════════════════════════════════════════ */

  /* ── A · ELEVACIÓN — todo flota, nada se toca ─────────────────────────
     La incumbente entra a esta ronda con una defensa de verdad, no con tres
     sombras. Dos decisiones la definen acá:

     1. NADA DE TARJETAS DENTRO DE TARJETAS. Es la tentación obvia de esta
        dirección (poner cada plan en su propia tarjetita flotante) y es
        exactamente lo que la rompe: dos niveles de sombra y ya no se sabe
        cuál es el contenedor. Cuando un grupo necesita contenerse, A lo
        HUNDE en vez de levantarlo: el surco de una barra, el pozo del
        detalle del día. Levantado hay uno solo por celda, el panel.
     2. LO QUE SEPARA ES AIRE. Ninguna línea entre planes, entre filas de la
        línea de tiempo ni bajo las leyendas: solo espacio, que es lo que la
        silueta de esta dirección promete.

     Y una escala de radio sola: 7px en las piezas chicas, 11px en las que
     contienen. Los surcos de barra estaban en pastilla, que es otra escala;
     ahora comparten los 7px con los días y con los botones. */
  :global([data-d='A']) .dv { --dv-lab: 112px; }
  :global([data-d='A']) .dv-bar { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .dv-body { gap: var(--d-p3); }
  :global([data-d='A']) .dv-stack { gap: var(--d-p3); }
  :global([data-d='A']) .pb-track, :global([data-d='A']) .ck-trklane,
  :global([data-d='A']) .tl-track, :global([data-d='A']) .ds-bar { border-radius: var(--d-r); }
  /* El surco hundido es el «contenedor» de A que no agrega una tarjeta. */
  :global([data-d='A']) .pb-track, :global([data-d='A']) .ck-trklane, :global([data-d='A']) .tl-track {
    box-shadow: inset 0 1px 2px color-mix(in srgb, var(--d-ink) 10%, transparent);
  }
  :global([data-d='A']) .tl { gap: var(--d-p1); }
  :global([data-d='A']) .tl-row { padding-block: var(--d-p1); }
  /* El tramo hasta hoy es un carril fino: informa la distancia sin competir
     con la marca de vencimiento, que es lo que hay que encontrar. */
  :global([data-d='A']) .tl-elapsed { inset-block: 40%; opacity: .42; border-radius: var(--d-r-pill); }
  :global([data-d='A']) .tl-key, :global([data-d='A']) .ds-key { margin-top: var(--d-p2); }
  :global([data-d='A']) .cal-strip { gap: 3px; }
  :global([data-d='A']) .cal-day { box-shadow: var(--d-shadow); }
  /* Al presionar, la tarjeta baja a tocar la superficie. Es el único gesto de
     A y es respuesta a una acción, no adorno. */
  :global([data-d='A']) .cal-day:active { transform: translateY(1px); box-shadow: none; }
  :global([data-d='A']) .cal-day--hoy { box-shadow: var(--d-shadow), inset 0 0 0 1px var(--d-ink); }
  /* Hundido sigue siendo hoy: el anillo no se va con la pulsación. */
  :global([data-d='A']) .cal-day--hoy:active { box-shadow: inset 0 0 0 1px var(--d-ink); }
  :global([data-d='A']) .cal-detail { padding: var(--d-p2) var(--d-p3); background: var(--d-sunk); border-radius: var(--d-r-lg); }
  :global([data-d='A']) .ds-bar { box-shadow: var(--d-shadow); }
  :global([data-d='A']) .sp-svg { border-radius: var(--d-r); }
  :global([data-d='A']) .tl-dot { box-shadow: 0 0 0 1px var(--tone-fg), var(--d-shadow); }

  
  /* Marca de eje: un pie de 5px que baja de cada etiqueta hasta la pista.
     El pie NO va siempre al centro: la etiqueta se corre con translateX para
     no salirse del gráfico, así que el punto de dato queda en su borde
     izquierdo en el primer tramo, en el derecho en el último y en el centro
     en los del medio. Poner los tres al 50 % desplazaría las marcas de los
     extremos media etiqueta, que en un eje de 80px es media semana. */
  /* La leyenda como lectura tabulada: nombre, conteo, porcentaje, nota. */

  /* ── C · MARCA — el teal es la estructura, no el adorno ───────────────
     La cabecera llena de color ya la da el contrato. Lo que faltaba acá
     adentro: el teal no hacía NADA en el cuerpo, así que un panel de C era un
     panel de A con sombrero. La regla que lo arregla es una sola y se puede
     decir en una frase: EL COLOR DE MARCA ES LA REFERENCIA CONTRA LA QUE SE
     MIDE TODO. El 100 % del plan, la línea de hoy, el fin del carril, el eje
     de días. Nada de eso es un estado (los estados ya tienen sus cuatro
     tonos): son el cero del instrumento, y en esta dirección el cero es la
     marca. Un cliente rebindea --d-brand y se le mueve la referencia entera.

     Y una segunda: si la cabecera se anuncia rellenándose de color, el día
     elegido de la tira también. Elegido = relleno, en toda la dirección. */
  :global([data-d='C']) .dv { --dv-h: 12px; }
  :global([data-d='C']) .dv-bar { background: var(--d-brand); border-color: var(--d-brand); }
  /* Sobre la cabecera teal, TODO lo secundario pasa a tinta clara. La cifra y
     la hora de corte perdieron su .d-cap en esta ronda, así que si no se
     nombran acá quedan en --d-ink-3 sobre el teal: 1.52:1, ilegible. Es la
     misma falla de contraste que este proyecto ya arregló tres veces. */
  :global([data-d='C']) .dv-bar .d-cap,
  :global([data-d='C']) .dv-bar .dv-note,
  :global([data-d='C']) .dv-bar .dv-fld-lab { color: var(--d-brand-ink); }
  :global([data-d='C']) .d-panel-head .dv-fig { color: inherit; }
  :global([data-d='C']) .dv-sel { border-color: transparent; }
  :global([data-d='C']) .pb-name b, :global([data-d='C']) .tl-lab b,
  :global([data-d='C']) .ck-title b, :global([data-d='C']) .cal-day-name b,
  :global([data-d='C']) .cal-id { color: var(--d-brand); }
  /* La referencia, en marca: umbral de 100 %, fin del carril, línea de hoy. */
  :global([data-d='C']) .pb-thr, :global([data-d='C']) .ck-fin, :global([data-d='C']) .tl-now {
    background: var(--d-brand); opacity: 1; width: 2px;
  }
  :global([data-d='C']) .pb-thr--soft { background: var(--d-ink-3); opacity: .3; width: 1px; }
  :global([data-d='C']) .tl-axis { background: var(--d-accent-soft); border-radius: var(--d-r); padding: 2px 0; }
  :global([data-d='C']) .tl-tick { color: var(--d-brand); font-weight: var(--d-w-med); }
  :global([data-d='C']) .tl-elapsed { inset-block: 38%; opacity: .45; }
  :global([data-d='C']) .tl-key, :global([data-d='C']) .ds-key { padding-top: var(--d-p1); border-top: 1px solid var(--d-line); }
  :global([data-d='C']) .cal-day--hoy { box-shadow: inset 0 0 0 2px var(--d-brand); }
  /* Elegido = relleno de marca, igual que la cabecera. El tono del día no se
     pierde: lo sigue llevando la FORMA de la marca de demo.js (cuadrado =
     vencido, triángulo = por vencer), que es lo único que no depende del
     color. Pintar el conteo en --tone-fg sobre teal daría 1.6:1. */
  :global([data-d='C']) .cal-day--on { background: var(--d-brand); }
  :global([data-d='C']) .cal-day--on .cal-dow, :global([data-d='C']) .cal-day--on .cal-n,
  :global([data-d='C']) .cal-day--on .cal-mk { color: var(--d-brand-ink); }
  :global([data-d='C']) .cal-day--on::after { display: none; }
  /* Hoy Y elegido a la vez es el estado de arranque, así que tiene que
     resolverse bien: el anillo de hoy pasa a tinta clara para verse contra el
     relleno de marca en vez de perderse en un teal apenas más oscuro. */
  :global([data-d='C']) .cal-day--on.cal-day--hoy { box-shadow: inset 0 0 0 2px var(--d-brand-ink); }
  :global([data-d='C']) .sp-mid { color: var(--d-brand); }

  

  /* ── E · AIRE — ni un borde en toda la celda, curva y espacio ───────── */

  /* ── F · TERMINAL — todo carácter, el color como bloque tras el texto ─ */

  

  /* ── H · FICHA — manila, doble regla, canto apilado ─────────────────── */

  /* ══════════════════════════════════════════════════════════════════════
     LAS ONCE NUEVAS — I J K L M N O P Q R S.

     Mismo contrato que arriba: :global() para cruzar la frontera de
     Direction.svelte, y ni un color, radio, sombra o medida que un token
     pueda dar. Donde el material de una dirección pide algo que su bloque de
     tokens no nombra, queda escrito como HALLAZGO y se declara en el espacio
     --dv-*, que es el que esta página ya usa para lo que el contrato no cubre.

     Traducciones que valen para toda la familia «datos y tiempo»:
       barra    K luz que se derrama · M mancha sin filo · N cinta de puntas
                redondas · Q bloque macizo con brillo · S barra blanca cuya
                sombra lleva el tono · R caracteres de bloque
       umbral   I filo de luz · J bisel de esmalte · M smudge radial ·
                P muesca en la espina · Q regla de 2px de tinta
     ══════════════════════════════════════════════════════════════════════ */

  /* ── I · CRISTAL — una sola capa de vidrio, nunca dos ─────────────────
     HALLAZGO: el contrato no tiene token de desenfoque. directions.css
     escribe blur(18px)/blur(20px)/blur(16px) a mano en I, O y R, así que acá
     se declara --dv-blur con el valor de cada una: el día que exista --d-blur
     estas tres líneas se borran solas.
     LA TRAMPA: .d-panel YA desenfoca. Todo lo que vive DENTRO de un panel
     —surcos de barra, tiras de día, la ficha del detalle— se anida con
     TRANSPARENCIA y jamás con un segundo backdrop-filter: dos vidrios
     seguidos lavan el campo de manchas y el vidrio se vuelve plástico gris.
     El único backdrop-filter de esta página está en .dv-bar, que se apoya
     directo sobre el fondo. */
  :global([data-d='I']) .dv { --dv-blur: 18px; --dv-h: 12px; --dv-dot: 15px; }
  :global([data-d='I']) .dv-bar {
    border-radius: var(--d-r-lg);
    backdrop-filter: blur(var(--dv-blur)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--dv-blur)) saturate(1.5);
  }
  :global([data-d='I']) .pb-track, :global([data-d='I']) .tl-track,
  :global([data-d='I']) .ck-trklane, :global([data-d='I']) .ds-bar {
    background: color-mix(in srgb, var(--d-ink) 7%, transparent);
    border-radius: var(--d-r-pill);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .pb-fill, :global([data-d='I']) .ck-fill {
    background: color-mix(in srgb, var(--tone-fg) 76%, transparent);
    box-shadow: inset 0 1px 0 var(--d-line);
    border-radius: var(--d-r-pill);
  }
  /* El umbral es un filo de luz con su propio contrafilo oscuro: así se lee
     tanto sobre el surco vacío como sobre el relleno teñido. */
  :global([data-d='I']) .pb-thr, :global([data-d='I']) .ck-fin, :global([data-d='I']) .tl-now {
    background: var(--d-line); opacity: 1;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--d-ink) 18%, transparent);
  }
  :global([data-d='I']) .pb-thr--soft { box-shadow: none; opacity: .5; }
  :global([data-d='I']) .tl-elapsed { opacity: .35; border-radius: var(--d-r-pill); }
  :global([data-d='I']) .tl-dot {
    background: var(--d-surface);
    box-shadow: 0 0 0 1px var(--tone-edge), inset 0 1px 0 var(--d-line), var(--d-shadow);
  }
  :global([data-d='I']) .ds-seg { background: color-mix(in srgb, var(--tone-fg) 72%, transparent); }
  :global([data-d='I']) .ds-seg + .ds-seg { box-shadow: inset 1px 0 0 var(--d-line); }
  :global([data-d='I']) .sp-base, :global([data-d='I']) .sp-grid {
    stroke: color-mix(in srgb, var(--d-ink) 14%, transparent);
  }
  :global([data-d='I']) .sp-line { stroke-width: 2; }
  :global([data-d='I']) .sp-end { stroke: var(--d-line); stroke-width: 1.5; }
  /* La lámina del minigráfico es vidrio más fino que el panel, nunca un
     segundo desenfoque: transparencia anidada, que es la regla de arriba. */
  :global([data-d='I']) .sp-svg {
    background: color-mix(in srgb, var(--d-surface) 42%, transparent);
    border-radius: var(--d-r); box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .cal-strip { gap: 3px; }
  /* Catorce días eran catorce vidrios al 56 %, y apilado sobre el vidrio del
     panel el campo de manchas desaparecía: la tira quedaba gris plástico y
     los tres días que importan tenían que competir con once cristales llenos.
     Bajando el día vacío a un velo del 22 %, el fondo teñido pasa a través, y
     el día con vencimiento es lo único con cuerpo. Se encuentra de lejos. */
  :global([data-d='I']) .cal-day {
    background: color-mix(in srgb, var(--d-surface) 34%, transparent);
    border-color: transparent;
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .cal-day[data-tone] { background: var(--tone-band); border-color: var(--tone-edge); }
  /* El fin de semana no se borra: se hunde. Un velo de tinta lo mete detrás
     del vidrio del día hábil, y quedan tres niveles en el orden correcto:
     hundido, vidrio, tono. */
  :global([data-d='I']) .cal-day--wknd {
    background: color-mix(in srgb, var(--d-ink) 6%, transparent);
    box-shadow: none;
  }
  :global([data-d='I']) .cal-day--hoy { box-shadow: inset 0 0 0 1px var(--d-accent), inset 0 1px 0 var(--d-line); }
  /* El vidrio no se hunde al pasarle por encima: sube el filo especular. */
  :global([data-d='I']) .cal-day:not([data-tone]):hover {
    filter: none;
    background: color-mix(in srgb, var(--d-surface) 62%, transparent);
  }
  :global([data-d='I']) .cal-day--on::after { background: var(--d-accent); }
  :global([data-d='I']) .cal-detail {
    background: var(--d-sunk); border-radius: var(--d-r-lg);
    padding: var(--d-p2) var(--d-p3);
    box-shadow: inset 0 1px 0 var(--d-line);
  }

  /* ── J · LACA — ninguna superficie es color plano ─────────────────────
     El barrido vive en el tercio de arriba, va en un pseudo con
     pointer-events:none y se pinta ANTES que la marca de selección: por eso
     el brillo de un día es ::before y la muesca de elegido sigue siendo
     ::after, que es la que tiene que quedar arriba de todo.
     HALLAZGO: J declara --d-accent-fill pero no un degradado por tono, así
     que el esmalte de una barra de estado se arma con el propio blanco de la
     dirección (color-mix sobre --d-surface) encima del color del tono. Un
     --d-gloss en el contrato ahorraría esta línea en las cuatro direcciones
     que la necesitan (J, N, O, Q). */
  /* Al presionar, el brillo se apaga y la placa se hunde. */
  /* Una regla prefijada con [data-d] le gana a la base .cal-day--hoy, así que
     cada dirección que repinta el día tiene que devolverle el anillo de hoy. */

  

  
  /* El relleno es su propia piedra dentro del surco, con otros cuatro radios. */

  /* ── M · BRUMA — el umbral es una mancha, no una línea ─────────────────
     Ni un contenedor: el surco desaparece y lo que queda es color derramado
     por detrás. Donde hay texto la suavidad se hace con radial-gradient (que
     difumina el fondo sin tocar la letra) y donde no la hay, con filter:blur.
     Los titulares y las cifras pasan a la serif de --d-display: en una página
     de datos, el número en serif es la mitad de la firma de esta dirección. */
  :global([data-d='M']) .dv { --dv-h: 14px; --dv-dot: 16px; }
  /* Sin contenedores, lo único que agrupa es una mancha. La barra de vista es
     un grupo de controles y necesitaba leerse como uno: sin la mancha eran
     tres cosas sueltas flotando arriba de la página. */
  :global([data-d='M']) .dv-bar {
    background: radial-gradient(72% 150% at 14% 50%, var(--d-neu-wash) 0%, transparent 72%);
    border: 0; box-shadow: none; padding-inline: 0;
  }
  :global([data-d='M']) .pb-name, :global([data-d='M']) .ck-title,
  :global([data-d='M']) .cal-day-name, :global([data-d='M']) .sp-mid {
    font-family: var(--d-display);
  }
  /* Las cifras en serif son la mitad de la firma de esta dirección: en una
     página de datos, un 118 % en Georgia es lo que dice que acá el número no
     es un instrumento sino una lectura. Entran también las del eje y las de
     las cabeceras, que antes se quedaban en sans y partían la voz. */
  :global([data-d='M']) .pb-val, :global([data-d='M']) .ck-pc,
  :global([data-d='M']) .ds-v, :global([data-d='M']) .cal-n,
  :global([data-d='M']) .tl-tick, :global([data-d='M']) .dv-fig,
  :global([data-d='M']) .ds-pc, :global([data-d='M']) .pb-thr-lab {
    font-family: var(--d-display); font-weight: 400;
  }
  :global([data-d='M']) .pb-track, :global([data-d='M']) .ck-trklane, :global([data-d='M']) .tl-track {
    background: none; overflow: visible; border-radius: 0;
  }
  :global([data-d='M']) .pb-fill, :global([data-d='M']) .ck-fill {
    background: linear-gradient(90deg, transparent, var(--tone-fg));
    filter: blur(4px); opacity: .55; border-radius: var(--d-r-pill);
  }
  :global([data-d='M']) .pb-zone, :global([data-d='M']) .tl-zone { filter: blur(9px); }
  /* El umbral: un smudge radial centrado en el 100 %, no un canto. */
  :global([data-d='M']) .pb-thr {
    width: var(--d-p3); margin-left: calc(var(--d-p3) / -2); opacity: .5;
    background: radial-gradient(closest-side, var(--d-ink) 0%, transparent 72%);
  }
  :global([data-d='M']) .pb-thr--soft { opacity: .2; }
  :global([data-d='M']) .ck-fin, :global([data-d='M']) .tl-now {
    width: var(--d-p2); margin-left: calc(var(--d-p2) / -2); opacity: .35;
    background: radial-gradient(closest-side, var(--d-ink) 0%, transparent 74%);
  }
  /* LO QUE LE FALTABA A M EN ESTA FAMILIA. Sin panel, sin borde y sin fila
     rayada, seis planes eran seis renglones de texto suelto y encontrar los
     dos vencidos costaba leerlos todos. La respuesta no es meterles una caja
     (eso deja de ser Bruma): es que el estado SE DERRAME por detrás de la
     fila, entrando por la izquierda y muriendo antes del texto. La mancha va
     de radial-gradient y no de blur porque el desenfoque de un filtro también
     desenfoca la letra que tiene encima; el degradado no toca la letra.
     Los planes al día no manchan nada. Eso es lo que hace que los dos que
     manchan se vean desde el otro lado del taller. */
  :global([data-d='M']) .pb[data-tone='critical'], :global([data-d='M']) .pb[data-tone='attention'],
  :global([data-d='M']) .tl-row[data-tone='critical'], :global([data-d='M']) .tl-row[data-tone='attention'] {
    background: radial-gradient(56% 130% at 4% 50%, var(--tone-band) 0%, transparent 70%);
  }
  :global([data-d='M']) .pb { padding-block: var(--d-p1); }
  :global([data-d='M']) .tl-elapsed { filter: blur(3px); opacity: .4; }
  :global([data-d='M']) .tl-dot {
    background: radial-gradient(closest-side, var(--tone-band) 0%, transparent 76%);
    box-shadow: none; color: var(--tone-fg);
  }
  :global([data-d='M']) .ds-bar { background: none; overflow: visible; height: calc(var(--dv-h) * 1.6); }
  :global([data-d='M']) .ds-seg { filter: blur(6px); opacity: .8; }
  :global([data-d='M']) .ds-seg + .ds-seg { box-shadow: none; }
  :global([data-d='M']) .sp-area { filter: blur(7px); }
  :global([data-d='M']) .sp-line { opacity: .45; }
  :global([data-d='M']) .sp-base, :global([data-d='M']) .sp-grid { display: none; }
  :global([data-d='M']) .cal-strip { gap: 0; }
  :global([data-d='M']) .cal-day { background: none; border: 0; }
  :global([data-d='M']) .cal-day[data-tone] {
    background: radial-gradient(70% 62% at 50% 62%, var(--tone-band) 0%, transparent 72%);
  }
  :global([data-d='M']) .cal-day--wknd { background: radial-gradient(70% 62% at 50% 62%, var(--d-neu-band) 0%, transparent 74%); }
  :global([data-d='M']) .cal-day--hoy { box-shadow: none; background: radial-gradient(70% 62% at 50% 62%, var(--d-accent-soft) 0%, transparent 74%); }
  :global([data-d='M']) .cal-day--on::after { height: 2px; background: var(--d-ink-3); }
  :global([data-d='M']) .cal-detail { position: relative; padding: var(--d-p2) 0; }
  :global([data-d='M']) .cal-detail::before {
    content: ''; position: absolute; inset: 0 calc(-1 * var(--d-p3));
    background: radial-gradient(58% 70% at 22% 20%, var(--d-neu-band) 0%, transparent 72%);
    filter: blur(14px); pointer-events: none; z-index: -1;
  }

  
  /* La primera cinta no se monta sobre el eje: ahí arriba están las marcas de
     días y taparlas media línea las vuelve ilegibles. */
  /* La tira de días es UN carril: las puntas se redondean solo en los extremos
     y el día elegido monta por encima de sus dos vecinos. */
  /* Acá el solape NO se hace con margen negativo: el ancho de cada tramo ES el
     dato (8/14/62/4 equipos), y montarlos unos milímetros dejaría un pedazo de
     carril vacío a la derecha que se lee como flota sin contar. El montaje lo
     dan las puntas redondas, el orden de apilado y la sombra de contacto a la
     izquierda; el reparto queda exacto. */

  /* ── O · PRISMA — la marca vive DENTRO del vidrio ─────────────────────
     El surco de una barra no es gris: es vidrio teñido de marca, y el relleno
     es la misma marca subida de tono. La tira de catorce días es la única
     botonera de esta página, así que acá se hace VIDRIO SEGMENTADO —un solo
     panel translúcido partido por filos de luz— y no catorce botones sueltos.
     Igual que en I: dentro del panel se anida con transparencia, nunca con un
     segundo desenfoque. */
  :global([data-d='O']) .dv { --dv-blur: 20px; --dv-h: 12px; --dv-dot: 15px; }
  :global([data-d='O']) .dv-bar {
    border-radius: var(--d-r-lg);
    background-image: linear-gradient(180deg, color-mix(in srgb, var(--d-brand) 18%, transparent), transparent);
    backdrop-filter: blur(var(--dv-blur)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--dv-blur)) saturate(1.5);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='O']) .pb-name b, :global([data-d='O']) .tl-lab b,
  :global([data-d='O']) .ck-title b, :global([data-d='O']) .cal-day-name b,
  :global([data-d='O']) .cal-id { color: var(--d-brand); }
  /* La cifra de la cabecera vive sobre el vidrio teñido, así que hereda la
     tinta de marca de esa capa en vez de traer la suya. */
  :global([data-d='O']) .d-panel-head .dv-fig { color: inherit; }
  /* Igual que en C, el teal es la referencia contra la que se mide: el 100 %,
     el fin del carril, la línea de hoy y las marcas del eje. La diferencia es
     de dónde sale el color: en C es una barra opaca, acá es la misma capa
     translúcida que tiñe el vidrio entero. */
  :global([data-d='O']) .tl-tick { color: var(--d-brand); }
  :global([data-d='O']) .pb-track, :global([data-d='O']) .tl-track,
  :global([data-d='O']) .ck-trklane, :global([data-d='O']) .ds-bar {
    background: color-mix(in srgb, var(--d-brand) 9%, transparent);
    border-radius: var(--d-r-pill);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='O']) .pb-fill, :global([data-d='O']) .ck-fill {
    background: color-mix(in srgb, var(--tone-fg) 78%, transparent);
    box-shadow: inset 0 1px 0 var(--d-line);
    border-radius: var(--d-r-pill);
  }
  :global([data-d='O']) .pb-thr, :global([data-d='O']) .ck-fin { background: var(--d-brand); opacity: .55; }
  :global([data-d='O']) .pb-thr--soft { opacity: .22; }
  :global([data-d='O']) .tl-axis {
    background: color-mix(in srgb, var(--d-brand) 10%, transparent);
    border-radius: var(--d-r); padding-block: 2px;
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='O']) .tl-now { background: var(--d-brand); opacity: .6; }
  :global([data-d='O']) .tl-dot { box-shadow: 0 0 0 1px var(--tone-edge), inset 0 1px 0 var(--d-line), var(--d-shadow); }
  :global([data-d='O']) .ds-seg { background: color-mix(in srgb, var(--tone-fg) 76%, transparent); }
  :global([data-d='O']) .ds-seg + .ds-seg { box-shadow: inset 1px 0 0 var(--d-line); }
  :global([data-d='O']) .sp-svg { background: color-mix(in srgb, var(--d-surface) 55%, transparent); border-radius: var(--d-r); box-shadow: inset 0 1px 0 var(--d-line); }
  :global([data-d='O']) .sp-base, :global([data-d='O']) .sp-grid { stroke: color-mix(in srgb, var(--d-brand) 22%, transparent); }
  :global([data-d='O']) .cal-strip {
    gap: 0;
    background: color-mix(in srgb, var(--d-surface) 72%, transparent);
    border: 1px solid var(--d-line);
    border-radius: var(--d-r-lg);
    overflow: hidden;
    box-shadow: var(--d-shadow);
  }
  :global([data-d='O']) .cal-day {
    background: none; border: 0; border-radius: 0;
    border-left: 1px solid var(--d-line);
  }
  :global([data-d='O']) .cal-day:first-child { border-left: 0; }
  :global([data-d='O']) .cal-day[data-tone] { background: var(--tone-band); }
  :global([data-d='O']) .cal-day--wknd { background: color-mix(in srgb, var(--d-ink) 5%, transparent); }
  :global([data-d='O']) .cal-day--hoy { box-shadow: inset 0 0 0 1px var(--d-brand); }
  /* Dentro de un panel segmentado, el puntero mueve LUZ debajo del vidrio: no
     hunde la pieza ni la levanta, porque no hay piezas. */
  :global([data-d='O']) .cal-day:not([data-tone]):hover {
    filter: none;
    background: color-mix(in srgb, var(--d-surface) 45%, transparent);
  }
  /* Elegido = un pie de marca a todo el ancho del tramo, no un relleno.
     El relleno teñido que había acá NO se veía en los tres días que tienen
     estado, porque el tono los pinta con más peso de selector, y justo el día
     que arranca elegido es uno de esos: la tira abría sin marca de selección.
     El pie va por debajo del tono y funciona igual en los catorce. Una sola
     señal, y la que no puede taparse. */
  :global([data-d='O']) .cal-day--on::after {
    left: 0; right: 0; bottom: 0; height: 3px;
    background: var(--d-brand);
  }
  :global([data-d='O']) .tl-elapsed { inset-block: 38%; opacity: .42; }
  :global([data-d='O']) .cal-detail {
    background: color-mix(in srgb, var(--d-surface) 60%, transparent);
    border-radius: var(--d-r-lg); padding: var(--d-p2) var(--d-p3);
    box-shadow: var(--d-shadow);
  }

  
  /* La tira cuelga de una espina horizontal, y el día con vencimiento le
     muerde un tramo del ancho de su columna. */

  

  
  /* El .5 de opacidad dejaba el carril en 2.10:1 sobre el vidrio oscuro. Sin
     él llega a 4.05:1 — pasa el 3:1 que le corresponde a un elemento gráfico,
     pero no el 4.5:1 de texto, y no puede: el techo se lo pone --d-ink-3 de R
     (#8798A4), que es el token que no rinde sobre sus propios fondos. */
  /* En una dirección oscura el sábado no puede ser MÁS claro que el resto: la
     tinta de R es casi blanca, así que el velo que hunde es --d-ink-on. */

  

  /* ── T · HALO CLARO — nada tiene borde: existe lo que irradia ──────────
     Halo, del otro lado de la luz, y la traducción a datos y tiempo es una
     sola decisión repetida en las seis piezas: NINGÚN SURCO SE RELLENA.
     El carril vacío es papel con un anillo de 1px, y lo consumido es lo único
     que tiene luz. Una barra al 118 % no se ve porque esté pintada de rojo:
     se ve porque irradia rojo, y eso funciona a tres metros.

     DE QUÉ LADO ESTÁ LA LUZ. Es lo único que cambia contra K y es lo que hace
     que acá no parezca un neón apagado: sobre papel la luz viene de arriba,
     así que el halo CAE. Todo resplandor de esta dirección lleva
     desplazamiento hacia abajo; lo único a cero es el anillo, porque un
     anillo es contorno y no sombra. Un halo centrado sin desplazamiento es
     decoración, y esa es exactamente la trampa de esta dirección.

     Y LO QUE LA SEPARA DE UMBRA, que en esta página es su vecina peligrosa:
     S es una tarjeta blanca, neutra, con la sombra teñida encima como dato
     agregado. Acá no hay tarjeta. El anillo en el propio tono es el contorno,
     y el acento es un color que brilla por sí mismo en vez de ser tinta.

     HALLAZGO: el contrato no tiene token de halo por tono. Se arma acá con
     color-mix sobre --tone-fg, con fallback a --d-accent para las piezas sin
     estado: sin ese fallback, un var indefinido invalida la lista de
     box-shadow entera y se cae también el anillo. */
  :global([data-d='T']) .dv {
    --dv-h: 12px; --dv-dot: 15px;
    /* El anillo va POR FUERA, no inset: las bandas de zona son hijas del
       surco y pintan encima de una sombra interior, y el contorno de la
       dirección no puede depender de que las zonas estén apagadas. */
    --dv-ring: 0 0 0 1px color-mix(in srgb, var(--d-ink) 10%, transparent);
    --dv-halo: 0 4px 12px -4px color-mix(in srgb, var(--tone-fg, var(--d-accent)) 50%, transparent);
    --dv-halo-lg: 0 7px 22px -7px color-mix(in srgb, var(--tone-fg, var(--d-accent)) 55%, transparent);
  }
  :global([data-d='T']) .dv-bar { border: 0; border-radius: var(--d-r-lg); box-shadow: var(--d-shadow); }
  :global([data-d='T']) .dv-body, :global([data-d='T']) .dv-stack { gap: var(--d-p3); }
  /* El carril es aire con un anillo. Nada de --d-sunk: eso es relleno. */
  :global([data-d='T']) .pb-track, :global([data-d='T']) .ck-trklane, :global([data-d='T']) .tl-track {
    background: none; box-shadow: var(--dv-ring);
    border-radius: var(--d-r-pill); overflow: visible;
  }
  /* Lo consumido no es un bloque de color: es luz que se junta hacia el final
     del recorrido. Empieza en un 30 % del tono y llega entero al filo. */
  :global([data-d='T']) .pb-fill, :global([data-d='T']) .ck-fill {
    border-radius: var(--d-r-pill);
    background: linear-gradient(90deg, color-mix(in srgb, var(--tone-fg) 30%, transparent), var(--tone-fg));
    box-shadow: var(--dv-halo);
  }
  /* El umbral es la única brasa de acento de la celda, y también cae. */
  :global([data-d='T']) .pb-thr, :global([data-d='T']) .ck-fin {
    background: var(--d-accent); opacity: 1; inset-block: -4px; width: 2px;
    box-shadow: 0 3px 9px -2px color-mix(in srgb, var(--d-accent) 55%, transparent);
  }
  :global([data-d='T']) .pb-thr--soft { background: var(--d-ink-3); opacity: .3; inset-block: 0; width: 1px; box-shadow: none; }
  :global([data-d='T']) .tl-now {
    background: var(--d-accent); inset-block: -4px;
    box-shadow: 0 3px 10px -2px color-mix(in srgb, var(--d-accent) 55%, transparent);
  }
  :global([data-d='T']) .tl-elapsed {
    inset-block: 36%; opacity: 1; border-radius: var(--d-r-pill);
    background: color-mix(in srgb, var(--tone-fg) 55%, transparent);
  }
  :global([data-d='T']) .tl-dot {
    background: var(--d-surface);
    box-shadow: 0 0 0 1px var(--tone-edge), var(--dv-halo);
  }
  /* El dial: dos arcos que caen. T entra en la familia de arcos por la misma
     razón que K, y con la pista a un 8 % de tinta el arco es lo único que
     emite: se lee cuál de los dos relojes va adelante sin mirar la leyenda. */
  :global([data-d='T']) .ck-trk { stroke: color-mix(in srgb, var(--d-ink) 8%, transparent); }
  :global([data-d='T']) .ck-arc {
    stroke-linecap: round;
    filter: drop-shadow(0 3px 6px color-mix(in srgb, var(--tone-fg) 45%, transparent));
  }
  :global([data-d='T']) .ck-over { filter: drop-shadow(0 2px 5px color-mix(in srgb, var(--tone-fg) 45%, transparent)); }
  /* La flota: un riel de cuatro lozanges de luz. Sin gap, porque el ancho de
     cada tramo ES el dato y tres huecos de 3px corren el reparto; lo que
     separa es un filo de papel pintado hacia adentro. */
  :global([data-d='T']) .ds-bar {
    background: none; box-shadow: none; overflow: visible;
    height: calc(var(--dv-h) * 1.5);
  }
  :global([data-d='T']) .ds-seg {
    background: color-mix(in srgb, var(--tone-fg) 88%, transparent);
    box-shadow: var(--dv-halo);
  }
  :global([data-d='T']) .ds-seg + .ds-seg { box-shadow: var(--dv-halo), inset 2px 0 0 var(--d-surface); }
  :global([data-d='T']) .ds-seg:first-child { border-radius: var(--d-r-pill) 0 0 var(--d-r-pill); }
  :global([data-d='T']) .ds-seg:last-child { border-radius: 0 var(--d-r-pill) var(--d-r-pill) 0; }
  :global([data-d='T']) .sp-base, :global([data-d='T']) .sp-grid { display: none; }
  :global([data-d='T']) .sp-line {
    stroke-width: 2;
    filter: drop-shadow(0 3px 5px color-mix(in srgb, var(--tone-fg) 45%, transparent));
  }
  :global([data-d='T']) .sp-end { filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--tone-fg) 50%, transparent)); }
  /* La tira de catorce días es donde esta dirección se gana el puesto: un día
     sin vencimiento es papel liso y no dibuja nada, así que los tres que
     tienen trabajo son lo único que emite luz en toda la fila. Encontrar el
     próximo vencimiento no es leer catorce números, es mirar dónde brilla. */
  :global([data-d='T']) .cal-strip { gap: 3px; }
  :global([data-d='T']) .cal-day { background: none; border: 0; box-shadow: none; }
  :global([data-d='T']) .cal-day[data-tone] {
    background: var(--tone-band);
    box-shadow: 0 0 0 1px var(--tone-edge), var(--dv-halo-lg);
  }
  /* El fin de semana no se rellena de gris: se apaga. Es la única forma de
     decirlo que no contradice la regla de la dirección, y de paso deja la
     tira con un solo material, el papel. Si ese sábado tiene trabajo manda el
     tono, que para eso está. */
  :global([data-d='T']) .cal-day--wknd:not([data-tone]) { background: none; color: var(--d-ink-3); }
  /* Hoy lleva el anillo de acento y conserva el halo de su propio tono: hoy
     ES el 6 de agosto y el 6 de agosto está vencido, así que las dos cosas
     tienen que verse a la vez. */
  :global([data-d='T']) .cal-day--hoy,
  :global([data-d='T']) .cal-day--hoy[data-tone] { box-shadow: 0 0 0 1px var(--d-accent), var(--dv-halo-lg); }
  :global([data-d='T']) .cal-day:not([data-tone]):hover {
    filter: none;
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 5px 14px -5px color-mix(in srgb, var(--d-accent) 40%, transparent);
  }
  :global([data-d='T']) .cal-day--on::after {
    background: var(--d-accent);
    box-shadow: 0 2px 6px -1px color-mix(in srgb, var(--d-accent) 60%, transparent);
  }
  :global([data-d='T']) .cal-detail {
    border-radius: var(--d-r-lg); padding: var(--d-p2) var(--d-p3);
    box-shadow: var(--d-shadow);
  }

  /* ── W · CRISTAL TEMPLADO — vidrio en el panel, instrumento opaco encima ─
     W es Cristal corregido, y las tres correcciones se traducen a esta familia
     sin inventar nada nuevo: lo que flota va sólido, lo que mide va plano, y el
     halo se lo gana lo vencido.

     LA DECISIÓN QUE ORDENA TODA LA CELDA: dos materiales, uno por trabajo.
     El vidrio es la superficie que se queda QUIETA, o sea el panel y la barra
     de vista. Todo lo que MIDE o se TOCA (los cuatro carriles, la lámina del
     minigráfico y las catorce teclas del calendario) se apoya sobre la misma
     placa opaca.

     Por qué la placa no es negociable: --d-sunk de W es blanco al 34 %, y sobre
     un panel que ya es blanco al 60 % compone MÁS claro que el propio panel. La
     pista de una barra quedaba más clara que su contenedor y con el campo de
     color del fondo pasando a través en manchas: no había fondo contra el cual
     leer un relleno, y sin fondo la barra no dice cuánto falta. I administró ese
     problema bajando sus catorce vidrios al 22 %; acá se saca de raíz. La pista
     opaca no es una preferencia, es lo que hace legible el dato.

     HALLAZGO: el contrato no tiene token de desenfoque. directions.css escribe
     blur(20px) a mano en el panel de W; acá se repite como --dv-blur para que la
     barra de vista use exactamente el mismo vidrio y no uno parecido. El día que
     exista --d-blur, estas dos líneas se borran solas.
     HALLAZGO: tampoco hay token de halo por tono. Se arma con color-mix sobre
     --d-crit, que en esta dirección es el único tono con derecho a irradiar. */
  :global([data-d='W']) .dv {
    --dv-blur: 20px; --dv-h: 12px; --dv-dot: 15px;
    /* La placa y su filo salen de la escala neutra del contrato, no de un
       blanco escrito a mano. Son los únicos dos valores que W agrega. */
    --dv-plate: var(--d-neu-band);
    --dv-hair: var(--d-neu-edge);
  }

  /* La barra de vista es panel: se queda quieta y no tapa nada, así que lleva
     el mismo vidrio y el mismo doble bisel que .d-panel. Sus controles siguen
     siendo opacos porque de eso se encarga directions.css, y esa es justo la
     tesis de la dirección demostrada en 40px de alto: el fondo es vidrio, lo
     que se toca es sólido. */
  :global([data-d='W']) .dv-bar {
    position: relative;
    border-radius: var(--d-r-lg);
    backdrop-filter: blur(var(--dv-blur)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--dv-blur)) saturate(1.5);
  }
  :global([data-d='W']) .dv-bar::after {
    content: ''; position: absolute; inset: 1px;
    border-radius: calc(var(--d-r-lg) - 1px);
    /* El filo interior es luz, no línea: por eso sale de --d-ink-on y no de
       --d-line, que en alto contraste se da vuelta a tinta y convertiría el
       bisel de la barra en un anillo oscuro mientras el del panel sigue claro. */
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--d-ink-on) 45%, transparent);
    pointer-events: none;
  }

  /* Los cuatro carriles: una sola forma y un solo material. Pastilla en los
     cuatro, placa opaca en los cuatro. Antes el surco del medidor era el único
     rectángulo entre tres pastillas. */
  :global([data-d='W']) .pb-track, :global([data-d='W']) .ck-trklane,
  :global([data-d='W']) .tl-track, :global([data-d='W']) .ds-bar {
    background: var(--dv-plate);
    border-radius: var(--d-r-pill);
  }
  :global([data-d='W']) .pb-fill, :global([data-d='W']) .ck-fill,
  :global([data-d='W']) .tl-elapsed { border-radius: var(--d-r-pill); }

  /* EL UMBRAL, que es la lectura que más se paga si falla. A 118 % la marca del
     100 % cae DENTRO del relleno rojo oscuro, y la línea de tinta al 50 % que
     trae la base ahí da 2.1:1. A 72 % cae sobre la placa clara, donde una línea
     blanca daría 1.2:1. Ninguna tinta sola sirve para los dos casos: núcleo
     blanco con contrafilo de tinta sirve para ambos, y ni --d-ink-on ni --d-ink
     se dan vuelta en alto contraste, así que la regla vale sin excepciones. */
  :global([data-d='W']) .pb-thr, :global([data-d='W']) .ck-fin {
    background: var(--d-ink-on); opacity: 1;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--d-ink) 55%, transparent);
  }
  /* El aviso de 85 % es aviso: se lee si lo buscás y no compite con el umbral. */
  :global([data-d='W']) .pb-thr--soft {
    background: var(--d-ink-on); opacity: .55; box-shadow: none;
  }

  /* EL ÚNICO HALO DE LA CELDA, y la frase que lo justifica: irradia el carril
     cuyo relleno PASÓ el umbral, o sea lo vencido. Son dos en toda la celda, la
     barra de 118 % y el reloj de calendario de 104 %, y ninguna otra pieza
     brilla: ni las filas de la línea de tiempo, ni los días del calendario, ni
     los tramos de la flota. Si todo brilla, nada urge. El resplandor va sobre
     .pb-track y no sobre el relleno porque el surco recorta a sus hijos y no a
     su propia sombra, así que las zonas siguen clipeadas contra la pastilla.
     El estado nunca depende de este brillo: la píldora lleva la forma de la
     marca, el texto dice «Vencido» y la cifra dice 118 %. */
  :global([data-d='W']) .pb[data-tone='critical'] .pb-track,
  :global([data-d='W']) .ck-lane[data-tone='critical'] .ck-trklane {
    box-shadow: 0 4px 18px -6px color-mix(in srgb, var(--d-crit) 60%, transparent);
  }

  /* Las filas de la línea de tiempo se quedan PLANAS, incluidas las dos
     vencidas: seis objetos flotantes son engorrosos de leer y la regla 2 de
     esta dirección existe justamente para eso. Lo que sí tienen es el filo de
     3px del contrato, que es el mismo device con el que W marca una .d-row
     crítica y el que sigue funcionando cuando alguien no distingue el rojo. */
  :global([data-d='W']) .tl-row[data-tone='critical'] { position: relative; }
  /* El filo va en el canal de padding del panel y NO como padding de la fila:
     un padding-left de 8px en dos de seis filas corre sus pistas 8px contra el
     eje de días, y entonces el punto de «hoy» de esas dos deja de caer sobre la
     marca de hoy. La franja informa; mover el dato no es una opción. */
  :global([data-d='W']) .tl-row[data-tone='critical']::before {
    content: ''; position: absolute; top: 0; bottom: 0;
    left: calc(-1 * var(--d-p2)); width: 3px;
    background: var(--d-crit);
  }
  /* Sin dato de vencimiento, el rayado tenía que dejar de ser --d-neu-band:
     sobre la placa opaca, que ES --d-neu-band, desaparecía entero. */
  :global([data-d='W']) .tl-hatch {
    background: repeating-linear-gradient(45deg, var(--dv-hair) 0 var(--d-p1), transparent var(--d-p1) var(--d-p2));
  }
  /* --d-overlay es el único blanco sólido que W declara, y su regla es «lo que
     tiene que separarse de lo de abajo se pinta sólido». Eso es exactamente lo
     que hacen la chapa del vencimiento y el rótulo que se sale del eje: sobre
     la placa opaca, un knockout translúcido deja pasar la pista y se lee como
     una mancha. */
  :global([data-d='W']) .tl-dot { background: var(--d-overlay); }
  :global([data-d='W']) .tl-off { background: var(--dv-plate); }

  /* El minigráfico es la quinta cosa que mide, así que va sobre la misma placa.
     El relleno de área se retiñe contra la placa: --d-info-band sobre
     --d-neu-band da 1.06:1 y el volumen de horas desaparecía. */
  :global([data-d='W']) .sp-svg {
    background: var(--dv-plate); border-radius: var(--d-r);
  }
  :global([data-d='W']) .sp-area { fill: color-mix(in srgb, var(--tone-fg) 13%, var(--dv-plate)); }
  :global([data-d='W']) .sp-base { stroke: var(--dv-hair); }

  /* LAS CATORCE TECLAS. Acá es donde W se separa de I de la forma más visible:
     en I la tira son catorce vidrios sobre vidrio y hay que bajarlos al 22 %
     para que el campo no se lave; en W un control es opaco y punto, así que la
     tira es una botonera maciza apoyada sobre el panel. Se toca lo que no deja
     pasar el fondo, y los tres días con trabajo son lo único con color.
     La tecla NO lleva box-shadow propio: el anillo de hoy vive ahí y una regla
     prefijada con [data-d] se lo comería sin avisar. */
  :global([data-d='W']) .cal-day {
    background: var(--dv-plate);
    border-color: var(--dv-hair);
  }
  :global([data-d='W']) .cal-day[data-tone] {
    background: var(--tone-band);
    border-color: var(--tone-edge);
  }
  /* El :not() no es adorno: sin él esta regla y la base .cal-day--wknd[data-tone]
     pesan lo mismo, gana la última, y el sábado 15 con el vencimiento de GEN-02
     perdía su tono. */
  :global([data-d='W']) .cal-day--wknd:not([data-tone]) {
    background: color-mix(in srgb, var(--d-ink) 8%, var(--dv-plate));
  }
  /* Al pasar por encima, la tecla se blanquea: es el mismo gesto que
     directions.css le da a .d-btn en esta dirección, no uno nuevo. */
  :global([data-d='W']) .cal-day:not([data-tone]):hover {
    filter: none; background: var(--d-overlay);
  }

  /* ── W · pantalla angosta ──────────────────────────────────────────────
     Nadie probó esta página abajo de 500px. Lo que W declara, explícito:

     1 · QUÉ SE APILA. Nada nuevo. Los dos cortes de la página ya apilan la
         línea de tiempo y desarman la fila del detalle del día, y W los hereda
         sin tocarlos: apilar dos veces la misma pieza es cómo se rompen estas
         cosas.
     2 · QUÉ COLUMNA SE CAE PRIMERO. El raíl de etiquetas (--dv-lab), que baja
         a 88px a 430px y desaparece a 330px. Es la columna correcta porque su
         contenido se repite completo en la línea de plazo de abajo. La segunda
         en caerse es la hora de corte, que deja de estar anclada a la derecha:
         un «Corte 6 ago · 09:12» solo y alineado a la derecha debajo de tres
         controles alineados a la izquierda se lee como un resto, no como un
         dato.
     3 · QUÉ SE VUELVE SCROLL HORIZONTAL CONTENIDO. La tira de catorce días.
         El corte de 430px la parte en dos filas de siete; abajo de 330px esas
         siete columnas miden 28px y toda tecla queda por debajo del piso
         táctil. Entonces la tira pasa a ser un riel de catorce teclas de
         --d-touch de ancho que se desplaza DENTRO del panel, con
         overscroll-behavior para que el gesto no arrastre la página. El
         padding no es cosmético: el scrollport recorta, y sin esos píxeles el
         anillo de foco de una tecla se cortaría contra el borde. */
  @container (max-width: 330px) {
    :global([data-d='W']) .dv-note { margin-left: 0; flex-basis: 100%; }
    :global([data-d='W']) .cal-strip {
      grid-template-columns: none;
      grid-auto-flow: column;
      grid-auto-columns: var(--d-touch);
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scroll-padding-inline: 4px;
      padding: 4px 0 6px;
    }
  }

  /* El desenfoque de fondo es lo más caro que hay en una GPU móvil, y a esa
     medida el panel ocupa la pantalla entera: no queda campo alrededor que
     desenfocar, así que el efecto se paga y no se ve. directions.css ya lo
     apaga en .d-panel; la barra de vista es vidrio dibujado por esta página,
     así que le toca a esta página apagarlo en el mismo umbral y no en otro.
     Sin desenfoque, blanco al 60 % es una gasa: la barra pasa a --d-overlay,
     que es el sólido que la dirección ya declara. */
  @media (max-width: 560px) {
    :global([data-d='W']) .dv-bar {
      backdrop-filter: none; -webkit-backdrop-filter: none;
      background: var(--d-overlay);
    }
    :global([data-d='W']) .dv-bar::after { display: none; }
  }

  /* Quien pide menos transparencia suele pedirla porque el texto sobre fondos
     vivos le cuesta. Misma lógica que el bloque de W en directions.css, para la
     única superficie de vidrio que esta página agrega. */
  @media (prefers-reduced-transparency: reduce) {
    :global([data-d='W']) .dv-bar {
      backdrop-filter: none; -webkit-backdrop-filter: none;
      background: var(--d-overlay);
    }
    :global([data-d='W']) .dv-bar::after { display: none; }
  }

  /* ══════════════════════════════════════════════════════════════════════
     X · COTA. El color es solo estado; la estructura es la medida.

     Acá no hay una traducción de material, porque esta familia ES la
     dirección: hay dos reglas y las dos se pagan en marcado, no en CSS de
     superficie.

     REGLA 1 · EL COLOR ESTÁ RESERVADO AL ESTADO. Lo que esta página pintaba
     de color sin que fuera estado se apaga. El minigráfico venía con relleno
     en --d-info-band y curva en --d-info: un azul que no informa nada y que
     compite por atención con los cuatro tonos que sí informan. En Cota el
     consumo semanal es tinta sobre papel. Y las tres zonas del eje se
     reducen a UNA: solo lo vencido se tiñe, que es palabra por palabra la
     ley que directions.css ya le aplica a .d-row en esta dirección y por la
     misma razón, porque es el único estado que interrumpe. Con dieciocho
     bandas de color menos en la celda, el rojo de una fila vencida se
     encuentra antes de leer una palabra, que es el punto entero.

     REGLA 2 · NINGUNA CIFRA MEDIDA APARECE SOLA. La cota entra donde hay un
     tope de verdad y no entra en ningún otro lado:
       · panel 1, tres planes contra el «cada N» que los define;
       · panel 2, cada reloj contra su propio tope.
     No entra en la línea de tiempo, porque una fecha es una POSICIÓN sobre
     un eje compartido y no un recorrido hacia un tope: su marca es «hoy» y
     ya está dibujada. Tampoco en el consumo semanal, que no tiene tope
     semanal declarado; ni en el reparto de la flota, que es una composición
     de cuatro partes de un total; ni en la tira de catorce días. Una cota
     sin marca es una barra de progreso, y una barra de progreso decorativa
     es ruido.

     LA MARCA ES UNA SOLA MARCA. La regla de «hoy» en la línea de tiempo se
     dibuja con la geometría exacta de .d-cota-tick en esta dirección (1.5px,
     saliendo 4px por arriba y por abajo), porque son la misma cosa: el punto
     contra el que se mide lo demás.

     CANTO. Lo que MIDE tiene canto recto, igual que .d-cota-rail, que
     directions.css ya deja en radio 0. Lo que CONTIENE o se TOCA lleva los
     4px de la dirección. Es una sola escala y una sola frase.

     MOCIÓN. X no agrega ninguna. La única de la página sigue siendo el
     deslizamiento de la línea de tiempo al cambiar el eje, que ya se gana su
     lugar más arriba.

     HALLAZGO · falta un token de relleno de riel. directions.css pinta
     .d-cota-rail de X con un gris escrito a mano que el contrato no nombra,
     así que los rieles de esta página usan --d-accent-soft, que es el token
     más cercano y el único gris claro de la paleta que no es --d-sunk (que
     sobre blanco queda en 1.05:1 y hace desaparecer el tramo vacío). El día
     que exista un --d-rail-fill, estas dos líneas apuntan a él.
     ══════════════════════════════════════════════════════════════════════ */
  :global([data-d='X']) .dv {
    /* Un solo alto de riel en toda la celda, el mismo de .d-cota-rail. El de
       la flota sale a 7px por el factor 1.4 de la base, y está bien: es el
       único riel que reparte cuatro cosas en vez de medir una. */
    --dv-h: 5px;
    /* Dónde empieza la columna del riel dentro del bloque que lleva el
       rótulo «tope». Cero por defecto (panel 1, el riel va a todo el ancho);
       .xk lo corre por su columna de etiquetas. */
    --xt-off: 0px;
  }

  /* La cifra que contesta la cabecera es un dato duro, no un pie: va en tinta
     y con el peso de un titular chico. */
  :global([data-d='X']) .dv-fig { color: var(--d-ink); font-weight: var(--d-w-semi); }
  /* «7 210 km» no se parte entre la cifra y la unidad. */
  :global([data-d='X']) .d-cota-fig { white-space: nowrap; }

  /* ── El rótulo del tope ────────────────────────────────────────────────
     Una sola vez por bloque de rieles, centrado exactamente sobre la columna
     donde caen todas las marcas, con la línea de referencia que baja hacia
     ellas. Es la anotación de un plano, no un epígrafe: no nombra la sección,
     nombra una posición del eje, igual que el «100» que B pone sobre su
     umbral. El 0.3333 es el complemento del 66.67 % en que .d-cota-tick fija
     la marca, medido desde el canto derecho porque ese canto es común a la
     anotación y al riel. */
  :global([data-d='X']) .xt {
    grid-column: 1 / -1;
    position: relative; margin: 0;
    height: calc(1.25em + var(--d-p2));
    font-size: var(--d-t-2xs);
  }
  :global([data-d='X']) .xt-lab {
    position: absolute; top: 0;
    right: calc((100% - var(--xt-off)) * 0.3333);
    transform: translateX(50%);
    color: var(--d-ink-3); white-space: nowrap;
  }
  :global([data-d='X']) .xt-lab::after {
    content: ''; position: absolute; left: 50%; top: 100%;
    width: var(--d-bw); height: var(--d-p2);
    background: var(--d-edge);
  }

  /* ── 1 · Consumo del plan ──────────────────────────────────────────────
     El bloque de un plan no se tiñe ni lleva filo de tono: el relleno de la
     cota ya carga el estado y la píldora ya carga la palabra y la forma.
     Un tercero sería repetir. Lo que separa un plan del siguiente es una
     regla de un píxel, que es lo que separa dos renglones en una boleta. */
  :global([data-d='X']) .xp-list { display: grid; gap: var(--d-p3); min-width: 0; }
  :global([data-d='X']) .xp { display: grid; gap: var(--d-p1); min-width: 0; }
  :global([data-d='X']) .xp + .xp {
    border-top: var(--d-bw) solid var(--d-line);
    padding-top: var(--d-p3);
  }
  :global([data-d='X']) .xp-head {
    display: flex; align-items: baseline; flex-wrap: wrap;
    gap: var(--d-p1) var(--d-p2); min-width: 0;
  }
  :global([data-d='X']) .xp-name {
    flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere;
    font-size: var(--d-t-sm); color: var(--d-ink-2);
  }
  :global([data-d='X']) .xp-name b { color: var(--d-ink); font-weight: var(--d-w-semi); }
  /* El plazo es la respuesta de los tres segundos, así que va arriba y en
     tinta de lectura, no abajo en gris de nota. Va pegado a la píldora en un
     solo grupo: cuando la fila no entra, los dos bajan juntos y anclados a la
     derecha, en vez de quedar uno arriba a la derecha y otro abajo a la
     izquierda. */
  :global([data-d='X']) .xp-flag {
    flex: none; margin-left: auto;
    display: flex; align-items: baseline; gap: var(--d-p2);
  }
  :global([data-d='X']) .xp-due {
    white-space: nowrap;
    font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-2);
  }
  :global([data-d='X']) .xp-flag .d-pill { flex: none; }
  /* De dónde salió la lectura. Es lo que un técnico pregunta cuando la cifra
     no le cierra, y es lo único de la ficha que puede bajar a nota. */
  :global([data-d='X']) .xp-src {
    margin: 0; font-size: var(--d-t-2xs); color: var(--d-ink-3);
    min-width: 0; overflow-wrap: anywhere;
  }

  /* ── 2 · Dos relojes ───────────────────────────────────────────────────
     Rótulo a la izquierda, cota a la derecha, y las líneas base del rótulo y
     de la cifra grande alineadas: es lo que hace que «Calendario 234 d» se
     lea como una frase y no como dos objetos apilados. */
  :global([data-d='X']) .xk {
    --xt-off: calc(var(--dv-lane) + var(--d-p2));
    display: grid; grid-template-columns: var(--dv-lane) minmax(0, 1fr);
    column-gap: var(--d-p2); row-gap: var(--d-p2);
    align-items: baseline; min-width: 0;
  }
  :global([data-d='X']) .xk-lab {
    grid-column: 1; min-width: 0; overflow-wrap: anywhere;
    font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-2);
  }
  :global([data-d='X']) .xk-none {
    margin: 0; display: flex; align-items: center; gap: var(--d-p1);
    font-size: var(--d-t-xs); color: var(--tone-fg);
    min-width: 0; overflow-wrap: anywhere;
  }
  :global([data-d='X']) .ck { gap: var(--d-p2); }
  :global([data-d='X']) .ck + .ck {
    margin-top: var(--d-p3); padding-top: var(--d-p3);
    border-top: var(--d-bw) solid var(--d-line);
  }
  /* El veredicto es la frase que el técnico se lleva, así que sube de gris de
     nota a tinta de lectura. */
  :global([data-d='X']) .ck-say {
    font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-2);
  }

  /* ── 3 · Línea de tiempo ───────────────────────────────────────────────
     Sin cota: acá no hay recorrido hacia un tope, hay posiciones sobre un eje
     compartido. Lo que sí comparte con la cota es la MARCA. */
  :global([data-d='X']) .tl-track { border-radius: 0; background: var(--d-accent-soft); }
  /* Solo lo vencido se tiñe. Las otras dos zonas se apagan: en una celda sin
     ningún otro color, tres franjas por fila por seis filas eran dieciocho
     manchas compitiendo con las tres marcas que sí urgen. */
  :global([data-d='X']) .tl-zone[data-tone='positive'],
  :global([data-d='X']) .tl-zone[data-tone='attention'] { background: none; }
  :global([data-d='X']) .tl-elapsed { inset-block: 0; opacity: .45; border-radius: 0; }
  /* «Hoy» ES la marca de tope de este eje, así que se dibuja con la geometría
     exacta de .d-cota-tick en X: 1.5px, saliendo 4px por arriba y por abajo.
     El contrato no tiene tokens para ninguna de las dos medidas; están
     escritas igual acá y en directions.css a propósito, y el día que exista
     un --d-tick se cambian juntas. */
  :global([data-d='X']) .tl-now { background: var(--d-ink); width: 1.5px; inset-block: -4px; }
  :global([data-d='X']) .tl-key-rule { width: 1.5px; height: 12px; }
  /* La chapa del vencimiento comparte el canto recto del riel. */
  :global([data-d='X']) .tl-dot { border-radius: 0; }
  /* El rayado es la convención de dibujo para «sin dato», no un degradado de
     material: paradas duras, sin transición y en gris de línea, que sobre el
     papel de X se ve y sobre --d-neu-band no se veía. */
  :global([data-d='X']) .tl-hatch {
    background: repeating-linear-gradient(45deg, var(--d-line) 0 var(--d-p1), transparent var(--d-p1) var(--d-p2));
  }

  /* ── 4 · Consumo semanal ───────────────────────────────────────────────
     Columnas de tinta sobre una base de canto. Ni un color: doce semanas de
     horas no son un estado, y en Cota lo que no es estado no se pinta. */
  :global([data-d='X']) .sp-base { stroke: var(--d-edge); }

  /* ── 5 · Flota por estado ──────────────────────────────────────────────
     El riel se queda con los cuatro tonos, que acá sí son estado, y la
     leyenda pasa a ser lo que es: una tabla de cuatro filas con conteo y
     porcentaje alineados a la derecha. Se baja por la columna en vez de leer
     cuatro frases. */
  :global([data-d='X']) .ds-bar { border-radius: 0; background: var(--d-accent-soft); }
  :global([data-d='X']) .ds-key { gap: 0; margin-top: var(--d-p2); }
  :global([data-d='X']) .ds-key li {
    display: grid;
    grid-template-columns: 9px minmax(0, 1fr) 3ch 4ch minmax(0, 1.1fr);
    align-items: center; gap: var(--d-p2);
    min-height: 26px;
    border-top: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='X']) .ds-v, :global([data-d='X']) .ds-pc { text-align: right; }
  :global([data-d='X']) .ds-note { margin-left: 0; text-align: right; }

  /* ── 6 · Próximos 14 días ──────────────────────────────────────────────
     La tecla no lleva box-shadow propio: el anillo de «hoy» vive ahí y una
     regla prefijada con [data-d] se lo comería sin avisar. Al pasar por
     encima se hunde al mismo gris con el que directions.css hunde un .d-btn
     de esta dirección, en vez del filtro de brillo de la base, que sobre una
     tecla ya teñida cambia el tono del estado. */
  :global([data-d='X']) .cal-day:not([data-tone]):hover { filter: none; background: var(--d-sunk); }
  :global([data-d='X']) .cal-detail {
    margin-top: var(--d-p2); padding-top: var(--d-p2);
    border-top: var(--d-bw) solid var(--d-line);
  }
  /* La tira se parte en dos semanas de siete mucho antes de lo que manda la
     base. Medido: con catorce columnas la tecla baja de 44px en cuanto el
     cuerpo del panel cae de 640px, o sea casi siempre, y a 470px de celda
     queda en 29px. Partida en dos semanas la misma tecla mide el doble, las
     columnas quedan alineadas por día (jueves sobre jueves) y las dos semanas
     siguen viéndose enteras, que es lo único que una regla tiene que hacer. */
  @container (max-width: 660px) {
    :global([data-d='X']) .cal-strip { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  }

  /* ── X · PANTALLA ANGOSTA, DECLARADA ───────────────────────────────────
     Medido y no supuesto: a 380px de ventana el main deja 332px, la celda
     290px y el cuerpo de un panel 258px, así que los DOS cortes de esta
     página disparan a la vez. Lo que X declara para esa medida:

     1 · LOS RÓTULOS DE LOS RELOJES SE PONEN ARRIBA. La columna de 88px
         dejaba «Calendario» en dos líneas y el riel en 150px. Apilado, el
         riel recupera el ancho completo y la columna del tope sigue cayendo
         donde cae: --xt-off vuelve a cero y la anotación se recentra sola.
         El rótulo se pega a SU cota con un margen negativo, porque con
         separaciones iguales arriba y abajo no se sabría de cuál de los dos
         relojes es.
     2 · LA LEYENDA DE FLOTA PIERDE UNA COLUMNA. La base esconde la nota a
         430px; si la plantilla siguiera declarando cinco columnas, la quinta
         se quedaría con su 1.1fr de ancho vacío y los conteos flotarían en
         el medio.
     3 · LA HORA DE CORTE DEJA DE ANCLARSE A LA DERECHA. Sola y alineada a la
         derecha debajo de dos controles alineados a la izquierda se lee como
         un resto; en su propia línea y a la izquierda se lee como el tercer
         dato del grupo.
     4 · LA TIRA DE DÍAS NO SE VUELVE UN CARRIL QUE SE DESPLAZA. Es la única
         decisión discutible del bloque y va escrita: a 258px las catorce
         teclas quedan de 35px de ancho por 44 de alto, o sea por encima del
         piso AA de 24px pero por debajo de los 44 que pide la guía de
         plataforma. Se prefiere eso a un riel horizontal porque la tira ES
         una regla de dos semanas: si hay que desplazarla para ver el jueves
         que viene, dejó de ser una regla. La separación baja a un píxel para
         devolverle ancho a la tecla. */
  @container (max-width: 430px) {
    :global([data-d='X']) .ds-key li { grid-template-columns: 9px minmax(0, 1fr) 3ch 4ch; }
  }
  @container (max-width: 330px) {
    :global([data-d='X']) .xk { grid-template-columns: minmax(0, 1fr); --xt-off: 0px; }
    :global([data-d='X']) .xk-lab { margin-bottom: calc(-1 * var(--d-p1)); }
    :global([data-d='X']) .dv-note { margin-left: 0; flex-basis: 100%; }
    :global([data-d='X']) .cal-strip { gap: var(--d-bw); }
  }

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
    /* La fila del detalle deja de ser una tabla: acá el plazo no entra en la
       misma línea y truncarlo sería perder el único dato urgente. */
    .cal-list li { grid-template-columns: 9px auto minmax(0, 1fr); }
    .cal-when { grid-column: 2 / -1; }
    .tl-axis, .tl-row { grid-template-columns: minmax(0, 1fr); gap: 2px; }
    .tl-axis .tl-lab { display: none; }
    .tl-lab { text-align: left; justify-items: start; }
    .ck-dial { justify-content: center; }
    .ck-lanes { --dv-lane: 84px; }
    /* G pierde el raíl pero no la sangre: las barras siguen tocando los dos
       cantos y el texto se mete hacia adentro, para no pegarse a la franja
       de tono que lleva el estado en el canto izquierdo. */
    /* P pierde el raíl igual que G, pero no la espina: la columna de marca
       sigue a la izquierda y las etiquetas se meten hacia adentro para no
       pegarse a ella. Esto es lo que el raíl a ciegas no sabía hacer. */
  }

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     2 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn,
    :global([data-d='W']) .dv-sel,
    :global([data-d='W']) .d-select { min-height: var(--d-touch); }
    :global([data-d='W']) .cal-day { min-height: var(--d-touch); min-width: var(--d-touch); }
  }
</style>
