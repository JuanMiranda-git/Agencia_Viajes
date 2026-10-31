# Supuestos del sitio — Tours Out Here

Documento de decisiones tomadas durante la construcción del sitio estático.
Todo lo que no estaba definido en el contexto se resolvió aquí para no detener
el trabajo.

## 1. Alcance y stack

- El sitio es una **maqueta visual estática**: no hay backend, API, base de
  datos, correo, pagos ni servicios externos. Ningún formulario envía datos.
- **Cero JavaScript**: no existen etiquetas `<script>`, archivos `.js`,
  manejadores inline ni librerías. Toda la interacción se resuelve con HTML y
  CSS (`<details>`, `:target`, `:has()`, checkbox/radio, `scroll-snap`).
- No hay build, preprocesador, framework ni gestor de paquetes en el frontend.
  El navegador resuelve los `@import` de `css/main.css`.
- El sitio se sirve como archivos estáticos. Abrir `index.html` con `file://`
  funciona, aunque se recomienda un servidor local (`python3 -m http.server`)
  para que las rutas y las fuentes se comporten igual que en producción.

## 2. Marca y contenido

- El contexto del repositorio usa dos marcas: **TourManager** (producto
  administrativo) y **Tours Out Here** (sitio del cliente). Se mantiene
  **Tours Out Here** para el sitio público, tal como indica `AGENTS.md`.
- El nombre legal completo de la agencia aparece como “por definir” en el
  contexto. Se usa **Tours Out Here** como nombre comercial y no se inventa
  una razón social.
- La agencia se ubica en **Sabaneta, Antioquia**, constituida el **16 de
  octubre de 2017**. Las cifras de trayectoria (“9 años”) se calculan desde
  esa fecha.
- El texto del sitio está en **español**. Se usa un tono cercano, profesional
  y sin superlativos vacíos.
- **Todos los datos son ficticios y de demostración**: destinos, precios,
  duraciones, salidas, disponibilidad, testimonios, nombres, cifras,
  dirección, teléfono, correo y horarios. El sitio lo declara en el pie, en
  las notas de catálogo y en el aviso del formulario.

## 3. Destinos y precios

- Se usan únicamente los destinos con imagen local disponible: **Cartagena,
  París, Kyoto, Roma, Berlín, Delhi y Río de Janeiro**.
- Los precios están en **pesos colombianos (COP)**, sin decimales, con
  separador de miles por punto (`$1.890.000`), y se presentan **por persona
  en acomodación doble**.
- Los valores de los paquetes son orientativos y no incluyen impuestos ni
  cargos no especificados. No hay conversión de moneda ni tarifas por
  temporada.
- “12 destinos curados” y “+1.200 viajeros” son cifras de demostración para
  mostrar la estructura de la sección de datos; no son reportes reales.

## 4. Imágenes

- Todas las imágenes son **locales**. No se hotlinkea nada externo.
- Los originales viven en `FRONTEND/img/`. Para el sitio se generaron copias
  optimizadas (JPEG progresivo, lado máximo 1400 px, calidad 82) en
  `FRONTEND/img/optimizadas/`, que son las que referencian las páginas. Solo
  se conservan allí las imágenes realmente usadas; los avatares de
  testimonios son recortes de 160 × 160 px.
- Los originales se conservan sin modificar para no perder calidad de edición.
- No se usaron imágenes de personas que no estuvieran ya en `img/`. Los
  retratos se usan como imágenes de ambiente y testimonios ficticios.
- El logo y el favicon son SVG generados localmente con los colores de la
  marca; no se dispone de un logotipo oficial en el repositorio.
- Las imágenes decorativas (fondo del hero, velo) llevan `alt=""`; las
  imágenes con contenido llevan texto alternativo descriptivo.
- `Hero.jpeg` trae texto incrustado (“¿Listo para el viaje?”), así que no se
  usa como fondo del hero: se eligió `rioBrasil.jpg` (Cristo Redentor) para
  evitar duplicar mensajes. El archivo original se conserva.
- Los avatares de los testimonios son recortes cuadrados de 160 × 160 px de
  los retratos locales (`avatar-*.jpg`) y llevan `alt=""` porque el nombre
  visible al lado ya identifica a la persona.
