/**
 * Regenerates specs/flexed.json from the live API's Swagger UI bundle.
 *
 * The backend serves no /*-json endpoint — the OpenAPI document is only
 * available inlined in the `var options = {...}` assignment inside
 * /docs/swagger-ui-init.js, which is what this extracts.
 *
 * Usage: npm run spec:generate [-- <base-url>]
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const BASE_URL = process.argv[2] ?? "https://flexed-be.onrender.com";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../specs/flexed.json");

const res = await fetch(`${BASE_URL}/docs/swagger-ui-init.js`);
if (!res.ok) throw new Error(`Failed to fetch swagger bundle: ${res.status} ${res.statusText}`);
const js = await res.text();

const START = "var options = ";
const END = "\n};\n  url = options.swaggerUrl";
const start = js.indexOf(START);
const end = js.indexOf(END, start);
if (start === -1 || end === -1) throw new Error("Could not locate the options object in swagger-ui-init.js");

const spec = JSON.parse(js.slice(start + START.length, end + 2));
const pathCount = Object.keys(spec.swaggerDoc.paths).length;

writeFileSync(OUT, JSON.stringify(spec, null, 2) + "\n");
console.log(`Wrote ${OUT} — ${pathCount} paths, ${Object.keys(spec.swaggerDoc.components.schemas).length} schemas.`);
