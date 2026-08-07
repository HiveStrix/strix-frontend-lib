<script>
  // El armazón de los ejemplos. Enseña dos cosas que no se ven leyendo el
  // código de la librería:
  //
  //   · pantallas reales construidas solo con componentes de la librería
  //   · qué pasa cuando se cambia la marca o el tema — cuatro tokens, no un
  //     archivo de tema por cliente
  //
  // La barra de arriba es del ejemplo, no de la librería. Está escrita a mano y
  // sin tokens a propósito, para que se distinga qué parte de la pantalla es la
  // librería demostrándose y qué parte es el demo hablando de ella.
  import Flota from './Flota.svelte';
  import Lectura from './Lectura.svelte';
  import Ficha from './Ficha.svelte';
  import Catalogo from './Catalogo.svelte';
  import Documentos from './Documentos.svelte';
  import Ajustes from './Ajustes.svelte';
  import PrimerDia from './PrimerDia.svelte';

  const EJEMPLOS = [
    { id: 'flota', nombre: 'Flota', nota: 'Datos: KPIs, filtros, tabla, barras', c: Flota },
    { id: 'lectura', nombre: 'Registrar lectura', nota: 'Formulario: validación y error', c: Lectura },
    { id: 'ficha', nombre: 'Ficha de equipo', nota: 'Detalle: jerarquía, pestañas, historial y diálogo', c: Ficha },
    { id: 'catalogo', nombre: 'Catálogo', nota: 'Buscar: filtros, orden y dos vistas de lo mismo', c: Catalogo },
    { id: 'documentos', nombre: 'Documentos', nota: 'Ingesta: procedencia de cada dato y revisión por lote', c: Documentos },
    { id: 'ajustes', nombre: 'Ajustes de familia', nota: 'Formulario largo: secciones, errores ubicados y un solo guardar', c: Ajustes },
    { id: 'primerdia', nombre: 'Primer día', nota: 'Vacíos: sin nada y a medias, y las tres puertas de entrada', c: PrimerDia }
  ];
  // El ejemplo abierto vive en el hash, para que un enlace apunte a uno concreto
  // y para que recargar no te devuelva al primero.
  const desdeHash = () =>
    EJEMPLOS.find((e) => e.id === (typeof location !== 'undefined' ? location.hash.slice(1) : '')) ??
    EJEMPLOS[0];
  let ejemplo = desdeHash();

  function abrir(e) {
    ejemplo = e;
    if (typeof location !== 'undefined') location.hash = e.id;
  }

  // Cambiar de marca es rebindear cuatro custom properties en la raíz. No hay
  // un segundo archivo de tema, ni una clase por marca, ni un build por cliente.
  const MARCAS = {
    'Sin marca': null,
    Opra: { accent: '#B45309', ink: '#FFFFFF', soft: '#FDF0DC', edge: '#EBC896' },
    Sarion: { accent: '#0E5A54', ink: '#FFFFFF', soft: '#E2EEEB', edge: '#A8CCC6' },
    Faro: { accent: '#3D3A8C', ink: '#FFFFFF', soft: '#E8E7F5', edge: '#BFBDE4' }
  };
  let marca = 'Opra';
  let oscuro = false;

  // La expresión va entera dentro del $:. Un helper declarado afuera que cierra
  // sobre `marca` no lo rastrea el compilador y el tema se queda pegado — un bug
  // que ya se envió cinco veces en este ecosistema.
  $: if (typeof document !== 'undefined') {
    const m = MARCAS[marca];
    const r = document.documentElement;
    if (m) {
      r.style.setProperty('--sx-accent', m.accent);
      r.style.setProperty('--sx-accent-ink', m.ink);
      r.style.setProperty('--sx-accent-soft', m.soft);
      r.style.setProperty('--sx-accent-edge', m.edge);
    } else {
      for (const p of ['--sx-accent', '--sx-accent-ink', '--sx-accent-soft', '--sx-accent-edge']) {
        r.style.removeProperty(p);
      }
    }
    r.dataset.sxTheme = oscuro ? 'dark' : 'light';
  }
</script>

<div class="demo-chrome">
  <div class="titulo">
    <strong>strix-frontend-example</strong>
    <span>Pantallas reales, construidas solo con @strix/frontend-lib</span>
  </div>

  <nav aria-label="Ejemplos">
    {#each EJEMPLOS as e}
      <button class:on={e.id === ejemplo.id} on:click={() => abrir(e)} title={e.nota}>
        {e.nombre}
      </button>
    {/each}
  </nav>

  <div class="controles">
    <label>
      Marca
      <select bind:value={marca}>
        {#each Object.keys(MARCAS) as m}<option>{m}</option>{/each}
      </select>
    </label>
    <label class="check">
      <input type="checkbox" bind:checked={oscuro} />
      Oscuro
    </label>
  </div>
</div>

<svelte:component this={ejemplo.c} />

<style>
  /* Andamio del ejemplo. Deliberadamente sin tokens del sistema. */
  :global(body) { margin: 0; background: var(--sx-ground, #f5f6f7); }

  .demo-chrome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 10px 24px;
    background: #14181a;
    color: #fff;
    font: 13px/1.4 ui-sans-serif, system-ui, sans-serif;
  }
  .titulo strong { display: block; font-size: 13px; font-weight: 620; }
  .titulo span { font-size: 11.5px; color: #8b9094; }

  nav { display: flex; gap: 2px; }
  nav button {
    font: inherit;
    font-size: 12.5px;
    padding: 5px 11px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: #b2b6b9;
    cursor: pointer;
  }
  nav button:hover { background: #24282b; color: #fff; }
  nav button.on { background: #fff; color: #14181a; }

  .controles { display: flex; align-items: center; gap: 14px; }
  label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #b2b6b9; }
  select {
    font: inherit;
    padding: 3px 6px;
    border-radius: 4px;
    border: 1px solid #3c4145;
    background: #24282b;
    color: #fff;
  }
  .check { cursor: pointer; }
</style>
