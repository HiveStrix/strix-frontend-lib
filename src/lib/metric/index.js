// METRIC — the figures, and what makes a figure readable.
//
// This directory had no index.js, which meant that of the seven families it
// was the only one a consumer could not import: `@strix/frontend-lib/metric`
// resolved to nothing and its five components were reachable only by file path,
// which is precisely what every other family's header forbids. That is what «a
// library rather than seven directories» means in practice — the seam was one
// missing file, and nobody noticed because nothing rendered them.
//
// The family answers one question in four shapes:
//
//   Stat        one figure, with what it counts, what it is measured in, and
//               what it is being compared against. Never a bare number.
//   StatStrip   several figures about the SAME subject, as one instrument with
//               one shadow — not five cards competing for the same eye.
//   Bar         a length that states what it is a length of. `max` is not
//               optional and the bound is printed, every time.
//   StackedBar  parts of one whole, with the parts named. The legend is half
//               the component and cannot be switched off.
//   Sparkline   the shape of a series at the size of a word. No axis, so no
//               value can be read off it — that is deliberate.
//
// TWO RULES THIS FAMILY HOLDS UP FOR THE WHOLE SYSTEM:
//
//   NOTHING IS NOT ZERO. A nullish value renders an em dash and a sentence
//   saying what would fill it, never «0». «0 servicios» is a claim about the
//   business; «— · sin lecturas todavía» is a claim about the record.
//
//   AN ESTIMATE IS NOT A MEASUREMENT, and it carries the same two marks
//   everywhere: a broken register (a dashed rule under a figure, a hatched
//   fill, a dashed trace) and the word «estimado». A shape and a word — never
//   a colour on its own.
export { default as Stat } from './Stat.svelte';
export { default as StatStrip } from './StatStrip.svelte';
export { default as Bar } from './Bar.svelte';
export { default as StackedBar } from './StackedBar.svelte';
export { default as Sparkline } from './Sparkline.svelte';

// The formatter travels with the family because every component in it prints
// numbers and a strip where one figure says «4 820 000» and the next says
// «4,820,000» has stopped being one instrument.
export { fmtNum, fmtShare, isBlank, numOf } from './format.js';
