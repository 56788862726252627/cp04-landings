// LexNova Legal Fixture — ADV-07

export const LEXNOVA_LEGAL = Object.freeze({
  appId:            'lexnova-legal',
  businessName:     'LexNova Abogados',
  vertical:         'legal',
  businessProfile:  'SPECIALIST',
  isFixture:        true,
  isReal:           false,
  port:             5181,
  htmlFile:         'lexNova.html',
  personality:      ['PROFESSIONAL', 'TRUSTED'],
  visualDensity:    'COMPACT',
  typographyProfile:'SERIF_AUTHORITY',
  surfaceProfile:   'NEUTRAL_MINIMAL',
  primaryColor:     '#1e293b',
  accentColor:      '#64748b',
  mobilePattern:    'DRAWER',
  heroPattern:      null,
  routes: [
    { path: '/',              label: 'Inicio' },
    { path: '/areas-practica',label: 'Áreas de práctica' },
    { path: '/equipo',        label: 'El equipo' },
    { path: '/contacto',      label: 'Contacto' },
  ],
  qaExpectations: {
    differentFrom: ['nexo-vet-premium', 'studio-aura-beauty'],
    expectedGrade: 'A',
    minScore:      90,
  },
});
