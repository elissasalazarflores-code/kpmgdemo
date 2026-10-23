// Renderiza el Reel 100% animado cuadro por cuadro (PNG 1080×1920, 30 fps) en Chromium:
// el diseño completo de cada escena + las animaciones de texto del README + los elementos de
// scripts/elementos.js. Todo es función del tiempo (Web Animations pausadas y posicionadas por cuadro).
// Uso: node scripts/render_reel.js <carpeta_salida> [cuadro_inicial] [cuadro_final]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { HTML, OCULTOS, ESCENAS, ROTADAS } = require('./escenas');
const ELEMENTOS = require('./elementos');

const ROOT = path.resolve(__dirname, '..');
const CORTES = [0, 2, 6, 9, 12, 15];
const FPS = 30;
const [OUT, DESDE = '0', HASTA = String(CORTES[5] * FPS)] = process.argv.slice(2);
const nombres = Object.keys(ESCENAS);
// En la escena 4 los elementos van encima de las tarjetas; en el resto, debajo del texto
const ENCIMA = { '04': true };
// README: en la escena 1 el texto ya está en pantalla desde el frame 1 (sin entrada)
const SIN_ENTRADA = { '01': true };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, HTML));
  await page.waitForSelector('[data-screen-label="05"]');
  await page.addStyleTag({ content:
    OCULTOS.map(id => `[data-dc-tpl="${id}"]{display:none!important}`).join('') +
    `[data-dc-tpl="5"]{padding:0!important;gap:0!important}` +
    `.fx{position:absolute;inset:0;pointer-events:none}` +
    `.fx>div{position:absolute;line-height:1}` +
    `.fx .em{font-family:"Noto Color Emoji";line-height:1;display:block}` });

  await page.evaluate(({ ESCENAS, ROTADAS, ELEMENTOS, ENCIMA, SIN_ENTRADA }) => {
    const EASE = 'cubic-bezier(.2,.8,.2,1)';
    const el = id => document.querySelector(`[data-dc-tpl="${id}"]`);
    const logo = el('64').src;
    window.__anims = {};
    const entrar = (anims, id, inicio) => {
      const e = el(id);
      anims.push(e.animate([{ opacity: 0, translate: '0 40px' }, { opacity: 1, translate: '0 0' }],
        { duration: 300, delay: inicio, easing: EASE, fill: 'both' }));
      if (ROTADAS.includes(id)) {
        anims.push(e.animate([{ scale: 0.9 }, { scale: 1.04, offset: 0.6 }, { scale: 1 }],
          { duration: 350, delay: inicio, easing: 'ease-out', fill: 'both' }));
        return inicio + 350;
      }
      return inicio + 300;
    };
    for (const [n, e] of Object.entries(ESCENAS)) {
      const anims = [];
      // Capa de elementos
      const escena = document.querySelector(`[data-screen-label="${n}"]`);
      const fx = document.createElement('div');
      fx.className = 'fx';
      if (ENCIMA[n]) escena.appendChild(fx); else escena.insertBefore(fx, el(e.cajas[0]).parentElement);
      for (const f of ELEMENTOS[n]) {
        const pos = document.createElement('div');
        pos.style.cssText = `left:${f.x}px;top:${f.y}px;rotate:${f.rot || 0}deg`;
        const inner = document.createElement('div');
        if (f.e === 'boleto') {
          // Ícono del boleto recortado del logo de TaquillApp (2133×441; el ícono ocupa ~20.5% del ancho)
          const w = f.size, h = Math.round(w * 441 / 437);
          inner.style.cssText = `width:${w}px;height:${h}px;background:url(${logo}) left center/auto ${h}px no-repeat;` +
            `filter:drop-shadow(0 18px 30px rgba(80,0,40,.35))`;
        } else {
          inner.className = 'em';
          inner.textContent = f.e;
          inner.style.fontSize = f.size + 'px';
          inner.style.filter = 'drop-shadow(0 16px 26px rgba(60,0,30,.28))';
        }
        pos.appendChild(inner); fx.appendChild(pos);
        for (const [nivel, kf, op] of f.anims || []) anims.push((nivel ? inner : pos).animate(kf, { fill: 'both', ...op }));
      }
      // Textos (README: 300 ms, 120 ms de desfase, subtítulo 200 ms después de la última caja)
      if (SIN_ENTRADA[n]) { anims.forEach(a => a.pause()); window.__anims[n] = anims; continue; }
      let fin = 0;
      e.cajas.forEach((id, i) => { fin = Math.max(fin, entrar(anims, id, i * 120)); });
      entrar(anims, e.subtitulo, fin + 200);
      for (const x of Object.values(e.extra || {})) entrar(anims, x.id, x.en * 1000);
      anims.forEach(a => a.pause());
      window.__anims[n] = anims;
    }
  }, { ESCENAS, ROTADAS, ELEMENTOS, ENCIMA, SIN_ENTRADA });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  let actual = null;
  for (let f = Number(DESDE); f < Number(HASTA); f++) {
    const t = f / FPS;
    let k = CORTES.findIndex((c, i) => t >= c && t < CORTES[i + 1]);
    if (k < 0) k = nombres.length - 1;
    const n = nombres[k];
    if (n !== actual) {
      await page.evaluate(n => document.querySelectorAll('[data-document-role="page"]').forEach(p =>
        p.style.setProperty('display', p.dataset.screenLabel === n ? 'block' : 'none', 'important')), n);
      actual = n;
    }
    await page.evaluate(({ n, ms }) => window.__anims[n].forEach(a => { a.currentTime = ms; }),
      { n, ms: (t - CORTES[k]) * 1000 });
    await page.screenshot({ path: path.join(OUT, `${String(f).padStart(4, '0')}.png`) });
  }
  await browser.close();
  console.log(`cuadros ${DESDE}–${Number(HASTA) - 1} en ${OUT}`);
})();
