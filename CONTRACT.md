# El contrato de Strix · frontend-lib

Las **tres reglas** del `README.md` describen cómo se ve el sistema —cromo
acromático, el color nunca viaja solo, las cifras que se comparan se alinean—.
Este contrato describe cómo se **usa**: lo que quien implementa la librería
tiene que sostener para que una pantalla se lea como Strix y no como cinco
martes distintos. No reemplaza a las tres reglas; las lleva del cromo al
comportamiento.

Cinco cláusulas. Todas tienen la misma forma: una promesa, su porqué, y la
única excepción legal.

---

## 1 · Márgenes garantizados — nada roza el borde

**Ningún texto ni control toca el borde de su contenedor.** Un título pegado al
canto, una etiqueta que arranca en el píxel cero, un botón que termina contra la
pared: eso no se lee como denso, se lee como roto. El aire alrededor del
contenido no es decoración — es lo que dice dónde empieza y termina una cosa.

Quién pone el margen:

- El **cromo se auto-rellena.** `PageHeader` trae su propio gutter por los
  cuatro lados (ver `bleed` para desactivarlo cuando el padre YA rellena);
  `banda`, `Hero`, `Card`, `Panel` traen el suyo. No hace falta acordarse.
- El **shell garantiza el gutter** alrededor de lo que flota. Los carriles
  desprendidos (`Sidebar`, `SideRail`) NO se dibujan un margen encima: es el
  layout del shell el que los separa del borde y entre sí, con un padding y un
  gap parejos. El patrón está en el catálogo (`Estructura → Sidebar`): una fila
  flex con `padding` + `gap` + `align-items: stretch`.

> **Excepción legal:** los overlays que existen para salirse — `Tooltip`,
> `InfoDot`, `Menu`, `Sheet`, `Dialog`, `ShortcutOverlay`. Un dropdown o un
> pop-out se dibuja fuera del flujo a propósito; esa es su función, no un
> desborde.

## 2 · Sin desborde — el texto vive dentro de su caja

**El texto trunca con elipsis o envuelve; nunca se derrama.** Un nombre que se
sale de su celda, una etiqueta que empuja a su vecina fuera de la fila, una
cifra que rompe la columna: cada uno rompe la grilla que hace legible al resto.

- Lo que puede truncar, trunca con `text-overflow: ellipsis` **y** conserva su
  texto completo accesible (el `title` o el nombre accesible, como hacen los
  carriles al colapsar). Un nombre cortado a la mitad se lee como OTRO nombre —
  por eso `TopBar` esconde el tenant entero antes que recortarlo.
- Lo que puede envolver, envuelve dentro de su caja (`min-width: 0` en el hijo
  flex que tiene que poder encogerse — es cosa del hijo, no de la fila).

> **Excepción legal:** los mismos overlays de la cláusula 1. Un tooltip mide lo
> que mide su frase (hasta su tope) y se dibuja sobre lo demás; no está
> «desbordando» su contenedor, no tiene uno.

## 3 · Linealidad — la fila comparte una línea, la grilla comparte alto

Extiende la regla 3 del README («las cifras que se comparan se alinean») de las
cifras a **todo**. Un elemento con más texto no se sale de la línea: **arrastra
a sus vecinos a la línea**, o se acorta (ver cláusula 4).

- **En una fila:** los elementos comparten una línea base o un tope común
  (`Row align="baseline"` para texto que empieza a distintas alturas,
  `align="center"` para controles). Nada queda «unos px más abajo» por tener una
  palabra más.
- **En una grilla:** los tiles/tarjetas comparten alto (`align-items: stretch`,
  el default de una grilla — no lo apagues sin motivo). Una tarjeta más alta no
  deja a sus vecinas flotando a media altura; todas llegan al mismo fondo.
- **Premiá el orden sobre el relleno.** Si dos rótulos van a quedar desparejos
  porque uno tiene una pista más larga, la respuesta no es estirar al corto: es
  acortar al largo (cláusula 4).

## 4 · Premiá lo escueto — la explicación va en un punto, no en un párrafo

El sistema premia al elemento que **dice poco**. Un rótulo escueto se alinea, se
compara y se escanea; un párrafo inline alarga su fila y la desparea contra las
demás.

- La explicación de un elemento va en un **`InfoDot`** (`ⓘ`/`?`) o un `Tooltip`,
  no en prosa al lado. En formularios, `Field` lo trae listo: `hintDot` colapsa
  la pista en un `ⓘ` pegado a la etiqueta y mantiene el `aria-describedby` del
  control. El campo queda corto; la ayuda vive a un gesto.
- Lo que una persona **necesita** leer para hacer el trabajo va en la pantalla
  (`Well`, un `subtitle`), nunca escondido en un tooltip — un tooltip no existe
  en una tableta, llega tarde en una máquina lenta, y en un lector de pantalla
  llega como ocurrencia. El `InfoDot` es para lo que ayuda, no para lo que hace
  falta.
- El cromo queda gris. Sólo el significado lleva color (regla 2). Un ícono suelto
  sin palabra, un texto de más «por las dudas», una segunda línea que repite el
  título: todo eso compite con lo único que debería tener una opinión en
  pantalla —&nbsp;el dato.

## 5 · Los carriles desprendidos llegan al fondo y conservan márgenes

Un carril de navegación (`Sidebar`, `SideRail`) es una **tarjeta flotante** que
**se estira a la altura de su columna** —llega al fondo, no se corta en el
aire— y conserva un margen parejo contra el borde y contra su vecino.

- El componente ya trae la mecánica: `align-self: stretch`, scroll interno para
  listas largas, y el toggle/pie fijo abajo. Lo que el shell tiene que dar es
  una **fila con altura** (`align-items: stretch`, y una altura de la que
  estirarse) y el **gutter** de la cláusula 1.
- Dos carriles juntos se distinguen por ancho y contenido —`Sidebar` colapsado a
  íconos (64px), `SideRail` con secciones (240px)— no por dibujarse leyes de
  separación distintas. Un carril de íconos angosto junto a uno ancho con
  etiquetas nunca se lee como el mismo control.

---

## Cómo se verifica

No hay runner de tests unitarios: esto es obra visual. Antes de dar una pantalla
por hecha, se mira en el **catálogo en vivo**, en los dos temas (claro/oscuro) y
en anchos angosto y ancho, y se corre `pnpm contrast` para no bajar del piso de
contraste del sistema. Una pantalla que rompe una de estas cinco cláusulas se ve
—ese es el punto de que sean sobre márgenes, desborde y alineación y no sobre
gustos.
