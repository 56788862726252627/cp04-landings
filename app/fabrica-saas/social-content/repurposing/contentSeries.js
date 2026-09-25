// Content Series — groups of related posts forming a narrative arc

export const SERIES_TYPE = Object.freeze({
  EDUCATIONAL_SEQUENCE:  'EDUCATIONAL_SEQUENCE',  // "Guía paso a paso en X partes"
  WEEKLY_CHALLENGE:      'WEEKLY_CHALLENGE',       // "Reto semanal"
  BEFORE_AFTER:          'BEFORE_AFTER',           // transformation arc
  MEET_THE_TEAM:         'MEET_THE_TEAM',          // team member spotlight
  FAQ_SERIES:            'FAQ_SERIES',             // answering frequent questions
  SEASONAL_COUNTDOWN:    'SEASONAL_COUNTDOWN',     // e.g. "5 días para el evento"
  PRODUCT_DEEP_DIVE:     'PRODUCT_DEEP_DIVE',      // service/product series
});

export function createContentSeries(config = {}) {
  if (!config.businessId) throw new Error('ContentSeries requires businessId');
  if (!config.clientId)   throw new Error('ContentSeries requires clientId');
  if (!config.type)       throw new Error('ContentSeries requires type');
  if (!config.title)      throw new Error('ContentSeries requires title');
  if (!Object.values(SERIES_TYPE).includes(config.type)) throw new Error(`Unknown series type: ${config.type}`);
  if (!config.episodes || config.episodes < 2) throw new Error('ContentSeries requires at least 2 episodes');

  return Object.freeze({
    id:          config.id ?? `series_${config.businessId}_${Date.now()}`,
    businessId:  config.businessId,
    clientId:    config.clientId,
    type:        config.type,
    title:       config.title,
    episodes:    config.episodes,
    channel:     config.channel ?? 'INSTAGRAM_REEL',
    pillar:      config.pillar  ?? 'EDUCATIONAL',
    cadenceDays: config.cadenceDays ?? 7,
    posts:       Object.freeze(config.posts ?? []),
    isReal:      false,
  });
}
