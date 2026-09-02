// Caption Engine — ADV-13

export const CAPTION_TYPE = Object.freeze({
  SPOKEN:      'SPOKEN',
  SOCIAL_COPY: 'SOCIAL_COPY',
  DESCRIPTION: 'DESCRIPTION',
  CTA_COPY:    'CTA_COPY',
  ALT_SUMMARY: 'ALT_SUMMARY',
});

export function generateCaptions(script, config = {}) {
  if (!script || !script.sections) throw new Error('generateCaptions requires script');
  const spokenText = script.sections.map(s => s.text).join(' ');
  const ctaSection = script.sections.find(s => s.section === 'CTA');
  return Object.freeze({
    [CAPTION_TYPE.SPOKEN]:      spokenText,
    [CAPTION_TYPE.SOCIAL_COPY]: config.socialCopy   ?? spokenText.slice(0, 120) + '...',
    [CAPTION_TYPE.DESCRIPTION]: config.description  ?? spokenText.slice(0, 300),
    [CAPTION_TYPE.CTA_COPY]:    ctaSection?.text    ?? '',
    [CAPTION_TYPE.ALT_SUMMARY]: config.altSummary   ?? `Vídeo: ${spokenText.slice(0, 100)}`,
    isReal: false,
  });
}

export const CAPTION_ENGINE_VERSION = '1.0.0';
