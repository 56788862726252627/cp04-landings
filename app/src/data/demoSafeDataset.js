/**
 * Club Pádel 04 · Demo Safe Dataset
 *
 * Dataset ficticio para demostración comercial.
 * No contiene datos reales.
 * No debe ejecutar pagos reales, reservas reales, cancelaciones reales,
 * webhooks reales ni escrituras reales en bases de datos.
 */

export const demoSafeDataset = {
  mode: "DEMO_SAFE",
  warning:
    "Entorno demo seguro: las acciones son simuladas y no modifican reservas reales, pagos reales ni datos de producción.",
  club: {
    name: "Club Pádel 04 Demo",
    type: "Club demo comercial",
    location: "Málaga interior · Demo",
  },
  courts: [
    { id: "court-demo-1", name: "Pista 1 · Cristal", type: "Cristal", status: "Disponible demo" },
    { id: "court-demo-2", name: "Pista 2 · Central", type: "Central", status: "Alta demanda demo" },
    { id: "court-demo-3", name: "Pista 3 · Outdoor", type: "Outdoor", status: "Disponible demo" },
    { id: "court-demo-4", name: "Pista 4 · Premium", type: "Premium", status: "Reservada demo" },
  ],
  users: [
    { id: "user-demo-player", role: "jugador", name: "Jugador Demo" },
    { id: "user-demo-staff", role: "empleado", name: "Empleado Demo" },
    { id: "user-demo-admin", role: "administrador", name: "Administrador Demo" },
    { id: "user-demo-support", role: "soporte", name: "Soporte Demo" },
  ],
  reservations: [
    {
      id: "reservation-demo-1",
      player: "Jugador Demo",
      court: "Pista 1 · Cristal",
      date: "Hoy",
      time: "10:00 - 11:30",
      status: "Confirmada demo",
    },
    {
      id: "reservation-demo-2",
      player: "Jugador Demo",
      court: "Pista 2 · Central",
      date: "Mañana",
      time: "18:30 - 20:00",
      status: "Pendiente demo",
    },
    {
      id: "reservation-demo-3",
      player: "Equipo Ranking Demo",
      court: "Pista 4 · Premium",
      date: "Viernes",
      time: "20:00 - 21:30",
      status: "Partido ranking demo",
    },
  ],
  tournaments: [
    { id: "tournament-demo-1", name: "Torneo Apertura Demo", status: "Inscripción abierta demo", players: 24 },
    { id: "tournament-demo-2", name: "Liga Local Demo", status: "En curso demo", pairs: 12 },
    { id: "tournament-demo-3", name: "Ranking Semanal Demo", status: "Activo demo", players: 32 },
  ],
  metrics: {
    weeklyOccupancy: "72%",
    peakHours: "18:00 - 22:00",
    lowHours: "09:00 - 12:00",
    weeklyReservations: 126,
    demoCancellations: 8,
    activeDemoPlayers: 184,
    estimatedRevenue: "2.450 €",
    mostUsedCourt: "Pista 2 · Central",
  },
  incidents: [
    { id: "incident-demo-1", type: "Cambio de horario", status: "Resuelta demo" },
    { id: "incident-demo-2", type: "Consulta de torneo", status: "En revisión demo" },
    { id: "incident-demo-3", type: "Problema de acceso", status: "Pendiente demo" },
  ],
};

export const demoSafeActions = {
  payments: "disabled",
  realReservations: "disabled",
  realCancellations: "disabled",
  realWebhooks: "disabled",
  realWhatsApp: "disabled",
  realEmails: "controlled_or_simulated",
  productionWrites: "disabled",
};
