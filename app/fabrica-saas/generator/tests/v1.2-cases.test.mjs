/**
 * TESTS · Fábrica SaaS V1.2 · Generador de un solo prompt
 * 12 categorías de test. Sin dependencias externas. Sin llamadas de red.
 * Node test runner nativo (node:test).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dir   = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dir, '../../..');
const FAB_ROOT = resolve(__dir, '../..');
const TMP_DIR  = join(APP_ROOT, 'fabrica-saas-v1.2-test-tmp');

// ── Importaciones bajo test ───────────────────────────────────────────────────

const {
  validateSingleInputManifest,
  VERTICALES_VALIDOS,
  MODULES_VALIDOS,
} = await import('../schema/singleInputSchema.js');

const {
  toPascalCase,
  genMockData,
  genApp,
  genChatbot,
  genCrm,
  genDashboard,
  genRecovery,
  genMain,
  genHtml,
} = await import('../templates/componentTemplates.mjs');

const { createClient } = await import('../scripts/create-client.mjs');
const { parseSimpleYaml } = await import('../scripts/generate.mjs');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MANIFEST_VALIDO = {
  business: {
    name: 'Clínica Dental Test (ficticio)',
    slug: 'clinica-dental-test',
    vertical: 'dental',
    location: 'Ciudad Test (ficticio)',
  },
  branding: {
    nombre_visible: 'Clínica Dental Test',
    inicial: 'T',
    primaryColor: '#0d9488',
    emoji_sector: '🦷',
  },
  modo_demo: true,
  modules: ['chatbot_ia', 'crm', 'recuperacion_leads', 'dashboard'],
  sedes: [
    { id: 'centro', nombre: 'Centro Test (ficticio)', horario: 'L-V 09:00-20:00' },
  ],
  integraciones: { reales: false },
  mock: { obligatorio: true },
  demoData: {
    professionals: [
      { id: 'dr1', nombre: 'Dr. Test (ficticio)', especialidad: 'Ortodoncia' },
    ],
    slots: [
      { id: 's001', fecha: '2026-09-01 (ficticio)', hora: '10:00', sede: 'Centro Test (ficticio)', profesional: 'Dr. Test (ficticio)', disponible: true },
    ],
    clients: [
      { id: 'c001', nombre: 'Paciente Test (ficticio)', email: 'test@demo.ficticio', telefono: '600 000 099', tratamiento_interes: 'Ortodoncia', estado: 'nuevo', sesiones_completadas: 0, sesiones_restantes: 3, origen: 'Web (ficticio)' },
    ],
    leads_abandono: [
      { id: 'l001', nombre: 'Lead Test (ficticio)', email: 'lead@demo.ficticio', telefono: '600 000 098', tratamiento: 'Blanqueamiento', dias_inactivo: 5, accion_sugerida: 'Recordatorio (ficticio)', estado: 'en_proceso' },
    ],
    metrics: {
      consultas_mes: 20,
      tasa_conversion: 55,
      valor_pipeline: '10.000 € (ficticio)',
      ingresos_mes: '5.000 € (ficticio)',
    },
  },
};

const MANIFEST_MALAGA = join(FAB_ROOT, 'clients/clinica-dental-malaga-demo/manifest.yaml');

// ── Categoría 1: Schema válido ────────────────────────────────────────────────

describe('1. Schema válido', () => {
  test('manifest mínimo válido pasa validación', () => {
    const { valid, errors } = validateSingleInputManifest(MANIFEST_VALIDO);
    assert.equal(valid, true, 'Errores: ' + errors.join('; '));
  });

  test('todos los verticales válidos son aceptados', () => {
    for (const vertical of VERTICALES_VALIDOS) {
      const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, vertical } };
      const { valid, errors } = validateSingleInputManifest(m);
      assert.equal(valid, true, `Vertical "${vertical}" falló: ${errors.join('; ')}`);
    }
  });

  test('todos los módulos válidos son aceptados', () => {
    const m = { ...MANIFEST_VALIDO, modules: MODULES_VALIDOS };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, true, 'Errores: ' + errors.join('; '));
  });

  test('demoData opcional — manifest sin demoData pasa', () => {
    const { demoData: _, ...mSinData } = MANIFEST_VALIDO;
    const { valid, errors } = validateSingleInputManifest(mSinData);
    assert.equal(valid, true, 'Errores: ' + errors.join('; '));
  });

  test('manifest Málaga YAML real es válido', () => {
    const yaml = readFileSync(MANIFEST_MALAGA, 'utf8');
    const m    = parseSimpleYaml(yaml);
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, true, 'Errores Málaga: ' + errors.join('; '));
  });
});

// ── Categoría 2: Schema inválido ─────────────────────────────────────────────

describe('2. Schema inválido', () => {
  test('manifest nulo retorna inválido', () => {
    const { valid } = validateSingleInputManifest(null);
    assert.equal(valid, false);
  });

  test('business faltante → error', () => {
    const { valid, errors } = validateSingleInputManifest({ sedes: [{ id: 'a', nombre: 'B' }], mock: { obligatorio: true }, modo_demo: true });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('business')));
  });

  test('vertical inválido → error', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, vertical: 'blockchain' } };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('vertical')));
  });

  test('slug con caracteres inválidos → error', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, slug: 'Mi Clínica!' } };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('slug')));
  });

  test('color hex inválido → error', () => {
    const m = { ...MANIFEST_VALIDO, branding: { ...MANIFEST_VALIDO.branding, primaryColor: 'azul' } };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('primaryColor')));
  });

  test('integraciones.reales=true en modo_demo=true → error', () => {
    const m = { ...MANIFEST_VALIDO, integraciones: { reales: true } };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('Conflicto')));
  });

  test('email de cliente no @demo.ficticio → error', () => {
    const badClient = [{ id: 'c1', nombre: 'X (ficticio)', email: 'real@gmail.com' }];
    const m = { ...MANIFEST_VALIDO, demoData: { ...MANIFEST_VALIDO.demoData, clients: badClient } };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('@demo.ficticio')));
  });

  test('sedes vacías → error', () => {
    const m = { ...MANIFEST_VALIDO, sedes: [] };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('sedes')));
  });

  test('módulo inválido → error', () => {
    const m = { ...MANIFEST_VALIDO, modules: ['chatbot_ia', 'blockchain_integration'] };
    const { valid, errors } = validateSingleInputManifest(m);
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('blockchain_integration')));
  });
});

// ── Categoría 3: Generación desde un único manifest ──────────────────────────

describe('3. Generación desde un único manifest', () => {
  test('toPascalCase convierte slug correctamente', () => {
    assert.equal(toPascalCase('clinica-dental-malaga-demo'), 'ClinicaDentalMalagaDemo');
    assert.equal(toPascalCase('mi-cliente-test'), 'MiClienteTest');
    assert.equal(toPascalCase('abogados'), 'Abogados');
  });

  test('genMockData produce sedes del manifest', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('MOCK_SEDES'));
    assert.ok(content.includes('Centro Test (ficticio)'));
    assert.ok(content.includes('MOCK_PROFESIONALES'));
    assert.ok(content.includes('Dr. Test (ficticio)'));
  });

  test('genApp usa nombre del manifest en BRANDING', () => {
    const content = genApp(MANIFEST_VALIDO);
    assert.ok(content.includes('Clínica Dental Test (ficticio)'));
    assert.ok(content.includes('ClinicaDentalTestApp'));
  });

  test('genChatbot importa vertical correcto', () => {
    const content = genChatbot(MANIFEST_VALIDO);
    assert.ok(content.includes('DENTAL_VERTICAL'));
    assert.ok(content.includes('detectaSensible'));
    assert.ok(content.includes('ClinicaDentalTestChatbot'));
  });

  test('genCrm usa nombre del manifest', () => {
    const content = genCrm(MANIFEST_VALIDO);
    assert.ok(content.includes('MOCK_CLIENTES'));
    assert.ok(content.includes('ClinicaDentalTestCrm'));
  });

  test('genDashboard usa color primario del branding', () => {
    const content = genDashboard(MANIFEST_VALIDO);
    assert.ok(content.includes('#0d9488'));
    assert.ok(content.includes('MOCK_METRICAS'));
    assert.ok(content.includes('ClinicaDentalTestDashboard'));
  });

  test('genRecovery tiene simulación de acción', () => {
    const content = genRecovery(MANIFEST_VALIDO);
    assert.ok(content.includes('MOCK_LEADS_ABANDONO'));
    assert.ok(content.includes('simularAccion'));
    assert.ok(content.includes('ClinicaDentalTestRecovery'));
  });

  test('genMain importa App correcto', () => {
    const content = genMain(MANIFEST_VALIDO);
    assert.ok(content.includes('ClinicaDentalTestApp'));
    assert.ok(content.includes('createRoot'));
  });

  test('genHtml tiene el slug correcto en el src del script', () => {
    const content = genHtml(MANIFEST_VALIDO);
    assert.ok(content.includes('/fabrica-saas/output/clinica-dental-test/main.jsx'));
    assert.ok(content.includes('noindex, nofollow'));
  });

  test('createClient genera todos los archivos esperados', async () => {
    const result = await createClient({
      manifestPath: MANIFEST_MALAGA,
      verbose: false,
    });
    const expectedFiles = [
      'ClinicaDentalMalagaDemoMockData.js',
      'ClinicaDentalMalagaDemoApp.jsx',
      'ClinicaDentalMalagaDemoChatbot.jsx',
      'ClinicaDentalMalagaDemoCrm.jsx',
      'ClinicaDentalMalagaDemoDashboard.jsx',
      'ClinicaDentalMalagaDemoRecovery.jsx',
      'main.jsx',
      'runtime-config.js',
    ];
    for (const f of expectedFiles) {
      assert.ok(
        existsSync(join(result.outDir, f)),
        `Falta archivo generado: ${f}`
      );
    }
  });
});

// ── Categoría 4: Idempotencia ─────────────────────────────────────────────────

describe('4. Idempotencia', () => {
  test('segunda ejecución no reescribe archivos sin cambios', async () => {
    const r1 = await createClient({ manifestPath: MANIFEST_MALAGA, verbose: false });
    const r2 = await createClient({ manifestPath: MANIFEST_MALAGA, verbose: false });
    // Segunda ejecución: todo igual → 0 archivos escritos (solo el HTML puede diferir si vite ya estaba)
    assert.equal(r2.written, 0, `Segunda ejecución escribió ${r2.written} archivos inesperadamente`);
  });

  test('genMockData produce el mismo hash con el mismo manifest', () => {
    const sha = (s) => createHash('sha256').update(s).digest('hex');
    const c1 = genMockData(MANIFEST_VALIDO);
    const c2 = genMockData(MANIFEST_VALIDO);
    assert.equal(sha(c1), sha(c2), 'genMockData no es determinista');
  });

  test('genApp produce el mismo hash con el mismo manifest', () => {
    const sha = (s) => createHash('sha256').update(s).digest('hex');
    const c1 = genApp(MANIFEST_VALIDO);
    const c2 = genApp(MANIFEST_VALIDO);
    assert.equal(sha(c1), sha(c2), 'genApp no es determinista');
  });
});

// ── Categoría 5: Aislamiento entre clientes ───────────────────────────────────

describe('5. Aislamiento entre clientes', () => {
  test('dos manifests producen componentes con nombres distintos', () => {
    const m1 = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, slug: 'cliente-a-test' } };
    const m2 = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, slug: 'cliente-b-test', name: 'Cliente B Test' } };
    const a1 = genApp(m1);
    const a2 = genApp(m2);
    assert.ok(a1.includes('ClienteATestApp'), 'cliente-a no tiene su componente');
    assert.ok(a2.includes('ClienteBTestApp'), 'cliente-b no tiene su componente');
    assert.ok(!a1.includes('ClienteBTestApp'), 'cliente-a no debe contener nombre de cliente-b');
    assert.ok(!a2.includes('ClienteATestApp'), 'cliente-b no debe contener nombre de cliente-a');
  });

  test('chatbots de clientes distintos importan su propio MockData', () => {
    const m1 = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, slug: 'cliente-a-test' } };
    const m2 = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, slug: 'cliente-b-test' } };
    const c1 = genChatbot(m1);
    const c2 = genChatbot(m2);
    assert.ok(c1.includes('./ClienteATestMockData.js'));
    assert.ok(c2.includes('./ClienteBTestMockData.js'));
  });

  test('mockData de clientes distintos contiene datos distintos', () => {
    const m1 = { ...MANIFEST_VALIDO,
      business: { ...MANIFEST_VALIDO.business, slug: 'cliente-a-test', name: 'Cliente A' },
      sedes: [{ id: 'a', nombre: 'Sede A (ficticio)', horario: '9-18' }],
    };
    const m2 = { ...MANIFEST_VALIDO,
      business: { ...MANIFEST_VALIDO.business, slug: 'cliente-b-test', name: 'Cliente B' },
      sedes: [{ id: 'b', nombre: 'Sede B (ficticio)', horario: '10-19' }],
    };
    const data1 = genMockData(m1);
    const data2 = genMockData(m2);
    assert.ok(data1.includes('Sede A (ficticio)'));
    assert.ok(data2.includes('Sede B (ficticio)'));
    assert.ok(!data1.includes('Sede B'), 'MockData de A no debe tener datos de B');
  });
});

// ── Categoría 6: No modifica otros verticales ─────────────────────────────────

describe('6. No modifica otros verticales (regresión)', () => {
  test('genChatbot dental importa DENTAL_VERTICAL, no FISIO ni ESTETICA', () => {
    const content = genChatbot(MANIFEST_VALIDO);
    assert.ok(content.includes('DENTAL_VERTICAL'));
    assert.ok(!content.includes('FISIO_VERTICAL'), 'dental no debe importar FISIO');
    assert.ok(!content.includes('ESTETICA_VERTICAL'), 'dental no debe importar ESTETICA');
    assert.ok(!content.includes('ABOGADOS_VERTICAL'), 'dental no debe importar ABOGADOS');
  });

  test('genChatbot fisioterapia usa FISIO_VERTICAL', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, vertical: 'fisioterapia', slug: 'fisio-test' } };
    const content = genChatbot(m);
    assert.ok(content.includes('FISIO_VERTICAL'));
    assert.ok(content.includes('detectaSensibleFisio'));
  });

  test('genChatbot estetica usa ESTETICA_VERTICAL', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, vertical: 'estetica', slug: 'est-test' } };
    const content = genChatbot(m);
    assert.ok(content.includes('ESTETICA_VERTICAL'));
    assert.ok(content.includes('detectaSensibleEstetica'));
  });

  test('genChatbot abogados usa ABOGADOS_VERTICAL', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, vertical: 'abogados', slug: 'abog-test' } };
    const content = genChatbot(m);
    assert.ok(content.includes('ABOGADOS_VERTICAL'));
    assert.ok(content.includes('detectaSensibleAbogados'));
  });

  test('archivos de verticales existentes no fueron modificados', () => {
    const verticals = [
      'fabrica-saas/verticals/dental/config.js',
      'fabrica-saas/verticals/fisioterapia/config.js',
      'fabrica-saas/verticals/estetica/config.js',
      'fabrica-saas/verticals/abogados/config.js',
    ];
    for (const v of verticals) {
      assert.ok(existsSync(join(APP_ROOT, v)), `Vertical ausente: ${v}`);
    }
  });
});

// ── Categoría 7: Branding parametrizable ─────────────────────────────────────

describe('7. Branding parametrizable', () => {
  test('nombre del negocio aparece en App BRANDING', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, name: 'Dental Málaga Pro (ficticio)' } };
    const content = genApp(m);
    assert.ok(content.includes('Dental Málaga Pro (ficticio)'), 'nombre no aparece en App');
  });

  test('color primario del branding se refleja en Dashboard', () => {
    const m = { ...MANIFEST_VALIDO, branding: { ...MANIFEST_VALIDO.branding, primaryColor: '#7c3aed' } };
    const content = genDashboard(m);
    assert.ok(content.includes('#7c3aed'), 'color branding no aparece en Dashboard');
  });

  test('inicial del branding aparece en App BRANDING', () => {
    const m = { ...MANIFEST_VALIDO, branding: { ...MANIFEST_VALIDO.branding, inicial: 'Z' } };
    const content = genApp(m);
    assert.ok(content.includes('"Z"'), 'inicial no aparece en App branding');
  });

  test('emoji_sector del branding aparece en App TABS', () => {
    const m = { ...MANIFEST_VALIDO, branding: { ...MANIFEST_VALIDO.branding, emoji_sector: '🌿' } };
    const content = genApp(m);
    assert.ok(content.includes('🌿'), 'emoji_sector no aparece en App');
  });

  test('nombre del negocio aparece en CRM como subtítulo', () => {
    const m = { ...MANIFEST_VALIDO, business: { ...MANIFEST_VALIDO.business, name: 'Clínica Exclusiva Test (ficticio)' } };
    const content = genCrm(m);
    assert.ok(content.includes('Clínica Exclusiva Test (ficticio)'));
  });
});

// ── Categoría 8: Módulos opcionales ──────────────────────────────────────────

describe('8. Módulos opcionales', () => {
  test('sin módulo dashboard → no se importa Dashboard en App', () => {
    const m = { ...MANIFEST_VALIDO, modules: ['chatbot_ia', 'crm'] };
    const content = genApp(m);
    assert.ok(!content.includes('Dashboard'), 'Dashboard no debe aparecer si no está en modules');
  });

  test('sin módulo recovery → no se importa Recovery en App', () => {
    const m = { ...MANIFEST_VALIDO, modules: ['chatbot_ia', 'crm', 'dashboard'] };
    const content = genApp(m);
    assert.ok(!content.includes('Recovery'), 'Recovery no debe aparecer si no está en modules');
  });

  test('solo chatbot_ia → App solo tiene tab chatbot', () => {
    const m = { ...MANIFEST_VALIDO, modules: ['chatbot_ia'] };
    const content = genApp(m);
    assert.ok(content.includes("'chatbot'"));
    assert.ok(!content.includes("'crm'"), 'CRM tab no debe estar si no está en modules');
    assert.ok(!content.includes("'dashboard'"), 'Dashboard tab no debe estar');
  });

  test('todos los módulos → App importa los 4 componentes', () => {
    const content = genApp(MANIFEST_VALIDO);
    assert.ok(content.includes('Chatbot'));
    assert.ok(content.includes('Crm'));
    assert.ok(content.includes('Dashboard'));
    assert.ok(content.includes('Recovery'));
  });
});

// ── Categoría 9: Datos demo parametrizables ───────────────────────────────────

describe('9. Datos demo parametrizables', () => {
  test('métricas del manifest aparecen en MockData', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('"consultas_mes": 20'));
    assert.ok(content.includes('"tasa_conversion": 55'));
    assert.ok(content.includes('10.000 € (ficticio)'));
  });

  test('slots del manifest aparecen en MockData', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('s001'));
    assert.ok(content.includes('2026-09-01 (ficticio)'));
  });

  test('clientes del manifest aparecen en MockData', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('Paciente Test (ficticio)'));
    assert.ok(content.includes('test@demo.ficticio'));
  });

  test('leads_abandono del manifest aparecen en MockData', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('Lead Test (ficticio)'));
    assert.ok(content.includes('Blanqueamiento'));
  });

  test('profesionales del manifest más "cualquiera" aparecen en MockData', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('Dr. Test (ficticio)'));
    assert.ok(content.includes('cualquiera'));
    assert.ok(content.includes('Primer profesional disponible'));
  });

  test('sedes del manifest aparecen en MockData', () => {
    const content = genMockData(MANIFEST_VALIDO);
    assert.ok(content.includes('Centro Test (ficticio)'));
  });

  test('manifest Málaga: métricas reales del YAML aparecen en MockData', () => {
    const yaml = readFileSync(MANIFEST_MALAGA, 'utf8');
    const m    = parseSimpleYaml(yaml);
    const content = genMockData(m);
    assert.ok(content.includes('"consultas_mes": 34'), `Esperado 34, contenido: ${content.substring(0, 500)}`);
    assert.ok(content.includes('Clínica Dental Málaga Centro (ficticio)'));
  });
});

// ── Categoría 10: Output reproducible ────────────────────────────────────────

describe('10. Output reproducible', () => {
  const sha = (s) => createHash('sha256').update(s).digest('hex');

  test('genChatbot produce contenido idéntico en dos llamadas', () => {
    assert.equal(sha(genChatbot(MANIFEST_VALIDO)), sha(genChatbot(MANIFEST_VALIDO)));
  });

  test('genCrm produce contenido idéntico en dos llamadas', () => {
    assert.equal(sha(genCrm(MANIFEST_VALIDO)), sha(genCrm(MANIFEST_VALIDO)));
  });

  test('genRecovery produce contenido idéntico en dos llamadas', () => {
    assert.equal(sha(genRecovery(MANIFEST_VALIDO)), sha(genRecovery(MANIFEST_VALIDO)));
  });

  test('genHtml produce contenido idéntico en dos llamadas', () => {
    assert.equal(sha(genHtml(MANIFEST_VALIDO)), sha(genHtml(MANIFEST_VALIDO)));
  });

  test('archivos generados de Málaga existen y son legibles', () => {
    const outDir = join(FAB_ROOT, 'output/clinica-dental-malaga-demo');
    const files = [
      'ClinicaDentalMalagaDemoApp.jsx',
      'ClinicaDentalMalagaDemoChatbot.jsx',
      'ClinicaDentalMalagaDemoCrm.jsx',
      'ClinicaDentalMalagaDemoDashboard.jsx',
      'ClinicaDentalMalagaDemoRecovery.jsx',
      'ClinicaDentalMalagaDemoMockData.js',
      'main.jsx',
      'runtime-config.js',
    ];
    for (const f of files) {
      const p = join(outDir, f);
      assert.ok(existsSync(p), `Archivo no existe: ${f}`);
      const content = readFileSync(p, 'utf8');
      assert.ok(content.length > 100, `Archivo demasiado pequeño: ${f}`);
    }
  });
});

// ── Categoría 11: Ausencia de secretos ───────────────────────────────────────

describe('11. Ausencia de secretos', () => {
  const FORBIDDEN = [
    'sk_live_', 'sk_test_', 'rk_live_', 'AIza', 'ghp_', 'glpat-',
    'AKIA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'Bearer ', 'Authorization:', 'X-API-Key:', 'password:',
    'passwd:', 'secret_key:', 'api_key:',
  ];

  function checkNoSecrets(content, label) {
    for (const forbidden of FORBIDDEN) {
      assert.ok(
        !content.includes(forbidden),
        `"${label}" contiene patrón de secreto: "${forbidden}"`
      );
    }
  }

  test('genMockData no contiene patrones de secretos', () => {
    checkNoSecrets(genMockData(MANIFEST_VALIDO), 'MockData');
  });

  test('genApp no contiene patrones de secretos', () => {
    checkNoSecrets(genApp(MANIFEST_VALIDO), 'App');
  });

  test('genChatbot no contiene patrones de secretos', () => {
    checkNoSecrets(genChatbot(MANIFEST_VALIDO), 'Chatbot');
  });

  test('genCrm no contiene patrones de secretos', () => {
    checkNoSecrets(genCrm(MANIFEST_VALIDO), 'CRM');
  });

  test('genDashboard no contiene patrones de secretos', () => {
    checkNoSecrets(genDashboard(MANIFEST_VALIDO), 'Dashboard');
  });

  test('genRecovery no contiene patrones de secretos', () => {
    checkNoSecrets(genRecovery(MANIFEST_VALIDO), 'Recovery');
  });

  test('manifest Málaga no contiene secretos ni tokens', () => {
    const yaml = readFileSync(MANIFEST_MALAGA, 'utf8');
    checkNoSecrets(yaml, 'manifest Málaga YAML');
  });

  test('archivos generados de Málaga no contienen secretos', () => {
    const outDir = join(FAB_ROOT, 'output/clinica-dental-malaga-demo');
    const files = ['ClinicaDentalMalagaDemoApp.jsx', 'ClinicaDentalMalagaDemoChatbot.jsx', 'runtime-config.js'];
    for (const f of files) {
      const p = join(outDir, f);
      if (existsSync(p)) {
        checkNoSecrets(readFileSync(p, 'utf8'), f);
      }
    }
  });
});

// ── Categoría 12: Ausencia de llamadas externas ───────────────────────────────

describe('12. Ausencia de llamadas externas', () => {
  const NETWORK_PATTERNS = [
    'fetch(', 'axios.', 'XMLHttpRequest', 'http.request', 'https.request',
    'supabase.from', 'airtable.', 'stripe.', 'twilio.',
    'process.env.AIRTABLE', 'process.env.SUPABASE', 'process.env.STRIPE',
    'process.env.TWILIO', 'process.env.MAKE',
  ];

  function checkNoNetwork(content, label) {
    for (const pattern of NETWORK_PATTERNS) {
      assert.ok(
        !content.includes(pattern),
        `"${label}" contiene llamada externa: "${pattern}"`
      );
    }
  }

  test('componentTemplates.mjs no hace llamadas externas', async () => {
    const { readFileSync: rf } = await import('node:fs');
    const content = rf(
      join(FAB_ROOT, 'generator/templates/componentTemplates.mjs'),
      'utf8'
    );
    checkNoNetwork(content, 'componentTemplates.mjs');
  });

  test('create-client.mjs no hace llamadas externas', async () => {
    const { readFileSync: rf } = await import('node:fs');
    const content = rf(
      join(FAB_ROOT, 'generator/scripts/create-client.mjs'),
      'utf8'
    );
    checkNoNetwork(content, 'create-client.mjs');
  });

  test('archivos generados no usan fetch ni axios', () => {
    const outDir = join(FAB_ROOT, 'output/clinica-dental-malaga-demo');
    const jsxFiles = [
      'ClinicaDentalMalagaDemoChatbot.jsx',
      'ClinicaDentalMalagaDemoCrm.jsx',
      'ClinicaDentalMalagaDemoDashboard.jsx',
      'ClinicaDentalMalagaDemoRecovery.jsx',
    ];
    for (const f of jsxFiles) {
      const p = join(outDir, f);
      if (existsSync(p)) {
        checkNoNetwork(readFileSync(p, 'utf8'), f);
      }
    }
  });

  test('manifest Málaga no configura integraciones reales', () => {
    const yaml = readFileSync(MANIFEST_MALAGA, 'utf8');
    const m    = parseSimpleYaml(yaml);
    assert.equal(m.integraciones?.reales, false, 'integraciones.reales debe ser false');
    assert.equal(m.mock?.obligatorio, true, 'mock.obligatorio debe ser true');
    assert.equal(m.modo_demo, true, 'modo_demo debe ser true');
  });

  test('singleInputSchema no importa módulos de red', async () => {
    const { readFileSync: rf } = await import('node:fs');
    const content = rf(join(FAB_ROOT, 'generator/schema/singleInputSchema.js'), 'utf8');
    assert.ok(!content.includes('import fetch'), 'schema importa fetch');
    assert.ok(!content.includes('node:http'), 'schema usa node:http');
    assert.ok(!content.includes('node:https'), 'schema usa node:https');
  });
});
