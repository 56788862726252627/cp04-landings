// CP04 Compatibility Adapter Foundation — ADV-10b
// Preparado para conexión futura de Club Pádel 04. NO toca CP04 ahora.

import { createStaticBusinessScheduleProvider } from './businessScheduleProvider.js';

// Foundation adapter — wires up to BusinessScheduleProvider interface
// When CP04 is ready, replace static config with real API/DB calls.
export function createCP04ScheduleCompatAdapter(cp04Config = {}) {
  // All values default to UNKNOWN until real config is wired
  const staticConfig = {
    openingHours:    cp04Config.openingHours    ?? {},
    closedDays:      cp04Config.closedDays      ?? [],
    specialClosures: cp04Config.specialClosures ?? [],
    bookingRules:    cp04Config.bookingRules    ?? {},
    capacity:        cp04Config.capacity        ?? null,
    availability:    cp04Config.availability    ?? {},
  };

  const provider = createStaticBusinessScheduleProvider(staticConfig);

  return Object.freeze({
    clientId:       'cp04',
    providerType:   'CP04_COMPAT',
    connected:      false,             // false until real API is wired
    note:           'Foundation only — CP04 not connected. Replace with real API adapter when ready.',
    // Exposed bindings
    getOpeningHours:    () => provider.getOpeningHours(),
    getClosedDays:      () => provider.getClosedDays(),
    getSpecialClosures: () => provider.getSpecialClosures(),
    getAvailability:    (slot) => provider.getAvailability(slot),
    getBookingRules:    () => provider.getBookingRules(),
    getCapacity:        () => provider.getCapacity(),
    isReal: false,
  });
}

export const CP04ScheduleCompatAdapter = createCP04ScheduleCompatAdapter({});
export const CP04_COMPAT_ADAPTER_VERSION = '1.0.0';
