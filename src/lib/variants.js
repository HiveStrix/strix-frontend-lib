// VARIANTES POR NOMBRE O POR NÚMERO.
//
// Un componente con `variant` (o `headVariant`) acepta la variante por su
// NOMBRE descriptivo (`variant="solid"`) o por su NÚMERO (`variant="1"`) —son
// lo mismo—. El número es un alias, una comodidad para poder pedir «usá la
// variante N» al implementar sin tener que acordarse del nombre; el nombre
// sigue siendo el canónico, porque en el código `variant="solid"` dice qué es
// y `variant="1"` no.
//
// EL ORDEN DE LA LISTA ES LA NUMERACIÓN. `names[0]` es la 1, `names[1]` la 2, y
// así. Mantener el orden estable (agregar al final, no intercalar) y —cuando
// dos componentes comparten vocabulario, como la familia de botones— mantener
// el MISMO orden en los dos, así «la 1» es lo mismo en todos.

/**
 * Resuelve una variante dada por nombre o por número (1-based) a su nombre
 * canónico. Un valor inválido o viejo cae SEGURO a `fallback` —nunca a una
 * clase sin estilo—.
 *
 * @param {string|number} value  el nombre o el número que llegó por prop
 * @param {string[]} names       las variantes válidas, EN ORDEN (el orden es la numeración)
 * @param {string} [fallback]    a dónde caer si `value` no matchea (default: la 1)
 * @returns {string} el nombre canónico de la variante
 */
export function pickVariant(value, names, fallback = names[0]) {
  if (names.includes(value)) return value;      // ya es un nombre válido
  const n = Number(value);                       // '3' → 3, 3 → 3, 'solid' → NaN
  if (Number.isInteger(n) && n >= 1 && n <= names.length) return names[n - 1];
  return fallback;                               // typo, valor viejo, o vacío
}

// Vocabulario COMPARTIDO por la familia de botones (Button, IconButton, Menu,
// SplitButton). Vive acá, una sola vez, para que la numeración no se desincronice
// entre ellos: 1 solid · 2 outline · 3 ghost · 4 danger · 5 frosted.
// `frosted` se agregó AL FINAL (regla del módulo: agregar, no intercalar), así
// «la 1»…«la 4» siguen significando lo mismo en todo el ecosistema.
export const BUTTON_VARIANTS = ['solid', 'outline', 'ghost', 'danger', 'frosted'];
