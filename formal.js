/* V4.1: production-form analysis and derivation validation, independent of DOM. */
(function (scope) {
  'use strict';
  const N = s => 'N:' + s, T = s => 'T:' + s, name = s => s.slice(2), isN = s => s.startsWith('N:');
  function symbols(source) {
    const out = []; let i = 0;
    source = source.trim(); if (!source || source === 'ε') return out;
    while (i < source.length) {
      const c = source[i++]; if (/\s/.test(c)) continue;
      if (c === '"' || c === "'") {
        const quote = c; let closed = false;
        while (i < source.length) {
          let value = source[i++]; if (value === quote) { closed = true; break; }
          if (value === '\\') {
            value = source[i++]; if (value === undefined || !['\\', '"', "'"].includes(value)) throw Error('Hier sind nur einfache Zeichen und maskierte Anführungszeichen erlaubt.');
          }
          out.push(T(value));
        }
        if (!closed) throw Error('Schließendes Anführungszeichen fehlt.');
      } else {
        if (c === 'ε' || /[|→⇒=;]/.test(c)) throw Error('ε muss allein stehen; Produktionszeichen gehören nicht in eine Satzform.');
        const cp = c.charCodeAt(0);
        if (cp >= 0xD800 && cp <= 0xDBFF && i < source.length) out.push(T(c + source[i++]));
        else out.push(/^[A-Z]$/.test(c) ? N(c) : T(c));
      }
      if (out.length > 240) throw Error('Maximal 240 Symbole pro Satzform.');
    }
    return out;
  }
  function splitAlternatives(s) {
    let quote = '', escaped = false, current = ''; const out = [];
    for (const c of s) {
      if (escaped) { current += c; escaped = false; continue; }
      if (c === '\\' && quote) { current += c; escaped = true; continue; }
      if (quote) { current += c; if (c === quote) quote = ''; continue; }
      if (c === '"' || c === "'") { quote = c; current += c; continue; }
      if (c === '|') { out.push(current); current = ''; } else current += c;
    }
    out.push(current); return out;
  }
  function parse(source, start = 'S') {
    if (source.length > 12000) throw Error('Maximal 12.000 Zeichen Produktionsregeln.');
    if (!/^[A-Z]$/.test(start)) throw Error('Das Startsymbol muss ein einzelner Großbuchstabe sein.');
    const rules = [], nonterminals = new Set(), terminals = new Set();
    for (const line of source.split(/\n/).map(l => l.trim()).filter(Boolean)) {
      const match = /^(.*?)\s*(?:→|->)\s*(.*?)\s*;?$/.exec(line);
      if (!match) throw Error('Eine Regel pro Zeile: S → aS | b.');
      const lhs = symbols(match[1]); if (!lhs.some(isN)) throw Error('Jede linke Seite muss mindestens ein Nichtterminal enthalten.');
      for (const rhs of splitAlternatives(match[2])) {
        const right = symbols(rhs); rules.push({lhs, rhs: right});
        for (const s of [...lhs, ...right]) (isN(s) ? nonterminals : terminals).add(name(s));
      }
    }
    if (!rules.length) throw Error('Mindestens eine Produktionsregel angeben.');
    if (rules.length > 100) throw Error('Maximal 100 Produktionsalternativen.');
    if (!nonterminals.has(start)) throw Error('Das Startsymbol kommt in der Grammatik nicht vor.');
    return {rules, start, nonterminals: [...nonterminals].sort(), terminals: [...terminals].sort()};
  }
  function display(form) { return form.length ? form.map(s => isN(s) ? name(s) : /^[A-Z]$/.test(name(s)) || name(s) === 'ε' ? JSON.stringify(name(s)) : name(s)).join('') : 'ε'; }
  function ruleText(rule) { return display(rule.lhs) + ' → ' + display(rule.rhs); }
  function classify(grammar) {
    const rs = grammar.rules, start = N(grammar.start), startOnRight = rs.some(r => r.rhs.includes(start));
    const epsilonAllowed = r => r.rhs.length !== 0 || r.lhs.length === 1 && r.lhs[0] === start && !startOnRight;
    const cf = rs.every(r => r.lhs.length === 1 && isN(r.lhs[0]));
    const right = rs.every(r => r.rhs.filter(isN).length <= 1 && r.rhs.every((s, i) => !isN(s) || i === r.rhs.length - 1));
    const left = rs.every(r => r.rhs.filter(isN).length <= 1 && r.rhs.every((s, i) => !isN(s) || i === 0));
    const epsilonSafe = rs.every(epsilonAllowed), monotone = rs.every(r => r.rhs.length >= r.lhs.length || epsilonAllowed(r) && r.rhs.length === 0);
    const regular = cf && (right || left) && epsilonSafe;
    const type = regular ? 3 : cf ? 2 : monotone ? 1 : 0;
    const reasons = [];
    if (regular) reasons.push(`Alle linken Seiten bestehen aus einem Nichtterminal; die rechten Seiten sind einheitlich ${right ? 'rechts' : 'links'}linear (Terminalwort mit höchstens einem Nichtterminal am Rand).`);
    else if (cf) {
      reasons.push('Jede linke Seite besteht aus genau einem Nichtterminal: kontextfrei.');
      if (!right && !left) reasons.push('Keine einheitliche Links- oder Rechtslinearität: Die vorliegende Produktionsform ist nicht Typ 3.');
      if (!epsilonSafe) reasons.push('Die ε-Produktionen erfüllen die hier vereinbarte Startsymbolausnahme für Typ 3 nicht.');
    } else {
      reasons.push('Mindestens eine linke Seite besteht nicht aus einem einzelnen Nichtterminal; daher keine Typ-2- oder Typ-3-Produktionsform.');
      reasons.push(monotone ? 'Alle Regeln sind längenmonoton (gegebenenfalls mit zulässiger Startsymbolausnahme): Typ 1 nach der hier verwendeten nichtverkürzenden Konvention.' : 'Mindestens eine Regel verkürzt außerhalb der Startsymbolausnahme: nur Typ 0 nachgewiesen.');
    }
    if (rs.some(r => !r.rhs.length)) reasons.push(startOnRight ? 'Das Startsymbol steht rechts in mindestens einer Regel. Die Sonderausnahme S → ε ist deshalb für Typ 1/3 nicht anwendbar.' : 'Für Typ 1/3 ist nur S → ε ausnahmsweise erlaubt, sofern S nirgends rechts vorkommt. Andere ε-Regeln sind hier nicht zugelassen.');
    return {type, reasons, cf, right, left, monotone, epsilonSafe, language: 'Aus der Produktionsform folgt keine minimale Sprachklasse. Dafür ist eine gesonderte Analyse der erzeugten Sprache nötig.'};
  }
  function same(a, b) { return a.length === b.length && a.every((s, i) => s === b[i]); }
  function apply(form, rule, position) {
    if (position < 0 || !same(form.slice(position, position + rule.lhs.length), rule.lhs)) return null;
    return [...form.slice(0, position), ...rule.rhs, ...form.slice(position + rule.lhs.length)];
  }
  function step(grammar, before, after, order = 'any') {
    const ntPositions = before.map((s, i) => isN(s) ? i : -1).filter(i => i >= 0);
    const expectedPosition = order === 'left' ? ntPositions[0] : order === 'right' ? ntPositions.at(-1) : null;
    for (let r = 0; r < grammar.rules.length; r++) {
      const rule = grammar.rules[r];
      for (let i = 0; i <= before.length - rule.lhs.length; i++) {
        if (order !== 'any' && (rule.lhs.length !== 1 || i !== expectedPosition)) continue;
        const next = apply(before, rule, i); if (next && same(next, after)) return {valid: true, ruleIndex: r, position: i, rule: ruleText(rule)};
      }
    }
    return {valid: false, message: order === 'any' ? 'Keine einzelne zulässige Regelanwendung ergibt diese Satzform.' : `Keine zulässige ${order === 'left' ? 'Links' : 'Rechts'}ableitung: Ersetze genau das ${order === 'left' ? 'linkeste' : 'rechteste'} Nichtterminal.`};
  }
  function derivation(grammar, source, target, order = 'any') {
    if (source.length > 15000) throw Error('Ableitung zu lang.');
    const forms = source.split(/⇒|=>|\n/).map(s => s.trim()).filter(Boolean).map(symbols);
    if (!forms.length || forms.length > 80) throw Error('Zwischen 1 und 80 Satzformen angeben.');
    const starts = same(forms[0], [N(grammar.start)]), steps = [];
    for (let i = 1; i < forms.length; i++) steps.push({...step(grammar, forms[i - 1], forms[i], order), index: i});
    const targetForm = Array.from(target, T), ends = same(forms.at(-1), targetForm);
    const valid = starts && steps.every(s => s.valid), complete = valid && ends;
    return {forms, steps, starts, ends, valid, complete, message: !starts ? `Beginne mit ${grammar.start}.` : steps.some(s => !s.valid) ? `Schritt ${steps.find(s => !s.valid).index}: ${steps.find(s => !s.valid).message}` : !ends ? `Die Ableitung ist noch nicht beim Zielwort ${target || 'ε'} angekommen.` : 'Alle Schritte sind zulässig; die Ableitung erreicht das Zielwort.'};
  }
  function tree(grammar, forms, actions = []) {
    if (!classify(grammar).cf) throw Error('Ableitungsbäume werden hier für kontextfreie Grammatiken angeboten.');
    const root = {symbol: N(grammar.start), id: 'root'}, frontier = [root];
    for (let i = 1; i < forms.length; i++) {
      let s;
      const action = actions?.[i - 1], rule = action && grammar.rules[action.ruleIndex], appliedForm = rule ? apply(forms[i - 1], rule, action.position) : null;
      if (appliedForm && same(appliedForm, forms[i])) s = {valid: true, ruleIndex: action.ruleIndex, position: action.position};
      else s = step(grammar, forms[i - 1], forms[i]);
      if (!s.valid) throw Error(`Ungültiger Schritt ${i}.`);
      const leaf = frontier[s.position], applied = grammar.rules[s.ruleIndex];
      leaf.children = applied.rhs.length ? applied.rhs.map((symbol, j) => ({symbol, id: `${leaf.id}.${j}`})) : [{symbol: 'ε', id: leaf.id + '.e'}];
      frontier.splice(s.position, 1, ...(applied.rhs.length ? leaf.children : []));
    }
    return {root, frontier};
  }
  function toEBNF(grammar) {
    if (!classify(grammar).cf) throw Error('Diese Grammatik ist nicht kontextfrei.');
    if (grammar.nonterminals.some(n => !grammar.rules.some(r => r.lhs[0] === N(n)))) throw Error('Für mindestens ein Nichtterminal fehlt eine Definition.');
    const C = typeof module !== 'undefined' && module.exports ? require('./core.js') : scope.SyntaxCore;
    return grammar.nonterminals.map(n => ({name: n, node: C.alternative(grammar.rules.filter(r => r.lhs[0] === N(n)).map(r => C.sequence(r.rhs.map(s => isN(s) ? {type: 'ref', value: name(s)} : C.lit(name(s))))))}));
  }
  const api = {N, T, name, isN, symbols, parse, display, ruleText, classify, same, apply, step, derivation, tree, toEBNF};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else scope.SyntaxFormal = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
