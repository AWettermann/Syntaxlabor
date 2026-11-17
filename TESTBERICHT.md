# Syntaxlabor V4.1 — Testbericht

Abschlussprüfung: **17. November 2026**. Die Browserabnahme des neuen Trainingsbereichs ist abgeschlossen.

Ergebnis: **61 von 61 Fach-/Layout-/Inhaltstests**, **21 von 21 Labor-Browsergruppen** und **22 von 22 Trainings-Browsergruppen bestanden**. In den vollständigen Browserläufen gab es keine JavaScript- oder Konsolenfehler.

## Abgeschlossene Trainings-Browserabnahme

Der vollständige Lauf hat alle 50 Aufgaben gerendert und die interaktiven Formate geprüft: Grammatikbestandteile, Chomsky-Zuordnungen, Links-/Rechtsableitungen, Baumaufbau mit Rücknahme, EBNF-Bearbeitung, eigene grafische Zeichnungen und Gegenbeispiele. Die vollständige Übersicht für Typ 0–3 ist im Lernmodus sichtbar und im selbstständigen Trainingsmodus verdeckt.

Die Zeichenaufgaben wurden im vorhandenen grafischen Editor gelöst. Vor Abgabe blieben EBNF, Sprachhilfen und Exporte verdeckt; danach waren die gespeicherten Abgaben schreibgeschützt. Die EBNF-Prüfungsansicht zeigte ebenfalls keine automatische Diagrammvorschau.

Beide Klausuren wurden unabhängig gestartet, bearbeitet und abgegeben. Der Lauf prüfte die Trennung von Modulantworten und Klausurantworten, Navigation ohne freie Hilfen während der Klausur, Fortsetzung nach Neuladen, die Erhaltung aller Produktionen einer Zeichnung, gesperrte Antworten nach Abgabe, getrennte automatische und selbst eingeschätzte BE sowie einen neuen Versuch mit archivierter Ergebnisübersicht.

Der erfolgreiche Lauf lässt sich wiederholen mit:

```sh
npm run test:academy
```

Alle 22 Prüfgruppen einschließlich Lernstandsexport/-import, Desktop-/Mobilansicht, iPad-Touchbedienung und direktem Offline-Aufruf über `file://` wurden erfolgreich ausgeführt. Frühere Abbrüche an unpräzisen Testselektoren und Text-Erwartungen sind korrigiert; das verlinkte Rohprotokoll enthält den abschließenden erfolgreichen Lauf.

## Neue Fach- und Inhaltstests

| Bereich | Geprüftes Verhalten | Ergebnis |
| --- | --- | --- |
| Aufgabenumfang | 8/12/12/12/6 eigene Aufgaben, eindeutige IDs, vollständige BE-/AFB-/Formatangaben | Bestanden |
| Muster-EBNF | Sämtliche Lösungen parsebar, keine undefinierten Referenzen, keine Folgetrennkommas; Modell gegen eigenes Roundtrip geprüft | Bestanden |
| Musterableitungen | Alle angegebenen Folgen einschließlich Links-/Rechtsableitung erreichen das richtige Ziel | Bestanden |
| Alle Wortentscheidungen | Sämtliche 24 Wortprüfungs-Teilaufgaben gegen separat festgelegte Zugehörigkeitslisten geprüft; Transfer-Erweiterungen mit positiven und negativen Fällen geprüft | Bestanden |
| Chomsky | G1–G5 und alle vorgesehenen ε-/Kontext-/Verkürzungs-/Einheitsregel-Sonderfälle unter erklärter Konvention | Bestanden |
| Vollständige Hierarchie | Die Übersicht enthält Typ 3, 2, 1, 0; Beispiele stimmen mit ihrer Typangabe überein; Sichtbarkeit im Lern-/Trainingsmodus geprüft | Bestanden, Fach- und Browserprüfung |
| Bäume | Frontierreihenfolge, Terminalblätter, ε, gewählte Ersetzungsstellen bei identischen Satzformen | Bestanden |
| Sprachvergleich | Gleichwertige EBNF akzeptieren; Unterschiede und fehlende Definitionen erklären; komplexe Rekursion offen lassen | Bestanden |
| Zeichenkontrolle | Sprachvergleich plus Nachweis einer grafischen Bearbeitung; eigene Zeichnungen mit verdeckter EBNF erstellt und abgegeben | Bestanden, Fach- und Browserprüfung |
| Freitext | Keine automatische Wortsuche-Benotung; Selbstpunkte getrennt und begrenzt; leere Antwort zählt nicht | Bestanden |
| Klausuren | Beide genau 40 BE, AFB I–III vorhanden, nur GK-bezogene Aufgaben gewählt | Bestanden |
| Klausurwertung | K1-Szenario: 29/34 automatisch und 1/6 selbst eingeschätzt; K2-Szenario: 9/30 automatisch und 0/10 selbst eingeschätzt | Bestanden, Fach- und Browserprüfung |
| Lernstand | JSON-Roundtrip, echter Export-/Importdownload, Reload, Abgaben und Kompetenzwerte; beschädigte Daten zurückweisen | Bestanden, Fach- und Browserprüfung |

