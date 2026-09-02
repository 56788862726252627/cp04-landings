// Content Novelty Engine — detects if an idea is fresh or repetitive

export const NOVELTY_STATUS = Object.freeze({
  FRESH:       'FRESH',
  SIMILAR:     'SIMILAR',
  REPETITIVE:  'REPETITIVE',
  DUPLICATE:   'DUPLICATE',
});

export function checkContentNovelty(newIdea = {}, existingIdeas = []) {
  if (!newIdea.topic) throw new Error('checkContentNovelty requires topic');

  const newTopic = newIdea.topic.toLowerCase().trim();

  const exactMatch = existingIdeas.find(e =>
    e.topic?.toLowerCase().trim() === newTopic &&
    e.pillar === newIdea.pillar
  );
  if (exactMatch) {
    return Object.freeze({ status: NOVELTY_STATUS.DUPLICATE, matchedId: exactMatch.id, score: 0, isReal: false });
  }

  const similarMatches = existingIdeas.filter(e => {
    const eTopic = e.topic?.toLowerCase().trim() ?? '';
    const overlap = newTopic.split(' ').filter(w => w.length > 3 && eTopic.includes(w)).length;
    return overlap >= 2;
  });
  if (similarMatches.length >= 3) {
    return Object.freeze({ status: NOVELTY_STATUS.REPETITIVE, matchCount: similarMatches.length, score: 30, isReal: false });
  }
  if (similarMatches.length >= 1) {
    return Object.freeze({ status: NOVELTY_STATUS.SIMILAR, matchCount: similarMatches.length, score: 65, isReal: false });
  }

  return Object.freeze({ status: NOVELTY_STATUS.FRESH, matchCount: 0, score: 100, isReal: false });
}
