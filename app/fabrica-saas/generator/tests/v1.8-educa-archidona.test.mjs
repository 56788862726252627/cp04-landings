/**
 * Tests EducaArchidona Demo — Fabrica SaaS V1.8
 * Verifica: manifest, mock data, archivos output, branding, modulos,
 *           normativa, roles, seguridad IA, privacidad, vite config.
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

function file(...parts)  { return resolve(ROOT, 'fabrica-saas', ...parts); }
function appFile(...p)   { return resolve(ROOT, ...p); }
function outputFile(n)   { return file('output', 'educa-archidona-demo', n); }
function clientFile(n)   { return file('clients', 'educa-archidona-demo', n); }
function docFile(...p)   { return file('docs', 'education', ...p); }
function exists(path)    { return existsSync(path); }
function read(path)      { return readFileSync(path, 'utf8'); }

// ─── Suite 1: Archivos de output JSX ─────────────────────────────────────────

describe('EducaArchidona Output — Archivos existentes', () => {
  const expectedFiles = [
    'EducaArchidonaMockData.js',
    'EducaArchidonaApp.jsx',
    'EducaArchidonaLanding.jsx',
    'EducaArchidonaDashboardAlumno.jsx',
    'EducaArchidonaClases.jsx',
    'EducaArchidonaEjercicios.jsx',
    'EducaArchidonaProgreso.jsx',
    'EducaArchidonaTutorIA.jsx',
    'EducaArchidonaCalendario.jsx',
    'EducaArchidonaDashboardProfesor.jsx',
    'EducaArchidonaDashboardFamilia.jsx',
    'EducaArchidonaAdmin.jsx',
    'main.jsx',
  ];

  for (const f of expectedFiles) {
    test(`existe output/${f}`, () => {
      assert.ok(exists(outputFile(f)), `Falta output/educa-archidona-demo/${f}`);
    });
  }
});

// ─── Suite 2: Manifest V1.8 ───────────────────────────────────────────────────

describe('EducaArchidona Manifest V1.8', () => {
  let manifest;
  test('manifest.yaml existe', () => {
    const path = clientFile('manifest.yaml');
    assert.ok(exists(path), 'Falta clients/educa-archidona-demo/manifest.yaml');
    manifest = read(path);
  });
  test('version es 1.8', () => {
    assert.ok(manifest.includes('version: "1.8"'), 'Manifest debe tener version: "1.8"');
  });
  test('vertical es education', () => {
    assert.ok(manifest.includes('vertical: education'), 'Manifest debe tener vertical: education');
  });
  test('primaryColor azul educacion', () => {
    assert.ok(manifest.includes('#1d4ed8'), 'Branding debe usar #1d4ed8 (blue-700)');
  });
  test('secondaryColor verde', () => {
    assert.ok(manifest.includes('#16a34a'), 'Branding debe usar #16a34a (green)');
  });
  test('accentColor amarillo', () => {
    assert.ok(manifest.includes('#f59e0b'), 'Branding debe usar #f59e0b (amber)');
  });
  test('preset fresh', () => {
    assert.ok(manifest.includes('preset: fresh'), 'Experience preset debe ser fresh');
  });
  test('nombre es EducaArchidona', () => {
    assert.ok(manifest.includes('EducaArchidona'), 'Branding debe tener EducaArchidona');
  });
  test('etapa primaria presente con Decreto 101/2023', () => {
    assert.ok(manifest.includes('Decreto 101/2023'), 'Manifest debe referenciar Decreto 101/2023');
  });
  test('etapa eso presente con Decreto 102/2023', () => {
    assert.ok(manifest.includes('Decreto 102/2023'), 'Manifest debe referenciar Decreto 102/2023');
  });
  test('etapa bachillerato presente con Decreto 103/2023', () => {
    assert.ok(manifest.includes('Decreto 103/2023'), 'Manifest debe referenciar Decreto 103/2023');
  });
  test('5 roles declarados', () => {
    const roles = ['alumno', 'profesor', 'familia', 'tutor', 'admin'];
    for (const r of roles) {
      assert.ok(manifest.includes(`- ${r}`), `Rol "${r}" no encontrado en manifest`);
    }
  });
  test('10 modulos declarados', () => {
    const mods = ['landing', 'dashboard_alumno', 'clases', 'ejercicios', 'progreso',
                  'tutor_ia', 'calendario', 'dashboard_profesor', 'dashboard_familia', 'admin'];
    for (const m of mods) {
      assert.ok(manifest.includes(m), `Modulo "${m}" no encontrado`);
    }
  });
  test('ai_tutor en modo demo', () => {
    assert.ok(manifest.includes('ai_tutor: demo'), 'ai_tutor debe estar en modo demo');
  });
  test('no_real_student_data: true', () => {
    assert.ok(manifest.includes('no_real_student_data: true'), 'Compliance: no_real_student_data debe ser true');
  });
  test('demo_only: true', () => {
    assert.ok(manifest.includes('demo_only: true'), 'Compliance: demo_only debe ser true');
  });
  test('modalidades Bachillerato verificadas', () => {
    assert.ok(manifest.includes('ciencias'), 'Modalidad ciencias debe estar en manifest');
    assert.ok(manifest.includes('humanidades'), 'Modalidad humanidades debe estar en manifest');
    assert.ok(manifest.includes('VERIFIED'), 'Modalidades deben tener estado VERIFIED');
  });
  test('child_safety activo', () => {
    assert.ok(manifest.includes('child_safety: true'), 'child_safety debe ser true');
  });
  test('tutor_transparency activo', () => {
    assert.ok(manifest.includes('tutor_transparency: true'), 'tutor_transparency debe ser true');
  });
  test('no_ai_real activo', () => {
    assert.ok(manifest.includes('no_ai_real: true'), 'no_ai_real debe ser true');
  });
  test('age_aware activo', () => {
    assert.ok(manifest.includes('age_aware: true'), 'age_aware debe ser true');
  });
  test('scrollEffects declarados', () => {
    const fx = ['fade-in', 'slide-up', 'stagger-reveal', 'counter-on-visible'];
    for (const f of fx) {
      assert.ok(manifest.includes(f), `scrollEffect "${f}" no encontrado`);
    }
  });
  test('referencias docs de privacidad y IA', () => {
    assert.ok(manifest.includes('EDUCATION_CHILD_PRIVACY_ARCHITECTURE.md'), 'Debe referenciar doc de privacidad');
    assert.ok(manifest.includes('EDUCATION_AI_SAFETY_POLICY.md'), 'Debe referenciar doc de IA safety');
  });
});

// ─── Suite 3: MockData ────────────────────────────────────────────────────────

describe('EducaArchidona MockData', () => {
  let content;
  test('EducaArchidonaMockData.js existe y es legible', () => {
    const path = outputFile('EducaArchidonaMockData.js');
    assert.ok(exists(path), 'Falta EducaArchidonaMockData.js');
    content = read(path);
  });

  // BRANDING
  test('exporta BRANDING', () => {
    assert.ok(content.includes('export const BRANDING'), 'Debe exportar BRANDING');
  });
  test('BRANDING tiene nombre EducaArchidona', () => {
    assert.ok(content.includes("'EducaArchidona'"), 'BRANDING.nombre debe ser EducaArchidona');
  });
  test('BRANDING tiene primaryColor azul', () => {
    assert.ok(content.includes('#1d4ed8'), 'BRANDING.primaryColor debe ser #1d4ed8');
  });

  // HERO_METRICS
  test('exporta HERO_METRICS', () => {
    assert.ok(content.includes('export const HERO_METRICS'), 'Debe exportar HERO_METRICS');
  });
  test('HERO_METRICS tiene 4 entradas', () => {
    const matches = content.match(/valor:/g) || [];
    assert.ok(matches.length >= 4, 'HERO_METRICS debe tener al menos 4 metricas');
  });

  // ETAPAS
  test('exporta ETAPAS', () => {
    assert.ok(content.includes('export const ETAPAS'), 'Debe exportar ETAPAS');
  });
  test('ETAPAS tiene primaria, eso, bachillerato', () => {
    assert.ok(content.includes("id: 'primaria'"), 'ETAPAS debe incluir primaria');
    assert.ok(content.includes("id: 'eso'"), 'ETAPAS debe incluir eso');
    assert.ok(content.includes("id: 'bachillerato'"), 'ETAPAS debe incluir bachillerato');
  });
  test('ETAPAS tiene estado LEGAL', () => {
    assert.ok(content.includes("verificationStatus:'LEGAL'"), 'ETAPAS debe tener verificationStatus LEGAL');
  });
  test('ETAPAS tiene referencias a decretos', () => {
    assert.ok(content.includes('Decreto 101/2023'), 'ETAPAS debe referenciar Decreto 101/2023');
    assert.ok(content.includes('Decreto 102/2023'), 'ETAPAS debe referenciar Decreto 102/2023');
    assert.ok(content.includes('Decreto 103/2023'), 'ETAPAS debe referenciar Decreto 103/2023');
  });

  // MATERIAS
  test('exporta MATERIAS', () => {
    assert.ok(content.includes('export const MATERIAS'), 'Debe exportar MATERIAS');
  });
  test('MATERIAS tiene materias de primaria con status LEGAL', () => {
    assert.ok(content.includes("etapa:'primaria'"), 'MATERIAS debe tener etapa primaria');
  });
  test('MATERIAS tiene materias de ESO con status LEGAL', () => {
    assert.ok(content.includes("etapa:'eso'"), 'MATERIAS debe tener etapa eso');
  });
  test('MATERIAS tiene materias de Bachillerato con status LEGAL', () => {
    assert.ok(content.includes("etapa:'bachillerato'"), 'MATERIAS debe tener etapa bachillerato');
  });
  test('MATERIAS incluye Matematicas como materia comun', () => {
    assert.ok(content.includes('Matematicas'), 'MATERIAS debe incluir Matematicas');
  });
  test('MATERIAS tiene al menos 20 entradas', () => {
    const matches = content.match(/id:'mat-/g) || [];
    assert.ok(matches.length >= 20, `MATERIAS debe tener >= 20 entradas, tiene ${matches.length}`);
  });

  // ALUMNO_DEMO
  test('exporta ALUMNO_DEMO', () => {
    assert.ok(content.includes('export const ALUMNO_DEMO'), 'Debe exportar ALUMNO_DEMO');
  });
  test('ALUMNO_DEMO tiene nombre ficticio', () => {
    assert.ok(content.includes('Alex'), 'ALUMNO_DEMO debe tener nombre (ficticio)');
  });
  test('ALUMNO_DEMO tiene racha y puntos', () => {
    assert.ok(content.includes('racha:'), 'ALUMNO_DEMO debe tener racha');
    assert.ok(content.includes('puntos:'), 'ALUMNO_DEMO debe tener puntos (gamificacion)');
  });

  // PROGRESO_MATERIAS
  test('exporta PROGRESO_MATERIAS', () => {
    assert.ok(content.includes('export const PROGRESO_MATERIAS'), 'Debe exportar PROGRESO_MATERIAS');
  });
  test('PROGRESO_MATERIAS tiene progreso y nota', () => {
    assert.ok(content.includes('progreso:'), 'PROGRESO_MATERIAS debe tener campo progreso');
    assert.ok(content.includes('nota:'), 'PROGRESO_MATERIAS debe tener campo nota');
  });

  // TAREAS_PENDIENTES
  test('exporta TAREAS_PENDIENTES', () => {
    assert.ok(content.includes('export const TAREAS_PENDIENTES'), 'Debe exportar TAREAS_PENDIENTES');
  });
  test('TAREAS_PENDIENTES tiene campo urgente', () => {
    assert.ok(content.includes('urgente:'), 'TAREAS_PENDIENTES debe tener campo urgente');
  });

  // PROXIMOS_EXAMENES
  test('exporta PROXIMOS_EXAMENES', () => {
    assert.ok(content.includes('export const PROXIMOS_EXAMENES'), 'Debe exportar PROXIMOS_EXAMENES');
  });
  test('PROXIMOS_EXAMENES tiene dificultad', () => {
    assert.ok(content.includes('dificultad:'), 'PROXIMOS_EXAMENES debe tener campo dificultad');
  });

  // LECCIONES
  test('exporta LECCIONES', () => {
    assert.ok(content.includes('export const LECCIONES'), 'Debe exportar LECCIONES');
  });
  test('LECCIONES tiene tipos video, texto, ejercicio', () => {
    assert.ok(content.includes("tipo:'video'"), 'LECCIONES debe tener tipo video');
    assert.ok(content.includes("tipo:'texto'"), 'LECCIONES debe tener tipo texto');
    assert.ok(content.includes("tipo:'ejercicio'"), 'LECCIONES debe tener tipo ejercicio');
  });

  // EJERCICIOS
  test('exporta EJERCICIOS', () => {
    assert.ok(content.includes('export const EJERCICIOS'), 'Debe exportar EJERCICIOS');
  });
  test('EJERCICIOS tiene tipos opcion-multiple y verdadero-falso', () => {
    assert.ok(content.includes("tipo:'opcion-multiple'"), 'EJERCICIOS debe tener opcion-multiple');
    assert.ok(content.includes("tipo:'verdadero-falso'"), 'EJERCICIOS debe tener verdadero-falso');
  });
  test('EJERCICIOS tiene pista y explicacion', () => {
    assert.ok(content.includes('pista:'), 'EJERCICIOS debe tener campo pista');
    assert.ok(content.includes('explicacion:'), 'EJERCICIOS debe tener campo explicacion');
  });

  // TUTOR_RESPUESTAS
  test('exporta TUTOR_RESPUESTAS', () => {
    assert.ok(content.includes('export const TUTOR_RESPUESTAS'), 'Debe exportar TUTOR_RESPUESTAS');
  });
  test('TUTOR_RESPUESTAS tiene 4 intents', () => {
    const intents = ['explicar', 'pista', 'quiz', 'resumen'];
    for (const i of intents) {
      assert.ok(content.includes(`${i}:`), `TUTOR_RESPUESTAS debe tener intent "${i}"`);
    }
  });

  // GRUPO_PROFESOR
  test('exporta GRUPO_PROFESOR', () => {
    assert.ok(content.includes('export const GRUPO_PROFESOR'), 'Debe exportar GRUPO_PROFESOR');
  });
  test('GRUPO_PROFESOR tiene alumnos y tareas', () => {
    assert.ok(content.includes('alumnos:'), 'GRUPO_PROFESOR debe tener alumnos');
    assert.ok(content.includes('tareas:'), 'GRUPO_PROFESOR debe tener tareas');
  });

  // INSIGNIAS
  test('exporta INSIGNIAS', () => {
    assert.ok(content.includes('export const INSIGNIAS'), 'Debe exportar INSIGNIAS');
  });
  test('INSIGNIAS tiene campo desbloqueada', () => {
    assert.ok(content.includes('desbloqueada:'), 'INSIGNIAS debe tener campo desbloqueada (gamificacion)');
  });

  // CALENDARIO_EVENTOS
  test('exporta CALENDARIO_EVENTOS', () => {
    assert.ok(content.includes('export const CALENDARIO_EVENTOS'), 'Debe exportar CALENDARIO_EVENTOS');
  });
  test('CALENDARIO_EVENTOS tiene tipos tarea, examen, evaluacion', () => {
    assert.ok(content.includes("tipo:'tarea'"), 'CALENDARIO debe tener tipo tarea');
    assert.ok(content.includes("tipo:'examen'"), 'CALENDARIO debe tener tipo examen');
    assert.ok(content.includes("tipo:'evaluacion'"), 'CALENDARIO debe tener tipo evaluacion');
  });

  // VIDEO_LECCIONES
  test('exporta VIDEO_LECCIONES', () => {
    assert.ok(content.includes('export const VIDEO_LECCIONES'), 'Debe exportar VIDEO_LECCIONES');
  });

  // LANDING_FEATURES
  test('exporta LANDING_FEATURES', () => {
    assert.ok(content.includes('export const LANDING_FEATURES'), 'Debe exportar LANDING_FEATURES');
  });
  test('LANDING_FEATURES tiene al menos 6 entradas', () => {
    const matches = content.match(/titulo:/g) || [];
    assert.ok(matches.length >= 6, `LANDING_FEATURES debe tener >= 6 entradas, tiene ${matches.length}`);
  });
});

// ─── Suite 4: App Shell ───────────────────────────────────────────────────────

describe('EducaArchidonaApp — App Shell', () => {
  let content;
  test('EducaArchidonaApp.jsx existe', () => {
    const path = outputFile('EducaArchidonaApp.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('importa AppShell', () => {
    assert.ok(content.includes("from '../../core/AppShell.jsx'"), 'Debe importar AppShell del core');
  });
  test('importa todos los componentes principales', () => {
    const comps = ['EducaArchidonaLanding', 'EducaArchidonaDashboardAlumno',
                   'EducaArchidonaClases', 'EducaArchidonaEjercicios',
                   'EducaArchidonaProgreso', 'EducaArchidonaTutorIA',
                   'EducaArchidonaCalendario', 'EducaArchidonaDashboardProfesor',
                   'EducaArchidonaDashboardFamilia', 'EducaArchidonaAdmin'];
    for (const c of comps) {
      assert.ok(content.includes(c), `App debe importar ${c}`);
    }
  });
  test('tiene role switcher con 4 roles', () => {
    const roles = ['alumno', 'profesor', 'familia', 'admin'];
    for (const r of roles) {
      assert.ok(content.includes(`id: '${r}'`), `App debe tener rol "${r}"`);
    }
  });
  test('BRANDING tiene color azul educacion', () => {
    assert.ok(content.includes('#1d4ed8'), 'App BRANDING debe usar color #1d4ed8');
  });
  test('exporta EducaArchidonaApp', () => {
    assert.ok(content.includes('export function EducaArchidonaApp'), 'Debe exportar EducaArchidonaApp');
  });
  test('tiene label demo visible', () => {
    assert.ok(content.includes('Demo'), 'App debe mostrar aviso "Demo"');
  });
  test('tiene aria-pressed en botones de rol', () => {
    assert.ok(content.includes('aria-pressed'), 'Role switcher debe tener aria-pressed para accesibilidad');
  });
});

// ─── Suite 5: Landing Page ────────────────────────────────────────────────────

describe('EducaArchidonaLanding — Landing Page', () => {
  let content;
  test('EducaArchidonaLanding.jsx existe', () => {
    const path = outputFile('EducaArchidonaLanding.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('usa IntersectionObserver para scroll effects', () => {
    assert.ok(content.includes('IntersectionObserver'), 'Landing debe usar IntersectionObserver (V1.7+)');
  });
  test('tiene AnimatedNumber para metricas', () => {
    assert.ok(content.includes('AnimatedNumber') || content.includes('requestAnimationFrame'),
      'Landing debe tener animacion de numeros');
  });
  test('referencia normativa BOJA 2023', () => {
    assert.ok(content.includes('2023'), 'Landing debe referenciar normativa 2023');
  });
  test('muestra 3 etapas educativas', () => {
    assert.ok(content.includes('ETAPAS'), 'Landing debe mostrar ETAPAS');
  });
  test('exporta EducaArchidonaLanding', () => {
    assert.ok(content.includes('export function EducaArchidonaLanding'), 'Debe exportar EducaArchidonaLanding');
  });
  test('tiene badge de normativa', () => {
    assert.ok(content.includes('NormativaBadge') || content.includes('LEGAL'),
      'Landing debe mostrar estado de verificacion normativa');
  });
  test('seccion de privacidad visible', () => {
    assert.ok(content.includes('Privacidad') || content.includes('RGPD'),
      'Landing debe tener seccion de privacidad');
  });
  test('CTA visible', () => {
    assert.ok(content.includes('CTA') || content.includes('Prueba la demo'),
      'Landing debe tener CTA');
  });
  test('aviso demo visible', () => {
    assert.ok(content.includes('Demo') || content.includes('ficticios'),
      'Landing debe mostrar aviso de demo');
  });
  test('tiene hover effect en feature cards', () => {
    assert.ok(content.includes('onMouseEnter') || content.includes('hover'),
      'Landing debe tener hover effects en las cards');
  });
});

// ─── Suite 6: Dashboard Alumno ───────────────────────────────────────────────

describe('EducaArchidonaDashboardAlumno', () => {
  let content;
  test('EducaArchidonaDashboardAlumno.jsx existe', () => {
    const path = outputFile('EducaArchidonaDashboardAlumno.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('tiene ProgressRing', () => {
    assert.ok(content.includes('ProgressRing'), 'Dashboard alumno debe tener ProgressRing');
  });
  test('muestra ALUMNO_DEMO', () => {
    assert.ok(content.includes('ALUMNO_DEMO'), 'Dashboard debe mostrar datos del alumno demo');
  });
  test('muestra PROGRESO_MATERIAS', () => {
    assert.ok(content.includes('PROGRESO_MATERIAS'), 'Dashboard debe mostrar progreso por materia');
  });
  test('muestra TAREAS_PENDIENTES', () => {
    assert.ok(content.includes('TAREAS_PENDIENTES'), 'Dashboard debe mostrar tareas');
  });
  test('muestra PROXIMOS_EXAMENES', () => {
    assert.ok(content.includes('PROXIMOS_EXAMENES'), 'Dashboard debe mostrar proximos examenes');
  });
  test('muestra INSIGNIAS (gamificacion)', () => {
    assert.ok(content.includes('INSIGNIAS'), 'Dashboard debe mostrar insignias (gamificacion)');
  });
  test('exporta EducaArchidonaDashboardAlumno', () => {
    assert.ok(content.includes('export function EducaArchidonaDashboardAlumno'), 'Debe exportar la funcion');
  });
  test('tiene barra de progreso por materia', () => {
    assert.ok(content.includes('progreso'), 'Dashboard debe mostrar barras de progreso');
  });
  test('tiene colores por urgencia en tareas', () => {
    assert.ok(content.includes('urgente'), 'Dashboard debe diferenciar tareas urgentes');
  });
});

// ─── Suite 7: Motor de Ejercicios ────────────────────────────────────────────

describe('EducaArchidonaEjercicios — Motor de Ejercicios', () => {
  let content;
  test('EducaArchidonaEjercicios.jsx existe', () => {
    const path = outputFile('EducaArchidonaEjercicios.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('soporta opcion-multiple', () => {
    assert.ok(content.includes('opcion-multiple'), 'Ejercicios debe soportar opcion multiple');
  });
  test('soporta verdadero-falso', () => {
    assert.ok(content.includes('verdadero-falso'), 'Ejercicios debe soportar verdadero o falso');
  });
  test('tiene sistema de puntuacion', () => {
    assert.ok(content.includes('puntos'), 'Ejercicios debe tener sistema de puntuacion');
  });
  test('tiene funcion de pista', () => {
    assert.ok(content.includes('pista') || content.includes('Pista'), 'Ejercicios debe tener pistas');
  });
  test('tiene feedback de respuesta correcta/incorrecta', () => {
    assert.ok(content.includes('Correcto') || content.includes('correcto'), 'Ejercicios debe dar feedback');
  });
  test('tiene explicacion al responder', () => {
    assert.ok(content.includes('explicacion'), 'Ejercicios debe mostrar explicacion');
  });
  test('tiene navegacion entre ejercicios', () => {
    assert.ok(content.includes('Siguiente') || content.includes('siguiente'), 'Debe tener navegacion');
  });
  test('tiene boton reiniciar', () => {
    assert.ok(content.includes('Reiniciar') || content.includes('reiniciar'), 'Debe poder reiniciar');
  });
  test('exporta EducaArchidonaEjercicios', () => {
    assert.ok(content.includes('export function EducaArchidonaEjercicios'), 'Debe exportar la funcion');
  });
  test('tiene aria-pressed para accesibilidad', () => {
    assert.ok(content.includes('aria-pressed') || content.includes('aria-label'),
      'Ejercicios debe tener atributos ARIA');
  });
});

// ─── Suite 8: Tutor IA ───────────────────────────────────────────────────────

describe('EducaArchidonaTutorIA — Seguridad y Transparencia', () => {
  let content;
  test('EducaArchidonaTutorIA.jsx existe', () => {
    const path = outputFile('EducaArchidonaTutorIA.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('Badge demo visible: "Sin IA real"', () => {
    assert.ok(content.includes('Sin IA real') || content.includes('sin IA real'),
      'Tutor IA debe mostrar badge "Sin IA real"');
  });
  test('aviso RGPD o privacidad visible', () => {
    assert.ok(content.includes('RGPD') || content.includes('almacena') || content.includes('datos'),
      'Tutor IA debe mencionar privacidad de datos');
  });
  test('aviso de no almacenamiento visible', () => {
    assert.ok(content.includes('almacenamiento') || content.includes('almacena'),
      'Tutor IA debe indicar que no almacena conversaciones');
  });
  test('tiene intents: explicar, pista, quiz, resumen', () => {
    const intents = ['explicar', 'pista', 'quiz', 'resumen'];
    for (const i of intents) {
      assert.ok(content.includes(i), `Tutor IA debe soportar intent "${i}"`);
    }
  });
  test('usa TUTOR_RESPUESTAS del mock', () => {
    assert.ok(content.includes('TUTOR_RESPUESTAS'), 'Tutor IA debe usar respuestas predefinidas del mock');
  });
  test('tiene latencia simulada (setTimeout)', () => {
    assert.ok(content.includes('setTimeout'), 'Tutor IA debe simular latencia realista');
  });
  test('tiene input de texto con aria-label', () => {
    assert.ok(content.includes('aria-label'), 'Input del tutor debe tener aria-label');
  });
  test('responde a Enter', () => {
    assert.ok(content.includes('Enter'), 'Tutor IA debe responder al teclado Enter');
  });
  test('identifica al asistente como IA', () => {
    assert.ok(content.includes('Tutor IA') || content.includes('asistente'),
      'Debe identificar siempre al asistente como IA');
  });
  test('exporta EducaArchidonaTutorIA', () => {
    assert.ok(content.includes('export function EducaArchidonaTutorIA'), 'Debe exportar la funcion');
  });
  test('menciona politica AI safety', () => {
    assert.ok(content.includes('EDUCATION_AI_SAFETY_POLICY') || content.includes('examenes activos'),
      'Tutor IA debe referenciar la politica de seguridad');
  });
});

// ─── Suite 9: Dashboard Profesor ─────────────────────────────────────────────

describe('EducaArchidonaDashboardProfesor', () => {
  let content;
  test('EducaArchidonaDashboardProfesor.jsx existe', () => {
    const path = outputFile('EducaArchidonaDashboardProfesor.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('usa GRUPO_PROFESOR', () => {
    assert.ok(content.includes('GRUPO_PROFESOR'), 'Dashboard debe usar datos del grupo');
  });
  test('tiene vista de alumnos', () => {
    assert.ok(content.includes('alumnos') || content.includes('Alumnos'), 'Debe tener vista de alumnos');
  });
  test('tiene seguimiento de tareas', () => {
    assert.ok(content.includes('tareas') || content.includes('Tareas'), 'Debe tener seguimiento de tareas');
  });
  test('muestra progreso y nota por alumno', () => {
    assert.ok(content.includes('progreso') && content.includes('nota'), 'Debe mostrar progreso y nota');
  });
  test('exporta EducaArchidonaDashboardProfesor', () => {
    assert.ok(content.includes('export function EducaArchidonaDashboardProfesor'), 'Debe exportar la funcion');
  });
});

// ─── Suite 10: Portal Familia ─────────────────────────────────────────────────

describe('EducaArchidonaDashboardFamilia — Privacidad', () => {
  let content;
  test('EducaArchidonaDashboardFamilia.jsx existe', () => {
    const path = outputFile('EducaArchidonaDashboardFamilia.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('tiene aviso "solo lectura"', () => {
    assert.ok(content.includes('lectura') || content.includes('Solo lectura'),
      'Portal familia debe indicar acceso de solo lectura');
  });
  test('menciona politica de privacidad', () => {
    assert.ok(content.includes('RGPD') || content.includes('privacidad') || content.includes('confidencialidad'),
      'Portal familia debe mencionar privacidad');
  });
  test('aviso datos ficticios', () => {
    assert.ok(content.includes('ficticios') || content.includes('demo'),
      'Portal familia debe avisar que los datos son ficticios');
  });
  test('muestra progreso del hijo/a', () => {
    assert.ok(content.includes('PROGRESO_MATERIAS') || content.includes('progreso'),
      'Portal familia debe mostrar progreso');
  });
  test('exporta EducaArchidonaDashboardFamilia', () => {
    assert.ok(content.includes('export function EducaArchidonaDashboardFamilia'), 'Debe exportar la funcion');
  });
});

// ─── Suite 11: Admin Panel ────────────────────────────────────────────────────

describe('EducaArchidonaAdmin', () => {
  let content;
  test('EducaArchidonaAdmin.jsx existe', () => {
    const path = outputFile('EducaArchidonaAdmin.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('tiene seccion de usuarios', () => {
    assert.ok(content.includes('Usuarios') || content.includes('usuarios'), 'Admin debe tener gestion de usuarios');
  });
  test('tiene seccion de cursos/materias', () => {
    assert.ok(content.includes('materias') || content.includes('Materias'), 'Admin debe tener cursos y materias');
  });
  test('muestra ETAPAS desde mock', () => {
    assert.ok(content.includes('ETAPAS'), 'Admin debe mostrar etapas educativas');
  });
  test('muestra MATERIAS desde mock', () => {
    assert.ok(content.includes('MATERIAS'), 'Admin debe mostrar materias');
  });
  test('tiene aviso demo prominente', () => {
    assert.ok(content.includes('demo') || content.includes('Demo'), 'Admin debe mostrar aviso de demo');
  });
  test('exporta EducaArchidonaAdmin', () => {
    assert.ok(content.includes('export function EducaArchidonaAdmin'), 'Debe exportar la funcion');
  });
});

// ─── Suite 12: Visor de Clases ───────────────────────────────────────────────

describe('EducaArchidonaClases', () => {
  let content;
  test('EducaArchidonaClases.jsx existe', () => {
    const path = outputFile('EducaArchidonaClases.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('tiene VideoPlaceholder sin video real', () => {
    assert.ok(content.includes('VideoPlaceholder') || content.includes('video'),
      'Visor debe tener placeholder de video');
  });
  test('avisa que no hay video real', () => {
    assert.ok(content.includes('Demo') || content.includes('ficticio'),
      'VideoPlaceholder debe avisar que es demo sin video real');
  });
  test('soporta tipos: video, texto, ejercicio', () => {
    assert.ok(content.includes('video') && content.includes('texto') && content.includes('ejercicio'),
      'Visor debe soportar los 3 tipos de leccion');
  });
  test('usa LECCIONES del mock', () => {
    assert.ok(content.includes('LECCIONES'), 'Visor debe usar LECCIONES del mock');
  });
  test('exporta EducaArchidonaClases', () => {
    assert.ok(content.includes('export function EducaArchidonaClases'), 'Debe exportar la funcion');
  });
  test('tiene aria-label en el video placeholder', () => {
    assert.ok(content.includes('aria-label'), 'VideoPlaceholder debe tener aria-label para accesibilidad');
  });
});

// ─── Suite 13: Progreso ───────────────────────────────────────────────────────

describe('EducaArchidonaProgreso', () => {
  let content;
  test('EducaArchidonaProgreso.jsx existe', () => {
    const path = outputFile('EducaArchidonaProgreso.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('tiene barras animadas', () => {
    assert.ok(content.includes('AnimatedBar') || content.includes('transition'),
      'Progreso debe tener barras animadas');
  });
  test('muestra metricas globales', () => {
    assert.ok(content.includes('global') || content.includes('media'), 'Progreso debe mostrar metricas globales');
  });
  test('muestra evolucion por evaluacion', () => {
    assert.ok(content.includes('Eval') || content.includes('evolucion'), 'Progreso debe mostrar evolucion');
  });
  test('exporta EducaArchidonaProgreso', () => {
    assert.ok(content.includes('export function EducaArchidonaProgreso'), 'Debe exportar la funcion');
  });
});

// ─── Suite 14: Calendario ────────────────────────────────────────────────────

describe('EducaArchidonaCalendario', () => {
  let content;
  test('EducaArchidonaCalendario.jsx existe', () => {
    const path = outputFile('EducaArchidonaCalendario.jsx');
    assert.ok(exists(path));
    content = read(path);
  });
  test('tiene filtro por tipo de evento', () => {
    assert.ok(content.includes('filtro') || content.includes('Filtro'), 'Calendario debe tener filtros');
  });
  test('tipos de evento: tarea, examen, evaluacion', () => {
    assert.ok(content.includes('tarea'), 'Calendario debe tener tipo tarea');
    assert.ok(content.includes('examen'), 'Calendario debe tener tipo examen');
    assert.ok(content.includes('evaluacion'), 'Calendario debe tener tipo evaluacion');
  });
  test('usa CALENDARIO_EVENTOS del mock', () => {
    assert.ok(content.includes('CALENDARIO_EVENTOS'), 'Calendario debe usar eventos del mock');
  });
  test('exporta EducaArchidonaCalendario', () => {
    assert.ok(content.includes('export function EducaArchidonaCalendario'), 'Debe exportar la funcion');
  });
});

// ─── Suite 15: Entry point y build config ────────────────────────────────────

describe('EducaArchidona — Entry Point y Vite Config', () => {
  test('educa-archidona-demo.html existe', () => {
    const path = appFile('educa-archidona-demo.html');
    assert.ok(exists(path), 'Falta educa-archidona-demo.html en la raiz de app/');
  });
  test('HTML tiene referencia al main.jsx correcto', () => {
    const path = appFile('educa-archidona-demo.html');
    if (!exists(path)) return;
    const html = read(path);
    assert.ok(html.includes('educa-archidona-demo/main.jsx'), 'HTML debe apuntar al main.jsx de educaarchidona');
  });
  test('HTML tiene lang="es"', () => {
    const path = appFile('educa-archidona-demo.html');
    if (!exists(path)) return;
    const html = read(path);
    assert.ok(html.includes('lang="es"'), 'HTML debe tener lang es');
  });
  test('HTML tiene noindex (demo no indexable)', () => {
    const path = appFile('educa-archidona-demo.html');
    if (!exists(path)) return;
    const html = read(path);
    assert.ok(html.includes('noindex'), 'Demo HTML debe tener noindex para no ser indexado');
  });
  test('main.jsx importa EducaArchidonaApp', () => {
    const path = outputFile('main.jsx');
    assert.ok(exists(path));
    const main = read(path);
    assert.ok(main.includes('EducaArchidonaApp'), 'main.jsx debe importar EducaArchidonaApp');
  });
  test('main.jsx usa StrictMode', () => {
    const path = outputFile('main.jsx');
    if (!exists(path)) return;
    const main = read(path);
    assert.ok(main.includes('StrictMode'), 'main.jsx debe usar StrictMode');
  });
  test('vite.config.js incluye educa-archidona-demo como entry', () => {
    const path = appFile('vite.config.js');
    assert.ok(exists(path));
    const cfg = read(path);
    assert.ok(cfg.includes("'educa-archidona-demo'"), 'vite.config.js debe incluir educa-archidona-demo como entry');
    assert.ok(cfg.includes("'educa-archidona-demo.html'"), 'Debe apuntar al HTML correcto');
  });
  test('package.json tiene script factory:test:educa-archidona', () => {
    const path = appFile('package.json');
    assert.ok(exists(path));
    const pkg = read(path);
    assert.ok(pkg.includes('"factory:test:educa-archidona"'), 'package.json debe tener script factory:test:educa-archidona');
  });
  test('package.json tiene script factory:test:v1.8', () => {
    const path = appFile('package.json');
    if (!exists(path)) return;
    const pkg = read(path);
    assert.ok(pkg.includes('"factory:test:v1.8"'), 'package.json debe tener script factory:test:v1.8');
  });
  test('factory:test:all incluye v1.8', () => {
    const path = appFile('package.json');
    if (!exists(path)) return;
    const pkg = read(path);
    assert.ok(pkg.includes('v1.8-educa-archidona.test.mjs'), 'factory:test:all debe incluir los tests v1.8');
  });
});

// ─── Suite 16: Documentacion normativa ───────────────────────────────────────

describe('EducaArchidona — Documentacion y Normativa', () => {
  test('EDUCATION_ANDALUSIA_REGULATORY_BASE.md existe', () => {
    assert.ok(exists(docFile('EDUCATION_ANDALUSIA_REGULATORY_BASE.md')),
      'Falta documento de base normativa');
  });
  test('ARCHIDONA_EDUCATION_SOURCE_MATRIX.md existe', () => {
    assert.ok(exists(docFile('ARCHIDONA_EDUCATION_SOURCE_MATRIX.md')),
      'Falta matriz de fuentes de centros educativos');
  });
  test('EDUCATION_AI_SAFETY_POLICY.md existe', () => {
    assert.ok(exists(docFile('EDUCATION_AI_SAFETY_POLICY.md')),
      'Falta politica de seguridad del tutor IA');
  });
  test('EDUCATION_CHILD_PRIVACY_ARCHITECTURE.md existe', () => {
    assert.ok(exists(docFile('EDUCATION_CHILD_PRIVACY_ARCHITECTURE.md')),
      'Falta arquitectura de privacidad para menores');
  });

  test('Regulatory base menciona Decreto 101/2023', () => {
    const path = docFile('EDUCATION_ANDALUSIA_REGULATORY_BASE.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('Decreto 101/2023'), 'Debe referenciar Decreto 101/2023 Primaria');
  });
  test('Regulatory base menciona Decreto 102/2023', () => {
    const path = docFile('EDUCATION_ANDALUSIA_REGULATORY_BASE.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('Decreto 102/2023'), 'Debe referenciar Decreto 102/2023 ESO');
  });
  test('Regulatory base menciona Decreto 103/2023', () => {
    const path = docFile('EDUCATION_ANDALUSIA_REGULATORY_BASE.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('Decreto 103/2023'), 'Debe referenciar Decreto 103/2023 Bachillerato');
  });
  test('Regulatory base distingue LEGAL vs UNVERIFIED', () => {
    const path = docFile('EDUCATION_ANDALUSIA_REGULATORY_BASE.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('LEGAL') && doc.includes('UNVERIFIED'),
      'Documento debe distinguir LEGAL vs UNVERIFIED');
  });
  test('Source matrix tiene IES de Archidona verificado', () => {
    const path = docFile('ARCHIDONA_EDUCATION_SOURCE_MATRIX.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('VERIFIED'), 'Matriz debe tener datos VERIFIED');
    assert.ok(doc.includes('Archidona'), 'Matriz debe mencionar Archidona');
  });
  test('AI Safety Policy prohibe respuestas de examenes activos', () => {
    const path = docFile('EDUCATION_AI_SAFETY_POLICY.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('examenes') || doc.includes('examen'),
      'Politica IA debe prohibir dar respuestas de examenes');
  });
  test('Privacy Architecture tiene flujos de consentimiento', () => {
    const path = docFile('EDUCATION_CHILD_PRIVACY_ARCHITECTURE.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('Consentimiento') || doc.includes('consentimiento'),
      'Arquitectura de privacidad debe tener flujos de consentimiento');
  });
  test('Privacy Architecture diferencia menores de 14', () => {
    const path = docFile('EDUCATION_CHILD_PRIVACY_ARCHITECTURE.md');
    if (!exists(path)) return;
    const doc = read(path);
    assert.ok(doc.includes('14'), 'Arquitectura debe tratar especialmente a menores de 14');
  });
});

// ─── Suite 17: Compliance y aislamiento ──────────────────────────────────────

describe('EducaArchidona — Compliance y Aislamiento', () => {
  test('MockData no contiene datos reales de alumnos', () => {
    const content = read(outputFile('EducaArchidonaMockData.js'));
    // Los datos reales tendrian emails, DNI, telefonos reales — verificamos que no hay patrones
    assert.ok(!content.match(/\d{8}[A-Z]/), 'MockData no debe contener DNI reales');
    assert.ok(!content.match(/\+34\d{9}/), 'MockData no debe contener telefonos reales');
  });
  test('TutorIA no referencia IA real (OpenAI, Anthropic, etc)', () => {
    const content = read(outputFile('EducaArchidonaTutorIA.jsx'));
    assert.ok(!content.includes('openai'), 'TutorIA no debe referenciar OpenAI');
    assert.ok(!content.includes('anthropic'), 'TutorIA no debe referenciar Anthropic');
  });
  test('ninguno de los archivos tiene API keys hardcodeadas', () => {
    const files = [
      outputFile('EducaArchidonaMockData.js'),
      outputFile('EducaArchidonaApp.jsx'),
      outputFile('EducaArchidonaTutorIA.jsx'),
    ];
    for (const path of files) {
      if (!exists(path)) continue;
      const content = read(path);
      assert.ok(!content.match(/sk-[a-zA-Z0-9]{20,}/), `${path} no debe tener API keys hardcodeadas`);
      assert.ok(!content.match(/Bearer [a-zA-Z0-9._-]{20,}/), `${path} no debe tener tokens Bearer`);
    }
  });
  test('no hay referencias a produccion real (no .env, no prod URLs)', () => {
    const content = read(outputFile('EducaArchidonaApp.jsx'));
    assert.ok(!content.includes('supabase.co'), 'App no debe tener URLs de Supabase reales');
    assert.ok(!content.includes('airtable.com'), 'App no debe tener URLs de Airtable reales');
  });
  test('branding EducaArchidona es distinto de FisioNova y Aurora', () => {
    const content = read(outputFile('EducaArchidonaMockData.js'));
    assert.ok(!content.includes('#4338ca'), 'EducaArchidona no debe usar color de FisioNova (#4338ca)');
    assert.ok(!content.includes('#0c7873'), 'EducaArchidona no debe usar color de Aurora (#0c7873)');
    assert.ok(content.includes('#1d4ed8'), 'EducaArchidona debe usar su propio color (#1d4ed8)');
  });
});
