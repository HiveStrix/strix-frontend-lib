<script>
  // The chooser.
  //
  // Its job is to disappear. Eight directions are already a lot to hold in the
  // head, so the harness stays achromatic grey and offers exactly three moves:
  // pick an element family, hide directions you've ruled out, and switch
  // between seeing all of them at once or one of them large.
  import { DIRECTIONS } from './directions.js';
  import Acciones from './pages/Acciones.svelte';
  import Formularios from './pages/Formularios.svelte';
  import Tablas from './pages/Tablas.svelte';
  import Paneles from './pages/Paneles.svelte';
  import Estados from './pages/Estados.svelte';
  import Navegacion from './pages/Navegacion.svelte';
  import Datos from './pages/Datos.svelte';
  import Pantalla from './pages/Pantalla.svelte';

  const PAGES = [
    { id: 'acciones', name: 'Acciones', note: 'Botones, grupos, barras de herramientas', c: Acciones },
    { id: 'formularios', name: 'Formularios', note: 'Campos, selección, validación', c: Formularios },
    { id: 'tablas', name: 'Tablas y listas', note: 'Filas densas, orden, selección, vacío', c: Tablas },
    { id: 'paneles', name: 'Paneles y KPIs', note: 'Contenedores, cifras, secciones', c: Paneles },
    { id: 'estados', name: 'Estados y diálogos', note: 'Alertas, confirmación, carga, error', c: Estados },
    { id: 'navegacion', name: 'Navegación', note: 'Barras, pestañas, filtros, migas', c: Navegacion },
    { id: 'datos', name: 'Datos y tiempo', note: 'Progreso, umbrales, línea de tiempo', c: Datos },
    { id: 'pantalla', name: 'Pantalla completa', note: 'La flota, armada de principio a fin', c: Pantalla }
  ];

  // La página y las direcciones vivas se leen de la URL, para que un enlace
  // apunte a una comparación concreta: ?p=pantalla&d=I,K,N abre esas tres en la
  // pantalla completa. Sin eso, «mirá la de vidrio contra la de halo» obliga a
  // describir catorce clics.
  const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  let page = PAGES.find((p) => p.id === params.get('p')) ?? PAGES[0];
  // Ruling a direction out is the actual work here, so it is one click and it
  // persists across pages — you compare the survivors, not the full eight, once
  // you've made up your mind about a couple of them.
  const pedidas = (params.get('d') ?? '')
    .split(',')
    .map((x) => x.trim().toUpperCase())
    .filter((x) => DIRECTIONS.some((d) => d.id === x));
  // Por defecto se abren solo las FINALISTAS. Veinte direcciones a la vez ya no
  // ayudan a decidir: ayudan a no decidir. Las otras trece siguen a un clic, y
  // ?d=todas las trae de vuelta.
  const finalistas = DIRECTIONS.filter((d) => d.finalista).map((d) => d.id);
  let live = new Set(
    pedidas.length ? pedidas
    : params.get('d') === 'todas' ? DIRECTIONS.map((d) => d.id)
    : finalistas
  );
  let solo = null;

  const toggle = (id) => {
    live.has(id) ? live.delete(id) : live.add(id);
    if (live.size === 0) live = new Set(DIRECTIONS.map((d) => d.id));
    live = live;
  };

  $: shown = solo ? DIRECTIONS.filter((d) => d.id === solo) : DIRECTIONS.filter((d) => live.has(d.id));

  // EL ACENTO, ALTERABLE EN VIVO.
  //
  // Sólo lo escucha la familia Prisma pastel —Y, Z y AA—, que es la que declara
  // su marca como ranura. Las otras diez lo tienen escrito y no se mueven a
  // propósito: en Cota el acromatismo del cromo ES la dirección, en Marca el
  // teal sostiene la estructura, y dejarlos cambiar sería comparar otra cosa en
  // cada clic. En las tres pastel el color es justo lo que está en discusión.
  //
  // Cada una deriva de --x-accent lo suyo: Y sólo la marca y la cabecera (su
  // campo es el de O y se queda), Z además el fondo liso y las líneas, AA
  // además las tres manchas del campo.
  const ACENTOS = [
    { hex: '', name: 'Por defecto' },
    { hex: '#7226E8', name: 'Morado' },
    { hex: '#1B4E9E', name: 'Azul' },
    { hex: '#0E5A54', name: 'Teal' },
    { hex: '#B3261E', name: 'Rojo' },
    { hex: '#16181A', name: 'Tinta' }
  ];
  // Sale de la URL por la misma razón que la página y las direcciones: para que
  // «mirá las tres pastel en verde» sea un enlace y no una instrucción. Va SIN
  // almohadilla —?a=7226E8— porque un # en una URL abre el fragmento y se come
  // el resto. Se valida antes de usarlo: cualquier cosa que no sean seis
  // dígitos hex cae al defecto en vez de escribir basura en una custom property.
  const pedido = (params.get('a') ?? '').replace(/^#/, '').trim();
  let acento = /^[0-9a-fA-F]{6}$/.test(pedido) ? `#${pedido}` : '';

  // De qué lado cae la tinta del primario NO se puede resolver en CSS: hace
  // falta la luminancia del color elegido. Sobre un acento claro, un texto
  // blanco desaparece. Se calcula acá y se pasa como segunda variable.
  function tintaSobre(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // El umbral es el punto en que el blanco y el negro empatan en contraste
    // contra este fondo, no un 50 % de brillo a ojo.
    return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.05) ? '#FFFFFF' : '#14181A';
  }

  $: if (typeof document !== 'undefined') {
    const raiz = document.documentElement.style;
    if (acento) {
      raiz.setProperty('--x-accent', acento);
      raiz.setProperty('--x-accent-ink', tintaSobre(acento));
    } else {
      raiz.removeProperty('--x-accent');
      raiz.removeProperty('--x-accent-ink');
    }
  }
