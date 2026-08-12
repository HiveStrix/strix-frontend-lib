<script>
  // ACCIONES — the catalogue page for the action family.
  //
  // It is written to be READ, not skimmed: every component appears in the states
  // it will actually be in on a Tuesday — blocked, working, failed, empty — and
  // every one of them says when NOT to use it. A catalogue that only shows the
  // happy path is how a design system rots: people copy the demo, the demo has
  // no failure in it, and six months later every screen invents its own.
  //
  // Every demo is a real thing from a Costa Rican yard or workshop: BAT014 is a
  // concrete mixer, CL445926 is a HINO truck, PUNT-3M is a shoring post that is
  // never a tracked machine.
  import { TOKENS, TOKENS_DARK } from '../../lib/tokens.js';
  import Pill from '../../lib/Pill.svelte';
  import Button from '../../lib/action/Button.svelte';
  import ButtonGroup from '../../lib/action/ButtonGroup.svelte';
  import IconButton from '../../lib/action/IconButton.svelte';
  import Menu from '../../lib/action/Menu.svelte';
  import SplitButton from '../../lib/action/SplitButton.svelte';

  // ── El índice ─────────────────────────────────────────────────────────────
  // Mismo componente que Superficies, Estructura, Métricas, Retroalimentación
  // y Tablas. «Las dos pieles» entra — es una sección de verdad, no un anexo —
  // y «Lo que esta familia no hace» se queda afuera, igual que el cierre de
  // esas otras cinco páginas.
  const TOC = [
    ['regla', 'Un solo primario'], ['dos', 'Dos acciones iguales'], ['button', 'Button'],
    ['estados', 'Los estados'], ['group', 'ButtonGroup'], ['iconbutton', 'IconButton'],
    ['menu', 'Menu'], ['split', 'SplitButton'], ['pieles', 'Las dos pieles']
  ];

  // ── Glyphs ────────────────────────────────────────────────────────────────
  // Inline on purpose: the icon family is somebody else's to build, and this
  // page needed marks before it existed. Inner markup on a 24×24 grid, stroked
  // with `currentColor`, which is the contract Menu's items already use.
  const I = {
    plus:     '<path d="M12 5v14M5 12h14"/>',
    check:    '<path d="M20 6 9 17l-5-5"/>',
    x:        '<path d="M18 6 6 18M6 6l12 12"/>',
    trash:    '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
    printer:  '<path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2M7 15h10v6H7z"/>',
    pencil:   '<path d="M4 20h4L20 8l-4-4L4 16v4z"/>',
    gauge:    '<path d="M12 21a9 9 0 1 1 9-9M12 12l5-3"/>',
    wrench:   '<path d="M15 4a5 5 0 0 0-6.2 6.6L4 15.4V20h4.6l4.8-4.8A5 5 0 0 0 20 9l-3 3-2-2 3-3a5 5 0 0 0-3-3z"/>',
    copy:     '<path d="M9 9h10v10H9zM5 15V5h10"/>',
    refresh:  '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4.5V9.5h-5"/>',
    box:      '<path d="M3 8l9-4 9 4-9 4-9-4zM3 8v8l9 4 9-4V8"/>',
    slash:    '<path d="M5 19 19 5"/>',
    alert:    '<path d="M12 3 2 20h20L12 3zM12 10v4.5M12 17.6v.01"/>'
  };
  const svg = (n, s = 16) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] ?? ''}</svg>`;

  // A dark island built from the tokens themselves rather than from a class, so
  // the proof is the same values a real product would bind. Both skins, one
  // screen, no toggling back and forth to compare.
  const DARK = Object.entries(TOKENS_DARK).map(([k, v]) => `${k}:${v}`).join(';');
  // EL «CLARO» NECESITABA SU PROPIA ISLA, Y NO LA TENÍA. Encontrado en el
  // barrido visual: con el catálogo entero en tema oscuro, el panel «Claro»
  // no llevaba ningún token propio — heredaba lo que hubiera alrededor, que
  // ya era oscuro — así que las «dos pieles» se volvían la misma piel dos
  // veces, justo cuando alguien mira esta sección para comprobar que oscuro
  // funciona. Mismas 36 claves que DARK, tomadas de TOKENS en vez de
  // TOKENS_DARK, para que las dos islas se construyan con el mismo mecanismo
  // y ninguna dependa del interruptor de arriba de la página.
  const LIGHT = Object.keys(TOKENS_DARK).map((k) => `${k}:${TOKENS[k]}`).join(';');

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── The failing save ──────────────────────────────────────────────────────
  // The first attempt fails on purpose. An error that does not name the recovery
  // is half an error, so this one names the folio, says what is wrong with it,
  // and offers the two ways out.
  let saveState = 'idle'; // idle | busy | error | done
  let attempts = 0;
  async function save() {
    saveState = 'busy';
    await wait(1400);
    attempts += 1;
    saveState = attempts === 1 ? 'error' : 'done';
  }
  function resetSave() {
    saveState = 'idle';
    attempts = 0;
  }

  // ── The two equal doors ───────────────────────────────────────────────────
  let verdict = '';

  // ── The busy toggle ───────────────────────────────────────────────────────
  let working = false;
  async function runOnce() {
    working = true;
    await wait(1800);
    working = false;
  }

  // ── Menus ─────────────────────────────────────────────────────────────────
  let picked = '';
  const rowItems = [
    { id: 'sheet',   label: 'Abrir la ficha',        icon: I.box },
    { id: 'reading', label: 'Registrar lectura',     icon: I.gauge },
    { id: 'order',   label: 'Generar orden de trabajo', icon: I.wrench, hint: '3' },
    { sep: true },
    { id: 'retire',  label: 'Dar de baja', icon: I.trash, tone: 'critical',
      disabled: true, reason: 'BAT014 tiene un servicio sin cerrar (OT-0042).' }
  ];

  const exportItems = [
    { id: 'pdf',      label: 'Exportar PDF' },
    { id: 'filtered', label: 'Exportar solo lo filtrado', hint: '18' },
    { sep: true },
    { id: 'print',    label: 'Imprimir el libro', icon: I.printer }
  ];

  // ── The equipment rows ────────────────────────────────────────────────────
  const rows = [
    { code: 'BAT014',   name: 'Batidora de concreto, eléctrica', tone: 'critical',  state: 'Vencido' },
    { code: 'CL445926', name: 'HINO 300 · Bodega Opra',          tone: 'attention', state: 'en 5 d' },
    { code: 'BAT007',   name: 'Batidora de concreto, gasolina',  tone: 'positive',  state: 'Al día' }
  ];

  // ── Focus demonstration ───────────────────────────────────────────────────
  let solidNode = null;

  // ── Copiar ────────────────────────────────────────────────────────────────
  let copied = '';
  let failed = '';
  let timer;
  async function copy(key) {
    try {
      await navigator.clipboard.writeText(CODE[key]);
      copied = key;
      failed = '';
    } catch {
      // The catalogue eats its own cooking: the failure names the way out.
      copied = '';
      failed = key;
    }
    clearTimeout(timer);
    timer = setTimeout(() => { copied = ''; failed = ''; }, 2600);
  }

  const CODE = {
    primary:
`<!-- Una vista, un primario. Todo lo demás es outline o ghost. -->
<ButtonGroup label="Acciones del servicio">
  <Button variant="solid" on:click={guardar}>Guardar servicio</Button>
  <Button on:click={imprimir}>Imprimir</Button>
  <Button variant="ghost" on:click={cancelar}>Cancelar</Button>
