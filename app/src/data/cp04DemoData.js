export const cp04DemoData = {
  club: {
    nombre: "Club Pádel 04 Antequera",
    ubicacion: "Antequera, Málaga",
    pistas: 4,
    horario: "08:00 - 23:00",
    modalidades: ["Reserva privada", "Partido abierto", "Clase", "Torneo"]
  },
  jugadores: [
    { nombre: "Sergio Martín", nivel: "Avanzado", ranking: 1, puntos: 1240 },
    { nombre: "Laura Benítez", nivel: "Avanzado", ranking: 2, puntos: 1180 },
    { nombre: "Pablo García", nivel: "Intermedio alto", ranking: 3, puntos: 1050 },
    { nombre: "Alejandro Molina", nivel: "Intermedio", ranking: 4, puntos: 980 },
    { nombre: "Elena Ramos", nivel: "Intermedio", ranking: 5, puntos: 940 },
    { nombre: "Ana Torres", nivel: "Intermedio", ranking: 8, puntos: 820 },
    { nombre: "Carlos Ruiz", nivel: "Intermedio", ranking: 9, puntos: 790 },
    { nombre: "Marta Sánchez", nivel: "Iniciación", ranking: 15, puntos: 540 }
  ],
  reservas: [
    { jugador: "Alejandro Molina", dia: "Lunes", hora: "18:00", pista: "Pista 1", modalidad: "Reserva privada", estado: "Confirmada" },
    { jugador: "Laura Benítez", dia: "Martes", hora: "10:30", pista: "Pista 2", modalidad: "Clase", estado: "Confirmada" },
    { jugador: "Carlos Ruiz", dia: "Miércoles", hora: "20:00", pista: "Pista 3", modalidad: "Partido abierto", estado: "Pendiente de completar jugadores" },
    { jugador: "Marta Sánchez", dia: "Jueves", hora: "19:00", pista: "Pista 4", modalidad: "Clase iniciación", estado: "Confirmada" },
    { jugador: "Sergio Martín", dia: "Viernes", hora: "21:00", pista: "Pista 1", modalidad: "Partido competitivo", estado: "Confirmada" }
  ],
  staff: {
    nombre: "Carmen López",
    rol: "Recepción",
    funciones: [
      "Revisar reservas del día",
      "Confirmar cambios",
      "Gestionar altas",
      "Atender incidencias",
      "Revisar pistas libres"
    ]
  },
  administrador: {
    nombre: "Javier Herrera",
    rol: "Administrador",
    funciones: [
      "Ver ocupación semanal",
      "Revisar ingresos futuros",
      "Consultar ranking",
      "Revisar torneos",
      "Controlar incidencias",
      "Supervisar actividad del club"
    ]
  },
  torneos: [
    {
      nombre: "Liga Primavera Club Pádel 04",
      categorias: ["Masculina", "Femenina", "Mixta", "Iniciación"],
      estado: "Inscripción abierta",
      formato: "Liguilla + eliminatoria final"
    }
  ],
  incidencias: [
    "Cambio de horario solicitado por Carlos Ruiz",
    "Consulta de disponibilidad para torneo mixto",
    "Petición de clase por Marta Sánchez",
    "Revisión de pista 2 por iluminación",
    "Duda sobre ranking semanal"
  ]
};
