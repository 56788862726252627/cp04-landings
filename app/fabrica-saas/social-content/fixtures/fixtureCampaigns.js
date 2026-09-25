// Fixture Campaigns — 20+ campaign fixtures for testing

const makeCampaign = (id, businessId, clientId, name, objective, type, channels, durationWeeks, postsPlanned) =>
  Object.freeze({ id, businessId, clientId, name, objective, type, channels: Object.freeze(channels), durationWeeks, postsPlanned, status: 'PLANNING', adsBlocked: true, noRealPublish: true, isReal: false });

export const CAMPAIGN_PADEL_BRAND_LAUNCH = makeCampaign('camp_padel_01', 'biz_padel_cp04', 'client_cp04', 'Lanzamiento Marca CP04', 'BRAND_AWARENESS', 'LAUNCH', ['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'FACEBOOK'], 4, 16);
export const CAMPAIGN_PADEL_BOOKING_Q1   = makeCampaign('camp_padel_02', 'biz_padel_cp04', 'client_cp04', 'Reservas Q1', 'BOOKING_CONVERSION', 'SEASONAL', ['INSTAGRAM_REEL', 'FACEBOOK'], 6, 24);
export const CAMPAIGN_PADEL_COMMUNITY    = makeCampaign('camp_padel_03', 'biz_padel_cp04', 'client_cp04', 'Comunidad Pádel', 'COMMUNITY_BUILDING', 'COMMUNITY', ['INSTAGRAM_REEL', 'INSTAGRAM_STORY'], 8, 32);
export const CAMPAIGN_PADEL_SUMMER       = makeCampaign('camp_padel_04', 'biz_padel_cp04', 'client_cp04', 'Verano Activo', 'SEASONAL_PROMOTION', 'SEASONAL', ['INSTAGRAM_REEL', 'TIKTOK'], 6, 30);
export const CAMPAIGN_PADEL_RETENTION    = makeCampaign('camp_padel_05', 'biz_padel_cp04', 'client_cp04', 'Fidelización Socios', 'RETENTION', 'RETENTION', ['FACEBOOK', 'INSTAGRAM_STORY'], 12, 36);

export const CAMPAIGN_FISIO_EDUCATION    = makeCampaign('camp_fisio_01', 'biz_fisio_nova', 'client_fisionova', 'Educación Salud', 'EDUCATION', 'ORGANIC_ONLY', ['INSTAGRAM_REEL', 'FACEBOOK', 'LINKEDIN'], 8, 32);
export const CAMPAIGN_FISIO_PROOF        = makeCampaign('camp_fisio_02', 'biz_fisio_nova', 'client_fisionova', 'Casos de Éxito', 'SOCIAL_PROOF', 'ORGANIC_ONLY', ['INSTAGRAM_REEL', 'FACEBOOK'], 4, 12);
export const CAMPAIGN_FISIO_LEAD         = makeCampaign('camp_fisio_03', 'biz_fisio_nova', 'client_fisionova', 'Captación Pacientes', 'LEAD_GENERATION', 'ORGANIC_ONLY', ['INSTAGRAM_REEL', 'LINKEDIN'], 6, 24);

export const CAMPAIGN_EDUCA_AWARENESS    = makeCampaign('camp_educa_01', 'biz_educa_archidona', 'client_educa', 'Conoce Educa', 'BRAND_AWARENESS', 'LAUNCH', ['FACEBOOK', 'INSTAGRAM_REEL'], 4, 12);
export const CAMPAIGN_EDUCA_ENROLLMENT   = makeCampaign('camp_educa_02', 'biz_educa_archidona', 'client_educa', 'Matrícula Septiembre', 'BOOKING_CONVERSION', 'SEASONAL', ['FACEBOOK', 'INSTAGRAM_STORY'], 6, 18);

export const CAMPAIGN_CLINICA_AWARENESS  = makeCampaign('camp_clin_01', 'biz_clinica_salud', 'client_clinica', 'Marca Clínica', 'BRAND_AWARENESS', 'ORGANIC_ONLY', ['FACEBOOK', 'INSTAGRAM_REEL'], 8, 24);
export const CAMPAIGN_CLINICA_TRUST      = makeCampaign('camp_clin_02', 'biz_clinica_salud', 'client_clinica', 'Confianza y Profesionalidad', 'SOCIAL_PROOF', 'ORGANIC_ONLY', ['FACEBOOK', 'LINKEDIN'], 4, 12);

export const CAMPAIGN_REST_LAUNCH        = makeCampaign('camp_rest_01', 'biz_rest_flores', 'client_rest', 'Apertura Las Flores', 'LAUNCH', 'LAUNCH', ['INSTAGRAM_REEL', 'FACEBOOK', 'TIKTOK'], 2, 14);
export const CAMPAIGN_REST_SEASONAL      = makeCampaign('camp_rest_02', 'biz_rest_flores', 'client_rest', 'Menú Navidad', 'SEASONAL_PROMOTION', 'SEASONAL', ['INSTAGRAM_REEL', 'FACEBOOK'], 4, 20);
export const CAMPAIGN_REST_COMMUNITY     = makeCampaign('camp_rest_03', 'biz_rest_flores', 'client_rest', 'Comunidad Foodie', 'COMMUNITY_BUILDING', 'COMMUNITY', ['INSTAGRAM_REEL', 'TIKTOK'], 8, 40);

export const CAMPAIGN_GYM_LAUNCH         = makeCampaign('camp_gym_01', 'biz_gym_elite', 'client_gym', 'Apertura Gym Elite', 'LAUNCH', 'LAUNCH', ['INSTAGRAM_REEL', 'TIKTOK', 'YOUTUBE_SHORT'], 4, 28);
export const CAMPAIGN_GYM_RETENTION      = makeCampaign('camp_gym_02', 'biz_gym_elite', 'client_gym', 'Reto Enero', 'RETENTION', 'SEASONAL', ['INSTAGRAM_REEL', 'TIKTOK'], 4, 20);
export const CAMPAIGN_GYM_COMMUNITY      = makeCampaign('camp_gym_03', 'biz_gym_elite', 'client_gym', 'Squad Elite', 'COMMUNITY_BUILDING', 'COMMUNITY', ['INSTAGRAM_REEL', 'YOUTUBE_SHORT'], 12, 48);

export const CAMPAIGN_MODA_LAUNCH        = makeCampaign('camp_moda_01', 'biz_moda_sur', 'client_moda', 'Nueva Colección Otoño', 'LAUNCH', 'LAUNCH', ['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'THREADS'], 4, 20);
export const CAMPAIGN_MODA_SEASONAL      = makeCampaign('camp_moda_02', 'biz_moda_sur', 'client_moda', 'Rebajas Verano', 'SEASONAL_PROMOTION', 'SEASONAL', ['INSTAGRAM_REEL', 'INSTAGRAM_STORY'], 2, 10);

export const ALL_FIXTURE_CAMPAIGNS = Object.freeze([
  CAMPAIGN_PADEL_BRAND_LAUNCH, CAMPAIGN_PADEL_BOOKING_Q1, CAMPAIGN_PADEL_COMMUNITY,
  CAMPAIGN_PADEL_SUMMER, CAMPAIGN_PADEL_RETENTION,
  CAMPAIGN_FISIO_EDUCATION, CAMPAIGN_FISIO_PROOF, CAMPAIGN_FISIO_LEAD,
  CAMPAIGN_EDUCA_AWARENESS, CAMPAIGN_EDUCA_ENROLLMENT,
  CAMPAIGN_CLINICA_AWARENESS, CAMPAIGN_CLINICA_TRUST,
  CAMPAIGN_REST_LAUNCH, CAMPAIGN_REST_SEASONAL, CAMPAIGN_REST_COMMUNITY,
  CAMPAIGN_GYM_LAUNCH, CAMPAIGN_GYM_RETENTION, CAMPAIGN_GYM_COMMUNITY,
  CAMPAIGN_MODA_LAUNCH, CAMPAIGN_MODA_SEASONAL,
]);
