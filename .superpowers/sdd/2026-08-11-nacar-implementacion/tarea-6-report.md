# Reporte Tarea 6 — El hueco del acento, y el tono neutro fijado

## Bloques reemplazados

### Bloque 1: Acento SLOT

**ANTES:**
```js
  // The accent SLOT. Unbound: resolves to near-black, a real usable primary.
  // A product overrides these four once, at its root.
  '--sx-accent': 'var(--sx-n-900)',
  '--sx-accent-ink': 'var(--sx-n-0)',
  '--sx-accent-soft': 'var(--sx-n-100)',
  '--sx-accent-edge': 'var(--sx-n-200)',
```

**DESPUÉS:**
```js
  // EL HUECO DEL ACENTO. Un producto lo llena ligando estas cuatro propiedades
  // en su raíz; es el único color que un producto elige.
  //
  // POR QUÉ EL DEFECTO YA NO ES CASI-NEGRO. Antes lo era, con el argumento de
  // que un acento sin ligar debía dar un primario usable. El argumento se cae en
  // Nácar por una razón mecánica: --sx-chrome-tint ya vale este mismo morado, así
  // que el mobiliario entero sale con su traza. Un acento casi-negro contra un
  // cromo violeta no es neutral: es una dirección desafinada de fábrica.
  '--sx-accent': '#6541BE',
  // Blanco sobre este morado da 6.88:1 — por encima de 4.5 con margen.
  '--sx-accent-ink': '#FFFFFF',
  // SIGUEN AL ACENTO, y esto es lo que la dirección vieja no hacía. Eran dos
  // peldaños fijos de la rampa (n-100 y n-200), o sea grises: un estado
  // interactivo pintado con ellos se lee como una superficie más sucia, no como
  // una pieza que responde.
  //
  // EL PORCENTAJE ESTÁ MEDIDO, no elegido. Contra una fila blanca en reposo:
  //   12 % → croma 15, distancia 16   (el valor de la exploración)
  //   16 % → croma 20, distancia 21   ← éste
  //   20 % → croma 25, distancia 27   (ya compite con una banda de estado)
  // Sube de 12 a 16 porque acá el cromo YA está teñido con este mismo morado:
  // los grises de la rampa llegan con croma 8, así que un tinte al 12 % aterriza
  // casi encima y el hover se lee como un gris apenas más oscuro. El 16 % es el
  // primer escalón que despega de forma inequívoca.
  '--sx-accent-soft': 'color-mix(in srgb, var(--sx-accent) 16%, #FFFFFF)',
  '--sx-accent-edge': 'color-mix(in srgb, var(--sx-accent) 28%, #FFFFFF)',
```

### Bloque 2: Tono neutro fijado

**ANTES:**
```js
  '--sx-neutral': 'var(--sx-n-500)',
  '--sx-neutral-band': 'var(--sx-n-100)',
  '--sx-neutral-edge': 'var(--sx-n-200)',
```

**DESPUÉS:**
```js
  // FIJADO A HEX, como los otros cuatro. Apuntaba a la rampa (n-500/n-100/n-200),
  // así que su color cambiaba con el cromo de cada dirección: «ninguno» se veía
  // distinto entre dos productos, que es exactamente lo que la ley prohíbe. Estos
  // son los valores que resolvía con el cromo de Nácar, congelados.
  '--sx-neutral': '#666373',
  '--sx-neutral-band': '#EDEBF3',
  '--sx-neutral-edge': '#D3D1DF',
```

### Bloque 3: Arnés de contraste (INICIAL - incorrecto)

**CHECKS - INTENTO 1 (erróneo):**
```js
  ['--sx-accent-ink', '--sx-accent', 4.5, 'tinta sobre el acento'],
  ['--sx-accent-edge', '--sx-surface', 3.0, 'filo del acento sobre superficie'],
  ...TONES.map((t) => [`--sx-${t}`, `--sx-${t}-band`, 4.5, `tono ${t} sobre su banda`])
```

Este cambio fue revertido en la Ronda de Arreglo 1.

**INFO - INTENTO 1 (incompleto):**
```js
INFO.push(['--sx-accent-soft', '--sx-surface', 'hover sobre fila en reposo']);
```

## Verificaciones

### Paridad (tokens.js vs tokens.css)
```
coinciden — 84 tokens
exit: 0
```

### Arnés RONDA 1 (con --sx-accent-edge en CHECKS) - INTENTO 1

**Acento #6541BE:** exit 1 (fallaba)
**Acento #B45309:** exit 1 (fallaba)

Falla: `--sx-accent-edge` ratio ~1.5 vs umbral 3.0. El filo no tiene suficiente contraste.

### Arnés RONDA 2 (post-arreglo, con --sx-accent-edge en INFO) - CORRECTO

**Acento #6541BE:** exit 0 (pasa)
**Acento #B45309:** exit 0 (pasa)

Salida con #6541BE:
```
--sx-edge                --sx-surface         3.47  3.0  ok
--sx-edge                --sx-ground          3.47  3.0  ok
--sx-ink                 --sx-surface        16.45  4.5  ok
--sx-ink-2               --sx-surface         9.93  4.5  ok
--sx-ink-3               --sx-surface         5.84  4.5  ok
--sx-accent-ink          --sx-accent          6.88  4.5  ok
--sx-positive            --sx-positive-band   5.40  4.5  ok
--sx-attention           --sx-attention-band  5.18  4.5  ok
--sx-critical            --sx-critical-band   5.23  4.5  ok
--sx-info                --sx-info-band       6.43  4.5  ok
--sx-neutral             --sx-neutral-band    4.94  4.5  ok

informativo — no rompe el build
  --sx-positive-edge      1.51   filo del tono positive
  --sx-attention-edge     1.46   filo del tono attention
  --sx-critical-edge      1.60   filo del tono critical
  --sx-info-edge          1.62   filo del tono info
  --sx-neutral-edge       1.50   filo del tono neutral
  --sx-accent-soft        1.28   hover sobre fila en reposo
  --sx-accent-edge        1.56   filo del acento sobre superficie

todo el contrato pasa
exit: 0
```

## Ronda de Arreglo 1

**Error en el pliego:** `--sx-accent-edge` no debería estar en `CHECKS` (contrato duro). Debería estar en `INFO` (informativo).

**Argumento:** WCAG 1.4.11 pide 3:1 para el límite necesario para **identificar** un componente. Los filos de tono no identifican — identifican la banda, marca y palabra. Son refuerzo.

Lo mismo con `--sx-accent-edge`: se usa sólo en refuerzo:
- `ChoiceCards.svelte:219` — borde de insignia dentro de tarjeta YA seleccionada
- `SplitButton.svelte:135` — raya divisoria dentro de botón

**Cambios en Ronda 1:**
1. Quitada línea de `--sx-accent-edge` de `CHECKS`
2. Agregada segunda línea a `INFO.push()` con filo del acento
3. Ampliado comentario antes de `INFO` explicando por qué los filos están afuera
4. Restaurado `TOKENS_DARK.'--sx-accent'` a `#EDEFF0`

**Resultado:** 
- `npm run contrast` → **exit 0**
- Ambas configuraciones de acento (#6541BE y #B45309) → **exit 0**
- Las dos líneas nuevas ahora aparecen en sección informativa sin romper build

## Verificación TOKENS_DARK

Confirmado: `TOKENS_DARK` mantiene `'--sx-accent': '#EDEFF0'` (no fue modificado).

## Commits

```
4fc7053 El hueco del acento, que el plan se había saltado, y el neutro fijado
0b16f4e Arreglo: filos del acento a INFO, no a CHECKS
```
