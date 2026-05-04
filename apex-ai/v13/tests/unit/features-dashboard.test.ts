/**
 * Tests features/dashboard (port v12 vDashboard).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { computeKpis, escapeHtml, loadAlerts, loadTodos } from '../../features/dashboard/index.js';

describe('features/dashboard — escapeHtml', () => {
  it('échappe < > & " \'', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("L'apostrophe")).toBe('L&#39;apostrophe');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('idempotent sur texte clean', () => {
    expect(escapeHtml('Hello world')).toBe('Hello world');
  });
});

describe('features/dashboard — computeKpis', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('retourne 5 KPIs (messages, tokens, projects, sentinels, todos)', async () => {
    const kpis = await computeKpis();
    expect(kpis).toHaveLength(5);
    const ids = kpis.map((k) => k.id);
    expect(ids).toContain('messages');
    expect(ids).toContain('tokens');
    expect(ids).toContain('projects');
    expect(ids).toContain('sentinels');
    expect(ids).toContain('todos');
  });

  it('chaque KPI a route + couleur + label', async () => {
    const kpis = await computeKpis();
    for (const k of kpis) {
      expect(k.route).toBeTruthy();
      expect(k.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(k.label.length).toBeGreaterThan(0);
    }
  });

  it('messages KPI lit ax_messages_24h depuis localStorage', async () => {
    localStorage.setItem('apex_v13_messages_24h', '42');
    const kpis = await computeKpis();
    const msg = kpis.find((k) => k.id === 'messages');
    expect(msg?.value).toBe(42);
  });

  it('tokens KPI gère valeur invalide gracefully', async () => {
    localStorage.setItem('apex_v13_tokens_24h', 'not-a-number');
    const kpis = await computeKpis();
    const tok = kpis.find((k) => k.id === 'tokens');
    expect(tok?.value).toBe('0');
  });

  it('todos KPI compte les pending dans ax_claude_todo', async () => {
    localStorage.setItem('ax_claude_todo', JSON.stringify([
      { id: 'a', status: 'pending' },
      { id: 'b', status: 'pending' },
      { id: 'c', status: 'resolved' },
    ]));
    const kpis = await computeKpis();
    const t = kpis.find((k) => k.id === 'todos');
    expect(t?.value).toBe(2);
  });

  it('todos KPI gère JSON corrompu', async () => {
    localStorage.setItem('ax_claude_todo', '{not_valid_json');
    const kpis = await computeKpis();
    const t = kpis.find((k) => k.id === 'todos');
    expect(t?.value).toBe(0);
  });

  it('todos KPI gère array null gracefully', async () => {
    localStorage.setItem('ax_claude_todo', 'null');
    const kpis = await computeKpis();
    const t = kpis.find((k) => k.id === 'todos');
    expect(t?.value).toBe(0);
  });
});

describe('features/dashboard — loadAlerts', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('retourne array vide si aucun problème', async () => {
    const alerts = await loadAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('détecte credentials expirés depuis localStorage', async () => {
    localStorage.setItem('apex_v13_credentials_expiring', JSON.stringify([
      { service: 'Anthropic', days_left: 5 },
      { service: 'Stripe', days_left: 14 },
      { service: 'OpenAI', days_left: 90 }, /* trop loin */
    ]));
    const alerts = await loadAlerts();
    const credAlerts = alerts.filter((a) => a.id.startsWith('cred_'));
    expect(credAlerts.length).toBeGreaterThanOrEqual(2);
    expect(credAlerts[0]?.level).toBe('error'); /* 5 jours = error */
  });

  it('gère localStorage corrompu', async () => {
    localStorage.setItem('apex_v13_credentials_expiring', 'invalid json');
    const alerts = await loadAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });
});

describe('features/dashboard — loadTodos', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('retourne [] si pas de todos', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('charge les todos pending depuis ax_claude_todo', () => {
    localStorage.setItem('ax_claude_todo', JSON.stringify([
      { id: 't1', reason: 'Fix bug X', severity: 'high', ts: 123, status: 'pending' },
      { id: 't2', reason: 'Resolved', severity: 'low', ts: 456, status: 'resolved' },
    ]));
    const todos = loadTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]?.id).toBe('t1');
    expect(todos[0]?.title).toBe('Fix bug X');
    expect(todos[0]?.severity).toBe('high');
  });

  it('limite à 5 todos max', () => {
    const list = [];
    for (let i = 0; i < 10; i++) {
      list.push({ id: `t${i}`, reason: `T${i}`, status: 'pending' });
    }
    localStorage.setItem('ax_claude_todo', JSON.stringify(list));
    const todos = loadTodos();
    expect(todos.length).toBeLessThanOrEqual(5);
  });

  it('gère JSON malformé', () => {
    localStorage.setItem('ax_claude_todo', '{broken');
    expect(loadTodos()).toEqual([]);
  });

  it('utilise defaults si champs manquants', () => {
    localStorage.setItem('ax_claude_todo', JSON.stringify([
      { status: 'pending' }, /* no id, no reason, no severity */
    ]));
    const todos = loadTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]?.title).toBe('Todo sans description');
    expect(todos[0]?.severity).toBe('medium');
  });
});
