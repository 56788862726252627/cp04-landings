// Deduplication Engine — ADV-08

import { DUPLICATE_STATUS } from './leadModel.js';

const CONFIDENCE_THRESHOLD_DUPLICATE = 0.85;
const CONFIDENCE_THRESHOLD_POSSIBLE  = 0.55;

function normStr(s = '') {
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function domainFrom(website = '') {
  return website.replace(/^https?:\/\//i,'').replace(/^www\./i,'').replace(/\/.*$/,'').toLowerCase().trim();
}

function phoneDigits(phone = '') {
  return phone.replace(/\D/g, '').slice(-9);
}

function computeSimilarity(a = {}, b = {}) {
  // Max-based: the strongest single signal wins; extra signals can only help, never hurt.
  let max = 0;

  if (a.externalId && b.externalId && a.externalId === b.externalId) max = Math.max(max, 1.0);

  const aDomain = domainFrom(a.website ?? '');
  const bDomain = domainFrom(b.website ?? '');
  if (aDomain && bDomain && aDomain === bDomain) max = Math.max(max, 0.95);

  const aEmail = normStr(a.publicEmail ?? '');
  const bEmail = normStr(b.publicEmail ?? '');
  if (aEmail && bEmail && aEmail === bEmail) max = Math.max(max, 0.95);

  const aPhone = phoneDigits(a.publicPhone ?? '');
  const bPhone = phoneDigits(b.publicPhone ?? '');
  if (aPhone && bPhone && aPhone.length >= 7 && aPhone === bPhone) max = Math.max(max, 0.90);

  const aName = normStr(a.businessName ?? '');
  const bName = normStr(b.businessName ?? '');
  const aLoc  = normStr(a.location ?? '');
  const bLoc  = normStr(b.location ?? '');
  if (aName && bName && aName === bName && aLoc && bLoc && aLoc === bLoc) max = Math.max(max, 0.75);
  else if (aName && bName && aName === bName) max = Math.max(max, 0.45);

  return max;
}

export function deduplicateLeads(leads = []) {
  const results = [];
  const duplicateOf = new Map();

  for (let i = 0; i < leads.length; i++) {
    if (duplicateOf.has(i)) continue;

    const canonical = { ...leads[i], duplicateStatus: DUPLICATE_STATUS.UNIQUE };
    const possibleDuplicates = [];

    for (let j = i + 1; j < leads.length; j++) {
      if (duplicateOf.has(j)) continue;
      const sim = computeSimilarity(leads[i], leads[j]);

      if (sim >= CONFIDENCE_THRESHOLD_DUPLICATE) {
        duplicateOf.set(j, i);
        possibleDuplicates.push({ index: j, similarity: sim, status: DUPLICATE_STATUS.DUPLICATE });
      } else if (sim >= CONFIDENCE_THRESHOLD_POSSIBLE) {
        possibleDuplicates.push({ index: j, similarity: sim, status: DUPLICATE_STATUS.POSSIBLE_DUPLICATE });
      }
    }

    results.push(Object.freeze({
      lead: Object.freeze(canonical),
      possibleDuplicates: Object.freeze(possibleDuplicates),
      isReal: false,
    }));
  }

  const duplicates = leads.filter((_, i) => duplicateOf.has(i));
  return Object.freeze({
    unique:     Object.freeze(results),
    duplicates: Object.freeze(duplicates),
    totalIn:    leads.length,
    totalOut:   results.length,
    duplicatesFound: duplicates.length,
    isReal: false,
  });
}

export const DEDUPLICATION_ENGINE_VERSION = '1.0.0';
