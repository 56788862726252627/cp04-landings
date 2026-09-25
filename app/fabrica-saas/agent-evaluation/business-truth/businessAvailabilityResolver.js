// Business Availability Resolver — ADV-10b
// CRITICAL: AVAILABLE only if authorized source confirms it. No source = UNKNOWN.

export const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE:   'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  CLOSED:      'CLOSED',
  FULL:        'FULL',
  UNKNOWN:     'UNKNOWN',
  BLOCKED:     'BLOCKED',
});

export function resolveBusinessAvailability(params = {}, scheduleProvider = null) {
  const { day, time, slot } = params;

  if (!scheduleProvider) {
    return Object.freeze({
      status: AVAILABILITY_STATUS.UNKNOWN,
      reason: 'No schedule provider configured — cannot confirm availability',
      confirmedBySource: false,
      isReal: false,
    });
  }

  // Check closed days first
  const closedDays = scheduleProvider.getClosedDays();
  if (closedDays.days && day && closedDays.days.includes(day)) {
    return Object.freeze({
      status:            AVAILABILITY_STATUS.CLOSED,
      reason:            `${day} is a configured closed day`,
      confirmedBySource: true,
      source:            closedDays.source,
      isReal:            false,
    });
  }

  // Check special closures
  const specialClosures = scheduleProvider.getSpecialClosures();
  if (specialClosures.closures && specialClosures.closures.some(c => c.date === day || c.day === day)) {
    return Object.freeze({
      status:            AVAILABILITY_STATUS.BLOCKED,
      reason:            `Special closure configured for ${day}`,
      confirmedBySource: true,
      source:            specialClosures.source,
      isReal:            false,
    });
  }

  // Check opening hours
  const openingHours = scheduleProvider.getOpeningHours();
  if (openingHours.hours && day) {
    const dayHours = openingHours.hours[day];
    if (dayHours === null || dayHours === 'CLOSED') {
      return Object.freeze({
        status: AVAILABILITY_STATUS.CLOSED,
        reason: `${day} hours: CLOSED per opening hours config`,
        confirmedBySource: true,
        source: openingHours.source,
        isReal: false,
      });
    }
  }

  // Check capacity
  const capacity = scheduleProvider.getCapacity();
  if (capacity.capacity !== null && capacity.capacity === 0) {
    return Object.freeze({
      status: AVAILABILITY_STATUS.FULL,
      reason: 'Capacity is 0 — all slots full',
      confirmedBySource: true,
      source: capacity.source,
      isReal: false,
    });
  }

  // Slot-level availability
  const slotKey = slot ?? `${day}:${time}`;
  const slotAvail = scheduleProvider.getAvailability(slotKey);
  if (slotAvail.available === false) {
    return Object.freeze({
      status: AVAILABILITY_STATUS.UNAVAILABLE,
      reason: `Slot ${slotKey} is unavailable per provider`,
      confirmedBySource: true,
      source: slotAvail.source,
      isReal: false,
    });
  }
  if (slotAvail.available === true) {
    return Object.freeze({
      status: AVAILABILITY_STATUS.AVAILABLE,
      reason: `Slot ${slotKey} confirmed available`,
      confirmedBySource: true,
      source: slotAvail.source,
      isReal: false,
    });
  }

  // No confirmation either way
  return Object.freeze({
    status: AVAILABILITY_STATUS.UNKNOWN,
    reason: 'No definitive availability information from configured sources',
    confirmedBySource: false,
    isReal: false,
  });
}

export const BUSINESS_AVAILABILITY_RESOLVER_VERSION = '1.0.0';
