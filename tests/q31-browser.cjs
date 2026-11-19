const {chromium} = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs/promises'), path = require('node:path'), http = require('node:http');
const {pathToFileURL} = require('node:url');
const A = require('../curriculum-tasks.js');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'test-results');
const records = [], errors = [], environment = {node: process.version, platform: process.platform};
let browser, server, page, base;
const task = id => A.tasks.find(t => t.id === id), part = (id, p) => task(id).parts.find(part => part.id === p);
const card = id => page.locator(`#task-content [data-part="${id}"]`);
async function choose(id) {
  const link = page.locator(`[data-task="${id}"]`); if (!await link.isVisible()) await page.locator('.additional-tasks>summary').click(); await link.click();
}
async function section(id) {
  const p = card(id), ancestor = p.locator('xpath=ancestor::details[contains(@class,"task-section")]');
  if (await ancestor.count() && !await p.isVisible()) await ancestor.locator(':scope>summary').click(); return p;
}
async function field(id, text) { const c = await section(id); await c.locator('textarea').first().fill(text); }
async function nav(id) { await page.locator(`#primary-nav [data-view="${id}"]`).click(); }
async function code(id, text) {
  const c = await section(id); await c.locator('.open-workspace').click(); await page.locator('#ebnf').fill(text); await page.waitForFunction(() => document.querySelector('#syncstate').textContent === 'Synchron');
}
async function selectNode(rule, key) { const n = page.locator(`#diagram-list [data-rule="${rule}"] [data-node="${key}"]`).first(); await n.focus(); await n.press('Enter'); }
async function submit() { await page.locator('#submit-task').click(); }
async function noOverflow(p = page) { const size = await p.evaluate(() => [innerWidth, document.documentElement.scrollWidth]); assert.ok(size[1] <= size[0] + 1, JSON.stringify(size)); }
async function check(name, fn) {
  const start = Date.now();
  try { await fn(); records.push({name, passed: true, ms: Date.now() - start}); console.log('PASS ' + name); }
  catch (e) { records.push({name, passed: false, error: e.message}); await page?.screenshot({path: path.join(output, 'q31-failure.png'), fullPage: true}); throw e; }
}
async function main() {
  await fs.mkdir(output, {recursive: true});
  server = http.createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]); if (rel === '/favicon.ico') { res.writeHead(204).end(); return; }
      const file = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel)); if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const data = await fs.readFile(file), mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.md': 'text/plain'}[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': mime}).end(data);
    } catch (_) { res.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}); environment.browser = await browser.version();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, acceptDownloads: true});
  await context.addInitScript(() => {
    if (!localStorage.getItem('syntaxlabor-v41-progress')) localStorage.setItem('syntaxlabor-v41-progress', JSON.stringify({version: '4.1', attempts: {A1: {answers: {c: {text: 'S \u21d2 aS \u21d2 aaS \u21d2 aaaS \u21d2 aaab'}}}}}));
  });
  page = await context.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); await page.goto(base);
  await check('Vier erkennbare Lernmodule im vorhandenen Labor und transparenter fehlender Quelltext', async () => {
    assert.equal(await page.locator('#primary-nav button').count(), 7); assert.equal(await page.locator('.learning-module').count(), 4);
    assert.deepEqual(await page.locator('.learning-module .eyebrow').allTextContents(), ['Wikiseite 1', 'Wikiseite 2', 'Wikiseite 3', 'Wikiseite 4']);
    await page.screenshot({path: path.join(output, 'q31-lernweg-desktop.png'), fullPage: true});
    await page.locator('[data-module="M1"]').click(); assert.match(await page.locator('.source-gap').textContent(), /noch nicht bereitgestellt/); assert.equal(await page.locator('.main-task-list .task-link').count(), 4); await noOverflow();
    assert.deepEqual(await page.locator('.main-task-list [data-task]').evaluateAll(nodes => nodes.map(n => n.dataset.task)), ['F1', 'F4', 'F2', 'F3']);
  });
  await check('Öffnen und Hilfe ansehen zählt noch nicht als Bearbeitung; echte Eingaben aktualisieren den Status', async () => {
    await choose('F4'); await choose('F1');
    assert.equal(await page.locator('[data-task="F4"] small').textContent(), 'Noch offen');
    await choose('F4'); await page.getByRole('button', {name: 'Nächste Hilfe (1/3)', exact: true}).click();
    await choose('F1'); assert.equal(await page.locator('[data-task="F4"] small').textContent(), 'Noch offen');
    await choose('F4'); await card('a').locator('select').first().selectOption('Richtig');
    assert.equal(await page.locator('[data-task="F4"] small').textContent(), 'In Bearbeitung');
    assert.match(await page.locator('#task-total').textContent(), /Antwort gespeichert/);
  });
  await check('Geöffnete Hilfestufen bleiben nach Aufgabenwechsel und Reload erhalten', async () => {
    await choose('F1'); await page.getByRole('button', {name: 'Nächste Hilfe (1/3)', exact: true}).click();
    await choose('F2'); await choose('F1'); assert.equal(await page.locator('.task-help+.hint>p').count(), 1);
    assert.equal(await page.getByRole('button', {name: 'Nächste Hilfe (2/3)', exact: true}).count(), 1);
    await page.reload(); await nav('M1');
    assert.equal(await page.locator('.task-help+.hint>p').count(), 1);
    assert.equal(await page.locator('[data-task="F1"] small').textContent(), 'Noch offen');
    await page.getByRole('button', {name: 'Nächste Hilfe (2/3)', exact: true}).click(); await page.getByRole('button', {name: 'Nächste Hilfe (3/3)', exact: true}).click();
    await choose('F2'); await choose('F1'); assert.equal(await page.locator('.task-help+.hint>p').count(), 3);
    assert.equal(await page.getByRole('button', {name: 'Alle Hilfen geöffnet', exact: true}).isDisabled(), true);
  });
  await check('Grundlagen: Wortzugehörigkeit, passende Hilfestufen und sichtbarer Bearbeitungsfortschritt', async () => {
    await choose('F2'); const choices = card('a').locator('select'); for (const [i, value] of ['Ja', 'Ja', 'Ja', 'Nein', 'Nein', 'Nein', 'Nein'].entries()) await choices.nth(i).selectOption(value);
    const hint = page.getByRole('button', {name: 'Nächste Hilfe (1/4)', exact: true}); await hint.click(); assert.match(await page.locator('.task-help+.hint').textContent(), /Pflichtanfang/); assert.doesNotMatch(await page.locator('.task-help+.hint').textContent(), /Produktionsregeln/);
    await submit(); assert.match(await card('a').locator('.part-feedback').textContent(), /7 \/ 7 BE/); assert.match(await page.locator('#module-progress').textContent(), /1\/4 Lernschritte/);
    await page.getByRole('button', {name: 'Nächste Aufgabe →', exact: true}).click(); assert.match(await page.locator('.task-title').textContent(), /F3/);
  });
  await check('Syntax und Semantik werden auch bei Division durch null getrennt bewertet', async () => {
    for (const [i, value] of ['Ja', 'Ja', 'Nein', 'Nein'].entries()) await card('a').locator('select').nth(i).selectOption(value);
    await field('b', '8/0 hat das richtige Format, aber keine definierte Divisionsbedeutung.'); await submit();
    assert.equal(await card('a').locator('.part-feedback.correct').count(), 1); assert.equal(await card('b').locator('.part-feedback.manual').count(), 1);
  });
  await check('Geänderte Antworten entwerten alte Rückmeldungen und benötigen im Training eine neue Abgabe', async () => {
    await choose('F2'); await card('a').locator('select').first().selectOption('Nein');
    assert.equal(await card('a').locator('.part-feedback.correct').count(), 0); assert.match(await card('a').locator('.part-feedback.stale').textContent(), /Arbeitsstand geändert/);
    await page.locator('#train-mode').click(); assert.equal(await page.locator('.part-feedback').count(), 0); assert.equal(await card('a').locator('select').first().isDisabled(), false);
    await submit(); assert.equal(await card('a').locator('select').first().isDisabled(), true); await page.locator('#learn-mode').click();
    assert.equal(await page.getByRole('button', {name: 'Nächste Hilfe (2/4)', exact: true}).count(), 1);
    await card('a').locator('select').first().selectOption('Ja'); await page.locator('#train-mode').click();
    assert.equal(await page.locator('.part-feedback').count(), 0); assert.equal(await card('a').locator('select').first().isDisabled(), false); await page.locator('#learn-mode').click();
  });
  await check('Modul 2 bündelt Quellen und erhält alte Aufgabenstände unter stabilen IDs', async () => {
    await nav('M2'); assert.match(await card('c').locator('textarea').inputValue(), /^S -> aS/);
    assert.equal(await page.locator('.main-task-list .task-link').count(), 11); assert.equal(await page.locator('.additional-tasks').getAttribute('open'), null);
    assert.equal((await page.request.get(base + '/materials/q31/wiki2.pdf')).status(), 200); assert.equal((await page.request.get(base + '/materials/q31/grammatiken.docx')).status(), 200);
    await page.locator('.additional-tasks>summary').click(); await choose('C2'); assert.equal(await page.locator('.question-card').count(), 3); await choose('A1'); assert.match(await card('c').locator('textarea').inputValue(), /aaab$/);
  });
  await check('BNF mit ::= und EBNF aus der Wiki-Komma/Punktnotation werden akzeptiert', async () => {
    await choose('G11'); await field('a', '<Zahl> ::= <Ziffer> | <Ziffer><Zahl>\n<Ziffer> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"');
    assert.equal(await card('a').locator('textarea').getAttribute('autocapitalize'), 'off');
    await code('b', 'Zahl = Ziffer, {Ziffer}.\nZiffer = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9".'); await submit();
    for (const id of ['a', 'b']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1, id);
  });
  await check('Mehrere eigenständig gewählte Ableitungen werden pro Kette semantisch geprüft', async () => {
    await choose('A2'); await field('e', 'S -> b\nS -> aS -> ab\nS -> aS -> aaS -> aab'); await field('f', 'S -> ε\nS -> aSb -> ab\nS -> aSb -> aaSbb -> aabb'); await submit();
    for (const id of ['e', 'f']) { await section(id); assert.equal(await card(id).locator('.part-feedback.correct').count(), 1); assert.match(await card(id).textContent(), /Kette 3/); }
  });
  await check('Lange Aufgaben sind gegliedert und äquivalente verschachtelte EBNF wird erkannt', async () => {
    await choose('G5'); assert.equal(await page.locator('.task-section').count(), 4); assert.equal(await card('j').isVisible(), false);
    await code('j', 'Sprache = {"b" | "ab" | "aab"} ["a" ["a"]] .'); await submit(); await section('j'); assert.equal(await card('j').locator('.part-feedback.correct').count(), 1);
  });
  await check('Wahlaufgabe nutzt die eigene Grammatik; A und B sind alternative Lernwege', async () => {
    await choose('G10A'); await field('a', 'Q -> aR\nR -> aR | bR | b'); await card('a').getByLabel('Startsymbol deiner Grammatik', {exact: true}).fill('Q');
    await field('c', 'Q -> aR -> ab\nQ -> aR -> abR -> abb'); await card('f').locator('select').selectOption('3'); await submit();
    for (const id of ['a', 'c', 'f']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1);
    assert.match(await page.locator('#module-progress').textContent(), /genügt ein Weg/);
  });
  await check('Vollständige Hierarchie einschließlich echter kontextabhängiger Typ-1-Ableitung', async () => {
    await nav('M3'); await page.locator('#hierarchy-guide summary').click(); assert.deepEqual(await page.locator('#hierarchy-guide .badge').allTextContents(), ['Typ 3', 'Typ 2', 'Typ 1', 'Typ 0']);
    await choose('B13'); await card('a').locator('select').selectOption('1'); await field('b', part('B13', 'b').solution); await submit();
    assert.equal(await card('b').locator('.part-feedback.correct').count(), 1); assert.match(await card('b').textContent(), /CB → BC/);
  });
  await check('EBNF-II 1: alle Originaldiagramme und explizite Analyse des Komma-Rückwegs', async () => {
    await nav('M4'); assert.equal(await page.locator('.main-task-list .task-link').count(), 4); await choose('H1');
    await page.locator('.source-materials>summary').click(); await page.waitForFunction(() => [...document.querySelectorAll('.source-materials img')].every(img => img.complete && img.naturalWidth > 0));
    assert.equal(await page.locator('.source-materials img').count(), 3); await page.locator('.source-materials>summary').click();
    assert.match(await page.locator('.task-intro').textContent(), /Komma-Rückweg/);
    const box = page.locator('.reference-diagrams svg .block').first(), initial = await box.evaluate(el => el.getBoundingClientRect().width);
    await page.getByRole('button', {name: 'Satz vergrößern', exact: true}).click();
    const enlarged = await box.evaluate(el => el.getBoundingClientRect().width); assert.ok(enlarged > initial * 1.2 && enlarged < initial * 1.3);
    await code('a', A.q31.sentence); await code('c', part('H1', 'c').answer); await submit();
    for (const id of ['a', 'c']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1);
  });
  await check('EBNF-II 2: Term ausschließlich im vorhandenen grafischen Editor vollständig gezeichnet', async () => {
    await choose('H2'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf-panel').isVisible(), false);
    await page.locator('#nodetype').selectOption('seq');
    await selectNode('Term', 'items.0'); await page.locator('#nodetype').selectOption('ref');
    await selectNode('Term', 'items.1'); await page.locator('#nodetype').selectOption('seq');
    await selectNode('Term', 'items.1.items.0'); await page.locator('#nodetype').selectOption('alt');
    await selectNode('Term', 'items.1.items.0.items.0'); await page.locator('#nodevalue').fill('*'); await page.locator('#nodevalue').press('Tab');
    await selectNode('Term', 'items.1.items.0.items.1'); await page.locator('#nodevalue').fill('/'); await page.locator('#nodevalue').press('Tab');
    await selectNode('Term', 'items.1.items.1'); await page.locator('#nodetype').selectOption('ref');
    await selectNode('Term', 'items.1'); await page.locator('#wraprep').click();
    assert.equal(await page.locator('#ebnf').inputValue(), 'Term = Zahl {("*" | "/") Zahl};\nZahl = "z";');
    await submit(); assert.equal(await card('a').locator('.part-feedback.correct').count(), 1);
  });
  await check('EBNF-II 3: gemischte Datumstrenner, Kalenderabgrenzung und erklärter Randfall Jahr 0', async () => {
    await choose('H3'); await code('a', part('H3', 'a').alternatives[0]);
    for (const [i, value] of ['Ja', 'Ja', 'Ja', 'Nein', 'Nein'].entries()) await card('b').locator('select').nth(i).selectOption(value); await submit();
    for (const id of ['a', 'b']) assert.equal(await card(id).locator('.part-feedback.correct').count(), 1); assert.match(await card('a').textContent(), /Randfrage Jahr 0/);
    assert.match(await page.locator('#task-total').textContent(), /12 \/ 12 BE automatisch/);
    assert.equal(await page.locator('.task-title>.badge').textContent(), '15 BE');
    await card('a').locator('summary').click(); assert.equal(await card('a').locator('.expectation pre').count(), 2);
    await page.screenshot({path: path.join(output, 'q31-datum-desktop.png'), fullPage: true});
  });
  await check('EBNF-II 4: Originalmaterial und große Hilfsdiagramme bleiben lesbar aufklappbar', async () => {
    await choose('H4'); await page.locator('.source-materials>summary').click(); await page.waitForFunction(() => document.querySelector('.source-materials img').naturalWidth > 0);
    await page.locator('.source-materials .diagram-zoom button').last().click(); assert.equal(await page.locator('.source-materials output').textContent(), '125 %'); await page.locator('.source-materials>summary').click();
    const c = await section('c'); await c.locator('.open-workspace').click(); assert.equal(await page.locator('#diagram-list .helper-diagram').count(), 2); assert.equal(await page.locator('#diagram-list [data-rule="Wort"]').isVisible(), false);
    await page.locator('#diagram-list .helper-diagram>summary').first().click(); assert.equal(await page.locator('#diagram-list [data-rule="Wort"]').isVisible(), true);
    await selectNode('EMail', ''); await page.locator('#nodetype').selectOption('ref'); await page.locator('#nodevalue').fill('Name');
    await choose('H3'); await choose('H4'); await section('c'); await card('c').locator('.open-workspace').click(); assert.match(await page.locator('#ebnf').inputValue(), /^EMail = Name;/);
  });
  await check('E-Mail-Listen und vollständige Ableitung mit erlaubten Wort-/Textblöcken', async () => {
    await code('b', A.q31.mailEBNF); await section('d'); await card('d').locator('select').nth(0).selectOption('Ja'); await card('d').locator('select').nth(1).selectOption('Nein');
    await field('f', A.q31.mailDerive); await submit(); for (const id of ['b', 'd', 'f']) { await section(id); assert.equal(await card(id).locator('.part-feedback.correct').count(), 1, id); }
    assert.match(await card('f').textContent(), /Wort und Text/); await section('b'); assert.match(await card('b').textContent(), /exakt nachgewiesen/);
    await page.screenshot({path: path.join(output, 'q31-email-desktop.png'), fullPage: true});
  });
  await check('Neue Antworten, Wahlweg und E-Mail-Ableitung bleiben nach Reload und Export/Import erhalten', async () => {
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('syntaxlabor-v41-progress')).attempts.H4?.checked); await page.reload(); await nav('M4'); await choose('H4'); await section('f'); assert.equal(await card('f').locator('textarea').inputValue(), A.q31.mailDerive);
    await nav('progress'); const pending = page.waitForEvent('download'); await page.locator('#export-progress').click(); const file = path.join(output, 'q31-lernstand.json'); await (await pending).saveAs(file);
    const saved = JSON.parse(await fs.readFile(file, 'utf8')); assert.equal(saved.attempts.G10A.answers.a.start, 'Q'); assert.equal(saved.attempts.H4.answers.f.text, A.q31.mailDerive);
    assert.equal(saved.attempts.F1.hintCount, 3); assert.equal(saved.attempts.F1.assisted, true);
    await page.getByLabel('Lernstand importieren', {exact: true}).setInputFiles(file); await page.waitForFunction(() => document.querySelector('#academy-status').textContent.includes('Lernstand importiert'));
    await nav('M1'); assert.equal(await page.locator('.task-help+.hint>p').count(), 3); assert.equal(await page.getByRole('button', {name: 'Alle Hilfen geöffnet', exact: true}).isDisabled(), true);
    await nav('M2'); await choose('G10A'); assert.equal(await card('a').getByLabel('Startsymbol deiner Grammatik', {exact: true}).inputValue(), 'Q');
  });
  await check('Desktop und iPad-Touchansichten: vier Module, Originalbilder und Zeicheneditor ohne Seitenüberlauf', async () => {
    const touch = await browser.newContext({viewport: {width: 820, height: 1180}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
    const tablet = await touch.newPage(); tablet.on('pageerror', e => errors.push(e.message)); await tablet.goto(base);
    for (const [width, height] of [[820, 1180], [1180, 820], [390, 844]]) {
      await tablet.setViewportSize({width, height});
      for (const m of A.modules) { await tablet.locator(`#primary-nav [data-view="${m.id}"]`).tap(); await noOverflow(tablet); }
      await tablet.locator('[data-task="H4"]').tap(); await tablet.locator('.source-materials>summary').tap(); await tablet.locator('.source-materials .diagram-zoom button').last().tap(); assert.equal(await tablet.locator('.source-materials output').textContent(), '125 %'); await noOverflow(tablet);
      await tablet.screenshot({path: path.join(output, `q31-${width === 390 ? 'phone' : 'ipad-' + width}.png`), fullPage: true});
    }
    await touch.close(); await nav('M4'); await choose('H2'); await card('a').locator('.open-workspace').click(); await noOverflow();
  });
  await check('Vier Lernmodule und Originalmaterial funktionieren direkt offline per file://', async () => {
    const offline = await browser.newContext({offline: true}); const local = await offline.newPage(); local.on('pageerror', e => errors.push(e.message)); await local.goto(pathToFileURL(path.join(root, 'index.html')).href);
    assert.equal(await local.locator('.learning-module').count(), 4); await local.locator('#primary-nav [data-view="M4"]').click(); await local.locator('[data-task="H4"]').click(); await local.locator('.source-materials>summary').click();
    await local.waitForFunction(() => document.querySelector('.source-materials img').naturalWidth > 0); await offline.close();
  });
  await check('Keine JavaScript- oder Konsolenfehler im vollständigen Vier-Modul-Lauf', async () => assert.deepEqual(errors, []));
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  await fs.writeFile(path.join(output, 'q31-browser-results.json'), JSON.stringify({environment, records, errors}, null, 2));
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
});
