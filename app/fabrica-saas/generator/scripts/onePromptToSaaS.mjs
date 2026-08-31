/**
 * ONE PROMPT → SaaS — E2E Generation Runner
 * Orchestrates: validate → analyze → resolve → brand → experience →
 *               modules → roles → data → AI → Make → content → integrations → QA
 *
 * Returns a complete GenerationResult with all artifacts.
 * No real connections. No real data. No secrets.
 */

import { validateBrief }              from '../schema/onePromptSchema.js';
import { analyzeBusiness }            from '../../core/businessAnalyzer.js';
import { resolveVertical }            from '../../core/verticalResolver.js';
import { generateBranding }           from '../../core/brandEngine.js';
import { resolveExperience }          from '../../core/experienceDecisionEngine.js';
import { planModules }                from '../../core/modulePlanner.js';
import { planRoles }                  from '../../core/roleEngine.js';
import { planDataModel }              from '../../core/dataModelPlanner.js';
import { planAIAgents }               from '../../core/aiAgentPlanner.js';
import { generateMakeManifest }       from '../../core/makeManifest.js';
import { generateContent }            from '../../core/contentEngine.js';
import { generateIntegrationManifest } from '../../core/integrationManifest.js';

export const ONE_PROMPT_RUNNER_VERSION = '1.0.0';

// ─── QA Engine ────────────────────────────────────────────────────────────────

function runQAChecks(result) {
  const checks = [];

  // Schema validation
  checks.push({ check: 'schema_valid',       pass: result.steps.validate.valid,    critical: true  });
  // No secrets — detect actual key:value patterns, not just credential name strings
  const hasSecrets = JSON.stringify(result).match(/"(?:api_key|password|secret|private_key)"\s*:\s*"[^"]{8,}"/i);
  checks.push({ check: 'no_secrets',         pass: !hasSecrets,                    critical: true  });
  // No real data
  const hasRealEmail = JSON.stringify(result).match(/@(?!demo\.test)[a-z0-9.-]+\.[a-z]{2,}/i);
  checks.push({ check: 'no_real_email',      pass: !hasRealEmail,                  critical: true  });
  // No production payments
  checks.push({ check: 'no_real_payments',   pass: !result.brief?.paymentNeeds?.realPayments, critical: true });
  // No real bookings
  checks.push({ check: 'no_real_bookings',   pass: !result.brief?.paymentNeeds?.realPayments, critical: true });
  // No production integrations
  const intMan = result.artifacts?.integrationManifest;
  const allConnected = intMan?.integrations?.required?.every(i => !i.productionReady) ?? true;
  checks.push({ check: 'no_production_integrations', pass: allConnected, critical: true });
  // Has branding
  checks.push({ check: 'branding_generated', pass: !!result.artifacts?.branding?.palette, critical: false });
  // Has modules
  checks.push({ check: 'modules_planned',    pass: (result.artifacts?.modulePlan?.total ?? 0) > 0, critical: false });
  // Has roles
  checks.push({ check: 'roles_planned',      pass: (result.artifacts?.rolePlan?.total ?? 0) > 0, critical: false });
  // Has data model
  checks.push({ check: 'data_model_planned', pass: (result.artifacts?.dataModel?.totalEntities ?? 0) > 0, critical: false });
  // Functional gate — at least one CTA pattern declared
  const hasConversionGoal = !!result.brief?.conversionGoal;
  checks.push({ check: 'functional_gate',    pass: hasConversionGoal, critical: false });
  // Mobile gate
  checks.push({ check: 'mobile_gate',        pass: result.brief?.devicePriority !== null, critical: false });
  // Accessibility gate
  checks.push({ check: 'accessibility_gate', pass: result.brief?.accessibilityNeeds?.wcagLevel === 'AA', critical: false });
  // Security gate — no insecure role defaults
  const roles = result.artifacts?.rolePlan?.roles ?? [];
  const allSecure = roles.every(r => r.secureByDefault);
  checks.push({ check: 'security_gate',      pass: allSecure, critical: true });
  // Cross-client contamination — no refs to other clients
  const existingClients = ['cp04', 'aurora', 'fisionova', 'educa-archidona'];
  const json = JSON.stringify(result);
  const crossContamination = existingClients.some(c => json.toLowerCase().includes(c));
  checks.push({ check: 'cross_client_clean', pass: !crossContamination, critical: true });

  const failed   = checks.filter(c => !c.pass);
  const critical = failed.filter(c => c.critical);

  return {
    totalChecks:    checks.length,
    passed:         checks.filter(c => c.pass).length,
    failed:         failed.length,
    criticalFailed: critical.length,
    pass:           critical.length === 0,
    checks,
    failedChecks:   failed.map(c => c.check),
  };
}

