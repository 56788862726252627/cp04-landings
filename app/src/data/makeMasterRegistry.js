// Club Pádel 04 · Registro maestro de los 50 flujos Make (fuente única de verdad).
//
// Este archivo NO reintroduce datos nuevos ni renombra escenarios: se limita a
// UNIR (join por `id`) los tres ejes ya existentes y auditados por separado,
// cada uno con su propia sesión de trabajo y su propia batería de tests:
//
//   - `src/data/makeInventory.js`            → datos operacionales confirmados
//     por Make (MCP, solo lectura) + `estadoVerificacion` (auditoría Make).
//   - `src/data/makeAppIntegrationMap.js`     → ¿el código de la app dispara
//     este escenario? (`grupo`, `integradoEnApp`, `integradoEnWorker`).
//   - `src/data/makeArchitectureMatrix.js`    → arquitectura orientada a
//     producto (`estado`, `rolesAutorizados`, `modulo`, `descripcion`, etc.).
//
// Motivo de este archivo: ninguno de los tres expone exactamente el conjunto
// de campos ni el vocabulario de estado que pide el registro maestro 50/50
// (id, número 1–50, nombre, categoría, descripción, roles autorizados, módulo,
// acción iniciadora, webhook esperado, servicio de destino, estado funcional,
// evidencia, notas) con los 7 estados NO_CONECTADO / CONECTADO_SIN_PROBAR /
// PROBADO_PARCIAL / OPERATIVO / BLOQUEADO / NO_APLICA / PENDIENTE_DE_CONFIRMAR.
// En vez de duplicar o reescribir los tres archivos ya probados, este módulo
// los importa y deriva el registro maestro de forma programática — cualquier
// corrección futura de los datos base se propaga aquí automáticamente.
//
// `numero` (1–50): posición estable = índice en `MAKE_ARCHITECTURE_MATRIX`
// (el mismo orden ya usado como eje de correspondencia 1:1 entre los tres
// archivos base, ver los tests de cada uno). No es un ranking de prioridad.

import { MAKE_INVENTORY } from "./makeInventory.js";
import { MAKE_APP_INTEGRATION_MAP } from "./makeAppIntegrationMap.js";
import { MAKE_ARCHITECTURE_MATRIX, MAKE_ARCH_ESTADOS } from "./makeArchitectureMatrix.js";

// Único número "mágico" del módulo: el total de flujos objetivo del catálogo
// Make de Club Pádel 04 (constante de negocio, no una cifra de UI). Se usa
// para comparar contra `MAKE_MASTER_REGISTRY.length` y detectar drift real
// (si el registro alguna vez tuviera menos de 50 entradas, `total` y
// `totalEsperado` dejarían de coincidir y el "50/50" de la UI lo reflejaría
// honestamente en vez de mentir con un "total/total" tautológico).
export const TOTAL_FLUJOS_ESPERADOS = 50;

export const MAKE_ESTADOS_FUNCIONALES = Object.freeze({
  NO_CONECTADO: "NO_CONECTADO",
  CONECTADO_SIN_PROBAR: "CONECTADO_SIN_PROBAR",
  PROBADO_PARCIAL: "PROBADO_PARCIAL",
  OPERATIVO: "OPERATIVO",
  BLOQUEADO: "BLOQUEADO",
  NO_APLICA: "NO_APLICA",
  PENDIENTE_DE_CONFIRMAR: "PENDIENTE_DE_CONFIRMAR",
});

const E = MAKE_ESTADOS_FUNCIONALES;

// Regla de derivación (determinista, documentada, sin juicio manual por
// escenario): combina los 3 ejes ya existentes. Nunca declara "operativo"
// sin `probadoE2E === true` (evidencia objetiva ya verificada en el Paso 08E).
//
//   1. arquitectura OPERATIONAL + probadoE2E true         → OPERATIVO
//   2. arquitectura EXTERNALLY_BLOCKED                    → BLOQUEADO
//   3. grupo D (autónomo en Make, sin relación de producto) → NO_APLICA
//   4. grupo E (el dominio sugiere integración, pero no existe) → NO_CONECTADO
//   5. integradoEnApp = true (grupos A/B/C) y aún sin E2E:
//        5a. estadoVerificacion "confirmado" (evidencia real en Make)
//            → PROBADO_PARCIAL
//        5b. estadoVerificacion "pendiente_make_real" (acción manual en
//            Make pendiente antes de poder clasificar mejor)
//            → PENDIENTE_DE_CONFIRMAR
//        5c. resto                                        → CONECTADO_SIN_PROBAR
//   6. cualquier otro caso (no integrado, no grupo D/E)    → NO_CONECTADO
export function deriveEstadoFuncional(arch, integ, inv) {
  if (arch.estado === MAKE_ARCH_ESTADOS.OPERATIONAL && arch.probadoE2E) return E.OPERATIVO;
  if (arch.estado === MAKE_ARCH_ESTADOS.EXTERNALLY_BLOCKED) return E.BLOQUEADO;
  if (integ.grupo === "D") return E.NO_APLICA;
  if (integ.grupo === "E") return E.NO_CONECTADO;
  if (integ.integradoEnApp) {
    if (inv.estadoVerificacion === "confirmado") return E.PROBADO_PARCIAL;
    if (inv.estadoVerificacion === "pendiente_make_real") return E.PENDIENTE_DE_CONFIRMAR;
    return E.CONECTADO_SIN_PROBAR;
  }
  return E.NO_CONECTADO;
}

