// Provider AISLADO de configuración de tenant. NO se integra en App.jsx
// todavía (ver docs/agencia-ia/RUNTIME_INTEGRATION_SAFE_PLAN.md, STEP 1) —
// mientras T4 trabaje en el frontend, este archivo no se importa desde
// ningún punto de la app real. Toda la lógica no trivial vive en
// buildTenantRuntimeContextValue.js (probado con node:test); este
// componente es intencionadamente un wrapper delgado sobre esa función,
// para poder validarla sin depender de un entorno de render de React.
import { createContext, useContext, useMemo } from "react";
import { buildTenantRuntimeContextValue } from "./buildTenantRuntimeContextValue.js";

const TenantConfigContext = createContext(null);

/**
 * @param {{resolvedConfig: object, tenantStatus: {status: string}, children: React.ReactNode}} props
 */
export function TenantConfigProvider({ resolvedConfig, tenantStatus, children }) {
  const value = useMemo(
    () => buildTenantRuntimeContextValue({ resolvedConfig, tenantStatus }),
    [resolvedConfig, tenantStatus]
  );

  return <TenantConfigContext.Provider value={value}>{children}</TenantConfigContext.Provider>;
}

/**
 * @returns {object} El mismo valor construido por buildTenantRuntimeContextValue().
 */
// eslint-disable-next-line react-refresh/only-export-components -- patrón context+hook deliberado, no un componente adicional
export function useTenantConfig() {
  const value = useContext(TenantConfigContext);
  if (value === null) {
    throw new Error("useTenantConfig debe usarse dentro de <TenantConfigProvider>");
  }
  return value;
}
