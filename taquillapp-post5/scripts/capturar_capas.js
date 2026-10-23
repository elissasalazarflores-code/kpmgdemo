// Captura cada frame de diseno/Post5_Stories_Combos.html a 1080×1920 en capas/.
// Frames 1 y 3: solo textos con fondo transparente (capa completa + una capa por caja para la animación).
// Frames 4, 5 y 6: frame completo con fondo, sin los recuadros punteados de sticker.
const { chromium } = require('playwright');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML = 'file://' + path.join(ROOT, 'diseno/Post5_Stories_Combos.html');
const OUT = path.join(ROOT, 'capas');

// Ids data-dc-tpl del HTML
const TEXTO = {
  '01': { fondo: ['7', '8'], capas: { caja1: '12', caja2: '13', subtitulo: '15' } },
  '03': { fondo: ['22', '23'], capas: { caja1: '27', caja2: '28', subtitulo: '30' } },
};
const COMPLETO = { '04': ['37'], '05': ['51'], '06': ['60'] };

const sel = id => `[data-dc-tpl="${id}"]`;
const frame = n => `[data-document-role="page"][data-screen-label="${n}"]`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await page.goto(HTML);
  await page.waitForSelector(frame('06'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const css = async rules => page.addStyleTag({ content: rules });

  for (const [n, ids] of Object.entries(COMPLETO)) {
    const tag = await css(ids.map(id => `${sel(id)}{visibility:hidden!important}`).join(''));
    await page.locator(frame(n)).screenshot({ path: path.join(OUT, `${n}.png`) });
    await tag.evaluate(t => t.remove());
    console.log(`capas/${n}.png`);
  }

  // Fondo transparente para las capas de texto
  await css(`html,body,#dc-root,.sc-host,[data-dc-tpl="5"]{background:transparent!important}`);
  for (const [n, { fondo, capas }] of Object.entries(TEXTO)) {
    const base = await css(
      `${frame(n)}{background:transparent!important}` +
      fondo.map(id => `${sel(id)}{display:none!important}`).join('')
    );
    const shoot = async nombre => {
      await page.locator(frame(n)).screenshot({ path: path.join(OUT, `${n}_${nombre}.png`), omitBackground: true });
      console.log(`capas/${n}_${nombre}.png`);
    };
    await shoot('texto');
    for (const [nombre, id] of Object.entries(capas)) {
      const otros = Object.values(capas).filter(x => x !== id);
      const tag = await css(otros.map(o => `${sel(o)}{visibility:hidden!important}`).join(''));
      await shoot(nombre);
      await tag.evaluate(t => t.remove());
    }
    await base.evaluate(t => t.remove());
  }
  await browser.close();
})();
