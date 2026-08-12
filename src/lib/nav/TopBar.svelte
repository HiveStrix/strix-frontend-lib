<script>
  // TOP BAR — the one thing on screen that never changes.
  //
  // THE HOLE THIS FILLS, AND WHY IT TOOK THIS LONG TO NAME
  //
  // `SideRail.svelte` has said since it was written that it is the SECOND
  // level of navigation and that the Hivestrix Shell owns the first — its own
  // chrome, built once, outside this library. That was a real plan: the Shell
  // would look like the Shell, and modules built with this system would look
  // like this system, and the seam between them would be the Shell's problem.
  // Then the ecosystem decided on ONE identity instead of two, and the
  // Shell's chrome was never rebuilt on this system to match — so the
  // application-level bar every Strix product actually needs stopped existing
  // anywhere a person could point at. `Sidebar.svelte`, beside this file,
  // fills the vertical half of that hole; this fills the horizontal one.
  //
  //   <TopBar product="Strix" tenant="Bodegas Opra">
  //     <SearchField slot="search" bind:value={q} placeholder="Buscar…" />
  //     <Menu slot="session" label="Cuenta" align="end" items={cuenta}>
  //       <Avatar />&nbsp;María
  //     </Menu>
  //   </TopBar>
  //
  // NOT PAGEHEADER — AND THE DIFFERENCE HAS TO BE SAID IN WORDS, NOT GUESSED
  // FROM THE NAME:
  //
  //   PageHeader is of the SCREEN. It changes every time the route changes —
  //   a new title, a new eyebrow, new actions — because it exists to answer
  //   «where am I, right now, on THIS page».
  //
  //   TopBar is of the APPLICATION. The product name does not change when
  //   Flota becomes Documentos. The tenant does not change. The session menu
  //   does not change. It answers a question that has exactly one true answer
  //   for the entire time somebody is signed in — «what am I inside of, and as
  //   whom» — and a component that answered that question differently on
  //   every screen would be lying about it changing when it has not.
  //
  // A screen legitimately has ONE `TopBar` and, most of the time, one
  // `PageHeader` under it. If a product finds itself passing a new `product`
  // or `tenant` on every route, that value belongs in a `PageHeader` instead —
  // it changed, so it was never TopBar's fact to hold.
  //
  // LAYOUT ONLY — THE SAME RESTRAINT PAGEHEADER ALREADY HOLDS. This does not
  // reimplement a search field or a session menu; it gives `SearchField` and
  // `Menu` — both already built, both already accessible — a place to stand.
  // «Reuse what exists» is not a shortcut taken here, it is the same boundary
  // PageHeader draws for its own `actions` slot: a bar that restyled its
  // slotted content would be reaching into another family.
  //
  // WHAT COLLAPSES, AND WHAT NEVER DOES. The row wraps before anything
  // truncates unreadably — the tenant name is the first thing this component
  // hides for itself, past the point a phone can hold three zones on one
  // line; the product's own name does not. What is inside `slot="search"` and
  // `slot="session"` collapses on ITS OWN terms — `SearchField` already goes
  // to a 16px input and drops its `/` hint under `(pointer: coarse)`, and a
  // `Menu` trigger can be handed `compact` by whoever fills the slot. TopBar
  // does not duplicate either component's own responsive behaviour; it only
  // promises not to squeeze the box that behaviour lives in.
  //
  // `sticky` IS OPT-IN, NOT THE DEFAULT — even though this bar conceptually
  // never changes, this file does not know whether it is rendered inside a
  // page that owns its own scroll container or inside a Core module in a
  // shadow root that must not assume it is welcome to fix itself to the
  // viewport. The product wires the position; this only draws the bar.

  /** The application's own name. Never changes with the route. */
  export let product = '';
  /** The signed-in tenant, if the product is multi-tenant. */
  export let tenant = '';
  /** Present ⇒ the identity block is a real <a>, to wherever «home» is. */
  export let href = '';
  /** Rides the top of the scroll. Off by default — see the note above. */
  export let sticky = false;

  $: hasSearch = !!$$slots.search;
  $: hasActions = !!$$slots.actions;
  $: hasSession = !!$$slots.session;
</script>

<header class="tb" class:sticky>
  <div class="brand">
    {#if $$slots.brand}
      <slot name="brand" />
    {:else if href}
      <a class="id" {href}>
        {#if product}<span class="product">{product}</span>{/if}
        {#if tenant}<span class="sep" aria-hidden="true">·</span><span class="tenant">{tenant}</span>{/if}
      </a>
    {:else}
      <div class="id">
        {#if product}<span class="product">{product}</span>{/if}
        {#if tenant}<span class="sep" aria-hidden="true">·</span><span class="tenant">{tenant}</span>{/if}
      </div>
    {/if}
  </div>

  {#if hasSearch}
    <div class="mid"><slot name="search" /></div>
  {/if}

  {#if hasActions || hasSession}
    <div class="end">
      {#if hasActions}<div class="acts"><slot name="actions" /></div>{/if}
      {#if hasSession}<div class="sess"><slot name="session" /></div>{/if}
    </div>
  {/if}
</header>

<style>
  .tb {
    /* A container query, not a media query — the same reasoning DataList
       already wrote down for the identical trap: this bar is usually
       rendering beside Sidebar's own column, or inside a Core module that
       does not span the viewport, so the WINDOW's width is never the number
       that should decide what collapses. It asks its own box. */
    container-type: inline-size;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-3) var(--sx-s-5);
    min-height: var(--sx-s-12);
    padding: var(--sx-s-2) var(--sx-s-4);
    /* FRAME, not content — the same line-based law Sidebar states for itself
       right beside this file, because a TopBar and a Sidebar are the same
       KIND of object (application chrome) and have to agree on how that
       object separates from the field under it. */
    background: var(--sx-surface);
    border-bottom: 1px solid var(--sx-line);
  }

  .sticky {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
  }

  .brand { display: flex; align-items: center; min-width: 0; flex: none; }

  .id {
    display: inline-flex;
    align-items: baseline;
    gap: var(--sx-s-2);
    min-width: 0;
    color: inherit;
    text-decoration: none;
    border-radius: var(--sx-r-1);
  }
  a.id:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
  }

  .product {
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.02em;
    color: var(--sx-ink);
    white-space: nowrap;
  }
  .sep { color: var(--sx-ink-3); }
  .tenant {
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 32ch;
  }

  /* The search zone is the one allowed to shrink to nothing before anything
     wraps — it is a road, not furniture, and `SearchField` itself already
     knows how to be narrow. `min-width: 0` is load-bearing: without it a flex
     child never shrinks past its content's own natural width and this zone
     would be what pushes `.end` off the row instead of yielding to it. */
  .mid { flex: 1 1 22ch; min-width: 0; max-width: 56ch; }

  .end {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    flex: none;
    margin-inline-start: auto;
  }
  .acts { display: flex; align-items: center; gap: var(--sx-s-1); }
  .sess { display: flex; align-items: center; min-width: 0; }

  /* Past this width three zones on one line means the tenant's own name is
     the thing getting clipped mid-word — dropped here, not truncated, since
     a silently truncated tenant name reads as a DIFFERENT tenant, which is
     worse than not showing one. Everything else keeps its place; the row
     itself already wraps before that, for anything narrower still. */
  @container (max-width: 560px) {
    .tenant, .sep { display: none; }
  }
</style>
