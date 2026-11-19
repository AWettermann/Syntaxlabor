/* Semantic checks for the worksheet. No claim to decide general CFG equivalence. */
(function (scope) {
  'use strict';
  const common = typeof module !== 'undefined' && module.exports;
  const C = common ? require('./core.js') : scope.SyntaxCore, F = common ? require('./formal.js') : scope.SyntaxFormal;
  function grammar(source, start, ignoreWhitespace = false) {
    const g = F.parse(source, String(start || '').trim(), true);
    if (!F.classify(g).cf) throw Error('Diese Entwicklungsaufgabe verlangt eine kontextfreie Grammatik: links genau ein Nichtterminal.');
    if (ignoreWhitespace) {
      g.rules.forEach(r => { r.rhs = r.rhs.filter(s => F.isN(s) || !/\s/.test(F.name(s))); });
      g.terminals = g.terminals.filter(s => !/\s/.test(s)); g.ignoreWhitespace = true;
    }
    F.toEBNF(g); // Also checks undefined references, including unreachable rules.
    return g;
  }
  function reachable(g) {
    const names = new Set([g.start]); let changed = true;
    while (changed) {
      changed = false;
      for (const r of g.rules) if (names.has(F.name(r.lhs[0]))) for (const s of r.rhs) if (F.isN(s) && !names.has(F.name(s))) { names.add(F.name(s)); changed = true; }
    }
    return {...g, nonterminals: [...names], rules: g.rules.filter(r => names.has(F.name(r.lhs[0])))};
  }
  // Exact sufficient proof: a bijection of reachable nonterminals preserves all
  // productions and the start. Terminal strings already consist of characters.
  // Duplicate rules and ordering carry no semantics. Bounded search only limits
  // recognition of this proof; failure never proves language inequality.
  function isomorphic(left, right) {
    left = reachable(left); right = reachable(right);
    if (left.nonterminals.length !== right.nonterminals.length || left.nonterminals.length > 14) return false;
    const signature = (g, n) => [...new Set(g.rules.filter(r => F.name(r.lhs[0]) === n).map(r => JSON.stringify(r.rhs.map(s => F.isN(s) ? 'N' : s))))].sort().join(';');
    const target = new Set(right.rules.map(r => JSON.stringify([F.name(r.lhs[0]), r.rhs])));
    const candidates = new Map(left.nonterminals.map(n => [n, right.nonterminals.filter(m => signature(left, n) === signature(right, m))]));
    if (!candidates.get(left.start).includes(right.start) || [...candidates.values()].some(a => !a.length)) return false;
    const map = new Map([[left.start, right.start]]), used = new Set([right.start]); let budget = 12000;
    function search() {
      if (--budget < 0) return false;
      for (const r of left.rules) if (map.has(F.name(r.lhs[0])) && r.rhs.every(s => !F.isN(s) || map.has(F.name(s)))) {
        const key = JSON.stringify([map.get(F.name(r.lhs[0])), r.rhs.map(s => F.isN(s) ? F.N(map.get(F.name(s))) : s)]);
        if (!target.has(key)) return false;
      }
      if (map.size === left.nonterminals.length) {
        const mapped = new Set(left.rules.map(r => JSON.stringify([map.get(F.name(r.lhs[0])), r.rhs.map(s => F.isN(s) ? F.N(map.get(F.name(s))) : s)])));
        return mapped.size === target.size;
      }
      const n = left.nonterminals.filter(n => !map.has(n)).sort((a, b) => candidates.get(a).length - candidates.get(b).length)[0];
      for (const m of candidates.get(n)) if (!used.has(m)) { map.set(n, m); used.add(m); if (search()) return true; map.delete(n); used.delete(m); }
      return false;
    }
    return search();
  }
  function compare(own, model, cases = []) {
    if (isomorphic(own, model)) return {kind: 'equal', proof: 'Die erreichbaren Produktionen sind bis auf Nichtterminalnamen, Reihenfolge und doppelte Regeln identisch. Das beweist Sprachgleichheit.'};
    const a = F.toEBNF(own), b = F.toEBNF(model), runA = C.recognizer(a, own.start), runB = C.recognizer(b, model.start);
    for (const w of [...new Set(cases)]) if (runA(w) !== runB(w)) return {kind: 'different', witness: w};
    const result = C.equivalent(a, own.start, b, model.start);
    return {...result, tested: (result.tested || 0) + new Set(cases).size, proof: 'Die Sprachgleichheit wurde exakt durch Automatenvergleich nachgewiesen.'};
  }
  function canComplete(g, form, target) {
    const rules = F.toEBNF(g); let name = 'WikiZiel';
    while (rules.some(r => r.name === name)) name += 'X';
    rules.push({name, node: C.sequence(form.map(s => F.isN(s) ? {type: 'ref', value: F.name(s)} : C.lit(F.name(s))))});
    return C.recognizer(rules, name)(target);
  }
  function ebnfIsomorphic(left, leftStart, right, rightStart) {
    // An isomorphism of the parsed EBNF programs is also an exact language
    // proof, including recursion. Tags make the tree encoding unambiguous.
    function encode(n) {
      if (n.type === 'ref') return [F.N(n.value)];
      return [F.T('open:' + n.type), ...(n.type === 'lit' ? [F.T('literal:' + JSON.stringify(n.value))] : n.items ? n.items.flatMap(encode) : n.child ? encode(n.child) : []), F.T('close:' + n.type)];
    }
    const graph = (rules, start) => ({start, nonterminals: rules.map(r => r.name), rules: rules.map(r => ({lhs: [F.N(r.name)], rhs: encode(r.node)}))});
    return isomorphic(graph(left, leftStart), graph(right, rightStart));
  }
  function check(part, answer, task, answers, base) {
    const own = (cf = true) => { const p = task.parts.find(p => p.id === part.grammarPart); if (!p) throw Error('Die zugehörige Grammatikaufgabe fehlt.'); const a = answers[p.id] || {}; return cf ? grammar(a.text || '', a.start || p.defaultStart, p.ignoreWhitespace) : F.parse(a.text || '', a.start || p.defaultStart, true); };
    const success = message => { base.status = 'correct'; base.autoEarned = part.be; base.feedback.push(message); return base; };
    const open = message => { base.status = 'open'; base.pending = part.be; base.feedback.push(message); return base; };
    if (part.kind === 'word') return String(answer.text || '').replace(/\s/g, '') === part.target ? success('Die Wagenfolge stimmt; Leerraum wurde ignoriert.') : (base.feedback.push('Gesucht ist genau ein Triebwagen, mindestens eine 1, ein s und doppelt so viele 2 wie 1. Prüfe auch die minimale Länge.'), base);
    if (part.kind === 'grammar') {
      const g = grammar(answer.text || '', answer.start || part.defaultStart, part.ignoreWhitespace), model = grammar(part.model, part.defaultStart, part.ignoreWhitespace);
      try {
        const r = compare(g, model, part.cases);
        if (r.kind === 'equal') return success(r.proof);
        if (r.kind === 'different') {
          const accepts = C.recognizer(F.toEBNF(g), g.start)(r.witness);
          base.feedback.push(`Gegenbeispiel ${r.witness ? JSON.stringify(r.witness) : 'ε'}: ${accepts ? 'Deine Grammatik erlaubt es, die Aufgabenstellung nicht.' : 'Die Aufgabenstellung erlaubt es, deine Grammatik nicht.'}`); return base;
        }
        return open(`In ${r.tested} begrenzten Prüfungen wurde kein Unterschied gefunden. Das beweist keine Gleichwertigkeit. Vergleiche Rekursion, Abschlussfälle und die Ausschließlichkeit mit der Musterlösung; eine Lehrkraft kann alternative Konstruktionen bestätigen. Die ${part.be} BE bleiben offen.`);
      } catch (e) { return open('Die semantische Prüfgrenze wurde erreicht: ' + e.message + ' Vergleiche deine Grammatik mit der Musterlösung.'); }
    }
    if (part.kind === 'own-classify') {
      const type = String(F.classify(own(false)).type); base.feedback.push('Engste Produktionsform deiner eingegebenen Grammatik: Typ ' + type + '. Die Korrektheit ihrer Sprache wird getrennt geprüft.');
      return answer.choice === type ? success('Die Auswahl passt zu deinen Produktionen.') : base;
    }
    if (part.kind === 'own-derive' || part.kind === 'dead-derive') {
      const g = part.kind === 'own-derive' ? own() : F.parse(task.formal, task.start || 'S');
      const d = F.derivation(g, answer.text || '', part.target);
      d.steps.forEach(s => base.feedback.push(`Schritt ${s.index}: ${F.display(d.forms[s.index - 1])} -> ${F.display(d.forms[s.index])}: ${s.valid ? 'zulässig' : s.message}`));
      if (part.kind === 'own-derive') return d.complete ? success('Alle Schritte sind mit deiner Grammatik zulässig und erreichen genau die verlangte Liste. Die Sprachgleichheit deiner Grammatik ist eine eigene Prüfung.') : (base.feedback.push(d.message), base);
      if (!d.valid || !d.steps.length || !d.forms.at(-1).some(F.isN)) { base.feedback.push('Gesucht ist eine zulässige begonnene Ableitung mit mindestens einem Schritt und einem verbleibenden Nichtterminal. ' + d.message); return base; }
      try { return !canComplete(g, d.forms.at(-1), part.target) ? success('Die Schritte sind zulässig. Eine kontextfreie Wortprüfung weist nach, dass aus der letzten Satzform das Zielwort nicht mehr erreichbar ist.') : (base.feedback.push('Aus dieser Satzform ist das Zielwort noch erreichbar. Wähle einen anderen zulässigen Ableitungszweig.'), base); }
      catch (e) { return open('Erreichbarkeitsprüfung offen: ' + e.message); }
    }
    return null;
  }
  const api = {grammar, isomorphic, ebnfIsomorphic, compare, canComplete, check};
  if (common) module.exports = api; else scope.SyntaxWiki3 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
