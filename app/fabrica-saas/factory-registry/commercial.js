/**
 * Commercial Registry
 * Central export for all Paso C commercial modules.
 */

export { PRODUCT_CATALOG_VERSION, PRODUCT_CATALOG, getProductById, listProductIds } from '../commercial/productCatalog.js';
export { PACKAGES_VERSION, PACKAGE_TIERS, getPackage, listPackageIds, getPackageByModuleCount } from '../commercial/packages.js';
export { ADDONS_VERSION, ADDON_CATALOG, getAddonById, getAddonsByCategory, listAddonIds } from '../commercial/addons.js';
export { THIRD_PARTY_COSTS_VERSION, COST_RESPONSIBILITY, THIRD_PARTY_CATALOG, getThirdPartyCostById, getClientPaidCosts, listThirdPartyIds } from '../commercial/thirdPartyCosts.js';
export { MAINTENANCE_PLANS_VERSION, MAINTENANCE_CATALOG, getMaintenancePlan, listMaintenancePlanIds, recommendMaintenancePlan } from '../commercial/maintenancePlans.js';
export { SERVICE_LIMITS_VERSION, LIMITS_REGISTRY, checkLimits, getLimits } from '../commercial/serviceLimits.js';
export { VERTICAL_OVERRIDES_VERSION, VERTICAL_PRICING_OVERRIDES, getVerticalMultiplier, getVerticalOverride, applyVerticalMultiplier } from '../commercial/verticalOverrides.js';
export { PRICING_ENGINE_VERSION, calculatePricing } from '../commercial/pricingEngine.js';
export { PACKAGE_RECOMMENDER_VERSION, recommendCommercialPackage } from '../commercial/packageRecommender.js';
export { COMMERCIAL_ESTIMATE_VERSION, generateEstimate } from '../commercial/commercialEstimate.js';
export { PROPOSAL_GENERATOR_VERSION, generateProposal } from '../commercial/proposalGenerator.js';

export const COMMERCIAL_REGISTRY_VERSION = '1.0.0';
export const PASO_C_STATUS = 'COMPLETE';
