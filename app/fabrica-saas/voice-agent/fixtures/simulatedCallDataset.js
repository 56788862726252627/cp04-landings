// Simulated Call Dataset — ADV-11 (50 simulated calls across 7 verticals)

import { BOOKING_CALL_FIXTURES }   from './bookingCallFixtures.js';
import { FACTUAL_CALL_FIXTURES }   from './factualCallFixtures.js';
import { INTERRUPTION_FIXTURES }   from './interruptionFixtures.js';
import { DIFFICULT_CALL_FIXTURES } from './difficultCallFixtures.js';
import { SALES_CALL_FIXTURES }     from './salesCallFixtures.js';

const VERTICAL_CALLS = Object.freeze([
  // Pádel Club (7 booking + 5 factual + 3 interruption = 15)
  ...BOOKING_CALL_FIXTURES.map(f => ({ ...f, vertical: 'PADEL_CLUB' })),
  ...FACTUAL_CALL_FIXTURES.map(f => ({ ...f, vertical: 'PADEL_CLUB' })),
  ...INTERRUPTION_FIXTURES.map(f => ({ ...f, vertical: 'PADEL_CLUB' })),
  // Difficult (5 — multi-vertical)
  ...DIFFICULT_CALL_FIXTURES.map(f => ({ ...f, vertical: 'MULTI' })),
  // Sales (5)
  ...SALES_CALL_FIXTURES.map(f => ({ ...f, vertical: 'PADEL_CLUB' })),
  // Dental (5 simulated)
  { id:'dental-booking-01',   vertical:'DENTAL_CLINIC', userText:'Quiero cita con el dentista para la semana que viene.',       expectedIntent:'BOOKING',     isReal: false },
  { id:'dental-info-01',      vertical:'DENTAL_CLINIC', userText:'¿Hacéis blanqueamiento dental?',                              expectedIntent:'INFORMATION', isReal: false },
  { id:'dental-price-01',     vertical:'DENTAL_CLINIC', userText:'¿Cuánto cuesta una limpieza?',                                expectedIntent:'PRICE',       isReal: false },
  { id:'dental-cancel-01',    vertical:'DENTAL_CLINIC', userText:'Quiero cancelar mi cita del jueves.',                         expectedIntent:'CANCEL',      isReal: false },
  { id:'dental-support-01',   vertical:'DENTAL_CLINIC', userText:'Me duele muchísimo una muela, ¿podéis atenderme hoy?',        expectedIntent:'SUPPORT',     isReal: false },
  // Gym (5 simulated)
  { id:'gym-booking-01',      vertical:'GYM',           userText:'Quiero apuntarme a la clase de spinning del lunes.',          expectedIntent:'BOOKING',     isReal: false },
  { id:'gym-price-01',        vertical:'GYM',           userText:'¿Cuánto cuesta la membresía mensual?',                        expectedIntent:'PRICE',       isReal: false },
  { id:'gym-info-01',         vertical:'GYM',           userText:'¿Qué horario tenéis para sala de pesas?',                     expectedIntent:'INFORMATION', isReal: false },
  { id:'gym-sales-01',        vertical:'GYM',           userText:'Estoy pensando en apuntarme, ¿qué me recomendáis?',           expectedIntent:'SALES',       isReal: false },
  { id:'gym-cancel-01',       vertical:'GYM',           userText:'Quiero dar de baja mi membresía.',                            expectedIntent:'CANCEL',      isReal: false },
  // Physio (5 simulated)
  { id:'physio-booking-01',   vertical:'PHYSIO',        userText:'Necesito cita de fisioterapia para una lesión de rodilla.',   expectedIntent:'BOOKING',     isReal: false },
  { id:'physio-info-01',      vertical:'PHYSIO',        userText:'¿Cuántas sesiones se necesitan normalmente para una lumbar?', expectedIntent:'INFORMATION', isReal: false },
  { id:'physio-price-01',     vertical:'PHYSIO',        userText:'¿Aceptáis seguro médico?',                                    expectedIntent:'PRICE',       isReal: false },
  { id:'physio-support-01',   vertical:'PHYSIO',        userText:'Me operaron hace un mes y tengo mucho dolor.',                expectedIntent:'SUPPORT',     isReal: false },
  { id:'physio-cancel-01',    vertical:'PHYSIO',        userText:'Cancela la sesión de mañana, por favor.',                     expectedIntent:'CANCEL',      isReal: false },
  // Education (5 simulated)
  { id:'edu-info-01',         vertical:'EDUCATION',     userText:'¿Qué cursos de inglés ofrecéis para adultos?',               expectedIntent:'INFORMATION', isReal: false },
  { id:'edu-price-01',        vertical:'EDUCATION',     userText:'¿Cuánto cuesta el curso de B2 anual?',                       expectedIntent:'PRICE',       isReal: false },
  { id:'edu-booking-01',      vertical:'EDUCATION',     userText:'Quiero matricularme en el grupo de los martes.',              expectedIntent:'BOOKING',     isReal: false },
  { id:'edu-sales-01',        vertical:'EDUCATION',     userText:'Tengo interés para mi empresa, ¿hacéis formación in-company?',expectedIntent:'SALES',       isReal: false },
  { id:'edu-support-01',      vertical:'EDUCATION',     userText:'No me llegó el enlace al campus virtual.',                   expectedIntent:'SUPPORT',     isReal: false },
  // Real Estate (5 simulated)
  { id:'re-info-01',          vertical:'REAL_ESTATE',   userText:'Busco un piso de tres habitaciones en el centro.',            expectedIntent:'LEAD',        isReal: false },
  { id:'re-price-01',         vertical:'REAL_ESTATE',   userText:'¿Cuál es el precio medio de venta por metro cuadrado?',      expectedIntent:'PRICE',       isReal: false },
  { id:'re-booking-01',       vertical:'REAL_ESTATE',   userText:'Me gustaría visitar el apartamento del martes.',             expectedIntent:'BOOKING',     isReal: false },
  { id:'re-sales-01',         vertical:'REAL_ESTATE',   userText:'Estoy interesado en contratar vuestros servicios de venta.',  expectedIntent:'SALES',       isReal: false },
  { id:'re-support-01',       vertical:'REAL_ESTATE',   userText:'Tengo un problema con la documentación de la hipoteca.',     expectedIntent:'SUPPORT',     isReal: false },
]);

export const SIMULATED_CALL_DATASET = Object.freeze(VERTICAL_CALLS);

export function getCallsByVertical(vertical = '') {
  return Object.freeze(SIMULATED_CALL_DATASET.filter(c => c.vertical === vertical || c.vertical === 'MULTI'));
}

export function getDatasetStats() {
  const total    = SIMULATED_CALL_DATASET.length;
  const verticals = [...new Set(SIMULATED_CALL_DATASET.map(c => c.vertical))];
  return Object.freeze({ total, verticals: Object.freeze(verticals), isReal: false });
}