</ButtonGroup>`,

    fork:
`<!-- Dos respuestas honestamente iguales: ninguna se lleva el relleno. -->
<p>El código PUNT-3M no está asignado. ¿Qué es?</p>
<ButtonGroup label="Qué es el código PUNT-3M">
  <Button on:click={esMaquina}>Es una máquina</Button>
  <Button on:click={esGranel}>Es a granel</Button>
</ButtonGroup>
<Button variant="ghost" size="sm" on:click={descartar}>Descartar</Button>`,

    variants:
`<Button variant="solid">Guardar</Button>
<Button>Imprimir</Button>              <!-- outline: el que se usa siempre -->
<Button variant="ghost">Cancelar</Button>
<Button variant="danger">Eliminar</Button>   <!-- solo en la confirmación -->`,

    icons:
`<Button variant="solid">
  <span slot="icon">{@html svg('plus')}</span>
  Registrar equipo
</Button>

<IconButton label="Editar el equipo" on:click={editar}>
  {@html svg('pencil')}
</IconButton>`,

    busy:
`<!-- El ancho no se mueve: la etiqueta se queda en la caja y el anillo
     se dibuja encima. Y NO usa el atributo disabled, así que el foco
     del teclado no se cae al <body> a mitad de guardado. -->
<Button variant="solid" busy={guardando} on:click={guardar}>
  Guardar servicio
</Button>`,

    reason:
`<!-- Sin razón: atributo disabled. Inalcanzable, y honesto solo si el
     motivo ya está escrito en la pantalla. -->
<Button disabled>Generar orden</Button>

<!-- Con razón: aria-disabled. Sigue enfocable, y el motivo llega al
     hover y al lector de pantalla. Escribilo también a la vista. -->
<Button disabled reason="BAT014 no tiene plan asignado.">
  Generar orden
</Button>`,

    group:
`<!-- Fila: cosas distintas que conviven. -->
<ButtonGroup label="Acciones del servicio" stack>
  <Button variant="solid">Guardar</Button>
  <Button variant="ghost">Cancelar</Button>
</ButtonGroup>

<!-- Pegado: la MISMA acción con objetos distintos. -->
<ButtonGroup attached label="Horizonte del programa">
  <Button size="sm">30 días</Button>
  <Button size="sm">3 meses</Button>
  <Button size="sm">1 año</Button>
