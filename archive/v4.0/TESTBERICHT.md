# Syntaxlabor V4.0 — Testbericht

Abschlussprüfung: **17. November 2026**.

Ergebnis: **29 von 29 Fach-/Layouttests** und **21 von 21 Browser-Prüfgruppen bestanden**, keine JavaScript- oder Konsolenfehler im abschließenden Browserlauf.

## Umgebung und reproduzierbare Ergebnisse

- Node.js v24.21.0 auf macOS (`darwin`).
- Installiertes Google Chrome 157.0.8103.40, gesteuert mit Playwright; Headless-Browser mit echten Klicks, Doppelklicks, Texteingaben, Tastaturaktionen, Downloads und Touchaktionen.
- Prüfung über einen temporären lokalen HTTP-Server und zusätzlich direkt über `file://` bei deaktiviertem Netzwerk.
- Desktop 1440 × 1000, iPad-Ansicht 820 × 1180, Smartphone 390 × 844. Touchbedienung zusätzlich in einem eigenen Browserkontext mit `hasTouch` und `isMobile` geprüft.

```sh
npm test
npm run test:browser
```

Browserabhängigkeit vorher bei Bedarf mit `npm ci` installieren. Der Testserver und die gestarteten Browser werden am Ende geschlossen.

Belege:

- [Fach-/Layouttestergebnisse](test-results/core-results.txt)
- [Browserergebnisse einschließlich Browser- und Node-Version](test-results/browser-results.json)
- [Desktopaufnahme](test-results/desktop.png)
- [iPad-Aufnahme](test-results/ipad.png)
- [Smartphoneaufnahme, erster Bildschirm](test-results/phone.png)
- [Geprüfter SVG-Export](test-results/export.svg)
- [Geprüfter PNG-Export](test-results/export.png)
- [Gespeicherte EBNF-Datei](test-results/saved.ebnf)

Die Bildschirmaufnahmen wurden zusätzlich visuell geprüft. Lange Diagramme scrollen innerhalb ihrer Karten; die Seite selbst hat in den geprüften Breiten keinen horizontalen Überlauf. Die Smartphoneaufnahme zeigt den ersten Bildschirm; die Desktop- und iPad-Aufnahmen zeigen die ganze Seite.

## Abdeckung der 20 geforderten Fälle

| Nr. | Fall | Prüfung und Ergebnis |
| --- | --- | --- |
| 1 | Einzelnes Terminal | `s = "a";` akzeptiert nur das erwartete Wort; bestanden. |
| 2 | Folge | Leerzeichenfolgen, mehrstellige Terminale und feste Satzzeichen; bestanden. |
| 3 | Alternative | Alternativen mit Priorität der Folge vor `|`; bestanden. |
| 4 | Optional | Null oder ein Durchlauf, keine unbeabsichtigte Wiederholung; bestanden. |
| 5 | Wiederholung | ε, ein und mehrere Durchläufe; SVG mit Bypass und gerichteter Rückführung; bestanden. |
| 6 | Verschachtelte Alternativen | Gruppierung, Wortprüfung und Layoutgrenzen; bestanden. |
| 7 | Verschachtelte Wiederholungen | Auch nullable Kinder; Terminierung, Sprache und Layout; bestanden. |
| 8 | Mehrere Nichtterminale | Vier gleichzeitig sichtbare Diagramme und Startsymbolauswahl im Browser; bestanden. |
| 9 | Referenzen | Zahlen aus Ziffern, Auswahl eines Referenzbausteins und konsistentes Umbenennen; bestanden. |
| 10 | Leere Produktion/ε | `ε`, `""`, leere rechte Seite, leere Gruppen und Wortprüfung mit leerem Feld; bestanden. |
| 11 | Vollständig löschen | Keine Regeln, keine Diagramme, leerer EBNF-Text und deaktivierte Startsymbolauswahl; bestanden. |
| 12 | Danach neu anlegen | Neue Regel mit ε, Bearbeitung sowie Undo/Redo der Löschung; bestanden. |
| 13 | Grafik → EBNF automatisch | Typwechsel, direkte Texteingabe per Doppelklick, Formular, Folge, Alternative, Option, Schleife, Verschieben und Entfernen; bestanden. |
| 14 | EBNF → Grafik automatisch | Vier Produktionen nach Schreibpause ohne Umwandlungsklick; unvollständiger Entwurf bewahrt das Modell; bestanden. |
| 15 | Wortprüfung | Positive/negative Wörter, Unicode, Leerzeichen und Escapes; Anklicken von Beispielen; bestanden. |
| 16 | Ungültige EBNF | Fehlende Abschlusszeichen, offene Literale/Klammern, ungültige Zeichen, doppelte Regeln; Positionsmeldung und Wiederherstellung; bestanden. |
| 17 | Undefinierte Nichtterminale | Sichtbare Diagnose und offene Fehlermeldung bei Wortprüfung; ungenutzte fehlende Regeln blockieren andere Startsymbole nicht; bestanden. |
| 18 | Rekursion | Links-, rechts-, gegenseitige und nichtproduktive Rekursion, nullable Zyklen, `aⁿbⁿ`; begrenzte Generierung; bestanden. |
| 19 | SVG/PNG | Echte heruntergeladene Dateien; eigenständiges SVG ohne Auswahl, PNG mit korrekter Dateisignatur; bestanden. |
| 20 | Training | Alle sechs Aufgaben in beiden Modi gestartet und anschließend mit ihrer Lösung bearbeitet/geprüft; Musterlösung nur auf Wunsch; bestanden. |

