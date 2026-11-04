// Parses every assets/*.css and every {% stylesheet %} block with PostCSS.
// Usage: node css-check.mjs <theme-dir>
import postcss from 'postcss';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(process.argv[2] ?? '.');
const block = /{%-?\s*stylesheet\s*-?%}([\s\S]*?){%-?\s*endstylesheet\s*-?%}/;
let checked = 0;
let failed = 0;

function check(name, css) {
  checked++;
  try {
    postcss.parse(css);
  } catch (error) {
    failed++;
    console.log('FAIL', name, error.message);
  }
}

for (const f of readdirSync(join(root, 'assets')).filter((f) => f.endsWith('.css'))) {
  check('assets/' + f, readFileSync(join(root, 'assets', f), 'utf8'));
}
for (const dir of ['sections', 'snippets', 'blocks']) {
  if (!existsSync(join(root, dir))) continue;
  for (const f of readdirSync(join(root, dir))) {
    const match = readFileSync(join(root, dir, f), 'utf8').match(block);
    if (match) check(`${dir}/${f}`, match[1]);
  }
}
console.log(`checked ${checked}, failed ${failed}`);
process.exitCode = failed ? 1 : 0;
