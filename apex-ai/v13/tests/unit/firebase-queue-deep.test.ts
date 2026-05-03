import { describe, it, expect, beforeEach } from 'vitest';
import { firebaseQueue } from '../../services/firebase-queue.js';

describe('firebase-queue deep tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('init charge queue depuis localStorage', () => {
    localStorage.setItem('apex_v13_fb_queue', JSON.stringify([
      { id: 'q1', key: 'k1', value: 'v1', ts: Date.now(), attempts: 0, status: 'pending' },
    ]));
    firebaseQueue.init();
    expect(firebaseQueue.size()).toBeGreaterThanOrEqual(1);
  });

  it('init handles localStorage corrupt', () => {
    localStorage.setItem('apex_v13_fb_queue', 'INVALID');
    expect(() => firebaseQueue.init()).not.toThrow();
  });

  it('add multiple entries persiste cumul', () => {
    firebaseQueue.add('k1', 'v1');
    firebaseQueue.add('k2', 'v2');
    firebaseQueue.add('k3', 'v3');
    expect(firebaseQueue.size()).toBeGreaterThanOrEqual(3);
  });

  it('add entries cap MAX_QUEUE 200', () => {
    for (let i = 0; i < 250; i++) firebaseQueue.add(`k${i}`, i);
    expect(firebaseQueue.size()).toBeLessThanOrEqual(200);
  });
});
