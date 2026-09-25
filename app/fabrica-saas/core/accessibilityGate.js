/**
 * Factory Accessibility Gate V2
 * WCAG 2.1 AA compliance checks for generated apps.
 * Pure functions — no DOM dependency at check time.
 */

// ─── Color contrast (WCAG 2.1) ────────────────────────────────────────────────

function getLuminance(r, g, b) {
  const toLinear = (c) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrastAA(hex1, hex2, largeText = false) {
  const ratio = getContrastRatio(hex1, hex2);
  return largeText ? ratio >= 3.0 : ratio >= 4.5;
}

// ─── Palette audit ────────────────────────────────────────────────────────────

export function auditPaletteContrast(palette = {}) {
  const results = [];
  const { primary, surface, accent } = palette;

  if (primary && surface) {
    const ratio = getContrastRatio(primary, surface);
    results.push({
      pair:    'primary on surface',
      ratio:   Math.round(ratio * 10) / 10,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
    });
  }

  if (accent && surface) {
    const ratio = getContrastRatio(accent, surface);
    results.push({
      pair:    'accent on surface',
      ratio:   Math.round(ratio * 10) / 10,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
    });
  }

  const allPass = results.every(r => r.passesAA);
  return { results, allPass, failCount: results.filter(r => !r.passesAA).length };
}

// ─── Motion accessibility ─────────────────────────────────────────────────────

export function auditMotionAccessibility(preset = {}) {
  const issues = [];

  if (preset.motionIntensity === 'high' && !preset.reducedMotionFallback) {
    issues.push({
      type: 'motion',
      severity: 'error',
      message: 'High motion intensity preset must define reducedMotionFallback',
    });
  }

  if (preset.videoBehavior === 'autoplay-silent' && !preset.reducedMotionFallback) {
    issues.push({
      type: 'motion',
      severity: 'warning',
      message: 'Autoplay video should provide reducedMotionFallback: static|fade-only',
    });
  }

  if (preset.backgroundMotion && preset.motionIntensity !== 'none') {
    issues.push({
      type: 'motion',
      severity: 'info',
      message: 'Background motion enabled — ensure it pauses under prefers-reduced-motion',
    });
  }

  return { issues, pass: !issues.some(i => i.severity === 'error') };
}

// ─── Component checklist ──────────────────────────────────────────────────────

export const COMPONENT_A11Y_CHECKLIST = Object.freeze({
  button: [
    'Has visible focus ring',
    'Keyboard activatable (Enter/Space)',
    'aria-label if no text content',
    'disabled state communicated',
  ],
  dialog: [
    'role="dialog" or role="alertdialog"',
    'aria-modal="true"',
    'aria-labelledby pointing to title',
    'Focus moves to dialog on open',
    'Focus trapped inside',
    'Escape closes dialog',
    'Focus returns to trigger on close',
  ],
  tabs: [
    'role="tablist" on container',
    'role="tab" on each tab',
    'role="tabpanel" on each panel',
    'aria-selected on active tab',
    'Arrow keys navigate tabs',
  ],
  form: [
    'Every input has <label> or aria-label',
    'Error messages have role="alert"',
    'Required fields marked with aria-required',
    'Validation errors associated with field via aria-describedby',
  ],
  image: [
    'Meaningful images have descriptive alt text',
    'Decorative images have alt=""',
    'Complex images have long description',
  ],
});

// ─── Full gate check ──────────────────────────────────────────────────────────

export function runAccessibilityGate(preset = {}) {
  const contrastAudit = auditPaletteContrast(preset.palette ?? {});
  const motionAudit   = auditMotionAccessibility(preset);

  const score = (() => {
    let s = 100;
    s -= contrastAudit.failCount * 20;
    s -= motionAudit.issues.filter(i => i.severity === 'error').length * 25;
    s -= motionAudit.issues.filter(i => i.severity === 'warning').length * 10;
    return Math.max(0, s);
  })();

  return {
    score,
    pass:          score >= 70,
    level:         score >= 90 ? 'AAA' : score >= 70 ? 'AA' : 'FAIL',
    contrastAudit,
    motionAudit,
    recommendations: buildRecommendations(contrastAudit, motionAudit),
    checkedAt:     new Date().toISOString(),
    version:       '2.0.0',
  };
}

function buildRecommendations(contrast, motion) {
  const recs = [];
  if (contrast.failCount > 0) {
    recs.push('Adjust color palette to achieve 4.5:1 contrast ratio for all text/background pairs');
  }
  for (const issue of motion.issues) {
    recs.push(issue.message);
  }
  if (recs.length === 0) recs.push('Palette and motion pass WCAG 2.1 AA — good to go!');
  return recs;
}

export const A11Y_GATE_VERSION = '2.0.0';
