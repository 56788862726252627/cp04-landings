import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parse } from '@babel/parser';
const source = readFileSync('src/App.jsx', 'utf8');
const baseRevision = 'acfa3a0217ff67a8895209862dacd57c0f9ce041';
const baseline = execFileSync('git', ['show', baseRevision + ':app/src/App.jsx'], { encoding: 'utf8' });
const ast = text => parse(text, { sourceType: 'module', plugins: ['jsx'] });
const declaration = node => node.declaration || node;
test('all pre-existing business modules remain byte-identical', () => {
  const current = ast(source).program.body.map(declaration);
  let count = 0;
  for (const node of ast(baseline).program.body.map(declaration)) {
    if (node.type !== 'FunctionDeclaration' || ['Sidebar', 'ClubPadel04SaaSApp'].includes(node.id.name)) continue;
    const found = current.find(item => item.type === node.type && item.id.name === node.id.name);
    assert.ok(found, node.id.name);
    assert.equal(source.slice(found.start, found.end), baseline.slice(node.start, node.end), node.id.name);
    count++;
  }
  assert.ok(count > 20, 'Business module coverage');
});
test('destinations, ordering, role filter and navigation guard are unchanged', () => {
  const extract = (text, pattern) => text.match(pattern)?.[0];
  for (const pattern of [
    /const navKeys = \[[\s\S]*?\n  \];/,
    /const allowedMenu = .*\n  const visibleItems = .*;/,
    /const modules = .*;/,
    /const safeCurrentSection = [\s\S]*?: cp04GetSafeStartSection\(selectedRole\);/,
    /  function navigate\(section\) \{[\s\S]*?\n  \}/,
  ]) {
    assert.ok(extract(baseline, pattern));
    assert.equal(extract(source, pattern), extract(baseline, pattern));
  }
});
test('all existing app state bindings and auth/recovery handlers remain byte-identical', () => {
  const app = text => ast(text).program.body.map(declaration)
    .find(node => node.type === 'FunctionDeclaration' && node.id.name === 'ClubPadel04SaaSApp');
  const existing = app(baseline).body.body;
  const current = app(source).body.body;
  const identity = node => node.type === 'FunctionDeclaration' ? node.id.name :
    node.type === 'VariableDeclaration' ? node.declarations.map(d => baseline.slice(d.id.start, d.id.end)).join(',') : null;
  for (const node of existing) {
    if (!['FunctionDeclaration', 'VariableDeclaration'].includes(node.type)) continue;
    const name = identity(node);
    const found = current.find(candidate => candidate.type === node.type && (
      candidate.type === 'FunctionDeclaration' ? candidate.id.name === name :
      candidate.declarations.map(d => source.slice(d.id.start, d.id.end)).join(',') === name
    ));
    assert.ok(found, name);
    assert.equal(source.slice(found.start, found.end), baseline.slice(node.start, node.end), name);
  }
});
test('existing authentication, API, data, worker and config files are untouched', () => {
  const changed = execFileSync('git', ['diff', baseRevision, '--name-only'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const allowed = new Set([
    'app/src/App.jsx', 'app/src/interactive-navigation.css',
    'app/src/saas-core/ui/navigationDialog.js',
    'app/src/saas-core/ui/navigation-invariants.test.mjs',
    'app/navigation-validation/navigation-browser.test.mjs',
    'app/navigation-validation/navigation-preview.mjs',
    'app/navigation-validation/navigation-build.mjs',
  ]);
  assert.ok(changed.includes('app/src/App.jsx'));
  assert.deepEqual(changed.filter(name => !allowed.has(name)), []);
});
test('new CORE focus utility has no vertical, client, endpoint or storage dependencies', () => {
  const core = readFileSync('src/saas-core/ui/navigationDialog.js', 'utf8');
  assert.doesNotMatch(core, /cp04|padel|lumen|fetch\(|localStorage|sessionStorage|https?:|^import /mi);
});
test('new navigation code has no credential literals, private paths or gastronomic additions', () => {
  for (const name of ['src/saas-core/ui/navigationDialog.js', 'src/interactive-navigation.css']) {
    const text = readFileSync(name, 'utf8');
    assert.doesNotMatch(text, /\/root\/|Bearer\s+[\w.-]+|-----BEGIN .*PRIVATE KEY|(?:api_key|secret|password)\s*[:=]\s*["'][^"']+|calorías|alérgenos|carrito/i, name);
  }
});
