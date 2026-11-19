const {test} = require('node:test');
const assert = require('node:assert/strict');
const A = require('../curriculum-tasks.js'), Q = require('../assessment.js'), C = require('../core.js'), F = require('../formal.js');
const task = id => A.tasks.find(t => t.id === id), part = (id, p) => task(id).parts.find(x => x.id === p);
test('74 Aufgaben in vier Lernmodulen; bisherige IDs bleiben erhalten', () => {
  assert.equal(A.tasks.length, 74); assert.equal(new Set(A.tasks.map(t => t.id)).size, 74);
  assert.deepEqual(A.modules.map(m => A.tasks.filter(t => t.module === m.id).length), [4, 41, 19, 10]);
  assert.deepEqual(A.hierarchy.map(h => h.type), [3, 2, 1, 0]);
  for (const h of A.hierarchy) assert.equal(F.classify(F.parse(h.example)).type, h.type);
});
test('Alle Teilaufgaben besitzen BE, AFB, ein implementiertes Format und vollständige Lösungen', () => {
  const kinds = new Set(['text', 'ebnf', 'draw', 'derive', 'tree', 'words', 'examples', 'sets', 'choice', 'classify', 'mapping', 'compare', 'word', 'grammar', 'own-classify', 'own-derive', 'dead-derive', 'derivations', 'chunk-derive']);
  for (const t of A.tasks) {
    assert.ok(t.title && t.intro && t.hint); assert.equal(new Set(t.parts.map(p => p.id)).size, t.parts.length);
    for (const p of t.parts) {
      assert.ok(kinds.has(p.kind)); assert.ok(p.be > 0); assert.ok(['I', 'II', 'III'].includes(p.afb));
      if (p.kind === 'text') { assert.ok(p.solution); assert.equal(p.criteria.reduce((s, c) => s + c[1], 0), p.be); }
    }
  }
});
test('Sämtliche EBNF-Musterlösungen sind gültig, definiert und ohne Folgetrennkommas', () => {
  for (const t of A.tasks) for (const p of t.parts) if (p.answer) {
    const parsed = C.parse(p.answer); assert.equal(parsed.legacyCommas, false, t.id + p.id); assert.deepEqual(C.diagnostics(parsed.rules), []);
    const formatted = C.serialize(parsed.rules); assert.equal(C.equivalent(parsed.rules, parsed.rules[0].name, C.parse(formatted).rules, parsed.rules[0].name).kind === 'different', false);
    if (['ebnf', 'draw'].includes(p.kind)) {
      const result = Q.check(p, {workspace: {text: p.answer, validText: p.answer, start: parsed.rules[0].name}, edits: 1}, t);
      assert.ok(['correct', 'open'].includes(result.status), `${t.id}${p.id}: ${result.feedback}`);
    }
  }
});
test('Alle Musterableitungen erreichen ihr Ziel in zulässigen Schritten', () => {
  for (const t of A.tasks) for (const p of t.parts) if (['derive', 'tree'].includes(p.kind)) {
    const g = F.parse(t.formal, t.start || 'S'), d = F.derivation(g, p.solution, p.target, p.order || 'any'); assert.ok(d.complete, t.id + p.id);
    const answer = p.kind === 'tree' ? {forms: F.splitDerivation(p.solution)} : {text: p.solution};
    assert.equal(Q.check(p, answer, t).autoEarned, p.be);
  }
});
test('Alle aktuellen Aufgaben und Unterrichtsdokumente verwenden einheitliche Ableitungspfeile', () => {
  const fs = require('node:fs'), path = require('node:path');
  assert.equal(JSON.stringify(A).includes('\u21d2'), false);
  for (const file of ['README.md', 'KLAUSUREN.md', 'AUFGABENRASTER.md']) assert.equal(fs.readFileSync(path.join(__dirname, '..', file), 'utf8').includes('\u21d2'), false, file);
  const g = F.parse(task('A1').formal), d = F.derivation(g, part('A1', 'c').solution, 'aaab');
  assert.ok(d.complete);
  const result = Q.check(part('A1', 'c'), {text: part('A1', 'c').solution}, task('A1'));
  assert.ok(result.feedback.some(s => s.includes('S -> aS')));
  assert.ok(result.feedback.some(s => s.includes('Regel S → aS')));
});
test('Gespeicherte Ableitungsantworten werden ohne Änderungen an EBNF und Produktionen migriert', () => {
  const old = 'S \u21d2 aS \u21d2 aaS \u21d2 aaaS \u21d2 aaab';
  const ebnf = 's = "\u21d2";';
  const saved = Q.cleanProgress({version: '4.1', attempts: {
    A1: {answers: {c: {text: old}}, submitted: true},
    C2: {answers: {a: {workspace: {text: ebnf, validText: ebnf, start: 's'}}}}
  }}, A);
  const answer = saved.attempts.A1.answers.c;
  assert.equal(answer.text, 'S -> aS -> aaS -> aaaS -> aaab');
  assert.equal(Q.check(part('A1', 'c'), answer, task('A1')).autoEarned, part('A1', 'c').be);
  assert.equal(saved.attempts.C2.answers.a.workspace.text, ebnf);
  assert.equal(F.ruleText(F.parse('S -> aS | b').rules[0]), 'S → aS');
});
test('B1: G1–G5 sowie alle Sonderfälle unabhängig festgelegt', () => {
  const expected = {B1: ['3', '2', '2', '3', '2'], B2: ['3', '3'], B3: ['2'], B4: ['2'], B5: ['3', '2'], B6: ['2'], B7: ['1'], B8: ['0'], B9: ['invalid', 'invalid', '0'], B11: ['3'], B12: ['0']};
  for (const [id, values] of Object.entries(expected)) assert.deepEqual(task(id).parts.find(p => p.kind === 'classify').rows.map(r => Q.productionType(r.formal).value), values);
});
test('Gegebene Diagrammvergleiche entsprechen den tatsächlichen Sprachen', () => {
  for (const t of A.tasks) for (const p of t.parts) if (p.kind === 'compare') {
    const a = C.parse(p.left).rules, b = C.parse(p.right).rules;
    assert.equal(C.equivalent(a, a[0].name, b, b[0].name).kind, p.equal ? 'equal' : 'different');
  }
});
test('Zwei vollständige Q3-Klausuren mit je 40 BE und allen AFB', () => {
  assert.equal(A.exams.length, 2);
  for (const exam of A.exams) {
    const parts = exam.parts.flatMap(b => b.ids.map(id => { assert.ok(task(b.task)); const p = part(b.task, id); assert.ok(p); return p; }));
    assert.equal(parts.reduce((s, p) => s + p.be, 0), 40); assert.deepEqual([...new Set(parts.map(p => p.afb))].sort(), ['I', 'II', 'III']);
    assert.ok(exam.parts.every(b => !task(b.task).extension));
  }
});
test('AFB-III-Transfer ist in beiden Klausuren vorhanden', () => {
  for (const ex of A.exams) assert.ok(ex.parts.some(b => b.ids.some(id => part(b.task, id).afb === 'III')));
});
test('Gleichwertige EBNF akzeptieren, Fehler und fehlende Referenzen erklären', () => {
  const p = part('C2', 'a');
  assert.equal(Q.check(p, {workspace: {text: 'anders = "ac" | "abc";'}}, task('C2')).status, 'correct');
  assert.equal(Q.check(p, {workspace: {text: 's = "ac";'}}, task('C2')).status, 'incorrect');
  const missing = Q.check(p, {workspace: {text: 's = fehlt;'}}, task('C2')); assert.match(missing.feedback.join(' '), /nicht definiert/);
});
test('Zeichnen braucht eine wirkliche grafische Bearbeitung', () => {
  const p = part('D4', 'a'), workspace = {text: p.answer};
  assert.equal(Q.check(p, {workspace, edits: 0}, task('D4')).status, 'incorrect');
  assert.equal(Q.check(p, {workspace, edits: 1}, task('D4')).status, 'correct');
});
test('Komplexe rekursive Gleichwertigkeit bleibt offen', () => {
  const p = part('C10', 'a'), result = Q.check(p, {workspace: {text: 'anders = ["(" anders ")"];'}}, task('C10'));
  assert.equal(result.status, 'open'); assert.equal(result.autoEarned, 0); assert.equal(result.pending, p.be);
});
test('Freitext wird nicht durch Schlüsselwörter automatisch benotet', () => {
  const p = part('A1', 'e');
  assert.equal(Q.check(p, {text: 'aⁿb n ≥ 0 regulär korrekt', self: []}, task('A1')).status, 'manual');
  assert.equal(Q.check(p, {text: 'aⁿb n ≥ 0 regulär korrekt'}, task('A1')).autoEarned, 0);
  assert.equal(Q.check(p, {text: '', self: [1, 2]}, task('A1')).selfEarned, 0);
  assert.equal(Q.check(p, {text: 'Eigene Erklärung', self: [999, 999]}, task('A1')).selfEarned, 3);
});
test('Teilpunkte bei Klassifikation und Wortentscheidungen', () => {
  assert.equal(Q.check(part('B1', 'a'), {choices: {0: '3', 1: '2'}}, task('B1')).autoEarned, 2);
  const p = part('C2', 'b'); assert.equal(Q.check(p, {choices: {0: 'Ja', 1: 'Ja', 2: 'Nein'}}, task('C2')).autoEarned, 3);
});
test('Beispiele müssen verschieden und passend sein; ε und ausgeschlossene Wörter', () => {
  assert.equal(Q.check(part('A1', 'd'), {text: 'b\nab\naaab'}, task('A1')).autoEarned, 2);
  assert.equal(Q.check(part('A1', 'd'), {text: 'b\nb\nb'}, task('A1')).autoEarned, 1);
  assert.equal(Q.check(part('A7', 'b'), {text: 'ε\na\nb'}, task('A7')).autoEarned, 3);
  assert.equal(Q.check(part('C1', 'c'), {text: 'a\naba'}, task('C1')).autoEarned, 2);
});
test('Erzwungene äußerste Operation bei mehrdeutigen Ableitungen kontrollieren', () => {
  const p = part('A8', 'b');
  const wrong = Q.check(p, {text: 'E -> E+E -> x+E -> x+E*E -> x+x*E -> x+x*x'}, task('A8'));
  assert.notEqual(wrong.status, 'correct'); assert.ok(wrong.autoEarned < p.be);
});
test('Lernstands-Roundtrip bewahrt Texte, Zeichnungen, Baumaktionen, Abgaben und Kompetenzen', () => {
  const saved = {version: '4.1', mode: 'train', attempts: {C2: {answers: {a: {workspace: {text: 's = "ac" | "abc";', validText: 's = "ac" | "abc";', start: 's'}, edits: 2}}, submitted: true}, A3: {answers: {c: {forms: ['S', 'AB'], actions: [{ruleIndex: 0, position: 0}]}}}}, exams: {K1: {started: 10, submitted: 20}}, ratings: {0: 3}};
  const cleaned = Q.cleanProgress(JSON.parse(JSON.stringify(saved)), A);
  assert.equal(cleaned.attempts.C2.answers.a.workspace.text, saved.attempts.C2.answers.a.workspace.text);
  assert.equal(cleaned.attempts.C2.submitted, true); assert.equal(cleaned.ratings[0], 3); assert.equal(cleaned.exams.K1.submitted, 20);
  assert.deepEqual(cleaned.attempts.A3.answers.c.actions, [{ruleIndex: 0, position: 0}]);
});
test('Beschädigte und fremde Lernstände werden nicht ungeprüft übernommen', () => {
  assert.throws(() => Q.cleanProgress({version: '3'}, A));
  assert.throws(() => Q.cleanProgress({version: '4.1', exams: {K1: {started: 10}, K2: {started: 20}}}, A));
  const data = JSON.parse('{"version":"4.1","attempts":{"__proto__":{"answers":{}},"FAKE":{"answers":{}},"C2":{"answers":{"a":{"workspace":{"text":"s = ?;","validText":"?"}}}}}}');
  const cleaned = Q.cleanProgress(data, A); assert.deepEqual(Object.keys(cleaned.attempts), ['C2']); assert.equal(cleaned.attempts.C2.answers.a.workspace, undefined);
});
test('Klausur-Auswertung trennt automatische, offene und selbst eingeschätzte BE', () => {
  function total(examId, answers) {
    const sums = A.exams.find(e => e.id === examId).parts.map(b => Q.summary({...task(b.task), parts: task(b.task).parts.filter(p => b.ids.includes(p.id))}, answers[b.task] || {}));
    return sums.reduce((a, s) => ({auto: a.auto + s.auto, autoMax: a.autoMax + s.autoMax, manualMax: a.manualMax + s.manualMax, self: a.self + s.self}), {auto: 0, autoMax: 0, manualMax: 0, self: 0});
  }
  const result = total('K1', {
    A1: {a: {n: 'S', t: 'a,b', start: 'S'}, b: {text: 'Eigene Erklärung', self: [1]}, c: {text: part('A1', 'c').solution}},
    E1: {a: {workspace: {text: part('E1', 'a').answer}}, b: {workspace: {text: 'paket = "P";'}, edits: 1}, c: {choices: {0: 'Ja', 1: 'Ja', 2: 'Nein', 3: 'Nein'}}, e: {workspace: {text: part('E1', 'e').answer}}},
    D6: {a: {workspace: {text: part('D6', 'a').answer}, edits: 2}, b: {choice: 'Nein', witness: 'a'}}
  });
  assert.deepEqual(result, {auto: 29, autoMax: 34, manualMax: 6, self: 1});
  assert.deepEqual(total('K2', {A3: {a: {text: part('A3', 'a').solution}}, E5: {a: {workspace: {text: part('E5', 'a').answer}}}}), {auto: 9, autoMax: 30, manualMax: 10, self: 0});
});
test('Alle vorgegebenen Wortentscheidungen stimmen mit separat festgelegten Erwartungen überein', () => {
  const expected = {
    A2c: [1,1,1,0], A5b: [1,1,1,1,0,0], A6c: [1,1,0,0],
    C2b: [1,1,0,0], C3b: [0,1,1,0], C4b: [1,0,1,1], C5b: [1,1,0,0], C6b: [1,1,0,0], C7b: [1,1,1,0],
    C8b: [1,1,1,0,0], C10b: [1,1,1,0], C11b: [1,1,0,0],
    D1b: [1,0,1], D2b: [1,1,0,1], D7b: [1,1,0,1], D8b: [1,1,1,0], D10b: [1,1,0,1], D12c: [1,1,0,0],
    E1c: [1,1,0,0], E2c: [1,1,0,0], E3c: [1,1,0,0], E4c: [1,1,0,0], E5c: [1,1,0,0], E6c: [1,1,0,0], W1a: [1,0,1], F2a: [1,1,1,0,0,0,0], F3a: [1,1,0,0], G4c: [0], G7b: [1,1,1,1,0,0,0,0], G8d: [0,0,0], A1g: [1,1,1,0,0], H3b: [1,1,1,0,0], H4d: [1,0]
  };
  for (const t of A.tasks) for (const p of t.parts) if (p.kind === 'words') {
    const key = t.id + p.id; assert.ok(expected[key], key); const rules = C.parse(p.answer).rules, run = C.recognizer(rules, rules[0].name);
    assert.deepEqual(p.samples.map(w => +run(w)), expected[key], key);
  }
});
test('Transfer-Erweiterungen unterscheiden Pakettyp und Sensorgenauigkeit korrekt', () => {
  const cases = [
    ['E1','e', ['P123X','E007-42X','R1234X'], ['R123X','R1234-00X','P1234X']],
    ['E5','e', ['T:1.2#','T:-99#','H:100#'], ['H:1.2#','T:.2#','H:#']],
    ['E4','e', ['vor;','[]','[vor;]','[[]]','[vor;links;]vor;'], ['', '[vor;', 'vor', 'links;]']]
  ];
  for (const [id, pid, yes, no] of cases) {
    const rules = C.parse(part(id,pid).answer).rules, run = C.recognizer(rules,rules[0].name);
    yes.forEach(w => assert.ok(run(w), id + ' expected ' + w)); no.forEach(w => assert.equal(run(w),false,id + ' unexpected ' + w));
  }
});
test('Mathematische Musterbeschreibungen stimmen für kurze Wörter mit den Grammatiken überein', () => {
  const cases = [['S = "a" S | "b";', /^a*b$/], ['S = "a" S | A; A = "b" A | "b";', /^a*b+$/], ['S = "a" S | "b" S | ε;', /^[ab]*$/]];
  const words = ['']; for (let i=0;i<5;i++) for(const w of [...words].filter(w=>w.length===i)) for(const c of ['a','b']) words.push(w+c);
  for(const [source,oracle] of cases){const rules=C.parse(source).rules,run=C.recognizer(rules,'S');words.forEach(w=>assert.equal(run(w),oracle.test(w),source+':'+w));}
});
