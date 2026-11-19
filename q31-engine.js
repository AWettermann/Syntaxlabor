/* Checks for the four-page learning path. Keeps lexical macro steps scoped
   to worksheet rules that explicitly allow Wort/Text to be derived at once. */
(function (scope) {
  'use strict';
  const common = typeof module !== 'undefined' && module.exports;
  const C = common ? require('./core.js') : scope.SyntaxCore, F = common ? require('./formal.js') : scope.SyntaxFormal, W = common ? require('./wiki3-engine.js') : scope.SyntaxWiki3;
  function grammarFor(part, task, answers) {
    if (!part.grammarPart) return F.parse(part.formal || task.formal, part.start || task.start || 'S', true, part.kind === 'chunk-derive' ? 160 : 100);
    const p = task.parts.find(p => p.id === part.grammarPart), a = answers[p.id] || {};
    if (!a.text?.trim()) throw Error('Gib zuerst deine Grammatik in Teil ' + p.id + ' ein.');
    return W.grammar(a.text, a.start || p.defaultStart, p.ignoreWhitespace);
  }
  function lexicalStep(g, before, after, chunks) {
    const simple = F.step(g, before, after); if (simple.valid) return simple;
    for (let i = 0; i < before.length; i++) if (F.isN(before[i]) && chunks.includes(F.name(before[i]))) {
      const count = after.length - before.length + 1;
      if (count < 1 || !F.same(before.slice(0, i), after.slice(0, i)) || !F.same(before.slice(i + 1), after.slice(i + count))) continue;
      const replacement = after.slice(i, i + count); if (replacement.some(F.isN)) continue;
      const word = replacement.map(F.name).join('');
      if (C.recognizer(F.toEBNF(g), F.name(before[i]))(word)) return {valid: true, rule: F.name(before[i]) + ' als zulässigen vollständigen Wort-/Textblock ableiten'};
    }
    return simple;
  }
  function check(part, answer, task, answers, base) {
    const g = grammarFor(part, task, answers);
    if (part.kind === 'derivations') {
      const expectedRules = part.language ? C.parse(part.language).rules : null;
      const expected = expectedRules ? C.recognizer(expectedRules, expectedRules[0].name) : () => true;
      const lines = String(answer.text || '').split('\n').map(s => s.trim()).filter(Boolean);
      if (lines.length > 20) throw Error('Bitte höchstens 20 Ableitungsketten, je eine pro Zeile.');
      const words = new Set();
      for (const [i, line] of lines.entries()) {
        const forms = F.splitDerivation(line), last = F.symbols(forms.at(-1) || '', !!g.named);
        const target = last.map(F.name).join(''), d = F.derivation(g, line, target);
        if (!last.some(F.isN) && d.complete && expected(target) && !words.has(target)) { words.add(target); base.feedback.push(`Kette ${i + 1}: ${target || 'ε'} vollständig und zulässig abgeleitet.`); }
        else if (!last.some(F.isN) && d.complete && !expected(target)) base.feedback.push(`Kette ${i + 1}: Die Schritte passen zu deiner Grammatik, aber ${target || 'ε'} gehört nicht zur geforderten Sprache.`);
        else base.feedback.push(`Kette ${i + 1}: ${words.has(target) ? 'Dieses Wort wurde schon verwendet.' : d.complete ? 'Die letzte Satzform enthält noch Nichtterminale.' : d.message}`);
      }
      base.autoEarned = Math.round(Math.min(words.size, part.count) / part.count * part.be * 100) / 100;
      base.status = words.size >= part.count ? 'correct' : 'incorrect';
      base.feedback.push(`Gesucht sind ${part.count} verschiedene vollständig abgeleitete Wörter. Jede Kette wird einzeln mit den ${part.grammarPart ? 'eigenen' : 'vorgegebenen'} Regeln geprüft.`);
      return base;
    }
    if (part.kind === 'chunk-derive') {
      const forms = F.splitDerivation(answer.text || '').map(s => F.symbols(s, true));
      if (!forms.length || forms.length > 80) throw Error('Zwischen 1 und 80 Satzformen angeben.');
      let valid = F.same(forms[0], [F.N(g.start)]);
      if (!valid) base.feedback.push('Beginne mit <' + g.start + '>.');
      try {
        for (let i = 1; i < forms.length; i++) {
          const result = lexicalStep(g, forms[i - 1], forms[i], part.chunks);
          valid = valid && result.valid;
          base.feedback.push(`Schritt ${i}: ${F.display(forms[i - 1])} -> ${F.display(forms[i])}. ${result.valid ? 'Zulässig: ' + (result.rule || 'einzelne Regelanwendung') : 'Keine zulässige Regelanwendung oder erlaubte Wort-/Textableitung.'}`);
        }
      } catch (e) { base.status = 'open'; base.pending = part.be; base.feedback.push('Prüfgrenze erreicht: ' + e.message + ' Nutze Musterlösung und Prüfaspekte.'); return base; }
      if (valid && F.same(forms.at(-1), Array.from(part.target, F.T))) { base.status = 'correct'; base.autoEarned = part.be; base.feedback.push('Die Liste ist vollständig abgeleitet. Ausschließlich Wort und Text durften als ganze, nach ihren Regeln gültige Blöcke ersetzt werden.'); }
      else base.feedback.push('Die vollständige Ableitung muss genau das Ziel einschließlich Anführungszeichen, Leerzeichen und Winkelklammern erreichen.');
      return base;
    }
    throw Error('Unbekanntes Q3.1-Aufgabenformat.');
  }
  const api = {check, lexicalStep};
  if (common) module.exports = api; else scope.SyntaxQ31Checks = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
