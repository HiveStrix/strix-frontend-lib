# Nácar — el sistema de diseño de Strix

**Fecha:** 2026-08-11
**Estado:** aprobado, listo para plan de implementación
**Alcance:** `packages/frontend-lib`. No toca ningún consumidor.

---

## 1 · Qué se construye y qué no

Se reconstruye `@strix/frontend-lib` sobre la dirección **AD · Nácar**, que quedó
elegida tras comparar dieciséis direcciones en `explore.html`.

**Fuera de alcance, por decisión explícita:**

| Queda fuera | Por qué |
|---|---|
| Enchufarlo a `strix-shell`, `strix-auth` o `strix-maintenance` | El pedido fue construir el sistema, no integrarlo. Además `strix-shell` es de otra org y su clon local es de solo lectura. |
| Publicar o distribuir el paquete | Decisión aplazada. Hoy se consume por npm workspace. |
| El modo oscuro | Nácar es una dirección de luz —blanco, sombra suave, halo—. Su versión oscura hay que **diseñarla**, no derivarla de la clara. `TOKENS_DARK` se queda como está (el oscuro de A) y no se declara compatible. |
| La deuda que lista el README de la lib | Mover `format.js`, desduplicar `.sx-sr`, unificar `DataState`. Mezclarlo con el rebind hace que un defecto visual no se pueda atribuir. Va después, por separado. |

**El criterio de terminado:** las siete páginas del catálogo se ven en Nácar, en
claro, a 1200 y a 390 px, y los colores resueltos coinciden con los de `[data-d='AD']`
en `explore`.

---

## 2 · La dirección

Nácar es una plantilla nueva, no una variante. Toma tres cosas de tres sitios:

- **De Prisma, la forma.** Radio 12 y 22, superficies opacas, sombra real con
  desplazamiento, pasteles de estado resueltos contra blanco.
- **De Prisma pastel (Z), la tabla.** Copiada por valor: los 59 tokens de Z
  acotados a la tabla.
- **De Halo claro (T), la barra.** No se separa con una línea sino con la luz que
  deja caer. Geometría de T sin tocar; la discreción va sólo por opacidad.

Fuera de la tabla, Nácar es **Z con el cromo dividido por tres**, más un fondo
blanco.

### La ley

> Nada se separa con una línea si puede separarse con luz o con tipografía. El
> color queda reservado a dos cosas: **el acento y el estado.**

### Qué es «cromo»

Todo el mobiliario que no es ni contenido ni estado: el fondo de la página, las
líneas que separan filas, el borde y el fondo hundido de un control, la sombra de
una tarjeta, la banda de una cabecera. **No** es cromo el texto (contenido), las
píldoras y bandas (vocabulario), ni el botón primario, el foco y los enlaces
(acento).

### Los valores, contra Z

Vocabulario (19 tokens de acento y tonos) y forma (15 de radio, espaciado y tipo)
son **idénticos a Z**. Sólo cambia el cromo:

| Token | Z | Nácar |
|---|---|---|
| `ground` | marca 5 % | `#FFFFFF` |
| `sunk` | marca 8 % | marca **3 %** |
| `line` | marca 12 % | marca **4 %** |
| `edge` | marca 24 % | marca **8 %** |
| `ink` | `#171327` | `#1A181F` — misma luminosidad, un tercio del violeta |
| `ink-2` | `#3B3454` | `#3F3D47` |
| `ink-3` | `#5B5473` | `#5F5C67` |
| sombra | `rgba(52,32,107,.22)` | `rgba(60,53,78,.22)` |
| etiquetas | `--d-brand` | tinta terciaria |
| cabecera | degradado lavanda→rosa | tinte plano al 6 % |

El fondo blanco es la única desviación de Z fuera del cromo, y es deliberada: es
la silueta de la dirección.

---

## 3 · Los tokens: tres capas

```
CAPA 1 · primitivas    la rampa de neutros de Nácar, con su traza violeta
                       --sx-n-0 … --sx-n-900
                            ↓
CAPA 2 · roles         qué es cada cosa, no de qué color es
                       --sx-ground --sx-surface --sx-sunk --sx-line
                       --sx-edge --sx-ink --sx-ink-2 --sx-ink-3 --sx-ink-on
                            ↓
CAPA 3 · perillas      lo que retunea la dirección sin tocar valores
                       --sx-chrome-tint  --sx-halo  --sx-thead  --sx-accent
```

La estructura **ya existe a medias**: los roles ya apuntan a las primitivas
(`--sx-line: var(--sx-n-150)`). Falta rebindear los valores y agregar la capa 3.

