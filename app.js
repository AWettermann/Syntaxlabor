/* Syntaxlabor V4.1 — shared laboratory controller. Draft errors preserve the last valid model. */
(function () {
  'use strict';
  const C = window.SyntaxCore, R = window.SyntaxRenderer, exercises = window.SyntaxExercises;
  const $ = id => document.getElementById(id), clone = value => structuredClone(value);
  const initial = 'wort = "a" ["b"] {"c"};', storageKey = 'syntaxlabor-v4-draft';
  const labels = {eps: 'Leeres Wort', lit: 'Terminal', ref: 'Nichtterminal', seq: 'Folge', alt: 'Alternative', opt: 'Optional', rep: 'Wiederholung'};
  let state = {rules: C.parse(initial).rules, text: initial, start: 'wort', active: 'wort', selection: null, error: ''};
  let past = [], future = [], inputTimer, analysisTimer, lastEdit = '', lastEditAt = 0;
  let mode = 'write', activeExercise = null, validRecognizer = null;
  let workspaceContext = {training: false, hideText: false, locked: false}, origin = 'load';
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.version === 4 && typeof saved.validText === 'string' && typeof saved.text === 'string') {
      const rules = C.parse(saved.validText).rules;
      state = {...state, rules, text: saved.text, start: rules.some(r => r.name === saved.start) ? saved.start : rules[0]?.name || '', active: rules[0]?.name || ''};
      try { state.rules = C.parse(state.text).rules; } catch (e) { state.error = e.message; }
    }
  } catch (_) { /* Storage may be disabled or an old draft may be damaged. */ }
  function status(message, error = false) { $('status').textContent = message; $('status').className = 'status ' + (error ? 'error' : 'ok'); }
  function result(id, message, kind = '') { $(id).textContent = message; $(id).className = 'result ' + kind; }
  function save() {
    if (workspaceContext.training) {
      window.dispatchEvent(new CustomEvent('syntaxlab:change', {detail: {origin, workspace: {text: state.text, validText: C.serialize(state.rules), start: state.start}}}));
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({version: 4, text: state.text, validText: C.serialize(state.rules), start: state.start}));
      $('savestate').textContent = 'Entwurf auf diesem Gerät gespeichert.';
    } catch (_) { $('savestate').textContent = 'Lokales Speichern nicht verfügbar. Bitte EBNF als Text sichern.'; }
  }
  function checkpoint(key = '') {
    const now = Date.now();
    if (!key || key !== lastEdit || now - lastEditAt > 800) { past.push(clone(state)); if (past.length > 100) past.shift(); }
    lastEdit = key; lastEditAt = now; future = [];
  }
  function historyButtons() { $('undo').disabled = !past.length; $('redo').disabled = !future.length; }
  function currentRule() { return state.rules.find(r => r.name === (state.selection?.name || state.active)); }
  function at(node, path) { for (const key of path) node = node[key]; return node; }
  function selected() {
    if (!state.selection) return null;
    const rule = state.rules.find(r => r.name === state.selection.name);
    if (!rule) return null;
    try { return at(rule.node, state.selection.path) || null; } catch (_) { return null; }
  }
  function replace(rule, path, node) { if (!path.length) rule.node = node; else at(rule.node, path.slice(0, -1))[path.at(-1)] = node; }
  function ensureNames() {
    if (!state.rules.some(r => r.name === state.start)) state.start = state.rules[0]?.name || '';
    if (!state.rules.some(r => r.name === state.active)) state.active = state.rules[0]?.name || '';
    if (state.selection && !selected()) state.selection = null;
  }
  function processText() {
    clearTimeout(inputTimer); inputTimer = null;
    const text = $('ebnf').value;
    if (text === state.text) return;
    if (workspaceContext.locked || workspaceContext.hideText) { $('ebnf').value = state.text; return; }
    origin = 'text';
    checkpoint('ebnf'); state.text = text;
    try {
      const parsed = C.parse(text); state.rules = parsed.rules; state.error = ''; state.selection = null;
      ensureNames(); render();
      status(parsed.legacyCommas ? 'V2-Schreibweise erkannt. Beim Formatieren werden Folgen mit Leerzeichen geschrieben.' : 'EBNF und alle Diagramme sind synchron.');
    } catch (e) {
      state.error = e.message; renderFeedback(); historyButtons(); save(); scheduleAnalysis();
      status('Unvollständige oder ungültige EBNF. Die letzten gültigen Diagramme bleiben erhalten.', true);
    }
  }
  function flush() { if (inputTimer || $('ebnf').value !== state.text) processText(); }
  function change(message, action, options = {}) {
    flush();
    if (workspaceContext.locked) { status('Die Abgabe ist gespeichert. Der Arbeitsbereich ist jetzt schreibgeschützt.'); return false; }
    if (state.error) { status('Bitte vervollständige die EBNF oder setze die letzte gültige Grammatik ein, bevor du das Diagramm änderst.', true); return false; }
    const before = clone(state);
    try {
      action();
      const text = C.serialize(state.rules); C.parse(text); // All graphic edits must also be valid EBNF.
      const after = clone(state); state = before; checkpoint(options.key); state = after; state.text = text;
      origin = 'graphic'; ensureNames(); render(options.preserveControls); status(message); return true;
    } catch (e) { state = before; status(e.message, true); return false; }
  }
  function renderFeedback() {
    $('ebnf').setAttribute('aria-invalid', String(!!state.error));
    $('editorfeedback').textContent = state.error || (state.rules.length ? 'Gültige Änderungen werden nach einer kurzen Schreibpause automatisch übernommen.' : 'Die Grammatik ist leer. Lege ein Diagramm an oder schreibe eine Produktion.');
    $('syncstate').textContent = state.error ? 'Entwurf unvollständig' : 'Synchron';
    $('syncstate').className = 'badge' + (state.error ? ' invalid' : ''); $('revert').hidden = !state.error;
    $('diagnostics').replaceChildren();
    C.diagnostics(state.rules).forEach(text => { const p = document.createElement('p'); p.textContent = text; $('diagnostics').append(p); });
  }
  function renderDiagrams() {
    const scrolls = new Map([...document.querySelectorAll('.diagram-card')].map(card => [card.dataset.rule, card.querySelector('.diagram').scrollLeft]));
    $('diagram-list').replaceChildren();
    $('rulecount').textContent = `${state.rules.length} ${state.rules.length === 1 ? 'Regel' : 'Regeln'}`;
    if (!state.rules.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      empty.textContent = 'Noch kein Diagramm. Beginne mit „+ Neues Diagramm“ oder einer EBNF-Regel.'; $('diagram-list').append(empty);
    }
    state.rules.forEach((rule, index) => {
      const card = document.createElement('article'); card.className = 'diagram-card' + (state.active === rule.name ? ' active' : ''); card.dataset.rule = rule.name;
      const heading = document.createElement('div'); heading.className = 'diagram-card-heading';
      const select = document.createElement('button'); select.className = 'rule-select'; select.textContent = rule.name; select.title = 'Regel und gesamte Struktur auswählen';
      select.onclick = () => choose(rule.name, []);
      const remove = document.createElement('button'); remove.className = 'remove-rule danger'; remove.textContent = 'Regel löschen'; remove.setAttribute('aria-label', `Regel ${rule.name} löschen`);
      remove.onclick = () => change(`Regel „${rule.name}“ gelöscht. Rückgängig ist möglich.`, () => { state.rules = state.rules.filter(r => r.name !== rule.name); state.selection = null; });
      heading.append(select, remove);
      const diagram = document.createElement('div'); diagram.className = 'diagram';
      diagram.innerHTML = R.svg(rule.node, rule.name, {id: `r${index}`, selected: state.selection?.name === rule.name ? state.selection.path : null});
      card.append(heading, diagram); $('diagram-list').append(card); diagram.scrollLeft = scrolls.get(rule.name) || 0;
    });
    $('svgexport').disabled = $('pngexport').disabled = !state.rules.length;
  }
  function renderTree() {
    $('tree').replaceChildren(); const rule = currentRule(); if (!rule) return;
    function entry(node, path) {
      const li = document.createElement('li'), button = document.createElement('button');
      button.textContent = labels[node.type] + (node.value !== undefined ? ': ' + JSON.stringify(node.value) : '');
      button.onclick = () => choose(rule.name, path); li.append(button);
      if (node.items || node.child) {
        const ul = document.createElement('ul');
        node.items?.forEach((n, i) => ul.append(entry(n, [...path, 'items', i])));
        if (node.child) ul.append(entry(node.child, [...path, 'child'])); li.append(ul);
      }
      return li;
    }
    const ul = document.createElement('ul'); ul.append(entry(rule.node, [])); $('tree').append(ul);
  }
  function renderControls() {
    const n = selected(); $('visualtools').hidden = !n; if (!n) return;
    $('rulename').value = state.selection.name; $('nodetype').value = n.type; $('nodevalue').value = n.value ?? '';
    $('selectioninfo').textContent = labels[n.type];
    const value = n.type === 'lit' || n.type === 'ref';
    $('nodevalue').hidden = $('value-label').hidden = !value;
    $('value-label').textContent = n.type === 'ref' ? 'Regelverweis' : 'Text';
    const path = state.selection.path, parent = path.at(-2) === 'items' ? at(currentRule().node, path.slice(0, -2)) : null;
    $('moveleft').disabled = !parent || path.at(-1) === 0;
    $('moveright').disabled = !parent || path.at(-1) === parent.items.length - 1;
    renderTree();
  }
  function render(preserveControls = false) {
    ensureNames(); renderDiagrams(); renderFeedback(); if (!preserveControls) renderControls(); else renderTree();
    if ($('ebnf').value !== state.text) $('ebnf').value = state.text;
    $('startsymbol').replaceChildren(...state.rules.map(r => { const option = document.createElement('option'); option.value = r.name; option.textContent = r.name; return option; }));
    $('startsymbol').value = state.start; $('startsymbol').disabled = !state.rules.length;
    historyButtons(); save(); scheduleAnalysis();
    if (activeExercise !== null) result('training-result', 'Die Grammatik wurde geändert. Prüfe deine Lösung erneut.');
  }
  function choose(name, path) {
    flush(); state.active = name; state.selection = {name, path};
    document.querySelectorAll('.diagram-card').forEach(card => {
      card.classList.toggle('active', card.dataset.rule === name);
      card.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      if (card.dataset.rule === name) card.querySelectorAll('[data-node]').forEach(el => { if (el.dataset.node === path.join('.')) el.classList.add('selected'); });
    });
    renderControls();
  }
  const parsePath = el => el.dataset.node ? el.dataset.node.split('.').map(k => /^\d+$/.test(k) ? Number(k) : k) : [];
  $('diagram-list').addEventListener('click', event => {
    const node = event.target.closest('[data-node]'); if (node) choose(node.closest('.diagram-card').dataset.rule, parsePath(node));
  });
  $('diagram-list').addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const node = event.target.closest('[data-node]'); if (!node) return;
      event.preventDefault(); choose(node.closest('.diagram-card').dataset.rule, parsePath(node));
      (['lit', 'ref'].includes(selected()?.type) ? $('nodevalue') : $('nodetype')).focus();
    }
  });
  $('diagram-list').addEventListener('dblclick', event => {
    const el = event.target.closest('[data-node]'); if (!el || !['lit', 'ref'].includes(el.dataset.type) || state.error) return;
    choose(el.closest('.diagram-card').dataset.rule, parsePath(el));
    const rect = el.querySelector('rect.block'), input = document.createElement('input'); input.className = 'inline-input'; input.value = selected().value; input.setAttribute('aria-label', 'Baustein direkt bearbeiten');
    const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    ['x', 'y', 'width'].forEach(a => foreign.setAttribute(a, rect.getAttribute(a))); foreign.setAttribute('height', '44'); foreign.append(input); el.append(foreign);
    input.addEventListener('click', e => e.stopPropagation()); input.addEventListener('dblclick', e => e.stopPropagation());
    let done = false;
    function finish(cancel = false) {
      if (done) return; done = true;
      if (!cancel) editValue(input.value); else render();
      if (foreign.isConnected) foreign.remove();
    }
    input.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') finish(); if (e.key === 'Escape') finish(true); };
    input.onblur = () => finish(); input.focus(); input.select();
  });
  $('ebnf').addEventListener('input', () => {
    clearTimeout(inputTimer); $('syncstate').textContent = 'Wird geprüft …';
    inputTimer = setTimeout(processText, 280);
  });
  $('todiagram').onclick = () => { flush(); if (!state.error) status('Alle gültigen Produktionen sind automatisch als Diagramme dargestellt.'); };
  $('toebnf').onclick = () => change('EBNF mit Leerzeichen formatiert.', () => {});
  $('revert').onclick = () => {
    clearTimeout(inputTimer); inputTimer = null; checkpoint(); state.text = C.serialize(state.rules); state.error = ''; render(); status('Letzte gültige Grammatik wieder eingesetzt.');
  };
  function newNode(type) {
    if (type === 'eps') return C.EPS(); if (type === 'lit') return C.lit('a');
    if (type === 'ref') return {type, value: state.rules.find(r => r.name !== state.active)?.name || 'ziffer'};
    if (type === 'seq' || type === 'alt') return {type, items: [C.lit('a'), C.lit('b')]};
    return {type, child: C.lit('a')};
  }
  $('new').onclick = () => change('Leeres Diagramm angelegt. Wähle einen Bausteintyp für den leeren Weg ε.', () => {
    let name = 'wort', i = 1; while (state.rules.some(r => r.name === name)) name = `regel${i++}`;
    state.rules.push({name, node: C.EPS()}); state.active = name; if (!state.start) state.start = name; state.selection = {name, path: []};
  });
  $('deleteall').onclick = () => change('Gesamte Grammatik gelöscht. Mit Rückgängig kannst du sie wiederherstellen.', () => { state.rules = []; state.start = ''; state.active = ''; state.selection = null; });
  $('example').onclick = () => change('Beispiel geladen. Der vorherige Entwurf bleibt über Rückgängig erreichbar.', () => { state.rules = C.parse(initial).rules; state.start = state.active = 'wort'; state.selection = null; });
  $('rulename').onchange = event => {
    const name = event.target.value.trim(), old = state.selection?.name;
    if (!C.identifier.test(name) || state.rules.some(r => r.name === name && r.name !== old)) { status('Bitte einen gültigen, noch nicht vergebenen Regelnamen eingeben.', true); renderControls(); return; }
    change(`Regel umbenannt in „${name}“. Verweise wurden mitgeändert.`, () => {
      currentRule().name = name;
      state.rules.forEach(r => C.walk(r.node, n => { if (n.type === 'ref' && n.value === old) n.value = name; }));
      if (state.start === old) state.start = name; state.active = name; state.selection.name = name;
    });
  };
  $('nodetype').onchange = event => { const type = event.target.value; change('Baustein geändert. EBNF automatisch aktualisiert.', () => replace(currentRule(), state.selection.path, newNode(type))); };
  function editValue(value, preserveControls = false) {
    const n = selected(); if (!n || !['lit', 'ref'].includes(n.type)) return;
    if (n.type === 'ref' && !C.identifier.test(value)) { status('Ein Nichtterminal braucht einen gültigen Regelnamen.', true); return; }
    change('Bausteintext und EBNF aktualisiert.', () => { selected().value = value; }, {key: 'value:' + state.selection.name + ':' + state.selection.path.join('.'), preserveControls});
  }
  $('nodevalue').oninput = event => editValue(event.target.value, true);
  $('nodevalue').onblur = () => { if (selected()) $('nodevalue').value = selected().value ?? ''; };
  function visual(action) {
    if (!selected()) return;
    change('Diagramm und EBNF aktualisiert.', () => {
      const rule = currentRule(), path = [...state.selection.path], n = selected();
      if (action === 'opt' || action === 'rep') { replace(rule, path, {type: action, child: n}); state.selection.path = path; }
      if (action === 'alt') { replace(rule, path, {type: 'alt', items: [n, C.lit('b')]}); state.selection.path = [...path, 'items', 1]; }
      if (action === 'after') {
        if (n.type === 'eps') replace(rule, path, C.lit('a'));
        else if (path.at(-2) === 'items' && at(rule.node, path.slice(0, -2)).type === 'seq') {
          const parent = at(rule.node, path.slice(0, -2)), index = path.at(-1) + 1; parent.items.splice(index, 0, C.lit('b')); state.selection.path = [...path.slice(0, -2), 'items', index];
        } else { replace(rule, path, {type: 'seq', items: [n, C.lit('b')]}); state.selection.path = [...path, 'items', 1]; }
      }
      if (action === 'delete') {
        if (path.at(-2) === 'items') {
          const parentPath = path.slice(0, -2), parent = at(rule.node, parentPath); parent.items.splice(path.at(-1), 1);
          if (parent.items.length <= 1) replace(rule, parentPath, parent.items[0] || C.EPS()); state.selection.path = parentPath;
        } else { replace(rule, path, C.EPS()); state.selection.path = path; }
      }
      if (action === 'left' || action === 'right') {
        const parent = at(rule.node, path.slice(0, -2)), index = path.at(-1), target = index + (action === 'left' ? -1 : 1);
        if (path.at(-2) !== 'items' || !parent.items?.[target]) return;
        [parent.items[index], parent.items[target]] = [parent.items[target], parent.items[index]]; state.selection.path = [...path.slice(0, -1), target];
      }
    });
  }
  for (const [id, action] of Object.entries({addafter: 'after', addbranch: 'alt', wrapopt: 'opt', wraprep: 'rep', deletevisual: 'delete', moveleft: 'left', moveright: 'right'})) $(id).onclick = () => visual(action);
  function navigateHistory(redo = false) {
    if (workspaceContext.locked) return;
    flush(); const source = redo ? future : past, target = redo ? past : future; if (!source.length) return;
    target.push(clone(state)); state = source.pop(); lastEdit = ''; origin = 'graphic'; render(); status(redo ? 'Änderung wiederhergestellt.' : 'Änderung rückgängig gemacht.');
  }
  $('undo').onclick = () => navigateHistory(); $('redo').onclick = () => navigateHistory(true);
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || !['z', 'y'].includes(event.key.toLowerCase())) return;
    // Text fields retain their browser-native editing history.
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    event.preventDefault(); navigateHistory(event.shiftKey || event.key.toLowerCase() === 'y');
  });
  function wordButtons(id, words) {
    $(id).replaceChildren();
    words.forEach(word => { const b = document.createElement('button'); b.textContent = word || 'ε'; b.title = 'Dieses Wort prüfen'; b.onclick = () => { $('word').value = word; checkWord(); }; $(id).append(b); });
  }
  function scheduleAnalysis() {
    clearTimeout(analysisTimer); validRecognizer = null; result('testresult', '');
    $('description').textContent = 'Sprache wird untersucht …'; $('math').hidden = true;
    $('analysisnote').textContent = ''; $('words').replaceChildren(); $('nonwords').replaceChildren(); $('generationnote').textContent = '';
    analysisTimer = setTimeout(analyze, 80);
  }
  function analyze() {
    clearTimeout(analysisTimer);
    $('words').replaceChildren(); $('nonwords').replaceChildren(); $('math').hidden = true; $('math').textContent = ''; $('generationnote').textContent = '';
    if (!state.rules.length) { $('description').textContent = 'Lege eine Grammatik an, um ihre Sprache zu untersuchen.'; $('analysisnote').textContent = 'Eine leere Grammatik hat kein Startsymbol. Eine leere Produktion dagegen erzeugt ε.'; return; }
    try {
      validRecognizer = C.recognizer(state.rules, state.start);
      const description = C.describe(state.rules, state.start), generated = C.generate(state.rules, state.start, {maxLength: Number($('maxlen').value), maxWords: 60});
      $('description').textContent = description.text; $('math').hidden = !description.math; $('math').textContent = description.math || '';
      $('analysisnote').textContent = (state.error ? 'Es wird die letzte gültige Grammatik untersucht. ' : '') + (description.exact ? 'Diese Beschreibung gilt für die gesamte Sprache des Startsymbols.' : 'Eine Auswahl von Wörtern ist kein Beweis für eine vollständige Sprachbeschreibung.');
      wordButtons('words', generated.words); wordButtons('nonwords', C.negativeExamples(state.rules, state.start, generated.words));
      $('generationnote').textContent = `Nach Zeichenlänge sortierte Auswahl: ${generated.words.length} Wörter, höchstens ${generated.maxLength} Zeichen, maximal 60 Wörter, 48 Erzeugungsrunden. ` +
        (generated.limited ? 'Erzeugungsgrenze erreicht; weitere Wörter können existieren.' : 'Erzeugung innerhalb dieser Grenzen abgeschlossen.') + (!generated.words.length ? ' Kein Beispiel gefunden; daraus folgt nicht, dass die Sprache leer ist.' : '');
    } catch (e) {
      validRecognizer = null; $('description').textContent = e.message; $('analysisnote').textContent = 'Ergänze fehlende Regeln oder wähle ein anderes Startsymbol. Es wird keine Sprachbeschreibung behauptet.';
    }
  }
  function checkWord() {
    flush(); try {
      if (!validRecognizer) validRecognizer = C.recognizer(state.rules, state.start);
      const ok = validRecognizer($('word').value);
      result('testresult', (ok ? '✓ Das Wort gehört zur Sprache.' : '✗ Das Wort gehört nicht zur Sprache.') + (state.error ? ' Grundlage: letzte gültige Grammatik.' : ''), ok ? 'success' : 'failure');
    } catch (e) { result('testresult', e.message, 'failure'); }
  }
  $('wordform').onsubmit = event => { event.preventDefault(); checkWord(); };
  $('startsymbol').onchange = event => change('Startsymbol geändert.', () => { state.start = event.target.value; });
  $('maxlen').onchange = analyze;
  function download(name, blob) {
    const link = document.createElement('a'), url = URL.createObjectURL(blob); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  $('saveebnf').onclick = () => { flush(); download('grammatik.ebnf', new Blob([state.text], {type: 'text/plain;charset=utf-8'})); };
  $('openfile').onchange = async event => {
    const file = event.target.files[0]; if (!file) return;
    if (file.size > 96000) { status('Datei zu groß. Bitte maximal 24.000 Zeichen EBNF laden.', true); return; }
    try { $('ebnf').value = await file.text(); processText(); } catch (e) { status('Datei konnte nicht gelesen werden: ' + e.message, true); }
    event.target.value = '';
  };
  function exportRule() { flush(); const rule = currentRule() || state.rules[0]; if (!rule) throw new Error('Kein Diagramm zum Exportieren vorhanden.'); return rule; }
  $('svgexport').onclick = () => {
    try { const rule = exportRule(); download(`${rule.name}.svg`, new Blob([R.svg(rule.node, rule.name, {id: 'export'})], {type: 'image/svg+xml;charset=utf-8'})); status(`SVG für „${rule.name}“ exportiert.`); } catch (e) { status(e.message, true); }
  };
  $('pngexport').onclick = async () => {
    let url;
    try {
      const rule = exportRule(), m = R.layout(rule.node), scale = 2, width = (m.w + 68) * scale, height = (m.h + 48) * scale;
      if (width > 16000 || height > 16000 || width * height > 24000000) throw new Error('Diagramm zu groß für PNG. Bitte als SVG exportieren.');
      url = URL.createObjectURL(new Blob([R.svg(rule.node, rule.name, {id: 'png'})], {type: 'image/svg+xml'}));
      const img = new Image(); img.src = url; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('PNG-Export wird in diesem Browser nicht unterstützt.');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw new Error('PNG konnte nicht erzeugt werden.');
      download(`${rule.name}.png`, blob); status(`PNG für „${rule.name}“ exportiert.`);
    } catch (e) { status('PNG-Export: ' + e.message, true); }
    finally { if (url) URL.revokeObjectURL(url); }
  };
  exercises.forEach((ex, i) => { const option = document.createElement('option'); option.value = i; option.textContent = `${i + 1}. ${ex.title}`; $('exercise-select').append(option); });
  function exercisePreview() {
    const index = Number($('exercise-select').value), ex = exercises[index];
    $('training-count').textContent = `${index + 1} / ${exercises.length}`; $('exercise-title').textContent = ex.title; $('exercise-task').textContent = ex.task;
    $('answer').hidden = true; $('exercise-hint-text').hidden = true;
    $('checkanswer').disabled = activeExercise !== index;
    if (activeExercise !== index) result('training-result', 'Starte diese Aufgabe, um deine Lösung zu überprüfen.');
  }
  function setMode(value) {
    mode = value; $('mode-write').setAttribute('aria-pressed', String(value === 'write')); $('mode-draw').setAttribute('aria-pressed', String(value === 'draw'));
    $('mode-info').textContent = value === 'write' ? 'Schreibe deine Lösung oben im EBNF-Editor. Die Diagramme entstehen automatisch.' : 'Zeichne deine Lösung oben. Wähle ε aus und füge Bausteine hinzu. Die EBNF entsteht automatisch.';
  }
  $('mode-write').onclick = () => setMode('write'); $('mode-draw').onclick = () => setMode('draw');
  $('exercise-select').onchange = exercisePreview;
  $('exercise').onclick = () => {
    const index = Number($('exercise-select').value), ex = exercises[index];
    if (change('Aufgabe gestartet. Dein vorheriger Entwurf bleibt über Rückgängig erreichbar.', () => {
      state.rules = C.parse(ex.starter).rules; state.start = state.active = state.rules[0].name; state.selection = mode === 'draw' ? {name: state.active, path: []} : null;
    })) {
      activeExercise = index; exercisePreview(); result('training-result', 'Bearbeite die Grammatik oben und kontrolliere anschließend deine Lösung.');
      (mode === 'write' ? $('ebnf') : $('nodetype')).focus();
    }
  };
  $('exercise-hint').onclick = () => { $('exercise-hint-text').textContent = exercises[Number($('exercise-select').value)].hint; $('exercise-hint-text').hidden = false; };
  $('showanswer').onclick = () => { $('answer').textContent = exercises[Number($('exercise-select').value)].answer; $('answer').hidden = false; };
  $('checkanswer').onclick = () => {
    flush(); const index = Number($('exercise-select').value);
    if (activeExercise !== index) { result('training-result', 'Bitte diese Aufgabe zuerst starten.'); return; }
    if (state.error) { result('training-result', 'Die EBNF ist noch nicht gültig. Vervollständige deine Eingabe.', 'failure'); return; }
    try {
      const expected = C.parse(exercises[index].answer).rules, comparison = C.equivalent(state.rules, state.start, expected, expected[0].name);
      if (comparison.kind === 'equal') result('training-result', '✓ Sprachlich gleichwertig. Die Gleichwertigkeit wurde durch einen exakten Automatenvergleich nachgewiesen.', 'success');
      else if (comparison.kind === 'different') {
        const witness = comparison.witness || 'ε', accepts = C.recognizer(state.rules, state.start)(comparison.witness);
        result('training-result', `✗ Die Sprachen unterscheiden sich. Gegenbeispiel: ${JSON.stringify(witness)}.\n${accepts ? 'Deine Grammatik akzeptiert dieses Wort, die Aufgabe nicht.' : 'Die Aufgabe erlaubt dieses Wort, deine Grammatik nicht.'}`, 'failure');
      } else result('training-result', `Noch kein Gegenbeispiel gefunden (${comparison.tested} Testwörter bis Länge 8). Das beweist keine Gleichwertigkeit. ${comparison.reason}`);
    } catch (e) { result('training-result', e.message, 'failure'); }
  };
  window.addEventListener('pagehide', () => { flush(); save(); });
  window.SyntaxLab = {
    capture() { flush(); return {state: clone(state), past: clone(past), future: clone(future)}; },
    value() { flush(); return {text: state.text, validText: C.serialize(state.rules), start: state.start}; },
    load(snapshot, context = {}) {
      clearTimeout(inputTimer); inputTimer = null; clearTimeout(analysisTimer);
      $('lab-workspace').querySelectorAll('button,input,select,textarea').forEach(el => { el.disabled = false; });
      workspaceContext = {training: false, hideText: false, locked: false, ...context}; origin = 'load';
      if (snapshot?.state) { state = clone(snapshot.state); past = clone(snapshot.past || []); future = clone(snapshot.future || []); }
      else {
        const valid = C.parse(snapshot?.validText || '').rules;
        state = {rules: valid, text: snapshot?.text ?? C.serialize(valid), start: snapshot?.start || valid[0]?.name || '', active: valid[0]?.name || '', selection: null, error: ''};
        try { state.rules = C.parse(state.text).rules; } catch (e) { state.error = e.message; }
        if (workspaceContext.training && state.rules[0]) state.selection = {name: state.rules[0].name, path: []};
        past = []; future = [];
      }
      lastEdit = ''; render();
      const host = $('lab-workspace');
      host.classList.toggle('task-workspace', !!workspaceContext.training);
      host.classList.toggle('drawing-assessment', !!workspaceContext.hideText);
      host.classList.toggle('text-assessment', !!workspaceContext.hideDiagram);
      host.classList.toggle('workspace-locked', !!workspaceContext.locked);
      host.querySelectorAll('button,input,select,textarea').forEach(el => { if (workspaceContext.locked) el.disabled = true; });
      status(workspaceContext.training ? workspaceContext.locked ? 'Gespeicherte Abgabe · schreibgeschützt.' : workspaceContext.hideText ? 'Zeichne selbst. Deine EBNF wird verdeckt mitgeführt.' : 'Eigener Arbeitsbereich dieser Teilaufgabe.' : 'Freies Labor · Diagramme und EBNF werden automatisch synchronisiert.');
    }
  };
  exercisePreview(); setMode('write'); ensureNames(); render();
  if (state.error) status('Ein unvollständiger Entwurf wurde wiederhergestellt. Die letzten gültigen Diagramme bleiben erhalten.', true);
})();
