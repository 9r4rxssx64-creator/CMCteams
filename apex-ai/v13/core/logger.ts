/**
 * APEX v13 — Logger structuré + Sentry bridge
 *
 * Niveau de logs : debug | info | warn | error
 * - Console formatée + couleur en dev
 * - Buffer rotatif local (max 500) pour debug HUD
 * - Bridge Sentry si DSN configuré (lazy-load)
 * - Redaction auto secrets (sk-*, ghp_*, AIza*, etc.)
 *
 * Anti-pattern évité : pas de console.log nu, tout passe par logger.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  ts: number;
  level: LogLevel;
  scope: string;
  msg: string;
  data?: unknown;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SECRET_PATTERNS: RegExp[] = [
  /sk-ant-api\d{2}-[A-Za-z0-9_-]{20,}/g,
  /sk-[A-Za-z0-9]{40,}/g,
  /AIza[A-Za-z0-9_-]{33}/g,
  /ghp_[A-Za-z0-9]{36}/g,
  /github_pat_[A-Za-z0-9_]{82,}/g,
  /xkeysib-[a-f0-9]+-[A-Za-z0-9]+/g,
  /re_[A-Za-z0-9_]+/g,
  /gsk_[A-Za-z0-9]+/g,
  /pplx-[A-Za-z0-9]+/g,
  /Bearer\s+[A-Za-z0-9._-]+/g,
];

function redact(input: unknown): unknown {
  if (typeof input === 'string') {
    let s = input;
    for (const re of SECRET_PATTERNS) s = s.replace(re, '[REDACTED]');
    return s;
  }
  if (input && typeof input === 'object') {
    try {
      const json = JSON.stringify(input);
      let redacted = json;
      for (const re of SECRET_PATTERNS) redacted = redacted.replace(re, '[REDACTED]');
      return JSON.parse(redacted) as unknown;
    } catch {
      return '[unserializable]';
    }
  }
  return input;
}

class Logger {
  private buffer: LogEntry[] = [];
  private readonly maxBuffer = 500;
  private minLevel: LogLevel =
    typeof window !== 'undefined' && window.location?.hostname === 'localhost' ? 'debug' : 'info';
  private sentryReady = false;

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(scope: string, msg: string, data?: unknown): void {
    this.log('debug', scope, msg, data);
  }
  info(scope: string, msg: string, data?: unknown): void {
    this.log('info', scope, msg, data);
  }
  warn(scope: string, msg: string, data?: unknown): void {
    this.log('warn', scope, msg, data);
  }
  error(scope: string, msg: string, data?: unknown): void {
    this.log('error', scope, msg, data);
  }

  getBuffer(): readonly LogEntry[] {
    return this.buffer;
  }

  clearBuffer(): void {
    this.buffer = [];
  }

  private log(level: LogLevel, scope: string, msg: string, data?: unknown): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) return;

    const entry: LogEntry = {
      ts: Date.now(),
      level,
      scope,
      msg: redact(msg) as string,
      ...(data !== undefined && { data: redact(data) }),
    };

    this.buffer.push(entry);
    if (this.buffer.length > this.maxBuffer) this.buffer.shift();

    /* Console formaté */
    const prefix = `[${level.toUpperCase()}] ${scope}`;
    const args = entry.data !== undefined ? [prefix, entry.msg, entry.data] : [prefix, entry.msg];
    /* eslint-disable no-console */
    if (level === 'error') console.error(...args);
    else if (level === 'warn') console.warn(...args);
    else if (level === 'info') console.info(...args);
    else console.debug(...args);
    /* eslint-enable no-console */

    /* Sentry bridge async (errors only, lazy) */
    if (level === 'error') void this.forwardToSentry(entry);
  }

  private async forwardToSentry(entry: LogEntry): Promise<void> {
    if (!this.sentryReady) return;
    /* TODO Jet 2 : import('@sentry/browser').captureMessage */
    void entry;
  }
}

export const logger = new Logger();
