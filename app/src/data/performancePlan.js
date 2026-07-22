export const cp04PerformancePlan = {
  audit: 30,
  goal: "Reducir bundle JS principal mediante separación modular segura.",
  currentIssue: "Chunk principal mayor de 500 KB después de minificación.",
  safeOrder: [
    "datos estáticos",
    "helpers puros",
    "componentes visuales simples",
    "galería",
    "centro técnico",
    "perfil",
    "ranking",
    "torneos",
    "admin",
    "reservas y auth solo al final"
  ],
  protectedAreas: [
    "reservas",
    "auth",
    "worker",
    "make",
    "airtable",
    "pagos",
    "notificaciones",
    "calendario"
  ]
};
