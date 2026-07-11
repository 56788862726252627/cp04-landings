// Pantalla de bloqueo para los 3 estados de tenant que NO deben mostrar la
// app normal (disabled/maintenance/unknown_domain). "active"/"staging"
// renderizan children sin más — ver docs/agencia-ia/DOMAIN_TENANT_RESOLUTION.md
// para los 5 estados posibles. Wrapper delgado sobre resolveTenantStatusScreen.js
// (toda la lógica no trivial vive ahí, probada con node:test — mismo patrón
// que TenantConfigProvider.jsx/buildTenantRuntimeContextValue.js). Sin
// depender de App.jsx/theme.js: debe poder renderizarse incluso si algo más
// abajo en el árbol fallara.
import { resolveTenantStatusScreen } from "./resolveTenantStatusScreen.js";

/**
 * @param {{tenantStatus: {status: string}, children: React.ReactNode}} props
 */
export function TenantStatusGate({ tenantStatus, children }) {
  const screen = resolveTenantStatusScreen(tenantStatus);
  if (!screen) return children;

  return (
    <main
      role="alert"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "42px 24px",
        background: "#05080d",
        color: "#ffffff",
        fontFamily: "'DM Sans', sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", marginBottom: 12 }}>{screen.title}</h1>
        <p style={{ color: "#9aa8bd", lineHeight: 1.6 }}>{screen.message}</p>
      </div>
    </main>
  );
}
