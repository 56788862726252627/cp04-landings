// Bundle / Size Gate — ADV-02 CI/CD Automatizado
// evaluateBundleBudget(): verifica tamaño de assets individuales por proyecto.

export const BUNDLE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
});

export const BUNDLE_PRESET = Object.freeze({
  FACTORY_DEFAULT: 'FACTORY_DEFAULT',
  DENTAL:          'DENTAL',
  PHYSIO:          'PHYSIO',
  EDUCA:           'EDUCA',
  AGENCY:          'AGENCY',
  CUSTOM:          'CUSTOM',
});

const PRESET_BUDGETS = {
  [BUNDLE_PRESET.FACTORY_DEFAULT]: { warnKb: 300, failKb: 500, totalWarnMb: 5,  totalFailMb: 15 },
  [BUNDLE_PRESET.DENTAL]:          { warnKb: 250, failKb: 400, totalWarnMb: 5,  totalFailMb: 10 },
  [BUNDLE_PRESET.PHYSIO]:          { warnKb: 250, failKb: 400, totalWarnMb: 5,  totalFailMb: 10 },
  [BUNDLE_PRESET.EDUCA]:           { warnKb: 400, failKb: 600, totalWarnMb: 10, totalFailMb: 20 },
  [BUNDLE_PRESET.AGENCY]:          { warnKb: 500, failKb: 800, totalWarnMb: 15, totalFailMb: 30 },
};

function kbFromBytes(bytes) { return bytes / 1024; }

/**
 * Evaluate bundle budget from build output metadata.
 * assets: array of { name, sizeBytes, gzipBytes? }
 * options: { preset, customBudget, allowedOverrides }
 */
export function evaluateBundleBudget(assets = [], options = {}) {
  if (!Array.isArray(assets)) return { valid: false, error: 'assets must be array' };

  const preset  = options.preset ?? BUNDLE_PRESET.FACTORY_DEFAULT;
  const budget  = options.customBudget ?? PRESET_BUDGETS[preset] ?? PRESET_BUDGETS[BUNDLE_PRESET.FACTORY_DEFAULT];
  const overrides = options.allowedOverrides ?? {};

  const warnings = [];
  const failures = [];
  const assetResults = [];

  let totalBytes = 0;

  for (const asset of assets) {
    const sizeKb = kbFromBytes(asset.sizeBytes ?? 0);
    const assetOverride = overrides[asset.name];
    const effectiveFail = assetOverride?.failKb ?? budget.failKb;
    const effectiveWarn = assetOverride?.warnKb ?? budget.warnKb;

    totalBytes += asset.sizeBytes ?? 0;

    const status = sizeKb > effectiveFail ? BUNDLE_STATUS.FAIL
      : sizeKb > effectiveWarn            ? BUNDLE_STATUS.WARNING
      : BUNDLE_STATUS.PASS;

    if (status === BUNDLE_STATUS.FAIL)    failures.push(asset.name);
    if (status === BUNDLE_STATUS.WARNING) warnings.push(asset.name);

    assetResults.push(Object.freeze({
      name:   asset.name,
      sizeKb: parseFloat(sizeKb.toFixed(1)),
      status,
    }));
  }

  const totalMb = totalBytes / (1024 * 1024);
  const totalStatus = totalMb > budget.totalFailMb ? BUNDLE_STATUS.FAIL
    : totalMb > budget.totalWarnMb                ? BUNDLE_STATUS.WARNING
    : BUNDLE_STATUS.PASS;

  if (totalStatus === BUNDLE_STATUS.FAIL)    failures.push('total_bundle');
  if (totalStatus === BUNDLE_STATUS.WARNING) warnings.push('total_bundle');

  const overallStatus = failures.length > 0 ? BUNDLE_STATUS.FAIL
    : warnings.length > 0                   ? BUNDLE_STATUS.WARNING
    : BUNDLE_STATUS.PASS;

  return {
    valid:         true,
    overallStatus,
    preset,
    budget,
    totalMb:       parseFloat(totalMb.toFixed(2)),
    totalStatus,
    assetResults,
    warnings,
    failures,
    assetCount:    assets.length,
    message:       `Bundle: ${totalMb.toFixed(2)}MB total, ${failures.length} failures, ${warnings.length} warnings`,
  };
}

export const BUNDLE_GATE_VERSION = '1.0.0';
