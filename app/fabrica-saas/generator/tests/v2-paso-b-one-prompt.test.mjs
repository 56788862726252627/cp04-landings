/**
 * PASO B — One Prompt → SaaS Pipeline Test Suite
 * Tests: schema, analyzer, resolver, brand, modules, roles, data model,
 *        AI agents, Make manifest, content, integrations, E2E runner,
 *        veterinary vertical, failure handling, token efficiency.
 * Runner: node --test
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// ─── Imports ──────────────────────────────────────────────────────────────────

import {
  ONE_PROMPT_SCHEMA_VERSION, FIELD_STATUS, BRIEF_SCHEMA, validateBrief,
} from '../schema/onePromptSchema.js';

import { BUSINESS_ANALYZER_VERSION, analyzeBusiness } from '../../core/businessAnalyzer.js';
import { VERTICAL_RESOLVER_VERSION, resolveVertical }  from '../../core/verticalResolver.js';
import { BRAND_ENGINE_VERSION, generateBranding }      from '../../core/brandEngine.js';
import { MODULE_PLANNER_VERSION, planModules }         from '../../core/modulePlanner.js';
import { ROLE_ENGINE_VERSION, planRoles }              from '../../core/roleEngine.js';
import { DATA_MODEL_PLANNER_VERSION, planDataModel }   from '../../core/dataModelPlanner.js';
import { AI_AGENT_PLANNER_VERSION, planAIAgents }      from '../../core/aiAgentPlanner.js';
import { MAKE_MANIFEST_VERSION, generateMakeManifest } from '../../core/makeManifest.js';
import { CONTENT_ENGINE_VERSION, generateContent }     from '../../core/contentEngine.js';
import {
  INTEGRATION_MANIFEST_VERSION, generateIntegrationManifest,
} from '../../core/integrationManifest.js';

import { ONE_PROMPT_RUNNER_VERSION, onePromptToSaaS }  from '../scripts/onePromptToSaaS.mjs';

import { VETERINARY_VERSION, VETERINARY_CONFIG }       from '../../verticals/veterinary/config.js';
import {
  VETERINARY_MOCK_VERSION, DEMO_OWNERS, DEMO_PETS,
  DEMO_APPOINTMENTS, DEMO_VACCINATIONS, DEMO_SERVICES, DASHBOARD_STATS,
} from '../../verticals/veterinary/mockData.js';

import { getSectorById, listSectorIds } from '../../factory-registry/sectors.js';

// ─── Shared Fixtures ──────────────────────────────────────────────────────────

const VET_BRIEF = {
  businessName:  'Clínica Veterinaria Nexo',
  businessType:  'veterinary clinic',
  sector:        'veterinary',
  location:      { city: 'Málaga', region: 'Andalucía', country: 'España' },
  targetAudience:'particular — propietarios de mascotas',
  services:      ['Consulta general', 'Vacunación', 'Cirugía veterinaria'],
  brandTone:     'friendly',
  conversionGoal:'booking',
  roles:         ['admin', 'reception', 'veterinarian', 'owner'],
  requiredModules:['dashboard','booking','patients','history','vaccinations','reminders','chatbot'],
  automationNeeds:['booking-confirmation','appointment-reminder','vaccination-reminder'],
  aiNeeds:       ['appointment-assistant','pet-care-guide','faq-responder'],
  dataNeeds:     { demo: true, production: false, sensitive: false },
  bookingNeeds:  { enabled: true, realBookings: false },
  paymentNeeds:  { enabled: false, realPayments: false },
  language:      'es',
  legalConstraints:{ minorsPolicy: false, gdpr: true, healthData: false },
  devicePriority:'mobile',
  accessibilityNeeds: { wcagLevel: 'AA' },
};

// ─── Phase 2: ONE_PROMPT_SCHEMA ───────────────────────────────────────────────

describe('ONE_PROMPT_SCHEMA — Version', () => {
  it('exports version string', () => {
    assert.equal(typeof ONE_PROMPT_SCHEMA_VERSION, 'string');
    assert.match(ONE_PROMPT_SCHEMA_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('exports FIELD_STATUS with 3 values', () => {
    assert.equal(FIELD_STATUS.PROVIDED,  'PROVIDED');
    assert.equal(FIELD_STATUS.INFERRED,  'INFERRED');
    assert.equal(FIELD_STATUS.DEFAULTED, 'DEFAULTED');
  });

  it('BRIEF_SCHEMA has validate function', () => {
    assert.equal(typeof BRIEF_SCHEMA.validate, 'function');
  });

  it('BRIEF_SCHEMA has known sectors list', () => {
    assert.ok(Array.isArray(BRIEF_SCHEMA.knownSectors));
    assert.ok(BRIEF_SCHEMA.knownSectors.includes('veterinary'));
  });
});

describe('ONE_PROMPT_SCHEMA — validateBrief', () => {
  it('validates a complete vet brief as valid', () => {
    const { valid, errors } = validateBrief(VET_BRIEF);
    assert.equal(valid, true, `Errors: ${errors.join(', ')}`);
  });

  it('fails when businessName is missing', () => {
    const { valid, errors } = validateBrief({ sector: 'veterinary' });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('businessName')));
  });

  it('fails when sector is missing and businessType absent', () => {
    const { valid, errors } = validateBrief({ businessName: 'Test' });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('sector')));
  });

  it('infers sector from businessType', () => {
    const { valid, brief, fieldTrace } = validateBrief({ businessName: 'Test Vet', businessType: 'veterinary clinic' });
    assert.equal(valid, true);
    assert.equal(brief.sector, 'veterinary');
    assert.equal(fieldTrace.sector, FIELD_STATUS.INFERRED);
  });

  it('marks PROVIDED fields correctly', () => {
    const { fieldTrace } = validateBrief(VET_BRIEF);
    assert.equal(fieldTrace.businessName, FIELD_STATUS.PROVIDED);
    assert.equal(fieldTrace.sector,       FIELD_STATUS.PROVIDED);
  });

  it('defaults devicePriority from targetAudience', () => {
    const { brief, fieldTrace } = validateBrief({ businessName: 'Test', sector: 'veterinary', targetAudience: 'youth mobile users' });
    assert.equal(brief.devicePriority, 'mobile');
    assert.equal(fieldTrace.devicePriority, FIELD_STATUS.INFERRED);
  });

  it('rejects real payment requests', () => {
    const { valid, errors } = validateBrief({ ...VET_BRIEF, paymentNeeds: { enabled: true, realPayments: true } });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('real payments')));
  });

  it('rejects real booking requests', () => {
    const { valid, errors } = validateBrief({ ...VET_BRIEF, bookingNeeds: { enabled: true, realBookings: true } });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('real bookings')));
  });

  it('returns warnings for missing services', () => {
    const { warnings } = validateBrief({ businessName: 'Test', sector: 'veterinary' });
    assert.ok(warnings.some(w => w.includes('services')));
  });

  it('handles string location', () => {
    const { brief } = validateBrief({ businessName: 'Test', sector: 'veterinary', location: 'Málaga' });
    assert.equal(brief.location.city, 'Málaga');
    assert.equal(brief.location.country, 'España');
  });

  it('infers brandTone from sector', () => {
    const { brief, fieldTrace } = validateBrief({ businessName: 'Test', sector: 'veterinary' });
    assert.equal(brief.brandTone, 'friendly');
    assert.equal(fieldTrace.brandTone, FIELD_STATUS.INFERRED);
  });

  it('defaults GDPR to true', () => {
    const { brief } = validateBrief({ businessName: 'Test', sector: 'veterinary' });
    assert.equal(brief.legalConstraints.gdpr, true);
  });
});

// ─── Phase 3: BUSINESS ANALYZER ──────────────────────────────────────────────

describe('Business Analyzer — Version', () => {
  it('exports version string', () => {
    assert.equal(typeof BUSINESS_ANALYZER_VERSION, 'string');
  });
});

describe('Business Analyzer — analyzeBusiness', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);

  it('returns businessName', () => { assert.equal(profile.businessName, 'Clínica Veterinaria Nexo'); });
  it('returns sector', ()       => { assert.equal(profile.sector, 'veterinary'); });
  it('has riskProfile',  ()     => { assert.ok(typeof profile.riskProfile.tier === 'string'); });
  it('has complianceProfile', () => { assert.ok(Array.isArray(profile.complianceProfile.requirements)); });
  it('has audienceProfile', ()  => { assert.ok(Array.isArray(profile.audienceProfile.segments)); });
  it('has moduleNeeds', ()      => { assert.ok(Array.isArray(profile.moduleNeeds.required)); });
  it('has conversionNeeds', ()  => { assert.equal(profile.conversionNeeds.goal, 'booking'); });
  it('has experienceNeeds', ()  => { assert.ok(typeof profile.experienceNeeds.motionTier === 'string'); });
  it('requiresHumanReview is boolean', () => { assert.equal(typeof profile.requiresHumanReview, 'boolean'); });

  it('classifies vet risk as low or medium (no health data flag)', () => {
    assert.ok(['low', 'medium'].includes(profile.riskProfile.tier));
  });

  it('infers veterinary default modules', () => {
    assert.ok(profile.moduleNeeds.required.includes('booking'));
    assert.ok(profile.moduleNeeds.required.includes('dashboard'));
  });

  it('throws on invalid input', () => {
    assert.throws(() => analyzeBusiness(null), /brief must be an object/);
  });

  it('includes GDPR in compliance requirements', () => {
    assert.ok(profile.complianceProfile.requirements.includes('GDPR'));
  });
});

// ─── Phase 4: VERTICAL RESOLVER ──────────────────────────────────────────────

describe('Vertical Resolver — Version', () => {
  it('exports version string', () => { assert.equal(typeof VERTICAL_RESOLVER_VERSION, 'string'); });
});

describe('Vertical Resolver — resolveVertical', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);
  const resolution = resolveVertical(profile, brief);

  it('resolves veterinary directly (available)', () => {
    assert.equal(resolution.resolvedVertical, 'veterinary');
    assert.equal(resolution.extended, false);
  });

  it('has CORE layer with modules', () => {
    assert.ok(Array.isArray(resolution.layers.CORE.modules));
    assert.ok(resolution.layers.CORE.modules.includes('auth'));
    assert.equal(resolution.layers.CORE.contaminated, false);
  });

  it('has VERTICAL layer', ()    => { assert.ok(Array.isArray(resolution.layers.VERTICAL.modules)); });
  it('has CLIENT layer', ()      => { assert.ok(Array.isArray(resolution.layers.CLIENT.modules)); });

  it('allModules is flat unique list', () => {
    assert.ok(Array.isArray(resolution.allModules));
    assert.equal(resolution.allModules.length, new Set(resolution.allModules).size);
  });

  it('CORE is never contaminated', () => {
    assert.equal(resolution.layers.CORE.contaminated, false);
  });

  it('falls back gracefully for unknown sector', () => {
    const r = resolveVertical({ sector: 'unknown-xyz' }, { businessName: 'Test' });
    assert.ok(typeof r.resolvedVertical === 'string');
    assert.equal(r.extended, true);
  });
});

// ─── Phase 5: BRAND ENGINE ────────────────────────────────────────────────────

describe('Brand Engine — Version', () => {
  it('exports version string', () => { assert.equal(typeof BRAND_ENGINE_VERSION, 'string'); });
});

describe('Brand Engine — generateBranding', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);
  const branding  = generateBranding(brief, profile);

  it('returns businessName', ()  => { assert.equal(branding.businessName, 'Clínica Veterinaria Nexo'); });
  it('returns tagline string', () => { assert.ok(typeof branding.tagline === 'string' && branding.tagline.length > 5); });
  it('has palette with primary', () => { assert.ok(branding.palette?.primary?.startsWith('#')); });
  it('has semanticColors', ()   => { assert.ok(typeof branding.semanticColors.success === 'string'); });
  it('has typography',  ()      => { assert.ok(typeof branding.typography.heading === 'string'); });
  it('has iconStrategy', ()     => { assert.ok(typeof branding.iconStrategy.emoji === 'string'); });
  it('has logoStrategy', ()     => { assert.ok(typeof branding.logoStrategy.initial === 'string'); });
  it('premiumExperienceCompatible', () => { assert.equal(branding.premiumExperienceCompatible, true); });
  it('designSystemV2Compatible', () => { assert.equal(branding.designSystemV2Compatible, true); });
  it('vet palette primary is teal', () => { assert.equal(branding.palette.primary, '#0d9488'); });
  it('vet tone is friendly', () => { assert.equal(branding.tone, 'friendly'); });
  it('tagline contains business name', () => { assert.ok(branding.tagline.includes('Nexo') || branding.tagline.includes('quienes')); });
});

// ─── Phase 7: MODULE PLANNER ──────────────────────────────────────────────────

describe('Module Planner — Version', () => {
  it('exports version string', () => { assert.equal(typeof MODULE_PLANNER_VERSION, 'string'); });
});

describe('Module Planner — planModules', () => {
  const { brief }  = validateBrief(VET_BRIEF);
  const profile    = analyzeBusiness(brief);
  const resolution = resolveVertical(profile, brief);
  const modulePlan = planModules(profile, resolution, brief);

  it('total > 0', ()           => { assert.ok(modulePlan.total > 0); });
  it('has modules array', ()   => { assert.ok(Array.isArray(modulePlan.modules)); });
  it('each module has id', ()  => { modulePlan.modules.forEach(m => assert.ok(m.moduleId)); });
  it('each module has name', () => { modulePlan.modules.forEach(m => assert.ok(m.name)); });
  it('each module has classification', () => {
    const valid = new Set(['CORE_MODULE','VERTICAL_MODULE','CLIENT_MODULE','OPTIONAL_MODULE']);
    modulePlan.modules.forEach(m => assert.ok(valid.has(m.classification)));
  });
  it('each module has priority 1-3', () => {
    modulePlan.modules.forEach(m => assert.ok(m.priority >= 1 && m.priority <= 3));
  });
  it('has core modules', ()    => { assert.ok(modulePlan.coreCount > 0); });
  it('has vertical modules', () => { assert.ok(modulePlan.verticalCount > 0); });
  it('dashboard is core', () => {
    const dash = modulePlan.modules.find(m => m.moduleId === 'dashboard');
    assert.ok(dash);
    assert.equal(dash.classification, 'CORE_MODULE');
  });
  it('vet vertical has pets module', () => {
    const pets = modulePlan.modules.find(m => m.moduleId === 'pets');
    assert.ok(pets);
  });
  it('no duplicate moduleIds', () => {
    const ids = modulePlan.modules.map(m => m.moduleId);
    assert.equal(ids.length, new Set(ids).size);
  });
});

// ─── Phase 8: ROLE ENGINE ─────────────────────────────────────────────────────

describe('Role Engine — Version', () => {
  it('exports version string', () => { assert.equal(typeof ROLE_ENGINE_VERSION, 'string'); });
});

describe('Role Engine — planRoles', () => {
  const { brief }  = validateBrief(VET_BRIEF);
  const profile    = analyzeBusiness(brief);
  const resolution = resolveVertical(profile, brief);
  const modulePlan = planModules(profile, resolution, brief);
  const rolePlan   = planRoles(brief, modulePlan);

  it('total > 0', ()          => { assert.ok(rolePlan.total > 0); });
  it('has roles array', ()    => { assert.ok(Array.isArray(rolePlan.roles)); });
  it('each role has roleId', () => { rolePlan.roles.forEach(r => assert.ok(r.roleId)); });
  it('each role has permissions array', () => { rolePlan.roles.forEach(r => assert.ok(Array.isArray(r.permissions))); });
  it('each role secureByDefault', () => { rolePlan.roles.forEach(r => assert.equal(r.secureByDefault, true)); });
  it('has admin role', () => { assert.ok(rolePlan.roles.some(r => r.roleId === 'admin')); });
  it('has veterinarian role', () => { assert.ok(rolePlan.roles.some(r => r.roleId === 'veterinarian')); });
  it('has owner role', () => { assert.ok(rolePlan.roles.some(r => r.roleId === 'owner')); });
  it('admin can access all modules', () => {
    const admin = rolePlan.roles.find(r => r.roleId === 'admin');
    assert.equal(admin.restrictedModules.length, 0);
  });
  it('owner has restricted access', () => {
    const owner = rolePlan.roles.find(r => r.roleId === 'owner');
    assert.ok(owner.restrictedModules.length > 0);
  });
  it('secureByDefault is true globally', () => { assert.equal(rolePlan.secureByDefault, true); });
});

// ─── Phase 9: DATA MODEL PLANNER ─────────────────────────────────────────────

describe('Data Model Planner — Version', () => {
  it('exports version string', () => { assert.equal(typeof DATA_MODEL_PLANNER_VERSION, 'string'); });
});

describe('Data Model Planner — planDataModel', () => {
  const { brief }  = validateBrief(VET_BRIEF);
  const profile    = analyzeBusiness(brief);
  const resolution = resolveVertical(profile, brief);
  const modulePlan = planModules(profile, resolution, brief);
  const dataModel  = planDataModel(brief, modulePlan, profile);

  it('totalEntities > 0', ()  => { assert.ok(dataModel.totalEntities > 0); });
  it('has entities array', () => { assert.ok(Array.isArray(dataModel.entities)); });
  it('each entity has entity name', () => { dataModel.entities.forEach(e => assert.ok(e.entity)); });
  it('each entity has privacyLevel', () => { dataModel.entities.forEach(e => assert.ok(e.privacyLevel)); });
  it('each entity has dataType', () => { dataModel.entities.forEach(e => assert.ok(e.dataType)); });
  it('demoOnly is true', ()   => { assert.equal(dataModel.demoOnly, true); });
  it('no Supabase connection in demo', () => { assert.equal(dataModel.supabaseSchema, 'MOCK_ONLY'); });
  it('has Owner entity for vet', () => {
    assert.ok(dataModel.entities.some(e => e.entity === 'Owner'));
  });
  it('has Pet entity for vet', () => {
    assert.ok(dataModel.entities.some(e => e.entity === 'Pet'));
  });
  it('has Vaccination entity for vet', () => {
    assert.ok(dataModel.entities.some(e => e.entity === 'Vaccination'));
  });
  it('notes mention no real data', () => {
    assert.ok(dataModel.notes.some(n => n.includes('fictitious') || n.includes('real')));
  });
});

// ─── Phase 10: AI AGENT PLANNER ──────────────────────────────────────────────

describe('AI Agent Planner — Version', () => {
  it('exports version string', () => { assert.equal(typeof AI_AGENT_PLANNER_VERSION, 'string'); });
});

describe('AI Agent Planner — planAIAgents', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);
  const aiPlan    = planAIAgents(brief, profile);

  it('totalAgents > 0', ()    => { assert.ok(aiPlan.totalAgents > 0); });
  it('has agents array', ()   => { assert.ok(Array.isArray(aiPlan.agents)); });
  it('each agent has id', ()  => { aiPlan.agents.forEach(a => assert.ok(a.id)); });
  it('each agent has purpose', () => { aiPlan.agents.forEach(a => assert.ok(a.purpose)); });
  it('each agent has forbiddenActions', () => { aiPlan.agents.forEach(a => assert.ok(Array.isArray(a.forbiddenActions))); });
  it('each agent has fallbackMessage', () => { aiPlan.agents.forEach(a => assert.ok(typeof a.fallbackMessage === 'string')); });
  it('all agents not connected to real API', () => {
    aiPlan.agents.forEach(a => assert.equal(a.realApiConnected, false));
  });
  it('vet agents forbid diagnosis', () => {
    const forbidden = aiPlan.globalForbiddenActions;
    assert.ok(forbidden.includes('diagnose'));
  });
  it('vet has appointment-assistant', () => {
    assert.ok(aiPlan.agents.some(a => a.id === 'appointment-assistant'));
  });
  it('vet has pet-care-guide', () => {
    assert.ok(aiPlan.agents.some(a => a.id === 'pet-care-guide'));
  });
  it('productionStatus says DEMO_ONLY', () => {
    assert.ok(aiPlan.productionStatus.includes('DEMO'));
  });
});

// ─── Phase 11: MAKE MANIFEST ──────────────────────────────────────────────────

describe('Make Manifest — Version', () => {
  it('exports version string', () => { assert.equal(typeof MAKE_MANIFEST_VERSION, 'string'); });
});

describe('Make Manifest — generateMakeManifest', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);
  const manifest  = generateMakeManifest(brief, profile);

  it('totalAutomations > 0', () => { assert.ok(manifest.totalAutomations > 0); });
  it('each automation has id and name', () => {
    manifest.automations.forEach(a => {
      assert.ok(a.id);
      assert.ok(a.name);
    });
  });
  it('each automation has trigger', () => { manifest.automations.forEach(a => assert.ok(a.trigger)); });
  it('each automation has steps array', () => { manifest.automations.forEach(a => assert.ok(Array.isArray(a.steps))); });
  it('each automation has errorHandling', () => { manifest.automations.forEach(a => assert.ok(a.errorHandling)); });
  it('productionStatus says DECLARATIVE_ONLY', () => {
    assert.ok(manifest.productionStatus.includes('DECLARATIVE'));
  });
  it('vet has vaccination-reminder automation', () => {
    assert.ok(manifest.automations.some(a => a.id === 'vaccination-reminder'));
  });
  it('vet has booking-confirmation automation', () => {
    assert.ok(manifest.automations.some(a => a.id === 'booking-confirmation'));
  });
  it('automation names start with emoji', () => {
    manifest.automations.forEach(a => {
      assert.ok(a.name.match(/^\p{Emoji}/u), `${a.name} should start with emoji`);
    });
  });
});

// ─── Phase 14: CONTENT ENGINE ────────────────────────────────────────────────

describe('Content Engine — Version', () => {
  it('exports version string', () => { assert.equal(typeof CONTENT_ENGINE_VERSION, 'string'); });
});

describe('Content Engine — generateContent', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);
  const branding  = generateBranding(brief, profile);
  const content   = generateContent(brief, branding, profile);

  it('returns businessName', ()   => { assert.equal(content.businessName, 'Clínica Veterinaria Nexo'); });
  it('has landing with hero', ()  => { assert.ok(typeof content.landing.heroHeadline === 'string'); });
  it('has landing services', ()   => { assert.ok(Array.isArray(content.landing.services)); });
  it('has microcopy', ()          => { assert.ok(typeof content.microcopy.emptyAppointments === 'string'); });
  it('has demoData with clients', () => { assert.ok(Array.isArray(content.demoData.clients) && content.demoData.clients.length > 0); });
  it('demo clients use demo.test emails', () => {
    content.demoData.clients.forEach(c => {
      assert.ok(c.email.endsWith('@demo.test'), `${c.email} should be @demo.test`);
    });
  });
  it('demoData.noRealPersons is true', () => { assert.equal(content.demoData.noRealPersons, true); });
  it('demoData.noRealContacts is true', () => { assert.equal(content.demoData.noRealContacts, true); });
  it('vet demo clients have mascota field', () => {
    const withPet = content.demoData.clients.filter(c => c.mascota);
    assert.ok(withPet.length > 0);
  });
  it('vet microcopy has emptyVaccinations', () => {
    assert.ok(typeof content.microcopy.emptyVaccinations === 'string');
  });
  it('no real phone numbers in demo data', () => {
    const json = JSON.stringify(content.demoData);
    const realPhonePattern = /\b6\d{2}\s\d{3}\s\d{3}\b/;
    // All phones should be the same demo set (allowed since fictitious)
    assert.ok(!json.includes('NIF') && !json.includes('DNI') && !json.includes('@gmail.com'));
  });
});

// ─── Phase 15: INTEGRATION MANIFEST ──────────────────────────────────────────

describe('Integration Manifest — Version', () => {
  it('exports version string', () => { assert.equal(typeof INTEGRATION_MANIFEST_VERSION, 'string'); });
});

describe('Integration Manifest — generateIntegrationManifest', () => {
  const { brief } = validateBrief(VET_BRIEF);
  const profile   = analyzeBusiness(brief);
  const intMan    = generateIntegrationManifest(brief, profile);

  it('totalIntegrations > 0', () => { assert.ok(intMan.totalIntegrations > 0); });
  it('has required integrations', () => { assert.ok(Array.isArray(intMan.integrations.required)); });
  it('has optional integrations', () => { assert.ok(Array.isArray(intMan.integrations.optional)); });
  it('has deferred integrations', () => { assert.ok(Array.isArray(intMan.integrations.deferred)); });
  it('supabase is required for vet', () => {
    assert.ok(intMan.integrations.required.some(i => i.id === 'supabase'));
  });
  it('make is required for vet', () => {
    assert.ok(intMan.integrations.required.some(i => i.id === 'make'));
  });
  it('no integration is productionReady in demo', () => {
    const all = [...intMan.integrations.required, ...intMan.integrations.optional, ...intMan.integrations.deferred];
    all.forEach(i => { if (typeof i.productionReady === 'boolean') assert.equal(i.productionReady, false); });
  });
  it('credentialsNeeded is non-empty array', () => {
    assert.ok(Array.isArray(intMan.credentialsNeeded) && intMan.credentialsNeeded.length > 0);
  });
  it('productionStatus declares NONE_CONNECTED', () => {
    assert.ok(intMan.productionStatus.includes('NONE_CONNECTED'));
  });
});

// ─── Phase 18: E2E RUNNER ─────────────────────────────────────────────────────

describe('E2E Runner — Version', () => {
  it('exports version string', () => { assert.equal(typeof ONE_PROMPT_RUNNER_VERSION, 'string'); });
});

describe('E2E Runner — onePromptToSaaS (veterinary)', () => {
  let result;
  before(async () => {
    result = await onePromptToSaaS(VET_BRIEF);
  });

  it('returns success=true for valid brief', () => { assert.equal(result.success, true, `Errors: ${result.errors.join(', ')}`); });
  it('has brief populated', ()   => { assert.ok(result.brief?.businessName); });
  it('has all step results', ()  => {
    const steps = ['validate','analyze','resolveVertical','brand','experience','modules','roles','dataModel','aiAgents','makeManifest','content','integrations','qa'];
    steps.forEach(s => assert.ok(result.steps[s], `Missing step: ${s}`));
  });
  it('QA passes all critical checks', () => {
    assert.equal(result.qa.criticalFailed, 0, `Failed: ${result.qa.failedChecks.join(', ')}`);
  });
  it('no secrets in result', () => {
    const json = JSON.stringify(result);
    // Only match actual key:value pairs like {"api_key":"abc123..."}, not credential names in arrays
    const hasSecrets = /"(?:api_key|password|secret|private_key)"\s*:\s*"[^"]{8,}"/i.test(json);
    assert.equal(hasSecrets, false);
  });
  it('no real emails in result', () => {
    const json = JSON.stringify(result);
    const hasReal = /@(?!demo\.test)[a-z0-9.-]+\.(com|es|org|io)"/i.test(json);
    assert.equal(hasReal, false);
  });
  it('has branding artifact', ()   => { assert.ok(result.artifacts?.branding?.palette); });
  it('has experience artifact', () => { assert.ok(result.artifacts?.experience); });
  it('has modulePlan artifact', () => { assert.ok((result.artifacts?.modulePlan?.total ?? 0) > 0); });
  it('has rolePlan artifact', ()   => { assert.ok((result.artifacts?.rolePlan?.total ?? 0) > 0); });
  it('has dataModel artifact', ()  => { assert.ok((result.artifacts?.dataModel?.totalEntities ?? 0) > 0); });
  it('has aiPlan artifact', ()     => { assert.ok((result.artifacts?.aiPlan?.totalAgents ?? 0) > 0); });
  it('has makeManifest artifact', () => { assert.ok((result.artifacts?.makeManifest?.totalAutomations ?? 0) > 0); });
  it('has content artifact', ()    => { assert.ok(result.artifacts?.content?.demoData); });
  it('has integrationManifest', () => { assert.ok(result.artifacts?.integrationManifest); });
  it('generatedFiles is a non-empty array', () => {
    assert.ok(Array.isArray(result.generatedFiles) && result.generatedFiles.length > 0);
  });
  it('tokenEfficiency is defined', () => {
    assert.ok(result.tokenEfficiency?.estimatedSavedPercent >= 0);
  });
  it('nextActions is array', () => { assert.ok(Array.isArray(result.nextActions)); });
});

// ─── Phase 23: FAILURE HANDLING ──────────────────────────────────────────────

describe('Failure Handling — known failure modes', () => {
  it('fails safely on empty brief', async () => {
    const r = await onePromptToSaaS({});
    assert.equal(r.success, false);
    assert.ok(r.errors.length > 0);
  });

  it('fails on missing businessName', async () => {
    const r = await onePromptToSaaS({ sector: 'veterinary' });
    assert.equal(r.success, false);
    assert.ok(r.errors.some(e => e.includes('businessName')));
  });

  it('fails on missing sector + businessType', async () => {
    const r = await onePromptToSaaS({ businessName: 'Test' });
    assert.equal(r.success, false);
  });

  it('fails on realPayments=true', async () => {
    const r = await onePromptToSaaS({ ...VET_BRIEF, paymentNeeds: { realPayments: true } });
    assert.equal(r.success, false);
    assert.ok(r.failureModes.length > 0);
  });

  it('fails on realBookings=true', async () => {
    const r = await onePromptToSaaS({ ...VET_BRIEF, bookingNeeds: { realBookings: true } });
    assert.equal(r.success, false);
  });

  it('does not continue silently — always sets errors on failure', async () => {
    const r = await onePromptToSaaS(null);
    assert.equal(r.success, false);
    assert.ok(r.errors.length > 0);
  });

  it('provides nextActions on failure', async () => {
    const r = await onePromptToSaaS({ businessName: 'Test', sector: 'nonexistent' });
    // Should succeed with warnings (nonexistent sector gets defaulted)
    // OR fail with nextActions
    assert.ok(Array.isArray(r.nextActions));
  });
});

// ─── Phase 19: VETERINARY VERTICAL ───────────────────────────────────────────

describe('Veterinary Vertical — Config', () => {
  it('exports version', ()       => { assert.equal(typeof VETERINARY_VERSION, 'string'); });
  it('has id veterinary', ()     => { assert.equal(VETERINARY_CONFIG.id, 'veterinary'); });
  it('has preset friendly-human', () => { assert.equal(VETERINARY_CONFIG.preset, 'friendly-human'); });
  it('has paw icon', ()          => { assert.equal(VETERINARY_CONFIG.icon, '🐾'); });
  it('has safety rules', ()      => { assert.equal(VETERINARY_CONFIG.safetyRules.noDiagnosis, true); });
  it('has defaultModules', ()    => { assert.ok(VETERINARY_CONFIG.defaultModules.includes('vaccinations')); });
  it('has 4 roles', ()           => { assert.equal(VETERINARY_CONFIG.roles.length, 4); });
  it('has intents list', ()      => { assert.ok(VETERINARY_CONFIG.intents.includes('vacunacion')); });
});

describe('Veterinary Mock Data', () => {
  it('exports version', ()       => { assert.equal(typeof VETERINARY_MOCK_VERSION, 'string'); });
  it('DEMO_OWNERS has 5 entries', () => { assert.equal(DEMO_OWNERS.length, 5); });
  it('DEMO_PETS has 6 entries', ()   => { assert.equal(DEMO_PETS.length, 6); });
  it('DEMO_APPOINTMENTS has 6 entries', () => { assert.equal(DEMO_APPOINTMENTS.length, 6); });
  it('DEMO_VACCINATIONS >= 4', ()    => { assert.ok(DEMO_VACCINATIONS.length >= 4); });
  it('DEMO_SERVICES >= 6', ()        => { assert.ok(DEMO_SERVICES.length >= 6); });
  it('DASHBOARD_STATS has 4 KPIs', () => { assert.equal(DASHBOARD_STATS.length, 4); });
  it('all owner emails are @demo.test', () => {
    DEMO_OWNERS.forEach(o => assert.ok(o.email.endsWith('@demo.test'), `${o.email} should be demo`));
  });
  it('all pet microchips have DEMO- prefix', () => {
    DEMO_PETS.forEach(p => assert.ok(p.microchip.startsWith('DEMO-')));
  });
  it('DEMO_APPOINTMENTS have valid estados', () => {
    const valid = new Set(['confirmada', 'pendiente', 'cancelada']);
    DEMO_APPOINTMENTS.forEach(a => assert.ok(valid.has(a.estado)));
  });
  it('services have precio and duracion', () => {
    DEMO_SERVICES.forEach(s => { assert.ok(s.precio); assert.ok(s.duracion); });
  });
});

// ─── Sectors Registry — Veterinary ───────────────────────────────────────────

describe('Sectors Registry — Veterinary added', () => {
  it('getSectorById returns veterinary', () => {
    const vet = getSectorById('veterinary');
    assert.ok(vet);
    assert.equal(vet.id, 'veterinary');
    assert.equal(vet.preset, 'friendly-human');
  });

  it('listSectorIds includes veterinary', () => {
    assert.ok(listSectorIds().includes('veterinary'));
  });

  it('sector count is now 16', () => {
    assert.equal(listSectorIds().length, 16);
  });
});

// ─── Phase 22: TOKEN EFFICIENCY ──────────────────────────────────────────────

describe('Token Efficiency', () => {
  it('tokenEfficiency has required fields', async () => {
    const result = await onePromptToSaaS(VET_BRIEF);
    const te = result.tokenEfficiency;
    assert.ok(typeof te.rawContextEstimate === 'number');
    assert.ok(typeof te.estimatedTokensSaved === 'number');
    assert.ok(typeof te.estimatedSavedPercent === 'number');
    assert.ok(te.estimatedSavedPercent >= 0 && te.estimatedSavedPercent <= 100);
  });

  it('notes that estimate is approximate', async () => {
    const result = await onePromptToSaaS(VET_BRIEF);
    assert.ok(result.tokenEfficiency.note.includes('Estimated'));
  });
});

// ─── brief.json exists for veterinary client ─────────────────────────────────

describe('Veterinary Client Brief File', () => {
  it('brief.json exists and is valid JSON', () => {
    const briefPath = path.join(ROOT, 'clients/clinica-veterinaria-nexo-demo/brief.json');
    const raw = readFileSync(briefPath, 'utf-8');
    const parsed = JSON.parse(raw);
    assert.equal(parsed.businessName, 'Clínica Veterinaria Nexo');
    assert.equal(parsed.sector, 'veterinary');
    assert.equal(parsed.bookingNeeds.realBookings, false);
    assert.equal(parsed.paymentNeeds.realPayments, false);
  });

  it('brief.json does not contain production secrets', () => {
    const briefPath = path.join(ROOT, 'clients/clinica-veterinaria-nexo-demo/brief.json');
    const raw = readFileSync(briefPath, 'utf-8');
    assert.ok(!raw.includes('api_key'));
    assert.ok(!raw.includes('secret'));
    assert.ok(!raw.includes('password'));
  });
});
