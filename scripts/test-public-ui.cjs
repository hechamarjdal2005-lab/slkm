// Read-only browser QA. Install Playwright locally with --no-save to run.
// Uses installed Edge by default; set SLKM_BROWSER_CHANNEL for another channel.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.SLKM_TEST_URL || 'http://127.0.0.1:3000';
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440];
const paths = ['/', '/lignes', '/irsaliyat', '/services', '/about', '/blog', '/contact'];
const output = 'artifacts/compact';
const navPaths = ['/', '/lignes', '/irsaliyat', '/about', '/services', '/contact'];
const navLabels = {
  fr: ['Accueil', 'Lignes & agences', 'Messageries', 'Notre histoire', 'Transport de personnel', 'Contact'],
  ar: ['الرئيسية', 'الخطوط والوكالات', 'إرساليات', 'قصتنا', 'نقل الموظفين', 'اتصل بنا'],
  en: ['Home', 'Routes & agencies', 'Parcels', 'Our story', 'Staff transport', 'Contact'],
};

async function switchLanguage(page, locale, heading) {
  console.log(`Switching language: ${locale}`);
  await page.waitForFunction(() => !document.querySelector('.compact-locale select').disabled);
  await page.locator('.compact-locale select').selectOption(locale);
  // Streamed headings may commit before React completes the refresh transition.
  // Wait for the selector to re-enable before starting the next interaction.
  await page.waitForFunction(({ locale, heading }) => {
    const select = document.querySelector('.compact-locale select');
    return !select.disabled && select.value === locale && document.documentElement.lang === locale && document.querySelector('h1')?.textContent.includes(heading);
  }, { locale, heading }, { timeout: 45000 }).catch(async error => {
    console.log(await page.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, heading: document.querySelector('h1')?.textContent, cookie: document.cookie, selection: document.querySelector('.compact-locale select').value, pending: document.querySelector('.compact-locale select').disabled, navigation: document.querySelector('.desktop-nav-link').textContent })));
    await page.screenshot({ path: `${output}/language-error.png` });
    throw error;
  });
  console.log(`Language ready: ${locale}`);
}

