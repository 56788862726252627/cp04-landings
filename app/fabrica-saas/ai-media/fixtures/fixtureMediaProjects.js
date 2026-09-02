// Fixture Media Projects — ADV-13

import { MEDIA_OBJECTIVE } from '../core/mediaObjective.js';
import { MEDIA_CHANNEL } from '../channel/mediaChannelProfile.js';
import { AVATAR_TYPE, AVATAR_STYLE, CONSENT_STATUS } from '../core/avatarProfile.js';
import { MEDIA_PROJECT_STATUS } from '../core/aiMediaProject.js';

const syntheticAvatar = Object.freeze({
  id: 'avatar_synthetic_01', type: AVATAR_TYPE.SYNTHETIC,
  style: AVATAR_STYLE.REALISTIC, consentStatus: CONSENT_STATUS.NOT_REQUIRED,
  isRealPerson: false, identityDisclosure: 'AI_GENERATED', isReal: false,
});

export const FIXTURE_PROJECT_PADEL_15S_REEL = Object.freeze({
  id: 'proj_pad_reel_15s', clientId: 'client_padel', businessId: 'biz_pad_01',
  vertical: 'PADEL_CLUB', objective: MEDIA_OBJECTIVE.BOOKING,
  channel: MEDIA_CHANNEL.INSTAGRAM_REEL, duration: 15,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_PROJECT_PADEL_30S_LANDING = Object.freeze({
  id: 'proj_pad_landing_30s', clientId: 'client_padel', businessId: 'biz_pad_01',
  vertical: 'PADEL_CLUB', objective: MEDIA_OBJECTIVE.LANDING_VIDEO,
  channel: MEDIA_CHANNEL.LANDING, duration: 30,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_PROJECT_PHYSIO_60S_FAQ = Object.freeze({
  id: 'proj_fis_faq_60s', clientId: 'client_physio', businessId: 'biz_fis_01',
  vertical: 'PHYSIOTHERAPY', objective: MEDIA_OBJECTIVE.FAQ,
  channel: MEDIA_CHANNEL.YOUTUBE_SHORT, duration: 60,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_PROJECT_LEGAL_30S_EXPLANATION = Object.freeze({
  id: 'proj_leg_explain_30s', clientId: 'client_legal', businessId: 'biz_leg_01',
  vertical: 'LEGAL', objective: MEDIA_OBJECTIVE.SERVICE_EXPLANATION,
  channel: MEDIA_CHANNEL.LINKEDIN, duration: 30,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_PROJECT_BEAUTY_15S_STORY = Object.freeze({
  id: 'proj_bty_story_15s', clientId: 'client_beauty', businessId: 'biz_bty_01',
  vertical: 'BEAUTY', objective: MEDIA_OBJECTIVE.SOCIAL_CONTENT,
  channel: MEDIA_CHANNEL.INSTAGRAM_STORY, duration: 15,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_PROJECT_EDU_90S_ONBOARDING = Object.freeze({
  id: 'proj_edu_onboard_90s', clientId: 'client_edu', businessId: 'biz_edu_01',
  vertical: 'EDUCATION', objective: MEDIA_OBJECTIVE.ONBOARDING,
  channel: MEDIA_CHANNEL.YOUTUBE, duration: 90,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_PROJECT_VET_30S_SOCIAL = Object.freeze({
  id: 'proj_vet_social_30s', clientId: 'client_vet', businessId: 'biz_vet_01',
  vertical: 'VETERINARY', objective: MEDIA_OBJECTIVE.BRAND_AWARENESS,
  channel: MEDIA_CHANNEL.FACEBOOK, duration: 30,
  avatarProfile: syntheticAvatar, status: MEDIA_PROJECT_STATUS.DRAFT, isReal: false,
});

export const FIXTURE_MEDIA_PROJECTS = Object.freeze([
  FIXTURE_PROJECT_PADEL_15S_REEL,
  FIXTURE_PROJECT_PADEL_30S_LANDING,
  FIXTURE_PROJECT_PHYSIO_60S_FAQ,
  FIXTURE_PROJECT_LEGAL_30S_EXPLANATION,
  FIXTURE_PROJECT_BEAUTY_15S_STORY,
  FIXTURE_PROJECT_EDU_90S_ONBOARDING,
  FIXTURE_PROJECT_VET_30S_SOCIAL,
]);
