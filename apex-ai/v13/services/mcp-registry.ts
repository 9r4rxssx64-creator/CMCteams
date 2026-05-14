/**
 * APEX v13 — MCP Servers Registry
 *
 * Catalogue des serveurs MCP connus + auto-registration au boot.
 * Stockage : localStorage `ax_mcp_servers` + Firebase FB_FIX shared.
 *
 * Serveurs intégrés par défaut :
 * - BOFiP fiscal (Bulletin Officiel Finances Publiques FR)
 * - Almanac Deep Research (openalmanac.dev)
 * - Legal Data Hunter (18M docs juridiques 110+ pays)
 *
 * Kevin admin peut ajouter d'autres serveurs via vue ?view=mcp-servers.
 */

import { logger } from '../core/logger.js';
import { auditLog } from './audit-log.js';
import { mcpClient, type McpServer } from './mcp-client.js';

const STORAGE_KEY = 'ax_mcp_servers';

const DEFAULT_SERVERS: McpServer[] = [
  {
    id: 'bofip',
    name: 'BOFiP — Bulletin Officiel Finances Publiques',
    url: 'https://mcp.openlegi.fr/bofip/mcp',
    tokenKey: 'bofip_token',
    status: 'unknown',
    toolsExposed: [],
    lastCheck: 0,
    errorCount: 0,
  },
  {
    id: 'almanac',
    name: 'Almanac — Deep Research Agent',
    url: 'https://mcp.openalmanac.dev/mcp',
    tokenKey: 'almanac_token',
    status: 'unknown',
    toolsExposed: [],
    lastCheck: 0,
    errorCount: 0,
  },
  {
    id: 'legal-hunter',
    name: 'Legal Data Hunter — 18M docs juridiques 110+ pays',
    url: 'https://mcp.openlegi.fr/legal/mcp',
    tokenKey: 'legal_hunter_token',
    status: 'unknown',
    toolsExposed: [],
    lastCheck: 0,
    errorCount: 0,
  },
];

class McpRegistry {
  /**
   * Init au boot : merge default servers avec ceux stockés.
   */
  async init(): Promise<void> {
    const stored = this.list();
    let needsSave = false;

    for (const def of DEFAULT_SERVERS) {
      if (!stored.find((s) => s.id === def.id)) {
        stored.push(def);
        needsSave = true;
        logger.info('mcp.registry', `Registered default server: ${def.id}`);
      }
    }

    if (needsSave) {
      this.save(stored);
    }

    /* Background discovery : list tools de chaque server alive */
    void this.discoverAll();
  }

  list(): McpServer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as McpServer[];
    } catch {
      return [];
    }
  }

  get(id: string): McpServer | null {
    return this.list().find((s) => s.id === id) ?? null;
  }

  save(servers: McpServer[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
    } catch (err) {
      logger.warn('mcp.registry', 'save failed', { err });
    }
  }

  async register(server: Omit<McpServer, 'status' | 'toolsExposed' | 'lastCheck' | 'errorCount'>): Promise<boolean> {
    const list = this.list();
    if (list.find((s) => s.id === server.id)) {
      logger.warn('mcp.registry', `Server ${server.id} already registered`);
      return false;
    }
    const full: McpServer = {
      ...server,
      status: 'unknown',
      toolsExposed: [],
      lastCheck: 0,
      errorCount: 0,
    };
    list.push(full);
    this.save(list);
    await auditLog.record('mcp.registry.register', { details: { id: server.id } });
    /* Auto-discovery des tools */
    void this.discoverTools(server.id);
    return true;
  }

  async unregister(id: string): Promise<boolean> {
    const list = this.list();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.save(list);
    await auditLog.record('mcp.registry.unregister', { details: { id } });
    return true;
  }

  async discoverAll(): Promise<void> {
    const list = this.list();
    for (const server of list) {
      if (server.status === 'dead' && server.errorCount > 5) continue; /* skip dead */
      void this.discoverTools(server.id);
    }
  }

  async discoverTools(serverId: string): Promise<McpServer | null> {
    const list = this.list();
    const idx = list.findIndex((s) => s.id === serverId);
    if (idx === -1) return null;

    const tools = await mcpClient.listTools(serverId);
    const health = await mcpClient.healthCheck(serverId);

    const server = list[idx];
    if (!server) return null;
    server.toolsExposed = tools;
    server.status = health.alive ? 'alive' : 'dead';
    server.lastCheck = Date.now();
    if (!health.alive) {
      server.errorCount = (server.errorCount ?? 0) + 1;
    } else {
      server.errorCount = 0;
    }

    list[idx] = server;
    this.save(list);
    logger.info('mcp.registry', `${serverId}: ${health.alive ? 'alive' : 'dead'} (${tools.length} tools)`);
    return server;
  }
}

export const mcpRegistry = new McpRegistry();
