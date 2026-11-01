// Read-only checks against a running local production server.
const assert = require("node:assert/strict");
const base = process.env.SLKM_TEST_URL || "http://127.0.0.1:3000";
async function main() {
  let checks = 0;
  for (const path of ["/", "/lignes", "/irsaliyat", "/services", "/about", "/blog", "/contact", "/admin/login", "/robots.txt", "/sitemap.xml"]) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.ok(!body.includes('id="__next_error__"'), `${path}: no server error`);
    console.log(`${path}: 200`); checks++;
  }
  for (const locale of ["fr", "ar", "en"]) {
    for (const path of ["/", "/lignes"]) {
      const response = await fetch(`${base}${path}`, { headers: { Cookie: `slkm_locale=${locale}` }, signal: AbortSignal.timeout(30000) });
      const html = await response.text();
      assert.equal(response.status, 200);
      assert.ok(html.includes(`lang="${locale}"`), `${path}: ${locale}`);
      assert.ok(html.includes(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
      assert.ok(html.includes("network-explorer"));
      assert.ok(html.includes("network-layout"));
      console.log(`${path}: ${locale} language/direction/network OK`); checks++;
    }
  }
  const protectedPage = await fetch(`${base}/admin`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  assert.ok([303, 307, 308].includes(protectedPage.status), "Unauthenticated admin redirects");
  assert.ok(protectedPage.headers.get("location").includes("/admin/login")); checks++;
  const manifest = await fetch(`${base}/manifest.webmanifest`);
  assert.equal(manifest.status, 200);
  assert.ok((await manifest.json()).icons?.[0]?.src); checks++;
  const mediaAPI = await fetch(`${base}/api/admin/media`);
  assert.equal(mediaAPI.status, 403);
  assert.match(mediaAPI.headers.get("cache-control"), /no-store/); checks++;
  assert.equal((await fetch(`${base}/media/not-a-uuid`)).status, 404); checks++;
  assert.equal((await fetch(`${base}/icon.svg`)).status, 200); checks++;
  for (const path of ["/", "/contact"]) {
    const html = await (await fetch(`${base}${path}`)).text();
    assert.match(html, /property="og:image" content="[^"]+"/, `${path}: sharing image survives page metadata`); checks++;
  }
  const blog = await (await fetch(`${base}/blog`)).text();
  const article = blog.match(/href="(\/blog\/[a-z0-9-]+)"/);
  if (article) {
    const response = await fetch(`${base}${article[1]}`, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200); console.log("Published article: 200"); checks++;
  }
  console.log(`${checks} read-only smoke checks passed.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
