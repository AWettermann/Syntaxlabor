# Syntaxlabor V4.0

Syntaxdiagramme zeichnen, EBNF formulieren und die erzeugte Sprache untersuchen. Für den Informatik-Grundkurs Q3, ohne Backend, Anmeldung oder externe Laufzeitabhängigkeiten.

## Start

`index.html` im Browser öffnen. Alle fünf benachbarten Anwendungsdateien müssen erhalten bleiben: `styles.css`, `core.js`, `renderer.js`, `exercises.js`, `app.js`.

Die App funktioniert auch vollständig offline. Ein Entwurf wird nach Möglichkeit im lokalen Browserspeicher gespeichert. Das ist keine dauerhafte Datensicherung: wichtige Grammatiken über **Als Text speichern** sichern. Ob lokale HTML-Dateien denselben Browserspeicher wiederfinden, hängt vom Browser ab.

## Arbeiten mit der App

1. **Grafisch:** Mit **+ Neues Diagramm** entsteht ein leerer Weg ε. Den Bausteintyp wählen, Terminaltext oder Regelverweis eingeben und Folgen, Alternativen, Optionen und Wiederholungen ergänzen. Alle Diagramme bleiben gleichzeitig sichtbar.
2. **Auswählen:** Bausteine anklicken oder mit Tab und Enter auswählen. Die Schaltfläche mit dem Regelnamen wählt die gesamte Struktur. Die Strukturübersicht erlaubt auch die Auswahl verschachtelter Gruppen. Auf Touchgeräten stehen dieselben Formularfelder bereit.
3. **Direkt bearbeiten:** Ein Terminal oder Nichtterminal doppelklicken. Enter oder Verlassen des Eingabefeldes übernimmt den Text, Escape bricht ab.
4. **Verschieben:** Ausgewählte Kinder einer Folge oder Alternative über die Pfeilschaltflächen umordnen. Die Reihenfolge einer Folge verändert die Sprache. Es gibt kein Drag-and-drop zwischen beliebigen Gruppen.
5. **EBNF:** Gültige Eingaben werden nach 280 ms Schreibpause übernommen. Jede grafische Änderung aktualisiert sofort die EBNF. **Jetzt übernehmen** verkürzt die Wartezeit, **EBNF formatieren** vereinheitlicht die Schreibweise.
6. **Fehler:** Unvollständige EBNF bleibt im Editor erhalten; die letzten gültigen Diagramme bleiben sichtbar. Grafische Änderungen sind erst nach Vervollständigen oder **Letzte gültige Grammatik einsetzen** möglich. Wortprüfung und Analyse benennen ausdrücklich, wenn sie das letzte gültige Modell verwenden.
7. **Löschen:** Bausteine, einzelne Regeln oder die gesamte Grammatik löschen. Ein entfernter letzter Baustein hinterlässt ε; eine gelöschte letzte Regel hinterlässt eine vollständig leere Grammatik ohne Startsymbol. Änderungen lassen sich über die Schaltflächen rückgängig machen und wiederherstellen.
8. **Sprache:** Startsymbol auswählen, Beispiele erzeugen und Wörter prüfen. Ein leeres Wortprüfungsfeld bedeutet ε. Beispielwörter und Gegenbeispiele sind anklickbar.
9. **Training:** Eine der sechs Aufgaben und einen Lösungsweg wählen, dann **Aufgabe starten**. Die Lösung oben schreiben oder zeichnen. **Lösung kontrollieren** vergleicht die Sprachen. Hinweis und Musterlösung erscheinen erst auf Wunsch. Ein vorheriger Entwurf ist über Rückgängig erreichbar.
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
```

Playwright ist ausschließlich eine Entwicklungsabhängigkeit. Die Tests starten einen temporären HTTP-Server und das auf diesem Mac installierte Google Chrome. Auf anderen Geräten `CHROME_PATH` auf die ausführbare Chrome-/Chromium-Datei setzen. Keine Browserinstallation durch die App und keine Bibliothek aus einem CDN.

Die Browserprüfung speichert Ergebnisse, Bildschirmaufnahmen und geprüfte Exporte unter `test-results/`. Details und die Zuordnung zu allen 20 geforderten Fällen stehen in [TESTBERICHT.md](TESTBERICHT.md). Behobene V2-Fehler stehen in [CHANGELOG.md](CHANGELOG.md).

## GitHub Pages

Die Laufzeitdateien sind statisch und benötigen keinen Build:

```text
index.html
styles.css
core.js
renderer.js
exercises.js
app.js
README.md
```

Diese Dateien im Wurzelverzeichnis eines GitHub-Repositories bereitstellen und GitHub Pages für den gewünschten Branch und das Wurzelverzeichnis aktivieren. Alle Ressourcen werden relativ geladen, daher funktioniert auch eine Projektadresse unter `/repository-name/`. `node_modules`, Tests und Screenshots werden für den Betrieb nicht benötigt.

Eine Veröffentlichung wurde in dieser Arbeitskopie nicht vorgenommen: Der Ordner ist kein Git-Repository, und ein Zielrepository bzw. eine Pages-Adresse ist nicht angegeben. Die ursprüngliche V2-Datei bleibt unverändert unter `archive/index-v2.html` erhalten.

## Dateien

| Datei | Aufgabe |
| --- | --- |
| `index.html` / `styles.css` | Oberfläche und responsive Darstellung |
| `core.js` | Grammatikmodell, Parser, Formatierung, Sprachalgorithmen |
| `renderer.js` | SVG-Geometrie und Syntaxdiagramme |
| `app.js` | Synchronisierung, Editor, Verlauf, Speicherung und Exporte |
| `exercises.js` | Drei erhaltene und drei zusätzliche Aufgaben |
| `tests/` | Fach-, Layout- und Browserprüfungen |
| `archive/index-v2.html` | Unveränderte Originalanwendung |
