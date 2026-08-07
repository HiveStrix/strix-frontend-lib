# strix-frontend

Monorepo del frontend de Strix: **el sistema de diseño y los ejemplos que lo
demuestran, en un solo clone**.

Están juntos a propósito. Un ejemplo que vive en otro repo se desincroniza de la
librería en dos semanas, y un ejemplo desincronizado es peor que no tener
ejemplo: enseña a usar algo que ya no existe así.

```
strix-frontend/
├── packages/
│   └── frontend-lib/          @strix/frontend-lib — el sistema
│       ├── src/lib/           55 componentes y los tokens
│       ├── src/catalog/       el catálogo: cada componente y sus estados
│       └── src/explore/       direcciones de diseño, para elegir una
└── examples/
    └── mantenimiento/         pantallas reales armadas con la librería
```

---

## Cómo se ejecuta

Requiere Node 18 o superior. Una sola instalación desde la raíz — npm enlaza los
workspaces entre sí, así que la librería y los ejemplos quedan conectados sin
que haya que publicar nada.

```bash
npm install
```

Después, según lo que quieras ver:

| Comando | Qué abre | Puerto |
|---|---|---|
| `npm run dev` | Los ejemplos: pantallas completas | **5200** |
| `npm run dev:lib` | El catálogo de componentes | **5180** |

El servidor de la librería sirve además la exploración de direcciones en
**http://localhost:5180/explore.html**.

Otros dos:

```bash
npm run build     # compila la librería y los ejemplos
npm run tokens    # regenera tokens.css desde tokens.js
```

---

## Los tres surfaces, y para qué sirve cada uno

### `packages/frontend-lib/src/lib` — el sistema

Los 55 componentes, los tokens y el vocabulario. Es lo único que un producto
consume.

La regla que sostiene todo lo demás: **el acento es un espacio vacío que cada
producto llena; los tonos semánticos son fijos en todo el ecosistema.** «Vencido»
tiene que verse idéntico en mantenimiento, en facturación y en inventario, o
deja de ser un vocabulario compartido y pasa a ser decoración.

Los encabezados de cada archivo son la documentación real. `Pill.svelte` explica
por qué un estado es siempre *tono + marca + palabra* y nunca solo color;
`tokens.js` explica por qué los tokens existen dos veces —como objeto y como
string— y qué se rompe si falta la segunda forma.

### `packages/frontend-lib/src/catalog` — el catálogo

Cada componente con todos sus estados, incluidos los feos: vacío, cargando, con
error, deshabilitado con razón, con un texto tres veces más largo del que
alguien imaginó. Es donde se revisa un componente, no donde se aprende a
combinarlos.

### `examples/mantenimiento` — los ejemplos

Pantallas completas, con datos feos de verdad, escritas como se escribirían en
un producto. Es la respuesta a *«ya tengo la librería, ¿ahora cómo armo una
pantalla?»*.

---

## Qué pasa cuando abrís los ejemplos

Arriba hay una barra negra. **Esa barra no es de la librería** — está escrita a
mano y sin tokens a propósito, para que se distinga qué parte de la pantalla es
el sistema demostrándose y qué parte es el demo hablando de él. Todo lo que está
debajo sí es la librería.

| Control | Qué hace |
|---|---|
| **Flota / Registrar lectura** | Cambia de ejemplo. Queda en el hash, así que se puede enlazar. |
| **Marca** | Rebindea el acento. |
| **Oscuro** | Cambia el tema. |

### El selector de marca es lo que más conviene mirar

Cambialo entre *Opra*, *Sarion* y *Faro*. Se tiñen los botones primarios, los
focos, los enlaces. **No se mueve nada más**: vencido, por vencer y al día se
ven exactamente igual en las tres marcas.

Por dentro es esto y nada más:

```js
document.documentElement.style.setProperty('--sx-accent', '#B45309');
document.documentElement.style.setProperty('--sx-accent-ink', '#FFFFFF');
document.documentElement.style.setProperty('--sx-accent-soft', '#FDF0DC');
document.documentElement.style.setProperty('--sx-accent-edge', '#EBC896');
```

