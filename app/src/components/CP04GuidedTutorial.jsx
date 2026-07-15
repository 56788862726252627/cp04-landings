import { useEffect, useRef, useState } from "react";

/**
 * CP04GuidedTutorial — Tutorial guiado por rol para Club Pádel 04
 * Overlay premium · Spotlight SVG · Cursor animado · Navegación entre módulos
 * Props:
 *   selectedRole   — "PLAYER" | "STAFF" | "ADMIN" | "SUPPORT"
 *   onNavigate     — (section: string) => void
 *   openRevision   — number; incrementar para forzar apertura (Ver tutorial rápido)
 */

const TC = {
  accent:      "#b6ff00",
  text:        "#F8FFF5",
  textSec:     "#D7FBE8",
  textAux:     "#BFD7D0",
  textDis:     "#8FA7A0",
  surface:     "rgba(6,11,20,0.98)",
  border:      "rgba(182,255,0,0.30)",
  fontDisplay: "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
};

/* ── Pasos por rol ───────────────────────────────────────────── */
const TOUR_STEPS = {
  PLAYER: [
    {
      section: "inicio",
      target: "[data-tour='sidebar-inicio']",
      title: "Bienvenido al club",
      body: "Esta es la pantalla de inicio. Verás el estado del club, reservas recientes y accesos rápidos a todas las funciones.",
    },
    {
      section: "reservas",
      target: "[data-tour='sidebar-reservas']",
      title: "Reserva tu pista",
      body: "Solicita una pista en segundos: elige fecha, hora, duración y modalidad. El sistema valida disponibilidad al instante.",
    },
    {
      section: "torneos",
      target: "[data-tour='sidebar-torneos']",
      title: "Torneos del club",
      body: "Consulta torneos activos, inscripciones y resultados. Compite con los mejores jugadores del club.",
    },
    {
      section: "ranking",
      target: "[data-tour='sidebar-ranking']",
      title: "Tu posición en el ranking",
      body: "La clasificación oficial de parejas del club. ELO actualizado con cada partido jugado.",
    },
    {
      section: "perfil",
      target: "[data-tour='sidebar-perfil']",
      title: "Tu perfil deportivo",
      body: "Completa tu perfil: bio, nivel, posición y preferencias. Puedes relanzar este tutorial desde aquí cuando quieras.",
    },
  ],
  STAFF: [
    {
      section: "inicio",
      target: "[data-tour='sidebar-inicio']",
      title: "Bienvenido, equipo de recepción",
      body: "Este es tu panel de inicio como staff. Verás un resumen del día: reservas activas y avisos del club.",
    },
    {
      section: "reservas",
      target: "[data-tour='sidebar-reservas']",
      title: "Reservas del club",
      body: "Consulta todas las reservas del club en un único listado. Útil para resolver dudas de jugadores en el mostrador.",
    },
    {
      section: "alta_jugador",
      target: "[data-tour='sidebar-alta_jugador']",
      title: "Alta de jugadores",
      body: "Registra nuevos jugadores directamente desde recepción. Proceso guiado, rápido y validado.",
    },
    {
      section: "reprogramar",
      target: "[data-tour='sidebar-reprogramar']",
      title: "Reprogramar reservas",
      body: "¿Un jugador pide cambio de hora? Gestiona el cambio aquí sin llamadas innecesarias.",
    },
    {
      section: "cancelar",
      target: "[data-tour='sidebar-cancelar']",
      title: "Cancelar reservas",
      body: "Cancela una reserva con confirmación del jugador. El sistema notificará automáticamente.",
    },
    {
      section: "gestion",
      target: "[data-tour='sidebar-gestion']",
      title: "Gestión de reservas",
      body: "Panel central del staff. Todas las reservas activas del día con acciones directas desde recepción.",
    },
    {
      section: "torneos",
      target: "[data-tour='sidebar-torneos']",
      title: "Torneos activos",
      body: "Consulta el estado de los torneos para responder preguntas de los jugadores desde recepción.",
    },
    {
      section: "perfil",
      target: "[data-tour='sidebar-perfil']",
      title: "Tu perfil de staff",
      body: "Ajusta tus datos y preferencias de acceso. Puedes relanzar este tutorial cuando lo necesites.",
    },
  ],
  ADMIN: [
    {
      section: "inicio",
      target: "[data-tour='sidebar-inicio']",
      title: "Inicio · Visión general",
      body: "Panel de bienvenida con el pulso del club: actividad reciente y accesos rápidos antes de entrar en el detalle de cada módulo.",
    },
    {
      section: "reservas",
      target: "[data-tour='sidebar-reservas']",
      title: "Reservas del club",
      body: "Vista completa de todas las reservas. Ideal para auditorías y control de disponibilidad.",
    },
    {
      section: "alta_jugador",
      target: "[data-tour='sidebar-alta_jugador']",
      title: "Alta de jugadores",
      body: "Da de alta nuevos jugadores desde administración, igual que lo haría recepción, con control total del proceso.",
    },
    {
      section: "reprogramar",
      target: "[data-tour='sidebar-reprogramar']",
      title: "Reprogramar reservas",
      body: "Cambia fecha, hora o pista de cualquier reserva del club con supervisión completa desde administración.",
    },
    {
      section: "cancelar",
      target: "[data-tour='sidebar-cancelar']",
      title: "Cancelar reservas",
      body: "Cancela cualquier reserva del club, incluidas las gestionadas por el staff, con trazabilidad total.",
    },
    {
      section: "gestion",
      target: "[data-tour='sidebar-gestion']",
      title: "Gestión operativa",
      body: "Herramientas del staff con visión total del administrador. Acceso completo de supervisión.",
    },
    {
      section: "torneos",
      target: "[data-tour='sidebar-torneos']",
      title: "Torneos y competición",
      body: "Gestiona y configura torneos. Histórico de fases, resultados e inscripciones incluidos.",
    },
    {
      section: "ranking",
      target: "[data-tour='sidebar-ranking']",
      title: "Ranking del club",
      body: "Clasificación oficial para comunicación externa y motivación de jugadores.",
    },
    {
      section: "admin",
      target: "[data-tour='sidebar-admin']",
      title: "Panel de administración",
      body: "Vista ejecutiva del club: métricas, ocupación, ingresos y estado operativo en tiempo real.",
    },
    {
      section: "perfil",
      target: "[data-tour='sidebar-perfil']",
      title: "Tu perfil de administración",
      body: "Gestiona tus datos de acceso y preferencias. Puedes relanzar este tutorial cuando lo necesites.",
    },
  ],
  SUPPORT: [
    {
      section: "inicio",
      target: "[data-tour='sidebar-inicio']",
      title: "Inicio · Vista técnica",
      body: "Resumen general del club desde el que puedes saltar rápido a cualquier módulo técnico u operativo.",
    },
    {
      section: "reservas",
      target: "[data-tour='sidebar-reservas']",
      title: "Reservas (diagnóstico)",
      body: "Verifica que el sistema de booking funciona correctamente y audita el estado de las reservas.",
    },
    {
      section: "alta_jugador",
      target: "[data-tour='sidebar-alta_jugador']",
      title: "Alta de jugadores (verificación)",
      body: "Revisa el flujo de alta de jugadores para confirmar que el registro funciona sin errores.",
    },
    {
      section: "reprogramar",
      target: "[data-tour='sidebar-reprogramar']",
      title: "Reprogramar (verificación)",
      body: "Comprueba que el cambio de fecha, hora o pista de una reserva se procesa correctamente.",
    },
    {
      section: "cancelar",
      target: "[data-tour='sidebar-cancelar']",
      title: "Cancelar (verificación)",
      body: "Verifica que las cancelaciones se procesan y notifican correctamente al jugador.",
    },
    {
      section: "gestion",
      target: "[data-tour='sidebar-gestion']",
      title: "Gestión operativa (diagnóstico)",
      body: "Supervisa el panel de gestión diaria del staff para detectar incidencias operativas.",
    },
    {
      section: "torneos",
      target: "[data-tour='sidebar-torneos']",
      title: "Torneos (verificación)",
      body: "Confirma que el módulo de torneos carga correctamente inscripciones y resultados.",
    },
    {
      section: "ranking",
      target: "[data-tour='sidebar-ranking']",
      title: "Ranking (verificación)",
      body: "Revisa que la clasificación del club se calcula y se muestra correctamente.",
    },
    {
      section: "admin",
      target: "[data-tour='sidebar-admin']",
      title: "Panel admin (supervisión)",
      body: "Acceso de revisión al panel de administración. Útil para diagnóstico de incidencias activas.",
    },
    {
      section: "flujos_make",
      target: "[data-tour='sidebar-flujos_make']",
      title: "Centro técnico",
      body: "Configuración de automatizaciones, webhooks y flujos internos. Zona de diagnóstico técnico.",
    },
    {
      section: "soporte",
      target: "[data-tour='sidebar-soporte']",
      title: "Panel de soporte técnico",
      body: "Vista técnica del sistema: estado de servicios, logs de actividad e integraciones activas.",
    },
    {
      section: "perfil",
      target: "[data-tour='sidebar-perfil']",
      title: "Perfil técnico",
      body: "Ajusta tus credenciales y preferencias de acceso. El tutorial puede relanzarse desde aquí.",
    },
  ],
};

