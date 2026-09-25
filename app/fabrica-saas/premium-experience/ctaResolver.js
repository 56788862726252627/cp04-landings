// CTA Resolver — ADV-07

export const CTA_PRIORITY = Object.freeze({
  PRIMARY:     'PRIMARY',
  SECONDARY:   'SECONDARY',
  TERTIARY:    'TERTIARY',
  DESTRUCTIVE: 'DESTRUCTIVE',
});

export const CTA_PATTERN = Object.freeze({
  BOOKING_PRIMARY:     'BOOKING_PRIMARY',
  TRUST_PRIMARY:       'TRUST_PRIMARY',
  CONVERSION_FOCUSED:  'CONVERSION_FOCUSED',
  PRIMARY_SECONDARY:   'PRIMARY_SECONDARY',
  SINGLE_ACTION:       'SINGLE_ACTION',
});

const MAX_COMPETING_CTAS = 2;

const CTA_PATTERN_SPECS = Object.freeze({
  BOOKING_PRIMARY:    { primary: 'Reservar cita', secondary: 'Más información', hasTertiary: false },
  TRUST_PRIMARY:      { primary: 'Consulta gratuita', secondary: 'Llámanos', hasTertiary: false },
  CONVERSION_FOCUSED: { primary: 'Reservar ahora', secondary: null, hasTertiary: false },
  PRIMARY_SECONDARY:  { primary: 'Empezar', secondary: 'Saber más', hasTertiary: false },
  SINGLE_ACTION:      { primary: 'Continuar', secondary: null, hasTertiary: false },
});

export function resolveCTAHierarchy(pattern = CTA_PATTERN.PRIMARY_SECONDARY, options = {}) {
  const spec = CTA_PATTERN_SPECS[pattern] ?? CTA_PATTERN_SPECS.PRIMARY_SECONDARY;
  const ctas = [
    { priority: CTA_PRIORITY.PRIMARY, label: options.primaryLabel ?? spec.primary },
  ];
  if (spec.secondary) {
    ctas.push({ priority: CTA_PRIORITY.SECONDARY, label: options.secondaryLabel ?? spec.secondary });
  }
  if (options.destructiveLabel) {
    ctas.push({ priority: CTA_PRIORITY.DESTRUCTIVE, label: options.destructiveLabel });
  }

  const competing = ctas.filter(c => c.priority === CTA_PRIORITY.PRIMARY || c.priority === CTA_PRIORITY.SECONDARY).length;
  return Object.freeze({
    pattern,
    ctas,
    competing,
    overcrowded: competing > MAX_COMPETING_CTAS,
    isReal: false,
  });
}

export function evaluateCTACrowding(ctas = []) {
  const primaries = ctas.filter(c => c.priority === CTA_PRIORITY.PRIMARY).length;
  const secondaries = ctas.filter(c => c.priority === CTA_PRIORITY.SECONDARY).length;
  return Object.freeze({
    overcrowded: primaries > 1 || (primaries + secondaries) > MAX_COMPETING_CTAS,
    primaryCount: primaries,
    totalVisible: ctas.length,
    isReal: false,
  });
}

export const CTA_RESOLVER_VERSION = '1.0.0';
