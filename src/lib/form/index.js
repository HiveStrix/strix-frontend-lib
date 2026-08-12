// The INPUT family: everything a person answers with.
//
// One import point, so a component can move, be renamed or be rewritten without
// touching every app in the ecosystem. Import from here — never from a file path
// inside this folder.
//
//   import { Field, Input, NumberInput, ChoiceCards } from '@strix/frontend-lib/form';
//
// HOW THEY FIT TOGETHER: Field is the wrapper. It mints the id, draws the box,
// wires label/hint/error/aria, and renders the provenance line. Every control
// below except Checkbox, Radio and Switch is that Field plus one element — which
// is why an Input, a Select and a DateInput in the same column line up without
// anybody arranging them, and why fixing the focus ring is one edit.
//
// Checkbox, Radio and Switch carry their own label beside them, so they are NOT
// wrapped in a Field. Group them with `<Field group>` and give the container
// `role="group"` (or `radiogroup`) plus `aria-labelledby={labelId}`.
export { default as Field } from './Field.svelte';
export { default as Input } from './Input.svelte';
export { default as NumberInput } from './NumberInput.svelte';
export { default as Textarea } from './Textarea.svelte';
export { default as Select } from './Select.svelte';
export { default as Combobox } from './Combobox.svelte';
export { default as Checkbox } from './Checkbox.svelte';
export { default as Radio } from './Radio.svelte';
export { default as Switch } from './Switch.svelte';
// `today()` travels with DateInput because the obvious way to write it —
// `new Date().toISOString().slice(0, 10)` — is the UTC day, and every hour
// after 6pm in Costa Rica that is tomorrow. `parseLocalDate` is the other half
// of that fix — the read, not the write — and Calendar and DateRange both
// import it rather than re-solving the same timezone bug.
export { default as DateInput, today, parseLocalDate } from './DateInput.svelte';
export { default as FileDrop } from './FileDrop.svelte';
export { default as ChoiceCards } from './ChoiceCards.svelte';
// A month grid, keyboard-navigable on its own (see the file for the ARIA grid
// pattern this follows), and the two-date span built on top of it plus DateInput.
export { default as Calendar } from './Calendar.svelte';
export { default as DateRange } from './DateRange.svelte';
