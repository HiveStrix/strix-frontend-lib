<script>
  // ESTRUCTURA — la página de la familia NAV.
  //
  // Tampoco existía. Nueve componentes que nadie había visto dibujados, entre
  // ellos tres —Tabs, Segmented y FilterChips— cuya diferencia es justamente lo
  // interesante y no se puede explicar sin ponerlos uno al lado del otro.
  import {
    PageHeader, Breadcrumb, Tabs, Segmented, FilterChips,
    SearchField, Pagination, SideRail, ShortcutOverlay
  } from '../../lib/nav/index.js';
  import Pill from '../../lib/Pill.svelte';
  import Button from '../../lib/action/Button.svelte';
  import { Card, Stack, Row, Glyph, GLYPH_PATHS } from '../../lib/shell/index.js';

  const TOC = [
    ['pageheader', 'PageHeader'], ['breadcrumb', 'Breadcrumb'],
    ['tabs', 'Tabs vs Segmented'], ['chips', 'FilterChips'],
    ['search', 'SearchField'], ['pagination', 'Pagination'],
    ['rail', 'SideRail'], ['shortcuts', 'ShortcutOverlay']
  ];

  const ruta = [
    { label: 'Flota', href: '#/estructura' },
    { label: 'BAT014', href: '#/estructura', id: true },
    { label: 'Plan semestral', href: '#/estructura' },
    { label: 'OT-0042', id: true }
  ];

  // ── Tabs ─────────────────────────────────────────────────────────────────
  let tab = 'linea';
  const tabs = [
    { key: 'linea', label: 'Línea de tiempo' },
    { key: 'servicios', label: 'Servicios', count: 24 },
    { key: 'costos', label: 'Costos' },
    { key: 'docs', label: 'Documentos', count: 7, disabled: true }
  ];

  // ── Segmented ────────────────────────────────────────────────────────────
  let horizon = 90;
  let unit = 'h';

  // ── FilterChips ──────────────────────────────────────────────────────────
  // Las cuentas se calculan sobre TODO el conjunto, nunca sobre la vista
  // filtrada — que es la regla entera de este componente. Por eso `ORDENES` es
  // la fuente y `visibles` se deriva de ella, no al revés.
  const ORDENES = [
    ...Array.from({ length: 12 }, (_, i) => ({ id: `v${i}`, estado: 'vencido' })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, estado: 'porvencer' })),
    ...Array.from({ length: 41 }, (_, i) => ({ id: `a${i}`, estado: 'aldia' })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `s${i}`, estado: 'sinlectura' }))
  ];
  const ESTADOS = [
    { key: 'vencido', label: 'Vencidos', tone: 'critical' },
    { key: 'porvencer', label: 'Por vencer', tone: 'attention' },
    { key: 'aldia', label: 'Al día', tone: 'positive' },
    { key: 'sinlectura', label: 'Sin lecturas', tone: 'info' }
  ];
  let estado = null;
  // `$:` y no `const`: cierra sobre `ORDENES`, y una sentencia reactiva legacy
  // sólo sigue los nombres escritos dentro de ella.
  $: opciones = ESTADOS.map((s) => ({ ...s, count: ORDENES.filter((o) => o.estado === s.key).length }));
  $: visibles = estado ? ORDENES.filter((o) => o.estado === estado) : ORDENES;

  // ── SearchField ──────────────────────────────────────────────────────────
  const EQUIPOS = ['BAT001', 'BAT007', 'BAT014', 'BAT019', 'BAT022', 'CL336793', 'CL445926'];
  let q = '';
  $: encontrados = q ? EQUIPOS.filter((e) => e.toLowerCase().includes(q.toLowerCase())) : EQUIPOS;

  // ── Pagination ───────────────────────────────────────────────────────────
  let page = 3;
  let pageSize = 25;

  // ── SideRail ─────────────────────────────────────────────────────────────
  let seccion = 'flota';
  let tucked = false;
  const secciones = [
    { kind: 'section', label: 'Operación' },
    { key: 'flota', label: 'Flota', icon: GLYPH_PATHS.truck },
    { key: 'documentos', label: 'Documentos', icon: GLYPH_PATHS.file, count: 7 },
    { key: 'ordenes', label: 'Órdenes', icon: GLYPH_PATHS.clipboard, count: 24 },
    { kind: 'section', label: 'Configuración' },
    { key: 'catalogos', label: 'Catálogos', icon: GLYPH_PATHS.box },
    { key: 'indicadores', label: 'Indicadores', icon: GLYPH_PATHS.gauge },
    { key: 'integraciones', label: 'Integraciones', icon: GLYPH_PATHS.layers, disabled: true }
  ];

  // ── ShortcutOverlay ──────────────────────────────────────────────────────
  let keysOpen = false;
  const grupos = [
    { title: 'Moverse', items: [
      { keys: ['G', 'F'], sep: 'luego', label: 'Ir a la flota' },
      { keys: ['G', 'D'], sep: 'luego', label: 'Ir a documentos' }
    ]},
    { title: 'En la lista', items: [
      { keys: ['/'], label: 'Buscar' },
      { keys: ['?'], label: 'Ver esta hoja' },
      { keys: ['Esc'], label: 'Cerrar o limpiar' }
    ]}
  ];

  // EL CASO QUE ROMPÍA. Dos grupos sin `title`: antes de la clave con reserva
  // (ver ShortcutOverlay.svelte) las dos entraban al bucle con la misma clave
  // `undefined`, Svelte encontraba la colisión y la hoja entera se quedaba en
  // blanco — no un grupo sin encabezado, la pantalla completa. Queda en el
  // catálogo con su propio disparador para que el estado que rompía siga
  // siendo visible, no sólo arreglado.
  let keysSinTituloOpen = false;
  const gruposSinTitulo = [
    { items: [{ keys: ['G', 'F'], sep: 'luego', label: 'Ir a la flota' }] },
    { items: [{ keys: ['/'], label: 'Buscar' }] }
  ];
