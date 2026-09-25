// CRM Idempotency Policy — ADV-09 CRM

import { createHash } from 'node:crypto';

export function computeIdempotencyKey(payload = {}) {
  const canonical = JSON.stringify({
    opportunityId: payload.opportunityId ?? '',
    action:        payload.action ?? '',
    stage:         payload.stage ?? '',
    timestamp:     payload.timestamp ?? '',
  });
  return createHash('sha256').update(canonical).digest('hex').slice(0, 24);
}

export function createIdempotencyRecord(payload = {}, ttlSeconds = 86400) {
  return Object.freeze({
    key:        computeIdempotencyKey(payload),
    payload:    Object.freeze({ ...payload }),
    createdAt:  new Date().toISOString(),
    expiresAt:  new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    ttlSeconds,
    isReal: false,
  });
}

export function isIdempotencyRecordExpired(record = {}) {
  if (!record.expiresAt) return true;
  return new Date(record.expiresAt).getTime() < Date.now();
}

export const CRM_IDEMPOTENCY_VERSION = '1.0.0';
