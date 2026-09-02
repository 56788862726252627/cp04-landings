/**
 * Factory Premium Registry V2
 * Central metadata registry for all factory components, recipes, presets, and profiles.
 * 12 sub-registries exported from this index.
 */

export { COMPONENT_REGISTRY }   from './components.js';
export { RECIPE_REGISTRY }      from './recipes/index.js';
export { PRESET_REGISTRY }      from './presetRegistry.js';
export { TYPOGRAPHY_REGISTRY }  from './typography.js';
export { INTERACTION_REGISTRY } from './interactions.js';
export { LAYOUT_REGISTRY }      from './layouts.js';
export { SECTOR_REGISTRY }      from './sectors.js';
export { TOKEN_REGISTRY }       from './tokenRegistry.js';
export { AI_PROFILE_REGISTRY }  from './aiProfiles.js';
export { A11Y_REGISTRY }        from './accessibility.js';
export { PERF_REGISTRY }        from './performance.js';
export { COMPAT_REGISTRY }      from './compatibility.js';

export { DEAD_CONTROL_GATE, FUNCTIONAL_EXPERIENCE_GATE, MOBILE_PRODUCT_GATE, FACTORY_GATES, BREAKPOINTS } from '../core/gates/index.js';

// Paso B — One Prompt → SaaS Pipeline
export { validateBrief, BRIEF_SCHEMA, FIELD_STATUS }        from '../generator/schema/onePromptSchema.js';
export { analyzeBusiness }                                   from '../core/businessAnalyzer.js';
export { resolveVertical }                                   from '../core/verticalResolver.js';
export { generateBranding }                                  from '../core/brandEngine.js';
export { planModules }                                       from '../core/modulePlanner.js';
export { planRoles }                                         from '../core/roleEngine.js';
export { planDataModel }                                     from '../core/dataModelPlanner.js';
export { planAIAgents }                                      from '../core/aiAgentPlanner.js';
export { generateMakeManifest }                              from '../core/makeManifest.js';
export { generateContent }                                   from '../core/contentEngine.js';
export { generateIntegrationManifest }                       from '../core/integrationManifest.js';
export { getSectorById, listSectorIds }                      from './sectors.js';
export { VETERINARY_CONFIG }                                 from '../verticals/veterinary/config.js';

// Paso C — Commercial Product & Pricing System
export * from './commercial.js';

// Paso D — Client Lifecycle Pipeline
export * from './lifecycle.js';

// Paso E — SOP + BPMN Operating System
export * from './sop.js';

// Paso F — Maintenance, Support & Backup Operating System
export * from './maintenance.js';

// Paso G — Deploy + QA + Security Reutilizable
export * from './deploy.js';

// Paso H — Final Audit & Consolidation
export * from './audit.js';

// ADV-01 — Transversal Observability
export * from './observability.js';

// ADV-02 — CI/CD Automatizado
export * from './cicd.js';

// ADV-06 — Browser QA Engine
export { BROWSER_QA_REGISTRY } from './browserQA.js';

// ADV-07 — Premium Experience Engine
export { PREMIUM_EXPERIENCE_REGISTRY } from './premiumExperience.js';

// ADV-08 — Lead Engine + Apify Provider Foundation
export { LEAD_ENGINE_REGISTRY } from './leadEngine.js';

// ADV-09 — Agency Commercial CRM Engine
export { CRM_REGISTRY } from './crm.js';

// ADV-10 — Agent Evaluation + Langfuse Tracing Foundation
export { AGENT_EVALUATION_REGISTRY } from './agentEvaluation.js';

export const REGISTRY_VERSION = '3.4.1';
export const REGISTRY_CREATED = '2026-08-30';
export const REGISTRY_UPDATED = '2026-09-02';
export const PASO_A_STATUS      = '100_PERCENT';
export const PASO_B_STATUS      = '100_PERCENT';
export const PASO_C_STATUS      = '100_PERCENT';
export const PASO_D_STATUS_MAIN = '100_PERCENT';
export const PASO_E_STATUS_MAIN = '100_PERCENT';
export const PASO_F_STATUS_MAIN = '100_PERCENT';
export const PASO_G_STATUS_MAIN = '100_PERCENT';
export const PASO_H_STATUS_MAIN  = '100_PERCENT';
export const PASO_ADV01_STATUS   = '100_PERCENT';
export const PASO_ADV02_STATUS   = '100_PERCENT';
export const PASO_ADV06_STATUS   = '100_PERCENT';
export const PASO_ADV07_STATUS   = '100_PERCENT';
export const PASO_ADV08_STATUS   = '100_PERCENT';
export const PASO_ADV09_STATUS   = '100_PERCENT';
export const PASO_ADV10_STATUS   = '100_PERCENT';
export const PASO_ADV10B_STATUS  = '100_PERCENT';
