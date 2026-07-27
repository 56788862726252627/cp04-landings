// App 3 · Prompt 1/6 — ManifestGenerator.
//
// Construye y valida el manifiesto que describe un lote de entregables
// ya exportados (o pendientes): qué se generó, en qué formato, con qué
// checksum, en qué versión y en qué ruta lógica de Drive debería acabar.
// Es la pieza que le permite a DriveSyncManager saber "qué hay que
// subir" sin tener que volver a inspeccionar cada archivo.
//
// El checksum usa `node:crypto` (ya en Node, cero dependencias nuevas)
// — nunca un hash inventado a mano.

import { createHash } from "node:crypto";

function checksumOf(content) {
  const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * @param {{id:string, deliverableType:string, format:string, content:any, path:string, status:string}[]} entries
 * @param {{projectId:string, projectName:string, version?:number}} meta
 */
export function cp04GenerateManifest(entries, meta) {
  if (!Array.isArray(entries)) throw new TypeError("cp04GenerateManifest requiere un array de entries");
  if (!meta || !meta.projectId) throw new TypeError("cp04GenerateManifest requiere meta.projectId");

  const items = entries.map((entry) => {
    if (!entry || !entry.id || !entry.deliverableType || !entry.format) {
      throw new TypeError("cada entry del manifiesto necesita id, deliverableType y format");
    }
    return Object.freeze({
      id: entry.id,
      deliverableType: entry.deliverableType,
      format: String(entry.format).toLowerCase(),
      path: entry.path || null,
      status: entry.status || "completed",
      checksum: checksumOf(entry.content),
    });
  });

  return Object.freeze({
    manifestVersion: 1,
    projectId: String(meta.projectId),
    projectName: meta.projectName ? String(meta.projectName) : null,
    generatedAt: new Date().toISOString(),
    version: Number.isInteger(meta.version) ? meta.version : 1,
    itemCount: items.length,
    items,
  });
}

/** Valida un manifiesto ya generado (o uno recibido de un fixture externo) sin lanzar — siempre devuelve un resultado, nunca una excepción. */
export function cp04ValidateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== "object") return { valid: false, errors: ["manifiesto ausente o no es un objeto"] };
  if (manifest.manifestVersion !== 1) errors.push("manifestVersion debe ser 1");
  if (!manifest.projectId) errors.push("falta projectId");
  if (!Array.isArray(manifest.items)) {
    errors.push("falta 'items' o no es un array");
  } else {
    if (manifest.itemCount !== manifest.items.length) errors.push("itemCount no coincide con items.length");
    manifest.items.forEach((item, idx) => {
      if (!item?.id) errors.push(`items[${idx}]: falta id`);
      if (!item?.format) errors.push(`items[${idx}]: falta format`);
      if (!item?.checksum) errors.push(`items[${idx}]: falta checksum`);
    });
  }
  return { valid: errors.length === 0, errors };
}

/** Compara dos manifiestos del mismo proyecto y devuelve qué items son nuevos, cuáles cambiaron de checksum y cuáles ya no están — base de un futuro control de versiones real. */
export function cp04DiffManifests(previous, next) {
  const prevById = new Map((previous?.items || []).map((i) => [i.id, i]));
  const nextById = new Map((next?.items || []).map((i) => [i.id, i]));

  const added = [];
  const changed = [];
  const removed = [];

  for (const [id, item] of nextById) {
    const prevItem = prevById.get(id);
    if (!prevItem) added.push(item);
    else if (prevItem.checksum !== item.checksum) changed.push({ id, from: prevItem.checksum, to: item.checksum });
  }
  for (const [id, item] of prevById) {
    if (!nextById.has(id)) removed.push(item);
  }

  return { added, changed, removed };
}
