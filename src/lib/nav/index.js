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
// Nothing here imports another family. FilterChips imports Pill, because a
// filter over semantic states has to speak the same tone + mark + word the rest
// of the system speaks, and Pill is where that vocabulary lives.
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
