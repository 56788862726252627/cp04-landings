// Health Visual Semantics — ADV-20 (accessibility, no color-only dependence)

export const VISUAL_ICON = Object.freeze({
  HEALTHY:        '✓',
  DEGRADED:       '⚠',
  WARNING:        '⚠',
  CRITICAL:       '✗',
  BLOCKED:        '⛔',
  UNKNOWN:        '?',
  NOT_APPLICABLE: '—',
});

export const VISUAL_LABEL = Object.freeze({
  HEALTHY:        'Healthy',
  DEGRADED:       'Degraded',
  WARNING:        'Warning',
  CRITICAL:       'Critical',
  BLOCKED:        'Blocked',
  UNKNOWN:        'Unknown',
  NOT_APPLICABLE: 'Not Applicable',
});

export const VISUAL_ARIA_LABEL = Object.freeze({
  HEALTHY:        'Status: Healthy — system operating normally',
  DEGRADED:       'Status: Degraded — performance or availability reduced',
  WARNING:        'Status: Warning — attention required',
  CRITICAL:       'Status: Critical — immediate action required',
  BLOCKED:        'Status: Blocked — operation cannot proceed',
  UNKNOWN:        'Status: Unknown — state cannot be determined',
  NOT_APPLICABLE: 'Status: Not Applicable — metric does not apply',
});

export function createHealthVisualSemantics(status) {
  const s = status ?? 'UNKNOWN';
  return Object.freeze({
    status: s,
    icon:      VISUAL_ICON[s]      ?? '?',
    label:     VISUAL_LABEL[s]     ?? 'Unknown',
    ariaLabel: VISUAL_ARIA_LABEL[s] ?? 'Status: Unknown',
    colorIndependent: true,
    isReal: false,
  });
}

export const HEALTH_VISUAL_SEMANTICS_VERSION = '1.0.0';
