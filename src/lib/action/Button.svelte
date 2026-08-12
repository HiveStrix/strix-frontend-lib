<script>
  // BUTTON — the control that promises something will happen.
  //
  // WHY THE DEFAULT IS `outline` AND NOT `solid`
  //
  // A view has ONE primary. One. The solid button is the answer to "what does
  // this screen want me to do?", and a screen with three answers has none. Every
  // design system that ships `solid` as the default ends up with a wall of filled
  // buttons within a month, because the default is what people type. So here the
  // primary costs one word — `variant="solid"` — and the workhorse is free.
  //
  //   <Button variant="solid" on:click={save}>Guardar</Button>   ← one per view
  //   <Button on:click={print}>Imprimir</Button>                 ← the workhorse
  //   <Button variant="ghost" size="sm">Ver ficha</Button>       ← inside a row
  //   <Button variant="danger" on:click={wipe}>Eliminar</Button> ← the CONFIRM
  //
  // `danger` is the moment of irreversibility, not the door to it. The «Eliminar»
  // in a table row is a `ghost`; the «Eliminar» inside the dialog that asks if you
  // are sure is the `danger`. Red spread over every entry point is red nobody
  // reads by Thursday.
  //
  // THREE THINGS THIS COMPONENT REFUSES TO GET WRONG
  //
  // 1. BUSY DOES NOT CHANGE THE WIDTH. The label stays in the box and goes
  //    invisible; the spinner is drawn on top of it. A button that shrinks to
  //    «…» while saving drags the whole footer sideways, and on a tablet that is
  //    how you tap Cancelar by accident.
  //
  // 2. BUSY IS NEVER THE `disabled` ATTRIBUTE. The browser blurs a control the
  //    moment it becomes disabled, so a keyboard user who pressed Enter on
  //    «Guardar» is dropped on <body> and has to tab back from the top. Busy is
  //    `aria-disabled` — still focusable, still announced, simply not activatable.
  //    The click is stopped in here, which is why `on:click` is the component's
  //    own event and not a forwarded DOM one: it cannot fire when it must not.
  //
  // 3. DISABLED CAN CARRY ITS REASON. `disabled` alone uses the real attribute:
  //    unreachable, unexplained — only honest when the reason is already on
  //    screen. `disabled` WITH `reason` switches to `aria-disabled`, so the
  //    control stays focusable and the reason reaches both a hover and a screen
  //    reader as the button's description. It is a floor, not a solution: if the
  //    reason matters, write it as a visible sentence beside the button too.
  //
  // `href` renders a real <a>. A thing that navigates is a link — it belongs in
  // a new tab on middle click, and a button never will be.
  import { createEventDispatcher } from 'svelte';

  /** solid | outline | ghost | danger */
  export let variant = 'outline';
  /** sm | md | lg */
  export let size = 'md';
  /** button | submit | reset — ignored when `href` is set. */
  export let type = 'button';
  /** Present ⇒ renders an <a>. Navigation is a link, not a button. */
  export let href = '';
  export let disabled = false;
  /** Why it is disabled. Its presence keeps the control focusable. */
  export let reason = '';
  /** Working. Keeps the width, keeps the focus, refuses the click. */
  export let busy = false;
  /** The accessible name when there is no visible label. Required if icon-only. */
  export let label = '';
  /** Force icon-only even when a default slot exists. */
  export let iconOnly = false;
  /** Fully round. For a free-standing action in a toolbar or an empty state —
      never inside an attached group, where a pill cannot share an edge. */
  export let pill = false;
  /** Full width. A dialog footer on a phone, a form's one action. */
  export let block = false;
  /** Extra tooltip. `reason` wins over it, because a blocked control's first
      duty is to explain itself. */
  export let title = '';
  /** The DOM node, for a parent that must give focus back to it. */
  export let node = null;

  const dispatch = createEventDispatcher();

  // Icon-only is inferred rather than declared: passing an icon and no words IS
  // the request. The explicit prop exists for the case where the label is
  // deliberately hidden on a narrow viewport.
  $: onlyIcon = iconOnly || (!$$slots.default && !!$$slots.icon);

  // `off` = unavailable and dimmed. `locked` = cannot be activated, for any
  // reason. Busy is locked but never dimmed: it is working, not unavailable.
  $: off = disabled;
  $: locked = disabled || busy;
  // The native attribute only when there is nothing to explain — see (3) above.
  $: hard = disabled && !reason;
  $: tip = reason || title || (onlyIcon ? label : '');
  // An aria-label on a button that already shows its words is a second name
  // arguing with the first. Only the wordless button gets one.
  $: name = onlyIcon ? label : undefined;

  function onClick(e) {
    if (locked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    dispatch('click', e);
  }
</script>

{#if href}
  <a
    {...$$restProps}
    bind:this={node}
    class="sx-btn {variant} {size}"
    class:only={onlyIcon}
    class:pill
    class:block
    class:busy
    class:off
    class:locked
    href={locked ? undefined : href}
    role={locked ? 'link' : undefined}
    tabindex={locked ? 0 : undefined}
    aria-label={name}
    aria-disabled={locked ? 'true' : undefined}
    aria-busy={busy ? 'true' : undefined}
    title={tip || undefined}
    on:click={onClick}
    on:keydown
    on:focus
    on:blur
    on:pointerdown
  >
    <span class="face">
      {#if $$slots.icon}<span class="ic"><slot name="icon" /></span>{/if}
      {#if !onlyIcon}<span class="lb"><slot /></span>{/if}
    </span>
    {#if busy}<span class="sp" aria-hidden="true"></span>{/if}
  </a>
{:else}
  <button
    {...$$restProps}
    bind:this={node}
    class="sx-btn {variant} {size}"
    class:only={onlyIcon}
    class:pill
    class:block
    class:busy
    class:off
    class:locked
    {type}
    disabled={hard}
    aria-label={name}
    aria-disabled={locked && !hard ? 'true' : undefined}
    aria-busy={busy ? 'true' : undefined}
    title={tip || undefined}
    on:click={onClick}
    on:keydown
    on:focus
    on:blur
    on:pointerdown
  >
    <span class="face">
      {#if $$slots.icon}<span class="ic"><slot name="icon" /></span>{/if}
      {#if !onlyIcon}<span class="lb"><slot /></span>{/if}
    </span>
    {#if busy}<span class="sp" aria-hidden="true"></span>{/if}
  </button>
{/if}

<style>
  /* The family is declared here rather than inherited: inside a shadow root the
     document's `button { font: inherit }` reset does not exist, and one Arial
     control in a system-stack interface looks broken rather than plain. */
  .sx-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sx-s-2);
    font-family: var(--sx-font);
    font-weight: var(--sx-w-semi);
    line-height: 1.2;
    letter-spacing: -.005em;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    padding-block: var(--sx-s-1);
    /* Transparent, never absent: a border only on some variants makes a row of
       mixed buttons two heights and the baseline stops being a line. */
    border: 1px solid transparent;
    border-radius: var(--sx-r-2);
    transition:
      background-color var(--sx-fast) var(--sx-ease),
      border-color var(--sx-fast) var(--sx-ease),
      color var(--sx-fast) var(--sx-ease),
      box-shadow var(--sx-fast) var(--sx-ease),
      transform var(--sx-fast) var(--sx-ease);
  }

  .face { display: inline-flex; align-items: center; justify-content: center; gap: inherit; min-width: 0; }
  .lb { overflow: hidden; text-overflow: ellipsis; }
  .ic { display: inline-flex; flex: none; }
  /* A safety net for anyone forwarding a slot: a declared-but-empty icon slot
     still counts as filled, and a phantom 8px before the label is exactly the
     drift that makes a toolbar look hand-assembled. SplitButton avoids the case
     at the source; this catches the next component that does not. */
  .ic:empty { display: none; }
  /* The icon is sized off the label, so `size` moves both and nobody ships a
     24px glyph inside a 32px button. */
  .ic :global(svg) { display: block; width: 1.15em; height: 1.15em; }

  /* ── Sizes ──────────────────────────────────────────────────────────────
     Heights come off the spacing rhythm — 32 / 40 / 48 — so a button lines up
     with the fields and the rows beside it instead of being its own scale. */
  .sm { min-height: var(--sx-s-8);  padding-inline: var(--sx-s-3); font-size: var(--sx-t-xs); gap: var(--sx-s-1); border-radius: var(--sx-r-1); }
  .md { min-height: var(--sx-s-10); padding-inline: var(--sx-s-4); font-size: var(--sx-t-sm); }
  .lg { min-height: var(--sx-s-12); padding-inline: var(--sx-s-6); font-size: var(--sx-t-md); }

  /* Icon-only is square by construction: width equals height, so a row of them
     is a row and not a picket fence. */
  .only { padding-inline: 0; }
  .only.sm { width: var(--sx-s-8); }
  .only.md { width: var(--sx-s-10); }
  .only.lg { width: var(--sx-s-12); }

  .pill { border-radius: var(--sx-r-pill); }
  .block { width: 100%; }

  /* ── Variants ───────────────────────────────────────────────────────────── */
  .solid {
    background: var(--sx-accent);
    color: var(--sx-accent-ink);
    box-shadow: var(--btn-inset, var(--sx-e-inset)), var(--sx-e-1);
  }
  .outline {
    background: var(--sx-surface);
    color: var(--sx-ink);
    border-color: var(--sx-edge);
    box-shadow: var(--sx-e-1);
  }
  .ghost {
    background: transparent;
    color: var(--sx-ink-2);
  }
  /* `--sx-ink-on` flips with the tone: white on the light theme's deep red,
     near-black on the dark theme's pale one. The word beside the colour is the
     label itself, which is why this variant is never icon-only. */
  .danger {
    background: var(--sx-critical);
    color: var(--sx-ink-on);
    box-shadow: var(--btn-inset, var(--sx-e-inset)), var(--sx-e-1);
  }

  /* ── Hover ──────────────────────────────────────────────────────────────
     Behind `hover: hover` so a tap on a tablet does not leave a button stuck
     looking hovered until something else is touched. The filled variants lift,
     because a raised key is what they are pretending to be; the flat ones only
     change ground, because a lift inside a dense table row is jitter. */
  @media (hover: hover) {
    .solid:not(:disabled):not(.locked):hover,
    .danger:not(:disabled):not(.locked):hover {
      transform: translateY(-1px);
      box-shadow: var(--btn-inset, var(--sx-e-inset)), var(--sx-e-2);
    }
    /* --sx-sunk aquí es el mismo bug que en Table/Tabs/Menu: bajo el cursor
       un botón secundario se ilumina, no se hunde en gris. */
    .outline:not(:disabled):not(.locked):hover {
      background: var(--sx-accent-soft);
      box-shadow: var(--sx-e-2);
    }
    .ghost:not(:disabled):not(.locked):hover {
      background: var(--sx-accent-soft);
      color: var(--sx-ink);
    }
  }

  .sx-btn:not(:disabled):not(.locked):active { transform: none; }
  .solid:not(:disabled):not(.locked):active,
  .danger:not(:disabled):not(.locked):active { box-shadow: var(--btn-inset, var(--sx-e-inset)), var(--sx-e-1); }
  .outline:not(:disabled):not(.locked):active { box-shadow: var(--sx-e-1); }

  /* EN OSCURO, --sx-accent Y --sx-critical SON PÁLIDOS (texto casi negro
     encima) — no oscuros como en claro. --sx-e-inset ahí es 5 % de blanco
     sobre un color YA casi blanco: medido, 1.026–1.036 contra el piso de
     distinguibilidad de este repo (1.05), y visto en el catálogo (`Acciones`,
     tema oscuro, zoom) el borde superior es un relleno plano sin traza de
     reflejo — no un caso límite, un cero real. --sx-e-inset SIGUE SIN
     TOCARSE: Button en claro (5.55–5.91) y Toast en oscuro (1.16–1.17) lo
     usan y ahí sí trabaja — la misma lección de `Card crest` otra vez, un
     valor compartido no significa lo mismo en cada superficie donde se pega.
     `--btn-inset` es el token PROPIO de este componente, con el MISMO
     mecanismo (blanco arriba, en la sombra) y más opacidad — la única
     variable con margen para moverse cuando el fondo ya es pálido. .20
     mide 1.11 (acento) y 1.15 (crítico), el mismo orden que el filo de
     `crest` (1.12–1.18) y el reflejo oscuro de Toast (1.16–1.17) — ver el
     par nuevo en `scripts/contrast.mjs`. */
  :global([data-sx-theme='dark']) .sx-btn.solid,
  :global(.sx-dark) .sx-btn.solid,
  :global([data-sx-theme='dark']) .sx-btn.danger,
  :global(.sx-dark) .sx-btn.danger {
    --btn-inset: inset 0 1px 0 rgba(255, 255, 255, .2);
  }

  /* ── Focus ──────────────────────────────────────────────────────────────
     Declared here and not inherited: base.css is a document stylesheet and a
     Core renders in a shadow root, where it does not reach. The halo is the
     point — an ink ring alone disappears against a near-black solid fill, so a
     surface-coloured band is drawn between the button and the ring. */
  .sx-btn:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--sx-surface);
    z-index: 1;
  }

  /* ── Unavailable ───────────────────────────────────────────────────────── */
  .sx-btn:disabled,
  .sx-btn.off {
    opacity: .48;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  /* Working is not unavailable: it keeps its weight and only says it is thinking. */
  .sx-btn.busy { cursor: progress; }
  .busy .face { visibility: hidden; }

  .sp {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 1.15em;
    height: 1.15em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: var(--sx-r-pill);
    animation: sx-btn-spin 700ms linear infinite;
  }
  @keyframes sx-btn-spin { to { transform: rotate(360deg); } }

  /* Reduced motion stops the spin. What is left is a deliberate broken ring —
     the standing glyph for «waiting» — rather than an accident of a global
     `animation-duration: .01ms` freezing it mid-turn. The state is carried by
     `aria-busy` and by the app's own confirmation regardless. */
  @media (prefers-reduced-motion: reduce) {
    .sx-btn { transition: none; }
    .sx-btn:hover { transform: none; }
    .sp { animation: none; }
  }

  /* A tablet in landscape is 1024px and is still poked with a thumb, so this is
     keyed to the pointer and never to the width. `lg` is already 48px. */
  @media (pointer: coarse) {
    .sm { min-height: var(--sx-touch); padding-inline: var(--sx-s-4); font-size: var(--sx-t-sm); }
    .md { min-height: var(--sx-touch); }
    .only.sm, .only.md { width: var(--sx-touch); }
  }
</style>
