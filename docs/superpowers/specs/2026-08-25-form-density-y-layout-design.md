# Densidad de formularios + layout compacto — diseño

**Fecha:** 2026-08-25 · **Repo:** `strix-frontend-lib` · **Rama:** `forms-layout` (a crear)
**Estado:** propuesto — pendiente de revisión antes de plan de implementación.
**Enfoque elegido:** A — scope de densidad por tokens (decidido en brainstorming).

---

## 1. Contexto y problema

Los formularios de los cores salen **gigantes**. El caso testigo es el borrador de factura de
billing (`strix-billing/ui/src/forms/BorradorForm.svelte`, "nuevo borrador"). La altura es
**acumulativa**:

- El control base de la lib tiene un **único tamaño fijo**: `.frame` en `form/Field.svelte`
  (`min-height: var(--sx-s-10)` = 40px, `padding: var(--sx-s-2) var(--sx-s-3)` = 8/12px). No hay
  forma de pedir un control más bajo.
- billing hand-rollea su grid: `grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr))` con
  `gap: var(--sx-s-4)` (16px), títulos de sección en `--sx-t-lg`, bloques con `padding: --sx-s-4` y
  una sombra por bloque. El `auto-fit` + `minmax` **estira** cada campo para llenar el ancho, así que
  dos campos en una fila ocupan ~600px cada uno.

Resultado: el ojo ve cajas grandes y mucho aire vertical. Como la lib no ofrece densidad ni un patrón
de layout, **cada core reinventa el grid y deriva a gigante** (el error que este trabajo cierra).

**Meta del usuario:** los formularios deben poder ser compactos —**principalmente la altura de los
controles**— y la densidad debe **poder variar por sección** ("un form requiere más"). Además, dejar
en el catálogo la guía de layout compacto que a billing le faltó.

## 2. Objetivos / No-objetivos

**Objetivos**
1. Un mecanismo de **densidad** en los componentes de formulario de la lib: por **scope** en un
   contenedor, **heredable** (una sección entera se compacta), **retrocompatible** (default = hoy).
2. Un patrón de **layout compacto** (grid controlado + utilidades de span) documentado y copiable.
3. Una **sección nueva en el catálogo** (`Formularios.svelte`) que muestre compacto vs default y un
   ejemplo realista (factura recortada).

**No-objetivos**
- El "revamp completo" del Shell (esfuerzo architectural aparte, rama `frontend-remake` del shell).
- Tocar billing (adopta esto después; acá solo se cambia la lib).
- Un componente `FormGrid`/`FormSection` completo (se elige "sección", no "primitivo"). Se entregan
  clases de layout copiables; el componente queda como follow-up anotado.
- Un tercer nivel de densidad ("cozy" intermedio): YAGNI, se arranca con **default + compact**.

## 3. Modelo de consumo (por qué condiciona el diseño)

`tokens.css` **se genera** desde `src/lib/tokens.js` vía `scripts/tokens.mjs` — **no se edita a mano**.
Hay **dos** formas de consumir los tokens, y el mecanismo de densidad debe servir a ambas:

- **App SvelteKit (el Shell / "Sarion")**: importa `tokens.css` + `base.css` una vez en la raíz.
  `stylesheet()` = `hostTokens(':root')` + `hostTokensDark(':root[data-sx-theme="dark"], .sx-dark')`.
- **Core en shadow root**: un stylesheet linkeado no cruza el shadow boundary y la CSP prohíbe
  `@import`, así que el core **inlinea** `hostTokens(':host')` + `hostBase()` en su `<style>` raíz.

Por lo tanto, tanto las **variables de tamaño de control** como el **scope de densidad** tienen que
emitirse desde `tokens.js` para que lleguen por las dos vías (documento y shadow).

## 4. Diseño — A: scope de densidad por tokens

### 4.1 Variables de tamaño de control (en `TOKENS`, tokens.js)

Se agregan a `TOKENS` (bloque base, ~línea 86), con **default idéntico a hoy** (por eso es
retrocompatible: quien no opte por densidad no ve ningún cambio):

| Variable | Default | Hoy equivalente |
|---|---|---|
| `--sx-control-h` | `40px` | `var(--sx-s-10)` (min-height del `.frame`) |
| `--sx-control-pad-y` | `8px` | `var(--sx-s-2)` |
| `--sx-control-pad-x` | `12px` | `var(--sx-s-3)` |
| `--sx-control-gap` | `8px` | `var(--sx-s-2)` (gap interno del `.frame`) |

Fluyen a `:root` (vía `stylesheet()`) y a `:host` (vía `hostTokens`) automáticamente.

### 4.2 Scope de densidad (emitter nuevo en tokens.js)

Un emitter `densityScopes(scopePrefix)` que produce las sobrescrituras del nivel **compact**:

```
[data-sx-density="compact"] {
  --sx-control-h: 32px;          /* var(--sx-s-8) */
  --sx-control-pad-y: 4px;       /* var(--sx-s-1) */
  --sx-control-pad-x: 12px;      /* se mantiene: apretar horizontal daña la lectura */
  --sx-control-gap: 6px;
}
/* No bajar del touch target en punteros gruesos */
@media (pointer: coarse) {
  [data-sx-density="compact"] { --sx-control-h: var(--sx-touch); /* 44px */ }
}
```

Se incluye en **`stylesheet()`** (modelo documento) **y** se anexa en **`hostBase()`** (modelo shadow,
para que un `[data-sx-density="compact"]` dentro del shadow del core también aplique). El scope se pone
en **cualquier contenedor** (un `<form>`, una `<section>`); por herencia de CSS, la densidad **varía por
sección** sin repetir nada en cada campo. Valores exactos (32/4/6) a afinar en la iteración visual.