</ButtonGroup>`,

    menu:
`<Menu
  compact
  label="Más acciones de BAT014"
  items={[
    { id: 'sheet',   label: 'Abrir la ficha' },
    { id: 'reading', label: 'Registrar lectura' },
    { sep: true },
    { id: 'retire',  label: 'Dar de baja', tone: 'critical',
      disabled: true, reason: 'BAT014 tiene un servicio sin cerrar (OT-0042).' }
  ]}
  on:select={(e) => correr(e.detail.id)} />`,

    split:
`<SplitButton
  variant="solid"
  label="Exportar CSV"
  items={[
    { id: 'pdf',      label: 'Exportar PDF' },
    { id: 'filtered', label: 'Exportar solo lo filtrado', hint: '18' }
  ]}
  on:click={exportarCsv}
  on:select={(e) => exportar(e.detail.id)} />`
  };
</script>

<article class="pg">
  <!-- ── Portada ────────────────────────────────────────────────────────── -->
  <header class="hero">
    <p class="sx-cap">Familia</p>
    <h1>Acciones</h1>
    <p class="lede">
      Un botón es una promesa: que algo va a pasar, que va a pasar <em>ahora</em>, y que es
      <em>esto</em> lo que va a pasar. Esta familia existe para que las tres partes sigan siendo
      ciertas cuando el servidor tarda, cuando la acción está bloqueada y cuando quien la lee
      tiene las manos sucias y treinta segundos.
    </p>
    <ul class="facts">
      <li><b>Una vista, un primario.</b> Por eso el <code>variant</code> por defecto es
        <code>outline</code> y no <code>solid</code>: el primario hay que pedirlo.</li>
      <li><b>Ocupado nunca es <code>disabled</code>.</b> El navegador desenfoca lo que se
        deshabilita, y quien apretó Enter termina en el <code>&lt;body&gt;</code>.</li>
      <li><b>Deshabilitado puede cargar su motivo.</b> Un control bloqueado que no explica
        nada es una pared.</li>
    </ul>
  </header>

  <div class="body">
    <nav class="toc" aria-label="Índice de la página">
      <ul>
        {#each TOC as [id, name] (id)}
          <li><a href="#/acciones/{id}">{name}</a></li>
        {/each}
      </ul>
    </nav>

    <main>
    <!-- ── La regla ───────────────────────────────────────────────────────── -->
    <section class="sec">
    <h2 id="regla">Una vista, un primario</h2>
    <p class="lede">
      Una pantalla tiene un solo botón sólido porque tiene una sola respuesta a «¿a qué vine?».
      Tres respuestas no son tres respuestas: son ninguna. Todo lo demás es
      <code>outline</code> —&nbsp;el que se usa siempre&nbsp;— o <code>ghost</code>, que vive
      dentro de una fila o de una barra sin pelearse con el contenido.
    </p>

    <div class="card">
      <div class="stage">
        <div class="compare">
          <div>
            <p class="tag">{@html svg('slash', 13)} Así no</p>
            <div class="frame">
              <ButtonGroup label="Ejemplo incorrecto">
                <Button variant="solid">Guardar servicio</Button>
                <Button variant="solid">Imprimir</Button>
                <Button variant="solid">Cancelar</Button>
              </ButtonGroup>
              <p class="note">Tres rellenos compiten y el ojo no elige ninguno.</p>
            </div>
          </div>
          <div>
            <p class="tag">{@html svg('check', 13)} Así sí</p>
            <div class="frame">
              <ButtonGroup label="Acciones del servicio">
                <Button variant="solid">Guardar servicio</Button>
                <Button>Imprimir</Button>
                <Button variant="ghost">Cancelar</Button>
              </ButtonGroup>
              <p class="note">Una respuesta, una alternativa, una salida.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.primary}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('primary')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'primary' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'primary'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── Dos acciones iguales ───────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="dos">Cuando la pantalla tiene dos acciones honestamente iguales</h2>
    <p class="lede">
      Pasa de verdad. En Documentos, un código de artículo sin resolver tiene dos respuestas, y
      en un patio de alquiler la segunda es la más común: o es una máquina, o es material a
      granel. Ninguna de las dos es «la acción».
    </p>
    <p class="lede">
      La salida no es dos primarios —&nbsp;dos rellenos corren una carrera y el ojo no premia a
      nadie&nbsp;— ni un primario y un secundario, que sería mentir sobre cuál es la común. Son
      dos <code>outline</code> del mismo tamaño, con una frase arriba que dice cuál es la
      pregunta, y las palabras cargando toda la diferencia. La tercera puerta es más silenciosa
      porque se usa menos, no porque importe menos.
    </p>

    <div class="card">
      <div class="stage">
        <div class="fork">
          <p class="ask">
            El código <span class="sx-id">PUNT-3M</span> no está asignado.
            <span class="sx-num">20</span> unidades, salida <span class="sx-id">44821</span>. ¿Qué es?
          </p>
          <ButtonGroup label="Qué es el código PUNT-3M" stack>
            <Button on:click={() => (verdict = 'maquina')}>Es una máquina</Button>
            <Button on:click={() => (verdict = 'granel')}>Es a granel</Button>
          </ButtonGroup>
          <div class="third">
            <Button variant="ghost" size="sm" on:click={() => (verdict = 'descartado')}>Descartar</Button>
          </div>
          {#if verdict}
            <p class="said">
              {#if verdict === 'maquina'}Elegí la máquina y el código queda amarrado a ella para siempre.
              {:else if verdict === 'granel'}<span class="sx-id">PUNT-3M</span> queda marcado como material a granel: no vuelve a preguntar.
              {:else}Descartado. Este documento no lo vuelve a mencionar; el código sí, la próxima vez.{/if}
              <button class="undo" on:click={() => (verdict = '')}>Volver a preguntar</button>
            </p>
          {/if}
        </div>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.fork}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('fork')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'fork' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'fork'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── Button ─────────────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="button">Button</h2>

    <div class="use">
      <div>
        <p class="sx-cap tagline">{@html svg('check', 13)} Cuándo</p>
        <ul>
          <li>Algo va a <em>pasar</em>: se guarda, se genera, se exporta, se anula.</li>
          <li>La acción cabe en dos o tres palabras que empiezan con un verbo.</li>
          <li>Hay un lugar en la pantalla donde el ojo espera encontrarla.</li>
        </ul>
      </div>
      <div>
        <p class="sx-cap tagline">{@html svg('slash', 13)} Cuándo no</p>
        <ul>
          <li>Si <em>navega</em>. Eso es un enlace: pasá <code>href</code> y sale un
            <code>&lt;a&gt;</code> de verdad, con su clic central y su «abrir en pestaña nueva».</li>
          <li>Si <em>elige un valor</em>. Eso es un <code>select</code> o un grupo de
            <code>Pill</code> con <code>pressed</code>, no un botón.</li>
          <li>Si hay siete en fila. Seis son un <code>Menu</code> y uno es el botón.</li>
        </ul>
      </div>
    </div>

    <h3>Los cuatro variantes</h3>
    <p>
      <code>danger</code> es el momento de lo irreversible, no la puerta hacia él. El «Eliminar»
      de una fila es un <code>ghost</code>; el «Eliminar» de adentro del diálogo que pregunta si
      estás seguro es el <code>danger</code>. Rojo repartido en todas las entradas es rojo que
      para el jueves ya nadie lee.
    </p>
    <div class="card">
      <div class="stage">
        <div class="row">
          <Button variant="solid" bind:node={solidNode}>Guardar servicio</Button>
          <Button>Imprimir salida</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Eliminar el equipo</Button>
        </div>
        <p class="hint">
          <b>El anillo de foco.</b> Apretá este botón con el mouse y no vas a ver nada; apretalo
          con Enter y el sólido se enciende con su anillo. Eso es <code>:focus-visible</code>:
          el anillo aparece cuando hace falta y no cuando el mouse ya sabe dónde está. Está
          dibujado como anillo <em>más</em> halo, porque una línea de tinta sola desaparece
          encima de un relleno casi negro.
        </p>
        <Button size="sm" on:click={() => solidNode?.focus()}>Enfocar «Guardar servicio»</Button>
      </div>
    </div>

    <h3>Tamaños</h3>
    <p>
      32 / 40 / 48, sacados del ritmo de espaciado, para que un botón se alinee con los campos y
      las filas que tiene al lado en vez de ser su propia escala. Con
      <code>(pointer: coarse)</code> el <code>sm</code> y el <code>md</code> crecen a 44px sin
      preguntar: la tablet del técnico está en horizontal a 1024px y sigue recibiendo un pulgar.
    </p>
    <div class="card">
      <div class="stage">
        <div class="row baseline">
          <Button size="sm">Ver ficha</Button>
          <Button size="md">Registrar lectura</Button>
          <Button size="lg" variant="solid">Generar orden</Button>
        </div>
      </div>
    </div>

    <h3>Con marca, y sin palabras</h3>
    <div class="card">
      <div class="stage">
        <div class="row">
          <Button variant="solid">
            <span slot="icon">{@html svg('plus')}</span>
            Registrar equipo
          </Button>
          <Button>
            <span slot="icon">{@html svg('download')}</span>
            Exportar CSV
          </Button>
          <Button variant="ghost" size="sm">
            <span slot="icon">{@html svg('refresh')}</span>
            Recalcular
          </Button>
          <Button href="https://example.cr/manual" variant="ghost">
            Manual del HINO 300
          </Button>
        </div>
        <p class="hint">
          El último es un <code>&lt;a&gt;</code>. Miralo con el botón central del mouse: abre una
          pestaña, porque es un enlace y no un botón disfrazado.
        </p>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.variants}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('variants')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'variants' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'variants'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── Estados ────────────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="estados">Los estados que sí pasan</h2>
    <p class="lede">
      Reposo es el estado más fácil y el menos interesante. Estos son los otros cinco, y son los
      que deciden si el sistema aguanta un martes.
    </p>

    <h3>Ocupado</h3>
    <p>
      El ancho no se mueve. La etiqueta se queda en la caja y se vuelve invisible; el anillo se
      dibuja encima. Un botón que se encoge a «…» mientras guarda arrastra el pie del diálogo de
      lado, y en una tablet así es como se aprieta «Cancelar» sin querer.
    </p>
    <p>
      Y ocupado <em>no</em> usa el atributo <code>disabled</code>: usa
      <code>aria-disabled</code>. Sigue enfocable, sigue anunciado, simplemente no se puede
      activar. Quien lo confirma es la pantalla, no el botón —&nbsp;con la misma palabra:
      «Guardar servicio» → «Servicio guardado».
    </p>
    <div class="card">
      <div class="stage">
        <div class="row">
          <Button variant="solid" busy={working} on:click={runOnce}>Guardar servicio</Button>
          <Button busy>Exportar CSV</Button>
          <Button variant="ghost" busy size="sm">Recalcular</Button>
          <IconButton label="Sincronizar la flota" busy>{@html svg('refresh')}</IconButton>
        </div>
        <p class="hint">
          El primero trabaja de verdad por 1,8 s. Enfocalo con Tab, apretá Enter y fijate que el
          foco <em>no</em> se cae: seguís parado en el mismo botón cuando termina.
        </p>
      </div>
    </div>
    <div class="code">
      <pre><code>{CODE.busy}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('busy')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'busy' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'busy'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>

    <h3>Deshabilitado, con y sin motivo</h3>
    <p>
      <code>disabled</code> solo usa el atributo real: inalcanzable, sin explicación. Es honesto
      únicamente cuando el motivo ya está escrito en la pantalla.
      <code>disabled</code> con <code>reason</code> cambia a <code>aria-disabled</code>: el
      control sigue enfocable y el motivo llega al hover y al lector de pantalla como su
      descripción. Es un piso, no la solución —&nbsp;si el motivo importa, escribilo también a
      la vista, como abajo a la derecha.
    </p>
    <div class="card">
      <div class="stage">
        <div class="split-demo">
          <div>
            <p class="sx-cap tagline">{@html svg('slash', 13)} Pared</p>
            <Button disabled>Generar orden</Button>
            <p class="note">Nadie sabe por qué, y no se puede ni enfocar para preguntar.</p>
          </div>
          <div>
            <p class="sx-cap tagline">{@html svg('check', 13)} Con motivo</p>
            <Button disabled reason="BAT014 no tiene plan asignado.">Generar orden</Button>
            <p class="note">Enfocable con Tab, y el motivo llega al hover.</p>
          </div>
          <div>
            <p class="sx-cap tagline">{@html svg('check', 13)} Con motivo a la vista</p>
            <Button disabled reason="BAT014 no tiene plan asignado.">Generar orden</Button>
            <p class="why">
              {@html svg('alert', 14)}
              <span><span class="sx-id">BAT014</span> no tiene plan asignado, así que no hay
              actividades que meterle a la orden. Asignale una familia y el plan se hereda solo.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="code">
      <pre><code>{CODE.reason}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('reason')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'reason' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'reason'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>

    <h3>Error</h3>
    <p>
      Un error nombra el problema <em>y</em> la salida. Y el botón vuelve: cambia su palabra a
      «Reintentar», que es exactamente lo que hace ahora. Apretá abajo —&nbsp;la primera vez
      falla a propósito.
    </p>
    <div class="card">
      <div class="stage">
        <div class="saver">
          <ButtonGroup label="Guardar el servicio OT-0042" stack>
            <Button variant="solid" busy={saveState === 'busy'} on:click={save}>
              {saveState === 'error' ? 'Reintentar' : 'Guardar servicio'}
            </Button>
            <Button variant="ghost" on:click={resetSave}>Empezar de nuevo</Button>
          </ButtonGroup>

          {#if saveState === 'error'}
            <p class="alarm">
              {@html svg('alert', 15)}
              <span>
                <b>No se pudo guardar.</b> El folio <span class="sx-id">OT-0042</span> ya tiene un
                servicio cerrado. Cambiá el folio o abrí el servicio que ya existe.
              </span>
            </p>
            <ButtonGroup label="Salidas del error">
              <Button size="sm">Cambiar el folio</Button>
              <Button size="sm" variant="ghost">Abrir OT-0042</Button>
            </ButtonGroup>
          {:else if saveState === 'done'}
            <p class="okay">
              {@html svg('check', 15)}
              <span>Servicio guardado. Quedó en el libro con su costo y su paro.</span>
            </p>
          {/if}
        </div>
        <p class="hint">
          El aviso de arriba es mínimo y está escrito acá adentro a propósito: la familia de
          avisos es de otra persona. Cuando exista, este bloque se cambia por ella.
        </p>
      </div>
    </div>

    <h3>Vacío</h3>
    <p>
      Un menú sin nada adentro no es un menú: es un botón que se abre en blanco y deja a alguien
      preguntándose si está cargando. Sin ítems, <code>Menu</code> se deshabilita solo y dice por
      qué. La regla vale para toda la familia —&nbsp;un control que no puede hacer nada lo dice
      antes de que lo aprieten, no después.
    </p>
    <div class="card">
      <div class="stage">
        <div class="row">
          <Menu label="Más acciones" items={[]} />
          <Menu label="Más acciones de PUNT-3M" compact items={[]}
            empty="PUNT-3M es material a granel: no tiene ficha ni plan." />
        </div>
        <p class="hint">Pasale el mouse por encima, o enfocalos con Tab. Los dos explican su silencio.</p>
      </div>
    </div>
  </section>

  <!-- ── ButtonGroup ────────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="group">ButtonGroup</h2>

    <div class="use">
      <div>
        <p class="sx-cap tagline">{@html svg('check', 13)} Cuándo</p>
        <ul>
          <li><b>Fila</b> para acciones que conviven pero son cosas distintas: el pie de un
            diálogo, una barra de herramientas.</li>
          <li><b>Pegado</b> para la <em>misma</em> acción con objetos distintos: 30 días / 3
            meses / 1 año, CSV / PDF.</li>
          <li>Con <code>stack</code> cuando el grupo tiene que sobrevivir a 390px.</li>
        </ul>
      </div>
      <div>
        <p class="sx-cap tagline">{@html svg('slash', 13)} Cuándo no</p>
        <ul>
          <li><b>Nunca pegues «Guardar» a «Eliminar».</b> Soldar dos botones es afirmar que
            apretar el equivocado es un error chiquito, y el día que un pulgar caiga 4mm afuera
            eso tiene que seguir siendo cierto.</li>
          <li>Sin <code>label</code> no hay <code>role="group"</code>: un grupo que nadie puede
            nombrar solo anuncia «grupo» y no dice nada.</li>
          <li>Un <code>SplitButton</code> dibuja su propia costura y no va adentro de
            <code>attached</code>.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="stage">
        <p class="sx-cap">Fila · el pie de un diálogo</p>
        <div class="frame">
          <ButtonGroup label="Guardar la lectura" stack>
            <Button variant="solid">Guardar lectura</Button>
            <Button variant="ghost">Cancelar</Button>
          </ButtonGroup>
        </div>
        <p class="hint">
          El primario va <em>primero</em> en el DOM. En fila se lee primero, que es donde arranca
          el ojo en español; cuando <code>stack</code> lo dobla en columna queda arriba, que es
          donde cae el pulgar. Orden visual y orden de tabulación dicen la misma frase en los dos
          casos: un pie que se invierte a 390px es un error de foco disfrazado de responsive.
          Angostá la ventana y miralo.
        </p>

        <p class="sx-cap">Pegado · alternativas de lo mismo</p>
        <div class="frame">
          <ButtonGroup attached label="Horizonte del programa">
            <Button size="sm">30 días</Button>
            <Button size="sm">3 meses</Button>
            <Button size="sm">1 año</Button>
          </ButtonGroup>
        </div>
        <div class="frame">
          <ButtonGroup attached label="Exportar el libro de servicios">
            <Button>
              <span slot="icon">{@html svg('download')}</span>
              CSV
            </Button>
            <Button>PDF</Button>
            <Button>
              <span slot="icon">{@html svg('printer')}</span>
              Imprimir
            </Button>
          </ButtonGroup>
        </div>
        <p class="hint">
          Tabulá por el grupo pegado: el anillo del botón enfocado se dibuja completo porque ese
          botón sube por encima del borde del vecino. Un grupo pegado <em>no</em> se dobla en dos
          líneas —&nbsp;un control soldado es un objeto, y partirlo en dos son dos objetos con
          cuatro esquinas mal&nbsp;—; cuando se queda sin espacio las etiquetas se recortan, y
          eso es un aviso, no una función: pasadas tres o cuatro palabras cortas, el control
          correcto es otro.
        </p>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.group}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('group')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'group' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'group'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── IconButton ─────────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="iconbutton">IconButton</h2>
    <p class="lede">
      Es <code>Button</code> con el nombre accesible vuelto obligatorio. Existe por una sola
      razón: el defecto que hace imposible es la falla de accesibilidad más común del software
      operativo. Seis cuadritos sin palabras que un lector de pantalla anuncia «botón, botón,
      botón» no es un bug difícil de entender, es un bug difícil de <em>recordar</em>, y una API
      que no se puede usar mal le gana a una regla escrita en un documento.
    </p>

    <div class="use">
      <div>
        <p class="sx-cap tagline">{@html svg('check', 13)} Cuándo</p>
        <ul>
          <li>En una fila o en una barra, donde el encabezado y la fila le dan contexto al dibujo.</li>
          <li>Cuando el dibujo ya es vocabulario: un lápiz, un basurero, una equis, un chevrón.</li>
          <li>El <code>label</code> dice lo que <em>hace</em>: «Eliminar el repuesto», nunca
            «Basurero».</li>
        </ul>
      </div>
      <div>
        <p class="sx-cap tagline">{@html svg('slash', 13)} Cuándo no</p>
        <ul>
          <li>Si el dibujo hay que adivinarlo. Una llave dentro de un engranaje es un jeroglífico.</li>
          <li>Fuera de una fila o una barra. Escribí la palabra: el espacio es más barato que un
            técnico adivinando en una tablet sucia.</li>
          <li>Para la acción primaria. Un primario sin palabras no es un primario.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="stage">
        <ul class="fleet">
          {#each rows as r (r.code)}
            <li>
              <span class="who">
                <b class="sx-id">{r.code}</b>
                <span class="what">{r.name}</span>
              </span>
              <Pill tone={r.tone} size="sm">{r.state}</Pill>
              <span class="acts">
                <IconButton size="sm" label={`Registrar lectura de ${r.code}`}>{@html svg('gauge')}</IconButton>
                <IconButton size="sm" label={`Editar ${r.code}`}>{@html svg('pencil')}</IconButton>
                <Menu
                  compact
                  size="sm"
                  variant="ghost"
                  label={`Más acciones de ${r.code}`}
                  items={rowItems}
                  on:select={(e) => (picked = `${r.code} · ${e.detail.item.label}`)} />
              </span>
            </li>
          {/each}
        </ul>
        {#if picked}
          <p class="said">Elegiste: <b>{picked}</b>
            <button class="undo" on:click={() => (picked = '')}>Limpiar</button>
          </p>
        {/if}
        <p class="hint">
          Los tres estados llevan tono <em>y</em> palabra <em>y</em> marca, que es lo que
          <code>Pill</code> garantiza. El color nunca viaja solo, ni acá ni en el ítem rojo del
          menú.
        </p>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.icons}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('icons')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'icons' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'icons'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── Menu ───────────────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="menu">Menu</h2>
    <p class="lede">
      Un botón de menú de verdad, y «de verdad» no es una presumida: es una lista de control.
      Un menú que falla cualquiera de estas líneas es un <code>div</code> haciendo mímica.
    </p>

    <div class="card">
      <div class="stage">
        <div class="keys">
          <dl>
            <div><dt><kbd>↓</kbd> <kbd>↑</kbd></dt><dd>Mueven un solo punto de tabulación. La lista es <em>una</em> parada en el orden de la página, no once.</dd></div>
            <div><dt><kbd>Inicio</kbd> <kbd>Fin</kbd></dt><dd>Primero y último.</dd></div>
            <div><dt><kbd>a</kbd>–<kbd>z</kbd></dt><dd>Saltan al ítem que empieza así. Nueve planes se leen más rápido que se flechan; el buffer se limpia solo después de una pausa.</dd></div>
            <div><dt><kbd>Esc</kbd></dt><dd>Cierra <em>y devuelve el foco al disparador</em>. Siempre. Un menú que se queda con el foco es una trampa; uno que lo suelta en el <code>&lt;body&gt;</code> es peor, porque hay que tabular desde arriba para volver.</dd></div>
            <div><dt><kbd>Tab</kbd></dt><dd>Cierra y sigue, que es lo que significa Tab.</dd></div>
            <div><dt>Clic afuera</dt><dd>Cierra. Medido con <code>composedPath()</code> y no con <code>contains()</code>: dentro de un shadow root todo evento a nivel de documento se reapunta al host, y <code>contains(e.target)</code> da verdadero para la página entera.</dd></div>
          </dl>
        </div>

        <div class="row">
          <Menu label="Acciones de la flota" items={rowItems}
            on:select={(e) => (picked = e.detail.item.label)} />
          <Menu label="Más acciones de BAT014" compact items={rowItems}
            on:select={(e) => (picked = e.detail.item.label)} />
          <Menu label="Exportar" variant="solid" align="start" items={exportItems}
            on:select={(e) => (picked = e.detail.item.label)} />
        </div>
        <p class="hint">
          «Dar de baja» está deshabilitado pero <em>sí</em> se puede enfocar: un ítem apagado que
          no se alcanza es un ítem que nunca te dice qué te estás perdiendo. Su motivo está en el
          hover y en la descripción accesible.
        </p>
      </div>
    </div>

    <div class="use">
      <div>
        <p class="sx-cap tagline">{@html svg('check', 13)} Cuándo</p>
        <ul>
          <li>Para la cola: las cuatro cosas que una fila puede hacer y que no son la que es.</li>
          <li>Cuando la barra ya tiene su botón y el resto son variantes ocasionales.</li>
        </ul>
      </div>
      <div>
        <p class="sx-cap tagline">{@html svg('slash', 13)} Cuándo no</p>
        <ul>
          <li>Para la acción a la que la gente vino. Un menú cuesta un clic antes de que algo
            sea siquiera legible; el primario nunca vive adentro de uno.</li>
          <li>Como control de formulario. Eso es un <code>&lt;select&gt;</code>: rueda en el
            teléfono, buscable en el escritorio y gratis. <code>role="menu"</code> promete
            <em>comandos</em>; si la lista fija un valor, este es el componente equivocado.</li>
          <li>Adentro de un contenedor con <code>overflow: hidden</code>. El panel se posiciona
            dentro de la caja del disparador —&nbsp;viaja bien con el scroll, pero un ancestro
            que recorta lo recorta. Dale <code>overflow: auto</code> y aire al que hace scroll.</li>
        </ul>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.menu}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('menu')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'menu' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'menu'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── SplitButton ────────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="split">SplitButton</h2>
    <p class="lede">
      Una acción dicha en voz alta, más sus variantes detrás de una costura. La regla que lo
      hace legítimo es una sola: <b>todo lo que está en el menú tiene que ser una variante del
      mismo acto</b> que el botón de al lado. «Exportar CSV» con «Exportar PDF» debajo, sí.
      «Guardar» con «Eliminar» debajo, no.
    </p>

    <div class="card">
      <div class="stage">
        <div class="row">
          <SplitButton
            variant="solid"
            label="Exportar CSV"
            items={exportItems}
            on:click={() => (picked = 'Exportar CSV')}
            on:select={(e) => (picked = e.detail.item.label)}>
            <span slot="icon">{@html svg('download')}</span>
            Exportar CSV
          </SplitButton>

          <SplitButton
            label="Generar orden"
            items={[
              { id: 'prev', label: 'Generar orden preventiva' },
              { id: 'corr', label: 'Generar orden correctiva' }
            ]}
            on:click={() => (picked = 'Generar orden')}
            on:select={(e) => (picked = e.detail.item.label)} />

          <SplitButton
            size="sm"
            label="Guardar"
            disabled
            reason="La orden no tiene ninguna línea todavía."
            items={[{ id: 'draft', label: 'Guardar como borrador' }]} />
        </div>
        {#if picked}
          <p class="said">Elegiste: <b>{picked}</b>
            <button class="undo" on:click={() => (picked = '')}>Limpiar</button>
          </p>
        {/if}
        <p class="hint">
          Las dos mitades son un solo <code>role="group"</code> con un solo nombre, así que un
          lector de pantalla anuncia «Exportar CSV, grupo» y después los dos controles adentro,
          en vez de «botón, botón» sin ninguna relación entre ellos. El chevrón nunca se llama
          «más»: se llama «Más opciones de exportar csv», porque «más» no le dice a nadie en cuál
          de los cuatro botones de la barra acaba de caer.
        </p>
      </div>
    </div>

    <div class="use">
      <div>
        <p class="sx-cap tagline">{@html svg('check', 13)} Cuándo</p>
        <ul>
          <li>Cuando una de las variantes es claramente la más común y las otras son ocasionales.</li>
          <li>Cuando apretar la mitad equivocada es un error chiquito y reversible.</li>
        </ul>
      </div>
      <div>
        <p class="sx-cap tagline">{@html svg('slash', 13)} Cuándo no</p>
        <ul>
          <li>Cuando el valor por defecto es una apuesta. Si la apuesta falla seguido, la gente
            aprende a abrir el menú siempre y lo que entregaste es un menú con un señuelo pegado.</li>
          <li>Para un destino. Partir un enlace es una promesa que el navegador no cumple: el
            clic central, «abrir en pestaña nueva» y «copiar dirección» le pertenecen al
            <code>&lt;a&gt;</code>, no a la mitad de al lado.</li>
        </ul>
      </div>
    </div>

    <div class="code">
      <pre><code>{CODE.split}</code></pre>
      <div class="cp">
        <Button variant="ghost" size="sm" on:click={() => copy('split')}>
          <span slot="icon">{@html svg('copy', 14)}</span>
          {copied === 'split' ? 'Copiado' : 'Copiar'}
        </Button>
        {#if failed === 'split'}<span class="cpfail">No se pudo copiar. Seleccioná el bloque y usá Ctrl+C.</span>{/if}
      </div>
    </div>
  </section>

  <!-- ── Las dos pieles ─────────────────────────────────────────────────── -->
  <section class="sec">
    <h2 id="pieles">Las dos pieles, lado a lado</h2>
    <p class="lede">
      El bloque de la derecha no tiene ni un color escrito: se le pegaron encima los mismos
      <code>TOKENS_DARK</code> que usa un producto de verdad. Si algo se rompe en oscuro, se
      rompe acá, ahora, y no en la tablet de alguien a las seis de la mañana.
    </p>
    <div class="skins">
      <div class="skin" style={LIGHT}>
        <p class="sx-cap">Claro</p>
        <div class="stage">
          <div class="row">
            <Button variant="solid">Guardar</Button>
            <Button>Imprimir</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger">Eliminar</Button>
          </div>
          <div class="row">
            <Button busy variant="solid">Guardar</Button>
            <Button disabled reason="Sin líneas todavía.">Guardar</Button>
            <Menu label="Acciones" items={rowItems} align="start" />
          </div>
        </div>
      </div>
      <div class="skin" style={DARK}>
        <p class="sx-cap">Oscuro</p>
        <div class="stage">
          <div class="row">
            <Button variant="solid">Guardar</Button>
            <Button>Imprimir</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger">Eliminar</Button>
          </div>
          <div class="row">
            <Button busy variant="solid">Guardar</Button>
            <Button disabled reason="Sin líneas todavía.">Guardar</Button>
            <Menu label="Acciones" items={rowItems} align="start" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Lo que no está ─────────────────────────────────────────────────── -->
  <section class="sec last">
    <h2 id="fuera">Lo que esta familia no hace</h2>
    <ul class="out">
      <li><b>No confirma.</b> El botón dice «ocupado» con <code>aria-busy</code>; quien anuncia
        «Servicio guardado» es la pantalla, con la misma palabra del control. Eso le toca a la
        familia de avisos.</li>
      <li><b>No pregunta «¿estás seguro?».</b> Eso es un diálogo, y un diálogo atrapa el foco y
        lo devuelve. Acá vive el <code>danger</code> que va <em>adentro</em> de él.</li>
      <li><b>No hay barra de herramientas con <code>role="toolbar"</code>.</b> Ese rol promete
        navegación con flechas entre sus botones, y prometerla sin implementarla es peor que no
        tenerla. <code>ButtonGroup</code> se queda en <code>role="group"</code>, que es lo que
        de verdad hace.</li>
      <li><b>No hay botón flotante.</b> Un FAB tapa la última fila de la tabla, y estas
        pantallas son tablas.</li>
      <li><b>Los dibujos son de otra familia.</b> Los de esta página están escritos a mano acá
        adentro para no adelantarme; cuando exista la familia de íconos, se cambian.</li>
    </ul>
    </section>
    </main>
  </div>
</article>

<style>
  /* The page is a document surface, so it may lean on base.css's three
     registers. The components inside it may not, and do not. */
  .pg {
    /* A measure, not a pixel width: the tokens have no width scale, and
       inventing one on a catalogue page would be a token by stealth. Era
       108ch hasta que el índice necesitó una columna al lado — 1180px deja
       el mismo margen a las comparaciones de dos columnas que el 108ch
       original más el ancho del índice, y hace que las siete páginas midan
       lo mismo. La prosa adentro sigue con su propia medida (66ch, acá
       abajo), así que nada se lee más ancho que antes. */
    max-width: 1180px;
    margin: 0 auto;
    padding: var(--sx-s-8) var(--sx-s-5) var(--sx-s-20);
    color: var(--sx-ink);
  }

  /* ── El índice ───────────────────────────────────────────────────────── */
  /* Mismo componente que las otras seis páginas. */
  .body { display: grid; grid-template-columns: 13rem minmax(0, 1fr); gap: var(--sx-s-10); margin-top: var(--sx-s-16); align-items: start; }

  .toc { position: sticky; top: calc(var(--sx-s-16) + var(--sx-s-2)); }
  .toc ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .toc a {
    display: block;
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-3);
    text-decoration: none;
  }
  .toc a:hover { background: var(--sx-sunk); color: var(--sx-ink); }

  /* Block, no flex: `.sec` ya pone su propio `margin-top` (más abajo) y un
     `gap` acá lo duplicaría. */
  main { min-width: 0; }

  /* ── Type ────────────────────────────────────────────────────────────── */
  h1 {
    margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.035em;
    line-height: 1.02;
  }
  h2 {
    margin: 0;
    font-size: var(--sx-t-xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.028em;
    line-height: 1.15;
    scroll-margin-top: var(--sx-s-16);
  }
  h3 {
    margin: var(--sx-s-8) 0 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
  }
  p { margin: var(--sx-s-3) 0 0; line-height: 1.62; color: var(--sx-ink-2); }
  .lede { font-size: var(--sx-t-md); color: var(--sx-ink-2); max-width: 66ch; }
  em { font-style: normal; font-weight: var(--sx-w-semi); color: var(--sx-ink); }
  b { font-weight: var(--sx-w-semi); color: var(--sx-ink); }

  code {
    font-family: var(--sx-font-mono);
    font-size: .88em;
    letter-spacing: -.015em;
    background: var(--sx-sunk);
    padding: .12em .38em;
    border-radius: var(--sx-r-1);
    color: var(--sx-ink);
  }

  .hero { padding-bottom: var(--sx-s-10); }
  .hero .lede { margin-top: var(--sx-s-5); font-size: var(--sx-t-lg); line-height: 1.5; }

  .facts {
    margin: var(--sx-s-6) 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--sx-s-3);
  }
  .facts li {
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    line-height: 1.55;
  }

  .sec { margin-top: var(--sx-s-16); }
  .sec.last { margin-bottom: var(--sx-s-10); }

  /* ── Cuándo / cuándo no ──────────────────────────────────────────────── */
  .use {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sx-s-6);
    margin-top: var(--sx-s-6);
  }
  .use ul { margin: var(--sx-s-2) 0 0; padding-inline-start: var(--sx-s-4); }
  .use li { font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.55; margin-top: var(--sx-s-2); }
  /* Achromatic on purpose: the chrome is neutrals, and «cuándo no» is not a
     critical state — it is the other half of a sentence. The two are told apart
     by their mark and their word, never by a colour. */
  .tagline {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    margin: 0;
    color: var(--sx-ink-3);
  }

  /* ── Cards and stages ────────────────────────────────────────────────── */
  .card {
    margin-top: var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
  }
  .stage {
    padding: var(--sx-s-6);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
    align-items: flex-start;
  }
  .row { display: flex; flex-wrap: wrap; gap: var(--sx-s-3); align-items: center; }
  .row.baseline { align-items: baseline; }
  .frame {
    width: 100%;
    padding: var(--sx-s-4);
    background: var(--sx-ground);
    border-radius: var(--sx-r-2);
  }
  .note { margin-top: var(--sx-s-3); font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  .hint {
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
    line-height: 1.6;
    max-width: 62ch;
  }

  .compare, .split-demo {
    display: grid;
    gap: var(--sx-s-5);
    width: 100%;
  }
  .compare { grid-template-columns: 1fr 1fr; }
  .split-demo { grid-template-columns: repeat(3, 1fr); align-items: start; }
  .split-demo > div { display: flex; flex-direction: column; gap: var(--sx-s-3); align-items: flex-start; }
  .tag {
    display: inline-flex; align-items: center; gap: var(--sx-s-2);
    margin: 0 0 var(--sx-s-2);
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .07em; text-transform: uppercase; color: var(--sx-ink-3);
  }

  /* ── The fork ────────────────────────────────────────────────────────── */
  .fork { width: 100%; display: flex; flex-direction: column; gap: var(--sx-s-4); align-items: flex-start; }
  .ask { margin: 0; font-size: var(--sx-t-md); color: var(--sx-ink); max-width: 54ch; }
  .third { margin-top: calc(var(--sx-s-1) * -1); }

  .said {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
  }
  .undo {
    font: inherit; font-size: var(--sx-t-sm); font-weight: var(--sx-w-semi);
    background: none; border: 0; padding: 0 0 0 var(--sx-s-2);
    color: var(--sx-ink); cursor: pointer;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .undo:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; border-radius: var(--sx-r-1); }

  /* ── The minimal notices ─────────────────────────────────────────────
     Written here rather than imported: the notice family belongs to somebody
     else, and this page needed a failure to show before it existed. Tone plus
     glyph plus word, which is the one rule a notice may not skip. */
  .alarm, .okay, .why {
    display: flex; gap: var(--sx-s-3); align-items: flex-start;
    margin: 0; padding: var(--sx-s-3) var(--sx-s-4);
    border-radius: var(--sx-r-2);
    font-size: var(--sx-t-sm); line-height: 1.55;
    max-width: 58ch;
  }
  .alarm { background: var(--sx-critical-band); color: var(--sx-critical); border: 1px solid var(--sx-critical-edge); }
  .okay  { background: var(--sx-positive-band); color: var(--sx-positive); border: 1px solid var(--sx-positive-edge); }
  .why   { background: var(--sx-attention-band); color: var(--sx-attention); border: 1px solid var(--sx-attention-edge); }
  .alarm b { color: inherit; }

  .saver { display: flex; flex-direction: column; gap: var(--sx-s-4); align-items: flex-start; width: 100%; }

  /* ── The fleet rows ──────────────────────────────────────────────────── */
  .fleet { list-style: none; margin: 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .fleet li {
    display: flex; align-items: center; gap: var(--sx-s-3);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-ground);
    border-radius: var(--sx-r-2);
    min-width: 0;
  }
  .who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .who b { font-size: var(--sx-t-sm); font-weight: var(--sx-w-bold); }
  .what { font-size: var(--sx-t-xs); color: var(--sx-ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .acts { display: flex; gap: var(--sx-s-1); flex: none; align-items: center; }

  /* ── The keyboard table ──────────────────────────────────────────────── */
  .keys { width: 100%; }
  .keys dl { margin: 0; display: grid; gap: var(--sx-s-3); }
  .keys div { display: grid; grid-template-columns: 11ch 1fr; gap: var(--sx-s-4); align-items: baseline; }
  .keys dt { display: flex; gap: var(--sx-s-1); flex-wrap: wrap; }
  .keys dd { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.55; }
  kbd {
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    padding: 2px var(--sx-s-2);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    box-shadow: var(--sx-e-1);
    color: var(--sx-ink-2);
    white-space: nowrap;
  }

  /* ── Code ────────────────────────────────────────────────────────────── */
  .code {
    margin-top: var(--sx-s-4);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-2);
    overflow: hidden;
  }
  .code pre {
    margin: 0;
    padding: var(--sx-s-4);
    overflow-x: auto;
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-xs);
    line-height: 1.65;
    color: var(--sx-ink-2);
    tab-size: 2;
  }
  .code code { background: none; padding: 0; font-size: inherit; color: inherit; }
  .cp {
    display: flex; align-items: center; gap: var(--sx-s-3); flex-wrap: wrap;
    padding: var(--sx-s-2) var(--sx-s-3);
    border-top: 1px solid var(--sx-line);
  }
  .cpfail { font-size: var(--sx-t-xs); color: var(--sx-critical); }

  /* ── The two skins ───────────────────────────────────────────────────── */
  .skins { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sx-s-4); margin-top: var(--sx-s-4); }
  .skin {
    background: var(--sx-ground);
    color: var(--sx-ink);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-4) var(--sx-s-4) var(--sx-s-2);
    min-width: 0;
  }
  .skin .stage { padding: var(--sx-s-3) 0 var(--sx-s-4); gap: var(--sx-s-3); }

  /* ── Out of scope ────────────────────────────────────────────────────── */
  .out { margin: var(--sx-s-5) 0 0; padding: 0; list-style: none; display: grid; gap: var(--sx-s-3); }
  .out li {
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    line-height: 1.55;
  }

  /* ── Narrow ──────────────────────────────────────────────────────────
     A Strix module usually renders beside the Shell's 240px sidebar, so the
     content column runs out long before the window does. Everything that was
     two or three columns becomes one, and nothing scrolls sideways except the
     code, which owns its own scroller. */
  @media (max-width: 900px) {
    .body { grid-template-columns: 1fr; gap: var(--sx-s-6); }
    .toc { position: static; }
    .toc ul { flex-direction: row; flex-wrap: wrap; gap: var(--sx-s-1); }
  }
  @media (max-width: 760px) {
    .pg { padding-inline: var(--sx-s-4); }
    h1 { font-size: var(--sx-t-2xl); }
    .use, .compare, .split-demo, .skins { grid-template-columns: 1fr; }
    .keys div { grid-template-columns: 1fr; gap: var(--sx-s-1); }
    .stage { padding: var(--sx-s-4); }
  }
  @media (max-width: 460px) {
    .fleet li { flex-wrap: wrap; row-gap: var(--sx-s-2); }
    .who { flex: 1 0 100%; }
    .acts { margin-inline-start: auto; }
  }
</style>
