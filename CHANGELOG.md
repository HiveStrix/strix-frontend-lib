# Changelog

Las versiones se instalan por tag (`npm install …#v0.7.0`). Ver el README.

## v0.7.0 — 2026-08-18

### Nuevo
- **`InfoDot`** (`shell`) — la ayuda `ⓘ`/`?` que envuelve al `Tooltip` existente;
  revela con hover, tap y foco. Premia rótulos escuetos guardando la explicación
  en un punto. Integrado en `Field` vía la prop **`hintDot`**.
- **`Schedule`** (`data`) — calendario de EVENTOS (distinto del `Calendar`
  selector-de-fecha). Tres vistas conmutadas con `Segmented`: **mes** (grilla),
  **semana** (siete columnas) y **agenda** (lista con cabeceras relativas
  Hoy/Mañana). Ancla `viewDate` bindable en dos direcciones, para atar un
  `DatePicker` externo y saltar a cualquier fecha.
- **`CONTRACT.md`** — contrato normativo para quien implementa la librería
  (márgenes garantizados, sin desborde, linealidad, premiar lo escueto, rieles
  al fondo), enlazado desde el README y extendiendo las tres reglas.
- **`PageHeader`** gana la prop **`bleed`** (desactiva el gutter propio) y la
  variante **`banda`** ahora acepta tonos semánticos.

### Cambiado
- **Rieles flotantes.** `Sidebar` y `SideRail` pasan de marco a ras a **tarjetas
  desprendidas que se estiran a la altura de su columna** (llegan al fondo) y
  conservan márgenes. Se unifican al mismo objeto flotante y se distinguen por
  ancho/contenido.
- **`PageHeader` auto-rellena.** `halo` y `sarion` traen su propio gutter por los
  cuatro lados: el texto ya no roza el borde.
- **`banda` con color de verdad.** Antes `--sx-thead` (casi blanca); ahora
  relleno de acento pleno por defecto + tonos semánticos, grande y completa.

### Arreglado
- `PageHeader` no-pegajoso ya no se monta sobre el cromo pegajoso al hacer
  scroll (era `z-index: var(--sx-z-sticky)`, baja a `1`).
- La 4ª señal del `Sidebar` colapsado (ícono activo con trazo más grueso) ahora
  sí se dibuja: la regla apunta al `path`, no al `svg` (crítica P1).
- Los chips del `Schedule` truncan de verdad con elipsis; antes se cortaban a
  media palabra (`text-overflow` en un contenedor flex; crítica P2).
- La agenda ya no afirma «Próximos» sobre días pasados: título neutro `Agenda`
  (prop `agendaTitle`) y marca «pasado» por día (crítica P3).

### Notas de migración (0.6 → 0.7)
- **Rieles:** un shell que suelte `Sidebar`/`SideRail` en un contenedor plano los
  verá flotar y no llegar al fondo. Dales una fila flex con
  `align-items: stretch`, una altura de la que estirarse, y un `padding`+`gap`
  parejos para el margen — ver la cláusula 5 del `CONTRACT.md` y el demo del
  catálogo (`Estructura → Sidebar`).
- **`PageHeader` dentro de una `Card` que ya rellena:** pasá **`bleed`** para no
  duplicar el margen.
- **`banda`** ahora es un bloque de color pleno; si venías usándola como una
  banda tenue, revisá el contraste con lo que la rodea (o usá `halo`/`sarion`).
