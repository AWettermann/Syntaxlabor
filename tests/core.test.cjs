const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
const exercises = require('../exercises.js');
const rules = text => C.parse(text).rules;
const accepts = text => { const r = rules(text); return C.recognizer(r, r[0].name); };
function language(text, yes, no = []) { const run = accepts(text); yes.forEach(w => assert.equal(run(w), true, `expected ${JSON.stringify(w)} in ${text}`)); no.forEach(w => assert.equal(run(w), false, `unexpected ${JSON.stringify(w)} in ${text}`)); }
test('1 — einzelnes Terminal', () => language('wort = "a";', ['a'], ['', 'aa', 'b']));
test('2 — Folge ohne Kommata und mehrstellige Terminale', () => language('satz = "ab" "c" ".";', ['abc.'], ['abc', 'ab c.']));
test('3 — Alternative mit korrekter Priorität', () => language('s = "a" | "b" "c";', ['a', 'bc'], ['ac', 'b', 'abc']));
test('4 — optional', () => language('s = "a" ["b"] "c";', ['ac', 'abc'], ['abbc', 'ab']));
test('5 — Wiederholung: null, eins, viele', () => language('s = {"ab"};', ['', 'ab', 'abab', 'ababab'], ['a', 'aba', 'ba']));
test('6 — verschachtelte Alternativen', () => language('s = ("a" | ("b" | "c") "d") "e";', ['ae', 'bde', 'cde'], ['be', 'ce', 'ade']));
test('7 — verschachtelte Wiederholungen mit nullable Kind', () => language('s = {{["a"]} "b"};', ['', 'b', 'ab', 'aaab', 'abab', 'bb'], ['a', 'ba']));
test('8/9 — mehrere Regeln und Referenzen', () => language('zahl = ziffer {ziffer}; ziffer = "0" | "1" | "2";', ['0', '12', '20102'], ['', '3', '10a']));
test('10 — leere Produktion, ε, leeres Literal', () => {
  for (const expr of ['', 'ε', '""', '[ε]', '{ε}', '()']) language(`s = ${expr};`, [''], ['a']);
  assert.equal(C.serialize(rules('s = ;')), 's = ε;');
});
test('11/12 — vollständig löschen und danach neu anlegen', () => {
  assert.deepEqual(C.parse('').rules, []); assert.equal(C.serialize([]), '');
  assert.throws(() => C.recognizer([], ''), /Startsymbol/);
  language('neu = ε;', [''], ['a']);
});
test('15 — Unicode, Leerzeichen, Escape-Sequenzen, Sonderzeichen', () => {
  language('s = "ä😀" " " "<>&";', ['ä😀 <>&'], ['a😀 <>&']);
  language(String.raw`s = "\"" "\\" "\n" "\t";`, ['"\\\n\t'], ['']);
  const control = [{name: 's', node: C.lit('\b\f\u0000\u0001')}];
  assert.deepEqual(rules(C.serialize(control)), control);
});
test('16 — ungültige und unvollständige EBNF mit Position', () => {
  for (const text of ['s = "a"', 's = ["a";', 's = "abc;', 's = "a" @;', 's = "a",;', 's = "a"; s = "b";', 's = "a" |;', 's = "\\q";']) assert.throws(() => C.parse(text), /Zeile/);
});
test('17 — undefinierte Nichtterminale und sichere Regelnamen', () => {
  const r = rules('s = fehlt;'); assert.match(C.diagnostics(r)[0], /fehlt/); assert.throws(() => C.recognizer(r, 's'), /nicht definiert/);
  language('constructor = "x"; __proto__ = constructor;', ['x'], ['']);
  const other = rules('s = "a"; ungenutzt = fehlt;'); assert.equal(C.recognizer(other, 's')('a'), true); assert.equal(C.diagnostics(other).length, 1);
});
test('18 — links-, rechts- und gegenseitig rekursive Grammatiken', () => {
  language('s = s "a" | ε;', ['', 'a', 'aaaa'], ['b']);
  language('s = "a" s | ε;', ['', 'a', 'aaaa'], ['b']);
  language('s = t; t = s | "x";', ['x'], ['', 'xx']);
  language('s = ε | "a" s "b";', ['', 'ab', 'aabb', 'aaabbb'], ['aab', 'abab']);
  language('s = s;', [], ['', 'a']);
  language('s = s s | ε | "a";', ['', 'a', 'aa', 'aaa'], ['b']);
});
test('rekursive Nullable-Regeln hängen nicht von der Reihenfolge ab', () => {
  for (const text of ['s = a a; a = b | ε; b = a;', 's = a a; b = a; a = b | ε;']) language(text, [''], ['a']);
});
test('Generierung ist sortiert, begrenzt und erzeugt nur gültige Wörter', () => {
  for (const text of ['s = "a" {"b"};', 's = ε | "a" s "b";', 's = {"a" | "b"};', 's = s;']) {
    const r = rules(text), g = C.generate(r, 's'), run = C.recognizer(r, 's');
    assert.deepEqual(g.words, [...g.words].sort(C.wordOrder)); assert.ok(g.words.length <= 60);
    g.words.forEach(w => { assert.ok(Array.from(w).length <= 8); assert.ok(run(w)); });
  }
  assert.deepEqual(C.generate(rules('s = ε | "a" s "b";'), 's').words, ['', 'ab', 'aabb', 'aaabbb', 'aaaabbbb']);
});
test('zuverlässige Sprachbeschreibungen und zurückhaltende Grenzen', () => {
  const d = C.describe(rules('wort = "a" {"b"};'), 'wort'); assert.equal(d.exact, true); assert.match(d.math, /ⁿ/);
  const f = C.describe(rules('s = "a" ["b"];'), 's'); assert.equal(f.exact, true); assert.match(f.math, /"a", "ab"/);
  for (const text of ['s = ε | "a" s "b";', 's = {"a" | "b"};']) assert.equal(C.describe(rules(text), 's').exact, false);
  const eps = C.describe(rules('s = ε;'), 's'); assert.equal(eps.math, 'L(G) = { ε }');
});
test('negative Beispiele sind nachweislich nicht enthalten', () => {
  const r = rules('s = "a" {"b"};'), run = C.recognizer(r, 's'); C.negativeExamples(r, 's', ['a', 'ab']).forEach(w => assert.equal(run(w), false));
});
test('exakter Automatenvergleich akzeptiert unterschiedliche gleichwertige Schreibweisen', () => {
  for (const [a, b] of [
    ['s = "ab";', 's = "a" "b";'],
    ['s = ["a"];', 's = ε | "a";'],
    ['s = "a" {"b"};', 's = "a" | "ab" {"b"};'],
    ['s = {"a" | "b"};', 's = {"b" | "a"};'],
    ['s = t {t}; t = "0" | "1";', 'zahl = ("0" | "1") {"0" | "1"};']
  ]) assert.equal(C.equivalent(rules(a), 's', rules(b), rules(b)[0].name).kind, 'equal');
});
test('Unterschied: kürzestes Gegenbeispiel einschließlich ε', () => {
  const d = C.equivalent(rules('s = "a";'), 's', rules('s = ["a"];'), 's'); assert.equal(d.kind, 'different'); assert.equal(d.witness, '');
  const e = C.equivalent(rules('s = "a" {"b"};'), 's', rules('s = "a" ["b"];'), 's'); assert.equal(e.kind, 'different'); assert.equal(e.witness, 'abb');
});
test('rekursiver Vergleich behauptet keinen unbewiesenen Erfolg', () => {
  const r = rules('s = ε | "a" s "b";'); assert.equal(C.equivalent(r, 's', r, 's').kind, 'unknown');
  const d = C.equivalent(r, 's', rules('s = ε | "ab";'), 's'); assert.equal(d.kind, 'different'); assert.equal(d.witness, 'aabb');
});
test('rechtslineare rekursive Grammatiken lassen sich exakt vergleichen', () => {
  for (const [a, b] of [
    ['s = "a" s | ε;', 's = {"a"};'],
    ['s = "a" t | ε; t = "b" s;', 's = {"ab"};'],
    ['s = "a" [s];', 's = "a" {"a"};'],
    ['s = t; t = s | "x";', 's = "x";'],
    ['s = s;', 's = t; t = s;']
  ]) assert.equal(C.equivalent(rules(a), 's', rules(b), 's').kind, 'equal');
  const a = rules('s = "a" s | ε;'), b = rules('s = {"b"};');
  const diff = C.equivalent(a, 's', b, 's'); assert.equal(diff.kind, 'different'); assert.equal(diff.exact, true);
  assert.equal(C.equivalent(rules('s = "a" s "b" | ε;'), 's', rules('s = "a" s "b" | ε;'), 's').kind, 'unknown');
});
test('rekursive Automaten stimmen mit unabhängiger CFG-Wortprüfung überein', () => {
  const words = ['']; for (let i = 0; i < 4; i++) for (const w of [...words].filter(w => w.length === i)) for (const c of ['a', 'b']) words.push(w + c);
  for (const source of [
    's = "a" s | "b" t | ε; t = "a" s | "b";',
    's = ["a" s] | "b" t; t = s | ε;',
    's = {"a"} "b" t | ε; t = "a" s | "b" t;',
    's = t | "a"; t = u | ε; u = s;'
  ]) {
    const r = rules(source), nfa = C.compileNFA(r, 's'), run = C.recognizer(r, 's');
    for (const word of words) {
      let state = nfa.initial; for (const c of word) state = nfa.move(state, c);
      assert.equal(state.includes(nfa.final), run(word), `${source}: ${JSON.stringify(word)}`);
    }
  }
});
test('20 — alle bisherigen und neuen Trainingsaufgaben sind ausführbar', () => {
  assert.equal(exercises.length, 6);
  for (const ex of exercises) {
    const r = rules(ex.answer), starter = rules(ex.starter), g = C.generate(r, r[0].name); assert.ok(starter.length > 0); assert.ok(g.words.length > 0);
    const cmp = C.equivalent(r, r[0].name, r, r[0].name); assert.ok(['equal', 'unknown'].includes(cmp.kind));
  }
});
test('Roundtrip bewahrt Struktur und Sprache für alle Bausteine', () => {
  for (const text of [
    'wort = "a" ["b"] {"c"};', 's = ("a" | "b") "c";', 's = ε | "a" s "b";',
    's = {{["a"]} "b"};', 's = t {t}; t = "a" | "b";', 's = "a", ["b"], {"c"};', 's = "";', ''
  ]) {
    const a = rules(text), formatted = C.serialize(a), b = rules(formatted);
    assert.deepEqual(b, a); assert.equal(C.serialize(b), formatted);
    if (a.length) assert.notEqual(C.equivalent(a, a[0].name, b, b[0].name).kind, 'different');
  }
  assert.equal(C.parse('s = "a", "b";').legacyCommas, true);
  assert.equal(C.serialize(rules('s = "a", "b";')), 's = "a" "b";');
});
test('Ressourcengrenzen führen zu Fehlermeldungen statt Endlosschleifen', () => {
  assert.throws(() => C.parse('s = ' + '['.repeat(50) + '"a"' + ']'.repeat(50) + ';'), /verschachtelt/);
  assert.throws(() => accepts('s = {"a"};')('a'.repeat(161)), /160/);
  assert.throws(() => C.parse(' '.repeat(24001)), /zu groß/);
});