- El mapa de la página de contacto es una **ilustración CSS** (rejilla y pin),
  no un mapa real ni un servicio de mapas. Lleva `role="img"` y etiqueta.

## 5. Formularios

- El formulario de contacto usa `action="#"` y `method="get"`: al enviarlo no
  se transmite nada a ningún servidor.
- Los campos obligatorios se marcan con `*` y `required`, pero la validación
  real depende del navegador. No hay validación de servidor.
- El texto de consentimiento es informativo; no existe política de datos
  publicada ni tratamiento real de información.
- El correo `hola@toursouthere.demo`, el teléfono `+57 300 000 0000` y la
  dirección `Calle 10 # 45-20` son datos de ejemplo. El dominio `.demo` es
  intencionalmente no resoluble.

## 6. Navegación y arquitectura

- Las páginas finales viven en `FRONTEND/html/05-paginas/`. Por eso el CSS y
  las imágenes se referencian con `../../` y las páginas entre sí con `./`.
- `FRONTEND/index.html` es una **página de entrada** que redirige con
  `<meta http-equiv="refresh">` (sin JavaScript) y ofrece un enlace manual.
- El encabezado y el pie se **duplican literalmente** en cada página porque no
  hay includes; cada bloque lleva un comentario `<!-- ORGANISM: ... -->`.
- La guía de estilo se publica como cuatro páginas navegables
  (`01-atomos`, `02-moleculas`, `03-organismos`, `04-plantillas`) enlazadas
  desde el pie del sitio.
- Los enlaces del pie a “Guía de estilo” apuntan a `01-atomos/atoms.html`.
- Se añadió un enlace “Saltar al contenido” como primer elemento enfocable.
- Los filtros de destinos y paquetes usan `:has()` sobre radios. En
  navegadores sin soporte de `:has()` no se oculta nada: el catálogo completo
  sigue visible y usable.
- Los detalles de destino usan `:target` con `#modal-<destino>`. Cerrar
  devuelve a `#lista-destinos`. El diálogo no atrapa el foco porque eso
  requiere JavaScript; por eso no se declara `aria-modal="true"` y el fondo
  sigue siendo navegable con teclado.
- Los iconos son SVG en línea escritos a mano, sin fuente de iconos ni
  librería. Siempre van con `aria-hidden="true"` cuando acompañan texto y
  llevan etiqueta accesible cuando son la única información.

## 7. Diseño y accesibilidad

- Los colores, tipografías, espaciados y radios provienen de
  `css/desingSystem.css` (Midnight & Gold). Ninguna otra hoja define valores
  crudos nuevos; las capas superiores consumen variables.
- `css/desingSystem.css` se mantiene con su nombre original (con la errata
  “desing”) porque es el archivo canónico del repositorio.
- Se conservan las clases existentes del sistema (`.boton`, `.tarjeta`,
  `.campo`, `.insignia`, `.seccion--oscura`) y se añaden clases propias del
  sitio con prefijos `a-`, `m-`, `o-`, `t-`, `p-`.
- Los objetivos táctiles tienen un mínimo de 44 px. El foco visible no se
  elimina en ningún elemento.
- El contraste busca WCAG AA: el dorado puro no se usa como texto sobre
  fondos claros; para texto se usa `--color-acento-texto` (oliva).
- La tipografía decorativa se reserva para títulos; el cuerpo usa la familia
  de lectura definida en el sistema.
- El sitio se probó mentalmente a 360 px y usa rejillas `auto-fit` con
  `minmax(min(100%, …), 1fr)` para evitar desbordes horizontales.

## 8. Contenido que no se inventó

- No se inventaron rutas, horarios de salida ni códigos de reserva.
- No se describen proveedores reales, alianzas, certificaciones ni premios.
- No se afirma disponibilidad en tiempo real ni atención 24/7.
- Las preguntas frecuentes describen el funcionamiento del sitio de
  demostración, no condiciones contractuales reales.

## 9. Pendientes conscientes

- No hay página de detalle por destino independiente: el detalle se abre en
  un modal accesible por `:target`, para mantener el sitio en cinco páginas.
- No hay versión en inglés ni selector de idioma.
- No hay blog, buscador funcional ni área de cliente.
- No se incluyó un aviso legal ni una política de privacidad reales; el texto
  del formulario es solo una muestra visual.
