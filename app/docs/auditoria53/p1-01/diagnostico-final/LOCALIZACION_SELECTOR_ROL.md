# COMPONENTE REAL · SELECTOR DE ROL

809:  return <Card><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.04em" }}>{tx("auth.roles_title")}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginTop: 8 }}>{tx("auth.pending_desc")}</p></div><span className="cp04-badge" style={{ color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{tx("auth.pending_badge")}</span></div><div className={compact ? undefined : "cp04-grid-2"} style={compact ? { display: "grid", gap: 12 } : undefined}>{ROLES.map((role) => <div key={role.id} style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 16, background: "rgba(255,255,255,.035)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong style={{ color: T.accent }}>{role.id}</strong><span style={{ color: T.warning, fontSize: ".82rem", fontWeight: 900 }}>{role.access}</span></div><div style={{ marginTop: 8, fontWeight: 900 }}>{role.label}</div><div style={{ color: T.textDim, marginTop: 6, lineHeight: 1.55 }}>{tx("auth.secciones")} {role.sections}</div>{!compact && <PanelList items={role.permissions} />}</div>)}</div></Card>;
2235:    "login.title":"Iniciar como rol","login.entrar":"Entrar","login.cancelar":"Cancelar",
2244:    "login.subtitle":"Selecciona cómo quieres entrar a la aplicación. Cada rol tendrá una experiencia orientada a sus permisos: jugador, recepción, administrador o soporte técnico.",
2437:    "login.title":"Log in as role","login.entrar":"Enter","login.cancelar":"Cancel",
2446:    "login.subtitle":"Select how you want to enter the application. Each role has an experience tailored to its permissions: player, reception, administrator or technical support.",
2639:    "login.title":"Sign in as role","login.entrar":"Sign in","login.cancelar":"Cancel",
2648:    "login.subtitle":"Select how you want to enter the app. Each role has an experience tailored to its permissions.",
2841:    "login.title":"Se connecter en tant que rôle","login.entrar":"Entrer","login.cancelar":"Annuler",
2850:    "login.subtitle":"Sélectionnez comment vous souhaitez entrer dans l'application.",
3039:    "login.title":"Accedi come ruolo","login.entrar":"Entra","login.cancelar":"Annulla",
3048:    "login.subtitle":"Seleziona come vuoi accedere all'applicazione.",
3237:    "login.title":"Entrar como função","login.entrar":"Entrar","login.cancelar":"Cancelar",
3246:    "login.subtitle":"Selecione como pretende entrar na aplicação.",
3435:    "login.title":"Entrar como perfil","login.entrar":"Entrar","login.cancelar":"Cancelar",
3444:    "login.subtitle":"Selecione como deseja entrar na aplicação.",
3633:    "login.title":"Als Rolle anmelden","login.entrar":"Eintreten","login.cancelar":"Abbrechen",
3642:    "login.subtitle":"Wählen Sie aus, wie Sie die Anwendung betreten möchten.",
7435:  const [roleError, setRoleError] = useState("");
7547:    setRoleError("");
7555:      setRoleError("Selecciona un rol válido.");
7560:      setRoleError("Contraseña incorrecta para este rol.");
7574:    setRoleError("");
7588:    setRoleError("");
7856:              {ltx("login.subtitle")}
8054:                    {ltx("login.entrar")}
8057:                    onClick={() => { setPendingRole(""); setRolePassword(""); setRoleError(""); }}
