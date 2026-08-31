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

export const REGISTRY_VERSION = '2.1.0';
export const REGISTRY_CREATED = '2026-08-30';
export const REGISTRY_UPDATED = '2026-08-31';
export const PASO_A_STATUS    = '100_PERCENT';