Cuatro propiedades. No hay un archivo de tema por cliente, ni una clase por
marca, ni un build distinto por tenant.

### 1 · Flota — mostrar datos

`examples/mantenimiento/src/Flota.svelte`

Encabezado con acciones, alerta de lo urgente, tira de KPIs, búsqueda, filtros,
tabla ordenable y barras de avance.

- **Columnas declaradas una vez**, con el formato en la definición y no repetido
  en cada celda. `numeric` alinea a la derecha con cifras tabulares; `id` usa el
  registro monoespaciado. Una placa como `C-148921` **no** es `numeric` — es un
  identificador, y la diferencia es que uno se compara y el otro se lee carácter
  por carácter.
- **`sortValue` separado de lo que se imprime.** El estado ordena por urgencia,
  no alfabéticamente: alfabéticamente «Al día» quedaría arriba de «Vencido».
- **Columnas `optional` con `showAt`**, que se caen solas en el orden que vos
  decidís cuando la pantalla se angosta.
- **Los conteos de los filtros van sobre el conjunto completo**, no sobre lo
  filtrado. Si no, presionar un filtro cambia los números de los otros y nadie
  entiende qué está viendo.

### 2 · Registrar lectura — recibir datos

`examples/mantenimiento/src/Lectura.svelte`

Un formulario que se puede equivocar, que es donde un sistema de diseño se gana
el sueldo. Escribí una lectura **menor** a la última registrada y mirá qué pasa.

- **`error` dice qué pasó, `fix` dice cómo se arregla.** Dos props, porque son
  dos frases distintas. «Valor inválido» no pasa revisión.
- La regla real: un horómetro no retrocede. Si la lectura baja, o la escribieron
  mal o le cambiaron el instrumento al equipo — las dos cosas necesitan que
  alguien decida, no que el sistema adivine.
- **Toast con deshacer** en vez de confirmar antes de guardar. Confirmar
  interrumpe siempre; deshacer solo molesta cuando de verdad hubo un error.

### La regla que siguen los dos

Ninguno de los dos archivos define **un color, un radio o una sombra**. Lo único
que aportan es distribución. Los espacios salen de la escala de tokens
(`var(--sx-s-6)`), no de números sueltos.

Si algo se ve mal en un ejemplo, el arreglo va en la librería y le llega a todos
los productos. Ese es el punto entero de tener librería.

---

## Tres cosas que los ejemplos ya atraparon

Vale dejarlas escritas, porque las tres fallan **en silencio**:

1. **`variant="primary"` no existe.** La variante rellena se llama `solid`
   (`solid | outline | ghost | danger`). Un nombre inventado no empata con
   ninguna clase: el botón sale sin estilo y nada avisa.

2. **El slot del pie de `Panel` se llama `footer`, no `foot`.** Un nombre de
   slot equivocado no es un error de compilación — el contenido simplemente no
   se dibuja.

3. **Una acción por fila con el texto completo desborda la columna.** «Registrar
   lectura de BAT-014» seis veces no cabe; «Registrar» seis veces deja a quien
   navega por lista de controles sin saber cuál es cuál. Se resuelve con texto
   visible corto y el resto en `.sx-sr`.

En los tres casos la consola queda limpia. Por eso los ejemplos viven acá
adentro: un componente puede estar perfecto y aun así ser fácil de usar mal.

---

## Estado

**La librería** tiene 55 componentes y no tiene pruebas automatizadas. El README
de `packages/frontend-lib` lleva su propia lista de lo que falta.

**La dirección visual no está decidida.** `src/explore` muestra ocho direcciones
—de tarjetas flotantes a franjas sin caja a rejilla monoespaciada— sobre el
mismo contenido, para elegir una. Los 55 componentes de hoy hablan la primera.
Cuando haya una elegida, se reconstruyen sobre los mismos huesos.

**Los ejemplos** son dos. Faltan al menos dos que servirían: una pantalla de
detalle (la ficha de un equipo) y una de configuración con formularios largos,
que es donde la jerarquía tipográfica se pone a prueba de verdad.
