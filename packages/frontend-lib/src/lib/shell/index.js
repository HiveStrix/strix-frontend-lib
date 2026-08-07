// LAYOUT PRIMITIVES — the quiet family.
//
// Nothing in here says anything. They put down the surface, the depth, the air
// and the order, and then get out of the way so that the components that DO say
// something — Pill, the controls, the tables — are the only things on screen
// with an opinion. Which is the whole point: a chrome you notice is a chrome
// that is competing with the data for the one minute somebody is looking.
//
// What they are between them:
//
//   Card      a surface, lifted with light                     — the object
//   Panel     a Card that says what it is                      — the object, named
//   Well      the recessed band                                — the aside
//   Stack     vertical gap, and nothing else                   — the air
//   Row       horizontal gap, wrapping by default              — the air, turned
//   Divider   the one rule the system allows                   — the sequence
//   Toolbar   what you are looking at / what you can do        — the bar
//   Sheet     a side drawer that hands focus back              — the second surface
//   Tooltip   the label for the control that lost its word     — the repair
//   Glyph     twenty-three icons drawn at 16 for this system   — the hand
//
// Imported from here rather than from a file path, so a component can move
// without breaking every app in the ecosystem.

export { default as Card } from './Card.svelte';
export { default as Panel } from './Panel.svelte';
export { default as Well } from './Well.svelte';
export { default as Stack } from './Stack.svelte';
export { default as Row } from './Row.svelte';
export { default as Divider } from './Divider.svelte';
export { default as Toolbar } from './Toolbar.svelte';
export { default as Sheet } from './Sheet.svelte';
export { default as Tooltip } from './Tooltip.svelte';
export { default as Glyph, GLYPHS, GLYPH_PATHS } from './Glyph.svelte';
