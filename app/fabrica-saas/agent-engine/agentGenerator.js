// Agent Generator — ADV-03
// generateAgent(): input declarativo → AgentDefinition + runtimeConfig + promptContract.

import { createAgentDefinition, AGENT_TYPE, CHANNEL } from './agentDefinition.js';
import { createHumanProfile } from './humanProfile.js';
import { resolveAgentTone } from './toneEngine.js';
import { resolveAgentPurpose } from './purposeEngine.js';
import { createSalesPolicy } from './salesPolicy.js';
import { createTrustPolicy } from './trustPolicy.js';
import { createMemoryPolicy } from './memoryPolicy.js';
import { createToolPolicy } from './toolPolicy.js';
import { createKnowledgeProfile } from './knowledgeProfile.js';
import { getVerticalAdapter } from './verticalAdapters.js';
import { buildConfigHierarchy } from './clientOverrides.js';
import { buildPromptContract } from './promptContract.js';

/**
 * Generate a complete, deterministic agent from a business brief.
 *
 * input: {
 *   businessProfile:  { name, vertical, description, services, openingHours, location }
 *   vertical:         string
 *   agentType:        AGENT_TYPE.*
 *   channel:          CHANNEL.*
 *   clientOverrides:  {} (optional)
 *   clientId:         string
 * }
 */
export function generateAgent(input = {}) {
  const errors = [];

  const {
    businessProfile = {},
    vertical        = 'DEFAULT',
    agentType       = AGENT_TYPE.CHAT,
    channel         = CHANNEL.WEB_CHAT,
    clientOverrides = {},
    clientId        = 'FACTORY-DEMO',
  } = input;

  if (!businessProfile.name) errors.push('businessProfile.name is required');
  if (!AGENT_TYPE[agentType]) errors.push(`Unknown agentType: ${agentType}`);
  if (errors.length) return { valid: false, errors, agent: null };

  // Resolve components
  const { adapter } = getVerticalAdapter(vertical);
  const tone        = resolveAgentTone({ agentType, vertical });
  const purpose     = resolveAgentPurpose({ agentType, vertical });
  const humanProfile= createHumanProfile();
  const salesPolicy = createSalesPolicy();
  const trustPolicy = createTrustPolicy();
  const memoryPolicy= createMemoryPolicy({ memoryType: 'SESSION' });
  const toolPolicy  = createToolPolicy({ agentType });
  const knowledge   = createKnowledgeProfile({ agentType });

  // Build definition
  const agentId = `${clientId}-${agentType}-${vertical}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const { valid: defValid, definition, errors: defErrors } = createAgentDefinition({
    id:       agentId,
    name:     `${businessProfile.name} — ${agentType}`,
    type:     agentType,
    vertical,
    purpose:  purpose.primaryGoal,
    tone:     tone.primary,
    channel,
    riskLevel: adapter.riskLevel ?? 'LOW',
  });
  if (!defValid) return { valid: false, errors: defErrors, agent: null };

  // Build config hierarchy CORE → VERTICAL → CLIENT
  const coreConfig = { agentId, agentType, vertical, channel, businessProfile, clientId };
  const verticalConfig = { tone: adapter.tone, riskLevel: adapter.riskLevel, safetyDisclaimer: adapter.safetyDisclaimer };
  const { valid: hierValid, errors: hierErrors, config } = buildConfigHierarchy(coreConfig, verticalConfig, clientOverrides, clientId);
  if (!hierValid) return { valid: false, errors: hierErrors, agent: null };

  // Build prompt contract
  const { contract } = buildPromptContract({
    agentType,
    vertical,
    purpose:       purpose.primaryGoal,
    tone:          tone.descriptor,
    businessProfile,
    salesPolicy:   salesPolicy.policy,
    trustPolicy:   trustPolicy.policy,
    memoryPolicy:  memoryPolicy.policy,
    toolPolicy:    toolPolicy.policy,
    knowledge:     knowledge.profile,
    channel,
    safetyDisclaimer: adapter.safetyDisclaimer,
  });

  const agent = Object.freeze({
    valid:           true,
    definition,
    runtimeConfig:   config,
    promptContract:  contract,
    toneResolution:  tone,
    purposeFlow:     purpose,
    humanProfile:    humanProfile.profile,
    salesPolicy:     salesPolicy.policy,
    trustPolicy:     trustPolicy.policy,
    memoryPolicy:    memoryPolicy.policy,
    toolPolicy:      toolPolicy.policy,
    knowledgeProfile: knowledge.profile,
    verticalAdapter: adapter,
    meta: Object.freeze({
      generatedAt: new Date().toISOString(),
      isReal:      false,
      dataType:    'GENERATED_AGENT',
      version:     '1.0.0',
    }),
  });

  return { valid: true, errors: [], agent };
}

export const AGENT_GENERATOR_VERSION = '1.0.0';