Die fachlichen Musterbegründungen wurden zusätzlich gelesen und mit den formulierten Aufgabenbedingungen abgeglichen. Das ersetzt keine externe didaktische Begutachtung oder Lehrkraftkorrektur.

## Umgebung und reproduzierbare Ergebnisse

- Node.js v24.21.0 auf macOS (`darwin`).
- Installiertes Google Chrome 157.0.8103.40, gesteuert mit Playwright; Headless-Browser mit echten Klicks, Doppelklicks, Texteingaben, Tastaturaktionen, Downloads und Touchaktionen.
- Prüfung über einen temporären lokalen HTTP-Server und zusätzlich direkt über `file://` bei deaktiviertem Netzwerk.
- Desktop 1440 × 1000, iPad-Ansicht 820 × 1180, Smartphone 390 × 844. Touchbedienung zusätzlich in einem eigenen Browserkontext mit `hasTouch` und `isMobile` geprüft.

```sh
npm test
npm run test:browser
npm run test:academy
```

Browserabhängigkeit vorher bei Bedarf mit `npm ci` installieren. Der Testserver und die gestarteten Browser werden am Ende geschlossen.

Belege:

- [Aktuelle Fach-/Layout-/Inhaltstestergebnisse](test-results/core-results-v4.1.txt)
- [Browserergebnisse einschließlich Browser- und Node-Version](test-results/browser-results.json)
- [Vollständiger Trainings-Browserlauf: 22/22 bestanden](test-results/academy-browser-results.json)
- [Vollständige Chomsky-Hierarchie](test-results/chomsky-hierarchy.png)
- [Trainingsansicht Desktop](test-results/academy-desktop.png)
- [Grafischer Editor in der iPad-Touchansicht](test-results/academy-ipad.png)
- [Trainingsansicht Smartphone](test-results/academy-phone.png)
- [Im Browser exportierter Lernstand](test-results/lernstand-v4.1.json)
- [Desktopaufnahme](test-results/desktop.png)
- [iPad-Aufnahme](test-results/ipad.png)
- [Smartphoneaufnahme, erster Bildschirm](test-results/phone.png)
- [Geprüfter SVG-Export](test-results/export.svg)
- [Geprüfter PNG-Export](test-results/export.png)
- [Gespeicherte EBNF-Datei](test-results/saved.ebnf)

Die Bildschirmaufnahmen wurden zusätzlich visuell geprüft. Labor und Training haben in den geprüften Breiten keinen horizontalen Seitenüberlauf. Lange Diagramme und die Hauptnavigation scrollen innerhalb ihrer vorgesehenen Bereiche. Die Trainingsaufnahmen zeigen jeweils einen Bildschirm, die Laboraufnahmen teils die ganze Seite.

## Labor-Regressionsabdeckung der 20 bisherigen Fälle

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

Die ausgeführten Browserprüfungen erfolgten in Chrome. iPad-Ansicht und Touch wurden für Labor und Training emuliert; ein physisches iPad und Safari/Firefox/Windows wurden nicht separat geprüft. Das ist keine Behauptung einer Prüfung auf echter iPad-Hardware oder allen Betriebssystemen.

Die Diagrammtests prüfen Geometrie, Anschlüsse, Bypass/Rückweg und ausgewählte verschachtelte Darstellungen. Sie sind kein mathematischer Beweis, dass jede innerhalb der Größengrenzen mögliche Zeichnung in jedem Browser fehlerfrei gerastert wird.

Generierung, Beschreibung und komplexe Äquivalenzvergleiche haben die in [README.md](README.md) dokumentierten Grenzen. Ein offenes Analyseergebnis ist kein Fehler und kein Gleichwertigkeitsnachweis. Eine allgemeine automatische verständliche Beschreibung beliebiger kontextfreier Sprachen ist nicht implementiert.

V4.1 ist browsergeprüft auf [GitHub Pages](https://awettermann.github.io/Syntaxlabor/) veröffentlicht. Der Quellcode liegt in [AWettermann/Syntaxlabor](https://github.com/AWettermann/Syntaxlabor), Hauptzweig `main`. Der GitHub-Pages-Build war erfolgreich; die ausgelieferte HTML-Datei und alle elf JavaScript-/CSS-Ressourcen wurden bytegenau mit dem lokalen Stand abgeglichen. Alle 55 Repository-Dateien wurden zusätzlich anhand ihrer Git-Blob-Prüfsummen verifiziert. Der vorherige V4.0-Stand bleibt gesichert.