### Los tres niveles de override

El principio: **la librería sugiere, el producto decide.** Nada se congela.

1. **Nácar tal cual** — no se escribe nada. Es el default.
2. **Afinarlo** — se mueve una perilla:
   ```css
   --sx-accent: #B45309;        /* la marca del core */
   --sx-chrome-tint: 0%;        /* grises neutros en vez de la traza violeta */
   --sx-halo: 0%;               /* sin la firma de luz en la barra */
   --sx-thead: var(--sx-sunk);  /* encabezados con relleno */
   ```
3. **Necesidad puntual** — se pisa un rol o una primitiva:
   ```css
   --sx-line: #E0E0E0;
   --sx-n-150: #E0E0E0;
   ```

Los tres niveles son custom properties, así que funcionan igual en el Shell
(SvelteKit, luz DOM) y dentro de un Core (shadow root abierto), que es lo que
exige `shell-core-contract §12`.

### El acento

Sigue siendo un **hueco que cada core llena**. Los cores son secciones
independientes y no comparten pantalla, así que dos cores con acentos distintos
no producen costura.

El cromo de Nácar **deriva** del acento por defecto (`color-mix(accent N%, white)`),
que es lo que lo hace afinado. `--sx-chrome-tint` permite neutralizarlo a un core
que lo necesite.

### Los tonos semánticos no tienen perilla

«Vencido» tiene que verse igual en mantenimiento, facturación e inventario o deja
de ser vocabulario compartido. Técnicamente se pueden pisar; el sistema no ofrece
perilla y la documentación dice que no se haga.

### Tokens nuevos

| Token | Qué hace |
|---|---|
| `--sx-halo` | La firma: la luz que deja caer la barra en vez de una raya. |
| `--sx-thead` | El fondo de encabezado. Mueve cabecera de tabla y de panel a la vez. |
| `--sx-chrome-tint` | Cuánta marca lleva el mobiliario. `0%` = grises neutros. |

`--sx-thead` existe separado de `--sx-sunk` por una razón concreta: `--sx-sunk`
también pinta los controles de formulario, así que cambiarle el color al
encabezado movía también los inputs. Son dos decisiones y se mueven por separado.

---

## 4 · Los componentes: rebind, no reescritura

**El dato que lo decide:** 1866 usos de `var(--sx-…)` contra **un solo** color
literal en los 55 componentes, y cero nombres de color en posición de valor CSS.

Ese único literal es `nav/ShortcutOverlay.svelte:207`, y ni siquiera es un color
suelto — es la **reserva** de un token:

```css
background: var(--sx-scrim, rgba(20, 24, 26, .62));
```

Está ahí por el motivo que el README ya tiene anotado: `::backdrop` no hereda de
`:host`, así que el token puede no llegar. La disciplina de tokens de la
librería es total.

**Consecuencia para el rebind:** ese valor de reserva es el scrim de A y hay que
rebindearlo con el resto. Un token que nunca falla esconde su reserva; éste falla
en un caso real, así que su reserva se ve.

Rebindear `tokens.js` mueve los 55 de golpe. Lo que un rebind **no** arrastra es
la silueta. Son cinco toques, en cuatro archivos:

### 4.1 · La fila bajo el cursor — `data/Table.svelte`

```css
tbody tr.row:hover { background: var(--sx-sunk); }   /* línea 917 */
```

En A, `--sx-sunk` es un gris y la fila se oscurece: correcto ahí. En Nácar eso da
**la fila gris**. Va a `--sx-accent-soft`, que sobre blanco es un tinte apenas
insinuado y no es gris. Mismo patrón en `:focus-within` (918), `.sortbtn:hover`
(869) y `.disc:hover` (961).

Es la solución que W ya tenía escrita para su modo de transparencia reducida.
Nácar vive en ese modo de forma permanente, así que va sin media query.

### 4.2 · La cabecera de tabla — `data/Table.svelte:842`

Ya hace lo correcto (`background: var(--sx-surface)` más
`box-shadow: 0 1px 0 var(--sx-line)`, que es la escalera de Cristal). Sólo pasa a
leer `--sx-thead` para que sea la perilla.

### 4.3 · Cabecera y pie de Panel — `shell/Panel.svelte:101, 161`

`.head` hoy no tiene fondo; `.foot` usa `--sx-sunk`. Los dos pasan a `--sx-thead`,
que es lo que impide que encabezado de panel y de tabla queden de dos colores por
descuido.

### 4.4 · El halo — `nav/PageHeader.svelte`

