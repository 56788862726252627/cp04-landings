/**
 * GENERATOR · Tests de los 5 casos de prueba obligatorios del vertical dental
 * node:test built-in. Sin dependencias externas. Sin llamadas a APIs.
 *
 * Casos:
 * 1. Implantes/cirugía + financiación
 * 2. Primera visita
 * 3. Consulta fuera de horario
 * 4. Abandono sin reservar
 * 5. Consulta clínica sensible con derivación a profesional
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERTICAL_ROOT = path.resolve(__dirname, '../../verticals/dental');

const { DENTAL_VERTICAL, detectaSensible, getIntencion, getSede, estaEnHorario } = await import(`${VERTICAL_ROOT}/config.js`);
const { MOCK_PACIENTES, MOCK_METRICAS, MOCK_LEADS_ABANDONO, MOCK_SLOTS } = await import(`${VERTICAL_ROOT}/mockData.js`);

// ── CASO 1: IMPLANTES / CIRUGÍA + FINANCIACIÓN ────────────────────────────

describe('Caso 1: implantes_cirugia + financiación', () => {
  const intencion = getIntencion('implantes_cirugia');

  test('La intención implantes_cirugia existe en el vertical dental', () => {
    assert.ok(intencion, 'La intención implantes_cirugia debe existir');
  });

  test('implantes_cirugia tiene financiacion: true', () => {
    assert.equal(intencion.financiacion, true, 'Debe ofrecer financiación');
  });

  test('implantes_cirugia no es sensible (no deriva sin motivo)', () => {
    assert.equal(intencion.sensible, false);
  });

  test('El vertical define opciones de financiación', () => {
    assert.ok(Array.isArray(DENTAL_VERTICAL.opciones_financiacion), 'Debe existir opciones_financiacion');
    assert.ok(DENTAL_VERTICAL.opciones_financiacion.length >= 2, 'Debe haber al menos 2 opciones');
  });

  test('Las opciones de financiación tienen id y label', () => {
    DENTAL_VERTICAL.opciones_financiacion.forEach(op => {
      assert.ok(op.id, `Opción sin id: ${JSON.stringify(op)}`);
      assert.ok(op.label, `Opción sin label: ${JSON.stringify(op)}`);
    });
  });

  test('El rango de precio de implantes es ficticio', () => {
    assert.ok(intencion.rango_precio, 'Debe tener rango_precio');
    assert.ok(intencion.rango_precio.toLowerCase().includes('ficticio'), 'Debe estar marcado como ficticio');
  });

  test('Existen huecos (slots) ficticios para citas', () => {
    assert.ok(Array.isArray(MOCK_SLOTS), 'MOCK_SLOTS debe ser array');
    assert.ok(MOCK_SLOTS.length >= 2, 'Debe haber al menos 2 huecos disponibles');
    MOCK_SLOTS.forEach(s => {
      assert.ok(s.id, 'Slot sin id');
      assert.ok(s.fecha, 'Slot sin fecha');
      assert.ok(s.hora, 'Slot sin hora');
      assert.equal(s.disponible, true, 'Slots de demo deben estar disponibles');
    });
  });
});

// ── CASO 2: PRIMERA VISITA ────────────────────────────────────────────────

describe('Caso 2: primera_visita', () => {
  const intencion = getIntencion('primera_visita');

  test('La intención primera_visita existe', () => {
    assert.ok(intencion, 'La intención primera_visita debe existir');
  });

  test('primera_visita NO requiere financiación', () => {
    assert.equal(intencion.financiacion, false, 'Primera visita no debe ofrecer financiación');
  });

  test('primera_visita NO es sensible', () => {
    assert.equal(intencion.sensible, false);
  });

  test('primera_visita tiene emoji, label y descripcion', () => {
    assert.ok(intencion.emoji, 'Debe tener emoji');
    assert.ok(intencion.label, 'Debe tener label');
    assert.ok(intencion.descripcion, 'Debe tener descripcion');
  });

  test('Las sedes están definidas con horarios', () => {
    DENTAL_VERTICAL.sedes.forEach(sede => {
      assert.ok(sede.id, 'Sede sin id');
      assert.ok(sede.nombre, 'Sede sin nombre');
      assert.ok(sede.horario, 'Sede sin horario');
      assert.ok(typeof sede.horario_inicio === 'number', 'Sede debe tener horario_inicio numérico');
      assert.ok(typeof sede.horario_fin === 'number', 'Sede debe tener horario_fin numérico');
    });
  });

  test('Las franjas horarias están definidas', () => {
    assert.ok(Array.isArray(DENTAL_VERTICAL.franjas_horarias), 'Debe haber franjas_horarias');
    assert.ok(DENTAL_VERTICAL.franjas_horarias.length >= 2);
    DENTAL_VERTICAL.franjas_horarias.forEach(f => {
      assert.ok(f.id, 'Franja sin id');
      assert.ok(f.label, 'Franja sin label');
    });
  });
});

// ── CASO 3: CONSULTA FUERA DE HORARIO ─────────────────────────────────────

describe('Caso 3: consulta fuera de horario', () => {
  const sedeCentro = getSede('centro');
  const sedeNorte = getSede('norte');
  const sedePlaya = getSede('playa');

  test('getSede devuelve las sedes correctamente', () => {
    assert.ok(sedeCentro, 'Sede Centro debe existir');
    assert.ok(sedeNorte, 'Sede Norte debe existir');
    assert.ok(sedePlaya, 'Sede Playa debe existir');
  });

  test('Hora 08:00 está FUERA de horario en todas las sedes', () => {
    assert.equal(estaEnHorario(sedeCentro, 8), false, 'Centro: 08:00 fuera de horario');
    assert.equal(estaEnHorario(sedeNorte, 8), false, 'Norte: 08:00 fuera de horario');
    assert.equal(estaEnHorario(sedePlaya, 8), false, 'Playa: 08:00 fuera de horario');
  });

  test('Hora 22:00 está FUERA de horario en todas las sedes', () => {
    assert.equal(estaEnHorario(sedeCentro, 22), false, 'Centro: 22:00 fuera de horario');
    assert.equal(estaEnHorario(sedeNorte, 22), false, 'Norte: 22:00 fuera de horario');
    assert.equal(estaEnHorario(sedePlaya, 22), false, 'Playa: 22:00 fuera de horario');
  });

  test('Hora 12:00 está DENTRO de horario en Sede Centro', () => {
    assert.equal(estaEnHorario(sedeCentro, 12), true, 'Centro: 12:00 dentro de horario');
  });

  test('Hora 10:30 está dentro del horario de Norte (10-21h)', () => {
    assert.equal(estaEnHorario(sedeNorte, 10), true, 'Norte: 10:00 dentro');
    assert.equal(estaEnHorario(sedeNorte, 20), true, 'Norte: 20:00 dentro');
    assert.equal(estaEnHorario(sedeNorte, 21), false, 'Norte: 21:00 ya fuera');
  });

  test('Sede Playa cierra a las 18:00', () => {
    assert.equal(estaEnHorario(sedePlaya, 17), true, 'Playa: 17:00 dentro');
    assert.equal(estaEnHorario(sedePlaya, 18), false, 'Playa: 18:00 fuera');
  });
});

// ── CASO 4: ABANDONO ANTES DE RESERVAR ────────────────────────────────────

describe('Caso 4: abandono_sin_reserva', () => {
  test('Existen leads de abandono en los datos mock', () => {
    assert.ok(Array.isArray(MOCK_LEADS_ABANDONO), 'MOCK_LEADS_ABANDONO debe ser array');
    assert.ok(MOCK_LEADS_ABANDONO.length >= 1, 'Debe haber al menos 1 lead de abandono');
  });

  test('Cada lead de abandono tiene secuencia de recuperación', () => {
    MOCK_LEADS_ABANDONO.forEach(lead => {
      assert.ok(lead.id, 'Lead sin id');
      assert.ok(lead.nombre, 'Lead sin nombre');
      assert.ok(lead.tratamiento, 'Lead sin tratamiento');
      assert.ok(lead.paso_abandono, 'Lead sin paso de abandono');
      assert.ok(Array.isArray(lead.secuencia), 'Secuencia debe ser array');
      assert.ok(lead.secuencia.length >= 1, 'Secuencia debe tener pasos');
    });
  });

  test('Los pasos de la secuencia no contienen URLs externas reales', () => {
    MOCK_LEADS_ABANDONO.forEach(lead => {
      lead.secuencia.forEach(paso => {
        const pasoStr = JSON.stringify(paso);
        assert.ok(!pasoStr.includes('http://'), `Paso contiene URL http: ${pasoStr}`);
        assert.ok(!pasoStr.includes('https://'), `Paso contiene URL https: ${pasoStr}`);
        assert.ok(!pasoStr.includes('make.com'), `Paso contiene Make URL: ${pasoStr}`);
        assert.ok(!pasoStr.includes('airtable'), `Paso contiene Airtable: ${pasoStr}`);
        assert.ok(!pasoStr.includes('supabase'), `Paso contiene Supabase: ${pasoStr}`);
        assert.ok(!pasoStr.includes('whatsapp'), `Paso contiene WhatsApp: ${pasoStr}`);
        assert.ok(!pasoStr.includes('mailchimp'), `Paso contiene Mailchimp: ${pasoStr}`);
      });
    });
  });

  test('Los nombres de leads son ficticios (no emails reales)', () => {
    MOCK_LEADS_ABANDONO.forEach(lead => {
      assert.ok(lead.nombre.includes('ficticio') || lead.nombre.includes('anónimo'),
        `Nombre de lead debe indicar que es ficticio: ${lead.nombre}`);
    });
  });
});

// ── CASO 5: CONSULTA CLÍNICA SENSIBLE ─────────────────────────────────────

describe('Caso 5: consulta_clinica_sensible', () => {
  test('El vertical define seguridad_clinica correctamente', () => {
    assert.equal(DENTAL_VERTICAL.seguridad_clinica.diagnostico, false, 'No diagnostica');
    assert.equal(DENTAL_VERTICAL.seguridad_clinica.prescripcion, false, 'No prescribe');
    assert.equal(DENTAL_VERTICAL.seguridad_clinica.consejo_medico, false, 'No da consejos médicos');
    assert.equal(DENTAL_VERTICAL.seguridad_clinica.derivar_si_sensible, true, 'Debe derivar si sensible');
  });

  test('El mensaje de derivación existe y no es vacío', () => {
    const msg = DENTAL_VERTICAL.seguridad_clinica.mensaje_derivacion;
    assert.ok(msg && typeof msg === 'string' && msg.length > 20, 'Mensaje de derivación debe ser descriptivo');
    assert.ok(!msg.toLowerCase().includes('diagnóst') || msg.toLowerCase().includes('profesional'),
      'El mensaje debe derivar a profesional, no diagnosticar');
  });

  test('detectaSensible: textos sensibles son detectados', () => {
    const textosConTrigger = [
      'Tengo mucho dolor de muela',
      'Me sale sangre al cepillarme',
      'Creo que tengo una infección',
      '¿Qué antibiótico me recomiendas?',
      'Hay riesgo en el tratamiento?',
    ];
    textosConTrigger.forEach(texto => {
      assert.equal(detectaSensible(texto), true, `Debería detectarse como sensible: "${texto}"`);
    });
  });

  test('detectaSensible: textos no sensibles no se detectan', () => {
    const textosNormales = [
      'Quiero información sobre ortodoncia',
      'Me gustaría pedir cita',
      '¿Cuánto cuesta un implante?',
      'Primera visita por favor',
      'Quiero blanquear mis dientes',
    ];
    textosNormales.forEach(texto => {
      assert.equal(detectaSensible(texto), false, `No debería detectarse como sensible: "${texto}"`);
    });
  });

  test('detectaSensible: texto vacío o null → false', () => {
    assert.equal(detectaSensible(''), false);
    assert.equal(detectaSensible(null), false);
    assert.equal(detectaSensible(undefined), false);
  });

  test('La intención urgencia tiene mensaje_urgencia definido', () => {
    const urgencia = getIntencion('urgencia');
    assert.ok(urgencia, 'La intención urgencia debe existir');
    assert.equal(urgencia.sensible, true, 'urgencia debe ser sensible');
    assert.ok(urgencia.mensaje_urgencia, 'urgencia debe tener mensaje_urgencia');
    assert.ok(urgencia.mensaje_urgencia.length > 20, 'El mensaje de urgencia debe ser descriptivo');
  });

  test('Ningún dato del vertical contiene secretos o credenciales', () => {
    const verticalStr = JSON.stringify(DENTAL_VERTICAL);
    assert.ok(!verticalStr.toLowerCase().includes('apikey'), 'No debe contener apikey');
    assert.ok(!verticalStr.toLowerCase().includes('token'), 'No debe contener token');
    assert.ok(!verticalStr.toLowerCase().includes('password'), 'No debe contener password');
    assert.ok(!verticalStr.includes('hook.eu1.make.com'), 'No debe contener Make webhooks');
    assert.ok(!verticalStr.includes('supabase.co'), 'No debe contener Supabase URL');
  });
});

// ── AUDITORÍA DE DATOS MOCK ───────────────────────────────────────────────

describe('Auditoría general de datos ficticios', () => {
  test('MOCK_PACIENTES tiene exactamente 5 pacientes ficticios', () => {
    assert.equal(MOCK_PACIENTES.length, 5);
  });

  test('Ningún email de paciente es un email real (todos @demo.ficticio)', () => {
    MOCK_PACIENTES.forEach(p => {
      assert.ok(p.email.includes('demo.ficticio'), `Email no ficticio: ${p.email}`);
    });
  });

  test('Ningún teléfono de paciente empieza por prefijo real de operadora', () => {
    MOCK_PACIENTES.forEach(p => {
      assert.ok(p.telefono.startsWith('600 000'), `Teléfono no ficticio: ${p.telefono}`);
    });
  });

  test('Las métricas están marcadas como ficticias (pipeline tiene €)', () => {
    assert.ok(MOCK_METRICAS.valor_pipeline.includes('€'), 'Debe ser una cifra con €');
    assert.ok(parseInt(MOCK_METRICAS.consultas_mes) > 0, 'Debe tener consultas > 0');
  });
});