</script>

<div class="page">
  <header class="lede">
    <p class="sx-cap">Familia · <span class="sx-id">src/lib/nav</span></p>
    <h1>Estructura</h1>
    <p class="stand">
      Los componentes que contestan «¿dónde estoy?», «¿qué estoy mirando?» y «¿cómo llego a lo
      otro?». La familia es chica a propósito y lo interesante son las fronteras entre sus
      miembros, así que están escritas donde alguien que está eligiendo las va a ver.
    </p>

    <div class="chooser">
      <table>
        <caption class="sx-sr">Cómo elegir entre los componentes de estructura</caption>
        <thead>
          <tr>
            <th scope="col"><span class="sx-cap">Componente</span></th>
            <th scope="col"><span class="sx-cap">Qué cambia al usarlo</span></th>
            <th scope="col"><span class="sx-cap">La prueba que lo decide</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row"><span class="sx-id">Tabs</span></th>
            <td>QUÉ estás mirando. Dueño de un panel.</td>
            <td>¿Le mandarías el enlace a alguien? Es una pestaña.</td>
          </tr>
          <tr>
            <th scope="row"><span class="sx-id">Segmented</span></th>
            <td>CÓMO se dibuja lo mismo. Sin panel.</td>
            <td>Si nunca mandarías ese enlace, es un segmento.</td>
          </tr>
          <tr>
            <th scope="row"><span class="sx-id">FilterChips</span></th>
            <td>Angosta el conjunto en el lugar.</td>
            <td>¿La cuenta sigue siendo sobre el total? Tiene que serlo.</td>
          </tr>
          <tr>
            <th scope="row"><span class="sx-id">Breadcrumb</span></th>
            <td>Anidamiento real, de tres niveles o más.</td>
            <td>Con dos niveles es un enlace «Volver» disfrazado.</td>
          </tr>
          <tr>
            <th scope="row"><span class="sx-id">SideRail</span></th>
            <td>Las secciones propias de un módulo.</td>
            <td>Con dos o tres secciones, Tabs cuesta una franja en vez de una columna.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </header>

  <div class="body">
    <nav class="toc" aria-label="Índice de la página">
      <ul>
        {#each TOC as [id, name] (id)}
          <li><a href="#{id}">{name}</a></li>
        {/each}
      </ul>
    </nav>

    <main>
      <!-- ═══ PAGEHEADER ═════════════════════════════════════════════════ -->
      <section id="pageheader">
        <h2>PageHeader</h2>
        <p class="why">
          Toda superficie de Strix abre igual: DÓNDE estás, QUÉ es cierto ahora mismo, y QUÉ podés
          hacer al respecto, en ese orden. <b>El título es una oración, no un sustantivo.</b>
          «Flota» nombra una pestaña; «3 máquinas están vencidas» nombra una situación, y la
          situación es a lo que alguien vino.
        </p>

        <div class="demo">
          <Card pad={5}>
            <PageHeader
              level={3}
              eyebrow="Flota"
              title="3 máquinas están vencidas."
              subtitle="BAT014 lleva 12 días vencida en «Cambio de aceite 250 h»."
              tone="critical"
            >
              <svelte:fragment slot="crumbs"><Breadcrumb items={ruta.slice(0, 2)} label="Ruta del encabezado" /></svelte:fragment>
              <svelte:fragment slot="meta">
                <Pill tone="critical" size="sm">12 planes vencidos</Pill>
                <Pill tone="attention" size="sm">5 esta semana</Pill>
              </svelte:fragment>
              <svelte:fragment slot="actions">
                <Button variant="ghost">Exportar</Button>
                <Button variant="solid">Registrar servicio</Button>
              </svelte:fragment>
            </PageHeader>
          </Card>

          <Card pad={5}>
            <PageHeader level={3} eyebrow="Flota" title="Cargando" loading />
          </Card>
        </div>

        <p class="note">
          <span class="sx-id">tone</span> pinta el título, y es <b>el único lugar de esta librería
          donde la tinta lleva significado por sí sola</b> —&nbsp;así que sólo es legal cuando el
          título ya dice la palabra. «3 máquinas están vencidas» en tinta crítica es la regla
          aguantando. «Flota» en tinta crítica es la regla rota: quien no separe el rojo del gris
          no aprende nada, y todos los demás aprenden que el color es ruido.
        </p>

        <h3 class="sx-cap sub">variant — tres formas de encabezar</h3>
        <p class="why">
          El problema que las origina: adentro del contenido, donde no hay barra, un encabezado
          que sólo se separa por el halo deja las secciones sin techo — «todo parece una sola
          sección», en palabras de quien lo pidió. <span class="sx-id">halo</span>,
          <span class="sx-id">sarion</span> y <span class="sx-id">banda</span> son la misma terna
          que <span class="sx-id">Card</span>: luz, línea y tono. El marco completo está en la
          cabecera de <span class="sx-id">Card.svelte</span>; la traducción a un encabezado, en la
          de <span class="sx-id">PageHeader.svelte</span>.
        </p>

        <div class="demo three-up">
          <Card pad={5}>
            <PageHeader
              level={3}
              eyebrow="Servicios"
              title="Los últimos 12 meses"
              subtitle="18 preventivas, 7 correctivas, 2 canceladas."
            />
          </Card>
          <Card pad={5}>
            <PageHeader
              level={3}
              variant="sarion"
              eyebrow="Servicios"
              title="Los últimos 12 meses"
              subtitle="OT-0042 · BAT007 · 18 jul 2026"
            />
          </Card>
          <Card pad={5}>
            <PageHeader
              level={3}
              variant="banda"
              eyebrow="Servicios"
              title="Los últimos 12 meses"
              subtitle="18 preventivas, 7 correctivas, 2 canceladas."
            />
          </Card>
        </div>

        <p class="note">
          <b>Cuándo usar cada una.</b> <span class="sx-id">halo</span>, para el encabezado de la
          propia página — es el default por algo. <span class="sx-id">sarion</span> para un
          encabezado de sección DENTRO del contenido, donde no hay barra que lo separe y hace
          falta una línea real; el subtítulo monoespaciado es del sistema, no un identificador
          cualquiera — usalo para algo que se lee como una cifra o una referencia, no como una
          oración («OT-0042 · BAT007», arriba, no una frase). <span class="sx-id">banda</span>
          cuando la sección tiene que leerse como un bloque cerrado, con máxima contención — y
          siempre sobre una tarjeta, nunca directo sobre el fondo:
          <span class="sx-id">--sx-thead</span> está calibrado contra
          <span class="sx-id">--sx-surface</span>, no contra <span class="sx-id">--sx-ground</span>
          (medido: 1.03–1.05 en claro, bajo el piso de distinguibilidad — <span class="sx-id">pnpm contrast</span>
          lo deja escrito como informativo). Elegir una no es gusto: tres mecanismos mezclados sin
          criterio, en la misma pantalla, es peor que uno solo.
        </p>
      </section>

      <!-- ═══ BREADCRUMB ═════════════════════════════════════════════════ -->
      <section id="breadcrumb">
        <h2>Breadcrumb</h2>
        <p class="why">
          Sólo cuando la profundidad es real: Flota → BAT014 → Plan semestral → OT-0042 son cuatro
          objetos anidados, cada uno existe por su cuenta y a cada uno alguien quiere volver
          legítimamente. Dos niveles es el piso; una miga más la página actual es un enlace
          «Volver» con disfraz.
        </p>

        <div class="demo">
          <Card pad={4}><Breadcrumb items={ruta} label="Ruta de la orden" /></Card>
          <Card pad={4}>
            <Breadcrumb
              label="Ruta larga, colapsada"
              maxVisible={4}
              items={[
                { label: 'Flota', href: '#/estructura' },
                { label: 'Guanacaste', href: '#/estructura' },
                { label: 'Batidoras eléctricas', href: '#/estructura' },
                { label: 'BAT014', href: '#/estructura', id: true },
                { label: 'Plan semestral', href: '#/estructura' },
                { label: 'OT-0042', id: true }
              ]}
            />
          </Card>
        </div>

        <p class="note">
          <b>La última miga no es un enlace.</b> Es donde ya estás, lleva
          <span class="sx-id">aria-current="page"</span>, y hacerla clicable le enseña a la gente
          que hacerle clic no hace nada —&nbsp;que es cómo un rastro deja de ser confiable. El
          botón del medio dice <em>cuántos</em> niveles esconde, porque «···» solo no es un número.
        </p>
      </section>

      <!-- ═══ TABS vs SEGMENTED ══════════════════════════════════════════ -->
      <section id="tabs">
        <h2>Tabs y Segmented, uno al lado del otro</h2>
        <p class="why">
          La diferencia entera, y no es cosmética. <b>Tabs</b> cambia QUÉ estás mirando: cada
          pestaña es dueña de un panel que podría haber sido su propia página, así que hay algo a
          lo que <span class="sx-id">aria-controls</span> puede apuntar de verdad, foco rotativo y
          flechas. <b>Segmented</b> cambia CÓMO se dibuja lo mismo: no se intercambia nada, no hay
          panel, y <span class="sx-id">role="tab"</span> prometería un patrón que no está.
        </p>

        <div class="demo">
          <Card pad={5}>
            <Tabs items={tabs} bind:value={tab} label="Registro del equipo">
              <div class="panel">
                {#if tab === 'linea'}
                  <p><b>Línea de tiempo.</b> Un panel de verdad, con su propio contenido. Deep-linkable: a esto le mandarías el enlace a un compañero.</p>
                {:else if tab === 'servicios'}
                  <p><b>Servicios.</b> Veinticuatro órdenes, con columnas propias. Es otro registro, no otra vista del mismo.</p>
                {:else if tab === 'costos'}
                  <p><b>Costos.</b> Colones por mes, repuestos contra mano de obra. Otra vez: otras columnas.</p>
                {/if}
              </div>
            </Tabs>
          </Card>

          <Card pad={5}>
            <Stack gap={4}>
              <Row gap={4} justify="between">
                <Segmented label="Horizonte" bind:value={horizon} items={[
                  { key: 30, label: '30 días' },
                  { key: 90, label: '3 meses' },
                  { key: 180, label: '6 meses' },
                  { key: 365, label: '1 año' }
                ]} />
                <Segmented label="Unidad del contador" size="sm" bind:value={unit} items={[
                  { key: 'h', label: 'Horas' },
                  { key: 'km', label: 'Kilómetros' }
                ]} />
              </Row>
              <p class="seg-out">
                La misma serie, dibujada a <b>{horizon} días</b> en <b>{unit === 'h' ? 'horas' : 'kilómetros'}</b>.
                Nada se intercambió: cambió cómo se dibuja. Nadie le mandaría este enlace a nadie.
              </p>
              <Segmented label="Densidad, a lo ancho" full value="comoda" items={[
                { key: 'compacta', label: 'Compacta' },
                { key: 'comoda', label: 'Cómoda' },
                { key: 'amplia', label: 'Amplia' }
              ]} />
            </Stack>
          </Card>
        </div>

        <p class="note">
          El panel es parte del componente <em>a propósito</em>. Un tablist cuyo
          <span class="sx-id">aria-controls</span> apunta a un id que alguien se olvidó de
          renderizar es la implementación de pestañas rota más común que existe, y es invisible
          hasta que la toca un lector de pantalla. Dejá el slot vacío —&nbsp;para la barra rara que
          sólo maneja una ruta&nbsp;— y el componente no emite <span class="sx-id">aria-controls</span>
          en absoluto.
        </p>
      </section>

      <!-- ═══ FILTERCHIPS ════════════════════════════════════════════════ -->
      <section id="chips">
        <h2>FilterChips</h2>
        <p class="why">
          Angostar el conjunto sin salir de la pantalla. La regla que este componente existe para
          hacer cumplir: <b>las cuentas se calculan sobre TODO el conjunto, nunca sobre la vista
          filtrada.</b> Un chip cuyo número cambia cuando lo apretás no sirve para comparar —&nbsp;y
          comparar es la razón entera de que los números estén ahí.
        </p>

        <div class="demo">
          <Card pad={5}>
            <Stack gap={4}>
              <FilterChips label="Filtrar por estado" options={opciones} total={ORDENES.length} bind:value={estado} />
              <p class="seg-out">
                Mostrando <b class="sx-num">{visibles.length}</b> de
                <b class="sx-num">{ORDENES.length}</b> equipos.
                Apretá un chip y mirá los <em>otros</em> números: no se mueven. Esa es la foto de la
                flota, y si se derivaran de las filas filtradas la foto desaparecería —&nbsp;peor,
                sería reemplazada por una que parece igual de autorizada.
              </p>
            </Stack>
          </Card>
        </div>

        <p class="note">
          Los chips son Pills, así que un filtro sobre estados semánticos lleva el tono Y su marca
          Y su palabra. Un filtro sobre grupos planos (familia, ubicación) no tiene estado que
          llevar, así que no lleva marca —&nbsp;que es exactamente para lo que existe
          <span class="sx-id">mark=&#123;false&#125;</span> en Pill.
        </p>
      </section>

      <!-- ═══ SEARCHFIELD ════════════════════════════════════════════════ -->
      <section id="search">
        <h2>SearchField</h2>
        <p class="why">
          Tres cosas que un <span class="sx-id">&lt;input&gt;</span> pelado hace mal siempre, y son
          las tres que deciden si la gente usa la búsqueda: el atajo (y que <em>lo diga</em>, en un
          <span class="sx-id">&lt;kbd&gt;</span>, adentro del campo), Escape en dos tiempos —&nbsp;primero
          limpia, después suelta el foco&nbsp;— y la cuenta de resultados <em>anunciada</em>.
        </p>

        <div class="demo">
          <Card pad={5}>
            <Stack gap={4}>
              <SearchField
                bind:value={q}
                label="Buscar equipos"
                placeholder="Código, nombre o placa…"
                resultCount={encontrados.length}
                noun="equipos"
                showLabel
              />
              <Row gap={2}>
                {#each encontrados as e (e)}<Pill tone="neutral" mark={false} size="sm">{e}</Pill>{/each}
                {#if !encontrados.length}<span class="seg-out">Ningún equipo coincide con «{q}».</span>{/if}
              </Row>
              <p class="tiny">
                Apretá <b>/</b> en cualquier parte de esta página. El campo se enfoca y selecciona
                lo que tenga. No lo hace mientras estás escribiendo en otro lado, ni con un diálogo
                modal abierto —&nbsp;enfocar algo que la persona no puede ver es peor que no hacer nada.
              </p>
            </Stack>
          </Card>
        </div>

        <p class="note">
          <b>No hace debounce y no filtra.</b> Cuánto esperar es propiedad de la consulta que está
          detrás —&nbsp;0 para un arreglo local, 250&nbsp;ms para una ida al servidor&nbsp;— y un
          componente que adivinara estaría equivocado en una de las dos. Reporta la cadena; la
          superficie es dueña de la coincidencia.
        </p>
      </section>

      <!-- ═══ PAGINATION ═════════════════════════════════════════════════ -->
      <section id="pagination">
        <h2>Pagination</h2>
        <p class="why">
          <b>La oración es el componente.</b> «Mostrando 51–75 de 312 servicios» es lo que alguien
          de verdad lee; los botones son cómo actúa sobre eso. Un paginador que muestra «‹ 1 2 3 ›»
          y ningún total escondió el único dato que importa —&nbsp;cuánto falta&nbsp;— y todo
          operador aprende a desconfiar de él.
        </p>

        <div class="demo">
          <Card pad={5}>
            <Pagination bind:page bind:pageSize total={312} noun="servicios" nounOne="servicio" sizes={[25, 50, 100]} />
          </Card>
          <Card pad={5}>
            <Pagination page={1} pageSize={40} total={18} noun="órdenes" nounOne="orden" />
          </Card>
        </div>

        <p class="note">
          Los números son tabulares en todas partes acá: un paginador no es más que cifras al lado
          de cifras, y «1&nbsp;111» tiene que medir lo mismo que «8&nbsp;888» o la fila tiembla
          mientras se pasan páginas. Abajo de 560&nbsp;px la lista numerada se va y queda
          «Página 3 de 13», que dice lo mismo en una línea.
        </p>
      </section>

      <!-- ═══ SIDERAIL ═══════════════════════════════════════════════════ -->
      <section id="rail">
        <h2>SideRail</h2>
        <p class="why">
          El <em>segundo</em> nivel de navegación. La Shell de Hivestrix ya es dueña del primero
          —&nbsp;su barra lateral de 240&nbsp;px&nbsp;— así que un módulo que dibuja una segunda
          barra de altura completa al lado construyó un pasillo. Un rail es para un módulo con
          secciones de verdad separadas entre las que la gente se mueve todo el día.
        </p>

        <div class="demo">
          <div class="railwrap">
            <SideRail items={secciones} bind:value={seccion} bind:collapsed={tucked} collapsible label="Secciones del módulo" />
            <Card pad={5}>
              <Stack gap={2}>
                <p class="sx-cap">Sección activa</p>
                <p class="big"><b>{secciones.find((s) => s.key === seccion)?.label ?? '—'}</b></p>
                <p class="tiny">
                  Apretá «Contraer». La etiqueta se <em>recorta</em>, no se elimina: ese texto ES el
                  nombre accesible del botón. Si fuera <span class="sx-id">display:none</span> el
                  rail entero se leería como una fila de botones sin nombre, y el parche habitual
                  —&nbsp;un <span class="sx-id">aria-label</span>&nbsp;— habría que mantenerlo
                  sincronizado con el texto visible para siempre.
                </p>
                <p class="tiny">
                  Y la cuenta sigue siendo una <em>cifra</em> al contraerse. La tentación es un
                  puntito de color, y un puntito es color viajando solo, sin palabra y sin número.
                  «7» es más chico que una etiqueta y dice más.
                </p>
              </Stack>
            </Card>
          </div>
        </div>
      </section>

      <!-- ═══ SHORTCUTOVERLAY ════════════════════════════════════════════ -->
      <section id="shortcuts">
        <h2>ShortcutOverlay</h2>
        <p class="why">
          Un atajo que nadie puede descubrir no existe, y un tooltip al pasar el mouse no es
          descubrimiento —&nbsp;hay que saber ya dónde pasar el mouse. Entonces:
          <b>?</b> abre esto, desde cualquier parte, y toda pantalla que tenga atajos dice «?» en
          algún lado una vez. Ese es el contrato entero.
        </p>

        <div class="demo">
          <Row gap={3} align="center">
            <Button on:click={() => (keysOpen = true)}>Ver los atajos</Button>
            <span class="tiny">…o apretá <b>?</b> en cualquier parte de esta página.</span>
          </Row>
        </div>

        <ShortcutOverlay bind:open={keysOpen} groups={grupos} subtitle="Válidos en esta página del catálogo." />

        <p class="note">
          <b>No liga los atajos que lista.</b> Liga exactamente uno —&nbsp;su propio
          <span class="sx-id">?</span>&nbsp;— y todo lo demás es cosa de la superficie. Una hoja de
          ayuda que promete una tecla que nadie escucha es peor que ninguna hoja: la persona la
          aprieta, no pasa nada, y ahora no confía en ninguna de las otras. Quien escribe el
          manejador escribe la fila.
        </p>
        <p class="note">
          El foco lo atrapa un <span class="sx-id">&lt;dialog&gt;</span> nativo abierto con
          <span class="sx-id">showModal()</span>, y esa es la implementación completa de la trampa:
          el navegador lo pone en la capa superior, vuelve inerte todo lo de atrás, mantiene Tab
          adentro, maneja Escape y —&nbsp;la parte que las trampas hechas a mano se olvidan&nbsp;—
          <em>devuelve el foco</em> a lo que lo tenía antes. Una trampa que no tuviste que escribir
          es una trampa que no puede estar mal.
        </p>

        <h3 class="sx-cap sub">grupos sin título — el estado que rompía</h3>
        <p class="why">
          Dos grupos sin <span class="sx-id">title</span> tenían la misma clave —
          <span class="sx-id">undefined</span>, las dos veces— en el bucle que los dibuja. Svelte
          encuentra esa colisión y tira: no un grupo mal dibujado, la hoja entera en blanco. El
          arreglo es la misma clave con reserva que ya usa <span class="sx-id">SideRail</span>
          contra el índice, que nunca se repite. Queda demostrado, no sólo corregido.
        </p>
        <div class="demo">
          <Button variant="outline" on:click={() => (keysSinTituloOpen = true)}>
            Ver dos grupos sin título
          </Button>
        </div>
        <ShortcutOverlay
          bind:open={keysSinTituloOpen}
          groups={gruposSinTitulo}
          title="Dos grupos sin título"
          subtitle="El caso que dejaba la pantalla en blanco antes de la clave con reserva."
        />
      </section>

      <section class="closing">
        <h2>Lo que esta página todavía no muestra</h2>
        <ul>
          <li><span class="sx-id">Tabs manual</span>: las flechas mueven el foco sin seleccionar, para paneles que cuestan una ida al servidor.</li>
          <li><span class="sx-id">PageHeader sticky</span>, que sólo tiene sentido sobre un libro largo que hace scroll de verdad.</li>
          <li><span class="sx-id">FilterChips multiple</span> y el estado de error de SearchField, que están implementados y sin dibujar.</li>
        </ul>
      </section>
    </main>
  </div>
</div>

<style>
  .page { max-width: 1180px; margin: 0 auto; padding: var(--sx-s-12) var(--sx-s-5) var(--sx-s-20); }

  /* La ruta del archivo es un identificador, y un identificador no se grita:
     el registro de caption pone `text-transform: uppercase` y acá se apaga. */
  .lede :global(.sx-id) { text-transform: none; letter-spacing: 0; }

  .lede { max-width: 82ch; }
  h1 {
    margin: var(--sx-s-3) 0 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.035em;
    line-height: 1.05;
  }
  .stand { margin: var(--sx-s-5) 0 0; max-width: 70ch; font-size: var(--sx-t-lg); line-height: 1.5; color: var(--sx-ink-2); }

  /* La misma técnica que usa `Table`, por la misma razón: una columna que se
     fue de la pantalla en silencio es una columna que nadie sabe que hay que
     buscar. Las dos tapas viajan CON el contenido (`local`) y descubren una
     sombra que se queda quieta (`scroll`), así que un borde se oscurece sólo
     mientras todavía queda algo más allá. El gris se mezcla desde --sx-n-900,
     el único neutro que NO se re-amarra en oscuro: una sombra es ausencia de
     luz en los dos temas. */
  .chooser {
    --shade: color-mix(in srgb, var(--sx-n-900) 16%, transparent);
    margin-top: var(--sx-s-8);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    overflow-x: auto;
    background-color: var(--sx-surface);
    background-image:
      linear-gradient(to right, var(--sx-surface) 40%, transparent),
      linear-gradient(to left, var(--sx-surface) 40%, transparent),
      radial-gradient(farthest-side at 0 50%, var(--shade), transparent),
      radial-gradient(farthest-side at 100% 50%, var(--shade), transparent);
    background-position: 0 0, 100% 0, 0 0, 100% 0;
    background-size: var(--sx-s-10) 100%, var(--sx-s-10) 100%, var(--sx-s-3) 100%, var(--sx-s-3) 100%;
    background-repeat: no-repeat;
    background-attachment: local, local, scroll, scroll;
  }
  /* Las celdas NO pintan fondo: si lo pintaran taparían las tapas y las sombras
     de arriba, que es el error obvio al copiar esta técnica. */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead th { text-align: left; padding: var(--sx-s-3) var(--sx-s-4); box-shadow: inset 0 -1px 0 var(--sx-line); white-space: nowrap; }
  tbody th, tbody td {
    text-align: left;
    padding: var(--sx-s-3) var(--sx-s-4);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-normal);
    color: var(--sx-ink-2);
    box-shadow: inset 0 -1px 0 var(--sx-line);
    vertical-align: top;
  }
  tbody tr:last-child th, tbody tr:last-child td { box-shadow: none; }

  .sx-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }

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

  main { display: flex; flex-direction: column; gap: var(--sx-s-16); min-width: 0; }
  section { min-width: 0; scroll-margin-top: var(--sx-s-16); }
  h2 { margin: 0; font-size: var(--sx-t-xl); font-weight: var(--sx-w-bold); letter-spacing: -.025em; }
  .why { margin: var(--sx-s-3) 0 0; max-width: 68ch; font-size: var(--sx-t-md); line-height: 1.6; color: var(--sx-ink-2); }
  .sub { margin: var(--sx-s-8) 0 0; }
  .note {
    margin: var(--sx-s-5) 0 0;
    max-width: 72ch;
    padding: var(--sx-s-4);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-2);
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }
  .tiny { margin: 0; font-size: var(--sx-t-xs); line-height: 1.6; color: var(--sx-ink-3); max-width: 66ch; }

  .demo { margin-top: var(--sx-s-6); display: flex; flex-direction: column; gap: var(--sx-s-4); }
  /* Para poner variantes una al lado de la otra sobre el mismo contenido —
     ver `Superficies.svelte`, que ya tiene el mismo patrón para Card. */
  .demo.three-up { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr)); gap: var(--sx-s-4); }
  .panel p { margin: 0; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-2); }
  .seg-out { margin: 0; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-2); max-width: 68ch; }
  .big { margin: 0; font-size: var(--sx-t-xl); font-weight: var(--sx-w-semi); letter-spacing: -.025em; }

  .railwrap { display: flex; gap: var(--sx-s-4); align-items: start; }
  .railwrap :global(.rail) { flex: none; }
  .railwrap > :global(*:last-child) { flex: 1 1 auto; min-width: 0; }

  .closing { padding-top: var(--sx-s-8); box-shadow: inset 0 1px 0 var(--sx-line); }
  .closing ul { margin: var(--sx-s-4) 0 0; padding-left: var(--sx-s-5); max-width: 70ch; }
  .closing li { font-size: var(--sx-t-sm); line-height: 1.7; color: var(--sx-ink-2); }

  @media (max-width: 900px) {
    .body { grid-template-columns: 1fr; gap: var(--sx-s-6); }
    .toc { position: static; }
    .toc ul { flex-direction: row; flex-wrap: wrap; gap: var(--sx-s-1); }
  }

  @media (max-width: 720px) {
    .page { padding: var(--sx-s-8) var(--sx-s-4) var(--sx-s-16); }
    h1 { font-size: var(--sx-t-2xl); }
    .stand { font-size: var(--sx-t-md); }
    /* El rail cuesta una columna entera, y a este ancho no hay columna que
       gastar: se apila arriba del contenido que gobierna. */
    .railwrap { flex-direction: column; }
    .railwrap :global(.rail) { width: 100%; }
  }
</style>
