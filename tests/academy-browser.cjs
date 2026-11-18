const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const A = require('../curriculum-tasks.js');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'test-results');
let browser, server, page, base, examDrawingDraft;
const records = [], errors = [], environment = {node: process.version, platform: process.platform};
async function check(name, fn) {
  const begin = Date.now();
  try { await fn(); records.push({name, passed: true, ms: Date.now() - begin}); console.log('PASS ' + name); }
  catch (e) { records.push({name, passed: false, error: e.message}); await page?.screenshot({path: path.join(output, 'academy-failure.png')}); throw e; }
}
async function nav(module) {
  if (module === 'E') { await page.locator('#primary-nav [data-view="exam"]').click(); await page.locator('#open-transfer').click(); }
  else await page.locator(`#primary-nav [data-view="${module}"]`).click();
}
async function choose(id) { await page.locator(`#task-list [data-task="${id}"]`).click(); }
const card = id => page.locator(`#task-content [data-part="${id}"]`);
async function ebnf(source) {
  await page.locator('#ebnf').fill(source);
  await page.waitForFunction(() => document.querySelector('#syncstate').textContent === 'Synchron');
}
async function code(part, source) { await card(part).locator('.open-workspace').click(); await ebnf(source); }
async function selectNode(name, p) {
  const node = page.locator(`#diagram-list .diagram-card[data-rule="${name}"] [data-node="${p}"]`).first();
  const block = node.locator(':scope > rect.block, :scope > rect.empty').first();
  if (await block.count()) await block.click(); else { await node.focus(); await node.press('Enter'); }
}
async function compareChoices(part, values) { const selects = card(part).locator('.answer-body select'); for (let i = 0; i < values.length; i++) await selects.nth(i).selectOption(values[i]); }
async function noOverflow() { const v = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]); assert.ok(v[1] <= v[0] + 1, JSON.stringify(v)); }
async function main() {
  await fs.mkdir(output, {recursive: true});
  server = http.createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]); if (rel === '/favicon.ico') { res.writeHead(204).end(); return; }
      const file = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel)); if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const data = await fs.readFile(file), mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain'}[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': mime + '; charset=utf-8'}).end(data);
    } catch (_) { res.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true}); environment.browser = await browser.version();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, acceptDownloads: true});
  page = await context.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); await page.goto(base);
  await check('Sieben Hauptbereiche und unverändertes freies Labor', async () => {
    assert.equal(await page.locator('#primary-nav button').count(), 7); await ebnf('freilabor = "bleibt";');
    assert.match(await page.locator('#lab-view').textContent(), /EBNF-Editor/); await noOverflow();
  });
  await check('Alle 50 Aufgaben mit vollständigen Arbeitsformaten erreichbar', async () => {
    for (const module of A.modules) {
      await nav(module.id); assert.equal(await page.locator('#task-list button').count(), A.tasks.filter(t => t.module === module.id).length);
      if (module.id === 'B') {
        assert.equal(await page.locator('#hierarchy-guide').isVisible(), true);
        assert.deepEqual(await page.locator('#hierarchy-guide .badge').allTextContents(), ['Typ 3', 'Typ 2', 'Typ 1', 'Typ 0']);
      }
      for (const task of A.tasks.filter(t => t.module === module.id)) {
        await choose(task.id); assert.equal(await page.locator('#task-content .question-card').count(), task.parts.length, task.id);
        assert.equal((await page.locator('#task-content').textContent()).includes('\u21d2'), false, task.id);
        assert.equal(await page.locator('#task-content .part-feedback').count(), 0, task.id);
        assert.match(await page.locator('.task-title').textContent(), new RegExp(task.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      }
    }
  });
  await check('Ableitungen verwenden -> in Eingaben, Rückmeldungen und Musterlösungen', async () => {
    await nav('A');
    assert.match(await card('c').locator('textarea').getAttribute('placeholder'), /S ->/);
    await card('c').locator('textarea').fill('S -> aS -> aaS -> aaaS -> aaab');
    await page.locator('#submit-task').click();
    assert.match(await card('c').textContent(), /Schritt 1: S -> aS/);
    await card('c').locator('summary').click();
    assert.equal(await card('c').locator('.expectation pre').textContent(), 'S -> aS -> aaS -> aaaS -> aaab');
    assert.equal((await page.locator('#task-content').textContent()).includes('\u21d2'), false);
  });
  await check('Alte gespeicherte Ableitungen werden beim Neuladen auf -> umgestellt', async () => {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => {
      if (location.protocol.startsWith('http') && !localStorage.getItem('syntaxlabor-v41-progress')) localStorage.setItem('syntaxlabor-v41-progress', JSON.stringify({version: '4.1', attempts: {A1: {answers: {c: {text: 'S \u21d2 aS \u21d2 aaS \u21d2 aaaS \u21d2 aaab'}}}}}));
    });
    const legacy = await ctx.newPage(); legacy.on('pageerror', e => errors.push(e.message)); await legacy.goto(base);
    await legacy.reload(); await legacy.locator('#primary-nav [data-view="A"]').click();
    const input = legacy.locator('[data-part="c"] textarea');
    assert.equal(await input.inputValue(), 'S -> aS -> aaS -> aaaS -> aaab');
    await input.fill('S \u21d2 aS \u21d2 aaS \u21d2 aaaS \u21d2 aaab'); await input.press('Tab');
    assert.equal(await input.inputValue(), 'S -> aS -> aaS -> aaaS -> aaab');
    await legacy.locator('#submit-task').click(); assert.match(await legacy.locator('[data-part="c"]').textContent(), /4 \/ 4 BE/);
    await ctx.close();
  });
  await check('Trainieren: keine Hilfen vor Abgabe, danach Punkte und gesperrte Antworten', async () => {
    await nav('A'); await page.locator('#train-mode').click();
    await card('a').getByLabel('Nichtterminale N', {exact: true}).fill('S'); await card('a').getByLabel('Terminale T', {exact: true}).fill('a,b'); await card('a').getByLabel('Startsymbol S').fill('S');
    await card('c').locator('textarea').fill('S -> aS -> aaS -> aaaS -> aaab');
    await card('b').locator('textarea').fill('P enthält die beiden Ersetzungen S → aS und S → b.');
    assert.equal(await page.locator('.task-help:visible').count(), 0); assert.equal(await page.locator('#task-content .expectation').count(), 0);
    await page.locator('#submit-task').click(); assert.match(await card('c').textContent(), /4 \/ 4 BE/); assert.equal(await card('c').locator('textarea').isDisabled(), true);
    await card('b').locator('summary').click(); await card('b').getByRole('combobox').selectOption('1'); assert.match(await page.locator('#task-total').textContent(), /1 \/ 6 BE selbst eingeschätzt/);
  });
  await check('Lernen: Hinweise auf Wunsch; Wechsel zu Trainieren verdeckt vorherige Rückmeldung', async () => {
    await choose('A2'); await page.locator('#learn-mode').click();
    await page.getByRole('button', {name: 'Hinweis', exact: true}).click(); assert.match(await page.locator('#task-content').textContent(), /Bei jedem Schritt/);
    await card('b').locator('textarea').fill('S -> aSb -> aaSbb -> aaaSbbb -> aaabbb'); await page.locator('#submit-task').click(); assert.ok(await page.locator('#task-content .part-feedback').count() > 0);
    await page.locator('#train-mode').click(); assert.equal(await page.locator('#task-content .part-feedback').count(), 0); assert.match(await page.locator('#task-content').textContent(), /Hilfe oder Musterlösung/);
  });
  await check('Chomsky: G1–G5 automatisch mit fachlichen Begründungen kontrollieren', async () => {
    await nav('B'); assert.equal(await page.locator('#hierarchy-guide').isVisible(), false); await compareChoices('a', ['3', '2', '2', '3', '2']); await page.locator('#submit-task').click();
    assert.match(await card('a').textContent(), /5 \/ 5 BE/); assert.match(await card('a').textContent(), /minimale Sprachklasse wird daraus nicht abgeleitet/);
    await page.locator('#curriculum-note > summary').click(); await page.locator('#formal-inspector > summary').click();
    await page.getByLabel('Eigene Produktionsregeln', {exact: true}).fill('S → ε | aS'); await page.getByRole('button', {name: 'Produktionsform prüfen', exact: true}).click();
    assert.match(await page.locator('#formal-inspector').textContent(), /Typ 2/); assert.match(await page.locator('#formal-inspector').textContent(), /nirgends rechts|rechts/);
    await page.locator('#curriculum-note > summary').click();
  });
  await check('Ableitungen: unzulässige Linksableitung und korrekte Rechtsableitung unterscheiden', async () => {
    await nav('A'); await choose('A3');
    await card('a').locator('textarea').fill('S -> AB -> AbB -> Abb -> aAbb -> aabb');
    await card('b').locator('textarea').fill('S -> AB -> AbB -> Abb -> aAbb -> aabb'); await page.locator('#submit-task').click();
    assert.match(await card('a').textContent(), /Keine zulässige Linksableitung/); assert.match(await card('b').textContent(), /4 \/ 4 BE/);
  });
  await check('Ableitungsbaum tatsächlich interaktiv erstellen und zurücknehmen', async () => {
    await choose('A4'); const tree = card('c');
    await tree.getByRole('button', {name: 'Baumknoten S', exact: true}).click(); await tree.getByRole('button', {name: 'S → bB', exact: true}).click();
    await tree.getByRole('button', {name: 'Baumknoten B', exact: true}).click(); await tree.getByRole('button', {name: 'B → a', exact: true}).click();
    assert.match(await tree.textContent(), /Aktuelle Satzform: ba/); await tree.getByRole('button', {name: 'Letzte Baum-Ersetzung zurücknehmen'}).click();
    assert.match(await tree.textContent(), /Aktuelle Satzform: bB/);
    await tree.getByRole('button', {name: 'Baumknoten B', exact: true}).click(); await tree.getByRole('button', {name: 'B → a', exact: true}).click();
    await page.locator('#submit-task').click(); assert.match(await tree.textContent(), /3 \/ 3 BE/);
  });
  await check('EBNF-Teilaufgaben haben eigene persistente Arbeitsbereiche; äquivalente Lösung akzeptiert', async () => {
    await nav('C'); await choose('C2'); await code('a', 'andererName = "ac" | "abc";');
    await choose('C3'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'zahl = ε;');
    await choose('C2'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'andererName = "ac" | "abc";');
    await page.locator('#submit-task').click(); assert.match(await card('a').textContent(), /4 \/ 4 BE/);
    await nav('labor'); assert.equal(await page.locator('#ebnf').inputValue(), 'freilabor = "bleibt";');
  });
  await check('Zeichenaufgabe im vorhandenen Editor lösen, ohne sichtbare EBNF', async () => {
    await nav('D'); await choose('D4'); await card('a').locator('.open-workspace').click();
    assert.equal(await page.locator('#ebnf-panel').isVisible(), false); assert.equal(await page.locator('#svgexport').isVisible(), false); assert.equal(await page.locator('.language-panel').isVisible(), false);
    await selectNode('wort', 'items.0'); await page.locator('#addafter').click(); await page.locator('#wrapopt').click();
    assert.equal(await page.locator('#ebnf').inputValue(), 'wort = "a" ["b"] "c";');
    assert.equal(await page.locator('#ebnf-panel').isVisible(), false); await page.locator('#submit-task').click();
    assert.match(await card('a').textContent(), /5 \/ 5 BE/); await card('a').locator('.open-workspace').click();
    assert.equal(await page.locator('#ebnf').isDisabled(), true); assert.equal(await page.locator('#ebnf-panel').isVisible(), true);
  });
  await check('Fehlerdiagramme: fehlender Bypass und echte Anschlusslücke korrigierbar', async () => {
    await choose('D3'); assert.equal(await page.locator('.reference-diagrams [data-type="rep"] > path.rail').count(), 6);
    await card('a').locator('.open-workspace').click(); await selectNode('wort', 'items.1'); await page.locator('#deletevisual').click();
    assert.equal(await page.locator('#ebnf').inputValue(), 'wort = "a" {"b"};'); await page.locator('#submit-task').click(); assert.match(await card('a').textContent(), /5 \/ 5 BE/);
    await choose('D9'); assert.equal(await page.locator('.reference-diagrams svg > rect[fill="#ffffff"]').count(), 1);
    await card('a').locator('.open-workspace').click(); await page.locator('#nodetype').selectOption('seq'); await page.locator('#submit-task').click(); assert.match(await card('a').textContent(), /4 \/ 4 BE/);
  });
  await check('Darstellungen mit einem eigenen Gegenbeispiel vergleichen', async () => {
    await choose('D11'); await card('a').locator('select').selectOption('Nein'); await card('a').getByLabel('Gegenbeispiel', {exact: true}).fill('abb');
    await page.locator('#submit-task').click(); assert.match(await card('a').textContent(), /3 \/ 3 BE/);
  });
  await check('Rekursive EBNF: begrenztes Ergebnis bleibt ausdrücklich offen', async () => {
    await nav('C'); await choose('C10'); const solution = A.tasks.find(t => t.id === 'C10').parts[0].answer;
    await code('a', solution); await page.locator('#submit-task').click(); assert.match(await card('a').textContent(), /kein Gleichwertigkeitsbeweis/); assert.match(await card('a').textContent(), /fachlich offen/);
  });
  await check('Mehrteilige Transferaufgabe hält Grundlösung und Erweiterung getrennt', async () => {
    await nav('E'); const t = A.tasks.find(t => t.id === 'E1'); await code('a', t.parts.find(p => p.id === 'a').answer);
    await card('e').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'paket = ε;');
    await ebnf(t.parts.find(p => p.id === 'e').answer); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), t.parts[0].answer);
  });
  await check('Lernfortschritt, Selbstbewertung und Reload', async () => {
    await nav('progress'); assert.equal(await page.locator('.competency-card').count(), 8);
    await page.locator('.competency-card select').first().selectOption('3'); await page.reload(); await nav('progress');
    assert.equal(await page.locator('.competency-card select').first().inputValue(), '3'); assert.match(await page.locator('#progress-view').textContent(), /selbst eingeschätzt/);
    await nav('C'); await choose('C2'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'andererName = "ac" | "abc";');
  });
  await check('Lernstandsdatei exportieren und validiert wiederherstellen', async () => {
    await nav('progress'); const waiting = page.waitForEvent('download'); await page.locator('#export-progress').click(); const download = await waiting;
    const file = path.join(output, 'lernstand-v4.1.json'); await download.saveAs(file); const saved = JSON.parse(await fs.readFile(file, 'utf8'));
    assert.equal(saved.version, '4.1'); assert.equal(saved.attempts.D4.answers.a.edits > 0, true);
    saved.ratings[0] = 2;
    await page.getByLabel('Lernstand importieren', {exact: true}).setInputFiles({name: 'lernstand.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saved))});
    await page.waitForFunction(() => document.querySelector('.competency-card select').value === '2');
    await page.getByLabel('Lernstand importieren', {exact: true}).setInputFiles({name: 'kaputt.json', mimeType: 'application/json', buffer: Buffer.from('{"version":"3"}')});
    assert.match(await page.locator('#academy-status').textContent(), /Import nicht übernommen/); assert.equal(await page.locator('.competency-card select').first().inputValue(), '2');
  });
  await check('Klausur 1: keine Lösungen oder Lernhilfen und keine Übernahme von Modulantworten', async () => {
    await nav('exam'); await page.locator('[data-exam="K1"]').click();
    assert.equal(await page.locator('#primary-nav [data-view="labor"]').isDisabled(), true); assert.equal(await page.locator('#curriculum-note').isVisible(), false);
    assert.equal(await page.locator('.task-help:visible').count(), 0); assert.equal(await page.locator('#task-content .part-feedback').count(), 0);
    await card('a').getByLabel('Nichtterminale N', {exact: true}).fill('S'); await card('a').getByLabel('Terminale T', {exact: true}).fill('a,b'); await card('a').getByLabel('Startsymbol S').fill('S');
    await card('c').locator('textarea').fill('S -> aS -> aaS -> aaaS -> aaab'); await card('b').locator('textarea').fill('P = {S → aS, S → b}.');
    await choose('E1'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'paket = ε;');
    assert.equal(await page.locator('.diagram-panel').isVisible(), false);
    const t = A.tasks.find(t => t.id === 'E1'); await ebnf(t.parts.find(p => p.id === 'a').answer);
    await card('b').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf-panel').isVisible(), false);
    await page.locator('#nodetype').selectOption('lit'); await page.locator('#nodevalue').fill('P');
    examDrawingDraft = await page.locator('#ebnf').inputValue();
    await compareChoices('c', ['Ja', 'Ja', 'Nein', 'Nein']); await code('e', t.parts.find(p => p.id === 'e').answer);
    assert.equal(await page.locator('#task-content .part-feedback').count(), 0);
  });
  await check('Laufende Klausur wird nach Reload mit ihren Antworten fortgesetzt', async () => {
    await page.reload(); assert.match(await page.locator('#academy-title').textContent(), /Übungsklausur 1/);
    assert.equal(await page.locator('#primary-nav [data-view="A"]').isDisabled(), true);
    await choose('E1'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), A.tasks.find(t => t.id === 'E1').parts[0].answer);
    await card('b').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), examDrawingDraft); assert.equal(await page.locator('#ebnf-panel').isVisible(), false);
  });
  await check('Klausur 1: Diagramm zeichnen und Abgabe mit getrennter Punkteauswertung', async () => {
    await choose('D6'); await card('a').locator('.open-workspace').click(); await page.locator('#nodetype').selectOption('seq');
    await selectNode('wort', 'items.0'); await page.locator('#addbranch').click(); await selectNode('wort', 'items.1'); await page.locator('#nodevalue').fill('c');
    assert.equal(await page.locator('#ebnf').inputValue(), 'wort = ("a" | "b") "c";');
    await card('b').locator('select').selectOption('Nein'); await card('b').getByLabel('Gegenbeispiel', {exact: true}).fill('a');
    await page.locator('#submit-exam').click(); assert.match(await page.locator('#task-total').textContent(), /29 \/ 34 BE automatisch geprüft/);
    assert.match(await page.locator('#task-total').textContent(), /0 \/ 6 BE selbst eingeschätzt/); assert.equal(await page.locator('#primary-nav [data-view="labor"]').isDisabled(), false);
    await choose('A1'); assert.equal(await card('c').locator('textarea').isDisabled(), true); await card('b').locator('summary').click(); await card('b').getByRole('combobox').selectOption('1');
    assert.match(await page.locator('#task-total').textContent(), /1 \/ 6 BE selbst eingeschätzt/);
    await nav('labor'); assert.equal(await page.locator('#ebnf').inputValue(), 'freilabor = "bleibt";');
  });
  await check('Klausur 2 unabhängig starten, bearbeiten und abgeben', async () => {
    await nav('exam'); await page.locator('[data-exam="K2"]').click();
    await card('a').locator('textarea').fill('S -> AB -> aAB -> aaB -> aabB -> aabb');
    await choose('E5'); await card('a').locator('.open-workspace').click(); assert.equal(await page.locator('#ebnf').inputValue(), 'messung = ε;');
    await ebnf(A.tasks.find(t => t.id === 'E5').parts[0].answer); await page.locator('#submit-exam').click(); assert.match(await page.locator('#task-total').textContent(), /9 \/ 30 BE automatisch geprüft/);
    await nav('exam'); assert.match(await page.locator('#exam-view').textContent(), /Abgabe und Erwartungshorizont ansehen/);
    await page.locator('.exam-card').first().getByRole('button', {name: 'Neuen Versuch starten'}).click(); assert.equal(await card('c').locator('textarea').inputValue(), '');
    await page.locator('#submit-exam').click(); await nav('progress');
    const raw = await page.evaluate(() => JSON.parse(localStorage.getItem('syntaxlabor-v41-progress'))); assert.equal(raw.exams.K1.archives.length, 1);
  });
  await check('Desktop- und iPad-Touchansicht der Aufgaben ohne Seitenüberlauf', async () => {
    await nav('A'); await choose('A4'); await page.setViewportSize({width: 1440, height: 1000}); await noOverflow();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({path: path.join(output, 'academy-desktop.png')});
    const touch = await browser.newContext({viewport: {width: 820, height: 1180}, isMobile: true, hasTouch: true}); const tablet = await touch.newPage(); tablet.on('pageerror', e => errors.push(e.message)); await tablet.goto(base);
    await tablet.locator('#primary-nav [data-view="D"]').tap(); await tablet.locator('#task-list [data-task="D4"]').tap(); await tablet.locator('[data-part="a"] .open-workspace').tap();
    await tablet.locator('#nodetype').selectOption('seq'); const sizes = await tablet.evaluate(() => [innerWidth, document.documentElement.scrollWidth]); assert.ok(sizes[1] <= sizes[0] + 1);
    assert.equal(await tablet.locator('#ebnf-panel').isVisible(), false); await tablet.screenshot({path: path.join(output, 'academy-ipad.png')}); await touch.close();
    await page.setViewportSize({width: 390, height: 844}); await noOverflow(); await page.screenshot({path: path.join(output, 'academy-phone.png')});
    const study = await browser.newContext({viewport: {width: 1440, height: 1000}}), overview = await study.newPage();
    overview.on('pageerror', e => errors.push(e.message)); await overview.goto(base); await overview.locator('#primary-nav [data-view="B"]').click();
    await overview.screenshot({path: path.join(output, 'chomsky-hierarchy.png')}); await study.close();
  });
  await check('Abiturtraining direkt offline per file:// nutzbar', async () => {
    const offline = await browser.newContext({offline: true}); const local = await offline.newPage(); local.on('pageerror', e => errors.push(e.message));
    await local.goto(pathToFileURL(path.join(root, 'index.html')).href); await local.locator('#primary-nav [data-view="B"]').click();
    assert.equal(await local.locator('#task-list [data-task]').count(), 12); await local.locator('#train-mode').click();
    await local.locator('[data-part="a"] select').first().selectOption('3'); await local.locator('#submit-task').click(); assert.match(await local.locator('[data-part="a"]').textContent(), /1 \/ 5 BE/); await offline.close();
  });
  await check('Keine JavaScript- oder Konsolenfehler im Trainingslauf', async () => assert.deepEqual(errors, []));
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  await fs.writeFile(path.join(output, 'academy-browser-results.json'), JSON.stringify({environment, records, errors}, null, 2));
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
});
