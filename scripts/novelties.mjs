// Deriva «lo último que entró a la librería» del propio repo — sin una lista
// escrita a mano. Ver «Deuda de catálogo» en el README.
//
// POR QUÉ UN ARCHIVO DE COMPONENTE Y NO UN MENSAJE DE COMMIT. La convención
// de este repo es `Componente: por qué`, y se podría leer el prefijo de cada
// commit. Se probó y se descartó: un commit como «Select: deja escrito que
// abrir encima del campo es del sistema» toca Select, pero Select no es
// nuevo — es una nota. La pregunta correcta no es «¿qué commit mencionó este
// nombre?» sino «¿cuándo nació este archivo?», y esa segunda pregunta ya
// tiene una respuesta exacta en git: el commit que agregó el archivo por
// primera vez. `--follow` la sigue a través de movimientos de carpeta —
// necesario acá, porque el commit «La lib sube a la raíz» reubicó los 58
// componentes de un monorepo sin tocar su contenido, y sin `--follow` los 58
// se leerían como nacidos ese día.
//
// POR QUÉ UNA VENTANA DE TIEMPO Y NO UN «TOP N» FIJO. Un top-6 fijo siempre
// muestra seis nombres, incluso cuando el sexto nació hace tres meses — eso
// es exactamente la lista que envejece y miente que este archivo existe para
// evitar. Una ventana de días se vacía sola cuando no entró nada nuevo, y la
// portada lo dice (ver App.svelte): nada nunca se disfraza de novedad.
//
// LO QUE ESTO NO VE. Un prop nuevo en un componente que ya existía —`tone`
// en Card, las tres variantes de Card y PageHeader— no crea un archivo, así
// que no tiene fecha de nacimiento propia y esta función no lo encuentra.
// Detectarlo con confianza pediría analizar el diff de cada commit contra
// cada prop, y ningún heurístico barato distingue «se agregó una prop» de
// «se corrigió una». Documentado en el reporte de esta tarea en vez de
// simulado con una lista a mano.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';

// La misma correspondencia carpeta → familia que App.svelte ya mantiene a
// mano en FAMILIES (`dir`, `id`): es estructura del repo, no un changelog —
// cambia tan seguido como cambia la forma de `src/lib`, que es casi nunca.
const FAMILY_BY_DIR = {
  shell: 'superficies',
  action: 'acciones',
  form: 'formularios',
  nav: 'estructura',
  data: 'tablas',
  feedback: 'retroalimentacion',
  metric: 'metricas'
};

const PAGE_FILE_BY_FAMILY = {
  superficies: 'Superficies.svelte',
  acciones: 'Acciones.svelte',
  formularios: 'Formularios.svelte',
  estructura: 'Estructura.svelte',
  tablas: 'Tablas.svelte',
  retroalimentacion: 'Retroalimentación.svelte',
  metricas: 'Métricas.svelte'
};

function listComponentFiles(root) {
  const libDir = join(root, 'src', 'lib');
  const out = [];
  for (const dir of Object.keys(FAMILY_BY_DIR)) {
    const famDir = join(libDir, dir);
    let entries = [];
    try { entries = readdirSync(famDir); } catch { continue; }
    for (const name of entries) {
      if (!name.endsWith('.svelte')) continue;
      out.push({ dir, file: join(famDir, name), component: basename(name, '.svelte') });
    }
  }
  return out;
}

