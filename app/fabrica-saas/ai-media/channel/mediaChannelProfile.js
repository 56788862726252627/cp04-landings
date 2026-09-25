// Media Channel Profile — ADV-13

export const MEDIA_CHANNEL = Object.freeze({
  TIKTOK:           'TIKTOK',
  INSTAGRAM_REEL:   'INSTAGRAM_REEL',
  INSTAGRAM_STORY:  'INSTAGRAM_STORY',
  FACEBOOK:         'FACEBOOK',
  YOUTUBE_SHORT:    'YOUTUBE_SHORT',
  YOUTUBE:          'YOUTUBE',
  LINKEDIN:         'LINKEDIN',
  X:                'X',
  LANDING:          'LANDING',
  EMAIL_EMBED:      'EMAIL_EMBED',
  INTERNAL:         'INTERNAL',
});

export const CHANNEL_META = Object.freeze({
  [MEDIA_CHANNEL.TIKTOK]:          { aspectRatio: '9:16', maxDuration: 60,  socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.INSTAGRAM_REEL]:  { aspectRatio: '9:16', maxDuration: 90,  socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.INSTAGRAM_STORY]: { aspectRatio: '9:16', maxDuration: 15,  socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.FACEBOOK]:        { aspectRatio: '16:9', maxDuration: 240, socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.YOUTUBE_SHORT]:   { aspectRatio: '9:16', maxDuration: 60,  socialPublish: true,  adCapable: false },
  [MEDIA_CHANNEL.YOUTUBE]:         { aspectRatio: '16:9', maxDuration: 600, socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.LINKEDIN]:        { aspectRatio: '16:9', maxDuration: 600, socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.X]:               { aspectRatio: '16:9', maxDuration: 140, socialPublish: true,  adCapable: true },
  [MEDIA_CHANNEL.LANDING]:         { aspectRatio: '16:9', maxDuration: 300, socialPublish: false, adCapable: false },
  [MEDIA_CHANNEL.EMAIL_EMBED]:     { aspectRatio: '16:9', maxDuration: 60,  socialPublish: false, adCapable: false },
  [MEDIA_CHANNEL.INTERNAL]:        { aspectRatio: '16:9', maxDuration: 600, socialPublish: false, adCapable: false },
});

export function getChannelProfile(channel) {
  const meta = CHANNEL_META[channel];
  if (!meta) throw new Error(`Unknown channel: ${channel}`);
  return Object.freeze({ channel, ...meta, isReal: false });
}

export const MEDIA_CHANNEL_PROFILE_VERSION = '1.0.0';
