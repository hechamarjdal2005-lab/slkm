const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('artifacts/orange', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  const base = process.env.SLKM_TEST_URL || 'http://127.0.0.1:3000';
  try {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of (width === 390 ? ['/', '/lignes', '/irsaliyat', '/services', '/about', '/blog', '/contact'] : ['/'])) {
        await page.goto(base + route, { waitUntil: 'load', timeout: 60000 });
        for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 650) {
          await page.evaluate(y => scrollTo(0, y), y);
          await page.waitForTimeout(120);
        }
        await page.waitForTimeout(700);
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(250);
        await page.screenshot({ path: `artifacts/orange/${route.slice(1) || 'home'}-${width}-full.png`, fullPage: true });
        const broken = await page.evaluate(() => [...document.querySelectorAll('main img:not(.leaflet-tile)')].filter(img => img.complete && !img.naturalWidth).map(img => img.getAttribute('src')));
        console.log(`${route} ${width}: broken content images ${broken.length}`, broken.length ? broken : '');
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
