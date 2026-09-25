// Social Channel Auth Status — tracks OAuth state per channel (no real OAuth)

export const CHANNEL_AUTH_STATUS = Object.freeze({
  CONNECTED:        'CONNECTED',
  NOT_CONNECTED:    'NOT_CONNECTED',
  REQUIRES_OAUTH:   'REQUIRES_OAUTH',
  EXPIRED:          'EXPIRED',
  BLOCKED:          'BLOCKED',
});

export function createChannelAuthStatus(config = {}) {
  if (!config.channel) throw new Error('ChannelAuthStatus requires channel');

  if (config.realOAuthToken) {
    throw new Error('CHANNEL_AUTH_SAFETY: real OAuth token must not be passed — use secretRef only');
  }

  return Object.freeze({
    channel:         config.channel,
    status:          config.status ?? CHANNEL_AUTH_STATUS.NOT_CONNECTED,
    secretRef:       config.secretRef ?? null,
    lastChecked:     config.lastChecked ?? null,
    noRealOAuth:     true,
    isReal:          false,
  });
}

export function evaluateChannelAuth(authStatus = {}) {
  const blockedStatuses = [CHANNEL_AUTH_STATUS.BLOCKED, CHANNEL_AUTH_STATUS.EXPIRED, CHANNEL_AUTH_STATUS.NOT_CONNECTED];
  const publishable = !blockedStatuses.includes(authStatus.status);

  return Object.freeze({
    channel:      authStatus.channel,
    status:       authStatus.status,
    publishable,
    requiresOAuth: authStatus.status === CHANNEL_AUTH_STATUS.REQUIRES_OAUTH,
    noRealPublish: true,
    isReal:        false,
  });
}

export function channelFallback(authStatuses = []) {
  const available  = authStatuses.filter(a => a.status === CHANNEL_AUTH_STATUS.CONNECTED);
  const unavailable = authStatuses.filter(a => a.status !== CHANNEL_AUTH_STATUS.CONNECTED);
  return Object.freeze({
    availableChannels:   Object.freeze(available.map(a => a.channel)),
    unavailableChannels: Object.freeze(unavailable.map(a => a.channel)),
    partialCampaignAllowed: available.length > 0,
    noRealPublish:       true,
    isReal:              false,
  });
}
