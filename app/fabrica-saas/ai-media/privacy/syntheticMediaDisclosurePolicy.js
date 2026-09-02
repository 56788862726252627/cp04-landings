// Synthetic Media Disclosure Policy — ADV-13

export const DISCLOSURE_LEVEL = Object.freeze({
  NONE:     'NONE',
  MINIMAL:  'MINIMAL',
  STANDARD: 'STANDARD',
  FULL:     'FULL',
});

export const REQUIRED_DISCLOSURE_TEXTS = Object.freeze({
  AI_AVATAR:  'Este vídeo incluye un presentador generado por inteligencia artificial.',
  AI_VOICE:   'La voz de este vídeo ha sido sintetizada por IA.',
  AI_CONTENT: 'Contenido generado con asistencia de inteligencia artificial.',
});

export function buildDisclosurePlan(project = {}) {
  const items = [];
  if (project.avatarProfile) items.push(REQUIRED_DISCLOSURE_TEXTS.AI_AVATAR);
  if (project.voiceProfile)  items.push(REQUIRED_DISCLOSURE_TEXTS.AI_VOICE);
  items.push(REQUIRED_DISCLOSURE_TEXTS.AI_CONTENT);
  const level = items.length >= 2 ? DISCLOSURE_LEVEL.FULL : DISCLOSURE_LEVEL.STANDARD;
  return Object.freeze({
    level,
    disclosures:       Object.freeze([...new Set(items)]),
    mustShowOnPlatform: true,
    mustShowInCaption:  level === DISCLOSURE_LEVEL.FULL,
    isReal: false,
  });
}

export const SYNTHETIC_MEDIA_DISCLOSURE_POLICY_VERSION = '1.0.0';