## Zusätzliche fachliche Prüfungen

- **Roundtrip EBNF → Modell/Diagramm → EBNF:** Alle Konstruktionen inklusive rekursiver Referenzen, Legacy-Kommaschreibweise und leerer Grammatik. Struktur bzw. Sprache bleibt erhalten.
- **Roundtrip Grafik → EBNF → Grafik:** Grafisch erzeugte Konstruktionen werden automatisch als gültige EBNF geschrieben; erneutes Parsen bewahrt ihre Bedeutung.
- **Automatenvergleich:** Unterschiedliche gleichwertige Lösungen, etwa `"ab"` und `"a" "b"`, werden akzeptiert. Optionalität und ausgeschriebene ε-Alternative sowie verschiedene Regelbenennungen werden verglichen.
- **Rechtslineare Rekursion:** Direkte und gegenseitige Rekursion werden exakt mit äquivalenten EBNF-Wiederholungen verglichen. Zusätzlich wird die Automatenakzeptanz für mehrere rekursive Grammatiken auf allen Wörtern über `{a,b}` bis Länge 4 gegen die unabhängige CFG-Wortprüfung geprüft.
- **Gegenbeispiele:** Unterschiede einschließlich des leeren Wortes und der fehlenden Wörter `abb` bzw. `abc` werden gefunden und erklärt.
- **Komplexe Rekursion:** Eine identische `aⁿbⁿ`-Grammatik führt im Training ausdrücklich zu einem offenen begrenzten Ergebnis; keine unbelegte Gleichwertigkeitsbehauptung.
- **Generierung:** Ausgegebene Wörter sind sortiert, halten die Grenzen ein und werden vom unabhängigen Wortprüfer akzeptiert.
- **Sichere Namen und Texte:** Regelnamen `constructor`/`__proto__` funktionieren; XML-Sonderzeichen werden escaped. Unicode- und Steuerzeichen überstehen die Serialisierung.
- **Verlauf und Entwürfe:** Grafikänderungen, Verschieben und vollständiges Löschen lassen sich rückgängig machen/wiederherstellen. Gültige und unvollständige Entwürfe bleiben nach Neuladen erhalten.
- **Dateien und Offline-Betrieb:** EBNF importiert und bytegenau wieder gespeichert. Direkter Offline-Aufruf der lokalen HTML-Datei einschließlich automatischer Diagrammänderung bestanden.

## Verbleibende Grenzen

Die Browserprüfung erfolgte in Chrome. iPad-Ansicht und Touch wurden emuliert; ein physisches iPad und Safari/Firefox wurden nicht separat geprüft. Das ist keine Behauptung einer Prüfung auf echter iPad-Hardware.

Die Diagrammtests prüfen Geometrie, Anschlüsse, Bypass/Rückweg und ausgewählte verschachtelte Darstellungen. Sie sind kein mathematischer Beweis, dass jede innerhalb der Größengrenzen mögliche Zeichnung in jedem Browser fehlerfrei gerastert wird.

Generierung, Beschreibung und komplexe Äquivalenzvergleiche haben die in [README.md](README.md) dokumentierten Grenzen. Ein offenes Analyseergebnis ist kein Fehler und kein Gleichwertigkeitsnachweis. Eine allgemeine automatische verständliche Beschreibung beliebiger kontextfreier Sprachen ist nicht implementiert.

Die geprüfte Anwendung ist lokal fertig und statisch bereit für GitHub Pages. Ein öffentliches Deployment wurde mangels Zielrepository in dieser Arbeitskopie nicht durchgeführt.
