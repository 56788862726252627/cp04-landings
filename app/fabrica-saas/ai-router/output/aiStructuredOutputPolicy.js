// AI Structured Output Policy — ADV-16

export function createAIStructuredOutputPolicy(config = {}) {
  const { requireValidation = true } = config;

  return Object.freeze({
    requireValidation,

    isCompatible(model) {
      return model?.structuredOutput === true;
    },

    validate(output, schema = null) {
      if (!output) return Object.freeze({ valid: false, reason: 'EMPTY_OUTPUT', isReal: false });
      if (!schema) return Object.freeze({ valid: true,  reason: null,           isReal: false });
      // Fixture validation: check required keys exist
      const required = schema.required ?? [];
      const missing  = required.filter(k => !(k in output));
      if (missing.length) {
        return Object.freeze({ valid: false, reason: `MISSING_KEYS: ${missing.join(',')}`, isReal: false });
      }
      return Object.freeze({ valid: true, reason: null, isReal: false });
    },
    isReal: false,
  });
}

export const AI_STRUCTURED_OUTPUT_POLICY_VERSION = '1.0.0';
