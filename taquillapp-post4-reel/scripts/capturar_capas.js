// Exporta a capas/ (1080×1920): escNN_fondo.png (fondo sin textos) y cada pill, caja, burbuja y logo
// como PNG transparente en su posición, con rotación y sombra; más escNN_completa.png de referencia.
const { chromium } = require('playwright');
const path = require('path');
const { HTML, ESCENAS } = require('./escenas');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'capas');
const sel = id => `[data-dc-tpl="${id}"]`;
const frame = n => `[data-document-role="page"][data-screen-label="${n}"]`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, HTML));
  await page.waitForSelector(frame('03'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const css = rules => page.addStyleTag({ content: rules });
  const quitar = tag => tag.evaluate(t => t.remove());
  await css(`html,body,#dc-root,.sc-host,[data-dc-tpl="5"]{background:transparent!important}`);

  for (const [n, e] of Object.entries(ESCENAS)) {
    const shoot = async (nombre, transparente) => {
      await page.locator(frame(n)).screenshot({ path: path.join(OUT, `esc${n}_${nombre}.png`), omitBackground: transparente });
      console.log(`capas/esc${n}_${nombre}.png`);
    };
    const ids = Object.values(e.piezas);
    await shoot('completa', false);
    let t = await css(ids.map(id => `${sel(id)}{visibility:hidden!important}`).join(''));
    await shoot('fondo', false);
    await quitar(t);
    const sinFondo = await css(`${frame(n)}{background:transparent!important}` +
      e.fondo.map(id => `${sel(id)}{display:none!important}`).join(''));
    for (const [nombre, id] of Object.entries(e.piezas)) {
      t = await css(ids.filter(x => x !== id).map(o => `${sel(o)}{visibility:hidden!important}`).join(''));
      await shoot(nombre, true);
      await quitar(t);
    }
    await quitar(sinFondo);
  }
  await browser.close();
})();
