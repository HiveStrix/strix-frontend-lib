#!/usr/bin/env bash
#
# Sube el pin de @strix/frontend-lib en todos los consumidores del clúster,
# reconstruye el bundle del que lo commitea, y abre un PR por repo.
#
#   scripts/propagar.sh v0.13.0
#   scripts/propagar.sh v0.13.0 --only strix-expenses,strix-clients
#   scripts/propagar.sh v0.13.0 --dry-run
#
# POR QUÉ EXISTE. Cortar un tag acá no cambia ni un pixel: los nueve
# frontends instalan la librería por REFERENCIA DE GIT, así que hasta que
# alguien no sube el pin en cada repo, el tag es un nombre sin consumidores. Esa
# subida se venía haciendo a mano, repo por repo, y se nota: al 2026-09-30 había
# nueve PR `chore/lib-v0.11.0` abiertos desde el 25 de septiembre, todos ya en
# conflicto con su main, mientras la producción seguía clavada en un COMMIT DE
# RAMA (`design/variante-colorida#04644f2`) dos releases atrás. Un paso manual
# que hay que repetir nueve veces no se hace nueve veces: se hace una y media.
#
# LO QUE NO HACE, A PROPÓSITO: no mergea y no despliega. Abre el PR y para. El
# main de un core despliega a producción, y esa decisión es de una persona.
#
# TRES COSAS QUE SE APRENDIERON A LOS GOLPES Y ESTÁN CODIFICADAS ACÁ:
#
#   1. CLONA LIMPIO, FUERA DE ~/Documents. Con el repo en iCloud, `vite build`
#      no termina nunca — no falla, se cuelga— y `git` tira «Operation not
#      permitted» a mitad de sesión cuando TCC corta el acceso. El área de
#      trabajo va en /private/tmp, que además se barre sola.
#
#   2. VERIFICA LA VERSIÓN EN DISCO, no el lockfile. Con una dependencia de
#      git, el lock le gana a package.json: cambiar la referencia ahí y correr
#      `npm install` a secas deja el `resolved` viejo y node_modules en la
#      versión anterior, sin un solo error. Lo único que prueba que el pin subió
#      es leer node_modules/@strix/frontend-lib/package.json, y esta corrida lo
#      atrapó en el primer repo que probó.
#
#   3. RECONSTRUYE EL BUNDLE DONDE SE COMMITEA. Cinco cores llevan su
#      `dist` versionado porque el binario Go lo embebe con //go:embed, y su CI
#      falla si quedó viejo. Otros tres lo construyen en su propio Docker o CI y
#      no commitean nada: ahí subir el pin y el lock es todo el cambio.
set -euo pipefail

TAG="${1:-}"
[ -n "$TAG" ] || { echo "uso: $0 <tag> [--only repo,repo] [--dry-run]" >&2; exit 2; }
shift

ONLY=""
DRY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --only) ONLY="${2:-}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) echo "opción desconocida: $1" >&2; exit 2 ;;
  esac
done

# repo | directorio del frontend | ruta del bundle commiteado (vacío = no commitea)
CONSUMIDORES="
HiveStrix/strix-expenses|ui|ui/dist
HiveStrix/strix-inventory|ui|ui/dist
HiveStrix/strix-costing|ui|ui/dist
HiveStrix/strix-clients|ui|ui/dist
HiveStrix/strix-divisions|ui|ui/dist
HiveStrix/strix-billing|ui|internal/ui/dist
HiveStrix/Hivestrix-InboxAI|ui|internal/ui/dist
HiveStrix/strix-maintenance|web|
HiveStrix/strix-shell|web|
"

WORK="${WORK:-/private/tmp/sx-propagar/$TAG}"
mkdir -p "$WORK"
RAMA="chore/lib-$TAG"
echo "══ propagando @strix/frontend-lib $TAG ══"
echo "   área de trabajo: $WORK"
[ "$DRY" = 1 ] && echo "   (dry-run: no se empuja ni se abre PR)"
echo

ok=(); saltados=(); fallados=()

