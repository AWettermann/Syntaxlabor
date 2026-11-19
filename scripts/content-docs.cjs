/* Generate teacher-facing documentation from the same tested activity data. */
const fs = require('node:fs');
const path = require('node:path');
const A = require('../curriculum-tasks.js'), C = require('../core.js'), F = require('../formal.js'), Q = require('../assessment.js'), R = require('../renderer.js');
const root = path.resolve(__dirname, '..');
const names = {sets: 'Grammatikbestandteile', text: 'Begründung / Selbstkontrolle', derive: 'Ableitung prüfen', tree: 'Ableitungsbaum erstellen', words: 'Wörter zuordnen', examples: 'Beispiele angeben', classify: 'Chomsky-Klassifikation', mapping: 'Zuordnung', choice: 'Auswahl und Erklärung', ebnf: 'EBNF schreiben', draw: 'Grafisch zeichnen', compare: 'Darstellungen vergleichen'};
const skills = {sets: [1], text: [8], derive: [2], tree: [2], words: [1, 3], examples: [3], classify: [4], mapping: [4], choice: [4], ebnf: [5, 7], draw: [6, 7], compare: [7, 8]};
Object.assign(names, {word: 'Wagenfolge', grammar: 'Eigene Grammatik / Beweis oder Selbstkontrolle', 'own-classify': 'Eigene Produktionsform klassifizieren', 'own-derive': 'Ableitung mit eigener Grammatik', 'dead-derive': 'Aussichtslosen Ableitungszweig prüfen'});
Object.assign(skills, {word: [1, 3], grammar: [1, 3], 'own-classify': [4], 'own-derive': [2], 'dead-derive': [2]});
Object.assign(names, {derivations: 'Eigene Wörter vollständig ableiten', 'chunk-derive': 'Materialableitung mit geprüften Wort-/Textblöcken'});
Object.assign(skills, {derivations: [2], 'chunk-derive': [2]});
const esc = s => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
let raster = `# Aufgaben- und Kompetenzraster · Syntaxlabor V4.1\n\n${A.tasks.length} Aufgaben mit ${A.tasks.reduce((s, t) => s + t.parts.length, 0)} Teilaufgaben (56 erhaltene Aufgabenblöcke und 18 neue Aufgaben; Quellenaufgaben werden im Lernpfad gebündelt) plus sechs erhaltene V4.0-Kurzübungen. Die beiden Klausuren stellen ausgewählte Teilaufgaben zu vollständigen Q3-Arbeiten mit je 40 BE zusammen. Es sind keine offiziellen Abituraufgaben.\n\n`;
raster += 'Die vollständige Chomsky-Hierarchie von Typ 0 bis Typ 3 ist fester Bestandteil des gewünschten Lernprogramms. Der offizielle GK-Prüfungsumfang und der erweiterte Lernumfang bleiben sachlich unterschieden: [Quellen und Abgrenzung](QUELLEN.md). AFB sind kontextbezogene Einschätzungen dieser eigenen Aufgaben.\n\n## Kompetenzen\n\n';
A.skills.forEach((s, i) => { raster += `${i + 1}. ${s}\n`; });
for (const m of A.modules) {
  raster += `\n## Modul ${m.number} · ${m.title}\n\n${m.scope}.\n\n| Aufgabe | Teil | Arbeitsauftrag / Operator | Format | AFB | BE | Kompetenz | Einordnung |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
  for (const t of A.tasks.filter(t => t.module === m.id)) for (const p of t.parts) raster += `| ${t.id} · ${esc(t.title)} | ${p.id} | ${esc(p.prompt)} | ${names[p.kind]} | ${p.afb} | ${p.be} | ${(p.skills ? p.skills.map(i => i + 1) : skills[p.kind]).join(', ')} | ${t.module === 'M1' ? 'Eigene Einstiegsaufgabe; Wikiseite 1 fehlt' : t.source || t.legacyModule === 'W' ? 'Bereitgestellte Q3.1-Quelle' : 'Erhaltene eigene Zusatzübung'} |\n`;
}
raster += '\n## Klausurraster\n\n| Klausur | Aufgaben / Teilaufgaben | AFB I | AFB II | AFB III | Gesamt | Automatisch prüfbar | Freitext / Selbstkontrolle |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n';
for (const exam of A.exams) {
  const parts = exam.parts.flatMap(b => A.tasks.find(t => t.id === b.task).parts.filter(p => b.ids.includes(p.id)));
  const sum = list => list.reduce((s, p) => s + p.be, 0);
  raster += `| ${exam.id} | ${exam.parts.map(b => `${b.task} (${b.ids.join(', ')})`).join('; ')} | ${sum(parts.filter(p => p.afb === 'I'))} | ${sum(parts.filter(p => p.afb === 'II'))} | ${sum(parts.filter(p => p.afb === 'III'))} | ${sum(parts)} | ${sum(parts.filter(p => p.kind !== 'text'))} | ${sum(parts.filter(p => p.kind === 'text'))} |\n`;
}
raster += '\nDer Schwerpunkt der Q3-Arbeiten liegt auf AFB II. Diese Verteilung ist keine Behauptung einer amtlichen Landesabiturverteilung. Automatisch prüfbare BE können bei nicht unterstützten Sprachvergleichen fachlich offen bleiben.\n';
fs.writeFileSync(path.join(root, 'AUFGABENRASTER.md'), raster);
function model(t, p) {
  if (p.kind === 'text') return p.solution + '\n\n' + p.criteria.map(c => `- ${c[0]} — ${c[1]} BE`).join('\n');
  if (p.answer && ['ebnf', 'draw'].includes(p.kind)) return '```ebnf\n' + p.answer + '\n```\n\n' + (p.kind === 'draw' ? 'Ein fachlich korrekt verbundenes Diagramm derselben Sprache ist die gesuchte Zeichnung. Die EBNF oben beschreibt die Musterstruktur.' : 'Sprachlich gleichwertige Lösungen sind im unterstützten Bereich zulässig.');
  if (p.solution) return p.solution;
  if (p.kind === 'sets') { const g = F.parse(p.formal, t.start || 'S'); return `N = {${g.nonterminals.join(', ')}}, T = {${g.terminals.join(', ')}}, S = ${g.start}. Je ein passender Bestandteil: ${p.be / 3} BE.`; }
  if (p.kind === 'words') { const r = C.parse(p.answer).rules, run = C.recognizer(r, r[0].name); return p.samples.map(w => `- ${w ? '`' + w + '`' : 'ε'}: ${run(w) ? 'enthalten' : 'nicht enthalten'} — ${p.be / p.samples.length} BE`).join('\n'); }
  if (p.kind === 'classify') return p.rows.map(r => { const c = Q.productionType(r.formal); return `- ${r.label}: ${c.value === 'invalid' ? 'ungültig' : 'Typ ' + c.value} — ${p.be / p.rows.length} BE. ${c.info}`; }).join('\n');
  if (p.kind === 'compare') { const a = C.parse(p.left).rules, b = C.parse(p.right).rules, d = C.equivalent(a, a[0].name, b, b[0].name); return p.equal ? 'Sprachlich gleichwertig (exakt geprüft).' : `Nicht gleichwertig. Beispiel: ${d.witness ? '`' + d.witness + '`' : 'ε'}. 1 BE für die Entscheidung, ${p.be - 1} BE für ein tatsächlich unterscheidendes Gegenbeispiel.`; }
  if (p.kind === 'choice') return p.expected + '. ' + p.solution;
  if (p.kind === 'mapping') return p.rows.map(r => `- ${r.label}: ${r.expected}`).join('\n');
  if (p.kind === 'examples') { const r = C.parse(p.answer).rules, generated = C.generate(r, r[0].name); const words = p.positive ? generated.words.filter(w => !(t.excludedExamples || []).includes(w)) : C.negativeExamples(r, r[0].name, generated.words); return 'Beispielsweise: ' + words.slice(0, p.count).map(w => w ? '`' + w + '`' : 'ε').join(', ') + '. Je ein anderes passendes Wort: 1 BE.'; }
  return '';
}
let papers = '# Zwei Q3-Übungsklausuren · Syntaxlabor V4.1\n\nSelbst erstellte abiturorientierte Übungsaufgaben, keine offiziellen Abituraufgaben. Je 40 BE. Die Empfehlung von 100 Minuten ist eine eigene didaktische Setzung. Diese thematischen Arbeiten ersetzen keine vollständige Informatikabiturprüfung.\n\nDie verwendeten Buchstaben verweisen auf die Teilaufgaben im Aufgabenkatalog. Alle hier zusammengestellten Teilaufgaben sind zu bearbeiten. Erwartungshorizonte beginnen erst im zweiten Abschnitt des Dokuments.\n';
for (const exam of A.exams) {
  papers += `\n## ${exam.title} · Aufgabenblatt\n\n${exam.note}\n`;
  for (const block of exam.parts) {
    const t = A.tasks.find(t => t.id === block.task); papers += `\n### ${t.id} · ${t.title}\n\n${t.intro}\n`;
    if (t.reference && !t.defect) for (const [i, r] of C.parse(t.reference).rules.entries()) {
      const file = `materials/${t.id}-${r.name}.svg`; fs.writeFileSync(path.join(root, file), R.svg(r.node, r.name, {id: t.id + i})); papers += `\n![Vorgegebenes Diagramm ${r.name}](${file})\n`;
    }
    for (const p of t.parts.filter(p => block.ids.includes(p.id))) {
      papers += `\n**${p.id}) ${p.prompt}** (AFB ${p.afb}, ${p.be} BE)\n`;
      if (p.kind === 'words') papers += '\n' + p.samples.map(w => w ? '`' + w + '`' : 'ε').join(', ') + '\n';
      if (p.kind === 'classify') papers += p.rows.map(r => `\n${r.label}:\n\n\`\`\`text\n${r.formal}\n\`\`\`\n`).join('');
      if (p.kind === 'compare') papers += '\nVorgegebene EBNF:\n\n```ebnf\n' + p.left + '\n```\n';
    }
  }
}
papers += '\n---\n\n# Erwartungshorizonte · erst nach der Bearbeitung öffnen\n\nDie automatische Prüfung vergibt für exakt äquivalente EBNF/Diagramme die angegebenen BE. Bei offenen Vergleichen ist eine fachliche Prüfung nötig. Freitextpunkte werden anhand der einzeln aufgeführten Aspekte selbst eingeschätzt oder durch eine Lehrkraft vergeben. Ableitungen erhalten bis zu BE−1 Punkte für den Anteil zulässiger Schritte und den letzten Punkt für eine vollständig richtige Zielableitung.\n';
for (const exam of A.exams) {
  papers += `\n## ${exam.title} · Erwartungshorizont\n`;
  for (const block of exam.parts) {
    const t = A.tasks.find(t => t.id === block.task); papers += `\n### ${t.id} · ${t.title}\n`;
    for (const p of t.parts.filter(p => block.ids.includes(p.id))) papers += `\n**${p.id}) ${p.be} BE**\n\n${model(t, p)}\n`;
  }
}
fs.writeFileSync(path.join(root, 'KLAUSUREN.md'), papers);
let learning = '# Vier Lernmodule · Aufgabenübersicht\n\nStand: 19. November 2026. Alle 56 bisherigen Aufgabenblöcke sind unter ihren stabilen IDs erhalten. Insgesamt 74 Aufgaben / 283 Teilaufgaben; die sechs freien Kurzübungen und beide 40-BE-Klausuren bleiben zusätzlich erhalten.\n\nLernpfad und weitere Übungen werden getrennt angezeigt. Bei Aufgabe 10 in Modul 2 genügt Wahlweg A oder B; beide bilden einen Lernschritt. Beim Datum in Modul 4 genügt EBNF oder Diagramm; diese Modellierungsleistung wird höchstens einmal gewertet.\n\n';
for (const m of A.modules) {
  const all = A.tasks.filter(t => t.module === m.id);
  learning += `## Modul ${m.number} · ${m.title}\n\n${m.main.length} Aufgaben im Lernpfad (${m.completionGroups.length} Lernschritte) und ${all.filter(t => t.practice).length} weitere Übungen.\n\n`;
  if (m.sourceGap) learning += '**Quellenlücke:** Wikiseite 1 fehlt und ist angefragt. Die vier eigenen Einstiegsaufgaben folgen den Lernzielen des Auftrags; sie sind keine behaupteten Originalaufgaben.\n\n';
  learning += '| ID | Aufgabe | Grundlage | AFB | Max. BE |\n| --- | --- | --- | --- | --- |\n';
  for (const id of m.main) {
    const t = A.tasks.find(t => t.id === id), source = t.source ? `${t.source.sheet}: ${t.source.exercises.join(', ')}` : m.sourceGap ? 'Eigene Einstiegsaufgabe' : 'Erhaltene eigene Übung';
    learning += `| ${id} | ${esc(t.title)} | ${source} | ${[...new Set(t.parts.map(p => p.afb))].sort().join(', ')} | ${Q.maximum(t)} |\n`;
  }
  const more = all.filter(t => t.practice); if (more.length) learning += '\nWeitere erhaltene Übungen: ' + more.map(t => `${t.id} (${t.title})`).join('; ') + '.\n';
  learning += '\n';
}
learning += 'Alle Teilaufgaben, Kompetenzen und BE: [Aufgabenraster](AUFGABENRASTER.md). Fachliche Randfragen, Auswertung, behobene Fehler und technische Einbindung: [Q3.1-Anpassung](Q31-ANPASSUNG.md). Veröffentlichung im bestehenden [GitHub-Repository](https://github.com/AWettermann/Syntaxlabor) nach ausdrücklicher Freigabe.\n';
fs.writeFileSync(path.join(root, 'LERNPFAD.md'), learning);
console.log(`Aufgabenraster und Klausuren aus ${A.tasks.length} Aufgaben erzeugt.`);
