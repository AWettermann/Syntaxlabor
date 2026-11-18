# Syntaxlabor V4.1 · Abiturtraining Q3

**Live verwenden:** [Syntaxlabor V4.1 öffnen](https://awettermann.github.io/Syntaxlabor/)

Syntaxdiagramme zeichnen, EBNF formulieren, Sprachen untersuchen und in 50 Aufgaben mit 166 Teilaufgaben sowie zwei eigenen Q3-Klausuren üben. Ohne Backend, Anmeldung oder externe Laufzeitabhängigkeiten. Die sechs bisherigen Kurzübungen bleiben erhalten.

Prüfungsbezug und Abgrenzung: [QUELLEN.md](QUELLEN.md). Vollständiges Aufgaben-/Kompetenzraster: [AUFGABENRASTER.md](AUFGABENRASTER.md). Druckbare Klausuren mit getrennten Erwartungshorizonten: [KLAUSUREN.md](KLAUSUREN.md). Dies ist keine vollständige Abdeckung des gesamten Informatikabiturs.

## Start

`index.html` im Browser öffnen. Alle benachbarten JavaScript- und CSS-Dateien müssen erhalten bleiben; die vollständige Liste steht unten. Ein Build oder Paketinstallation ist zum Benutzen nicht erforderlich.

Die App funktioniert auch vollständig offline. Ein Entwurf wird nach Möglichkeit im lokalen Browserspeicher gespeichert. Das ist keine dauerhafte Datensicherung: wichtige Grammatiken über **Als Text speichern** sichern. Ob lokale HTML-Dateien denselben Browserspeicher wiederfinden, hängt vom Browser ab.

## Neue Trainingsbereiche

Die Hauptnavigation trennt das freie Syntaxlabor von den Lernmodulen, dem Abiturtraining und dem Lernfortschritt:

| Modul | Umfang | Arbeitsformen |
| --- | --- | --- |
| A · Grammatiken | 8 Aufgaben | Tupel, Ableitungen, Links-/Rechtsableitung, interaktive Bäume, Wörter und Begründungen |
| B · Chomsky-Hierarchie | 12 Aufgaben | Klassifikation, Zuordnung, Form versus Sprachklasse, Gegenbeispiele und Konventionen |
| C · EBNF-Training | 12 Aufgaben | Folgen, Alternativen, Optionen, Schleifen, Referenzen, Rekursion und Korrekturen |
| D · Syntaxdiagramme | 12 Aufgaben | Selbst zeichnen, lesen, ergänzen, fehlerhafte Lehrdiagramme korrigieren und vergleichen |
| E · Transfer | 6 Aufgaben | Logistik, Geräte-IDs, Dateien, Befehlssprache, Sensorwerte und Nachrichten |

Modul E ist über **Abiturtraining → Transferaufgaben öffnen** erreichbar. Modul B verwendet auf ausdrücklichen Wunsch die **vollständige Chomsky-Hierarchie von Typ 0 bis Typ 3** als zusammenhängenden Lerninhalt. Die Lernansicht zeigt alle vier Typen mit Produktionsbedingungen, Beispielen, Maschinenmodellen und der Einschachtelung der Sprachklassen. Die Grundkursbasis und die verwendeten Operatoren wurden mit offiziellen hessischen Quellen abgeglichen; der bewusst darüber hinausgehende Lernumfang ist in `QUELLEN.md` erklärt.

**Lernen** bietet Hinweise und Musterlösungen auf Wunsch. **Trainieren** zeigt Rückmeldungen erst nach Abgabe. Beide verwenden einen eigenen Antwortsatz pro Aufgabe. Bereits verwendete Hilfen werden gekennzeichnet. Freitext wird nicht durch Wortsuche benotet: Der Erwartungshorizont nennt Aspekte mit Teilpunkten für die Selbstkontrolle.

Jede EBNF-/Zeichen-Teilaufgabe hat einen eigenen gespeicherten Arbeitsbereich. **Im EBNF-Editor bearbeiten** bzw. **Im grafischen Editor zeichnen** öffnet den vorhandenen Labor-Editor direkt in der Aufgabe. Beim Wechsel bleiben die anderen Teilantworten erhalten. Im Zeichenmodus bleibt die automatisch mitgeführte EBNF vor Abgabe verdeckt. In selbstständigen EBNF-Aufgaben bleiben automatische Diagrammvorschauen ebenfalls verdeckt; im freien Labor und im normalen EBNF-Lernmodus ist die bidirektionale Ansicht sichtbar. Zeichenaufgaben müssen grafisch bearbeitet werden; ein unveränderter Startzustand wird nicht als eigene Zeichnung gewertet.

Ableitungsbäume werden tatsächlich aufgebaut: Ein noch nicht ersetztes Nichtterminal anklicken und eine passende Produktion auswählen. Die letzte Ersetzung kann zurückgenommen werden. Für eingegebene Ableitungen ist eine Satzform pro Zeile oder die Trennung mit `->` möglich, beispielsweise `S -> aS -> aaS -> aab`. Der Prüfer kontrolliert jeden einzelnen Regelanwendungsschritt. Ältere gespeicherte Ableitungsantworten werden auf diese Schreibweise umgestellt; zitierte Terminalzeichen und EBNF-Arbeitsstände bleiben erhalten.

## Abiturmodus und Lernstand

Zwei **selbst erstellte abiturorientierte Q3-Übungsklausuren** enthalten je 40 BE und Aufgaben aus allen drei AFB. Die eigene Zeitempfehlung beträgt jeweils 100 Minuten; eine automatische Zwangsabgabe erfolgt nicht. Während einer laufenden Klausur sind Navigation zu freien Hilfen, Musterlösungen und Hinweise gesperrt. Nach **Gesamte Klausur abgeben und auswerten** bleiben die Antworten schreibgeschützt, der Erwartungshorizont wird freigegeben und automatische Punkte werden von eigenen Punkteschätzungen getrennt. Offene Sprachvergleiche zählen nicht als nachgewiesen richtige Lösungen.

Eine laufende Klausur wird nach Neuladen wieder geöffnet. Klausurantworten sind von Modulantworten und vom freien Laborentwurf getrennt. Ein neuer Versuch beginnt mit neuen Antworten; bis zu zehn vorherige Ergebnisübersichten bleiben archiviert. Das ist ein lokaler Übungsmodus, keine technische Prüfungsaufsicht: Die lokalen Lösungsdateien können mit Entwicklerwerkzeugen eingesehen werden.

**Lernfortschritt** zeigt acht Kompetenzbereiche mit Übungsnachweisen, automatisch geprüften Punkten, Selbstpunkten und genutzten Hilfen. Eine eigene Kompetenzschätzung ist separat auswählbar. **Lernstand exportieren** sichert alle Trainingsantworten und Abgaben als JSON-Datei. Beim Import werden bekannte enthaltene Aufgabenstände übernommen; andere vorhandene Aufgabenstände bleiben erhalten. Beschädigte oder fremde Daten werden geprüft bzw. zurückgewiesen. Die Importgrenze beträgt 4 MB.

Die Speicherbereiche heißen `syntaxlabor-v4-draft` für den bisherigen freien Entwurf und `syntaxlabor-v41-progress` für das Training. V4.0-Entwürfe bleiben dadurch erhalten. Der Lernstandexport enthält den Trainingsfortschritt, während der freie Laborentwurf weiterhin separat als EBNF gesichert wird.

## Arbeiten mit der App

1. **Grafisch:** Mit **+ Neues Diagramm** entsteht ein leerer Weg ε. Den Bausteintyp wählen, Terminaltext oder Regelverweis eingeben und Folgen, Alternativen, Optionen und Wiederholungen ergänzen. Alle Diagramme bleiben gleichzeitig sichtbar.
2. **Auswählen:** Bausteine anklicken oder mit Tab und Enter auswählen. Die Schaltfläche mit dem Regelnamen wählt die gesamte Struktur. Die Strukturübersicht erlaubt auch die Auswahl verschachtelter Gruppen. Auf Touchgeräten stehen dieselben Formularfelder bereit.
3. **Direkt bearbeiten:** Ein Terminal oder Nichtterminal doppelklicken. Enter oder Verlassen des Eingabefeldes übernimmt den Text, Escape bricht ab.
4. **Verschieben:** Ausgewählte Kinder einer Folge oder Alternative über die Pfeilschaltflächen umordnen. Die Reihenfolge einer Folge verändert die Sprache. Es gibt kein Drag-and-drop zwischen beliebigen Gruppen.
5. **EBNF:** Gültige Eingaben werden nach 280 ms Schreibpause übernommen. Jede grafische Änderung aktualisiert sofort die EBNF. **Jetzt übernehmen** verkürzt die Wartezeit, **EBNF formatieren** vereinheitlicht die Schreibweise.
6. **Fehler:** Unvollständige EBNF bleibt im Editor erhalten; die letzten gültigen Diagramme bleiben sichtbar. Grafische Änderungen sind erst nach Vervollständigen oder **Letzte gültige Grammatik einsetzen** möglich. Wortprüfung und Analyse benennen ausdrücklich, wenn sie das letzte gültige Modell verwenden.
7. **Löschen:** Bausteine, einzelne Regeln oder die gesamte Grammatik löschen. Ein entfernter letzter Baustein hinterlässt ε; eine gelöschte letzte Regel hinterlässt eine vollständig leere Grammatik ohne Startsymbol. Änderungen lassen sich über die Schaltflächen rückgängig machen und wiederherstellen.
8. **Sprache:** Startsymbol auswählen, Beispiele erzeugen und Wörter prüfen. Ein leeres Wortprüfungsfeld bedeutet ε. Beispielwörter und Gegenbeispiele sind anklickbar.
9. **Bisherige Kurzübungen:** Unter **Die sechs Kurzübungen aus V4.0** eine Aufgabe und einen Lösungsweg wählen, dann **Aufgabe starten**. Diese erhaltene freie Übungsfunktion bleibt vom neuen Trainingsbereich getrennt verfügbar.
10. **Export:** SVG und PNG exportieren die über den Diagrammnamen oder Baustein ausgewählte Regel ohne Auswahlmarkierung. EBNF-Dateien lassen sich öffnen und speichern.

Die App speichert bis zu 100 Bearbeitungsschritte während der Sitzung. Die Verlaufsschaltflächen beziehen sich auf die ganze Grammatik. In Textfeldern bleiben die üblichen Tastenkürzel für die native Textbearbeitung erhalten; außerhalb von Textfeldern wirken Strg/Cmd+Z und Strg/Cmd+Umschalt+Z auf den Grammatikverlauf. Beim Neuladen bleibt der Entwurf erhalten, der Verlauf beginnt neu.

## EBNF-Notation

```ebnf
wort = "a" ["b"] {"c"};
ziffer = "0" | "1" | "2";
zahl = ziffer {ziffer};
satz = wort wort wort ".";
leer = ε;
```

| Zeichen | Bedeutung |
| --- | --- |
| Leerzeichen | Folge; bindet stärker als `|` |
| `|` | Alternative |
| `[ … ]` | Optional, null oder einmal |
| `{ … }` | Wiederholung, null oder mehrmals |
| `( … )` | Gruppierung |
| `"…"`, `'…'` | Terminal, auch mehr als ein Zeichen |
| Regelname | Nichtterminal |
| `;` | Produktionsende |
| `ε`, `""`, leere rechte Seite | Leeres Wort |

Die Ausgabe verwendet immer Leerzeichen für Folgen und doppelte Anführungszeichen für Terminale. Bestehende V2-Texte mit Kommata werden zur Migration gelesen und beim Formatieren umgewandelt. ε ist ein Metazeichen; `"ε"` ist dagegen ein echtes Terminalzeichen. Leerzeichen **innerhalb** von Anführungszeichen sind Teil eines Wortes. Unterstützt werden auch `\\`, `\"`, `\'`, `\n`, `\r`, `\t`, `\b`, `\f` und `\uXXXX`.

Regelnamen beginnen mit einem lateinischen Buchstaben, Umlaut, ß oder Unterstrich; danach sind auch Ziffern möglich. Doppelte Regelnamen sind ungültig. Undefinierte Nichtterminale werden angezeigt und als Diagrammbausteine erhalten. Solange ein solches Nichtterminal vom Startsymbol erreichbar ist, ist keine Sprachprüfung möglich. Ungenutzte unvollständige Regeln verhindern die Prüfung anderer Startsymbole nicht. Umbenennen einer Regel aktualisiert ihre Referenzen; Löschen einer Regel entfernt Referenzen nicht stillschweigend.

## Fachliche Verfahren und Grenzen

- **Wortprüfung:** EBNF wird in eine kontextfreie Grammatik übersetzt und mit einem Earley-Verfahren geprüft. Auch Linksrekursion, gegenseitige Rekursion, nichtproduktive Zyklen und nullable Konstruktionen werden berücksichtigt. Bei ausgeschöpftem Rechenbudget erscheint ein offenes Fehlerergebnis, keine falsche Ablehnung.
- **Beispiele:** Begrenzte Fixpunktberechnung; standardmäßig maximal 8 Unicode-Zeichen, wählbar 4/8/12, maximal 60 Wörter, maximal 48 Runden und 220.000 Kombinationsschritte. Die Wörter werden nach Länge und anschließend Zeichenreihenfolge sortiert. Diese Auswahl ist keine vollständige Sprachbeschreibung. Auch eine erfolglose Erzeugung beweist keine leere Sprache.
- **Beschreibung:** Exakte Wort- und Mengendarstellung für überschaubare endliche azyklische Grammatiken sowie für eine feste Anfangsfolge, die Wiederholung eines festen Wortes und eine feste Endfolge. Referenzen werden dabei nur azyklisch aufgelöst. Andere Strukturen erhalten ausdrücklich keine unbewiesene Beschreibung.
- **Exakter Lösungsvergleich:** Thompson-Automaten für EBNF mit azyklischen Referenzen; zusätzlich werden syntaktisch rechtslineare Regelnetze einschließlich gegenseitiger Rekursion erkannt. Der Vergleich durchsucht den Produktautomaten der determinisierten Zustandsmengen. Gleiche Sprachen werden bewiesen, unterschiedliche durch ein kürzestes Gegenbeispiel unterschieden. Namen, Formatierung und Gruppierung müssen nicht der Musterlösung entsprechen.
- **Begrenzter Lösungsvergleich:** Andere rekursive Grammatiken, einschließlich `aⁿbⁿ`, werden mit erzeugten Wörtern beider Seiten bis Länge 8 verglichen. Maximal 100 Wörter pro Seite und 48 Erzeugungsrunden; dadurch werden nicht notwendigerweise alle Wörter bis Länge 8 getestet. Ein gefundenes Gegenbeispiel widerlegt Gleichwertigkeit. Ohne Gegenbeispiel bleibt das Ergebnis **offen**. Auch manche regulären, aber syntaktisch anders rekursiv formulierten Sprachen fallen in diesen begrenzten Modus.
- **Größenbegrenzungen:** 24.000 Eingabezeichen, 500 Bausteine, 60 Regeln, 40 Verschachtelungsebenen. Wortprüfung maximal 160 Unicode-Zeichen und 180.000 Chart-Einträge. Automaten maximal 3.500 NFA-Zustände, Vergleich maximal 5.000 besuchte Zustandspaare bzw. eine Warteschlange von 30.000 Paaren. Beschreibungen expandieren maximal 800 Knoten; endliche Mengen werden nur bis 24 Wörtern mit höchstens 40 Zeichen ausgeschrieben.
- **PNG:** Zweifache Auflösung, weißer Hintergrund. Obergrenze 16.000 Pixel pro Seite bzw. 24 Millionen Pixel. Für größere Diagramme SVG verwenden. Lange Diagramme sind in der App horizontal scrollbar.

Die App behauptet keine allgemeine Entscheidung über Sprachgleichheit kontextfreier Grammatiken. Sie analysiert die Sprache des ausgewählten Startsymbols, nicht automatisch die Vereinigung aller Produktionen. Das Entfernen eines markierten Bausteins verändert die Grammatik, eine referenzierte Regel wird dadurch nicht mitgelöscht.

## Tests

Node.js 20 oder neuer:

```sh
npm test
```

Das führt Fach- und Layouttests ohne Installation aus. Für echte Browsertests zusätzlich:

```sh
npm ci
npm run test:browser
npm run test:academy
```

Playwright ist ausschließlich eine Entwicklungsabhängigkeit. Die Tests starten einen temporären HTTP-Server und das auf diesem Mac installierte Google Chrome. Auf anderen Geräten `CHROME_PATH` auf die ausführbare Chrome-/Chromium-Datei setzen. Keine Browserinstallation durch die App und keine Bibliothek aus einem CDN.

Die Browserprüfungen speichern Ergebnisse, Bildschirmaufnahmen und geprüfte Exporte unter `test-results/`. Abschlussstand: **65 Fach-/Layout-/Inhaltstests, 21 Labor-Browsergruppen und alle 24 Trainings-Browsergruppen bestanden**. Geprüft wurden unter anderem die einheitlichen Ableitungspfeile einschließlich älterer Lernstände, die vollständige Chomsky-Übersicht, verdeckte Zeichenaufgaben, interaktive Ableitungsbäume, Lernstandsexport/-import und beide Klausuren einschließlich Fortsetzung nach Neuladen und Punkteauswertung. Einzelheiten: [TESTBERICHT.md](TESTBERICHT.md).

Die vollständigen Aufgabendokumente lassen sich aus den geprüften Quelldaten neu erzeugen:

```sh
node scripts/content-docs.cjs
```

## GitHub Pages

Die Laufzeitdateien sind statisch und benötigen keinen Build:

```text
index.html
styles.css
core.js
renderer.js
exercises.js
app.js
formal.js
curriculum.js
curriculum-tasks.js
assessment.js
academy.js
academy.css
README.md
QUELLEN.md
```

Diese Dateien im Wurzelverzeichnis eines GitHub-Repositories bereitstellen und GitHub Pages für den gewünschten Branch und das Wurzelverzeichnis aktivieren. Alle Ressourcen werden relativ geladen, daher funktioniert auch eine Projektadresse unter `/repository-name/`. `node_modules`, Tests und Screenshots werden für den Betrieb nicht benötigt.

Das Zielrepository ist [AWettermann/Syntaxlabor](https://github.com/AWettermann/Syntaxlabor). Die Anwendung liegt im Wurzelverzeichnis des Hauptzweigs `main`; `.nojekyll` kennzeichnet die unverarbeiteten statischen Dateien. Für eine Veröffentlichung über GitHub Pages unter **Settings → Pages → Deploy from a branch** den Branch `main` und den Ordner `/ (root)` wählen, sofern Pages noch nicht eingerichtet ist. Die ursprüngliche V2-Datei bleibt unter `archive/index-v2.html` erhalten; der vorherige V4.0-Anwendungsstand unter `archive/v4.0/`. Die lokalen ZIP-Pakete sind zusätzliche Sicherungen und werden für den Betrieb nicht benötigt.

## Dateien

| Datei | Aufgabe |
| --- | --- |
| `index.html` / `styles.css` | Oberfläche und responsive Darstellung |
| `core.js` | Grammatikmodell, Parser, Formatierung, Sprachalgorithmen |
| `renderer.js` | SVG-Geometrie und Syntaxdiagramme |
| `app.js` | Synchronisierung, Editor, Verlauf, Speicherung und Exporte |
| `exercises.js` | Drei erhaltene und drei zusätzliche Aufgaben |
| `formal.js` | Produktionsformen, Grammatiknotation, Ableitungsschritte und Bäume |
| `curriculum.js` / `curriculum-tasks.js` | 50 Aufgaben, 166 Teilaufgaben und zwei Klausurzusammenstellungen |
| `assessment.js` | Formale Lösungskontrolle, Teilpunkte und validierte Lernstände |
| `academy.js` / `academy.css` | Navigation, Arbeitsbereiche, Lern-/Trainings-/Abiturmodus und Fortschritt |
| `scripts/content-docs.cjs` | Reproduzierbares Aufgabenraster und druckbare Klausurfassungen |
| `tests/` | Fach-, Layout- und Browserprüfungen |
| `archive/index-v2.html` | Unveränderte Originalanwendung |
