(function (scope) {
  'use strict';
  const common = typeof module !== 'undefined' && module.exports;
  const C = common ? require('./core.js') : scope.SyntaxCore, F = common ? require('./formal.js') : scope.SyntaxFormal;
  const round = n => Math.round(n * 100) / 100;
  const list = s => [...new Set(String(s || '').replace(/[{}]/g, '').split(/[\s,;]+/).filter(Boolean))].sort();
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function productionType(source, start = 'S') {
    try { return {value: String(F.classify(F.parse(source, start)).type), info: F.classify(F.parse(source, start)).reasons.join(' ')}; }
    catch (e) { return {value: 'invalid', info: e.message}; }
  }
  function check(part, answer = {}, task = {}) {
    const base = {status: 'incorrect', autoEarned: 0, autoMax: part.kind === 'text' ? 0 : part.be, manualMax: part.kind === 'text' ? part.be : 0, selfEarned: 0, pending: 0, feedback: []};
    try {
      if (part.kind === 'text') {
        base.status = answer.text?.trim() ? 'manual' : 'empty';
        base.selfEarned = answer.text?.trim() ? round(part.criteria.reduce((sum, c, i) => sum + Math.max(0, Math.min(c[1], Number(answer.self?.[i]) || 0)), 0)) : 0;
        base.feedback = ['Freitext wird nicht automatisch als richtig oder falsch bewertet. Vergleiche deine Begründung mit den fachlichen Aspekten und schätze die Teilpunkte selbst ein.']; return base;
      }
      if (part.kind === 'ebnf' || part.kind === 'draw') {
        if (part.kind === 'draw' && !answer.edits) { base.feedback.push('Bearbeite die Struktur im grafischen Editor. Ein unveränderter Arbeitsbereich ist noch keine gezeichnete Lösung.'); return base; }
        const source = answer.workspace?.text ?? '';
        const model = C.parse(source).rules, target = C.parse(part.answer).rules;
        if (!model.length) { base.feedback.push('Die Grammatik ist noch leer.'); return base; }
        const diagnostics = C.diagnostics(model); if (diagnostics.length) { base.feedback.push(...diagnostics); return base; }
        const start = answer.workspace?.start || model[0].name;
        const compare = C.equivalent(model, start, target, target[0].name);
        if (compare.kind === 'equal') {
          base.status = 'correct'; base.autoEarned = part.be;
          base.feedback.push('Die Sprachgleichheit wurde exakt durch Automatenvergleich nachgewiesen.');
          if (part.kind === 'draw') base.feedback.push('Die bearbeitete Knotenstruktur ist gültig. Verbindungen und Pfeile werden vom Diagrammeditor konsistent erzeugt.');
        } else if (compare.kind === 'different') {
          const own = C.recognizer(model, start)(compare.witness);
          base.feedback.push(`Gegenbeispiel ${compare.witness ? JSON.stringify(compare.witness) : 'ε'}: ${own ? 'Deine Lösung lässt es zu, die Aufgabe nicht.' : 'Die Aufgabe lässt es zu, deine Lösung nicht.'}`);
        } else {
          base.status = 'open'; base.pending = part.be;
          base.feedback.push(`Kein Unterschied in ${compare.tested} begrenzten Testwörtern gefunden. Das ist kein Gleichwertigkeitsbeweis. ${compare.reason} Die ${part.be} BE bleiben fachlich offen und brauchen eine manuelle Prüfung.`);
        }
        return base;
      }
      if (part.kind === 'derive' || part.kind === 'tree') {
        const grammar = F.parse(part.formal || task.formal, task.start || 'S');
        const source = part.kind === 'tree' ? (answer.forms || [grammar.start]).join(' ⇒ ') : answer.text || grammar.start;
        const d = F.derivation(grammar, source, part.target, part.order || 'any');
        let complete = d.complete;
        if (part.firstProduction && d.steps[0]?.rule !== part.firstProduction) { complete = false; base.feedback.push(`Die erste Ersetzung muss ${part.firstProduction} sein, damit die verlangte äußerste Operation entsteht.`); }
        const fraction = d.steps.length ? d.steps.filter(s => s.valid).length / d.steps.length : 0;
        base.autoEarned = d.starts ? round(Math.min(part.be - 1, (part.be - 1) * fraction) + (complete ? 1 : 0)) : 0;
        base.status = complete ? 'correct' : 'incorrect'; base.feedback.push(d.message);
        d.steps.forEach(s => base.feedback.push(`Schritt ${s.index}: ${s.valid ? s.rule : s.message}`)); return base;
      }
      if (part.kind === 'sets') {
        const grammar = F.parse(part.formal, task.start || 'S');
        const checks = [equal(list(answer.n), grammar.nonterminals), equal(list(answer.t), grammar.terminals), String(answer.start || '').trim() === grammar.start];
        base.autoEarned = round(checks.filter(Boolean).length / 3 * part.be); base.status = checks.every(Boolean) ? 'correct' : 'incorrect';
        base.feedback.push(`N = {${grammar.nonterminals.join(', ')}}, T = {${grammar.terminals.join(', ')}}, Startsymbol ${grammar.start}.`); return base;
      }
      if (part.kind === 'examples') {
        const r = C.parse(part.answer).rules, accepts = C.recognizer(r, r[0].name);
        const entered = String(answer.text || '').split('\n').map(s => s.trim()).filter(Boolean).map(w => w === 'ε' ? '' : w);
        const distinct = [...new Set(entered)], exclude = part.excluded || task.excludedExamples || [];
        let correct = 0;
        for (const w of distinct.slice(0, 30)) {
          const ok = !exclude.includes(w) && accepts(w) === (part.positive !== false);
          if (ok) correct++; base.feedback.push(`${w ? JSON.stringify(w) : 'ε'}: ${exclude.includes(w) ? 'in dieser Teilaufgabe ausgeschlossen' : ok ? 'passendes Beispiel' : 'erfüllt die geforderte Zugehörigkeit nicht'}.`);
        }
        base.autoEarned = Math.min(part.count, correct); base.status = correct >= part.count ? 'correct' : 'incorrect';
        if (distinct.length < part.count) base.feedback.push(`Gib ${part.count} verschiedene Wörter an, jeweils eines pro Zeile; ε für das leere Wort.`); return base;
      }
      if (part.kind === 'compare') {
        const chosen = answer.choice, isEqual = chosen === 'Ja';
        let points = chosen && isEqual === part.equal ? 1 : 0;
        if (!part.equal && chosen === 'Nein') {
          const a = C.parse(part.left).rules, b = C.parse(part.right).rules, witness = answer.witness === 'ε' ? '' : answer.witness || '';
          const differs = C.recognizer(a, a[0].name)(witness) !== C.recognizer(b, b[0].name)(witness);
          if (differs) points += part.be - 1;
          base.feedback.push(differs ? 'Dein Gegenbeispiel unterscheidet die Sprachen tatsächlich.' : 'Das angegebene Gegenbeispiel unterscheidet die beiden Sprachen nicht.');
        } else if (part.equal && points) points = part.be;
        base.autoEarned = points; base.status = points === part.be ? 'correct' : 'incorrect';
        const a = C.parse(part.left).rules, b = C.parse(part.right).rules, comparison = C.equivalent(a, a[0].name, b, b[0].name);
        base.feedback.push(part.equal ? 'Die Darstellungen sind sprachlich gleichwertig (exakt geprüft).' : `Sie sind nicht gleichwertig. Ein Gegenbeispiel ist ${comparison.witness ? JSON.stringify(comparison.witness) : 'ε'}.`); return base;
      }
      let expected, chosen;
      if (part.kind === 'words') {
        const r = C.parse(part.answer).rules, run = C.recognizer(r, r[0].name);
        expected = part.samples.map(w => run(w) ? 'Ja' : 'Nein'); chosen = part.samples.map((_, i) => answer.choices?.[i] || '');
        base.feedback = part.samples.map((w, i) => `${w ? JSON.stringify(w) : 'ε'}: ${expected[i] === 'Ja' ? 'gehört zur Sprache' : 'gehört nicht zur Sprache'}.`);
      } else if (part.kind === 'classify') {
        const results = part.rows.map(r => productionType(r.formal, r.start || 'S'));
        expected = results.map(r => r.value); chosen = part.rows.map((_, i) => answer.choices?.[i] || '');
        base.feedback = results.map((r, i) => `${part.rows[i].label}: ${r.value === 'invalid' ? 'keine gültige Grammatik' : 'Typ ' + r.value}. ${r.info}`);
        base.feedback.push('Das ist die Einordnung der vorliegenden Produktionsform. Eine minimale Sprachklasse wird daraus nicht abgeleitet.');
      } else if (part.kind === 'mapping') {
        expected = part.rows.map(r => r.expected); chosen = part.rows.map((_, i) => answer.choices?.[i] || '');
        base.feedback = part.rows.map(r => `${r.label}: ${r.expected}.`);
      } else if (part.kind === 'choice') {
        expected = [part.expected]; chosen = [answer.choice || '']; base.feedback = [part.solution];
      } else throw Error('Unbekanntes Aufgabenformat.');
      base.autoEarned = round(expected.filter((e, i) => e === chosen[i]).length / expected.length * part.be);
      base.status = base.autoEarned === part.be ? 'correct' : 'incorrect'; return base;
    } catch (e) { base.feedback.push(e.message); return base; }
  }
  function summary(task, answers) {
    const parts = task.parts.map(p => ({id: p.id, ...check(p, answers[p.id], task)}));
    return parts.reduce((sum, p) => ({auto: round(sum.auto + p.autoEarned), autoMax: sum.autoMax + p.autoMax, self: round(sum.self + p.selfEarned), manualMax: sum.manualMax + p.manualMax, pending: sum.pending + p.pending, parts}), {auto: 0, autoMax: 0, self: 0, manualMax: 0, pending: 0, parts});
  }
  function cleanWorkspace(w) {
    if (!w || typeof w.text !== 'string' || typeof w.validText !== 'string' || w.text.length > 24000 || w.validText.length > 24000) return null;
    try { C.parse(w.validText); } catch (_) { return null; }
    return {text: w.text, validText: w.validText, start: typeof w.start === 'string' ? w.start.slice(0, 120) : ''};
  }
  function cleanAnswer(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const out = {};
    for (const key of ['text', 'n', 't', 'start', 'choice', 'witness']) if (typeof value[key] === 'string') out[key] = value[key].slice(0, 15000);
    if (Array.isArray(value.forms)) out.forms = value.forms.filter(s => typeof s === 'string').slice(0, 80).map(s => s.slice(0, 500));
    if (Array.isArray(value.actions)) out.actions = value.actions.slice(0, 79).map(a => ({ruleIndex: Math.max(0, Math.min(99, Math.floor(Number(a.ruleIndex) || 0))), position: Math.max(0, Math.min(239, Math.floor(Number(a.position) || 0)))}));
    if (Array.isArray(value.self)) out.self = value.self.slice(0, 30).map(n => Number.isFinite(n) ? Math.max(0, Math.min(20, n)) : 0);
    if (value.choices && typeof value.choices === 'object') out.choices = Object.fromEntries(Object.entries(value.choices).filter(([k, v]) => /^\d{1,2}$/.test(k) && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 200)]));
    const w = cleanWorkspace(value.workspace); if (w) out.workspace = w;
    out.edits = Math.max(0, Math.min(100000, Number(value.edits) || 0)); return out;
  }
  function cleanProgress(raw, curriculum) {
    if (!raw || raw.version !== '4.1' || typeof raw !== 'object') throw Error('Kein unterstützter Syntaxlabor-V4.1-Lernstand.');
    const out = {version: '4.1', attempts: {}, exams: {}, ratings: {}, mode: ['learn', 'train'].includes(raw.mode) ? raw.mode : 'learn'};
    const ids = new Set(curriculum.tasks.map(t => t.id));
    const validKey = k => ids.has(k) || curriculum.exams.some(e => e.parts.some(b => `${e.id}:${b.task}` === k));
    for (const [key, a] of Object.entries(raw.attempts || {})) {
      if (!validKey(key) || !a || typeof a !== 'object') continue;
      const taskId = key.includes(':') ? key.split(':')[1] : key, task = curriculum.tasks.find(t => t.id === taskId), answers = {};
      for (const p of task.parts) answers[p.id] = cleanAnswer(a.answers?.[p.id]);
      out.attempts[key] = {answers, submitted: !!a.submitted, assisted: !!a.assisted, checked: !!a.checked, updated: Number.isFinite(a.updated) ? a.updated : 0};
    }
    for (const ex of curriculum.exams) {
      const e = raw.exams?.[ex.id]; if (!e) continue;
      out.exams[ex.id] = {started: Number.isFinite(e.started) ? e.started : 0, submitted: Number.isFinite(e.submitted) ? e.submitted : 0, archives: Array.isArray(e.archives) ? e.archives.slice(-10).map(a => ({auto: Number(a.auto) || 0, self: Number(a.self) || 0, date: Number(a.date) || 0})) : []};
    }
    for (let i = 0; i < curriculum.skills.length; i++) out.ratings[i] = Math.max(0, Math.min(3, Math.floor(Number(raw.ratings?.[i]) || 0)));
    if (Object.values(out.exams).filter(e => e.started && !e.submitted).length > 1) throw Error('Der Lernstand enthält mehrere gleichzeitig laufende Klausuren.');
    return out;
  }
  const api = {check, summary, productionType, cleanProgress, cleanAnswer, cleanWorkspace};
  if (common) module.exports = api; else scope.SyntaxAssessment = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
