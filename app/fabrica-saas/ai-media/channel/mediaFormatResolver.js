// Media Format Resolver — ADV-13

import { CHANNEL_META } from './mediaChannelProfile.js';

export const MEDIA_FORMAT = Object.freeze({
  VERTICAL_9_16:  'VERTICAL_9_16',
  HORIZONTAL_16_9:'HORIZONTAL_16_9',
  SQUARE_1_1:     'SQUARE_1_1',
});

const ASPECT_TO_FORMAT = Object.freeze({
  '9:16':  MEDIA_FORMAT.VERTICAL_9_16,
  '16:9':  MEDIA_FORMAT.HORIZONTAL_16_9,
  '1:1':   MEDIA_FORMAT.SQUARE_1_1,
});

export function resolveMediaFormat(channel) {
  const meta = CHANNEL_META[channel];
  if (!meta) throw new Error(`Unknown channel: ${channel}`);
  const format = ASPECT_TO_FORMAT[meta.aspectRatio] ?? MEDIA_FORMAT.HORIZONTAL_16_9;
  return Object.freeze({ channel, aspectRatio: meta.aspectRatio, format, isReal: false });
}

export const MEDIA_FORMAT_RESOLVER_VERSION = '1.0.0';
