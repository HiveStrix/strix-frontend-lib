<script context="module">
  let seq = 0;
</script>

<script>
  // CHOICECARDS — a radiogroup for a choice that has to be argued, not listed.
  //
  // THE QUESTION THIS EXISTS FOR is «¿cómo se le da seguimiento?»: a familia
  // declares how its counter accrues — a mano, mientras está alquilada, por
  // ciclo declarado, por dispositivo — and the four answers are not four words,
  // they are four consequences. Somebody choosing between them is choosing what
  // the machine's maintenance clock will BE for the next nine years. A `<select>`
  // hides three of the four behind a click and asks them to decide from memory.
  //
  // It is still a radiogroup, and it behaves like one:
  //   • ONE TAB STOP for the whole group, arrows move between the cards, and
  //     moving selects — the roving-tabindex pattern, so a keyboard user does
  //     not tab through eleven cards to reach the button underneath.
  //   • Home / End jump to the ends. Space and Enter select the focused card.
  //   • Nothing chosen yet ⇒ the FIRST enabled card holds the tab stop, so the
  //     group is always reachable, and arriving on it selects nothing.
  //
  // THE SELECTED CARD IS NOT «THE COLOURED ONE». It carries a filled tick in the
  // corner and its title goes to full ink; the accent ring is the third signal.
  //
  //   <ChoiceCards label="¿Cómo se le da seguimiento?" bind:value={mode}
  //     hint="Decide de dónde sale el reloj de mantenimiento de esta familia."
  //     options={[
  //       { value: 'manual', title: 'Lectura a mano',    detail: 'Alguien anota el horómetro cuando pasa por la máquina.' },
  //       { value: 'rent',   title: 'Mientras está afuera', detail: 'La salida y la devolución son el uso. No hay que leer nada.', badge: 'Recomendado' },
  //       { value: 'duty',   title: 'Ciclo declarado',   detail: 'Se asume una jornada fija por día trabajado.' },
  //       { value: 'iot',    title: 'Dispositivo',       detail: 'Todavía no disponible.', disabled: true }
  //     ]} />
  //
  // WHEN NOT TO USE IT: for anything where the options are self-evident — «sí /
  // no», «kilómetros / horas». Cards cost a third of the screen; if the labels
  // alone answer the question, that third is spent on nothing and Radio is the
  // control. Over six options this stops being a comparison and becomes a wall:
  // that is Select or Combobox. And never for a multi-select — these are radios,
  // and a card that can be pressed twice is a checkbox.
  import { createEventDispatcher, tick } from 'svelte';
  import Field from './Field.svelte';

  export let value = '';
  /** [{ value, title, detail?, badge?, disabled? }] */
  export let options = [];
  /** 0 ⇒ as many as fit, minimum 15rem-ish each. Otherwise a fixed count. */
  export let columns = 0;

  export let label = '';
  export let hint = '';
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: gid = id || `sxcc${n}`;

  let root;

  $: items = (options ?? []).map((o) =>
    o !== null && typeof o === 'object' ? o : { value: o, title: String(o) }
  );

  $: selectedIndex = items.findIndex((o) => o.value === value);
  $: firstEnabled = items.findIndex((o) => !o.disabled);
  // The single tab stop. The selected card owns it; with nothing selected the
  // first card that can be chosen does, so the group is never skipped.
  $: stop = selectedIndex >= 0 ? selectedIndex : firstEnabled;

  function pick(o) {
    if (disabled || o.disabled) return;
    value = o.value;
    dispatch('change', o);
  }

  /**
   * `dir` is the direction the person was already travelling, and it is not
   * cosmetic: a card that cannot be chosen is not a place for focus to stop, so
   * the walk steps over it — and it has to step over it the way they were
   * going. End landing on a disabled last card and then walking FORWARD wraps
   * round to the first one, which is the opposite of what End means.
   */
  async function moveTo(i, dir) {
    const len = items.length;
    if (!len) return;
    let j = ((i % len) + len) % len;
    for (let k = 0; k < len; k++) {
      if (!items[j].disabled) break;
      j = (j + dir + len) % len;
    }
    if (items[j].disabled) return;
    pick(items[j]);
    await tick();
    root?.querySelector(`#${gid}-c${j}`)?.focus();
  }

  function onKey(e, i) {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault(); moveTo(i + 1, 1); break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault(); moveTo(i - 1, -1); break;
      case 'Home':
        e.preventDefault(); moveTo(0, 1); break;
      case 'End':
        e.preventDefault(); moveTo(items.length - 1, -1); break;
    }
  }
</script>

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled}
  id={gid} frame={false} group
  {origin} {originValue} {changed}
  on:revert
  let:labelId
  let:describedBy
  let:invalid
