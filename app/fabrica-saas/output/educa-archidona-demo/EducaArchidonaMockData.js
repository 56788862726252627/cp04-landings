/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Mock Data V1.8
 * Datos 100% FICTICIOS. Normativa: Decretos 101/102/103-2023 Junta Andalucia.
 * NO usar en produccion.
 */

export const BRANDING = {
  nombre:         'EducaArchidona',
  nombre_visible: 'EducaArchidona - Plataforma Educativa',
  tagline:        'Aprende mas, avanza mejor',
  initial:        'EA',
  primaryColor:   '#1d4ed8',
  secondaryColor: '#16a34a',
  accentColor:    '#f59e0b',
  bgColor:        '#eff6ff',
  version:        'V1.8 - Demo',
};

export const HERO_METRICS = [
  { valor: '12',   label: 'Cursos disponibles',          icon: '🎓' },
  { valor: '94%',  label: 'Tasa de satisfaccion',        icon: '⭐' },
  { valor: '3',    label: 'Alumno - Profesor - Familia', icon: '👥' },
  { valor: '24/7', label: 'Tutor IA disponible',         icon: '🤖' },
];

export const ETAPAS = [
  { id: 'primaria',     nombre: 'Primaria',     icon: '🌱', color: '#16a34a',
    cursos: ['1 Primaria','2 Primaria','3 Primaria','4 Primaria','5 Primaria','6 Primaria'],
    normativa: 'Decreto 101/2023', verificationStatus: 'LEGAL' },
  { id: 'eso',          nombre: 'ESO',          icon: '📖', color: '#1d4ed8',
    cursos: ['1 ESO','2 ESO','3 ESO','4 ESO'],
    normativa: 'Decreto 102/2023', verificationStatus: 'LEGAL' },
  { id: 'bachillerato', nombre: 'Bachillerato', icon: '🏛️', color: '#7c3aed',
    cursos: ['1 Bach','2 Bach'],
    normativa: 'Decreto 103/2023', verificationStatus: 'LEGAL',
    modalidades: [
      { id: 'ciencias',    nombre: 'Ciencias y Tecnologia',      verificado: true },
      { id: 'humanidades', nombre: 'Humanidades y CC. Sociales', verificado: true },
    ] },
];

