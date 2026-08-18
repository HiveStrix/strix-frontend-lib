// DATA — the surfaces that show many records at once.
//
// Three components and a primitive, and the reason they live together is that
// they share the part everybody gets wrong: what a list says when it has no
// rows. `DataState` is the shared answer, so «no encontré nada» reads the same
// in maintenance, in billing and in inventory.
//
//   Table      comparison. Columns, a pinned head, sorting, selection, a row
//              that is a link, and a card fallback when comparison stops being
//              possible.
//   DataList   records that are not peers: a name, a few facts, one figure.
//   DataState  empty · filtered-to-nothing · error. Three different pieces of
//              news that must never be written as one sentence.
//   DataSkeleton  a placeholder with the shape of the answer.
//   Schedule   los registros que tienen FECHA, leídos en el tiempo: un mes con
//              sus eventos, o la agenda de lo que viene. No es el `Calendar`
//              de `form` — ese elige una fecha; éste muestra lo que cae en ellas.
export { default as Table } from './Table.svelte';
export { default as DataList } from './DataList.svelte';
export { default as DataState } from './DataState.svelte';
export { default as DataSkeleton } from './DataSkeleton.svelte';
export { default as Schedule } from './Schedule.svelte';
