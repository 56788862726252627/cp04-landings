// Media Provider Router — ADV-13

import { FixtureAvatarProvider } from '../providers/avatarVideoProvider.js';
import { FixtureLipSyncProvider } from '../providers/lipSyncProvider.js';

export const ROUTING_CRITERIA = Object.freeze({
  QUALITY:          'QUALITY',
  COST:             'COST',
  COMMERCIAL_RIGHTS:'COMMERCIAL_RIGHTS',
  LANGUAGE:         'LANGUAGE',
  AVATAR_SUPPORT:   'AVATAR_SUPPORT',
  VOICE_SUPPORT:    'VOICE_SUPPORT',
  LATENCY:          'LATENCY',
  PRIVACY:          'PRIVACY',
  FREE_TIER:        'FREE_TIER',
  AVAILABILITY:     'AVAILABILITY',
});

export function routeAvatarProvider(criteria = {}) {
  return Object.freeze({
    provider: FixtureAvatarProvider,
    reason:   'FIXTURE_SAFE_DEFAULT',
    isReal:   false,
  });
}

export function routeLipSyncProvider(criteria = {}) {
  return Object.freeze({
    provider: FixtureLipSyncProvider,
    reason:   'FIXTURE_SAFE_DEFAULT',
    isReal:   false,
  });
}

export const MEDIA_PROVIDER_ROUTER_VERSION = '1.0.0';
