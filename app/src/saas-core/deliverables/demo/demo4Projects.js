// App 3 · Prompt 4/6 — Proyectos de demostración de los motores binarios.
//
// Dos casos, tal como pide el enunciado:
// - "Clínica Dental Nova": proyecto ficticio nuevo (sector clínica
//   dental), caso completo (6 entregables binarios).
// - "Club Pádel 04": reutiliza el branding/identidad REAL ya
//   establecidos en src/saas-core/tenant/defaultTenant.js (el tenant de
//   producción) — nunca se inventan datos de un negocio que ya existe
//   en el repo. Caso ligero (3 entregables binarios).

import { CLUB_PADEL_04_TENANT } from "../../tenant/defaultTenant.js";
import { cp04BuildProjectBrief } from "./sectorTemplates.js";

export function cp04BuildClinicaDentalNovaBrief() {
  const built = cp04BuildProjectBrief({
    projectId: "clinica-dental-nova-demo",
    displayName: "Clínica Dental Nova",
    client: "Clínica Dental Nova (demo, ficticio)",
    sector: "clinica-dental",
    contact: { email: "contacto@clinicadentalnova.example" },
    price: "Plan Pro — 199 €/mes",
    scope: "Automatización de reservas, recordatorios y presencia digital para Clínica Dental Nova.",
    branding: { projectName: "Clínica Dental Nova", accentColor: "#0ea5e9" },
  });
  if (!built.valid) throw new Error(`brief de Clínica Dental Nova inválido: ${built.errors.join("; ")}`);
  return built.brief;
}

export function cp04BuildClubPadel04Brief() {
  const built = cp04BuildProjectBrief({
    projectId: CLUB_PADEL_04_TENANT.tenantId,
    displayName: CLUB_PADEL_04_TENANT.displayName,
    client: CLUB_PADEL_04_TENANT.legalName,
    sector: "club-deportivo",
    contact: CLUB_PADEL_04_TENANT.contact,
    scope: "Memoria técnica, manual de uso y presentación comercial de la plataforma ya en producción.",
    branding: { projectName: CLUB_PADEL_04_TENANT.displayName, accentColor: CLUB_PADEL_04_TENANT.branding.colors.primary },
  });
  if (!built.valid) throw new Error(`brief de Club Pádel 04 inválido: ${built.errors.join("; ")}`);
  return built.brief;
}
