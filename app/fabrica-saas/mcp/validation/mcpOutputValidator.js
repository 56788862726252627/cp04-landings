// MCP Output Validator — ADV-12

export const OUTPUT_VALIDATION_RESULT = Object.freeze({
  PASS:     'PASS',
  WARN:     'WARN',
  FAIL:     'FAIL',
  REDACTED: 'REDACTED',
});

export function validateMCPOutput(output, tool = {}) {
  const issues = [];

  if (output === null || output === undefined) {
    issues.push('NULL_OUTPUT');
    return Object.freeze({ result: OUTPUT_VALIDATION_RESULT.FAIL, issues: Object.freeze(issues), isReal: false });
  }

  const schema = tool.outputSchema ?? {};
  const required = schema.required ?? [];
  for (const field of required) {
    if (typeof output !== 'object' || !(field in output)) {
      issues.push(`MISSING_FIELD:${field}`);
    }
  }

  // Ensure isReal is never missing from model-originated output
  if (typeof output === 'object' && output !== null && !('isReal' in output)) {
    issues.push('MISSING_IS_REAL');
  }

  const result = issues.length === 0
    ? OUTPUT_VALIDATION_RESULT.PASS
    : OUTPUT_VALIDATION_RESULT.WARN;

  return Object.freeze({ result, issues: Object.freeze(issues), isReal: false });
}

export const MCP_OUTPUT_VALIDATOR_VERSION = '1.0.0';
