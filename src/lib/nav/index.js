// STRUCTURE — the components that answer «¿dónde estoy?», «¿qué estoy mirando?»
// and «¿cómo llego a lo otro?».
//
// The family is deliberately small and the boundaries between its members are
// the interesting part, so they are written down where somebody choosing will
// see them:
//
//   TopBar           the application's own bar — identity, tenant, search,
//                    session. Never changes with the route; see its header.
//   Sidebar          the FIRST level of navigation: which module am I in.
//   PageHeader       where you are + what is true now + what you can do.
//   Breadcrumb       real nesting, three levels or more. Otherwise a back link.
//   Tabs             changes WHAT you look at. Owns a panel. Deep-linkable.
//   Segmented        changes HOW the same thing is drawn. No panel, no aria-controls.
//   FilterChips      narrows a set in place. Counts over the WHOLE set, always.
//   SearchField      the `/` key, Escape, and a result count that is announced.
//   Pagination       where you are in a set that does not fit. The sentence first.
//   SideRail         the SECOND level: a module's own sections, beside Sidebar.
//   ShortcutOverlay  `?`. Lists shortcuts; binds only its own.
//
// `TopBar` and `Sidebar` are the newest two, and the reason they exist is
// worth stating here rather than only in their own files: `SideRail` used to
// say it was the second level and that «the Hivestrix Shell already owns the
// first one, its own sidebar» — a real division of labour once, from when the
// Shell was going to carry its own chrome outside this system. The ecosystem
// later chose ONE identity instead of two, the Shell's chrome was never
// rebuilt to match, and the first level of navigation stopped existing
// anywhere a person could point at. These two components are that level,
// filled in rather than left as a claim in someone else's header.
//
// Nothing here imported another family, until the phone drawer. FilterChips
// imports Pill, because a filter over semantic states has to speak the same
// tone + mark + word the rest of the system speaks, and Pill is where that
// vocabulary lives — that exception is old and stays. Two new ones joined it:
// `Sidebar` imports `shell/Sheet.svelte` because a phone-width Sidebar IS a
// Sheet (see that file's header for why building a second drawer here would
// have been the wrong fix), and both `Sidebar` and `TopBar` import
// `shell/Glyph.svelte` — the first for `GLYPH_VIEWBOX`, so its own inline
// icons stop guessing a grid; the second for the drawer's trigger, drawn the
// same way `Sheet`'s own close button is (a bare `<button>` plus `Glyph`,
// not the full `Button`/`IconButton` machinery from `action`). Three imports
// from `shell`, none from `action` or `form` — a boundary that moved once,
// on purpose, not one that quietly stopped existing.
export { default as TopBar } from './TopBar.svelte';
export { default as Sidebar } from './Sidebar.svelte';
export { default as PageHeader } from './PageHeader.svelte';
export { default as Breadcrumb } from './Breadcrumb.svelte';
export { default as Tabs } from './Tabs.svelte';
export { default as Segmented } from './Segmented.svelte';
export { default as FilterChips } from './FilterChips.svelte';
export { default as SearchField } from './SearchField.svelte';
export { default as Pagination } from './Pagination.svelte';
export { default as SideRail } from './SideRail.svelte';
export { default as ShortcutOverlay } from './ShortcutOverlay.svelte';