export const MATERIAS = [
  { id:'mat-lcl-p',  nombre:'Lengua Castellana y Literatura', etapa:'primaria',     tipo:'comun',   icon:'📝', verificationStatus:'LEGAL', normativaSource:'Dec. 101/2023' },
  { id:'mat-mat-p',  nombre:'Matematicas',                    etapa:'primaria',     tipo:'comun',   icon:'🔢', verificationStatus:'LEGAL', normativaSource:'Dec. 101/2023' },
  { id:'mat-cn-p',   nombre:'Conocimiento del Medio',         etapa:'primaria',     tipo:'comun',   icon:'🌍', verificationStatus:'LEGAL', normativaSource:'Dec. 101/2023' },
  { id:'mat-ef-p',   nombre:'Educacion Fisica',               etapa:'primaria',     tipo:'comun',   icon:'⚽', verificationStatus:'LEGAL', normativaSource:'Dec. 101/2023' },
  { id:'mat-ing-p',  nombre:'Primera Lengua Extranjera',      etapa:'primaria',     tipo:'comun',   icon:'🇬🇧', verificationStatus:'LEGAL', normativaSource:'Dec. 101/2023' },
  { id:'mat-art-p',  nombre:'Educacion Artistica',            etapa:'primaria',     tipo:'comun',   icon:'🎨', verificationStatus:'LEGAL', normativaSource:'Dec. 101/2023' },
  { id:'mat-lcl-eso',nombre:'Lengua Castellana y Literatura', etapa:'eso',          tipo:'comun',   icon:'📝', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3,4] },
  { id:'mat-mat-eso',nombre:'Matematicas',                    etapa:'eso',          tipo:'comun',   icon:'🔢', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3,4] },
  { id:'mat-geo-eso',nombre:'Geografia e Historia',           etapa:'eso',          tipo:'comun',   icon:'🗺️', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3,4] },
  { id:'mat-ef-eso', nombre:'Educacion Fisica',               etapa:'eso',          tipo:'comun',   icon:'⚽', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3,4] },
  { id:'mat-ing-eso',nombre:'Primera Lengua Extranjera',      etapa:'eso',          tipo:'comun',   icon:'🇬🇧', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3,4] },
  { id:'mat-bio-eso',nombre:'Biologia y Geologia',            etapa:'eso',          tipo:'comun',   icon:'🧬', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,3] },
  { id:'mat-cc-eso', nombre:'Cultura Clasica',                etapa:'eso',          tipo:'optativa',icon:'🏛️', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3] },
  { id:'mat-rob-eso',nombre:'Computacion y Robotica',         etapa:'eso',          tipo:'optativa',icon:'🤖', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[1,2,3] },
  { id:'mat-fla-eso',nombre:'Cultura del Flamenco',           etapa:'eso',          tipo:'optativa',icon:'💃', verificationStatus:'LEGAL', normativaSource:'Dec. 102/2023', cursos:[3] },
  { id:'mat-lcl-b',  nombre:'Lengua Castellana y Literatura', etapa:'bachillerato', tipo:'comun',   icon:'📝', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', cursos:[1,2] },
  { id:'mat-ing-b',  nombre:'Primera Lengua Extranjera',      etapa:'bachillerato', tipo:'comun',   icon:'🇬🇧', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', cursos:[1,2] },
  { id:'mat-his-b',  nombre:'Historia de Espana',             etapa:'bachillerato', tipo:'comun',   icon:'🏰', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', cursos:[2] },
  { id:'mat-hfi-b',  nombre:'Historia de la Filosofia',       etapa:'bachillerato', tipo:'comun',   icon:'📜', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', cursos:[2] },
  { id:'mat-mat-b',  nombre:'Matematicas I / II',             etapa:'bachillerato', tipo:'modalidad',icon:'🔢', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', modalidad:'ciencias',    cursos:[1,2] },
  { id:'mat-fis-b',  nombre:'Fisica',                         etapa:'bachillerato', tipo:'modalidad',icon:'⚛️', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', modalidad:'ciencias',    cursos:[2] },
  { id:'mat-lat-b',  nombre:'Latin',                          etapa:'bachillerato', tipo:'modalidad',icon:'🏛️', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', modalidad:'humanidades', cursos:[1,2] },
  { id:'mat-eco-b',  nombre:'Economia',                       etapa:'bachillerato', tipo:'modalidad',icon:'📊', verificationStatus:'LEGAL', normativaSource:'Dec. 103/2023', modalidad:'humanidades', cursos:[1,2] },
];

export const ALUMNO_DEMO = {
  nombre: 'Alex', apellidos: 'Garcia Moreno', curso: '3 ESO', etapa: 'eso', grupo: 'B',
  avatar: '🧑‍🎓', racha: 12, puntos: 2840, nivel: 'Explorador',
  insignias: ['primera-semana','quiz-perfecto','10-lecciones'],
};

export const PROGRESO_MATERIAS = [
  { materia: 'Matematicas',          progreso: 78, nota: 7.4, color: '#1d4ed8', horas: 14 },
  { materia: 'Lengua Castellana',    progreso: 85, nota: 8.1, color: '#16a34a', horas: 12 },
  { materia: 'Geografia e Historia', progreso: 62, nota: 6.3, color: '#f59e0b', horas:  9 },
  { materia: 'Biologia y Geologia',  progreso: 71, nota: 7.0, color: '#7c3aed', horas: 11 },
  { materia: 'Lengua Extranjera',    progreso: 90, nota: 8.7, color: '#0891b2', horas: 10 },
  { materia: 'Educacion Fisica',     progreso: 95, nota: 9.2, color: '#16a34a', horas:  6 },
];

export const TAREAS_PENDIENTES = [
  { id:'t1', materia:'Matematicas', titulo:'Ejercicios tema 4 - Funciones',       fecha:'2026-09-02', tipo:'ejercicio', urgente: true  },
  { id:'t2', materia:'Lengua',      titulo:'Redaccion: el romanticismo espanol',   fecha:'2026-09-04', tipo:'redaccion', urgente: false },
  { id:'t3', materia:'Biologia',    titulo:'Trabajo fotosintesis - presentacion',  fecha:'2026-09-06', tipo:'trabajo',   urgente: false },
  { id:'t4', materia:'Historia',    titulo:'Lectura: Revolucion Industrial p. 80', fecha:'2026-09-03', tipo:'lectura',   urgente: true  },
];

export const PROXIMOS_EXAMENES = [
  { materia:'Matematicas', fecha:'2026-09-10', tema:'Funciones y graficas',        dificultad:'media' },
  { materia:'Historia',    fecha:'2026-09-12', tema:'Revolucion Industrial',        dificultad:'alta'  },
  { materia:'Biologia',    fecha:'2026-09-17', tema:'Fotosintesis y respiracion',   dificultad:'media' },
];

export const LECCIONES = [
  { id:'l1', materia:'Matematicas', titulo:'Introduccion a las Funciones',   unidad:4, tipo:'video',    duracion:12, dificultad:'media', completada:true,  puntuacion:9,    tags:['funciones','algebra'] },
  { id:'l2', materia:'Matematicas', titulo:'Dominio y Recorrido',            unidad:4, tipo:'texto',    duracion:8,  dificultad:'media', completada:true,  puntuacion:8,    tags:['funciones','dominio'] },
  { id:'l3', materia:'Matematicas', titulo:'Funciones Lineales - Ejercicios',unidad:4, tipo:'ejercicio',duracion:20, dificultad:'media', completada:false, puntuacion:null, tags:['lineal','pendiente'] },
  { id:'l4', materia:'Lengua',      titulo:'El Romanticismo en Espana',      unidad:3, tipo:'video',    duracion:15, dificultad:'baja',  completada:false, puntuacion:null, tags:['romanticismo','literatura'] },
  { id:'l5', materia:'Biologia',    titulo:'La Fotosintesis paso a paso',    unidad:5, tipo:'video',    duracion:18, dificultad:'alta',  completada:false, puntuacion:null, tags:['fotosintesis','cloroplasto'] },
];

export const EJERCICIOS = [
  { id:'e1', materia:'Matematicas', tipo:'opcion-multiple',
    enunciado:'Cual representa una funcion lineal?',
    opciones:['f(x) = x cuadrado + 3','f(x) = 2x menos 5','f(x) = 1/x','f(x) = raiz de x'],
    respuesta_correcta:1, dificultad:'baja', puntos:10,
    pista:'Busca la funcion de grado 1 sin exponentes ni raices.',
    explicacion:'Una funcion lineal tiene forma f(x) = mx + b. Solo f(x) = 2x menos 5 cumple esto.' },
  { id:'e2', materia:'Matematicas', tipo:'verdadero-falso',
    enunciado:'El dominio de f(x) = 1/(x-3) incluye el valor x = 3.',
    respuesta_correcta:false, dificultad:'media', puntos:10,
    pista:'Que valor hace el denominador igual a cero?',
    explicacion:'x = 3 hace el denominador 0, queda excluido del dominio.' },
  { id:'e3', materia:'Biologia', tipo:'opcion-multiple',
    enunciado:'En que organulo celular ocurre la fotosintesis?',
    opciones:['Mitocondria','Ribosoma','Cloroplasto','Nucleo'],
    respuesta_correcta:2, dificultad:'baja', puntos:10,
    pista:'El organulo que da el color verde a las plantas.',
    explicacion:'La fotosintesis ocurre en los cloroplastos, que contienen clorofila.' },
  { id:'e4', materia:'Historia', tipo:'opcion-multiple',
    enunciado:'Cuando comenzo la Primera Revolucion Industrial?',
    opciones:['Siglo XVI','Segunda mitad siglo XVIII','Principios siglo XIX','Anno 1900'],
    respuesta_correcta:1, dificultad:'media', puntos:10,
    pista:'Ocurrio en Gran Bretanna, antes del siglo XIX.',
    explicacion:'La Primera Revolucion Industrial comenzo en Gran Bretanna en la segunda mitad del siglo XVIII.' },
];

export const TUTOR_RESPUESTAS = {
  explicar: [
    'Claro, te lo explico diferente. Una funcion es como una maquina: metes un numero, siempre sale el mismo resultado para ese numero. Si metes el mismo x, obtienes el mismo y.',
    'La fotosintesis es la cocina de la planta. Los ingredientes son luz solar, agua y CO2. El plato que prepara es glucosa y oxigeno.',
    'La Revolucion Industrial fue el equivalente a internet en el siglo XVIII, pero con maquinas de vapor. Cambio la produccion, el trabajo y la vida cotidiana.',
  ],
  pista: [
    'Pista: que valor de x hace que el denominador sea cero? Ese es el que excluyes del dominio.',
    'Pista: en una funcion lineal, x siempre tiene exponente 1. Sin cuadrados, sin raices.',
    'Pista: el organulo responsable de la fotosintesis es el que da el color verde a las plantas.',
  ],
  quiz: [
    'Mini quiz: cual es la pendiente de f(x) = 3x menos 7?',
    'Quiz rapido: verdadero o falso, la fotosintesis produce CO2.',
    'Pregunta: en que pais comenzo la Primera Revolucion Industrial?',
  ],
  resumen: [
    'Resumen funciones: a cada x le corresponde exactamente una y. Tipos: lineal (recta), cuadratica (parabola). Dominio: valores validos de x. Recorrido: valores posibles de y.',
    'Resumen fotosintesis: ocurre en cloroplastos. Necesita luz, agua y CO2. Produce glucosa y oxigeno.',
  ],
};

export const GRUPO_PROFESOR = {
  nombre: '3 ESO B', profesor: 'D. Miguel Ruiz Torres',
  materia: 'Matematicas', numAlumnos: 24, mediaGrupo: 6.8,
  alumnos: [
    { nombre:'Alex G.',   progreso:78, nota:7.4, asistencia:97  },
    { nombre:'Sofia M.',  progreso:91, nota:8.9, asistencia:100 },
    { nombre:'Carlos P.', progreso:54, nota:5.2, asistencia:88  },
    { nombre:'Lucia R.',  progreso:83, nota:8.1, asistencia:96  },
    { nombre:'Pablo D.',  progreso:66, nota:6.5, asistencia:91  },
    { nombre:'Maria J.',  progreso:72, nota:7.0, asistencia:95  },
  ],
  tareas: [
    { titulo:'Ejercicios Funciones T4',  entregados:21, pendientes:3, media:7.2 },
    { titulo:'Problemas Estadistica T3', entregados:24, pendientes:0, media:6.8 },
  ],
};

export const INSIGNIAS = [
  { id:'primera-semana', nombre:'Primera semana',  icon:'🌟', desc:'Completaste tu primera semana.', desbloqueada:true  },
  { id:'quiz-perfecto',  nombre:'Quiz perfecto',   icon:'💯', desc:'Quiz al 100%.',                  desbloqueada:true  },
  { id:'10-lecciones',   nombre:'10 lecciones',    icon:'📚', desc:'Completaste 10 lecciones.',      desbloqueada:true  },
  { id:'racha-7',        nombre:'Racha 7 dias',    icon:'🔥', desc:'Estudia 7 dias seguidos.',        desbloqueada:false },
  { id:'experto',        nombre:'Experto',         icon:'🎓', desc:'Mas de 9 en un examen.',          desbloqueada:false },
];

export const CALENDARIO_EVENTOS = [
  { fecha:'2026-09-02', tipo:'tarea',    titulo:'Entrega ejercicios Matematicas', materia:'Matematicas', color:'#1d4ed8' },
  { fecha:'2026-09-04', tipo:'tarea',    titulo:'Entrega redaccion Lengua',       materia:'Lengua',      color:'#16a34a' },
  { fecha:'2026-09-10', tipo:'examen',   titulo:'Examen Matematicas',             materia:'Matematicas', color:'#dc2626' },
  { fecha:'2026-09-12', tipo:'examen',   titulo:'Examen Historia',                materia:'Historia',    color:'#dc2626' },
  { fecha:'2026-09-17', tipo:'examen',   titulo:'Examen Biologia',                materia:'Biologia',    color:'#dc2626' },
  { fecha:'2026-09-25', tipo:'evaluacion',titulo:'1a Evaluacion Parcial',         materia:'General',     color:'#7c3aed' },
];

export const VIDEO_LECCIONES = [
  { id:'v1', titulo:'Funciones - Introduccion',        duracion:'12:34', materia:'Matematicas', tipo:'videoleccion' },
  { id:'v2', titulo:'El Romanticismo Espanol',          duracion:'15:20', materia:'Lengua',      tipo:'explicacion'  },
  { id:'v3', titulo:'Fotosintesis - Explicacion Visual',duracion:'18:05', materia:'Biologia',    tipo:'videoleccion' },
  { id:'v4', titulo:'Revolucion Industrial - Resumen',  duracion:'10:45', materia:'Historia',    tipo:'repaso'       },
];

export const LANDING_FEATURES = [
  { icon:'📊', titulo:'Seguimiento en tiempo real', desc:'El alumno ve su progreso por materia, unidad y leccion. Las familias tambien.' },
  { icon:'🤖', titulo:'Tutor IA educativo',         desc:'24/7 para explicar, dar pistas y preparar repasos. Sin respuestas de examen.' },
  { icon:'🎮', titulo:'Gamificacion educativa',     desc:'Rachas, insignias y objetivos semanales que motivan sin crear dependencia.' },
  { icon:'👩‍🏫', titulo:'Panel del Profesor',        desc:'Vista de grupo, seguimiento individual, tareas y evaluacion continua.' },
  { icon:'👨‍👩‍👧', titulo:'Portal de Familias',       desc:'Acceso a progreso, calendario y comunicaciones. Transparencia total.' },
  { icon:'📱', titulo:'Disenado para el movil',     desc:'El alumno puede estudiar, hacer ejercicios y consultar al tutor desde su movil.' },
];