### 4.3 Cableado de componentes

Cambiar valores hardcodeados por las variables:

- **`form/Field.svelte` `.frame`** (el frame compartido — lo usan Input, Select, NumberInput,
  DateInput): `min-height: var(--sx-control-h)`; `padding: var(--sx-control-pad-y)
  var(--sx-control-pad-x)`; `gap: var(--sx-control-gap)`.
- **`form/Combobox.svelte`** (dibuja su propia superficie, `min-height: var(--sx-s-10)` + padding):
  mismas variables.
- **`form/Textarea.svelte`** (multilínea, no aplica `min-height` de una fila): `padding` a las
  variables; el alto lo da el número de filas.
- **Verificar en implementación** qué controles usan el `.frame` de `Field` (heredan gratis) y cuáles
  dibujan superficie propia (hay que cablearlos): confirmar Select, NumberInput, DateInput,
  DatePicker, DateRange, FileDrop, ChoiceCards. Checkbox/Radio/Switch son objetos de tamaño propio
  (no cajas de texto) → **fuera** del alcance de densidad de control.
- **Ritmo vertical del Field** (opcional, menor): bajo `compact`, reducir `.head { margin-bottom }` y
  `.hint { margin }` un escalón. El **tamaño de la etiqueta no cambia** (legibilidad).

### 4.4 Layout compacto (grid) — clases copiables + demo

El grid es lo que evita el estiramiento. Se entregan clases de layout **documentadas y copiables**
(no un componente — se eligió "sección"):

- `.sx-form-grid`: `display: grid; gap: var(--sx-s-3); grid-template-columns: repeat(12, 1fr)` (o
  `repeat(auto-fill, minmax(11rem, 1fr))` con tope, a decidir en la iteración) — la clave es que los
  campos **no se estiran** a todo el ancho.
- Utilidades de span: `.span-2`, `.span-3`, `.span-full` para los campos anchos (dirección, notas).
- Responsive: en angosto colapsa a una columna.

Viven en la **página del catálogo** (copiables). Si más adelante se quiere impedir el copy-paste (que
es como billing derivó), se promueven a un componente `FormGrid` — **follow-up anotado, fuera de alcance**.

### 4.5 Sección del catálogo

Nueva `<section id="layout">` en `src/catalog/pages/Formularios.svelte`, siguiendo el patrón existente
(h2 + intro `.sx-cap` + `.demo` + snippet):

1. Tesis corta (registro `.sx-cap`): *"La densidad es del contenedor, no del campo."*
2. **Demo de densidad**: los mismos campos en `default` vs `[data-sx-density="compact"]`, lado a lado.
3. **Demo de grid**: `.sx-form-grid` + spans; y el **antes/después** contra el patrón que estira.
4. **Ejemplo realista**: factura recortada (cabecera + receptor + 2 líneas) en compacto — el "hacé esto".

## 5. Flujo de datos / mecánica

Puro **CSS custom properties + herencia**; **sin estado JS**. Un contenedor declara
`data-sx-density="compact"`; los controles de adentro leen `--sx-control-*`. Ningún componente gana
props obligatorias — `data-sx-density` es opt-in en contenedores. Cero cambios de API.

## 6. Testing / verificación

- **Visual (principal):** levantar el catálogo (`npm run dev`), capturar la sección nueva en desktop y
  angosto, en claro y oscuro, y default vs compact.
- **Regresión:** confirmar que las demás páginas del catálogo **no cambian** (las variables tienen el
  valor actual por default; el cambio es no-op hasta que un scope opte por compact).
- **Tokens:** correr `npm run tokens` (regenerar `tokens.css`) y `npm run contrast` si se tocaron
  tokens; verificar que no rompe.
- **Computed check:** un control dentro de `[data-sx-density="compact"]` computa la altura menor
  (verificación con computed style en el navegador).
- **Touch:** en `(pointer: coarse)` el control compacto **no** baja de `--sx-touch` (44px).

## 7. Riesgos y mitigaciones

- **Tocar el `.frame` compartido** → riesgo de regresión en todos los forms. *Mitigación:* las
  variables valen exactamente lo de hoy; el cambio es no-op hasta que alguien opte por un scope.
  Verificar que las otras páginas del catálogo quedan idénticas.
- **Superficies propias (Combobox/Textarea/otros)** → hay que cablear cada una; enumerarlas y
  verificarlas una por una.
- **Generador de tokens** → agregar las variables en `tokens.js` (fuente) y **regenerar**; nunca
  editar `tokens.css` a mano. El scope de densidad debe emitirse tanto en `stylesheet()` como en
  `hostBase()` para servir a los dos modelos de consumo.
- **Touch target** → el nivel compact debe respetar 44px en punteros gruesos (regla `@media`).

## 8. Rollout / adopción

El cambio de lib es **aditivo**. Un core adopta compacidad envolviendo su form (o una sección) en
`data-sx-density="compact"` y usando `.sx-form-grid` + spans. billing puede después tirar su grid
gigante hand-rolleado y adoptar el scope + el grid (fuera de alcance de este trabajo).

## 9. Decisiones abiertas (a cerrar en la iteración)

- **Valores exactos** de compact: `--sx-control-h` 32 vs 36; `--sx-control-pad-y` 4 vs 6; gap. Se
  afinan mirándolo en el catálogo.
- **Grid**: 12-col explícito vs `auto-fill minmax` con tope. Decidir con el ejemplo de factura.
- **Ritmo vertical del Field** bajo compact: ¿se aprieta `.head`/`.hint` o se deja? (propuesta:
  apretar un escalón, no tocar tamaño de etiqueta).