</script>

<div class="wrap">
  <header class="top">
    <div class="brand">
      <strong>Strix · direcciones</strong>
      <span>{finalistas.length} finalistas de {DIRECTIONS.length}. Elegí una y el sistema se reconstruye sobre ella.</span>
    </div>
    <nav class="pages" aria-label="Familias de elementos">
      {#each PAGES as p}
        <button class:on={p.id === page.id} on:click={() => (page = p)} title={p.note}>{p.name}</button>
      {/each}
    </nav>
  </header>

  <div class="filter">
    <span class="lbl">Direcciones</span>
    {#each DIRECTIONS as d}
      <button
        class="chip"
        class:off={!live.has(d.id) && !solo}
        class:solo={solo === d.id}
        aria-pressed={solo ? solo === d.id : live.has(d.id)}
        on:click={() => toggle(d.id)}
        on:dblclick={() => (solo = solo === d.id ? null : d.id)}
        title={d.silhouette}
      ><b>{d.id}</b> {d.name}</button>
    {/each}
    <span class="tip">clic para descartar · doble clic para verla sola</span>
    {#if solo}<button class="clear" on:click={() => (solo = null)}>Ver todas</button>{/if}
  </div>

  <div class="filter acento">
    <span class="lbl">Acento</span>
    {#each ACENTOS as a}
      <button
        class="tinta"
        class:on={acento === a.hex}
        aria-pressed={acento === a.hex}
        on:click={() => (acento = a.hex)}
        title={a.name}
      >
        <i style={a.hex ? `background:${a.hex}` : ''} class:def={!a.hex}></i>{a.name}
      </button>
    {/each}
    <label class="libre">
      Otro
      <input type="color" bind:value={acento} aria-label="Color de acento a medida" />
    </label>
    <span class="tip">sólo lo escucha la familia <b>Prisma pastel</b> — Y, Z y AA</span>
  </div>

  <main>
    <div class="head">
      <h1>{page.name}</h1>
      <p>{page.note}</p>
    </div>
    <svelte:component this={page.c} directions={shown} />
  </main>
</div>

<style>
  :global(body) { margin: 0; background: #fafafa; color: #14181a; }
  .wrap {
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
  }
  .top {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px; flex-wrap: wrap;
    padding: 12px 24px;
    background: #ffffffee; backdrop-filter: blur(8px);
    border-bottom: 1px solid #e5e7e8;
  }
  .brand { display: flex; flex-direction: column; }
  .brand strong { font-size: 14px; font-weight: 620; letter-spacing: -.01em; }
  .brand span { font-size: 12px; color: #71777c; }
  .pages { display: flex; gap: 2px; flex-wrap: wrap; }
  .pages button {
    font: inherit; font-size: 13px;
    padding: 6px 11px; border: 0; border-radius: 5px;
    background: transparent; color: #40454a; cursor: pointer;
  }
  .pages button:hover { background: #f0f1f2; }
  .pages button.on { background: #14181a; color: #fff; }

  .filter {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding: 10px 24px;
    border-bottom: 1px solid #e5e7e8;
    background: #fff;
    position: sticky; top: 61px; z-index: 39;
  }
  .lbl { font: 600 10px/1 ui-sans-serif, system-ui; letter-spacing: .09em; text-transform: uppercase; color: #8b9094; margin-right: 4px; }
  .chip {
    font: inherit; font-size: 12px;
    padding: 4px 9px; border: 1px solid #dfe1e3; border-radius: 999px;
    background: #fff; color: #24282b; cursor: pointer;
  }
  .chip b { font-family: ui-monospace, Menlo, monospace; font-size: 10.5px; margin-right: 3px; color: #71777c; }
  .chip:hover { border-color: #b2b6b9; }
  .chip.off { opacity: .38; text-decoration: line-through; }
  .chip.solo { background: #14181a; color: #fff; border-color: #14181a; }
  .chip.solo b { color: #b2b6b9; }
  .tip { font-size: 11px; color: #a3a8ac; margin-left: 4px; }

  /* La fila del acento NO se pega. La de arriba ya ocupa el top:61px, y dos
     barras pegadas al mismo offset se montan una encima de la otra; además el
     alto de la primera cambia según cuántos chips envuelvan, así que no hay
     número fijo que sirva. Es un control que se toca una vez, no uno que haga
     falta tener siempre a mano. */
  .acento { position: static; top: auto; z-index: auto; }
  .tinta {
    display: inline-flex; align-items: center; gap: 5px;
    font: inherit; font-size: 12px;
    padding: 4px 9px; border: 1px solid #dfe1e3; border-radius: 999px;
    background: #fff; color: #24282b; cursor: pointer;
  }
  .tinta:hover { border-color: #b2b6b9; }
  .tinta.on { background: #14181a; color: #fff; border-color: #14181a; }
  .tinta i {
    width: 11px; height: 11px; border-radius: 3px; flex: none;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .18);
  }
  /* «Por defecto» no tiene un color que mostrar: la muestra va en diagonal para
     que se lea como ausencia y no como un gris elegido. */
  .tinta i.def {
    background: linear-gradient(135deg, #fff 44%, #c9ced1 44%, #c9ced1 56%, #fff 56%);
  }
  .libre {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: #24282b;
    padding: 3px 9px 3px 10px; border: 1px solid #dfe1e3; border-radius: 999px;
  }
  .libre input {
    inline-size: 22px; block-size: 20px; padding: 0;
    border: 0; background: none; cursor: pointer;
  }
  .clear { font: inherit; font-size: 12px; padding: 4px 9px; border: 0; border-radius: 999px; background: #eaeced; cursor: pointer; }

  main { padding: 26px 24px 80px; max-width: 1680px; margin: 0 auto; }
  .head { margin-bottom: 20px; }
  h1 { margin: 0; font-size: 24px; font-weight: 620; letter-spacing: -.02em; }
  .head p { margin: 2px 0 0; font-size: 13.5px; color: #71777c; }

  @media (prefers-color-scheme: dark) {
    :global(body) { background: #101314; color: #edeff0; }
    .top { background: #14181aee; border-bottom-color: #2c3134; }
    .brand span, .head p { color: #8e9498; }
    .pages button { color: #bcc1c4; }
    .pages button:hover { background: #22282a; }
    .pages button.on { background: #edeff0; color: #14181a; }
    .filter { background: #14181a; border-bottom-color: #2c3134; }
    .chip { background: #1b2022; border-color: #2c3134; color: #edeff0; }
    .chip.solo { background: #edeff0; color: #14181a; }
    .clear { background: #22282a; color: #edeff0; }
    .tinta, .libre { background: #1b2022; border-color: #2c3134; color: #edeff0; }
    .tinta.on { background: #edeff0; color: #14181a; border-color: #edeff0; }
    .tinta i { box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }
    .tinta i.def {
      background: linear-gradient(135deg, #1b2022 44%, #6d7478 44%, #6d7478 56%, #1b2022 56%);
    }
  }
</style>
