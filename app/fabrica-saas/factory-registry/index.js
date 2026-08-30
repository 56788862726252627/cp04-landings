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

export const REGISTRY_VERSION = '2.0.0';
export const REGISTRY_CREATED = '2026-08-30';
