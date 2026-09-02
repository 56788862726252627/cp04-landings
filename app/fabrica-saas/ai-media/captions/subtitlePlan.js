// Subtitle Plan — ADV-13

export const SUBTITLE_FORMAT = Object.freeze({
  SRT:       'SRT',
  VTT:       'VTT',
  BURNED_IN: 'BURNED_IN',
});

export function createSubtitlePlan(script, config = {}) {
  if (!script || !script.sections) throw new Error('createSubtitlePlan requires script');
  let timeOffset = 0;
  const cues = script.sections.map((section, i) => {
    const durationSec = Math.max(2, Math.ceil(section.text.split(/\s+/).length * 0.4));
    const cue = Object.freeze({
      index:     i + 1,
      startSec:  timeOffset,
      endSec:    timeOffset + durationSec,
      text:      section.text,
    });
    timeOffset += durationSec;
    return cue;
  });
  return Object.freeze({
    formats:  Object.freeze(config.formats ?? [SUBTITLE_FORMAT.VTT, SUBTITLE_FORMAT.BURNED_IN]),
    language: config.language ?? 'es-ES',
    cues:     Object.freeze(cues),
    isReal:   false,
  });
}

export const SUBTITLE_PLAN_VERSION = '1.0.0';
