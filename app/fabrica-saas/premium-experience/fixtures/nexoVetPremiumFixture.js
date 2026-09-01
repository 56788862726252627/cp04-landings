// Nexo Vet Premium Fixture — ADV-07

export const NEXO_VET_PREMIUM = Object.freeze({
  appId:            'nexo-vet-premium',
  businessName:     'Clínica Veterinaria Nexo',
  vertical:         'veterinary',
  businessProfile:  'FAMILY_LOCAL',
  isFixture:        true,
  isReal:           false,
  port:             5181,
  htmlFile:         'nexoVetPremium.html',
  personality:      ['WARM', 'TRUSTED'],
  visualDensity:    'BALANCED',
  typographyProfile:'WARM_HUMANIST',
  surfaceProfile:   'WARM_LAYERED',
  primaryColor:     '#0d9488',
  accentColor:      '#f59e0b',
  mobilePattern:    'BOTTOM_NAV',
  heroPattern:      'LOCAL',
  routes: [
    { path: '/',          label: 'Inicio' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/reservar',  label: 'Reservar cita' },
    { path: '/contacto',  label: 'Contacto' },
  ],
  qaExpectations: {
    differentFrom: ['lexnova-legal', 'studio-aura-beauty'],
    expectedGrade: 'A',
    minScore:      90,
  },
});
