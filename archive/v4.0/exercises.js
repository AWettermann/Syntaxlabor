(function (scope) {
  'use strict';
  const exercises = [
    {title: 'Anfang, Wahl und Ende', task: 'Ein Wort beginnt mit a, darf danach genau ein b enthalten und endet mit c.', answer: 'wort = "a" ["b"] "c";', hint: 'Ein optionaler Baustein darf übersprungen werden.', starter: 'wort = ε;'},
    {title: 'Zahlen aus drei Ziffern', task: 'Eine Zahl besteht aus mindestens einer Ziffer. Erlaubt sind nur 0, 1 und 2. Verwende auch eine Regel ziffer.', answer: 'zahl = ziffer {ziffer};\nziffer = "0" | "1" | "2";', hint: 'Die erste Ziffer ist verpflichtend. Danach dürfen beliebig viele weitere folgen.', starter: 'zahl = ε;\nziffer = ε;'},
    {title: 'Zwei Wege', task: 'Erlaubt sind entweder genau x oder ein y, auf das beliebig viele z folgen.', answer: 'ausdruck = "x" | "y" {"z"};', hint: 'Die Wiederholung gehört nur zum Zweig mit y.', starter: 'ausdruck = ε;'},
    {title: 'Ein a, viele b', task: 'Erzeuge alle Wörter, die aus genau einem a und anschließend beliebig vielen b bestehen.', answer: 'wort = "a" {"b"};', hint: 'Auch das Wort a muss möglich sein.', starter: 'wort = ε;'},
    {title: 'Auch nichts ist ein Wort', task: 'Erlaubt sind das leere Wort sowie beliebig viele aufeinanderfolgende ab-Blöcke.', answer: 'wort = {"a" "b"};', hint: 'Die gesamte Folge ab wird wiederholt.', starter: 'wort = ε;'},
    {title: 'Gleich viele a und b', task: 'Erzeuge aⁿbⁿ mit n ≥ 0: erst n-mal a, danach genauso oft b. Verwende eine rekursive Regel.', answer: 'wort = ε | "a" wort "b";', hint: 'Jeder Rekursionsschritt fügt außen ein a und ein b hinzu. Die Abbruchregel erzeugt ε.', starter: 'wort = ε;'}
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = exercises;
  else scope.SyntaxExercises = exercises;
})(typeof globalThis !== 'undefined' ? globalThis : this);
