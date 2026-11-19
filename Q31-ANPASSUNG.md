# Syntaxlabor · Anpassung an die vier Wikiseiten Q3.1

Stand: 19. November 2026. Veröffentlichung nach ausdrücklicher Freigabe im bestehenden [GitHub-Repository](https://github.com/AWettermann/Syntaxlabor) und über dessen [GitHub-Pages-Seite](https://awettermann.github.io/Syntaxlabor/). Die bestehende Anwendung wurde erweitert, keine zweite App erstellt.

## Quellenabgleich

Die sechs eingefügten Auftragstexte sind identisch. Folgende sechs Unterrichtsdateien wurden vollständig gelesen, die eingebetteten Diagramme zusätzlich visuell geprüft und unverändert lokal erhalten:

| Grundlage | Lokale Originalkopie | Verwendung |
| --- | --- | --- |
| Wikiseite 2, 7 Seiten | [wiki2.pdf](materials/q31/wiki2.pdf) | Grammatikbestandteile, Ableitungen, Bäume, BNF, EBNF und Analyseverfahren |
| Überarbeitetes Grammatik-Arbeitsblatt | [grammatiken.docx](materials/q31/grammatiken.docx) | Alle zehn Aufgaben; Aufgaben 1 und 2 wegen gleicher Grammatik gebündelt |
| Wikiseite 3, 9 Seiten | [wiki3.pdf](materials/q31/wiki3.pdf) | Vollständige Hierarchie, Kontextregeln, Analyse, Korrektheit und Vollständigkeit |
| Korrigiertes Chomsky-Arbeitsblatt | [arbeitsblatt.docx](materials/wiki3/arbeitsblatt.docx) | Identisch mit der bereits integrierten Fassung; alle Aufgaben und Materialien erhalten |
| Wikiseite 4, 5 Seiten | [wiki4.pdf](materials/q31/wiki4.pdf) | Komplexe Diagramme, Zahlenbereiche, Stellenzahlen, führende Nullen, E-Mail-Analyse |
| Syntaxdiagramme und EBNF-II | [ebnf2.docx](materials/q31/ebnf2.docx) | Die vier Übungen mit sämtlichen Originaldiagrammen und E-Mail-Materialien |

Die Dateihashes stehen in [sources.json](materials/q31/sources.json). Arbeitsaufträge innerhalb der Unterrichtsdokumente richten sich an die Lernenden. Die Binärdarstellungsaufgabe zu −114 wurde nicht in den Aufgabenkatalog übernommen; die herunterladbare Originaldatei bleibt unverändert.

**Wikiseite 1 fehlt.** Sie ist weder mitgeliefert noch im Projekt vorhanden und wurde angefragt. Modul 1 enthält ausdrücklich als eigene Einstiegsaufgaben gekennzeichnete Aufgaben zu den Lernzielen des Auftrags. Eine vollständige fachliche Übereinstimmung mit der nicht vorliegenden Originalseite wird nicht behauptet. Quellenlücke und vorläufiger Abgleich sind auch in der Oberfläche sichtbar.

## Lernmodule und Aufgaben

| Modul | Lernpfad | Weitere erhaltene Übungen | Gesamt |
| --- | --- | --- | --- |
| 1 · Formale Sprachen verstehen | F1–F4: Begriffe, Sprachbeschreibung, Syntax/Semantik, ε und ∅ | Keine | 4 |
| 2 · Grammatiken und Darstellungsformen | A1 bündelt Originalaufgaben 1–2; A2 entspricht Aufgabe 3; G4–G9, G10A/G10B sowie G11 zu BNF/EBNF | 30 bisherige Aufgaben zu Ableitungen, Bäumen, EBNF und Diagrammen | 41 |
| 3 · Chomsky-Hierarchie und Grammatikanalyse | W0, B1, B4, B7, B13, B8, W1–W5; einschließlich vollständiger Kontextgrammatik, Intercity und LaTeX | Acht weitere Hierarchieübungen | 19 |
| 4 · Komplexe Anwendungen | H1 Diagramme → EBNF; H2 Term → Diagramm; H3 Datum; H4 E-Mail-Adresslisten | Sechs bisherige Anwendungskontexte E1–E6 | 10 |

Gesamt: **74 Aufgaben mit 283 Teilaufgaben**. Alle 56 bisherigen Aufgabenblöcke bleiben unter ihren IDs erhalten. Die sechs freien Kurzübungen und die zwei bisherigen Klausuren mit jeweils 40 BE sind weiterhin verfügbar. Die vollständige [Aufgabenübersicht je Modul](LERNPFAD.md) und das [Teilaufgaben-/Kompetenzraster](AUFGABENRASTER.md) werden aus denselben Quelldaten wie die App erzeugt.

Die Lernpfade enthalten 30 sichtbare Aufgabeneinträge. Da G10A und G10B alternative Wege derselben Aufgabe sind, entsprechen sie zusammen 29 Lernschritten. Beide Wege sind bearbeitbar; einer genügt für diesen Fortschrittsschritt. Beim Datum genügt EBNF **oder** Diagramm; die Modellierung wird höchstens einmal mit 7 BE gewertet. Aufgabe H3 hat einschließlich Wortprüfung und Begründung maximal 15 BE.

Passende bisherige Aufgaben werden als weitere Übungen aufklappbar angeboten. Dadurch entstehen keine zusätzlichen konkurrierenden Lernmodule. Die Vorgänger-IDs bleiben für Lernstände und Klausuren stabil. Der freie Laborentwurf bleibt getrennt gespeichert.

## Nachprüfung des Lernflusses

Modul 1 folgt jetzt der Reihenfolge Begriffe → leeres Wort/leere Sprache → Sprachbeschreibung → Syntax und Semantik. Die bestehenden IDs F1, F4, F2 und F3 bleiben erhalten, damit vorhandene Antworten derselben Aufgabe zugeordnet bleiben.

Geöffnete Hilfestufen werden pro Aufgabe gespeichert. Beim Wechsel, nach Neuladen und nach Export/Import werden ausschließlich bereits geöffnete Stufen wieder angezeigt; weitere Stufen bleiben hinter dem nächsten Hilfebutton. Der Trainings- und Klausurmodus zeigt die Hilfen weiterhin nicht an. Alte Lernstände ohne diese Zusatzinformation bleiben gültig; eine frühere Hilfenutzung bleibt gekennzeichnet. Importierte Hilfenzähler werden auf gültige Stufen begrenzt.

Neu geöffnete Aufgaben erhalten zunächst den Status „Noch offen“. Erst eine tatsächliche Antwortänderung, eine Regelanwendung im Baum oder eine Editoränderung führt zu „In Bearbeitung“. Das bloße Lesen oder Anzeigen einer Hilfe zählt nicht als Antwortbearbeitung. Bereits vorhandene Bearbeitungszeitstempel werden nicht rückwirkend gelöscht.

## Fachliche Überarbeitungen und geklärte Randfragen

1. **Notation:** Die Komma-/Punktnotation der Wikiseiten und die Leerraum-/Semikolonnotation des bisherigen Labors werden beide akzeptiert. Formatierung bleibt einheitlich mit Leerraum und Semikolon. Zitierte Punkte, Kommas und Leerzeichen bleiben echte Terminalzeichen. BNF mit `::=` wird unterstützt; Ableitungsschritte verwenden weiterhin `->`.
2. **Vollständige Originalaufgaben:** Ergänzt wurden insbesondere die vier Sprachbeschreibungen des Grammatik-Arbeitsblatts, dessen ursprüngliches Wort-Diagramm, die Dateinamen mit genau drei Erweiterungszeichen, beide Bitsprachen und die Abschlusskonstruktion. Bereits passende Aufgaben wurden ergänzt und zugeordnet statt durch eine zweite Fassung ersetzt.
3. **Grammatikform und Sprachklasse:** Die Klassifikation bezieht sich weiterhin auf alle Produktionsregeln der gegebenen Grammatik. Die engste Sprachklasse benötigt ein gesondertes Argument. Die neue Typ-1-Aufgabe B13 übernimmt die vollständige Kontextgrammatik für drei gekoppelte Anzahlen aus Wikiseite 3. Intercity enthält zusätzlich einen getrennten Korrektheits- und Vollständigkeitsnachweis.
4. **Ursprüngliches Wort-Diagramm:** Rechtecke und Kreise für a,b,c,x werden in der Quelle uneinheitlich verwendet, ohne zusätzliche Regeln anzugeben. Die App benennt die Lesekonvention ausdrücklich: Alle vier Beschriftungen sind hier Terminalzeichen. Das Original bleibt sichtbar; die skalierbare Fassung verwendet einheitliche Terminalformen. Die resultierende Sprache wird unabhängig gegen `^[ab]a*x?(?:b*a|c)$` geprüft.
5. **Wortgruppe-Diagramm:** Der obere Umgehungsweg erreicht den Komma-Rückweg auch ohne erstes Adjektiv. Die originalgetreue Übersetzung erlaubt deshalb beispielsweise `,schwarzeKatzen`. Die App verschweigt diese Eigenschaft nicht. Eine als Zusatzaufgabe gekennzeichnete bereinigte Fassung verhindert führende und abschließende Kommas. Zusätzliche Wortzwischenräume werden nicht als vermeintliche Originalterminale erfunden.
6. **Term:** Zahl ist im Original nicht weiter definiert. Die App setzt für den formalen Vergleich den ausdrücklich gekennzeichneten symbolischen Platzhalter `Zahl = "z";` ein. Bewertet wird der Aufbau aus erster Zahl und gemeinsam wiederholtem Operator/Zahl-Block; es wird kein zusätzlicher Zahlenbereich als Originalvorgabe ausgegeben.
7. **Datum:** Tag 01–31 und Monat 01–12 sind exakt zweistellig; beide Trenner werden unabhängig gewählt. `31-02-956` und `13.11-12554` sind daher zulässig. Eine Kalenderprüfung wird nicht ergänzt. Die Vorlage klärt das einstellige Jahr 0 nicht ausdrücklich; die automatische Prüfung akzeptiert beide gekennzeichneten Lesarten. Mehrstellige führende Nullen bleiben in beiden Fällen unzulässig.
8. **E-Mail:** Bewertet werden allein die vereinfachten Materialregeln. Komma plus Leerzeichen, Winkelklammern, nichtleere Wort-/Textteile, der ASCII-Buchstabenbereich und die Punktstruktur von Name/Domain werden berücksichtigt. Die erste Originaladressliste ist gültig; die zweite scheitert unter anderem an den fehlenden Winkelklammern nach `"Gut!"`. Außerdem liegt ü außerhalb der vorgegebenen Zeichenmenge. Die App behauptet weder vollständige RFC-Konformität noch die Existenz einer Adresse.
9. **Bearbeitungsstand:** Nach Änderungen an einer bereits geprüften Antwort wird die frühere Bewertung ausdrücklich als veraltet markiert. Auch ein Wechsel vom Lernen zurück zum Training verlangt für geänderte Antworten wieder eine neue Abgabe. Das verhindert eine Erfolgsmeldung zu einem überholten Arbeitsstand.
10. **Darstellung:** Die Lernmodule erscheinen als vier Einstiegskarten und in der Navigation. Lange Aufgaben sind in Abschnitte gegliedert; große vorbereitete Hilfsdiagramme sind aufklappbar. Originalbilder und skalierbare Diagramme bieten Zoom und Verschieben. Beim SVG-Zoom werden beide Abmessungen skaliert; ein Browsertest prüft die tatsächliche Vergrößerung eines Bausteins. Technische Eingaben schalten automatische Großschreibung und Autokorrektur ab.

Die Randfrage zum Jahr 0, die uneinheitlichen Formen des Wort-Diagramms und die Definition von Zahl im Term sollten bei einer zukünftigen Überarbeitung der Originalvorlagen präzisiert werden. Die App macht ihre Lesarten bereits jetzt nachvollziehbar.

## Auswertung und Alternativlösungen

Es werden keine Mustertexte als alleiniger Bewertungsmaßstab verwendet:

- Einzelne und mehrere selbst gewählte Ableitungen werden regelweise geprüft. Mehrfachableitungen müssen verschiedene vollständige Wörter ergeben. Bei der eigenen Abschlussgrammatik müssen diese Wörter zusätzlich zur geforderten Sprache gehören.
- Die E-Mail-Aufgabe erlaubt Wort und Text am Stück. Diese Blöcke werden anhand ihrer eigenen Materialproduktionen geprüft; ein pauschaler Sprung vom Startsymbol zur fertigen Liste wird nicht akzeptiert. Andere zulässige Ableitungsreihenfolgen sind möglich.
- Parsebäume von EBNF werden auf nachgewiesene Strukturgleichheit unter konsistenter Umbenennung der erreichbaren Nichtterminale und anderer Regelreihenfolge geprüft. Das ist auch bei Rekursion ein echter Gleichwertigkeitsbeweis. Unterschiedliche Schreibweisen mit gleicher geparster Struktur bleiben gleichwertig.
- Wo möglich, folgt zusätzlich der exakte Automatenvergleich, etwa bei Zahlenbereichen und anders gruppierter regulärer EBNF. Abweichungen werden durch echte Gegenbeispiele erklärt. Bei mehreren zulässigen Datumslesarten genügt Gleichwertigkeit mit einer davon.
- Andere rekursive Grammatikvergleiche bleiben ohne Beweis ausdrücklich fachlich offen. Begrenzte Worttests sind kein vollständiger Korrektheitsnachweis. Musterlösungen und Prüfaspekte unterstützen die Selbstkontrolle.
- Freitext bleibt manuell: fachliche Kriterien, getrennte Selbstpunkte und keine Schlüsselwortbenotung. Die BE und AFB sind didaktische Einschätzungen dieser Lernanwendung, keine amtlichen Bewertungen.

Automatisch vollständig prüfbar sind die geschlossenen Entscheidungen, Grammatikbestandteile, formal zulässigen Klassifikationen, Wortentscheidungen und Ableitungen. Bei selbst entwickelten Grammatiken sowie EBNF/Diagrammen wird Gleichwertigkeit nur mit einem belastbaren Beweis bestätigt. Sprachbeschreibungen, Begründungen, Korrektheits-/Vollständigkeitsargumente und nicht automatisch nachweisbare Alternativkonstruktionen benötigen Selbstkontrolle beziehungsweise eine Lehrkraft.

## Architektur und Prüfung

Die bestehende statische HTML-/JavaScript-Anwendung und ihr gemeinsamer Editor bleiben erhalten. `q31.js` ordnet den Katalog den vier Modulen zu und ergänzt die Quellenaufgaben. `q31-engine.js` ergänzt Mehrfachableitungen und die materialgetreuen E-Mail-Blockschritte. `core.js`, `formal.js`, `assessment.js`, `academy.js` und `app.js` wurden gezielt erweitert. Produktionsformanalyse, Earley-Wortprüfung, Diagrammrenderer, grafischer Editor, Undo/Redo, Im-/Export, lokale Speicherung, Lern-/Trainingsmodus und beide Klausuren bleiben nutzbar.

```sh
npm test
npm run test:browser
npm run test:academy
npm run test:wiki3
npm run test:q31
node scripts/content-docs.cjs
```

Die Prüfungen decken positive und negative Lösungen, unterschiedliche Namen und Notationen, alternative Ableitungen, Randwerte, Gegenbeispiele, bewusst offene Ergebnisse, Quellenabdeckung, unveränderte Altdaten, Wahlwertungen und die Darstellung ab. Desktop, iPad-Hoch-/Querformat mit Touchsimulation, schmale Ansicht sowie direkter Offline-Aufruf werden im Browser geprüft. Die iPad-Prüfung ist eine Chrome-Simulation; eine Abnahme auf physischem iPad/Safari wird nicht behauptet.

Abschließende Ergebnisse und Rohprotokolle: [TESTBERICHT.md](TESTBERICHT.md). Es fehlen weiterhin nur der Originalquellenabgleich für Wikiseite 1 und gegebenenfalls eine redaktionelle Entscheidung zu den ausdrücklich benannten Randfragen der Vorlagen.
