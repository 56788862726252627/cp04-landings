// Channel Profiles — ADV-03
// Adapta longitud, tono, ritmo y formato por canal.

export const CHANNEL_PROFILE = Object.freeze({
  WEB_CHAT:   'WEB_CHAT',
  WHATSAPP:   'WHATSAPP',
  EMAIL:      'EMAIL',
  SOCIAL_DM:  'SOCIAL_DM',
  VOICE:      'VOICE',
});

const PROFILES = Object.freeze({
  [CHANNEL_PROFILE.WEB_CHAT]: Object.freeze({
    maxWordsPerMessage:   120,
    preferredLength:      'SHORT',
    allowMarkdown:        true,
    allowLists:           true,
    ctaStyle:             'CONVERSATIONAL',
    formattingRules:      Object.freeze(['No headers in chat', 'Bold for key terms OK', 'Max 2 lists per session']),
    rhythm:               'NATURAL',
    emojiPolicy:          'SPARINGLY',
  }),
  [CHANNEL_PROFILE.WHATSAPP]: Object.freeze({
    maxWordsPerMessage:   60,
    preferredLength:      'VERY_SHORT',
    allowMarkdown:        false,
    allowLists:           false,
    ctaStyle:             'ONE_LINE',
    formattingRules:      Object.freeze(['No markdown', 'Plain text only', 'Short paragraphs']),
    rhythm:               'FAST',
    emojiPolicy:          'NONE',
  }),
  [CHANNEL_PROFILE.EMAIL]: Object.freeze({
    maxWordsPerMessage:   300,
    preferredLength:      'NORMAL',
    allowMarkdown:        true,
    allowLists:           true,
    ctaStyle:             'STRUCTURED',
    formattingRules:      Object.freeze(['Opening greeting OK', 'Subject line required', 'Sign-off required']),
    rhythm:               'FORMAL',
    emojiPolicy:          'NONE',
  }),
  [CHANNEL_PROFILE.SOCIAL_DM]: Object.freeze({
    maxWordsPerMessage:   50,
    preferredLength:      'VERY_SHORT',
    allowMarkdown:        false,
    allowLists:           false,
    ctaStyle:             'FRIENDLY_ONE_LINE',
    formattingRules:      Object.freeze(['Informal OK', 'No corporate speak']),
    rhythm:               'FAST',
    emojiPolicy:          'OK',
  }),
  [CHANNEL_PROFILE.VOICE]: Object.freeze({
    maxWordsPerMessage:   30,
    preferredLength:      'VERY_SHORT',
    allowMarkdown:        false,
    allowLists:           false,
    ctaStyle:             'SPOKEN_NATURAL',
    formattingRules:      Object.freeze(['No text formatting', 'Short spoken sentences', 'One question at a time', 'No numbers read digit-by-digit']),
    rhythm:               'CONVERSATIONAL_SPOKEN',
    emojiPolicy:          'NONE',
  }),
});

/**
 * Get the channel profile for adaptation.
 */
export function getChannelProfile(channel = 'WEB_CHAT') {
  const key = channel?.toUpperCase() ?? 'WEB_CHAT';
  if (!PROFILES[key]) {
    return { valid: false, error: `Unknown channel: ${channel}`, profile: PROFILES[CHANNEL_PROFILE.WEB_CHAT] };
  }
  return { valid: true, channel: key, profile: PROFILES[key] };
}

/**
 * Adapt a response guidance based on channel constraints.
 */
export function adaptForChannel(baseGuidance = {}, channel = 'WEB_CHAT') {
  const { profile } = getChannelProfile(channel);
  return Object.freeze({
    ...baseGuidance,
    maxWords:    profile.maxWordsPerMessage,
    length:      profile.preferredLength,
    formatting:  profile.formattingRules,
    ctaStyle:    profile.ctaStyle,
    channel,
  });
}

export const CHANNEL_PROFILES_VERSION = '1.0.0';