La firma de la dirección; hoy no existe en la librería. Un token y una regla:

```css
box-shadow: 0 12px 28px -18px var(--sx-halo);
position: relative;
z-index: var(--sx-z-sticky);
```

El `z-index` no es opcional: sin él el fondo del hermano siguiente se pinta
después en el orden natural y se come la luz justo donde tiene que caer.

### 4.5 · Elevación — `tokens.js`

`--sx-e-1/2/3` son las sombras de A. Pasan a las de Nácar, con la traza violeta
en vez de gris. Una sombra gris bajo una familia lavanda parece suciedad.

---

## 5 · El defecto que hay que resolver, no heredar

Con el cromo a un tercio, `--sx-edge` resuelve a `#F3F0FA`. Y `--sx-edge` es el
**borde de botones e inputs**.

| Token | Valor | Contraste vs blanco |
|---|---|---|
| `--sx-line` (4 %) | `#F9F7FC` | 1.06:1 |
| `--sx-edge` (8 %) | `#F3F0FA` | **1.13:1** |
| Z: edge (24 %) | `#DAD1EF` | 1.46:1 |
| **A — lo que la lib envía hoy** | `#CFD2D4` | **1.52:1** |

WCAG 1.4.11 pide **3:1** para el borde de un control. **Ninguna de las tres pasa**,
así que no es un defecto que introduzca Nácar: es preexistente, la librería lo
envía hoy, y Nácar lo empeora.

**La resolución:** separar la línea *ambiente* de la línea *de control*. Son dos
trabajos distintos y hoy comparten token.

- `--sx-line` — separar filas, cerrar una cabecera. Puede ser muy tenue; no hay
  requisito de contraste para una separación decorativa.
- `--sx-edge` — el límite de un control. **Debe dar ≥ 3:1 contra la superficie
  sobre la que se dibuja**, y por lo tanto no puede salir de la misma escala de
  tercios que el resto del cromo.

Esto no rompe la ley de la dirección: un borde de control no es mobiliario
decorativo, es información —dice dónde se puede escribir—, y la ley ya reserva
excepción para el color que informa (el foco es marca por la misma razón).

La escala concreta de `--sx-edge` se fija durante la implementación midiendo
contra las superficies reales, no eligiendo un número lindo.

---

## 6 · Verificación

No hay tests. La verificación es la que el README ya define, más lo que esta
sesión demostró que hace falta:

1. **Las siete páginas del catálogo**, en claro, a **1200** y a **390 px**.
2. **Resolver los colores y comparar números** contra `[data-d='AD']` de
   `explore`. No «se ve parecido» — eso falló cuatro veces seguidas.
3. **Contraste medido** en cada borde de control y en cada texto secundario.
   Umbrales: 3:1 para límites de control, 4.5:1 para texto normal.
4. **Los estados feos**: vacío, cargando, con error, deshabilitado con razón, y
   con un texto tres veces más largo del que alguien imaginó.

---

## 7 · La lección que ordena el trabajo

Copiar una **regla** de otra dirección no copia su aspecto. `background: var(--d-sunk)`
no dibuja un color: dibuja lo que ese token valga donde se pega. En Cristal
`--d-sunk` es blanco al 30 % y **aclara** la fila bajo el cursor; en una dirección
opaca es un gris y la misma regla la **oscurece**.

Ese error costó cuatro intentos en `explore` y es la trampa que este rebind va a
volver a tender, porque los 55 componentes están escritos contra los tokens de A.

**Procedimiento obligatorio:** resolver los valores de origen y destino y
compararlos **antes** de escribir la regla. Verificar resolviendo el color final y
comparando números.

Y un corolario: **un material translúcido no se reproduce sin campo detrás.** La
tabla de Cristal es irreproducible sobre blanco —su superficie es
`rgba(255,255,255,.56)` y su escalera está hecha de transparencia—. Cuando algo
así aparezca, se dice de entrada en vez de intentar copiarlo mejor.

---

## 8 · Deuda que este spec crea o hereda

| Deuda | Dónde |
|---|---|
| El bloque `.tbl` de Nácar está **generado** de Z y no se entera si Z cambia | `explore/pages/Tablas.svelte` |
| El modo oscuro de Nácar no existe y no se puede derivar | `tokens.js`, `TOKENS_DARK` |
| La escala de `--sx-edge` queda por fijar midiendo | §5 |
| La deuda del README de la lib, intacta a propósito | `packages/frontend-lib/README.md` |
| Distribución sin decidir: hoy sólo npm workspace | `package.json` |
