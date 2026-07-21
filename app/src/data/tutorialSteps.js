// src/data/tutorialSteps.js
export const tutorialSteps = {
  PLAYER: [
    { step: 1, title: "Panel Principal", text: "Este es tu panel principal como jugador. Aquí verás tus reservas y actividad.", selector: "[data-tour='inicio-hero']", targetModule: "inicio" },
    { step: 2, title: "Nueva Reserva", text: "Desde aquí puedes consultar disponibilidad y comenzar una reserva.", selector: "[data-tour='nav-reservas']", targetModule: "reservas" },
    { step: 3, title: "Tus Reservas", text: "Aquí revisas tus reservas, horarios, pistas y estado.", selector: "[data-tour='reservas-panel']", targetModule: "reservas" },
    { step: 4, title: "Torneos", text: "Aquí puedes ver torneos disponibles e inscripciones.", selector: "[data-tour='nav-torneos']", targetModule: "torneos" },
    { step: 5, title: "Ranking", text: "Consulta tu posición, puntos y nivel.", selector: "[data-tour='ranking-panel']", targetModule: "ranking" },
    { step: 6, title: "Tu Perfil", text: "Completa tu perfil para mejorar la experiencia y personalizar tus datos.", selector: "[data-tour='perfil-panel']", targetModule: "perfil" }
  ],
  STAFF: [
    { step: 1, title: "Gestión Diaria", text: "Aquí recepción controla reservas, cambios e incidencias del día.", selector: "[data-tour='gestion-panel']", targetModule: "gestion" },
    { step: 2, title: "Alta de Jugador", text: "Desde aquí puedes registrar jugadores de forma ordenada.", selector: "[data-tour='nav-alta-jugador']", targetModule: "alta_jugador" },
    { step: 3, title: "Reprogramar", text: "Aquí puedes cambiar fecha, hora o pista de una reserva.", selector: "[data-tour='nav-reprogramar']", targetModule: "reprogramar" },
    { step: 4, title: "Cancelar", text: "Aquí se gestionan cancelaciones de forma controlada.", selector: "[data-tour='nav-cancelar']", targetModule: "cancelar" },
    { step: 5, title: "Torneos", text: "Desde aquí el staff puede apoyar la actividad del club.", selector: "[data-tour='torneos-panel']", targetModule: "torneos" },
    { step: 6, title: "Perfil", text: "Aquí se gestionan ajustes básicos del perfil y sesión.", selector: "[data-tour='perfil-panel']", targetModule: "perfil" }
  ],
  ADMIN: [
    { step: 1, title: "Panel de Dirección", text: "Este es el panel principal para controlar el club.", selector: "[data-tour='admin-panel']", targetModule: "admin" },
    { step: 2, title: "Métricas", text: "Aquí se revisan ocupación, actividad e indicadores clave.", selector: "[data-tour='admin-panel']", targetModule: "admin" },
    { step: 3, title: "Reservas", text: "Aquí puedes supervisar reservas y actividad operativa.", selector: "[data-tour='reservas-panel']", targetModule: "reservas" },
    { step: 4, title: "Gestión", text: "Supervisa el trabajo diario de recepción y operaciones.", selector: "[data-tour='gestion-panel']", targetModule: "gestion" },
    { step: 5, title: "Torneos y Ranking", text: "Controla actividad competitiva, torneos y comunidad.", selector: "[data-tour='torneos-panel']", targetModule: "torneos" },
    { step: 6, title: "Centro Técnico", text: "Aquí se revisan integraciones, Make y estado técnico.", selector: "[data-tour='nav-flujos-make']", targetModule: "flujos_make" }
  ],
  SUPPORT: [
    { step: 1, title: "Soporte Técnico", text: "Zona interna para diagnóstico, revisión y soporte.", selector: "[data-tour='soporte-panel']", targetModule: "soporte" },
    { step: 2, title: "Centro Técnico", text: "Aquí se revisan integraciones, Make y estado técnico.", selector: "[data-tour='nav-flujos-make']", targetModule: "flujos_make" },
    { step: 3, title: "Admin diagnóstico", text: "Vista útil para detectar errores operativos o de configuración.", selector: "[data-tour='admin-panel']", targetModule: "admin" },
    { step: 4, title: "Reservas", text: "Comprueba que las reservas se muestran correctamente.", selector: "[data-tour='reservas-panel']", targetModule: "reservas" },
    { step: 5, title: "Perfil y ajustes", text: "Desde aquí puedes revisar configuración de perfil y sesión.", selector: "[data-tour='perfil-panel']", targetModule: "perfil" }
  ]
};