// El commit que agregó el archivo, siguiéndolo a través de movimientos.
// `undefined` si git no está disponible o el archivo no tiene historia
// legible — nunca lanza, porque este script corre dentro de `vite build`.
function creationTimestamp(root, absPath) {
  try {
    const rel = relative(root, absPath);
    const out = execFileSync(
      'git',
      ['log', '--diff-filter=A', '--format=%ct', '-1', '--follow', '--', rel],
      { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    return out ? Number(out) : undefined;
  } catch {
    return undefined;
  }
}

// Extrae los pares [id, Nombre] del `const TOC = […]` / `const NAV = […]` de
// una página del catálogo. Soporta las dos formas que ya conviven en el
// repo: tuplas (`['id', 'Nombre']`, la mayoría de las páginas) y objetos
// (`{ id: 'id', label: 'Nombre' }`, Formularios). Nunca lanza: una página
// que cambie de forma sin que este parser se actualice simplemente no aporta
// mapeos, no rompe el build.
function parseToc(pageSource) {
  const map = new Map(); // nombre del componente (tal cual aparece) → id de sección
  const block = pageSource.match(/const\s+(?:TOC|NAV)\s*=\s*\[([\s\S]*?)\];/);
  if (!block) return map;
  const body = block[1];
  for (const m of body.matchAll(/\[\s*['"]([a-z0-9]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g)) {
    map.set(m[2], m[1]);
  }
  for (const m of body.matchAll(/\{\s*id:\s*['"]([a-z0-9]+)['"]\s*,\s*label:\s*['"]([^'"]+)['"]\s*\}/g)) {
    map.set(m[2], m[1]);
  }
  return map;
}

function loadTocMaps(root) {
  const maps = {};
  for (const [family, file] of Object.entries(PAGE_FILE_BY_FAMILY)) {
    try {
      const src = readFileSync(join(root, 'src', 'catalog', 'pages', file), 'utf-8');
      maps[family] = parseToc(src);
    } catch {
      maps[family] = new Map();
    }
  }
  return maps;
}

/**
 * @param {{ root?: string, windowDays?: number, max?: number, now?: number }} [opts]
 * @returns {{ name: string, href: string, ts: number }[]}
 */
export function buildNovelties(opts = {}) {
  const root = opts.root ?? process.cwd();
  // Cota de cordura, no el filtro principal — ver más abajo por qué.
  const windowDays = opts.windowDays ?? 60;
  const max = opts.max ?? 6;
  const now = opts.now ?? Date.now() / 1000;
  const cutoff = now - windowDays * 86400;

  let files;
  try {
    files = listComponentFiles(root);
  } catch {
    return [];
  }

  const withTs = files
    .map((f) => ({ ...f, ts: creationTimestamp(root, f.file) }))
    .filter((f) => typeof f.ts === 'number');

  // UN COMMIT QUE AGREGA MUCHOS ARCHIVOS A LA VEZ ES UNA FUNDACIÓN, NO UNA
  // NOVEDAD. «La lib sube a la raíz» reubicó los 58 componentes en un solo
  // commit, y con `--follow` los 58 heredan esa fecha como si hubieran
  // nacido ese día — que además puede caer DENTRO de cualquier ventana de
  // días corta si el repo entero es joven, como éste. Una ventana de
  // calendario no distingue «toda la librería llegó junta» de «esto se
  // agregó solo». El tamaño del commit sí: se cuentan cuántos archivos
  // comparten cada marca de tiempo, y cualquier marca que agrupe a más de un
  // puñado de archivos se descarta entera — es una fundación, no un
  // componente nuevo. Lo que sobrevive son commits que agregaron un
  // componente (o un par relacionado) por su cuenta.
  const freq = new Map();
  for (const f of withTs) freq.set(f.ts, (freq.get(f.ts) ?? 0) + 1);
  const bulkThreshold = Math.max(3, Math.ceil(withTs.length * 0.1));

  const dated = withTs
    .filter((f) => freq.get(f.ts) <= bulkThreshold && f.ts >= cutoff)
    .sort((a, b) => b.ts - a.ts);

  if (!dated.length) return [];

  const tocMaps = loadTocMaps(root);
  const out = [];
  for (const f of dated) {
    const family = FAMILY_BY_DIR[f.dir];
    const sectionId = family && tocMaps[family]?.get(f.component);
    // Sin una sección real que enlazar, no se muestra: un link que no lleva
    // a ninguna parte es peor que no anunciar el componente.
    if (!family || !sectionId) continue;
    out.push({ name: f.component, href: `#/${family}/${sectionId}`, ts: f.ts });
    if (out.length >= max) break;
  }
  return out;
}
