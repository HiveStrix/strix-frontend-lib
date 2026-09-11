<script>
  // DIVISION PICKER — el nodo del árbol organizacional, en un solo control.
  //
  // EL FILTRO ES POR SUBÁRBOL, no por igualdad: elegir una región incluye sus
  // sucursales. Eso lo resuelve el core; acá sólo se manda el id.
  //
  // NO HACE FETCH. Recibe `divisions` y ya. Esta librería no tiene capa de
  // datos en ninguna parte, y una ruta de backend más una convención de cookie
  // no son vocabulario de un sistema de diseño — además el catálogo no tiene
  // servidor. Cada core conserva su propio cargador del árbol.
  //
  // `value` ES UN STRING y `''` es «nada elegido». Qué significa ese vacío lo
  // decide el backend de cada core —«todas» al filtrar, «raíz» en una bodega,
  // «sin clasificar» en una compra— y por eso se traduce en el borde del API,
  // no acá.
  import { createEventDispatcher } from 'svelte';
  import Select from './Select.svelte';
  import Combobox from './Combobox.svelte';
  import { divisionOptions } from './divisionOptions.js';

  /** El árbol del tenant: [{ id, name, path, active }]. */
  export let divisions = [];
  export let value = '';

  export let label = 'División';
  export let hint = '';
  /** Sólo llega al Select: el Combobox no tiene `hintDot`. */
  export let hintDot = false;
  export let placeholder = 'Elegir…';
  /**
   * Cuando se usa como filtro: el texto de la opción que no filtra nada.
   * SUSTITUYE al placeholder — dos opciones vacías en la misma lista, una
   * deshabilitada, es una lista de la que no se puede volver atrás.
   */
  export let allLabel = '';
  export let includeInactive = false;
  export let disabled = false;
  export let dense = false;
  export let required = false;
  export let optional = false;
  export let error = '';

  const dispatch = createEventDispatcher();

  /** Sobre una docena, la lista deja de ser algo que se recorre con la vista.
   *  Es el umbral que documenta la cabecera del propio Select. */
  const COMBOBOX_THRESHOLD = 12;

  $: nodes = divisions ?? [];

  // UNA RAÍZ SOLA NO ES UNA DECISIÓN. Un tenant sin árbol configurado no tiene
  // nada que elegir, y un desplegable de una sola opción es ruido en cada
  // formulario: sin al menos dos nodos, esto no se dibuja.
  $: visible = nodes.length > 1;

  $: pool = nodes.filter((n) => n && n.id != null && (includeInactive || n.active !== false));
  $: asCombobox = pool.length + (allLabel ? 1 : 0) > COMBOBOX_THRESHOLD;
  $: options = divisionOptions(nodes, { includeInactive, allLabel, indent: !asCombobox });

  $: current = String(value ?? '');

  // Un value que la lista no resuelve es una referencia colgada. Decirlo es lo
  // único que avisa que el registro apunta a una división que no se puede
  // mostrar; desaparecer en silencio la esconde.
  $: orphan = current !== '' && !options.some((o) => o.value === current);

  function pick(next) {
    value = next ?? '';
    dispatch('change', value);
  }
</script>

{#if visible}
  {#if asCombobox}
    <Combobox
      {label} {hint} {options} {disabled} {dense} {required} {optional} {error}
      value={current}
      noun="división"
      nounPlural="divisiones"
      placeholder="Buscar…"
      on:change={(e) => pick(e.detail?.value ?? '')}
    />
  {:else}
    <Select
      {label} {hint} {hintDot} {options} {disabled} {dense} {required} {optional} {error}
      value={current}
      placeholder={allLabel ? '' : placeholder}
      on:change={(e) => pick(e.currentTarget.value)}
    />
  {/if}
{:else if orphan}
  <p class="dp-orphan">División #{current} — el árbol no está disponible.</p>
{/if}

<style>
  .dp-orphan {
    margin: 0;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
</style>
