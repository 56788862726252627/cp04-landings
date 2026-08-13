// Club Pádel 04 · Comunidad — datos ficticios de demo/mock.
//
// Todo lo que hay aquí es inventado para ilustrar la interfaz. No representa
// jugadores, staff, publicaciones ni partidos reales del club. No incluye
// menores (ningún perfil demo está marcado como menor de edad ni tiene un
// flujo de activación para ello). Ver PR #24 (legal/menores) antes de
// sustituir cualquiera de estos datos por datos reales.

export const COMUNIDAD_DEMO_NOTICE =
  "Demo interna. Sin datos reales. Sin menores activos. Pendiente de validación legal externa.";

export const DEMO_PLAYER = {
  id: "demo-player-1",
  nombre: "Jugador Demo",
  nivel: "Intermedio (3.5)",
  club: "Club Pádel 04 (demo)",
  perfilVisible: false,
  consentimientoSocial: false,
};

export const DEMO_STAFF = {
  id: "demo-staff-1",
  nombre: "Staff Demo",
  rol: "Recepción / moderación",
};

export const DEMO_FRIENDS = [
  { id: "amigo-1", nombre: "Jugador Demo 2", estado: "amigo" },
  { id: "amigo-2", nombre: "Jugador Demo 3", estado: "solicitud_pendiente" },
  { id: "amigo-3", nombre: "Jugador Demo 4", estado: "bloqueado" },
];

// `autorId` (2026-08-13, integración real de Comunidad Fase 1): coincide
// con los `id` de DEMO_PLAYER/DEMO_FRIENDS de más abajo — hace falta un id
// estable, no el nombre visible, para que el bloqueo real de
// community-logic (por id de usuario) sepa a quién bloquear. El nombre
// (`autor`) sigue siendo solo para mostrar en pantalla.
export const DEMO_POSTS = [
  {
    id: "post-1",
    autor: "Jugador Demo",
    autorId: "demo-player-1",
    texto: "¡Buena sesión de pádel esta mañana! (publicación demo)",
    estado: "publicado",
  },
  {
    id: "post-2",
    autor: "Jugador Demo 2",
    autorId: "amigo-1",
    texto: "Buscando pareja para dobles el sábado (publicación demo)",
    estado: "publicado",
  },
  {
    id: "post-3",
    autor: "Jugador Demo 3",
    autorId: "amigo-2",
    texto: "Publicación demo marcada como reportada para mostrar el flujo de moderación",
    estado: "reportado",
  },
];

export const DEMO_OPEN_MATCHES = [
  {
    id: "partido-1",
    titulo: "Partido abierto demo — Nivel intermedio",
    fecha: "Sábado 10:00 (demo)",
    plazas: "2 de 4 plazas (demo)",
  },
  {
    id: "partido-2",
    titulo: "Partido abierto demo — Buscar compañero",
    fecha: "Domingo 18:30 (demo)",
    plazas: "1 de 2 plazas (demo)",
  },
];

export const DEMO_MODERATION_QUEUE = [
  {
    id: "reporte-1",
    objetivo: "Publicación de Jugador Demo 3",
    motivo: "Contenido reportado (demo)",
    estado: "en_revision",
  },
];
