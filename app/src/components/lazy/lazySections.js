import { lazy } from "react";

export const LazySectionShell = lazy(() => import("./LazySectionShell.jsx"));

export const lazySectionsAudit32 = {
  status: "prepared",
  scope: "non-critical-ui-sections",
  protectedAreas: [
    "reservas",
    "cancelacion",
    "reprogramacion",
    "auth",
    "worker",
    "make",
    "airtable",
    "supabase",
    "pagos",
    "endpoints",
    "secrets"
  ],
};
