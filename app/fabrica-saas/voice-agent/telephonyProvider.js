// Telephony Provider — ADV-11
// Foundation stubs: Twilio/SIP/WebRTC — NO real calls (NO_REAL_CALLS=SI)

/* eslint-disable no-unused-vars */

export const TELEPHONY_PROVIDER_TYPE = Object.freeze({
  TWILIO: 'TWILIO',
  SIP:    'SIP',
  WEBRTC: 'WEBRTC',
});

export function createTwilioProviderStub(config = {}) {
  return Object.freeze({
    type:        TELEPHONY_PROVIDER_TYPE.TWILIO,
    configured:  false,
    noRealCalls: true,
    dial:        (to, from, options) => { throw new Error('Twilio not configured — NO_REAL_CALLS=SI'); },
    hangUp:      (callSid)           => { throw new Error('Twilio not configured — NO_REAL_CALLS=SI'); },
    isReal: false,
  });
}

export function createSIPProviderStub(config = {}) {
  return Object.freeze({
    type:        TELEPHONY_PROVIDER_TYPE.SIP,
    configured:  false,
    noRealCalls: true,
    dial:        (sipUri, options) => { throw new Error('SIP not configured — NO_REAL_CALLS=SI'); },
    isReal: false,
  });
}

export function createWebRTCProviderStub(config = {}) {
  return Object.freeze({
    type:        TELEPHONY_PROVIDER_TYPE.WEBRTC,
    configured:  false,
    noRealCalls: true,
    startSession:(sessionConfig) => { throw new Error('WebRTC not configured — NO_REAL_CALLS=SI'); },
    isReal: false,
  });
}

export const TELEPHONY_PROVIDER_VERSION = '1.0.0';
