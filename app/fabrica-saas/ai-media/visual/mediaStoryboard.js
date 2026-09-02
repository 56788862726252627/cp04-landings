// Media Storyboard — ADV-13

export function createStoryboardScene(config = {}) {
  if (!config.id) throw new Error('StoryboardScene requires id');
  return Object.freeze({
    id:               config.id,
    duration:         config.duration        ?? 5,
    visual:           config.visual          ?? 'AVATAR_SPEAKING',
    avatarAction:     config.avatarAction    ?? 'SPEAK',
    voiceLine:        config.voiceLine       ?? '',
    overlayText:      config.overlayText     ?? null,
    broll:            config.broll           ?? null,
    transition:       config.transition      ?? 'CUT',
    cta:              config.cta             ?? null,
    businessFactSources: Object.freeze(config.businessFactSources ?? []),
    isReal: false,
  });
}

export function generateStoryboard(config = {}) {
  if (!config.script)   throw new Error('generateStoryboard requires script');
  if (!config.channel)  throw new Error('generateStoryboard requires channel');

  const scenes = config.script.sections.map((section, i) =>
    createStoryboardScene({
      id:         `scene_${i + 1}`,
      duration:   Math.ceil((config.targetDuration ?? 30) * section.durationHint),
      avatarAction: section.section === 'CTA' ? 'GESTURE_CTA' : 'SPEAK',
      voiceLine:  section.text,
      overlayText: section.section === 'CTA' ? section.text : null,
    })
  );

  return Object.freeze({
    channel:        config.channel,
    totalDuration:  scenes.reduce((n, s) => n + s.duration, 0),
    scenes:         Object.freeze(scenes),
    isReal: false,
  });
}

export const MEDIA_STORYBOARD_VERSION = '1.0.0';
