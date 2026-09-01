// Studio Aura Beauty Fixture — ADV-07

export const STUDIO_AURA_BEAUTY = Object.freeze({
  appId:            'studio-aura-beauty',
  businessName:     'Studio Aura',
  vertical:         'beauty',
  businessProfile:  'BOUTIQUE',
  isFixture:        true,
  isReal:           false,
  port:             5181,
  htmlFile:         'studioAura.html',
  personality:      ['PREMIUM', 'LUXURY'],
  visualDensity:    'SPACIOUS',
  typographyProfile:'ELEGANT_DISPLAY',
  surfaceProfile:   'PREMIUM_GLASS',
  primaryColor:     '#d97706',
  accentColor:      '#f43f5e',
  mobilePattern:    'BOTTOM_NAV',
  heroPattern:      'PREMIUM',
  routes: [
    { path: '/',          label: 'Inicio' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/reservar',  label: 'Reservar' },
    { path: '/galeria',   label: 'Galería' },
  ],
  qaExpectations: {
    differentFrom: ['nexo-vet-premium', 'lexnova-legal'],
    expectedGrade: 'A',
    minScore:      90,
  },
});
