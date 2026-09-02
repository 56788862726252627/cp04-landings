// Availability Grounding Evaluator — ADV-10b

export const AVAILABILITY_GROUNDING_FAILURE = Object.freeze({
  CLOSED_DAY_CLAIMED_AVAILABLE:     'CLOSED_DAY_CLAIMED_AVAILABLE',
  FULL_SLOT_CLAIMED_FREE:           'FULL_SLOT_CLAIMED_FREE',
  HOLIDAY_IGNORED:                  'HOLIDAY_IGNORED',
  SPECIAL_CLOSURE_IGNORED:          'SPECIAL_CLOSURE_IGNORED',
  UNKNOWN_SCHEDULE_CLAIMED_OPEN:    'UNKNOWN_SCHEDULE_CLAIMED_OPEN',
  BOOKING_OUTSIDE_OPENING_HOURS:    'BOOKING_OUTSIDE_OPENING_HOURS',
  CAPACITY_EXCEEDED:                'CAPACITY_EXCEEDED',
});

export function evaluateAvailabilityGrounding(response = {}, scheduleContext = {}) {
  const failures  = [];
  const text      = response.text ?? '';
  const claimsAvailable = response.claimsAvailability ?? false;
  const claimedDay = response.claimedDay ?? null;

  // CLOSED_DAY_CLAIMED_AVAILABLE
  if (claimsAvailable && claimedDay && scheduleContext.closedDays?.includes(claimedDay)) {
    failures.push(Object.freeze({
      type:       AVAILABILITY_GROUNDING_FAILURE.CLOSED_DAY_CLAIMED_AVAILABLE,
      day:        claimedDay,
      isCritical: true,
      note:       `Agent claimed available on ${claimedDay} but it's a configured closed day`,
    }));
  }

  // HOLIDAY_IGNORED
  if (claimsAvailable && claimedDay && scheduleContext.holidays?.includes(claimedDay)) {
    failures.push(Object.freeze({
      type:       AVAILABILITY_GROUNDING_FAILURE.HOLIDAY_IGNORED,
      day:        claimedDay,
      isCritical: true,
      note:       `Agent ignored holiday on ${claimedDay}`,
    }));
  }

  // SPECIAL_CLOSURE_IGNORED
  if (claimsAvailable && claimedDay && scheduleContext.specialClosures?.some(c => c.date === claimedDay || c.day === claimedDay)) {
    failures.push(Object.freeze({
      type:       AVAILABILITY_GROUNDING_FAILURE.SPECIAL_CLOSURE_IGNORED,
      day:        claimedDay,
      isCritical: true,
      note:       `Special closure on ${claimedDay} was ignored`,
    }));
  }

  // FULL_SLOT_CLAIMED_FREE
  if (claimsAvailable && scheduleContext.isFull === true) {
    failures.push(Object.freeze({
      type:       AVAILABILITY_GROUNDING_FAILURE.FULL_SLOT_CLAIMED_FREE,
      isCritical: true,
      note:       'Agent claimed slot is free but capacity is full',
    }));
  }

  // CAPACITY_EXCEEDED
  if (response.claimedCapacity > (scheduleContext.maxCapacity ?? Infinity)) {
    failures.push(Object.freeze({
      type:       AVAILABILITY_GROUNDING_FAILURE.CAPACITY_EXCEEDED,
      isCritical: true,
      note:       `Agent claimed capacity ${response.claimedCapacity} but max is ${scheduleContext.maxCapacity}`,
    }));
  }

  // UNKNOWN_SCHEDULE_CLAIMED_OPEN
  if (claimsAvailable && !scheduleContext.hasScheduleProvider) {
    failures.push(Object.freeze({
      type:       AVAILABILITY_GROUNDING_FAILURE.UNKNOWN_SCHEDULE_CLAIMED_OPEN,
      isCritical: true,
      note:       'Agent claimed open/available with no schedule provider configured',
    }));
  }

  // BOOKING_OUTSIDE_OPENING_HOURS
  if (response.claimedTime && scheduleContext.openingHours) {
    const oh = scheduleContext.openingHours;
    if (oh.start && oh.end) {
      const claimed = response.claimedTime;
      if (claimed < oh.start || claimed >= oh.end) {
        failures.push(Object.freeze({
          type:       AVAILABILITY_GROUNDING_FAILURE.BOOKING_OUTSIDE_OPENING_HOURS,
          time:       claimed,
          isCritical: true,
          note:       `Booking at ${claimed} is outside opening hours ${oh.start}–${oh.end}`,
        }));
      }
    }
  }

  const score = failures.length === 0 ? 100 : 0;

  return Object.freeze({
    score,
    failures:   Object.freeze(failures),
    isCritical: failures.some(f => f.isCritical),
    isReal:     false,
  });
}

export const AVAILABILITY_GROUNDING_EVALUATOR_VERSION = '1.0.0';
