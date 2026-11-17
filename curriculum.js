/* All activities are original exercises. Solutions are local assets, not official exam material. */
(function (scope) {
  'use strict';
  const skills = [
    'Ich kann eine Grammatik analysieren.', 'Ich kann Wörter aus einer Grammatik ableiten.',
    'Ich kann die erzeugte Sprache beschreiben.', 'Ich kann Grammatiken in die Chomsky-Hierarchie einordnen.',
    'Ich kann EBNF-Regeln formulieren.', 'Ich kann Syntaxdiagramme lesen und zeichnen.',
    'Ich kann EBNF und Syntaxdiagramme ineinander umwandeln.', 'Ich kann meine Ergebnisse fachlich begründen.'
  ];
  const modules = [
    {id: 'A', title: 'Grammatiken', subtitle: 'Verstehen, ableiten und Sprachen beschreiben', scope: 'GK-Kern · Q3.1', skills: [0, 1, 2, 7]},
    {id: 'B', title: 'Chomsky-Hierarchie', subtitle: 'Alle vier Typen verstehen, klassifizieren und begründen', scope: 'Vollständige Chomsky-Hierarchie · Typ 0 bis Typ 3', skills: [0, 3, 7]},
    {id: 'C', title: 'EBNF-Training', subtitle: 'Formulieren, lesen und korrigieren', scope: 'Werkzeug für den GK-Kern · Q3.1', skills: [2, 4, 7]},
    {id: 'D', title: 'Syntaxdiagramme', subtitle: 'Selbst zeichnen und Darstellungen vergleichen', scope: 'GK-Kern · Q3.1', skills: [4, 5, 6, 7]},
    {id: 'E', title: 'Transfer', subtitle: 'Grammatiken in Anwendungskontexten entwickeln', scope: 'Abiturorientierte Vertiefung des GK-Kerns', skills: [0, 2, 4, 5, 6, 7]}
  ];
  const p = (id, kind, prompt, afb, be, extra = {}) => ({id, kind, prompt, afb, be, ...extra});
  const text = (id, prompt, afb, criteria, solution) => p(id, 'text', prompt, afb, criteria.reduce((s, c) => s + c[1], 0), {criteria, solution});
  const code = (id, prompt, answer, kind = 'ebnf', be = 4, extra = {}) => p(id, kind, prompt, 'II', be, {answer, ...extra});
  const derive = (id, prompt, target, solution, order = 'any', be = 4) => p(id, 'derive', prompt, 'II', be, {target, solution, order});
  const classify = (id, rows, be = rows.length) => p(id, 'classify', 'Ordne jede vorliegende Grammatik nach ihrer Produktionsform ein. Wähle die engste nachgewiesene Klasse (größte Typnummer).', 'II', be, {rows});
  const words = (id, prompt, answer, samples, be = samples.length) => p(id, 'words', prompt, 'II', be, {answer, samples});
  const examples = (id, prompt, answer, count = 3, positive = true) => p(id, 'examples', prompt, 'II', count, {answer, count, positive});
  const task = (id, title, intro, parts, extra = {}) => ({id, module: id[0], title, intro, parts, hint: 'Unterscheide feste Terminale, veränderbare Nichtterminale und die Bedeutung der einzelnen Produktionsregeln.', ...extra});
  const tasks = [
    task('A1', 'Eine Kette aus a und ein Schlusszeichen', 'Gegeben ist S → aS | b.', [
      p('a', 'sets', 'Gib N, T und das Startsymbol an.', 'I', 3, {formal: 'S → aS | b'}),
      text('b', 'Gib die Produktionsmenge P an.', 'I', [['Beide Produktionen vollständig angegeben.', 1]], 'P = {S → aS, S → b}.'),
      derive('c', 'Leite aaab vollständig ab. Eine Satzform pro Zeile oder ⇒ verwenden.', 'aaab', 'S ⇒ aS ⇒ aaS ⇒ aaaS ⇒ aaab'),
      examples('d', 'Gib drei andere Wörter an; aaab ist ausgeschlossen.', 'S = "a" S | "b";', 3, true),
      text('e', 'Beschreibe L(G) mathematisch.', 'II', [['Beliebig viele a, auch null.', 1], ['Genau ein abschließendes b; Mengenschreibweise mit n ≥ 0.', 2]], 'L(G) = {aⁿb | n ≥ 0}.'),
      text('f', 'Begründe, weshalb aba nicht erzeugt werden kann.', 'II', [['b kann nur die Ableitung beenden.', 1], ['Danach kann kein weiteres a entstehen.', 1]], 'S → b entfernt das einzige Nichtterminal. Daher muss b das letzte Zeichen sein; aba endet auf a.')
    ], {formal: 'S → aS | b', excludedExamples: ['aaab'], hint: 'Wiederhole S → aS dreimal und beende dann mit S → b.'}),
    task('A2', 'Gleiche Anzahlen', 'Gegeben ist S → aSb | ε.', [
      p('a', 'sets', 'Gib die Bestandteile N, T und S an.', 'I', 3, {formal: 'S → aSb | ε'}),
      derive('b', 'Leite aaabbb vollständig ab.', 'aaabbb', 'S ⇒ aSb ⇒ aaSbb ⇒ aaaSbbb ⇒ aaabbb'),
      words('c', 'Prüfe die Wörter. ε bezeichnet das leere Wort.', 'S = "a" S "b" | ε;', ['', 'ab', 'aabb', 'abab']),
      text('d', 'Beschreibe die Sprache und begründe die gleiche Anzahl.', 'II', [['L(G) = {aⁿbⁿ | n ≥ 0}.', 2], ['Jeder Rekursionsschritt fügt genau ein a links und ein b rechts hinzu.', 2]], 'L(G) = {aⁿbⁿ | n ≥ 0}. Die Rekursion erzeugt paarweise a und b; ε ist die Abbruchregel.')
    ], {formal: 'S → aSb | ε', hint: 'Bei jedem Schritt wachsen beide Seiten gleichzeitig. ε löscht nur das verbleibende S.'}),
    task('A3', 'Links oder rechts zuerst?', 'S → AB\nA → aA | a\nB → bB | b', [
      derive('a', 'Leite aabb als Linksableitung ab.', 'aabb', 'S ⇒ AB ⇒ aAB ⇒ aaB ⇒ aabB ⇒ aabb', 'left'),
      derive('b', 'Leite aabb als Rechtsableitung ab.', 'aabb', 'S ⇒ AB ⇒ AbB ⇒ Abb ⇒ aAbb ⇒ aabb', 'right'),
      p('c', 'tree', 'Erstelle einen Ableitungsbaum für aabb. Klicke ein Nichtterminal und wähle seine Produktion.', 'II', 4, {target: 'aabb', solution: 'S ⇒ AB ⇒ aAB ⇒ aaB ⇒ aabB ⇒ aabb'}),
      text('d', 'Vergleiche die beiden Ableitungen: Was bleibt gleich?', 'II', [['Gleiches Wort und gleicher möglicher Ableitungsbaum.', 1], ['Nur die Reihenfolge der Nichtterminalersetzungen unterscheidet sich.', 1]], 'Beide erreichen aabb. A und B können im selben Baum unabhängig entwickelt werden; links/rechts legt die Bearbeitungsreihenfolge fest.'),
      text('e', 'Nenne die Nichtterminal- und Terminalmengen.', 'I', [['N = {S, A, B}.', 1], ['T = {a, b}.', 1]], 'N = {S, A, B}, T = {a, b}.')
    ], {formal: 'S → AB\nA → aA | a\nB → bB | b', hint: 'In einer Linksableitung wird stets das linkeste noch vorhandene Nichtterminal ersetzt.'}),
    task('A4', 'Eine endliche Sprache', 'S → aA | bB\nA → a | b\nB → a | b', [
      p('a', 'sets', 'Gib N, T und das Startsymbol an.', 'I', 3, {formal: 'S → aA | bB\nA → a | b\nB → a | b'}),
      examples('b', 'Gib drei verschiedene gültige Wörter an.', 'S = "a" A | "b" B; A = "a" | "b"; B = "a" | "b";'),
      p('c', 'tree', 'Erstelle einen Ableitungsbaum für ba.', 'II', 3, {target: 'ba', solution: 'S ⇒ bB ⇒ ba'}),
      text('d', 'Gib L(G) vollständig an und begründe die Wortlänge.', 'II', [['Genau {aa, ab, ba, bb}.', 2], ['Jede Ableitung erzeugt genau zwei Terminalzeichen.', 1]], 'L(G) = {aa, ab, ba, bb}. Ein Schritt erzeugt ein Terminal und ein Nichtterminal, der zweite ersetzt das Nichtterminal durch ein Terminal.')
    ], {formal: 'S → aA | bB\nA → a | b\nB → a | b'}),
    task('A5', 'Klammerwörter', 'S → SS | (S) | ε', [
      derive('a', 'Leite (()) ab.', '(())', 'S ⇒ (S) ⇒ ((S)) ⇒ (())'),
      words('b', 'Prüfe die Klammerwörter.', 'S = S S | "(" S ")" | ε;', ['', '()', '(())', '()()', ')(', '(()']),
      text('c', 'Erläutere die Funktionen der drei Produktionen.', 'II', [['SS verkettet zwei Klammerwörter.', 1], ['(S) schachtelt ein Klammerwort ein.', 1], ['ε beendet eine Teilableitung und erlaubt das leere Wort.', 1]], 'SS erlaubt Verkettung, (S) eine zusätzliche Schachtelung und ε den Abschluss. Dadurch entstehen korrekt geschachtelte Klammerfolgen.'),
      text('d', 'Begründe, weshalb gleiche Anzahlen von ( und ) allein nicht ausreichen.', 'III', [['Gegenbeispiel )( mit gleichen Anzahlen.', 1], ['In jedem Präfix dürfen nicht mehr schließende als öffnende Klammern vorkommen.', 2]], ')( enthält gleich viele Klammern, beginnt aber mit einer unzulässigen schließenden Klammer. Zusätzlich muss jedes Präfix mindestens so viele öffnende wie schließende Klammern enthalten.')
    ], {formal: 'S → SS | (S) | ε', hint: 'Die Reihenfolge und die Präfixbedingung sind ebenso wichtig wie die Gesamtanzahl.'}),
    task('A6', 'Regelwechsel und unzulässige Sprünge', 'S → aS | A\nA → bA | b', [
      derive('a', 'Leite aabb vollständig ab.', 'aabb', 'S ⇒ aS ⇒ aaS ⇒ aaA ⇒ aabA ⇒ aabb'),
      text('b', 'Beurteile den angeblichen Einzelschritt S ⇒ ab.', 'III', [['S → aS erzeugt aS, nicht ab.', 1], ['Für ab sind weitere Ersetzungen einschließlich S → A nötig.', 2]], 'S ⇒ ab ist kein Einzelschritt. Eine vollständige Ableitung lautet S ⇒ aS ⇒ aA ⇒ ab.'),
      words('c', 'Prüfe die Wörter.', 'S = "a" S | A; A = "b" A | "b";', ['b', 'aabb', 'aa', 'ba']),
      text('d', 'Beschreibe L(G) einschließlich der unteren Grenzen.', 'II', [['aⁿbᵐ mit n ≥ 0 und m ≥ 1.', 2], ['Der Wechsel zu A verhindert spätere a.', 1]], 'L(G) = {aⁿbᵐ | n ≥ 0, m ≥ 1}. Nach S → A werden ausschließlich b erzeugt.')
    ], {formal: 'S → aS | A\nA → bA | b'}),
    task('A7', 'Alle binären Wörter', 'S → aS | bS | ε', [
      derive('a', 'Leite abba vollständig ab.', 'abba', 'S ⇒ aS ⇒ abS ⇒ abbS ⇒ abbaS ⇒ abba'),
      examples('b', 'Gib drei verschiedene gültige Wörter an.', 'S = "a" S | "b" S | ε;'),
      text('c', 'Beschreibe L(G) und erläutere die Rolle von ε.', 'II', [['L(G) = {a,b}*.', 2], ['ε beendet jede endliche Zeichenfolge, auch die leere.', 1]], 'Die Sprache ist {a,b}*. Für jedes nächste Zeichen kann die passende Rekursion gewählt werden; S → ε beendet die Ableitung.'),
      text('d', 'Beurteile: Weil die Grammatik rekursiv ist, ist ihre Sprache nicht regulär.', 'III', [['Aussage falsch.', 1], ['Ein endlicher Automat mit einem akzeptierenden Zustand und a-/b-Schleifen erkennt die Sprache.', 2]], 'Falsch. Rekursion in einer Grammatik beweist keine Nichtregularität. Die Sprache {a,b}* wird bereits von einem einzigen akzeptierenden Automatenzustand mit zwei Schleifen erkannt.')
    ], {formal: 'S → aS | bS | ε'}),
    task('A8', 'Ein Wort, zwei Strukturen', 'E → E+E | E*E | x. E ist das Startsymbol.', [
      p('a', 'tree', 'Erstelle einen Ableitungsbaum für x+x*x. Wähle am Wurzelknoten eine der beiden Rechenoperationen.', 'II', 5, {target: 'x+x*x', solution: 'E ⇒ E+E ⇒ x+E ⇒ x+E*E ⇒ x+x*E ⇒ x+x*x'}),
      derive('b', 'Leite dasselbe Wort mit Multiplikation als äußerster Operation ab.', 'x+x*x', 'E ⇒ E*E ⇒ E+E*E ⇒ x+E*E ⇒ x+x*E ⇒ x+x*x', 'any', 5),
      text('c', 'Beurteile die Eignung der Grammatik für übliche Rechenprioritäten.', 'III', [['Zwei unterschiedliche Bäume für dasselbe Wort möglich.', 1], ['Strukturen x+(x*x) und (x+x)*x benannt.', 2], ['Getrennte Regeln für Ausdruck, Term und Faktor als Verbesserung.', 1]], 'Die Grammatik ist mehrdeutig: x+(x*x) und (x+x)*x besitzen dieselbe Terminalfolge. Eine Ebenentrennung in Ausdruck/Term/Faktor kann Punkt-vor-Strich festlegen.')
    ], {formal: 'E → E+E | E*E | x', start: 'E', hint: 'Mehrdeutigkeit betrifft verschiedene Bäume, nicht nur verschiedene Ersetzungsreihenfolgen desselben Baums.'}),

    task('B1', 'Fünf Grammatiken einordnen', 'Klassifiziere die Produktionsformen. Die engste Klasse ist nicht automatisch die minimale Sprachklasse.', [
      classify('a', [
        {label: 'G1', formal: 'S → aS | b'}, {label: 'G2', formal: 'S → aSb | ε'}, {label: 'G3', formal: 'S → aSb | ab'},
        {label: 'G4', formal: 'S → aS | a'}, {label: 'G5', formal: 'S → aSb | aAb\nA → aA | a'}
      ]),
      text('b', 'Begründe, weshalb G2 und G3 nicht in rechtslinearer Form vorliegen.', 'II', [['S steht in aSb zwischen Terminalen.', 2], ['Die ε-Regel ändert diese fehlende Linearität nicht.', 1]], 'In S → aSb steht rechts sowohl vor als auch hinter S ein Terminal. Diese Regel ist weder links- noch rechtslinear. Die linken Seiten bestehen aber jeweils nur aus S: Typ 2.')
    ], {extension: true, hint: 'Prüfe zuerst die linken Seiten, dann die Position von Nichtterminalen und schließlich die ε-Ausnahme.'}),
    task('B2', 'Linkslinear und rechtslinear', 'Vergleiche G1: S → Sa | b und G2: S → aS | b.', [
      classify('a', [{label: 'G1', formal: 'S → Sa | b'}, {label: 'G2', formal: 'S → aS | b'}]),
      p('b', 'choice', 'Erzeugen beide Grammatiken dieselbe Sprache?', 'II', 1, {options: ['Ja', 'Nein'], expected: 'Nein', solution: 'G1 erzeugt baⁿ, G2 aⁿb. Das Wort ba unterscheidet die Sprachen.'}),
      text('c', 'Begründe deine Entscheidung mit einem Gegenbeispiel und beschreibe beide Sprachen.', 'II', [['ba in G1, nicht G2; oder ab umgekehrt.', 2], ['G1 erzeugt baⁿ, G2 aⁿb mit n ≥ 0.', 1]], 'G1 erzeugt baⁿ, G2 aⁿb, jeweils n ≥ 0. G1: S ⇒ Sa ⇒ ba. In G2 steht b immer am Ende, daher ist ba dort nicht ableitbar.')
    ]),
    task('B3', 'Die Richtung darf nicht beliebig wechseln', 'S → aA\nA → Sb | b', [
      classify('a', [{label: 'G', formal: 'S → aA\nA → Sb | b'}]),
      p('b', 'choice', 'Welche minimale Sprachklasse hat L(G) = {aⁿbⁿ | n ≥ 1}? Nutze das bekannte Ergebnis über gleiche unbeschränkte Anzahlen.', 'II', 1, {options: ['Typ 3', 'Typ 2', 'Typ 1', 'Typ 0'], expected: 'Typ 2', solution: 'Die Sprache ist kontextfrei, aber nicht regulär. Das bekannte Nichtregularitätsergebnis wird hier vorausgesetzt.'}),
      text('c', 'Erläutere die Verletzung der Typ-3-Bedingung.', 'II', [['aA rechtslinear, Sb linkslinear.', 1], ['Keine einheitliche Richtung der gesamten Grammatik.', 1]], 'Die Regeln sind einzeln linear, aber die Grammatik mischt beide Richtungen. Ein Zyklus fügt außen jeweils ein a und ein b hinzu.')
    ]),
    task('B4', 'Kontextfreie Form, reguläre Sprache', 'S → SS | a', [
      classify('a', [{label: 'G', formal: 'S → SS | a'}]),
      p('b', 'choice', 'Welche minimale Sprachklasse hat die erzeugte Sprache?', 'II', 1, {options: ['Typ 3', 'Typ 2', 'Typ 1', 'Typ 0'], expected: 'Typ 3', solution: 'Die Sprache ist a⁺. Eine äquivalente rechtslineare Grammatik ist S → aS | a.'}),
      text('c', 'Begründe die reguläre Sprachklasse durch eine andere Grammatik.', 'II', [['S → aS | a als reguläre Alternative.', 2], ['Beide erzeugen genau alle nichtleeren a-Folgen.', 1]], 'S → aS | a erzeugt genau a⁺. In der gegebenen Grammatik können mit SS beliebig viele Blätter erzeugt und alle durch a ersetzt werden.')
    ]),
    task('B5', 'ε und die Startsymbolausnahme', 'Für Typ 1/3 verwenden wir die ε-Ausnahme nur dann, wenn das Startsymbol auf keiner rechten Seite vorkommt.', [
      classify('a', [{label: 'Sicher', formal: 'S → ε | aA\nA → aA | a'}, {label: 'Nicht sicher', formal: 'S → ε | aS'}]),
      text('b', 'Erkläre, weshalb die zweite Grammatik trotzdem eine reguläre Sprache erzeugt.', 'II', [['L(G) = a*.', 1], ['Reguläre Sprache trotz anderer syntaktischer Klassifikation nach der vereinbarten ε-Konvention.', 2]], 'Sie erzeugt a*. Für die gegebene Form scheitert die Typ-3-Ausnahme an S rechts. Eine gleichwertige Grammatik mit neuem Startsymbol Z → ε | aA und A → aA | a erfüllt die Konvention.')
    ], {extension: true, hint: 'Prüfe nicht nur, wer ε erzeugt, sondern auch, ob dieses Startsymbol später rechts wieder auftaucht.'}),
    task('B6', 'Löschen eines Nichtstartsymbols', 'S → aA\nA → ε | b', [
      classify('a', [{label: 'G', formal: 'S → aA\nA → ε | b'}]),
      code('b', 'Formuliere dieselbe Sprache ohne Nichtterminalreferenzen als EBNF.', 's = "a" ["b"];'),
      text('c', 'Unterscheide die gegebene Grammatikform von ihrer Sprachklasse.', 'II', [['A → ε fällt nicht unter die Startsymbolausnahme.', 1], ['Die endliche Sprache {a, ab} ist regulär.', 2]], 'Nach der hier vereinbarten ε-Konvention ist die gegebene Form Typ 2. Ihre Sprache {a, ab} ist endlich und damit regulär; S → a | ab wäre eine reguläre Form.')
    ], {extension: true}),
    task('B7', 'Ein Kontext auf der linken Seite', 'S → aAB\nA → a\nAB → BA\nB → b', [
      classify('a', [{label: 'G', formal: 'S → aAB\nA → a\nAB → BA\nB → b'}]),
      derive('b', 'Leite aba ab. Hier ist eine allgemeine Ableitung erlaubt.', 'aba', 'S ⇒ aAB ⇒ aBA ⇒ abA ⇒ aba'),
      text('c', 'Erläutere, weshalb AB → BA keine kontextfreie Produktion ist.', 'II', [['Links stehen zwei Nichtterminale.', 1], ['Länge bleibt gleich; Nichtverkürzung allein reicht nicht für Typ 2.', 2]], 'Kontextfreie Regeln ersetzen genau ein Nichtterminal. AB → BA benötigt beide Symbole gleichzeitig. Die Regel ist aber längenerhaltend und damit im verwendeten Typ-1-Kriterium zulässig.')
    ], {formal: 'S → aAB\nA → a\nAB → BA\nB → b', extension: true}),
    task('B8', 'Verkürzende Regeln', 'S → AB\nAB → a', [
      classify('a', [{label: 'G', formal: 'S → AB\nAB → a'}]),
      derive('b', 'Leite a ab.', 'a', 'S ⇒ AB ⇒ a', 'any', 2),
      p('c', 'choice', 'Welche minimale Sprachklasse hat {a}?', 'II', 1, {options: ['Typ 3', 'Typ 2', 'Typ 1', 'Typ 0'], expected: 'Typ 3', solution: 'Die einelementige Sprache ist regulär. Die Form AB → a verkürzt aber und ist nicht kontextfrei; die vorliegende Grammatik ist nur Typ 0.'}),
      text('d', 'Begründe beide Einordnungen getrennt.', 'II', [['AB → a hat links zwei Symbole und verkürzt.', 1], ['Die äquivalente Grammatik S → a ist regulär.', 1]], 'Die Form ist Typ 0, die Sprache hingegen Typ 3. Die Regel S → a genügt zur Beschreibung derselben Sprache.')
    ], {formal: 'S → AB\nAB → a', extension: true}),
    task('B9', 'Nicht jede Ersetzung ist eine Grammatikregel', 'Auch Typ 0 verlangt eine nichtleere linke Seite mit mindestens einem Nichtterminal.', [
      classify('a', [{label: 'Nur Terminal links', formal: 'S → a\na → b'}, {label: 'Leere linke Seite', formal: 'S → a\nε → a'}, {label: 'Zulässige Typ-0-Form', formal: 'S → AB\nAB → ε'}]),
      text('b', 'Begründe, weshalb uneingeschränkt nicht beliebig bedeutet.', 'II', [['Links muss mindestens ein Nichtterminal stehen.', 1], ['Die linke Seite darf nicht leer sein.', 1]], 'Typ 0 hat die allgemeinsten rechten Seiten. Links bleibt aber ein nichtleeres Wort mit mindestens einem Nichtterminal erforderlich.')
    ], {extension: true}),
    task('B10', 'Hierarchie und Maschinen zuordnen', 'Unterscheide Sprachklassen, Produktionsformen und erkennende Maschinen.', [
      p('a', 'mapping', 'Ordne den Sprachklassen passende Maschinen zu.', 'I', 4, {rows: [
        {label: 'Typ 3', expected: 'Endlicher Automat'}, {label: 'Typ 2', expected: 'Nichtdeterministischer Kellerautomat'},
        {label: 'Typ 1', expected: 'Linear beschränkte Turingmaschine'}, {label: 'Typ 0', expected: 'Turingmaschine (Erkenner)'}
      ], options: ['Endlicher Automat', 'Nichtdeterministischer Kellerautomat', 'Linear beschränkte Turingmaschine', 'Turingmaschine (Erkenner)']}),
      p('b', 'mapping', 'Beurteile die Aussagen über Sprachklassen.', 'II', 3, {rows: [
        {label: 'Jede reguläre Sprache ist kontextfrei.', expected: 'Richtig'},
        {label: 'Jede kontextfreie Sprache ist regulär.', expected: 'Falsch'},
        {label: 'Eine Typ-2-Produktionsform beweist Nichtregularität der Sprache.', expected: 'Falsch'}
      ], options: ['Richtig', 'Falsch']}),
      text('c', 'Gib ein Gegenbeispiel zur letzten Aussage an.', 'III', [['Eine kontextfreie, nicht regulär geformte Grammatik mit regulärer Sprache.', 2]], 'S → SS | a hat keine reguläre Produktionsform, erzeugt aber die reguläre Sprache a⁺.')
    ], {extension: true}),
    task('B11', 'Einheitsregeln und Konventionen', 'Wir erlauben die verallgemeinerte lineare Form A → wB oder w (bzw. Bw), w ∈ T*. Einheitsregeln wie S → A sind damit zulässig. Für ε bleibt die Startsymbolausnahme verbindlich.', [
      classify('a', [{label: 'G', formal: 'S → A\nA → aA | b'}]),
      text('b', 'Beschreibe die Sprache und erläutere den Einfluss der Einheitsregel.', 'II', [['L(G) = {aⁿb | n ≥ 0}.', 2], ['S → A ändert nur das Nichtterminal, erzeugt kein Terminal.', 1]], 'S → A wechselt zur Regel A, ohne ein Zeichen zu erzeugen. Danach folgen beliebig viele a und genau ein b. In engeren Normalformen werden Einheitsregeln erst beseitigt.')
    ]),
    task('B12', 'Unerreichbare Regeln zählen zur Form', 'S → aS | a\nAB → ε', [
      classify('a', [{label: 'G', formal: 'S → aS | a\nAB → ε'}]),
      p('b', 'choice', 'Welche minimale Sprachklasse hat die vom Startsymbol S erzeugte Sprache?', 'II', 1, {options: ['Typ 3', 'Typ 2', 'Typ 1', 'Typ 0'], expected: 'Typ 3', solution: 'AB ist von S aus unerreichbar. Die erzeugte Sprache bleibt a⁺ und ist regulär.'}),
      text('c', 'Beurteile: Unerreichbare Regeln kann man bei der Klassifikation der vorliegenden Form ignorieren.', 'III', [['Falsch für die Produktionsform: alle Regeln müssen die Formbedingungen erfüllen.', 2], ['Richtig ist nur, dass AB → ε die von S erzeugte Sprache nicht verändert.', 1]], 'Für die gegebene Form zählt auch die verkürzende Regel AB → ε: Typ 0. Für L(G) ist sie wirkungslos, weil A und B nie von S aus entstehen.')
    ], {extension: true})
  ];
  const hierarchy = [
    {type: 3, title: 'Regulär', form: 'A → wB oder A → w; alternativ einheitlich linkslinear.', condition: 'Ein Nichtterminal links; höchstens eines rechts, immer am selben Rand. w ist ein Terminalwort. Es gilt die erklärte ε-Ausnahme.', example: 'S → aS | b', machine: 'Endlicher Automat'},
    {type: 2, title: 'Kontextfrei', form: 'A → γ', condition: 'Links genau ein Nichtterminal; rechts eine beliebige Folge aus Terminalen und Nichtterminalen, auch ε.', example: 'S → aSb | ε', machine: 'Nichtdeterministischer Kellerautomat'},
    {type: 1, title: 'Kontextsensitiv', form: 'u → v mit |u| ≤ |v|', condition: 'Nichtverkürzende Konvention: Links mindestens ein Nichtterminal; die Wortlänge nimmt nicht ab. Sonderfall S → ε nur, wenn S nirgends rechts steht.', example: 'S → aAB\nAB → BA\nA → a\nB → b', machine: 'Linear beschränkte Turingmaschine'},
    {type: 0, title: 'Uneingeschränkt', form: 'u → v', condition: 'Links eine nichtleere Folge mit mindestens einem Nichtterminal; rechts eine beliebige Folge, auch ε. Verkürzende Regeln sind erlaubt.', example: 'S → AB\nAB → a', machine: 'Turingmaschine als Erkenner; kein allgemeiner Entscheider'}
  ];
  const api = {skills, modules, tasks, hierarchy, p, text, code, derive, classify, words, examples, task};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else scope.SyntaxCurriculum = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
