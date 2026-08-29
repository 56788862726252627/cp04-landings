/**
 * Tests FisioNova Demo — Fábrica SaaS V1.7
 * Verifica: manifest, mock data, archivos de output, branding, módulos.
 * Node.js test runner — sin DOM, sin JSX.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function file(...parts) { return resolve(ROOT, 'fabrica-saas', ...parts); }
function outputFile(name) { return file('output', 'fisionova-demo', name); }
function exists(path) { return existsSync(path); }
function read(path) { return readFileSync(path, 'utf8'); }

// ─── Suite 1: Archivos del output ─────────────────────────────────────────────

describe('FisioNova Output — Archivos existentes', () => {
  const expectedFiles = [
    'FisioNovaMockData.js',
    'FisioNovaApp.jsx',
    'FisioNovaLanding.jsx',
    'FisioNovaAgenda.jsx',
    'FisioNovaPacientes.jsx',
    'FisioNovaEvolucion.jsx',
    'FisioNovaEjercicios.jsx',
    'FisioNovaDashboard.jsx',
    'FisioNovaTratamientos.jsx',
    'FisioNovaProfesionales.jsx',
    'FisioNovaPresupuestos.jsx',
    'FisioNovaLeads.jsx',
    'FisioNovaAsistente.jsx',
    'main.jsx',
  ];

  for (const f of expectedFiles) {
    test(`existe ${f}`, () => {
      assert.ok(exists(outputFile(f)), `Falta output/fisionova-demo/${f}`);
    });
  }
});

// ─── Suite 2: Manifest ────────────────────────────────────────────────────────

describe('FisioNova Manifest V1.7', () => {
  let manifest;
  test('manifest.yaml existe', () => {
    const path = file('clients', 'fisionova-demo', 'manifest.yaml');
    assert.ok(exists(path), 'Falta clients/fisionova-demo/manifest.yaml');
    manifest = read(path);
  });
  test('version es 1.7', () => {
    assert.ok(manifest.includes('version: "1.7"'), 'Manifest debe tener version: "1.7"');
  });
  test('vertical es physio', () => {
    assert.ok(manifest.includes('vertical: physio'), 'Manifest debe tener vertical: physio');
  });
  test('branding tiene primaryColor indigo', () => {
    assert.ok(manifest.includes('#4338ca'), 'Branding debe usar #4338ca (indigo)');
  });
  test('experience.preset es calm', () => {
    assert.ok(manifest.includes('preset: calm'), 'Experience preset debe ser calm');
  });
  test('animatedMetrics activado', () => {
    assert.ok(manifest.includes('animatedMetrics: true'), 'animatedMetrics debe ser true');
  });
  test('video.autoplay es false', () => {
    assert.ok(manifest.includes('autoplay: false'), 'video.autoplay debe ser false');
  });
  test('11 módulos declarados', () => {
    const modulos = ['inicio', 'agenda', 'pacientes', 'tratamientos', 'profesionales', 'evolucion', 'ejercicios', 'presupuestos', 'leads', 'dashboard', 'asistente-ia'];
    for (const m of modulos) {
      assert.ok(manifest.includes(`- ${m}`), `Módulo "${m}" no encontrado en manifest`);
    }
  });
  test('4 métricas de negocio declaradas', () => {
    assert.ok(manifest.includes('Pacientes recuperados'), 'Falta métrica Pacientes recuperados');
    assert.ok(manifest.includes('Tasa de recuperación'), 'Falta métrica Tasa de recuperación');
    assert.ok(manifest.includes('De experiencia clínica'), 'Falta métrica De experiencia clínica');
    assert.ok(manifest.includes('Valoración media'), 'Falta métrica Valoración media');
  });
});

// ─── Suite 3: MockData — estructura y contenido ───────────────────────────────

describe('FisioNova MockData — Branding', () => {
  let mockData;
  test('MockData importable', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    mockData = m;
    assert.ok(m.BRANDING, 'BRANDING debe existir');
  });
  test('BRANDING.nombre es FisioNova', () => {
    assert.equal(mockData.BRANDING.nombre, 'FisioNova');
  });
  test('BRANDING.primaryColor es indigo', () => {
    assert.equal(mockData.BRANDING.primaryColor, '#4338ca');
  });
  test('BRANDING.tagline presente', () => {
    assert.ok(mockData.BRANDING.tagline.length > 5, 'tagline debe ser descriptivo');
  });
  test('BRANDING no usa color Aurora ni CP04', () => {
    assert.ok(!mockData.BRANDING.primaryColor.includes('#0c7873'), 'No debe usar Aurora teal');
    assert.ok(!mockData.BRANDING.primaryColor.includes('#003bce'), 'No debe usar CP04 blue');
  });
});

describe('FisioNova MockData — Servicios', () => {
  let servicios;
  test('SERVICIOS tiene 8 servicios', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    servicios = m.SERVICIOS;
    assert.equal(servicios.length, 8, 'Debe haber exactamente 8 servicios');
  });
  test('cada servicio tiene campos requeridos', () => {
    for (const s of servicios) {
      assert.ok(s.id, `Servicio sin id: ${JSON.stringify(s)}`);
      assert.ok(s.nombre, `Servicio ${s.id} sin nombre`);
      assert.ok(s.desc, `Servicio ${s.id} sin desc`);
      assert.ok(s.precio, `Servicio ${s.id} sin precio`);
      assert.ok(Array.isArray(s.tags), `Servicio ${s.id} sin tags array`);
    }
  });
  test('al menos 2 servicios populares', () => {
    const populares = servicios.filter(s => s.popular);
    assert.ok(populares.length >= 2, 'Al menos 2 servicios deben ser populares');
  });
  test('todos los servicios tienen icono', () => {
    for (const s of servicios) {
      assert.ok(s.icono, `Servicio ${s.id} sin icono`);
    }
  });
});

describe('FisioNova MockData — Profesionales', () => {
  let profs;
  test('PROFESIONALES tiene 4 fisioterapeutas', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    profs = m.PROFESIONALES;
    assert.equal(profs.length, 4);
  });
  test('cada profesional tiene campos requeridos', () => {
    for (const p of profs) {
      assert.ok(p.id, `Profesional sin id`);
      assert.ok(p.nombre, `Profesional ${p.id} sin nombre`);
      assert.ok(p.especialidad, `Profesional ${p.id} sin especialidad`);
      assert.ok(p.valoracion >= 4, `Valoración debe ser >= 4 para un demo premium`);
      assert.ok(Array.isArray(p.idiomas), `Profesional ${p.id} debe tener array de idiomas`);
      assert.ok(Array.isArray(p.disponibilidad), `Profesional ${p.id} debe tener disponibilidad`);
    }
  });
  test('profesionales con colores distintos', () => {
    const colores = profs.map(p => p.color);
    const unicos = new Set(colores);
    assert.equal(unicos.size, 4, 'Cada profesional debe tener color distinto');
  });
});

describe('FisioNova MockData — Agenda', () => {
  let citas;
  test('CITAS_HOY tiene >= 8 citas', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    citas = m.CITAS_HOY;
    assert.ok(citas.length >= 8, `Debe haber al menos 8 citas, hay ${citas.length}`);
  });
  test('estados válidos en todas las citas', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    const estados = Object.keys(m.ESTADOS_CITA);
    for (const c of citas) {
      assert.ok(estados.includes(c.estado), `Estado inválido "${c.estado}" en cita ${c.id}`);
    }
  });
  test('ESTADOS_CITA tiene 5 estados', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    assert.equal(Object.keys(m.ESTADOS_CITA).length, 5);
  });
  test('cada cita tiene hora, paciente, servicio y sala', () => {
    for (const c of citas) {
      assert.ok(c.hora, `Cita ${c.id} sin hora`);
      assert.ok(c.paciente, `Cita ${c.id} sin paciente`);
      assert.ok(c.servicio, `Cita ${c.id} sin servicio`);
      assert.ok(c.sala, `Cita ${c.id} sin sala`);
    }
  });
});

describe('FisioNova MockData — Pacientes', () => {
  let pacientes;
  test('PACIENTES tiene >= 10 pacientes', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    pacientes = m.PACIENTES;
    assert.ok(pacientes.length >= 10, `Debe haber al menos 10 pacientes, hay ${pacientes.length}`);
  });
  test('cada paciente tiene evolución y dolor', () => {
    for (const p of pacientes) {
      assert.ok(typeof p.evolucion === 'number', `Paciente ${p.id} sin evolucion numérica`);
      assert.ok(typeof p.dolor === 'number', `Paciente ${p.id} sin dolor numérico`);
      assert.ok(p.evolucion >= 0 && p.evolucion <= 100, `Evolucion ${p.evolucion} fuera de [0,100]`);
      assert.ok(p.dolor >= 0 && p.dolor <= 10, `Dolor ${p.dolor} fuera de [0,10]`);
    }
  });
  test('estados de paciente válidos', () => {
    const validos = ['activo', 'pausado', 'alta'];
    for (const p of pacientes) {
      assert.ok(validos.includes(p.estado), `Estado inválido "${p.estado}" en paciente ${p.id}`);
    }
  });
  test('todos los datos son ficticios (ejemplo.local o demo)', () => {
    for (const p of pacientes) {
      assert.ok(p.email.includes('example.local') || p.email.includes('demo'), `Email ${p.email} no parece ficticio`);
    }
  });
});

describe('FisioNova MockData — Ejercicios', () => {
  let ejercicios;
  test('EJERCICIOS tiene >= 10 ejercicios', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    ejercicios = m.EJERCICIOS;
    assert.ok(ejercicios.length >= 10);
  });
  test('niveles válidos', () => {
    const validos = ['Básico', 'Intermedio', 'Avanzado'];
    for (const e of ejercicios) {
      assert.ok(validos.includes(e.nivel), `Nivel inválido "${e.nivel}"`);
    }
  });
  test('cada ejercicio tiene series y reps', () => {
    for (const e of ejercicios) {
      assert.ok(e.series > 0, `Ejercicio ${e.id} sin series`);
      assert.ok(e.reps, `Ejercicio ${e.id} sin reps`);
    }
  });
});

describe('FisioNova MockData — Dashboard y Leads', () => {
  test('DASHBOARD_STATS tiene campos requeridos', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    const s = m.DASHBOARD_STATS;
    assert.ok(s.citasHoy, 'Falta citasHoy');
    assert.ok(s.pacientesActivos, 'Falta pacientesActivos');
    assert.ok(s.ocupacionSemana, 'Falta ocupacionSemana');
    assert.ok(s.tasaRecuperacion, 'Falta tasaRecuperacion');
  });
  test('LEADS tiene >= 6 leads', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    assert.ok(m.LEADS.length >= 6, `Debe haber al menos 6 leads, hay ${m.LEADS.length}`);
  });
  test('estados de leads válidos', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    const validos = ['pendiente', 'contactado', 'citado', 'perdido'];
    for (const l of m.LEADS) {
      assert.ok(validos.includes(l.estado), `Estado lead inválido: "${l.estado}"`);
    }
  });
  test('BONOS tiene >= 4 tipos', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    assert.ok(m.BONOS.length >= 4);
  });
  test('ACTIVIDAD_RECIENTE tiene >= 4 entradas', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    assert.ok(m.ACTIVIDAD_RECIENTE.length >= 4);
  });
  test('HERO_METRICS tiene 4 métricas', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    assert.equal(m.HERO_METRICS.length, 4);
  });
  test('TESTIMONIOS tiene >= 3 testimonios', async () => {
    const m = await import(outputFile('FisioNovaMockData.js'));
    assert.ok(m.TESTIMONIOS.length >= 3);
  });
});

// ─── Suite 4: Contenido de los JSX (smoke checks sin DOM) ────────────────────

describe('FisioNova JSX — Exports correctos', () => {
  const exports_ = [
    ['FisioNovaApp.jsx', 'FisioNovaApp'],
    ['FisioNovaLanding.jsx', 'FisioNovaLanding'],
    ['FisioNovaAgenda.jsx', 'FisioNovaAgenda'],
    ['FisioNovaPacientes.jsx', 'FisioNovaPacientes'],
    ['FisioNovaEvolucion.jsx', 'FisioNovaEvolucion'],
    ['FisioNovaEjercicios.jsx', 'FisioNovaEjercicios'],
    ['FisioNovaDashboard.jsx', 'FisioNovaDashboard'],
    ['FisioNovaTratamientos.jsx', 'FisioNovaTratamientos'],
    ['FisioNovaProfesionales.jsx', 'FisioNovaProfesionales'],
    ['FisioNovaPresupuestos.jsx', 'FisioNovaPresupuestos'],
    ['FisioNovaLeads.jsx', 'FisioNovaLeads'],
    ['FisioNovaAsistente.jsx', 'FisioNovaAsistente'],
  ];
  for (const [filename, exportName] of exports_) {
    test(`${filename} exporta ${exportName}`, () => {
      const content = read(outputFile(filename));
      assert.ok(
        content.includes(`export function ${exportName}`),
        `${filename} debe exportar function ${exportName}`
      );
    });
  }
});

describe('FisioNova JSX — Importaciones correctas', () => {
  test('FisioNovaApp importa AppShell desde core', () => {
    const content = read(outputFile('FisioNovaApp.jsx'));
    assert.ok(content.includes("from '../../core/AppShell.jsx'"), 'Debe importar AppShell del core');
  });
  test('FisioNovaApp tiene 11 tabs declarados', () => {
    const content = read(outputFile('FisioNovaApp.jsx'));
    const tabs = ['inicio', 'agenda', 'pacientes', 'tratamientos', 'profesionales', 'evolucion', 'ejercicios', 'presupuestos', 'leads', 'dashboard', 'asistente'];
    for (const tab of tabs) {
      assert.ok(content.includes(`id: '${tab}'`), `Tab '${tab}' no encontrado en FisioNovaApp`);
    }
  });
  test('FisioNovaApp importa todos los módulos', () => {
    const content = read(outputFile('FisioNovaApp.jsx'));
    const modulos = ['FisioNovaLanding', 'FisioNovaAgenda', 'FisioNovaPacientes', 'FisioNovaTratamientos', 'FisioNovaProfesionales', 'FisioNovaEvolucion', 'FisioNovaEjercicios', 'FisioNovaPresupuestos', 'FisioNovaLeads', 'FisioNovaDashboard', 'FisioNovaAsistente'];
    for (const m of modulos) {
      assert.ok(content.includes(`import { ${m} }`), `${m} no importado en FisioNovaApp`);
    }
  });
  test('BRANDING en App usa color indigo', () => {
    const content = read(outputFile('FisioNovaApp.jsx'));
    assert.ok(content.includes('#4338ca'), 'BRANDING en App debe usar #4338ca');
  });
  test('main.jsx importa FisioNovaApp', () => {
    const content = read(outputFile('main.jsx'));
    assert.ok(content.includes('FisioNovaApp'), 'main.jsx debe importar FisioNovaApp');
  });
});

describe('FisioNova JSX — Contenido comercial', () => {
  test('Landing incluye Hero con tagline (via BRANDING)', () => {
    const content = read(outputFile('FisioNovaLanding.jsx'));
    // tagline puede estar literal o via BD.tagline (referencia al BRANDING importado)
    assert.ok(content.includes('tagline') || content.includes('Muévete mejor'), 'Landing debe referenciar el tagline del BRANDING');
  });
  test('Landing incluye sección servicios', () => {
    const content = read(outputFile('FisioNovaLanding.jsx'));
    assert.ok(content.includes('Nuestros Servicios'), 'Landing debe incluir sección Servicios');
  });
  test('Landing incluye FAQ', () => {
    const content = read(outputFile('FisioNovaLanding.jsx'));
    assert.ok(content.includes('FAQ') || content.includes('Preguntas frecuentes'), 'Landing debe incluir FAQ');
  });
  test('Landing incluye CTA final con color verde', () => {
    const content = read(outputFile('FisioNovaLanding.jsx'));
    assert.ok(content.includes('059669'), 'Landing CTA debe usar verde secundario');
  });
  test('Asistente incluye aviso de demo/no diagnóstico', () => {
    const content = read(outputFile('FisioNovaAsistente.jsx'));
    assert.ok(content.includes('demo') || content.includes('ficticio'), 'Asistente debe advertir que es demo');
    assert.ok(content.includes('diagnóstico') || content.includes('diagnostico'), 'Asistente debe mencionar que no hace diagnósticos');
  });
  test('Agenda incluye estados de cita', () => {
    const content = read(outputFile('FisioNovaAgenda.jsx'));
    assert.ok(content.includes('ESTADOS_CITA'), 'Agenda debe usar ESTADOS_CITA');
  });
  test('Evolución incluye gráficos SVG', () => {
    const content = read(outputFile('FisioNovaEvolucion.jsx'));
    assert.ok(content.includes('<svg'), 'Evolución debe incluir gráficos SVG');
  });
  test('Dashboard incluye gráfico de barras', () => {
    const content = read(outputFile('FisioNovaDashboard.jsx'));
    assert.ok(content.includes('BarChart'), 'Dashboard debe incluir BarChart');
  });
});

// ─── Suite 5: Seguridad y cumplimiento demo ──────────────────────────────────

describe('FisioNova — Cumplimiento demo (sin datos reales)', () => {
  test('MockData no contiene emails reales', () => {
    const content = read(outputFile('FisioNovaMockData.js'));
    assert.ok(!content.includes('@gmail.com'), 'No debe haber emails Gmail reales');
    assert.ok(!content.includes('@hotmail.com'), 'No debe haber emails Hotmail reales');
    assert.ok(!content.includes('@yahoo.com'), 'No debe haber emails Yahoo reales');
  });
  test('MockData no contiene teléfonos reales', () => {
    const content = read(outputFile('FisioNovaMockData.js'));
    // Teléfonos reales tienen 9 dígitos sin (demo) ni XXX
    assert.ok(content.includes('(demo)') || content.includes('XXX'), 'Teléfonos deben marcarse como demo/XXX');
  });
  test('MockData no contiene NIFs reales', () => {
    const content = read(outputFile('FisioNovaMockData.js'));
    assert.ok(!content.match(/\b[0-9]{8}[A-Z]\b/), 'No debe haber NIFs reales');
  });
  test('Asistente no tiene respuestas que impliquen diagnóstico médico real', () => {
    const content = read(outputFile('FisioNovaAsistente.jsx'));
    // Debe haber disclaimers
    assert.ok(content.includes('demo') && content.includes('ficticio'), 'Debe haber disclaimers de demo');
  });
  test('fisionova-demo.html existe como entry point', () => {
    assert.ok(exists(resolve(ROOT, 'fisionova-demo.html')), 'Debe existir fisionova-demo.html');
  });
  test('vite.config.js incluye fisionova-demo como entry', () => {
    const content = read(resolve(ROOT, 'vite.config.js'));
    assert.ok(content.includes('fisionova-demo'), 'vite.config.js debe incluir entry fisionova-demo');
  });
});

// ─── Suite 6: V1.7 Dynamic Experience en FisioNova ───────────────────────────

describe('FisioNova V1.7 — Experience tokens', () => {
  test('Landing usa IntersectionObserver (scroll effects)', () => {
    const content = read(outputFile('FisioNovaLanding.jsx'));
    assert.ok(content.includes('IntersectionObserver'), 'Landing debe usar IntersectionObserver para V1.7 scroll effects');
  });
  test('Evolución usa SVG con animación (animated metrics)', () => {
    const content = read(outputFile('FisioNovaEvolucion.jsx'));
    assert.ok(content.includes('transition'), 'Evolución debe usar CSS transitions para animaciones');
  });
  test('Pacientes usa BarraProgreso (animated-progress)', () => {
    const content = read(outputFile('FisioNovaPacientes.jsx'));
    assert.ok(content.includes('BarraProgreso'), 'Pacientes debe incluir BarraProgreso V1.7');
  });
  test('Ejercicios tiene VideoPlaceholder (video engine stub)', () => {
    const content = read(outputFile('FisioNovaEjercicios.jsx'));
    assert.ok(content.includes('VideoPlaceholder'), 'Ejercicios debe incluir VideoPlaceholder para V1.7 video engine');
  });
  test('Dashboard tiene DonutChart (animated metrics)', () => {
    const content = read(outputFile('FisioNovaDashboard.jsx'));
    assert.ok(content.includes('DonutChart'), 'Dashboard debe incluir DonutChart');
  });
  test('Leads tiene vista kanban (expandable cards)', () => {
    const content = read(outputFile('FisioNovaLeads.jsx'));
    assert.ok(content.includes('KanbanCol') || content.includes('kanban'), 'Leads debe tener vista kanban');
  });
  test('Servicios en Landing tienen expandable-cards', () => {
    const content = read(outputFile('FisioNovaLanding.jsx'));
    assert.ok(content.includes('expandido'), 'Landing debe tener lógica de expandable cards para servicios');
  });
  test('Asistente simula latencia de IA con delay fijo', () => {
    const content = read(outputFile('FisioNovaAsistente.jsx'));
    // Math.random no debe usarse en calls — solo comentarios son ok
    const codeWithoutComments = content.replace(/\/\/.*/g, '');
    assert.ok(!codeWithoutComments.includes('Math.random'), 'Asistente no debe llamar Math.random en código (impura)');
    assert.ok(content.includes('setTimeout'), 'Asistente debe simular latencia con setTimeout');
  });
});
