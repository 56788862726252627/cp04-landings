const VIDEO_ROOT = '/media/club-padel-04/access-v2/';
const HERO_IMAGE = '/media/club-padel-04/landing-v2/source-background-club-padel-04.png';
const HERO_SHA256 = '4d217ca4346a61e6b09862550d9e1397c2ea1a55b3ffb9ab63e8b68a8e8d1fdc';
const LOCAL_PREVIEW = import.meta.env?.DEV === true;
export const LANDING_BACKGROUND = Object.freeze({
  image: HERO_IMAGE, sha256: HERO_SHA256, width: 1672, height: 941,
  fallbackImages: [HERO_IMAGE], status: 'VERIFIED_LOCAL',
});
export const LANDING_MEDIA_CATALOG = Object.freeze([
  ['cp04-login-video-01-ambient-zoom.mp4', '977260b5cb886aee9ad0d6973d58cde037ba7e1094f1f73f5b8137439c0dc76c', 5, 0],
  ['cp04-login-video-02-pan-right.mp4', 'd351cae92c35430933ea890b6c7d0bb0b5393b732ce820a3e24cecc6cf8ad335', 6, 1],
  ['cp04-login-video-03-pan-left.mp4', '77c8cb6f4dfa4e3d5bb8deb6677e586457112055c07afb2ec4b641a9772c740d', 6, 2],
  ['cp04-login-video-04-rise.mp4', '56eaacc10d1357f0cf85b8f67a3f8fdba8363d1487b8cb070fa6443b82909aaf', 6, 3],
  ['cp04-login-video-05-breathe.mp4', 'adbc969918a1d7a0d4e149f5e548c5d10a1cd967e431df78a0a3c4919162c75b', 6, 4]
].map(([file, sha256, duration, order]) => Object.freeze({
  id: file.replace('.mp4', ''), title: 'El entorno de Club Pádel 04',
  purpose: 'Prueba local de movimiento sobre la imagen de la landing.',
  category: 'preview_motion_test_assets', kind: 'preview_motion_test_assets',
  allowedAudiences: ['public'], poster: HERO_IMAGE, video: VIDEO_ROOT + file,
  duration, subtitles: [], transcript: null, factualSource: null, license: null, owner: null,
  approvedAt: null, alternativeText: 'Paisaje y pista al atardecer, sin audio.',
  status: 'PREVIEW_ONLY', order, enabled: true,
  provenance: { source: 'user-provided-archive', scope: 'local-preview', sha256, posterSha256: HERO_SHA256, audioTracks: 0 },
})));
export const LANDING_EXPERIENCE = Object.freeze({
  namespace: 'club-padel-04', composition: 'panoramic', label: 'El entorno de Club Pádel 04',
  eyebrow: '', showCaption: false, autoplay: LOCAL_PREVIEW,
  allowPreviewMotion: LOCAL_PREVIEW, catalog: LOCAL_PREVIEW ? LANDING_MEDIA_CATALOG : [],
  fallbackImages: LANDING_BACKGROUND.fallbackImages,
});
