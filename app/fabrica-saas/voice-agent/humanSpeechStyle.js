// Human Speech Style — ADV-11

export const SPEECH_ANTI_PATTERNS = Object.freeze([
  'robotic_opener',         // "Hola, soy el asistente virtual de..."
  'corporate_phrase',       // "Estamos aquí para ayudarle en todo lo que necesite"
  'excessive_enthusiasm',   // "¡Por supuesto! ¡Claro que sí! ¡Encantado!"
  'unnatural_enumeration',  // "Tenemos: uno, dos, tres opciones..."
  'name_overuse',           // Usar el nombre del usuario cada frase
  'long_monologue',         // Párrafos hablados de más de 3 frases
  'chatbot_template',       // "Su consulta ha sido registrada correctamente"
  'over_formal',            // "¿En qué puedo asistirle hoy?"
  'false_doubt',            // "Ehhh... a ver... pues..."
  'repeated_filler',        // "Vale, vale, vale"
]);

export const SPEECH_GOOD_PATTERNS = Object.freeze([
  'brief_response',         // 1-2 frases naturales
  'natural_confirmation',   // "Perfecto.", "Entendido."
  'empathetic_response',    // "Entiendo que es molesto."
  'natural_transition',     // "Y ¿cuándo te vendría bien?"
  'honest_uncertainty',     // "Un momento, lo miro."
  'natural_reformulation',  // Parafrasear para confirmar
  'context_continuity',     // Recordar lo dicho antes sin repetirlo
  'direct_answer',          // Responder la pregunta directamente
]);

export const MAX_VOICE_RESPONSE_WORDS = Object.freeze({
  SIMPLE:  15,
  NORMAL:  30,
  COMPLEX: 50,
  NEVER:  100,
});

export function evaluateSpeechNaturalness(text = '') {
  const words = text.split(/\s+/).filter(Boolean).length;
  const issues = [];

  if (words > MAX_VOICE_RESPONSE_WORDS.COMPLEX) {
    issues.push({ type: 'long_monologue', severity: 'HIGH' });
  }
  if (/estamos aquí para ayudarle/i.test(text)) {
    issues.push({ type: 'corporate_phrase', severity: 'MEDIUM' });
  }
  if (/por supuesto.*claro.*encantado/i.test(text)) {
    issues.push({ type: 'excessive_enthusiasm', severity: 'MEDIUM' });
  }
  if (/uno[,.]?\s+dos[,.]?\s+tres/i.test(text)) {
    issues.push({ type: 'unnatural_enumeration', severity: 'LOW' });
  }
  if (/su consulta ha sido/i.test(text)) {
    issues.push({ type: 'chatbot_template', severity: 'HIGH' });
  }

  const score = Math.max(0, 100 - issues.length * 20);
  return Object.freeze({ score, issues: Object.freeze(issues), wordCount: words, isReal: false });
}

export function isTooLongForVoice(text = '', complexity = 'NORMAL') {
  const words = text.split(/\s+/).filter(Boolean).length;
  const max   = MAX_VOICE_RESPONSE_WORDS[complexity] ?? MAX_VOICE_RESPONSE_WORDS.NORMAL;
  return words > max;
}

export const HUMAN_SPEECH_STYLE_VERSION = '1.0.0';
