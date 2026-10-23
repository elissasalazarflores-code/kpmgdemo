# Handoff: TaquillApp · Post 5 · Stories Combos (sábado 17 oct)

## Objetivo
Producir los archivos finales de 6 Instagram Stories (1080×1920, 9:16) a partir del diseño de referencia y los clips grabados:
- **Frames 1, 2, 3** → video MP4 (texto encima del clip real).
- **Frames 4, 5, 6** → imagen PNG fija (los stickers se agregan en Instagram al publicar).

Formato de salida: `output/01.mp4`, `02.mp4`, `03.mp4`, `04.png`, `05.png`, `06.png`. Cada Story se sube por separado.

## Archivos del paquete
- `diseno/Post5_Stories_Combos.html`: diseño de referencia autocontenido (ábrelo en el navegador). Es **referencia visual**, no el entregable. Los 6 frames están apilados verticalmente, cada uno de 1080×1920 px.
- `assets/taquillapp-logo-3a.png`: logo (va solo en el frame 5).
- `clips/`: **crear esta carpeta** y poner aquí los videos y fotos grabados con estos nombres:
  - `clips/01_mano_codigo.mp4`: mano mostrando el código en el celular frente a la dulcería.
  - `clips/02_canje_real.mp4`: canje real en dulcería (muestran código, entregan combo).
  - `clips/03_combo.jpg` (o `.mp4`): foto o clip del combo recién entregado.

## Enfoque recomendado
1. Renderizar cada frame del HTML como capa de texto con **fondo transparente** (PNG 1080×1920): oculta los fondos degradados y los recuadros punteados de "VIDEO · …" / "FOTO · …" (son solo marcadores de espacio).
2. Componer con **ffmpeg**: clip escalado y recortado a 1080×1920 (`scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`) y la capa de texto encima.
3. Frames 4–6: exportar el frame completo tal cual (con fondo) a PNG, pero **sin** los recuadros punteados de sticker (en Instagram se pone el sticker nativo en esa posición).

Alternativa: Remotion si se quieren animaciones de entrada (ver "Animación").

## Frames

Medidas en px sobre lienzo 1080×1920. Zona segura de texto: **y=250 a y=1600**. Margen lateral: 84 px.

### Frame 1 · «También sirve para palomitas» (VIDEO)
- Fondo: `clips/01_mano_codigo.mp4`, duración 5–7 s, sin audio original o bajo.
- Bloque de titular en x=84, y=280, columna, gap 20:
  - Caja 1: fondo `rgba(13,15,28,.75)`, radio 32, padding 20/36/28. Texto «también sirve», 120 px, peso 800, interlineado .95, tracking -0.05em, blanco.
  - Caja 2: fondo `#FFFFFF`, igual, texto «para palomitas» en `#17141F`, **rotada -2°**.
- Subtítulo en x=84, y=1380: caja `rgba(13,15,28,.8)`, radio 16, padding 16/26. Texto «Sí, también sirve para las palomitas.», 40 px, peso 700, interlineado 1.3, blanco.

### Frame 2 · Canje real (VIDEO, sin texto)
- Solo `clips/02_canje_real.mp4`, sin retoque y **sin texto encima**. Duración: la del clip (máx 15 s).

### Frame 3 · «Canje en dulcería» (FOTO o VIDEO)
- Fondo: `clips/03_combo`. Si es foto, 5 s con un zoom lento (1.00→1.06).
- Titular en x=84, y=280, gap 20:
  - Caja `#0D0F1C`, radio 32, padding 20/36/28: «canje en», 130 px, peso 800, blanco.
  - Caja `#FFFFFF`: «dulcería», 130 px, peso 800, `#EE5A3C`.
- Subtítulo en y=1380 (mismo estilo que el frame 1): «Los combos se canjean en dulcería con tu código.»

### Frame 4 · Encuesta (PNG)
- Fondo `#F20775` con degradados radiales: `#EE5A3C` arriba a la derecha y `#C81C7A` abajo a la izquierda (copiar del HTML).
- Pill «VOTA» en x=84, y=280: borde 3 px blanco, radio 999, 28 px, peso 800, tracking .1em.
- Titular «¿dulces / o saladas?», 150 px, peso 800, interlineado .9, blanco.
- Espacio para el sticker de encuesta: x=140–940, y=900–1260 (no dibujar en el PNG final).
- En Instagram: sticker Encuesta «¿Palomitas dulces o saladas?» con las opciones Dulces / Saladas.

### Frame 5 · Enlace (PNG)
- Fondo `#EE5A3C` con degradados radiales de `#F20775` y `#F7931E`. Abajo, 3 ondas (`#F7931E` al 85%, `#F20775` al 85%, `#C81C7A`); el SVG está en el HTML.
- Titular en x=84, y=280:
  - Caja `rgba(13,15,28,.75)`: «combos», 150 px, peso 800.
  - Caja `#FEB008`: «+50% off», 140 px, peso 800, `#17141F`, rotada -2°.
  - Línea: «Combos con más de 50% de descuento.», 44 px, peso 700, blanco.
- Espacio para el sticker de enlace: x=190–890, y=1020–1170 (no dibujar).
- Logo: pill blanca en x=84, bottom 140, padding 20/32, sombra `0 20px 50px rgba(80,0,40,.25)`, logo de 280 px de ancho.
- En Instagram: sticker Enlace con la URL con UTM (pendiente).

### Frame 6 · «Tu combo favorito» (PNG, extra)
- Fondo `#C81C7A` con degradados radiales de `#F7931E` y `#F20775`.
- Pill «TU TURNO» y el titular «tu combo / favorito», 140 px, peso 800, blanco.
- Espacio para el sticker «Añade el tuyo»: x=140–940, y=900–1280.
- En Instagram: sticker «Añade el tuyo» con el texto «Tu combo de cine favorito 🍿».

## Animación (opcional, solo en los MP4)
- Las cajas del titular entran una tras otra: desplazamiento de 40 px hacia arriba con fundido, 350 ms, ease-out, 120 ms de desfase entre cajas.
- El subtítulo entra 300 ms después del titular y se queda hasta el final.
- Sin animación de salida: Instagram corta solo.

## Tokens
- Coral `#EE5A3C` · Naranja `#F7931E` · Amarillo `#FEB008` · Magenta `#C81C7A` · Rosa `#F20775`
- Navy `#0D0F1C` · Tinta `#17141F` · Blanco `#FFFFFF`
- Tipografía: **Plus Jakarta Sans** (Google Fonts), pesos 600/700/800. Instalarla localmente antes de renderizar.
- Radios: cajas 32, subtítulos 16, pills 999.

## Pendientes antes de renderizar
- Los 3 clips o fotos en `clips/`.
- La URL con UTM para el sticker de enlace (va en Instagram, no en el render).

## Prompt sugerido para Claude Code
> Lee README.md. Con ffmpeg, genera `output/01.mp4`, `02.mp4` y `03.mp4` (1080×1920, H.264, 30 fps) componiendo los clips de `clips/` con las capas de texto del frame correspondiente de `diseno/Post5_Stories_Combos.html` sobre fondo transparente. Exporta `04.png`, `05.png` y `06.png` sin los recuadros punteados de sticker.
