// Brief Validation — ADV-04
// validateProductionBrief(): validates a business brief before production pipeline.

export const BRIEF_FIELD_STATUS = Object.freeze({
  PRESENT:  'PRESENT',
  MISSING:  'MISSING',
  INVALID:  'INVALID',
});

const REQUIRED_FIELDS = Object.freeze([
  { id: 'businessName',     label: 'Business name',         critical: true  },
  { id: 'vertical',        label: 'Sector / vertical',      critical: true  },
  { id: 'services',        label: 'Services list',          critical: true  },
  { id: 'targetUsers',     label: 'Target users',           critical: true  },
  { id: 'roles',           label: 'User roles',             critical: true  },
  { id: 'location',        label: 'Location / market',      critical: false },
  { id: 'brandPreferences',label: 'Brand preferences',      critical: false },
  { id: 'modules',         label: 'Module list',            critical: true  },
  { id: 'integrations',    label: 'Integrations required',  critical: false },
  { id: 'deploymentTarget',label: 'Deployment target',      critical: true  },
]);

export function validateProductionBrief(brief = {}) {
  const fieldResults = REQUIRED_FIELDS.map(field => {
    const value = brief[field.id];
    let status = BRIEF_FIELD_STATUS.PRESENT;
    let detail = null;

    if (value === undefined || value === null || value === '') {
      status = BRIEF_FIELD_STATUS.MISSING;
    } else if (Array.isArray(value) && value.length === 0) {
      status = BRIEF_FIELD_STATUS.MISSING;
      detail = 'Empty array — must have at least one entry';
    }

    return { fieldId: field.id, label: field.label, status, critical: field.critical, detail };
  });

  const criticalMissing = fieldResults.filter(f => f.critical && f.status !== BRIEF_FIELD_STATUS.PRESENT);
  const warnings        = fieldResults.filter(f => !f.critical && f.status !== BRIEF_FIELD_STATUS.PRESENT);

  const isValid = criticalMissing.length === 0;

  return Object.freeze({
    valid:          isValid,
    status:         isValid ? 'READY' : 'WAITING_HUMAN',
    fields:         fieldResults,
    criticalMissing: criticalMissing.map(f => f.fieldId),
    warnings:       warnings.map(f => f.fieldId),
    missingCount:   criticalMissing.length,
    warningCount:   warnings.length,
    message:        isValid
      ? 'Brief is complete and ready for production pipeline.'
      : `Missing ${criticalMissing.length} required field(s): ${criticalMissing.map(f => f.fieldId).join(', ')}`,
    isReal:         false,
  });
}

export const BRIEF_VALIDATION_VERSION = '1.0.0';
