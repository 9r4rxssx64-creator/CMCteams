/**
 * APEX v13 — Orchestrateur central des projets Kevin
 *
 * Demande Kevin (rebuild plan) :
 * "Apex doit auto-gérer les autres projets Kevin (orchestrateur central)"
 *
 * Bridges exposés via tools IA :
 * - cmc_read       : lit /cmcteams/* Firebase shared
 * - cmc_write_motd : écrit message du jour CMC (admin only)
 * - open_tool      : ouvre tools/*.html dans browser embed
 * - kdmc_stats     : stats e-KDMC marketplaces
 * - telecommande_send : envoie commande IR/Wifi via bridge
 *
 * Aucun projet Kevin n'est modifié — Apex ne fait que LIRE leurs schémas Firebase
 * et LANCER leurs URLs publiques.
 */

import { logger } from '../core/logger.js';
import { firebase } from './firebase.js';

export interface KevinProject {
  id: string;
  name: string;
  url: string;
  firebasePath?: string;
  toolsAvailable: string[];
}

export const PROJECTS: readonly KevinProject[] = [
  {
    id: 'cmcteams',
    name: 'CMCteams',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/',
    firebasePath: 'cmcteams',
    toolsAvailable: ['cmc_read', 'cmc_write_motd', 'cmc_get_admin_profile'],
  },
  {
    id: 'telecommande',
    name: 'Télécommande KDMC',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/',
    toolsAvailable: ['telecommande_send'],
  },
  {
    id: 'crackpass',
    name: 'CrackPass',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/tools/codes-decoder.html',
    toolsAvailable: ['crackpass_check', 'crackpass_generate'],
  },
  {
    id: 'kdmc',
    name: 'KDMC',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/',
    toolsAvailable: ['kdmc_stats'],
  },
  {
    id: 'ekdmc',
    name: 'e-KDMC',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/e-KDMC/',
    firebasePath: 'ekdmc',
    toolsAvailable: ['ekdmc_stats', 'ekdmc_orders'],
  },
  {
    id: 'iakdmc',
    name: 'IA-KDMC',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/IA-KDMC/',
    toolsAvailable: ['iakdmc_lookup'],
  },
];

export const TOOLS_HTML: ReadonlyArray<{ id: string; name: string; path: string }> = [
  { id: 'album_laurence', name: 'Album Laurence', path: 'tools/album-laurence.html' },
  { id: 'kevin_todo', name: 'TODO Kevin iPhone', path: 'tools/kevin-todo-iphone.html' },
  { id: 'gen_bulletin', name: 'Bulletin de paie', path: 'tools/gen-bulletin-paie.html' },
  { id: 'planning_weekend', name: 'Planning weekend', path: 'tools/planning-weekend.html' },
  { id: 'codes_decoder', name: 'Décodeur codes', path: 'tools/codes-decoder.html' },
  { id: 'calc_conventions', name: 'Calculatrice conventions', path: 'tools/calc-conventions.html' },
  { id: 'gen_og_png', name: 'Generator OG PNG', path: 'tools/gen-og-png.html' },
  { id: 'cf_deploy', name: 'Cloudflare deploy', path: 'tools/cloudflare/deploy-worker.html' },
  { id: 'cf_vapid', name: 'Cloudflare VAPID gen', path: 'tools/cloudflare/gen-vapid.html' },
];

class Orchestrator {
  listProjects(): readonly KevinProject[] {
    return PROJECTS;
  }

  listTools(): typeof TOOLS_HTML {
    return TOOLS_HTML;
  }

  async cmcRead(): Promise<unknown> {
    return firebase.read<unknown>('cmcteams');
  }

  async kdmcStats(): Promise<unknown> {
    return firebase.read<unknown>('ekdmc');
  }

  openTool(toolId: string): { ok: boolean; url?: string } {
    const tool = TOOLS_HTML.find((t) => t.id === toolId);
    if (!tool) return { ok: false };
    const baseUrl = location.origin;
    const fullUrl = `${baseUrl}/CMCteams/${tool.path}`;
    logger.info('orchestrator', `Opening tool: ${tool.name}`);
    return { ok: true, url: fullUrl };
  }

  /* IA tool definitions au format Anthropic — exportable au system prompt */
  getToolDefinitions(): unknown[] {
    return [
      {
        name: 'cmc_read',
        description: 'Lit les données CMCteams (planning casino) depuis Firebase shared',
        input_schema: { type: 'object', properties: {} },
      },
      {
        name: 'open_tool',
        description: 'Ouvre un outil HTML autonome dans le browser embed',
        input_schema: {
          type: 'object',
          properties: { tool_id: { type: 'string', enum: TOOLS_HTML.map((t) => t.id) } },
          required: ['tool_id'],
        },
      },
      {
        name: 'kdmc_stats',
        description: 'Statistiques e-KDMC marketplace',
        input_schema: { type: 'object', properties: {} },
      },
    ];
  }
}

export const orchestrator = new Orchestrator();
