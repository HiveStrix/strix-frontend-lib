# strix-frontend-example

Ejemplos ejecutables de **`@strix/frontend-lib`**, el sistema de diseño de Strix.

Este repo no es una librería ni un catálogo. Es la respuesta a *«ya tengo la
librería instalada, ¿y ahora cómo armo una pantalla?»*. Son pantallas completas
de verdad, con datos feos de verdad, escritas como se escribirían en un producto.

---

## Cómo se ejecuta

Requiere Node 18 o superior.

```bash
cd strix-frontend-example
npm install
npm run dev
```

Abrí **http://localhost:5200**.

Los otros dos comandos:

```bash
npm run build      # compila a dist/
npm run preview    # sirve dist/ para revisar el build de producción
```

### Un detalle de la instalación

La librería entra por ruta local, no por registro:

```json
"dependencies": { "@strix/frontend-lib": "file:../strix-FrontendLib" }
```

npm crea un enlace simbólico, así que **lo que cambiés en la librería aparece
acá al instante**, sin reinstalar. El precio es que los dos repos tienen que
estar hermanos en el disco:

```
AAproyectos/
├── strix-FrontendLib/        ← la librería
└── strix-frontend-example/   ← este repo
```

Si la moviste, cambiá esa ruta en `package.json` y volvé a correr `npm install`.

---

## Qué pasa cuando lo abrís

Arriba hay una barra negra. **Esa barra no es de la librería** — está escrita a
mano y sin tokens a propósito, para que se distinga qué parte de la pantalla es
el sistema demostrándose y qué parte es el demo hablando de él. Todo lo que está
debajo de la barra sí es la librería.

La barra tiene tres controles:

| Control | Qué hace |
|---|---|
| **Flota / Registrar lectura** | Cambia de ejemplo. El elegido queda en el hash de la URL, así que se puede enlazar. |
| **Marca** | Rebindea el acento. |
| **Oscuro** | Cambia el tema. |

### El selector de marca es lo que más conviene mirar

Cambialo entre *Opra*, *Sarion* y *Faro* y mirá qué se mueve. Se tiñen los
botones primarios, los focos, los enlaces. **No se mueve nada más**: los estados
—vencido, por vencer, al día— se quedan exactamente igual en las tres marcas.

Eso es deliberado y es la regla más importante del sistema. El acento es un
espacio vacío que cada producto llena. Los tonos semánticos son fijos en todo el
ecosistema, porque «vencido» tiene que verse idéntico en mantenimiento, en
facturación y en inventario, o deja de ser un vocabulario compartido.

Por dentro, cambiar de marca es esto y nada más:

```js
document.documentElement.style.setProperty('--sx-accent', '#B45309');
document.documentElement.style.setProperty('--sx-accent-ink', '#FFFFFF');
document.documentElement.style.setProperty('--sx-accent-soft', '#FDF0DC');
document.documentElement.style.setProperty('--sx-accent-edge', '#EBC896');
```

Cuatro propiedades. No hay un archivo de tema por cliente, ni una clase por
marca, ni un build distinto por tenant.

---

## Los ejemplos

### 1 · Flota — mostrar datos

`src/Flota.svelte`

Una pantalla de listado completa: encabezado con acciones, alerta de lo que
urge, tira de KPIs, búsqueda, filtros por familia, tabla ordenable y barras de
avance.

Lo que enseña:

- **`Table` con columnas declaradas una vez.** El formato vive en la definición
  de la columna, no repetido en cada celda. `numeric` alinea a la derecha con
  cifras tabulares; `id` usa el registro monoespaciado de identificador. Una
  placa como `C-148921` **no** es `numeric` — es un identificador, y la
  diferencia es que uno se compara y el otro se lee carácter por carácter.
- **`sortValue` separado de lo que se imprime.** La columna de estado se ordena
  por urgencia (vencido primero), no alfabéticamente, que pondría «Al día»
  arriba de «Vencido».
- **Columnas `optional` con `showAt`.** Se caen solas cuando la pantalla se
  angosta, en un orden que vos decidís, en vez de dejar que todo se envuelva en
  tres líneas y finja que cabe.
- **`Pill` en la celda de estado:** tono + marca + palabra, siempre los tres.
  Nunca solo color.
- **Los conteos de los filtros van sobre el conjunto completo**, no sobre lo que
  quedó filtrado — si no, presionar un filtro cambia los números de los demás y
  nadie entiende qué está viendo.

### 2 · Registrar lectura — recibir datos

`src/Lectura.svelte`

Un formulario que se puede equivocar, que es donde un sistema de diseño se gana
el sueldo. Escribí una lectura **menor** a la última registrada y mirá qué pasa.

Lo que enseña:

- **`error` dice qué pasó, `fix` dice cómo se arregla.** Son dos props separadas
  porque son dos frases distintas, y un mensaje que solo dice «valor inválido»
  no pasa revisión.
- La regla de negocio real: un horómetro no retrocede. Si la lectura baja, o la
  escribieron mal o le cambiaron el instrumento al equipo — las dos cosas
  necesitan que alguien decida, no que el sistema adivine.
- **`Toast` con acción de deshacer** en vez de un diálogo de confirmación antes
  de guardar. Confirmar antes interrumpe siempre; deshacer después solo molesta
  cuando de verdad hubo un error.

---

## Cómo está organizado

```
src/
├── main.js        carga tokens.css y base.css, monta la app
├── App.svelte     el andamio del demo: navegación, marca, tema
├── Flota.svelte   ejemplo 1
├── Lectura.svelte ejemplo 2
└── data.js        los datos, sueltos y sin API
```

`data.js` no tiene fetch, ni store, ni estado de carga. La forma de los objetos
sí es la real —es lo que devuelve el módulo de mantenimiento—, pero meterle una
capa de datos solo escondería lo único que este repo viene a mostrar.

### La regla que siguen los dos ejemplos

Ninguno de los dos archivos de pantalla define **un color, un radio o una
sombra**. Lo único que aportan es distribución: qué va arriba, qué va al lado de
qué, cuánto aire hay en medio. Los espacios salen de la escala de tokens
(`var(--sx-s-6)`), no de números sueltos.

Si algo se ve mal en un ejemplo, el arreglo va en la librería y le llega a todos
los productos. Ese es el punto entero de tener librería.

---

## Dos cosas que este repo ya atrapó

Vale dejarlas escritas, porque las dos fallan **en silencio**:

1. **`variant="primary"` no existe.** La variante rellena se llama `solid`
   (`solid | outline | ghost | danger`). Un nombre inventado no empata con
   ninguna clase, así que el botón sale sin estilo y nada avisa.

2. **El slot del pie de `Panel` se llama `footer`, no `foot`.** Un nombre de
   slot equivocado no es un error de compilación: el contenido simplemente no
   se dibuja.

En los dos casos la consola queda limpia. Por eso existe este repo — un
componente puede estar perfecto y aun así ser fácil de usar mal.

---

## Lo que este repo no es

- **No es el catálogo.** Los 55 componentes con todos sus estados viven en
  `strix-FrontendLib` (`npm run dev` ahí, puerto 5180).
- **No es un Core.** Un Core del ecosistema se empaqueta distinto —custom
  element, shadow root, CSP estricta— y eso vive en `strix-maintenance/web`,
  que es donde se puede ver hecho de verdad.
- **No tiene pruebas.** Es un demo; lo que hay que probar es la librería.

---

## Estado

Dos ejemplos. Faltan al menos dos que serían útiles: una pantalla de detalle
(la ficha de un equipo) y una de configuración con formularios largos, que es
donde la jerarquía tipográfica se pone a prueba de verdad.
