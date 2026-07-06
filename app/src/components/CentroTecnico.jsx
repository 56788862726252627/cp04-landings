import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "../theme.js";
import {
  MAKE_INVENTORY,
  MAKE_INVENTORY_META,
  MAKE_SCENARIO_CATEGORIES,
  computeErrorRate,
  computeHealth,
  computeCriticality,
  getScenarioNote,
} from "../data/makeInventory.js";
import { cp04NormalizeRole } from "../utils/rbac.js";
import { authFetch } from "../auth/authService.js";
import { resolveMakeInventorySource, createSingleFlightGuard } from "../utils/makeLiveClient.js";

export const CP04_MAKE_LIVE_ENDPOINT = "/api/support/make/scenarios";
export const CP04_MAKE_LIVE_TIMEOUT_MS = 8000;

// Club Pádel 04 · Centro Técnico (SUPPORT-only)
//
// Consola de observabilidad de las automatizaciones Make del club. Toda la
// información operacional (activo/inactivo, scheduling, ejecuciones,
// operaciones, errores, última modificación) procede de una consulta real
// de solo lectura a la API de Make hecha vía MCP durante la auditoría —
// nunca se inventa. Ver src/data/makeInventory.js para el detalle exacto y
// la fecha de captura.
//
// Por qué es un snapshot y no datos en vivo: el frontend nunca debe llamar
// a la API de Make con una clave privada. Un refresco en vivo requeriría un
// endpoint propio en el Worker que guarde ese token como secret de
// servidor — fuera del alcance de esta fase.
//
// Esta es la TERCERA capa de protección (además de ocultarse en la
// navegación y del guard de render en App.jsx): si por cualquier motivo
// este componente llegara a renderizarse para un rol distinto de SUPPORT,
// se autoprotege y no muestra nada.

const HEALTH_LABEL = { OK: "OK", ATENCION: "Atención", CRITICO: "Crítico" };
const HEALTH_COLOR = { OK: T.accent, ATENCION: T.warning, CRITICO: T.danger };

const CATEGORY_LABEL = {
  [MAKE_SCENARIO_CATEGORIES.APP_TRIGGERED]: "Disparado por la app",
  [MAKE_SCENARIO_CATEGORIES.EVENT_TRIGGERED]: "Evento de negocio",
  [MAKE_SCENARIO_CATEGORIES.SCHEDULED]: "Programado",
  [MAKE_SCENARIO_CATEGORIES.INTERNAL_OPERATION]: "Operación interna",
  [MAKE_SCENARIO_CATEGORIES.TECHNICAL_MONITORING]: "Monitorización técnica",
  [MAKE_SCENARIO_CATEGORIES.DEVELOPMENT_QA]: "Desarrollo/QA",
};

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "activos", label: "Activos" },
  { id: "inactivos", label: "Inactivos" },
  { id: "con_errores", label: "Con errores" },
  { id: "criticos", label: "Críticos" },
  ...Object.values(MAKE_SCENARIO_CATEGORIES).map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
];

const INTEGRATIONS = [
  { sistema: "Airtable", uso: "Base de datos operativa (reservas, jugadores, torneos)" },
  { sistema: "Gmail", uso: "Envío de emails transaccionales" },
  { sistema: "Google Calendar", uso: "Sincronización de reservas confirmadas" },
  { sistema: "Google Drive", uso: "Backups semanales" },
  { sistema: "WhatsApp Business Cloud", uso: "Recordatorios y notificaciones" },
  { sistema: "Telegram", uso: "Bot de reservas (inactivo)" },
  { sistema: "OpenAI", uso: "Generación de resúmenes e informes" },
  { sistema: "Stripe", uso: "Infraestructura preparada, no activada en la app" },
  { sistema: "Tally", uso: "Formularios externos (inactivo)" },
];

function enrich(scenario) {
  return {
    ...scenario,
    tasaError: computeErrorRate(scenario),
    salud: computeHealth(scenario),
    criticidad: computeCriticality(scenario),
    nota: getScenarioNote(scenario),
  };
}

