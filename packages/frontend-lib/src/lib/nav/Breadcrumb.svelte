<script>
  // BREADCRUMB — the answer to «¿dónde estoy y cómo salgo?».
  //
  // WHEN IT IS THE RIGHT CONTROL
  //
  // Only when the depth is REAL: Flota → BAT014 → Plan semestral → OT-0042 is
  // four nested objects, each of which exists on its own and each of which
  // somebody legitimately wants to go back to. On a screen two levels deep with
  // a «Volver» button that always goes to the same place, a breadcrumb is
  // ceremony — use the button.
  //
  // Two levels is the floor. One crumb plus the current page is a back link
  // wearing a costume.
  //
  //   const ruta = [
  //     { label: 'Flota', href: '/flota' },
  //     { label: 'BAT014', href: '/flota/bat014', id: true },
  //     { label: 'Plan semestral', href: '/flota/bat014/planes/7' },
  //     { label: 'OT-0042', id: true }          ← el último es dónde estás
  //   ];
  //   <Breadcrumb items={ruta} on:navigate={(e) => go(e.detail.item)} />
  //
  // THE LAST CRUMB IS NOT A LINK. It is where you already are, it carries
  // `aria-current="page"`, and making it clickable teaches people that clicking
  // it does nothing — which is how a trail stops being trusted.
  //
  // HOW IT SURVIVES 390px
  //
  // It does not scroll and it does not wrap into a paragraph. Past `maxVisible`
  // it collapses the middle behind a button that expands it in place: the first
  // crumb (the module, always useful) and the last two (the parent and you) are
  // what a person actually reaches for. The collapsed button says how many are
  // hidden, because «…» alone is not a number.
  //
  // ROUTING IS NOT ITS JOB. Give an `href` and it renders a real <a> the browser
  // and the middle-click both understand. Omit it and it renders a <button> and
  // dispatches `navigate` — for a Core module whose routing lives in the Shell.
  // Do not give both and expect the event: a link that also preventDefaults is
  // how «abrir en pestaña nueva» quietly breaks.
  import { createEventDispatcher } from 'svelte';

  /** [{ label, href?, id?, title? }] — the last entry is the current page. */
  export let items = [];
  /** aria-label for the nav landmark. Two breadcrumbs on one page need two names. */
  export let label = 'Ruta';
  /** Above this, the middle collapses. 4 fits 390px with a code in it. */
  export let maxVisible = 4;

  const dispatch = createEventDispatcher();

  let expanded = false;

  // Collapse only pays when it hides more than the button it costs.
  $: collapsible = !expanded && items.length > maxVisible && items.length > 3;
  $: hidden = collapsible ? items.length - 3 : 0;
  // First, then the crumb before you, then you.
  $: shown = collapsible ? [items[0], items[items.length - 2], items[items.length - 1]] : items;
  // Written as a statement, not a `const`, so `collapsible` is in its dependency
  // list — the ellipsis used to survive the expansion and point at nothing.
  $: gapAfter = (i) => collapsible && i === 0;

  $: if (items.length <= maxVisible) expanded = false;

  function go(item, e) {
    if (item.href) return; // the browser is already doing it
    e.preventDefault();
    dispatch('navigate', { item });
  }
</script>

<nav class="bc" aria-label={label}>
  <ol>
    {#each shown as item, i (`${i}:${item.href ?? item.label}`)}
      {@const last = i === shown.length - 1}
      <li>
        {#if last}
          <span class="crumb here" class:sx-id={item.id} aria-current="page" title={item.title ?? item.label}>{item.label}</span>
        {:else if item.href}
          <a class="crumb" class:sx-id={item.id} href={item.href} title={item.title ?? item.label}
            on:click={(e) => go(item, e)}>{item.label}</a>
        {:else}
          <button class="crumb" class:sx-id={item.id} type="button" title={item.title ?? item.label}
            on:click={(e) => go(item, e)}>{item.label}</button>
        {/if}
      </li>

      {#if !last}
        <li class="sep" aria-hidden="true">
          <svg viewBox="0 0 12 12" focusable="false"><path d="M4.2 2.4 7.8 6l-3.6 3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </li>
      {/if}

      {#if gapAfter(i)}
        <li>
          <!-- Says the number, not «…». «3 niveles más» is a promise somebody
               can decide about before spending a click on it. -->
          <button class="more" type="button" on:click={() => (expanded = true)}>
            <span aria-hidden="true">···</span>
            <span class="sr">Mostrar {hidden} niveles intermedios</span>
          </button>
        </li>
        <li class="sep" aria-hidden="true">
          <svg viewBox="0 0 12 12" focusable="false"><path d="M4.2 2.4 7.8 6l-3.6 3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </li>
      {/if}
    {/each}
  </ol>
</nav>

<style>
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .bc { min-width: 0; }

  ol {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-1);
    list-style: none;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  li { display: flex; align-items: center; min-width: 0; }

  .crumb {
    display: inline-block;
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-3);
    text-decoration: none;
    background: none;
    border: 0;
    padding: var(--sx-s-1) var(--sx-s-2);
    margin-inline: calc(var(--sx-s-2) * -1);
    border-radius: var(--sx-r-1);
    cursor: pointer;
    transition: color var(--sx-fast) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }

  a.crumb:hover, button.crumb:hover { color: var(--sx-ink); background: var(--sx-sunk); }

  /* Where you are: the only crumb in full ink, and not a control. */
  .here {
    color: var(--sx-ink);
    font-weight: var(--sx-w-semi);
    cursor: default;
    max-width: 28ch;
  }

  .sep { color: var(--sx-ink-3); opacity: .7; flex: none; }
  .sep svg { width: 12px; height: 12px; }

  .more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--sx-s-6);
    height: var(--sx-s-6);
    padding: 0 var(--sx-s-2);
    border: 0;
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    color: var(--sx-ink-3);
    font-size: var(--sx-t-sm);
    line-height: 1;
    cursor: pointer;
    transition: color var(--sx-fast) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }
  .more:hover { background: var(--sx-neutral-band); color: var(--sx-ink); }

  /* Declared here rather than inherited: base.css does not cross a shadow
     boundary, and this component has to be focusable-and-visible inside a Core.
     `--sx-ink` already re-binds in dark, so the ring needs no second rule. */
  .crumb:focus-visible, .more:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
    border-radius: var(--sx-r-1);
  }

  /* A trail is read, not poked — but it is poked sometimes, and a 20px target
     between two other 20px targets is a coin toss. */
  @media (pointer: coarse) {
    .crumb, .more { min-height: var(--sx-touch); display: inline-flex; align-items: center; }
    .crumb { max-width: 16ch; }
  }

  @media (max-width: 420px) {
    .crumb { max-width: 14ch; }
    .here { max-width: 18ch; }
  }
</style>
