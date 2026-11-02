# Jose Eduardo · Mi escritorio creativo

Portafolio personal en español con una interfaz inspirada en los escritorios clásicos. Incluye proyectos web, diseño social y el CV de Jose Eduardo Berrospi Huaman.

## Qué incluye

- Ventanas con arrastre, movimiento por teclado, minimizar, maximizar y cerrar.
- Menú Inicio, barra de tareas y reloj de Bogotá.
- Siete proyectos web con filtros por GitHub y Netlify.
- Tres colecciones de diseño social: un post y dos carruseles, nueve imágenes en total, con visor y descargas.
- CV actualizado en PDF para abrir o descargar.
- Diseño adaptable a móvil y opción para pausar las animaciones.

Las muestras de redes sociales son propuestas conceptuales generadas con IA. No representan campañas encargadas por las marcas. El reproductor abre Feka Music; no inicia audio automáticamente.

## Desarrollo

No requiere instalar dependencias. Con Node.js 22 o posterior:

```sh
npm run build
npm start
```

Abre la URL local que muestra la terminal.

## Editar

- `build-retro.cjs`: estructura y contenido del escritorio.
- `projects.json`: proyectos web.
- `social-projects.json` y `social-gallery.cjs`: colecciones y visor de diseño social.
- `dist/retro.css`, `dist/desktop.js` y `dist/social.js`: estilos e interacciones.
- `dist/assets/`: CV y archivos descargables. Los WebP optimizan la visualización; las descargas conservan los PNG originales.

El sitio no recopila formularios ni requiere un backend. Solo guarda localmente la preferencia de animaciones.

## Netlify

Importa este repositorio. `netlify.toml` configura el comando de construcción y la publicación de `dist/`. Las futuras actualizaciones de la rama principal pueden desplegarse desde Git.

## Contacto

[jeduardo.berrospi@gmail.com](mailto:jeduardo.berrospi@gmail.com)

El código y los recursos se muestran como portafolio. No se concede una licencia de reutilización por publicarlos; los nombres de las marcas corresponden a sus titulares.
