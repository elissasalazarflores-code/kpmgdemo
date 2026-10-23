// Exporta las capas estáticas de cada escena a capas/ (1080×1920):
//  escNN_texto.png      todos los textos sobre fondo transparente
//  escNN_cajaK.png ...  cada caja por separado (transparente)
//  escNN_fondo.png      fondo de la escena sin textos (escenas 4 y 5)
//  escNN_completa.png   escena completa con fondo (escenas 4 y 5)
const { chromium } = require('playwright');
const path = require('path');
const { HTML, OCULTOS, ESCENAS } = require('./escenas');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'capas');
const sel = id => `[data-dc-tpl="${id}"]`;
const frame = n => `[data-document-role="page"][data-screen-label="${n}"]`;
const lista = x => [].concat(x);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, HTML));
  await page.waitForSelector(frame('05'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const css = rules => page.addStyleTag({ content: rules });
  const quitar = tag => tag.evaluate(t => t.remove());

  await css(OCULTOS.map(id => `${sel(id)}{display:none!important}`).join('') +
    `html,body,#dc-root,.sc-host,[data-dc-tpl="5"]{background:transparent!important}`);

  for (const [n, e] of Object.entries(ESCENAS)) {
    const piezas = { ...Object.fromEntries(e.cajas.map((id, i) => [`caja${i + 1}`, id])), subtitulo: e.subtitulo };
    for (const [k, v] of Object.entries(e.extra || {})) piezas[k] = v.id;
    const shoot = async (nombre, transparente) => {
      await page.locator(frame(n)).screenshot({ path: path.join(OUT, `esc${n}_${nombre}.png`), omitBackground: transparente });
      console.log(`capas/esc${n}_${nombre}.png`);
    };

    if (n === '04' || n === '05') {
      await shoot('completa', false);
      const t = await css(Object.values(piezas).map(id => `${sel(id)}{visibility:hidden!important}`).join(''));
      await shoot('fondo', false);
      await quitar(t);
    }

    const sinFondo = await css(`${frame(n)}{background:transparent!important}` +
      lista(e.fondo).map(id => `${sel(id)}{display:none!important}`).join(''));
    await shoot('texto', true);
    for (const [nombre, id] of Object.entries(piezas)) {
      const t = await css(Object.values(piezas).filter(x => x !== id).map(o => `${sel(o)}{visibility:hidden!important}`).join(''));
      await shoot(nombre, true);
      await quitar(t);
    }
    await quitar(sinFondo);
  }
  await browser.close();
})();
