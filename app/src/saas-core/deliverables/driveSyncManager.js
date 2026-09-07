// App 3 · Prompt 1/6 — DriveSyncManager.
//
// Cola de sincronización con reintentos (backoff exponencial), pensada
// para subir entregables a Google Drive el día que se conecte de
// verdad. Hoy, con CP04_DRIVE_SYNC_ENABLED sin activar (o sin
// credenciales), la cola acepta encolar elementos pero
// `processQueue()` los marca como `skipped_disabled` sin llamar al
// adaptador ni a ningún método de red — puro estado en memoria.

import process from "node:process";
import { cp04IsDriveSyncEnabled, cp04CreateNotConfiguredDriveAdapter } from "./driveAdapter.js";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 500;

/** Backoff exponencial puro (sin temporizadores reales) — testeable de forma determinista. */
export function cp04ComputeBackoffDelayMs(attempt, baseDelayMs = DEFAULT_BASE_DELAY_MS) {
  const safeAttempt = Math.max(1, Number(attempt) || 1);
  return baseDelayMs * 2 ** (safeAttempt - 1);
}

let sequence = 0;
function nextId() {
  sequence += 1;
  return `sync_${Date.now()}_${sequence}`;
}

/**
 * @param {{env?:object, adapter?:object, maxAttempts?:number, baseDelayMs?:number}} [options]
 */
export function cp04CreateDriveSyncManager(options = {}) {
  const env = options.env || process.env;
  const adapter = options.adapter || cp04CreateNotConfiguredDriveAdapter(env);
  const maxAttempts = Number.isInteger(options.maxAttempts) ? options.maxAttempts : DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = Number.isInteger(options.baseDelayMs) ? options.baseDelayMs : DEFAULT_BASE_DELAY_MS;

  const queue = [];
  const history = [];

  return {
    /** @param {{folderPath:string, fileName:string, content:any}} item */
    enqueue(item) {
      if (!item || !item.folderPath || !item.fileName) {
        throw new TypeError("enqueue requiere folderPath y fileName");
      }
      const queued = { id: nextId(), ...item, attempts: 0, status: "queued" };
      queue.push(queued);
      return queued;
    },

    size() {
      return queue.length;
    },

    /**
     * Procesa toda la cola una vez. Si la sincronización está
     * desactivada (por defecto), ningún item llega a tocar el
     * adaptador: se marca `skipped_disabled` y se retira de la cola.
     */
    async processQueue() {
      const results = [];
      const syncEnabled = cp04IsDriveSyncEnabled(env);

      while (queue.length > 0) {
        const item = queue.shift();

        if (!syncEnabled) {
          const skipped = { ...item, status: "skipped_disabled" };
          history.push(skipped);
          results.push(skipped);
          continue;
        }

        let lastError = null;
        let succeeded = false;
        let attempts = 0;

        while (attempts < maxAttempts && !succeeded) {
          attempts += 1;
          const response = await adapter.uploadFile(item.folderPath, item.fileName, item.content);
          if (response.status === "not_configured") {
            lastError = response.reason;
            break; // reintentar no ayuda si sigue sin configurar
          }
          if (response.status === "completed") {
            succeeded = true;
          } else {
            lastError = response.reason || "fallo desconocido del adaptador";
          }
        }

        const finalItem = {
          ...item,
          attempts,
          status: succeeded ? "synced" : "failed",
          error: succeeded ? null : lastError,
          nextRetryDelayMs: succeeded ? null : cp04ComputeBackoffDelayMs(attempts, baseDelayMs),
        };
        history.push(finalItem);
        results.push(finalItem);
      }

      return results;
    },

    getHistory() {
      return [...history];
    },
  };
}
