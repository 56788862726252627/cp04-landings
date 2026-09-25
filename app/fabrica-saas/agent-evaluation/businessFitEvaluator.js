// Agent Business Fit Evaluator — ADV-10

const VERTICAL_TERMS = Object.freeze({
  dental:     ['cita', 'diente', 'ortodoncia', 'implante', 'revisión', 'clínica'],
  physio:     ['sesión', 'rehabilitación', 'dolor', 'ejercicio', 'fisio', 'tratamiento'],
  psychology: ['sesión', 'terapia', 'bienestar', 'emocional', 'consulta', 'psicólogo'],
  padel:      ['pista', 'partido', 'reserva', 'raqueta', 'torneo', 'pádel'],
  veterinary: ['mascota', 'vacuna', 'consulta', 'veterinario', 'perro', 'gato'],
  beauty:     ['cita', 'tratamiento', 'peluquería', 'estética', 'cabello', 'uñas'],
  legal:      ['caso', 'contrato', 'consulta', 'asesoría', 'expediente', 'legal'],
  education:  ['clase', 'curso', 'matrícula', 'alumno', 'academia', 'horario'],
  fitness:    ['entrenamiento', 'rutina', 'gym', 'clase', 'membresía', 'fitness'],
  general:    [],
});

export function evaluateBusinessFit(response = {}) {
  const vertical = response.vertical ?? 'general';
  const text     = (response.text ?? '').toLowerCase();
  const terms    = VERTICAL_TERMS[vertical] ?? [];

  if (terms.length === 0) return Object.freeze({ score: 75, matchedTerms: [], isReal: false });

  const matched = terms.filter(t => text.includes(t));
  const ratio   = matched.length / terms.length;
  const score   = Math.round(60 + ratio * 40);

  return Object.freeze({ score, matchedTerms: Object.freeze(matched), vertical, isReal: false });
}

export const BUSINESS_FIT_VERSION = '1.0.0';
