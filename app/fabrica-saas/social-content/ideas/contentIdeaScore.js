// Content Idea Score — multi-factor scoring for a content idea

export function scoreContentIdea(idea = {}, context = {}) {
  if (!idea.topic)    throw new Error('scoreContentIdea requires topic');
  if (!idea.pillar)   throw new Error('scoreContentIdea requires pillar');
  if (!idea.objective) throw new Error('scoreContentIdea requires objective');

  const relevance    = context.pillarMatch ? 25 : 10;
  const timing       = context.seasonalMatch ? 20 : 10;
  const novelty      = (idea.noveltyScore ?? 50) * 0.25;
  const audienceFit  = context.audienceFit ? 15 : 5;
  const claimSafe    = idea.hasSuspectedClaim ? 0 : 15;

  const total = Math.min(100, Math.round(relevance + timing + novelty + audienceFit + claimSafe));

  return Object.freeze({
    topic:       idea.topic,
    pillar:      idea.pillar,
    objective:   idea.objective,
    total,
    breakdown: Object.freeze({ relevance, timing, novelty: Math.round(novelty), audienceFit, claimSafe }),
    recommended: total >= 65,
    isReal:      false,
  });
}
