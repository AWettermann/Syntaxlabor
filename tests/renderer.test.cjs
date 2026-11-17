const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js'), R = require('../renderer.js');
function checkBox(n) {
  const box = R.layout(n); assert.ok(box.w > 0); assert.ok(box.h > 0); assert.ok(box.mid >= 0 && box.mid <= box.h);
  for (const child of box.children) {
    assert.ok(child.x >= 0 && child.x + child.m.w <= box.w);
    assert.ok(child.y >= 0 && child.y + child.m.h <= box.h);
  }
  if (n.type === 'seq') box.children.forEach(c => assert.equal(c.y + c.m.mid, box.mid));
  n.items?.forEach(checkBox); if (n.child) checkBox(n.child);
}
test('verschachtelte Layouts bleiben innerhalb ihrer gemessenen Grenzen', () => {
  for (const s of [
    's = "a" ["b"] {"c"};', 's = [("a" | "b") {"c"}] ("d" | {"e"});',
    's = ({"a"} | ["b"]) ({"c"} | "d");', 's = {{{"a" | "b"}}};', 's = ε;'
  ]) checkBox(C.parse(s).rules[0].node);
});
test('19 — SVG ist eigenständig, enthält Marker und sichere Texte', () => {
  const node = C.parse('s = "<&>" {"a"};').rules[0].node, svg = R.svg(node, 's', {id: 'test'});
  assert.match(svg, /xmlns="http:\/\/www.w3.org\/2000\/svg"/); assert.match(svg, /<style>/);
  assert.match(svg, /marker-end/); assert.match(svg, /&lt;&amp;&gt;/); assert.doesNotMatch(svg, /NaN|undefined/);
  assert.doesNotMatch(svg, /class="rail-node selected"/);
});
test('Wiederholung besitzt oberen Bypass und nach links gerichtete Rückführung', () => {
  const n = {type: 'rep', child: {type: 'lit', value: 'a'}}, m = R.layout(n), svg = R.svg(n, 's', {id: 'rep'});
  assert.match(svg, new RegExp(`M50 44H${34 + m.w - 16}`));
  assert.match(svg, /V140H64" marker-end/); assert.match(svg, /0 … ∞/);
});
