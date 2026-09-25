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
};

export const DEMO_STAFF = {
  id: "demo-staff-1",
  nombre: "Staff Demo",
  rol: "Recepción / moderación",
};

// Contactos de ejemplo para la pestaña Amigos. El estado real (amistad,
// solicitud, bloqueo, follow) ya NO se guarda aquí como dato estático: vive
// en el store de src/utils/communityBridge.js (community-logic real) y se
// siembra una vez, al montar ComunidadDemo, con communitySeedDemoRelationships.
// Estos ids son los que ese seed usa como friendId/pendingReceivedFrom/etc.
export const DEMO_CONTACTS = [
  { id: "amigo-1", nombre: "Jugador Demo 2" }, // amistad activa (seed)
  { id: "amigo-2", nombre: "Jugador Demo 3" }, // solicitud de amistad recibida (seed)
  { id: "amigo-3", nombre: "Jugador Demo 4" }, // sin amistad, pero ya seguido (seed)
  { id: "amigo-4", nombre: "Jugador Demo 5" }, // bloqueado (seed)
  { id: "amigo-5", nombre: "Jugador Demo 6 (perfil privado)" }, // sin relación, perfil privado
  { id: "amigo-6", nombre: "Jugador Demo 7" }, // sin relación, público, sin sembrar (para probar el flujo completo)
];

// DEMO_POSTS y DEMO_OPEN_MATCHES eliminados en P0.5:
// la UI usa communityBridge (store real en memoria) desde P0.2/P0.3.

export const DEMO_MODERATION_QUEUE = [
  {
    id: "reporte-1",
    objetivo: "Publicación de Jugador Demo 3",
    motivo: "Contenido reportado (demo)",
    estado: "en_revision",
  },
];
