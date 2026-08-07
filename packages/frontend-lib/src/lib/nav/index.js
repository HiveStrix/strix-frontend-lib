// STRUCTURE — the components that answer «¿dónde estoy?», «¿qué estoy mirando?»
// and «¿cómo llego a lo otro?».
//
// The family is deliberately small and the boundaries between its members are
// the interesting part, so they are written down where somebody choosing will
// see them:
//
//   PageHeader       where you are + what is true now + what you can do.
//   Breadcrumb       real nesting, three levels or more. Otherwise a back link.
//   Tabs             changes WHAT you look at. Owns a panel. Deep-linkable.
//   Segmented        changes HOW the same thing is drawn. No panel, no aria-controls.
//   FilterChips      narrows a set in place. Counts over the WHOLE set, always.
//   SearchField      the `/` key, Escape, and a result count that is announced.
//   Pagination       where you are in a set that does not fit. The sentence first.
//   SideRail         a module's own sections, beside the Shell's sidebar.
//   ShortcutOverlay  `?`. Lists shortcuts; binds only its own.
//
// Nothing here imports another family. FilterChips imports Pill, because a
// filter over semantic states has to speak the same tone + mark + word the rest
// of the system speaks, and Pill is where that vocabulary lives.
export { default as PageHeader } from './PageHeader.svelte';
export { default as Breadcrumb } from './Breadcrumb.svelte';
export { default as Tabs } from './Tabs.svelte';
export { default as Segmented } from './Segmented.svelte';
export { default as FilterChips } from './FilterChips.svelte';
export { default as SearchField } from './SearchField.svelte';
export { default as Pagination } from './Pagination.svelte';
export { default as SideRail } from './SideRail.svelte';
export { default as ShortcutOverlay } from './ShortcutOverlay.svelte';
