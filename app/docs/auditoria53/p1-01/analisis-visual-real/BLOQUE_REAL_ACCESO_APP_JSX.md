# BLOQUE REAL DE ACCESO Y SELECCIÓN DE ROL

## App.jsx · líneas 7400–7650

```jsx
                </div>
              );
            })}
          </div>
          {privMsg && <div style={{ color:T.accent, fontWeight:700, fontSize:".82rem", marginTop:12 }}>{privMsg}</div>}
          <p style={{ color:T.textDim, fontSize:".76rem", lineHeight:1.6, marginTop:16, borderTop:`1px solid ${T.line}`, paddingTop:12 }}>
            {tx("perfil.info_demo")} En producción real se aplicará política de privacidad completa conforme al RGPD / normativa aplicable.
          </p>
        </div>
      </div>

      {/* ── NOTIFICACIONES ── */}
      <div style={cs}>
        <h3 style={{ ...hs, marginBottom:10 }}>🔔 {tx("perfil.notificaciones")}</h3>
        <p style={{ color:T.textDim, lineHeight:1.6, marginBottom:14 }}>{tx("perfil.notif_desc")}</p>
        <div style={{ padding:"12px 16px", border:`1px dashed ${T.line}`, borderRadius:14, color:T.textDim, fontSize:".84rem", lineHeight:1.7 }}>
          Confirmaciones de reserva &nbsp;·&nbsp; recordatorios de partido &nbsp;·&nbsp; torneos &nbsp;·&nbsp; cambios de horario
          <div style={{ marginTop:6, fontSize:".75rem", color:T.textDim }}>
            Preparado para integración con correo y mensajería desde backend real.
          </div>
        </div>
      </div>

    </div>
  );
}


export default function ClubPadel04SaaSApp() {
  const [current, setCurrent] = useState("inicio");
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem("cp04_role") || "");
  const [pendingRole, setPendingRole] = useState("");
  const [rolePassword, setRolePassword] = useState("");
  const [showRolePassword, setShowRolePassword] = useState(false);
  const [rememberRole, setRememberRole] = useState(true);
  const [roleError, setRoleError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutorialRevision, setTutorialRevision] = useState(0);
  const [forgotPwdStep, setForgotPwdStep] = useState("idle");
  const [forgotPwdEmail, setForgotPwdEmail] = useState("");
  const [forgotPwdEmailError, setForgotPwdEmailError] = useState("");

  // Login universal preparado para producción.
  // Mantiene los perfiles demo internos sin obligar a usuarios reales a usar correos fijos.
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerOpen, setRegisterOpen] = useState(() => localStorage.getItem("cp04_register_open") === "true");
  const [registerName, setRegisterName] = useState(() => localStorage.getItem("cp04_register_name") || "");
  const [registerEmail, setRegisterEmail] = useState(() => localStorage.getItem("cp04_register_email") || "");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerDone, setRegisterDone] = useState(() => localStorage.getItem("cp04_register_done") === "true");

  // AUDITORIA 24 · restaurar sesión Supabase real al recargar la app
  useEffect(() => {
    let cancelled = false;

    async function restoreSupabaseSession() {
      const token = localStorage.getItem("cp04_access_token");

      if (!token) {
        return;
      }

      try {
        const res = await fetch(PROFILE_BACKEND_ENDPOINTS.me, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          localStorage.removeItem("cp04_access_token");
          localStorage.removeItem("cp04_refresh_token");
          localStorage.removeItem("cp04_auth_mode");
          return;
        }

        const user = data.user || {};
        const restoredRole = cp04NormalizeRole(data.role || user.role || localStorage.getItem("cp04_role") || "PLAYER");

        localStorage.setItem("cp04_auth_mode", "supabase_real");
        localStorage.setItem("cp04_user", JSON.stringify(user));
        localStorage.setItem("cp04_role", restoredRole);

        if (user.email) {
          localStorage.setItem("cp04_user_email", user.email);
        }

        if (!cancelled) {
          setSelectedRole(restoredRole);
          setLoginError("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoginError("");
        }
      }
    }

    restoreSupabaseSession();

    return () => {
      cancelled = true;
    };
  }, []);
  const menuButtonRef = useRef(null);
  const modules = { inicio: <Inicio setCurrent={setCurrent} />, reservas: <Reservas />, alta_jugador: <AltaJugador />, reprogramar: <ReprogramarReserva setCurrent={setCurrent} />, cancelar: <CancelarReserva setCurrent={setCurrent} />, gestion: <Gestion />, torneos: <Torneos />, ranking: <Ranking />, admin: <Admin />, flujos_make: <FlujosMake />, soporte: <Soporte />, perfil: <Perfil selectedRole={selectedRole} onClearRole={clearRole} onOpenTutorial={() => setTutorialRevision((v) => v + 1)} /> };

  const roleConfig = {
    PLAYER: {
      label: "Jugador / cliente",
      desc: "Reservar pistas, consultar reservas y ranking.",
      start: "inicio",
      password: "jugador04",
    },
    STAFF: {
      label: "Staff / recepción",
      desc: "Gestión diaria de reservas, altas y atención al jugador.",
      start: "gestion",
      password: "staff04",
    },
    ADMIN: {
      label: "Administrador / jefe",
      desc: "Panel de dirección, métricas y control operativo.",
      start: "admin",
      password: "admin04",
    },
    SUPPORT: {
      label: "Soporte técnico",
      desc: "Zona técnica, integraciones y diagnóstico interno.",
      start: "soporte",
      password: "soporte04",
    },
  };

  function selectRole(roleId) {
    setPendingRole(roleId);
    setRolePassword("");
    setShowRolePassword(false);
    setRoleError("");
  }

  function confirmRoleAccess(event) {
    event.preventDefault();

    const role = roleConfig[pendingRole];
    if (!role) {
      setRoleError("Selecciona un rol válido.");
      return;
    }

    if (rolePassword.trim() !== role.password) {
      setRoleError("Contraseña incorrecta para este rol.");
      return;
    }

    if (rememberRole) {
      localStorage.setItem("cp04_role", pendingRole);
    } else {
      localStorage.removeItem("cp04_role");
    }
    setSelectedRole(pendingRole);
    setCurrent(role.start || "inicio");
    setPendingRole("");
    setRolePassword("");
    setShowRolePassword(false);
    setRoleError("");
  }

  function clearRole() {
    localStorage.removeItem("cp04_role");
    localStorage.removeItem("cp04_access_token");
    localStorage.removeItem("cp04_refresh_token");
    localStorage.removeItem("cp04_auth_mode");
    localStorage.removeItem("cp04_user");
    localStorage.removeItem("cp04_user_email");

    setSelectedRole("");
    setPendingRole("");
    setRolePassword("");
    setRoleError("");
    setShowRolePassword(false);
    setLoginEmail("");
    setLoginPassword("");
    setShowLoginPassword(false);
    setLoginError("");
    setMobileMenuOpen(false);
  }


  function inferRoleFromEmail(email) {
    const clean = String(email || "").trim().toLowerCase();

    // Accesos internos de prueba para el propietario/equipo.
    if (clean.includes("soporte")) return "SUPPORT";
    if (clean.includes("admin") || clean.includes("jefe")) return "ADMIN";
    if (clean.includes("staff") || clean.includes("empleado") || clean.includes("recepcion")) return "STAFF";

    // Por defecto, cualquier usuario real entra como jugador/cliente hasta que el backend asigne rol.
    return "PLAYER";
  }

  async function handleUniversalLogin(event) {
    event.preventDefault();

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setLoginError("Introduce un correo electrónico válido.");
      return;
    }

    if (cleanPassword.length < 4) {
      setLoginError("Introduce una contraseña válida.");
      return;
    }

    try {
      setLoginError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setLoginError(data?.message || "No se pudo iniciar sesión.");
        return;
      }

      const user = data.user || data.profile || null;
      const accessToken =
        data.access_token ||
        data.token ||
        data.session?.access_token ||
        data.session?.token ||
        "";

      const refreshToken =
```
