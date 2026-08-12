<script>
  // MÉTRICAS — la página de la familia METRIC.
  //
  // La tercera que no existía, y la que peor consecuencia tenía: `src/lib/metric`
  // ni siquiera tenía un `index.js`, así que de las siete familias era la única
  // que un consumidor no podía importar. Nadie lo notó porque nada la renderizaba.
  import { Stat, StatStrip, Bar, Threshold, StackedBar, Sparkline } from '../../lib/metric/index.js';
  import { Card, Panel, Stack, Row, Well, Glyph } from '../../lib/shell/index.js';
  import Button from '../../lib/action/Button.svelte';
  import Pill from '../../lib/Pill.svelte';

  const TOC = [
    ['stat', 'Stat'], ['strip', 'StatStrip'], ['bar', 'Bar'], ['threshold', 'Threshold'],
    ['stacked', 'StackedBar'], ['spark', 'Sparkline'], ['estados', 'Los estados']
  ];

  // Doce meses de costo de mantenimiento de un patio de batidoras, en miles de
  // colones, más dos meses proyectados al ritmo de los últimos noventa días.
  const costo = [380, 412, 405, 468, 502, 441, 396, 523, 610, 548, 590, 634];
  const proyectado = [671, 702];

  const horas = [38, 41, 39, 44, 42, 47];
  const plano = [96, 96, 96, 96, 96];

  let cargando = false;
  function recargar() {
    cargando = true;
    setTimeout(() => (cargando = false), 2200);
  }
</script>

