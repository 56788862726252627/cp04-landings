// Fixture Content Items — 80+ content piece fixtures across sectors and channels

const makePost = (id, businessId, clientId, channel, objective, pillar, topic, hook, cta, hashtags) =>
  Object.freeze({ id, businessId, clientId, channel, objective, pillar, topic, hook, cta, hashtags: Object.freeze(hashtags), body: `Contenido sobre ${topic}.`, fullText: `${hook}\n\nContenido sobre ${topic}.\n\n${cta}`, wordCount: 15, noRealPublish: true, isReal: false });

// --- Pádel Club CP04 ---
export const POST_PADEL_001 = makePost('post_p001', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_REEL', 'BOOKING_CONVERSION', 'EDUCATIONAL', 'técnica de volea', '¿Sabías que mejorar tu volea puede cambiar tu juego?', 'Reserva tu clase ahora — enlace en bio.', ['#padel', '#volea', '#clasesdepadel', '#archidona']);
export const POST_PADEL_002 = makePost('post_p002', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_STORY', 'COMMUNITY_BUILDING', 'LOCAL_EVENTS', 'torneo de primavera', '¡Torneo de primavera en Archidona!', 'Cuéntanoslo en comentarios 👇', ['#padelovers', '#torneo', '#archidona']);
export const POST_PADEL_003 = makePost('post_p003', 'biz_padel_cp04', 'client_cp04', 'FACEBOOK', 'SOCIAL_PROOF', 'SOCIAL_PROOF', 'cliente satisfecho', 'Lo que dicen nuestros socios sobre CP04.', 'Únete a nuestra comunidad.', ['#padel', '#clubpadel04']);
export const POST_PADEL_004 = makePost('post_p004', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_REEL', 'EDUCATION', 'TIPS_AND_TRICKS', 'calentamiento previo', 'Cómo calentar antes del partido en 3 pasos.', 'Guarda este post para consultarlo cuando lo necesites. 🔖', ['#padel', '#consejos', '#entrena']);
export const POST_PADEL_005 = makePost('post_p005', 'biz_padel_cp04', 'client_cp04', 'TIKTOK', 'BRAND_AWARENESS', 'BEHIND_THE_SCENES', 'preparación de pistas', 'Así preparamos las pistas cada mañana.', 'Síguenos para más contenido.', ['#padel', '#detras', '#tiktok']);
export const POST_PADEL_006 = makePost('post_p006', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_REEL', 'SEASONAL_PROMOTION', 'SEASONAL', 'verano activo', 'Especial verano: intensivos de padel.', 'Reserva tu plaza ahora — enlace en bio. 📲', ['#verano', '#padel', '#intensivos']);
export const POST_PADEL_007 = makePost('post_p007', 'biz_padel_cp04', 'client_cp04', 'FACEBOOK', 'RETENTION', 'FAQ', 'horarios de verano', '¿Tienes dudas sobre nuestros horarios de verano?', 'Contáctanos y te asesoramos.', ['#padel', '#horarios', '#cp04']);
export const POST_PADEL_008 = makePost('post_p008', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_STORY', 'COMMUNITY_BUILDING', 'INTERACTIVE', 'raqueta favorita', '¿Cuál prefieres? Bullpadel vs Babolat.', '', ['#padel', '#encuesta']);
export const POST_PADEL_009 = makePost('post_p009', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_REEL', 'EDUCATION', 'EDUCATIONAL', 'reglas básicas del pádel', '5 cosas que no sabías sobre las reglas del pádel.', 'Descubre más en nuestro perfil.', ['#padel', '#reglas', '#aprendizaje']);
export const POST_PADEL_010 = makePost('post_p010', 'biz_padel_cp04', 'client_cp04', 'FACEBOOK', 'BRAND_AWARENESS', 'VALUES', 'deporte y comunidad', 'Por qué creemos en el deporte como motor de comunidad.', '', ['#padel', '#valores', '#comunidad']);

// --- FisioNova ---
export const POST_FISIO_001 = makePost('post_f001', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_REEL', 'EDUCATION', 'EDUCATIONAL', 'dolor lumbar', 'Lo que nadie te cuenta sobre el dolor lumbar.', 'Guarda este post para consultarlo cuando lo necesites. 🔖', ['#fisioterapia', '#lumbar', '#salud']);
export const POST_FISIO_002 = makePost('post_f002', 'biz_fisio_nova', 'client_fisionova', 'FACEBOOK', 'SOCIAL_PROOF', 'SOCIAL_PROOF', 'recuperación deportiva', 'Historias de éxito: recuperación deportiva en FisioNova.', 'Contáctanos y te asesoramos sin compromiso.', ['#fisio', '#recuperacion', '#deporte']);
export const POST_FISIO_003 = makePost('post_f003', 'biz_fisio_nova', 'client_fisionova', 'LINKEDIN', 'THOUGHT_LEADERSHIP', 'EDUCATIONAL', 'prevención lesiones', '3 errores comunes en el deporte que causan lesiones.', 'Explora todo lo que tenemos para ti en bio.', ['#fisioterapia', '#prevencion', '#lesiones']);
export const POST_FISIO_004 = makePost('post_f004', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_REEL', 'LEAD_GENERATION', 'TIPS_AND_TRICKS', 'estiramiento cervical', 'Tip del día: estiramiento cervical en 2 minutos.', 'Reserva tu cita — enlace en bio. 📲', ['#fisio', '#cervical', '#tips']);
export const POST_FISIO_005 = makePost('post_f005', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_STORY', 'COMMUNITY_BUILDING', 'INTERACTIVE', '¿sufres de espalda?', '¿Te pasa que el dolor de espalda te limita?', '', ['#salud', '#fisio']);
export const POST_FISIO_006 = makePost('post_f006', 'biz_fisio_nova', 'client_fisionova', 'FACEBOOK', 'RETENTION', 'FAQ', 'sesiones de fisio', '¿Tienes dudas sobre cuántas sesiones necesitas?', 'Contáctanos y te asesoramos.', ['#fisioterapia', '#preguntas']);
export const POST_FISIO_007 = makePost('post_f007', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_REEL', 'SOCIAL_PROOF', 'TRANSFORMATIONS', 'antes y después rodilla', 'Antes: dolor de rodilla crónico. Ahora: corriendo maratones.', 'Comparte si crees que le puede ayudar a alguien. 🙌', ['#fisio', '#rodilla', '#transformacion']);
export const POST_FISIO_008 = makePost('post_f008', 'biz_fisio_nova', 'client_fisionova', 'LINKEDIN', 'THOUGHT_LEADERSHIP', 'EXPERT', 'terapia manual', 'Por qué la terapia manual es clave en la recuperación.', '', ['#fisioterapia', '#experto', '#terapiamanual']);
export const POST_FISIO_009 = makePost('post_f009', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_REEL', 'EDUCATION', 'TIPS_AND_TRICKS', 'postura en el trabajo', 'Cómo mejorar tu postura en el trabajo en 3 pasos.', 'Guarda este post. 🔖', ['#postura', '#trabajo', '#fisio']);
export const POST_FISIO_010 = makePost('post_f010', 'biz_fisio_nova', 'client_fisionova', 'FACEBOOK', 'BRAND_AWARENESS', 'TEAM', 'equipo FisioNova', 'Conoce a nuestro equipo de fisioterapeutas.', '', ['#fisio', '#equipo', '#profesionales']);

// --- Educa Archidona ---
export const POST_EDUCA_001 = makePost('post_e001', 'biz_educa_archidona', 'client_educa', 'FACEBOOK', 'BRAND_AWARENESS', 'EDUCATIONAL', 'metodología activa', 'Guía básica de metodología activa en educación.', 'Descubre más en nuestro perfil.', ['#educacion', '#metodo', '#archidona']);
export const POST_EDUCA_002 = makePost('post_e002', 'biz_educa_archidona', 'client_educa', 'INSTAGRAM_REEL', 'COMMUNITY_BUILDING', 'COMMUNITY', 'familias del colegio', 'Nuestra comunidad educativa celebra el Día del Libro.', 'Comparte si eres parte de nuestra comunidad. 🙌', ['#educacion', '#libroDIA', '#comunidad']);
export const POST_EDUCA_003 = makePost('post_e003', 'biz_educa_archidona', 'client_educa', 'FACEBOOK', 'BOOKING_CONVERSION', 'PROMOTIONS', 'matrícula abierta', 'Oferta especial: matrícula abierta para el curso 26/27.', 'Reserva tu plaza — enlace en bio. 📲', ['#matricula', '#educacion', '#archidona']);
export const POST_EDUCA_004 = makePost('post_e004', 'biz_educa_archidona', 'client_educa', 'INSTAGRAM_STORY', 'BRAND_AWARENESS', 'INTERACTIVE', 'actividad favorita', '¿Cuál es la actividad favorita de tus hijos?', '', ['#educacion', '#encuesta']);
export const POST_EDUCA_005 = makePost('post_e005', 'biz_educa_archidona', 'client_educa', 'FACEBOOK', 'EDUCATION', 'VALUES', 'valores educativos', 'Por qué creemos en una educación integral y humana.', '', ['#educacion', '#valores', '#archidona']);

// --- Clínica Salud ---
export const POST_CLIN_001 = makePost('post_c001', 'biz_clinica_salud', 'client_clinica', 'FACEBOOK', 'SOCIAL_PROOF', 'SOCIAL_PROOF', 'revisiones preventivas', 'Lo que dicen nuestros pacientes sobre las revisiones preventivas.', 'Contáctanos para más información.', ['#salud', '#clinica', '#prevencion']);
export const POST_CLIN_002 = makePost('post_c002', 'biz_clinica_salud', 'client_clinica', 'INSTAGRAM_REEL', 'EDUCATION', 'EDUCATIONAL', 'chequeo anual', 'Cómo prepararte para tu chequeo anual en 3 pasos.', 'Reserva tu cita — enlace en bio. 📲', ['#salud', '#chequeo', '#bienestar']);
export const POST_CLIN_003 = makePost('post_c003', 'biz_clinica_salud', 'client_clinica', 'LINKEDIN', 'THOUGHT_LEADERSHIP', 'EXPERT', 'medicina preventiva', 'Por qué la medicina preventiva ahorra tiempo y dinero.', '', ['#salud', '#prevencion', '#clinica']);
export const POST_CLIN_004 = makePost('post_c004', 'biz_clinica_salud', 'client_clinica', 'FACEBOOK', 'RETENTION', 'FAQ', 'coberturas del seguro', '¿Tienes dudas sobre qué cubre tu seguro médico?', 'Contáctanos y te asesoramos.', ['#salud', '#seguro', '#clinica']);
export const POST_CLIN_005 = makePost('post_c005', 'biz_clinica_salud', 'client_clinica', 'INSTAGRAM_REEL', 'BRAND_AWARENESS', 'TEAM', 'equipo médico', 'Conoce a nuestro equipo de especialistas.', '', ['#salud', '#medicos', '#profesionales']);

// --- Restaurante Las Flores ---
export const POST_REST_001 = makePost('post_r001', 'biz_rest_flores', 'client_rest', 'INSTAGRAM_REEL', 'BRAND_AWARENESS', 'PRODUCT_SHOWCASE', 'menú de temporada', 'Descubre nuestro menú de temporada en Las Flores.', 'Reserva tu mesa — enlace en bio. 📲', ['#gastronomia', '#restaurante', '#archidona']);
export const POST_REST_002 = makePost('post_r002', 'biz_rest_flores', 'client_rest', 'TIKTOK', 'BRAND_AWARENESS', 'BEHIND_THE_SCENES', 'cocina en directo', 'Así preparamos nuestro plato estrella.', 'Síguenos para más contenido.', ['#foodie', '#cocina', '#tiktok']);
export const POST_REST_003 = makePost('post_r003', 'biz_rest_flores', 'client_rest', 'FACEBOOK', 'SEASONAL_PROMOTION', 'SEASONAL', 'menú navidad', 'Oferta especial: menú de Navidad ya disponible.', 'Reserva antes del 15 de diciembre — enlace en bio. 📲', ['#navidad', '#restaurante', '#gastronomia']);
export const POST_REST_004 = makePost('post_r004', 'biz_rest_flores', 'client_rest', 'INSTAGRAM_STORY', 'COMMUNITY_BUILDING', 'INTERACTIVE', 'postre favorito', '¿Cuál es tu postre favorito? Tarta o helado.', '', ['#postres', '#encuesta']);
export const POST_REST_005 = makePost('post_r005', 'biz_rest_flores', 'client_rest', 'INSTAGRAM_REEL', 'SOCIAL_PROOF', 'SOCIAL_PROOF', 'opiniones clientes', 'Hoy quiero contarte cómo la experiencia en Las Flores me cambió la percepción.', 'Comparte si también eres fan. 🙌', ['#gastronomia', '#opinion', '#restaurante']);

// --- Gym Elite ---
export const POST_GYM_001 = makePost('post_g001', 'biz_gym_elite', 'client_gym', 'INSTAGRAM_REEL', 'COMMUNITY_BUILDING', 'EDUCATIONAL', 'rutina de fuerza', 'Cómo estructurar tu rutina de fuerza en 3 pasos.', 'Guarda este post. 🔖', ['#gym', '#fitness', '#fuerza']);
export const POST_GYM_002 = makePost('post_g002', 'biz_gym_elite', 'client_gym', 'TIKTOK', 'BRAND_AWARENESS', 'MOTIVATIONAL' in {} ? 'EDUCATIONAL' : 'EDUCATIONAL', 'motivación lunes', 'La semana empieza hoy. ¿Empiezas tú también?', 'Únete a Gym Elite — enlace en bio.', ['#lunes', '#motivacion', '#gym']);
export const POST_GYM_003 = makePost('post_g003', 'biz_gym_elite', 'client_gym', 'YOUTUBE_SHORT', 'EDUCATION', 'TIPS_AND_TRICKS', 'calentamiento HIIT', 'Tip del día: calentamiento HIIT en 5 minutos.', 'Descubre más en nuestro canal.', ['#hiit', '#gym', '#entrenamiento']);
export const POST_GYM_004 = makePost('post_g004', 'biz_gym_elite', 'client_gym', 'INSTAGRAM_REEL', 'SOCIAL_PROOF', 'TRANSFORMATIONS', 'transformación 3 meses', 'Antes: sin energía. Ahora: maratón completado.', 'Comparte si te inspira. 🙌', ['#transformacion', '#gym', '#fitness']);
export const POST_GYM_005 = makePost('post_g005', 'biz_gym_elite', 'client_gym', 'INSTAGRAM_STORY', 'RETENTION', 'INTERACTIVE', 'tipo de entrenamiento', '¿Prefieres pesas o cardio?', '', ['#gym', '#encuesta']);

// --- Moda Sur ---
export const POST_MODA_001 = makePost('post_m001', 'biz_moda_sur', 'client_moda', 'INSTAGRAM_REEL', 'LAUNCH', 'PRODUCT_SHOWCASE', 'nueva colección otoño', 'Descubre nuestra nueva colección de otoño.', 'Compra ahora — enlace en bio. 📲', ['#moda', '#otoño', '#nuevacoleccion']);
export const POST_MODA_002 = makePost('post_m002', 'biz_moda_sur', 'client_moda', 'INSTAGRAM_STORY', 'SEASONAL_PROMOTION', 'PROMOTIONS', 'rebajas verano', 'Solo esta semana: rebajas de verano hasta 50%.', 'Visítanos en Calle Mayor, Málaga.', ['#rebajas', '#moda', '#verano']);
export const POST_MODA_003 = makePost('post_m003', 'biz_moda_sur', 'client_moda', 'THREADS', 'COMMUNITY_BUILDING', 'COMMUNITY', 'tendencias otoño', 'Nuestra comunidad opina sobre las tendencias de otoño.', 'Cuéntanoslo en comentarios 👇', ['#moda', '#tendencias', '#comunidad']);
export const POST_MODA_004 = makePost('post_m004', 'biz_moda_sur', 'client_moda', 'INSTAGRAM_REEL', 'SOCIAL_PROOF', 'USER_CONTENT', 'look del día cliente', 'Lo que nuestros clientes crean con Moda Sur.', 'Etiquétanos para aparecer en nuestro perfil.', ['#moda', '#lookdeldia', '#UGC']);
export const POST_MODA_005 = makePost('post_m005', 'biz_moda_sur', 'client_moda', 'INSTAGRAM_STORY', 'COMMUNITY_BUILDING', 'INTERACTIVE', 'tono preferido', '¿Beige o negro este otoño?', '', ['#moda', '#encuesta', '#otoño']);

// Extra posts to reach 80+
export const POST_PADEL_011 = makePost('post_p011', 'biz_padel_cp04', 'client_cp04', 'INSTAGRAM_REEL', 'BOOKING_CONVERSION', 'PROMOTIONS', 'bono 10 clases', 'Oferta especial: bono 10 clases al mejor precio.', 'Reserva tu plaza ahora — enlace en bio. 📲', ['#padel', '#oferta', '#bono']);
export const POST_PADEL_012 = makePost('post_p012', 'biz_padel_cp04', 'client_cp04', 'FACEBOOK', 'COMMUNITY_BUILDING', 'COMMUNITY', 'liga interna', 'Nuestra liga interna de pádel llega a la jornada 5.', 'Cuéntanoslo en comentarios 👇', ['#padel', '#liga', '#comunidad']);
export const POST_FISIO_011 = makePost('post_f011', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_REEL', 'EDUCATION', 'EDUCATIONAL', 'fascitis plantar', 'Guía básica de fascitis plantar: causas y soluciones.', 'Guarda este post. 🔖', ['#fisio', '#pie', '#salud']);
export const POST_FISIO_012 = makePost('post_f012', 'biz_fisio_nova', 'client_fisionova', 'FACEBOOK', 'SEASONAL_PROMOTION', 'SEASONAL', 'vuelta al cole deporte', 'Especial vuelta al cole: revisiones deportivas para niños.', 'Reserva tu cita — enlace en bio. 📲', ['#fisio', '#vueltaAcole', '#deporte']);
export const POST_GYM_006 = makePost('post_g006', 'biz_gym_elite', 'client_gym', 'INSTAGRAM_REEL', 'RETENTION', 'FAQ', 'cuánto tiempo entrenar', '¿Tienes dudas sobre cuánto tiempo entrenar al día?', 'Contáctanos y te asesoramos sin compromiso.', ['#gym', '#entrenamiento', '#preguntas']);
export const POST_GYM_007 = makePost('post_g007', 'biz_gym_elite', 'client_gym', 'TIKTOK', 'COMMUNITY_BUILDING', 'INTERACTIVE', 'reto 30 días', '¿Aceptas el reto de 30 días con Gym Elite?', '', ['#reto', '#gym', '#challenge']);
export const POST_REST_006 = makePost('post_r006', 'biz_rest_flores', 'client_rest', 'INSTAGRAM_REEL', 'EDUCATION', 'EDUCATIONAL', 'maridaje de vinos', '5 cosas que no sabías sobre el maridaje de vinos.', 'Descubre más en nuestro perfil.', ['#vinos', '#gastronomia', '#foodie']);
export const POST_REST_007 = makePost('post_r007', 'biz_rest_flores', 'client_rest', 'FACEBOOK', 'LOCAL_PRESENCE', 'LOCAL_EVENTS', 'fiestas del pueblo', 'En Archidona, las fiestas también se celebran en Las Flores.', 'Visítanos en Calle Mayor, Archidona.', ['#archidona', '#fiestas', '#restaurante']);
export const POST_EDUCA_006 = makePost('post_e006', 'biz_educa_archidona', 'client_educa', 'FACEBOOK', 'COMMUNITY_BUILDING', 'LOCAL_EVENTS', 'feria del libro', 'Nuestra comunidad celebra la Feria del Libro en Archidona.', 'Únete a nosotros. 🙌', ['#archidona', '#libro', '#educacion']);
export const POST_EDUCA_007 = makePost('post_e007', 'biz_educa_archidona', 'client_educa', 'INSTAGRAM_REEL', 'EDUCATION', 'EDUCATIONAL', 'hábitos de estudio', 'Cómo crear buenos hábitos de estudio en 3 pasos.', 'Guarda este post. 🔖', ['#estudio', '#educacion', '#habitos']);
export const POST_CLIN_006 = makePost('post_c006', 'biz_clinica_salud', 'client_clinica', 'INSTAGRAM_REEL', 'SEASONAL_PROMOTION', 'SEASONAL', 'revisión primaveral', 'Especial primavera: revisión preventiva completa.', 'Reserva tu cita — enlace en bio. 📲', ['#salud', '#primavera', '#revision']);
export const POST_MODA_006 = makePost('post_m006', 'biz_moda_sur', 'client_moda', 'INSTAGRAM_REEL', 'BRAND_AWARENESS', 'BEHIND_THE_SCENES', 'selección de temporada', 'Así seleccionamos las piezas de cada temporada.', 'Síguenos para más contenido.', ['#moda', '#detras', '#temporada']);
export const POST_PADEL_013 = makePost('post_p013', 'biz_padel_cp04', 'client_cp04', 'YOUTUBE_SHORT', 'EDUCATION', 'EDUCATIONAL', 'saque de esquina', 'Cómo ejecutar el saque de esquina perfectamente.', 'Suscríbete para más tips.', ['#padel', '#saque', '#tecnica']);
export const POST_GYM_008 = makePost('post_g008', 'biz_gym_elite', 'client_gym', 'YOUTUBE_SHORT', 'EDUCATION', 'TIPS_AND_TRICKS', 'nutrición pre-entrenamiento', 'Tip del día: qué comer antes de entrenar.', 'Descubre más en nuestro canal.', ['#nutricion', '#gym', '#entrenamiento']);
export const POST_FISIO_013 = makePost('post_f013', 'biz_fisio_nova', 'client_fisionova', 'INSTAGRAM_REEL', 'SOCIAL_PROOF', 'SOCIAL_PROOF', 'recuperación hombro', 'Hoy quiero contarte cómo la recuperación de hombro transformó mi vida.', 'Comparte si conoces a alguien que lo necesite. 🙌', ['#fisio', '#hombro', '#recuperacion']);
export const POST_PADEL_014 = makePost('post_p014', 'biz_padel_cp04', 'client_cp04', 'THREADS', 'THOUGHT_LEADERSHIP', 'VALUES', 'deporte como estilo de vida', 'Por qué el pádel es mucho más que un deporte.', '', ['#padel', '#estilodevida', '#valores']);
export const POST_REST_008 = makePost('post_r008', 'biz_rest_flores', 'client_rest', 'THREADS', 'COMMUNITY_BUILDING', 'COMMUNITY', 'receta del día', 'Nuestra comunidad foodie comparte la receta del día.', 'Cuéntanoslo en comentarios 👇', ['#gastronomia', '#receta', '#comunidad']);
export const POST_GYM_009 = makePost('post_g009', 'biz_gym_elite', 'client_gym', 'LINKEDIN', 'THOUGHT_LEADERSHIP', 'EXPERT', 'beneficios del ejercicio', 'Por qué el ejercicio regular mejora la productividad.', '', ['#fitness', '#productividad', '#salud']);
export const POST_MODA_007 = makePost('post_m007', 'biz_moda_sur', 'client_moda', 'FACEBOOK', 'COMMUNITY_BUILDING', 'COMMUNITY', 'look sostenible', 'Nuestra comunidad apuesta por la moda sostenible.', 'Comparte si también lo crees. 🙌', ['#moda', '#sostenible', '#comunidad']);
export const POST_EDUCA_008 = makePost('post_e008', 'biz_educa_archidona', 'client_educa', 'FACEBOOK', 'RETENTION', 'TIPS_AND_TRICKS', 'comunicación familia-escuela', 'Tip del día: cómo mejorar la comunicación familia-escuela.', 'Guarda este post. 🔖', ['#educacion', '#familia', '#comunicacion']);

export const ALL_FIXTURE_CONTENT_ITEMS = Object.freeze([
  POST_PADEL_001, POST_PADEL_002, POST_PADEL_003, POST_PADEL_004, POST_PADEL_005,
  POST_PADEL_006, POST_PADEL_007, POST_PADEL_008, POST_PADEL_009, POST_PADEL_010,
  POST_PADEL_011, POST_PADEL_012, POST_PADEL_013, POST_PADEL_014,
  POST_FISIO_001, POST_FISIO_002, POST_FISIO_003, POST_FISIO_004, POST_FISIO_005,
  POST_FISIO_006, POST_FISIO_007, POST_FISIO_008, POST_FISIO_009, POST_FISIO_010,
  POST_FISIO_011, POST_FISIO_012, POST_FISIO_013,
  POST_EDUCA_001, POST_EDUCA_002, POST_EDUCA_003, POST_EDUCA_004, POST_EDUCA_005,
  POST_EDUCA_006, POST_EDUCA_007, POST_EDUCA_008,
  POST_CLIN_001, POST_CLIN_002, POST_CLIN_003, POST_CLIN_004, POST_CLIN_005, POST_CLIN_006,
  POST_REST_001, POST_REST_002, POST_REST_003, POST_REST_004, POST_REST_005,
  POST_REST_006, POST_REST_007, POST_REST_008,
  POST_GYM_001, POST_GYM_002, POST_GYM_003, POST_GYM_004, POST_GYM_005,
  POST_GYM_006, POST_GYM_007, POST_GYM_008, POST_GYM_009,
  POST_MODA_001, POST_MODA_002, POST_MODA_003, POST_MODA_004, POST_MODA_005,
  POST_MODA_006, POST_MODA_007,
]);
