# Handoff: TaquillApp · Post 4 · Reel Mejores Comentarios (viernes 17 oct)

## Objetivo
Animar un Reel de Instagram/TikTok de **1080×1920, 9:16, 14 s, H.264, 30 fps y AAC**, con 3 escenas. **No lleva clips grabados**: todo es gráfico animado (fondos de color, textos y burbujas de comentarios) a partir del diseño de referencia.

Salida: `output/post4_reel_comentarios.mp4` y `output/portada.png` (fotograma de la escena 1).

## Archivos del paquete
- `diseno/Post4_Reel_Mejores_Comentarios.html`: diseño de referencia autocontenido. Las 3 escenas están apiladas en vertical, cada una de 1080×1920 px (`[data-screen-label]` 01, 02 y 03).
- `assets/taquillapp-logo-3a.png`: logo (solo va en la escena 3).
- `clips/audio.mp3` *(opcional, crear la carpeta)*: audio en tendencia. Si no existe, exporta sin audio y avísame.

## Enfoque recomendado
1. Con Playwright, abre el HTML y exporta en PNG de 1080×1920:
   - El **fondo** de cada escena (color base, degradados radiales y, en la 3, las ondas SVG), sin textos.
   - Cada **caja de texto, pill y burbuja** por separado, en su posición, sobre fondo transparente (`capas/esc01_pill.png`, `capas/esc02_burbuja1.png`, etc.). Conserva la rotación y la sombra.
2. Anima con ffmpeg (overlay + fade/translate) o con Remotion si es más limpio. Une las escenas con **cortes secos**.
3. Zona segura: el contenido va de x=70 a 1000 y de y=150 a 1780. En las escenas 1 y 3 el titular deja libre el borde derecho (230 px).

## Línea de tiempo

| # | Tiempo | Fondo | Contenido |
|---|---|---|---|
| 1 | 0.0–3.0 s | `#C81C7A` + degradados `#F20775` / `#EE5A3C` | pill «LO QUE NOS ESCRIBEN» · caja amarilla «mensajes reales» · caja blanca «de quienes ya usan TaquillApp» |
| 2 | 3.0–11.0 s | `#EE5A3C` + degradados `#F7931E` / `#F20775` / `#C81C7A` | pill «DM · INSTAGRAM» · caja oscura «ya lo probaron» · 4 burbujas de comentarios |
| 3 | 11.0–14.0 s | `#F7931E` + degradados + 3 ondas | pill «PRUÉBALO TÚ» · «link» · caja oscura «en bio» · logo en pill blanca |

Los textos son **finales**, incluidos los emojis: no los reescribas. Esta versión no lleva subtítulos en franja.

## Burbujas (escena 2), en orden de aparición
Todas: Plus Jakarta Sans 700, 46 px, interlineado 1.22, padding 30/38/34, radio 44 44 44 12, sombra `0 24px 60px rgba(60,0,30,.28)`.

| # | Entra | Texto | Fondo / texto | Posición (x, y, ancho) | Rotación |
|---|---|---|---|---|---|
| 1 | 4.0 s | ¿¿Dónde estuvieron todo este tiempo?? 🤩 | `#FFFFFF` / `#17141F` | 84, 600, 620 | -3° |
| 2 | 5.8 s | No sabía que canjear mis códigos sería tan fácil 😳 | `#FEB008` / `#17141F` | 330, 860, 660 | +2.5° |
| 3 | 7.6 s | Se nota cuando una plataforma está bien diseñada y pensada en el usuario 🤝 | `#FFFFFF` / `#17141F` | 70, 1130, 700 | -1.5° |
| 4 | 9.4 s | Al principio no creía… ¡Les escribo esto mientras espero mi película en la sala VIP! 🍿 | `#0D0F1C` / `#FFFFFF` | 280, 1450, 720 | +2° |

Las burbujas se quedan en pantalla: al final de la escena se ven las 4 juntas como collage.

## Estilos comunes
- Titulares: Plus Jakarta Sans 800, tracking -0.045 a -0.05em.
- Caja oscura: `rgba(13,15,28,.75)` (o `#0D0F1C` sólido en la escena 3), radio 28–32.
- Pill: borde de 3 px, radio 999, 28 px, peso 800, tracking .1em.
- Escena 1: caja amarilla `#FEB008` en 150 px `#17141F`, rotada -2°. Caja blanca en 72 px.
- Escena 3: «link» en 170 px `#17141F`. «en bio» en 170 px `#FEB008` sobre `#0D0F1C`. Logo de 300 px de ancho en una pill blanca en x=84, a 140 px del borde inferior.

## Animación
- **Cajas de titular y pills:** entran subiendo 40 px con fundido, 300 ms, ease-out (cubic-bezier .2,.8,.2,1), con 120 ms de desfase entre cajas. En la escena 1 el texto ya está en pantalla desde el frame 1.
- **Cajas rotadas:** rebote de escala 0.9 → 1.04 → 1, 350 ms.
- **Burbujas:** aparecen como un DM: escala de 0.6 a 1 desde la esquina inferior izquierda (el pico de la burbuja), con un rebote ligero, 400 ms. Si hay audio, sincroniza cada entrada con un beat cercano a los tiempos de la tabla (±0.3 s).
- **Escena 3:** el logo entra 300 ms después de «en bio».

## Revisión
Saca un fotograma en 1.5, 4.5, 8.0, 10.8 y 13.0 s y muéstramelos.
