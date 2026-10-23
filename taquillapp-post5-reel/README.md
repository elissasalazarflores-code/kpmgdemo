# Handoff: TaquillApp · Post 5 · Reel Combos (sábado 17 oct)

## Objetivo
Editar un solo Reel de Instagram/TikTok: **1080×1920, 9:16, 15 s, H.264, 30 fps, AAC**, con 5 escenas seguidas. Combina los clips grabados con las capas de texto del diseño de referencia.

Salida: `output/post5_reel_combos.mp4`, más `output/portada.png` (fotograma de la escena 1 para usar como portada).

## Archivos del paquete
- `diseno/Post5_Reel_Combos.html`: diseño de referencia autocontenido (ábrelo en el navegador). Las 5 escenas están apiladas en vertical, cada una de 1080×1920 px. Es **referencia visual**, no el entregable.
- `assets/taquillapp-logo-3a.png`: logo (va solo en la escena 5).
- `clips/`: **crear esta carpeta** y poner aquí los videos:
  - `clips/01_mano_codigo.mp4`: mano mostrando el código en el celular frente a la dulcería.
  - `clips/02_canje_real.mp4`: canje real (muestran el código y entregan el combo).
  - `clips/03_combo.mp4`: combo recién entregado, primer plano de las palomitas.
  - `clips/04_palomitas.mp4` *(opcional)*: toma a cámara o B-roll de palomitas. Si no existe, la escena 4 usa el fondo de color del diseño.
  - `clips/audio.mp3` *(opcional)*: audio en tendencia. Si no existe, se usa el audio original bajado a 40%.

## Enfoque recomendado
1. Con Playwright, abre el HTML y captura cada escena (cada `[data-screen-label]`) como PNG de 1080×1920.
   - Escenas 1, 2 y 3 (y la 4 si hay clip): solo los textos, sobre **fondo transparente**. Oculta los degradados radiales y los recuadros punteados «VIDEO · …» (son marcadores de espacio). También oculta las notas de producción en 30 px al pie (escena 4).
   - Escena 5 (y la 4 si no hay clip): la escena completa con fondo, **sin** notas de producción.
   - Exporta cada caja de texto también como PNG separado (`capas/esc01_caja1.png`, etc.) para poder animar las entradas.
2. Con ffmpeg, escala y recorta cada clip a 9:16 (`scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`), recórtalo a la duración de su escena y ponle la capa de texto encima.
3. Une las escenas con **cortes secos** (sin transiciones) y agrega el audio.
4. Revisa que el texto no quede detrás de la interfaz de Instagram: el texto ocupa x=84 a 850 (borde derecho libre, de 230 px, para los botones) y y=280 a 1400.

Alternativa: Remotion, si se prefiere animar en código.

## Línea de tiempo

| # | Tiempo | Fondo | Texto en pantalla | Subtítulo |
|---|---|---|---|---|
| 1 | 0.0–2.0 s | `01_mano_codigo.mp4` | pill «DATO QUE POCOS SABEN» · «también sirve» · «para palomitas» | «Sí, también sirve para las palomitas.» |
| 2 | 2.0–6.0 s | `02_canje_real.mp4` | «canje en» · «dulcería» | «Los combos se canjean en dulcería con tu código.» |
| 3 | 6.0–9.0 s | `03_combo.mp4` | «+50% off» · «en combos» | «Combos con más de 50% de descuento.» |
| 4 | 9.0–12.0 s | `04_palomitas.mp4` o el fondo de color | pill «RESPONDE EN COMENTARIOS» · «¿dulces o saladas?» · tarjetas «dulces» / «saladas» | «¿Palomitas dulces o saladas? Dime en comentarios.» |
| 5 | 12.0–15.0 s | fondo de color + ondas | «boleto + combo» · «link» · «en bio» · logo | «Arma tu plan completo. Link en la bio.» |

Los textos son **finales**: no los reescribas.

## Detalle por escena
Medidas en px sobre el lienzo de 1080×1920. Bloque de titular en x=84, y=280; ancho máximo hasta x=850. Subtítulo en x=84, y=1250.

**Estilos comunes**
- Caja oscura: `rgba(13,15,28,.75)` (o `#0D0F1C` sólido), radio 32, padding 20/36/28.
- Caja blanca: `#FFFFFF`, radio 32.
- Titulares: Plus Jakarta Sans 800, tracking -0.05em, interlineado .9–.95.
- Subtítulo: caja `rgba(13,15,28,.8)`, radio 16, padding 16/26, 40 px, peso 700, blanco, interlineado 1.3.
- Pill: borde de 3 px, radio 999, 28 px, peso 800, tracking .1em.

**1 · Hook:** pill blanca. Caja oscura «también sirve» en 120 px blanco. Caja blanca «para palomitas» en 120 px `#17141F`, rotada -2°.
**2 · Canje:** caja `#0D0F1C` «canje en» en 130 px blanco. Caja blanca «dulcería» en 130 px `#EE5A3C`.
**3 · Combo:** caja `#FEB008` «+50% off» en 140 px `#17141F`, rotada -2°. Caja `#0D0F1C` «en combos» en 96 px blanco.
**4 · Pregunta:** fondo `#F20775` con degradados de `#EE5A3C` y `#C81C7A`. «¿dulces / o saladas?» en 150 px blanco. En y=900, dos tarjetas en grid de 2 columnas con gap 20: «dulces» (fondo blanco, texto `#C81C7A`, 64 px, rotada -2°) y «saladas» (fondo `#0D0F1C`, texto `#FEB008`, rotada +2°).
**5 · CTA:** fondo `#EE5A3C` con degradados de `#F20775` y `#F7931E`, y 3 ondas abajo (el SVG está en el HTML). Caja blanca «boleto + combo» en 60 px. «link» en 170 px `#17141F`. Caja `#0D0F1C` «en bio» en 170 px `#FEB008`. Logo en pill blanca en x=84, bottom 140, de 300 px de ancho.

## Animación
- **Cajas del titular:** cada una entra subiendo 40 px y apareciendo, 300 ms, ease-out (cubic-bezier .2,.8,.2,1), con 120 ms de desfase entre cajas. Empiezan en el frame 0 de cada escena: en la escena 1 el texto **ya está en pantalla desde el frame 1** (sin espera).
- **Cajas rotadas:** entran con un pequeño rebote de escala (0.9 → 1.04 → 1), 350 ms.
- **Subtítulo:** aparece 200 ms después de la última caja y se queda hasta el corte.
- **Escena 4:** las tarjetas «dulces» y «saladas» entran al beat, una tras otra (9.6 s y 10.2 s).
- **Escena 5:** el logo aparece a los 12.8 s. Sin animación de salida: el video termina en seco para que el loop se sienta natural.
- **Cortes:** secos, en los tiempos de la tabla. Si hay `audio.mp3`, ajusta los cortes al beat más cercano (±150 ms) sin cambiar el orden.

## Tokens
- Coral `#EE5A3C` · Naranja `#F7931E` · Amarillo `#FEB008` · Magenta `#C81C7A` · Rosa `#F20775`
- Navy `#0D0F1C` · Tinta `#17141F` · Blanco `#FFFFFF`
- Tipografía: **Plus Jakarta Sans** (Google Fonts), pesos 600/700/800. Instálala antes de renderizar.

## Pendientes
- Los clips en `clips/`.
- El audio en tendencia de esa semana (opcional).
- El link de la bio con UTM (se configura en Instagram, no en el video).