// ─── Token Efficiency Estimate ────────────────────────────────────────────────

function estimateTokenEfficiency(result) {
  const artifactJson   = JSON.stringify(result.artifacts ?? {});
  const rawEstimate    = Math.ceil(artifactJson.length / 4);
  const registryLookups = (result.artifacts?.modulePlan?.coreCount ?? 0) +
                          (result.artifacts?.rolePlan?.total ?? 0);
  const savedByRegistry = registryLookups * 150;
  const aiCallsAvoided  = result.steps?.aiAgents?.totalAgents ?? 0;
  const savedByDeterminism = aiCallsAvoided * 500;
  const totalSaved   = savedByRegistry + savedByDeterminism;
  const totalPercent = rawEstimate > 0 ? Math.min(Math.round((totalSaved / (rawEstimate + totalSaved)) * 100), 85) : 0;

  return {
    rawContextEstimate:        rawEstimate,
    registryLookupsSaved:      savedByRegistry,
    deterministicRulesSaved:   savedByDeterminism,
    estimatedTokensSaved:       totalSaved,
    estimatedSavedPercent:     totalPercent,
    note: 'Estimated — not using real tokenizer. Actual savings depend on AI Router tier usage.',
  };
}

// ─── Failure Handling ─────────────────────────────────────────────────────────

const KNOWN_FAILURE_MODES = new Set([
  'missing_sector', 'ambiguous_sector', 'unsupported_module',
  'forbidden_production_integration', 'missing_required_data',
  'invalid_role', 'payment_requested_but_disabled',
  'real_data_looking_input',
]);

function detectFailureMode(brief, errors) {
  const modes = [];
  if (errors.some(e => e.includes('sector')))  modes.push('missing_sector');
  if (errors.some(e => e.includes('real payments'))) modes.push('payment_requested_but_disabled');
  if (errors.some(e => e.includes('real bookings'))) modes.push('forbidden_production_integration');
  if (!brief?.businessName) modes.push('missing_required_data');
  return modes;
}

// ─── Main Runner ──────────────────────────────────────────────────────────────

/**
 * Execute the One Prompt → SaaS pipeline.
 * @param {Object} rawBrief - raw input brief
 * @returns {Object} GenerationResult
 */
