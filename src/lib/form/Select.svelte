<script>
  // SELECT — a short, closed list.
  //
  // The native `<select>`, deliberately. Not because it is easy, because it is
  // BETTER for what it does: on the tablet a technician is holding, it opens the
  // platform's own wheel, which is one thumb-flick per option and never scrolls
  // the page out from under him. Every hand-rolled dropdown in this ecosystem
  // would have to reimplement typeahead, wrapping, the Escape contract and the
  // way a phone lays it out, and would end up worse.
  //
  // LO QUE SE VE EN macOS Y NO ES UN DEFECTO. En un Mac de escritorio el menú
  // nativo NO baja: se abre encima del campo, centrado en la opción elegida,
  // para que el puntero ya esté sobre ella. Se reportó como bug y no lo es —
  // es cómo el sistema operativo dibuja un <select>, y no se puede cambiar
  // desde CSS. Los desplegables que esta librería sí controla (Combobox, Menu,
  // DatePicker) bajan, y sólo suben cuando no entran abajo.
  //
  // Se deja así a sabiendas: en la tablet que sostiene un técnico —el caso que
  // manda acá— el nativo abre la rueda de la plataforma y le gana a cualquier
  // lista propia. Cambiarlo por una lista nuestra arreglaría el escritorio y
  // rompería el dispositivo donde de verdad se usa.
  //
  // So the only thing this adds is the chrome: the box comes from Field, the
  // native arrow is replaced by the system's own chevron, and the placeholder is
  // a disabled option rather than an empty one you can go back to by accident.
  //
  //   <Select label="Familia" bind:value={familyId} options={families}
  //           placeholder="Elegí una familia"
  //           hint="Decide qué actividades y qué plantillas le aplican." />
  //
  //   options = [{ value, label, disabled?, group? }]  ·  or plain strings
  //
  // WHEN NOT TO USE IT: over about a dozen options — a native select with 300
  // machines in it is a list nobody can find anything in, and that is Combobox.
  // Under about five options that a person has to WEIGH against each other, a
  // select hides the comparison behind a click: use Radio, or ChoiceCards if the
  // choice deserves a sentence each. And never for something that is really a
  // yes/no — that is a Checkbox or a Switch.
  import Field from './Field.svelte';

  export let value = '';
  /** [{ value, label, disabled?, group? }] or ['A', 'B'] */
  export let options = [];
  /** The unchosen state, as a word. Rendered disabled so it is a one-way door. */
  export let placeholder = '';

  export let label = '';
  export let hint = '';
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let name = undefined;
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  let el;
  export const focus = () => el?.focus();

  $: items = (options ?? []).map((o) =>
    o !== null && typeof o === 'object' ? o : { value: o, label: String(o) }
  );

  // Grouped only when somebody asked for groups: an optgroup with one child per
  // group is worse than no groups at all.
  $: grouped = items.some((o) => o.group);
  $: groups = (() => {
    if (!grouped) return [];
    const m = new Map();
    for (const o of items) {
      const g = o.group || '';
      if (!m.has(g)) m.set(g, []);
      m.get(g).push(o);
    }
    return [...m];
  })();

</script>

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled}
  {id} {origin} {originValue} {changed}
  on:revert
  let:id={fid}
  let:describedBy
  let:invalid
>
  <select
    bind:this={el}
    id={fid}
    {name}
    {disabled}
    bind:value
    class:empty={value === '' || value === null || value === undefined}
    required={required || undefined}
    aria-describedby={describedBy}
    aria-invalid={invalid || undefined}
    on:change
    on:focus
    on:blur
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#if grouped}
      {#each groups as [gname, list] (gname)}
        <optgroup label={gname || 'Otros'}>
          {#each list as o (o.value)}
            <option value={o.value} disabled={o.disabled}>{o.label}</option>
          {/each}
        </optgroup>
      {/each}
    {:else}
      {#each items as o (o.value)}
        <option value={o.value} disabled={o.disabled}>{o.label}</option>
      {/each}
    {/if}
  </select>

  <span class="chev" aria-hidden="true">
    <svg viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </span>

  <slot name="action" slot="action" />
</Field>

<style>
  select {
    appearance: none; -webkit-appearance: none;
    cursor: pointer; text-overflow: ellipsis;
  }
  select:disabled { cursor: not-allowed; }
  /* Nothing chosen yet reads like a placeholder, the same way an empty text box
     does. It is not an error and must not look like one. */
  select.empty { color: var(--sx-ink-3); }

  .chev {
    display: inline-flex; align-items: center; flex: none; align-self: center;
    color: var(--sx-ink-3); pointer-events: none;
  }
  .chev svg { width: 13px; height: 13px; }
</style>