const storageKey = (role) => `cp04_tutorial_seen_${role}`;

/* ── Cálculo seguro de posición del tooltip ──────────────────── */
function calcTooltipPos(targetRect) {
  const TIP_W_BASE = 360;
  const TIP_H     = 260;
  const GAP        = 18;
  const MARGIN     = 16;
  const VW = window.innerWidth;
  const VH = window.innerHeight;

  // Ancho responsive
  const TIP_W = Math.min(TIP_W_BASE, VW - MARGIN * 2);

  if (!targetRect) {
    return {
      x: Math.max(MARGIN, (VW - TIP_W) / 2),
      y: Math.max(MARGIN, (VH - TIP_H) / 2),
      w: TIP_W,
    };
  }

  const { x: tx, y: ty, w: tw, h: th } = targetRect;
  const rightX  = tx + tw + GAP;
  const belowY  = ty + th + GAP;
  const aboveY  = ty - TIP_H - GAP;
  const clampX  = (v) => Math.max(MARGIN, Math.min(v, VW - TIP_W - MARGIN));
  const clampY  = (v) => Math.max(MARGIN, Math.min(v, VH - TIP_H - MARGIN));

  // 1. Derecha del target (ideal para sidebar en desktop)
  if (rightX + TIP_W <= VW - MARGIN) {
    return { x: rightX, y: clampY(ty), w: TIP_W };
  }

  // 2. Debajo del target
  if (belowY + TIP_H <= VH - MARGIN) {
    return { x: clampX(tx), y: belowY, w: TIP_W };
  }

  // 3. Encima del target
  if (aboveY >= MARGIN) {
    return { x: clampX(tx), y: aboveY, w: TIP_W };
  }

  // 4. Centrado en pantalla (fallback)
  return {
    x: Math.max(MARGIN, (VW - TIP_W) / 2),
    y: Math.max(MARGIN, (VH - TIP_H) / 2),
    w: TIP_W,
  };
}

