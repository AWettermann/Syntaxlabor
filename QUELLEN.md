# Prüfungsbezug und fachliche Konventionen

Quellen geprüft am **17. November 2026**. Bezugsjahrgang ist das Landesabitur **2027**; der bereits veröffentlichte Erlass 2028 wurde zusätzlich abgeglichen. Die ursprünglichen Übungen sind selbst erstellt. Für die lokale Q3.1-Anpassung wurden die bereitgestellten Wikiseiten und Originalarbeitsblätter ergänzt; [Quellenabgleich und Originalkopien](Q31-ANPASSUNG.md). BE, AFB-Einschätzungen und Zeitvorschläge sind didaktische Setzungen der Anwendung.

## Offizielle hessische Grundlagen

1. **[KCGO Informatik, Ausgabe 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-03/kcgo_informatik.pdf), gedruckte Seite 40 / PDF-Seite 40, Q3.1.** Der GK-Kern umfasst reguläre und kontextfreie Grammatiken, Ableitungen, Ableitungsbäume, Syntaxdiagramme und die erzeugte Sprache. Die vollständige Chomsky-Hierarchie ist dem erhöhten Niveau zugeordnet. Auf ausdrücklichen Wunsch behandelt die App dennoch alle vier Typen als festen zusammenhängenden Lerninhalt. EBNF dient hier als präzise Schreibweise und Übungswerkzeug; eine bestimmte EBNF-Dialektdefinition wird durch die genannte Inhaltsliste nicht vorgegeben.

2. **[Abiturerlass Landesabitur 2027](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-07/abiturerlass_la_2027.pdf), Abschnitt III.27, gedruckte Seiten 122–123.** Informatik GK umfasst eine Pflichtaufgabe mit 50 BE und eine Wahlaufgabe mit 40 BE. Q3.1 ist ein Schwerpunkt neben weiteren Themen. Die App bildet weder die Algorithmik-Pflichtaufgabe noch alle anderen Prüfungsinhalte ab. Laut Abschnitt 27.4 werden keine Aufgabenvorschläge zur PC-Nutzung bereitgestellt; diese App ist ein Vorbereitungswerkzeug, kein zugelassenes Prüfungswerkzeug.

3. **[Änderungserlass vom 2. Februar 2026](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-02/la27_abiturerlass_aenderungserlass_.pdf).** Die beiden Änderungen betreffen nicht Abschnitt III.27 Informatik. Die fachliche Abgrenzung oben bleibt damit bestehen.

4. **[Abiturerlass Landesabitur 2028](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/abiturerlass_2028.pdf), Abschnitt III.27, gedruckte Seiten 123–124.** Der veröffentlichte Folgejahrgang bestätigt die hier relevante Einordnung von Q3.1 und die 50-/40-BE-Struktur. Daraus folgt keine vollständige Abiturabdeckung durch das Syntaxlabor.

5. **[Operatoren für Biologie, Chemie, Informatik, Mathematik und Physik, Landesabitur 2027](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-08/la27-operatoren-biologie-chemie-informatik-mathematik-physik.pdf), Stand 1. August 2026.** Die Zuordnung hängt vom Aufgabenkontext ab. Entwickeln und Begründen können II–III umfassen; Überprüfen ist nicht pauschal III. Die App ordnet AFB deshalb den einzelnen Teilaufgaben zu. Die Labels sind didaktische Einschätzungen für diese eigenen Aufgaben, keine amtliche Einstufung.

## Konsequenzen für den Aufgabenkatalog

