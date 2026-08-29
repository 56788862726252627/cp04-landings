/**
 * Factory AI Router — classifies tasks by cost/complexity tier
 * TIER 1: Local free (OpenCode + Ollama)
 * TIER 2: Local + optimized context (Repomix + OpenCode/Ollama)
 * TIER 3: Claude + Repomix context
 * TIER 4: Claude + human review
 */

export const AI_TIERS = Object.freeze({
  TIER1_LOCAL:   'TIER1_LOCAL',
  TIER2_CONTEXT: 'TIER2_CONTEXT',
  TIER3_CLAUDE:  'TIER3_CLAUDE',
  TIER4_REVIEW:  'TIER4_REVIEW',
});

// Task type keywords → tier mapping
const TIER1_PATTERNS = [
  'search', 'find', 'grep', 'lookup',
  'document', 'docstring', 'jsdoc',
  'test-unit', 'test-simple',
  'lint', 'build-check',
  'boilerplate', 'scaffold-simple',
  'rename', 'reformat',
  'list', 'inspect',
  'repetitive', 'generate-repeated',
];

const TIER2_PATTERNS = [
  'refactor-medium', 'refactor',
  'module-new', 'feature-small',
  'multi-file', 'cross-file',
  'manifest-edit', 'client-new',
  'analyze-several',
];

const TIER3_PATTERNS = [
  'architecture', 'design-system',
  'security', 'auth',
  'migration', 'schema-change',
  'debug-complex', 'performance',
  'integration', 'api-design',
  'critical-decision', 'breaking-change',
];

const TIER4_PATTERNS = [
  'production', 'deploy',
  'payment', 'stripe',
  'credentials', 'secrets',
  'database-migration',
  'infrastructure',
  'data-loss-risk',
  'auth-critical',
];

/**
 * Classify a task description into an AI tier.
 * @param {string} taskDescription
 * @param {{ localModelAvailable?: boolean }} opts
 * @returns {{ tier: string, reason: string, repomixProfile?: string }}
 */
export function classifyTask(taskDescription, opts = {}) {
  const { localModelAvailable = false } = opts;
  const desc = taskDescription.toLowerCase();

  // TIER 4 — highest priority check
  if (TIER4_PATTERNS.some(p => desc.includes(p))) {
    return {
      tier: AI_TIERS.TIER4_REVIEW,
      reason: 'Production-critical task requires Claude + human review.',
      repomixProfile: 'architecture',
    };
  }

  // TIER 3
  if (TIER3_PATTERNS.some(p => desc.includes(p))) {
    return {
      tier: AI_TIERS.TIER3_CLAUDE,
      reason: 'Complex/architectural task — Claude recommended with Repomix context.',
      repomixProfile: 'architecture',
    };
  }

  // TIER 2 — multi-file, requires context
  if (TIER2_PATTERNS.some(p => desc.includes(p))) {
    if (!localModelAvailable) {
      return {
        tier: AI_TIERS.TIER3_CLAUDE,
        reason: 'Medium task but local model unavailable — routing to Claude.',
        repomixProfile: 'generator',
      };
    }
    return {
      tier: AI_TIERS.TIER2_CONTEXT,
      reason: 'Medium task — use Repomix to load scope, then OpenCode/Ollama.',
      repomixProfile: 'generator',
    };
  }

  // TIER 1 — simple local tasks
  if (TIER1_PATTERNS.some(p => desc.includes(p))) {
    if (!localModelAvailable) {
      return {
        tier: AI_TIERS.TIER2_CONTEXT,
        reason: 'Simple task but local model unavailable — use Claude with minimal context.',
        repomixProfile: 'core',
      };
    }
    return {
      tier: AI_TIERS.TIER1_LOCAL,
      reason: 'Simple/repetitive task — OpenCode + Ollama (free, local).',
      repomixProfile: null,
    };
  }

  // Default: ask Claude to classify
  return {
    tier: AI_TIERS.TIER3_CLAUDE,
    reason: 'Task unclassified — defaulting to Claude for safety.',
    repomixProfile: 'core',
  };
}

/**
 * Get routing instructions for a classified tier.
 * @param {string} tier
 * @returns {{ engine: string, steps: string[] }}
 */
export function getRoutingInstructions(tier) {
  switch (tier) {
    case AI_TIERS.TIER1_LOCAL:
      return {
        engine: 'OpenCode + Ollama (qwen2.5-coder:1.5b)',
        steps: [
          '1. Ensure ollama serve is running: `ollama serve &`',
          '2. Run: `npm run factory:ai:local`',
          '3. No Repomix needed for simple lookups',
        ],
      };
    case AI_TIERS.TIER2_CONTEXT:
      return {
        engine: 'Repomix + OpenCode/Ollama',
        steps: [
          '1. Generate scoped context: `npm run factory:context:<profile>`',
          '2. Load context file into OpenCode session',
          '3. Run task with local model',
        ],
      };
    case AI_TIERS.TIER3_CLAUDE:
      return {
        engine: 'Claude (Sonnet)',
        steps: [
          '1. Generate scoped context: `npm run factory:context:<profile>`',
          '2. Open Claude Code session',
          '3. Reference context file to reduce token load',
          '4. Execute task',
        ],
      };
    case AI_TIERS.TIER4_REVIEW:
      return {
        engine: 'Claude (Sonnet/Opus) + Human Review',
        steps: [
          '1. Generate architecture context: `npm run factory:context:architecture`',
          '2. Open Claude Code with full context',
          '3. Implement change',
          '4. Human review before commit',
          '5. Test suite must pass before merge',
        ],
      };
    default:
      return { engine: 'Claude', steps: ['Default to Claude for unknown tiers'] };
  }
}

/**
 * Check if a local Ollama model is available.
 * @param {string} host - Ollama host (default: http://127.0.0.1:11434)
 * @returns {Promise<boolean>}
 */
export async function checkLocalModelAvailable(host = 'http://127.0.0.1:11434') {
  try {
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.models) && data.models.length > 0;
  } catch {
    return false;
  }
}
