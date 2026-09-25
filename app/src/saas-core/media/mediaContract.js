export const MEDIA_FIELDS = Object.freeze([
  'id', 'title', 'purpose', 'category', 'allowedAudiences', 'poster', 'video',
  'duration', 'subtitles', 'transcript', 'factualSource', 'license', 'owner',
  'approvedAt', 'alternativeText', 'status', 'order', 'enabled',
]);
export const MEDIA_VARIANTS = Object.freeze(['panoramic', 'split', 'featured-story', 'carousel', 'editorial', 'mosaic']);
export function safeAsset(value) {
  return typeof value === 'string' && /^\/(?!\/)[a-zA-Z0-9/_\-.]+$/.test(value) && !value.includes('..');
}
export function validateMedia(item, { allowPreviewMotion = false } = {}) {
  const errors = [];
  if (!item || typeof item !== 'object') return ['INVALID_ITEM'];
  if (Object.keys(item).some(field => !MEDIA_FIELDS.includes(field) && !['kind', 'provenance'].includes(field))) errors.push('UNEXPECTED_FIELD');
  for (const field of MEDIA_FIELDS) if (!(field in item)) errors.push('MISSING_' + field);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id || '')) errors.push('INVALID_ID');
  if (!Number.isSafeInteger(item.order) || item.order < 0) errors.push('INVALID_ORDER');
  if (!Array.isArray(item.allowedAudiences) || !item.allowedAudiences.length) errors.push('MISSING_AUDIENCE');
  if (item.enabled && item.kind === 'preview_motion_test_assets') {
    if (!allowPreviewMotion || item.status !== 'PREVIEW_ONLY') errors.push('PREVIEW_NOT_AUTHORIZED');
    if (item.license !== null || item.owner !== null || item.approvedAt !== null || item.factualSource !== null) errors.push('PREVIEW_MUST_NOT_CLAIM_PUBLICATION_APPROVAL');
    if (!item.title || !item.purpose || !item.alternativeText) errors.push('MISSING_PREVIEW_DESCRIPTION');
    if (!safeAsset(item.video) || !item.video.endsWith('.mp4') || !safeAsset(item.poster)) errors.push('INVALID_PREVIEW_ASSET');
    if (!(Number.isFinite(item.duration) && item.duration > 0)) errors.push('INVALID_DURATION');
    if (!Array.isArray(item.subtitles) || item.subtitles.length || item.transcript !== null) errors.push('UNEXPECTED_SILENT_CONTENT');
    const provenance = item.provenance;
    if (!provenance || Object.keys(provenance).some(key => !['source', 'scope', 'sha256', 'posterSha256', 'audioTracks'].includes(key)) ||
      provenance.source !== 'user-provided-archive' || provenance.scope !== 'local-preview' || provenance.audioTracks !== 0 ||
      !/^[a-f0-9]{64}$/.test(provenance.sha256 || '') || !/^[a-f0-9]{64}$/.test(provenance.posterSha256 || '')) errors.push('INVALID_PREVIEW_PROVENANCE');
  } else if (item.enabled) {
    if (item.status !== 'APPROVED') errors.push('NOT_APPROVED');
    for (const field of ['title', 'purpose', 'category', 'transcript', 'license', 'owner', 'alternativeText']) {
      if (typeof item[field] !== 'string' || !item[field].trim()) errors.push('EMPTY_' + field);
    }
    if (!safeAsset(item.video) || !/\.(mp4|webm)$/.test(item.video)) errors.push('INVALID_VIDEO');
    if (!safeAsset(item.poster) || !/\.(png|webp|jpg|jpeg|avif)$/.test(item.poster)) errors.push('INVALID_POSTER');
    if (!(Number.isFinite(item.duration) && item.duration > 0)) errors.push('INVALID_DURATION');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.approvedAt || '') || !Number.isFinite(Date.parse(item.approvedAt))) errors.push('MISSING_APPROVAL_DATE');
    if (!item.factualSource?.url?.startsWith('https://') || !item.factualSource?.verifiedAt) errors.push('UNVERIFIED_FACTS');
    if (!Array.isArray(item.subtitles) || !item.subtitles.length ||
      item.subtitles.some(s => !safeAsset(s.src) || !s.src.endsWith('.vtt') || !s.language || !s.label)) errors.push('MISSING_CAPTIONS');
  }
  return errors;
}
export function playableMedia(catalog, { audience = 'public', explicitDemo = false, allowPreviewMotion = false } = {}) {
  if (!Array.isArray(catalog)) return [];
  const ids = new Set(), orders = new Set();
  // Ambiguous identity/order fails closed; never infer ownership or permissions.
  if (catalog.some(item => {
    if (!item || ids.has(item.id) || orders.has(item.order)) return true;
    ids.add(item.id); orders.add(item.order); return false;
  })) return [];
  return catalog.filter(item => item.enabled === true && validateMedia(item, { allowPreviewMotion }).length === 0 &&
    (item.allowedAudiences.includes('public') || (explicitDemo && item.allowedAudiences.includes(audience))))
    .sort((a, b) => a.order - b.order);
}
export function resolveComposition(requested, count) {
  if (!MEDIA_VARIANTS.includes(requested)) return 'featured-story';
  if (requested === 'mosaic' && count < 4) return 'featured-story';
  if (['carousel', 'editorial'].includes(requested) && count < 2) return 'featured-story';
  return requested;
}
export function rotationKey(namespace) {
  if (!/^[a-z0-9-]{1,64}$/.test(namespace || '')) throw new Error('A public tenant namespace is required');
  return 'saas-media:' + namespace + ':index';
}
// Only an ordinal is stored. No identity, role, media URL, telemetry or timestamp.
export function planRotation(items, storage, namespace) {
  const key = rotationKey(namespace);
  if (!items.length) return { key, order: null };
  let previous = -1;
  try {
    const raw = storage?.getItem(key);
    if (/^\d+$/.test(raw || '') && Number.isSafeInteger(Number(raw))) previous = Number(raw);
  } catch { /* Storage disabled: retain functional static/first-item fallback. */ }
  return { key, order: (items.find(item => item.order > previous) || items[0]).order };
}
export function commitRotation(plan, storage) {
  if (plan.order === null) return false;
  try { storage?.setItem(plan.key, String(plan.order)); return Boolean(storage); }
  catch { return false; }
}