/* ── Componente ──────────────────────────────────────────────── */
const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 980px)").matches;

export default function CP04GuidedTutorial({ selectedRole, onNavigate, openRevision, onSetMobileMenuOpen }) {
  const steps = TOUR_STEPS[selectedRole] || [];
  const [step, setStep]           = useState(0);
  const [visible, setVisible]     = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: -300, y: -300 });
  const [tipPos, setTipPos]       = useState({ x: 24, y: 24, w: 360 });
  const lastRevision               = useRef(0);
  const timerRef                   = useRef(null);
  const dialogRef                  = useRef(null);

  /* Auto-show primera vez por rol */
  useEffect(() => {
    if (!selectedRole || steps.length === 0) return;
    try {
      if (!localStorage.getItem(storageKey(selectedRole))) {
        const t = setTimeout(() => { setStep(0); setVisible(true); }, 950);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [selectedRole]); // eslint-disable-line

  /* Forzar apertura desde "Ver tutorial rápido" */
  useEffect(() => {
    if (!openRevision || openRevision === lastRevision.current) return;
    lastRevision.current = openRevision;
    setStep(0);
    setVisible(true);
  }, [openRevision]);

  /* Recalcular al redimensionar */
  useEffect(() => {
    if (!visible) return;
    function onResize() {
      if (targetRect) setTipPos(calcTooltipPos(targetRect));
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [visible, targetRect]);

  /* Navegar + localizar target */
  useEffect(() => {
    if (!visible) return;
    const s = steps[step];
    if (!s) return;
    onNavigate(s.section);
    if (onSetMobileMenuOpen && isMobileViewport()) {
      onSetMobileMenuOpen(true);
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = document.querySelector(s.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const r = el.getBoundingClientRect();
        const rect = { x: r.left, y: r.top, w: r.width, h: r.height };
        setTargetRect(rect);
        setTipPos(calcTooltipPos(rect));
        /* Cursor: justo al borde derecho, centro vertical del target */
        const VW = window.innerWidth;
        const cx = Math.min(r.left + r.width - 8, VW - 32);
        const cy = r.top + r.height / 2 - 14;
        setCursorPos({ x: Math.max(4, cx), y: Math.max(4, cy) });
      } else {
        setTargetRect(null);
        const pos = calcTooltipPos(null);
        setTipPos(pos);
        setCursorPos({ x: window.innerWidth / 2 - 14, y: window.innerHeight / 2 - 14 });
      }
    }, 440);

    return () => clearTimeout(timerRef.current);
  }, [step, visible]); // eslint-disable-line

  /* Foco atrapado dentro del diálogo + Escape para cerrar: sin esto, Tab
     puede escapar del tour hacia elementos ocultos detrás del overlay. */
  useEffect(() => {
    if (!visible) return;
    const focusableSelector = 'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const raf = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector(focusableSelector);
      first?.focus();
    });

    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll(focusableSelector));
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step]);

  function close(markSeen) {
    if (markSeen) {
      try { localStorage.setItem(storageKey(selectedRole), "1"); } catch {}
    }
    setVisible(false);
    setTargetRect(null);
    setCursorPos({ x: -300, y: -300 });
    if (onSetMobileMenuOpen && isMobileViewport()) {
      onSetMobileMenuOpen(false);
    }
  }

  if (!visible || steps.length === 0) return null;
  const s = steps[step];
  if (!s) return null;

  const isFirst = step === 0;
  const isLast  = step === steps.length - 1;

  /* ── Estilos de botones ──────────────────────────────────── */
  const btnBase = {
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    minHeight: 44,
    fontFamily: TC.fontBody,
    fontWeight: 700,
    fontSize: ".88rem",
    cursor: "pointer",
    lineHeight: 1.2,
  };
  const btnPrimary = {
    ...btnBase,
    background: `linear-gradient(135deg, #B6FF00, #9FE600)`,
    color: "#0B1208",
    fontWeight: 900,
    boxShadow: "0 4px 18px rgba(182,255,0,.30)",
  };
  const btnSecondary = {
    ...btnBase,
    background: "rgba(248,255,245,.10)",
    color: TC.text,
    border: "1px solid rgba(248,255,245,.22)",
  };
  const btnGhostSkip = {
    ...btnBase,
    background: "transparent",
    color: TC.textSec,
    padding: "10px 14px",
    fontSize: ".84rem",
    border: "1px solid rgba(215,251,232,.18)",
  };
  const btnGhostDismiss = {
    ...btnBase,
    background: "transparent",
    color: TC.textAux,
    padding: "10px 14px",
    fontSize: ".82rem",
    border: "1px solid rgba(191,215,208,.15)",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  };

  return (
    <>
      <style>{`
        @keyframes cp04tour-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(182,255,0,.50), 0 0 0 3px rgba(182,255,0,.18); }
          55%      { box-shadow: 0 0 0 9px rgba(182,255,0,0),  0 0 0 3px rgba(182,255,0,.32); }
        }
        @keyframes cp04tour-cursor {
          0%,100% { transform: translateY(0) rotate(-8deg); }
          50%      { transform: translateY(-5px) rotate(-8deg); }
        }
        @keyframes cp04tour-fadein {
          from { opacity: 0; transform: scale(.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)  translateY(0);    }
        }
        .cp04-tour-tip    { animation: cp04tour-fadein .24s cubic-bezier(.4,0,.2,1) both; }
        .cp04-tour-cursor { animation: cp04tour-cursor 1.6s ease-in-out infinite; }
        .cp04-tour-ring   { animation: cp04tour-pulse  2s  ease-in-out infinite; }
        .cp04-tour-btn:hover:not(:disabled) { filter: brightness(1.10); }
        .cp04-tour-btn:disabled { opacity: .55; cursor: not-allowed; filter: none; }
      `}</style>

      {/* ── Overlay con spotlight SVG ── */}
      <svg
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0,
          width: "100vw", height: "100vh",
          zIndex: 9989, pointerEvents: "all",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <defs>
          <mask id="cp04-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.x - 9}
                y={targetRect.y - 9}
                width={targetRect.w + 18}
                height={targetRect.h + 18}
                rx="15"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Opacidad reducida a .68 para que la app siga intuyéndose */}
        <rect
          width="100%" height="100%"
          fill="rgba(3,7,15,0.68)"
          mask="url(#cp04-tour-mask)"
        />
      </svg>

      {/* ── Anillo spotlight sobre el target ── */}
      {targetRect && (
        <div
          className="cp04-tour-ring"
          style={{
            position: "fixed",
            zIndex: 9990,
            left:   targetRect.x - 9,
            top:    targetRect.y - 9,
            width:  targetRect.w + 18,
            height: targetRect.h + 18,
            borderRadius: 15,
            border: `2px solid ${TC.accent}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Cursor visual animado ── */}
      <div
        className="cp04-tour-cursor"
        style={{
          position: "fixed",
          zIndex: 9993,
          left: cursorPos.x,
          top:  cursorPos.y,
          pointerEvents: "none",
          transition: "left .50s cubic-bezier(.4,0,.2,1), top .50s cubic-bezier(.4,0,.2,1)",
          width: 26, height: 26,
          /* queda siempre visible en pantalla */
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.5 3l14.8 9.2-7.6 1.4-3.8 7z"
            fill="#b6ff00"
            stroke="#071200"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── Tarjeta tooltip ── */}
      <div
        key={`tour-tip-${step}`}
        ref={dialogRef}
        className="cp04-tour-tip"
        role="dialog"
        aria-modal="true"
        aria-label={`Tutorial paso ${step + 1} de ${steps.length}: ${s.title}`}
        style={{
          position: "fixed",
          zIndex: 9992,
          left: tipPos.x,
          top:  tipPos.y,
          width: tipPos.w,
          /* responsive max-width */
          maxWidth: "min(360px, calc(100vw - 32px))",
          background: TC.surface,
          border: `1.5px solid ${TC.border}`,
          borderRadius: 22,
          padding: "24px 26px 20px",
          boxShadow: "0 30px 80px rgba(0,0,0,.72), 0 0 0 1px rgba(182,255,0,.08)",
          color: TC.text,
          fontFamily: TC.fontBody,
        }}
      >
        {/* Cabecera: rol + contador */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{
            background: "rgba(182,255,0,.14)",
            border: "1px solid rgba(182,255,0,.30)",
            borderRadius: 7,
            padding: "3px 9px",
            color: TC.accent,
            fontSize: ".70rem",
            fontWeight: 900,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>
            {selectedRole}
          </span>
          <span style={{ color: TC.textSec, fontSize: ".76rem", marginLeft: "auto", fontWeight: 700 }}>
            {step + 1} / {steps.length}
          </span>
        </div>

        {/* Título */}
        <strong style={{
          display: "block",
          fontSize: "1.06rem",
          fontFamily: TC.fontDisplay,
          fontWeight: 900,
          color: TC.text,
          marginBottom: 9,
          lineHeight: 1.28,
        }}>
          {s.title}
        </strong>

        {/* Cuerpo */}
        <p style={{
          color: TC.textSec,
          fontSize: ".89rem",
          lineHeight: 1.68,
          margin: "0 0 16px",
        }}>
          {s.body}
        </p>

        {/* Barra de progreso */}
        <div style={{ display: "flex", gap: 5, marginBottom: 18, alignItems: "center" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width:      i === step ? 24 : 6,
              height:     6,
              borderRadius: 999,
              background: i === step ? TC.accent : "rgba(191,215,208,.25)",
              transition: "all .30s cubic-bezier(.4,0,.2,1)",
              flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Botones de navegación */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {!isFirst && (
            <button
              className="cp04-tour-btn"
              onClick={() => setStep((v) => v - 1)}
              style={btnSecondary}
              aria-label="Paso anterior"
            >
              Atrás
            </button>
          )}
          <button
            className="cp04-tour-btn"
            onClick={() => { if (isLast) close(true); else setStep((v) => v + 1); }}
            style={btnPrimary}
            aria-label={isLast ? "Finalizar tutorial" : "Paso siguiente"}
          >
            {isLast ? "Finalizar" : "Siguiente"}
          </button>

          {/* Separador flex */}
          <div style={{ flex: 1, minWidth: 4 }} />

          <button
            className="cp04-tour-btn"
            onClick={() => close(false)}
            style={btnGhostSkip}
            aria-label="Saltar tutorial"
          >
            Saltar
          </button>
          <button
            className="cp04-tour-btn"
            onClick={() => close(true)}
            style={btnGhostDismiss}
            aria-label="No volver a mostrar el tutorial"
          >
            No mostrar más
          </button>
        </div>
      </div>
    </>
  );
}