| Bereich | Einordnung im Syntaxlabor |
| --- | --- |
| Modul 1: Alphabet, Wort, Sprache, Syntax/Semantik | Eigene Einstiegsaufgaben nach den Lernzielen; Wikiseite 1 fehlt noch |
| Modul 2: Bestandteile, Ableitungen, Bäume, L(G), BNF/EBNF, Syntaxdiagramme | GK-Kern und Werkzeugtraining; Wikiseite 2 und überarbeitetes Grammatik-Arbeitsblatt |
| Modul 3: vollständige Chomsky-Hierarchie und Grammatikanalyse | Typ 0/1 bleiben auf Wunsch fester Lerninhalt über den offiziellen GK-Kern hinaus; vollständige Quellenmaterialien einschließlich Transfer |
| Modul 4: komplexe EBNF und Syntaxdiagramme | Wikiseite 4 und vier EBNF-II-Übungen; sechs erhaltene eigene Anwendungskontexte als Zusatzübungen |
| K1/K2: je 40 BE und 100 Minuten Empfehlung | Eigene Q3-Übungsklausuren mit unveränderter Zusammenstellung, keine vollständigen Landesabitur-Simulationen |

Die beiden Q3-Klausuren konzentrieren sich auf Konstruktion und Analyse und enthalten überwiegend AFB II. Es wird weder eine offizielle AFB-Prozentverteilung noch eine amtliche Notenberechnung behauptet. Die BE-Verteilung steht vollständig im [Aufgabenraster](AUFGABENRASTER.md).

## Chomsky-Konventionen der App

Die Aufgaben verwenden eine ausdrücklich erklärte Produktionsform-Konvention:

- **Typ 3:** links genau ein Nichtterminal; die gesamte Grammatik einheitlich links- oder rechtslinear. Terminalwörter und Einheitsregeln sind zugelassen. ε ist nur als Startsymbolausnahme erlaubt, wenn das Startsymbol nirgends rechts steht.
- **Typ 2:** links genau ein Nichtterminal, rechts beliebige Symbolfolge, auch ε.
- **Typ 1:** nichtverkürzende Produktionen, gegebenenfalls mit derselben Startsymbolausnahme. Das ist die längenmonotone Definition; nicht jede einzelne Regel muss die engere kontexterhaltende Schreibform besitzen.
- **Typ 0:** nichtleere linke Seite mit mindestens einem Nichtterminal; rechts beliebige Folge einschließlich ε.

Die ε-Konvention für Typ 3 ist bewusst restriktiver als manche Definition verallgemeinerter regulärer Grammatiken. Unter einer Definition, die beliebige ε-Regeln in linearen Grammatiken erlaubt, würden einzelne Übungen B5/B6 anders nach ihrer Form eingeordnet. Deshalb wird die Konvention vor den Aufgaben offengelegt. Die Regularität ihrer **Sprachen** bleibt davon unberührt. Es gibt keinen allgemeingültigen Schluss von einer nicht regulären Form auf eine nicht reguläre Sprache.

Fachliche Abgleichquellen sind die [Vorlesung Formale Systeme, TU Dresden, 17.10.2024](https://iccl.inf.tu-dresden.de/w/images/2/2b/FS2024-Vorlesung-02.pdf), insbesondere die Unterscheidung zwischen Produktionsform und Sprachklasse sowie ε-Erweiterung, und das [Skript Reguläre Sprachen, Universität Hamburg](https://www.informatik.uni-hamburg.de/TGI/mitarbeiter/wimis/farwer/fernuni/typ3.pdf), Definitionen zu allgemeinen und verallgemeinerten rechtslinearen Grammatiken. Diese Hochschulquellen belegen auch, dass Definitionen und Normalformen ausdrücklich unterschieden werden müssen; sie sind keine zusätzlichen hessischen GK-Pflichtvorgaben.

## Grenzen der Bewertung

Automatische BE betreffen nur formal prüfbare Bestandteile. Offene Sprachvergleiche werden nicht als korrekt bestätigt. Fachliche Freitexte erhalten einen Erwartungshorizont und gesondert bezeichnete Selbstpunkte. Eine Lehrkraft kann diese anhand der Antworten überprüfen; die App ersetzt ihre Bewertung nicht.
