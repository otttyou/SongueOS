'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');

const lib = require('../soengos-lib.js');
const {
  escapeHtml,
  getAllowedNavigationUrl,
  parseYoutubeVideoId,
  getYoutubeEmbedUrl,
  getWikipediaPageRef,
  normalizePath,
  joinPath,
  resolveFsPath,
  sanitizeEntryName,
  parseJsonArray,
  parseCommandLine,
  createFileItemElement,
} = lib;

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "'><svg onload=alert(1)>",
  'javascript:alert(1)',
  '"><iframe src="javascript:alert(1)">',
  '&lt;script&gt;alert(1)&lt;/script&gt;<img src=x onerror=alert(1)>',
];

test('escapeHtml encodes markup and quotes', () => {
  assert.equal(escapeHtml('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');
  assert.equal(escapeHtml('a&b'), 'a&amp;b');
  assert.equal(escapeHtml('"quoted"'), '&quot;quoted&quot;');
  assert.equal(escapeHtml("it's"), 'it&#39;s');
  assert.equal(escapeHtml(null), 'null');
});

test('escapeHtml never leaves XSS payloads executable as HTML', () => {
  for (const payload of XSS_PAYLOADS) {
    const encoded = escapeHtml(payload);
    assert.equal(encoded.includes('<'), false, payload);
    assert.equal(encoded.includes('>'), false, payload);
    assert.equal(/<script/i.test(encoded), false, payload);
    const attr = `<div data-name="${encoded}"></div>`;
    assert.match(attr, /data-name="[^"]*"/);
    assert.equal(attr.includes('<img'), false, payload);
  }
});

test('getAllowedNavigationUrl allows http(s), about:blank, and soeng pages', () => {
  assert.equal(getAllowedNavigationUrl('about:blank'), 'about:blank');
  assert.equal(getAllowedNavigationUrl('soeng://welcome'), 'soeng://welcome');
  assert.equal(getAllowedNavigationUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(getAllowedNavigationUrl('http://example.com'), 'http://example.com/');
  assert.equal(
    getAllowedNavigationUrl('example.com/docs', 'https://soengos.local/'),
    'https://example.com/docs'
  );
});

test('getAllowedNavigationUrl blocks javascript, data, and malformed schemes', () => {
  assert.equal(getAllowedNavigationUrl('javascript:alert(1)'), null);
  assert.equal(getAllowedNavigationUrl('JAVASCRIPT:alert(1)'), null);
  assert.equal(getAllowedNavigationUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(getAllowedNavigationUrl('file:///etc/passwd'), null);
  assert.equal(getAllowedNavigationUrl('vbscript:msgbox(1)'), null);
  assert.equal(getAllowedNavigationUrl('soeng://welcome<script>'), null);
  assert.equal(getAllowedNavigationUrl('soeng://welcome/../x'), null);
  assert.equal(getAllowedNavigationUrl(''), null);
});

test('parseYoutubeVideoId reads watch, short, embed, and bare ids', () => {
  assert.equal(parseYoutubeVideoId('aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
  assert.equal(parseYoutubeVideoId('https://www.youtube.com/watch?v=aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
  assert.equal(parseYoutubeVideoId('https://youtu.be/aqz-KE-bpKQ?t=12'), 'aqz-KE-bpKQ');
  assert.equal(parseYoutubeVideoId('https://www.youtube.com/embed/aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
  assert.equal(parseYoutubeVideoId('https://www.youtube.com/shorts/aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
  assert.equal(parseYoutubeVideoId('javascript:alert(1)'), null);
  assert.equal(parseYoutubeVideoId('https://example.com/watch?v=aqz-KE-bpKQ'), null);
  assert.equal(getYoutubeEmbedUrl('https://youtu.be/aqz-KE-bpKQ'), 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ');
});

test('getWikipediaPageRef reads language and title', () => {
  assert.deepEqual(getWikipediaPageRef('https://en.wikipedia.org/wiki/Operating_system'), {
    lang: 'en',
    title: 'Operating_system',
  });
  assert.deepEqual(getWikipediaPageRef('https://zh.wikipedia.org/wiki/操作系统'), {
    lang: 'zh',
    title: '操作系统',
  });
  assert.deepEqual(getWikipediaPageRef('https://en.m.wikipedia.org/wiki/Linux'), {
    lang: 'en',
    title: 'Linux',
  });
  assert.equal(getWikipediaPageRef('https://example.com/wiki/Linux'), null);
});

test('normalizePath and joinPath collapse traversal', () => {
  assert.equal(normalizePath('/home/user/../user/Documents'), '/home/user/Documents');
  assert.equal(normalizePath('/home/user/./Projects'), '/home/user/Projects');
  assert.equal(normalizePath('/home/user/../../etc'), '/etc');
  assert.equal(normalizePath('/'), '/');
  assert.equal(joinPath('/home/user', '..'), '/home');
  assert.equal(joinPath('/home/user', 'Documents'), '/home/user/Documents');
  assert.equal(joinPath('/', 'etc'), '/etc');
});

test('resolveFsPath handles absolute, relative, and home paths', () => {
  assert.equal(resolveFsPath('/home/user', ''), '/home/user');
  assert.equal(resolveFsPath('/home/user', '~'), '/home/user');
  assert.equal(resolveFsPath('/home/user', '~/Documents'), '/home/user/Documents');
  assert.equal(resolveFsPath('/home/user', '/etc'), '/etc');
  assert.equal(resolveFsPath('/home/user', '..'), '/home');
  assert.equal(resolveFsPath('/home/user', 'Documents/../Pictures'), '/home/user/Pictures');
});

test('sanitizeEntryName blocks path separators and empty names', () => {
  assert.equal(sanitizeEntryName('foo/bar'), 'foo-bar');
  assert.equal(sanitizeEntryName('foo\\bar'), 'foo-bar');
  assert.equal(sanitizeEntryName(''), 'untitled');
  assert.equal(sanitizeEntryName('...'), 'untitled');
  assert.equal(sanitizeEntryName('ok.txt'), 'ok.txt');
  assert.equal(sanitizeEntryName('"><img src=x>'), '"><img src=x>');
});

test('parseJsonArray recovers from corrupt localStorage payloads', () => {
  assert.deepEqual(parseJsonArray('["ls","pwd"]'), ['ls', 'pwd']);
  assert.deepEqual(parseJsonArray('not-json'), []);
  assert.deepEqual(parseJsonArray('{"owned":true}'), []);
  assert.deepEqual(parseJsonArray('null', ['fallback']), ['fallback']);
  assert.deepEqual(parseJsonArray('', ['fallback']), ['fallback']);
});

test('parseCommandLine keeps quoted XSS filenames intact', () => {
  assert.deepEqual(parseCommandLine('ls'), ['ls']);
  assert.deepEqual(parseCommandLine('cd /etc'), ['cd', '/etc']);
  assert.deepEqual(
    parseCommandLine(`touch '"><img src=x onerror=alert(1)>'`),
    ['touch', '"><img src=x onerror=alert(1)>']
  );
  assert.deepEqual(
    parseCommandLine('cat "report 2026.txt"'),
    ['cat', 'report 2026.txt']
  );
});

test('createFileItemElement stores names as text, not HTML', () => {
  class FakeEl {
    constructor(tag) {
      this.tagName = tag;
      this.dataset = {};
      this.children = [];
      this.textContent = '';
      this.className = '';
      this.innerHTML = '';
    }
    appendChild(child) {
      this.children.push(child);
      return child;
    }
  }
  const fakeDoc = { createElement: (tag) => new FakeEl(tag) };
  const payload = '"><img src=x onerror=alert(1)>';
  const item = createFileItemElement(payload, 'file', fakeDoc);
  assert.equal(item.dataset.name, payload);
  assert.equal(item.dataset.type, 'file');
  assert.equal(item.children[0].textContent, payload);
  assert.equal(item.innerHTML, '');
  assert.equal(item.children[0].innerHTML, '');
});

test('library attaches the same exports in a browser-like global', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'soengos-lib.js'), 'utf8');
  const sandbox = { globalThis: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox);
  assert.equal(typeof sandbox.parseYoutubeVideoId, 'function');
  assert.equal(typeof sandbox.escapeHtml, 'function');
  assert.equal(sandbox.escapeHtml('<x>'), '&lt;x&gt;');
  assert.equal(sandbox.getAllowedNavigationUrl('javascript:alert(1)'), null);
});

test('inline SoengOS script is valid JavaScript', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  assert.ok(scripts.length >= 1, 'expected an inline runtime script');
  for (const source of scripts) {
    const tmp = path.join(__dirname, `.inline-${process.pid}.js`);
    fs.writeFileSync(tmp, source);
    try {
      const result = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    } finally {
      fs.unlinkSync(tmp);
    }
  }
});

test('SoengOS.html exposes media and productivity apps', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  const requiredApps = ['notes', 'music', 'photos', 'podcast', 'tv', 'browser', 'filemanager'];
  for (const app of requiredApps) {
    assert.match(html, new RegExp(`openApp\\('${app}'\\)`), app);
    assert.match(html, new RegExp(`data-app="${app}"`), app);
    assert.match(html, new RegExp(`case '${app}'`), app);
  }
  assert.match(html, /function openNotes/);
  assert.match(html, /function openMusic/);
  assert.match(html, /function openPhotos/);
  assert.match(html, /function openPodcast/);
  assert.match(html, /function openTV/);
});

test('SoengOS.html ships the Fable theme', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  for (const token of ['--espresso: #181410', '--cream: #f6f1e4', 'id="radiant-glow"', '"Helvetica Neue"']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Fable Edition/i);
  assert.ok(html.includes('#f3ebe0'), 'paper studio field');
  assert.equal(html.includes('Zen Dawn'), false);
  assert.equal(html.includes('Engineering Minimalism Edition'), false);
});

test('SoengOS.html plays live music, YouTube TV, and framed web pages', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  assert.match(html, /AudioContext/);
  assert.match(html, /youtube-nocookie/);
  assert.match(html, /data-tv-url/);
  assert.match(html, /media\/open-cinema\.mp4/);
  assert.match(html, /function renderBrowserFrame/);
  assert.match(html, /wikipedia\.org\/api\/rest_v1\/page\/summary/);
  assert.match(html, /sandbox = 'allow-scripts/);
  assert.match(html, /class="tv-desk"/);
  assert.match(html, /data-tv-action="theater"/);
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'soengos-lib.js'), 'utf8'), /youtube-nocookie\.com\/embed/);
});

test('SoengOS.html exposes the practical app launcher and curved motion system', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  for (const token of ['--radius-lg: 18px', '--radius-pill: 999px', 'id="app-launcher"', 'function launchFromLauncher']) {
    assert.ok(html.includes(token), token);
  }
  for (const app of ['filemanager', 'notes', 'browser', 'music', 'photos', 'podcast', 'tv', 'terminal', 'workflow', 'automation', 'settings']) {
    assert.match(html, new RegExp(`launchFromLauncher\\('${app}'\\)`), app);
  }
  assert.match(html, /function newWorkflow\(\) \{[\s\S]*kanban-card/);
});

test('SoengOS.html loads the shared security library', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  assert.match(html, /<script src="soengos-lib\.js"><\/script>/);
  assert.equal(html.includes('data-pplx-inline-edit'), false);
  assert.equal(/win\.innerHTML = `[\s\S]*<span class="title">\$\{title\}/.test(html), false);
  assert.match(html, /titleEl\.textContent = title/);
  assert.match(html, /prompt\.textContent/);
  assert.match(html, /getAllowedNavigationUrl/);
});

test('getSoengIconSvg returns rounded stroke icons', () => {
  const { getSoengIconSvg } = lib;
  const svg = getSoengIconSvg('notes', 24);
  assert.match(svg, /stroke-linecap="round"/);
  assert.match(svg, /stroke-linejoin="round"/);
  assert.match(svg, /viewBox="0 0 24 24"/);
  assert.equal(getSoengIconSvg('missing'), '');
  assert.match(getSoengIconSvg('workflow', 32), /rx="2\.2"/);
});

test('mountSoengIcons is wired in the desktop shell', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'SoengOS.html'), 'utf8');
  assert.match(html, /mountSoengIcons\(\)/);
  assert.match(html, /data-soeng-icon="notes"/);
  assert.match(html, /getSoengIconSvg\('podcast'/);
});

test('soengos-lib.js has valid syntax', () => {
  const result = spawnSync(process.execPath, ['--check', path.join(__dirname, '..', 'soengos-lib.js')], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
});
