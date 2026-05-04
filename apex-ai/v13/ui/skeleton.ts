/**
 * APEX v13 — Skeleton loaders (UX 17→20).
 *
 * Demande Kevin : "skeleton loaders + micro-interactions"
 * Affiche placeholders animés pendant chargement (better UX que spinner).
 */

export type SkeletonShape = 'line' | 'circle' | 'card' | 'avatar' | 'button';

interface SkeletonOptions {
  shape: SkeletonShape;
  width?: string;
  height?: string;
  count?: number;
}

export function renderSkeleton(opts: SkeletonOptions): string {
  const count = opts.count ?? 1;
  const items: string[] = [];
  for (let i = 0; i < count; i++) {
    let style = '';
    if (opts.width) style += `width:${opts.width};`;
    if (opts.height) style += `height:${opts.height};`;
    items.push(`<div class="ax-skel ax-skel-${opts.shape}" ${style ? `style="${style}"` : ''}></div>`);
  }
  return `<div class="ax-skel-group">${items.join('')}</div>`;
}

export function renderChatSkeleton(): string {
  return `
    <div class="ax-skel-chat">
      ${renderSkeleton({ shape: 'avatar', width: '40px', height: '40px' })}
      <div class="ax-skel-msg">
        ${renderSkeleton({ shape: 'line', width: '60%', height: '14px' })}
        ${renderSkeleton({ shape: 'line', width: '80%', height: '14px' })}
        ${renderSkeleton({ shape: 'line', width: '40%', height: '14px' })}
      </div>
    </div>
  `;
}

export function renderCardSkeleton(count = 3): string {
  return Array.from({ length: count }, () => `
    <div class="ax-skel-card-full">
      ${renderSkeleton({ shape: 'line', width: '40%', height: '16px' })}
      ${renderSkeleton({ shape: 'line', width: '90%', height: '12px' })}
      ${renderSkeleton({ shape: 'line', width: '70%', height: '12px' })}
    </div>
  `).join('');
}

export function renderListSkeleton(count = 5): string {
  return Array.from({ length: count }, () => `
    <div class="ax-skel-list-item">
      ${renderSkeleton({ shape: 'avatar', width: '32px', height: '32px' })}
      ${renderSkeleton({ shape: 'line', width: '60%', height: '14px' })}
    </div>
  `).join('');
}
