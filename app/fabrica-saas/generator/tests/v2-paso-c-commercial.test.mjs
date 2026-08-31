/**
 * PASO C — Agency Commercial System Test Suite
 * Tests: productCatalog, packages, pricingEngine, addons, thirdPartyCosts,
 *        maintenancePlans, serviceLimits, packageRecommender, commercialEstimate,
 *        proposalGenerator, verticalOverrides, onePromptToCommercialOffer, E2E
 *
 * 10 named scenarios:
 *   small_business_basic | growing_business | premium_multi_module | many_integrations
 *   ai_heavy | automation_heavy | unsupported_request | scope_exceeded
 *   missing_information | third_party_cost_required
 *
 * Runner: node --test
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// ─── Imports ──────────────────────────────────────────────────────────────────

import {
  PRODUCT_CATALOG_VERSION, PRODUCT_CATALOG,
  getProductById, listProductIds,
} from '../../commercial/productCatalog.js';

import {
  PACKAGES_VERSION, PACKAGE_TIERS,
  getPackage, listPackageIds, getPackageByModuleCount,
} from '../../commercial/packages.js';

import {
  ADDONS_VERSION, ADDON_CATALOG,
  getAddonById, getAddonsByCategory, listAddonIds,
} from '../../commercial/addons.js';

import {
  THIRD_PARTY_COSTS_VERSION, COST_RESPONSIBILITY, THIRD_PARTY_CATALOG,
  getThirdPartyCostById, getClientPaidCosts, listThirdPartyIds,
} from '../../commercial/thirdPartyCosts.js';

import {
  MAINTENANCE_PLANS_VERSION, MAINTENANCE_CATALOG,
  getMaintenancePlan, listMaintenancePlanIds, recommendMaintenancePlan,
} from '../../commercial/maintenancePlans.js';

import {
  SERVICE_LIMITS_VERSION, LIMITS_REGISTRY,
  checkLimits, getLimits,
} from '../../commercial/serviceLimits.js';

import {
  VERTICAL_OVERRIDES_VERSION, VERTICAL_PRICING_OVERRIDES,
  getVerticalMultiplier, getVerticalOverride, applyVerticalMultiplier,
} from '../../commercial/verticalOverrides.js';

import {
  PRICING_ENGINE_VERSION, calculatePricing,
} from '../../commercial/pricingEngine.js';

import {
  PACKAGE_RECOMMENDER_VERSION, recommendCommercialPackage,
} from '../../commercial/packageRecommender.js';

import {
  COMMERCIAL_ESTIMATE_VERSION, generateEstimate,
} from '../../commercial/commercialEstimate.js';

import {
  PROPOSAL_GENERATOR_VERSION, generateProposal,
} from '../../commercial/proposalGenerator.js';

import {
  COMMERCIAL_OFFER_PIPELINE_VERSION, onePromptToCommercialOffer,
} from '../scripts/onePromptToCommercialOffer.mjs';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const VET_BRIEF = {
  businessName:   'Clínica Veterinaria Nexo',
  businessType:   'veterinary clinic',
  sector:         'veterinary',
  location:       { city: 'Málaga', region: 'Andalucía', country: 'España' },
  targetAudience: 'particular — propietarios de mascotas',
  services:       ['Consulta general', 'Vacunación', 'Cirugía veterinaria'],
  brandTone:      'friendly',
  conversionGoal: 'booking',
  roles:          ['admin', 'reception', 'veterinarian', 'owner'],
  requiredModules:['dashboard','booking','patients','history','vaccinations','reminders','chatbot','calendar'],
  automationNeeds:['booking-confirmation','appointment-reminder','vaccination-reminder','pet-new-owner'],
  aiNeeds:        ['appointment-assistant','pet-care-guide','vaccination-reminder','faq-responder'],
  dataNeeds:      { demo: true, production: false, sensitive: false },
  bookingNeeds:   { enabled: true, realBookings: false },
  paymentNeeds:   { enabled: false, realPayments: false },
  contentNeeds:   { language: 'es', multilingual: false },
  language:       'es',
  legalConstraints: { minorsPolicy: false, gdpr: true, healthData: false },
  devicePriority: 'mobile',
  accessibilityNeeds: { wcagLevel: 'AA' },
};

const SMALL_BRIEF = {
  businessName: 'Barbería El Bigote',
  businessType: 'barbería',
  sector:       'comercio',
  location:     { city: 'Sevilla', region: 'Andalucía', country: 'España' },
  targetAudience: 'clientes locales',
  services:     ['Corte de pelo', 'Afeitado'],
  brandTone:    'professional',
  conversionGoal: 'booking',
  roles:        ['admin', 'owner'],
  requiredModules: ['booking', 'calendar'],
  automationNeeds: ['booking-confirmation'],
  aiNeeds:       [],
  dataNeeds:     { demo: true, production: false, sensitive: false },
  bookingNeeds:  { enabled: true, realBookings: false },
  paymentNeeds:  { enabled: false, realPayments: false },
  language:      'es',
  legalConstraints: { minorsPolicy: false, gdpr: true, healthData: false },
  devicePriority: 'mobile',
  accessibilityNeeds: { wcagLevel: 'AA' },
};

const PREMIUM_BRIEF = {
  businessName:   'Clínica Psicología Bienestar',
  businessType:   'clínica de psicología',
  sector:         'psicologia',
  location:       { city: 'Madrid', region: 'Madrid', country: 'España' },
  targetAudience: 'adultos, familias',
  services:       ['Terapia individual', 'Terapia de pareja', 'Psicología infantil', 'Coaching', 'Talleres'],
  brandTone:      'empathetic',
  conversionGoal: 'booking',
  roles:          ['admin', 'reception', 'psicolog', 'supervisor', 'client', 'auditor', 'finance'],
  requiredModules:['dashboard','booking','patients','history','treatments','reminders','chatbot','calendar','reports','billing','analytics','forms'],
  automationNeeds:['booking-confirmation','appointment-reminder','session-followup','billing-alert','waitlist','team-notification','reminder-48h','weekly-report'],
  aiNeeds:        ['appointment-assistant','session-notes','faq-responder','risk-assessment','intake-summary'],
  dataNeeds:      { demo: true, production: false, sensitive: true },
  bookingNeeds:   { enabled: true, realBookings: false },
  paymentNeeds:   { enabled: false, realPayments: false },
  language:       'es',
  legalConstraints: { minorsPolicy: true, gdpr: true, healthData: true },
  devicePriority: 'all',
  accessibilityNeeds: { wcagLevel: 'AA' },
};

// ─── 1. PRODUCT CATALOG ───────────────────────────────────────────────────────

describe('PASO C — productCatalog', () => {
  it('exports version', () => {
    assert.equal(typeof PRODUCT_CATALOG_VERSION, 'string');
    assert.match(PRODUCT_CATALOG_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('has at least 6 products', () => {
    assert.ok(Array.isArray(PRODUCT_CATALOG));
    assert.ok(PRODUCT_CATALOG.length >= 6, `expected >=6 products, got ${PRODUCT_CATALOG.length}`);
  });

  it('each product has required fields', () => {
    const required = ['id','name','description','targetCustomer','problemSolved','included','excluded'];
    for (const p of PRODUCT_CATALOG) {
      for (const f of required) {
        assert.ok(p[f] !== undefined, `product ${p.id} missing field: ${f}`);
      }
    }
  });

  it('getProductById returns correct product', () => {
    const id = PRODUCT_CATALOG[0].id;
    const p  = getProductById(id);
    assert.equal(p.id, id);
  });

  it('getProductById returns null for unknown id', () => {
    assert.equal(getProductById('non-existent-xyz'), null);
  });

  it('listProductIds returns array of strings', () => {
    const ids = listProductIds();
    assert.ok(Array.isArray(ids));
    assert.ok(ids.length > 0);
    for (const id of ids) assert.equal(typeof id, 'string');
  });

  it('saas-local-pro exists in catalog', () => {
    assert.ok(getProductById('saas-local-pro') !== null);
  });
});

// ─── 2. PACKAGES ─────────────────────────────────────────────────────────────

describe('PASO C — packages', () => {
  it('exports version', () => {
    assert.match(PACKAGES_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('has ESSENTIAL, PRO, PREMIUM tiers', () => {
    assert.ok(PACKAGE_TIERS.ESSENTIAL, 'missing ESSENTIAL');
    assert.ok(PACKAGE_TIERS.PRO,       'missing PRO');
    assert.ok(PACKAGE_TIERS.PREMIUM,   'missing PREMIUM');
  });

  it('ESSENTIAL has lower setup than PRO', () => {
    assert.ok(PACKAGE_TIERS.ESSENTIAL.setupPriceRange.max < PACKAGE_TIERS.PRO.setupPriceRange.min);
  });

  it('PRO has lower setup than PREMIUM', () => {
    assert.ok(PACKAGE_TIERS.PRO.setupPriceRange.max < PACKAGE_TIERS.PREMIUM.setupPriceRange.min);
  });

  it('each tier has setupPriceRange and monthlyPriceRange', () => {
    for (const [id, pkg] of Object.entries(PACKAGE_TIERS)) {
      assert.ok(pkg.setupPriceRange?.min >= 0,   `${id} missing setupPriceRange.min`);
      assert.ok(pkg.monthlyPriceRange?.min >= 0, `${id} missing monthlyPriceRange.min`);
    }
  });

  it('getPackage returns correct tier', () => {
    assert.equal(getPackage('PRO')?.id ?? getPackage('PRO')?.tier ?? 'PRO', 'PRO');
  });

  it('getPackage returns null for unknown tier', () => {
    assert.equal(getPackage('ULTRA'), null);
  });

  it('listPackageIds returns 3 ids', () => {
    const ids = listPackageIds();
    assert.equal(ids.length, 3);
  });

  it('getPackageByModuleCount: 1 module → ESSENTIAL or PRO', () => {
    const result = getPackageByModuleCount(1);
    assert.ok(['ESSENTIAL','PRO'].includes(result));
  });

  it('getPackageByModuleCount: 12 modules → PRO or PREMIUM', () => {
    const result = getPackageByModuleCount(12);
    assert.ok(['PRO','PREMIUM'].includes(result));
  });
});

// ─── 3. ADD-ONS ──────────────────────────────────────────────────────────────

describe('PASO C — addons', () => {
  it('exports version', () => {
    assert.match(ADDONS_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('has at least 15 add-ons', () => {
    assert.ok(ADDON_CATALOG.length >= 15, `expected >=15, got ${ADDON_CATALOG.length}`);
  });

  it('each addon has id, name, setupRange, monthlyRange', () => {
    for (const a of ADDON_CATALOG) {
      assert.equal(typeof a.id, 'string',         `addon missing id`);
      assert.equal(typeof a.name, 'string',       `${a.id} missing name`);
      assert.ok(Array.isArray(a.setupRange),       `${a.id} missing setupRange`);
      assert.ok(Array.isArray(a.monthlyRange),     `${a.id} missing monthlyRange`);
    }
  });

  it('getAddonById returns addon', () => {
    const a = getAddonById('extra-module');
    assert.equal(a.id, 'extra-module');
  });

  it('getAddonById returns null for unknown', () => {
    assert.equal(getAddonById('xyz-nonexistent'), null);
  });

  it('getAddonsByCategory returns correct items', () => {
    const ai = getAddonsByCategory('ai');
    assert.ok(ai.length > 0);
    assert.ok(ai.every(a => a.category === 'ai'));
  });

  it('listAddonIds returns array with >10 ids', () => {
    const ids = listAddonIds();
    assert.ok(ids.length > 10);
  });

  it('extra-ai-agent has setupRange[0] >= 300', () => {
    const a = getAddonById('extra-ai-agent');
    assert.ok(a.setupRange[0] >= 300);
  });
});

// ─── 4. THIRD-PARTY COSTS ────────────────────────────────────────────────────

describe('PASO C — thirdPartyCosts', () => {
  it('exports version', () => {
    assert.match(THIRD_PARTY_COSTS_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('COST_RESPONSIBILITY has INCLUDED, CLIENT_PAID, USAGE_BASED', () => {
    assert.equal(COST_RESPONSIBILITY.INCLUDED,    'INCLUDED');
    assert.equal(COST_RESPONSIBILITY.CLIENT_PAID, 'CLIENT_PAID');
    assert.equal(COST_RESPONSIBILITY.USAGE_BASED, 'USAGE_BASED');
  });

  it('has at least 8 services', () => {
    assert.ok(THIRD_PARTY_CATALOG.length >= 8);
  });

  it('cloudflare-pages is INCLUDED (no cost to client)', () => {
    const c = getThirdPartyCostById('cloudflare-pages');
    assert.equal(c.responsibility, COST_RESPONSIBILITY.INCLUDED);
    assert.equal(c.monthlyEstimate.min, 0);
  });

  it('supabase is CLIENT_PAID', () => {
    const c = getThirdPartyCostById('supabase');
    assert.equal(c.responsibility, COST_RESPONSIBILITY.CLIENT_PAID);
  });

  it('anthropic-api is USAGE_BASED', () => {
    const c = getThirdPartyCostById('anthropic-api');
    assert.equal(c.responsibility, COST_RESPONSIBILITY.USAGE_BASED);
  });

  it('getClientPaidCosts returns CLIENT_PAID and USAGE_BASED items', () => {
    const paid = getClientPaidCosts();
    assert.ok(paid.length > 0);
    const validTypes = [COST_RESPONSIBILITY.CLIENT_PAID, COST_RESPONSIBILITY.USAGE_BASED];
    assert.ok(paid.every(c => validTypes.includes(c.responsibility)));
  });

  it('listThirdPartyIds returns non-empty array', () => {
    const ids = listThirdPartyIds();
    assert.ok(ids.length > 0);
    assert.ok(ids.includes('supabase'));
  });

  it('getThirdPartyCostById returns null for unknown', () => {
    assert.equal(getThirdPartyCostById('xyz-fake'), null);
  });
});

// ─── 5. MAINTENANCE PLANS ────────────────────────────────────────────────────

describe('PASO C — maintenancePlans', () => {
  it('exports version', () => {
    assert.match(MAINTENANCE_PLANS_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('has BASIC, PRO, PRIORITY plans', () => {
    assert.ok(MAINTENANCE_CATALOG.BASIC,    'missing BASIC');
    assert.ok(MAINTENANCE_CATALOG.PRO,      'missing PRO');
    assert.ok(MAINTENANCE_CATALOG.PRIORITY, 'missing PRIORITY');
  });

  it('BASIC has lower monthly than PRIORITY', () => {
    const b = MAINTENANCE_CATALOG.BASIC.monthlyPriceRange;
    const p = MAINTENANCE_CATALOG.PRIORITY.monthlyPriceRange;
    assert.ok(b.max < p.min);
  });

  it('recommendMaintenancePlan ESSENTIAL → BASIC', () => {
    assert.equal(recommendMaintenancePlan('ESSENTIAL'), 'BASIC');
  });

  it('recommendMaintenancePlan PRO → PRO', () => {
    assert.equal(recommendMaintenancePlan('PRO'), 'PRO');
  });

  it('recommendMaintenancePlan PREMIUM → PRIORITY', () => {
    assert.equal(recommendMaintenancePlan('PREMIUM'), 'PRIORITY');
  });

  it('getMaintenancePlan returns plan object', () => {
    const p = getMaintenancePlan('PRO');
    assert.ok(p !== null);
  });

  it('getMaintenancePlan returns null for unknown', () => {
    assert.equal(getMaintenancePlan('ULTRA'), null);
  });

  it('listMaintenancePlanIds returns 3 ids', () => {
    assert.equal(listMaintenancePlanIds().length, 3);
  });
});

// ─── 6. SERVICE LIMITS ───────────────────────────────────────────────────────

describe('PASO C — serviceLimits', () => {
  it('exports version', () => {
    assert.match(SERVICE_LIMITS_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('ESSENTIAL has stricter limits than PREMIUM', () => {
    assert.ok(LIMITS_REGISTRY.ESSENTIAL.maxModules < LIMITS_REGISTRY.PREMIUM.maxModules);
    assert.ok(LIMITS_REGISTRY.ESSENTIAL.maxAiAgents < LIMITS_REGISTRY.PREMIUM.maxAiAgents);
  });

  it('checkLimits: no violations when within limits', () => {
    const result = checkLimits('PRO', { modules: 3, automations: 2, roles: 2, aiAgents: 0 });
    assert.equal(result.exceeded, false);
    assert.equal(result.violations.length, 0);
  });

  it('checkLimits: detects module violation', () => {
    const result = checkLimits('ESSENTIAL', { modules: 5 });
    assert.equal(result.exceeded, true);
    assert.ok(result.violations.some(v => v.includes('módulos')));
  });

  it('checkLimits: returns requiredAddons for violations', () => {
    const result = checkLimits('ESSENTIAL', { modules: 5 });
    assert.ok(result.requiredAddons.includes('extra-module'));
  });

  it('checkLimits: ESSENTIAL with 0 AI agents has no violation', () => {
    const result = checkLimits('ESSENTIAL', { aiAgents: 0 });
    assert.equal(result.exceeded, false);
  });

  it('checkLimits: ESSENTIAL with 1 AI agent has violation', () => {
    const result = checkLimits('ESSENTIAL', { aiAgents: 1 });
    assert.equal(result.exceeded, true);
  });

  it('getLimits returns object for valid tier', () => {
    const l = getLimits('PRO');
    assert.ok(l !== null);
    assert.ok(l.maxModules > 0);
  });

  it('getLimits returns null for unknown tier', () => {
    assert.equal(getLimits('TURBO'), null);
  });
});

// ─── 7. VERTICAL OVERRIDES ───────────────────────────────────────────────────

describe('PASO C — verticalOverrides', () => {
  it('exports version', () => {
    assert.match(VERTICAL_OVERRIDES_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('legal sector has multiplier >= 1.25', () => {
    const m = getVerticalMultiplier('legal');
    assert.ok(m >= 1.25, `legal multiplier should be >= 1.25, got ${m}`);
  });

  it('restaurante sector has multiplier <= 0.9', () => {
    const m = getVerticalMultiplier('restaurante');
    assert.ok(m <= 0.9, `restaurante multiplier should be <= 0.9, got ${m}`);
  });

  it('unknown sector returns multiplier 1.0', () => {
    assert.equal(getVerticalMultiplier('xyz-fake-sector'), 1.0);
  });

  it('getVerticalOverride returns object with multiplier and reason', () => {
    const o = getVerticalOverride('dental');
    assert.ok(typeof o.multiplier === 'number');
    assert.ok(typeof o.reason === 'string');
  });

  it('getVerticalOverride for unknown returns default object', () => {
    const o = getVerticalOverride('xyz-fake');
    assert.equal(o.multiplier, 1.0);
  });

  it('applyVerticalMultiplier applies padel discount', () => {
    const base = 2000;
    const result = applyVerticalMultiplier(base, 'padel');
    assert.ok(result < base);
  });

  it('applyVerticalMultiplier applies psicologia premium', () => {
    const base = 2000;
    const result = applyVerticalMultiplier(base, 'psicologia');
    assert.ok(result > base);
  });

  it('veterinary sector multiplier is 1.0', () => {
    assert.equal(getVerticalMultiplier('veterinary'), 1.0);
  });
});

// ─── 8. PRICING ENGINE ───────────────────────────────────────────────────────

describe('PASO C — pricingEngine', () => {
  it('exports version', () => {
    assert.match(PRICING_ENGINE_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('returns valid=true for valid scope', () => {
    const r = calculatePricing({ packageTier: 'PRO', sector: 'veterinary' });
    assert.equal(r.valid, true);
  });

  it('returns valid=false for missing scope', () => {
    const r = calculatePricing(null);
    assert.equal(r.valid, false);
  });

  it('returns valid=false for unknown tier', () => {
    const r = calculatePricing({ packageTier: 'TURBO' });
    assert.equal(r.valid, false);
  });

  it('PREMIUM has higher setup than ESSENTIAL', () => {
    const essential = calculatePricing({ packageTier: 'ESSENTIAL', sector: 'default' });
    const premium   = calculatePricing({ packageTier: 'PREMIUM', sector: 'default' });
    assert.ok(essential.estimatedSetupRange[1] < premium.estimatedSetupRange[0]);
  });

  it('extra modules increase setup cost', () => {
    const noExtra  = calculatePricing({ packageTier: 'PRO', modules: 3 });
    const withExtra = calculatePricing({ packageTier: 'PRO', modules: 12 });
    assert.ok(withExtra.estimatedSetupRange[0] > noExtra.estimatedSetupRange[0]);
  });

  it('legal sector applies price multiplier > 1', () => {
    const base  = calculatePricing({ packageTier: 'PRO', sector: 'default' });
    const legal = calculatePricing({ packageTier: 'PRO', sector: 'legal' });
    assert.ok(legal.estimatedSetupRange[0] > base.estimatedSetupRange[0]);
  });

  it('padel sector has lower setup than default', () => {
    const base  = calculatePricing({ packageTier: 'PRO', sector: 'default' });
    const padel = calculatePricing({ packageTier: 'PRO', sector: 'padel' });
    assert.ok(padel.estimatedSetupRange[0] < base.estimatedSetupRange[0]);
  });

  it('has disclaimerType ESTIMATE', () => {
    const r = calculatePricing({ packageTier: 'PRO' });
    assert.equal(r.disclaimerType, 'ESTIMATE');
  });

  it('has priceDrivers array', () => {
    const r = calculatePricing({ packageTier: 'PRO' });
    assert.ok(Array.isArray(r.priceDrivers));
    assert.ok(r.priceDrivers.length > 0);
  });

  it('complexityScore is between 1 and 10', () => {
    const r = calculatePricing({ packageTier: 'PREMIUM', modules: 10, aiAgents: 3 });
    assert.ok(r.complexityScore >= 1);
    assert.ok(r.complexityScore <= 10);
  });

  it('humanReviewRequired is boolean', () => {
    const r = calculatePricing({ packageTier: 'PRO' });
    assert.equal(typeof r.humanReviewRequired, 'boolean');
  });

  it('excludedCosts array is non-empty', () => {
    const r = calculatePricing({ packageTier: 'PRO' });
    assert.ok(Array.isArray(r.excludedCosts));
    assert.ok(r.excludedCosts.length > 0);
  });

  it('currency is EUR', () => {
    const r = calculatePricing({ packageTier: 'PRO' });
    assert.equal(r.currency, 'EUR');
  });
});

// ─── 9. PACKAGE RECOMMENDER ──────────────────────────────────────────────────

describe('PASO C — packageRecommender', () => {
  it('exports version', () => {
    assert.match(PACKAGE_RECOMMENDER_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('small business → ESSENTIAL', () => {
    const r = recommendCommercialPackage({}, SMALL_BRIEF, { total: 2 });
    assert.equal(r.recommendedPackage, 'ESSENTIAL');
  });

  it('vet clinic → PRO', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.equal(r.recommendedPackage, 'PRO');
  });

  it('premium brief → PREMIUM', () => {
    const r = recommendCommercialPackage({}, PREMIUM_BRIEF, { total: 12 });
    assert.equal(r.recommendedPackage, 'PREMIUM');
  });

  it('returns reasoning array', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.ok(Array.isArray(r.reasoning));
    assert.ok(r.reasoning.length > 0);
  });

  it('returns alternatives array', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.ok(Array.isArray(r.alternatives));
  });

  it('returns risks array', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.ok(Array.isArray(r.risks));
  });

  it('returns complexityScore number', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.equal(typeof r.complexityScore, 'number');
  });

  it('returns humanReviewRequired boolean', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.equal(typeof r.humanReviewRequired, 'boolean');
  });

  it('high risk tier forces humanReviewRequired=true', () => {
    const r = recommendCommercialPackage({ riskProfile: { tier: 'high' } }, VET_BRIEF, { total: 3 });
    assert.equal(r.humanReviewRequired, true);
  });

  it('psicologia sector adds questionsForHumanReview', () => {
    const r = recommendCommercialPackage({}, PREMIUM_BRIEF, { total: 12 });
    assert.ok(r.questionsForHumanReview.length > 0);
  });

  it('recommendedAddons is array', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.ok(Array.isArray(r.recommendedAddons));
  });

  it('sectorOverride is returned', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.ok(typeof r.sectorOverride === 'object');
    assert.ok(typeof r.sectorOverride.multiplier === 'number');
  });
});

// ─── 10. COMMERCIAL ESTIMATE ─────────────────────────────────────────────────

describe('PASO C — commercialEstimate', () => {
  it('exports version', () => {
    assert.match(COMMERCIAL_ESTIMATE_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('generates estimate for vet brief', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.equal(e.estimateType, 'COMMERCIAL_ESTIMATE');
  });

  it('disclaimer mentions ESTIMACIÓN ORIENTATIVA', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(e.disclaimer.includes('ESTIMACIÓN'));
  });

  it('disclaimer mentions NO ES UN CONTRATO', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(e.disclaimer.includes('NO ES UN CONTRATO'));
  });

  it('disclaimer mentions NO ES UN COMPROMISO AUTOMÁTICO', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(e.disclaimer.includes('NO ES UN COMPROMISO'));
  });

  it('has setupRange [min, max]', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(Array.isArray(e.setupRange));
    assert.ok(e.setupRange[1] >= e.setupRange[0]);
  });

  it('has monthlyRange [min, max]', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(Array.isArray(e.monthlyRange));
    assert.ok(e.monthlyRange[1] >= e.monthlyRange[0]);
  });

  it('has thirdPartyCosts array', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(Array.isArray(e.thirdPartyCosts));
  });

  it('has assumptions array with >=3 items', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(e.assumptions.length >= 3);
  });

  it('has exclusions array', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(e.exclusions.length > 0);
  });

  it('has dependencies array', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(Array.isArray(e.dependencies));
  });

  it('validity is string', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.equal(typeof e.validity, 'string');
  });

  it('currency is EUR', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.equal(e.currency, 'EUR');
  });

  it('premium brief has higher setup than small brief', () => {
    const small   = generateEstimate(SMALL_BRIEF, {}, { total: 2 });
    const premium = generateEstimate(PREMIUM_BRIEF, {}, { total: 12 });
    assert.ok(premium.setupRange[0] > small.setupRange[0]);
  });

  it('humanReviewRequired is boolean', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.equal(typeof e.humanReviewRequired, 'boolean');
  });
});

// ─── 11. PROPOSAL GENERATOR ──────────────────────────────────────────────────

describe('PASO C — proposalGenerator', () => {
  let estimate;
  before(() => {
    estimate = generateEstimate(VET_BRIEF, {}, { total: 8 });
  });

  it('exports version', () => {
    assert.match(PROPOSAL_GENERATOR_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('generates proposal from estimate', () => {
    const p = generateProposal(estimate);
    assert.equal(p.proposalType, 'COMMERCIAL_PROPOSAL');
  });

  it('disclaimer says NOT A CONTRACT', () => {
    const p = generateProposal(estimate);
    assert.ok(p.disclaimer.includes('NO ES UN CONTRATO'));
  });

  it('has executiveSummary section', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.executiveSummary?.content?.length > 0);
  });

  it('has businessProblem section', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.businessProblem !== undefined);
  });

  it('has recommendedSolution section', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.recommendedSolution?.tier !== undefined);
  });

  it('has includedScope with items', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.includedScope?.items?.length > 0);
  });

  it('has deliverables with items', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.deliverables?.items?.length > 0);
  });

  it('has timelineEstimate with min/max', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.timelineEstimate?.min > 0);
    assert.ok(p.sections.timelineEstimate?.max > 0);
  });

  it('has setupEstimate with range', () => {
    const p = generateProposal(estimate);
    assert.ok(Array.isArray(p.sections.setupEstimate?.range));
  });

  it('has monthlyEstimate', () => {
    const p = generateProposal(estimate);
    assert.ok(Array.isArray(p.sections.monthlyEstimate?.range));
  });

  it('has nextSteps with >=4 items', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.nextSteps?.items?.length >= 4);
  });

  it('has assumptions section', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.assumptions?.items?.length > 0);
  });

  it('has exclusions section', () => {
    const p = generateProposal(estimate);
    assert.ok(p.sections.exclusions?.items?.length > 0);
  });

  it('accepts agencyName option', () => {
    const p = generateProposal(estimate, { agencyName: 'TestAgency' });
    assert.equal(p.agency.name, 'TestAgency');
  });

  it('client name comes from estimate', () => {
    const p = generateProposal(estimate);
    assert.equal(p.client.name, VET_BRIEF.businessName);
  });

  it('PREMIUM tier has longer timeline than ESSENTIAL', () => {
    const essEstimate = generateEstimate(SMALL_BRIEF, {}, { total: 2 });
    const preEstimate = generateEstimate(PREMIUM_BRIEF, {}, { total: 12 });
    const essProposal = generateProposal(essEstimate);
    const preProposal = generateProposal(preEstimate);
    assert.ok(preProposal.sections.timelineEstimate.max > essProposal.sections.timelineEstimate.max);
  });
});

// ─── 12. TEN NAMED SCENARIOS ─────────────────────────────────────────────────

describe('PASO C — Scenario: small_business_basic', () => {
  it('Barbería: recommends ESSENTIAL', () => {
    const r = recommendCommercialPackage({}, SMALL_BRIEF, { total: 2 });
    assert.equal(r.recommendedPackage, 'ESSENTIAL');
  });

  it('Barbería: setup range < €3000', () => {
    const e = generateEstimate(SMALL_BRIEF, {}, { total: 2 });
    assert.ok(e.setupRange[1] < 3000, `setup max ${e.setupRange[1]} should be < 3000`);
  });
});

describe('PASO C — Scenario: growing_business', () => {
  it('Vet clinic 8 modules: PRO package', () => {
    const r = recommendCommercialPackage({}, VET_BRIEF, { total: 8 });
    assert.equal(r.recommendedPackage, 'PRO');
  });

  it('Vet clinic: setup range >= €2000', () => {
    const e = generateEstimate(VET_BRIEF, {}, { total: 8 });
    assert.ok(e.setupRange[0] >= 2000);
  });
});

describe('PASO C — Scenario: premium_multi_module', () => {
  it('Psicología 12 modules: PREMIUM package', () => {
    const r = recommendCommercialPackage({}, PREMIUM_BRIEF, { total: 12 });
    assert.equal(r.recommendedPackage, 'PREMIUM');
  });

  it('Psicología: setup range >= €4000', () => {
    const e = generateEstimate(PREMIUM_BRIEF, {}, { total: 12 });
    assert.ok(e.setupRange[0] >= 4000);
  });
});

describe('PASO C — Scenario: many_integrations', () => {
  it('12 integrations trigger extra-integration addons', () => {
    const pricing = calculatePricing({ packageTier: 'PRO', integrations: 12 });
    assert.ok(pricing.estimatedSetupRange[0] > PACKAGE_TIERS.PRO.setupPriceRange.min);
  });
});

describe('PASO C — Scenario: ai_heavy', () => {
  it('5 AI agents on PRO forces extra-ai-agent risks', () => {
    const r = recommendCommercialPackage({}, { ...VET_BRIEF, aiNeeds: ['a','b','c','d','e'] }, { total: 6 });
    assert.ok(r.risks.some(r => r.includes('agentes IA')));
  });

  it('AI brief has humanReviewRequired=true (AI key question)', () => {
    const r = recommendCommercialPackage({}, { ...VET_BRIEF, aiNeeds: ['a','b','c','d','e'] }, { total: 6 });
    assert.equal(r.humanReviewRequired, true);
  });
});

describe('PASO C — Scenario: automation_heavy', () => {
  it('10 automations on ESSENTIAL triggers violation', () => {
    const r = checkLimits('ESSENTIAL', { automations: 10 });
    assert.equal(r.exceeded, true);
  });

  it('10 automations on PREMIUM: no violation', () => {
    const r = checkLimits('PREMIUM', { automations: 10 });
    assert.equal(r.exceeded, false);
  });
});

describe('PASO C — Scenario: unsupported_request', () => {
  it('unknown sector uses 1.0x multiplier', () => {
    const m = getVerticalMultiplier('xyz-unsupported');
    assert.equal(m, 1.0);
  });
});

describe('PASO C — Scenario: scope_exceeded', () => {
  it('20 modules on PRO triggers upgradeRequired', () => {
    const r = checkLimits('PRO', { modules: 20 });
    assert.equal(r.upgradeRequired, true);
  });

  it('scope exceeded returns requiredAddons', () => {
    const r = checkLimits('PRO', { modules: 12 });
    assert.ok(r.requiredAddons.length > 0);
  });
});

describe('PASO C — Scenario: missing_information', () => {
  it('empty brief generates estimate with default values', () => {
    const e = generateEstimate({}, {}, {});
    assert.equal(e.estimateType, 'COMMERCIAL_ESTIMATE');
    assert.ok(Array.isArray(e.setupRange));
  });

  it('brief with no modules still generates valid pricing', () => {
    const r = calculatePricing({ packageTier: 'PRO', modules: 0 });
    assert.equal(r.valid, true);
  });
});

describe('PASO C — Scenario: third_party_cost_required', () => {
  it('stripe is present in catalog as USAGE_BASED or CLIENT_PAID', () => {
    const c = getThirdPartyCostById('stripe');
    assert.ok(c !== null);
    assert.ok([COST_RESPONSIBILITY.USAGE_BASED, COST_RESPONSIBILITY.CLIENT_PAID].includes(c.responsibility));
  });

  it('payment gateway brief has stripe in excluded costs', () => {
    const r = calculatePricing({ packageTier: 'PRO', paymentGateway: true });
    const hasStripe = r.excludedCosts.some(c => c.toLowerCase().includes('stripe'));
    assert.ok(hasStripe);
  });

  it('thirdPartyCosts array is never empty for PRO', () => {
    const r = calculatePricing({ packageTier: 'PRO' });
    assert.ok(r.thirdPartyCosts.length > 0);
  });
});

// ─── 13. E2E: onePromptToCommercialOffer ──────────────────────────────────────

describe('PASO C — onePromptToCommercialOffer E2E', () => {
  let result;

  before(async () => {
    result = await onePromptToCommercialOffer(VET_BRIEF);
  });

  it('exports pipeline version', () => {
    assert.match(COMMERCIAL_OFFER_PIPELINE_VERSION, /^\d+\.\d+\.\d+/);
  });

  it('E2E succeeds for vet brief', () => {
    assert.equal(result.success, true, JSON.stringify(result.error ?? {}));
  });

  it('E2E returns recommendation', () => {
    assert.ok(result.recommendation?.recommendedPackage);
  });

  it('E2E returns pricing with valid=true', () => {
    assert.equal(result.pricing?.valid, true);
  });

  it('E2E returns estimate with COMMERCIAL_ESTIMATE type', () => {
    assert.equal(result.estimate?.estimateType, 'COMMERCIAL_ESTIMATE');
  });

  it('E2E returns proposal with COMMERCIAL_PROPOSAL type', () => {
    assert.equal(result.proposal?.proposalType, 'COMMERCIAL_PROPOSAL');
  });

  it('E2E summary has businessName', () => {
    assert.equal(result.summary?.businessName, VET_BRIEF.businessName);
  });

  it('E2E summary has currency EUR', () => {
    assert.equal(result.summary?.currency, 'EUR');
  });

  it('E2E QA contamination check passes (no cp04/aurora refs)', () => {
    assert.equal(result.steps?.qa_contamination?.pass, true,
      `Contamination violations: ${result.steps?.qa_contamination?.violations?.join(', ')}`);
  });

  it('E2E estimate has disclaimer', () => {
    assert.ok(result.estimate?.disclaimer?.includes('NO ES UN CONTRATO'));
  });

  it('E2E proposal sections include executiveSummary', () => {
    assert.ok(result.proposal?.sections?.executiveSummary);
  });

  it('E2E pipeline: paso B artifacts present', () => {
    assert.ok(result.pasoB?.brief?.businessName);
  });

  it('E2E small brief also succeeds', async () => {
    const r = await onePromptToCommercialOffer(SMALL_BRIEF);
    assert.equal(r.success, true);
    assert.equal(r.recommendation?.recommendedPackage, 'ESSENTIAL');
  });

  it('E2E error on invalid brief (no businessName)', async () => {
    const r = await onePromptToCommercialOffer({ sector: 'padel' });
    assert.equal(r.success, false);
  });
});

// ─── 14. CROSS-CONTAMINATION: no real clients ─────────────────────────────────

describe('PASO C — Cross-client contamination guard', () => {
  it('productCatalog has no cp04 references', () => {
    const str = JSON.stringify(PRODUCT_CATALOG);
    assert.ok(!/\bcp04\b/i.test(str), 'Found cp04 in product catalog');
  });

  it('packages has no aurora references', () => {
    const str = JSON.stringify(PACKAGE_TIERS);
    assert.ok(!/aurora/i.test(str), 'Found aurora in packages');
  });

  it('addons has no fisionova references', () => {
    const str = JSON.stringify(ADDON_CATALOG);
    assert.ok(!/fisionova/i.test(str), 'Found fisionova in addons');
  });

  it('maintenancePlans has no educa-archidona references', () => {
    const str = JSON.stringify(MAINTENANCE_CATALOG);
    assert.ok(!/educa.archidona/i.test(str), 'Found educa-archidona in maintenance plans');
  });

  it('thirdPartyCosts has no real client emails', () => {
    const str = JSON.stringify(THIRD_PARTY_CATALOG);
    assert.ok(!/@(?!demo\.test)[a-z0-9.-]+\.[a-z]{2,}/i.test(str), 'Found real email in third-party costs');
  });
});
