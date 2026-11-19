const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const A = require('../curriculum-tasks.js'), C = require('../core.js'), F = require('../formal.js'), Q = require('../assessment.js'), W = require('../wiki3-engine.js');
const task = id => A.tasks.find(t => t.id === id), part = (id, p) => task(id).parts.find(x => x.id === p);
const check = (id, p, answer, answers = {}) => Q.check(part(id, p), answer, task(id), answers);
const wrap = s => '\\begin{itemize}' + s + '\\end{itemize}', item = s => '\\item' + s;
function all(alphabet, length) { const out = ['']; let layer = ['']; for (let n = 1; n <= length; n++) { layer = layer.flatMap(p => alphabet.map(c => p + c)); out.push(...layer); } return out; }

test('Wikiseite 3: vollständige Zuordnung, fünf Bereiche und Vorbereitung', () => {
  const tasks = A.tasks.filter(t => t.legacyModule === 'W');
  assert.deepEqual(tasks.map(t => t.id), ['W0', 'W1', 'W2', 'W3', 'W4', 'W5']);
  assert.equal(tasks.reduce((s, t) => s + t.parts.length, 0), 33);
  assert.deepEqual(tasks.map(t => /Arbeitsblatt Aufgabe (\d)/.exec(t.intro)[1]), ['1', '2', '4', '3', '5', '6']);
  assert.ok(tasks.every(t => t.hints.length >= 3));
  for (const file of ['arbeitsblatt.docx', 'material2-listen.png', 'material3-diagramme.png']) assert.ok(fs.statSync(require('node:path').join(__dirname, '../materials/wiki3', file)).size > 1000);
  assert.equal(A.wiki3.material1.replace(/\s/g, ''), wrap(item('$42$') + item(wrap(item('$43$') + item('$\\frac{5}{3}$'))) + item('$\\frac{1}{2}$')));
});
test('W1: Wortentscheidungen und D-Abschluss einschließlich des nötigen Suffixes', () => {
  const g = F.parse(task('W1').formal), run = C.recognizer(F.toEBNF(g), 'S');
  assert.deepEqual(part('W1', 'a').samples.map(run), [true, false, true]);
  for (const w of all(['a', 'b', 'c', 'd'], 6)) assert.equal(run(w), /abcd[a-d]+/.test(w), w);
  assert.equal(check('W1', 'a', {choices: {0: 'Ja', 1: 'Nein', 2: 'Ja'}}).status, 'correct');
  for (const p of ['b', 'd']) assert.equal(check('W1', p, {text: part('W1', p).solution}).status, 'correct');
  assert.equal(check('W1', 'b', {text: 'S -> abdabcdba'}).status, 'incorrect');
  // Another legal sequence postpones the final D elimination.
  assert.equal(F.derivation(g, 'S -> aA -> abB -> abcC -> abcdD -> abcdaD -> abcdaa', 'abcdaa').complete, true);
});
test('W2: präzise Vereinigung beider Sprachfamilien unabhängig von der Grammatik', () => {
  const run = C.recognizer(F.toEBNF(F.parse(task('W2').formal, 'Z')), 'Z'), expected = new Set();
  for (let n = 0; n <= 6; n++) for (let m = 0; m <= 6; m++) {
    expected.add('u'.repeat(n) + 'v'.repeat(m) + 'w' + 'u'.repeat(m) + 'v'.repeat(n));
    expected.add('u'.repeat(n) + 'v'.repeat(m + 1) + 'u'.repeat(m) + 'v'.repeat(n));
  }
  for (const w of all(['u', 'v', 'w'], 6)) assert.equal(run(w), expected.has(w), w);
  assert.equal(check('W2', 'a', {choices: {0: '2'}}).status, 'correct');
  assert.equal(check('W2', 'd', {text: 'w\nv\nuvwvv'}).autoEarned, 2);
  assert.equal(check('W2', 'e', {text: part('W2', 'e').solution}).status, 'correct');
});
test('W2: beliebige gültige, aber aussichtslose Zweige werden exakt erkannt', () => {
  for (const text of ['Z -> uZv -> uuZvv', 'Z -> X -> vXu', 'Z -> uZv -> uXv -> uvXuv -> uvvXuuv -> uvvvXuuuv']) assert.equal(check('W2', 'f', {text}).status, 'correct', text);
  for (const text of ['Z', 'Z -> uZv', 'Z -> uZv -> uXv', 'Z -> uuZvv', 'Z -> X -> w']) assert.equal(check('W2', 'f', {text}).status, 'incorrect', text);
  assert.match(check('W2', 'f', {text: 'Z -> X -> vXu'}).feedback.join(' '), /nicht mehr erreichbar/);
});
test('W3: Mustergrammatik erfüllt genau die Wagenzahlen und Reihenfolge', () => {
  const p = part('W3', 'b'), g = W.grammar(p.model, p.defaultStart), run = C.recognizer(F.toEBNF(g), 'Z');
  for (let n = 0; n <= 20; n++) for (const k of [0, n, 2 * n - 1, 2 * n, 2 * n + 1].filter(k => k >= 0)) assert.equal(run('t' + '1'.repeat(n) + 's' + '2'.repeat(k)), n >= 1 && k === 2 * n);
  for (const w of ['tt1s22', '1ts22', 't21s2', 't1ss22']) assert.equal(run(w), false);
  assert.equal(check('W3', 'a', {text: 't 1 s 2 2'}).status, 'correct');
  assert.equal(check('W3', 'a', {text: 'ts'}).status, 'incorrect');
});
test('Freie Grammatiken: Umbenennung, Reihenfolge, Terminalgruppierung und Duplikate', () => {
  for (const answer of [
    {text: 'B -> 1s22 | 1B22\nA -> tB', start: 'A'},
    {text: '<Wagen> -> "1" <Wagen> "22" | "1s22"\n<Start> -> "t" <Wagen>\n<Wagen> -> "1s22"', start: '<Start>'},
    {text: 'Z -> tW\nW -> 1W22 | 1s22\n<Ungenutzt> -> x', start: 'Z'}
  ]) assert.equal(check('W3', 'b', answer).status, 'correct', JSON.stringify(answer));
  assert.equal(check('W3', 'b', {text: 'Z -> tW\nW -> 1W2 | 1s22'}).status, 'incorrect');
  assert.match(check('W3', 'b', {text: 'Z -> tW\nW -> 1W2 | 1s22'}).feedback.join(' '), /Gegenbeispiel/);
});
test('Alternative rekursive Konstruktion bleibt offen statt falsch oder unbewiesen richtig', () => {
  const answer = {text: 'Z -> tA\nA -> 1A22 | 1B22\nB -> s', start: 'Z'};
  const result = check('W3', 'b', answer);
  assert.equal(result.status, 'open'); assert.equal(result.autoEarned, 0); assert.equal(result.pending, 5);
  assert.match(result.feedback.join(' '), /beweist keine Gleichwertigkeit/);
  // An unmatched unreachable or reused nonterminal cannot counterfeit a proof.
  assert.equal(W.isomorphic(W.grammar('S -> AB\nA -> a\nB -> b', 'S'), W.grammar('S -> AA\nA -> a', 'S')), false);
});
test('Eigene Klassifikation bewertet tatsächliche Regeln unabhängig vom Sprachvergleich', () => {
  const b = {text: 'Q -> tR\nR -> 1R22 | 1s22', start: 'Q'};
  assert.equal(check('W3', 'c', {choice: '2'}, {b}).status, 'correct');
  assert.equal(check('W3', 'c', {choice: '3'}, {b}).status, 'incorrect');
  assert.equal(check('W3', 'c', {choice: '3'}, {b: {text: 'Z -> t1s22'}}).status, 'correct');
  assert.equal(check('W3', 'b', {text: 'Z -> t1s22'}).status, 'incorrect');
  assert.equal(check('W3', 'c', {choice: '1'}, {b: {text: 'Z -> AB\nAB -> BA\nA -> a\nB -> b'}}).status, 'correct');
});
test('W4: alle vier Wahrheitswerte und gesonderte Begründungen', () => {
  assert.equal(check('W4', 'a', {choices: {0: 'Richtig', 1: 'Richtig', 2: 'Falsch', 3: 'Falsch'}}).status, 'correct');
  assert.match(part('W4', 'c').solution, /ε-erweiterten/);
  for (const p of task('W4').parts.filter(p => p.kind === 'text')) assert.equal(check('W4', p.id, {text: p.solution}).status, 'manual');
});
test('W5: Zahl erkennt 0, positive Zahlen und Brüche, verbietet führende Nullen und Nullnenner', () => {
  const r = C.parse(A.wiki3.number).rules, run = C.recognizer(r, 'Zahl');
  for (const w of ['$0$', '$1$', '$42$', '$100$', '$\\frac{0}{1}$', '$\\frac{5}{3}$', '$\\frac{123}{456}$']) assert.equal(run(w), true, w);
  for (const w of ['', '$$', '42', '$00$', '$01$', '$-1$', '$1.2$', '$\\frac{1}{0}$', '$\\frac{1}{00}$', '$\\frac{01}{2}$', '$\\frac{1}{02}$', '$\\frac{}{1}$', '$\\frac{1}{}$', '$\\frac{1}{2}$$']) assert.equal(run(w), false, w);
  const renamed = A.wiki3.number.replace(/Zahl/g, 'Ausdruck').replace(/Nat/g, 'Ganz').replace(/Pos/g, 'Plus');
  assert.equal(check('W5', 'd', {edits: 1, workspace: {text: renamed, start: 'Ausdruck'}}).status, 'correct');
});
test('W5: LaTeX-Grammatik prüft Mindestlänge, beliebige Listenelemente und Schachtelung', () => {
  const p = part('W5', 'e'), g = W.grammar(p.model, p.defaultStart), run = C.recognizer(F.toEBNF(g), g.start);
  const original = A.wiki3.material1.replace(/\s/g, ''); assert.equal(run(original), true);
  for (const w of [wrap(item('$0$')), wrap(item('$42$') + item('$\\frac{5}{3}$')), wrap(item(wrap(item('$43$'))) + item('$0$')), wrap(item(wrap(item(wrap(item('$1$'))))))]) assert.equal(run(w), true, w);
  for (const w of [wrap(''), wrap(item(wrap(''))), wrap('$42$'), wrap(item('42')), wrap(item('$01$')), wrap(item('$\\frac{1}{0}$')), wrap(item('$42$')) + wrap(item('$1$'))]) assert.equal(run(w), false, w);
  assert.equal(check('W5', 'e', {text: p.model}).status, 'correct');
  const renamed = p.model.replace(/Liste/g, 'Sammlung').replace(/Elemente/g, 'Teile').split('\n').reverse().join('\n');
  assert.equal(check('W5', 'e', {text: renamed, start: '<Sammlung>'}).status, 'correct');
  const wrong = p.model.replace('<Nat> → "0" | <Pos>', '<Nat> → "0" | <Pos> | "01"');
  assert.equal(check('W5', 'e', {text: wrong}).status, 'incorrect');
});
test('Material 3: nachgezeichnete Diagramme und Zahl-Modell stimmen mit der Gesamtgrammatik überein', () => {
  const rules = C.parse(A.wiki3.diagrams + '\n' + A.wiki3.number).rules, run = C.recognizer(rules, 'Liste');
  const model = W.grammar(A.wiki3.latex, '<Liste>'), reference = C.recognizer(F.toEBNF(model), model.start);
  assert.deepEqual(C.diagnostics(rules), []);
  for (const w of [...part('W5', 'e').cases, A.wiki3.material1.replace(/\s/g, '')]) assert.equal(run(w), reference(w), w);
  assert.equal(run(wrap('')), false); assert.equal(run(wrap(item('$42$'))), true);
});
test('W5: Ableitung wird mit der eigenen Grammatik und beliebiger zulässiger Schrittfolge geprüft', () => {
  const e = {text: A.wiki3.latex}, f = {text: A.wiki3.latexDerive};
  assert.equal(check('W5', 'f', f, {e}).status, 'correct');
  const own = {text: A.wiki3.latex.replace(/Liste/g, 'Sammlung'), start: '<Sammlung>'};
  assert.equal(check('W5', 'f', {text: f.text.replace(/Liste/g, 'Sammlung')}, {e: own}).status, 'correct');
  assert.equal(check('W5', 'f', f, {e: own}).status, 'incorrect');
  assert.equal(check('W5', 'f', f).status, 'incorrect');
  // Simple alternative grammar permits several production orders; checking
  // individual derivations does not assert whole-language equivalence.
  const simple = {text: '<Start> -> "\\\\begin{itemize}\\\\item$" AB "$\\\\end{itemize}"\nA -> 4\nB -> 2', start: '<Start>'};
  for (const text of ['<Start> -> "\\\\begin{itemize}\\\\item$"AB"$\\\\end{itemize}" -> "\\\\begin{itemize}\\\\item$"A2"$\\\\end{itemize}" -> "\\\\begin{itemize}\\\\item$42$\\\\end{itemize}"', '<Start> -> "\\\\begin{itemize}\\\\item$"AB"$\\\\end{itemize}" -> "\\\\begin{itemize}\\\\item$4"B"$\\\\end{itemize}" -> "\\\\begin{itemize}\\\\item$42$\\\\end{itemize}"']) assert.equal(check('W5', 'f', {text}, {e: simple}).status, 'correct');
});
test('Benannte Nichtterminale sind opt-in, Terminale, EBNF und alte Produktionsform bleiben erhalten', () => {
  assert.equal(F.parse('S -> aS | b').named, undefined);
  assert.throws(() => F.parse('S -> a', 'Start'), /einzelner Großbuchstabe/);
  const g = W.grammar('<Start> -> "A" <Rest> | "\\\\item"\n<Rest> -> "->"', '<Start>');
  assert.equal(F.derivation(g, '<Start> -> "A"<Rest> -> "A->"', 'A->').complete, true);
  assert.equal(F.derivation(g, '<Start> -> "\\\\item"', '\\item').complete, true);
  const forms = F.splitDerivation(A.wiki3.latexDerive).map(s => F.symbols(s, true));
  for (const form of forms) assert.deepEqual(F.symbols(F.display(form), true), form);
  assert.throws(() => W.grammar('<Start> -> <Fehlt>', '<Start>'), /Definition/);
});
test('LaTeX ignoriert Leerraum auch in zitierten Terminalfolgen und Ableitungsschritten', () => {
  const e = {text: A.wiki3.latex.replace(/item"/g, 'item "'), start: '  <Liste>  '};
  assert.equal(check('W5', 'e', e).status, 'correct');
  const text = A.wiki3.latexDerive.replace(/item(?=["$])/g, 'item ');
  assert.equal(check('W5', 'f', {text}, {e}).status, 'correct');
  const ordinary = W.grammar('<Start> -> "a b"', '<Start>');
  assert.equal(C.recognizer(F.toEBNF(ordinary), ordinary.start)('ab'), false);
  assert.equal(C.recognizer(F.toEBNF(ordinary), ordinary.start)('a b'), true);
  assert.equal(part('W5', 'e').ignoreWhitespace, true);
});
test('Neue Antworten, Startsymbole und Ableitungen bleiben nach validiertem Import erhalten', () => {
  const raw = {version: '4.1', attempts: {W3: {answers: {b: {text: 'Q -> tR\nR -> 1R22 | 1s22', start: 'Q'}, c: {choice: '2'}}}, W5: {answers: {e: {text: A.wiki3.latex}, f: {text: A.wiki3.latexDerive.replaceAll('->', '\u21d2')}}}}};
  const clean = Q.cleanProgress(raw, A);
  assert.equal(Q.summary(task('W3'), clean.attempts.W3.answers).parts.find(p => p.id === 'c').status, 'correct');
  assert.equal(Q.summary(task('W5'), clean.attempts.W5.answers).parts.find(p => p.id === 'f').status, 'correct');
  assert.equal(JSON.stringify(clean).includes('\u21d2'), false);
  assert.equal(check('W3', 'b', {text: 'Z -> tW', start: 'Z'}).status, 'incorrect');
});
