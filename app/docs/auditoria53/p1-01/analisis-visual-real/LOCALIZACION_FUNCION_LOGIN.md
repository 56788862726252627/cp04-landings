2235:    "login.title":"Iniciar como rol","login.entrar":"Entrar","login.cancelar":"Cancelar",
2437:    "login.title":"Log in as role","login.entrar":"Enter","login.cancelar":"Cancel",
2639:    "login.title":"Sign in as role","login.entrar":"Sign in","login.cancelar":"Cancel",
2841:    "login.title":"Se connecter en tant que rôle","login.entrar":"Entrer","login.cancelar":"Annuler",
3039:    "login.title":"Accedi come ruolo","login.entrar":"Entra","login.cancelar":"Annulla",
3237:    "login.title":"Entrar como função","login.entrar":"Entrar","login.cancelar":"Cancelar",
3435:    "login.title":"Entrar como perfil","login.entrar":"Entrar","login.cancelar":"Cancelar",
3633:    "login.title":"Als Rolle anmelden","login.entrar":"Eintreten","login.cancelar":"Abbrechen",
7435:  const [roleError, setRoleError] = useState("");
7547:    setRoleError("");
7555:      setRoleError("Selecciona un rol válido.");
7560:      setRoleError("Contraseña incorrecta para este rol.");
7574:    setRoleError("");
7588:    setRoleError("");
7852:              {ltx("login.title").split(" ").slice(0,-1).join(" ")} <span style={{ color:T.accent }}>{ltx("login.title").split(" ").slice(-1)}</span>
8054:                    {ltx("login.entrar")}
8057:                    onClick={() => { setPendingRole(""); setRolePassword(""); setRoleError(""); }}
