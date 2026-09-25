// Media Objective — ADV-13

export const MEDIA_OBJECTIVE = Object.freeze({
  BRAND_AWARENESS:        'BRAND_AWARENESS',
  LEAD_GENERATION:        'LEAD_GENERATION',
  BOOKING:                'BOOKING',
  SALES:                  'SALES',
  EDUCATION:              'EDUCATION',
  FAQ:                    'FAQ',
  ONBOARDING:             'ONBOARDING',
  TESTIMONIAL_STYLE_FIXTURE: 'TESTIMONIAL_STYLE_FIXTURE',
  PRODUCT_DEMO:           'PRODUCT_DEMO',
  SERVICE_EXPLANATION:    'SERVICE_EXPLANATION',
  SOCIAL_CONTENT:         'SOCIAL_CONTENT',
  LANDING_VIDEO:          'LANDING_VIDEO',
  ANNOUNCEMENT:           'ANNOUNCEMENT',
});

export const OBJECTIVE_META = Object.freeze({
  [MEDIA_OBJECTIVE.BRAND_AWARENESS]:     { primaryCTA: 'FOLLOW', minDuration: 15, maxDuration: 60 },
  [MEDIA_OBJECTIVE.LEAD_GENERATION]:     { primaryCTA: 'CONTACT', minDuration: 30, maxDuration: 90 },
  [MEDIA_OBJECTIVE.BOOKING]:             { primaryCTA: 'BOOK_NOW', minDuration: 15, maxDuration: 60 },
  [MEDIA_OBJECTIVE.SALES]:               { primaryCTA: 'BUY_NOW', minDuration: 30, maxDuration: 90 },
  [MEDIA_OBJECTIVE.EDUCATION]:           { primaryCTA: 'LEARN_MORE', minDuration: 60, maxDuration: 300 },
  [MEDIA_OBJECTIVE.FAQ]:                 { primaryCTA: 'SEE_MORE', minDuration: 30, maxDuration: 120 },
  [MEDIA_OBJECTIVE.ONBOARDING]:          { primaryCTA: 'GET_STARTED', minDuration: 60, maxDuration: 180 },
  [MEDIA_OBJECTIVE.TESTIMONIAL_STYLE_FIXTURE]: { primaryCTA: 'LEARN_MORE', minDuration: 30, maxDuration: 90, fixtureOnly: true },
  [MEDIA_OBJECTIVE.PRODUCT_DEMO]:        { primaryCTA: 'TRY_NOW', minDuration: 30, maxDuration: 120 },
  [MEDIA_OBJECTIVE.SERVICE_EXPLANATION]: { primaryCTA: 'CONTACT', minDuration: 30, maxDuration: 90 },
  [MEDIA_OBJECTIVE.SOCIAL_CONTENT]:      { primaryCTA: 'FOLLOW', minDuration: 15, maxDuration: 60 },
  [MEDIA_OBJECTIVE.LANDING_VIDEO]:       { primaryCTA: 'BOOK_NOW', minDuration: 30, maxDuration: 120 },
  [MEDIA_OBJECTIVE.ANNOUNCEMENT]:        { primaryCTA: 'LEARN_MORE', minDuration: 15, maxDuration: 30 },
});

export const MEDIA_OBJECTIVE_VERSION = '1.0.0';
