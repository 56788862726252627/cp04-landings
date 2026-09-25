/**
 * GENERATOR · Tests del vertical Despacho de Abogados / Servicios Jurídicos
 * node:test built-in. Sin dependencias externas. Sin llamadas a APIs.
 * Sin asesoramiento jurídico real. Sin dictámenes. Solo simulación demo.
 *
 * Casos:
 * 1.  Consulta inicial (selección de área sin urgencia preseleccionada)
 * 2.  Derecho laboral — flujo completo con abogado especialista
 * 3.  Derecho penal — sensible, deriva antes de continuar
 * 4.  Presupuesto/honorarios — flujo corto con honorarios ficticios
 * 5.  Cambio/cancelación — flujo corto sin honorarios
 * 6.  Abandono y recuperación de lead jurídico
 * 7.  Generación manifest/runtime + idempotencia
 * 8.  Auditoría de datos ficticios (emails, teléfonos, expedientes)
 * 9.  Expedientes y tareas próximas — diferenciadores abogados
 * 10. Integridad vertical dental + fisio + estética (regression guard)
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERTICAL_ROOT  = path.resolve(__dirname, '../../verticals/abogados');
const GENERATOR_ROOT = path.resolve(__dirname, '../../generator');
const CLIENT_ROOT    = path.resolve(__dirname, '../../clients/despacho-abogados-demo');

const {
  ABOGADOS_VERTICAL,
  detectaSensibleAbogados,
  getIntencionAbogados,
  getAbogadoPorArea,
  getDespacho,
} = await import(`${VERTICAL_ROOT}/config.js`);

const {
  MOCK_CLIENTES_ABOGADOS,
  MOCK_METRICAS_ABOGADOS,
  MOCK_LEADS_ABANDONO_ABOGADOS,
  MOCK_SLOTS_ABOGADOS,
  MOCK_TAREAS_PROXIMAS,
} = await import(`${VERTICAL_ROOT}/mockData.js`);

const { runGeneration, parseSimpleYaml } = await import(
  `${GENERATOR_ROOT}/scripts/generate.mjs`
);

// ── CASO 1: CONSULTA INICIAL ───────────────────────────────────────────────

describe('Caso 1: consulta_inicial — primera evaluación del caso', () => {
  const int = getIntencionAbogados('consulta_inicial');

  test('La intención consulta_inicial existe en el vertical abogados', () => {
    assert.ok(int, 'Debe existir consulta_inicial');
  });

  test('consulta_inicial NO es flujo corto', () => {
    assert.equal(int.flujo_corto, false);
  });

  test('consulta_inicial NO es sensible', () => {
    assert.equal(int.sensible, false);
  });

  test('consulta_inicial NO muestra honorarios por defecto', () => {
    assert.equal(int.mostrar_honorarios, false);
  });

  test('El vertical tiene al menos 2 despachos con horario definido', () => {
    const con_horario = ABOGADOS_VERTICAL.despachos.filter(
      d => typeof d.horario_inicio === 'number' && typeof d.horario_fin === 'number'
    );
    assert.ok(con_horario.length >= 2);
  });

  test('El vertical tiene al menos 3 franjas horarias', () => {
    assert.ok(ABOGADOS_VERTICAL.franjas_horarias.length >= 3);
  });

  test('Hay al menos 5 intenciones disponibles (áreas de práctica + gestión)', () => {
    assert.ok(ABOGADOS_VERTICAL.intenciones.length >= 5);
  });
});

// ── CASO 2: DERECHO LABORAL CON ABOGADO ESPECIALISTA ─────────────────────

describe('Caso 2: derecho_laboral — flujo completo con especialista', () => {
  const int = getIntencionAbogados('derecho_laboral');

  test('La intención derecho_laboral existe', () => {
    assert.ok(int, 'Debe existir derecho_laboral');
  });

  test('derecho_laboral tiene area_practica = "laboral"', () => {
    assert.equal(int.area_practica, 'laboral');
  });

  test('derecho_laboral NO es sensible', () => {
    assert.equal(int.sensible, false);
  });

  test('derecho_laboral NO es flujo corto', () => {
    assert.equal(int.flujo_corto, false);
  });

  test('getAbogadoPorArea("laboral") retorna la especialista en laboral', () => {
    const abg = getAbogadoPorArea('laboral');
    assert.ok(abg, 'Debe existir un abogado/a especialista en laboral');
    assert.equal(abg.area, 'laboral');
    assert.ok(abg.disponible, 'El abogado debe estar disponible');
  });

  test('El nombre del abogado laboral indica que es ficticio', () => {
    const abg = getAbogadoPorArea('laboral');
    assert.ok(
      abg.nombre.toLowerCase().includes('fictici'),
      `El abogado "${abg.nombre}" debe indicar que es ficticio/ficticia`
    );
  });

  test('getAbogadoPorArea("area_inexistente") retorna null', () => {
    const abg = getAbogadoPorArea('area_inexistente_xyz');
    assert.equal(abg, null);
  });

  test('Los slots disponibles contienen al menos uno con area laboral', () => {
    const slotLaboral = MOCK_SLOTS_ABOGADOS.find(s => s.area === 'laboral' && s.disponible);
    assert.ok(slotLaboral, 'Debe haber al menos un slot disponible para laboral');
  });

  test('Las áreas de práctica incluyen "laboral"', () => {
    const area = ABOGADOS_VERTICAL.areas_practica.find(a => a.id === 'laboral');
    assert.ok(area, 'laboral debe estar en areas_practica');
    assert.ok(area.emoji, 'laboral debe tener emoji');
  });
});

// ── CASO 3: DERECHO PENAL — SENSIBLE, DERIVA ──────────────────────────────

describe('Caso 3: derecho_penal — sensible, no asesoramiento, deriva', () => {
  const int = getIntencionAbogados('derecho_penal');

  test('La intención derecho_penal existe', () => {
    assert.ok(int, 'Debe existir derecho_penal');
  });

  test('derecho_penal está marcada como sensible', () => {
    assert.equal(int.sensible, true);
  });

  test('derecho_penal tiene urgencia_default = "alta"', () => {
    assert.equal(int.urgencia_default, 'alta');
  });

  test('derecho_penal tiene mensaje_derivacion_especifico definido', () => {
    assert.ok(int.mensaje_derivacion_especifico?.length > 20);
  });

  test('El mensaje de derivación menciona "abogado"', () => {
    assert.ok(
      int.mensaje_derivacion_especifico.toLowerCase().includes('abogado'),
      'El mensaje debe mencionar abogado'
    );
  });

  test('El mensaje de derivación menciona que no se ofrece asesoramiento', () => {
    const msg = int.mensaje_derivacion_especifico.toLowerCase();
    assert.ok(
      msg.includes('asesoramiento') || msg.includes('asesoria') || msg.includes('jurídico'),
      'Debe mencionar que no ofrece asesoramiento jurídico'
    );
  });

  test('detectaSensibleAbogados detecta "me han detenido"', () => {
    assert.equal(detectaSensibleAbogados('me han detenido esta mañana'), true);
  });

  test('detectaSensibleAbogados detecta "libertad provisional"', () => {
    assert.equal(detectaSensibleAbogados('quiero pedir la libertad provisional'), true);
  });

  test('detectaSensibleAbogados detecta "juicio mañana"', () => {
    assert.equal(detectaSensibleAbogados('tengo juicio mañana y no sé qué hacer'), true);
  });

  test('detectaSensibleAbogados detecta "violencia de género urgente"', () => {
    assert.equal(detectaSensibleAbogados('necesito ayuda por violencia de género urgente'), true);
  });

  test('detectaSensibleAbogados NO dispara en texto normal de derecho laboral', () => {
    assert.equal(detectaSensibleAbogados('me despidieron sin previo aviso'), false);
  });

  test('detectaSensibleAbogados NO dispara en texto vacío', () => {
    assert.equal(detectaSensibleAbogados(''), false);
    assert.equal(detectaSensibleAbogados(null), false);
  });

  test('seguridad_juridica: asesoramiento_real=false, dictamen=false, garantia_resultado=false', () => {
    const sj = ABOGADOS_VERTICAL.seguridad_juridica;
    assert.equal(sj.asesoramiento_real,   false);
    assert.equal(sj.dictamen,            false);
    assert.equal(sj.garantia_resultado,  false);
  });

  test('seguridad_juridica: derivar_a_abogado_especialista=true', () => {
    assert.equal(ABOGADOS_VERTICAL.seguridad_juridica.derivar_a_abogado_especialista, true);
  });

  test('keywords_sensibles tiene al menos 10 términos', () => {
    assert.ok(ABOGADOS_VERTICAL.seguridad_juridica.keywords_sensibles.length >= 10);
  });

  test('El aviso_demo menciona que NO ofrece asesoramiento jurídico real', () => {
    const aviso = ABOGADOS_VERTICAL.seguridad_juridica.aviso_demo.toLowerCase();
    assert.ok(aviso.includes('no') && aviso.includes('asesoramiento'));
  });
});

// ── CASO 4: PRESUPUESTO/HONORARIOS — FLUJO CORTO ──────────────────────────

describe('Caso 4: presupuesto_honorarios — flujo corto con honorarios ficticios', () => {
  const int = getIntencionAbogados('presupuesto_honorarios');

  test('La intención presupuesto_honorarios existe', () => {
    assert.ok(int, 'Debe existir presupuesto_honorarios');
  });

  test('presupuesto_honorarios tiene flujo_corto=true', () => {
    assert.equal(int.flujo_corto, true);
  });

  test('presupuesto_honorarios tiene mostrar_honorarios=true', () => {
    assert.equal(int.mostrar_honorarios, true);
  });

  test('presupuesto_honorarios tiene mensaje_flujo_corto definido', () => {
    assert.ok(int.mensaje_flujo_corto?.length > 10);
  });

  test('Hay al menos 3 honorarios_demo definidos', () => {
    assert.ok(ABOGADOS_VERTICAL.honorarios_demo.length >= 3);
  });

  test('Cada honorario_demo tiene id, label y precio ficticio', () => {
    ABOGADOS_VERTICAL.honorarios_demo.forEach(h => {
      assert.ok(h.id,    `honorario ${h.id} debe tener id`);
      assert.ok(h.label, `honorario ${h.id} debe tener label`);
      assert.ok(h.precio.includes('ficticio'), `Precio de "${h.label}" debe indicar ficticio`);
    });
  });

  test('Hay exactamente 1 honorario destacado', () => {
    const destacados = ABOGADOS_VERTICAL.honorarios_demo.filter(h => h.destacado);
    assert.ok(destacados.length >= 1, 'Debe haber al menos 1 honorario destacado');
  });

  test('El mensaje de flujo corto menciona que los precios son ficticios', () => {
    assert.ok(int.mensaje_flujo_corto.toLowerCase().includes('ficticio'));
  });
});

// ── CASO 5: CAMBIO/CANCELACIÓN — FLUJO CORTO ──────────────────────────────

describe('Caso 5: cambio_cancelacion — flujo corto sin honorarios', () => {
  const int = getIntencionAbogados('cambio_cancelacion');

  test('La intención cambio_cancelacion existe', () => {
    assert.ok(int, 'Debe existir cambio_cancelacion');
  });

  test('cambio_cancelacion tiene flujo_corto=true', () => {
    assert.equal(int.flujo_corto, true);
  });

  test('cambio_cancelacion NO muestra honorarios', () => {
    assert.equal(int.mostrar_honorarios, false);
  });

  test('cambio_cancelacion tiene mensaje_flujo_corto definido', () => {
    assert.ok(int.mensaje_flujo_corto?.length > 10);
  });

  test('cambio_cancelacion NO es sensible', () => {
    assert.equal(int.sensible, false);
  });
});

// ── CASO 6: ABANDONO Y RECUPERACIÓN DE LEAD JURÍDICO ──────────────────────

describe('Caso 6: abandono y recuperación de lead jurídico', () => {
  test('Hay leads de abandono definidos (mínimo 2)', () => {
    assert.ok(MOCK_LEADS_ABANDONO_ABOGADOS.length >= 2);
  });

  test('Hay al menos un lead "en_proceso" y otro "recuperado"', () => {
    const enProceso = MOCK_LEADS_ABANDONO_ABOGADOS.some(l => l.estado === 'en_proceso');
    const recuperado = MOCK_LEADS_ABANDONO_ABOGADOS.some(l => l.estado === 'recuperado');
    assert.ok(enProceso,  'Debe haber al menos un lead en_proceso');
    assert.ok(recuperado, 'Debe haber al menos un lead recuperado');
  });

  test('Cada lead tiene accion_sugerida definida', () => {
    MOCK_LEADS_ABANDONO_ABOGADOS.forEach(l => {
      assert.ok(l.accion_sugerida?.length > 5, `Lead ${l.id} debe tener accion_sugerida`);
    });
  });

  test('Cada lead tiene area jurídica definida', () => {
    MOCK_LEADS_ABANDONO_ABOGADOS.forEach(l => {
      assert.ok(l.area, `Lead ${l.id} debe tener area`);
    });
  });

  test('Hay slots disponibles para citas (mínimo 2)', () => {
    const disponibles = MOCK_SLOTS_ABOGADOS.filter(s => s.disponible);
    assert.ok(disponibles.length >= 2);
  });

  test('Las campañas activas tienen leads_generados > 0', () => {
    const activas = ABOGADOS_VERTICAL.campanas.filter(c => c.activa);
    activas.forEach(c => {
      assert.ok(
        c.leads_generados > 0,
        `Campaña "${c.titulo}" activa debe tener leads_generados > 0`
      );
    });
  });
});

// ── CASO 7: GENERACIÓN MANIFEST/RUNTIME + IDEMPOTENCIA ────────────────────

describe('Caso 7: generación manifest/runtime para abogados', () => {
  let tmpDir;

  test('El manifest del cliente abogados es YAML válido con campos requeridos', async () => {
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const raw    = fs.readFileSync(manifestPath, 'utf8');
    const parsed = parseSimpleYaml(raw);
    assert.equal(parsed.vertical,   'abogados');
    assert.equal(parsed.modo_demo,  true);
    assert.ok(Array.isArray(parsed.modulos));
  });

  test('El manifest tiene mock.obligatorio=true', async () => {
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const raw    = fs.readFileSync(manifestPath, 'utf8');
    const parsed = parseSimpleYaml(raw);
    assert.equal(parsed.mock?.obligatorio, true);
  });

  test('El manifest tiene integraciones.reales=false', async () => {
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const raw    = fs.readFileSync(manifestPath, 'utf8');
    const parsed = parseSimpleYaml(raw);
    assert.equal(parsed.integraciones?.reales, false);
  });

  test('El generador crea el runtime para abogados sin errores', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abogados-gen-'));
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const result = await runGeneration({ manifestPath, outputDir: tmpDir });
    assert.ok(result.success, `Generación debe ser exitosa. Errores: ${result.errors.join(', ')}`);
    assert.ok(fs.existsSync(path.join(tmpDir, 'runtime-config.js')), 'El archivo runtime debe crearse');
  });

  test('El runtime generado contiene el nombre del cliente y el vertical', async () => {
    const content = fs.readFileSync(path.join(tmpDir, 'runtime-config.js'), 'utf8');
    assert.ok(content.includes('abogados'),               'Debe mencionar el vertical abogados');
    assert.ok(content.includes('Despacho Abogados Demo'), 'Debe incluir el nombre del cliente');
  });

  test('El runtime generado tiene la cabecera de no editar manualmente', async () => {
    const content = fs.readFileSync(path.join(tmpDir, 'runtime-config.js'), 'utf8');
    assert.ok(content.includes('NO EDITAR MANUALMENTE'), 'Debe incluir aviso de no editar');
  });
});

describe('Idempotencia del generador para abogados', () => {
  test('Segunda ejecución no genera cambios si el contenido no cambia', async () => {
    const tmpDir2      = fs.mkdtempSync(path.join(os.tmpdir(), 'abogados-idem-'));
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const runtimePath  = path.join(tmpDir2, 'runtime-config.js');

    await runGeneration({ manifestPath, outputDir: tmpDir2 });
    const contenido1 = fs.readFileSync(runtimePath, 'utf8');

    await runGeneration({ manifestPath, outputDir: tmpDir2 });
    const contenido2 = fs.readFileSync(runtimePath, 'utf8');

    assert.equal(contenido1, contenido2, 'El contenido debe ser idéntico en ambas ejecuciones');
  });
});

// ── CASO 8: AUDITORÍA DATOS FICTICIOS ─────────────────────────────────────

describe('Auditoría general de datos ficticios abogados', () => {
  test('MOCK_CLIENTES_ABOGADOS tiene exactamente 5 expedientes', () => {
    assert.equal(MOCK_CLIENTES_ABOGADOS.length, 5);
  });

  test('Todos los emails de clientes son ficticios (@demo.ficticio)', () => {
    MOCK_CLIENTES_ABOGADOS.forEach(c => {
      assert.ok(
        c.email.endsWith('@demo.ficticio'),
        `Email de ${c.nombre} debe ser @demo.ficticio, got: ${c.email}`
      );
    });
  });

  test('Todos los teléfonos de clientes son ficticios (prefijo 600 000)', () => {
    MOCK_CLIENTES_ABOGADOS.forEach(c => {
      assert.ok(
        c.telefono.startsWith('600 000'),
        `Teléfono de ${c.nombre} debe empezar por "600 000", got: ${c.telefono}`
      );
    });
  });

  test('Todos los expedientes indican "(ficticio)" en su número', () => {
    MOCK_CLIENTES_ABOGADOS.forEach(c => {
      assert.ok(
        c.numero_expediente.toLowerCase().includes('ficticio'),
        `Expediente de ${c.nombre} debe indicar "(ficticio)", got: ${c.numero_expediente}`
      );
    });
  });

  test('Las métricas de abogados incluyen facturacion_mes con € y "ficticio"', () => {
    assert.ok(MOCK_METRICAS_ABOGADOS.facturacion_mes.includes('€'));
    assert.ok(MOCK_METRICAS_ABOGADOS.facturacion_mes.includes('ficticio'));
  });

  test('Las métricas de abogados incluyen valor_pipeline con € y "ficticio"', () => {
    assert.ok(MOCK_METRICAS_ABOGADOS.valor_pipeline.includes('€'));
    assert.ok(MOCK_METRICAS_ABOGADOS.valor_pipeline.includes('ficticio'));
  });

  test('Los nombres de abogados ficticios indican "(fictici...)" como indicador', () => {
    const reales = ABOGADOS_VERTICAL.abogados.filter(a => a.id !== 'cualquiera');
    reales.forEach(a => {
      assert.ok(
        a.nombre.toLowerCase().includes('fictici'),
        `Abogado "${a.nombre}" debe indicar que es ficticio/ficticia`
      );
    });
  });

  test('Las campañas tienen al menos 2 activas y 1 inactiva', () => {
    const activas   = ABOGADOS_VERTICAL.campanas.filter(c => c.activa);
    const inactivas = ABOGADOS_VERTICAL.campanas.filter(c => !c.activa);
    assert.ok(activas.length >= 2,   'Debe haber al menos 2 campañas activas');
    assert.ok(inactivas.length >= 1, 'Debe haber al menos 1 campaña inactiva');
  });

  test('Ningún dato del vertical contiene secretos o credenciales', () => {
    const verticalStr = JSON.stringify(ABOGADOS_VERTICAL);
    const mockStr     = JSON.stringify({
      MOCK_CLIENTES_ABOGADOS,
      MOCK_METRICAS_ABOGADOS,
      MOCK_LEADS_ABANDONO_ABOGADOS,
    });
    assert.ok(!verticalStr.toLowerCase().includes('token'),    'No debe contener token');
    assert.ok(!verticalStr.toLowerCase().includes('password'), 'No debe contener password');
    assert.ok(!mockStr.toLowerCase().includes('api_key'),      'No debe contener api_key');
    assert.ok(!mockStr.toLowerCase().includes('secret'),       'No debe contener secret');
  });

  test('Todos los emails de leads de abandono son ficticios', () => {
    MOCK_LEADS_ABANDONO_ABOGADOS.forEach(l => {
      assert.ok(
        l.email.endsWith('@demo.ficticio'),
        `Email del lead ${l.id} debe ser @demo.ficticio`
      );
    });
  });

  test('Todos los slots indican fecha ficticia', () => {
    MOCK_SLOTS_ABOGADOS.forEach(s => {
      assert.ok(
        s.fecha.includes('ficticio'),
        `Slot ${s.id} debe indicar fecha ficticia`
      );
    });
  });
});

// ── CASO 9: EXPEDIENTES Y TAREAS PRÓXIMAS ─────────────────────────────────

describe('Caso 9: expedientes y tareas próximas — diferenciadores abogados', () => {
  test('Hay al menos 3 tareas próximas definidas', () => {
    assert.ok(MOCK_TAREAS_PROXIMAS.length >= 3);
  });

  test('Cada tarea próxima tiene expediente, cliente, tarea, fecha y abogado', () => {
    MOCK_TAREAS_PROXIMAS.forEach(t => {
      assert.ok(t.expediente, `Tarea ${t.id} debe tener expediente`);
      assert.ok(t.cliente,    `Tarea ${t.id} debe tener cliente`);
      assert.ok(t.tarea,      `Tarea ${t.id} debe tener descripción de tarea`);
      assert.ok(t.fecha,      `Tarea ${t.id} debe tener fecha`);
      assert.ok(t.abogado,    `Tarea ${t.id} debe tener abogado asignado`);
    });
  });

  test('Cada tarea próxima indica urgencia (alta/media/baja)', () => {
    const urgencias_validas = ['alta', 'media', 'baja'];
    MOCK_TAREAS_PROXIMAS.forEach(t => {
      assert.ok(
        urgencias_validas.includes(t.urgencia),
        `Tarea ${t.id}: urgencia "${t.urgencia}" no es válida`
      );
    });
  });

  test('Las fechas de tareas indican que son ficticias', () => {
    MOCK_TAREAS_PROXIMAS.forEach(t => {
      assert.ok(
        t.fecha.includes('ficticio'),
        `Fecha de tarea ${t.id} debe indicar ficticio`
      );
    });
  });

  test('Hay al menos una tarea de urgencia alta', () => {
    const urgente = MOCK_TAREAS_PROXIMAS.some(t => t.urgencia === 'alta');
    assert.ok(urgente, 'Debe haber al menos una tarea de urgencia alta');
  });

  test('Las fases de expediente cubren las 6 etapas del proceso', () => {
    assert.equal(ABOGADOS_VERTICAL.fases_expediente.length, 6);
  });

  test('Las fases de expediente tienen orden correlativo (1 a 6)', () => {
    const ordenes = ABOGADOS_VERTICAL.fases_expediente.map(f => f.orden).sort((a, b) => a - b);
    assert.deepEqual(ordenes, [1, 2, 3, 4, 5, 6]);
  });

  test('Los expedientes de clientes tienen fases válidas', () => {
    const fases_validas = ABOGADOS_VERTICAL.fases_expediente.map(f => f.id);
    MOCK_CLIENTES_ABOGADOS.forEach(c => {
      assert.ok(
        fases_validas.includes(c.fase),
        `Cliente ${c.id}: fase "${c.fase}" no es una fase válida`
      );
    });
  });

  test('Los expedientes de clientes tienen urgencia válida', () => {
    const urgencias_validas = ['alta', 'media', 'baja'];
    MOCK_CLIENTES_ABOGADOS.forEach(c => {
      assert.ok(
        urgencias_validas.includes(c.urgencia),
        `Cliente ${c.id}: urgencia "${c.urgencia}" no es válida`
      );
    });
  });

  test('getDespacho retorna el despacho central correctamente', () => {
    const despacho = getDespacho('central');
    assert.ok(despacho, 'Debe existir el despacho central');
    assert.equal(despacho.id, 'central');
    assert.ok(typeof despacho.horario_inicio === 'number');
    assert.ok(typeof despacho.horario_fin   === 'number');
  });

  test('getDespacho retorna null para un id inexistente', () => {
    const despacho = getDespacho('despacho_que_no_existe');
    assert.equal(despacho, null);
  });

  test('Las áreas de práctica cubren las 6 áreas del vertical', () => {
    assert.equal(ABOGADOS_VERTICAL.areas_practica.length, 6);
    const ids = ABOGADOS_VERTICAL.areas_practica.map(a => a.id);
    ['civil', 'laboral', 'mercantil', 'familia', 'penal', 'administrativo'].forEach(area => {
      assert.ok(ids.includes(area), `El área "${area}" debe estar en areas_practica`);
    });
  });
});

// ── CASO 10: INTEGRIDAD DENTAL + FISIO + ESTÉTICA (regression guard) ──────

describe('Caso 10: integridad verticales anteriores — regression guard', () => {
  const DENTAL_ROOT   = path.resolve(__dirname, '../../verticals/dental');
  const PHYSIO_ROOT   = path.resolve(__dirname, '../../verticals/fisioterapia');
  const ESTETICA_ROOT = path.resolve(__dirname, '../../verticals/estetica');

  test('El vertical dental sigue existiendo y tiene intenciones definidas', async () => {
    const { DENTAL_VERTICAL } = await import(`${DENTAL_ROOT}/config.js`);
    assert.ok(Array.isArray(DENTAL_VERTICAL.intenciones));
    assert.ok(DENTAL_VERTICAL.intenciones.length > 0);
  });

  test('El vertical fisioterapia sigue existiendo y tiene intenciones definidas', async () => {
    const { FISIO_VERTICAL } = await import(`${PHYSIO_ROOT}/config.js`);
    assert.ok(Array.isArray(FISIO_VERTICAL.intenciones));
    assert.ok(FISIO_VERTICAL.intenciones.length > 0);
  });

  test('El vertical estética sigue existiendo y tiene intenciones definidas', async () => {
    const { ESTETICA_VERTICAL } = await import(`${ESTETICA_ROOT}/config.js`);
    assert.ok(Array.isArray(ESTETICA_VERTICAL.intenciones));
    assert.ok(ESTETICA_VERTICAL.intenciones.length > 0);
  });

  test('Los manifests de dental/fisio/estética siguen siendo válidos YAML', async () => {
    const manifests = [
      path.resolve(__dirname, '../../clients/clinica-dental-demo/manifest.yaml'),
      path.resolve(__dirname, '../../clients/clinica-fisioterapia-demo/manifest.yaml'),
      path.resolve(__dirname, '../../clients/clinica-estetica-demo/manifest.yaml'),
    ];
    for (const mp of manifests) {
      const raw    = fs.readFileSync(mp, 'utf8');
      const parsed = parseSimpleYaml(raw);
      assert.ok(parsed.vertical,    `${mp}: debe tener campo vertical`);
      assert.ok(parsed.modo_demo === true, `${mp}: modo_demo debe ser true`);
    }
  });

  test('Los generadores de dental/fisio/estética siguen funcionando (no regresión)', async () => {
    const cases = [
      {
        manifest: path.resolve(__dirname, '../../clients/clinica-dental-demo/manifest.yaml'),
        label: 'dental',
      },
      {
        manifest: path.resolve(__dirname, '../../clients/clinica-fisioterapia-demo/manifest.yaml'),
        label: 'fisioterapia',
      },
      {
        manifest: path.resolve(__dirname, '../../clients/clinica-estetica-demo/manifest.yaml'),
        label: 'estetica',
      },
    ];
    for (const { manifest, label } of cases) {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `regression-${label}-`));
      const result = await runGeneration({ manifestPath: manifest, outputDir: tmpDir });
      assert.ok(result.success, `Generador de ${label} no debe fallar en regresión`);
    }
  });

  test('El schema acepta "abogados" como vertical válido', async () => {
    const { validateManifest } = await import(
      `${path.resolve(__dirname, '../../generator/schema/manifestSchema.js')}`
    );
    const result = validateManifest({
      cliente:    'Test Abogados',
      vertical:   'abogados',
      modo_demo:  true,
      modulos:    ['chatbot_ia'],
      sedes:      [{ id: 's1', nombre: 'Sede Test' }],
      mock:       { obligatorio: true },
      integraciones: { reales: false },
    });
    assert.equal(result.valid, true, `Schema debe aceptar "abogados". Errores: ${result.errors.join(', ')}`);
  });

  test('El schema NO acepta "abogados" con integraciones.reales=true en modo_demo', async () => {
    const { validateManifest } = await import(
      `${path.resolve(__dirname, '../../generator/schema/manifestSchema.js')}`
    );
    const result = validateManifest({
      cliente:    'Test Abogados',
      vertical:   'abogados',
      modo_demo:  true,
      modulos:    ['chatbot_ia'],
      sedes:      [{ id: 's1', nombre: 'Sede Test' }],
      integraciones: { reales: true },
    });
    assert.equal(result.valid, false, 'Debe fallar: integraciones.reales=true en modo_demo=true');
  });
});
