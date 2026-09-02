// Business Data Provider — DB foundation — ADV-10b

export const BusinessDataProvider = Object.freeze({
  type:        'BUSINESS_DATABASE',
  connected:   false,
  description: 'Reusable foundation for Supabase/Postgres or future DB. No real connection required now.',

  query(_table = '', _filters = {}) {
    return Object.freeze({ supported: false, note: 'DB provider not connected — foundation only', isReal: false });
  },
  getBusinessFacts(_clientId = '') {
    return Object.freeze({ supported: false, facts: [], isReal: false });
  },
  getAvailability(_clientId = '', _slot = '') {
    return Object.freeze({ supported: false, isReal: false });
  },
  isReal: false,
});

export const BUSINESS_DATA_PROVIDER_VERSION = '1.0.0';
