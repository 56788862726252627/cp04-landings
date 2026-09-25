/**
 * GENERATOR · Tests del vertical estética / medicina estética
 * node:test built-in. Sin dependencias externas. Sin llamadas a APIs.
 *
 * Casos:
 * 1. Consulta inicial gratuita
 * 2. Depilación láser con zona corporal
 * 3. Lifting sin cirugía
 * 4. Caso sensible manchas: no diagnostica, deriva a dermatólogo
 * 5. Precio/pack — flujo corto
 * 6. Cambio/cancelación — flujo corto
 * 7. Abandono y recuperación de lead estética
 * 8. Generación manifest/runtime para estética (idempotente)
 * 9. Auditoría de datos ficticios estética
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERTICAL_ROOT  = path.resolve(__dirname, '../../verticals/estetica');
const GENERATOR_ROOT = path.resolve(__dirname, '../../generator');
const CLIENT_ROOT    = path.resolve(__dirname, '../../clients/clinica-estetica-demo');

const {
  ESTETICA_VERTICAL,
  detectaSensibleEstetica,
  getIntencionEstetica,
  getCentroEstetica,
  getProfesionalEstetica,
  estaEnHorarioEstetica,
} = await import(`${VERTICAL_ROOT}/config.js`);

const {
  MOCK_CLIENTES_ESTETICA,
  MOCK_METRICAS_ESTETICA,
  MOCK_LEADS_ABANDONO_ESTETICA,
  MOCK_SLOTS_ESTETICA,
  MOCK_SEGUIMIENTO_ESTETICA,
} = await import(`${VERTICAL_ROOT}/mockData.js`);

const { runGeneration, parseSimpleYaml } = await import(
  `${GENERATOR_ROOT}/scripts/generate.mjs`
);

// ── CASO 1: CONSULTA INICIAL ───────────────────────────────────────────────

describe('Caso 1: consulta_inicial', () => {
  const int = getIntencionEstetica('consulta_inicial');

  test('La intención consulta_inicial existe en el vertical estética', () => {
    assert.ok(int, 'Debe existir consulta_inicial');
  });

  test('consulta_inicial NO muestra pack (primera consulta sin coste)', () => {
    assert.equal(int.mostrar_pack, false);
  });

  test('consulta_inicial NO es sensible', () => {
    assert.equal(int.sensible, false);
  });

  test('consulta_inicial NO es flujo corto', () => {
    assert.equal(int.flujo_corto, false);
  });

  test('El vertical tiene al menos 2 centros con horario definido', () => {
    const centrosConHorario = ESTETICA_VERTICAL.centros.filter(
      c => typeof c.horario_inicio === 'number' && typeof c.horario_fin === 'number'
    );
    assert.ok(centrosConHorario.length >= 2);
  });
});

// ── CASO 2: DEPILACIÓN LÁSER CON ZONA ─────────────────────────────────────

describe('Caso 2: depilacion_laser con zona corporal', () => {
  const int = getIntencionEstetica('depilacion_laser');

  test('La intención depilacion_laser existe', () => {
    assert.ok(int, 'Debe existir depilacion_laser');
  });

  test('depilacion_laser activa flujo de zona (mostrar_zona = true)', () => {
    assert.equal(int.mostrar_zona, true);
  });

  test('depilacion_laser muestra pack de sesiones', () => {
    assert.equal(int.mostrar_pack, true);
  });

  test('Hay zonas de depilación definidas (mínimo 4)', () => {
    assert.ok(ESTETICA_VERTICAL.zonas_depilacion.length >= 4);
  });

  test('Cada zona tiene id, label y sesiones_estimadas', () => {
    ESTETICA_VERTICAL.zonas_depilacion.forEach(z => {
      assert.ok(z.id,                'zona debe tener id');
      assert.ok(z.label,             'zona debe tener label');
      assert.ok(z.sesiones_estimadas > 0, 'sesiones_estimadas debe ser > 0');
    });
  });

  test('El pack destacado (pack_6) existe y es adecuado para depilación', () => {
    const pack = ESTETICA_VERTICAL.packs.find(p => p.destacado);
    assert.ok(pack, 'Debe existir al menos un pack destacado');
    assert.ok(pack.sesiones >= 6, 'El pack destacado debe tener >= 6 sesiones');
  });
});

// ── CASO 3: LIFTING SIN CIRUGÍA ────────────────────────────────────────────

describe('Caso 3: lifting_sin_cirugia', () => {
  const int = getIntencionEstetica('lifting_sin_cirugia');

  test('La intención lifting_sin_cirugia existe', () => {
    assert.ok(int, 'Debe existir lifting_sin_cirugia');
  });

  test('lifting_sin_cirugia NO es sensible (no requiere derivación)', () => {
    assert.equal(int.sensible, false);
  });

  test('lifting_sin_cirugia NO muestra pack por defecto', () => {
    assert.equal(int.mostrar_pack, false);
  });

  test('El vertical tiene profesionales con especialidad facial', () => {
    const facial = ESTETICA_VERTICAL.profesionales.find(p =>
      p.especialidad.toLowerCase().includes('facial')
    );
    assert.ok(facial, 'Debe haber al menos un profesional con especialidad facial');
  });

  test('Los profesionales ficticios indican "(fictici...)" en el nombre', () => {
    const conIndicador = ESTETICA_VERTICAL.profesionales.filter(
      p => p.nombre.toLowerCase().includes('fictici')
    );
    const reales = ESTETICA_VERTICAL.profesionales.filter(p => p.id !== 'cualquiera');
    assert.equal(conIndicador.length, reales.length,
      'Todos los profesionales reales deben indicar que son ficticios');
  });
});

// ── CASO 4: SENSIBLE MANCHAS → DERIVA A DERMATÓLOGO ───────────────────────

describe('Caso 4: manchas sensible — no diagnostica, deriva', () => {
  const int = getIntencionEstetica('eliminacion_manchas');

  test('eliminacion_manchas está marcada como sensible', () => {
    assert.equal(int.sensible, true);
  });

  test('eliminacion_manchas tiene mensaje de derivación específico', () => {
    assert.ok(int.mensaje_derivacion_especifico?.length > 20);
  });

  test('El mensaje de derivación menciona dermatólogo', () => {
    assert.ok(
      int.mensaje_derivacion_especifico.toLowerCase().includes('dermatol'),
      'El mensaje debe mencionar dermatólogo o dermatológica'
    );
  });

  test('detectaSensibleEstetica detecta keyword "melanoma"', () => {
    assert.equal(detectaSensibleEstetica('Tengo una mancha con posible melanoma'), true);
  });

  test('detectaSensibleEstetica detecta "cáncer de piel"', () => {
    assert.equal(detectaSensibleEstetica('Me preocupa un lunar, podría ser cáncer de piel'), true);
  });

  test('detectaSensibleEstetica detecta "cirugía"', () => {
    assert.equal(detectaSensibleEstetica('Quiero hacerme una cirugía'), true);
  });

  test('detectaSensibleEstetica NO dispara en texto normal de estética', () => {
    assert.equal(detectaSensibleEstetica('Me gustaría un tratamiento facial antiedad'), false);
  });

  test('detectaSensibleEstetica NO dispara en texto vacío', () => {
    assert.equal(detectaSensibleEstetica(''), false);
    assert.equal(detectaSensibleEstetica(null), false);
  });

  test('seguridad_clinica: diagnostico=false, prescripcion=false, promesa_resultado=false', () => {
    const sc = ESTETICA_VERTICAL.seguridad_clinica;
    assert.equal(sc.diagnostico,        false);
    assert.equal(sc.prescripcion,       false);
    assert.equal(sc.promesa_resultado,  false);
  });

  test('seguridad_clinica: derivar_a_dermatologo_si_sensible=true', () => {
    assert.equal(ESTETICA_VERTICAL.seguridad_clinica.derivar_a_dermatologo_si_sensible, true);
  });

  test('keywords sensibles incluyen al menos 10 términos', () => {
    assert.ok(ESTETICA_VERTICAL.seguridad_clinica.keywords_sensibles.length >= 10);
  });
});

// ── CASO 5: PRECIO/PACK — FLUJO CORTO ──────────────────────────────────────

describe('Caso 5: precio_pack — flujo corto', () => {
  const int = getIntencionEstetica('precio_pack');

  test('precio_pack tiene flujo_corto=true', () => {
    assert.equal(int.flujo_corto, true);
  });

  test('precio_pack tiene mensaje_flujo_corto definido', () => {
    assert.ok(int.mensaje_flujo_corto?.length > 10);
  });

  test('Hay al menos 3 packs definidos', () => {
    assert.ok(ESTETICA_VERTICAL.packs.length >= 3);
  });

  test('Cada pack tiene id, label, precio ficticio y sesiones', () => {
    ESTETICA_VERTICAL.packs.forEach(pk => {
      assert.ok(pk.id,                       'pack debe tener id');
      assert.ok(pk.label,                    'pack debe tener label');
      assert.ok(pk.precio.includes('ficticio'), 'precio debe indicar que es ficticio');
      assert.ok(pk.sesiones >= 1,            'pack debe tener al menos 1 sesión');
    });
  });
});

// ── CASO 6: CAMBIO/CANCELACIÓN — FLUJO CORTO ──────────────────────────────

describe('Caso 6: cambio_cancelacion — flujo corto', () => {
  const int = getIntencionEstetica('cambio_cancelacion');

  test('cambio_cancelacion tiene flujo_corto=true', () => {
    assert.equal(int.flujo_corto, true);
  });

  test('cambio_cancelacion NO muestra pack', () => {
    assert.equal(int.mostrar_pack, false);
  });

  test('cambio_cancelacion tiene mensaje_flujo_corto', () => {
    assert.ok(int.mensaje_flujo_corto?.length > 10);
  });
});

// ── CASO 7: ABANDONO Y RECUPERACIÓN DE LEAD ───────────────────────────────

describe('Caso 7: abandono y recuperación de lead estética', () => {
  test('Hay leads de abandono definidos (mínimo 2)', () => {
    assert.ok(MOCK_LEADS_ABANDONO_ESTETICA.length >= 2);
  });

  test('Hay al menos un lead "en_proceso" y otro "recuperado"', () => {
    const enProceso = MOCK_LEADS_ABANDONO_ESTETICA.some(l => l.estado === 'en_proceso');
    const recuperado = MOCK_LEADS_ABANDONO_ESTETICA.some(l => l.estado === 'recuperado');
    assert.ok(enProceso,   'Debe haber al menos un lead en_proceso');
    assert.ok(recuperado,  'Debe haber al menos un lead recuperado');
  });

  test('Cada lead tiene accion_sugerida definida', () => {
    MOCK_LEADS_ABANDONO_ESTETICA.forEach(l => {
      assert.ok(l.accion_sugerida?.length > 5, `Lead ${l.id} debe tener accion_sugerida`);
    });
  });

  test('Hay slots disponibles para agendar sesiones (mínimo 2)', () => {
    const disponibles = MOCK_SLOTS_ESTETICA.filter(s => s.disponible);
    assert.ok(disponibles.length >= 2);
  });

  test('Las campañas activas tienen leads_generados > 0', () => {
    const activas = ESTETICA_VERTICAL.campanas.filter(c => c.activa);
    activas.forEach(c => {
      assert.ok(c.leads_generados > 0, `Campaña "${c.titulo}" activa debe tener leads_generados > 0`);
    });
  });
});

// ── CASO 8: GENERACIÓN MANIFEST/RUNTIME + IDEMPOTENCIA ─────────────────────

describe('Caso 7: generación manifest/runtime para estética', () => {
  let tmpDir;

  test('El manifest del cliente estética es válido YAML con campos requeridos', async () => {
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const parsed = parseSimpleYaml(raw);
    assert.equal(parsed.vertical, 'estetica');
    assert.equal(parsed.modo_demo, true);
    assert.ok(Array.isArray(parsed.modulos));
  });

  test('El generador crea el runtime para estética sin errores', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'estetica-gen-'));
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const result = await runGeneration({ manifestPath, outputDir: tmpDir });
    assert.ok(result.success, `Generación debe ser exitosa. Errores: ${result.errors.join(', ')}`);
    assert.ok(fs.existsSync(path.join(tmpDir, 'runtime-config.js')), 'El archivo runtime debe crearse');
  });

  test('El runtime generado contiene el nombre del cliente y el vertical', async () => {
    const content = fs.readFileSync(path.join(tmpDir, 'runtime-config.js'), 'utf8');
    assert.ok(content.includes('estetica'),              'Debe mencionar el vertical estetica');
    assert.ok(content.includes('Clínica Estética Demo'), 'Debe incluir el nombre del cliente');
  });

  test('El runtime generado tiene la cabecera de no editar manualmente', async () => {
    const content = fs.readFileSync(path.join(tmpDir, 'runtime-config.js'), 'utf8');
    assert.ok(content.includes('NO EDITAR MANUALMENTE'), 'Debe incluir aviso de no editar');
  });
});

describe('Caso 8: idempotencia del generador para estética', () => {
  test('Segunda ejecución del generador no genera cambios si el contenido no cambia', async () => {
    const tmpDir2      = fs.mkdtempSync(path.join(os.tmpdir(), 'estetica-idem-'));
    const manifestPath = path.join(CLIENT_ROOT, 'manifest.yaml');
    const runtimePath  = path.join(tmpDir2, 'runtime-config.js');

    await runGeneration({ manifestPath, outputDir: tmpDir2 });
    const contenido1 = fs.readFileSync(runtimePath, 'utf8');

    await runGeneration({ manifestPath, outputDir: tmpDir2 });
    const contenido2 = fs.readFileSync(runtimePath, 'utf8');

    assert.equal(contenido1, contenido2, 'El contenido generado debe ser idéntico en ambas ejecuciones');
  });
});

// ── AUDITORÍA GENERAL DE DATOS FICTICIOS ──────────────────────────────────

describe('Auditoría general de datos ficticios estética', () => {
  test('MOCK_CLIENTES_ESTETICA tiene exactamente 5 clientes', () => {
    assert.equal(MOCK_CLIENTES_ESTETICA.length, 5);
  });

  test('Todos los emails de clientes son ficticios (@demo.ficticio)', () => {
    MOCK_CLIENTES_ESTETICA.forEach(c => {
      assert.ok(
        c.email.endsWith('@demo.ficticio'),
        `Email de ${c.nombre} debe ser @demo.ficticio, got: ${c.email}`
      );
    });
  });

  test('Todos los teléfonos de clientes son ficticios (prefijo 600 000)', () => {
    MOCK_CLIENTES_ESTETICA.forEach(c => {
      assert.ok(
        c.telefono.startsWith('600 000'),
        `Teléfono de ${c.nombre} debe empezar por "600 000", got: ${c.telefono}`
      );
    });
  });

  test('Las métricas de estética incluyen pipeline con € y etiqueta ficticio', () => {
    assert.ok(MOCK_METRICAS_ESTETICA.valor_pipeline.includes('€'));
    assert.ok(MOCK_METRICAS_ESTETICA.valor_pipeline.includes('ficticio'));
  });

  test('Los nombres de profesionales ficticios indican "(fictici...)" como indicador', () => {
    const reales = ESTETICA_VERTICAL.profesionales.filter(p => p.id !== 'cualquiera');
    reales.forEach(p => {
      assert.ok(
        p.nombre.toLowerCase().includes('fictici'),
        `Profesional "${p.nombre}" debe indicar que es ficticio/ficticia`
      );
    });
  });

  test('Las campañas tienen al menos 2 activas y 1 inactiva', () => {
    const activas   = ESTETICA_VERTICAL.campanas.filter(c => c.activa);
    const inactivas = ESTETICA_VERTICAL.campanas.filter(c => !c.activa);
    assert.ok(activas.length >= 2,   'Debe haber al menos 2 campañas activas');
    assert.ok(inactivas.length >= 1, 'Debe haber al menos 1 campaña inactiva');
  });

  test('El seguimiento de sesiones tiene registros ficticios', () => {
    assert.ok(MOCK_SEGUIMIENTO_ESTETICA.length >= 1);
    MOCK_SEGUIMIENTO_ESTETICA.forEach(s => {
      assert.ok(s.tratamiento, 'Registro de seguimiento debe tener tratamiento');
      assert.ok(s.profesional,  'Registro de seguimiento debe tener profesional');
    });
  });

  test('Ningún dato del vertical contiene secretos o credenciales', () => {
    const verticalStr = JSON.stringify(ESTETICA_VERTICAL);
    const mockStr     = JSON.stringify({
      MOCK_CLIENTES_ESTETICA,
      MOCK_METRICAS_ESTETICA,
      MOCK_LEADS_ABANDONO_ESTETICA,
    });
    assert.ok(!verticalStr.toLowerCase().includes('token'),    'No debe contener token');
    assert.ok(!verticalStr.toLowerCase().includes('password'), 'No debe contener password');
    assert.ok(!mockStr.toLowerCase().includes('api_key'),      'No debe contener api_key');
    assert.ok(!mockStr.toLowerCase().includes('secret'),       'No debe contener secret');
  });
});