<div class="page">
  <header class="lede">
    <p class="sx-cap">Familia · <span class="sx-id">src/lib/metric</span></p>
    <h1>Métricas</h1>
    <p class="stand">
      Una cifra pelada no es información. «7» se vuelve información sólo cuando tres cosas más
      están al lado: qué cuenta, en qué se mide, y contra qué se compara. Esta familia es la forma
      que mantiene esas cuatro cosas juntas, para que una pantalla llena de números se pueda
      barrer en vez de descifrar.
    </p>

  </header>

  <div class="rules">
    <div>
      <h2 class="sx-cap">Nada nunca es cero</h2>
      <p>
        «0 servicios» es una afirmación sobre el negocio. «— · sin lecturas todavía» es una
        afirmación sobre el registro. Imprimir la primera cuando la cierta es la segunda es cómo
        un tablero empieza a mentir, así que un valor nulo <em>nunca</em> se dibuja como un dígito.
      </p>
    </div>
    <div>
      <h2 class="sx-cap">Una estimación no es una medición</h2>
      <p>
        Una proyección construida sobre un ciclo declarado y una cifra contada de facturas no
        pueden llevar la misma tipografía. Toda estimación de esta familia lleva
        <em>las mismas dos marcas</em>: un registro quebrado —&nbsp;regla punteada, relleno
        rayado, trazo discontinuo&nbsp;— y la palabra «estimado». Una forma y una palabra, nunca
        un color solo.
      </p>
    </div>
    <div>
      <h2 class="sx-cap">Toda longitud dice de cuánto</h2>
      <p>
        La razón por la que las barras engañan casi nunca es el dibujo: es la escala que falta.
        Por eso <span class="sx-id">max</span> no es opcional en Bar y la cota se
        <em>imprime</em>, siempre. Una barra de esta librería no se puede dibujar sin declarar de
        qué es una fracción.
      </p>
    </div>
  </div>


  <div class="body">
    <nav class="toc" aria-label="Índice de la página">
      <ul>
        {#each TOC as [id, name] (id)}
          <li><a href="#/metricas/{id}">{name}</a></li>
        {/each}
      </ul>
    </nav>

    <main>
      <!-- ═══ STAT ═══════════════════════════════════════════════════════ -->
      <section id="stat">
        <h2>Stat</h2>
        <p class="why">
          La cifra. Con su unidad, su denominador cuando lo tiene, su cambio contra el período
          anterior y el período <em>dicho</em> —&nbsp;un delta sin su período es ilegible.
        </p>

        <div class="demo cols">
          <Card pad={5}><Stat label="Cumplimiento" value={94} unit="%" delta={6} deltaUnit="pp" since="vs. semestre anterior" better="up" /></Card>
          <Card pad={5}><Stat label="Costo del trimestre" value={4820000} unitBefore unit="₡" delta={-380000} since="vs. trimestre anterior" better="down" /></Card>
          <Card pad={5}><Stat label="Equipos activos" value={8} outOf={9} /></Card>
          <Card pad={5}><Stat label="Sin cerrar" value={7} clickable actionLabel="Ver los 7 servicios sin cerrar" /></Card>
        </div>

        <p class="note">
          <b>Un delta nunca llega a crítico.</b> Una tendencia que se mueve para el lado malo es
          «attention» como mucho —&nbsp;una cifra que de verdad cruzó una línea es otro trabajo&nbsp;—
          y una franja con tres flechas rojas le enseña a la gente a dejar de mirar. Qué lado es
          el malo no se puede saber desde acá (gasto que sube es malo, cumplimiento que sube es
          bueno), así que <span class="sx-id">better</span> hay que declararlo, y un delta sin
          declarar se queda acromático a propósito.
        </p>

        <h3>Los dos estados que son la razón de que esto no sea un <span class="sx-id">&lt;span&gt;</span></h3>
        <div class="demo cols">
          <Card pad={5}>
            <Stat label="Horómetro de BAT022" value={null} empty="Sin lecturas todavía" />
          </Card>
          <Card pad={5}>
            <Stat label="Costo proyectado" value={5340000} unitBefore unit="₡" estimate
              note="Al ritmo de los últimos 90 días. No incluye repuestos en tránsito." />
          </Card>
          <Card pad={5}>
            <Stat label="MTTR" value={null} loading />
          </Card>
          <Card pad={5}>
            <Stat label="Disponibilidad" value={null}
              error="No se pudo leer el histórico. Reintentá; si sigue igual avisá con la hora exacta." />
          </Card>
        </div>
      </section>

      <!-- ═══ STATSTRIP ══════════════════════════════════════════════════ -->
      <section id="strip">
        <h2>StatStrip</h2>
        <p class="why">
          Un instrumento, no una fila de tarjetas. Cinco cifras sobre la misma flota pertenecen a
          la misma lectura, y cinco tarjetas con sombra dicen lo contrario: cada una con su borde,
          su elevación y su reclamo sobre el ojo, así que la persona termina comparando cajas en
          vez de números.
        </p>

        <div class="demo">
          <StatStrip label="Estado de la flota">
            <Stat label="Cumplimiento" value={94} unit="%" delta={6} deltaUnit="pp" since="vs. semestre" better="up" />
            <Stat label="Equipos activos" value={48} outOf={51} />
            <Stat label="Sin cerrar" value={7} clickable actionLabel="Ver los 7 servicios sin cerrar" />
            <Stat label="Costo 12 meses" value={5909000} unitBefore unit="₡" />
            <Stat label="MTTR" value={4.2} unit="h" delta={-0.8} since="vs. semestre" better="down" />
          </StatStrip>
        </div>

        <p class="note">
          Las divisiones son el <span class="sx-id">gap</span> de la grilla, de un píxel, sobre un
          fondo <span class="sx-id">--sx-line</span>; cada celda pinta <span class="sx-id">--sx-surface</span>
          encima. Por eso las reglas siguen siendo correctas cuando la franja envuelve a dos filas
          en una tableta: no existe «la última celda de la fila» que haya que tratar aparte, que es
          exactamente donde se rompe una franja hecha con bordes.
        </p>
      </section>

      <!-- ═══ BAR ════════════════════════════════════════════════════════ -->
      <section id="bar">
        <h2>Bar</h2>
        <p class="why">
          Una longitud que dice de qué es longitud. <b>Para comparar una lista, dale a todas las
          barras el MISMO <span class="sx-id">max</span></b> —&nbsp;esa es la idea entera. Una
          lista de barras escaladas cada una a su propio valor es una lista de barras llenas, que
          es un borde decorativo con números encima.
        </p>

        <div class="demo two">
          <Panel title="Costo por bodega" sub="Mismo máximo en las cuatro: ₡4 200 000" level={3}>
            <Stack gap={4}>
              <Bar label="Bodega Opra" value={1840000} max={4200000} unit="₡" unitBefore />
              <Bar label="Bodega Guanacaste" value={3480000} max={4200000} unit="₡" unitBefore />
              <Bar label="Taller central" value={920000} max={4200000} unit="₡" unitBefore />
              <Bar label="Servicio en sitio" value={340000} max={4200000} unit="₡" unitBefore />
            </Stack>
          </Panel>

          <Panel title="Los estados que importan" level={3}>
            <Stack gap={4}>
              <Bar label="Horas del mes" value={186} max={200} unit="h" tone="attention" toneWord="Cerca del tope" />
              <Bar label="Horas de BAT019" value={228} max={200} unit="h" tone="critical" toneWord="Pasó el tope" />
              <Bar label="Consumo proyectado" value={220} max={200} unit="h" estimate
                note="Al ritmo de los últimos 30 días." />
              <Bar label="Horas de BAT022" value={null} max={200} unit="h" empty="Sin lecturas todavía" />
              <Bar label="Sin cota declarada" value={140} max={null} unit="h" />
            </Stack>
          </Panel>
        </div>

        <p class="note">
          <b>Pasarse de la cota es una lectura de verdad, no un error.</b> El relleno llega al
          final, una muesca marca que no se detuvo ahí, y la línea de escala lo dice con palabras:
          «supera 200&nbsp;h». Recortar en silencio es cómo una barra dice su primera mentira. Y la
          última fila de arriba es la que importa más: sin <span class="sx-id">max</span> el
          componente <em>se niega a dibujar</em> y explica por qué, en vez de inventar una escala.
        </p>
      </section>

      <!-- ═══ THRESHOLD ══════════════════════════════════════════════════ -->
      <section id="threshold">
        <h2>Threshold</h2>
        <p class="why">
          Una línea que alguien no debe cruzar. No es Bar con un color que cambia en un punto de
          quiebre —&nbsp;eso ya existe, es la segunda fila del Panel de arriba&nbsp;— y no alcanza:
          un color que cambia no dice <em>dónde</em> está el límite ni <em>cuánto</em> se cruzó.
          Acá el límite se dibuja como una línea, en una posición que <b>no se mueve nunca</b>, y
          el pie hace la resta que nadie más tiene que hacer.
        </p>

        <div class="demo two">
          <Panel title="El caso real" sub="Horómetro con plan de mantenimiento" level={3}>
            <Stack gap={4}>
              <Threshold label="Horómetro de BAT014" value={312} limit={250} unit="h" overWord="Vencido" />
              <Threshold label="Horómetro de BAT009" value={186} limit={250} unit="h" />
              <Threshold label="Presupuesto del trimestre" value={3400000} limit={4200000}
                unit="₡" unitBefore overWord="Sobrepasado" />
            </Stack>
          </Panel>

          <Panel title="El caso que rompe" sub="Una cifra que se pasó MUCHO" level={3}>
            <Stack gap={4}>
              <Threshold label="Horas de BAT022 (24,8 % sobre el plan — el borde exacto de la banda)"
                value={312} limit={250} unit="h" overWord="Vencido" />
              <Threshold label="Horas de BAT031 (4× el plan)" value={1000} limit={250} unit="h" overWord="Vencido" />
              <Threshold label="Horas de BAT044 (40× el plan)" value={10000} limit={250} unit="h" overWord="Vencido" />
            </Stack>
          </Panel>
        </div>

        <p class="note">
          <b>La línea no se mueve.</b> Su posición es <span class="sx-id">1 / (1 + overRoom)</span>,
          una fracción constante que no depende del valor —&nbsp;80&nbsp;% del ancho con el
          <span class="sx-id">overRoom</span> por defecto (.25), siempre, esté la lectura debajo,
          apenas arriba o muy arriba del límite. La primera fila del segundo panel <em>es</em> el
          caso de BAT014 de la izquierda: 312 sobre 250 es 24,8&nbsp;% de sobra, el borde mismo de
          la banda de holgura, elegido a propósito para que el ejemplo real de esta cabecera quede
          a un píxel de necesitar la muesca — no un caso cómodo elegido para evitarla. Las dos
          filas de abajo sí la necesitan: 1000&nbsp;h y 10&nbsp;000&nbsp;h contra el mismo límite de
          250&nbsp;h clampan al mismo píxel — la muesca de Bar, prestada y no reinventada — y es la
          palabra del pie, «superado por 750&nbsp;h» / «superado por 9750&nbsp;h», la que separa
          una lectura de la otra cuando el dibujo ya no puede.
        </p>
        <p class="note">
          <b>Cruzar la línea es un estado</b>, y el sistema ya tiene el vocabulario: tono, marca y
          palabra, la ley de Pill, nunca menos de las tres. Por eso <span class="sx-id">overWord</span>
          no tiene un default de dominio —&nbsp;«Vencido» es correcto para un horómetro y sería
          falso para un presupuesto&nbsp;— cada producto pone la palabra que corresponde a lo que
          está midiendo.
        </p>

        <Panel title="Los estados feos" sub="Los mismos cuatro que el resto de la familia" level={3}>
          <div class="cols">
            <Threshold label="Horómetro de BAT051" value={280} limit={250} unit="h" loading />
            <Threshold label="Horómetro de BAT062" value={280} limit={250} unit="h"
              error="No se pudo leer el plan de mantenimiento. Reintentá; si sigue igual avisá con el código del equipo." />
            <Threshold label="Horómetro de BAT073" value={280} limit={null} unit="h" />
            <Threshold label="Consumo proyectado" value={296} limit={250} unit="h" estimate
              overWord="Vencido" note="Al ritmo de los últimos 30 días." />
          </div>
        </Panel>
      </section>

      <!-- ═══ STACKEDBAR ═════════════════════════════════════════════════ -->
      <section id="stacked">
        <h2>StackedBar</h2>
        <p class="why">
          Partes de un todo, con las partes nombradas. <b>La leyenda no es un accesorio de este
          componente: es la mitad de él.</b> Una barra apilada sin su leyenda son cuatro
          rectángulos grises, y una cuya leyenda sólo da los nombres es un examen. Por eso cada
          entrada lleva su palabra, su cifra y su porcentaje, y por eso la lista siempre se
          renderiza y no se puede apagar.
        </p>

        <div class="demo two">
          <Panel title="Costo del trimestre" level={3}>
            <StackedBar
              label="Composición" unit="₡" unitBefore
              segments={[
                { label: 'Repuestos', value: 1840000 },
                { label: 'Mano de obra', value: 980000 },
                { label: 'Servicio en sitio', value: 320000 },
                { label: 'Traslados', value: 140000 },
                { label: 'Consumibles', value: 96000 },
                { label: 'Otros gastos', value: 42000 }
              ]}
            />
          </Panel>

          <Panel title="Planes de la flota" sub="Los segmentos SON estados" level={3}>
            <StackedBar
              label="51 equipos" total={51}
              segments={[
                { label: 'Al día', value: 41, tone: 'positive' },
                { label: 'Por vencer', value: 5, tone: 'attention' },
                { label: 'Vencidos', value: 3, tone: 'critical' }
              ]}
            />
          </Panel>
        </div>

        <p class="note">
          La rampa de series es <b>acromática</b>: cuatro pasos de la rampa de tinta, porque el
          cromo en este sistema es neutros más elevación y una paleta de categorías es la vía más
          rápida a seis productos que cada uno entiende algo distinto por «azul». Pasado el cuarto
          segmento la cola se pliega en «Otros (3)» <em>y se dice que se plegó</em> —&nbsp;un quinto
          gris es un gris que nadie puede nombrar. Cuando los segmentos SON estados usan el
          vocabulario del sistema, y ahí el tono gana: la barra de la derecha se lee igual que los
          Pills de la portada.
        </p>
        <p class="note">
          El dibujo está oculto de las tecnologías de asistencia y la leyenda no. La alternativa
          —&nbsp;un <span class="sx-id">role="img"</span> cuyo label recita la composición
          entera&nbsp;— le hace leer cada cifra dos veces a un lector de pantalla: una como oración
          y otra como la lista que está justo abajo. La lista <em>son</em> los datos; la barra es la
          lista, dibujada.
        </p>
      </section>

      <!-- ═══ SPARKLINE ══════════════════════════════════════════════════ -->
      <section id="spark">
        <h2>Sparkline</h2>
        <p class="why">
          La forma de una serie, del tamaño de una palabra. Contesta una pregunta —&nbsp;«¿venía
          subiendo?»&nbsp;— y se niega a todas las demás: sin ejes, sin grilla, sin tooltip, sin
          línea de cero. Es un pedazo de tipografía que se dibuja, y vive al lado de la cifra que
          explica, nunca solo.
        </p>

        <div class="demo cols">
          <Card pad={5}>
            <Stack gap={2}>
              <Stat label="Costo mensual" value={634000} unitBefore unit="₡" size="sm" delta={44000} since="vs. mes anterior" better="down" />
              <Sparkline label="Costo mensual" unit="miles de ₡" values={costo} caption="12 meses" />
            </Stack>
          </Card>
          <Card pad={5}>
            <Stack gap={2}>
              <Stat label="Costo con proyección" value={702000} unitBefore unit="₡" size="sm" estimate />
              <Sparkline label="Costo con proyección" unit="miles de ₡" values={costo} projected={proyectado} caption="12 meses + 2 estimados" />
            </Stack>
          </Card>
          <Card pad={5}>
            <Stack gap={2}>
              <Stat label="Horas por semana" value={47} unit="h" size="sm" tone="attention" />
              <Sparkline label="Horas por semana" unit="h" values={horas} tone="attention" caption="6 semanas" />
            </Stack>
          </Card>
          <Card pad={5}>
            <Stack gap={2}>
              <Stat label="Serie plana" value={96} unit="h" size="sm" />
              <Sparkline label="Serie plana" unit="h" values={plano} caption="«no se movió» es una respuesta" />
            </Stack>
          </Card>
        </div>

        <p class="note">
          <b>Sin relleno de área, a propósito.</b> Una sparkline rellena se lee como «esta parte de
          aquello», que sólo es cierto cuando la base es cero —&nbsp;y la base de una sparkline es
          el mínimo de la propia serie, porque seis valores entre 380 y 540 aplastados contra el
          cero no dicen absolutamente nada. La línea lleva la forma; el relleno llevaría una
          magnitud que el dibujo no tiene.
        </p>
        <p class="note">
          <b>La proyección se dibuja como una promesa, no como una lectura.</b> Lo observado es una
          línea sólida en tinta. Lo de <span class="sx-id">projected</span> continúa desde la última
          medición real en trazo discontinuo y más claro, y el pie dice «estimado» —&nbsp;las mismas
          dos marcas que Stat pone bajo una cifra proyectada. Que una proyección lleve la misma
          línea que una medición es el único fallo que esta familia no se puede permitir.
        </p>
      </section>

      <!-- ═══ LOS ESTADOS ════════════════════════════════════════════════ -->
      <section id="estados">
        <h2>Los cuatro estados, en los seis componentes</h2>
        <p class="why">
          Cargando, vacío, fallado y estimado se comportan igual en toda la familia, porque una
          franja donde una celda dice «—», otra da vueltas y otra muestra un cero es una franja que
          nadie sabe leer.
        </p>

        <div class="demo">
          <Row gap={3} align="center">
            <Button on:click={recargar} busy={cargando}>Simular una lectura</Button>
            <span class="tiny">Dos segundos de estado cargando en las seis piezas a la vez.</span>
          </Row>

          <StatStrip label="Los mismos cinco, cargando">
            <Stat label="Cumplimiento" value={cargando ? null : 94} unit="%" loading={cargando} />
            <Stat label="Equipos" value={cargando ? null : 48} outOf={51} loading={cargando} />
            <Stat label="Sin cerrar" value={cargando ? null : 7} loading={cargando} />
            <Stat label="MTTR" value={cargando ? null : 4.2} unit="h" loading={cargando} />
          </StatStrip>

          <div class="cols">
            <Card pad={5}><Bar label="Horas del mes" value={cargando ? null : 186} max={200} unit="h" loading={cargando} /></Card>
            <Card pad={5}><Threshold label="Horómetro de BAT014" value={cargando ? null : 312} limit={250} unit="h" loading={cargando} /></Card>
            <Card pad={5}>
              <StackedBar label="Composición" loading={cargando}
                segments={cargando ? [] : [
                  { label: 'Repuestos', value: 18 },
                  { label: 'Mano de obra', value: 9 }
                ]} />
            </Card>
            <Card pad={5}><Sparkline label="Costo mensual" values={cargando ? [] : costo} loading={cargando} caption="12 meses" /></Card>
            <Card pad={5}>
              <Stack gap={3}>
                <Well tone="info">
                  <Row gap={2} wrap={false} align="start">
                    <Glyph name="alert" size={16} />
                    <span>Vacío y fallado se ven abajo: no son lo mismo y nunca se escriben con una sola oración.</span>
                  </Row>
                </Well>
                <Row gap={2}>
                  <Pill tone="neutral" size="sm">Vacío</Pill>
                  <Pill tone="critical" size="sm">Fallado</Pill>
                  <Pill tone="info" size="sm" mark={false}>Estimado</Pill>
                </Row>
              </Stack>
            </Card>
          </div>
        </div>
      </section>

      <section class="closing">
        <h2>Lo que esta familia todavía no tiene</h2>
        <ul>
          <li>
            <b>Una gráfica con ejes.</b> Sparkline no puede contestar «¿cuánto en marzo?» por
            diseño, y eso está bien: esa pregunta es de un gráfico con marcas, que vive en su
            propia pantalla y no en esta librería.
          </li>
          <li>
            <span class="sx-id">format.js</span> es local a esta familia y su propia cabecera dice
            que debería ser compartido. Sigue siéndolo: lo exporta
            <span class="sx-id">@strix/frontend-lib</span>, pero el archivo todavía vive en
            <span class="sx-id">metric/</span>.
          </li>
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

  .lede { max-width: 78ch; }
  h1 {
    margin: var(--sx-s-3) 0 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.035em;
    line-height: 1.05;
  }
  .stand { margin: var(--sx-s-5) 0 0; max-width: 70ch; font-size: var(--sx-t-lg); line-height: 1.5; color: var(--sx-ink-2); }

  /* THREE cells and `repeat(3, …)`, not `auto-fit`. The gap-as-divider trick —
     a 1px grid gap over a `--sx-line` background, each cell painting the
     surface back — is what StatStrip does and it is right, but it has one
     precondition: every cell in the grid must be filled. With `auto-fit` and
     three items the row wraps to 2 + 1 and the missing fourth cell shows
     through as a grey rectangle. Ask for exactly the columns you have. */
  .rules {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sx-s-1);
    margin-top: var(--sx-s-8);
    background: var(--sx-line);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
  }
  .rules > div { background: var(--sx-surface); padding: var(--sx-s-5); }
  /* GOTCHA QUE VALE ESCRIBIR: `.sx-cap` es una clase global de base.css con
     especificidad 0-1-0, y el selector de elemento `h2` de esta página, una vez
     que Svelte lo limita a su ámbito, es `h2.svelte-hash` — 0-1-1. El selector
     de tipo GANA, y el registro de caption se pierde en silencio. Cualquier
     página que estilice `h2` por elemento y use `.sx-cap` sobre uno tiene este
     bug. Se vuelve a declarar acá, explícito. */
  .rules h2 {
    margin: 0 0 var(--sx-s-2);
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--sx-ink-3);
  }
  .rules p { margin: 0; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-2); }

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
  h3 { margin: var(--sx-s-8) 0 0; font-size: var(--sx-t-md); font-weight: var(--sx-w-semi); }
  .why { margin: var(--sx-s-3) 0 0; max-width: 68ch; font-size: var(--sx-t-md); line-height: 1.6; color: var(--sx-ink-2); }
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
  .tiny { margin: 0; font-size: var(--sx-t-xs); line-height: 1.6; color: var(--sx-ink-3); }

  .demo { margin-top: var(--sx-s-6); display: flex; flex-direction: column; gap: var(--sx-s-4); }
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: var(--sx-s-4); }
  .two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(21rem, 100%), 1fr)); gap: var(--sx-s-4); }

  .closing { padding-top: var(--sx-s-8); box-shadow: inset 0 1px 0 var(--sx-line); }
  .closing ul { margin: var(--sx-s-4) 0 0; padding-left: var(--sx-s-5); max-width: 72ch; }
  .closing li { font-size: var(--sx-t-sm); line-height: 1.7; color: var(--sx-ink-2); margin-bottom: var(--sx-s-3); }

  @media (max-width: 1000px) {
    .rules { grid-template-columns: 1fr; }
  }

  @media (max-width: 900px) {
    .body { grid-template-columns: 1fr; gap: var(--sx-s-6); }
    .toc { position: static; }
    .toc ul { flex-direction: row; flex-wrap: wrap; gap: var(--sx-s-1); }
  }

  @media (max-width: 720px) {
    .page { padding: var(--sx-s-8) var(--sx-s-4) var(--sx-s-16); }
    h1 { font-size: var(--sx-t-2xl); }
    .stand { font-size: var(--sx-t-md); }
  }
</style>