function Badge({ children, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: ".72rem",
        fontWeight: 800,
        color,
        border: `1px solid ${color}55`,
        background: `${color}18`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Panel({ title, eyebrow, children, style = {} }) {
  return (
    <div
      style={{
        border: `1px solid ${T.line}`,
        borderRadius: 20,
        background: "rgba(255,255,255,.03)",
        padding: "20px 22px",
        marginBottom: 20,
        ...style,
      }}
    >
      {eyebrow && (
        <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".14em", fontSize: ".72rem", textTransform: "uppercase", marginBottom: 6 }}>
          {eyebrow}
        </div>
      )}
      {title && <h3 style={{ margin: "0 0 14px", fontFamily: T.fontDisplay }}>{title}</h3>}
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ border: `1px solid ${T.line}`, borderRadius: 16, padding: "16px 18px", background: "rgba(255,255,255,.03)" }}>
      <div style={{ color: T.textDim, fontSize: ".76rem", fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: T.fontDisplay, fontSize: "1.7rem", fontWeight: 900, color: color || T.text }}>{value}</div>
      {sub && <div style={{ color: T.textDim, fontSize: ".72rem", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function CentroTecnico({ selectedRole }) {
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("errores");
  const [seleccionado, setSeleccionado] = useState(null);

  // Estado del refresco en vivo. La decisión de qué fuente mostrar (EN VIVO
  // / SNAPSHOT / NO DISPONIBLE) vive en resolveMakeInventorySource (pura,
  // testeada) para no mentir nunca sobre la frescura real de los datos: si
  // "live" falla, se cae a "snapshot" y se etiqueta como tal.
  const [liveOk, setLiveOk] = useState(false);
  const [liveScenarios, setLiveScenarios] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const guard = useRef(createSingleFlightGuard());
  const hasFetchedOnce = useRef(false);

  // Tercera capa de protección RBAC: aunque nav y render-guard ya impiden
  // llegar aquí con otro rol, este componente nunca confía ciegamente en
  // haber sido montado correctamente.
  const safeRole = cp04NormalizeRole(selectedRole);

  const loadLive = async () => {
    // Guard anti doble-petición (single-flight): si ya hay una petición en
    // curso, ignora la nueva llamada en lugar de encolarla o dispararla en
    // paralelo (protege tanto contra el doble-efecto de StrictMode en
    // desarrollo como contra un doble clic real en "Actualizar estado").
    if (!guard.current.tryStart() || safeRole !== "SUPPORT") return;
    setLoadingLive(true);
    setLiveError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CP04_MAKE_LIVE_TIMEOUT_MS);

    try {
      const response = await authFetch(CP04_MAKE_LIVE_ENDPOINT, { signal: controller.signal });
      const body = await response.json().catch(() => null);

      if (response.ok && body?.ok && Array.isArray(body.scenarios)) {
        setLiveScenarios(body.scenarios);
        setLiveOk(true);
        setLastUpdated(body.capturedAt || new Date().toISOString());
      } else {
        // Fail-safe: cualquier respuesta que no sea exactamente un 200 con
        // el contrato esperado se trata como "no disponible en vivo", nunca
        // se usan datos parciales o con forma inesperada.
        setLiveError(body?.error || `HTTP_${response.status}`);
        setLiveOk(false);
      }
    } catch {
      setLiveError("NETWORK_OR_TIMEOUT");
      setLiveOk(false);
    } finally {
      clearTimeout(timeoutId);
      setLoadingLive(false);
      guard.current.finish();
    }
  };

  useEffect(() => {
    if (safeRole !== "SUPPORT" || hasFetchedOnce.current) return;
    hasFetchedOnce.current = true;
    loadLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRole]);

  const snapshotScenarios = useMemo(() => MAKE_INVENTORY.map(enrich), []);

  const liveScenariosEnriched = useMemo(() => {
    if (!Array.isArray(liveScenarios)) return null;
    return liveScenarios.map((s) => ({
      ...s,
      ejecuciones: s.ejecuciones_acumuladas ?? 0,
      operaciones: s.operaciones_acumuladas ?? 0,
      errores: s.errores_acumulados ?? 0,
      tasaError: s.tasa_error ?? 0,
      salud: s.salud || "OK",
      criticidad: s.criticidad || "BAJA",
      ultimaModificacion: s.ultima_modificacion,
      nota: s.recomendaciones || null,
    }));
  }, [liveScenarios]);

  const { source: effectiveSource, scenarios: enriched } = useMemo(
    () => resolveMakeInventorySource({ liveOk, liveScenarios: liveScenariosEnriched, snapshotScenarios }),
    [liveOk, liveScenariosEnriched, snapshotScenarios]
  );

  if (safeRole !== "SUPPORT") {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", color: T.textDim }}>
        Acceso restringido. El Centro Técnico es exclusivo del rol SUPPORT.
      </div>
    );
  }

  const totales = {
    total: enriched.length,
    activos: enriched.filter((s) => s.activo).length,
    inactivos: enriched.filter((s) => !s.activo).length,
    conErrores: enriched.filter((s) => s.errores > 0).length,
    ejecuciones: enriched.reduce((a, s) => a + s.ejecuciones, 0),
    operaciones: enriched.reduce((a, s) => a + s.operaciones, 0),
  };
  const erroresTotales = enriched.reduce((a, s) => a + s.errores, 0);
  const tasaErrorGlobal = totales.ejecuciones ? Math.round((erroresTotales / totales.ejecuciones) * 1000) / 10 : 0;
  const mayorVolumen = enriched.reduce((max, s) => (s.ejecuciones > (max?.ejecuciones || 0) ? s : max), null);

  const filtrados = enriched
    .filter((s) => {
      if (busqueda.trim() && !s.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())) return false;
      if (filtro === "todos") return true;
      if (filtro === "activos") return s.activo;
      if (filtro === "inactivos") return !s.activo;
      if (filtro === "con_errores") return s.errores > 0;
      if (filtro === "criticos") return s.salud === "CRITICO";
      return s.categoria === filtro;
    })
    .sort((a, b) => {
      if (orden === "errores") return b.errores - a.errores;
      if (orden === "ejecuciones") return b.ejecuciones - a.ejecuciones;
      if (orden === "operaciones") return b.operaciones - a.operaciones;
      if (orden === "tasaError") return b.tasaError - a.tasaError;
      if (orden === "ultimaModificacion") return new Date(b.ultimaModificacion) - new Date(a.ultimaModificacion);
      if (orden === "criticidad") return String(b.criticidad).localeCompare(String(a.criticidad));
      return 0;
    });

  const conErrores = enriched.filter((s) => s.errores > 0).sort((a, b) => b.errores - a.errores);
  const topConsumo = [...enriched].sort((a, b) => b.operaciones - a.operaciones).slice(0, 8);
  const porSalud = { OK: 0, ATENCION: 0, CRITICO: 0 };
  enriched.forEach((s) => { porSalud[s.salud] += 1; });

  return (
    <section style={{ padding: "clamp(18px,3vw,42px) 24px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".14em", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 8 }}>
          Centro Técnico · Solo SUPPORT
        </div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", margin: "0 0 8px", letterSpacing: "-.03em" }}>
          Observabilidad de automatizaciones
        </h2>
        <p style={{ color: T.textDim, maxWidth: 720, lineHeight: 1.6 }}>
          Snapshot real de los {MAKE_INVENTORY_META.totalReal} escenarios de Make, capturado el{" "}
          {new Date(MAKE_INVENTORY_META.capturedAt).toLocaleString("es-ES")} vía consulta de solo lectura (fuente:{" "}
          <code>{MAKE_INVENTORY_META.source}</code>). No es una conexión en vivo.
        </p>
      </div>

      {/* Indicador de frescura de datos del inventario de Make — independiente del estado de Airtable */}
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          border: `1px solid ${T.line}`,
          borderRadius: 16,
          padding: "12px 18px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {effectiveSource === "live" && <Badge color={T.accent}>🟢 EN VIVO</Badge>}
          {effectiveSource === "snapshot" && <Badge color={T.warning}>🟡 SNAPSHOT</Badge>}
          {effectiveSource === "unavailable" && <Badge color={T.danger}>🔴 NO DISPONIBLE</Badge>}
          <span style={{ color: T.textDim, fontSize: ".8rem" }}>
            {effectiveSource === "live"
              ? `Actualizado ${new Date(lastUpdated).toLocaleString("es-ES")} · fuente: API de Make en vivo`
              : effectiveSource === "snapshot"
              ? `Última instantánea conocida · capturada ${new Date(MAKE_INVENTORY_META.capturedAt).toLocaleString("es-ES")}`
              : "Sin datos en vivo ni snapshot disponible."}
          </span>
          {liveError && (
            <span title={liveError} style={{ color: T.textDim, fontSize: ".74rem" }}>
              (en vivo no disponible: {liveError})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={loadLive}
          disabled={loadingLive}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: `1px solid ${T.accent}66`,
            background: loadingLive ? "transparent" : `${T.accent}18`,
            color: T.accent,
            fontWeight: 800,
            fontSize: ".8rem",
            cursor: loadingLive ? "wait" : "pointer",
            opacity: loadingLive ? 0.6 : 1,
          }}
        >
          {loadingLive ? "Actualizando…" : "Actualizar estado"}
        </button>
      </div>

      {/* FASE 6 — banner de dependencia externa degradada */}
      <div
        style={{
          border: `1px solid ${T.warning}66`,
          background: `${T.warning}14`,
          borderRadius: 16,
          padding: "14px 18px",
          marginBottom: 24,
          color: T.warning,
          fontWeight: 700,
          fontSize: ".9rem",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>⚠️</span>
        <div>
          <strong>Estado: DEGRADADO POR DEPENDENCIA EXTERNA.</strong>
          <div style={{ color: T.textDim, fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>
            Dependencia externa degradada: Airtable ha superado temporalmente su cuota de API. Algunas automatizaciones y
            consultas pueden fallar hasta que se restablezca la cuota. Esto no es un fallo del frontend, del Worker, de Make
            ni de Supabase.
          </div>
        </div>
      </div>

      {/* A. RESUMEN TÉCNICO */}
      <Panel eyebrow="A" title="Resumen técnico">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          <KpiCard label="Total escenarios" value={totales.total} />
          <KpiCard label="Activos" value={totales.activos} color={T.accent} />
          <KpiCard label="Inactivos" value={totales.inactivos} color={T.textDim} />
          <KpiCard label="Con errores" value={totales.conErrores} color={totales.conErrores ? T.danger : T.accent} />
          <KpiCard label="Ejecuciones acumuladas" value={totales.ejecuciones.toLocaleString("es-ES")} />
          <KpiCard label="Operaciones acumuladas" value={totales.operaciones.toLocaleString("es-ES")} />
          <KpiCard label="Tasa de error global" value={`${tasaErrorGlobal}%`} color={tasaErrorGlobal > 5 ? T.warning : T.accent} />
          <KpiCard label="Mayor volumen" value={mayorVolumen?.ejecuciones.toLocaleString("es-ES") || "—"} sub={mayorVolumen?.nombre} />
        </div>
      </Panel>

      {/* C. SALUD DE AUTOMATIZACIONES */}
      <Panel eyebrow="C" title="Salud de automatizaciones">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.entries(porSalud).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge color={HEALTH_COLOR[k]}>{HEALTH_LABEL[k]}</Badge>
              <strong style={{ color: T.text }}>{v}</strong>
              <span style={{ color: T.textDim, fontSize: ".8rem" }}>escenarios</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* D. ERRORES Y ALERTAS */}
      <Panel eyebrow="D" title="Errores y alertas">
        {conErrores.length === 0 ? (
          <div style={{ color: T.accent }}>Sin escenarios con errores registrados.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {conErrores.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,.03)" }}>
                <span style={{ color: T.text }}>{s.nombre}</span>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Badge color={HEALTH_COLOR[s.salud]}>{HEALTH_LABEL[s.salud]}</Badge>
                  <span style={{ color: T.danger, fontWeight: 800, fontSize: ".85rem" }}>{s.errores} err · {s.tasaError}%</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* E. CONSUMO Y EFICIENCIA */}
      <Panel eyebrow="E" title="Consumo y eficiencia">
        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          {topConsumo.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px" }}>
              <span style={{ color: T.text }}>{s.nombre}</span>
              <span style={{ color: T.textDim }}>{s.operaciones.toLocaleString("es-ES")} operaciones · {s.ejecuciones.toLocaleString("es-ES")} ejecuciones</span>
            </div>
          ))}
        </div>
        <div style={{ color: T.accent, fontSize: ".85rem", fontWeight: 700 }}>
          ✅ Optimización ya aplicada: Sincronización Multi-Calendario pasó de 15 a 30 minutos de scheduling (auditoría de consumo Airtable).
        </div>
      </Panel>

      {/* B. ESCENARIOS MAKE (filtros, búsqueda, orden, drill-down) */}
      <Panel eyebrow="B" title="Escenarios Make">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <input
            aria-label="Buscar escenario por nombre"
            placeholder="Buscar por nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: "1 1 220px", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg, color: T.text }}
          />
          <select
            aria-label="Ordenar por"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg, color: T.text }}
          >
            <option value="errores">Ordenar: errores</option>
            <option value="ejecuciones">Ordenar: ejecuciones</option>
            <option value="operaciones">Ordenar: operaciones</option>
            <option value="tasaError">Ordenar: tasa de error</option>
            <option value="ultimaModificacion">Ordenar: última modificación</option>
            <option value="criticidad">Ordenar: criticidad</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${filtro === f.id ? T.accent : T.line}`,
                background: filtro === f.id ? `${T.accent}18` : "transparent",
                color: filtro === f.id ? T.accent : T.textDim,
                fontWeight: 700,
                fontSize: ".78rem",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gap: 6, minWidth: 640 }}>
            {filtrados.map((s) => (
              <div
                key={s.id}
                onClick={() => setSeleccionado(seleccionado === s.id ? null : s.id)}
                title={s.nota || CATEGORY_LABEL[s.categoria]}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${seleccionado === s.id ? T.accent : T.line}`,
                  background: seleccionado === s.id ? "rgba(182,255,0,.06)" : "rgba(255,255,255,.02)",
                  cursor: "pointer",
                }}
              >
                <span style={{ color: T.text, fontWeight: 700 }}>{s.nombre}</span>
                <Badge color={T.primary}>{CATEGORY_LABEL[s.categoria]}</Badge>
                <Badge color={s.activo ? T.accent : T.textDim}>{s.activo ? "Activo" : "Inactivo"}</Badge>
                <Badge color={HEALTH_COLOR[s.salud]}>{HEALTH_LABEL[s.salud]}</Badge>
                <span style={{ color: T.textDim, fontSize: ".78rem", whiteSpace: "nowrap" }}>{s.ejecuciones.toLocaleString("es-ES")} ejec.</span>
              </div>
            ))}
            {filtrados.length === 0 && <div style={{ color: T.textDim, padding: "20px 0", textAlign: "center" }}>Sin resultados para este filtro/búsqueda.</div>}
          </div>
        </div>

        {seleccionado && (() => {
          const s = enriched.find((x) => x.id === seleccionado);
          if (!s) return null;
          return (
            <div style={{ marginTop: 16, padding: 18, borderRadius: 16, border: `1px solid ${T.accent}55`, background: "rgba(182,255,0,.04)" }}>
              <h4 style={{ margin: "0 0 10px", fontFamily: T.fontDisplay }}>{s.nombre}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, fontSize: ".85rem" }}>
                <div><span style={{ color: T.textDim }}>ID lógico:</span> {s.id}</div>
                <div><span style={{ color: T.textDim }}>Categoría:</span> {CATEGORY_LABEL[s.categoria]}</div>
                <div><span style={{ color: T.textDim }}>Estado:</span> {s.activo ? "Activo" : "Inactivo"}</div>
                <div><span style={{ color: T.textDim }}>Scheduling:</span> {s.scheduling}</div>
                <div><span style={{ color: T.textDim }}>Ejecuciones:</span> {s.ejecuciones.toLocaleString("es-ES")}</div>
                <div><span style={{ color: T.textDim }}>Operaciones:</span> {s.operaciones.toLocaleString("es-ES")}</div>
                <div><span style={{ color: T.textDim }}>Errores:</span> {s.errores} ({s.tasaError}%)</div>
                <div><span style={{ color: T.textDim }}>Salud:</span> {HEALTH_LABEL[s.salud]}</div>
                <div><span style={{ color: T.textDim }}>Criticidad:</span> {s.criticidad}</div>
                <div><span style={{ color: T.textDim }}>Última modificación:</span> {new Date(s.ultimaModificacion).toLocaleString("es-ES")}</div>
                <div><span style={{ color: T.textDim }}>Usa Airtable:</span> {s.usaAirtable ? "Sí" : "No"}</div>
                <div><span style={{ color: T.textDim }}>Fuente del dato:</span> confirmado_make_mcp</div>
              </div>
              {s.nota && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.04)", color: T.textDim, fontSize: ".85rem", lineHeight: 1.5 }}>
                  💡 {s.nota}
                </div>
              )}
            </div>
          );
        })()}
      </Panel>

      {/* F. INTEGRACIONES */}
      <Panel eyebrow="F" title="Integraciones">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {INTEGRATIONS.map((i) => (
            <div key={i.sistema} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.03)" }}>
              <strong style={{ color: T.text }}>{i.sistema}</strong>
              <div style={{ color: T.textDim, fontSize: ".78rem", marginTop: 4 }}>{i.uso}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* G. SEGURIDAD */}
      <Panel eyebrow="G" title="Seguridad">
        <ul style={{ margin: 0, paddingLeft: 20, color: T.textDim, lineHeight: 1.8, fontSize: ".88rem" }}>
          <li>Acceso exclusivo del rol SUPPORT (navegación, guard de render y este componente lo verifican de forma independiente).</li>
          <li>Ningún token, hookId invocable, URL de webhook, credencial ni contenido HTML de email se muestra en este panel.</li>
          <li>Los datos son un snapshot de solo lectura obtenido fuera del navegador — el frontend nunca posee ni transmite claves de Make.</li>
        </ul>
      </Panel>

      {/* H. RECOMENDACIONES */}
      <Panel eyebrow="H" title="Recomendaciones">
        <ul style={{ margin: 0, paddingLeft: 20, color: T.textDim, lineHeight: 1.9, fontSize: ".88rem" }}>
          <li><strong style={{ color: T.text }}>Sincronización Multi-Calendario:</strong> optimización ya aplicada (15→30 min). Sin acción adicional.</li>
          <li><strong style={{ color: T.text }}>Recordatorio 24h Antes:</strong> corrección estructural aplicada; escenario inactivo; pendiente validación funcional con datos reales cuando Airtable esté disponible.</li>
          <li><strong style={{ color: T.text }}>Recordatorio 2h Antes:</strong> los errores actuales son <code>RateLimitError 429</code> de Airtable — dependencia externa, no un bug del escenario.</li>
          <li><strong style={{ color: T.text }}>Backup Plantilla Drive:</strong> inactivo. No reactivar sin necesidad confirmada.</li>
          <li><strong style={{ color: T.text }}>Alerta Crítica Fallos Make / Mapa de Flujos:</strong> confirmado que cada nombre corresponde a un único escenario real en Make — no hay duplicados ejecutándose en paralelo.</li>
          <li><strong style={{ color: T.text }}>Recuperación de contraseña:</strong> Supabase Auth es la única fuente de verdad. El escenario Make "Email Recuperación de Contraseña SaaS" no debe conectarse como segundo sistema de recuperación.</li>
        </ul>
      </Panel>
    </section>
  );
}
