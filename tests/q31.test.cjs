const {test} = require('node:test');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const A = require('../curriculum-tasks.js'), C = require('../core.js'), F = require('../formal.js'), W = require('../wiki3-engine.js'), Q = require('../assessment.js');
const task = id => A.tasks.find(t => t.id === id);
const get = (id, p) => task(id).parts.find(part => part.id === p);
const check = (id, p, answer, answers = {}) => Q.check(get(id, p), answer, task(id), answers);
const accepts = (source, start) => { const r = C.parse(source).rules; return C.recognizer(r, start || r[0].name); };
function all(chars, max) { const words = ['']; let level = ['']; for (let i = 0; i < max; i++) { level = level.flatMap(w => chars.map(c => w + c)); words.push(...level); } return words; }

test('Vier Module, alle 56 bisherigen Aufgaben, stabile Klausuren und transparenter Quellenstand', () => {
  assert.deepEqual(A.modules.map(m => m.id), ['M1', 'M2', 'M3', 'M4']);
  assert.deepEqual(A.modules.map(m => m.main.length), [4, 11, 11, 4]);
  assert.equal(A.tasks.length, 74); assert.equal(A.tasks.reduce((s, t) => s + t.parts.length, 0), 283);
  for (const [prefix, count, offset] of [['A', 8, 1], ['B', 12, 1], ['C', 12, 1], ['D', 12, 1], ['E', 6, 1], ['W', 6, 0]]) for (let n = offset; n < count + offset; n++) assert.ok(task(prefix + n), prefix + n);
  assert.deepEqual(A.q31.missingSources, ['Wikiseite 1']); assert.equal(A.modules[0].sourceGap, true);
  assert.ok(A.tasks.filter(t => t.module === 'M1').every(t => t.intro.includes('Eigene Einstiegsaufgabe')));
  assert.equal(JSON.stringify(A.tasks).includes('−114'), false); assert.equal(JSON.stringify(A.tasks).includes('-114'), false);
  for (const m of A.modules) { assert.equal(new Set(m.main).size, m.main.length); assert.ok(m.main.every(id => task(id).module === m.id && !task(id).practice)); }
});
test('Gespeicherte Hilfestufen werden begrenzt, mit Hilfenutzung markiert und in Klausuren nicht übernommen', () => {
  for (const [value, expected] of [[2, 2], [999, 3], [-1, 0], [1.5, 0], ['2', 0], [Infinity, 0]]) {
    const clean = Q.cleanProgress({version: '4.1', attempts: {F1: {hintCount: value}}}, A);
    assert.equal(clean.attempts.F1.hintCount, expected);
    assert.equal(clean.attempts.F1.assisted, expected > 0);
  }
  const clean = Q.cleanProgress({version: '4.1', attempts: {'K1:A1': {hintCount: 3}}}, A);
  assert.equal(clean.attempts['K1:A1'].hintCount, 0);
});
test('Hilfestufen bleiben beim Lernstands-Roundtrip erhalten; alte Antworten ohne Hilfestufe bleiben nutzbar', () => {
  const raw = {version: '4.1', attempts: {F2: {hintCount: 2, answers: {c: {text: 'Eigene Begründung'}}}, A1: {answers: {c: {text: 'S -> aS -> aaS -> aaaS -> aaab'}}}}};
  const clean = Q.cleanProgress(JSON.parse(JSON.stringify(raw)), A), twice = Q.cleanProgress(JSON.parse(JSON.stringify(clean)), A);
  assert.equal(twice.attempts.F2.hintCount, 2); assert.equal(twice.attempts.F2.assisted, true);
  assert.equal(twice.attempts.F2.answers.c.text, 'Eigene Begründung');
  assert.equal(twice.attempts.A1.hintCount, 0); assert.equal(check('A1', 'c', twice.attempts.A1.answers.c).status, 'correct');
});
test('Originalquellen vollständig erhalten und durch SHA-256 nachvollziehbar', () => {
  const dir = path.join(__dirname, '../materials/q31'), manifest = JSON.parse(fs.readFileSync(path.join(dir, 'sources.json')));
  assert.equal(manifest.provided.length, 6);
  for (const entry of manifest.provided) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, entry.file))).digest('hex'), entry.sha256);
  for (const f of ['ebnf2-material1.png', 'ebnf2-material2.png', 'ebnf2-material3.png', 'ebnf2-material4.png', 'grammatiken-diagramm.png']) assert.ok(fs.statSync(path.join(dir, f)).size > 1000);
  for (let n = 1; n <= 10; n++) assert.ok(A.tasks.some(t => t.source?.sheet === 'grammatiken' && t.source.exercises.includes(n)), 'Grammatikaufgabe ' + n);
  for (const n of [1, '2a', 3, 4]) assert.ok(A.tasks.some(t => t.source?.sheet === 'ebnf2' && t.source.exercises.includes(n)), 'EBNF-II ' + n);
});
test('Abschnitte verbergen keine Aufgaben und methodische Hilfen verraten nicht den ganzen Lösungsweg', () => {
  for (const t of A.tasks) {
    assert.ok(t.hints.length >= 3 && t.hints.length <= 5, t.id);
    if (t.sections) assert.deepEqual(t.sections.flatMap(s => s.ids).sort(), t.parts.map(p => p.id).sort(), t.id);
  }
  assert.ok(task('A1').hints.every(h => !h.includes('dreimal')));
  assert.match(get('W3', 'g').prompt, /Korrektheit und Vollständigkeit/);
});
test('Wahlwege A und B zählen für den Bearbeitungsfortschritt gemeinsam als ein Lernschritt', () => {
  assert.deepEqual(A.moduleStatus('M2', {}), {total: 10, done: 0});
  assert.deepEqual(A.moduleStatus('M2', {G10A: {checked: true}}), {total: 10, done: 1});
  assert.deepEqual(A.moduleStatus('M2', {G10B: {submitted: true}}), {total: 10, done: 1});
  assert.deepEqual(A.moduleStatus('M2', {G10A: {checked: true}, G10B: {checked: true}}), {total: 10, done: 1});
});
test('Das Datum darf als EBNF oder Diagramm modelliert werden; gleiche Leistung wird nicht doppelt verlangt', () => {
  const t = task('H3'), code = {workspace: {text: get('H3', 'a').answer}}, drawing = {workspace: {text: get('H3', 'c').answer}, edits: 1};
  for (const answers of [{a: code}, {c: drawing}, {a: code, c: drawing}]) {
    const s = Q.summary(t, answers); assert.equal(s.auto, 7); assert.equal(s.autoMax, 12); assert.equal(s.manualMax, 3); assert.equal(Q.maximum(t), 15);
  }
});
test('EBNF-Komma/Punkt und Leerraum/Semikolon beschreiben dieselbe Sprache; echte Zeichen bleiben erhalten', () => {
  const wiki = 'Zahl = [ Vorzeichen ], Ziffer, { Ziffer } .\nVorzeichen = "+" | "-" .\nZiffer = "0" | "1" | "2" .';
  const r = C.parse(wiki).rules, canon = C.serialize(r);
  assert.equal(C.equivalent(r, 'Zahl', C.parse(canon).rules, 'Zahl').kind, 'equal');
  for (const w of ['0', '+12', '-002']) assert.equal(C.recognizer(r, 'Zahl')(w), true);
  assert.equal(accepts('Liste = "x", { ",", "x" }, "." .')('x,x.'), true);
  assert.equal(accepts('Liste = "x", { ",", "x" }, "." .')('x,x'), false);
  assert.throws(() => C.parse('Wort = "a", .'), /Baustein/);
  assert.throws(() => C.parse('Wort = "a"..'), /erwartet/);
});
test('BNF mit ::=, umbenannten Nichtterminalen und vertauschten Regeln wird semantisch akzeptiert', () => {
  const own = {text: '<D> ::= "2" | "1" | "0" | "3" | "4" | "5" | "6" | "7" | "8" | "9"\n<N> ::= <D><N> | <D>', start: '<N>'};
  assert.equal(check('G11', 'a', own).status, 'correct');
  assert.equal(check('G11', 'a', {text: '<Zahl> ::= "0" | "1"'}).status, 'incorrect');
  assert.equal(check('G11', 'b', {workspace: {text: 'N = D, {D}.\nD = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9".'}}).status, 'correct');
});
test('Rekursive EBNF-Struktur liefert echten Beweis; andere Umformung bleibt ehrlich offen', () => {
  const p = get('C10', 'a');
  assert.equal(check('C10', 'a', {workspace: {text: p.answer}}).status, 'correct');
  assert.equal(check('C10', 'a', {workspace: {text: 'Anders = ["(" Anders ")"];'}}).status, 'open');
  assert.equal(W.ebnfIsomorphic(C.parse('S = A B; A = "a"; B = "b";').rules, 'S', C.parse('Q = Z Z; Z = "a";').rules, 'Q'), false);
  assert.equal(W.ebnfIsomorphic(C.parse('S = "a" S | "b";').rules, 'S', C.parse('T = "c" T | "b";').rules, 'T'), false);
  const renamed = A.q31.mailEBNF.replace(/Adressliste/g, 'Empfaenger').replace(/Adresse/g, 'Briefkasten').split('\n').reverse().join('\n');
  assert.equal(check('H4', 'b', {workspace: {text: renamed, start: 'Empfaenger'}}).status, 'correct');
});
test('Eigenständig gewählte verschiedene Ableitungen werden einzeln geprüft statt mit Mustertext verglichen', () => {
  assert.equal(check('A2', 'e', {text: 'S -> aS -> aaS -> aaaS -> aaab\nS -> b\nS -> aS -> ab'}).status, 'correct');
  assert.equal(check('A2', 'f', {text: 'S -> ε\nS -> aSb -> ab\nS -> aSb -> aaSbb -> aabb'}).status, 'correct');
  assert.equal(check('A2', 'f', {text: 'S -> ε\nS -> ε\nS -> ε'}).autoEarned, 2);
  assert.equal(check('A2', 'e', {text: 'S -> aaab\nS -> ab\nS -> b'}).status, 'incorrect');
  const own = {text: '<Start> -> "a" <Rest>\n<Rest> -> "a" <Rest> | "b" <Rest> | "b"', start: '<Start>'};
  assert.equal(check('G10A', 'a', own).status, 'correct');
  assert.equal(check('G10A', 'c', {text: '<Start> -> a<Rest> -> aa<Rest> -> aab\n<Start> -> a<Rest> -> ab'}, {a: own}).status, 'correct');
  assert.equal(check('G10A', 'c', {text: '<Start> -> ab'}, {a: own}).status, 'incorrect');
  assert.equal(check('G10A', 'c', {text: 'S -> a\nS -> b'}, {a: {text: 'S -> a | b'}}).autoEarned, 0);
});
test('Grammatikaufgaben 5: mindestens abc und Verbot von aaa gegen unabhängige Sprachbedingungen', () => {
  const g = task('G5'); const abc = accepts(g.parts[6].answer), noTriple = accepts(g.parts[9].answer);
  for (const w of all(['a', 'b', 'c'], 5)) assert.equal(abc(w), w.includes('abc'), w);
  for (const w of all(['a', 'b'], 8)) assert.equal(noTriple(w), !w.includes('aaa'), w);
  for (const p of g.parts.filter(p => p.kind === 'ebnf')) assert.equal(Q.check(p, {workspace: {text: p.answer}}, g).status, 'correct');
});
test('Original-Wortdiagramm: alle Wege gegen unabhängigen regulären Ausdruck', () => {
  const run = accepts(A.q31.diagramWord);
  for (const w of all(['a', 'b', 'c', 'x'], 6)) assert.equal(run(w), /^[ab]a*x?(?:b*a|c)$/.test(w), w);
});
test('Dateinamen aus Aufgabe 7 verwenden genau drei Erweiterungszeichen, auch Ziffern und Großbuchstaben', () => {
  const run = accepts(A.q31.filenames);
  for (const w of get('G7', 'b').samples) assert.equal(run(w), /^[A-Za-z0-9]+\.[A-Za-z0-9]{3}$/.test(w), w);
  for (const w of ['0.000', 'A.a1Z', 'abc.xyz']) assert.equal(run(w), true);
  for (const w of ['.abc', 'a.ab', 'a.abcd', 'a.a?c', 'ä.abc']) assert.equal(run(w), false);
});
test('Bitaufgaben und vollständige Typ-1-Grammatik behalten Reihenfolge und Zählbedingungen', () => {
  for (const [id, terminal] of [['G8', '1'], ['G9', '0']]) {
    const run = accepts(id === 'G8' ? 'S = "1" S "0" | ε;' : 'T = "0" T "1" | ε;');
    for (let n = 0; n < 8; n++) assert.equal(run(terminal.repeat(n) + (terminal === '1' ? '0' : '1').repeat(n)), true);
  }
  assert.equal(F.classify(F.parse(task('B13').formal)).type, 1);
  assert.equal(check('B13', 'b', {text: get('B13', 'b').solution}).status, 'correct');
  assert.equal(check('B13', 'b', {text: 'S -> aSBC -> aabbcc'}).status, 'incorrect');
});
test('EBNF-II 1: Originalpfad lässt führendes Komma zu, bereinigte Fassung verhindert es', () => {
  const r = C.parse(A.q31.sentence).rules, original = C.recognizer(r, 'Wortgruppe'), corrected = accepts(get('H1', 'c').answer);
  for (const w of ['Katzen', 'Mäuse', 'schwarzeKatzen', 'schwarze,weißeKatzen']) { assert.equal(original(w), true); assert.equal(corrected(w), true); }
  assert.equal(original(',schwarzeKatzen'), true); assert.equal(corrected(',schwarzeKatzen'), false);
  assert.equal(original('schwarze,Katzen'), false); assert.equal(corrected('schwarze,Katzen'), false);
  assert.equal(C.recognizer(r, 'Satz')('Katzenessenlangsam.'), true);
  assert.equal(C.recognizer(r, 'Satz')('KatzenessenMäuseschnell.'), false);
});
test('EBNF-II 2: Operator und Zahl werden gemeinsam und nicht getrennt wiederholt', () => {
  const run = accepts(A.q31.term);
  for (const w of ['z', 'z*z', 'z/z*z']) assert.equal(run(w), true);
  for (const w of ['', '*z', 'z*', 'zz', 'z**z']) assert.equal(run(w), false);
});
test('EBNF-II 3: Stellenzahlen, unabhängige Trenner und Kalenderabgrenzung', () => {
  const run = accepts(A.q31.date);
  for (let day = 1; day <= 31; day++) for (let month = 1; month <= 12; month++) for (const separators of ['..', '.-', '-.', '--']) assert.equal(run(String(day).padStart(2, '0') + separators[0] + String(month).padStart(2, '0') + separators[1] + '12345'), true);
  for (const w of ['31.02.2023', '29-02-1', '13.11-12554']) assert.equal(run(w), true);
  for (const w of ['00.01.2', '32.01.2', '01.00.2', '01.13.2', '1.01.2', '01.1.2', '01/01/2', '01.01.002', '01.01.']) assert.equal(run(w), false, w);
  const p = get('H3', 'a'); assert.equal(check('H3', 'a', {workspace: {text: p.alternatives[0]}}).status, 'correct');
  assert.equal(accepts(p.alternatives[0])('01.01.0'), true);
  const wrong = p.answer.replace('Tag =', 'Tag = "00" |');
  assert.equal(check('H3', 'a', {workspace: {text: wrong}}).status, 'incorrect');
});
test('EBNF-II 4: Adressen, Gruppen, echte Leerzeichen und ASCII-Zeichen exakt nach Material', () => {
  const run = accepts(A.q31.mailEBNF);
  for (const w of [get('H4', 'd').samples[0], A.q31.mailTarget, 'a@b.c', '<a@b.c>', 'Wer? <a@b.c>', 'Team:;', 'Team:a@b.c, d@e.f;', '"A  B" <a@b.c>']) assert.equal(run(w), true, w);
  for (const w of [get('H4', 'd').samples[1], '"Gut!" mut@ard.de', '"" <a@b.c>', '"Tim Müller" <a@b.c>', 'a@b', 'a..b@c.de', 'a@b.c,d@e.f', 'A  B <a@b.c>', '"A"B" <a@b.c>', '']) assert.equal(run(w), false, w);
  for (const id of ['b', 'c']) assert.equal(check('H4', id, {edits: 1, workspace: {text: get('H4', id).answer}}).status, 'correct');
});
test('E-Mail-Ableitung erlaubt nur nachgewiesene Wort-/Textblöcke und keine globale Abkürzung', () => {
  const p = get('H4', 'f');
  assert.equal(check('H4', 'f', {text: p.solution}).status, 'correct');
  assert.equal(check('H4', 'f', {text: p.solution.split(' -> ').join('\n')}).status, 'correct');
  assert.equal(check('H4', 'f', {text: '<Adressliste> -> ' + JSON.stringify(p.target)}).status, 'incorrect');
  assert.equal(check('H4', 'f', {text: p.solution.replace('Betty H', 'Betty Ü')}).status, 'incorrect');
  assert.equal(check('H4', 'f', {text: p.solution.replace('home.gmx.', 'home..gmx.')}).status, 'incorrect');
});
test('Alte Lernstände und neue Mehrfachableitungen überstehen Import mit vollständigem Antwortkontext', () => {
  const source = 'S \u21d2 aS \u21d2 ab\nS \u21d2 b\nS \u21d2 aS \u21d2 aaS \u21d2 aab';
  const raw = {version: '4.1', attempts: {A1: {answers: {c: {text: 'S -> aS -> aaS -> aaaS -> aaab'}}}, A2: {answers: {e: {text: source}}}, H4: {answers: {f: {text: A.q31.mailDerive}}}}};
  const cleaned = Q.cleanProgress(raw, A);
  assert.equal(check('A1', 'c', cleaned.attempts.A1.answers.c).status, 'correct');
  assert.equal(check('A2', 'e', cleaned.attempts.A2.answers.e).status, 'correct');
  assert.equal(check('H4', 'f', cleaned.attempts.H4.answers.f).status, 'correct');
  assert.equal(JSON.stringify(cleaned).includes('\u21d2'), false);
});
