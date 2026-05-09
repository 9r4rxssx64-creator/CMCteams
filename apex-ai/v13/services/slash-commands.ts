/**
 * APEX v13.3.48 — Slash Commands service
 *
 * Demande Kevin règle "Tout au max — chat Apex niveau Claude.ai/ChatGPT" :
 * commandes rapides accessibles via `/` au début du message.
 *
 * Usage : `/help`, `/clear`, `/voice`, `/export`, `/settings`, `/regen`, `/search query`, `/copy`, `/version`
 *
 * Patterns :
 * - Detection : ligne commence par `/` + nom de commande connue
 * - Autocomplete : si user tape `/` seul → liste suggestions
 * - Exécution : retourne action (clear, navigate, toast, custom)
 *
 * Pas de dépendance UI directe (pure logique). Wired par features/chat/index.ts.
 */

export interface SlashCommand {
  name: string;
  emoji: string;
  description: string;
  /** Args attendus (ex: "<query>" ou "" si aucun) */
  argsHint: string;
  /** Si true, args requis pour exécuter */
  requiresArgs?: boolean;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { name: 'help', emoji: 'ℹ️', description: 'Liste toutes les commandes disponibles', argsHint: '' },
  { name: 'clear', emoji: '🧹', description: 'Efface la conversation courante', argsHint: '' },
  { name: 'voice', emoji: '🔊', description: 'Active/désactive lecture vocale auto', argsHint: '' },
  { name: 'export', emoji: '📄', description: 'Exporte la conversation en Markdown', argsHint: '' },
  { name: 'settings', emoji: '⚙️', description: 'Ouvre les réglages', argsHint: '' },
  { name: 'regen', emoji: '🔄', description: 'Régénère la dernière réponse Apex', argsHint: '' },
  { name: 'search', emoji: '🔎', description: 'Cherche dans la conversation', argsHint: '<keyword>', requiresArgs: true },
  { name: 'copy', emoji: '📋', description: 'Copie la dernière réponse Apex', argsHint: '' },
  { name: 'version', emoji: '🏷️', description: 'Affiche la version Apex', argsHint: '' },
  { name: 'fork', emoji: '🌿', description: 'Démarre une nouvelle conversation depuis ce point', argsHint: '' },
  /* v13.4.3 — IA IRL TikTok */
  { name: 'loop', emoji: '🔁', description: 'Queue tâche autonome (list/pause/resume/clear ou texte)', argsHint: '<task|list|pause|resume|clear>' },
  { name: 'plan', emoji: '🗺', description: 'Génère un plan structuré avant exécution', argsHint: '<objectif>', requiresArgs: true },
  { name: 'rules', emoji: '📜', description: 'Affiche les règles permanentes Apex (filtre optionnel)', argsHint: '<keyword?>' },
];

export interface SlashParseResult {
  isSlash: boolean;
  command?: SlashCommand;
  rawCommand?: string; // ex: 'help'
  args?: string; // ex: 'mon mot-clé'
  /** True si user a tapé un nom de commande inconnu (suggestion à afficher) */
  unknown?: boolean;
}

/**
 * Parse un message user pour détecter une slash command.
 * Retourne `{ isSlash: false }` si ce n'est pas une commande.
 */
export function parseSlashCommand(text: string): SlashParseResult {
  if (!text || typeof text !== 'string') return { isSlash: false };
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) return { isSlash: false };
  const body = trimmed.slice(1).trim();
  if (body.length === 0) return { isSlash: true, unknown: true };

  /* Découpe nom + args */
  const spaceIdx = body.indexOf(' ');
  const rawCmd = (spaceIdx === -1 ? body : body.slice(0, spaceIdx)).toLowerCase();
  const args = spaceIdx === -1 ? '' : body.slice(spaceIdx + 1).trim();

  const cmd = SLASH_COMMANDS.find((c) => c.name === rawCmd);
  if (!cmd) return { isSlash: true, unknown: true, rawCommand: rawCmd, args };

  return { isSlash: true, command: cmd, rawCommand: rawCmd, args };
}

/**
 * Filtre les commandes pour autocomplete.
 * `prefix` = ce que user a tapé après `/`.
 * Retourne max 6 suggestions ordonnées par pertinence (startsWith d'abord).
 */
export function filterCommands(prefix: string): SlashCommand[] {
  const p = (prefix || '').toLowerCase().trim();
  if (!p) return SLASH_COMMANDS.slice(0, 6);
  const startsWith = SLASH_COMMANDS.filter((c) => c.name.startsWith(p));
  const includes = SLASH_COMMANDS.filter(
    (c) => !c.name.startsWith(p) && (c.name.includes(p) || c.description.toLowerCase().includes(p)),
  );
  return [...startsWith, ...includes].slice(0, 6);
}

/**
 * Génère le texte d'aide pour la commande `/help`.
 */
export function helpText(): string {
  const lines = SLASH_COMMANDS.map((c) => `- \`/${c.name}${c.argsHint ? ' ' + c.argsHint : ''}\` ${c.emoji} ${c.description}`);
  return `### Commandes disponibles\n\n${lines.join('\n')}\n\nTape \`/\` pour voir l'autocomplete.`;
}
