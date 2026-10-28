// Renderiza el Reel cuadro por cuadro (PNG 1080×1920, 30 fps) en Chromium con las animaciones del README.
// Todo es función del tiempo: Web Animations pausadas y posicionadas en cada cuadro.
// Uso: node scripts/render_reel.js <carpeta_salida> [cuadro_inicial] [cuadro_final]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { HTML, CORTES, ESCENAS, ROTADAS } = require('./escenas');

const ROOT = path.resolve(__dirname, '..');
const FPS = 30;
const [OUT, DESDE = '0', HASTA = String(CORTES[CORTES.length - 1] * FPS)] = process.argv.slice(2);
const nombres = Object.keys(ESCENAS);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, HTML));
  await page.waitForSelector('[data-screen-label="03"]');
  await page.addStyleTag({ content: `[data-dc-tpl="5"]{padding:0!important;gap:0!important}` });

  await page.evaluate(({ ESCENAS, ROTADAS }) => {
    const EASE = 'cubic-bezier(.2,.8,.2,1)';
    const el = id => document.querySelector(`[data-dc-tpl="${id}"]`);
    window.__anims = {};
    // Titulares y pills: suben 40 px con fundido, 300 ms; las rotadas con rebote de escala, 350 ms
    const entrar = (anims, id, inicio) => {
      const e = el(id);
      anims.push(e.animate([{ opacity: 0, translate: '0 40px' }, { opacity: 1, translate: '0 0' }],
        { duration: 300, delay: inicio, easing: EASE, fill: 'both' }));
      if (ROTADAS.includes(id)) anims.push(e.animate([{ scale: 0.9 }, { scale: 1.04, offset: 0.6 }, { scale: 1 }],
        { duration: 350, delay: inicio, easing: 'ease-out', fill: 'both' }));
    };
    // Burbujas tipo DM: escala 0.6 → 1 desde el pico (esquina inferior izquierda), rebote ligero, 400 ms.
    // La rotación pasa a un contenedor idéntico para que el pivote del rebote no mueva la burbuja.
    const burbuja = (anims, id, inicio) => {
      const b = el(id), s = b.style;
      const w = document.createElement('div');
      w.style.cssText = `position:absolute;left:${s.left};top:${s.top};width:${s.width};transform:${s.transform}`;
      b.parentNode.insertBefore(w, b); w.appendChild(b);
      s.position = 'relative'; s.left = '0'; s.top = '0'; s.width = '100%'; s.transform = 'none';
      s.transformOrigin = '0 100%';
      anims.push(b.animate([
        { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.04, offset: 0.65 }, { opacity: 1, scale: 1 },
      ], { duration: 400, delay: inicio, easing: EASE, fill: 'both' }));
    };
    for (const [n, e] of Object.entries(ESCENAS)) {
      const anims = [];
      if (!e.sinEntrada) {
        (e.cajas || []).forEach((id, i) => entrar(anims, id, i * 120));
        for (const [id, t] of Object.entries(e.extra || {})) entrar(anims, id, t);
        for (const [id, t] of Object.entries(e.burbujas || {})) burbuja(anims, id, t);
      }
      anims.forEach(a => a.pause());
      window.__anims[n] = anims;
    }
  }, { ESCENAS, ROTADAS });
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
