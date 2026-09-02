// Generate Social Post — assembles a complete social post from a brief

import { generateHook, getBestHookForObjective } from './socialHookEngine.js';
import { generateCTA, getBestCTAForObjective }   from './socialCTAEngine.js';
import { generateHashtags }                       from './hashtagStrategy.js';
import { getCopyStyleMeta }                       from '../core/socialCopyStyle.js';

export function generateSocialPost(brief = {}) {
  if (!brief.businessId) throw new Error('generateSocialPost requires businessId');
  if (!brief.clientId)   throw new Error('generateSocialPost requires clientId');
  if (!brief.objective)  throw new Error('generateSocialPost requires objective');
  if (!brief.channel)    throw new Error('generateSocialPost requires channel');
  if (!brief.topic)      throw new Error('generateSocialPost requires topic');

  const hookType = getBestHookForObjective(brief.objective);
  const ctaType  = getBestCTAForObjective(brief.objective);
  const hook     = generateHook({ type: hookType, topic: brief.topic, locality: brief.locality });
  const cta      = generateCTA({ type: ctaType, address: brief.address });
  const hashtags = generateHashtags({ channel: brief.channel, sector: brief.sector ?? 'default', city: brief.city });
  const style    = getCopyStyleMeta(brief.copyStyle ?? 'CONVERSATIONAL');

  const body = brief.bodyTemplate
    ? brief.bodyTemplate.replace('{{topic}}', brief.topic)
    : `Hoy hablamos de ${brief.topic}. ${brief.keyMessage ?? 'Un contenido pensado para ti.'}`;

  const fullText = [hook.text, body, cta.text, hashtags.hashtags.join(' ')].filter(Boolean).join('\n\n');

  return Object.freeze({
    businessId:  brief.businessId,
    clientId:    brief.clientId,
    channel:     brief.channel,
    objective:   brief.objective,
    pillar:      brief.pillar ?? null,
    hookType,
    ctaType,
    hook:        hook.text,
    body,
    cta:         cta.text,
    hashtags:    hashtags.hashtags,
    copyStyle:   style.style,
    fullText,
    wordCount:   fullText.split(/\s+/).length,
    noRealPublish: true,
    isReal:      false,
  });
}
