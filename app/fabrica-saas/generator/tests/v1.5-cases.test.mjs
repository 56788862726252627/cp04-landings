/**
 * GENERATOR TESTS · V1.5 · Design system, módulos dentales, AppShell V1.5
 * Cobertura: design tokens, generadores Landing/Agenda/Tratamientos/
 * Profesionales/Presupuestos, MockData enriquecida, aislamiento CP04.
 * AppShell.jsx testeado indirectamente: comprobamos que el código generado
 * importa los componentes correctos (no se puede importar JSX en node:test).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const CORE  = resolve(__dir, '../../core');
const OUT   = resolve(__dir, '../../output/clinica-dental-aurora-demo');

import {
  VERTICAL_TOKENS,
  getTokens,
  generateThemeCss,
  getVerticalSector,
} from '../../core/branding/designSystem.js';

import {
  genApp,
  genMockData,
  genDashboard,
  genLanding,
  genAgenda,
  genTratamientos,
  genProfesionales,
  genPresupuestos,
} from '../templates/componentTemplates.mjs';

import {
  validateV15Fields,
  V15_MODULES,
  V15_BRANDING_FIELDS,
} from '../schema/v1.5Schema.js';

// ── Manifests de prueba ───────────────────────────────────────────────────────

const MANIFEST_AURORA = {
  business: { name: 'Clínica Dental Aurora (Demo)', slug: 'clinica-dental-aurora-demo', vertical: 'dental' },
  vertical: 'dental',
  branding: {
    nombre_visible: 'Clínica Dental Aurora',
    tagline: 'Salud dental de excelencia para toda la familia',
    inicial: 'A',
    primaryColor: '#0c7873',
    secondaryColor: '#0284c7',
    accentColor: '#06b6d4',
    tono: 'profesional, cercano y confiable',
  },
  experiencia: { publica: true, interna: true, booking_cta: 'Reservar cita gratis' },
  modules: ['landing', 'chatbot_ia', 'agenda', 'tratamientos', 'pacientes_crm', 'profesionales', 'recuperacion_leads', 'presupuestos', 'dashboard'],
  sedes: [
    { id: 'aurora-centro', nombre: 'Aurora Centro (ficticio)', horario: 'L-V 09:00-20:00' },
    { id: 'aurora-norte',  nombre: 'Aurora Norte (ficticio)',  horario: 'L-V 10:00-19:00' },
  ],
  demoData: {
    professionals: [
      { id: 'prof-001', nombre: 'Dra. Martínez Ruiz (ficticio)', especialidad: 'Ortodoncia' },
      { id: 'prof-002', nombre: 'Dr. García Sánchez (ficticio)', especialidad: 'Implantes' },
    ],
    slots: [{ id: 'slot-001', fecha: '2026-09-15 (ficticio)', hora: '09:00', disponible: true, sede: 'Aurora Centro (ficticio)', profesional: 'Dra. Martínez Ruiz (ficticio)' }],
    clients: [{ id: 'pac-001', nombre: 'Paciente Uno (ficticio)', email: 'p1@demo.ficticio', estado: 'activo', tratamiento_interes: 'Ortodoncia', origen: 'web' }],
    leads_abandono: [
      { id: 'lead-001', nombre: 'Lead Uno (ficticio)', email: 'l1@demo.ficticio', tratamiento: 'Ortodoncia', dias_inactivo: 12, estado: 'en_proceso', accion_sugerida: 'Enviar recordatorio', fuente: 'web' },
    ],
    metrics: { consultas_mes: 145, tasa_conversion: 68, valor_pipeline: '32.400 € (ficticio)', ingresos_mes: '18.200 € (ficticio)', citas_hoy: 14, nuevos_pacientes: 9 },
  },
  mock: { obligatorio: true },
};

const MANIFEST_MALAGA = {
  business: { name: 'Clínica Dental Málaga (Demo)', slug: 'clinica-dental-malaga-demo', vertical: 'dental' },
  vertical: 'dental',
  branding: { nombre_visible: 'Clínica Dental Málaga', inicial: 'M', primaryColor: '#0d9488' },
  modules: ['chatbot_ia', 'crm', 'recuperacion_leads', 'dashboard'],
  sedes: [{ id: 'malaga-01', nombre: 'Málaga Centro (ficticio)', horario: 'L-V 09:00-20:00' }],
  demoData: {
    professionals: [{ id: 'prof-m-001', nombre: 'Dr. Ruiz Málaga (ficticio)', especialidad: 'Odontología General' }],
    slots: [],
    clients: [{ id: 'pm-001', nombre: 'Paciente Málaga (ficticio)', email: 'pm@demo.ficticio', estado: 'nuevo', tratamiento_interes: 'Revisión', origen: 'web' }],
    leads_abandono: [],
    metrics: { consultas_mes: 80, tasa_conversion: 60 },
  },
  mock: { obligatorio: true },
};

// ─── 1. Design System ─────────────────────────────────────────────────────────

describe('DESIGN SYSTEM · Tokens por vertical', () => {
  test('VERTICAL_TOKENS tiene las 4 verticales', () => {
    assert.ok(VERTICAL_TOKENS.dental);
    assert.ok(VERTICAL_TOKENS.fisioterapia);
    assert.ok(VERTICAL_TOKENS.estetica);
    assert.ok(VERTICAL_TOKENS.abogados);
  });

  test('dental tiene colores, tipografía, radii, sombras y sector', () => {
    const d = VERTICAL_TOKENS.dental;
    assert.ok(d.colors.primary);
    assert.ok(d.typography.fontFamily);
    assert.ok(d.radii.md);
    assert.ok(d.shadows.card);
    assert.ok(d.sector.entity);
  });

  test('dental primary es teal sanitario #0c7873', () => {
    assert.strictEqual(VERTICAL_TOKENS.dental.colors.primary, '#0c7873');
  });

  test('estetica tiene sector icon ✨', () => {
    assert.strictEqual(VERTICAL_TOKENS.estetica.sector.icon, '✨');
  });

  test('abogados primary es azul corporativo oscuro', () => {
    assert.ok(VERTICAL_TOKENS.abogados.colors.primary.startsWith('#1e3a'));
  });

  test('getTokens() retorna tokens del vertical', () => {
    const tokens = getTokens('dental');
    assert.strictEqual(tokens.colors.primary, '#0c7873');
    assert.ok(tokens.typography);
    assert.ok(tokens.sector);
  });

  test('getTokens() aplica override de branding.primaryColor', () => {
    const tokens = getTokens('dental', { primaryColor: '#123456' });
    assert.strictEqual(tokens.colors.primary, '#123456');
  });

  test('getTokens() aplica override de secondaryColor', () => {
    const tokens = getTokens('dental', { secondaryColor: '#abcdef' });
    assert.strictEqual(tokens.colors.secondary, '#abcdef');
  });

  test('getTokens() no muta la base original', () => {
    getTokens('dental', { primaryColor: '#ff0000' });
    assert.strictEqual(VERTICAL_TOKENS.dental.colors.primary, '#0c7873');
  });

  test('getTokens() fallback a dental para vertical desconocido', () => {
    const tokens = getTokens('desconocido');
    assert.strictEqual(tokens.colors.primary, '#0c7873');
  });

  test('generateThemeCss() genera :root con custom properties', () => {
    const tokens = getTokens('dental');
    const css = generateThemeCss(tokens);
    assert.ok(css.includes('--color-primary:'));
    assert.ok(css.includes('--font-sans:'));
    assert.ok(css.includes('--radius-md:'));
    assert.ok(css.includes('--shadow-card:'));
  });

  test('generateThemeCss() incluye el color primario en el output', () => {
    const tokens = getTokens('dental');
    const css = generateThemeCss(tokens);
    assert.ok(css.includes('#0c7873'));
  });

  test('getVerticalSector() retorna sector dental correcto', () => {
    const s = getVerticalSector('dental');
    assert.strictEqual(s.entity, 'Paciente');
    assert.strictEqual(s.icon, '🦷');
    assert.strictEqual(s.booking, 'Cita');
  });

  test('getVerticalSector() fallback a dental para vertical desconocido', () => {
    const s = getVerticalSector('desconocido');
    assert.strictEqual(s.entity, 'Paciente');
  });
});

// ─── 2. AppShell V1.5 (verificado via código generado) ────────────────────────

describe('APPSHELL V1.5 · Exports en código generado', () => {
  const dashCode = genDashboard(MANIFEST_AURORA);
  const landCode = genLanding(MANIFEST_AURORA);
  const agendCode = genAgenda(MANIFEST_AURORA);
  const tratCode = genTratamientos(MANIFEST_AURORA);
  const presCode = genPresupuestos(MANIFEST_AURORA);

  test('Dashboard importa HeroSection de AppShell', () => {
    assert.ok(dashCode.includes('HeroSection'));
  });
  test('Dashboard importa MetricGrid de AppShell', () => {
    assert.ok(dashCode.includes('MetricGrid'));
  });
  test('Dashboard importa StatCard de AppShell', () => {
    assert.ok(dashCode.includes('StatCard'));
  });
  test('Dashboard importa TimelineItem de AppShell', () => {
    assert.ok(dashCode.includes('TimelineItem'));
  });
  test('Landing importa HeroSection de AppShell', () => {
    assert.ok(landCode.includes('HeroSection'));
  });
  test('Landing importa Card de AppShell', () => {
    assert.ok(landCode.includes('Card'));
  });
  test('Agenda importa Badge de AppShell', () => {
    assert.ok(agendCode.includes('Badge'));
  });
  test('Agenda importa SectionTitle de AppShell', () => {
    assert.ok(agendCode.includes('SectionTitle'));
  });
  test('Tratamientos importa PillTabs de AppShell', () => {
    assert.ok(tratCode.includes('PillTabs'));
  });
  test('Presupuestos importa Table de AppShell', () => {
    assert.ok(presCode.includes('Table'));
  });

  test('AppShell.jsx existe en core/', () => {
    assert.ok(existsSync(`${CORE}/AppShell.jsx`));
  });

  test('AppShell.jsx exporta función HeroSection', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function HeroSection'));
  });

  test('AppShell.jsx exporta función MetricGrid', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function MetricGrid'));
  });

  test('AppShell.jsx exporta función PillTabs', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function PillTabs'));
  });

  test('AppShell.jsx exporta función TimelineItem', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function TimelineItem'));
  });

  test('AppShell.jsx exporta función Table', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function Table'));
  });

  test('AppShell.jsx exporta función EmptyState', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function EmptyState'));
  });

  test('AppShell.jsx exporta función Loader', () => {
    const content = readFileSync(`${CORE}/AppShell.jsx`, 'utf8');
    assert.ok(content.includes('export function Loader'));
  });
});

// ─── 3. genLanding() ─────────────────────────────────────────────────────────

describe('genLanding() · Módulo Landing V1.5', () => {
  const code = genLanding(MANIFEST_AURORA);

  test('genera JSX con nombre de clínica Aurora', () => {
    assert.ok(code.includes('Aurora'));
  });

  test('contiene tagline del manifest', () => {
    assert.ok(code.includes('excelencia'));
  });

  test('contiene CTA de booking', () => {
    assert.ok(code.includes('Reservar cita gratis'));
  });

  test('contiene sección de servicios', () => {
    assert.ok(code.includes('Ortodoncia') || code.includes('SERVICIOS'));
  });

  test('contiene sección "Cómo funciona"', () => {
    assert.ok(code.includes('PASOS') || code.includes('funciona'));
  });

  test('está marcado como ficticio', () => {
    assert.ok(code.includes('ficticio') || code.includes('FICTICIO'));
  });

  test('importa desde AppShell.jsx', () => {
    assert.ok(code.includes("from '../../core/AppShell.jsx'"));
  });

  test('es una función exportada nombrada', () => {
    assert.ok(code.includes('export function') && code.includes('Landing'));
  });
});

// ─── 4. genAgenda() ──────────────────────────────────────────────────────────

describe('genAgenda() · Módulo Agenda V1.5', () => {
  const code = genAgenda(MANIFEST_AURORA);

  test('genera componente de Agenda', () => {
    assert.ok(code.includes('Agenda'));
  });

  test('usa MOCK_AGENDA', () => {
    assert.ok(code.includes('MOCK_AGENDA'));
  });

  test('contiene estados: confirmada, pendiente, cancelada', () => {
    assert.ok(code.includes('confirmada'));
    assert.ok(code.includes('pendiente'));
    assert.ok(code.includes('cancelada'));
  });

  test('contiene filtros de estado', () => {
    assert.ok(code.includes('filtroEstado') || code.includes('filtro'));
  });

  test('está marcado como ficticio', () => {
    assert.ok(code.includes('ficticio') || code.includes('FICTICIO'));
  });
});

// ─── 5. genTratamientos() ────────────────────────────────────────────────────

describe('genTratamientos() · Módulo Tratamientos V1.5', () => {
  const code = genTratamientos(MANIFEST_AURORA);

  test('genera componente de Tratamientos', () => {
    assert.ok(code.includes('Tratamientos'));
  });

  test('usa MOCK_TRATAMIENTOS', () => {
    assert.ok(code.includes('MOCK_TRATAMIENTOS'));
  });

  test('contiene PillTabs para categorías', () => {
    assert.ok(code.includes('PillTabs'));
  });

  test('contiene categorías dentales', () => {
    assert.ok(code.includes('Ortodoncia') || code.includes('Implantes'));
  });

  test('está marcado como ficticio', () => {
    assert.ok(code.includes('ficticio') || code.includes('FICTICIO'));
  });
});

// ─── 6. genProfesionales() ───────────────────────────────────────────────────

describe('genProfesionales() · Módulo Profesionales V1.5', () => {
  const code = genProfesionales(MANIFEST_AURORA);

  test('genera componente de Profesionales', () => {
    assert.ok(code.includes('Profesionales'));
  });

  test('incluye datos de profesionales del manifest', () => {
    assert.ok(code.includes('Martínez') || code.includes('prof-001'));
  });

  test('contiene Avatar component', () => {
    assert.ok(code.includes('Avatar'));
  });

  test('contiene estadísticas de pacientes', () => {
    assert.ok(code.includes('pacientes') || code.includes('citas'));
  });

  test('está marcado como ficticio', () => {
    assert.ok(code.includes('ficticio') || code.includes('FICTICIO'));
  });
});

// ─── 7. genPresupuestos() ────────────────────────────────────────────────────

describe('genPresupuestos() · Módulo Presupuestos V1.5', () => {
  const code = genPresupuestos(MANIFEST_AURORA);

  test('genera componente de Presupuestos', () => {
    assert.ok(code.includes('Presupuestos'));
  });

  test('usa MOCK_PRESUPUESTOS', () => {
    assert.ok(code.includes('MOCK_PRESUPUESTOS'));
  });

  test('incluye Table component', () => {
    assert.ok(code.includes('Table'));
  });

  test('incluye pipeline de estados', () => {
    assert.ok(code.includes('PIPELINE') || code.includes('borrador'));
    assert.ok(code.includes('aceptado'));
  });

  test('está marcado como ficticio', () => {
    assert.ok(code.includes('ficticio') || code.includes('FICTICIO'));
  });
});

// ─── 8. genApp() V1.5 ────────────────────────────────────────────────────────

describe('genApp() V1.5 · Tabs ampliados', () => {
  const code = genApp(MANIFEST_AURORA);

  test("incluye tab id 'landing'", () => {
    assert.ok(code.includes("'landing'"));
  });

  test("incluye tab id 'agenda'", () => {
    assert.ok(code.includes("'agenda'"));
  });

  test("incluye tab id 'tratamientos'", () => {
    assert.ok(code.includes("'tratamientos'"));
  });

  test("incluye tab id 'profesionales'", () => {
    assert.ok(code.includes("'profesionales'"));
  });

  test("incluye tab id 'presupuestos'", () => {
    assert.ok(code.includes("'presupuestos'"));
  });

  test("incluye tab id 'dashboard'", () => {
    assert.ok(code.includes("'dashboard'"));
  });

  test('contiene branding.tagline en BRANDING', () => {
    assert.ok(code.includes('tagline'));
  });

  test('importa módulo Landing', () => {
    assert.ok(code.includes('Landing'));
  });

  test('importa módulo Agenda', () => {
    assert.ok(code.includes('Agenda'));
  });

  test('importa módulo Tratamientos', () => {
    assert.ok(code.includes('Tratamientos'));
  });

  test('genApp() sin V1.5 modules no incluye tab landing', () => {
    const codeBasic = genApp(MANIFEST_MALAGA);
    assert.ok(!codeBasic.includes("'landing'"));
  });
});

// ─── 9. genMockData() V1.5 ───────────────────────────────────────────────────

describe('genMockData() V1.5 · Datos enriquecidos', () => {
  const code = genMockData(MANIFEST_AURORA);

  test('contiene MOCK_TRATAMIENTOS', () => {
    assert.ok(code.includes('MOCK_TRATAMIENTOS'));
  });

  test('contiene MOCK_PRESUPUESTOS', () => {
    assert.ok(code.includes('MOCK_PRESUPUESTOS'));
  });

  test('contiene MOCK_AGENDA', () => {
    assert.ok(code.includes('MOCK_AGENDA'));
  });

  test('MOCK_TRATAMIENTOS tiene al menos 12 entradas', () => {
    const matches = code.match(/id: 'trat-/g) || [];
    assert.ok(matches.length >= 12, `Solo ${matches.length} tratamientos`);
  });

  test('MOCK_PRESUPUESTOS tiene al menos 6 entradas', () => {
    const matches = code.match(/id: 'pres-/g) || [];
    assert.ok(matches.length >= 6, `Solo ${matches.length} presupuestos`);
  });

  test('MOCK_AGENDA tiene al menos 8 citas', () => {
    const matches = code.match(/id: 'cita-/g) || [];
    assert.ok(matches.length >= 8, `Solo ${matches.length} citas`);
  });

  test('Málaga sin V1.5 modules no incluye MOCK_TRATAMIENTOS', () => {
    const codeMalaga = genMockData(MANIFEST_MALAGA);
    assert.ok(!codeMalaga.includes('MOCK_TRATAMIENTOS'));
  });
});

// ─── 10. genDashboard() V1.5 ─────────────────────────────────────────────────

describe('genDashboard() V1.5 · Hero + MetricGrid + Timeline', () => {
  const code = genDashboard(MANIFEST_AURORA);

  test('importa HeroSection', () => {
    assert.ok(code.includes('HeroSection'));
  });

  test('importa MetricGrid', () => {
    assert.ok(code.includes('MetricGrid'));
  });

  test('importa StatCard', () => {
    assert.ok(code.includes('StatCard'));
  });

  test('importa TimelineItem', () => {
    assert.ok(code.includes('TimelineItem'));
  });

  test('contiene métrica citas_hoy', () => {
    assert.ok(code.includes('citas_hoy') || code.includes('Citas hoy'));
  });

  test('contiene sección de leads activos', () => {
    assert.ok(code.includes('leadsActivos') || code.includes('Leads activos'));
  });

  test('está marcado como ficticio', () => {
    assert.ok(code.includes('ficticio') || code.includes('FICTICIO'));
  });
});

// ─── 11. validateV15Fields() ─────────────────────────────────────────────────

describe('validateV15Fields() · Schema V1.5', () => {
  test('retorna valid=true para manifest Aurora completo', () => {
    const { valid } = validateV15Fields(MANIFEST_AURORA);
    assert.ok(valid);
  });

  test('detecta branding.tagline como campo V1.5', () => {
    const { v15Fields } = validateV15Fields(MANIFEST_AURORA);
    assert.ok(v15Fields.some(f => f.includes('tagline')));
  });

  test('detecta branding.tono como campo V1.5', () => {
    const { v15Fields } = validateV15Fields(MANIFEST_AURORA);
    assert.ok(v15Fields.some(f => f.includes('tono')));
  });

  test('detecta módulos V1.5 en v15Fields', () => {
    const { v15Fields } = validateV15Fields(MANIFEST_AURORA);
    assert.ok(v15Fields.some(f => f.includes('landing')));
  });

  test('retorna valid=false si falta business.slug', () => {
    const { valid } = validateV15Fields({ business: { name: 'X' } });
    assert.ok(!valid);
  });

  test('genera warnings para campos opcionales no presentes en Málaga', () => {
    const { warnings } = validateV15Fields(MANIFEST_MALAGA);
    assert.ok(warnings.length > 0);
  });

  test('V15_MODULES tiene los 5 módulos nuevos', () => {
    assert.ok(V15_MODULES.includes('landing'));
    assert.ok(V15_MODULES.includes('agenda'));
    assert.ok(V15_MODULES.includes('tratamientos'));
    assert.ok(V15_MODULES.includes('profesionales'));
    assert.ok(V15_MODULES.includes('presupuestos'));
  });

  test('V15_BRANDING_FIELDS incluye tagline y tono', () => {
    assert.ok(V15_BRANDING_FIELDS.includes('tagline'));
    assert.ok(V15_BRANDING_FIELDS.includes('tono'));
  });
});

// ─── 12. Output generado Aurora ──────────────────────────────────────────────

describe('OUTPUT AURORA · Archivos V1.5 generados', () => {
  test('Landing.jsx generado existe', () => {
    assert.ok(existsSync(`${OUT}/ClinicaDentalAuroraDemoLanding.jsx`));
  });

  test('Agenda.jsx generado existe', () => {
    assert.ok(existsSync(`${OUT}/ClinicaDentalAuroraDemoAgenda.jsx`));
  });

  test('Tratamientos.jsx generado existe', () => {
    assert.ok(existsSync(`${OUT}/ClinicaDentalAuroraDemoTratamientos.jsx`));
  });

  test('Profesionales.jsx generado existe', () => {
    assert.ok(existsSync(`${OUT}/ClinicaDentalAuroraDemoProfesionales.jsx`));
  });

  test('Presupuestos.jsx generado existe', () => {
    assert.ok(existsSync(`${OUT}/ClinicaDentalAuroraDemoPresupuestos.jsx`));
  });

  test('MockData.js tiene MOCK_TRATAMIENTOS', () => {
    const content = readFileSync(`${OUT}/ClinicaDentalAuroraDemoMockData.js`, 'utf8');
    assert.ok(content.includes('MOCK_TRATAMIENTOS'));
  });

  test('MockData.js tiene MOCK_PRESUPUESTOS', () => {
    const content = readFileSync(`${OUT}/ClinicaDentalAuroraDemoMockData.js`, 'utf8');
    assert.ok(content.includes('MOCK_PRESUPUESTOS'));
  });

  test('App.jsx tiene tab landing', () => {
    const content = readFileSync(`${OUT}/ClinicaDentalAuroraDemoApp.jsx`, 'utf8');
    assert.ok(content.includes("'landing'"));
  });

  test('Dashboard.jsx importa HeroSection', () => {
    const content = readFileSync(`${OUT}/ClinicaDentalAuroraDemoDashboard.jsx`, 'utf8');
    assert.ok(content.includes('HeroSection'));
  });
});

// ─── 13. Aislamiento CP04 ────────────────────────────────────────────────────

describe('AISLAMIENTO · Ningún módulo dental contamina con Club Pádel 04', () => {
  const CP04_PATTERNS = ['Club Pádel', 'Reservar pista', 'Ranking ELO', '/api/reservas', 'pistas de pádel'];

  function checkNoCp04(code, moduleName) {
    for (const pattern of CP04_PATTERNS) {
      assert.ok(!code.includes(pattern), `${moduleName} contiene referencia CP04: "${pattern}"`);
    }
  }

  test('genLanding no tiene referencias CP04', () => checkNoCp04(genLanding(MANIFEST_AURORA), 'Landing'));
  test('genAgenda no tiene referencias CP04', () => checkNoCp04(genAgenda(MANIFEST_AURORA), 'Agenda'));
  test('genTratamientos no tiene referencias CP04', () => checkNoCp04(genTratamientos(MANIFEST_AURORA), 'Tratamientos'));
  test('genProfesionales no tiene referencias CP04', () => checkNoCp04(genProfesionales(MANIFEST_AURORA), 'Profesionales'));
  test('genPresupuestos no tiene referencias CP04', () => checkNoCp04(genPresupuestos(MANIFEST_AURORA), 'Presupuestos'));
  test('genDashboard no tiene referencias CP04', () => checkNoCp04(genDashboard(MANIFEST_AURORA), 'Dashboard'));
  test('genApp no tiene referencias CP04', () => checkNoCp04(genApp(MANIFEST_AURORA), 'App'));
  test('genMockData no tiene referencias CP04', () => checkNoCp04(genMockData(MANIFEST_AURORA), 'MockData'));
});
