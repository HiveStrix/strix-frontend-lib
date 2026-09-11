// Las opciones de un árbol de divisiones, como las espera Select/Combobox.
//
// Sale del método `options()` que vivía en el store de strix-expenses. Se
// exporta aparte del componente para que una pantalla que arme su propia lista
// obtenga EXACTAMENTE las mismas etiquetas — que es de lo que se trata que
// haya un solo picker.

/**
 * La profundidad sale del `path` («general/centroamerica/cr»), que ya viene
 * calculado del core dueño del árbol. Recorrer `parent_id` acá sería
 * reimplementar lo que el path resuelve.
 */
function depthOf(node) {
  return String(node.path ?? '').split('/').length - 1;
}

/**
 * @param nodes  [{ id, name, path, active }]
 * @param includeInactive  Los inactivos quedan FUERA al escribir (no aceptan
 *   registros nuevos) y DENTRO al filtrar: una sucursal cerrada sigue teniendo
 *   historia que mirar.
 * @param allLabel  El texto de la opción que no filtra nada. Si se pasa, va
 *   primero con value `''`.
 * @param indent  Sangra la etiqueta por profundidad, que es como se lee un
 *   árbol en una lista plana. Se apaga para el Combobox: su resaltado de
 *   coincidencia calcula el índice sobre la etiqueta plegada —que viene
 *   recortada— y lo aplica sobre la original, así que los espacios de sangría
 *   le corren el resaltado dos caracteres por nivel.
 */
export function divisionOptions(nodes, { includeInactive = false, allLabel = '', indent = true } = {}) {
  const opts = (nodes ?? [])
    .filter((n) => n && n.id != null)
    .filter((n) => includeInactive || n.active !== false)
    .slice()
    .sort((a, b) => String(a.path ?? '').localeCompare(String(b.path ?? '')))
    .map((n) => ({
      value: String(n.id),
      label:
        (indent ? '  '.repeat(depthOf(n)) : '') +
        String(n.name ?? n.path ?? '') +
        (n.active === false ? ' (inactiva)' : ''),
      // El path completo viaja como pista: el Combobox lo busca además del
      // label, así que «centroamerica» encuentra a su sucursal.
      hint: String(n.path ?? '')
    }));

  return allLabel ? [{ value: '', label: allLabel, hint: '' }, ...opts] : opts;
}
