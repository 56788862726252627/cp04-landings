// Fixture Businesses for Social Content Engine — reuses ADV-13 profiles, extended

export const FIXTURE_PADEL_CLUB = Object.freeze({
  businessId: 'biz_padel_cp04',
  clientId:   'client_cp04',
  name:       'Club Pádel 04',
  sector:     'padel',
  city:       'Archidona',
  preferredChannels: ['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'FACEBOOK'],
  maturity:   'GROWING',
  isReal:     false,
});

export const FIXTURE_FISIONOVA = Object.freeze({
  businessId: 'biz_fisio_nova',
  clientId:   'client_fisionova',
  name:       'FisioNova',
  sector:     'fisioterapia',
  city:       'Málaga',
  preferredChannels: ['INSTAGRAM_REEL', 'FACEBOOK', 'LINKEDIN'],
  maturity:   'ESTABLISHED',
  isReal:     false,
});

export const FIXTURE_EDUCA_ARCHIDONA = Object.freeze({
  businessId: 'biz_educa_archidona',
  clientId:   'client_educa',
  name:       'Educa Archidona',
  sector:     'educacion',
  city:       'Archidona',
  preferredChannels: ['FACEBOOK', 'INSTAGRAM_REEL'],
  maturity:   'SEED',
  isReal:     false,
});

export const FIXTURE_CLINICA_SALUD = Object.freeze({
  businessId: 'biz_clinica_salud',
  clientId:   'client_clinica',
  name:       'Clínica Salud Plus',
  sector:     'clinica',
  city:       'Antequera',
  preferredChannels: ['FACEBOOK', 'INSTAGRAM_REEL'],
  maturity:   'ESTABLISHED',
  isReal:     false,
});

export const FIXTURE_RESTAURANTE_LAS_FLORES = Object.freeze({
  businessId: 'biz_rest_flores',
  clientId:   'client_rest',
  name:       'Restaurante Las Flores',
  sector:     'restaurante',
  city:       'Archidona',
  preferredChannels: ['INSTAGRAM_REEL', 'FACEBOOK', 'TIKTOK'],
  maturity:   'GROWING',
  isReal:     false,
});

export const FIXTURE_GYM_ELITE = Object.freeze({
  businessId: 'biz_gym_elite',
  clientId:   'client_gym',
  name:       'Gym Elite',
  sector:     'gimnasio',
  city:       'Málaga',
  preferredChannels: ['INSTAGRAM_REEL', 'TIKTOK', 'YOUTUBE_SHORT'],
  maturity:   'GROWING',
  isReal:     false,
});

export const FIXTURE_RETAIL_MODA = Object.freeze({
  businessId: 'biz_moda_sur',
  clientId:   'client_moda',
  name:       'Moda Sur',
  sector:     'retail',
  city:       'Málaga',
  preferredChannels: ['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'THREADS'],
  maturity:   'SEED',
  isReal:     false,
});

export const ALL_FIXTURE_BUSINESSES = Object.freeze([
  FIXTURE_PADEL_CLUB,
  FIXTURE_FISIONOVA,
  FIXTURE_EDUCA_ARCHIDONA,
  FIXTURE_CLINICA_SALUD,
  FIXTURE_RESTAURANTE_LAS_FLORES,
  FIXTURE_GYM_ELITE,
  FIXTURE_RETAIL_MODA,
]);
