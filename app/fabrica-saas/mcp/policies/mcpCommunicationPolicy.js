// MCP Communication Policy — ADV-12

export const COMM_CHANNEL = Object.freeze({
  EMAIL:     'EMAIL',
  SMS:       'SMS',
  WHATSAPP:  'WHATSAPP',
  SLACK:     'SLACK',
  PUSH:      'PUSH',
  WEBHOOK:   'WEBHOOK',
});

const CHANNELS_REQUIRING_APPROVAL = new Set([COMM_CHANNEL.EMAIL, COMM_CHANNEL.SMS, COMM_CHANNEL.WHATSAPP]);

export function checkCommunicationPermission(channel, options = {}) {
  if (CHANNELS_REQUIRING_APPROVAL.has(channel) && !options.approvedByHuman) {
    return Object.freeze({ allowed: false, reason: 'OUTBOUND_COMMUNICATION_REQUIRES_APPROVAL', channel, isReal: false });
  }
  if (options.simulationOnly) {
    return Object.freeze({ allowed: false, reason: 'SIMULATION_ONLY', channel, noRealExternalWrite: true, isReal: false });
  }
  return Object.freeze({ allowed: true, channel, isReal: false });
}

export const MCP_COMMUNICATION_POLICY_VERSION = '1.0.0';
