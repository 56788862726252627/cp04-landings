// Manual Import Provider — ADV-08

import { PROVIDER_MODE, PROVIDER_STATUS, COST_STATUS, createProviderDescriptor } from './leadDiscoveryProvider.js';
import { LEAD_SOURCE_TYPE } from '../leadModel.js';

export function createManualImportProvider() {
  return createProviderDescriptor({
    name:          'MANUAL_IMPORT',
    sourceType:    LEAD_SOURCE_TYPE.MANUAL,
    mode:          PROVIDER_MODE.LIVE,
    status:        PROVIDER_STATUS.READY,
    requiresToken: false,
    estimatedCost: 0,
    costStatus:    COST_STATUS.FREE_SAFE,
    maxResults:    500,
    legalNotes:    'User-supplied data — ensure collection is compliant with applicable law.',
  });
}

export function validateManualImportRow(row = {}) {
  const errors   = [];
  const warnings = [];
  if (!row.businessName && !row.name) errors.push('MISSING_BUSINESS_NAME');
  if (!row.location && !row.city)     warnings.push('MISSING_LOCATION');
  if (!row.website && !row.publicEmail && !row.publicPhone) {
    warnings.push('NO_CONTACT_VECTOR');
  }
  return Object.freeze({ valid: errors.length === 0, errors, warnings, isReal: false });
}

export function importManualLeads(rows = []) {
  const accepted = [];
  const rejected = [];
  for (const row of rows) {
    const v = validateManualImportRow(row);
    if (v.valid) {
      accepted.push(Object.freeze({
        ...row,
        businessName: row.businessName ?? row.name ?? '',
        location:     row.location ?? row.city ?? '',
        source:       LEAD_SOURCE_TYPE.MANUAL,
        sourceType:   LEAD_SOURCE_TYPE.MANUAL,
        isReal: false,
      }));
    } else {
      rejected.push({ row, errors: v.errors });
    }
  }
  return Object.freeze({
    provider:      'MANUAL_IMPORT',
    sourceType:    LEAD_SOURCE_TYPE.MANUAL,
    rawCount:      rows.length,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    leads:         Object.freeze(accepted),
    rejections:    Object.freeze(rejected),
    isReal: false,
  });
}

export const MANUAL_IMPORT_PROVIDER_VERSION = '1.0.0';
