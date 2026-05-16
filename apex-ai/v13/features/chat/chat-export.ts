/**
 * APEX v13.4.173 — Chat conversation export Markdown (extrait de chat/index.ts).
 *
 * Refactor minutieux Kevin "expert sans régression" :
 * - buildConversationMarkdown : pure transformation array → Markdown string
 * - Side-effects (Blob/URL/toast/clipboard) restent dans chat/index.ts
 *
 * Cap tool_card filtré, header avec date/version, séparateur `---` entre tours.
 *
 * Re-exportée depuis chat/index.ts (façade backward-compat).
 */

export interface ExportableMessage {
  role: 'user' | 'assistant' | 'tool_card';
  text: string;
}

/**
 * Construit le markdown d'une conversation pour export téléchargeable.
 *
 * @param messages   Conversation à exporter
 * @param appVer     Version Apex à inclure dans header (ex: "v13.4.173")
 * @param now        Date à inclure (défaut : Date.now())
 * @returns Markdown formaté prêt à download/clipboard
 */
export function buildConversationMarkdown(
  messages: readonly ExportableMessage[],
  appVer: string,
  now: Date = new Date(),
): string {
  const header =
    `# Conversation Apex — ${now.toLocaleString('fr-FR')}\n\n` +
    `Version : ${appVer}\n\n` +
    `---\n\n`;
  const body = messages
    .filter((m) => m.role !== 'tool_card')
    .map((m) => {
      const role = m.role === 'user' ? '## 👤 Toi' : '## 🤖 Apex';
      return `${role}\n\n${m.text}`;
    })
    .join('\n\n---\n\n');
  return header + body;
}

/**
 * Construit le nom de fichier d'export `apex-conversation-YYYY-MM-DDTHH-MM-SS.md`.
 * Pure, déterministe sur la date passée.
 */
export function buildExportFilename(now: Date = new Date()): string {
  const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `apex-conversation-${ts}.md`;
}
