/**
 * Vertical Resolver — Phase 4
 * Maps businessProfile → CORE + VERTICAL + CLIENT layer resolution.
 * If exact vertical missing: find closest, generate controlled extension.
 * CORE is never contaminated by vertical/client-specific logic.
 */

export const VERTICAL_RESOLVER_VERSION = '1.0.0';

// ─── Vertical Registry ────────────────────────────────────────────────────────

const VERTICAL_REGISTRY = Object.freeze({
  dental:     { available: true,  closestFallback: 'salud',      extendable: true  },
  salud:      { available: true,  closestFallback: 'fisio',      extendable: true  },
  fisio:      { available: true,  closestFallback: 'salud',      extendable: true  },
  estetica:   { available: true,  closestFallback: 'spa',        extendable: true  },
  spa:        { available: false, closestFallback: 'estetica',   extendable: true  },
  padel:      { available: false, closestFallback: 'fitness',    extendable: true  },
  fitness:    { available: false, closestFallback: 'padel',      extendable: true  },
  tech:       { available: false, closestFallback: 'consultoria',extendable: true  },
  educacion:  { available: true,  closestFallback: 'tech',       extendable: true  },
  legal:      { available: true,  closestFallback: 'consultoria',extendable: true  },
  consultoria:{ available: false, closestFallback: 'legal',      extendable: true  },
  restaurante:{ available: false, closestFallback: 'comercio',   extendable: true  },
  comercio:   { available: false, closestFallback: 'restaurante',extendable: true  },
  veterinary: { available: true,  closestFallback: 'salud',      extendable: true  },
  portfolio:  { available: false, closestFallback: 'tech',       extendable: true  },
  analytics:  { available: false, closestFallback: 'tech',       extendable: true  },
});

// ─── Core Modules (never vertical-specific) ───────────────────────────────────

const CORE_MODULES = Object.freeze([
  'auth', 'roles', 'dashboard', 'notifications', 'analytics',
  'settings', 'support',
]);

// ─── Vertical Module Map ──────────────────────────────────────────────────────

const VERTICAL_MODULES = Object.freeze({
  dental:     ['patients', 'treatments', 'radiographs', 'budget', 'appointments'],
  salud:      ['patients', 'history', 'prescriptions', 'appointments'],
  fisio:      ['patients', 'sessions', 'exercises', 'evolution', 'appointments'],
  estetica:   ['clients', 'services', 'gallery', 'before-after', 'appointments'],
  educacion:  ['students', 'courses', 'attendance', 'grades', 'timetable'],
  legal:      ['cases', 'clients', 'documents', 'billing', 'deadlines'],
  veterinary: ['pets', 'owners', 'appointments', 'vaccinations', 'treatments', 'medical-history'],
  default:    ['clients', 'appointments', 'services'],
});

// ─── Resolution Logic ─────────────────────────────────────────────────────────

function findClosestVertical(sector) {
  const entry = VERTICAL_REGISTRY[sector];
  if (!entry) return { vertical: 'default', extended: true, newPieces: [sector] };
  if (entry.available) return { vertical: sector, extended: false, newPieces: [] };

  const fallback = entry.closestFallback;
  const fallbackEntry = VERTICAL_REGISTRY[fallback];
  if (fallbackEntry?.available) {
    return { vertical: fallback, extended: true, newPieces: [sector] };
  }
  return { vertical: 'default', extended: true, newPieces: [sector, fallback] };
}

/**
 * Resolve the full vertical stack for a business profile.
 * @param {Object} profile - businessProfile from businessAnalyzer
 * @param {Object} brief   - validated brief
 * @returns {Object} resolution
 */
export function resolveVertical(profile = {}, brief = {}) {
  const { sector } = profile;
  const { vertical, extended, newPieces } = findClosestVertical(sector);

  const coreModules     = [...CORE_MODULES];
  const verticalModules = VERTICAL_MODULES[sector] ?? VERTICAL_MODULES[vertical] ?? VERTICAL_MODULES.default;
  const clientModules   = (brief.requiredModules ?? []).filter(m =>
    !coreModules.includes(m) && !verticalModules.includes(m)
  );

  const warnings = [];
  if (extended) {
    warnings.push(`Vertical '${sector}' extended from '${vertical}'. New pieces: ${newPieces.join(', ')}`);
  }
  if (newPieces.length > 0) {
    warnings.push(`New vertical modules scaffolded: ${newPieces.join(', ')} — review before production`);
  }

  return {
    requestedSector: sector,
    resolvedVertical: vertical,
    extended,
    newPieces,
    layers: {
      CORE:     { modules: coreModules,     contaminated: false },
      VERTICAL: { id: sector, modules: verticalModules, scaffolded: extended },
      CLIENT:   { id: brief.businessName ?? 'unknown', modules: clientModules },
    },
    allModules: [...new Set([...coreModules, ...verticalModules, ...clientModules])],
    warnings,
    resolverVersion: VERTICAL_RESOLVER_VERSION,
  };
}
