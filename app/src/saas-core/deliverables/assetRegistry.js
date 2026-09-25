// App 3 · Prompt 1/6 — AssetRegistry.
//
// Registro en memoria de los assets/plantillas que la fábrica de
// entregables conoce para un proyecto dado. Puro y testeable: sin
// disco, sin red. Un adaptador de persistencia real (archivo/DB) podrá
// envolver esta misma interfaz más adelante sin cambiar el contrato.

let sequence = 0;
function nextId(prefix) {
  sequence += 1;
  return `${prefix}_${Date.now()}_${sequence}`;
}

/** Crea un registro de assets nuevo e independiente (útil para tests y para aislar un proyecto de otro). */
export function cp04CreateAssetRegistry() {
  const byId = new Map();

  return {
    /**
     * @param {{projectId:string, type:string, name:string, format:string, content?:any, metadata?:object}} asset
     * @returns {{id:string, projectId:string, type:string, name:string, format:string, createdAt:string}}
     */
    registerAsset(asset) {
      if (!asset || typeof asset !== "object") throw new TypeError("registerAsset requiere un objeto");
      const { projectId, type, name, format } = asset;
      if (!projectId) throw new TypeError("registerAsset requiere projectId");
      if (!type) throw new TypeError("registerAsset requiere type");
      if (!name) throw new TypeError("registerAsset requiere name");
      if (!format) throw new TypeError("registerAsset requiere format");

      const id = nextId("asset");
      const record = Object.freeze({
        id,
        projectId: String(projectId),
        type: String(type),
        name: String(name),
        format: String(format).toLowerCase(),
        content: asset.content ?? null,
        metadata: Object.freeze({ ...(asset.metadata || {}) }),
        createdAt: new Date().toISOString(),
      });
      byId.set(id, record);
      return record;
    },

    getAsset(id) {
      return byId.get(id) || null;
    },

    listAssets(projectId) {
      const all = Array.from(byId.values());
      if (!projectId) return all;
      return all.filter((a) => a.projectId === String(projectId));
    },

    listAssetsByType(projectId, type) {
      return this.listAssets(projectId).filter((a) => a.type === String(type));
    },

    removeAsset(id) {
      return byId.delete(id);
    },

    count() {
      return byId.size;
    },
  };
}

// Instancia compartida por conveniencia (equivalente a un singleton de
// proceso) — cada llamador que necesite aislamiento real (tests) debe
// usar cp04CreateAssetRegistry() en su lugar.
export const cp04SharedAssetRegistry = cp04CreateAssetRegistry();
