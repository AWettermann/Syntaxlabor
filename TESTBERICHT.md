# Syntaxlabor Q3.1 · Testbericht

Abschlussstand: **19. November 2026**. Die folgenden Fach- und Browserprüfungen betreffen den lokalen Vier-Modul-Stand. Dieser Stand wird nach ausdrücklicher Freigabe im bestehenden [GitHub-Repository](https://github.com/AWettermann/Syntaxlabor) veröffentlicht.

**102/102 Fach-, Layout- und Inhaltstests sowie 83/83 Browser-Prüfgruppen bestanden.** In allen abschließenden Browserläufen gab es keine JavaScript- oder Konsolenfehler.

| Lauf | Ergebnis | Rohprotokoll |
| --- | --- | --- |
| `npm test` | 102 bestanden, 0 fehlgeschlagen | [Fachtests](test-results/core-results-q31.txt) |
| `npm run test:browser` | 21/21 Prüfgruppen | [Freies Labor](test-results/browser-results.json) |
| `npm run test:academy` | 24/24 Prüfgruppen | [Trainings- und Klausurlauf](test-results/academy-browser-results.json) |
| `npm run test:wiki3` | 17/17 Prüfgruppen | [Chomsky, Intercity und LaTeX](test-results/wiki3-browser-results.json) |
| `npm run test:q31` | 21/21 Prüfgruppen | [Vier Module und neue Originalaufgaben](test-results/q31-browser-results.json) |

## Nachprüfung von Hilfen und Bearbeitungsstatus

Geöffnete Hilfestufen wurden nach Aufgabenwechsel, Reload und echtem Export/Import wiederhergestellt. Weitere Stufen bleiben zunächst geschlossen; vollständig geöffnete Hilfen bleiben vollständig sichtbar und der zugehörige Button deaktiviert. Im Training sind die gespeicherten Hilfen weiterhin verdeckt. Der Import begrenzt die Zähler, setzt die Kennzeichnung „mit Hilfe“ konsistent und übernimmt keine Hilfestufen in Klausurversuche. Alte Lernstände ohne Zähler bleiben nutzbar.

Neu geöffnete Aufgaben sowie ausschließlich betrachtete Hilfen bleiben „Noch offen“. Erst eine tatsächliche Antwortänderung erzeugt „In Bearbeitung“. Der Browserlauf prüft die sofortige Statusänderung und die Grundlagenfolge Begriffe → ε/∅ → Sprachbeschreibung → Syntax/Semantik.

## Fachliche Abnahme

| Bereich | Geprüftes Verhalten |
| --- | --- |
| Bestand und Quellen | Vier Lernmodule; alle 56 bisherigen IDs erhalten; insgesamt 74 Aufgaben und 283 Teile; alle zehn Grammatik- und vier EBNF-II-Aufgaben zugeordnet; Originalkopien anhand SHA-256 geprüft; fehlende Wikiseite 1 sichtbar gekennzeichnet |
| Notationen | BNF mit ::=; EBNF mit Kommas und Punktabschluss sowie Leerraum/Semikolon; zitierte Punkte, Kommas, Leerzeichen, Backslashes und Pfeile bleiben Terminale; Parserfehler und Zwischenstände bleiben nachvollziehbar |
| Ableitungen | Einzelne Schritte, Links-/Rechtsableitungen, eigene vollständige Ketten, verschiedene selbst gewählte Wörter, eigene Grammatik als Regelgrundlage, ε, ungültige Sprünge und konsistente Zielwörter |
| Sackgassen | Gültige begonnene Zweige und genaue Zielunerreichbarkeit ab der letzten Satzform; erreichbare oder regelwidrige Zweige zurückweisen |
| Grammatikbestandteile | Terminale, Nichtterminale, Startsymbol und Produktionen; alternative Bezeichnungen und Regelreihenfolgen; konsistente Umbenennung |
| Chomsky | Alle vier Typen; ε-Konvention; links-/rechtslineare und gemischt lineare Formen; verkürzende und kontextabhängige Regeln; unerreichbare Regeln zählen zur Form; Sprachklasse separat begründen |
| Vollständiger Typ 1 | Kontextgrammatik für aⁿbⁿcⁿ aus Wikiseite 3 und vollständige Ableitung von aabbcc einschließlich CB → BC und Terminalkontexten |
| Sprachvergleich | Exakter Strukturbeweis auch für rekursive EBNF; exakter Automatenvergleich geeigneter Alternativen; echte Gegenbeispiele; andere Rekursion ausdrücklich offen statt unbewiesen richtig |
| Original-Wortdiagramm | Alle Wörter über a,b,c,x bis Länge 6 gegen unabhängig festgelegten regulären Ausdruck geprüft; Lesekonvention zur uneinheitlichen Formgebung ausdrücklich dokumentiert |
| Sprachbeschreibungen | Mindestens ein abc; keine Folge aaa; Zahlengrenzen; bitweise gekoppelte Anzahlen; Dateinamen mit exakt drei Erweiterungszeichen |
| EBNF-II 1 | Originale Satz/Wortgruppe/Adjektiv; führendes Komma ist im ursprünglichen Pfad möglich, in der zusätzlich bereinigten Regel ausgeschlossen |
| EBNF-II 2 | Nichtleere Terme; Operator und folgende Zahl gemeinsam wiederholen; keine leeren Operanden oder alleinigen Operatoren; nur gekennzeichneter Zahl-Platzhalter |
| EBNF-II 3 | Alle Tag-/Monatswerte und vier Trennerkombinationen; feste Stellenzahlen; keine zusätzliche Kalenderprüfung; mehrstellige führende Nullen ausgeschlossen; zwei deklarierte Jahr-0-Lesarten akzeptiert |
| E-Mail | Alle drei Adressformen, Gruppen auch ohne Inhalt, nichtleere Text-/Wortteile, echte Leerzeichen und Kommas, ASCII-Zeichenmengen, Domain-/Namensstruktur und beide Originaladresslisten |
| E-Mail-Ableitung | Vollständige Betty-H-Ableitung; nur Wort und Text dürfen als nach ihren Regeln gültige Blöcke ersetzt werden; pauschale Gesamtwortsprünge und unzulässige Zeichen zurückweisen |
| LaTeX | Natürliche Zahlen einschließlich 0, keine führenden Nullen, positive Nenner, nichtleere Listen, mehrere Elemente, beliebige endliche Schachtelung, eigene Grammatik und Ableitungsreihenfolgen; Leerraumregel auf die Aufgabe begrenzt |
| Wahlmöglichkeiten | Aufgabe 10 A/B zählt einmal im Fortschritt; beim Datum EBNF oder Zeichnung genügt und wird nicht doppelt verlangt; unveränderte Klausur-Maxima |
| Freitext | Keine Schlüsselwortbenotung; Musterlösungen und konkrete Kriterien; begrenzte, getrennte Selbstpunkte; keine Selbstpunkte für leere Antworten |
| Lernstände | Alte IDs und ältere Ableitungspfeile lesbar; neue Antworten, Startsymbole, Zeichnungen und Macro-Ableitungen über Export/Import und Reload erhalten; beschädigte Daten zurückweisen |

Sämtliche **33 Wortentscheidungs-Teilaufgaben** werden zusätzlich gegen separat festgelegte Zugehörigkeitslisten geprüft. Die zwei Klausuren behalten ihre ursprüngliche Zusammenstellung und jeweils 40 BE. Beide umfassen weiterhin AFB I–III.

## Browserabnahme

Der Trainingslauf hat alle 74 Aufgaben mit sämtlichen Arbeitsformaten gerendert. Alte und neue Editoren verwenden denselben Labor-Arbeitsbereich; der freie Entwurf wird beim Aufgabenwechsel nicht überschrieben. Grafische Zeichnung, Texteingabe, Auswahl, Baumaufbau, Rücknahme, Referenzen, Umbenennungen, Roundtrips und echte SVG-/PNG-/Text-/JSON-Downloads wurden geprüft.

Der neue Vier-Modul-Lauf hat insbesondere geprüft:

- Einstiegskarten und vier klar bezeichnete Module; Quellenlücke in Modul 1 und lokal erreichbare Originaldateien.
- Wortzugehörigkeit, Syntax/Semantik, passende schrittweise Hilfen, Fortschrittsanzeige und Vor-/Zurück-Navigation.
- Stabile alte Aufgabenstände, BNF, Komma-/Punkt-EBNF, selbst gewählte Mehrfachableitungen und eigene umbenannte Grammatiken.
- Gliederung langer Aufgaben; alle Quellenbilder; Originaldiagramm-Randfälle; tatsächliche 125-Prozent-Vergrößerung eines SVG-Bausteins.
- Einen Term vollständig durch reale Aktionen im grafischen Editor erstellt und korrekt bewertet; große vorbereitete Hilfsdiagramme aufklappbar und nach Aufgabenwechsel erhalten.
- Gemischte Datumstrenner, Wortentscheidungen, Jahr-0-Erklärung und korrekte einmalige Wahlwertung.
- E-Mail-Material, strukturierte Gesamtgrammatik, geprüfte Wort-/Textschritte, automatische und manuelle Ergebnisse getrennt.
- Veraltete Bewertungen nach Änderungen sichtbar entwertet; geänderte Trainingsantworten verlangen eine neue Abgabe.
- Neue Antworten und Startsymbole nach Reload sowie echtem Export-/Importdownload erhalten.

Im separaten Chomsky-/LaTeX-Lauf bleiben sämtliche 17 Prüfgruppen erfolgreich. Beide Klausuren wurden im bestehenden Trainingslauf gestartet, bearbeitet und abgegeben. Antworten bleiben während einer laufenden Klausur bei Reload erhalten; freie Lernhilfen und Navigation sind gesperrt, nach Abgabe sind die Antworten schreibgeschützt. Automatische, offene und selbst eingeschätzte BE bleiben getrennt. K1-Szenario: 29/34 automatisch sowie 1/6 selbst eingeschätzt; K2-Szenario: 9/30 automatisch sowie 0/10 selbst eingeschätzt. Ein neuer Versuch erhält die vorherige Ergebnisübersicht.

## Bildschirmgrößen und Umgebung

Node.js v24.21.0 auf macOS; Google Chrome 157.0.8103.40, über Playwright gesteuert. Die Tests verwenden temporäre lokale Server beziehungsweise direkt `file://` und schließen Browser und Server am Ende. Es werden keine App-Laufzeitabhängigkeiten aus dem Netz geladen.

Desktop 1440 × 1000; iPad-Simulation mit Touch bei 820 × 1180 und 1180 × 820; zusätzlich 390 Pixel Breite. Alle geprüften Ansichten ohne Seitenüberlauf. Die Bildschirmaufnahmen wurden visuell kontrolliert; lange Diagramme und vergrößerte Originalbilder werden innerhalb ihrer Bereiche verschoben.

- [Einstieg und unverändertes freies Labor](test-results/q31-lernweg-desktop.png)
- [Datum und Rückmeldungen](test-results/q31-datum-desktop.png)
- [E-Mail-Aufgabe](test-results/q31-email-desktop.png)
- [iPad Hochformat](test-results/q31-ipad-820.png)
- [iPad Querformat](test-results/q31-ipad-1180.png)
- [Schmale Ansicht](test-results/q31-phone.png)
- [Exportierter neuer Lernstand](test-results/q31-lernstand.json)

Die Touch-Prüfung ist eine Chrome-Simulation; ein physisches iPad mit Safari sowie Firefox/Windows wurden nicht separat abgenommen. Bei nicht unterstützten rekursiven Umformungen bleibt die Sprachgleichheit fachlich offen. Wikiseite 1 fehlt für einen vollständigen Originalquellenabgleich; die eigenen Einstiegsaufgaben sind entsprechend gekennzeichnet.

## Wiederholen und Dokumentation

```sh
npm test
npm run test:browser
npm run test:academy
npm run test:wiki3
npm run test:q31
node scripts/content-docs.cjs
```

Playwright ist nur Entwicklungsabhängigkeit. Bei Bedarf vorher `npm ci`; auf anderen Systemen `CHROME_PATH` auf die Chrome-/Chromium-Datei setzen. Produktbetrieb benötigt weder Build noch Installation.

[Aufgabenübersicht je Modul](LERNPFAD.md), [vollständiges Kompetenzraster](AUFGABENRASTER.md), [Änderungen, Quellen und offene Randfragen](Q31-ANPASSUNG.md).