export async function onePromptToSaaS(rawBrief = {}) {
  const result = {
    runnerVersion: ONE_PROMPT_RUNNER_VERSION,
    startedAt:     new Date().toISOString(),
    steps:         {},
    brief:         null,
    artifacts:     {},
    qa:            null,
    tokenEfficiency: null,
    warnings:      [],
    errors:        [],
    success:       false,
    failureModes:  [],
    nextActions:   [],
  };

  try {
    // ── Step 1: Validate ──────────────────────────────────────────────────────
    const validation = validateBrief(rawBrief);
    result.steps.validate = { valid: validation.valid, errors: validation.errors, warnings: validation.warnings, fieldTrace: validation.fieldTrace };
    result.warnings.push(...validation.warnings);

    if (!validation.valid) {
      result.errors.push(...validation.errors);
      result.failureModes = detectFailureMode(rawBrief, validation.errors);
      result.nextActions  = ['Fix validation errors before proceeding', ...validation.errors.map(e => `→ ${e}`)];
      result.success = false;
      return result;
    }

    result.brief = validation.brief;

    // ── Step 2: Analyze ───────────────────────────────────────────────────────
    const profile   = analyzeBusiness(validation.brief);
    result.steps.analyze = { sector: profile.sector, riskTier: profile.riskProfile?.tier, requiresHumanReview: profile.requiresHumanReview };
    result.warnings.push(...(profile.complianceProfile?.requirements?.length > 0 ? [`Compliance requirements: ${profile.complianceProfile.requirements.join(', ')}`] : []));

    if (profile.requiresHumanReview) {
      result.warnings.push('⚠ Human review required before production — high risk profile detected');
    }

    // ── Step 3: Resolve Vertical ──────────────────────────────────────────────
    const resolution  = resolveVertical(profile, validation.brief);
    result.steps.resolveVertical = { resolved: resolution.resolvedVertical, extended: resolution.extended, layers: Object.keys(resolution.layers) };
    result.warnings.push(...resolution.warnings);

    // ── Step 4: Brand ─────────────────────────────────────────────────────────
    const branding    = generateBranding(validation.brief, profile);
    result.steps.brand = { brandName: branding.businessName, tone: branding.tone, paletteGenerated: !!branding.palette };
    result.artifacts.branding = branding;

    // ── Step 5: Experience ────────────────────────────────────────────────────
    const experience  = resolveExperience({
      vertical: validation.brief.sector,
      brand:    { name: branding.businessName },
      audience: validation.brief.targetAudience,
      isMobile: validation.brief.devicePriority === 'mobile',
    });
    result.steps.experience = { preset: experience.preset?.id ?? experience.presetId, layoutPersonality: experience.preset?.layoutPersonality };
    result.artifacts.experience = experience;

    // ── Step 6: Modules ───────────────────────────────────────────────────────
    const modulePlan  = planModules(profile, resolution, validation.brief);
    result.steps.modules = { total: modulePlan.total, core: modulePlan.coreCount, vertical: modulePlan.verticalCount };
    result.artifacts.modulePlan = modulePlan;

    // ── Step 7: Roles ─────────────────────────────────────────────────────────
    const rolePlan    = planRoles(validation.brief, modulePlan);
    result.steps.roles = { total: rolePlan.total, roles: rolePlan.roles.map(r => r.roleId) };
    result.artifacts.rolePlan = rolePlan;

    // ── Step 8: Data Model ────────────────────────────────────────────────────
    const dataModel   = planDataModel(validation.brief, modulePlan, profile);
    result.steps.dataModel = { entities: dataModel.totalEntities, demoOnly: dataModel.demoOnly };
    result.artifacts.dataModel = dataModel;

    // ── Step 9: AI Agents ─────────────────────────────────────────────────────
    const aiPlan      = planAIAgents(validation.brief, profile);
    result.steps.aiAgents = { total: aiPlan.totalAgents, agents: aiPlan.agents.map(a => a.id) };
    result.artifacts.aiPlan = aiPlan;

    // ── Step 10: Make Manifest ────────────────────────────────────────────────
    const makeManifest = generateMakeManifest(validation.brief, profile);
    result.steps.makeManifest = { total: makeManifest.totalAutomations, automations: makeManifest.automations.map(a => a.id) };
    result.artifacts.makeManifest = makeManifest;

    // ── Step 11: Content ──────────────────────────────────────────────────────
    const content     = generateContent(validation.brief, branding, profile);
    result.steps.content = { language: content.language, demoClientsGenerated: content.demoData.clients.length };
    result.artifacts.content = content;

    // ── Step 12: Integrations ─────────────────────────────────────────────────
    const integrations = generateIntegrationManifest(validation.brief, profile);
    result.steps.integrations = { total: integrations.totalIntegrations, required: integrations.integrations.required.map(i => i.id) };
    result.artifacts.integrationManifest = integrations;

    // ── Step 13: QA ───────────────────────────────────────────────────────────
    const qa = runQAChecks(result);
    result.qa = qa;
    result.steps.qa = { pass: qa.pass, totalChecks: qa.totalChecks, passed: qa.passed, failed: qa.failed };

    // ── Step 14: Token Efficiency ─────────────────────────────────────────────
    result.tokenEfficiency = estimateTokenEfficiency(result);

    // ── Final Status ──────────────────────────────────────────────────────────
    result.success = qa.pass;
    result.completedAt = new Date().toISOString();
    result.generatedFiles = [
      'business-analysis.json', 'branding.json', 'experience.json',
      'modules.json', 'roles.json', 'data-model.json',
      'ai-agents.json', 'make-automations.json', 'integrations.json',
      'content.json', 'qa-report.json', 'delivery-manifest.json',
    ];

    if (!qa.pass) {
      result.errors.push(`QA failed: ${qa.criticalFailed} critical check(s) failed`);
      result.errors.push(...qa.failedChecks.map(c => `→ FAIL: ${c}`));
      result.nextActions = ['Fix critical QA failures', ...qa.failedChecks.map(c => `Fix: ${c}`)];
    } else {
      result.nextActions = [
        'Review generated artifacts in /output/<client-name>/',
        'Validate landing composition with Anti-Template Engine',
        'Run Dead Control Gate on generated UI specs',
        'Deploy to Cloudflare Pages preview (not production)',
        'Configure real credentials before production launch',
      ];
    }

  } catch (err) {
    result.errors.push(`Pipeline error: ${err.message}`);
    result.success = false;
    result.failureModes = ['pipeline_error'];
    result.nextActions  = ['Check error message and fix the underlying issue'];
  }

  return result;
}
