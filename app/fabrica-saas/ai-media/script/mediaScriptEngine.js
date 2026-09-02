// Media Script Engine — ADV-13

export const SCRIPT_SECTION = Object.freeze({
  HOOK:  'HOOK',
  VALUE: 'VALUE',
  PROOF: 'PROOF',
  CTA:   'CTA',
});

export function generateMediaScript(config = {}) {
  if (!config.objective) throw new Error('generateMediaScript requires objective');
  if (!config.business)  throw new Error('generateMediaScript requires business');
  const businessName = config.business.name ?? 'el negocio';
  const cta          = config.cta ?? 'Reserva ahora';
  const hook         = config.hook  ?? `Descubre ${businessName}`;
  const value        = config.value ?? `Ofrecemos servicios de calidad para ti`;
  const proof        = config.proof ?? null;

  const sections = [
    Object.freeze({ section: SCRIPT_SECTION.HOOK,  text: hook,  durationHint: 0.15 }),
    Object.freeze({ section: SCRIPT_SECTION.VALUE, text: value, durationHint: 0.55 }),
    ...(proof ? [Object.freeze({ section: SCRIPT_SECTION.PROOF, text: proof, durationHint: 0.15 })] : []),
    Object.freeze({ section: SCRIPT_SECTION.CTA,   text: cta,   durationHint: 0.15 }),
  ];

  return Object.freeze({
    objective:   config.objective,
    businessId:  config.business.id ?? null,
    language:    config.language ?? 'es-ES',
    sections:    Object.freeze(sections),
    wordCount:   sections.reduce((n, s) => n + s.text.split(/\s+/).length, 0),
    isReal: false,
  });
}

export const MEDIA_SCRIPT_ENGINE_VERSION = '1.0.0';