async function layout(page, context) {
  // Let responsive media queries and Leaflet's resize observer settle.
  await page.waitForFunction(() => {
    const header = document.querySelector('.header-main');
    const site = document.querySelector('.public-site');
    return Math.abs(header.getBoundingClientRect().height - parseFloat(getComputedStyle(site).getPropertyValue('--header-height'))) < 1;
  });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth + 1, null, { timeout: 2500 }).catch(() => {});
  const result = await page.evaluate(() => {
    const viewport = innerWidth;
    const fields = [...document.querySelectorAll('main input:not([type="hidden"]), main select, main textarea')].filter(el => el.getBoundingClientRect().width);
    const clippedFields = fields.filter(el => {
      const r = el.getBoundingClientRect();
      return r.left < -1 || r.right > viewport + 1;
    }).map(el => el.id);
    const header = document.querySelector('.site-header').getBoundingClientRect();
    const headerMain = document.querySelector('.header-main');
    const nav = document.querySelector('.desktop-navigation');
    const shown = el => el.getBoundingClientRect().width && getComputedStyle(el).display !== 'none';
    const controls = [...document.querySelectorAll('.header-main .menu-toggle, .header-main .brand-lockup, .desktop-nav-link, .header-main .compact-locale, .header-book')].filter(shown);
    const overlaps = controls.some((el, i) => controls.slice(i + 1).some(other => {
      const a = el.getBoundingClientRect(), b = other.getBoundingClientRect();
      return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    }));
    const dock = document.querySelector('.mobile-dock');
    const dockVisible = getComputedStyle(dock).display !== 'none';
    return { width: viewport, scrollWidth: document.documentElement.scrollWidth, clippedFields, headerRight: header.right, dockVisible,
      clearance: parseFloat(getComputedStyle(document.querySelector('.public-site')).paddingBottom), dockHeight: dock.getBoundingClientRect().height,
      language: document.documentElement.lang, direction: document.documentElement.dir,
      heading: document.querySelector('h1')?.textContent,
      headerHeight: headerMain.getBoundingClientRect().height,
      topbarHeight: document.querySelector('.site-topbar').getBoundingClientRect().height,
      desktopNavVisible: getComputedStyle(nav).display !== 'none',
      navFontSize: parseFloat(getComputedStyle(nav.querySelector('a')).fontSize),
      headerOverlaps: overlaps,
      navPaths: [...nav.querySelectorAll('a')].map(a => a.getAttribute('href')),
      navLabels: [...nav.querySelectorAll('a')].map(a => a.textContent),
      drawerPaths: [...document.querySelectorAll('.drawer-navigation a')].map(a => a.getAttribute('href')),
      drawerLabels: [...document.querySelectorAll('.drawer-navigation a')].map(a => a.textContent),
      activeNav: [...nav.querySelectorAll('a[aria-current="page"]')].map(a => a.getAttribute('href')),
      path: location.pathname,
      badText: /\?{3}|\uFFFD/.test(document.querySelector('main').textContent),
    };
  });
  if (result.scrollWidth > result.width + 1) {
    await page.screenshot({ path: `${output}/overflow.png`, fullPage: true });
    console.log(await page.evaluate(() => [...document.querySelectorAll('.public-site *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1 && !el.closest('.leaflet-container')).slice(0, 12).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 70) }))));
  }
  assert.ok(result.scrollWidth <= result.width + 1, `${context}: horizontal overflow ${result.scrollWidth}/${result.width}`);
  assert.deepEqual(result.clippedFields, [], `${context}: clipped form controls`);
  assert.ok(result.headerRight <= result.width + 1, `${context}: header fits`);
  assert.ok(result.heading, `${context}: page heading`);
  assert.ok(!result.badText, `${context}: intact translations`);
  assert.ok(!result.headerOverlaps, `${context}: header controls do not overlap`);
  assert.deepEqual(result.navPaths, navPaths, `${context}: exact desktop menu order`);
  assert.deepEqual(result.drawerPaths, navPaths, `${context}: exact drawer menu order`);
  assert.deepEqual(result.navLabels, navLabels[result.language], `${context}: desktop translations`);
  assert.deepEqual(result.drawerLabels, navLabels[result.language], `${context}: drawer translations`);
  const activePath = navPaths.find(href => href === '/' ? result.path === '/' : result.path.startsWith(href));
  assert.deepEqual(result.activeNav, activePath ? [activePath] : [], `${context}: active page`);
  assert.equal(result.desktopNavVisible, result.width >= 1024, `${context}: desktop navigation breakpoint`);
  assert.ok(result.headerHeight >= (result.width < 768 ? 60 : 70) && result.headerHeight <= (result.width < 768 ? 64 : 76), `${context}: compact header height ${result.headerHeight}`);
  if (result.width >= 1024) {
    assert.ok(result.topbarHeight >= 30 && result.topbarHeight <= 34, `${context}: compact topbar`);
    assert.ok(result.navFontSize >= 13 && result.navFontSize <= 14, `${context}: desktop navigation type`);
  }
  assert.equal(result.dockVisible, result.width < 768, `${context}: dock visibility`);
  if (result.dockVisible) assert.ok(result.clearance >= result.dockHeight + 10, `${context}: dock clearance`);
  return result;
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const response = await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) break;
      throw new Error(`Server returned ${response.status}`);
    } catch (error) {
      if (attempt === 9) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  const browser = await chromium.launch({ headless: true, channel: process.env.SLKM_BROWSER_CHANNEL || 'msedge' });
  const report = { layouts: [], interactions: [], skipped: [], pageErrors: [] };
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => {
      report.pageErrors.push(error.message);
      console.error('Client error at', page.url(), error.stack);
    });
    for (const locale of (process.env.SLKM_QA_INTERACTIONS_ONLY ? [] : ['fr', 'ar', 'en'])) {
      await context.addCookies([{ name: 'slkm_locale', value: locale, url: base }]);
      for (const path of paths) {
        const response = await page.goto(base + path, { waitUntil: 'load', timeout: 60000 });
        assert.equal(response.status(), 200, `${locale} ${path}`);
        await page.locator('h1').waitFor();
        await page.evaluate(() => document.fonts.ready);
        for (const width of widths) {
          await page.setViewportSize({ width, height: 844 });
          await page.waitForTimeout(80);
          const result = await layout(page, `${locale} ${path} ${width}`);
          assert.equal(result.language, locale);
          assert.equal(result.direction, locale === 'ar' ? 'rtl' : 'ltr');
          report.layouts.push({ path, locale, ...result });
          if (path === '/' && [320, 390, 768, 1024, 1280, 1440].includes(width)) await page.screenshot({ path: `${output}/home-${locale}-${width}.png` });
        }
        console.log(`${locale} ${path}: ${widths.length} viewport checks passed`);
      }
    }

    await context.addCookies([{ name: 'slkm_locale', value: 'fr', url: base }]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: 'load' });
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu' });
    const drawer = page.locator('#mobile-navigation');
    await trigger.click();
    await page.waitForFunction(() => document.querySelector('#mobile-navigation').open);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab');
      assert.ok(await drawer.evaluate(el => el.contains(document.activeElement)), 'Drawer traps keyboard focus');
    }
    await page.screenshot({ path: `${output}/drawer-fr-390.png` });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#mobile-navigation').open);
    assert.ok(await trigger.evaluate(el => el === document.activeElement), 'Focus returns to hamburger');
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await trigger.click();
    await page.mouse.click(385, 350);
    await page.waitForFunction(() => !document.querySelector('#mobile-navigation').open);
    await trigger.click();
    await drawer.locator('a[href="/"]').click();
    await page.waitForFunction(() => !document.querySelector('#mobile-navigation').open);
    await trigger.click();
    await drawer.locator('a[href="/contact"]').click();
    await page.waitForURL('**/contact');
    assert.ok(!await drawer.evaluate(el => el.open));
    report.interactions.push('Drawer: focus trap, Escape, backdrop, same-route close, navigation close, focus return and scroll unlock');

    for (const href of navPaths) {
      await trigger.click();
      await drawer.locator(`.drawer-navigation a[href="${href}"]`).click();
      await page.waitForURL(url => url.pathname === href);
      await page.locator('h1').waitFor();
      await page.waitForFunction(() => !document.querySelector('#mobile-navigation').open);
    }
    await page.setViewportSize({ width: 1280, height: 844 });
    for (const href of navPaths) {
      await page.locator(`.desktop-navigation a[href="${href}"]`).click();
      await page.waitForURL(url => url.pathname === href);
      await page.locator('h1').waitFor();
      assert.equal(await page.locator(`.desktop-navigation a[href="${href}"]`).getAttribute('aria-current'), 'page');
    }
    const headerHeight = await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().height);
    await page.evaluate(() => scrollTo(0, 800));
    assert.equal(await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().top), 0, 'Header remains sticky');
    assert.equal(await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().height), headerHeight, 'Sticky header does not shift size');
    await page.evaluate(() => scrollTo(0, 0));
    await page.setViewportSize({ width: 390, height: 844 });
    // Next.js can update the URL before the streamed page has committed.
    // Wait for the contact content before changing its language.
    await page.getByRole('heading', { level: 1, name: 'Nous sommes là pour répondre à vos questions' }).waitFor();
    await page.waitForLoadState('networkidle');
    report.interactions.push('All six desktop and drawer links navigate to the existing routes and keep correct active states');

    await switchLanguage(page, 'ar', 'نحن');
    await layout(page, 'Language switch Arabic');
    await page.getByRole('button', { name: 'فتح القائمة' }).click();
    await page.locator('.drawer-panel').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    const rtlPanel = await page.locator('.drawer-panel').boundingBox();
    assert.ok(rtlPanel.x > 0 && Math.abs(rtlPanel.x + rtlPanel.width - 390) < 1, 'Arabic drawer opens from the logical start');
    await page.getByRole('button', { name: 'إغلاق القائمة' }).click();
    await page.waitForFunction(() => !document.querySelector('#mobile-navigation').open);
    await switchLanguage(page, 'en', 'We are here');
    await switchLanguage(page, 'fr', 'Nous sommes');
    const contactForm = page.locator('main form');
    assert.equal(await contactForm.evaluate(el => el.checkValidity()), false, 'Contact requires fields');
    report.interactions.push('Live FR/AR/EN switch updates cookie, page copy and document direction; contact validation');

    await page.goto(base + '/lignes', { waitUntil: 'load' });
    const origin = page.locator('select[id$="-from"]');
    if (await origin.locator('option').count() > 1) {
    const departure = await origin.locator('option').nth(1).getAttribute('value');
    assert.ok(departure, 'Live routes supply origins');
    await origin.selectOption(departure);
    const destination = page.locator('select[id$="-to"]');
    const arrival = await destination.locator('option').nth(1).getAttribute('value');
    await destination.selectOption(arrival);
    await page.getByRole('button', { name: 'Rechercher un trajet' }).click();
    assert.ok(new URL(page.url()).searchParams.get('from'), 'Search persists origin');
    const booking = page.locator('.route-card a[href^="https://wa.me/"]').first();
    await booking.waitFor();
    const bookingURL = new URL(await booking.getAttribute('href'));
    assert.ok(bookingURL.searchParams.get('text').includes('réserver un billet de'), 'Route booking retains journey details');
    assert.equal(await booking.getAttribute('rel'), 'noopener noreferrer');
    await page.getByRole('button', { name: 'Revenir à la vue nationale' }).click();
    assert.equal(await origin.inputValue(), '');
    await page.getByRole('button', { name: 'Agences', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Agences', exact: true }).getAttribute('aria-pressed'), 'true');
    for (const link of await page.locator('.mobile-dock a').all()) {
      const href = await link.getAttribute('href');
      assert.ok(['/', '/lignes', '/irsaliyat', '/contact'].includes(href) || href.startsWith('https://wa.me/'), 'Dock destination');
    }
    report.interactions.push('Live route filters, persisted URL, reset, map mode, journey-specific WhatsApp booking and dock destinations');
    } else { report.skipped.push('BLOCKED: no selectable published route origin; route filters/booking persistence were not exercised against live data.'); }

    await page.goto(base + '/irsaliyat', { waitUntil: 'load' });
    await page.evaluate(() => { window.__testOpened = null; window.open = url => { window.__testOpened = url; return null; }; });
    await page.getByLabel('Numéro de suivi').fill('IRS-UI-CHECK');
    const track = page.getByRole('button', { name: 'Suivre sur WhatsApp' });
    if (await track.count()) {
      await track.click();
      assert.ok((await page.evaluate(() => window.__testOpened)).includes('IRS-UI-CHECK'), 'Tracking passes reference to WhatsApp without sending');
    } else report.skipped.push('BLOCKED: WhatsApp tracking action unavailable without configured contact data.');
    const enlarge = page.getByRole('button', { name: 'Agrandir la carte' });
    if (await enlarge.count()) {
      await enlarge.click();
      assert.ok(await page.locator('main dialog').evaluate(el => el.open));
      await page.keyboard.press('Escape');
      assert.ok(!await page.locator('main dialog').evaluate(el => el.open));
    } else report.skipped.push('BLOCKED: no configured parcel-map image for a browser modal check.');
    await page.goto(base + '/services', { waitUntil: 'load' });
    assert.equal(await page.locator('main form').evaluate(el => el.checkValidity()), false, 'Corporate quote requires fields');
    report.interactions.push('Required quote fields validated; optional tracking/map checks recorded separately when configured; no messages sent or records created');

    await page.goto(base + '/blog', { waitUntil: 'load' });
    const articleLink = page.locator('main a[href^="/blog/"]').first();
    const articleHref = await articleLink.count() ? await articleLink.getAttribute('href') : null;
    if (!articleHref) report.skipped.push('BLOCKED: no published article available for a browser detail-page check.');
    if (articleHref) {
      await page.goto(base + articleHref, { waitUntil: 'load' });
      for (const width of widths) { await page.setViewportSize({ width, height: 844 }); report.layouts.push({ path: articleHref, locale: 'fr', ...await layout(page, `Article ${width}`) }); }
    }
    await page.goto(base + '/admin', { waitUntil: 'load' });
    assert.ok(page.url().includes('/admin/login'), 'Admin remains protected');
    assert.equal(await page.locator('.public-site').count(), 0, 'Public theme does not affect admin');
    report.interactions.push('Unauthenticated admin redirect and isolated admin theme');
    assert.deepEqual(report.pageErrors, [], 'No client runtime errors');
    fs.writeFileSync(`${output}/qa-report.json`, JSON.stringify(report, null, 2));
    console.log(`${report.layouts.length} responsive layouts and ${report.interactions.length} interaction groups passed.`);
  } finally {
    fs.writeFileSync(`${output}/qa-report.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
