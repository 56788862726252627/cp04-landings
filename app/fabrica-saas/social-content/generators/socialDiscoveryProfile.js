// Social Discovery Profile — SEO and discoverability for social content

export function createSocialDiscoveryProfile(config = {}) {
  if (!config.businessId) throw new Error('SocialDiscoveryProfile requires businessId');
  if (!config.channel)    throw new Error('SocialDiscoveryProfile requires channel');

  return Object.freeze({
    businessId:       config.businessId,
    channel:          config.channel,
    keywords:         Object.freeze(config.keywords ?? []),
    location:         config.location ?? null,
    audienceTags:     Object.freeze(config.audienceTags ?? []),
    contentLanguage:  config.contentLanguage ?? 'es',
    geoTargeting:     config.geoTargeting ?? null,
    noRealAdsTarget:  true,
    isReal:           false,
  });
}
