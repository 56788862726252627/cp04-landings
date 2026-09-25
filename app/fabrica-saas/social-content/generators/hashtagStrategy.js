// Hashtag Strategy — generates hashtag sets per channel and sector

const SECTOR_HASHTAGS = Object.freeze({
  padel:        Object.freeze(['#padel', '#padellife', '#padelovers', '#tenis', '#deportes', '#club']),
  fisioterapia: Object.freeze(['#fisioterapia', '#salud', '#bienestar', '#recuperacion', '#fisio', '#dolor']),
  educacion:    Object.freeze(['#educacion', '#aprendizaje', '#formacion', '#clases', '#escuela', '#conocimiento']),
  clinica:      Object.freeze(['#salud', '#bienestar', '#clinica', '#medicina', '#cuidado']),
  restaurante:  Object.freeze(['#gastronomia', '#restaurante', '#foodie', '#cocina', '#comida']),
  retail:       Object.freeze(['#moda', '#compras', '#oferta', '#tendencia', '#estilo']),
  gimnasio:     Object.freeze(['#gym', '#fitness', '#entrena', '#salud', '#bienestar', '#motivacion']),
  default:      Object.freeze(['#negocio', '#empresa', '#local', '#servicio']),
});

const LOCAL_HASHTAG_PATTERN = (city) => `#${city.toLowerCase().replace(/\s+/g, '')}`;

const CHANNEL_HASHTAG_LIMIT = Object.freeze({
  INSTAGRAM_REEL:    20,
  INSTAGRAM_STORY:   5,
  FACEBOOK:          5,
  TIKTOK:            6,
  YOUTUBE_SHORT:     4,
  YOUTUBE:           8,
  LINKEDIN:          5,
  X:                 2,
  THREADS:           5,
  LANDING:           0,
  EMAIL_EMBED:       0,
  INTERNAL:          0,
});

export function generateHashtags(params = {}) {
  if (!params.channel)  throw new Error('generateHashtags requires channel');
  if (!params.sector)   throw new Error('generateHashtags requires sector');

  const limit    = CHANNEL_HASHTAG_LIMIT[params.channel] ?? 5;
  const sector   = params.sector.toLowerCase();
  const base     = SECTOR_HASHTAGS[sector] ?? SECTOR_HASHTAGS.default;
  const local    = params.city ? [LOCAL_HASHTAG_PATTERN(params.city)] : [];
  const custom   = params.customHashtags ?? [];
  const combined = [...local, ...custom, ...base].slice(0, limit);

  return Object.freeze({
    channel:    params.channel,
    sector:     params.sector,
    hashtags:   Object.freeze(combined),
    count:      combined.length,
    limit,
    isReal:     false,
  });
}
