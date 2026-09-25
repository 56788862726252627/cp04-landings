// Business App Config Provider — ADV-10b
/* eslint-disable no-unused-vars */

export const BusinessAppConfigProvider = Object.freeze({
  type:        'APP_CONFIG',
  connected:   false,
  description: 'Foundation interface for reading business settings from the SaaS app config layer.',

  getBusinessSettings(_clientId = '') {
    return Object.freeze({ supported: false, note: 'App config provider not connected — foundation only', isReal: false });
  },
  getHours(_clientId = '') {
    return Object.freeze({ supported: false, isReal: false });
  },
  getServices(_clientId = '') {
    return Object.freeze({ supported: false, isReal: false });
  },
  getFacilities(_clientId = '') {
    return Object.freeze({ supported: false, isReal: false });
  },
  getPricing(_clientId = '') {
    return Object.freeze({ supported: false, isReal: false });
  },
  getPolicies(_clientId = '') {
    return Object.freeze({ supported: false, isReal: false });
  },
  isReal: false,
});

export const BUSINESS_APP_CONFIG_PROVIDER_VERSION = '1.0.0';