// "Servicio de destino": Airtable (mayoritario, campo `usaAirtable` real de
// Make) + detección por palabra clave sobre texto ya existente (nombre,
// descripción, módulo, siguiente acción) para los servicios de terceros ya
// documentados en el proyecto (Stripe, WhatsApp, Telegram, Instagram, Drive,
// Calendar). No inventa ninguna integración nueva: solo nombra explícitamente
// lo que el texto ya auditado menciona.
function deriveServicioDestino(arch, inv) {
  const servicios = new Set();
  if (inv.usaAirtable) servicios.add("Airtable");
  const texto = `${arch.nombre} ${arch.descripcion} ${arch.modulo} ${arch.siguienteAccionNecesaria || ""} ${inv.nota || ""}`;
  if (/stripe/i.test(texto)) servicios.add("Stripe");
  if (/whatsapp/i.test(texto)) servicios.add("WhatsApp Business API");
  if (/telegram/i.test(texto)) servicios.add("Telegram Bot API");
  if (/instagram/i.test(texto)) servicios.add("Instagram");
  if (/drive/i.test(texto)) servicios.add("Google Drive");
  if (/calendari?o|calendar/i.test(texto)) servicios.add("Google Calendar");
  if (servicios.size === 0) return "Ninguno detectado";
  return Array.from(servicios).join(" + ");
}

// "Webhook esperado": deriva de `requiereWebhook` (arquitectura) + el
// `scheduling` real confirmado por Make (inventario) — nunca expone una URL
// ni un hookId invocable, solo si el flujo espera un disparador webhook y
// cuál es el disparador real ya confirmado.
function deriveWebhookEsperado(arch, inv) {
  return arch.requiereWebhook
    ? `Sí — disparador confirmado: ${inv.scheduling}`
    : `No — disparador confirmado: ${inv.scheduling}`;
}

const invById = Object.fromEntries(MAKE_INVENTORY.map((f) => [f.id, f]));
const integById = Object.fromEntries(MAKE_APP_INTEGRATION_MAP.map((f) => [f.id, f]));

export const MAKE_MASTER_REGISTRY = Object.freeze(
  MAKE_ARCHITECTURE_MATRIX.map((arch, idx) => {
    const inv = invById[arch.id];
    const integ = integById[arch.id];
    return Object.freeze({
      id: arch.id,
      numero: idx + 1,
      nombre: arch.nombre,
      categoria: inv.categoria,
      area: arch.area,
      descripcion: arch.descripcion,
      rolesAutorizados: arch.rolesAutorizados,
      modulo: arch.modulo,
      ruta: arch.ruta,
      accionIniciadora: arch.accionIniciadora,
      webhookEsperado: deriveWebhookEsperado(arch, inv),
      servicioDestino: deriveServicioDestino(arch, inv),
      estadoFuncional: deriveEstadoFuncional(arch, integ, inv),
      evidencia: arch.ultimaValidacionConocida,
      notas: arch.siguienteAccionNecesaria,
    });
  })
);

// Contadores SIEMPRE derivados de MAKE_MASTER_REGISTRY — nunca escribir estas
// cifras a mano en ningún panel (PLAYER/STAFF/ADMIN/SUPPORT).
//
//   - `total` / `totalEsperado`: cuántos flujos hay realmente en el registro
//     frente a los 50 esperados. Hoy coinciden (50/50); si el registro
//     alguna vez perdiera una entrada, dejarían de coincidir y la UI lo
//     mostraría honestamente en vez de un "N/N" que nunca puede fallar.
//   - `conectados`: todo lo que no es NO_CONECTADO ni NO_APLICA (incluye
//     BLOQUEADO: un flujo bloqueado por Airtable sigue integrado en la app,
//     solo que su dependencia externa no responde hoy). Es un dato
//     INDEPENDIENTE del total — nunca se mezcla en el mismo ratio que
//     `total/totalEsperado`.
//   - `probados`: incluye PROBADO_PARCIAL (evidencia real pero no E2E
//     completo) además de OPERATIVO.
//   - `operativos`: exige evidencia E2E objetiva (idéntico a `probadoE2E` de
//     la matriz de arquitectura) — nunca declarar todos los flujos
//     operativos sin esa evidencia.
export function computeMasterCounters(registry = MAKE_MASTER_REGISTRY) {
  const porEstado = Object.fromEntries(Object.values(E).map((estado) => [estado, 0]));
  for (const flujo of registry) {
    porEstado[flujo.estadoFuncional] = (porEstado[flujo.estadoFuncional] || 0) + 1;
  }
  const conectados = registry.length - porEstado[E.NO_CONECTADO] - porEstado[E.NO_APLICA];
  const probados = porEstado[E.OPERATIVO] + porEstado[E.PROBADO_PARCIAL];
  const operativos = porEstado[E.OPERATIVO];
  return {
    total: registry.length,
    totalEsperado: TOTAL_FLUJOS_ESPERADOS,
    registroCompleto: registry.length === TOTAL_FLUJOS_ESPERADOS,
    conectados,
    probados,
    operativos,
    porEstado,
  };
}

export function filterMasterRegistry(registry, { estadoFuncional, rol, categoria, area } = {}) {
  return registry.filter((flujo) => {
    if (estadoFuncional && flujo.estadoFuncional !== estadoFuncional) return false;
    if (rol && !flujo.rolesAutorizados.includes(rol)) return false;
    if (categoria && flujo.categoria !== categoria) return false;
    if (area && flujo.area !== area) return false;
    return true;
  });
}
