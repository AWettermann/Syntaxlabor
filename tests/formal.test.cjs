const {test} = require('node:test');
const assert = require('node:assert/strict');
const F = require('../formal.js');
const type = s => F.classify(F.parse(s)).type;
test('Grammatiktupel, Terminale und Nichtterminale korrekt trennen', () => {
  const g = F.parse('S → aA | "P"\nA → b');
  assert.deepEqual(g.nonterminals, ['A', 'S']); assert.deepEqual(g.terminals, ['P', 'a', 'b']); assert.equal(g.rules.length, 3);
});
test('Typ 3: Linkslinearität, Rechtslinearität, Terminalwörter und Einheitsregeln', () => {
  for (const s of ['S → aS | b', 'S → Sa | b', 'S → abA | ab\nA → c', 'S → A\nA → aA | b']) assert.equal(type(s), 3, s);
});
test('Typ 2: mittige und mehrfache Nichtterminale, gemischte Richtungen', () => {
  for (const s of ['S → aSb | ab', 'S → SS | a', 'S → aA\nA → Sb | b']) assert.equal(type(s), 2, s);
});
test('ε-Ausnahme mit und ohne Startsymbol rechts sorgfältig unterscheiden', () => {
  assert.equal(type('S → ε | aA\nA → aA | a'), 3);
  assert.equal(type('S → ε | aS'), 2);
  assert.equal(type('S → aA\nA → ε | b'), 2);
  assert.equal(type('S → ε | AB\nAB → BA\nA → a\nB → b'), 1);
  assert.equal(type('S → ε | AB\nAB → SA\nA → a\nB → b'), 0);
});
test('Typ 1 nach nichtverkürzender Konvention und Typ 0 mit Verkürzung', () => {
  assert.equal(type('S → aAB\nAB → BA\nA → a\nB → b'), 1);
  assert.equal(type('S → AB\nAB → a'), 0);
  assert.equal(type('S → aS | a\nAB → ε'), 0);
});
test('Keine Typ-0-Grammatik mit ausschließlich Terminalen oder ε links', () => {
  for (const s of ['S → a\na → b', 'S → a\nε → b', 'S a', 'S → "P']) assert.throws(() => F.parse(s));
});
test('Einzelne Ersetzungen akzeptieren, Sprünge und Zeichenänderungen ablehnen', () => {
  const g = F.parse('S → aS | b');
  assert.ok(F.derivation(g, 'S ⇒ aS ⇒ aaS ⇒ aaaS ⇒ aaab', 'aaab').complete);
  assert.equal(F.derivation(g, 'S ⇒ aaS ⇒ aaab', 'aaab').valid, false);
  assert.equal(F.derivation(g, 'aS ⇒ ab', 'ab').starts, false);
  assert.equal(F.derivation(g, 'S ⇒ aS', 'ab').complete, false);
});
test('Links- und Rechtsableitung unterscheiden', () => {
  const g = F.parse('S → AB\nA → a\nB → b');
  assert.ok(F.derivation(g, 'S ⇒ AB ⇒ aB ⇒ ab', 'ab', 'left').complete);
  assert.equal(F.derivation(g, 'S ⇒ AB ⇒ Ab ⇒ ab', 'ab', 'left').complete, false);
  assert.ok(F.derivation(g, 'S ⇒ AB ⇒ Ab ⇒ ab', 'ab', 'right').complete);
});
test('Typ-0-Kontextregel und ε-Schritte prüfen', () => {
  assert.ok(F.derivation(F.parse('S → AB\nAB → a'), 'S ⇒ AB ⇒ a', 'a').complete);
  assert.ok(F.derivation(F.parse('S → aSb | ε'), 'S ⇒ aSb ⇒ ab', 'ab').complete);
});
test('Ableitungsbaum hat richtige Blätter und behält die gewählte Ersetzungsstelle', () => {
  const g = F.parse('S → SS | ε');
  const result = F.tree(g, ['S', 'SS', 'S'].map(F.symbols), [{ruleIndex: 0, position: 0}, {ruleIndex: 1, position: 1}]);
  assert.ok(result.root.children[1].children); assert.equal(result.root.children[0].children, undefined);
  const h = F.parse('S → AB\nA → a\nB → b');
  const tree = F.tree(h, ['S', 'AB', 'aB', 'ab'].map(F.symbols));
  assert.equal(F.display(tree.frontier.map(n => n.symbol)), 'ab');
  const epsilon = F.tree(F.parse('S → ε'), ['S', 'ε'].map(F.symbols), [{ruleIndex: 0, position: 99}]);
  assert.equal(epsilon.frontier.length, 0);
});
test('Ableitungs- und Parsergrenzen brechen mit Meldung ab', () => {
  assert.throws(() => F.parse(' '.repeat(12001)));
  assert.throws(() => F.derivation(F.parse('S → aS | b'), Array(82).fill('S').join('⇒'), 'b'));
});
