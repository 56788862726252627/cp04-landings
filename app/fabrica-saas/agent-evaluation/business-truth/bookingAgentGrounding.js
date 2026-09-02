// Booking Agent Grounding — ADV-10b
// Agent must consult ScheduleProvider + SourceOfTruth before asserting availability.

import { AVAILABILITY_STATUS, resolveBusinessAvailability } from './businessAvailabilityResolver.js';

export const BOOKING_GROUNDING_RESULT = Object.freeze({
  GROUNDED:      'GROUNDED',
  UNGROUNDED:    'UNGROUNDED',
  NEEDS_LOOKUP:  'NEEDS_LOOKUP',
  UNCERTAIN:     'UNCERTAIN',
});

export function checkBookingGrounding(claim = {}, scheduleProvider = null, facts = []) {
  const { claimsAvailability, claimsOpen, day, time, slot, resourceId } = claim;
  const issues = [];

  if (claimsAvailability || claimsOpen) {
    if (!scheduleProvider) {
      issues.push('No schedule provider — cannot verify availability claim');
      return Object.freeze({
        result: BOOKING_GROUNDING_RESULT.UNGROUNDED,
        issues: Object.freeze(issues),
        availability: null,
        recommendation: 'Agent must express uncertainty: "No tengo disponibilidad confirmada para ese horario."',
        isReal: false,
      });
    }

    const avail = resolveBusinessAvailability({ day, time, slot, resourceId }, scheduleProvider);

    if (avail.status === AVAILABILITY_STATUS.CLOSED) {
      issues.push(`Agent claimed available but source says CLOSED for ${day ?? slot}`);
      return Object.freeze({
        result:         BOOKING_GROUNDING_RESULT.UNGROUNDED,
        issues:         Object.freeze(issues),
        availability:   avail,
        isCritical:     true,
        recommendation: 'Block claim — the business is closed on this day',
        isReal:         false,
      });
    }

    if (avail.status === AVAILABILITY_STATUS.FULL) {
      issues.push('Agent claimed available but capacity is full');
      return Object.freeze({
        result: BOOKING_GROUNDING_RESULT.UNGROUNDED,
        issues: Object.freeze(issues),
        availability: avail,
        isCritical: true,
        isReal: false,
      });
    }

    if (avail.status === AVAILABILITY_STATUS.UNKNOWN) {
      return Object.freeze({
        result:         BOOKING_GROUNDING_RESULT.UNCERTAIN,
        issues:         Object.freeze(['Provider could not confirm availability']),
        availability:   avail,
        recommendation: '"No tengo disponibilidad confirmada para ese horario todavía."',
        isReal:         false,
      });
    }

    if (avail.status === AVAILABILITY_STATUS.AVAILABLE && avail.confirmedBySource) {
      return Object.freeze({
        result:       BOOKING_GROUNDING_RESULT.GROUNDED,
        issues:       Object.freeze([]),
        availability: avail,
        isReal:       false,
      });
    }
  }

  return Object.freeze({
    result:  BOOKING_GROUNDING_RESULT.GROUNDED,
    issues:  Object.freeze(issues),
    isReal:  false,
  });
}

export const BOOKING_AGENT_GROUNDING_VERSION = '1.0.0';
