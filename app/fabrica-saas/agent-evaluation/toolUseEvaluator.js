// Tool Use Evaluator — ADV-10

export const TOOL_USE_VERDICT = Object.freeze({
  CORRECT:     'CORRECT',
  UNNECESSARY: 'UNNECESSARY',
  WRONG_TOOL:  'WRONG_TOOL',
  MISSING:     'MISSING',
  FAILED:      'FAILED',
});

export function evaluateToolUse(response = {}) {
  const { expectedTool, actualTool, toolCallCount = 0, toolFailed = false, fallbackProvided = true } = response;

  const issues = [];
  let score = 100;

  if (toolFailed) {
    score -= 20;
    issues.push('Tool call failed');
    if (!fallbackProvided) { score -= 15; issues.push('No fallback after tool failure'); }
  }

  if (expectedTool && !actualTool) {
    score -= 30;
    issues.push(`Expected tool ${expectedTool} not called`);
  } else if (expectedTool && actualTool && expectedTool !== actualTool) {
    score -= 25;
    issues.push(`Wrong tool: expected ${expectedTool}, got ${actualTool}`);
  } else if (!expectedTool && toolCallCount > 0) {
    score -= 10;
    issues.push('Unnecessary tool call');
  }

  if (toolCallCount > 3) {
    score -= 10;
    issues.push('Excessive tool calls (> 3)');
  }

  let verdict = TOOL_USE_VERDICT.CORRECT;
  if (expectedTool && !actualTool)                              verdict = TOOL_USE_VERDICT.MISSING;
  else if (expectedTool && actualTool && expectedTool !== actualTool) verdict = TOOL_USE_VERDICT.WRONG_TOOL;
  else if (!expectedTool && toolCallCount > 0)                 verdict = TOOL_USE_VERDICT.UNNECESSARY;
  else if (toolFailed)                                         verdict = TOOL_USE_VERDICT.FAILED;

  return Object.freeze({ score: Math.max(0, score), verdict, issues: Object.freeze(issues), isReal: false });
}

export const TOOL_USE_EVALUATOR_VERSION = '1.0.0';