for linea in $CONSUMIDORES; do
  repo="${linea%%|*}"; resto="${linea#*|}"
  dir="${resto%%|*}"; dist="${resto#*|}"
  nombre="${repo##*/}"

  if [ -n "$ONLY" ] && ! printf '%s' ",$ONLY," | grep -q ",$nombre,"; then continue; fi

  echo "── $nombre ──────────────────────────────────"
  clon="$WORK/$nombre"
  rm -rf "$clon"
  # --filter=blob:none: el historial pesa, y de los blobs sólo hacen falta los
  # del checkout. Un clon completo de los nueve tarda de más sin dar nada.
  if ! git clone -q --filter=blob:none "https://github.com/$repo.git" "$clon"; then
    echo "   ✗ no se pudo clonar"; fallados+=("$nombre"); continue
  fi
  cd "$clon"

  actual=$(grep -o '"@strix/frontend-lib": "[^"]*"' "$dir/package.json" | head -1 | sed 's/.*#//; s/"$//')
  if [ "$actual" = "$TAG" ]; then
    echo "   ya está en $TAG — nada que hacer"; saltados+=("$nombre"); continue
  fi
  echo "   pin: $actual → $TAG"

  git switch -q -c "$RAMA"

  # EL PIN SE SUBE CON UN `npm install <spec>`, NO EDITANDO package.json.
  # Se probó al revés y falla callado: reescribir la referencia en
  # package.json y correr `npm install` a secas deja el lockfile con el
  # `resolved` VIEJO —npm confía en el lock— y node_modules con la versión
  # anterior, mientras package.json ya dice el tag nuevo. Los tres archivos
  # discrepan y el único que se mira en un diff es el que miente. Pasar el
  # spec explícito obliga a re-resolver, y escribe los tres a la vez.
  echo "   npm install…"
  ( cd "$dir" && npm install --no-audit --no-fund "@strix/frontend-lib@github:HiveStrix/strix-frontend-lib#$TAG" >/dev/null 2>&1 ) \
    || { echo "   ✗ npm install falló"; fallados+=("$nombre"); continue; }
  grep -q "strix-frontend-lib#$TAG" "$dir/package.json" || { echo "   ✗ el pin no quedó escrito en package.json"; fallados+=("$nombre"); continue; }

  # LA VERIFICACIÓN QUE NO SE SALTEA (ver el punto 2 de arriba).
  enDisco=$(node -p "require('$clon/$dir/node_modules/@strix/frontend-lib/package.json').version" 2>/dev/null || echo "?")
  esperada="${TAG#v}"
  if [ "$enDisco" != "$esperada" ]; then
    echo "   ✗ node_modules quedó en $enDisco y se esperaba $esperada"; fallados+=("$nombre"); continue
  fi
  echo "   en disco: $enDisco ✓"

  archivos=("$dir/package.json" "$dir/package-lock.json")
  if [ -n "$dist" ]; then
    echo "   npm run build…"
    ( cd "$dir" && npm run build >/dev/null 2>&1 ) || { echo "   ✗ build falló"; fallados+=("$nombre"); continue; }
    archivos+=("$dist")
    if git diff --quiet -- "$dist"; then
      echo "   bundle: sin cambios (la librería no tocó nada que este core use)"
    else
      echo "   bundle: reconstruido"
    fi
  fi

  # Rutas explícitas, nunca `git add -A`: en más de un repo del clúster hay otra
  # sesión editando el árbol al mismo tiempo.
  git add "${archivos[@]}"
  if git diff --cached --quiet; then
    echo "   sin diferencias — no se abre PR"; saltados+=("$nombre"); continue
  fi

  git commit -q -m "chore(deps): @strix/frontend-lib a $TAG" -m "Sube el pin de $actual a $TAG. El bundle commiteado se reconstruyó con la librería nueva y la versión se verificó en node_modules, no en el lockfile."

  if [ "$DRY" = 1 ]; then
    echo "   (dry-run) commit listo, no se empuja"; ok+=("$nombre"); continue
  fi

  git push -q -u origin "$RAMA"
  url=$(gh pr create --repo "$repo" --base main --head "$RAMA" \
    --title "chore(deps): @strix/frontend-lib a $TAG" \
    --body "Sube el pin de \`@strix/frontend-lib\` de \`$actual\` a **$TAG**.

$( [ -n "$dist" ] && echo "El bundle commiteado (\`$dist\`) se reconstruyó con la librería nueva, así que la guarda de CI pasa." || echo "Este repo no commitea su bundle: lo construye su propio Docker/CI con el lock de este PR." )

La versión se verificó leyendo \`node_modules/@strix/frontend-lib/package.json\`, no el lockfile.

Changelog: https://github.com/HiveStrix/strix-frontend-lib/blob/main/CHANGELOG.md

Abierto por \`scripts/propagar.sh\` de strix-frontend-lib." 2>&1 | tail -1)
  echo "   PR: $url"
  ok+=("$nombre")
done

echo
echo "══ resumen ══"
echo "  abiertos:  ${ok[*]:-—}"
echo "  saltados:  ${saltados[*]:-—}"
echo "  fallados:  ${fallados[*]:-—}"
[ ${#fallados[@]} -eq 0 ]
