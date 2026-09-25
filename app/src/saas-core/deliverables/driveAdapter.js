// App 3 · Prompt 1/6 — DriveAdapter.
//
// Interfaz de adaptador para Google Drive, AISLADA (mismo patrón que
// stripeAdapter.js/whatsappAdapter.js): ningún método hace una petición
// real sin credenciales presentes en `env`, y aunque las hubiera, el
// feature flag CP04_DRIVE_SYNC_ENABLED debe estar en "true" para que
// DriveSyncManager llegue siquiera a invocar este adaptador (ver
// driveSyncManager.js). Sin ambas condiciones, todo método devuelve
// `status: "not_configured"` de forma determinista — nunca lanza,
// nunca finge una subida real.
//
// Variables de entorno previstas (documentadas en .env.example, sin
// valores reales): GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET,
// GOOGLE_DRIVE_REFRESH_TOKEN, GOOGLE_DRIVE_ROOT_FOLDER_ID.

import process from "node:process";

export function cp04IsDriveConfigured(env = process.env) {
  return Boolean(
    env.GOOGLE_DRIVE_CLIENT_ID &&
    env.GOOGLE_DRIVE_CLIENT_SECRET &&
    env.GOOGLE_DRIVE_REFRESH_TOKEN
  );
}

export function cp04IsDriveSyncEnabled(env = process.env) {
  return String(env.CP04_DRIVE_SYNC_ENABLED || "").toLowerCase() === "true";
}

/** Nunca expone credenciales — seguro para volcar en un informe/log. */
export function cp04GetDriveRuntimeStatus(env = process.env) {
  return {
    configured: cp04IsDriveConfigured(env),
    syncEnabled: cp04IsDriveSyncEnabled(env),
    rootFolderConfigured: Boolean(env.GOOGLE_DRIVE_ROOT_FOLDER_ID),
  };
}

function notConfiguredResult(env) {
  const status = cp04GetDriveRuntimeStatus(env);
  return {
    status: "not_configured",
    reason: !status.syncEnabled
      ? "CP04_DRIVE_SYNC_ENABLED no es \"true\" — la sincronización con Drive está desactivada por diseño"
      : "faltan credenciales de Google Drive (GOOGLE_DRIVE_CLIENT_ID/SECRET/REFRESH_TOKEN)",
  };
}

/**
 * Adaptador por defecto: implementa el contrato completo, siempre en
 * modo "no configurado". Un adaptador real (implementando exactamente
 * los mismos 3 métodos) podrá sustituirlo sin tocar DriveSyncManager.
 */
export function cp04CreateNotConfiguredDriveAdapter(env = process.env) {
  return {
    // Los parámetros se mantienen nombrados (sin usarlos) a propósito:
    // documentan el contrato exacto que un adaptador real deberá cumplir.
    /* eslint-disable no-unused-vars */
    async createFolder(path) {
      return notConfiguredResult(env);
    },
    async uploadFile(folderPath, fileName, content) {
      return notConfiguredResult(env);
    },
    async listFolder(path) {
      return notConfiguredResult(env);
    },
    /* eslint-enable no-unused-vars */
  };
}
