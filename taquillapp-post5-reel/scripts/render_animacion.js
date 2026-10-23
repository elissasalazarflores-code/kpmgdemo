// Renderiza la capa animada del Reel cuadro por cuadro (PNG con alfa, 30 fps) en Chromium,
// usando Web Animations con las curvas exactas del README.
// Uso: node scripts/render_animacion.js <carpeta_salida> <cortes "0,2,6,9,12,15"> <clip4: 0|1>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { HTML, OCULTOS, ESCENAS, ROTADAS } = require('./escenas');

const ROOT = path.resolve(__dirname, '..');
const [OUT, CORTES = '0,2,6,9,12,15', CLIP4 = '0'] = process.argv.slice(2);
const cortes = CORTES.split(',').map(Number);
const FPS = 30;
const TOTAL = Math.round(cortes[cortes.length - 1] * FPS);
const nombres = Object.keys(ESCENAS);
const lista = x => [].concat(x);

// Escenas con clip: el fondo del diseño se oculta (queda transparente)
const conClip = { '01': true, '02': true, '03': true, '04': CLIP4 === '1', '05': false };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, HTML));
  await page.waitForSelector('[data-screen-label="05"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const fondosOcultos = nombres.filter(n => conClip[n]).flatMap(n => lista(ESCENAS[n].fondo));
  await page.addStyleTag({ content:
    [...OCULTOS, ...fondosOcultos].map(id => `[data-dc-tpl="${id}"]{display:none!important}`).join('') +
    `html,body,#dc-root,.sc-host{background:transparent!important}` +
    `[data-dc-tpl="5"]{padding:0!important;gap:0!important;background:transparent!important}` +
    nombres.filter(n => conClip[n]).map(n => `[data-screen-label="${n}"]{background:transparent!important}`).join('') });

  // Crea las animaciones (pausadas) de cada escena
  await page.evaluate(({ ESCENAS, ROTADAS }) => {
    const EASE = 'cubic-bezier(.2,.8,.2,1)';
    const el = id => document.querySelector(`[data-dc-tpl="${id}"]`);
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
      let fin = 0;
      e.cajas.forEach((id, i) => { fin = Math.max(fin, entrar(anims, id, i * 120)); });
      entrar(anims, e.subtitulo, fin + 200);
      for (const x of Object.values(e.extra || {})) entrar(anims, x.id, x.en * 1000);
      anims.forEach(a => a.pause());
      window.__anims[n] = anims;
    }
  }, { ESCENAS, ROTADAS });

  let actual = null;
  for (let f = 0; f < TOTAL; f++) {
    const t = f / FPS;
    let k = cortes.findIndex((c, i) => t >= c && t < cortes[i + 1]);
    if (k < 0) k = nombres.length - 1;
    const n = nombres[k];
    if (n !== actual) {
      await page.evaluate(n => document.querySelectorAll('[data-document-role="page"]').forEach(p =>
        p.style.setProperty('display', p.dataset.screenLabel === n ? 'block' : 'none', 'important')), n);
      actual = n;
    }
    await page.evaluate(({ n, ms }) => window.__anims[n].forEach(a => { a.currentTime = ms; }),
      { n, ms: (t - cortes[k]) * 1000 });
    await page.screenshot({ path: path.join(OUT, `${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  await browser.close();
  console.log(`${TOTAL} cuadros en ${OUT}`);
})();
