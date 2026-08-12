<script>
  // THE CATALOGUE SHELL — the front door, and itself a demonstration.
  //
  // Everything in this file is built out of the same tokens and the same
  // components the pages document. There is no catalogue-only design language:
  // the bar at the top is a Toolbar's argument written by hand because the bar
  // has to work before the library is trusted, the chips are Pills, the theme
  // toggle and the accent picker are Segmented's argument at 32px. If the
  // system could not build its own front door, that would be the first thing a
  // developer should know about it.
  //
  // WHY THE ACCENT PICKER IS HERE AND NOT IN A PAGE
  //
  // The single most expensive misunderstanding a design system can create is
  // «to rebrand, fork the library». So the proof is on the front door, above the
  // fold, and it is not a screenshot: pressing a swatch writes four custom
  // properties on <html> and every button, every selected row, every switch and
  // every progress bar in every page follows — because none of them ever named
  // a colour. That is the whole argument for `--sx-accent` being a SLOT, made in
  // one click instead of three paragraphs.
  //
  // ROUTING IS THE HASH, deliberately. The library ships components; a router
  // would be scaffolding around them, and `vite preview` has no server to route
  // with. The hash also means every page in this catalogue has a URL somebody
  // can paste into a ticket.
  import { onMount } from 'svelte';
  import Pill from '../lib/Pill.svelte';

  import Superficies from './pages/Superficies.svelte';
  import Acciones from './pages/Acciones.svelte';
  import Formularios from './pages/Formularios.svelte';
  import Estructura from './pages/Estructura.svelte';
  import Tablas from './pages/Tablas.svelte';
  import Retroalimentacion from './pages/Retroalimentación.svelte';
  import Metricas from './pages/Métricas.svelte';

  // ── The families ─────────────────────────────────────────────────────────
  // The sentence beside each one is not a tagline: it is the question the family
  // answers, so that somebody who does not know the names can still find the
  // right directory on the first try.
  const FAMILIES = [
    {
      id: 'superficies',
      name: 'Superficies',
      dir: 'shell',
      count: 10,
      component: Superficies,
      says: 'Dónde se apoya todo. La tarjeta, el panel, la banda hundida, el aire entre las cosas, el cajón lateral y los veintitrés íconos. Nada de esto dice nada — para que lo que sí dice algo sea lo único con opinión en la pantalla.'
    },
    {
      id: 'acciones',
      name: 'Acciones',
      dir: 'action',
      count: 5,
      component: Acciones,
      says: 'Todo lo que hace que algo pase. Una vista tiene un solo primario, ocupado nunca es «disabled», y un control bloqueado puede cargar su motivo en vez de ser una pared.'
    },
    {
      id: 'formularios',
      name: 'Formularios',
      dir: 'form',
      count: 14,
      component: Formularios,
      says: 'Todo lo que una persona contesta. Catorce controles, casi todos con un envoltorio compartido, para que un formulario de nueve campos se lea como un formulario y no como nueve decisiones tomadas en nueve martes distintos.'
    },
    {
      id: 'estructura',
      name: 'Estructura',
      dir: 'nav',
      count: 9,
      component: Estructura,
      says: '«¿Dónde estoy?», «¿qué estoy mirando?» y «¿cómo llego a lo otro?». Encabezados, migas, pestañas, filtros que cuentan sobre el total, búsqueda con su atajo, y paginación que dice la frase antes que los números.'
    },
    {
      id: 'tablas',
      name: 'Tablas',
      dir: 'data',
      count: 4,
      component: Tablas,
      says: 'Una tabla no muestra registros: los compara. Columnas alineadas, cabecera fija, orden con aria-sort de verdad, y fichas cuando el contenedor deja de dar para comparar.'
    },
    {
      id: 'retroalimentacion',
      name: 'Retroalimentación',
      dir: 'feedback',
      count: 9,
      component: Retroalimentacion,
      says: 'Todo lo que el sistema contesta. Se elige por quién está esperando y cuánto: el sistema a una persona, una persona al sistema, algo que ya pasó, o una superficie sin nada que mostrar.'
    },
    {
      id: 'metricas',
      name: 'Métricas',
      dir: 'metric',
      count: 5,
      component: Metricas,
      says: 'Las cifras, y lo que hace legible a una cifra: qué cuenta, en qué se mide, contra qué se compara. Nada nunca es cero, y una estimación jamás se viste igual que una medición.'
    }
  ];

  // ── The three rules ──────────────────────────────────────────────────────
  // Numbered the same way the Tablas page numbers them, because a system whose
  // rules are numbered differently on two pages does not have three rules.
  const RULES = [
    {
      n: 1,
      title: 'El cromo es acromático',
      body:
        'El fondo, las líneas y la profundidad son neutros. El único color que aparece es vocabulario: cinco tonos que significan lo mismo en mantenimiento, en facturación y en inventario. El acento no es un tono — es un hueco que cada producto llena, y por eso el interruptor de arriba funciona.'
    },
    {
      n: 2,
      title: 'El color nunca viaja solo',
      body:
        'Un tono llega siempre con su marca y su palabra. La marca se distingue por forma a 9 px, así que el estado sobrevive una fotocopia, un sol de mediodía y a alguien que no separa el verde del ámbar. Quitá el color de esta página y no se pierde un solo dato.'
    },
    {
      n: 3,
      title: 'Las cifras que se comparan se alinean',
      body:
        'Tabulares, a la derecha, con cero cortado, en columna. Dos totales que no se alinean son dos totales que nadie compara. Y al revés: una frase corrida en cifras tabulares se lee como un tartamudeo, así que la prosa nunca las lleva.'
    }
  ];

  // ── El tema ──────────────────────────────────────────────────────────────
  // `data-sx-theme` on <html> is the same attribute tokens.css binds the dark
  // theme to, so this toggle is the real mechanism and not a catalogue trick.
  let theme = 'light';
  function setTheme(next) {
    theme = next;
    document.documentElement.dataset.sxTheme = next === 'dark' ? 'dark' : '';
    if (next !== 'dark') delete document.documentElement.dataset.sxTheme;
    try { localStorage.setItem('sx-theme', next); } catch { /* private mode */ }
  }

  // ── El acento ────────────────────────────────────────────────────────────
  // Four properties, written on <html>. `soft` and `edge` mix against
  // #FFFFFF FIJO — el mismo criterio que usa tokens.js para el acento sin
  // ligar de la librería (ver README, «Ligar el acento»): es la receta de
  // Nácar, una dirección de luz sobre blanco, no una fórmula que se re-liga
  // sola en oscuro.
  //
  // ACÁ MEZCLABA CONTRA `var(--sx-surface)` EN VEZ DE BLANCO FIJO, y era un
  // defecto, no una mejora: parecía «auto-ajustarse» a los dos temas, pero
  // sólo movía dos de los tres derivados del acento. El quinto —
  // `--sx-accent-pick`, la fila seleccionada— no lo toca este interruptor;
  // sigue la fórmula de tokens.js, que en oscuro mezcla al 16 % contra la
  // superficie oscura, un porcentaje y una base distintos de los que este
  // catálogo usaba para `soft`/`edge`. "Auto-ajustar" sólo dos de los tres
  // no los alineaba con el tercero — los desalineaba de una forma nueva: con
  // las tres marcas puestas, en oscuro, la fila seleccionada quedaba más
  // débil que el hover por defecto (1.08–1.12 contra la superficie). Un
  // producto con tema oscuro tiene que declarar su propio bloque de las
  // cuatro propiedades bajo `[data-sx-theme="dark"]` — ver «Deuda de Nácar»
  // en el README — precisamente porque no hay una fórmula que se re-ligue
  // sola y deje a los tres derivados de acuerdo entre sí.
  //
  // «Sin marca» quita las cuatro, que es el default honesto: sin ligar nada,
  // el acento resuelve al morado de Nácar (`#6541BE`) — un primario usable
  // de verdad porque `--sx-chrome-tint` ya vale ese mismo morado — y no a la
  // tinta más profunda de la rampa neutra, que era la fórmula de la
  // dirección anterior y ya no la de ésta.
  const BRANDS = [
    { id: 'none', label: 'Sin marca', hex: '', ink: '' },
    { id: 'opra', label: 'Opra', hex: '#A33F26', ink: '#FFFFFF' },
    { id: 'sarion', label: 'Sarion', hex: '#2F6B4F', ink: '#FFFFFF' },
    { id: 'faro', label: 'Faro', hex: '#5A3E9B', ink: '#FFFFFF' }
  ];
  let brand = 'none';

  function setBrand(id) {
    brand = id;
    const b = BRANDS.find((x) => x.id === id);
    const root = document.documentElement.style;
    if (!b || !b.hex) {
      for (const p of ['--sx-accent', '--sx-accent-ink', '--sx-accent-soft', '--sx-accent-edge']) {
        root.removeProperty(p);
      }
      return;
    }
    root.setProperty('--sx-accent', b.hex);
    root.setProperty('--sx-accent-ink', b.ink);
    root.setProperty('--sx-accent-soft', `color-mix(in srgb, ${b.hex} 10%, #FFFFFF)`);
    root.setProperty('--sx-accent-edge', `color-mix(in srgb, ${b.hex} 28%, #FFFFFF)`);
  }

  // Written as a string constant rather than inline in the markup: the snippet
  // contains `{@html …}`, and a Svelte template would try to execute it.
  const CORE_SNIPPET =
    "import { hostTokens, hostBase } from '@strix/frontend-lib';\n\n" +
    '<!-- …y en el <style> del componente raíz del módulo: -->\n' +
    '<style>{@html hostTokens() + hostBase()}</style>';

  // ── La ruta ──────────────────────────────────────────────────────────────
  let route = '';
  const read = () => (route = (location.hash || '#/').replace(/^#\/?/, ''));

  $: current = FAMILIES.find((f) => f.id === route) ?? null;
  $: title = current ? `${current.name} · Strix` : 'Strix · sistema de diseño';

  onMount(() => {
    read();

    // `?theme=dark&brand=opra` — the two switches are linkable.
    //
    // This is not a screenshot affordance bolted on: «mirá ESTO en oscuro» is
    // the sentence a bug report about a design system is made of, and a toggle
    // that only exists as a click is a toggle nobody can send. The query string
    // wins over the remembered choice, because an explicit link is an intent.
    const params = new URLSearchParams(location.search);
    const wanted = params.get('theme');
    const wantedBrand = params.get('brand');

    try {
      const saved = localStorage.getItem('sx-theme');
      if (saved === 'dark') setTheme('dark');
    } catch { /* private mode */ }

    if (wanted === 'dark' || wanted === 'light') setTheme(wanted);
    if (wantedBrand && BRANDS.some((b) => b.id === wantedBrand)) setBrand(wantedBrand);

    addEventListener('hashchange', read);
    return () => removeEventListener('hashchange', read);
  });

  // Going to another family must not leave the reader half-way down the old
  // page. `$:` and not a click handler, so a pasted URL behaves the same way.
  $: if (typeof window !== 'undefined' && route !== undefined) scrollTop(route);
  let lastRoute = null;
  function scrollTop(r) {
    if (r === lastRoute) return;
    lastRoute = r;
    queueMicrotask(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  }
</script>

<svelte:head><title>{title}</title></svelte:head>

<a class="skip" href="#contenido">Saltar al contenido</a>

<header class="bar">
  <div class="barin">
    <a class="brand" href="#/" aria-current={current ? undefined : 'page'}>
      <!-- The mark is a Pill's own critical square, an attention triangle and a
           positive tick stacked: the system's alphabet, used as a signature. -->
      <svg class="logo" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="1.5" y="1.5" width="7" height="7" rx="2" fill="currentColor" />
        <path d="M15 1.8 19.2 9H10.8z" fill="currentColor" opacity=".55" />
        <path d="M2 14.6 5.4 18 11 11.4" fill="none" stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="wordmark">Strix</span>
      <span class="sx-cap tag">Sistema de diseño</span>
    </a>

    <nav class="links" aria-label="Familias">
      {#each FAMILIES as f (f.id)}
        <a href="#/{f.id}" class="link" class:on={route === f.id}
          aria-current={route === f.id ? 'page' : undefined}>{f.name}</a>
      {/each}
    </nav>

    <div class="tools">
      <!-- ROLE=GROUP AND ARIA-PRESSED, not role="tab": these do not swap a
           panel, they change how the same thing is drawn — which is exactly the
           line Segmented and Tabs are separated along. -->
      <div class="seg" role="group" aria-label="Marca del producto">
        {#each BRANDS as b (b.id)}
          <button
            type="button"
            class="sw"
            class:on={brand === b.id}
            aria-pressed={brand === b.id}
            title={b.hex ? `Acento de ${b.label} · ${b.hex}` : 'Sin marca: el acento resuelve a la tinta neutra'}
            on:click={() => setBrand(b.id)}
          >
            <span class="dot" style={b.hex ? `background:${b.hex}` : ''} class:unbound={!b.hex} aria-hidden="true"></span>
            <span class="swl">{b.label}</span>
          </button>
        {/each}
      </div>

      <div class="seg" role="group" aria-label="Tema">
        <button type="button" class="sw" class:on={theme === 'light'} aria-pressed={theme === 'light'}
          on:click={() => setTheme('light')}>
          <svg class="ti" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3.1 3.1l1.3 1.3M11.6 11.6l1.3 1.3M12.9 3.1l-1.3 1.3M4.4 11.6l-1.3 1.3"
              fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span class="swl">Claro</span>
        </button>
        <button type="button" class="sw" class:on={theme === 'dark'} aria-pressed={theme === 'dark'}
          on:click={() => setTheme('dark')}>
          <svg class="ti" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M13.4 9.6A5.9 5.9 0 0 1 6.4 2.6 5.9 5.9 0 1 0 13.4 9.6z"
              fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <span class="swl">Oscuro</span>
        </button>
      </div>
    </div>
  </div>
</header>

<main id="contenido">
  {#if current}
    <svelte:component this={current.component} />
  {:else}
    <!-- ═══ LA PORTADA ═══════════════════════════════════════════════════ -->
    <div class="home">
      <section class="hero">
        <p class="sx-cap">Strix · frontend-lib 0.1.0</p>
        <h1>Un sistema, no siete carpetas.</h1>
        <p class="lede">
          Cincuenta y siete componentes Svelte y un juego de tokens para todos los frontends
          del ecosistema Hivestrix: la Shell, los módulos Core que se dibujan dentro de un
          shadow root, y cualquier app de SvelteKit que venga después. Un solo vocabulario, para
          que alguien que pasa de mantenimiento a facturación no tenga que aprenderlo otra vez.
        </p>

        <!-- ── La firma, haciendo su trabajo ─────────────────────────────
             No una muestra de colores: una fila de estado de verdad, y debajo
             la misma fila como filtro. Es el componente cuya FORMA es la regla
             del sistema, así que aparece antes que las reglas escritas. -->
        <div class="sig">
          <div class="sigrow">
            <p class="sx-cap">Una flota, en una línea</p>
            <div class="pills">
              <Pill tone="critical">3 vencidas</Pill>
              <Pill tone="attention">5 vencen esta semana</Pill>
              <Pill tone="positive">41 al día</Pill>
              <Pill tone="info">2 sin lecturas</Pill>
              <Pill tone="neutral" mark={false}>51 equipos</Pill>
            </div>
          </div>
          <div class="sigrow">
            <p class="sx-cap">La misma fila, como filtro</p>
            <div class="pills">
              <Pill tone="critical" pressed={true}>3 vencidas</Pill>
              <Pill tone="attention" pressed={false}>5 vencen esta semana</Pill>
              <Pill tone="positive" pressed={false}>41 al día</Pill>
            </div>
          </div>
          <p class="signote">
            <b>Tono + marca + palabra</b>, y nunca menos que las tres. El cuadrado, el triángulo,
            el visto, el anillo y la barra se distinguen por forma a 9&nbsp;px: en blanco y negro
            esta fila sigue diciendo exactamente lo mismo. Probalo — apagá el color de tu monitor,
            o mirá la fila en el tema oscuro con el interruptor de arriba.
          </p>
        </div>
      </section>

      <!-- ── Las tres reglas ────────────────────────────────────────────── -->
      <section class="rules" aria-labelledby="reglas">
        <h2 id="reglas">Las tres reglas sobre las que se apoya todo</h2>
        <p class="sub">
          No son principios: son restricciones que los componentes ya hacen cumplir.
          Cada una se puede verificar en esta página sin leer una línea de código.
        </p>
        <ol>
          {#each RULES as r (r.n)}
            <li>
              <span class="rn sx-num" aria-hidden="true">{r.n}</span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </li>
          {/each}
        </ol>
      </section>

      <!-- ── La prueba del acento ───────────────────────────────────────── -->
      <section class="proof" aria-labelledby="acento">
        <div class="proofsay">
          <h2 id="acento">Un producto se marca; nadie forkea nada</h2>
          <p>
            El acento es un <b>hueco</b>, no un color. Ningún componente de esta librería nombra
            jamás un color de marca: piden <span class="sx-id">--sx-accent</span> y sus tres
            compañeros, y eso es todo lo que un producto liga —&nbsp;una vez, en su raíz.
          </p>
          <p>
            Apretá una marca arriba a la derecha y mirá esta tarjeta, el botón, la barra y la
            fila seleccionada. Después entrá a cualquier familia: sigue ligado. Sin marca ligada,
            el acento resuelve al morado de Nácar, un primario usable de verdad y no un hueco
            vacío esperando configuración.
          </p>
          <pre class="code"><code>{`:root {
  --sx-accent:      #A33F26;
  --sx-accent-ink:  #FFFFFF;
  --sx-accent-soft: color-mix(in srgb, #A33F26 10%, #FFFFFF);
  --sx-accent-edge: color-mix(in srgb, #A33F26 28%, #FFFFFF);
}`}</code></pre>
        </div>

        <div class="proofshow" aria-hidden="true">
          <p class="sx-cap">Lo que sigue al acento</p>
          <div class="fake">
            <span class="fbtn">Registrar servicio</span>
            <span class="ftrack"><span class="ffill"></span></span>
            <span class="frow on">BAT014 · seleccionada</span>
            <span class="frow">CL445926</span>
            <span class="fsoft">Fondo suave · <span class="sx-id">--sx-accent-soft</span></span>
          </div>
        </div>
      </section>

      <!-- ── Las familias ───────────────────────────────────────────────── -->
      <section class="fams" aria-labelledby="familias">
        <h2 id="familias">Las siete familias</h2>
        <p class="sub">
          Cada carpeta de <span class="sx-id">src/lib</span> tiene una página, y cada página
          muestra sus componentes en los estados que de verdad se rompen: vacío, cargando,
          bloqueado, fallado. Un catálogo que sólo enseña el camino feliz es exactamente lo que
          hace que un sistema de diseño se pudra.
        </p>
        <ul class="grid">
          {#each FAMILIES as f (f.id)}
            <li>
              <a class="fam" href="#/{f.id}">
                <p class="famtop">
                  <span class="famname">{f.name}</span>
                  <span class="famdir sx-id">src/lib/{f.dir}</span>
                </p>
                <p class="famsays">{f.says}</p>
                <p class="famfoot">
                  <span class="sx-num">{f.count}</span>
                  <span>{f.count === 1 ? 'componente' : 'componentes'}</span>
                  <span class="go" aria-hidden="true">→</span>
                </p>
              </a>
            </li>
          {/each}
        </ul>
      </section>

      <!-- ── Cómo se consume ────────────────────────────────────────────── -->
      <section class="how" aria-labelledby="consumo">
        <h2 id="consumo">Cómo se consume</h2>
        <div class="two">
          <div>
            <h3 class="sx-cap">Una app de SvelteKit</h3>
            <pre class="code"><code>{`import '@strix/frontend-lib/tokens.css';
import '@strix/frontend-lib/base.css';
import { Button, Table } from '@strix/frontend-lib';`}</code></pre>
            <p>Una vez, en la raíz. Las custom properties heredan hacia abajo y ya está.</p>
          </div>
          <div>
            <h3 class="sx-cap">Un módulo Core en un shadow root</h3>
            <pre class="code"><code>{CORE_SNIPPET}</code></pre>
            <p>
              Un stylesheet enlazado no cruza la frontera del shadow root, y un CSP estricto
              prohíbe el <span class="sx-id">@import</span> que lo haría. Está todo en el README.
            </p>
          </div>
        </div>
      </section>

      <footer class="foot">
        <p>
          Este catálogo está construido con la librería que documenta: la barra de arriba, las
          tarjetas de familia y esta nota usan los mismos tokens, la misma tipografía y la misma
          escala de espaciado que cualquier pantalla de producto. No hay un lenguaje visual de
          catálogo.
        </p>
      </footer>
    </div>
  {/if}
</main>

<style>
  /* ── El salto ─────────────────────────────────────────────────────────── */
  .skip {
    position: absolute;
    left: var(--sx-s-3);
    top: calc(var(--sx-s-3) * -10);
    z-index: var(--sx-z-toast);
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    color: var(--sx-ink);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-2);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    text-decoration: none;
    transition: top var(--sx-fast) var(--sx-ease);
  }
  .skip:focus-visible { top: var(--sx-s-3); }

  /* ── La barra ─────────────────────────────────────────────────────────── */
  .bar {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
    background: var(--sx-surface);
    /* Profundidad, no una línea: la barra está POR ENCIMA de lo que pasa
       debajo, y arriba se dibuja con luz en todo el resto del sistema. */
    box-shadow: var(--sx-e-1);
  }
  .barin {
    display: flex;
    align-items: center;
    gap: var(--sx-s-4);
    flex-wrap: wrap;
    max-width: 1180px;
    margin: 0 auto;
    padding: var(--sx-s-3) var(--sx-s-5);
  }

  .brand {
    display: inline-flex;
    align-items: baseline;
    gap: var(--sx-s-2);
    color: var(--sx-ink);
    text-decoration: none;
    flex: none;
  }
  .logo { width: 20px; height: 20px; align-self: center; color: var(--sx-accent); flex: none; }
  .wordmark {
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.03em;
  }
  .tag { color: var(--sx-ink-3); }

  .links {
    display: flex;
    align-items: center;
    gap: var(--sx-s-1);
    flex: 1 1 auto;
    min-width: 0;
    /* Se desplaza en vez de envolver: una barra de familias en dos líneas deja
       de leerse como una barra. */
    overflow-x: auto;
    scrollbar-width: none;
  }
  .links::-webkit-scrollbar { display: none; }

  .link {
    flex: none;
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1);
    color: var(--sx-ink-3);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--sx-fast) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }
  .link:hover { color: var(--sx-ink); background: var(--sx-sunk); }
  /* La sección donde estás: tinta llena, relleno suave del acento y
     `aria-current`. Tres señales, ninguna de ellas sólo color. */
  .link.on { color: var(--sx-ink); background: var(--sx-accent-soft); }

  .tools { display: flex; align-items: center; gap: var(--sx-s-2); flex: none; }

  /* La pista hundida con un segmento levantado: el elegido parece la superficie
     sobre la que está el contenido, el resto parece el hueco donde se apoya. */
  .seg {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    background: var(--sx-sunk);
    border-radius: var(--sx-r-pill);
  }
  .sw {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    padding: var(--sx-s-1) var(--sx-s-3);
    border: 0;
    border-radius: var(--sx-r-pill);
    background: none;
    color: var(--sx-ink-3);
    font-family: var(--sx-font);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    line-height: 1.5;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .sw:hover:not(.on) { color: var(--sx-ink); }
  .sw.on { background: var(--sx-surface); color: var(--sx-ink); box-shadow: var(--sx-e-1); }
  .sw:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: -3px; }

  .dot {
    width: 11px;
    height: 11px;
    flex: none;
    border-radius: var(--sx-r-pill);
    background: var(--sx-ink);
  }
  /* «Sin marca» no es un color: es la ausencia de una ligadura, así que se
     dibuja como un anillo vacío y no como una muestra más. */
  .dot.unbound { background: none; box-shadow: inset 0 0 0 2px var(--sx-ink-3); }
  .ti { width: 13px; height: 13px; flex: none; }

  /* ── La página ────────────────────────────────────────────────────────── */
  .home {
    max-width: 1180px;
    margin: 0 auto;
    padding: var(--sx-s-12) var(--sx-s-5) var(--sx-s-20);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-16);
  }

  .hero h1 {
    margin: var(--sx-s-3) 0 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.035em;
    line-height: 1.05;
    max-width: 18ch;
    text-wrap: balance;
  }
  .lede {
    margin: var(--sx-s-5) 0 0;
    max-width: 66ch;
    font-size: var(--sx-t-lg);
    line-height: 1.5;
    color: var(--sx-ink-2);
  }

  .sig {
    margin-top: var(--sx-s-10);
    padding: var(--sx-s-6);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-5);
  }
  .sigrow { display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .pills { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); }
  .signote {
    margin: 0;
    padding-top: var(--sx-s-4);
    box-shadow: inset 0 1px 0 var(--sx-line);
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-2);
    max-width: 74ch;
  }

  /* ── Las reglas ───────────────────────────────────────────────────────── */
  h2 {
    margin: 0;
    font-size: var(--sx-t-2xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.03em;
    line-height: 1.15;
    max-width: 22ch;
    text-wrap: balance;
  }
  .sub {
    margin: var(--sx-s-3) 0 0;
    max-width: 62ch;
    font-size: var(--sx-t-md);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }

  .rules ol {
    list-style: none;
    margin: var(--sx-s-8) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(19rem, 100%), 1fr));
    gap: var(--sx-s-1);
    background: var(--sx-line);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
  }
  /* La cara de un instrumento: una sola sombra, dividida por hilos de un píxel.
     Es exactamente lo que hace StatStrip, y por la misma razón. */
  .rules li {
    display: flex;
    align-items: flex-start;
    gap: var(--sx-s-4);
    padding: var(--sx-s-6);
    background: var(--sx-surface);
  }
  .rn {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--sx-s-8);
    height: var(--sx-s-8);
    border-radius: var(--sx-r-pill);
    background: var(--sx-accent);
    color: var(--sx-accent-ink);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-bold);
  }
  .rules h3 {
    margin: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
  }
  .rules li p {
    margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }

  /* ── La prueba ────────────────────────────────────────────────────────── */
  /* `minmax(min(Xrem, 100%), 1fr)` y NUNCA `minmax(Xrem, 1fr)`.
     La segunda forma le pone al track un mínimo DURO: en cuanto la columna
     útil es más angosta que X, la grilla se pasa del contenedor y la página
     entera scrollea de lado — que es la única cosa que hace que una interfaz
     se sienta rota en vez de apretada. `min(X, 100%)` deja que el track ceda
     antes que el documento. Esto se rompió a 390 px y se vio en la captura. */
  .proof {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: var(--sx-s-8);
    align-items: start;
  }
  .proofsay { min-width: 0; }
  .proofsay p {
    margin: var(--sx-s-4) 0 0;
    max-width: 60ch;
    font-size: var(--sx-t-md);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }

  .code {
    margin: var(--sx-s-5) 0 0;
    padding: var(--sx-s-4);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-2);
    overflow-x: auto;
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-xs);
    line-height: 1.65;
    color: var(--sx-ink-2);
  }
  .code code { font: inherit; white-space: pre; }

  .proofshow {
    padding: var(--sx-s-5);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
  }
  .fake { display: flex; flex-direction: column; gap: var(--sx-s-3); margin-top: var(--sx-s-4); }
  .fbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--sx-s-10);
    padding-inline: var(--sx-s-4);
    border-radius: var(--sx-r-2);
    background: var(--sx-accent);
    color: var(--sx-accent-ink);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    box-shadow: var(--sx-e-inset), var(--sx-e-1);
  }
  .ftrack {
    height: var(--sx-s-2);
    border-radius: var(--sx-r-pill);
    background: var(--sx-sunk);
    overflow: hidden;
  }
  .ffill { display: block; width: 62%; height: 100%; background: var(--sx-accent); }
  .frow {
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
  }
  /* PASAJERO CONTRA PERSISTENTE — la distinción que el README dedica un
     párrafo entero a no dejar mezclar (ya se cometió dos veces en la
     librería, dice, y la salida es un relleno por cada duración). Esta fila
     está marcada «seleccionada» en el marcado; pintarla con
     --sx-accent-soft (el HOVER, pasajero) en vez de --sx-accent-pick (la
     selección, persistente) hubiera sido la tercera vez, en la propia
     demostración que el README señala como el ejemplo canónico. La muestra
     de --sx-accent-soft ya tiene su propio bloque, .fsoft, ahí abajo. */
  .frow.on { background: var(--sx-accent-pick); color: var(--sx-ink); font-weight: var(--sx-w-medium); }
  .fsoft {
    padding: var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-accent-soft);
    border: 1px solid var(--sx-accent-edge);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-2);
  }

  /* ── Las familias ─────────────────────────────────────────────────────── */
  .grid {
    list-style: none;
    margin: var(--sx-s-8) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));
    gap: var(--sx-s-4);
  }
  .fam {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: var(--sx-s-3);
    padding: var(--sx-s-5);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    color: var(--sx-ink);
    text-decoration: none;
    transition: transform var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .fam:hover { transform: translateY(-1px); box-shadow: var(--sx-e-2); }
  .fam:active { transform: none; }
  .fam:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  .famtop { margin: 0; display: flex; align-items: baseline; gap: var(--sx-s-3); flex-wrap: wrap; }
  .famname {
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
  }
  .famdir { font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  .famsays {
    margin: 0;
    flex: 1 1 auto;
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }
  .famfoot {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--sx-s-2);
    padding-top: var(--sx-s-3);
    box-shadow: inset 0 1px 0 var(--sx-line);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
  .famfoot .go { margin-left: auto; color: var(--sx-ink-2); font-size: var(--sx-t-md); }

  /* ── El consumo ───────────────────────────────────────────────────────── */
  .two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(24rem, 100%), 1fr)); gap: var(--sx-s-6); margin-top: var(--sx-s-6); }
  .two > div { min-width: 0; }
  .two h3 { margin: 0; }
  .two p { margin: var(--sx-s-3) 0 0; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-2); max-width: 56ch; }

  .foot {
    padding-top: var(--sx-s-8);
    box-shadow: inset 0 1px 0 var(--sx-line);
  }
  .foot p { margin: 0; max-width: 74ch; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-3); }

  /* ── Angosto ──────────────────────────────────────────────────────────── */
  /* Debajo de esto la barra deja de ser una barra: la marca y las herramientas
     comparten la primera línea y las familias se desplazan en la segunda. */
  @media (max-width: 1040px) {
    .barin { gap: var(--sx-s-3); }
    .links { order: 3; flex-basis: 100%; }
    .tools { margin-left: auto; }
    .proof { grid-template-columns: minmax(0, 1fr); }
  }

  @media (max-width: 720px) {
    .home { padding: var(--sx-s-8) var(--sx-s-4) var(--sx-s-16); gap: var(--sx-s-12); }
    .hero h1 { font-size: var(--sx-t-2xl); }
    .lede { font-size: var(--sx-t-md); }
    h2 { font-size: var(--sx-t-xl); }
    .sig { padding: var(--sx-s-4); }
    /* La etiqueta del tema y de la marca se van: el punto de color y el ícono
       dicen lo mismo, y `aria-label` del grupo sigue nombrándolos. */
    .swl { display: none; }
    .sw { padding-inline: var(--sx-s-2); }
    .tag { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .fam, .link, .sw, .skip { transition: none; }
    .fam:hover { transform: none; }
  }
</style>
