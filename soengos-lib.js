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

  return {
    escapeHtml,
    getAllowedNavigationUrl,
    normalizePath,
    joinPath,
    resolveFsPath,
    sanitizeEntryName,
    parseJsonArray,
    loadStoredJsonArray,
    parseCommandLine,
    createFileItemElement,
  };
});
