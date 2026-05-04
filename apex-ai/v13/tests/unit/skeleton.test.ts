/**
 * Tests skeleton loaders (UX 17→20).
 */
import { describe, it, expect } from 'vitest';
import { renderSkeleton, renderChatSkeleton, renderCardSkeleton, renderListSkeleton } from '../../ui/skeleton.js';

describe('Skeleton loaders', () => {
  it('renderSkeleton line par défaut', () => {
    const html = renderSkeleton({ shape: 'line' });
    expect(html).toContain('ax-skel-line');
  });

  it('renderSkeleton circle', () => {
    expect(renderSkeleton({ shape: 'circle' })).toContain('ax-skel-circle');
  });

  it('renderSkeleton card', () => {
    expect(renderSkeleton({ shape: 'card' })).toContain('ax-skel-card');
  });

  it('renderSkeleton avec width + height', () => {
    const html = renderSkeleton({ shape: 'line', width: '60%', height: '14px' });
    expect(html).toContain('width:60%');
    expect(html).toContain('height:14px');
  });

  it('renderSkeleton count multiple', () => {
    const html = renderSkeleton({ shape: 'line', count: 3 });
    const matches = html.match(/ax-skel-line/g);
    expect(matches?.length).toBe(3);
  });

  it('renderChatSkeleton avatar + 3 lines', () => {
    const html = renderChatSkeleton();
    expect(html).toContain('ax-skel-avatar');
    expect(html).toContain('ax-skel-line');
  });

  it('renderCardSkeleton 3 cards défaut', () => {
    const html = renderCardSkeleton();
    const matches = html.match(/ax-skel-card-full/g);
    expect(matches?.length).toBe(3);
  });

  it('renderCardSkeleton custom count', () => {
    const html = renderCardSkeleton(7);
    const matches = html.match(/ax-skel-card-full/g);
    expect(matches?.length).toBe(7);
  });

  it('renderListSkeleton 5 items défaut', () => {
    const html = renderListSkeleton();
    const matches = html.match(/ax-skel-list-item/g);
    expect(matches?.length).toBe(5);
  });
});
