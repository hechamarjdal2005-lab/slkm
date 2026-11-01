// Exercise the production filtering utilities without adding a test dependency.
const fs = require("node:fs");
const ts = require("typescript");
const assert = require("node:assert/strict");
require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(output.outputText, filename);
};
const { activeRoutes, cityKey, filterRoutes, resolveCity, routeCities } = require("../src/lib/transport.ts");
const agency = (id, city, is_active = true) => ({ id, city_fr: city, is_active });
const agadir = agency("a", "Agadir"), agadir2 = agency("a2", " Agadir ");
const casa = agency("c", "Casablanca"), dakhla = agency("d", "Dakhla"), marrakech = agency("m", "Marrakech");
const route = (id, from, to, extra = {}) => ({ id, from_agency: from, to_agency: to, from_agency_id: from?.id, to_agency_id: to?.id, is_active: true, days_of_week: ["MON"], bus_type: "Comfort", ...extra });
const routes = [route("ad", agadir, dakhla), route("am", agadir2, marrakech), route("cd", casa, dakhla), route("inactive", casa, marrakech, { is_active: false }), route("same", agadir, agadir2), route("missing", null, dakhla), route("closed", agency("x", "Other", false), dakhla)];
assert.deepEqual(routeCities(routes, "from").map(([key]) => key), ["agadir", "casablanca"]);
assert.deepEqual(routeCities(routes, "to", "agadir").map(([key]) => key), ["dakhla", "marrakech"]);
assert.deepEqual(routeCities(routes, "to", "casablanca").map(([key]) => key), ["dakhla"]);
assert.equal(activeRoutes(routes).length, 3);
assert.equal(filterRoutes(routes, { from: "dakhla", to: "agadir" }).length, 0, "Never infer a return route");
assert.equal(filterRoutes(routes, { from: "agadir", to: "agadir" }).length, 0);
assert.equal(filterRoutes(routes, { from: "agadir", to: "dakhla", date: "2026-11-02", busType: "Comfort" }).length, 1);
assert.equal(filterRoutes(routes, { from: "agadir", date: "2026-11-03" }).length, 0);
assert.equal(filterRoutes(routes, { busType: "VIP" }).length, 0);
assert.equal(resolveCity(routes, "a2"), "agadir", "Existing agency URL parameters remain supported");
assert.equal(cityKey(agency("u", "A\u0301")), cityKey(agency("v", "\u00c1")), "Canonical Unicode spellings deduplicate");
assert.notEqual(cityKey(agency("u", "Sale")), cityKey(agency("v", "Sal\u00e9")), "Different city spellings are not aggressively conflated");
assert.deepEqual(routeCities([], "from"), []);
assert.deepEqual(filterRoutes([], {}), []);
console.log("Transport: 14 assertions passed (direction, active data, city deduplication, calendar, classes, empty data, legacy URLs).");
