/**
 * SoengOS shared security and filesystem helpers.
 * Loaded by SoengOS.html in the browser and by Node tests.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root && typeof root === 'object') {
    Object.assign(root, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getAllowedNavigationUrl(url, baseHref) {
    const trimmed = String(url || '').trim();
    if (!trimmed) return null;
    if (trimmed === 'about:blank') return 'about:blank';
    if (/^soeng:\/\/[A-Za-z0-9._~-]+$/.test(trimmed)) return trimmed;

    try {
      const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
      const base = baseHref || (typeof location !== 'undefined' ? location.href : 'https://soengos.local/');
      const parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`, base);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.href;
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  function parseYoutubeVideoId(input) {
    const raw = String(input || '').trim();
    if (!raw) return null;
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    try {
      const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const parsed = new URL(href);
      const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
      if (host === 'youtu.be') {
        const id = parsed.pathname.split('/').filter(Boolean)[0] || '';
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
        const fromQuery = parsed.searchParams.get('v') || '';
        if (/^[A-Za-z0-9_-]{11}$/.test(fromQuery)) return fromQuery;
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length >= 2 && /^(embed|shorts|live)$/.test(parts[0]) && /^[A-Za-z0-9_-]{11}$/.test(parts[1])) {
          return parts[1];
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function getYoutubeEmbedUrl(input) {
    const id = parseYoutubeVideoId(input);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  function getWikipediaPageRef(href) {
    try {
      const parsed = new URL(href);
      const host = parsed.hostname.toLowerCase();
      if (host === 'wikipedia.org' || host === 'www.wikipedia.org') {
        return { lang: 'en', title: 'Wikipedia' };
      }
      const match = host.match(/^([a-z]{2,3})\.(?:m\.)?wikipedia\.org$/);
      if (!match) return null;
      const path = parsed.pathname;
      if (path === '/' || path === '/wiki' || path === '/wiki/') {
        return { lang: match[1], title: 'Main_Page' };
      }
      const wiki = path.match(/^\/wiki\/([^/#]+)/);
      if (!wiki) return null;
      return { lang: match[1], title: decodeURIComponent(wiki[1]) };
    } catch (e) {
      return null;
    }
  }

  function normalizePath(path) {
    const parts = String(path || '/').split('/').filter(Boolean);
    const stack = [];
    parts.forEach(part => {
      if (part === '.') return;
      if (part === '..') stack.pop();
      else stack.push(part);
    });
    return '/' + stack.join('/');
  }

  function joinPath(base, name) {
    return normalizePath((base === '/' ? '' : base) + '/' + name);
  }

  function resolveFsPath(cwd, input, home = '/home/user') {
    const raw = String(input || '').trim();
    if (!raw || raw === '~') return home;
    if (raw.startsWith('~/')) return normalizePath(home + raw.slice(1));
    if (raw.startsWith('/')) return normalizePath(raw);
    return joinPath(cwd, raw);
  }

  function sanitizeEntryName(name) {
    const cleaned = String(name ?? '')
      .replace(/[\\/]/g, '-')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/^\.+$/, 'untitled')
      .trim();
    return cleaned || 'untitled';
  }

  function parseJsonArray(raw, fallback = []) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function loadStoredJsonArray(key, fallback = []) {
    try {
      if (typeof localStorage === 'undefined') return fallback.slice();
      return parseJsonArray(localStorage.getItem(key) || 'null', fallback).slice();
    } catch (e) {
      return fallback.slice();
    }
  }

  function parseCommandLine(raw) {
    const tokens = [];
    let current = '';
    let quote = null;
    const input = String(raw || '');
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (quote) {
        if (ch === quote) quote = null;
        else current += ch;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (/\s/.test(ch)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }
      current += ch;
    }
    if (current) tokens.push(current);
    return tokens;
  }

  function createFileItemElement(name, type, documentRef) {
    const doc = documentRef || (typeof document !== 'undefined' ? document : null);
    if (!doc) throw new Error('document is required');
    const item = doc.createElement('div');
    item.className = 'fm-item ' + type;
    item.dataset.name = name;
    item.dataset.type = type;
    const span = doc.createElement('span');
    span.textContent = name;
    item.appendChild(span);
    return item;
  }

  const SOENG_ICON_PATHS = {
    filemanager:
      '<path d="M5.5 9.2V7.5c0-1.1.9-2 2-2h4.2c.5 0 1 .2 1.4.5l1.5 1.5H18c1.1 0 2 .9 2 2v8.5c0 1.1-.9 2-2 2H7.5c-1.1 0-2-.9-2-2V9.2z"/>',
    file:
      '<path d="M8 5.2h6.8l2.2 2.2H19c.8 0 1.4.6 1.4 1.4v11.6c0 .8-.6 1.4-1.4 1.4H8c-.8 0-1.4-.6-1.4-1.4V5.2z"/><path d="M10.2 10.8h7.2M10.2 14h7.2M10.2 17.2h4.8"/>',
    notes:
      '<path d="M8 4.8h8c.9 0 1.6.7 1.6 1.6v13.2c0 .9-.7 1.6-1.6 1.6H8c-.9 0-1.6-.7-1.6-1.6V6.4c0-.9.7-1.6 1.6-1.6z"/><path d="M10 10h6M10 13.2h6M10 16.4h4.2"/>',
    browser:
      '<circle cx="12" cy="12" r="8.2"/><path d="M12 3.8c2.2 2.5 3.5 5.2 3.5 8.2s-1.3 5.7-3.5 8.2M12 3.8c-2.2 2.5-3.5 5.2-3.5 8.2s1.3 5.7 3.5 8.2"/><path d="M4 12h16"/>',
    music:
      '<circle cx="8.2" cy="17.2" r="2"/><circle cx="17" cy="15.2" r="2"/><path d="M10.2 17.2V8.5c0-.3.2-.5.5-.5h7.8c.3 0 .5.2.5.5v6.7"/>',
    photos:
      '<path d="M5.2 7.8c0-.9.7-1.6 1.6-1.6h11.6c.9 0 1.6.7 1.6 1.6v8.4c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6V7.8z"/><circle cx="9.5" cy="10.8" r="1.8"/><path d="M5.2 16.2l4.8-4.2 3.2 3 2.8-2.5 4.8 4.5"/>',
    podcast:
      '<path d="M10.2 5.5c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v5.4c0 1-.8 1.8-1.8 1.8s-1.8-.8-1.8-1.8V5.5z"/><path d="M7.8 13.2c0 2.3 1.9 4.2 4.2 4.2s4.2-1.9 4.2-4.2"/><path d="M12 17.5v1.8M9.6 19.3h4.8"/>',
    tv:
      '<path d="M4.8 7.5c0-.9.7-1.6 1.6-1.6h12.4c.9 0 1.6.7 1.6 1.6v7.8c0 .9-.7 1.6-1.6 1.6H6.4c-.9 0-1.6-.7-1.6-1.6V7.5z"/><path d="M12 16.8v2"/><path d="M9.2 18.8h5.6"/>',
    terminal:
      '<path d="M5.5 5.8h13c.9 0 1.6.7 1.6 1.6v10.4c0 .9-.7 1.6-1.6 1.6h-13c-.9 0-1.6-.7-1.6-1.6V7.4c0-.9.7-1.6 1.6-1.6z"/><path d="M8.8 12.2l2.8 2.8-2.8 2.8"/><path d="M13.2 15.8h5"/>',
    settings:
      '<path d="M6.5 9.8h11"/><circle cx="9.5" cy="9.8" r="2"/><path d="M6.5 14.2h11"/><circle cx="14.5" cy="14.2" r="2"/>',
    workflow:
      '<rect x="4.5" y="4.5" width="6.8" height="6.8" rx="2.2"/><rect x="14.7" y="4.5" width="6.8" height="6.8" rx="2.2"/><rect x="4.5" y="14.7" width="6.8" height="6.8" rx="2.2"/><rect x="14.7" y="14.7" width="6.8" height="6.8" rx="2.2"/>',
    automation:
      '<circle cx="12" cy="12" r="2.6"/><path d="M12 5.5v2.2M12 16.3v2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M5.5 12h2.2M16.3 12h2.2M6.1 17.9l1.6-1.6M16.3 6.1l1.6-1.6"/>',
    power:
      '<path d="M12 6v5.5"/><path d="M8.5 8.8a5.2 5.2 0 1 0 7 0"/>',
    exhibitions:
      '<rect x="4.5" y="4.5" width="6.5" height="6.5" rx="2"/><rect x="14.5" y="4.5" width="6.5" height="6.5" rx="2"/><rect x="4.5" y="14.5" width="6.5" height="6.5" rx="2"/><circle cx="17.5" cy="17.5" r="2.2"/>',
    fable:
      '<circle cx="12" cy="12" r="7.5" stroke-dasharray="2 6"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
    cools:
      '<path d="M8 7h8M16 11H9M16 15H8M8 19h8M16 13H9"/><path d="M8 11h8M8 15h6"/>',
    portraits:
      '<ellipse cx="12" cy="11" rx="5.5" ry="6.5"/><path d="M6.5 20c1.2-3 3.4-4.5 5.5-4.5s4.3 1.5 5.5 4.5"/>',
    incident:
      '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/><rect x="7" y="8" width="10" height="8" rx="1.5"/>',
  };

  function getSoengIconSvg(id, size) {
    const paths = SOENG_ICON_PATHS[id];
    if (!paths) return '';
    const px = Number(size) > 0 ? Number(size) : 24;
    const strokeWidth = px >= 30 ? 1.15 : 1.35;
    return (
      '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="' + strokeWidth + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths +
      '</svg>'
    );
  }

  function mountSoengIcons(root) {
    const scope = root || (typeof document !== 'undefined' ? document : null);
    if (!scope) return;
    scope.querySelectorAll('[data-soeng-icon]').forEach((el) => {
      const id = el.getAttribute('data-soeng-icon');
      const size = el.getAttribute('data-icon-size') || 24;
      el.innerHTML = getSoengIconSvg(id, size);
    });
  }

  return {
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
    loadStoredJsonArray,
    parseCommandLine,
    createFileItemElement,
    SOENG_ICON_PATHS,
    getSoengIconSvg,
    mountSoengIcons,
  };
});
