<script>
  // HERO — el panel grande, el primero de una pantalla.
  //
  // QUÉ ES Y POR QUÉ NO ES UN Panel CON MÁS PADDING
  //
  // El primer bloque de un tablero no es un panel más: es el que responde
  // «¿cómo vamos?» antes de que nadie lea una tabla. Tiene tres cosas que un
  // Panel no tiene, y por eso es un componente y no una variante:
  //
  //   · DOS COLUMNAS con pesos distintos. A la izquierda va lo que se lee —el
  //     titular, la frase, la acción—; a la derecha las cifras. La proporción
  //     es 1.4 a 1, no mitad y mitad: una columna que pesa igual que la otra
  //     deja de ser secundaria y las dos compiten.
  //   · SU PROPIO CAMPO. Un Panel toma el color de la página; éste trae el
  //     suyo, porque es el único bloque que puede permitírselo — hay uno solo
  //     por pantalla.
  //   · MÁS AIRE Y MÁS RADIO. 32/36 de relleno y el radio grande de la escala.
  //     Es lo que lo separa de las tarjetas que vienen abajo sin necesidad de
  //     ninguna línea.
  //
  // Adaptado de un ERP en producción, que lo resuelve con estas mismas tres
  // decisiones. Lo que se copió es la ESTRUCTURA; el color sale del acento del
  // producto, así que cada módulo tiñe el suyo sin tocar la librería.
  //
  //   <Hero title="Flota" lede="Cuatro equipos vencidos.">
  //     <svelte:fragment slot="actions"><Button>Registrar</Button></svelte:fragment>
  //     <svelte:fragment slot="aside"><StatStrip … /></svelte:fragment>
  //   </Hero>
  //
  // A UNA COLUMNA CUANDO NO ENTRA. Abajo de 720px las dos columnas se apilan y
  // las cifras quedan debajo del titular, que es el orden en que se leen igual.
  // No se ocultan: en un tablero, esconder el número es esconder la respuesta.

  /** El titular. Es un h1 salvo que la pantalla ya tenga uno. */
  export let title = '';
  /** El nivel real de ese encabezado en la página: 1 | 2 | 3. */
  export let level = 1;
  /** Una frase, no un párrafo. Lo que hay que saber antes de mirar las cifras. */
  export let lede = '';
  /** `soft` toma el acento; `ink` va oscuro; `plain` usa la superficie normal. */
  export let surface = 'soft';
  /** Un tono semántico para cuando el estado general urge. */
  export let tone = '';

  const TONES = ['positive', 'attention', 'critical', 'info', 'neutral'];
  $: t = TONES.includes(tone) ? tone : '';
  $: css = t ? `--hero-tone:var(--sx-${t})` : '';
</script>

<section class="hero {surface}" class:toned={!!t} style={css}>
  <div class="grid">
    <div class="lead">
      {#if title}
        <svelte:element this={`h${level}`} class="title">{title}</svelte:element>
      {/if}
      {#if lede}<p class="lede">{lede}</p>{/if}
      <slot />
      {#if $$slots.actions}
        <div class="actions"><slot name="actions" /></div>
      {/if}
    </div>

    {#if $$slots.aside}
      <div class="aside"><slot name="aside" /></div>
    {/if}
  </div>
</section>

<style>
  .hero {
    position: relative;
    padding: var(--sx-s-8) var(--sx-s-10);
    border-radius: var(--sx-r-3);
    overflow: hidden;
    /* El resplandor de la perilla del sistema. En 0 no dibuja nada. */
    box-shadow: var(--sx-e-2),
                0 0 32px 2px color-mix(in srgb, var(--sx-glow-color) var(--sx-glow), transparent);
  }

  /* LAS TRES SUPERFICIES. La diferencia entre ellas es de qué está hecho el
     campo, no de cuánto color lleva: una toma el acento, otra la tinta, la
     tercera no toma nada. Un producto elige una y la repite. */
  .soft {
    background:
      linear-gradient(135deg,
        color-mix(in srgb, var(--sx-accent) 12%, var(--sx-surface)) 0%,
        color-mix(in srgb, var(--sx-accent) 4%, var(--sx-surface)) 100%);
    color: var(--sx-ink);
  }
  .ink {
    background:
      linear-gradient(135deg, var(--sx-n-900) 0%, var(--sx-n-800) 100%);
    color: var(--sx-n-0);
  }
  .plain { background: var(--sx-surface); color: var(--sx-ink); }

  /* EL TONO NO TIÑE EL CAMPO, LO CANTEA. Un hero teñido de rojo entero es una
     alarma, y el estado general de una flota casi nunca lo es. La barra dice lo
     mismo sin apoderarse del bloque. */
  .toned::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-start: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--hero-tone), transparent);
    opacity: .9;
    pointer-events: none;
  }

  /* 1.4 a 1: la izquierda pesa más porque es la que se lee. */
  .grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: var(--sx-s-8);
    align-items: center;
  }
  .lead { display: flex; flex-direction: column; gap: var(--sx-s-3); min-width: 0; }
  .aside {
    display: flex; flex-direction: column; justify-content: center;
    gap: var(--sx-s-3); min-width: 0;
  }

  .title {
    margin: 0;
    font-size: var(--sx-t-2xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.02em;
    line-height: 1.1;
  }
  .lede {
    margin: 0;
    font-size: var(--sx-t-lg);
    color: color-mix(in srgb, currentColor 72%, transparent);
    max-width: 52ch;
  }
  .actions { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); margin-top: var(--sx-s-2); }

  /* Se apila, no se oculta. En un tablero, esconder el número es esconder la
     respuesta — y el orden apilado es el mismo en que se lee de todos modos. */
  @media (max-width: 720px) {
    .hero { padding: var(--sx-s-6); }
    .grid { grid-template-columns: 1fr; gap: var(--sx-s-5); }
    .title { font-size: var(--sx-t-xl); }
    .lede { font-size: var(--sx-t-md); }
  }
</style>
