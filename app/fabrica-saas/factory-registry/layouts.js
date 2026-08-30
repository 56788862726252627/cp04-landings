/**
 * Factory Registry — Layout Registry V2
 */

export const LAYOUT_REGISTRY = Object.freeze([
  { id: 'centered',    maxWidth: '720px',  gap: 64, personality: 'centered' },
  { id: 'wide',        maxWidth: '1100px', gap: 48, personality: 'grid' },
  { id: 'full',        maxWidth: '100%',   gap: 0,  personality: 'editorial' },
  { id: 'editorial',   maxWidth: '960px',  gap: 80, personality: 'editorial' },
  { id: 'compact',     maxWidth: '900px',  gap: 32, personality: 'grid' },
  { id: 'asymmetric',  maxWidth: '1200px', gap: 48, personality: 'asymmetric' },
  { id: 'dashboard',   maxWidth: '100%',   gap: 20, personality: 'grid' },
]);

export function getLayoutForPersonality(personality) {
  return LAYOUT_REGISTRY.find(l => l.personality === personality)
    ?? LAYOUT_REGISTRY.find(l => l.id === 'wide');
}
