// Runs Shopify Theme Check on a full local theme tree.
// Usage: node theme-check.mjs <theme-dir>
import { themeCheckRun } from '@shopify/theme-check-node';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(process.argv[2] ?? '.');
const { offenses } = await themeCheckRun(root, undefined, () => {});
const rows = offenses.map((o) => ({
  sev: ['ERR', 'WARN', 'INFO'][o.severity],
  check: o.check,
  file: o.uri.split(root + '/')[1],
  line: o.start.line + 1,
  msg: o.message,
}));
writeFileSync(root + '.tc.json', JSON.stringify(rows, null, 1));
const counts = {};
for (const r of rows) counts[`${r.sev} ${r.check}`] = (counts[`${r.sev} ${r.check}`] || 0) + 1;
for (const [k, v] of Object.entries(counts).sort()) console.log(`${k}: ${v}`);
console.log('total', rows.length, '→', root + '.tc.json');
