/* V4.1 training controller. Reuses the V4 graphical workbench in each part.
   Local exam mode is pedagogical answer hiding, not a secure proctoring system. */
(function () {
  'use strict';
  const A = window.SyntaxCurriculum, C = window.SyntaxCore, F = window.SyntaxFormal, Q = window.SyntaxAssessment, R = window.SyntaxRenderer, Lab = window.SyntaxLab;
  const $ = id => document.getElementById(id), storageKey = 'syntaxlabor-v41-progress';
  const blank = () => ({version: '4.1', attempts: {}, exams: {}, ratings: {}, mode: 'learn'});
  let progress = blank(), view = 'labor', moduleID = 'M2', taskID = 'A1', examID = null, activePart = null, freeSnapshot = Lab.capture(), saveTimer, modelVisible = false;
  const sessions = new Map(), sectionStates = new Map();
  function node(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'text') el.textContent = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === 'class') el.className = value;
      else if (key === 'hidden') el.hidden = value;
      else el.setAttribute(key, value);
    }
    for (const child of children.flat()) if (child !== null && child !== undefined) el.append(typeof child === 'string' ? document.createTextNode(child) : child);
    return el;
  }
  function message(text, error = false) { $('academy-status').hidden = !text; $('academy-status').textContent = text; $('academy-status').className = error ? 'status error' : 'status'; }
  try { const raw = localStorage.getItem(storageKey); if (raw) progress = Q.cleanProgress(JSON.parse(raw), A); } catch (_) { message('Der gespeicherte Lernstand konnte nicht geladen werden. Der freie Laborentwurf bleibt erhalten.', true); }
  function saveNow() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); $('savestate').textContent = 'Laborentwurf und Lernfortschritt werden getrennt lokal gespeichert.'; }
    catch (_) { message('Lernfortschritt konnte nicht lokal gespeichert werden. Sichere ihn über „Lernfortschritt → Exportieren“.', true); }
  }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 150); }
  const keyFor = id => examID ? `${examID}:${id}` : id;
  function attempt(id = taskID) {
    const key = keyFor(id);
    if (!progress.attempts[key]) progress.attempts[key] = {answers: {}, checked: false, submitted: false, assisted: false, hintCount: 0, updated: 0};
    return progress.attempts[key];
  }
  function task() {
    const t = A.tasks.find(t => t.id === taskID);
    if (!examID) return t;
    const block = A.exams.find(e => e.id === examID).parts.find(b => b.task === taskID);
    return {...t, parts: t.parts.filter(p => block.ids.includes(p.id))};
  }
  const runningExam = () => A.exams.find(e => progress.exams[e.id]?.started && !progress.exams[e.id]?.submitted);
  function locked() { return examID ? !!progress.exams[examID]?.submitted : progress.mode === 'train' && attempt().submitted; }
  function revealed() { return examID ? !!progress.exams[examID]?.submitted : progress.mode === 'train' ? attempt().submitted : attempt().checked || attempt().submitted || modelVisible; }
  function draft(part) { const a = attempt(); if (!a.answers[part.id]) a.answers[part.id] = {}; return a.answers[part.id]; }
  function invalidate(a) {
    if (locked()) return;
    const wasChecked = a.checked || a.submitted;
    if (wasChecked) a.assisted = true;
    a.checked = false; if (!examID) a.submitted = false;
    const feedback = document.querySelectorAll('#task-content .part-feedback');
    feedback.forEach(box => {
      const horizon = box.querySelector('.expectation'); box.className = 'part-feedback stale';
      box.replaceChildren(node('strong', {text: 'Arbeitsstand geändert – bitte erneut prüfen.'})); if (horizon) box.append(horizon);
    });
    const total = $('task-total'); if (total) total.textContent = feedback.length || wasChecked ? 'Arbeitsstand geändert. Prüfe die Antworten erneut; die frühere Bewertung gilt nicht für diesen Stand.' : 'Antwort gespeichert. Prüfe deine Ergebnisse nach der Bearbeitung.';
    if (wasChecked) renderList();
  }
  function touch(a) {
    const firstEdit = !a.updated; a.updated = Date.now(); invalidate(a);
    if (firstEdit) renderList(); save();
  }
  function record(part, field, value) { const a = draft(part); a[field] = ['derive', 'dead-derive', 'own-derive', 'derivations', 'chunk-derive'].includes(part.kind) && field === 'text' ? F.normalizeDerivation(value) : value; touch(attempt()); }
  function park() {
    if (activePart) {
      const current = Lab.value(), snapshot = Lab.capture(); sessions.set(activePart.key, snapshot);
      activePart.answer.workspace = current; activePart = null; save();
    }
    $('lab-home').append($('lab-workspace'));
  }
  window.addEventListener('syntaxlab:change', event => {
    if (!activePart || event.detail.origin === 'load') return;
    activePart.answer.workspace = event.detail.workspace;
    if (event.detail.origin === 'graphic') activePart.answer.edits = (activePart.answer.edits || 0) + 1;
    const a = progress.attempts[activePart.attemptKey]; touch(a);
    const badge = document.getElementById('workspace-save-' + activePart.partID); if (badge) badge.textContent = 'Eigener Arbeitsstand gespeichert';
  });
  function initialWorkspace(part) {
    const target = C.parse(part.answer).rules;
    const empty = target.length ? `${target[0].name} = ε;` : '';
    const source = part.starter ?? empty;
    let validText = source; try { C.parse(source); } catch (_) { validText = empty; }
    return {text: source, validText, start: target[0]?.name || ''};
  }
  function openWorkspace(part, host) {
    park(); const answer = draft(part), attemptKey = keyFor(taskID), key = attemptKey + ':' + part.id;
    if (!answer.workspace) answer.workspace = initialWorkspace(part);
    activePart = {answer, key, attemptKey, partID: part.id};
    host.append($('lab-workspace'));
    Lab.load(sessions.get(key) || answer.workspace, {training: true, foldRules: part.foldRules || [], hideText: part.kind === 'draw' && !revealed(), hideDiagram: part.kind === 'ebnf' && (!!examID || progress.mode === 'train') && !revealed(), locked: locked()});
    host.scrollIntoView({block: 'nearest', behavior: 'instant'}); save();
  }
  function navState(current) {
    const running = runningExam();
    document.querySelectorAll('#primary-nav button').forEach(b => {
      if (b.dataset.view === current) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      b.disabled = !!running && b.dataset.view !== 'exam';
    });
    $('curriculum-note').hidden = !!running;
  }
  function showPage(id) { document.querySelectorAll('[data-page]').forEach(p => { p.hidden = p.id !== id; }); }
  function leave() { if (view === 'labor') freeSnapshot = Lab.capture(); park(); message(''); }
  function go(next) {
    const alias = A.legacyViews?.[next]; if (alias) next = alias.module;
    const running = runningExam();
    if (running && next !== 'exam') { message('Die Klausur läuft. Gib sie zuerst ab, um die freien Lernhilfen wieder zu öffnen.'); return; }
    leave(); modelVisible = false;
    if (next === 'labor') {
      examID = null; view = 'labor'; showPage('lab-view'); Lab.load(freeSnapshot); navState(next); renderLearningPath();
    } else if (next === 'progress') {
      examID = null; view = next; showPage('progress-view'); navState(next); renderProgress();
    } else if (next === 'exam') {
      view = next; showPage('exam-view'); navState(next);
      if (running) { examID = running.id; taskID = running.parts[0].task; renderModule(); } else { examID = null; renderExams(); }
    } else {
      examID = null; view = next; moduleID = next; taskID = alias?.start || A.modules.find(m => m.id === next).main[0];
      renderModule(); navState(next);
    }
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  document.querySelectorAll('#primary-nav button').forEach(b => b.onclick = () => go(b.dataset.view));
  function modeButtons() {
    $('learn-mode').setAttribute('aria-pressed', String(progress.mode === 'learn'));
    $('train-mode').setAttribute('aria-pressed', String(progress.mode === 'train'));
  }
  function setMode(mode) { park(); if (attempt().checked) attempt().assisted = true; progress.mode = mode; modelVisible = false; save(); renderModule(); }
  $('learn-mode').onclick = () => setMode('learn'); $('train-mode').onclick = () => setMode('train');
  function moduleTasks() {
    if (examID) return A.exams.find(e => e.id === examID).parts.map(b => A.tasks.find(t => t.id === b.task));
    const m = A.modules.find(m => m.id === moduleID), all = A.tasks.filter(t => t.module === moduleID);
    return [...m.main.map(id => all.find(t => t.id === id)), ...all.filter(t => t.practice)];
  }
  function renderLearningPath() {
    $('learning-path').replaceChildren(node('h2', {text: 'Dein Lernweg · vier Module'}), node('div', {class: 'learning-module-grid'}, A.modules.map(m => {
      const status = A.moduleStatus(m.id, progress.attempts);
      return node('button', {class: 'learning-module', 'data-module': m.id, onclick: () => go(m.id)}, node('span', {class: 'eyebrow', text: 'Wikiseite ' + m.number}), node('strong', {text: m.title}), node('span', {text: `${status.done}/${status.total} Lernschritte geprüft · ${m.sourceGap ? 'Quellenabgleich offen' : 'Originalmaterial vorhanden'}`}));
    })));
  }
  function renderList() {
    const query = $('task-search').value.toLocaleLowerCase('de'); $('task-list').replaceChildren();
    const list = moduleTasks(), main = node('div', {class: 'main-task-list'}), extra = node('details', {class: 'additional-tasks'}, node('summary', {text: 'Weitere Übungen · bisherige Aufgaben'})), practice = node('div', {class: 'practice-task-list'});
    if (list.find(t => t.id === taskID)?.practice) extra.open = true;
    for (const t of list.filter(t => (t.id + ' ' + t.title).toLocaleLowerCase('de').includes(query))) {
      const a = progress.attempts[keyFor(t.id)], text = `${t.id} · ${t.title}`;
      const b = node('button', {class: 'task-link' + (taskID === t.id ? ' active' : ''), 'data-task': t.id, onclick: () => { park(); taskID = t.id; modelVisible = false; renderList(); renderTask(); }}, node('span', {text}), node('small', {text: a?.submitted ? 'Abgegeben' : a?.checked ? 'Geprüft' : a?.updated ? 'In Bearbeitung' : 'Noch offen'}));
      if (t.id === taskID) b.setAttribute('aria-current', 'true');
      (t.practice && !query && !examID ? practice : main).append(b);
    }
    $('task-list').append(main); if (practice.childElementCount) { extra.append(practice); $('task-list').append(extra); }
    const meter = $('module-progress'); meter.replaceChildren();
    if (!examID) {
      const status = A.moduleStatus(moduleID, progress.attempts);
      meter.append(node('progress', {value: status.done, max: status.total, 'aria-label': 'Bearbeitungsfortschritt im Lernpfad'}), node('span', {text: `${status.done}/${status.total} Lernschritte geprüft.${moduleID === 'M2' ? ' Bei Wahlaufgabe 10 genügt ein Weg.' : ''} Die fachliche Auswertung steht in den Aufgaben.`}));
    }
  }
  $('task-search').oninput = renderList;
  function renderModule() {
    showPage('academy-view'); $('task-search').value = '';
    const m = A.modules.find(m => m.id === moduleID);
    $('academy-modes').hidden = !!examID; modeButtons();
    if (examID) {
      const e = A.exams.find(e => e.id === examID);
      $('academy-title').textContent = e.title; $('academy-scope').textContent = 'SELBST ERSTELLTE ABITURORIENTIERTE Q3-ÜBUNGSKLAUSUR';
      $('academy-subtitle').textContent = '40 BE · alle Aufgaben bearbeiten · keine Hilfen vor Abgabe · keine vollständige Simulation des gesamten Informatikabiturs';
    } else {
      $('academy-title').textContent = `Modul ${m.number} · ${m.title}`; $('academy-scope').textContent = m.scope;
      $('academy-subtitle').textContent = m.subtitle + (progress.mode === 'learn' ? ' · Hinweise und Lösungen auf Wunsch' : ' · Rückmeldung erst nach Abgabe');
    }
    const context = $('module-context'); context.replaceChildren();
    if (!examID) {
      if (m.sourceGap) context.append(node('p', {class: 'source-gap', text: 'Wikiseite 1 wurde noch nicht bereitgestellt und ist angefragt. Diese eigenen Einstiegsaufgaben folgen den Lernzielen des Auftrags; der Abgleich mit der Originalseite steht aus.'}));
      else {
        const sheet = {M2: ['wiki2', 'grammatiken'], M3: ['wiki3', 'chomsky'], M4: ['wiki4', 'ebnf2']}[moduleID];
        context.append(node('details', {class: 'module-sources'}, node('summary', {text: 'Originalquellen und fachliche Konventionen'}), node('p', {}, sheet.map((s, i) => [i ? ' · ' : '', node('a', {href: A.q31.sourceFiles[s], text: i ? 'Originalarbeitsblatt' : 'Wikiseite als PDF', target: '_blank', rel: 'noopener'})]).flat()), node('p', {class: 'small', text: 'Die Lernpfad-Aufgaben bündeln die Quellen. Weitere passende bisherige Aufgaben bleiben unter „Weitere Übungen“ erhalten. Bei EBNF werden Komma/Punkt und Leerraum/Semikolon akzeptiert; formatiert wird einheitlich mit Semikolon.'})));
      }
    }
    const guide = $('hierarchy-guide'); guide.replaceChildren(); guide.hidden = !!examID || moduleID !== 'M3' || progress.mode === 'train';
    if (!guide.hidden) {
      const details = node('details', {class: 'hierarchy-overview'}, node('summary', {text: 'Die vollständige Hierarchie · Typ 3 → Typ 2 → Typ 1 → Typ 0'}));
      details.append(node('div', {class: 'hierarchy-grid'}, A.hierarchy.map(h => node('article', {class: 'panel hierarchy-card'},
        node('span', {class: 'badge', text: 'Typ ' + h.type}), node('h3', {text: h.title}), node('code', {text: h.form}), node('p', {text: h.condition}),
        node('pre', {text: h.example}), node('p', {class: 'small', text: 'Maschinenmodell: ' + h.machine})))));
      details.append(node('p', {class: 'hierarchy-inclusion', text: 'Sprachklassen: L₃ ⊊ L₂ ⊊ L₁ ⊊ L₀'}), node('p', {class: 'hint', text: 'Die Einschachtelung gilt für Sprachklassen. Die Produktionsform einer gegebenen Grammatik und die engste Klasse ihrer Sprache müssen getrennt begründet werden. Die Beispiele illustrieren jeweils die Produktionsform.'}));
      guide.append(details);
    }
    renderList(); renderTask();
  }
  function reference(source, defect = '', prefix = 'ref', zoom = false) {
    const wrap = node('div', {class: 'reference-diagrams'}), rules = C.parse(source).rules;
    rules.forEach((r, i) => {
      const card = node('div', {class: 'reference-card'}, node('strong', {text: r.name}));
      const drawing = node('div', {class: 'diagram'}); drawing.innerHTML = R.svg(r.node, r.name, {id: prefix + '-' + i});
      drawing.querySelector('svg').setAttribute('role', 'img');
      if (zoom) {
        let scale = 1; const svg = drawing.querySelector('svg'), width = Number(svg.getAttribute('width')), height = Number(svg.getAttribute('height'));
        const readout = node('output', {'aria-live': 'polite', text: '100 %'});
        const resize = delta => { scale = Math.max(.5, Math.min(2.5, scale + delta)); svg.style.width = width * scale + 'px'; svg.style.height = height * scale + 'px'; svg.style.maxWidth = 'none'; readout.textContent = Math.round(scale * 100) + ' %'; };
        card.append(node('div', {class: 'toolbar diagram-zoom'}, node('button', {text: '−', 'aria-label': r.name + ' verkleinern', onclick: () => resize(-.25)}), readout, node('button', {text: '+', 'aria-label': r.name + ' vergrößern', onclick: () => resize(.25)})));
        drawing.tabIndex = 0; drawing.setAttribute('aria-label', 'Syntaxdiagramm ' + r.name + ', horizontal verschiebbar');
      }
      drawing.querySelectorAll('[data-node]').forEach(g => { g.removeAttribute('tabindex'); g.removeAttribute('role'); g.querySelector(':scope > title')?.remove(); });
      if (defect === 'missing-bypass') {
        const repeat = drawing.querySelector('[data-type="rep"]'); repeat?.querySelectorAll(':scope > .rail')[1]?.remove();
        const label = repeat?.querySelector(':scope > .construct-label'); if (label) label.textContent = 'Wiederholung?';
      }
      if (defect === 'gap') {
        const box = R.layout(r.node), first = box.children[0], x = 34 + first.m.w + 8, y = 24 + box.mid - 6;
        const gap = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        for (const [k, v] of Object.entries({x, y, width: 15, height: 12, fill: '#ffffff'})) gap.setAttribute(k, v);
        drawing.querySelector('svg').append(gap);
      }
      card.append(drawing); wrap.append(card);
    }); return wrap;
  }
  function setChoices(part, i, value) { const a = draft(part); a.choices ||= {}; a.choices[i] = value; touch(attempt()); }
  function selectControl(options, value, handler, label) {
    const select = node('select', {'aria-label': label, onchange: event => handler(event.target.value)});
    select.append(node('option', {value: '', text: 'Bitte wählen'}));
    options.forEach(o => select.append(node('option', {value: typeof o === 'string' ? o : o[0], text: typeof o === 'string' ? o : o[1]})));
    select.value = value || ''; return select;
  }
  function inputArea(part, value, field = 'text', placeholder = '') {
    return node('textarea', {'aria-label': `${taskID}${part.id} · ${part.prompt}`, placeholder, rows: 4, autocapitalize: 'off', autocomplete: 'off', autocorrect: part.kind === 'text' ? 'on' : 'off', spellcheck: part.kind === 'text' ? 'true' : 'false', oninput: event => record(part, field, event.target.value), onblur: event => {
      if (['derive', 'dead-derive', 'own-derive', 'derivations', 'chunk-derive'].includes(part.kind)) event.target.value = F.normalizeDerivation(event.target.value);
    }}, value || '');
  }
  function grammarEditor(part) {
    const a = draft(part), wrap = node('div', {class: 'grammar-editor'}), preview = node('div', {class: 'own-grammar-preview', 'aria-live': 'polite'});
    const source = inputArea(part, a.text, 'text', part.bnf ? '<Zahl> ::= …\n<Ziffer> ::= …' : 'Z → tW\nW → …\nOder: <Liste> → …'); source.rows = 8;
    const start = node('input', {value: a.start ?? part.defaultStart, 'aria-label': 'Startsymbol deiner Grammatik', oninput: e => { record(part, 'start', e.target.value); preview.replaceChildren(); }});
    source.addEventListener('input', () => preview.replaceChildren());
    const word = node('input', {'aria-label': 'Testwort für deine Grammatik', placeholder: 'Testwort · leer = ε', spellcheck: 'false'});
    const parseOwn = () => window.SyntaxWiki3.grammar(source.value, start.value, part.ignoreWhitespace);
    const test = node('button', {text: 'Wort mit eigenen Regeln prüfen', onclick: () => {
      try { const g = parseOwn(), w = word.value.replace(/\s/g, ''); result.textContent = `${w || 'ε'}: ${C.recognizer(F.toEBNF(g), g.start)(w) ? 'durch deine Grammatik erzeugbar' : 'durch deine Grammatik nicht erzeugbar'}. Dies prüft ein einzelnes Wort, keine Sprachgleichheit.`; }
      catch (e) { result.textContent = e.message; }
    }}), result = node('p', {class: 'hint', role: 'status'});
    wrap.append(node('p', {class: 'hint', text: (part.bnf ? 'BNF: Eine Produktion pro Zeile, etwa <Zahl> ::= <Ziffer> | <Ziffer><Zahl>. ' : 'Eine Produktion pro Zeile: Z → tW | … . ') + 'Einzelne Großbuchstaben oder <Namen> sind Nichtterminale. Terminalfolgen dürfen in Anführungszeichen stehen; dort Backslashes verdoppeln, z. B. "\\\\item". Reihenfolge und Nichtterminalnamen sind frei. Gib bei einer Umbenennung auch das passende Startsymbol an.'}),
      node('label', {class: 'field-label'}, 'Startsymbol', start), source, ...(part.ignoreWhitespace ? [node('p', {class: 'hint', text: 'Wie im Arbeitsblatt wird Leerraum bei LaTeX auch in zitierten Terminalfolgen und Ableitungsschritten ignoriert.'})] : []),
      node('button', {text: 'Eigene Grammatik als Diagramme ansehen', onclick: () => {
        try { const g = parseOwn(); preview.replaceChildren(reference(C.serialize(F.toEBNF(g)), '', taskID + part.id + '-own', true)); }
        catch (e) { preview.replaceChildren(node('p', {class: 'status error', text: e.message})); }
      }}), preview, node('label', {class: 'field-label'}, 'Eigene Grammatik an einem Wort erproben (Leerraum im Wort wird ignoriert)', word), test, result);
    return wrap;
  }
  function wikiMaterials() {
    const box = node('section', {class: 'wiki-materials', 'aria-label': 'Materialien zur LaTeX-Aufgabe'});
    box.append(node('h4', {text: 'Material 1 · LaTeX-Quellcode'}), node('pre', {text: A.wiki3.material1}));
    const fraction = (a, b) => node('span', {class: 'wiki-fraction', 'aria-label': a + ' durch ' + b}, node('span', {text: a}), node('span', {text: b}));
    const list = children => node('ul', {}, children.map(c => node('li', {}, c)));
    const variants = [list(['42', '43', fraction('5', '3'), fraction('1', '2')]), list(['42', list(['43', fraction('5', '3')]), fraction('1', '2')]), list(['42', list(['43', fraction('5', '3'), fraction('1', '2')])])];
    box.append(node('h4', {text: 'Material 2 · Mögliche Listendarstellungen'}), node('div', {class: 'wiki-list-options'}, variants.map((v, i) => node('article', {}, node('h5', {text: 'Liste ' + (i + 1)}), v))),
      node('details', {}, node('summary', {text: 'Originalabbildung der drei Listen'}), node('img', {src: 'materials/wiki3/material2-listen.png', alt: 'Drei Listenvarianten: Liste 1 ohne Verschachtelung; Liste 2 mit 43 und 5/3 als Unterliste; Liste 3 mit 43, 5/3 und 1/2 als Unterliste.', width: '522', height: '253', loading: 'lazy'})));
    box.append(node('h4', {text: 'Material 3 · Vorgegebene Syntaxdiagramme'}), node('p', {class: 'hint', text: 'Inhaltlich unverändert als skalierbare Diagramme nachgezeichnet: Der erste Durchlauf durch Elemente ist zwingend. Die Rückführung erlaubt weitere Elemente. Zahl entwickelst du selbst in d); sie umfasst auch die Dollarzeichen. Mit + und − zoomen, lange Diagramme seitlich verschieben.'}), reference(A.wiki3.diagrams, '', 'wiki3-material', true),
      node('details', {}, node('summary', {text: 'Originalabbildung der Syntaxdiagramme'}), node('img', {src: 'materials/wiki3/material3-diagramme.png', alt: 'Liste: Backslash, begin, geschweifte Klammer, itemize, Klammer, Elemente, danach entsprechendes end. Elemente: Backslash, item, Wahl Zahl oder Liste, mit Rückführung zum Beginn für weitere Elemente.', width: '900', height: '449', loading: 'lazy'})));
    return box;
  }
  function sourceImages(images) {
    const details = node('details', {class: 'source-materials'}, node('summary', {text: 'Originalmaterial ansehen · ' + images.length + (images.length === 1 ? ' Abbildung' : ' Abbildungen')}));
    for (const info of images) {
      let scale = 1; const img = node('img', {src: info.src, alt: info.alt, loading: 'lazy'}), readout = node('output', {'aria-live': 'polite', text: '100 %'});
      const resize = delta => { scale = Math.max(.75, Math.min(3, scale + delta)); img.style.width = scale * 100 + '%'; readout.textContent = Math.round(scale * 100) + ' %'; };
      details.append(node('figure', {}, node('figcaption', {text: info.alt}), node('div', {class: 'toolbar diagram-zoom'}, node('button', {text: '−', 'aria-label': info.alt + ' verkleinern', onclick: () => resize(-.25)}), readout, node('button', {text: '+', 'aria-label': info.alt + ' vergrößern', onclick: () => resize(.25)}), node('a', {href: info.src, target: '_blank', rel: 'noopener', text: 'In voller Größe öffnen'})), node('div', {class: 'source-image-frame', tabindex: '0', 'aria-label': info.alt + ', verschiebbar'}, img)));
    }
    return details;
  }
  function treeEditor(part) {
    const a = draft(part), grammar = F.parse(task().formal, task().start || 'S');
    if (!a.forms?.length) a.forms = [grammar.start];
    const wrap = node('div', {class: 'tree-editor'}), drawing = node('div', {class: 'derivation-tree'}), controls = node('div', {class: 'tree-actions'});
    function draw() {
      drawing.replaceChildren(); controls.replaceChildren();
      let model;
      try { model = F.tree(grammar, a.forms.map(F.symbols), a.actions); } catch (e) { drawing.append(node('p', {class: 'status error', text: e.message})); return; }
      const form = a.forms.at(-1), tip = node('p', {class: 'hint', text: `Aktuelle Satzform: ${form}. Ziel: ${part.target || 'ε'}.`});
      function branch(n) {
        const li = node('li'), label = node('button', {text: n.symbol === 'ε' ? 'ε' : F.name(n.symbol), 'aria-label': 'Baumknoten ' + (n.symbol === 'ε' ? 'ε' : F.name(n.symbol)), class: F.isN(n.symbol) ? 'nonterminal-leaf' : 'terminal-leaf'});
        label.disabled = locked() || !F.isN(n.symbol) || !!n.children;
        if (!label.disabled) label.onclick = () => {
          controls.replaceChildren(node('strong', {text: `Ersetze ${F.name(n.symbol)}:`}));
          grammar.rules.forEach((r, index) => {
            if (r.lhs[0] !== n.symbol) return;
            controls.append(node('button', {text: F.ruleText(r), 'data-production': index, onclick: () => {
              const position = model.frontier.findIndex(leaf => leaf.id === n.id), next = F.apply(F.symbols(form), r, position);
              if (next && a.forms.length < 80) { a.actions ||= []; a.actions.push({ruleIndex: index, position}); a.forms.push(F.display(next)); record(part, 'forms', a.forms); draw(); }
            }}));
          });
        };
        li.append(label); if (n.children) li.append(node('ul', {}, n.children.map(branch))); return li;
      }
      drawing.append(tip, node('ul', {class: 'tree-root'}, branch(model.root)));
      controls.append(node('p', {class: 'hint', text: locked() ? 'Gespeicherter Ableitungsbaum.' : 'Klicke ein noch nicht ersetztes Nichtterminal.'}));
    }
    const undo = node('button', {text: 'Letzte Baum-Ersetzung zurücknehmen', onclick: () => { if (a.forms.length > 1) { a.forms.pop(); a.actions?.pop(); record(part, 'forms', a.forms); draw(); } }}); undo.disabled = locked();
    wrap.append(drawing, controls, undo); draw(); return wrap;
  }
  function renderPart(part) {
    const a = draft(part), card = node('section', {class: 'question-card', 'data-part': part.id},
      node('div', {class: 'question-heading'}, node('h4', {text: `${part.id}) ${part.prompt}`}), node('span', {class: 'badge', text: `AFB ${part.afb} · ${part.be} BE`}))), body = node('div', {class: 'answer-body'});
    const group = task().choiceGroups?.find(g => g.ids.includes(part.id));
    if (group) card.append(node('p', {class: 'hint', text: group.label + ': Ein Weg genügt. Alternative Darstellungen werden im Ergebnis nur einmal gewertet.'}));
    if (['text', 'derive', 'examples', 'dead-derive', 'own-derive', 'word', 'derivations', 'chunk-derive'].includes(part.kind)) {
      if (part.kind === 'chunk-derive') body.append(node('p', {class: 'hint', text: 'Schreibe Nichtterminale als <Adressliste>, <Adresse>, <Wort> usw. Terminalfolgen stehen in Anführungszeichen. Ein Anführungszeichen als Terminal wird so maskiert: ' + JSON.stringify('"') + '. Leerzeichen innerhalb der Terminalfolgen bleiben echte Zeichen.'}));
      const grammarPart = task().parts.find(p => p.id === part.grammarPart);
      const start = grammarPart ? draft(grammarPart).start || grammarPart.defaultStart : task().start || 'S';
      body.append(inputArea(part, a.text, 'text', part.kind === 'derivations' ? 'Eine vollständige Ableitungskette pro Zeile: S -> … -> Wort' : ['derive', 'dead-derive', 'own-derive', 'chunk-derive'].includes(part.kind) ? (part.start || start) + ' -> … -> Zielwort' : part.kind === 'examples' ? 'Ein Wort pro Zeile · ε für das leere Wort' : part.kind === 'word' ? 'Deine Wagenfolge …' : 'Deine fachliche Begründung …'));
    } else if (part.kind === 'grammar') {
      body.append(grammarEditor(part));
    } else if (part.kind === 'sets') {
      for (const [field, label] of [['n', 'Nichtterminale N'], ['t', 'Terminale T'], ['start', 'Startsymbol S']]) {
        const input = node('input', {value: a[field] || '', 'aria-label': label, placeholder: field === 'start' ? 'S' : 'Mit Komma trennen', oninput: event => record(part, field, event.target.value)});
        body.append(node('label', {class: 'field-label'}, label, input));
      }
    } else if (part.kind === 'ebnf' || part.kind === 'draw') {
      const host = node('div', {class: 'workspace-host', id: 'workspace-host-' + part.id});
      const button = node('button', {class: 'primary open-workspace', text: part.kind === 'draw' ? 'Im grafischen Editor zeichnen' : 'Im EBNF-Editor bearbeiten', onclick: () => openWorkspace(part, host)});
      card.append(node('div', {class: 'toolbar'}, button, node('span', {class: 'small', id: 'workspace-save-' + part.id, text: a.workspace ? 'Eigener Arbeitsstand vorhanden' : 'Eigener Arbeitsbereich · getrennt von anderen Teilaufgaben'})), host);
      if (part.kind === 'draw' && !revealed()) body.append(node('p', {class: 'hint', text: 'Die mitgeführte EBNF und automatische Sprachhilfen bleiben während des Zeichnens verdeckt.'}));
    } else if (part.kind === 'tree') body.append(treeEditor(part));
    else if (part.kind === 'choice' || part.kind === 'compare' || part.kind === 'own-classify') {
      body.append(selectControl(part.kind === 'own-classify' ? [['3', 'Typ 3 · reguläre Form'], ['2', 'Typ 2 · kontextfreie Form'], ['1', 'Typ 1 · nichtverkürzende Form'], ['0', 'Typ 0 · allgemeine Form']] : part.options || ['Ja', 'Nein'], a.choice, value => record(part, 'choice', value), part.prompt));
      if (part.kind === 'compare') body.append(node('label', {class: 'field-label'}, 'Bei Ungleichheit: ein Gegenbeispiel (ε für das leere Wort)', node('input', {value: a.witness || '', 'aria-label': 'Gegenbeispiel', oninput: event => record(part, 'witness', event.target.value)})));
    } else {
      const rows = part.kind === 'words' ? part.samples.map(w => ({label: w || 'ε'})) : part.rows;
      rows.forEach((row, i) => {
        const box = node('div', {class: 'answer-row'}, node('strong', {text: row.label}));
        if (row.formal) box.append(node('pre', {text: row.formal}));
        const options = part.kind === 'classify' ? [['3', 'Typ 3 · reguläre Form'], ['2', 'Typ 2 · kontextfreie Form'], ['1', 'Typ 1 · nichtverkürzende Form'], ['0', 'Typ 0 · allgemeine Form'], ['invalid', 'Keine gültige Grammatik']] : part.options || ['Ja', 'Nein'];
        box.append(selectControl(options, a.choices?.[i], value => setChoices(part, i, value), `${part.id}: ${row.label}`)); body.append(box);
      });
    }
    if (locked()) body.querySelectorAll('input,textarea,select').forEach(input => { input.disabled = true; });
    card.append(body);
    if (revealed()) renderEvaluation(part, card);
    return card;
  }
  function renderEvaluation(part, card) {
    const a = draft(part), checked = Q.check(part, a, task(), attempt().answers), box = node('div', {class: 'part-feedback ' + checked.status});
    if (part.kind === 'text') box.append(node('strong', {text: `Selbstkontrolle · ${part.be} BE fachlich einschätzen`}));
    else box.append(node('strong', {text: `${checked.autoEarned} / ${part.be} BE automatisch geprüft${checked.pending ? ' · Ergebnis fachlich offen' : ''}`}));
    box.append(node('ul', {}, checked.feedback.map(text => node('li', {text}))));
    const horizon = node('details', {class: 'expectation'}, node('summary', {text: 'Erwartungshorizont und Musterlösung'}));
    if (part.kind === 'text') {
      horizon.append(node('p', {text: part.solution}));
      part.criteria.forEach((criterion, i) => {
        const label = node('label', {class: 'self-score'}, node('span', {text: `${criterion[0]} (${criterion[1]} BE)`}));
        const select = selectControl(Array.from({length: criterion[1] + 1}, (_, n) => [String(n), n + ' BE']), String(a.self?.[i] || 0), value => {
          a.self ||= []; a.self[i] = Number(value); save(); updateTotal();
        }, `Selbsteinschätzung ${part.id}, Aspekt ${i + 1}`);
        label.append(select); horizon.append(label);
      });
      horizon.append(node('p', {class: 'small', text: 'Diese Punkte sind deine Selbsteinschätzung, keine automatische oder offizielle Benotung. Bei leerer Antwort werden keine Selbstpunkte gezählt.'}));
    } else if (part.answer) horizon.append(node('pre', {text: part.answer}));
    else if (part.solution) horizon.append(node('pre', {text: part.solution}));
    else horizon.append(node('p', {class: 'hint', text: 'Die fachlichen Einzelergebnisse stehen in der Rückmeldung oben.'}));
    if (part.alternatives) { horizon.append(node('p', {text: part.alternativeNote || 'Weitere zulässige Lesart:'})); part.alternatives.forEach(source => horizon.append(node('pre', {text: source}))); }
    if (part.reviewCriteria) horizon.append(node('p', {text: 'Prüfaspekte für die Selbstkontrolle alternativer Lösungen:'}), node('ul', {}, part.reviewCriteria.map(text => node('li', {text}))));
    box.append(horizon); card.append(box);
  }
  function totalsForExam(id) {
    const exam = A.exams.find(e => e.id === id); let auto = 0, autoMax = 0, self = 0, manualMax = 0, pending = 0;
    for (const block of exam.parts) {
      const t = A.tasks.find(t => t.id === block.task), selected = {...t, parts: t.parts.filter(p => block.ids.includes(p.id))};
      const s = Q.summary(selected, progress.attempts[`${id}:${t.id}`]?.answers || {});
      auto += s.auto; autoMax += s.autoMax; self += s.self; manualMax += s.manualMax; pending += s.pending;
    } return {auto, autoMax, self, manualMax, pending};
  }
  function updateTotal() {
    const target = $('task-total'); if (!target) return;
    if (!revealed()) { target.textContent = examID ? 'Die Auswertung erscheint erst nach Abgabe der gesamten Klausur.' : progress.mode === 'train' ? 'Die Rückmeldung erscheint nach deiner Abgabe.' : 'Bearbeite die Teilaufgaben und prüfe dann deine Ergebnisse.'; return; }
    const s = examID ? totalsForExam(examID) : Q.summary(task(), attempt().answers);
    target.textContent = `${examID ? 'Gesamte Klausur: ' : ''}${s.auto} / ${s.autoMax} BE automatisch geprüft · ${s.self} / ${s.manualMax} BE selbst eingeschätzt` + (s.pending ? ` · davon ${s.pending} automatische BE noch fachlich offen` : '') + '. Keine offizielle Note.';
  }
  function renderTask() {
    const t = task(), a = attempt(); $('task-content').replaceChildren();
    const heading = node('div', {class: 'task-title'}, node('div', {}, node('span', {class: 'eyebrow', text: `${t.id} · ${t.module === 'M3' ? 'Chomsky-Hierarchie · alle vier Typen' : 'Grundkurs Q3.1'}${t.practice ? ' · Weitere Übung' : ''}`}), node('h3', {text: t.title})), node('span', {class: 'badge', text: Q.maximum(t) + ' BE'}));
    $('task-content').append(heading, node('p', {class: 'task-intro', text: t.intro}));
    if (t.legacyModule === 'W') $('task-content').append(node('p', {class: 'small'}, node('a', {href: 'materials/wiki3/arbeitsblatt.docx', download: 'Chomsky_Hierarchie_korrigiertes_Arbeitsblatt.docx', text: 'Korrigiertes Arbeitsblatt herunterladen'}), ' · ', node('a', {href: 'WIKISEITE3.md', text: 'Aufgaben, Auswertung und Prüfgrenzen'})));
    if (t.source && t.legacyModule !== 'W') $('task-content').append(node('p', {class: 'small'}, node('a', {href: A.q31.sourceFiles[t.source.sheet], target: '_blank', rel: 'noopener', text: 'Originalquelle · ' + t.source.exercises.join(', ')})));
    if (a.assisted && !examID) $('task-content').append(node('p', {class: 'hint', text: 'Bei diesem Arbeitsstand wurde eine Hilfe oder Musterlösung genutzt. Das bleibt im Lernfortschritt gekennzeichnet.'}));
    if (t.givenEBNF) $('task-content').append(node('pre', {class: 'given-ebnf', text: t.givenEBNF}));
    if (t.givenFormal) $('task-content').append(node('pre', {class: 'given-formal', text: t.givenFormal}));
    if (t.latexMaterials) $('task-content').append(wikiMaterials());
    if (t.originalImages) $('task-content').append(sourceImages(t.originalImages));
    if (t.reference) $('task-content').append(node('p', {class: 'reference-label', text: t.defect ? 'Fehlerhaftes Lehrdiagramm – korrigiere die genannte Stelle.' : 'Vorgegebenes Diagramm – nur zum Lesen.'}), reference(t.reference, t.defect, t.id, !!t.source));
    if (!examID && progress.mode === 'learn') {
      const hints = t.hints || [t.hint]; let step = Math.min(hints.length, a.hintCount || 0);
      const hint = node('div', {class: 'hint', hidden: !step});
      const appendHint = i => hint.append(node('p', {text: `${t.hints ? (i + 1) + '. ' : ''}${hints[i]}`}));
      for (let i = 0; i < step; i++) appendHint(i);
      const hintLabel = () => step >= hints.length ? 'Alle Hilfen geöffnet' : t.hints ? `Nächste Hilfe (${step + 1}/${hints.length})` : 'Hinweis';
      const hintButton = node('button', {text: hintLabel(), onclick: () => {
        if (step >= hints.length) return;
        a.assisted = true; hint.hidden = false; appendHint(step++); a.hintCount = step;
        hintButton.disabled = step >= hints.length; hintButton.textContent = hintLabel(); save();
      }});
      hintButton.disabled = step >= hints.length;
      const help = node('div', {class: 'toolbar task-help'}, hintButton,
        node('button', {text: modelVisible ? 'Musterlösung ausblenden' : 'Musterlösung und Aspekte anzeigen', onclick: () => { park(); a.assisted = true; modelVisible = !modelVisible; save(); renderTask(); }}));
      $('task-content').append(help, hint);
    }
    if (t.sections && !examID) {
      const state = sectionStates.get(taskID) || {};
      t.sections.forEach((section, i) => {
        const selected = t.parts.filter(p => section.ids.includes(p.id)); if (!selected.length) return;
        const details = node('details', {class: 'task-section'}, node('summary', {text: section.title + ` · ${selected.length} Teilaufgaben`}));
        details.open = state[i] ?? i === 0;
        details.addEventListener('toggle', () => { state[i] = details.open; sectionStates.set(taskID, state); });
        selected.forEach(p => details.append(renderPart(p))); $('task-content').append(details);
      });
    } else t.parts.forEach(p => $('task-content').append(renderPart(p)));
    const footer = node('div', {class: 'task-footer'});
    if (examID) {
      if (locked()) footer.append(node('button', {text: 'Zur Klausurübersicht', onclick: () => go('exam')}));
      else footer.append(node('div', {class: 'exam-clock', id: 'exam-clock'}), node('button', {class: 'primary', text: 'Gesamte Klausur abgeben und auswerten', id: 'submit-exam', onclick: submitExam}));
    } else if (locked()) footer.append(node('button', {text: 'Antworten erneut bearbeiten', onclick: () => { park(); a.submitted = false; a.checked = false; a.assisted = true; modelVisible = false; save(); renderTask(); renderList(); }}));
    else footer.append(node('button', {class: 'primary', id: 'submit-task', text: progress.mode === 'train' ? 'Aufgabe abgeben und auswerten' : 'Lernstand prüfen', onclick: () => {
      park(); a.checked = true; a.submitted = progress.mode === 'train'; modelVisible = false; save(); renderTask(); renderList();
    }}));
    footer.append(node('p', {id: 'task-total', class: 'score-summary', 'aria-live': 'polite'}));
    if (!examID) {
      const route = moduleTasks(), index = route.findIndex(t => t.id === taskID);
      const move = offset => { park(); taskID = route[index + offset].id; $('task-search').value = ''; modelVisible = false; renderList(); renderTask(); $('task-content').scrollIntoView({block: 'start', behavior: 'instant'}); };
      const before = node('button', {text: '← Vorherige Aufgabe', onclick: () => move(-1)}), after = node('button', {text: 'Nächste Aufgabe →', onclick: () => move(1)}); before.disabled = index <= 0; after.disabled = index >= route.length - 1;
      footer.append(node('div', {class: 'toolbar task-pagination'}, before, after));
    }
    $('task-content').append(footer); updateTotal(); updateClock();
  }
  function updateClock() {
    const clock = $('exam-clock'); if (!clock || !examID) return;
    const ex = A.exams.find(e => e.id === examID), minutes = Math.max(0, Math.floor((Date.now() - progress.exams[examID].started) / 60000));
    clock.textContent = `${minutes} Minuten seit Beginn · Empfehlung ${ex.minutes} Minuten. Keine automatische Abgabe.`;
  }
  setInterval(updateClock, 1000);
  function beginExam(id, fresh = false) {
    const running = runningExam(); if (running && running.id !== id) { message('Beende zuerst die bereits laufende Klausur.'); return; }
    leave(); const ex = A.exams.find(e => e.id === id), previous = progress.exams[id];
    if (fresh || !previous?.started) {
      const archives = previous?.archives || [];
      if (previous?.submitted) { const total = totalsForExam(id); archives.push({auto: total.auto, self: total.self, date: previous.submitted}); }
      progress.exams[id] = {started: Date.now(), submitted: 0, archives: archives.slice(-10)};
      for (const block of ex.parts) { delete progress.attempts[`${id}:${block.task}`]; for (const k of [...sessions.keys()]) if (k.startsWith(id + ':')) sessions.delete(k); }
    }
    examID = id; taskID = ex.parts[0].task; view = 'exam'; modelVisible = false; saveNow(); navState('exam'); renderModule();
  }
  function submitExam() {
    park(); progress.exams[examID].submitted = Date.now();
    for (const block of A.exams.find(e => e.id === examID).parts) {
      const key = `${examID}:${block.task}`; progress.attempts[key] ||= {answers: {}, assisted: false}; progress.attempts[key].submitted = true; progress.attempts[key].checked = true;
    }
    saveNow(); navState('exam'); renderTask(); renderList(); message('Klausur abgegeben. Automatisch prüfbare Ergebnisse und der Erwartungshorizont sind jetzt freigegeben. Begründungen schätzt du anhand der Teilpunkte selbst ein.');
  }
  function renderExams() {
    $('exam-view').replaceChildren(node('div', {class: 'academy-heading'}, node('div', {}, node('div', {class: 'eyebrow', text: 'TRANSFER & PRÜFUNG'}), node('h2', {text: 'Abiturtraining'}))));
    $('exam-view').append(node('p', {class: 'scope-note', text: 'Selbst erstellte abiturorientierte Q3-Übungsaufgaben, keine offiziellen Abituraufgaben. Die beiden Klausuren umfassen jeweils 40 BE im Themenbereich Grammatiken und Sprachen. Weitere Abiturinhalte und die vollständige 90-BE-Prüfung werden hier nicht simuliert.'}));
    const cards = node('div', {class: 'exam-grid'});
    for (const ex of A.exams) {
      const saved = progress.exams[ex.id], card = node('article', {class: 'panel exam-card'}, node('span', {class: 'badge', text: '40 BE · GK-Kern'}), node('h3', {text: ex.title}), node('p', {text: ex.note}), node('ul', {}, ex.parts.map(b => node('li', {text: A.tasks.find(t => t.id === b.task).title}))));
      card.append(node('p', {class: 'hint', text: 'Keine Hinweise, Musterlösungen oder freien Laborhilfen während der Bearbeitung. Alle Antworten bleiben beim Neuladen erhalten. Die Abgabe friert die Antworten ein.'}));
      if (saved?.submitted) {
        const total = totalsForExam(ex.id); card.append(node('p', {class: 'score-summary', text: `${total.auto} BE automatisch geprüft · ${total.self} BE selbst eingeschätzt · ${total.pending} BE offen.`}));
        card.append(node('button', {text: 'Abgabe und Erwartungshorizont ansehen', onclick: () => beginExam(ex.id)}), node('button', {text: 'Neuen Versuch starten', onclick: () => beginExam(ex.id, true)}));
      } else card.append(node('button', {class: 'primary', text: saved?.started ? 'Klausur fortsetzen' : 'Klausur starten', 'data-exam': ex.id, onclick: () => beginExam(ex.id)}));
      if (saved?.archives?.length) card.append(node('p', {class: 'small', text: `${saved.archives.length} frühere Ergebnisübersichten im Lernstand erhalten.`}));
      cards.append(card);
    }
    $('exam-view').append(cards, node('article', {class: 'panel transfer-card'}, node('h3', {text: 'Weitere Anwendungen · sechs Kontexte'}), node('p', {text: 'Erhaltene Zusatzübungen aus Modul 4: Logistik, Geräte-IDs, Dateinamen, Programmiersprachen, Messdaten und Nachrichten. Mit Hinweisen lernen oder selbstständig trainieren.'}), node('button', {class: 'primary', text: 'Transferaufgaben öffnen', id: 'open-transfer', onclick: () => go('E')})));
  }
  function competencyFor(part) {
    return part.skills || ({sets: [0], derive: [1], tree: [1], words: [0, 2], examples: [2], classify: [3], mapping: [3], choice: [3], ebnf: [4, 6], draw: [5, 6], compare: [6, 7], text: [7], word: [0, 2], grammar: [0, 2], 'own-classify': [3], 'own-derive': [1], 'dead-derive': [1], derivations: [1], 'chunk-derive': [1]}[part.kind] || [7]);
  }
  function renderProgress() {
    const target = $('progress-view'); target.replaceChildren(node('div', {class: 'academy-heading'}, node('div', {}, node('div', {class: 'eyebrow', text: 'DEIN LERNWEG'}), node('h2', {text: 'Lernfortschritt'}))));
    target.append(node('p', {class: 'scope-note', text: 'Automatisch geprüfte Ergebnisse, eigene Punkteschätzungen und genutzte Hilfen werden getrennt ausgewiesen. Bearbeitete Aufgaben allein sind kein Nachweis, dass eine Kompetenz sicher beherrscht wird.'}));
    const scoredAttempts = Object.entries(progress.attempts).filter(([, a]) => a.checked || a.submitted).map(([key, a]) => {
      const id = key.split(':').at(-1), original = A.tasks.find(t => t.id === id);
      let parts = original.parts;
      if (key.includes(':')) { const block = A.exams.find(e => e.id === key.split(':')[0]).parts.find(b => b.task === id); parts = parts.filter(p => block.ids.includes(p.id)); }
      return {attempt: a, parts, results: Q.summary({...original, parts}, a.answers).parts};
    });
    const bars = node('div', {class: 'competency-grid'});
    A.skills.forEach((skill, index) => {
      let practiced = 0, automatic = 0, self = 0, aided = 0;
      for (const {attempt: a, parts, results} of scoredAttempts) {
        for (const part of parts.filter(p => competencyFor(p).includes(index))) {
          const r = results.find(r => r.id === part.id); if (r.counted === false) continue;
          practiced++; automatic += r.autoEarned; self += r.selfEarned; if (a.assisted) aided++;
        }
      }
      const card = node('article', {class: 'panel competency-card'}, node('h3', {text: skill}), node('p', {class: 'hint', text: `${practiced} geprüfte Teilaufgaben · ${Math.round(automatic * 100) / 100} BE automatisch · ${self} BE selbst eingeschätzt · ${aided} mit Hilfe` }));
      card.append(node('label', {class: 'field-label'}, 'Meine eigene Einschätzung', selectControl([['0', 'Noch offen'], ['1', 'Mit Unterstützung'], ['2', 'Meist selbstständig'], ['3', 'Sicher und begründet']], String(progress.ratings[index] || 0), value => { progress.ratings[index] = Number(value); save(); }, skill)));
      bars.append(card);
    });
    target.append(bars);
    const actions = node('div', {class: 'panel progress-actions'}, node('h3', {text: 'Lernstand sichern und wiederherstellen'}));
    actions.append(node('p', {class: 'hint', text: 'Der Export enthält deine Texte, EBNF, Zeichnungen als Grammatikmodelle, Abgaben und Selbsteinschätzungen. Er wird lokal heruntergeladen.'}));
    const file = node('input', {type: 'file', accept: '.json,application/json', 'aria-label': 'Lernstand importieren', onchange: async event => {
      const input = event.target, selected = input.files[0]; if (!selected) return;
      if (selected.size > 4000000) { message('Die Lernstandsdatei ist zu groß (maximal 4 MB).', true); return; }
      try {
        const imported = Q.cleanProgress(JSON.parse(await selected.text()), A);
        // Merge known drafts; incoming matching task IDs replace those drafts explicitly.
        progress.attempts = {...progress.attempts, ...imported.attempts}; progress.exams = {...progress.exams, ...imported.exams}; progress.ratings = imported.ratings; sessions.clear(); saveNow();
        message('Lernstand importiert. Enthaltene Aufgabenstände wurden übernommen; andere vorhandene Aufgabenstände bleiben erhalten.');
        if (runningExam()) go('exam'); else renderProgress();
      } catch (e) { message('Import nicht übernommen: ' + e.message, true); } input.value = '';
    }});
    actions.append(node('button', {text: 'Lernstand exportieren', id: 'export-progress', onclick: () => {
      saveNow(); const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], {type: 'application/json'}));
      const a = node('a', {href: url, download: 'syntaxlabor-v4.1-lernstand.json'}); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}), node('label', {class: 'field-label'}, 'Lernstand aus Datei importieren', file)); target.append(actions);
    const list = node('div', {class: 'panel attempt-overview'}, node('h3', {text: 'Bearbeitungsübersicht'}));
    for (const m of A.modules) {
      const tasks = A.tasks.filter(t => t.module === m.id), done = tasks.filter(t => progress.attempts[t.id]?.checked || progress.attempts[t.id]?.submitted).length;
      list.append(node('p', {text: `Modul ${m.number} · ${m.title}: ${done} / ${tasks.length} Aufgaben geprüft.`}));
    }
    target.append(list);
  }
  // Optional production-form inspector: never infers the smallest language class.
  renderLearningPath();
  const inspector = node('details', {id: 'formal-inspector'}, node('summary', {text: 'Eigene Produktionsregeln klassifizieren'}));
  const formalInput = node('textarea', {'aria-label': 'Eigene Produktionsregeln', spellcheck: 'false'}, 'S → aS | b');
  const formalResult = node('div', {'aria-live': 'polite'});
  inspector.append(node('p', {class: 'hint', text: 'Einzelne Großbuchstaben sind Nichtterminale. Großbuchstaben als Terminale zitieren, z. B. "P". Eine Produktion pro Zeile; Startsymbol S.'}), formalInput, node('button', {text: 'Produktionsform prüfen', onclick: () => {
    const r = Q.productionType(formalInput.value); formalResult.replaceChildren(node('p', {text: r.value === 'invalid' ? 'Keine gültige Grammatik: ' + r.info : `Engste nachgewiesene Produktionsform: Typ ${r.value}. ${r.info}`}), node('p', {class: 'hint', text: 'Die minimale Sprachklasse wird dadurch nicht automatisch bestimmt.'}));
  }}), formalResult);
  $('curriculum-note').append(inspector);
  window.addEventListener('pagehide', () => { if (activePart) activePart.answer.workspace = Lab.value(); saveNow(); });
  modeButtons(); navState('labor'); if (runningExam()) go('exam');
})();
