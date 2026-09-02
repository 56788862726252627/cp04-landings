// Content Repurposing — transforms a post for multiple channels

import { adaptForInstagramReel, adaptForInstagramStory } from '../platforms/instagramAdapter.js';
import { adaptForFacebook }    from '../platforms/facebookAdapter.js';
import { adaptForTikTok }      from '../platforms/tiktokAdapter.js';
import { adaptForLinkedIn }    from '../platforms/linkedinAdapter.js';
import { adaptForX }           from '../platforms/xAdapter.js';
import { adaptForThreads }     from '../platforms/threadsAdapter.js';

const CHANNEL_ADAPTER_MAP = Object.freeze({
  INSTAGRAM_REEL:  adaptForInstagramReel,
  INSTAGRAM_STORY: adaptForInstagramStory,
  FACEBOOK:        adaptForFacebook,
  TIKTOK:          adaptForTikTok,
  LINKEDIN:        adaptForLinkedIn,
  X:               adaptForX,
  THREADS:         adaptForThreads,
});

export function repurposeContent(post = {}, targetChannels = []) {
  if (!post.fullText) throw new Error('repurposeContent requires post with fullText');
  if (!post.businessId) throw new Error('repurposeContent requires businessId');
  if (!post.clientId)   throw new Error('repurposeContent requires clientId');
  if (targetChannels.length === 0) throw new Error('repurposeContent requires at least one targetChannel');

  const adaptations = [];
  const unsupported = [];

  for (const channel of targetChannels) {
    const adapter = CHANNEL_ADAPTER_MAP[channel];
    if (!adapter) { unsupported.push(channel); continue; }
    adaptations.push(adapter(post));
  }

  return Object.freeze({
    sourceBusinessId: post.businessId,
    sourceClientId:   post.clientId,
    adaptations:      Object.freeze(adaptations),
    unsupportedChannels: Object.freeze(unsupported),
    noRealPublish:    true,
    isReal:           false,
  });
}
