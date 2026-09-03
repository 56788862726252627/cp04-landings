// Privacy Preference Center Model — ADV-19

export function createPrivacyPreferenceCenterModel(config = {}) {
  const {
    categories = [],
    independentToggle = true,
    withdrawalPath = true,
    auditLog = true,
    versionDisplay = true,
    clientId = null,
  } = config;

  const issues = [];
  if (!independentToggle) issues.push('CATEGORIES_NOT_INDEPENDENTLY_TOGGLEABLE');
  if (!withdrawalPath)    issues.push('WITHDRAWAL_PATH_MISSING');
  if (!auditLog)          issues.push('PREFERENCE_AUDIT_NOT_RECORDED');
  if (!versionDisplay)    issues.push('POLICY_VERSION_NOT_SHOWN');

  const categoryModels = categories.map(cat => Object.freeze({
    name: cat.name ?? cat,
    enabled: cat.enabled ?? false,
    essential: cat.essential ?? false,
    toggleable: !(cat.essential ?? false),
    isReal: false,
  }));

  return Object.freeze({
    clientId,
    categories: Object.freeze(categoryModels),
    independentToggle,
    withdrawalPath,
    auditLog,
    versionDisplay,
    issues: Object.freeze([...issues]),
    compliant: issues.length === 0,
    reusableFoundation: true,
    isReal: false,
  });
}

export const PREFERENCE_CENTER_VERSION = '1.0.0';
