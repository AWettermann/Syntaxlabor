/* Real Chromium interaction tests. Uses installed Chrome, no browser download. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const C = require('../core.js');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'test-results');
const records = [], errors = [];
const environment = {node: process.version, platform: process.platform, browser: ''};
let browser, server, page;
async function check(name, fn) {
  const begin = Date.now();
  try { await fn(); records.push({name, passed: true, ms: Date.now() - begin}); console.log(`PASS ${name}`); }
  catch (e) { records.push({name, passed: false, error: e.message}); await page?.screenshot({path: path.join(output, 'failure.png'), fullPage: true}); throw e; }
}
async function text(source) {
  await page.locator('#ebnf').fill(source);
  await page.waitForFunction(() => document.querySelector('#syncstate').textContent === 'Synchron');
}
async function value() { return page.locator('#ebnf').inputValue(); }
async function count(n) { await page.waitForFunction(n => document.querySelectorAll('.diagram-card').length === n, n); }
async function select(name, node = '') { await page.locator(`.diagram-card[data-rule="${name}"] [data-node="${node}"]`).first().click({position: {x: 5, y: 5}}); }
async function word(w, expected) {
  await page.locator('#word').fill(w); await page.locator('#check').click();
  assert.match(await page.locator('#testresult').textContent(), expected ? /✓/ : /✗/);
}
async function noOverflow() {
  const sizes = await page.evaluate(() => ({viewport: innerWidth, body: document.documentElement.scrollWidth}));
  assert.ok(sizes.body <= sizes.viewport + 1, JSON.stringify(sizes));
}
async function main() {
  await fs.mkdir(output, {recursive: true});
  server = http.createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel === '/favicon.ico') { res.writeHead(204).end(); return; }
      const file = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel));
      if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain'}[path.extname(file)] || 'application/octet-stream';
      const data = await fs.readFile(file);
      res.writeHead(200, {'Content-Type': mime + '; charset=utf-8'}); res.end(data);
    } catch (_) { res.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  browser = await chromium.launch({executablePath, headless: true});
  environment.browser = await browser.version();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, acceptDownloads: true});
  page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await check('Start und lokale HTTP-Auslieferung', async () => {
    const response = await page.goto(base); assert.equal(response.status(), 200); await count(1);
    assert.equal(await page.title(), 'Syntaxlabor V4.1 · Abiturtraining Q3');
    assert.match(await value(), /wort = "a" \["b"\] \{"c"\};/); await noOverflow();
  });
  await check('14 — automatische EBNF-Synchronisierung und vier Diagramme', async () => {
    await text('wort = "a" ["b"] {"c"};\nziffer = "0" | "1" | "2";\nzahl = ziffer {ziffer};\nsatz = wort wort wort ".";'); await count(4);
    assert.equal(await page.locator('#startsymbol option').count(), 4);
    await page.locator('#startsymbol').selectOption('zahl'); await word('12012', true); await word('3', false);
  });
  await check('Ungültige Zwischenstände erhalten die letzten gültigen Diagramme', async () => {
    await page.locator('#ebnf').fill('wort = ["a"');
    await page.waitForFunction(() => document.querySelector('#ebnf').getAttribute('aria-invalid') === 'true'); await count(4);
    await page.locator('#new').click(); await count(4); assert.match(await page.locator('#status').textContent(), /vervollständige/);
    await page.locator('#revert').click(); assert.equal(await page.locator('#ebnf').getAttribute('aria-invalid'), 'false');
  });
  await check('11/12 — vollständig löschen und leeres Diagramm neu anlegen', async () => {
    await page.locator('#deleteall').click(); await count(0); assert.equal(await value(), ''); assert.equal(await page.locator('#startsymbol').isDisabled(), true);
    await page.locator('#new').click(); await count(1); assert.equal(await value(), 'wort = ε;'); await word('', true);
  });
  await check('13 — grafisches Einfügen und direkte Textbearbeitung', async () => {
    await page.locator('#nodetype').selectOption('lit'); assert.equal(await value(), 'wort = "a";');
    await page.locator('.diagram [data-type="lit"] > rect').dblclick();
    await page.getByRole('textbox', {name: 'Baustein direkt bearbeiten'}).fill('x');
    await page.getByRole('textbox', {name: 'Baustein direkt bearbeiten'}).press('Enter');
    assert.equal(await value(), 'wort = "x";');
    await page.locator('#addafter').click(); assert.equal(await value(), 'wort = "x" "b";');
    await page.locator('#nodevalue').fill('c'); assert.equal(await value(), 'wort = "x" "c";');
  });
  await check('Verschieben, Rückgängig und Wiederherstellen', async () => {
    await page.locator('#moveleft').click(); assert.equal(await value(), 'wort = "c" "x";');
    await page.locator('#undo').click(); assert.equal(await value(), 'wort = "x" "c";');
    await page.locator('#redo').click(); assert.equal(await value(), 'wort = "c" "x";');
    await page.locator('#moveright').click(); assert.equal(await value(), 'wort = "x" "c";');
  });
  await check('Option, Alternative, Wiederholung und Auswahl von Containern', async () => {
    await page.locator('#wrapopt').click(); assert.equal(await value(), 'wort = "x" ["c"];');
    await page.locator('#addbranch').click(); assert.equal(await value(), 'wort = "x" (["c"] | "b");');
    await page.locator('#wraprep').click(); assert.equal(await value(), 'wort = "x" (["c"] | {"b"});');
    await word('x', true); await word('xbb', true); await word('xc', true); await word('xcb', false);
    await page.locator('.rule-select').click(); assert.equal(await page.locator('#nodetype').inputValue(), 'seq');
  });
  await check('Baumeditor auswählen und Elemente vollständig entfernen', async () => {
    await page.locator('#visualtools summary').click();
    await page.locator('#tree button').filter({hasText: 'Terminal: "x"'}).click(); await page.locator('#deletevisual').click();
    assert.equal(await value(), 'wort = ["c"] | {"b"};');
    await page.locator('.rule-select').click(); await page.locator('#deletevisual').click(); assert.equal(await value(), 'wort = ε;');
    await page.locator('.remove-rule').click(); await count(0);
    await page.locator('#undo').click(); await count(1); await page.locator('#redo').click(); await count(0);
  });
  await check('Nichtterminale, Umbenennen und konsistente Referenzen', async () => {
    await text('atom = "a"; wort = atom {atom};');
    await page.locator('.diagram-card[data-rule="atom"] .rule-select').click();
    await page.locator('#rulename').fill('zeichen'); await page.locator('#rulename').press('Tab');
    assert.equal(await value(), 'zeichen = "a";\nwort = zeichen {zeichen};');
    await page.locator('#startsymbol').selectOption('wort'); await word('aaa', true);
    await page.locator('.diagram-card[data-rule="wort"] [data-type="ref"]').first().click(); assert.equal(await page.locator('#nodetype').inputValue(), 'ref');
    await page.locator('#nodevalue').fill('fehlt'); await page.waitForFunction(() => document.querySelector('#diagnostics').textContent.includes('fehlt'));
    await word('a', false).catch(async () => assert.match(await page.locator('#testresult').textContent(), /nicht definiert/));
    assert.match(await page.locator('#testresult').textContent(), /nicht definiert/);
  });
  await check('Sprachbeschreibung, ε und sortierte Beispielwörter', async () => {
    await text('wort = "a" {"b"};');
    await page.waitForFunction(() => document.querySelector('#math').textContent.includes('ⁿ'));
    const examples = await page.locator('#words button').allTextContents(); assert.deepEqual(examples.slice(0, 4), ['a', 'ab', 'abb', 'abbb']);
    await page.locator('#words button').nth(2).click(); assert.match(await page.locator('#testresult').textContent(), /✓/);
    await text('wort = {"a"};'); await page.waitForFunction(() => document.querySelector('#words button')?.textContent === 'ε'); await word('', true);
    await text('wort = ε | "a" wort "b";'); await word('aaabbb', true); await word('aab', false);
    await page.waitForFunction(() => document.querySelector('#analysisnote').textContent.includes('kein Beweis'));
  });
  await check('Beide Roundtrips bewahren die Bedeutung', async () => {
    await text('s = ("a" | "b") ["c"] {"d"};');
    const before = C.parse(await value()).rules; await page.locator('#toebnf').click();
    const formatted = await value(); await text(formatted + '\n');
    const after = C.parse(await value()).rules; assert.equal(C.equivalent(before, 's', after, 's').kind, 'equal');
  });
  await check('19 — SVG- und PNG-Export als echte Dateien', async () => {
    await text('wort = "a" ["b"] {"c"};');
    for (const [id, extension] of [['svgexport', 'svg'], ['pngexport', 'png']]) {
      const wait = page.waitForEvent('download'); await page.locator('#' + id).click(); const download = await wait;
      assert.equal(download.suggestedFilename(), `wort.${extension}`);
      const file = path.join(output, `export.${extension}`); await download.saveAs(file); const data = await fs.readFile(file); assert.ok(data.length > 100);
      if (extension === 'png') assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      else { assert.match(data.toString(), /<svg/); assert.doesNotMatch(data.toString(), /class="rail-node selected"/); }
    }
  });
  await check('EBNF-Datei importieren und speichern', async () => {
    await page.locator('#openfile').setInputFiles({name: 'import.ebnf', mimeType: 'text/plain', buffer: Buffer.from('neu = "x";')});
    await count(1); await page.waitForFunction(() => document.querySelector('#ebnf').value === 'neu = "x";');
    const wait = page.waitForEvent('download'); await page.locator('#saveebnf').click(); const download = await wait;
    const file = path.join(output, 'saved.ebnf'); await download.saveAs(file); assert.equal(await fs.readFile(file, 'utf8'), 'neu = "x";');
  });
  await check('20 — alle sechs Aufgaben in beiden Modi laden und bearbeiten', async () => {
    await page.locator('#legacy-training > summary').click();
    for (let i = 0; i < 6; i++) {
      for (const mode of ['write', 'draw']) {
        await page.locator('#exercise-select').selectOption(String(i)); await page.locator('#mode-' + mode).click(); await page.locator('#exercise').click();
        const ex = require('../exercises.js')[i]; assert.equal(await value(), ex.starter);
        assert.equal(await page.locator('#answer').isHidden(), true);
        await page.locator('#showanswer').click(); assert.equal(await page.locator('#answer').textContent(), ex.answer);
        await text(ex.answer); await page.locator('#checkanswer').click();
        assert.match(await page.locator('#training-result').textContent(), i === 5 ? /beweist keine Gleichwertigkeit/ : /Sprachlich gleichwertig/);
      }
    }
  });
  await check('Training akzeptiert äquivalente Lösungen und erklärt Gegenbeispiele', async () => {
    await page.locator('#exercise-select').selectOption('0'); await page.locator('#exercise').click();
    await text('andererName = "ac" | "abc";'); await page.locator('#checkanswer').click(); assert.match(await page.locator('#training-result').textContent(), /Sprachlich gleichwertig/);
    await text('andererName = "ac";'); await page.locator('#checkanswer').click(); assert.match(await page.locator('#training-result').textContent(), /Gegenbeispiel: "abc"/);
  });
  await check('Entwurf bleibt nach Neuladen erhalten', async () => {
    await text('s = "speichern";'); await page.reload(); assert.equal(await value(), 's = "speichern";');
    await page.locator('#ebnf').fill('s = ['); await page.waitForFunction(() => document.querySelector('#ebnf').getAttribute('aria-invalid') === 'true');
    await page.reload(); assert.equal(await value(), 's = ['); await count(1); assert.equal(await page.locator('#ebnf').getAttribute('aria-invalid'), 'true'); await page.locator('#revert').click();
  });
  await check('Tastaturbedienung im Diagramm', async () => {
    await text('s = "a";'); const node = page.locator('.diagram [data-node=""]'); await node.focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#nodevalue').evaluate(el => el === document.activeElement), true);
  });
  await check('iPad-Touchbedienung des grafischen Editors', async () => {
    const touch = await browser.newContext({viewport: {width: 820, height: 1180}, isMobile: true, hasTouch: true});
    const tablet = await touch.newPage(); tablet.on('pageerror', e => errors.push(e.message)); await tablet.goto(base);
    await tablet.locator('#deleteall').tap(); await tablet.locator('#new').tap(); await tablet.locator('#nodetype').selectOption('lit');
    await tablet.locator('#nodevalue').fill('touch'); await tablet.locator('#wraprep').tap();
    assert.equal(await tablet.locator('#ebnf').inputValue(), 'wort = {"touch"};');
    await tablet.locator('#undo').tap(); assert.equal(await tablet.locator('#ebnf').inputValue(), 'wort = "touch";');
    await touch.close();
  });
  await check('Desktop, iPad und Smartphone ohne Seitenüberlauf', async () => {
    await text('wort = "a" ["b"] {"c"};\nziffer = "0" | "1" | "2";\nzahl = ziffer {ziffer};');
    await page.waitForFunction(() => document.querySelectorAll('#words button').length === 15);
    for (const [name, width, height] of [['desktop', 1440, 1000], ['ipad', 820, 1180], ['phone', 390, 844]]) {
      await page.setViewportSize({width, height}); await noOverflow();
      // A fresh page avoids stale compositor tiles after repeated viewport resizes.
      const capture = await context.newPage(); await capture.setViewportSize({width, height}); await capture.goto(base);
      await capture.waitForFunction(() => document.querySelectorAll('#words button').length === 15);
      await capture.screenshot({path: path.join(output, `${name}.png`), fullPage: name !== 'phone'});
      await capture.close();
    }
  });
  await check('Direkt per file:// und ohne Netzwerk nutzbar', async () => {
    const offline = await browser.newContext({offline: true}); const local = await offline.newPage();
    local.on('pageerror', e => errors.push(e.message)); await local.goto(pathToFileURL(path.join(root, 'index.html')).href);
    assert.equal(await local.locator('.diagram-card').count(), 1); await local.locator('#ebnf').fill('s = "offline";');
    await local.waitForFunction(() => document.querySelector('.rule-select')?.textContent === 's'); await offline.close();
  });
  await check('Keine JavaScript- oder Konsolenfehler', async () => assert.deepEqual(errors, []));
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  await fs.writeFile(path.join(output, 'browser-results.json'), JSON.stringify({environment, records, errors}, null, 2));
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
});
