import { demoSafeDataset } from "../../data/demoSafeDataset";
import "../../styles/demo-safe.css";

export function DemoSafeBanner() {
  return (
    <div className="cp04-demo-safe-banner" role="status" aria-label="Entorno seguro">
      <strong>Entorno seguro</strong>
      <span>{demoSafeDataset.warning}</span>
    </div>
  );
}

export function DemoSafeBadge({ children = "Entorno seguro" }) {
  return <span className="cp04-demo-safe-badge">{children}</span>;
}

export function DemoActionNotice({ children }) {
  return (
    <div className="cp04-demo-action-notice" role="note">
      {children || "Acción demo simulada. No se han modificado datos reales."}
    </div>
  );
}

export function DemoSafePanel() {
  const { club, metrics } = demoSafeDataset;

  return (
    <section className="cp04-demo-safe-panel" aria-label="Resumen entorno seguro">
      <div>
        <p className="cp04-demo-safe-kicker">Entorno comercial protegido</p>
        <h2>{club.name}</h2>
        <p>
          Datos ficticios preparados para enseñar reservas, administración,
          torneos, ranking y métricas sin tocar producción real.
        </p>
      </div>

      <div className="cp04-demo-safe-grid">
        <article>
          <strong>{metrics.weeklyOccupancy}</strong>
          <span>Ocupación demo</span>
        </article>
        <article>
          <strong>{metrics.weeklyReservations}</strong>
          <span>Reservas demo</span>
        </article>
        <article>
          <strong>{metrics.activeDemoPlayers}</strong>
          <span>Jugadores demo</span>
        </article>
        <article>
          <strong>{metrics.estimatedRevenue}</strong>
          <span>Ingresos simulados</span>
        </article>
      </div>
    </section>
  );
}

export function getDemoActionMessage(actionType = "general") {
  const messages = {
    reserva: "Reserva simulada correctamente. No se ha creado ninguna reserva real.",
    cancelacion: "Cancelación demo registrada. No se ha cancelado ninguna reserva real.",
    reprogramacion: "Reprogramación demo registrada. No se ha modificado ninguna reserva real.",
    pago: "Pago desactivado en demo. No se ha realizado ningún cargo.",
    whatsapp: "WhatsApp Business desactivado en demo. No se ha enviado ningún mensaje real.",
    email: "Email demo simulado. No se ha enviado ningún correo real salvo configuración controlada.",
    admin: "Panel administrador demo con datos ficticios. No muestra datos reales de ningún club.",
    soporte: "Estado del sistema simulado. No se muestran herramientas internas ni tokens.",
    general: "Acción demo simulada. No se han modificado datos reales.",
  };

  return messages[actionType] || messages.general;
}
