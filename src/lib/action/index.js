// ACTIONS — everything in a Strix surface that makes something happen.
//
// The family is deliberately small, and the reason it is small is the rule it
// exists to hold up:
//
//     ONE PRIMARY PER VIEW.
//
// A screen has a single solid button because a screen has a single answer to
// "what am I here to do?". Everything else is an `outline` (the workhorse) or a
// `ghost` (inline, in a row, in a toolbar). That is why `Button`'s default
// variant is `outline` and not `solid`: the primary has to be asked for.
//
// A screen with two honestly equal actions does NOT get two primaries — two
// filled buttons race and the eye picks neither. It gets two outlines of the
// same size with labels that carry the whole difference, and one sentence above
// them that says what the choice is. Acciones.svelte shows the real case this
// came from.
export { default as Button } from './Button.svelte';
export { default as ButtonGroup } from './ButtonGroup.svelte';
export { default as IconButton } from './IconButton.svelte';
export { default as Menu } from './Menu.svelte';
export { default as SplitButton } from './SplitButton.svelte';