>
  <div
    class="cards"
    bind:this={root}
    role="radiogroup"
    aria-labelledby={label ? labelId : undefined}
    aria-describedby={describedBy}
    aria-invalid={invalid || undefined}
    aria-required={required || undefined}
    style:--cols={columns ? String(columns) : null}
    class:fixed={!!columns}
  >
    {#each items as o, i (o.value)}
      <button
        type="button"
        id={`${gid}-c${i}`}
        class="card"
        class:on={o.value === value}
        role="radio"
        aria-checked={o.value === value}
        disabled={disabled || o.disabled}
        tabindex={i === stop ? 0 : -1}
        on:click={() => pick(o)}
        on:keydown={(e) => onKey(e, i)}
      >
        <span class="top">
          <span class="ttl">{o.title}</span>
          {#if o.badge}<span class="badge">{o.badge}</span>{/if}
          <span class="tick" aria-hidden="true">
            <svg viewBox="0 0 12 12"><path d="M1.5 6.3 4.6 9.4 10.5 2.9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
        </span>
        {#if o.detail}<span class="detail">{o.detail}</span>{/if}
        <slot name="extra" option={o} />
      </button>
    {/each}
  </div>

  <slot name="action" slot="action" />
</Field>

<style>
  .cards {
    display: grid; gap: var(--sx-s-3);
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }
  .cards.fixed { grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); }

  .card {
    display: flex; flex-direction: column; align-items: flex-start; gap: var(--sx-s-2);
    padding: var(--sx-s-4);
    text-align: left; cursor: pointer;
    background: var(--sx-surface);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    font: inherit; color: var(--sx-ink-2);
    transition: box-shadow var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease),
                transform var(--sx-fast) var(--sx-ease);
  }
  .card:hover:not(:disabled) { box-shadow: var(--sx-e-2); transform: translateY(-1px); border-color: var(--sx-ink-3); }
  .card:active:not(:disabled) { transform: none; }

  /* Three signals for one state: the ring, the ink, and the tick. Take any one
     away and it still reads. */
  .card.on {
    border-color: var(--sx-accent);
    box-shadow: var(--sx-e-2), 0 0 0 1px var(--sx-accent);
    color: var(--sx-ink);
  }
  /* Mismo arreglo que Field.svelte/Radio.svelte: --sx-line contra --sx-sunk
     mide 1.11:1 en oscuro — --sx-edge es el token de este sistema ya medido
     a 3:1 para el límite de un control. Ver Radio.svelte para los números
     completos. */
  .card:disabled { cursor: not-allowed; background: var(--sx-sunk); box-shadow: none; border-color: var(--sx-edge); color: var(--sx-ink-3); }

  .top { display: flex; align-items: center; gap: var(--sx-s-2); width: 100%; }
  .ttl {
    flex: 1 1 auto; min-width: 0;
    font-size: var(--sx-t-md); font-weight: var(--sx-w-semi);
    letter-spacing: -.01em; color: var(--sx-ink); line-height: 1.3;
  }
  .card:disabled .ttl { color: var(--sx-ink-3); }

  .badge {
    flex: none; padding: 2px var(--sx-s-2); border-radius: var(--sx-r-pill);
    background: var(--sx-neutral-band); color: var(--sx-neutral);
    border: 1px solid var(--sx-neutral-edge);
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .04em; white-space: nowrap;
  }
  .card.on .badge { background: var(--sx-accent-soft); border-color: var(--sx-accent-edge); color: var(--sx-ink); }

  .tick {
    display: grid; place-items: center; flex: none;
    width: 19px; height: 19px; border-radius: var(--sx-r-pill);
    border: 1px solid var(--sx-edge); background: var(--sx-surface);
    color: transparent;
    transition: background var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease),
                color var(--sx-fast) var(--sx-ease);
  }
  .tick svg { width: 12px; height: 12px; }
  .card.on .tick { background: var(--sx-accent); border-color: var(--sx-accent); color: var(--sx-accent-ink); }

  .detail { font-size: var(--sx-t-sm); line-height: 1.5; color: var(--sx-ink-3); }
  .card.on .detail { color: var(--sx-ink-2); }

  @media (pointer: coarse) {
    .card { min-height: calc(var(--sx-touch) * 2); padding: var(--sx-s-5); }
    .tick { width: 24px; height: 24px; }
  }

  /* Inside the Shell the content column starts 240px in, so one card per row
     arrives long before the window looks narrow. */
  @media (max-width: 520px) {
    .cards, .cards.fixed { grid-template-columns: 1fr; }
  }
</style>
