// Content Idea Generator — produces a list of ranked content ideas

import { CONTENT_PILLAR } from '../core/contentPillar.js';
import { scoreContentIdea } from './contentIdeaScore.js';
import { checkContentNovelty, NOVELTY_STATUS } from './contentNoveltyEngine.js';

const PILLAR_IDEA_TEMPLATES = Object.freeze({
  [CONTENT_PILLAR.EDUCATIONAL]:       ['Guía básica de {{topic}}', '5 cosas que no sabías sobre {{topic}}', 'Cómo mejorar {{topic}} en 7 días'],
  [CONTENT_PILLAR.SOCIAL_PROOF]:      ['Lo que dicen nuestros clientes sobre {{topic}}', 'Historias de éxito: {{topic}}'],
  [CONTENT_PILLAR.TIPS_AND_TRICKS]:   ['Tip del día: {{topic}}', '3 errores comunes en {{topic}} y cómo evitarlos'],
  [CONTENT_PILLAR.BEHIND_THE_SCENES]: ['Así preparamos {{topic}}', 'El equipo detrás de {{topic}}'],
  [CONTENT_PILLAR.PROMOTIONS]:        ['Oferta especial: {{topic}}', 'Solo esta semana: {{topic}}'],
  [CONTENT_PILLAR.COMMUNITY]:         ['Nuestra comunidad celebra {{topic}}', 'Únete a nosotros en {{topic}}'],
  [CONTENT_PILLAR.LOCAL_EVENTS]:      ['Este {{topic}} en nuestra ciudad', 'Evento especial: {{topic}}'],
  [CONTENT_PILLAR.INTERACTIVE]:       ['¿Cuál prefieres? {{topic}}', 'Cuéntanos tu experiencia con {{topic}}'],
  [CONTENT_PILLAR.FAQ]:               ['¿Tienes dudas sobre {{topic}}? Te respondemos', 'Respuestas a las preguntas más frecuentes sobre {{topic}}'],
  [CONTENT_PILLAR.SEASONAL]:          ['Especial temporada: {{topic}}', 'No te pierdas {{topic}} esta estación'],
  [CONTENT_PILLAR.TEAM]:              ['Conoce a nuestro equipo: {{topic}}', 'El experto detrás de {{topic}}'],
  [CONTENT_PILLAR.TRANSFORMATIONS]:   ['Antes y después: {{topic}}', 'El camino hacia {{topic}}'],
  [CONTENT_PILLAR.USER_CONTENT]:      ['Compartido por uno de nuestros clientes: {{topic}}'],
  [CONTENT_PILLAR.PRODUCT_SHOWCASE]:  ['Descubre {{topic}}', 'Todo lo que necesitas saber sobre {{topic}}'],
  [CONTENT_PILLAR.VALUES]:            ['Por qué creemos en {{topic}}', 'Nuestros valores: {{topic}}'],
});

export function generateContentIdeas(params = {}) {
  if (!params.businessId) throw new Error('generateContentIdeas requires businessId');
  if (!params.clientId)   throw new Error('generateContentIdeas requires clientId');
  if (!params.pillars || params.pillars.length === 0) throw new Error('generateContentIdeas requires pillars');

  const topics    = params.topics ?? ['tu negocio', 'nuestro servicio', 'el equipo'];
  const existing  = params.existingIdeas ?? [];
  const objective = params.objective ?? 'BRAND_AWARENESS';
  const ideas     = [];
  let   idCounter = 1;

  for (const pillar of params.pillars) {
    const templates = PILLAR_IDEA_TEMPLATES[pillar] ?? [`Contenido de ${pillar}`];
    for (const topic of topics.slice(0, 2)) {
      const tmpl  = templates[idCounter % templates.length];
      const title = tmpl.replace('{{topic}}', topic);
      const novelty = checkContentNovelty({ topic: title, pillar }, existing);
      if (novelty.status === NOVELTY_STATUS.DUPLICATE) continue;

      const idea = {
        id:           `idea_${params.businessId}_${idCounter++}`,
        topic:        title,
        pillar,
        objective,
        noveltyScore: novelty.score,
        hasSuspectedClaim: false,
      };
      const scored = scoreContentIdea(idea, { pillarMatch: true, seasonalMatch: false, audienceFit: true });
      ideas.push(Object.freeze({ ...idea, score: scored.total }));
    }
  }

  const sorted = [...ideas].sort((a, b) => b.score - a.score);

  return Object.freeze({
    businessId: params.businessId,
    clientId:   params.clientId,
    ideas:      Object.freeze(sorted),
    total:      sorted.length,
    isReal:     false,
  });
}
