// Business Schedule Provider — ADV-10b

export const SCHEDULE_PROVIDER_TYPE = Object.freeze({
  STATIC:       'STATIC',
  APP_CONFIG:   'APP_CONFIG',
  DATABASE:     'DATABASE',
  API:          'API',
  CALENDAR:     'CALENDAR',
  FIXTURE:      'FIXTURE',
});

// Base interface — all providers must implement these methods
function makeUnsupported(providerType, method) {
  return () => Object.freeze({ supported: false, providerType, method, isReal: false });
}

export function createStaticBusinessScheduleProvider(config = {}) {
  return Object.freeze({
    type:           SCHEDULE_PROVIDER_TYPE.STATIC,
    getOpeningHours: () => Object.freeze({ source: 'STATIC', hours: config.openingHours ?? {}, isReal: false }),
    getClosedDays:   () => Object.freeze({ source: 'STATIC', days: config.closedDays ?? [], isReal: false }),
    getSpecialClosures: () => Object.freeze({ source: 'STATIC', closures: config.specialClosures ?? [], isReal: false }),
    getAvailability: (slot) => Object.freeze({ source: 'STATIC', slot, available: config.availability?.[slot] ?? null, isReal: false }),
    getBookingRules: () => Object.freeze({ source: 'STATIC', rules: config.bookingRules ?? {}, isReal: false }),
    getCapacity:     () => Object.freeze({ source: 'STATIC', capacity: config.capacity ?? null, isReal: false }),
    isReal: false,
  });
}

export function createFixtureScheduleProvider(fixtures = {}) {
  return Object.freeze({
    type:            SCHEDULE_PROVIDER_TYPE.FIXTURE,
    getOpeningHours: () => Object.freeze({ source: 'FIXTURE', hours: fixtures.openingHours ?? {}, isReal: false }),
    getClosedDays:   () => Object.freeze({ source: 'FIXTURE', days: fixtures.closedDays ?? [], isReal: false }),
    getSpecialClosures: () => Object.freeze({ source: 'FIXTURE', closures: fixtures.specialClosures ?? [], isReal: false }),
    getAvailability: (slot) => Object.freeze({ source: 'FIXTURE', slot, available: fixtures.availability?.[slot] ?? null, isReal: false }),
    getBookingRules: () => Object.freeze({ source: 'FIXTURE', rules: fixtures.bookingRules ?? {}, isReal: false }),
    getCapacity:     () => Object.freeze({ source: 'FIXTURE', capacity: fixtures.capacity ?? null, isReal: false }),
    isReal: false,
  });
}

// Foundation stubs — no real calls
export const AppConfigScheduleProvider   = Object.freeze({ type: SCHEDULE_PROVIDER_TYPE.APP_CONFIG,  getOpeningHours: makeUnsupported('APP_CONFIG', 'getOpeningHours'),   getClosedDays: makeUnsupported('APP_CONFIG', 'getClosedDays'),   getSpecialClosures: makeUnsupported('APP_CONFIG', 'getSpecialClosures'),   getAvailability: makeUnsupported('APP_CONFIG', 'getAvailability'),   getBookingRules: makeUnsupported('APP_CONFIG', 'getBookingRules'),   getCapacity: makeUnsupported('APP_CONFIG', 'getCapacity'),   isReal: false });
export const DatabaseScheduleProvider    = Object.freeze({ type: SCHEDULE_PROVIDER_TYPE.DATABASE,    getOpeningHours: makeUnsupported('DATABASE', 'getOpeningHours'),      getClosedDays: makeUnsupported('DATABASE', 'getClosedDays'),      getSpecialClosures: makeUnsupported('DATABASE', 'getSpecialClosures'),      getAvailability: makeUnsupported('DATABASE', 'getAvailability'),      getBookingRules: makeUnsupported('DATABASE', 'getBookingRules'),      getCapacity: makeUnsupported('DATABASE', 'getCapacity'),      isReal: false });
export const ApiScheduleProvider         = Object.freeze({ type: SCHEDULE_PROVIDER_TYPE.API,         getOpeningHours: makeUnsupported('API', 'getOpeningHours'),            getClosedDays: makeUnsupported('API', 'getClosedDays'),            getSpecialClosures: makeUnsupported('API', 'getSpecialClosures'),            getAvailability: makeUnsupported('API', 'getAvailability'),            getBookingRules: makeUnsupported('API', 'getBookingRules'),            getCapacity: makeUnsupported('API', 'getCapacity'),            isReal: false });
export const CalendarScheduleProvider    = Object.freeze({ type: SCHEDULE_PROVIDER_TYPE.CALENDAR,    getOpeningHours: makeUnsupported('CALENDAR', 'getOpeningHours'),      getClosedDays: makeUnsupported('CALENDAR', 'getClosedDays'),      getSpecialClosures: makeUnsupported('CALENDAR', 'getSpecialClosures'),      getAvailability: makeUnsupported('CALENDAR', 'getAvailability'),      getBookingRules: makeUnsupported('CALENDAR', 'getBookingRules'),      getCapacity: makeUnsupported('CALENDAR', 'getCapacity'),      isReal: false });

export const BUSINESS_SCHEDULE_PROVIDER_VERSION = '1.0.0';
