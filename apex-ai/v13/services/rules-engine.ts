/**
 * APEX v13.4.3 — Rules Engine service (Kevin 2026-05-09 — TikTok IA IRL #3)
 *
 * Slash command `/rules` → affiche les top 10 règles permanentes du CLAUDE.md.
 * `/rules <keyword>` → filtre les règles par mot-clé.
 *
 * Source : memory.getDocsContext()['CLAUDE.md'].content (déjà loadé au boot).
 * Parse les sections "## RÈGLE PERMANENTE" / "## RÈGLE ABSOLUE" et extrait :
 *  - Titre (heading H2)
 *  - Quote Kevin (premier blockquote)
 *  - Date (regex /\(Kevin (\d{4}-\d{2}-\d{2}.*?)\)/)
 *  - Body abrégé (premiers 500 chars)
 *
 * Cap : retourne max 50 règles parsées au total.
 */

import { memory } from '../core/memory.js';
import { logger } from '../core/logger.js';

export interface ApexRule {
  id: string;
  title: string;
  date: string | null;
  quote: string;
  bodyExcerpt: string;
  fullSection: string;
  index: number;
}

const MAX_RULES = 50;
const RULE_HEADING_RX = /^##\s+(?:🔍|👥|🔄|🧠|🔓|🚀|🤖|🛡|🛡️|🛡|🔁|🎯|👑|🔬|🔗|📚|📒|🤝|🧪|🔘|🔐|🧒|💾|🔁|📷|🧭|🧰|🎓|💼|🎨|🎙|🤝|🎯|🏆|⚡|🚨|🔁|🔧|✅|🤖|💡|🧬|🤖|📦|🎭|👤|📁|🗺|⚠️|🤖|🎙|🤖|🛡|🤖|🤖|🚀|🎓|🧒|🙋|⚙️|🌐|🔄|🔥|📌|🆘|🌐|🛡|📊|🪞|🎨|🚀|🛠|🌟|🎬|🎉|🎁|📷|📂|🧯|🍎)\s*RÈGLE\s+(?:PERMANENTE|ABSOLUE)\s*[—-]\s*(.+?)(?:\s+\(Kevin\s+(\d{4}-\d{2}-\d{2}[^)]*)\))?\s*$/i;

class RulesEngineService {
  /**
   * Liste toutes les règles parsées depuis CLAUDE.md (cache memory).
   */
  list(): ApexRule[] {
    try {
      const docs = memory.getDocsContext();
      const claudeMd = docs['CLAUDE.md']?.content;
      if (!claudeMd) {
        logger.warn('rules-engine', 'CLAUDE.md cache vide — appelle memory.syncDocsAtBoot()');
        return [];
      }
      return this.parseRules(claudeMd);
    } catch (err: unknown) {
      logger.warn('rules-engine', 'list failed', { err });
      return [];
    }
  }

  /**
   * Top N règles (par défaut 10).
   */
  top(limit = 10): ApexRule[] {
    return this.list().slice(0, limit);
  }

  /**
   * Filtre par mot-clé (case-insensitive sur titre + body).
   */
  filter(keyword: string): ApexRule[] {
    const k = (keyword || '').toLowerCase().trim();
    if (!k) return this.list();
    return this.list().filter((r) =>
      r.title.toLowerCase().includes(k) ||
      r.quote.toLowerCase().includes(k) ||
      r.bodyExcerpt.toLowerCase().includes(k),
    );
  }

  /**
   * Render markdown formatted summary pour affichage chat.
   */
  renderMarkdown(rules: ApexRule[]): string {
    if (rules.length === 0) {
      return '_Aucune règle trouvée. Lance `memory.syncDocsAtBoot()` ou vérifie ton cache._';
    }
    const lines = rules.map((r, i) => {
      const dateLabel = r.date ? ` _(${r.date})_` : '';
      const quoteLine = r.quote ? `\n  > ${r.quote.slice(0, 200)}` : '';
      return `**${i + 1}. ${r.title}**${dateLabel}${quoteLine}`;
    });
    return `### Règles permanentes Apex (${rules.length})\n\n${lines.join('\n\n')}`;
  }

  private parseRules(md: string): ApexRule[] {
    const rules: ApexRule[] = [];
    const lines = md.split('\n');
    let current: { idx: number; title: string; date: string | null; bodyLines: string[] } | null = null;

    const pushCurrent = () => {
      if (!current) return;
      const fullSection = current.bodyLines.join('\n').trim();
      const quote = this.extractFirstQuote(fullSection);
      rules.push({
        id: `rule_${current.idx}_${this.slug(current.title)}`,
        title: current.title.slice(0, 200),
        date: current.date,
        quote: quote.slice(0, 400),
        bodyExcerpt: fullSection.slice(0, 500),
        fullSection,
        index: current.idx,
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      const m = line.match(RULE_HEADING_RX);
      if (m) {
        pushCurrent();
        if (rules.length >= MAX_RULES) {
          current = null;
          break;
        }
        current = {
          idx: rules.length,
          title: (m[1] ?? '').trim(),
          date: m[2] ? m[2].trim() : null,
          bodyLines: [],
        };
        continue;
      }
      /* Stop quand on tombe sur une autre H1 / H2 hors règle */
      if (current && /^##\s+/.test(line) && !RULE_HEADING_RX.test(line)) {
        pushCurrent();
        current = null;
        continue;
      }
      if (current) current.bodyLines.push(line);
    }
    pushCurrent();
    return rules;
  }

  private extractFirstQuote(text: string): string {
    const m = text.match(/^>\s+\*\*(.+?)\*\*/m) || text.match(/^>\s+(.+)$/m);
    return m ? (m[1] ?? '').replace(/^"+|"+$/g, '').trim() : '';
  }

  private slug(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  }
}

export const rulesEngine = new RulesEngineService();
