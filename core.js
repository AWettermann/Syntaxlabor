/* Syntaxlabor V4.0 — shared grammar model, parser and language algorithms.
   No DOM and no runtime dependencies; also used by the automated tests. */
(function (scope) {
  'use strict';
  const EPS = () => ({type: 'eps'});
  const lit = value => ({type: 'lit', value});
  const sequence = items => items.length === 0 ? EPS() : items.length === 1 ? items[0] : {type: 'seq', items};
  const alternative = items => items.length === 1 ? items[0] : {type: 'alt', items};
  const identifier = /^[A-Za-z_ÄÖÜäöüß][A-Za-z_0-9ÄÖÜäöüß]*$/u;
  class GrammarError extends Error {
    constructor(message, source = '', pos = 0) {
      const before = source.slice(0, pos).split('\n');
      super(`${message} (Zeile ${before.length}, Spalte ${before.at(-1).length + 1})`);
      this.name = 'GrammarError'; this.position = pos;
    }
  }
  function tokenize(source) {
    if (source.length > 24000) throw new Error('Die Eingabe ist zu groß (maximal 24.000 Zeichen).');
    const tokens = []; let i = 0;
    while (i < source.length) {
      if (/\s/u.test(source[i])) { i++; continue; }
      const pos = i, c = source[i];
      if (c === '"' || c === "'") {
        const quote = c; let value = ''; i++;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') {
            i++; const e = source[i++];
            if (e === 'u') {
              const hex = source.slice(i, i + 4);
              if (!/^[0-9a-f]{4}$/i.test(hex)) throw new GrammarError('Vier Hexadezimalziffern nach \\u erwartet', source, i);
              value += String.fromCharCode(parseInt(hex, 16)); i += 4; continue;
            }
            const escapes = {n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '\\': '\\', '"': '"', "'": "'"};
            if (!Object.hasOwn(escapes, e)) throw new GrammarError('Unbekannte Escape-Sequenz', source, i - 2);
            value += escapes[e];
          } else value += source[i++];
        }
        if (source[i] !== quote) throw new GrammarError('Schließendes Anführungszeichen fehlt', source, pos);
        i++; tokens.push({kind: 'literal', value, pos}); continue;
      }
      if ('=;|[]{}(),'.includes(c)) { tokens.push({kind: c, value: c, pos}); i++; continue; }
      if (c === 'ε') { tokens.push({kind: 'epsilon', value: c, pos}); i++; continue; }
      const match = /^[A-Za-z_ÄÖÜäöüß][A-Za-z_0-9ÄÖÜäöüß]*/u.exec(source.slice(i));
      if (!match) throw new GrammarError(`Ungültiges Zeichen „${c}“`, source, pos);
      tokens.push({kind: 'name', value: match[0], pos}); i += match[0].length;
    }
    return tokens;
  }
  function parse(source) {
    const tokens = tokenize(source), rules = []; let i = 0, depth = 0, count = 0, legacyCommas = false;
    const peek = () => tokens[i]?.kind;
    const fail = message => { throw new GrammarError(message, source, tokens[i]?.pos ?? source.length); };
    const eat = kind => { if (peek() !== kind) fail(`„${kind}“ erwartet`); return tokens[i++]; };
    const starts = () => ['literal', 'name', 'epsilon', '[', '{', '('].includes(peek());
    function atom() {
      if (++count > 500) fail('Zu viele Bausteine (maximal 500)');
      const kind = peek();
      if (kind === 'literal') { const v = tokens[i++].value; return v === '' ? EPS() : lit(v); }
      if (kind === 'name') return {type: 'ref', value: tokens[i++].value};
      if (kind === 'epsilon') { i++; return EPS(); }
      if (['[', '{', '('].includes(kind)) {
        if (++depth > 40) fail('Zu tief verschachtelt (maximal 40 Ebenen)');
        i++; const child = expression(); eat({'[': ']', '{': '}', '(': ')'}[kind]); depth--;
        return kind === '(' ? child : {type: kind === '[' ? 'opt' : 'rep', child};
      }
      fail('Terminal, Nichtterminal oder Gruppe erwartet');
    }
    function seq() {
      const items = [];
      while (starts()) {
        items.push(atom());
        // Read V2 files as well; V4 serialization never emits commas.
        if (peek() === ',') { legacyCommas = true; i++; if (!starts()) fail('Baustein nach dem Komma erwartet'); }
      }
      return sequence(items);
    }
    function expression() {
      const items = [seq()];
      while (peek() === '|') { i++; if (!starts()) fail('Alternative erwartet (für das leere Wort ε verwenden)'); items.push(seq()); }
      return alternative(items);
    }
    while (i < tokens.length) {
      const name = eat('name').value;
      if (rules.some(r => r.name === name)) fail(`Regel „${name}“ ist doppelt definiert`);
      eat('='); const node = expression(); eat(';'); rules.push({name, node});
      if (rules.length > 60) fail('Maximal 60 Regeln erlaubt');
    }
    return {rules, legacyCommas};
  }
  function fmt(node, parent = '') {
    switch (node.type) {
      case 'eps': return 'ε';
      case 'lit': return JSON.stringify(node.value);
      case 'ref': return node.value;
      case 'seq': return node.items.length ? node.items.map(n => fmt(n, 'seq')).join(' ') : 'ε';
      case 'alt': {
        const text = node.items.map(n => fmt(n, 'alt')).join(' | ');
        return parent === 'seq' ? `(${text})` : text;
      }
      case 'opt': return `[${fmt(node.child)}]`;
      case 'rep': return `{${fmt(node.child)}}`;
      default: throw new Error('Unbekannter Bausteintyp');
    }
  }
  const serialize = rules => rules.map(r => `${r.name} = ${fmt(r.node)};`).join('\n');
  function walk(node, fn) { fn(node); node.items?.forEach(n => walk(n, fn)); if (node.child) walk(node.child, fn); }
  function diagnostics(rules) {
    const names = new Set(rules.map(r => r.name)), missing = new Set();
    for (const r of rules) walk(r.node, n => { if (n.type === 'ref' && !names.has(n.value)) missing.add(n.value); });
    return [...missing].map(name => `Nichtterminal „${name}“ ist nicht definiert.`);
  }
  function reachable(rules, start) {
    const byName = new Map(rules.map(r => [r.name, r.node])), seen = new Set();
    function visit(name) {
      if (seen.has(name)) return;
      if (!byName.has(name)) throw new Error(`Nichtterminal „${name}“ ist nicht definiert.`);
      seen.add(name); walk(byName.get(name), n => { if (n.type === 'ref') visit(n.value); });
    }
    if (!start) throw new Error('Bitte eine Grammatik und ein Startsymbol wählen.');
    visit(start); return rules.filter(r => seen.has(r.name));
  }
  // Convert EBNF to a CFG. Terminals are Unicode code points, epsilon is [].
  function compileCFG(rules, start) {
    const used = reachable(rules, start), productions = [], nodeIDs = new WeakMap(); let serial = 0;
    const add = (lhs, rhs) => productions.push({lhs, rhs});
    function build(n) {
      if (n.type === 'ref') return `r:${n.value}`;
      if (nodeIDs.has(n)) return nodeIDs.get(n);
      const id = `n:${serial++}`; nodeIDs.set(n, id);
      if (n.type === 'eps') add(id, []);
      if (n.type === 'lit') add(id, Array.from(n.value, t => ({t})));
      if (n.type === 'seq') add(id, n.items.map(build));
      if (n.type === 'alt') n.items.forEach(c => add(id, [build(c)]));
      if (n.type === 'opt') { add(id, []); add(id, [build(n.child)]); }
      if (n.type === 'rep') { add(id, []); add(id, [build(n.child), id]); }
      return id;
    }
    used.forEach(r => add(`r:${r.name}`, [build(r.node)]));
    const startIndex = productions.length; add('START', [`r:${start}`]);
    const byLHS = new Map();
    productions.forEach((p, index) => { if (!byLHS.has(p.lhs)) byLHS.set(p.lhs, []); byLHS.get(p.lhs).push(index); });
    const nullable = new Set(); let changed = true;
    while (changed) {
      changed = false;
      for (const p of productions) if (!nullable.has(p.lhs) && p.rhs.every(s => typeof s === 'string' && nullable.has(s))) { nullable.add(p.lhs); changed = true; }
    }
    return {productions, byLHS, startIndex, nullable};
  }
  // Earley recognition supports left/right recursion, mutual recursion and epsilon.
  function recognizer(rules, start) {
    const {productions, byLHS, startIndex, nullable} = compileCFG(rules, start);
    return function accepts(word) {
      const chars = Array.from(word);
      if (chars.length > 160) throw new Error('Wortprüfung: maximal 160 Zeichen.');
      const chart = Array.from({length: chars.length + 1}, () => ({items: [], keys: new Set()}));
      let work = 0;
      function add(at, p, dot, origin) {
        const key = `${p}/${dot}/${origin}`, set = chart[at];
        if (!set.keys.has(key)) {
          if (++work > 180000) throw new Error('Prüfgrenze erreicht. Bitte ein kürzeres Wort oder eine kleinere Grammatik verwenden.');
          set.keys.add(key); set.items.push({p, dot, origin});
        }
      }
      add(0, startIndex, 0, 0);
      for (let at = 0; at < chart.length; at++) {
        for (let k = 0; k < chart[at].items.length; k++) {
          const item = chart[at].items[k], prod = productions[item.p], next = prod.rhs[item.dot];
          if (next === undefined) {
            for (const prev of chart[item.origin].items) {
              if (productions[prev.p].rhs[prev.dot] === prod.lhs) add(at, prev.p, prev.dot + 1, prev.origin);
            }
          } else if (typeof next === 'string') {
            for (const p of byLHS.get(next) || []) add(at, p, 0, at);
            if (nullable.has(next)) add(at, item.p, item.dot + 1, item.origin);
          } else if (at < chars.length && next.t === chars[at]) add(at + 1, item.p, item.dot + 1, item.origin);
        }
      }
      return chart[chars.length].keys.has(`${startIndex}/1/0`);
    };
  }
  const length = s => Array.from(s).length;
  const wordOrder = (a, b) => length(a) - length(b) || (a < b ? -1 : a > b ? 1 : 0);
  // Bounded fixed point, so recursive grammars cannot cause infinite generation.
  function generate(rules, start, options = {}) {
    const maxLength = options.maxLength ?? 8, maxWords = options.maxWords ?? 60, maxRounds = options.maxRounds ?? 48;
    const {productions, byLHS} = compileCFG(rules, start);
    const languages = new Map([...byLHS.keys()].map(k => [k, new Set()]));
    let limited = false, operations = 0, changed = true, rounds = 0;
    while (changed && rounds++ < maxRounds) {
      changed = false;
      for (const prod of productions) {
        let partial = [''];
        for (const sym of prod.rhs) {
          const choices = typeof sym === 'string' ? [...languages.get(sym)].sort(wordOrder) : [sym.t];
          const next = new Set();
          for (const a of partial) for (const b of choices) {
            if (++operations > 220000) return {words: [...languages.get(`r:${start}`)].sort(wordOrder), limited: true, maxLength, rounds};
            const value = a + b;
            if (length(value) > maxLength) { limited = true; continue; }
            next.add(value);
            if (next.size > maxWords) { limited = true; break; }
          }
          partial = [...next].sort(wordOrder).slice(0, maxWords);
          if (!partial.length) break;
        }
        const target = languages.get(prod.lhs);
        for (const word of partial) {
          if (!target.has(word)) {
            if (target.size >= maxWords) { limited = true; continue; }
            target.add(word); changed = true;
          }
        }
      }
    }
    return {words: [...languages.get(`r:${start}`)].sort(wordOrder), limited: limited || changed, maxLength, rounds};
  }
  class AnalysisLimit extends Error {}
  // Thompson NFA for EBNF with acyclic rule references. Recursive CFGs use bounded tests.
  function compileNFA(rules, start) {
    reachable(rules, start);
    const byName = new Map(rules.map(r => [r.name, r.node])), edges = [], alphabet = new Set();
    const state = () => { if (edges.length >= 3500) throw new AnalysisLimit('Automat ist zu groß.'); edges.push([]); return edges.length - 1; };
    const edge = (a, b, c = null) => { edges[a].push({to: b, char: c}); if (c !== null) alphabet.add(c); };
    function build(n, stack = []) {
      const a = state(), b = state();
      if (n.type === 'eps' || n.type === 'lit' && !n.value) edge(a, b);
      if (n.type === 'lit' && n.value) {
        const chars = Array.from(n.value); let prev = a;
        chars.forEach((c, i) => { const next = i === chars.length - 1 ? b : state(); edge(prev, next, c); prev = next; });
      }
      if (n.type === 'ref') {
        if (stack.includes(n.value)) throw new AnalysisLimit('Rekursive Regeln werden hier nur begrenzt verglichen.');
        const [x, y] = build(byName.get(n.value), [...stack, n.value]); edge(a, x); edge(y, b);
      }
      if (n.type === 'seq') {
        let prev = a;
        n.items.forEach(c => { const [x, y] = build(c, stack); edge(prev, x); prev = y; }); edge(prev, b);
      }
      if (n.type === 'alt') n.items.forEach(c => { const [x, y] = build(c, stack); edge(a, x); edge(y, b); });
      if (n.type === 'opt' || n.type === 'rep') {
        const [x, y] = build(n.child, stack); edge(a, b); edge(a, x); edge(y, b); if (n.type === 'rep') edge(y, x);
      }
      return [a, b];
    }
    let initial, final;
    try { [initial, final] = build(byName.get(start), [start]); }
    catch (e) {
      if (!(e instanceof AnalysisLimit)) throw e;
      // Also recognize syntactically right-linear rule systems, including mutual
      // recursion. All rule entries share a final state. A reference may only
      // occur in tail position, otherwise this construction would overaccept.
      edges.length = 0; alphabet.clear();
      const entries = new Map(reachable(rules, start).map(r => [r.name, state()]));
      final = state(); initial = entries.get(start);
      const hasRef = n => { let found = false; walk(n, c => { if (c.type === 'ref') found = true; }); return found; };
      function emit(n, a, b, tail) {
        if (!hasRef(n)) { const [x, y] = build(n); edge(a, x); edge(y, b); return; }
        if (n.type === 'ref') {
          if (!tail) throw new AnalysisLimit('Rekursion außerhalb rechtslinearer Endpositionen: nur begrenzter Vergleich.');
          edge(a, entries.get(n.value)); return;
        }
        if (n.type === 'alt') { n.items.forEach(c => emit(c, a, b, tail)); return; }
        if (n.type === 'seq') {
          let prev = a;
          n.items.forEach((c, i) => {
            const last = i === n.items.length - 1, next = last ? b : state();
            emit(c, prev, next, tail && last); prev = next;
          }); return;
        }
        if (n.type === 'opt') { edge(a, b); emit(n.child, a, b, tail); return; }
        throw new AnalysisLimit('Referenzen innerhalb von Wiederholungen mit Rekursion: nur begrenzter Vergleich.');
      }
      reachable(rules, start).forEach(r => emit(r.node, entries.get(r.name), final, true));
    }
    function closure(states) {
      const set = new Set(states), todo = [...set];
      while (todo.length) for (const e of edges[todo.pop()]) if (e.char === null && !set.has(e.to)) { set.add(e.to); todo.push(e.to); }
      return [...set].sort((a, b) => a - b);
    }
    const move = (states, c) => closure(states.flatMap(s => edges[s].filter(e => e.char === c).map(e => e.to)));
    return {initial: closure([initial]), final, alphabet, move};
  }
  function equivalent(left, leftStart, right, rightStart) {
    try {
      const a = compileNFA(left, leftStart), b = compileNFA(right, rightStart), alphabet = [...new Set([...a.alphabet, ...b.alphabet])].sort();
      const queue = [{a: a.initial, b: b.initial, word: ''}], seen = new Set(); let i = 0;
      while (i < queue.length) {
        const current = queue[i++], key = current.a.join(',') + '/' + current.b.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        if (current.a.includes(a.final) !== current.b.includes(b.final)) return {kind: 'different', witness: current.word, exact: true};
        if (seen.size > 5000 || queue.length > 30000) throw new AnalysisLimit('Zu viele Automatenzustände.');
        for (const c of alphabet) {
          const aa = a.move(current.a, c), bb = b.move(current.b, c);
          if (aa.length || bb.length) queue.push({a: aa, b: bb, word: current.word + c});
        }
      }
      return {kind: 'equal', exact: true, states: seen.size};
    } catch (e) {
      if (!(e instanceof AnalysisLimit)) throw e;
      const acceptsA = recognizer(left, leftStart), acceptsB = recognizer(right, rightStart);
      const ga = generate(left, leftStart, {maxLength: 8, maxWords: 100});
      const gb = generate(right, rightStart, {maxLength: 8, maxWords: 100});
      const words = [...new Set(['', ...ga.words, ...gb.words])].sort(wordOrder);
      for (const word of words) if (acceptsA(word) !== acceptsB(word)) return {kind: 'different', witness: word, exact: false};
      return {kind: 'unknown', exact: false, tested: words.length, reason: e.message};
    }
  }
  function expandAcyclic(rules, start) {
    const defs = new Map(rules.map(r => [r.name, r.node])); let count = 0;
    function expand(n, stack) {
      if (++count > 800) throw new AnalysisLimit('Beschreibung zu groß');
      if (n.type === 'ref') {
        if (stack.includes(n.value)) throw new AnalysisLimit('Rekursive Grammatik');
        return expand(defs.get(n.value), [...stack, n.value]);
      }
      if (n.items) return {...n, items: n.items.map(c => expand(c, stack))};
      if (n.child) return {...n, child: expand(n.child, stack)};
      return n;
    }
    reachable(rules, start); return expand(defs.get(start), [start]);
  }
  function describe(rules, start) {
    const fallback = {text: 'Für diese Struktur wird keine automatische Sprachbeschreibung behauptet. Untersuche die Sprache mit Wortprüfung und begrenzten Beispielen.', math: null, exact: false};
    let node; try { node = expandAcyclic(rules, start); } catch (e) { if (e instanceof AnalysisLimit) return fallback; throw e; }
    function flatten(n) { return n.type === 'seq' ? n.items.flatMap(flatten) : n.type === 'eps' ? [] : [n]; }
    const parts = flatten(node), reps = parts.filter(n => n.type === 'rep');
    if (reps.length === 1 && parts.every(n => n.type === 'lit' || n === reps[0])) {
      const repParts = flatten(reps[0].child);
      if (repParts.every(n => n.type === 'lit')) {
        const token = repParts.map(n => n.value).join(''), index = parts.indexOf(reps[0]);
        const prefix = parts.slice(0, index).map(n => n.value).join(''), suffix = parts.slice(index + 1).map(n => n.value).join('');
        if (token) {
          const quoted = value => JSON.stringify(value);
          const text = `${prefix ? `Alle Wörter mit dem festen Anfang ${quoted(prefix)}, gefolgt von ` : 'Alle Wörter aus '}` +
            `beliebig vielen Wiederholungen von ${quoted(token)} (auch null)` + `${suffix ? ` und dem festen Ende ${quoted(suffix)}` : ''}.`;
          return {text, math: `L(G) = { ${prefix ? quoted(prefix) + ' · ' : ''}(${quoted(token)})ⁿ${suffix ? ' · ' + quoted(suffix) : ''} | n ∈ ℕ₀ }`, exact: true};
        }
      }
    }
    let hasRep = false; walk(node, n => { if (n.type === 'rep') hasRep = true; });
    if (!hasRep) {
      const generated = generate(rules, start, {maxLength: 40, maxWords: 24, maxRounds: 80});
      if (!generated.limited) {
        const words = generated.words.map(w => w === '' ? 'ε' : JSON.stringify(w));
        return {text: `Die Sprache ist endlich und besteht aus ${words.length === 1 ? 'genau einem Wort' : `genau ${words.length} Wörtern`}.`, math: `L(G) = { ${words.join(', ')} }`, exact: true};
      }
    }
    return fallback;
  }
  function negativeExamples(rules, start, examples) {
    const accepts = recognizer(rules, start), alphabet = new Set();
    reachable(rules, start).forEach(r => walk(r.node, n => { if (n.type === 'lit') for (const c of n.value) alphabet.add(c); }));
    const chars = [...alphabet].sort().slice(0, 6), candidates = new Set(['', ...chars]);
    for (const a of chars) for (const b of chars) candidates.add(a + b);
    for (const w of examples.slice(0, 8)) { candidates.add(Array.from(w).reverse().join('')); candidates.add(w + (chars[0] || 'a')); }
    return [...candidates].sort(wordOrder).filter(w => !accepts(w)).slice(0, 6);
  }
  const api = {EPS, lit, sequence, alternative, identifier, GrammarError, parse, fmt, serialize, walk, diagnostics, reachable, compileCFG, recognizer, generate, compileNFA, equivalent, describe, negativeExamples, wordOrder};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SyntaxCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
