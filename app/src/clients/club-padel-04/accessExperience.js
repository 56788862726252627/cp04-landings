import { PADEL_ACCESS_TOPICS } from '../../verticals/padel/accessTopics.js';

export const ACCESS_BACKGROUND = Object.freeze({
  status: 'RESTORED_PREVIOUS',
  approvedVersion: 'pre-a3-assets',
  fallbackImages: ['/optimized/images/torcal-padel-bg.webp', '/images/torcal-padel-bg.png'],
});
export const ACCESS_MEDIA_CATALOG = Object.freeze(PADEL_ACCESS_TOPICS.map(([id, title, category], order) => Object.freeze({
  id, title, purpose: 'Tema solicitado para planificación; contenido pendiente de revisión.',
  category, allowedAudiences: ['public'], poster: null, video: null, duration: null,
  subtitles: [], transcript: null, factualSource: null, license: null, owner: null,
  approvedAt: null, alternativeText: null, status: 'SOURCE_PENDING', order, enabled: false,
})));
export const ACCESS_EXPERIENCE = Object.freeze({
  namespace: 'club-padel-04',
  composition: 'featured-story',
  label: 'Club Pádel 04',
  eyebrow: 'TU ACCESO AL CLUB',
  autoplay: false,
  allowPreviewMotion: false,
  catalog: ACCESS_MEDIA_CATALOG,
  fallbackImages: ACCESS_BACKGROUND.fallbackImages,
});
