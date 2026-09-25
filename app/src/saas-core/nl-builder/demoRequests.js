// Paso 11 · Fase 13 — Casos de demostración.
//
// 8 peticiones FICTICIAS en lenguaje natural (ninguna corresponde a un
// negocio real ni reutiliza datos personales reales) que ejercitan las 8
// combinaciones pedidas: club de pádel, fisioterapia, despacho, restaurante,
// negocio ambiguo, petición contradictoria, módulos no recomendados, y
// inglés básico. Se usan en demoRequests.test.mjs (pipeline completo) y en
// la documentación del Paso 11.

export const DEMO_REQUESTS = Object.freeze([
  {
    id: "club-padel",
    label: "A. Club de pádel",
    seed: "demo-club-padel-001",
    prompt: "Crea un SaaS para un club de pádel ficticio en Sevilla llamado Pádel Imaginario, con reservas de pistas, gestión de socios, torneos, ranking y pagos online.",
  },
  {
    id: "fisioterapia",
    label: "B. Clínica de fisioterapia",
    seed: "demo-fisioterapia-001",
    prompt: "Crea un SaaS para una clínica de fisioterapia ficticia de Málaga con reservas, expedientes de pacientes, recordatorios, bonos, facturación, panel de administración, landing premium, PWA y automatizaciones de captación y seguimiento.",
  },
  {
    id: "despacho",
    label: "C. Despacho de abogados",
    seed: "demo-despacho-001",
    prompt: "Necesito un SaaS para un despacho de abogados ficticio en Madrid, con gestión de casos, citas con clientes, documentos legales y facturación de honorarios.",
  },
  {
    id: "restaurante",
    label: "D. Restaurante",
    seed: "demo-restaurante-001",
    prompt: "Quiero un SaaS para un restaurante ficticio en Valencia con reservas de mesa, gestión de menú y confirmaciones automáticas por WhatsApp.",
  },
  {
    id: "ambiguo",
    label: "E. Negocio ambiguo con pocos datos",
    seed: "demo-ambiguo-001",
    prompt: "quiero un software para mi negocio",
  },
  {
    id: "contradictorio",
    label: "F. Solicitud contradictoria",
    seed: "demo-contradictorio-001",
    prompt: "Crea un SaaS para una clínica dental ficticia con pagos online integrados pero sin pagos online, por favor.",
  },
  {
    id: "modulos-no-recomendados",
    label: "G. Solicitud con módulos no recomendados",
    seed: "demo-modulos-no-recomendados-001",
    prompt: "Despacho de abogados ficticio que también quiero que tenga torneos y ranking, aunque sé que no es lo habitual para un despacho.",
  },
  {
    id: "ingles",
    label: "H. Solicitud en inglés básico",
    seed: "demo-english-001",
    prompt: "Create a saas for a fictional dental clinic in London with bookings, reminders, invoicing and a premium landing page.",
  },
]);

export const FICTIONAL_MARKER_PATTERN = /ficticio|ficticia|imaginario|imaginaria|fictional|imaginary|\bmi negocio\b/i;

export function getDemoRequestById(id) {
  return DEMO_REQUESTS.find((d) => d.id === id) || null;
}
