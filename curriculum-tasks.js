(function (scope) {
  'use strict';
  const A = typeof module !== 'undefined' && module.exports ? require('./curriculum.js') : scope.SyntaxCurriculum;
  const {p, text, code, derive, words, examples, task} = A;
  const digits = 'ziffer = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";';
  const small = 'ziffer = "0" | "1" | "2";';
  const letters = 'buchstabe = "a" | "b" | "c";';
  const identifier = `kennung = buchstabe {buchstabe | ziffer};\n${letters}\n${small}`;
  const c1 = 'wort = "ab" {"a" | "b"} "ba";';
  const tasks = [
    task('C1', 'Zwischen ab und ba', 'Alle Wörter beginnen mit dem festen Block ab, enthalten danach beliebig viele a oder b und enden mit einem zusätzlichen festen Block ba. Anfang und Ende dürfen sich nicht überlappen.', [
      code('a', 'Formuliere eine EBNF-Produktion.', c1),
      examples('b', 'Gib drei verschiedene gültige Wörter an.', c1),
      examples('c', 'Gib zwei verschiedene ungültige Wörter an.', c1, 2, false),
      text('d', 'Begründe ein ungültiges Beispiel und beschreibe L(G) mathematisch.', 'II', [['Verletzte Bedingung am Beispiel benannt.', 1], ['L(G) = {ab w ba | w ∈ {a,b}*}.', 2]], 'L(G) = {ab w ba | w ∈ {a,b}*}. Beispielsweise ist aba zu kurz: Der Anfangs- und der Endblock sind getrennte Bestandteile. abba, ababa und abbba sind enthalten.')
    ], {hint: 'Der Mittelteil ist eine Wiederholung einer Alternative; das kürzeste Wort ist abba.'}),
    task('C2', 'Genau einmal, vielleicht einmal', 'Ein Wort besteht aus a, optional genau einem b und abschließend c.', [
      code('a', 'Formuliere die Regel wort.', 'wort = "a" ["b"] "c";'),
      words('b', 'Prüfe die Kandidaten.', 'wort = "a" ["b"] "c";', ['ac', 'abc', 'abbc', 'a']),
      text('c', 'Erläutere den Unterschied zwischen ["b"] und {"b"}.', 'II', [['Optional: höchstens einmal.', 1], ['Wiederholung: beliebig oft einschließlich null.', 1]], '["b"] erlaubt ε oder b. {"b"} erlaubt zusätzlich bb, bbb und so weiter.')
    ]),
    task('C3', 'Mindestens eine Ziffer', 'Zahlen bestehen aus einer oder mehr Ziffern aus {0,1,2}. Führende Nullen sind hier erlaubt.', [
      code('a', 'Verwende eine Produktion zahl und eine Produktion ziffer.', `zahl = ziffer {ziffer};\n${small}`),
      words('b', 'Prüfe die Wörter.', `zahl = ziffer {ziffer};\n${small}`, ['', '0', '012', '3']),
      text('c', 'Begründe, weshalb {ziffer} allein die Aufgabenstellung verfehlt.', 'II', [['Die Wiederholung erlaubt null Durchläufe und damit ε.', 2]], 'Eine reine Wiederholung akzeptiert auch das leere Wort. Die erste verpflichtende Ziffer schließt ε aus.')
    ]),
    task('C4', 'Kennungen', 'Eine Kennung beginnt mit a, b oder c. Danach dürfen weitere Zeichen aus {a,b,c,0,1,2} folgen.', [
      code('a', 'Formuliere die Grammatik mit den Nichtterminalen kennung, buchstabe und ziffer.', identifier),
      words('b', 'Prüfe die Kennungen.', identifier, ['a12', '2ab', 'cab0', 'b']),
      text('c', 'Begründe die Position der ersten verpflichtenden Buchstabenreferenz.', 'II', [['Ein eigener erster Buchstabe verhindert eine führende Ziffer.', 1], ['Die Wiederholung allein würde auch ε zulassen.', 1]], 'buchstabe steht vor der Wiederholung. Dadurch ist die Kennung nicht leer und beginnt nicht mit einer Ziffer.')
    ]),
    task('C5', 'Eine getrennte Liste', 'Eine Liste enthält mindestens ein x. Weitere x werden jeweils durch genau ein Komma getrennt. Das Komma ist ein Terminal, kein EBNF-Folgetrennzeichen.', [
      code('a', 'Formuliere eine EBNF für die Liste.', 'liste = "x" {"," "x"};'),
      words('b', 'Prüfe die Listen.', 'liste = "x" {"," "x"};', ['x', 'x,x', 'x,,x', 'x,']),
      text('c', 'Erläutere, weshalb Komma und x gemeinsam wiederholt werden.', 'II', [['Jeder weitere Eintrag braucht genau seinen Trenner.', 1], ['Ein abschließendes oder doppeltes Komma wird verhindert.', 1]], 'Die Wiederholung des Blocks "," "x" bindet jeden Trenner an den folgenden Eintrag.')
    ], {hint: 'Anführungszeichen machen das Komma zum Zeichen der Sprache.'}),
    task('C6', 'Alternativen verschachteln', 'Erlaubt sind entweder x oder ein y mit beliebig vielen z danach. Vor jedem dieser Wörter muss genau ein a stehen.', [
      code('a', 'Formuliere die Regel mit passender Gruppierung.', 'wort = "a" ("x" | "y" {"z"});'),
      words('b', 'Prüfe die Kandidaten.', 'wort = "a" ("x" | "y" {"z"});', ['ax', 'ayzz', 'yzz', 'axx']),
      text('c', 'Vergleiche mit wort = "a" "x" | "y" {"z"};.', 'II', [['Ohne Gruppierung gilt das a nur im ersten Zweig.', 1], ['y ist ein konkretes Gegenbeispiel.', 1]], 'Die alternative Grammatik akzeptiert y ohne a. Die Klammern binden beide Zweige an das gemeinsame Präfix.')
    ]),
    task('C7', 'Blockweise wiederholen', 'Ein Wort besteht aus beliebig vielen ab-Blöcken. Auch ε ist enthalten.', [
      code('a', 'Formuliere die EBNF.', 'wort = {"a" "b"};'),
      words('b', 'Prüfe die Wörter.', 'wort = {"a" "b"};', ['', 'ab', 'abab', 'aabb']),
      text('c', 'Beurteile die angeblich gleichwertige Regel {"a"} {"b"}.', 'III', [['Nicht gleichwertig.', 1], ['aabb oder a als Gegenbeispiel mit korrekter Zuordnung.', 2]], '{"a"} {"b"} erzeugt beliebig viele a und danach beliebig viele b. aabb ist dort enthalten, aber kein Wort aus ab-Blöcken.')
    ]),
    task('C8', 'Eine Zeichenkette mit Vorzeichen', 'Eine ganze Zahl hat optional + oder - als Vorzeichen, danach mindestens eine Dezimalziffer. Führende Nullen sind erlaubt.', [
      code('a', 'Formuliere die Grammatik.', `zahl = ["+" | "-"] ziffer {ziffer};\n${digits}`),
      words('b', 'Prüfe die Beispiele.', `zahl = ["+" | "-"] ziffer {ziffer};\n${digits}`, ['-12', '+0', '007', '+', '--2']),
      text('c', 'Erkläre die geschachtelte Alternative in der Option.', 'II', [['Die Option umfasst die gesamte Alternative, daher höchstens ein Vorzeichen.', 2]], '["+" | "-"] erlaubt kein, ein Plus- oder ein Minuszeichen; nicht beide.')
    ]),
    task('C9', 'Fehlerhafte Notation korrigieren', 'Ein Wort soll mit a beginnen und beliebig viele b enthalten. Der fehlerhafte Vorschlag lautet: wort = "a" ["b" ;', [
      code('a', 'Korrigiere sowohl den Syntaxfehler als auch die falsche Mengenbedingung.', 'wort = "a" {"b"};', 'ebnf', 4, {starter: 'wort = "a" ["b" ;'}),
      text('b', 'Benenne beide Fehler getrennt.', 'II', [['Schließende Klammer fehlt.', 1], ['Optionalität statt beliebiger Wiederholung.', 1]], 'Es fehlt eine schließende Klammer. Für beliebig viele b sind außerdem geschweifte statt eckiger Klammern nötig.')
    ]),
    task('C10', 'Rekursive Klammerung', 'Erlaubt sind genau n öffnende Klammern, gefolgt von n schließenden Klammern, n ≥ 0. Eine Verkettung wie ()() ist ausgeschlossen.', [
      code('a', 'Formuliere eine rekursive EBNF-Produktion.', 'wort = ε | "(" wort ")";'),
      words('b', 'Prüfe die Kandidaten.', 'wort = ε | "(" wort ")";', ['', '()', '(())', '()()']),
      text('c', 'Begründe, weshalb eine allgemeine Schleife über "()" nicht genügt.', 'II', [['Blockwiederholung erzeugt nebeneinander statt ineinander.', 1], ['(()) unterscheidet die Sprachen.', 1]], '{"()"} erzeugt ()(), aber nicht (()). Die Aufgabe verlangt ineinander geschachtelte Klammern. Ein begrenzter Vergleich allein beweist keine allgemeine Äquivalenz.')
    ]),
    task('C11', 'Drei Wörter und ein Punkt', 'Ein Baustein wort besteht aus a und optional b. Ein Satz enthält genau drei dieser Wörter direkt hintereinander und dann einen Punkt; es gibt keine Leerzeichen in den Satzwörtern.', [
      code('a', 'Formuliere satz und wort mit Referenzen.', 'satz = wort wort wort ".";\nwort = "a" ["b"];'),
      words('b', 'Prüfe die Sätze.', 'satz = wort wort wort ".";\nwort = "a" ["b"];', ['aaa.', 'ababab.', 'aa.', 'a a a.']),
      text('c', 'Erläutere den Unterschied zwischen Leerzeichen der Notation und dem Terminal " ".', 'II', [['Leerzeichen zwischen Bausteinen sind nur Trennung der Notation.', 1], ['Ein zitiertes Leerzeichen wäre ein wirkliches Zeichen im Wort.', 1]], 'satz = wort wort enthält kein Leerzeichen zwischen den erzeugten Wortteilen. Dafür müsste ausdrücklich " " eingefügt werden.')
    ]),
    task('C12', 'Fehlende Definition und Erweiterung', 'Ein Vorschlag lautet zahl = ziffer {ziffer};, definiert ziffer aber nicht. Zugelassen werden sollen genau die Ziffern 0, 1, 2.', [
      code('a', 'Vervollständige die Grammatik.', `zahl = ziffer {ziffer};\n${small}`, 'ebnf', 4, {starter: 'zahl = ziffer {ziffer};'}),
      code('b', 'Entwickle eine separate erweiterte Lösung: Die erste Ziffer muss 1 oder 2 sein; danach sind 0, 1 und 2 erlaubt.', `zahl = ("1" | "2") {ziffer};\n${small}`, 'ebnf', 5, {afb: 'III'}),
      text('c', 'Begründe, weshalb ein Startsymbolwechsel zur Regel ziffer die Aufgabe nicht löst.', 'III', [['Dann würden nur einzelne Ziffern geprüft.', 1], ['Die mehrstelligen Zahlwörter wären nicht mehr Sprache des Startsymbols.', 1]], 'Die Sprachprüfung muss bei zahl beginnen. Das Startsymbol ziffer beschreibt nur Wörter der Länge eins.')
    ]),

    task('D1', 'Kennungen selbst zeichnen', 'Gegeben ist die EBNF unten. Zeichne alle drei Diagramme selbst; der Arbeitsbereich beginnt mit leeren Regeln.', [
      code('a', 'Zeichne die Diagramme zu kennung, buchstabe und ziffer.', identifier, 'draw', 6, {starter: 'kennung = ε;\nbuchstabe = ε;\nziffer = ε;'}),
      words('b', 'Prüfe die Kennungen anhand der Vorgabe.', identifier, ['a12', '2ab', 'cab0']),
      text('c', 'Erläutere, weshalb keine Ziffer am Anfang stehen darf.', 'II', [['Die erste Referenz ist ausschließlich buchstabe.', 1], ['Die Alternative mit ziffer wird erst danach wiederholt.', 1]], 'Der Eintritt führt zunächst verpflichtend durch buchstabe. ziffer liegt nur in der nachfolgenden Wiederholung.')
    ], {givenEBNF: identifier, hint: 'Baue zuerst die beiden Symbolmengen und verwende sie danach als Referenzen in kennung.'}),
    task('D2', 'Ein Diagramm lesen', 'Das vorgegebene Diagramm besitzt eine Folge, einen optionalen Weg und eine Wiederholung.', [
      code('a', 'Formuliere die EBNF des Diagramms.', 'wort = "a" ["b"] {"c"};'),
      words('b', 'Entscheide anhand des Diagramms.', 'wort = "a" ["b"] {"c"};', ['a', 'abcc', 'abbc', 'accc']),
      text('c', 'Erläutere, weshalb a bereits ein vollständiges Wort ist.', 'II', [['b und die gesamte c-Wiederholung können umgangen werden.', 2]], 'Nach a können beide oberen Umgehungswege genutzt werden; weder b noch c sind verpflichtend.')
    ], {reference: 'wort = "a" ["b"] {"c"};'}),
    task('D3', 'Der fehlende Umgehungsweg', 'Das fehlerhafte Diagramm soll wort = "a" {"b"}; darstellen. Es hat eine Rückführung für b, aber keinen Weg für null b.', [
      code('a', 'Korrigiere das Diagramm im grafischen Editor.', 'wort = "a" {"b"};', 'draw', 5, {starter: 'wort = "a" "b" {"b"};'}),
      text('b', 'Benenne den Fehler und ein dadurch verlorenes Wort.', 'II', [['Der Umgehungsweg für null Durchläufe fehlt.', 1], ['a wird fälschlich ausgeschlossen.', 1]], 'Die Rückführung erlaubt zusätzliche b, aber der erste Durchlauf ist verpflichtend. Der ergänzte Bypass muss auch das Wort a erlauben.')
    ], {reference: 'wort = "a" {"b"};', defect: 'missing-bypass', hint: 'Eine Wiederholung ist kein „mindestens einmal“. Im Editor muss der verpflichtende erste b-Baustein entfernt werden.'}),
    task('D4', 'Einen optionalen Weg ergänzen', 'Das unvollständige Diagramm erzeugt nur ac. Zusätzlich soll abc möglich sein, aber kein abbc.', [
      code('a', 'Ergänze das Diagramm grafisch.', 'wort = "a" ["b"] "c";', 'draw', 5, {starter: 'wort = "a" "c";'}),
      text('b', 'Begründe die Wahl einer Option statt einer Schleife.', 'II', [['b darf höchstens einmal auftreten.', 1], ['Eine Schleife würde abbc erlauben.', 1]], 'Ein optionaler Zweig erlaubt null oder ein b. Eine Wiederholung hätte keine obere Grenze.')
    ], {reference: 'wort = "a" "c";'}),
    task('D5', 'Zwei Darstellungen vergleichen', 'Vergleiche die EBNF wort = "a" ["b"]; mit dem vorgegebenen Diagramm.', [
      p('a', 'compare', 'Beschreiben beide Darstellungen dieselbe Sprache?', 'II', 3, {left: 'wort = "a" ["b"];', right: 'wort = "a" | "a" "b";', equal: true}),
      text('b', 'Begründe unabhängig von der optischen Struktur.', 'II', [['Beide beschreiben genau {a, ab}.', 2]], 'Ein optionales b und die Alternative zwischen a und ab sind zwei Darstellungen derselben endlichen Sprache.')
    ], {reference: 'wort = "a" | "a" "b";'}),
    task('D6', 'Ein falscher Alternativzweig', 'Das dargestellte Diagramm soll wort = ("a" | "b") "c"; entsprechen. Im gezeigten Diagramm fehlt c jedoch nach a.', [
      code('a', 'Korrigiere die Struktur grafisch.', 'wort = ("a" | "b") "c";', 'draw', 5, {starter: 'wort = "a" | "b" "c";'}),
      p('b', 'compare', 'Vergleiche den fehlerhaften Vorschlag mit der Zielgrammatik. Gib bei Ungleichheit ein Gegenbeispiel an.', 'II', 3, {left: 'wort = "a" | "b" "c";', right: 'wort = ("a" | "b") "c";', equal: false}),
      text('c', 'Erläutere die gemeinsame Fortsetzung.', 'II', [['Beide Alternativzweige müssen vor dem gemeinsamen c zusammengeführt werden.', 2]], 'c liegt nach der gesamten Alternative. Die fehlerhafte Version akzeptiert a statt ac.')
    ], {reference: 'wort = "a" | "b" "c";'}),
    task('D7', 'Drei verschachtelte Wege zeichnen', 'Zeichne eine Folge aus a, optional entweder b oder c und anschließend beliebig vielen d.', [
      code('a', 'Erstelle das vollständige Diagramm.', 'wort = "a" ["b" | "c"] {"d"};', 'draw', 6),
      words('b', 'Prüfe die Wörter.', 'wort = "a" ["b" | "c"] {"d"};', ['a', 'acdd', 'abcd', 'ab']),
      text('c', 'Beschreibe die Lage der Alternative relativ zur Option.', 'II', [['Die Alternative liegt vollständig im unteren optionalen Zweig.', 1], ['Der Bypass umgeht beide Möglichkeiten gemeinsam.', 1]], 'Erst wird entschieden, ob der optionale Zweig genutzt wird. In ihm wird entweder b oder c gelesen, niemals beide.')
    ]),
    task('D8', 'Blockschleife lesen', 'Lies das Diagramm und achte darauf, welchen Teil die Rückführung umschließt.', [
      code('a', 'Formuliere die EBNF des Diagramms.', 'wort = {"a" "b"};'),
      words('b', 'Prüfe die Wörter.', 'wort = {"a" "b"};', ['', 'ab', 'abab', 'aabb']),
      text('c', 'Erkläre die Richtung der Rückführung.', 'II', [['Die Rückführung läuft von rechts nach links zurück vor den gesamten ab-Block.', 2]], 'Der Block wird im Hinweg links nach rechts gelesen. Die Rückführung bringt den Weg ohne zusätzliche Terminalzeichen vor das nächste a zurück.')
    ], {reference: 'wort = {"a" "b"};'}),
    task('D9', 'Eine unterbrochene Verbindung', 'Das gezeigte Lehrbeispiel hat zwischen zwei Bausteinen eine sichtbare Lücke. Es soll genau ab erzeugen. Eine Lücke ist keine Alternative und kein Umgehungsweg.', [
      code('a', 'Erstelle eine korrekt verbundene Fassung im Editor.', 'wort = "a" "b";', 'draw', 4),
      text('b', 'Benenne den Anschlussfehler und erläutere den Unterschied zu ε.', 'II', [['Die Verbindung zwischen a und b ist unterbrochen.', 1], ['ε ist ein vollständig verbundener Weg ohne Terminal, keine fehlende Kante.', 2]], 'Ein Syntaxdiagramm muss vom Eingang zum Ausgang durchgängig verbunden sein. ε liest nichts, besitzt aber einen gültigen Weg. Eine gezeichnete Lücke besitzt diesen Weg gerade nicht.')
    ], {reference: 'wort = "a" "b";', defect: 'gap'}),
    task('D10', 'Referenzdiagramme ergänzen', 'Die Regel ziffer enthält bereits die Alternativen 0, 1 und 2. Ergänze zahl für mindestens eine Ziffer.', [
      code('a', 'Bearbeite die leere Regel zahl grafisch und erhalte ziffer.', `zahl = ziffer {ziffer};\n${small}`, 'draw', 6, {starter: `zahl = ε;\n${small}`}),
      words('b', 'Prüfe die Zahlen.', `zahl = ziffer {ziffer};\n${small}`, ['0', '12', '', '20']),
      text('c', 'Begründe, warum ein Nichtterminal als Rechteck gezeichnet wird.', 'I', [['Das Rechteck verweist auf ein anderes Diagramm und ist kein festes Terminalwort.', 2]], 'ziffer ist eine Referenz auf die Alternativen im anderen Diagramm; es steht nicht für die Buchstabenfolge ziffer.')
    ]),
    task('D11', 'Optional oder beliebig oft?', 'Gegeben ist das Diagramm unten. Vergleiche es mit wort = "a" ["b"];.', [
      p('a', 'compare', 'Prüfe die Gleichwertigkeit und gib gegebenenfalls ein Gegenbeispiel an.', 'II', 3, {left: 'wort = "a" ["b"];', right: 'wort = "a" {"b"};', equal: false}),
      code('b', 'Ändere das Diagramm so, dass es zur gegebenen EBNF passt.', 'wort = "a" ["b"];', 'draw', 4, {starter: 'wort = "a" {"b"};'}),
      text('c', 'Erkläre den Bedeutungsunterschied am Wort abb.', 'II', [['abb liegt in der Wiederholungssprache, nicht in der Optionssprache.', 2]], 'Die Schleife kann zweimal durch b laufen. Der optionale Weg kann nur einmal oder gar nicht genutzt werden.')
    ], {reference: 'wort = "a" {"b"};'}),
    task('D12', 'Ein kleines Nachrichtenformat', 'Eine Nachricht beginnt mit <, enthält genau x oder y, danach optional ! und endet mit >.', [
      code('a', 'Zeichne das Syntaxdiagramm selbst.', 'nachricht = "<" ("x" | "y") ["!"] ">";', 'draw', 6),
      code('b', 'Formuliere unabhängig davon die EBNF.', 'nachricht = "<" ("x" | "y") ["!"] ">";'),
      words('c', 'Prüfe die Nachrichten.', 'nachricht = "<" ("x" | "y") ["!"] ">";', ['<x>', '<y!>', '<xy>', '<!>']),
      text('d', 'Beurteile die Erweiterung um beliebig viele Ausrufezeichen.', 'III', [['["!"] müsste durch {"!"} ersetzt werden.', 1], ['<x!!> ist ein neues zulässiges Wort.', 1]], 'Eine Wiederholung erweitert die Sprache echt. <x!!> ist danach möglich, zuvor nicht.')
    ]),

    task('E1', 'Paketnummern im Logistikzentrum', 'Eine Paketnummer beginnt mit P oder E. Danach folgen genau drei Dezimalziffern. Optional folgen ein Bindestrich und genau zwei weitere Ziffern. Die Nummer endet mit X.', [
      code('a', 'Entwickle eine EBNF-Grammatik mit der Regel ziffer.', `paket = ("P" | "E") ziffer ziffer ziffer ["-" ziffer ziffer] "X";\n${digits}`, 'ebnf', 5),
      code('b', 'Zeichne die Paketstruktur selbst. Die Ziffernregel ist bereits angelegt.', `paket = ("P" | "E") ziffer ziffer ziffer ["-" ziffer ziffer] "X";\n${digits}`, 'draw', 5, {starter: `paket = ε;\n${digits}`}),
      words('c', 'Prüfe die Paketnummern.', `paket = ("P" | "E") ziffer ziffer ziffer ["-" ziffer ziffer] "X";\n${digits}`, ['P123X', 'E007-42X', 'P12X', 'E123-4X']),
      text('d', 'Beschreibe die Sprache und begründe ihre Regularität.', 'II', [['Form: {P,E} · D³ · (ε ∪ {-} · D²) · {X}.', 2], ['Endliche Sprache durch feste Längen und endliches Alphabet; daher regulär.', 1]], 'Für D = {0,…,9}: L = {P,E} · D³ · (ε ∪ {-} · D²) · {X}. Alle Wörter haben Länge 5 oder 8; die Sprache ist endlich und somit regulär.'),
      code('e', 'Entwickle eine Erweiterung: Zusätzlich ist Pakettyp R erlaubt. Nur R hat genau vier Ziffern und darf keinen Bindestrich-Zusatz enthalten. P und E behalten ihre bisherigen Regeln.', `paket = (("P" | "E") ziffer ziffer ziffer ["-" ziffer ziffer] | "R" ziffer ziffer ziffer ziffer) "X";\n${digits}`, 'ebnf', 5, {afb: 'III'})
    ], {hint: 'Der Bindestrich gehört mit beiden Zusatzziffern in denselben optionalen Block.'}),
    task('E2', 'Identifikationsnummern im Gerätepark', 'Eine Geräte-ID beginnt mit genau zwei Buchstaben aus {A,B,C}, danach einem Bindestrich und einer oder mehr Ziffern aus {0,1,2}. Führende Nullen sind erlaubt.', [
      code('a', 'Entwickle eine Grammatik.', 'id = buchstabe buchstabe "-" ziffer {ziffer};\nbuchstabe = "A" | "B" | "C";\n' + small, 'ebnf', 5),
      code('b', 'Zeichne das ID-Diagramm. Erstelle auch die beiden Symbolregeln.', 'id = buchstabe buchstabe "-" ziffer {ziffer};\nbuchstabe = "A" | "B" | "C";\n' + small, 'draw', 5),
      words('c', 'Prüfe die IDs.', 'id = buchstabe buchstabe "-" ziffer {ziffer};\nbuchstabe = "A" | "B" | "C";\n' + small, ['AB-0', 'CC-120', 'A-12', 'AB-']),
      text('d', 'Erläutere, weshalb die Sprache trotz unbeschränkter Ziffernzahl regulär ist.', 'II', [['Ein wiederholter Zeichenblock verlangt kein Zählen zweier abhängiger Anzahlen.', 2], ['Ein endlicher Automat kann nach dem Präfix beliebig viele Ziffern lesen.', 1]], 'Nach den zwei Buchstaben und dem Bindestrich genügt eine Ziffernschleife. Unendlich viele Wörter allein machen eine Sprache nicht nichtregulär.'),
      text('e', 'Beurteile eine Erweiterung, bei der die Anzahl der Ziffern gleich der beliebig großen Anzahl vorangestellter A sein muss.', 'III', [['Eine unbeschränkte Gleichheitsbedingung entsteht.', 1], ['Teilstruktur Aⁿ-0ⁿ ist nicht regulär; ein reiner endlicher Automat genügt nicht.', 2]], 'Wird das Präfix zu Aⁿ und der Zahlenteil zu n Nullen, muss eine unbeschränkte Anzahl gemerkt werden. Das bekannte Muster Aⁿ-0ⁿ ist nicht regulär. Eine rekursive Grammatik könnte beide Anzahlen koppeln.')
    ]),
    task('E3', 'Dateinamen eines Archivs', 'Ein Dateiname beginnt mit a, b oder c, darf danach weitere a, b, c, 0, 1 oder 2 enthalten und endet mit .txt oder .csv. Der Name vor dem Punkt ist nicht leer.', [
      code('a', 'Entwickle eine Grammatik.', `datei = buchstabe {buchstabe | ziffer} (".txt" | ".csv");\n${letters}\n${small}`, 'ebnf', 5),
      code('b', 'Zeichne das Diagramm der Regel datei; die Symbolregeln sind vorgegeben.', `datei = buchstabe {buchstabe | ziffer} (".txt" | ".csv");\n${letters}\n${small}`, 'draw', 5, {starter: `datei = ε;\n${letters}\n${small}`}),
      words('c', 'Prüfe die Dateinamen.', `datei = buchstabe {buchstabe | ziffer} (".txt" | ".csv");\n${letters}\n${small}`, ['a.txt', 'cab02.csv', '0ab.txt', 'a.txt.csv']),
      text('d', 'Begründe, weshalb weder ein leerer Basisname noch eine führende Ziffer möglich ist.', 'II', [['Der erste buchstabe ist verpflichtend.', 1], ['ziffer liegt nur in der nachfolgenden Wiederholung.', 1]], 'Die erste Referenz erzeugt genau einen Buchstaben; der Wiederholungsblock folgt erst danach.'),
      code('e', 'Erweitere um die Endung .log und ein optionales Präfix tmp_.', `datei = ["tmp_"] buchstabe {buchstabe | ziffer} (".txt" | ".csv" | ".log");\n${letters}\n${small}`, 'ebnf', 4, {afb: 'III'})
    ]),
    task('E4', 'Eine kleine Befehlssprache', 'Ein Programm enthält mindestens einen Befehl. Ein Befehl lautet vor; oder links;. Danach dürfen beliebig viele weitere Befehle folgen. Zwischen den Befehlen stehen keine Leerzeichen.', [
      code('a', 'Entwickle programm und befehl.', 'programm = befehl {befehl};\nbefehl = "vor;" | "links;";', 'ebnf', 4),
      code('b', 'Zeichne beide Diagramme.', 'programm = befehl {befehl};\nbefehl = "vor;" | "links;";', 'draw', 5),
      words('c', 'Prüfe die Programme.', 'programm = befehl {befehl};\nbefehl = "vor;" | "links;";', ['vor;', 'links;vor;', '', 'vorlinks;']),
      text('d', 'Begründe die Bedeutung des Semikolons in zwei verschiedenen Rollen.', 'II', [['Innerhalb von "vor;" ist es ein Zeichen des erzeugten Programms.', 1], ['Außerhalb der Anführungszeichen schließt es eine EBNF-Produktion ab.', 1]], 'Ein zitiertes Semikolon gehört zum Terminalwort. Das abschließende unzitierte Semikolon gehört nur zur EBNF-Notation.'),
      code('e', 'Entwickle eine separate erweiterte Sprache mit beliebig geschachtelten, möglicherweise leeren Wiederholungsblöcken [programm]. Ein nichtleeres Hauptprogramm besteht aus mindestens einem einfachen Befehl oder Block.', 'programm = element {element};\nelement = "vor;" | "links;" | "[" [programm] "]";', 'ebnf', 5, {afb: 'III'})
    ], {hint: 'Beim rekursiven Erweiterungsmodell muss zwischen Hauptprogramm und optionalem Blockinhalt unterschieden werden.'}),
    task('E5', 'Sensor- und Messdaten', 'Ein Datensatz besteht aus T oder H, einem Doppelpunkt, optional einem Minus und mindestens einer Dezimalziffer. Optional folgen ein Punkt und genau eine Nachkommastelle. Der Datensatz endet mit #.', [
      code('a', 'Entwickle eine EBNF.', `messung = ("T" | "H") ":" ["-"] ziffer {ziffer} ["." ziffer] "#";\n${digits}`, 'ebnf', 5),
      code('b', 'Zeichne das Messungsdiagramm; die Ziffernregel ist vorgegeben.', `messung = ("T" | "H") ":" ["-"] ziffer {ziffer} ["." ziffer] "#";\n${digits}`, 'draw', 5, {starter: `messung = ε;\n${digits}`}),
      words('c', 'Prüfe die Datensätze.', `messung = ("T" | "H") ":" ["-"] ziffer {ziffer} ["." ziffer] "#";\n${digits}`, ['T:12#', 'H:-0.5#', 'T:.5#', 'H:1.25#']),
      text('d', 'Beurteile: Die Grammatik garantiert Luftfeuchtigkeit von 0 bis 100 Prozent.', 'III', [['Falsch; H:-1# oder H:999# ist syntaktisch zulässig.', 2], ['Syntaxprüfung und fachliche Wertebereichsprüfung unterscheiden.', 1]], 'Die Grammatik prüft nur das Format. Beispielsweise H:999# erfüllt es. Eine zusätzliche Wertebereichsprüfung wäre nötig.'),
      code('e', 'Entwickle eine neue Fassung mit sensorabhängiger Genauigkeit: Nur T darf weiterhin genau eine Nachkommastelle besitzen. H muss ganzzahlig sein. Beide Typen dürfen weiterhin ein Minus und beliebig viele Vorkommastellen besitzen.', `messung = ("T" ":" ["-"] ziffer {ziffer} ["." ziffer] | "H" ":" ["-"] ziffer {ziffer}) "#";\n${digits}`, 'ebnf', 5, {afb: 'III'})
    ]),
    task('E6', 'Nachrichten eines Kommunikationssystems', 'Eine Nachricht beginnt mit <, enthält eine oder mehr Nutzlastzeichen aus {a,b,c}, dann optional : mit genau einer Ziffer aus {0,1,2} und endet mit >. Die Ziffer ist nur eine Kennziffer, keine berechnete Prüfsumme.', [
      code('a', 'Entwickle eine Grammatik.', `nachricht = "<" buchstabe {buchstabe} [":" ziffer] ">";\n${letters}\n${small}`, 'ebnf', 5),
      code('b', 'Zeichne das Diagramm der Nachricht; die Symbolregeln sind vorgegeben.', `nachricht = "<" buchstabe {buchstabe} [":" ziffer] ">";\n${letters}\n${small}`, 'draw', 5, {starter: `nachricht = ε;\n${letters}\n${small}`}),
      words('c', 'Prüfe die Nachrichten.', `nachricht = "<" buchstabe {buchstabe} [":" ziffer] ">";\n${letters}\n${small}`, ['<a>', '<abc:2>', '<>', '<a:12>']),
      text('d', 'Erläutere, warum mindestens ein Nutzlastzeichen vorgeschrieben ist.', 'II', [['Ein buchstabe steht vor der Wiederholung.', 2]], 'Die verpflichtende erste Referenz verhindert eine leere Nutzlast; die Wiederholung erlaubt erst die zusätzlichen Zeichen.'),
      text('e', 'Entwickle eine Idee für eine echte Prüfsumme und beurteile, ob die bisherige Grammatik sie prüft.', 'III', [['Konkrete Berechnungsidee, etwa Nutzlastlänge modulo 3.', 1], ['Die bisherige Grammatik prüft nur, dass eine Ziffer an der Stelle steht.', 1], ['Berechnung und Abgleich müssten zusätzlich implementiert oder in ein erweitertes Modell aufgenommen werden.', 1]], 'Eine mögliche Prüfsumme wäre die Nutzlastlänge modulo 3. Die bisherige Grammatik akzeptiert jede der drei Ziffern und stellt diesen Zusammenhang nicht her. Ein zusätzlicher Prüfschritt könnte den Wert berechnen und vergleichen.')
    ])
  ];
  A.tasks.push(...tasks);
  // Two complete Q3-focused practice papers, each 40 BE. They do not claim
  // to reproduce the full 90-BE Informatik exam with other course topics.
  A.exams = [
    {id: 'K1', title: 'Übungsklausur 1 · Logistik und Grammatik', minutes: 100, parts: [
      {task: 'A1', ids: ['a', 'b', 'c', 'f']}, {task: 'E1', ids: ['a', 'b', 'c', 'd', 'e']}, {task: 'D6', ids: ['a', 'b']}
    ], note: 'Eigene Zeit­empfehlung: 100 Minuten. Alle drei Aufgabenblöcke bearbeiten.'},
    {id: 'K2', title: 'Übungsklausur 2 · Messdaten und Strukturen', minutes: 100, parts: [
      {task: 'A3', ids: ['a', 'b', 'c', 'd', 'e']}, {task: 'E5', ids: ['a', 'b', 'd', 'e']}, {task: 'B2', ids: ['a', 'b', 'c']}
    ], note: 'Eigene Zeit­empfehlung: 100 Minuten. Alle drei Aufgabenblöcke bearbeiten.'}
  ];
  // The default model solution for A8b must use multiplication at its root.
  A.tasks.find(t => t.id === 'A8').parts.find(p => p.id === 'b').firstProduction = 'E → E*E';
  if (typeof module !== 'undefined' && module.exports) module.exports = A;
})(typeof globalThis !== 'undefined' ? globalThis : this);
