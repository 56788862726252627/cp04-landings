// Anti-Paragraph Gate — ADV-03
// Detecta respuestas desproporcionadas. Sin LLM.

export const AUDIT_FLAG = Object.freeze({
  RESPONSE_TOO_LONG:    'RESPONSE_TOO_LONG',
  TOO_MANY_PARAGRAPHS:  'TOO_MANY_PARAGRAPHS',
  REPETITIVE_CTA:       'REPETITIVE_CTA',
  UNNECESSARY_LIST:     'UNNECESSARY_LIST',
  REPETITIVE_CONTENT:   'REPETITIVE_CONTENT',
  OVER_EXPLANATION:     'OVER_EXPLANATION',
});

/**
 * Audit a response for disproportionate length, repetition, or excessive structure.
 *
 * params: {
 *   response:   string
 *   maxWords:   number
 *   channel:    string
 * }
 */
export function auditResponseLength(params = {}) {
  const {
    response  = '',
    maxWords  = 120,
    channel   = 'WEB_CHAT',
  } = params;

  if (!response || typeof response !== 'string') {
    return { valid: false, error: 'response must be a non-empty string', flags: [] };
  }

  const flags   = [];
  const wordCount    = countWords(response);
  const paragraphs   = splitParagraphs(response);
  const sentences    = splitSentences(response);

  // 1. Word count check
  if (wordCount > maxWords) {
    flags.push(flag(AUDIT_FLAG.RESPONSE_TOO_LONG, `${wordCount}w exceeds ${maxWords}w limit`));
  }

  // 2. Paragraph count (voice/WhatsApp: 1 max, web: 3 max)
  const maxParagraphs = channel === 'VOICE' ? 1 : channel === 'WHATSAPP' ? 1 : 3;
  if (paragraphs.length > maxParagraphs) {
    flags.push(flag(AUDIT_FLAG.TOO_MANY_PARAGRAPHS, `${paragraphs.length} paragraphs (max ${maxParagraphs} for ${channel})`));
  }

  // 3. Repetitive CTA
  const ctaPatterns = ['si quieres', 'cuando quieras', 'reserva', '¿te gustaría', 'podemos ver'];
  const ctaCount = ctaPatterns.reduce((n, p) => n + countOccurrences(response.toLowerCase(), p), 0);
  if (ctaCount >= 2) {
    flags.push(flag(AUDIT_FLAG.REPETITIVE_CTA, `CTA phrase appears ${ctaCount} times`));
  }

  // 4. Unnecessary list (markdown bullets in short responses)
  const bulletCount = (response.match(/^[-*•]\s/gm) ?? []).length;
  if (bulletCount > 0 && (channel === 'WHATSAPP' || channel === 'VOICE')) {
    flags.push(flag(AUDIT_FLAG.UNNECESSARY_LIST, `${bulletCount} list items in ${channel} (not supported)`));
  }
  if (bulletCount > 5 && wordCount < 100) {
    flags.push(flag(AUDIT_FLAG.UNNECESSARY_LIST, `${bulletCount} list items for a short response`));
  }

  // 5. Repetitive content (same phrase appearing 3+ times)
  const phrases = sentences.map(s => s.trim().toLowerCase()).filter(s => s.length > 10);
  const seenPhrases = new Map();
  for (const phrase of phrases) {
    seenPhrases.set(phrase, (seenPhrases.get(phrase) ?? 0) + 1);
  }
  const repeated = [...seenPhrases.entries()].filter(([, count]) => count >= 2);
  if (repeated.length > 0) {
    flags.push(flag(AUDIT_FLAG.REPETITIVE_CONTENT, `${repeated.length} repeated phrases`));
  }

  // 6. Over-explanation (wordCount >> complexity)
  if (wordCount > maxWords * 1.5 && sentences.length > 6) {
    flags.push(flag(AUDIT_FLAG.OVER_EXPLANATION, `Response too verbose: ${wordCount}w, ${sentences.length} sentences`));
  }

  const passed = flags.length === 0;
  return Object.freeze({
    valid:     true,
    passed,
    flags:     Object.freeze(flags),
    wordCount,
    paragraphCount: paragraphs.length,
    bulletCount,
    maxWords,
    channel,
  });
}

function flag(type, message) {
  return Object.freeze({ type, message });
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function splitParagraphs(text) {
  return text.split(/\n{2,}/).filter(p => p.trim().length > 0);
}

function splitSentences(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
}

function countOccurrences(text, pattern) {
  let count = 0;
  let idx = text.indexOf(pattern);
  while (idx !== -1) {
    count++;
    idx = text.indexOf(pattern, idx + 1);
  }
  return count;
}

export const ANTI_PARAGRAPH_GATE_VERSION = '1.0.0';
