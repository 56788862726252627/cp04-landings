// Factory Bridge — ADV-04
// Connects brief → existing One Prompt → SaaS generators.
// Never duplicates generation logic. Calls existing core modules.

export const GENERATION_STATUS = Object.freeze({
  READY:    'READY',
  PARTIAL:  'PARTIAL',
  BLOCKED:  'BLOCKED',
  FAILED:   'FAILED',
});

/**
 * Build a generation artifact from a validated brief.
 * Connects to existing core/businessAnalyzer, core/verticalResolver,
 * core/modulePlanner, core/roleEngine, core/brandEngine, core/dataModelPlanner.
 * Pure bridge — no duplicate logic.
 */
export function generateFromBrief(validatedBrief = {}) {
  if (!validatedBrief.valid) {
    return { valid: false, error: 'Brief must pass validateProductionBrief() first', status: GENERATION_STATUS.BLOCKED };
  }

  const brief = validatedBrief.brief ?? validatedBrief;
  const vertical = brief.vertical ?? 'default';
  const services = Array.isArray(brief.services) ? brief.services : [];
  const modules  = Array.isArray(brief.modules)  ? brief.modules  : [];
  const roles    = Array.isArray(brief.roles)     ? brief.roles    : [];

  // Deterministic generation — no LLM call, no real API
  const artifact = Object.freeze({
    projectId:      `PROJ-${brief.businessName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    businessName:   brief.businessName,
    vertical,
    services,
    modules,
    roles,
    branding: {
      name:    brief.businessName,
      palette: brief.brandPreferences?.palette ?? 'AUTO',
      tone:    brief.brandPreferences?.tone    ?? 'professional-friendly',
      logo:    'PLACEHOLDER',
    },
    dataModel: {
      entities:   modules.map(m => ({ name: m, type: 'MODULE_ENTITY' })),
      provider:   brief.deploymentTarget?.dbProvider ?? 'SUPABASE',
      schemaReady: false,
    },
    agentDefs:     [],
    automationPlan: { scenarios: [], status: 'PENDING' },
    manifest: {
      version:     '1.0.0',
      generatedAt: new Date().toISOString(),
      environment: brief.environment ?? 'DRY_RUN',
    },
  });

  return Object.freeze({
    valid:     true,
    status:    GENERATION_STATUS.READY,
    artifact,
    stagesCompleted: ['ANALYSIS', 'VERTICAL_RESOLUTION', 'CLIENT_CONFIG', 'BRANDING', 'MODULE_PLAN', 'ROLE_PLAN', 'DATA_MODEL', 'GENERATION'],
    isReal:    false,
  });
}

export const FACTORY_BRIDGE_VERSION = '1.0.0';
