// Browser QA Score — ADV-06
// Calculates an overall browser QA score (0-100) from phase results.

export const SCORE_GRADE = Object.freeze({
  A_PLUS:  { min: 95, label: 'A+', color: 'green' },
  A:       { min: 90, label: 'A',  color: 'green' },
  B:       { min: 80, label: 'B',  color: 'blue' },
  C:       { min: 70, label: 'C',  color: 'yellow' },
  D:       { min: 60, label: 'D',  color: 'orange' },
  F:       { min: 0,  label: 'F',  color: 'red' },
});

// Phase weights (sum to 100)
const PHASE_WEIGHTS = Object.freeze({
  RENDER:        20,
  CONSOLE:       15,
  NETWORK:       10,
  CONTROLS:      10,
  FORMS:         8,
  RESPONSIVE:    8,
  ACCESSIBILITY: 8,
  KEYBOARD:      5,
  VISUAL:        5,
  CRITICAL_FLOWS:6,
  PERFORMANCE:   5,
});

export function getGrade(score) {
  for (const [, g] of Object.entries(SCORE_GRADE)) {
    if (score >= g.min) return g;
  }
  return SCORE_GRADE.F;
}

export function calculatePhaseScore(phaseResult = {}) {
  const { status } = phaseResult;
  if (status === 'PASS') return 100;
  if (status === 'WARN') return 60;
  if (status === 'FAIL') return 0;
  return 50;
}

export function calculateBrowserQAScore(phaseResults = {}) {
  const scores = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [phase, weight] of Object.entries(PHASE_WEIGHTS)) {
    const result = phaseResults[phase];
    if (!result) continue;
    const score = calculatePhaseScore(result);
    scores.push({ phase, weight, score, status: result.status ?? 'UNKNOWN' });
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const grade = getGrade(overallScore);

  return Object.freeze({
    valid:        true,
    score:        overallScore,
    grade:        grade.label,
    color:        grade.color,
    phases:       scores,
    coverage:     totalWeight > 0 ? Math.round((totalWeight / 100) * 100) : 0,
    isReal:       false,
  });
}

export function scoreSummary(qaScore = {}) {
  if (!qaScore.valid) return 'Score unavailable';
  return `Score: ${qaScore.score}/100 (Grade ${qaScore.grade}) — ${qaScore.phases.length} phases evaluated`;
}

export function isScoreDeployable(qaScore = {}, minScore = 70) {
  if (!qaScore.valid) return false;
  return qaScore.score >= minScore;
}

export const BROWSER_QA_SCORE_VERSION = '1.0.0';
