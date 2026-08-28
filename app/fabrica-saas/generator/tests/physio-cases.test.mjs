/**
 * GENERATOR · Tests del vertical fisioterapia
 * node:test built-in. Sin dependencias externas. Sin llamadas a APIs.
 *
 * Casos obligatorios:
 * 1. Primera valoración
 * 2. Dolor lumbar sin diagnóstico automático
 * 3. Rehabilitación deportiva
 * 4. Consulta fuera de horario
 * 5. Caso sensible/bandera roja: no diagnostica, deriva
 * 6. Abandono y recuperación de lead
 * 7. Generación del manifest/runtime (genera correctamente para fisioterapia)
 * 8. Idempotencia (segunda ejecución no produce cambios)
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERTICAL_ROOT  = path.resolve(__dirname, '../../verticals/fisioterapia');
const GENERATOR_ROOT = path.resolve(__dirname, '../../generator');
const CLIENT_ROOT    = path.resolve(__dirname, '../../clients/clinica-fisioterapia-demo');

const {
  FISIO_VERTICAL,
  detectaSensibleFisio,
  getIntencionFisio,
  getCentro,
  estaEnHorarioFisio,
} = await import(`${VERTICAL_ROOT}/config.js`);

const {
  MOCK_PACIENTES_FISIO,
  MOCK_METRICAS_FISIO,
  MOCK_LEADS_ABANDONO_FISIO,
  MOCK_SLOTS_FISIO,
} = await import(`${VERTICAL_ROOT}/mockData.js`);

const { runGeneration, parseSimpleYaml } = await import(
  `${GENERATOR_ROOT}/scripts/generate.mjs`
);

// ── CASO 1: PRIMERA VALORACIÓN ────────────────────────────────────────────

describe('Caso 1: primera_valoracion', () => {
  const int = getIntencionFisio('primera_valoracion');

  test('La intención primera_valoracion existe en el vertical fisioterapia', () => {
    assert.ok(int, 'Debe existir la intención primera_valoracion');
  });

  test('primera_valoracion NO muestra bonos (sin coste en la primera cita)', () => {
    assert.equal(int.mostrar_bonos, false, 'No debe requerir bono en la primera valoración');
  });

  test('primera_valoracion NO es sensible', () => {
    assert.equal(int.sensible, false);
  });

  test('primera_valoracion tiene emoji, label y descripcion', () => {
    assert.ok(int.emoji, 'Debe tener emoji');
    assert.ok(int.label, 'Debe tener label');
    assert.ok(int.descripcion, 'Debe tener descripcion');
  });

  test('Los centros del vertical están definidos con horarios', () => {
    assert.ok(Array.isArray(FISIO_VERTICAL.centros), 'Debe haber centros');
    assert.ok(FISIO_VERTICAL.centros.length >= 2);
    FISIO_VERTICAL.centros.forEach(c => {
      assert.ok(c.id, 'Centro sin id');
      assert.ok(c.nombre, 'Centro sin nombre');
      assert.ok(c.horario, 'Centro sin horario string');
      assert.ok(typeof c.horario_inicio === 'number', 'horario_inicio debe ser número');
      assert.ok(typeof c.horario_fin === 'number', 'horario_fin debe ser número');
    });
  });

  test('Los profesionales ficticios están definidos', () => {
    assert.ok(Array.isArray(FISIO_VERTICAL.profesionales), 'Debe haber profesionales');
    assert.ok(FISIO_VERTICAL.profesionales.length >= 2);
    FISIO_VERTICAL.profesionales.forEach(p => {
      assert.ok(p.id, 'Profesional sin id');
      assert.ok(p.nombre, 'Profesional sin nombre');
      assert.ok(p.especialidad, 'Profesional sin especialidad');
    });
  });

  test('Los huecos ficticios (MOCK_SLOTS_FISIO) incluyen centro y profesional', () => {
    assert.ok(Array.isArray(MOCK_SLOTS_FISIO), 'MOCK_SLOTS_FISIO debe ser array');
    assert.ok(MOCK_SLOTS_FISIO.length >= 2, 'Debe haber al menos 2 huecos');
    MOCK_SLOTS_FISIO.forEach(s => {
      assert.ok(s.id, 'Slot sin id');
      assert.ok(s.fecha, 'Slot sin fecha');
      assert.ok(s.hora, 'Slot sin hora');
      assert.ok(s.centro, 'Slot sin centro');
      assert.ok(s.profesional, 'Slot sin profesional');
      assert.equal(s.disponible, true, 'Slots de demo deben estar disponibles');
    });
  });
});

// ── CASO 2: DOLOR LUMBAR SIN DIAGNÓSTICO ──────────────────────────────────

describe('Caso 2: dolor_lumbar sin diagnóstico automático', () => {
  const int = getIntencionFisio('dolor_lumbar');

  test('La intención dolor_lumbar existe', () => {
    assert.ok(int, 'Debe existir dolor_lumbar');
  });

  test('dolor_lumbar está marcado como sensible', () => {
    assert.equal(int.sensible, true, 'Dolor lumbar debe activar la ruta sensible');
  });

  test('dolor_lumbar NO diagnostica (seguridad_clinica.diagnostico === false)', () => {
    assert.equal(FISIO_VERTICAL.seguridad_clinica.diagnostico, false, 'El vertical no diagnostica');
  });

  test('dolor_lumbar tiene mensaje_derivacion_especifico', () => {
    assert.ok(int.mensaje_derivacion_especifico, 'Debe haber mensaje de derivación específico');
    assert.ok(int.mensaje_derivacion_especifico.length > 20);
  });

  test('El mensaje de derivación general incluye "profesional"', () => {
    const msg = FISIO_VERTICAL.seguridad_clinica.mensaje_derivacion;
    assert.ok(msg.toLowerCase().includes('profesional'), 'Debe derivar a profesional');
  });

  test('El vertical no promete resultados clínicos', () => {
    assert.equal(FISIO_VERTICAL.seguridad_clinica.promesa_resultado, false);
  });
});

// ── CASO 3: REHABILITACIÓN DEPORTIVA ──────────────────────────────────────

describe('Caso 3: rehabilitacion_deportiva', () => {
  const int = getIntencionFisio('rehabilitacion_deportiva');

  test('La intención rehabilitacion_deportiva existe', () => {
    assert.ok(int, 'Debe existir rehabilitacion_deportiva');
  });

  test('rehabilitacion_deportiva NO es sensible (flujo estándar)', () => {
    assert.equal(int.sensible, false, 'Rehabilitación deportiva es flujo normal');
  });

  test('rehabilitacion_deportiva NO muestra bonos por defecto', () => {
    assert.equal(int.mostrar_bonos, false);
  });

  test('El vertical fisioterapia tiene bonos de sesiones definidos', () => {
    assert.ok(Array.isArray(FISIO_VERTICAL.bonos), 'Debe haber bonos');
    assert.ok(FISIO_VERTICAL.bonos.length >= 2, 'Al menos 2 opciones de bono');
    FISIO_VERTICAL.bonos.forEach(b => {
      assert.ok(b.id, 'Bono sin id');
      assert.ok(b.label, 'Bono sin label');
      assert.ok(b.precio, 'Bono sin precio');
      assert.ok(b.precio.toLowerCase().includes('ficticio'), `Precio no marcado como ficticio: ${b.precio}`);
    });
  });

  test('La intención precio_bonos sí activa mostrar_bonos', () => {
    const bonos = getIntencionFisio('precio_bonos');
    assert.ok(bonos, 'Debe existir precio_bonos');
    assert.equal(bonos.mostrar_bonos, true, 'precio_bonos debe activar el paso de bonos');
  });
});

// ── CASO 4: CONSULTA FUERA DE HORARIO ─────────────────────────────────────

describe('Caso 4: consulta fuera de horario', () => {
  const centroPrincipal = getCentro('principal');
  const centroNorte     = getCentro('norte');
  const centroDomicilio = getCentro('domicilio');

  test('getCentro devuelve los centros correctamente', () => {
    assert.ok(centroPrincipal, 'Centro Principal debe existir');
    assert.ok(centroNorte,     'Centro Norte debe existir');
    assert.ok(centroDomicilio, 'Servicio a domicilio debe existir');
  });

  test('Hora 08:00 está FUERA de horario en todos los centros', () => {
    assert.equal(estaEnHorarioFisio(centroPrincipal, 8), false, 'Principal: 08:00 fuera');
    assert.equal(estaEnHorarioFisio(centroNorte, 8),     false, 'Norte: 08:00 fuera');
    assert.equal(estaEnHorarioFisio(centroDomicilio, 8), false, 'Domicilio: 08:00 fuera');
  });

  test('Hora 21:00 está FUERA de horario en todos los centros', () => {
    assert.equal(estaEnHorarioFisio(centroPrincipal, 21), false, 'Principal: 21:00 fuera');
    assert.equal(estaEnHorarioFisio(centroNorte, 21),     false, 'Norte: 21:00 fuera');
    assert.equal(estaEnHorarioFisio(centroDomicilio, 21), false, 'Domicilio: 21:00 fuera');
  });

  test('Hora 12:00 está DENTRO de horario en Centro Principal (9-20)', () => {
    assert.equal(estaEnHorarioFisio(centroPrincipal, 12), true);
  });

  test('Centro Norte abre a las 10 (no a las 9)', () => {
    assert.equal(estaEnHorarioFisio(centroNorte, 9),  false, 'Norte: 09:00 aún cerrado');
    assert.equal(estaEnHorarioFisio(centroNorte, 10), true,  'Norte: 10:00 abierto');
    assert.equal(estaEnHorarioFisio(centroNorte, 19), false, 'Norte: 19:00 ya cerrado (cierra a las 19)');
  });

  test('Domicilio cierra a las 18:00', () => {
    assert.equal(estaEnHorarioFisio(centroDomicilio, 17), true,  'Domicilio: 17:00 dentro');
    assert.equal(estaEnHorarioFisio(centroDomicilio, 18), false, 'Domicilio: 18:00 fuera');
  });
});

// ── CASO 5: CASO SENSIBLE / BANDERA ROJA ──────────────────────────────────

describe('Caso 5: caso sensible / bandera roja', () => {
  test('El vertical define seguridad_clinica correctamente', () => {
    assert.equal(FISIO_VERTICAL.seguridad_clinica.diagnostico,     false, 'No diagnostica');
    assert.equal(FISIO_VERTICAL.seguridad_clinica.prescripcion,    false, 'No prescribe');
    assert.equal(FISIO_VERTICAL.seguridad_clinica.consejo_medico,  false, 'No da consejos médicos');
    assert.equal(FISIO_VERTICAL.seguridad_clinica.promesa_resultado, false, 'No promete resultados');
    assert.equal(FISIO_VERTICAL.seguridad_clinica.derivar_si_sensible, true, 'Debe derivar si sensible');
  });

  test('El mensaje de derivación existe, es descriptivo y menciona profesional', () => {
    const msg = FISIO_VERTICAL.seguridad_clinica.mensaje_derivacion;
    assert.ok(msg && typeof msg === 'string' && msg.length > 30, 'Mensaje descriptivo');
    assert.ok(msg.toLowerCase().includes('profesional'), 'Debe mencionar "profesional"');
  });

  test('detectaSensibleFisio: detecta palabras clave de banderas rojas', () => {
    const textosRojos = [
      'Creo que tengo una fractura',
      'Hay sangre en la herida',
      'Tengo fiebre alta y dolor',
      'Podría ser un tumor?',
      'Siento parálisis en el brazo',
    ];
    textosRojos.forEach(texto => {
      assert.equal(detectaSensibleFisio(texto), true, `Debería detectarse: "${texto}"`);
    });
  });

  test('detectaSensibleFisio: textos normales NO se detectan como sensibles', () => {
    const textosNormales = [
      'Quiero información sobre fisioterapia deportiva',
      'Me gustaría reservar una primera valoración',
      '¿Cuánto cuesta el bono de 10 sesiones?',
      'Tengo una contractura en el cuello',
      'Rehabilitación tras cirugía de rodilla',
    ];
    textosNormales.forEach(texto => {
      assert.equal(detectaSensibleFisio(texto), false, `No debería detectarse: "${texto}"`);
    });
  });

  test('detectaSensibleFisio: texto vacío o null → false', () => {
    assert.equal(detectaSensibleFisio(''),        false);
    assert.equal(detectaSensibleFisio(null),      false);
    assert.equal(detectaSensibleFisio(undefined), false);
  });

  test('La intención suelo_pelvico (sensible) tiene mensaje de derivación específico', () => {
    const int = getIntencionFisio('suelo_pelvico');
    assert.ok(int, 'Debe existir suelo_pelvico');
    assert.equal(int.sensible, true, 'suelo_pelvico debe ser sensible');
    assert.ok(int.mensaje_derivacion_especifico, 'Debe tener mensaje específico');
    assert.ok(int.mensaje_derivacion_especifico.length > 20);
  });

  test('Ningún dato del vertical contiene secretos o credenciales', () => {
    const verticalStr = JSON.stringify(FISIO_VERTICAL);
    assert.ok(!verticalStr.toLowerCase().includes('apikey'),   'No debe contener apikey');
    assert.ok(!verticalStr.toLowerCase().includes('token'),    'No debe contener token');
    assert.ok(!verticalStr.toLowerCase().includes('password'), 'No debe contener password');
    assert.ok(!verticalStr.includes('hook.eu1.make.com'),      'No debe contener Make webhooks');
    assert.ok(!verticalStr.includes('supabase.co'),            'No debe contener Supabase URL');
    assert.ok(!verticalStr.includes('airtable.com'),           'No debe contener Airtable URL');
  });
});

// ── CASO 6: ABANDONO Y RECUPERACIÓN DE LEAD ───────────────────────────────

describe('Caso 6: abandono y recuperación de lead', () => {
  test('Existen leads de abandono en los datos mock de fisioterapia', () => {
    assert.ok(Array.isArray(MOCK_LEADS_ABANDONO_FISIO), 'MOCK_LEADS_ABANDONO_FISIO debe ser array');
    assert.ok(MOCK_LEADS_ABANDONO_FISIO.length >= 2, 'Debe haber al menos 2 leads de abandono');
  });

  test('Cada lead de abandono tiene secuencia de recuperación completa', () => {
    MOCK_LEADS_ABANDONO_FISIO.forEach(lead => {
      assert.ok(lead.id,           'Lead sin id');
      assert.ok(lead.nombre,       'Lead sin nombre');
      assert.ok(lead.servicio,     'Lead sin servicio');
      assert.ok(lead.paso_abandono,'Lead sin paso_abandono');
      assert.ok(lead.fecha,        'Lead sin fecha');
      assert.ok(Array.isArray(lead.secuencia) && lead.secuencia.length >= 1, 'Secuencia inválida');
    });
  });

  test('Los nombres de leads fisioterapia son ficticios', () => {
    MOCK_LEADS_ABANDONO_FISIO.forEach(lead => {
      assert.ok(
        lead.nombre.includes('ficticio') || lead.nombre.includes('anónimo'),
        `Nombre debe ser ficticio: ${lead.nombre}`
      );
    });
  });

  test('Los pasos de recuperación no contienen URLs externas reales', () => {
    MOCK_LEADS_ABANDONO_FISIO.forEach(lead => {
      lead.secuencia.forEach(paso => {
        const pasoStr = JSON.stringify(paso);
        assert.ok(!pasoStr.includes('http://'),     `Contiene URL http: ${pasoStr}`);
        assert.ok(!pasoStr.includes('https://'),    `Contiene URL https: ${pasoStr}`);
        assert.ok(!pasoStr.includes('make.com'),    `Contiene Make: ${pasoStr}`);
        assert.ok(!pasoStr.includes('airtable'),    `Contiene Airtable: ${pasoStr}`);
        assert.ok(!pasoStr.includes('whatsapp'),    `Contiene WhatsApp: ${pasoStr}`);
      });
    });
  });

  test('Al menos un lead está en proceso y otro recuperado', () => {
    const enProceso  = MOCK_LEADS_ABANDONO_FISIO.filter(l => l.estado_recuperacion === 'en_proceso');
    const recuperado = MOCK_LEADS_ABANDONO_FISIO.filter(l => l.estado_recuperacion === 'recuperado');
    assert.ok(enProceso.length >= 1,  'Debe haber al menos 1 lead en proceso');
    assert.ok(recuperado.length >= 1, 'Debe haber al menos 1 lead recuperado');
  });
});

// ── CASO 7: GENERACIÓN DE MANIFEST / RUNTIME PARA FISIOTERAPIA ───────────

describe('Caso 7: generación manifest/runtime para fisioterapia', () => {
  const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
  let outputDir;

  test('El archivo manifest.yaml del cliente fisioterapia existe', () => {
    assert.ok(fs.existsSync(manifestPath), `Manifiesto no encontrado: ${manifestPath}`);
  });

  test('El manifiesto se parsea correctamente', async () => {
    const text = fs.readFileSync(manifestPath, 'utf8');
    const { parseSimpleYaml: parse } = await import(`${GENERATOR_ROOT}/scripts/generate.mjs`);
    const manifest = parse(text);
    assert.equal(manifest.vertical, 'fisioterapia', 'vertical debe ser fisioterapia');
    assert.equal(manifest.modo_demo, true, 'modo_demo debe ser true');
    assert.ok(manifest.cliente,  'Debe tener cliente');
    assert.ok(manifest.modulos,  'Debe tener modulos');
    assert.ok(manifest.sedes,    'Debe tener sedes');
  });

  test('runGeneration genera runtime-config.js para clinica-fisioterapia-demo', async () => {
    outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fisio-gen-'));
    const result = await runGeneration({ manifestPath, outputDir, verbose: false });
    assert.equal(result.success, true, `Generación fallida: ${JSON.stringify(result.errors)}`);
    assert.ok(result.generated.length > 0 || result.skipped.length > 0, 'Debe haber generado o saltado archivos');

    const runtimePath = path.join(outputDir, 'runtime-config.js');
    assert.ok(fs.existsSync(runtimePath), 'runtime-config.js debe existir en el output');

    const content = fs.readFileSync(runtimePath, 'utf8');
    assert.ok(content.includes('fisioterapia'),            'El runtime debe mencionar fisioterapia');
    assert.ok(content.includes('RUNTIME_CONFIG'),           'Debe exportar RUNTIME_CONFIG');
    assert.ok(!content.includes('hook.eu1.make.com'),       'No debe contener webhook de Make');
    assert.ok(!content.toLowerCase().includes('apikey'),    'No debe contener apikey');
    assert.ok(!content.toLowerCase().includes('password'),  'No debe contener password');
  });

  test('El runtime generado tiene la cabecera de no editar manualmente', async () => {
    const runtimePath = path.join(outputDir, 'runtime-config.js');
    if (!fs.existsSync(runtimePath)) return;
    const content = fs.readFileSync(runtimePath, 'utf8');
    assert.ok(content.includes('NO EDITAR MANUALMENTE'), 'Debe tener cabecera de no editar');
  });
});

// ── CASO 8: IDEMPOTENCIA ──────────────────────────────────────────────────

describe('Caso 8: idempotencia del generador para fisioterapia', () => {
  test('Segunda ejecución del generador no genera cambios si el contenido no cambia', async () => {
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fisio-idempotent-'));

    const result1 = await runGeneration({ manifestPath, outputDir, verbose: false });
    assert.equal(result1.success, true, 'Primera generación debe ser exitosa');
    assert.ok(result1.generated.length > 0, 'Primera ejecución debe generar archivos');

    const result2 = await runGeneration({ manifestPath, outputDir, verbose: false });
    assert.equal(result2.success, true, 'Segunda generación debe ser exitosa');
    assert.equal(result2.generated.length, 0, 'Segunda ejecución no debe generar cambios (idempotente)');
    assert.ok(result2.skipped.length > 0, 'Segunda ejecución debe reportar archivos sin cambios');
  });
});

// ── AUDITORÍA DE DATOS FICTICIOS ──────────────────────────────────────────

describe('Auditoría general de datos ficticios fisioterapia', () => {
  test('MOCK_PACIENTES_FISIO tiene exactamente 5 pacientes', () => {
    assert.equal(MOCK_PACIENTES_FISIO.length, 5);
  });

  test('Todos los emails de pacientes son ficticios (@demo.ficticio)', () => {
    MOCK_PACIENTES_FISIO.forEach(p => {
      assert.ok(p.email.includes('demo.ficticio'), `Email no ficticio: ${p.email}`);
    });
  });

  test('Todos los teléfonos de pacientes son ficticios (prefijo 600 000)', () => {
    MOCK_PACIENTES_FISIO.forEach(p => {
      assert.ok(p.telefono.startsWith('600 000'), `Teléfono no ficticio: ${p.telefono}`);
    });
  });

  test('Las métricas de fisioterapia incluyen pipeline con €', () => {
    assert.ok(MOCK_METRICAS_FISIO.valor_pipeline.includes('€'), 'Pipeline debe incluir €');
    assert.ok(MOCK_METRICAS_FISIO.consultas_mes > 0, 'Debe haber consultas > 0');
  });

  test('Los nombres de profesionales ficticios incluyen "(fictici...)" como indicador', () => {
    FISIO_VERTICAL.profesionales.filter(p => p.id !== 'cualquiera').forEach(p => {
      assert.ok(p.nombre.toLowerCase().includes('fictici'), `Profesional sin indicación ficticia/ficticio: ${p.nombre}`);
    });
  });
});
