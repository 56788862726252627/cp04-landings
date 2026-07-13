// Club Pádel 04 · AuthContext
//
// Fuente única de estado de sesión "real" (backend) para el frontend.
// No sustituye selectedRole (App.jsx sigue usándolo para navegación/menús
// de la demo), pero es la autoridad para saber si existe una sesión backend
// verificada y qué rol devuelve el proveedor de identidad.
//
// Importante: el `role` que expone este contexto es SIEMPRE el que ha
// verificado el backend (o `null` si no hay sesión real). Nunca acepta un
// rol elegido por el propio frontend. La autorización efectiva de rutas
// mutables la decide el Worker (ver worker-reservas/auth/authorization.js);
// este contexto es solo la representación de UI de esa sesión, tal y como
// exige el principio "el rol del frontend es solo representación de UI".

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as authService from "./authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initial = authService.getCurrentUser();

  const [user, setUser] = useState(initial.user);
  const [role, setRole] = useState(initial.role);
  const [accessToken, setAccessToken] = useState(() => authService.getAccessToken());
  const [loading, setLoading] = useState(true);
  const authMode = useRef(authService.getAuthMode()).current;

  const applyResult = useCallback((result) => {
    setUser(result?.user ?? null);
    setRole(result?.role ?? null);
    setAccessToken(authService.getAccessToken());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!authService.getAccessToken()) {
        if (!cancelled) setLoading(false);
        return;
      }

      const result = await authService.getSession();

      if (cancelled) return;

      applyResult(result.ok ? result : null);
      setLoading(false);
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, [applyResult]);

  const login = useCallback(
    async (email, password) => {
      const result = await authService.login(email, password);
      if (result.ok) applyResult(result);
      return result;
    },
    [applyResult]
  );

  const logout = useCallback(
    async (options) => {
      const result = await authService.logout(options);
      applyResult(null);
      return result;
    },
    [applyResult]
  );

  const refreshSession = useCallback(async () => {
    const result = await authService.refreshSession();
    if (result.ok) setAccessToken(authService.getAccessToken());
    return result;
  }, []);

  const recoverPassword = useCallback((email) => authService.forgotPassword(email), []);
  const updatePassword = useCallback((newPassword) => authService.updatePassword(newPassword), []);
  // register() no autoinicia sesión (ver authService.register): Supabase no
  // suele emitir token hasta confirmar el email, así que aquí no hay
  // resultado de auth que aplicar al contexto, solo se retransmite.
  const register = useCallback((payload) => authService.register(payload), []);

  const value = useMemo(
    () => ({
      user,
      session: { accessToken },
      role,
      clubId: user?.clubId ?? null,
      organizationId: user?.organizationId ?? null,
      loading,
      isAuthenticated: Boolean(accessToken && user),
      authMode,
      login,
      logout,
      refreshSession,
      recoverPassword,
      updatePassword,
      register,
    }),
    [user, accessToken, role, loading, authMode, login, logout, refreshSession, recoverPassword, updatePassword, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth() debe usarse dentro de <AuthProvider>.");
  }

  return ctx;
}
