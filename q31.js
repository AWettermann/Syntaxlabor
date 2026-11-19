/* Four-page progression. Stable historical task IDs preserve local progress
   and both existing practice papers. Worksheet originals are local assets. */
(function (scope) {
  'use strict';
  function install(A) {
    if (A.q31) return A;
    const {p, text, code, derive, words, examples, task} = A;
    const get = id => A.tasks.find(t => t.id === id);
    const q = JSON.stringify, alts = chars => Array.from(chars, q).join(' | ');
    const digit = 'Ziffer = ' + alts('0123456789') + ';', nonzero = 'Nichtnull = ' + alts('123456789') + ';';
    const alphabet = 'Buchstabe = ' + alts('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') + ';';
    const rawAB = 'S → aS | b', paired = 'S → aSb | ε';
    const chains = (id, prompt, formal, start, count, solution, extra = {}) => p(id, 'derivations', prompt, 'II', count * 2, {formal, start, count, solution, ...extra});
    const grammar = (id, prompt, model, defaultStart, cases, extra = {}) => p(id, 'grammar', prompt, 'III', 5, {model, defaultStart, cases, solution: model, reviewCriteria: ['Jede vollständige Ableitung erfüllt die gewünschte Form (Korrektheit).', 'Jedes gewünschte Wort besitzt eine Ableitung (Vollständigkeit).', 'Abschluss, Mindestlänge und rekursive Regeln gemeinsam prüfen.'], ...extra});
    const original = (sheet, exercises) => ({sheet, exercises});
    const numberBNF = '<Zahl> ::= <Ziffer> | <Ziffer><Zahl>\n<Ziffer> ::= ' + alts('0123456789');
    const diagramWord = 'Wort = ("a" | "b") {"a"} ["x"] ({"b"} "a" | "c");';
    const filenames = 'Datei = Zeichen {Zeichen} "." Zeichen Zeichen Zeichen;\nZeichen = Buchstabe | Ziffer;\n' + alphabet + '\n' + digit;
    const sentence = 'Satz = Wortgruppe ("essen" | "lieben") (Wortgruppe | "schnell" | "langsam") ".";\nWortgruppe = [Adjektiv] {"," Adjektiv} ("Katzen" | "Mäuse");\nAdjektiv = "schwarze" | "weiße" | "dürre" | "fette";';
    const term = 'Term = Zahl {("*" | "/") Zahl};\nZahl = "z";';
    const date = 'Datum = Tag Trenner Monat Trenner Jahr;\nTag = "0" Nichtnull | ("1" | "2") Ziffer | "3" ("0" | "1");\nMonat = "0" Nichtnull | "1" ("0" | "1" | "2");\nJahr = Nichtnull {Ziffer};\nTrenner = "." | "-";\n' + nonzero + '\n' + digit;
    const allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&\'*+-/=?^_{}~';
    const specials = '<>:;@,. ';
    const mail = [
      '<Adressliste> → <Adresse> | <Gruppe> | <Adresse> ", " <Adressliste> | <Gruppe> ", " <Adressliste>',
      '<Adresse> → <EMail> | "<" <EMail> ">" | <Anzeigename> " <" <EMail> ">"',
      '<Gruppe> → <Anzeigename> ":;" | <Anzeigename> ":" <Adressfolge> ";"',
      '<Adressfolge> → <Adresse> | <Adresse> ", " <Adressfolge>',
      '<Anzeigename> → ' + q('"') + ' <Text> ' + q('"') + ' | <Wortfolge>',
      '<Wortfolge> → <Wort> | <Wort> " " <Wortfolge>',
      '<Text> → <Beliebig> | <Beliebig> <Text>',
      '<Wort> → <Zulaessig> | <Zulaessig> <Wort>',
      '<Beliebig> → <Zulaessig> | <Spezial>',
      '<Zulaessig> → ' + alts(allowed),
      '<Spezial> → ' + alts(specials),
      '<EMail> → <Name> "@" <Domain>',
      '<Domain> → <Wort> "." <Name>',
      '<Name> → <Wort> | <Wort> "." <Name>'
    ].join('\n');
    const mailLex = 'EMail = Name "@" Domain;\nDomain = Wort "." Name;\nName = Wort {"." Wort};\nWort = Zulaessig {Zulaessig};\nZulaessig = ' + alts(allowed) + ';';
    const mailEBNF = 'Adressliste = (Adresse | Gruppe) {", " (Adresse | Gruppe)};\nAdresse = EMail | "<" EMail ">" | Anzeigename " <" EMail ">";\nGruppe = Anzeigename ":" [Adresse {", " Adresse}] ";";\nAnzeigename = ' + q('"') + ' Text ' + q('"') + ' | Wort {" " Wort};\nText = Beliebig {Beliebig};\nBeliebig = Zulaessig | Spezial;\nSpezial = ' + alts(specials) + ';\n' + mailLex;
    const mailTarget = '"Betty H" <betty@home.gmx.de>';
    const mailForms = ['<Adressliste>', '<Adresse>', '<Anzeigename>' + q(' <') + '<EMail>' + q('>'), q('"') + '<Text>' + q('" <') + '<EMail>' + q('>'), q('"Betty H" <') + '<EMail>' + q('>'), q('"Betty H" <') + '<Name>' + q('@') + '<Domain>' + q('>'), q('"Betty H" <') + '<Wort>' + q('@') + '<Domain>' + q('>'), q('"Betty H" <betty@') + '<Domain>' + q('>'), q('"Betty H" <betty@') + '<Wort>' + q('.') + '<Name>' + q('>'), q('"Betty H" <betty@home.') + '<Name>' + q('>'), q('"Betty H" <betty@home.') + '<Wort>' + q('.') + '<Name>' + q('>'), q('"Betty H" <betty@home.gmx.') + '<Name>' + q('>'), q('"Betty H" <betty@home.gmx.') + '<Wort>' + q('>'), q(mailTarget)];
    const newTasks = [
      task('F1', '1 · Zeichen, Wort, Alphabet und Sprache', 'Eigene Einstiegsaufgabe zu den im Auftrag genannten Lernzielen; Wikiseite 1 liegt noch nicht vor. Es gilt Σ = {a, b}. Ein Zeichen kann zugleich ein Wort der Länge 1 bilden. Eine Sprache ist eine Menge von Wörtern, kein einzelnes Wort.', [
        p('a', 'mapping', 'Beurteile die Aussagen im gegebenen Kontext.', 'I', 6, {options: ['Richtig', 'Falsch'], rows: [
          {label: 'a ist ein Zeichen aus Σ.', expected: 'Richtig'}, {label: 'ab ist ein einzelnes Zeichen aus Σ.', expected: 'Falsch'}, {label: 'ab ist ein Wort über Σ.', expected: 'Richtig'}, {label: '{ab, aab} ist ein einzelnes Wort.', expected: 'Falsch'}, {label: 'Σ ist eine Menge von Zeichen.', expected: 'Richtig'}, {label: 'ε gehört als Zeichen zu Σ.', expected: 'Falsch'}]}),
        text('b', 'Erkläre am Beispiel a, weshalb Zeichen und Wort keine sich ausschließenden Rollen sind.', 'II', [['a ist ein einzelnes Alphabetzeichen.', 1], ['Die Folge aus genau diesem Zeichen ist ein Wort der Länge 1.', 1]], 'a ist ein Zeichen von Σ. Als Zeichenfolge der Länge 1 ist a zugleich ein Wort über Σ. Σ und eine Sprache sind dagegen Mengen.')
      ]),
      task('F2', '3 · Eine Sprachbeschreibung anwenden', 'Eigene Einstiegsaufgabe: L enthält genau die Wörter über {a,b}, die mit genau einem a beginnen und danach nur noch beliebig viele b enthalten. Auch kein b ist erlaubt.', [
        words('a', 'Prüfe die Wortzugehörigkeit.', 'Wort = "a" {"b"};', ['a', 'ab', 'abbb', 'aa', 'ba', 'aba', '']),
        examples('b', 'Gib zwei weitere verschiedene Wörter aus L an; a, ab und abbb sind ausgeschlossen.', 'Wort = "a" {"b"};', 2),
        text('c', 'Beschreibe L mathematisch und begründe den Ausschluss von aba.', 'II', [['L = {abⁿ | n ≥ 0}.', 1], ['Das letzte a verletzt die Bedingung ausschließlich b nach dem ersten Zeichen.', 1]], 'L = {abⁿ | n ≥ 0}. In aba folgt nach dem ersten a noch ein weiteres a. Erlaubt sind dort nur b.')
      ], {excludedExamples: ['a', 'ab', 'abbb']}),
      task('F3', '4 · Syntax und Semantik unterscheiden', 'Eigene Einstiegsaufgabe: Eine vereinfachte Ausdruckssprache besteht aus zwei einstelligen Dezimalzahlen mit / dazwischen. Die Syntax legt nur das Format fest. Die Semantik wäre die Bedeutung als Division.', [
        words('a', 'Welche Zeichenfolgen erfüllen die Syntax?', 'Ausdruck = Ziffer "/" Ziffer;\n' + digit, ['8/2', '8/0', '/2', '12/3']),
        text('b', 'Vergleiche 8/2 und 8/0: Was prüft die Grammatik, was verlangt eine zusätzliche Bedeutungsprüfung?', 'III', [['Beide Zeichenfolgen sind nach der Vorgabe syntaktisch gültig.', 1], ['8/2 hat den Wert 4; Division durch 0 ist in dieser Zahlsemantik nicht definiert.', 1], ['Aus syntaktischer Gültigkeit folgt keine sinnvoll definierte Bedeutung.', 1]], 'Beide erfüllen Ziffer / Ziffer. Erst die Semantik unterscheidet die definierte Division 8/2 = 4 von der nicht definierten Division durch 0. Eine reine Formatgrammatik ersetzt diese Bedeutungsprüfung nicht.')
      ]),
      task('F4', '2 · Leeres Wort und leere Sprache', 'Eigene Einstiegsaufgabe: Unterscheide die Sprache ∅, die Sprache {ε} und die Sprache {" "}. ε besitzt Länge 0; ein Leerzeichen besitzt Länge 1.', [
        p('a', 'mapping', 'Ordne die Aussagen zu.', 'I', 4, {options: ['Richtig', 'Falsch'], rows: [{label: '∅ enthält kein Wort.', expected: 'Richtig'}, {label: '{ε} enthält genau ein Wort.', expected: 'Richtig'}, {label: 'ε und ein Leerzeichen sind dasselbe Wort.', expected: 'Falsch'}, {label: '{ε} und ∅ sind dieselbe Sprache.', expected: 'Falsch'}]}),
        text('b', 'Begründe den Unterschied zwischen Anzahl der Wörter und Länge eines Wortes.', 'II', [['{ε} hat ein Element, dieses Wort hat Länge 0.', 1], ['∅ hat kein Element; ein Leerzeichen wäre ein anderes Wort der Länge 1.', 1]], '|{ε}| = 1, aber |ε| = 0. Die erste Zahl zählt Wörter einer Sprache, die zweite Zeichen eines Wortes. ∅ enthält gar kein Wort; ein Leerzeichen enthält ein Zeichen.')
      ]),
      task('G4', '4 · Ableitungsbaum und L(G)', 'Arbeitsblatt Grammatiken, Aufgabe 4 · Gegeben ist S → aSb | ab. Bestimme die Struktur der Ableitungen und die erzeugte Sprache.', [
        derive('a', 'Leite aabb ab.', 'aabb', 'S -> aSb -> aabb'),
        p('b', 'tree', 'Zeichne den Ableitungsbaum für aabb mit S als Wurzel.', 'II', 4, {target: 'aabb', solution: 'S -> aSb -> aabb'}),
        words('c', 'Prüfe aab anhand der Grammatik.', 'S = "a" S "b" | "ab";', ['aab']),
        text('d', 'Begründe deine Entscheidung zu aab und beschreibe L(G) präzise.', 'II', [['L(G) = {aⁿbⁿ | n ≥ 1}.', 2], ['Jeder Schritt erhält die gleiche Anzahl und Reihenfolge; aab verletzt die Gleichheit.', 1]], 'L(G) = {aⁿbⁿ | n ≥ 1}. Die Basis ab hat je ein Zeichen. Jede Rekursion ergänzt je ein a und b. aab besitzt ungleiche Anzahlen. Anders als bei einer ε-Basis gehört ε hier nicht zur Sprache.')
      ], {formal: 'S → aSb | ab', givenFormal: 'S → aSb | ab', source: original('grammatiken', [4])}),
      task('G5', '5 · Vier Sprachbeschreibungen in EBNF', 'Arbeitsblatt Grammatiken, Aufgabe 5 · Formuliere jede Sprache als EBNF und gib jeweils zwei gültige und ein ungültiges Wort an. Teil D ist die anspruchsvolle Vertiefung der Vorlage.', [], {source: original('grammatiken', [5]), sections: []}),
      task('G6', '6 · Das ursprüngliche Wort-Diagramm untersuchen', 'Arbeitsblatt Grammatiken, Aufgabe 6 · Lies das Originaldiagramm und formuliere die EBNF. Die Vorlage verwendet unterschiedliche Formen für einzelne Zeichen, ohne weitere Regeln anzugeben. Hier werden a, b, c und x ausdrücklich als Terminalzeichen gelesen; die skalierbare Fassung vereinheitlicht deren Form.', [
        code('a', 'Übersetze das Diagramm in EBNF.', diagramWord),
        p('b', 'choice', 'Welche Anfangszeichen sind möglich?', 'I', 1, {options: ['Nur a', 'Nur b', 'a oder b', 'a, b oder x'], expected: 'a oder b', solution: 'Der erste verpflichtende Baustein ist die Alternative a oder b.'}),
        text('c', 'Erkläre beide Rückführungen und die Rolle des x.', 'II', [['Die erste Rückführung wiederholt a vor dem optionalen x.', 1], ['Die zweite wiederholt b vor dem verpflichtenden abschließenden a des oberen Zweigs.', 1], ['x kann einmal oder gar nicht durchlaufen werden; c ist der andere Abschlusszweig.', 1]], 'Nach a oder b folgen beliebig viele a. x ist optional. Danach endet das Wort entweder mit beliebig vielen b und einem a oder direkt mit c. Die Rückwege laufen entgegen der Leserichtung zurück und erzeugen ihre beschrifteten Zeichen.'),
        examples('d', 'Gib drei verschiedene gültige Wörter an.', diagramWord),
        examples('e', 'Gib zwei verschiedene ungültige Wörter an.', diagramWord, 2, false),
        text('f', 'Begründe eines deiner ungültigen Beispiele mit dem konkreten verletzten Weg.', 'III', [['Passendes eigenes Nichtwort benannt.', 1], ['Verletzten Pflichtbaustein oder falsche Reihenfolge nachvollziehbar erklärt.', 1]], 'Beispiel b ist zu kurz: Nach dem Anfang b muss mindestens a oder c als Abschluss folgen. bx ist ebenfalls unvollständig, denn das optionale x ersetzt keinen Abschluss.')
      ], {reference: diagramWord, originalImages: [{src: 'materials/q31/grammatiken-diagramm.png', alt: 'Originaldiagramm Wort mit Wahl a/b, a-Rückweg, optionalem x und Wahl b-Rückweg vor a oder c.'}], source: original('grammatiken', [6])}),
      task('G7', '7 · Dateinamen mit dreistelliger Erweiterung', 'Arbeitsblatt Grammatiken, Aufgabe 7 · Ein Dateiname enthält mindestens einen Buchstaben oder eine Ziffer, dann einen Punkt und genau drei Buchstaben oder Ziffern als Erweiterung. Buchstabe und Ziffer dürfen vorausgesetzt werden; für die Wortprüfung werden A–Z, a–z und 0–9 verwendet.', [
        code('a', 'Entwickle eine EBNF für die Dateinamen.', filenames, 'ebnf', 5, {starter: 'Datei = ε;\n' + alphabet + '\n' + digit}),
        words('b', 'Prüfe alle acht Beispiele der Vorlage.', filenames, ['y.yxz', 'dummy2.pgh', '12345.123', 'Xy1.1yX', '.gfd', 'aldjf.a', 'zu.laut', 'haben.n?h']),
        code('c', 'Zeichne ein passendes Syntaxdiagramm für Datei und nutze die vorgegebenen Zeichenregeln.', filenames, 'draw', 5, {starter: 'Datei = ε;\nZeichen = Buchstabe | Ziffer;\n' + alphabet + '\n' + digit})
      ], {source: original('grammatiken', [7])}),
      task('G8', '8 · Bitmuster mit gleicher Anzahl', 'Arbeitsblatt Grammatiken, Aufgabe 8 · Gegeben ist S → 1S0 | ε. Untersuche vollständige Ableitungen, Grenzen der Sprache und die gekoppelte Anzahl.', [
        derive('a', 'Leite ε ab.', '', 'S -> ε', 'any', 2), derive('b', 'Leite 10 ab.', '10', 'S -> 1S0 -> 10'), derive('c', 'Leite 1100 ab.', '1100', 'S -> 1S0 -> 11S00 -> 1100'),
        words('d', 'Entscheide über die drei vorgegebenen Wörter.', 'S = "1" S "0" | ε;', ['01', '100', '111100000']),
        text('e', 'Begründe die Wortentscheidungen, beschreibe L(G) und erkläre die Abhängigkeit der Anzahlen.', 'II', [['L(G) = {1ⁿ0ⁿ | n ≥ 0}.', 2], ['Jede Rekursion fügt genau eine 1 und eine 0 in fester Reihenfolge hinzu.', 1], ['01 verletzt die Reihenfolge; 100 und 111100000 haben ungleiche Anzahlen.', 2]], 'L(G) = {1ⁿ0ⁿ | n ≥ 0}. Die Rekursion fügt paarweise eine 1 links und eine 0 rechts hinzu; ε beendet sie. 01 hat die falsche Reihenfolge. 100 hat eine 1 und zwei 0; 111100000 hat vier 1 und fünf 0.')
      ], {formal: 'S → 1S0 | ε', givenFormal: 'S → 1S0 | ε', source: original('grammatiken', [8])}),
      task('G9', '9 · Zwei Bitsprachen vergleichen', 'Arbeitsblatt Grammatiken, Aufgabe 9 · Gegeben ist T → 0T1 | ε. Vergleiche die erzeugte Sprache mit S → 1S0 | ε aus Aufgabe 8.', [
        derive('a', 'Leite 0011 aus T ab.', '0011', 'T -> 0T1 -> 00T11 -> 0011'),
        p('b', 'tree', 'Zeichne den Ableitungsbaum für 0011.', 'II', 4, {target: '0011', solution: 'T -> 0T1 -> 00T11 -> 0011'}),
        text('c', 'Beschreibe L(T), vergleiche beide Sprachen und begründe ihre Verschiedenheit.', 'III', [['L(T) = {0ⁿ1ⁿ | n ≥ 0}; L(S) = {1ⁿ0ⁿ | n ≥ 0}.', 2], ['ε ist in beiden Sprachen; die Schnittmenge besteht nur aus ε.', 1], ['10 beziehungsweise 01 unterscheiden die Sprachen; die Regelreihenfolge ist entscheidend.', 2]], 'L(T) = {0ⁿ1ⁿ | n ≥ 0}, L(S) = {1ⁿ0ⁿ | n ≥ 0}. Nur ε ist gemeinsam. Für n ≥ 1 beginnt ein Wort aus L(T) mit 0 und aus L(S) mit 1. Deshalb ist 01 nur in L(T) und 10 nur in L(S). Die Sprachen sind nicht gleich.')
      ], {formal: 'T → 0T1 | ε', start: 'T', givenFormal: 'T → 0T1 | ε', source: original('grammatiken', [9])}),
      task('G11', 'BNF und EBNF als gleichwertige Notationen', 'Wikiseite 2, Abschnitte 5–6 · BNF verwendet hier <Nichtterminale> und ::=, EBNF Optionen und Wiederholungen. Eine Zahl besteht aus mindestens einer Dezimalziffer; führende Nullen sind in dieser Sprache erlaubt.', [
        grammar('a', 'Formuliere die Zahlensprache in BNF und gib dein Startsymbol an.', numberBNF, '<Zahl>', ['', '0', '42', '007', 'a', '-1'], {afb: 'II', bnf: true}),
        code('b', 'Formuliere dieselbe Sprache als EBNF. Die Komma-/Punktnotation der Wikiseite ist ebenfalls zulässig.', 'Zahl = Ziffer {Ziffer};\n' + digit),
        text('c', 'Erkläre, welche BNF-Rekursion die EBNF-Wiederholung ersetzt.', 'II', [['Der erste Ziffernverweis erzwingt mindestens ein Zeichen.', 1], ['Die rekursive Alternative erlaubt jeweils weitere Ziffern und die Basis beendet die Ableitung.', 1]], 'Die EBNF-Ziffer vor der Wiederholung ist verpflichtend. In der BNF produziert die Basis eine Ziffer und die rekursive Alternative eine Ziffer mit einer weiteren Zahl. Beide beschreiben genau nichtleere Ziffernfolgen.')
      ], {source: {sheet: 'wiki2', exercises: ['Abschnitte 5–6']}, givenFormal: numberBNF}),
      task('H1', '1 · Drei Syntaxdiagramme in EBNF umwandeln', 'Arbeitsblatt EBNF-II, Aufgabe 1 · Übersetze Satz, Wortgruppe und Adjektiv als zusammenhängende Grammatik. Die Vorlage besitzt bei Wortgruppe einen ungewöhnlichen Umgehungs- und Komma-Rückweg. Untersuche seine tatsächlich erreichbaren Wege; zusätzliche Randfälle werden in b) und c) ausdrücklich betrachtet. Wortzwischenräume sind im Original nicht als Terminale vorgegeben und werden nicht ergänzt.', [
        code('a', 'Formuliere die vollständige EBNF zu den drei Originaldiagrammen.', sentence, 'ebnf', 7),
        text('b', 'Beschreibe Hauptwege, Alternativen und Rückführung; prüfe insbesondere, ob ein führendes Komma möglich ist.', 'III', [['Satz: Wortgruppe, essen/lieben, danach Wortgruppe/schnell/langsam, Punkt.', 1], ['Wortgruppe: erstes Adjektiv optional; jeder Komma-Rückweg erzwingt danach ein Adjektiv; anschließend Katzen/Mäuse.', 2], ['Führendes Komma nach zunächst genutztem Umgehungsweg erkannt.', 1]], 'Der erste Adjektivdurchlauf ist optional; der Rückweg wird am anschließenden gemeinsamen Knoten erreicht. Deshalb lässt die gezeichnete Vorlage z. B. ,schwarzeKatzen zu. Eine kompakte originalgetreue Regel ist [Adjektiv] {"," Adjektiv} ("Katzen" | "Mäuse").'),
        code('c', 'Zusätzliche Fehleranalyse: Formuliere Wortgruppe so, dass kein führendes oder abschließendes Komma möglich ist.', 'Wortgruppe = [Adjektiv {"," Adjektiv}] ("Katzen" | "Mäuse");\nAdjektiv = "schwarze" | "weiße" | "dürre" | "fette";', 'ebnf', 4, {afb: 'III'})
      ], {reference: sentence, originalImages: [1, 2, 3].map(i => ({src: `materials/q31/ebnf2-material${i}.png`, alt: ['Original-Syntaxdiagramm Satz', 'Original-Syntaxdiagramm Wortgruppe mit oberem Umgehungsweg und Komma-Rückführung', 'Original-Syntaxdiagramm Adjektiv'][i - 1]})), source: original('ebnf2', [1])}),
      task('H2', '2 · EBNF in ein Syntaxdiagramm umwandeln', 'Arbeitsblatt EBNF-II, Aufgabe 2a · Term = Zahl { ("*" | "/") Zahl }. Zeichne das Diagramm Term. Die Vorlage definiert Zahl nicht weiter. Im Arbeitsbereich steht Zahl deshalb ausschließlich als symbolischer Platzhalter für das Terminal z; das legt keinen zusätzlichen Zahlenbereich der Originalaufgabe fest.', [
        code('a', 'Zeichne Term mit verpflichtender erster Zahl und einer Wiederholung aus Operator und Zahl.', term, 'draw', 6, {starter: 'Term = ε;\nZahl = "z";'}),
        text('b', 'Begründe, weshalb Operator und folgende Zahl gemeinsam wiederholt werden müssen.', 'II', [['Der erste Zahlverweis ist verpflichtend.', 1], ['Jeder weitere Operator braucht genau eine folgende Zahl; keine leeren Operanden.', 1]], 'Die erste Zahl verhindert den leeren Term. Die Wiederholung besteht aus genau einem Operator aus * oder / und der nächsten Zahl. Eine allein wiederholte Operatorfolge würde beispielsweise einen abschließenden Operator erlauben.')
      ], {givenEBNF: 'Term = Zahl { ("*" | "/") Zahl } .', source: original('ebnf2', ['2a'])}),
      task('H3', '3 · Das vorgegebene Datumsformat modellieren', 'Arbeitsblatt EBNF-II, Aufgabe 3 · Tag genau 01–31, Monat genau 01–12, Jahr mit mindestens einer Ziffer und ohne führende Null. Die beiden Trenner dürfen jeweils unabhängig . oder - sein. Tatsächliche Kalendergültigkeit wird nicht geprüft: Auch 31-02-956 und 13.11-12554 gehören zur geforderten Sprache. Die Vorlage klärt das einstellige Jahr 0 nicht ausdrücklich; dafür akzeptiert das Labor beide Lesarten. Mehrstellige Jahre mit führender 0 sind immer ausgeschlossen.', [
        code('a', 'Entwickle eine EBNF für genau dieses Datumsformat.', date, 'ebnf', 7),
        words('b', 'Prüfe die fünf Originalbeispiele.', date, ['04.12.2012', '31-02-956', '13.11-12554', '4-10.3', '13.04.044']),
        code('c', 'Alternative Darstellungsform: Zeichne das Datumsdiagramm. Die vorhandenen Regeln dürfen weiterverwendet werden.', date, 'draw', 7),
        text('d', 'Begründe die Zulässigkeit des Februarbeispiels und des gemischten Trenners. Unterscheide Format und Kalenderbedeutung.', 'III', [['31 liegt im erlaubten Tagesbereich und 02 im Monatsbereich; keine Kalenderprüfung verlangt.', 1], ['Jeder Trenner hat separat die Wahl zwischen Punkt und Bindestrich.', 1], ['Zweistelligkeit und Jahr ohne führende Null getrennt berücksichtigt.', 1]], 'Die Aufgabe beschreibt ein Format, keinen kalendergültigen Datentyp. Tag 31 und Monat 02 erfüllen ihre unabhängigen Bereiche. Die beiden Trennzeichen werden unabhängig gewählt, daher ist 13.11-12554 zulässig. Eine einstellige Tageszahl oder ein Jahr mit führender Null verletzt dagegen die Syntax.')
      ], {source: original('ebnf2', [3]), sections: [{title: 'EBNF und Wortprüfung', ids: ['a', 'b']}, {title: 'Alternative Zeichnung und Begründung', ids: ['c', 'd']}] }),
      task('H4', '4 · E-Mail-Adresslisten analysieren', 'Arbeitsblatt EBNF-II, Aufgabe 4 · Verwende ausschließlich Material 1 und 2 der Vorlage, kein vollständiges RFC-5322-Modell. Leerzeichen sind hier echte, an den bezeichneten Stellen erforderliche Zeichen. Eine syntaktisch gültige Adresse muss nicht tatsächlich existieren. Buchstabe ist im Material auf A–Z und a–z beschränkt.', [
        text('a', 'Beschreibe die Diagramme E-Mail-Adressliste und Adresse aus Material 1.', 'II', [['Mindestens eine Adresse oder Gruppe, weitere Einträge durch Komma und Leerzeichen.', 1], ['Adresse als reine E-Mail-Adresse, als Winkelklammerform ohne Anzeigename oder mit Anzeigename und Leerzeichen.', 2]], 'Die Liste enthält mindestens eine Adresse oder Gruppe. Jeder weitere Eintrag folgt nach Komma und genau einem Leerzeichen. Eine Adresse ist eine bloße E-Mail-Adresse, eine E-Mail-Adresse in Winkelklammern oder ein Anzeigename mit Leerzeichen und einer E-Mail-Adresse in Winkelklammern.'),
        code('b', 'Formuliere die Diagramme aus Material 1 als Produktionen, hier in EBNF. Die lexikalischen Hilfsregeln aus Material 2 sind unten im Arbeitsbereich vorbereitet.', mailEBNF, 'ebnf', 8, {starter: 'Adressliste = ε;\nAdresse = ε;\nGruppe = ε;\nAnzeigename = ε;\nText = Beliebig {Beliebig};\nBeliebig = Zulaessig | Spezial;\nSpezial = ' + alts(specials) + ';\n' + mailLex}),
        code('c', 'Zeichne die drei letzten Produktionen aus Material 2: E-Mail-Adresse, Domain und Name. Wort ist als Hilfsregel vorgegeben.', mailLex, 'draw', 7, {starter: 'EMail = ε;\nDomain = ε;\nName = ε;\nWort = Zulaessig {Zulaessig};\nZulaessig = ' + alts(allowed) + ';'}),
        words('d', 'Prüfe die beiden vollständigen Adresslisten der Vorlage.', mailEBNF, ['Maria Schmidt <maria.s@gmx.de>, thomas@luo.org, Wer? <one@web.de>', '<boss@zdf.de>, "Tim A. Müller" <services@veritel.net>, "Gut!" mut@ard.de']),
        text('e', 'Begründe beide Entscheidungen mit den konkreten Diagrammwegen und Produktionen.', 'III', [['Erste Liste gültig; Anzeigenamen und Fragezeichen in Wort sind erlaubt, Trenner stimmen.', 2], ['Zweite Liste scheitert jedenfalls an Anzeigename ohne folgende Winkelklammern bei "Gut!" mut@ard.de.', 2], ['Zusätzlich ist ü nicht im ASCII-Buchstabenbereich des Materials enthalten.', 1]], 'Die erste Liste ist nach dem vereinfachten Material zulässig: Die drei Einträge sind korrekt getrennt; Wer? ist ein zulässiges Wort. In der zweiten Liste fehlen beim letzten Eintrag nach dem Anzeigenamen die erforderlichen Winkelklammern. Außerdem ist ü in Müller weder in Buchstabe = A…Z | a…z noch in den übrigen erlaubten Zeichen enthalten. Reale E-Mail-Programme oder andere Standards ändern diese Materialentscheidung nicht.'),
        p('f', 'chunk-derive', 'Leite die Liste "Betty H" <betty@home.gmx.de> vollständig ab. Wort und Text dürfen wie in der Vorlage am Stück abgeleitet werden. Andere Schritte müssen einzelne Produktionen anwenden.', 'III', 6, {formal: mail, start: '<Adressliste>', chunks: ['Wort', 'Text'], target: mailTarget, solution: mailForms.join(' -> ')})
      ], {originalImages: [{src: 'materials/q31/ebnf2-material4.png', alt: 'Originalmaterialien 1 und 2: vier Syntaxdiagramme für Adresslisten, Anzeigenamen, Adressen und Gruppen sowie alle vereinfachten Zeichen- und E-Mail-Produktionen.'}], source: original('ebnf2', [4]), materialsFirst: true, sections: [{title: 'Material 1 lesen und als Grammatik formulieren', ids: ['a', 'b']}, {title: 'Material 2 zeichnen und Listen prüfen', ids: ['c', 'd', 'e']}, {title: 'Vollständige Ableitung', ids: ['f']}] })
    ];
    const G5 = newTasks.find(t => t.id === 'G5');
    const descriptions = [
      ['A · Beliebig viele a, danach genau ein b', 'Wort = {"a"} "b";'],
      ['B · Wörter über a,b, die mit ab beginnen', 'Wort = "ab" {"a" | "b"};'],
      ['C · Wörter über a,b,c mit mindestens einem Teilwort abc', 'Wort = {Zeichen} "abc" {Zeichen};\nZeichen = "a" | "b" | "c";'],
      ['D · Vertiefung: niemals drei a unmittelbar hintereinander', 'Wort = {["a" ["a"]] "b"} ["a" ["a"]];']
    ];
    for (const [i, [title, model]] of descriptions.entries()) {
      const ids = Array.from({length: 3}, (_, j) => String.fromCharCode(97 + i * 3 + j));
      G5.sections.push({title, ids}); G5.parts.push(code(ids[0], title + ': EBNF formulieren.', model, 'ebnf', i === 3 ? 6 : 4, {afb: i === 3 ? 'III' : 'II'}), examples(ids[1], 'Nenne zwei verschiedene gültige Wörter.', model, 2), examples(ids[2], 'Nenne ein ungültiges Wort.', model, 1, false));
    }
    for (const [id, label, model, ebnf, sample, type] of [
      ['G10A', 'A · Anfang a, Ende b', 'S → aA\nA → aA | bA | b', 'Wort = "a" {"a" | "b"} "b";', 'S -> aA -> ab\nS -> aA -> abA -> abb', '3'],
      ['G10B', 'B · Gekoppelte Anzahlen', 'S → aSb | ab', 'S = "a" S "b" | "ab";', 'S -> ab\nS -> aSb -> aabb', '2']
    ]) newTasks.push(task(id, '10 · Wahlweg ' + label, 'Arbeitsblatt Grammatiken, Aufgabe 10 · Wähle A oder B; der andere Weg bleibt zur zusätzlichen Übung erhalten. ' + (type === '3' ? 'Entwickle eine reguläre oder andere kontextfreie Grammatik für die reguläre Sprache aller Wörter über {a,b}, die mit a beginnen und mit b enden.' : 'Entwickle eine kontextfreie Grammatik für {aⁿbⁿ | n ≥ 1}.'), [
      grammar('a', 'Gib deine Produktionsregeln P und dein Startsymbol an.', model, 'S', type === '3' ? ['', 'ab', 'aab', 'abb', 'abab', 'a', 'b', 'ba'] : ['', 'ab', 'aabb', 'aaabbb', 'aab', 'abab']),
      text('b', 'Gib T, N und S deiner eigenen Grammatik an.', 'I', [['T passt zu den tatsächlich verwendeten Terminalen; im Muster {a,b}.', 1], ['N und Startsymbol passen zu den tatsächlich eingegebenen Produktionen.', 1]], 'In den Musterlösungen ist T = {a,b}; bei unbenutzten Zusatzproduktionen die dort verwendeten Terminale ebenfalls korrekt angeben. N enthält die verwendeten Nichtterminale, und das Startsymbol muss zu N gehören. In Muster A: N = {S,A}, Start S; in Muster B: N = {S}, Start S. Gleichwertige Umbenennungen sind zulässig.'),
      chains('c', 'Leite zwei verschiedene Wörter der geforderten Sprache vollständig mit deiner Grammatik ab. Eine Kette pro Zeile.', undefined, undefined, 2, sample, {grammarPart: 'a', language: ebnf}),
      examples('d', 'Gib ein Wort an, das nicht zur gewählten Sprache gehört.', ebnf, 1, false),
      text('e', 'Begründe dein Nichtwort und die Korrektheit sowie Vollständigkeit deiner Konstruktion.', 'III', [['Das eigene Nichtwort verletzt eine konkrete Sprachbedingung.', 1], ['Alle Ableitungen erzeugen nur gewünschte Wörter.', 1], ['Alle gewünschten Wörter sind mit den Regeln erreichbar.', 1]], type === '3' ? 'Die Mustergrammatik erzwingt ein erstes a und ein abschließendes b. Dazwischen werden beliebige a oder b ergänzt; so ist jedes a w b erreichbar. ba ist beispielsweise ausgeschlossen.' : 'Die Basis erzeugt ab, jeder rekursive Schritt fügt außen ein a und ein b hinzu. Nach n−1 Rekursionen und einem Basisabschluss entsteht jedes aⁿbⁿ mit n ≥ 1. aab verletzt die gleiche Anzahl.'),
      p('f', 'own-classify', 'Bestimme den engsten Typ deiner tatsächlich eingegebenen Grammatik.', 'II', 2, {grammarPart: 'a', solution: 'Die Mustergrammatik hat Typ ' + type + '. Andere Konstruktionen anhand ihrer eigenen Produktionsform einordnen.'}),
      text('g', 'Begründe den Grammatiktyp und unterscheide ihn von der Sprachklasse.', 'II', [['Produktionsform der eigenen Regeln korrekt begründet.', 1], ['Sprachklasse getrennt betrachtet.', 1]], type === '3' ? 'Die Musterregeln sind rechtslinear. Die geforderte Sprache ist regulär, unabhängig davon, ob eine andere korrekte Konstruktion zunächst nur kontextfreie Form besitzt.' : 'Die Mustergrammatik ist kontextfrei und nicht linear. Die gewünschte Sprache ist kontextfrei, aber nicht regulär; die Nichtregularität folgt aus der unbeschränkt gekoppelten Anzahl, nicht allein aus der Regelform.')
    ], {source: original('grammatiken', [10]), choicePath: true}));
    A.tasks.push(...newTasks);
    for (const t of newTasks.filter(t => t.id.startsWith('F'))) for (const p of t.parts.filter(p => p.kind === 'mapping')) p.skills = [0, 2];
    const zeroYear = date.replace('Jahr = Nichtnull {Ziffer};', 'Jahr = "0" | Nichtnull {Ziffer};');
    get('H3').choiceGroups = [{ids: ['a', 'c'], label: 'EBNF oder Syntaxdiagramm'}];
    get('H3').intro += ' Bearbeite zur Modellierung a) oder c); diese beiden Darstellungsformen werden zusammen höchstens einmal mit 7 BE gewertet. b) und d) gehören zu beiden Wegen.';
    for (const part of get('H3').parts.filter(p => ['ebnf', 'draw'].includes(p.kind))) { part.alternatives = [zeroYear]; part.alternativeNote = 'Die Vorlage lässt die Randfrage Jahr 0 offen. Beide Lesarten sind hier zulässig; führende Nullen mehrstelliger Jahre bleiben verboten.'; }
    const triple = 'S → aSBC | aBC\nCB → BC\naB → ab\nbB → bb\nbC → bc\ncC → cc';
    A.tasks.push(task('B13', 'Typ 1 · Drei gekoppelte Anzahlen', 'Wikiseite 3, Abschnitt 5 · Untersuche die vollständige nichtverkürzende Grammatik für {aⁿbⁿcⁿ | n ≥ 1}. Die Umordnung und die terminalen Kontexte sind Teil der einzelnen Ableitungsschritte.', [
      A.classify('a', [{label: 'G für drei gekoppelte Anzahlen', formal: triple}]),
      derive('b', 'Leite aabbcc vollständig ab.', 'aabbcc', 'S -> aSBC -> aaBCBC -> aaBBCC -> aabBCC -> aabbCC -> aabbcC -> aabbcc', 'any', 5),
      text('c', 'Erkläre die Aufgaben von CB → BC und der Regeln mit terminalem Kontext. Unterscheide Produktionsform und die hier angegebene Sprachklasse.', 'III', [['CB → BC ordnet Hilfssymbole, ohne die Länge zu verändern.', 1], ['aB/bB/bC/cC erlauben die Terminalisierung nur im vorgegebenen Kontext.', 1], ['Die gegebene Form ist nicht kontextfrei und nichtverkürzend; die angegebene Sprache ist kontextsensitiv und nicht kontextfrei.', 1]], 'CB → BC bringt die B vor die C. aB → ab und die weiteren Kontextregeln terminalisieren die Blöcke in der nötigen Reihenfolge. Die Form hat Typ 1: Mehrsymbol-Linkseiten, aber keine Verkürzung. Für diese konkrete Sprache ist die Nichtkontextfreiheit bekannt; aus einer beliebigen Typ-1-Produktionsform allein würde sie nicht folgen.')
    ], {formal: triple, givenFormal: triple, source: {sheet: 'wiki3', exercises: ['Abschnitt 5']}}));
    // Reuse the existing a*b activities instead of adding duplicate originals.
    get('A1').title = '1–2 · Bestandteile, Ableitungen und Sprache';
    get('A2').title = '3 · Regulär und kontextfrei vergleichen';
    get('A1').parts.find(p => p.id === 'e').prompt = 'Beschreibe L(G) in Worten und mathematisch.';
    get('A1').parts.find(p => p.id === 'e').solution = 'Beliebig viele a, auch null, gefolgt von genau einem b. L(G) = {aⁿb | n ≥ 0}.';
    get('A1').source = original('grammatiken', [1, 2]);
    get('A1').parts.push(words('g', 'Arbeitsblatt 1b: Prüfe b, ab, aaab, aba und aabb.', 'S = "a" S | "b";', ['b', 'ab', 'aaab', 'aba', 'aabb']), derive('h', 'Arbeitsblatt 2a: Leite zusätzlich ab vollständig ab.', 'ab', 'S -> aS -> ab'), examples('i', 'Arbeitsblatt 2b: Gib vier weitere Wörter an; ab und aaab sind ausgeschlossen.', 'S = "a" S | "b";', 4, true), text('j', 'Arbeitsblatt 1b: Begründe zwei deiner Wortentscheidungen.', 'II', [['Zwei konkrete Wörter mit Regel-/Sprachbezug korrekt erläutert.', 2]], 'Zum Beispiel: b ist durch S → b direkt erzeugbar. aabb ist ausgeschlossen, weil nur ein einziges b entstehen kann und danach kein Nichtterminal bleibt.'));
    get('A1').parts.find(p => p.id === 'i').excluded = ['ab', 'aaab'];
    get('A1').sections = [{title: 'Bestandteile und Grundableitung', ids: ['a', 'b', 'c', 'g', 'j']}, {title: 'Sprache, weitere Wörter und Ausschluss', ids: ['h', 'i', 'e', 'f']}, {title: 'Erhaltene zusätzliche Wortübung', ids: ['d']}];
    get('A2').source = original('grammatiken', [3]);
    get('A2').parts.push(chains('e', 'Leite drei verschiedene Wörter mit G₁: S → aS | b ab, je eine Kette pro Zeile.', rawAB, 'S', 3, 'S -> b\nS -> aS -> ab\nS -> aS -> aaS -> aab'), chains('f', 'Leite drei verschiedene Wörter mit G₂: S → aSb | ε ab.', paired, 'S', 3, 'S -> ε\nS -> aSb -> ab\nS -> aSb -> aaSbb -> aabb'), text('g', 'Vergleiche L(G₁) und L(G₂), begründe Rechtslinearität bzw. Kontextfreiheit und den strukturellen Unterschied.', 'II', [['G₁: aⁿb, n ≥ 0, rechtslinear.', 1], ['G₂: aⁿbⁿ, n ≥ 0, kontextfrei, wegen aSb nicht linear.', 1], ['Unbeschränkt gekoppelte Anzahl nur in G₂; ε nur in G₂.', 2]], 'G₁ erzeugt aⁿb mit n ≥ 0 und besitzt rechtslineare Form. G₂ erzeugt aⁿbⁿ mit n ≥ 0; S steht zwischen a und b, daher ist die Form nicht linear. In G₂ sind die Anzahlen gekoppelt; in G₁ gibt es genau ein b. G₂ enthält ε.'));
    get('A2').sections = [{title: 'Die Grammatik G₂ untersuchen', ids: ['a', 'b', 'c', 'd']}, {title: 'Beide Grammatiken durch eigene Ableitungen vergleichen', ids: ['e', 'f', 'g']}];
    get('W3').parts.push(text('g', 'Zeige Korrektheit und Vollständigkeit deiner Zuggrammatik getrennt.', 'III', [['Jede Ableitung erfüllt genau-ein-t, genau-ein-s und die gekoppelte Wagenzahl.', 2], ['Für jedes n ≥ 1 existiert eine Ableitung, z. B. über n−1 Rekursionen und einen Basisabschluss.', 2]], 'Für die Mustergrammatik erzeugt Z genau ein t. Die Basis W → 1s22 besitzt eine 1, ein s und zwei 2. Jede Rekursion W → 1W22 fügt genau eine 1 und zwei 2 hinzu; damit bleiben die Bedingungen erhalten. Umgekehrt entsteht jeder geforderte Zug mit n ≥ 1 nach n−1 Rekursionen und einem Basisabschluss. Für andere Konstruktionen ist derselbe Nachweis anhand ihrer eigenen Regeln nötig.'));
    for (const t of A.tasks.filter(t => t.module === 'W')) t.source = original('chomsky', [Number(/Arbeitsblatt Aufgabe (\d+)/.exec(t.intro)[1])]);
    get('H4').parts.find(p => p.id === 'b').reviewCriteria = ['Mindestens ein Eintrag; weitere Einträge ausschließlich mit Komma und einem Leerzeichen.', 'Die drei Adressformen einschließlich optionalem Anzeigenamen vor der Winkelklammerform.', 'Anzeigename als nichtleerer zitierter Text oder nichtleere Folge von Wörtern.', 'Gruppe mit Doppelpunkt und Semikolon; der Adressinhalt darf im Original leer sein.', 'Keine unbeabsichtigte Erweiterung der vorgegebenen ASCII-Zeichenmengen oder Änderung der Domainstruktur.'];
    get('H4').parts.find(p => p.id === 'c').reviewCriteria = ['E-Mail-Adresse besteht aus Name, @ und Domain.', 'Domain enthält Wort, Punkt und Name; sie besitzt damit mindestens zwei nichtleere Segmente.', 'Name enthält mindestens ein Wort und erlaubt weitere Punkte mit jeweils folgendem Wort; keine leeren Segmente.', 'Die vorgegebene Wortregel und echte Leerzeichen bleiben unverändert.'];
    for (const p of get('H3').parts.filter(p => ['ebnf', 'draw'].includes(p.kind))) p.reviewCriteria = ['Tag genau zweistellig 01–31, Monat genau zweistellig 01–12.', 'Beide Trennzeichen werden unabhängig aus Punkt und Bindestrich gewählt.', 'Jahr nicht leer und keine mehrstellige führende Null; beide gekennzeichneten Lesarten für Jahr 0 sind zulässig.', 'Keine zusätzlichen Kalenderbedingungen.'];
    const main = {
      M1: ['F1', 'F4', 'F2', 'F3'],
      M2: ['A1', 'A2', 'G4', 'G11', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10A', 'G10B'],
      M3: ['W0', 'B1', 'B4', 'B7', 'B13', 'B8', 'W1', 'W2', 'W3', 'W4', 'W5'],
      M4: ['H1', 'H2', 'H3', 'H4']
    };
    const map = {A: 'M2', B: 'M3', C: 'M2', D: 'M2', E: 'M4', W: 'M3', F: 'M1', G: 'M2', H: 'M4'};
    A.legacyViews = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'W'].map(m => [m, {module: map[m], start: A.tasks.find(t => t.module === m).id}]));
    for (const t of A.tasks) { t.legacyModule = t.module; t.module = map[t.module]; t.practice = !main[t.module].includes(t.id); }
    A.modules.splice(0, A.modules.length,
      {id: 'M1', number: 1, title: 'Formale Sprachen verstehen', subtitle: 'Alphabet, Wort, Sprache, Syntax und Semantik', scope: 'Wikiseite 1 · Grundlagen · Quellenabgleich noch offen', skills: [0, 2, 7], main: main.M1, sourceGap: true},
      {id: 'M2', number: 2, title: 'Grammatiken und Darstellungsformen', subtitle: 'Bestandteile → Ableitungen → L(G) → BNF/EBNF → Diagramme', scope: 'Wikiseite 2 · Grammatiken formaler Sprachen', skills: [0, 1, 2, 4, 5, 6, 7], main: main.M2},
      {id: 'M3', number: 3, title: 'Chomsky-Hierarchie und Grammatikanalyse', subtitle: 'Alle vier Typen · analysieren, konstruieren und begründen', scope: 'Wikiseite 3 · vollständige Chomsky-Hierarchie · Typ 0 bis Typ 3', skills: [0, 1, 2, 3, 7], main: main.M3},
      {id: 'M4', number: 4, title: 'Komplexe Anwendungen mit EBNF und Syntaxdiagrammen', subtitle: 'Vier Originalübungen · Diagramme, Terme, Datum und E-Mail-Adresslisten', scope: 'Wikiseite 4 · Syntaxdiagramme und EBNF-II', skills: [0, 2, 4, 5, 6, 7], main: main.M4}
    );
    // The worksheet asks for A OR B in task 10: either path completes one step.
    for (const m of A.modules) m.completionGroups = m.main.filter(id => id !== 'G10B').map(id => id === 'G10A' ? ['G10A', 'G10B'] : [id]);
    A.moduleStatus = (module, attempts) => {
      const m = A.modules.find(m => m.id === module);
      return {total: m.completionGroups.length, done: m.completionGroups.filter(ids => ids.some(id => attempts[id]?.checked || attempts[id]?.submitted)).length};
    };
    for (const t of A.tasks) for (const p of t.parts) if (['ebnf', 'draw'].includes(p.kind)) {
      p.reviewCriteria ||= ['Alle Pflichtbestandteile, Reihenfolgen und ausgeschlossenen Fälle des Arbeitsauftrags sind berücksichtigt.', 'Optionen und Wiederholungen lassen genau die geforderten Mindest- und Höchsthäufigkeiten zu.', 'Begründe beide Richtungen der Sprachgleichheit anhand der Regeln; einzelne Testwörter genügen nicht als Beweis.'];
      if (t.id === 'G7') p.foldRules = ['Buchstabe', 'Ziffer'];
      if (t.id === 'H3') p.foldRules = ['Nichtnull', 'Ziffer'];
      if (t.id === 'H4') p.foldRules = p.id === 'c' ? ['Wort', 'Zulaessig'] : ['Text', 'Beliebig', 'Spezial', 'EMail', 'Domain', 'Name', 'Wort', 'Zulaessig'];
    }
    const analysisHints = ['Untersuche zuerst linke und rechte Seiten der Produktionsregeln.', 'Leite mehrere kurze Wörter mit unterschiedlichen Regeln ab.', 'Suche feste Zeichen, Wiederholungen und gekoppelte Anzahlen.', 'Beschreibe die vermutete Sprache in Worten und möglichst symbolisch.', 'Begründe beide Richtungen: nur gewünschte Wörter und alle gewünschten Wörter.'];
    const constructHints = ['Bestimme das kürzeste zulässige Wort und die nötigen Teilstrukturen.', 'Erkenne, welche Bestandteile gemeinsam wiederholt oder verändert werden.', 'Entwickle eine passende Wiederholung oder rekursive Regel.', 'Ergänze einen Abschluss, der genau die Mindestbedingungen erfüllt.', 'Prüfe gültige und ungültige Beispiele; ein endlicher Test ersetzt keinen Sprachbeweis.'];
    const diagramHints = ['Bestimme den verpflichtenden Hauptweg vom Eingang zum Ausgang.', 'Untersuche die Verzweigungen: Wähle pro Alternative genau einen Weg.', 'Prüfe Umgehungswege: Welche Bestandteile dürfen ganz entfallen?', 'Verfolge jeden Rückweg einschließlich aller dort gelesenen Zeichen.', 'Vergleiche EBNF und Diagramm anhand ihrer Sprache, nicht nur ihrer äußeren Form.'];
    get('F1').hints = ['Kläre den Kontext: Ein Alphabet ist eine Menge einzelner Zeichen.', 'Zähle die Zeichen einer Folge und unterscheide sie von einer Menge solcher Folgen.', 'Ein Zeichen kann zugleich eine Zeichenfolge der Länge 1 bilden.'];
    get('F2').hints = ['Zerlege die Sprachbeschreibung in den Pflichtanfang und den erlaubten Rest.', 'Prüfe bei jedem Wort jedes Zeichen nach dem Anfang.', 'Null Wiederholungen des Restes bedeuten nicht automatisch ein leeres Gesamtwort.', 'Begründe ein Nichtwort mit der ersten verletzten Bedingung.'];
    get('F3').hints = ['Prüfe zuerst nur den Aufbau aus Ziffern und Operator.', 'Untersuche anschließend die mathematische Bedeutung der Operanden.', 'Eine Bedeutungsfrage kann zusätzliche Bedingungen verlangen, obwohl das Format stimmt.'];
    get('F4').hints = ['Prüfe, ob du Wörter einer Menge oder Zeichen eines Wortes zählst.', 'Eine leere Menge ist etwas anderes als eine Menge mit einem einzigen Wort.', 'Vergleiche ε mit einem tatsächlich vorhandenen Leerzeichen.'];
    get('H3').hints = ['Zerlege das Datum in Tag, Trenner, Monat, Trenner und Jahr.', 'Zerlege jeden zweistelligen Wertebereich nach seiner ersten Ziffer.', 'Prüfe die vorgeschriebene Stellenzahl unabhängig vom Wertebereich.', 'Die beiden Trenner dürfen unabhängig gewählt werden; Kalenderbedingungen sind nicht Teil dieser Sprache.', 'Kontrolliere führende Nullen und Randwerte mit gültigen und ungültigen Beispielen.'];
    get('H4').hints = ['Beginne beim Startsymbol für die gesamte Adressliste, nicht bei einer einzelnen Zeichenregel.', 'Ordne den Bestandteilen die jeweiligen Diagramme und Produktionen zu.', 'Untersuche Anzeigenamen und die dazugehörigen Winkelklammern.', 'Kommas und Leerzeichen sind echte Terminalzeichen; prüfe ihre genauen Positionen.', 'Prüfe zuletzt Zeichenmengen und Domainstruktur. Nur Wort und Text dürfen laut Aufgabe am Stück abgeleitet werden.'];
    for (const t of A.tasks) if (!t.hints) t.hints = t.parts.some(p => ['draw', 'compare'].includes(p.kind)) || t.reference ? diagramHints : t.parts.some(p => ['ebnf', 'grammar'].includes(p.kind)) ? constructHints : analysisHints;
    A.q31 = {main, sentence, diagramWord, filenames, term, date, mail, mailEBNF, mailLex, mailTarget, mailDerive: mailForms.join(' -> '), missingSources: ['Wikiseite 1'], sourceFiles: {grammatiken: 'materials/q31/grammatiken.docx', ebnf2: 'materials/q31/ebnf2.docx', wiki2: 'materials/q31/wiki2.pdf', wiki3: 'materials/q31/wiki3.pdf', wiki4: 'materials/q31/wiki4.pdf', chomsky: 'materials/wiki3/arbeitsblatt.docx'}};
    return A;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = install; else install(scope.SyntaxCurriculum);
})(typeof globalThis !== 'undefined' ? globalThis : this);
