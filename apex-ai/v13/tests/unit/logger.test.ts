import { describe, it, expect } from 'vitest';
import { logger } from '../../core/logger.js';

describe('logger', () => {
  it('redacte les API keys dans messages', () => {
    logger.clearBuffer();
    logger.info('test', 'Ma clé sk-ant-api03-' + 'A'.repeat(40));
    const buf = logger.getBuffer();
    /* v13.3.75 fix sécu : labels typés [REDACTED:anthropic_key] (cf log-redaction-wrapper). */
    expect(buf[buf.length - 1]?.msg).toMatch(/\[REDACTED(:anthropic_key)?\]/);
  });
  it('redacte AIza Google AI keys', () => {
    logger.clearBuffer();
    logger.info('test', 'AIza' + 'B'.repeat(33));
    const last = logger.getBuffer().pop();
    expect(last?.msg).toMatch(/\[REDACTED(:google_api_key)?\]/);
  });
  it('buffer rotation max 500', () => {
    logger.clearBuffer();
    for (let i = 0; i < 600; i++) logger.debug('test', `msg ${i}`);
    expect(logger.getBuffer().length).toBeLessThanOrEqual(500);
  });
});
