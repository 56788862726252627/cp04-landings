// Call Transcript Simulator — ADV-11

export function createSimulatedTurn(config = {}) {
  return Object.freeze({
    turnId:     config.turnId     ?? 0,
    speaker:    config.speaker    ?? 'USER',
    text:       config.text       ?? '',
    intent:     config.intent     ?? null,
    confidence: config.confidence ?? null,
    toolCall:   config.toolCall   ?? null,
    latencyMs:  config.latencyMs  ?? 0,
    isReal: false,
  });
}

export function buildSimulatedTranscript(turns = []) {
  return Object.freeze(turns.map((t, i) => createSimulatedTurn({ ...t, turnId: i })));
}

export function buildStandardBookingTranscript(businessName = 'Club Pádel 04') {
  return buildSimulatedTranscript([
    { speaker: 'AGENT', text: `Hola, llamas a ${businessName}. Soy el asistente de IA. ¿En qué te ayudo?`, intent: null, latencyMs: 200 },
    { speaker: 'USER',  text: 'Quiero reservar una pista para el martes.', intent: 'BOOKING', confidence: 0.9 },
    { speaker: 'AGENT', text: '¿A qué hora te viene mejor?', latencyMs: 350 },
    { speaker: 'USER',  text: 'A las 10 de la mañana.', intent: 'BOOKING', confidence: 0.95 },
    { speaker: 'AGENT', text: 'Un momento, compruebo disponibilidad…', toolCall: 'checkAvailability', latencyMs: 600 },
    { speaker: 'AGENT', text: 'Sí hay disponibilidad. ¿Me dices tu nombre?', latencyMs: 150 },
    { speaker: 'USER',  text: 'Ana García.', intent: 'BOOKING', confidence: 0.98 },
    { speaker: 'AGENT', text: '¿Y tu número de teléfono?', latencyMs: 120 },
    { speaker: 'USER',  text: '600 123 456.', intent: 'BOOKING', confidence: 0.97 },
    { speaker: 'AGENT', text: 'Pista reservada el martes a las 10 a nombre de Ana García. ¿Confirmas?', latencyMs: 200 },
    { speaker: 'USER',  text: 'Sí, perfecto.', intent: 'BOOKING', confidence: 0.99 },
    { speaker: 'AGENT', text: '¡Reserva confirmada! Hasta el martes.', latencyMs: 180 },
  ]);
}
