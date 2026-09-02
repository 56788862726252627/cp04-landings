// Spanish Language Config — ADV-11 (es-ES optimization)

export const SPANISH_LANGUAGE_CONFIG = Object.freeze({
  locale:           'es-ES',
  voiceCode:        'es-ES',
  ttsVoiceId:       'es-ES-Standard',
  sttLanguage:      'es-ES',
  politeness:       'usted_or_tu',
  dateFormat:       'DD/MM/YYYY',
  timeFormat:       '24h',
  currencySymbol:   '€',
  decimalSeparator: ',',
  greetings: Object.freeze({
    morning:   'Buenos días',
    afternoon: 'Buenas tardes',
    evening:   'Buenas noches',
    neutral:   'Hola',
  }),
  fillerWords: Object.freeze(['pues', 'bueno', 'venga', 'claro', 'perfecto', 'exacto']),
  isReal: false,
});

export function getSpanishGreeting(hourUTC = 12) {
  if (hourUTC >= 6  && hourUTC < 13) return SPANISH_LANGUAGE_CONFIG.greetings.morning;
  if (hourUTC >= 13 && hourUTC < 20) return SPANISH_LANGUAGE_CONFIG.greetings.afternoon;
  return SPANISH_LANGUAGE_CONFIG.greetings.evening;
}

export const SPANISH_LANGUAGE_CONFIG_VERSION = '1.0.0';
