const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises'), path = require('node:path'), http = require('node:http');
const {pathToFileURL} = require('node:url');
const A = require('../curriculum-tasks.js');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'test-results');
const records = [], errors = [], environment = {node: process.version, platform: process.platform};
let browser, server, page, base;
const t = id => A.tasks.find(t => t.id === id), p = (id, part) => t(id).parts.find(p => p.id === part);
const card = id => page.locator(`#task-content [data-part="${id}"]`);
const field = id => card(id).locator('textarea').first();
async function choose(id) { await page.locator(`#task-list [data-task="${id}"]`).click(); }
async function submit() { await page.locator('#submit-task').click(); }
async function nav(view) { await page.locator(`#primary-nav [data-view="${A.legacyViews[view]?.module || view}"]`).click(); if (A.legacyViews[view]) await choose(A.legacyViews[view].start); }
async function noOverflow(target = page) { const sizes = await target.evaluate(() => [innerWidth, document.documentElement.scrollWidth]); assert.ok(sizes[1] <= sizes[0] + 1, JSON.stringify(sizes)); }
async function check(name, fn) {
  const start = Date.now();
  try { await fn(); records.push({name, passed: true, ms: Date.now() - start}); console.log('PASS ' + name); }
  catch (e) { records.push({name, passed: false, error: e.message}); await page?.screenshot({path: path.join(output, 'wiki3-failure.png')}); throw e; }
}
async function main() {
  await fs.mkdir(output, {recursive: true});
  server = http.createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]); if (rel === '/favicon.ico') { res.writeHead(204).end(); return; }
      const file = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel)); if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain', '.png': 'image/png', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': mime}).end(await fs.readFile(file));
    } catch (_) { res.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}); environment.browser = await browser.version();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, acceptDownloads: true});
  page = await context.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base);
  await check('Eigenes Modul mit sechs Arbeitsblatt-Blöcken, keine Musterlösungen vor der Prüfung', async () => {
    await page.locator('#ebnf').fill('MeinEntwurf = "bleibt";'); await page.waitForFunction(() => document.querySelector('#syncstate').textContent === 'Synchron');
    await nav('W'); assert.match(await page.locator('#academy-title').textContent(), /Modul 3 · Chomsky-Hierarchie/);
    assert.equal(await page.locator('#task-list button').count(), 19);
    for (const task of A.tasks.filter(t => t.legacyModule === 'W')) { await choose(task.id); assert.equal(await page.locator('.question-card').count(), task.parts.length); assert.equal(await page.locator('.part-feedback').count(), 0); }
  });
  await check('Vorbereitende Hierarchietabelle und schrittweise Hilfen bedienbar', async () => {
    await choose('W0'); assert.equal(await page.locator('.answer-body textarea').count(), 4); await field('a').fill('Typ 0: allgemeine Produktionen; Turingmaschine.');
    const help = page.getByRole('button', {name: 'Nächste Hilfe (1/3)', exact: true}); await help.click();
    assert.match(await page.locator('.task-help + .hint').textContent(), /linken Seiten/);
    assert.doesNotMatch(await page.locator('.task-help + .hint').textContent(), /Wählt pro/);
    await page.getByRole('button', {name: 'Nächste Hilfe (2/3)', exact: true}).click(); await page.getByRole('button', {name: 'Nächste Hilfe (3/3)', exact: true}).click();
    assert.equal(await page.getByRole('button', {name: 'Alle Hilfen geöffnet', exact: true}).isDisabled(), true);
    await submit(); assert.match(await card('a').textContent(), /Selbstkontrolle/);
  });
  await check('Wortentscheidungen, vollständige Ableitungen und getrennte Begründung', async () => {
    await choose('W1'); const selects = card('a').locator('select'); for (const [i, value] of ['Ja', 'Nein', 'Ja'].entries()) await selects.nth(i).selectOption(value);
    await field('b').fill(p('W1', 'b').solution); await field('c').fill('Im Wort fehlt abcd, also ist D nicht erreichbar.'); await field('d').fill(p('W1', 'd').solution); await submit();
    assert.equal(await page.locator('.part-feedback.correct').count(), 3); assert.equal(await page.locator('.part-feedback.manual').count(), 1);
    assert.match(await card('b').textContent(), /Schritt 1: S -> aA/); assert.equal((await page.locator('#task-content').textContent()).includes('\u21d2'), false);
  });
  await check('Analysegrammatik mit Start Z und automatisch erkanntem aussichtslosen Zweig', async () => {
    await choose('W2'); await card('a').locator('select').selectOption('2'); await field('d').fill('w\nv\nuvv'); await field('e').fill(p('W2', 'e').solution); await field('f').fill('Z -> X -> vXu'); await submit();
    for (const id of ['a', 'd', 'e', 'f']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1, id);
    assert.match(await card('f').textContent(), /nicht mehr erreichbar/);
  });
  await check('Intercity: umbenannte Grammatik und eigene Produktionsklassifikation', async () => {
    await choose('W3'); await field('a').fill('t1s22'); await field('b').fill('R -> 1s22 | 1R22\nQ -> tR'); await card('b').getByLabel('Startsymbol deiner Grammatik', {exact: true}).fill('Q');
    await card('c').locator('select').selectOption('2'); await card('e').locator('select').selectOption('Nein'); await submit();
    for (const id of ['a', 'b', 'c', 'e']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1, id);
    assert.match(await card('b').textContent(), /beweist Sprachgleichheit/);
  });
  await check('Eigene Grammatikdiagramme und Wortprobe zeigen den tatsächlichen Arbeitsstand', async () => {
    await choose('W3'); await card('b').getByRole('button', {name: 'Eigene Grammatik als Diagramme ansehen', exact: true}).click();
    assert.equal(await card('b').locator('.own-grammar-preview svg').count(), 2);
    await card('b').getByLabel('Testwort für deine Grammatik', {exact: true}).fill('t11s2222'); await card('b').getByRole('button', {name: 'Wort mit eigenen Regeln prüfen', exact: true}).click();
    assert.match(await card('b').locator('[role="status"]').textContent(), /durch deine Grammatik erzeugbar/);
    await field('b').fill('Z -> tW\nW -> 1W22 | 1s2'); assert.equal(await card('b').locator('.own-grammar-preview svg').count(), 0);
    await card('b').getByLabel('Startsymbol deiner Grammatik', {exact: true}).fill('Z'); await submit(); assert.match(await card('b').textContent(), /Gegenbeispiel/);
  });
  await check('Alternative rekursive Grammatik: offen mit Musterlösung und Prüfaspekten', async () => {
    await field('b').fill('Z -> tA\nA -> 1A22 | 1B22\nB -> s'); await submit();
    assert.equal(await card('b').locator('.part-feedback.open').count(), 1); await card('b').locator('summary').click();
    assert.match(await card('b').locator('.expectation').textContent(), /Z → tW/); assert.match(await card('b').textContent(), /Prüfaspekte für die Selbstkontrolle/);
    assert.match(await page.locator('#task-total').textContent(), /fachlich offen/);
  });
  await check('Hierarchie: Wahrheitswerte automatisch, Begründungen als Selbstkontrolle', async () => {
    await choose('W4'); for (const [i, v] of ['Richtig', 'Richtig', 'Falsch', 'Falsch'].entries()) await card('a').locator('select').nth(i).selectOption(v);
    for (const id of ['b', 'c', 'd', 'e']) await field(id).fill(p('W4', id).solution);
    await submit(); assert.equal(await page.locator('.part-feedback.correct').count(), 1); assert.equal(await page.locator('.part-feedback.manual').count(), 4);
    await card('c').locator('summary').click(); assert.match(await card('c').textContent(), /ε-erweiterten/);
  });
  await check('LaTeX: Originalmaterialien, lesbare Listen und skalierbare Diagramme', async () => {
    await choose('W5'); assert.equal(await page.locator('.wiki-list-options article').count(), 3); assert.equal(await page.locator('.wiki-materials .reference-card').count(), 2);
    assert.equal(await page.locator('.wiki-materials pre').textContent(), A.wiki3.material1);
    await page.getByRole('button', {name: 'Liste vergrößern', exact: true}).click(); assert.equal(await page.locator('.wiki-materials output').first().textContent(), '125 %');
    await page.getByRole('button', {name: 'Liste verkleinern', exact: true}).click();
    for (const detail of await page.locator('.wiki-materials details').all()) { await detail.locator('summary').click(); assert.equal(await detail.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), true); }
    assert.equal((await page.request.get(base + '/materials/wiki3/arbeitsblatt.docx')).status(), 200);
    const download = page.waitForEvent('download'); await page.getByRole('link', {name: 'Korrigiertes Arbeitsblatt herunterladen', exact: true}).click(); assert.match((await download).suggestedFilename(), /Arbeitsblatt.docx$/);
    await noOverflow(); await page.screenshot({path: path.join(output, 'wiki3-desktop.png'), fullPage: true});
  });
  await check('Syntaxdiagramm Zahl im bestehenden grafischen Editor bearbeitbar', async () => {
    await card('d').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf-panel').isVisible(), false);
    await page.locator('#diagram-list [data-rule="Zahl"] [data-node=""] .empty').click(); await page.locator('#nodetype').selectOption('lit');
    await page.locator('#nodevalue').fill('$42$'); await page.locator('#nodevalue').press('Tab');
    assert.equal(await page.locator('#ebnf').inputValue(), 'Zahl = "$42$";');
    await choose('W4'); await choose('W5'); await card('d').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'Zahl = "$42$";');
  });
  await check('LaTeX-Grammatik und Ableitung mit umbenannten Nichtterminalen', async () => {
    await card('a').locator('select').selectOption('Liste 2');
    const grammar = A.wiki3.latex.replace(/Liste/g, 'Sammlung').replace(/item"/g, 'item "').split('\n').reverse().join('\n');
    await field('e').fill(grammar); await card('e').getByLabel('Startsymbol deiner Grammatik', {exact: true}).fill('<Sammlung>');
    await field('f').fill(A.wiki3.latexDerive.replace(/Liste/g, 'Sammlung').replace(/item(?=["$])/g, 'item ')); await submit();
    for (const id of ['a', 'e', 'f']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1, id);
    assert.match(await card('d').textContent(), /Gegenbeispiel/); // A single $42$ is not the whole Zahl language.
    assert.match(await card('f').textContent(), /mit deiner Grammatik zulässig/);
  });
  await check('Arbeitsstände, Startsymbole und grafischer Entwurf bleiben nach Reload erhalten', async () => {
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('syntaxlabor-v41-progress')).attempts.W5?.checked);
    await page.reload(); await nav('W'); await choose('W5');
    assert.equal(await card('e').getByLabel('Startsymbol deiner Grammatik', {exact: true}).inputValue(), '<Sammlung>'); assert.match(await field('f').inputValue(), /<Sammlung>/);
    await card('d').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'Zahl = "$42$";');
    await nav('labor'); assert.equal(await page.locator('#ebnf').inputValue(), 'MeinEntwurf = "bleibt";');
  });
  await check('Trainingsmodus hält Hilfen verdeckt und friert nach Abgabe ein', async () => {
    await nav('W'); await choose('W3'); await page.locator('#train-mode').click();
    // It was previously checked, but had not been submitted in training mode.
    assert.equal(await page.locator('.task-help').count(), 0); assert.equal(await page.locator('.part-feedback').count(), 0);
    await submit(); assert.equal(await field('b').isDisabled(), true); assert.equal(await card('c').locator('select').isDisabled(), true);
    await page.locator('#learn-mode').click();
  });
  await check('Neue Kompetenzen und Lernstandsexport/-import berücksichtigen die eigene Grammatik', async () => {
    await nav('progress'); assert.match(await page.locator('.competency-card').nth(1).textContent(), /20 BE automatisch/);
    const downloading = page.waitForEvent('download'); await page.locator('#export-progress').click(); const download = await downloading;
    const file = path.join(output, 'wiki3-lernstand.json'); await download.saveAs(file);
    const saved = JSON.parse(await fs.readFile(file, 'utf8')); assert.equal(saved.attempts.W5.answers.e.start, '<Sammlung>');
    await nav('W'); await choose('W5'); await field('e').fill('<Sammlung> -> x');
    await nav('progress'); await page.getByLabel('Lernstand importieren', {exact: true}).setInputFiles(file);
    await page.waitForFunction(() => document.querySelector('#academy-status').textContent.includes('Lernstand importiert'));
    await nav('W'); await choose('W5'); assert.equal(await field('e').inputValue(), saved.attempts.W5.answers.e.text); assert.equal(await card('f').locator('.part-feedback.correct').count(), 1);
  });
  await check('iPad Hoch-/Querformat und Smartphone: alle Aufgaben ohne Seitenüberlauf', async () => {
    const touch = await browser.newContext({viewport: {width: 820, height: 1180}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
    const tablet = await touch.newPage(); tablet.on('pageerror', e => errors.push(e.message)); await tablet.goto(base); await tablet.locator('#primary-nav [data-view="M3"]').click();
    for (const width of [820, 1180, 390]) {
      await tablet.setViewportSize({width, height: width === 1180 ? 820 : 1180});
      for (const task of A.tasks.filter(t => t.legacyModule === 'W')) { await tablet.locator(`[data-task="${task.id}"]`).click(); await noOverflow(tablet); }
      const zoom = tablet.getByRole('button', {name: 'Liste vergrößern', exact: true}); await zoom.tap(); assert.equal(await tablet.locator('.wiki-materials output').first().textContent(), '125 %'); await noOverflow(tablet);
      await tablet.screenshot({path: path.join(output, `wiki3-${width === 390 ? 'phone' : 'ipad-' + width}.png`), fullPage: true});
    }
    await touch.close();
  });
  await check('Tastaturbedienung, Offline-Aufruf und unverändertes freies Labor', async () => {
    await choose('W5'); const zoom = page.getByRole('button', {name: 'Liste vergrößern', exact: true}); await zoom.focus(); await zoom.press('Enter'); assert.equal(await page.locator('.wiki-materials output').first().textContent(), '125 %');
    const offline = await browser.newContext({offline: true}); const local = await offline.newPage(); local.on('pageerror', e => errors.push(e.message)); await local.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await local.locator('#primary-nav [data-view="M3"]').click(); await local.locator('[data-task="W5"]').click(); assert.equal(await local.locator('.wiki-list-options article').count(), 3);
    await local.locator('.wiki-materials details summary').first().click(); await local.waitForFunction(() => document.querySelector('.wiki-materials img').naturalWidth > 0);
    await offline.close(); await nav('labor'); assert.equal(await page.locator('#ebnf').inputValue(), 'MeinEntwurf = "bleibt";');
  });
  await check('Keine JavaScript- oder Konsolenfehler', async () => assert.deepEqual(errors, []));
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  await fs.writeFile(path.join(output, 'wiki3-browser-results.json'), JSON.stringify({environment, records, errors}, null, 2));
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
});
