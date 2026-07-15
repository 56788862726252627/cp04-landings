# DIAGNÓSTICO TÉCNICO PRECISO · P1-01

Generado: Sat Jul  4 11:04:41 CEST 2026

## A. Referencias directas a Antequera y Torcal
```text
src/App.jsx:8:import './torcal-role-background.css';
src/data/visualAssets.js:2:  home: "/optimized/images/torcal-padel-bg.webp",
src/data/cp04DemoData.js:3:    nombre: "Club Pádel 04 Antequera",
src/data/cp04DemoData.js:4:    ubicacion: "Antequera, Málaga",
src/torcal-role-background.css:25:    url('/images/torcal-padel-bg.png');
src/torcal-role-background.css:57:/* Ajuste visual final: máxima visibilidad del fondo Torcal */
src/torcal-role-background.css:88:   LOGIN PREMIUM · TORCAL BACKGROUND MAX VISIBILITY
src/torcal-role-background.css:103:    url('/images/torcal-padel-bg.png') !important;
src/torcal-role-background.css:175:/* LOGIN VISUAL FINAL · Fondo Torcal mucho más visible */
src/torcal-role-background.css:186:    url('/images/torcal-padel-bg.png') !important;
src/torcal-role-background.css:239:/* Este archivo se carga sobre la pantalla Torcal/roles, por eso el override va aquí.
src/torcal-role-background.css:329:/* AUDITORIA 29 · Refuerzo Torcal: Perfil con texto blanco */
src/torcal-role-background.css:341:/* AUDITORIA 29 · Refuerzo Torcal: Idioma / Español verde neón */
src/role-background-detector.js:8:const bgImage = "linear-gradient(180deg, rgba(2,6,23,0.00) 0%, rgba(2,6,23,0.03) 45%, rgba(2,6,23,0.12) 100%), url(\'/images/torcal-padel-bg.png\')";
```

## B. Referencias a fondos e imágenes
```text
src/App.css:20:.hero {
src/App.jsx:17:    background-size: cover !important;
src/App.jsx:29:    object-fit: cover !important;
src/App.jsx:178:  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 56px 56px; mask-image: linear-gradient(to bottom, rgba(0,0,0,.6), transparent 72%); }
src/App.jsx:209:  .cp04-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
src/App.jsx:233:  object-fit: cover;
src/App.jsx:2264:    "home.club_operativo":"Club de pádel","home.hero_accent":"operativo",
src/App.jsx:2265:    "home.hero_subtitle":"SaaS separado por roles: jugador, recepción, administración y soporte.",
src/App.jsx:2444:    "login.olvide_pwd":"Forgot your password?","login.recuperar_title":"Recover access","login.recuperar_desc":"Enter your email address and, if the account exists, you will receive instructions to reset your access.","login.recuperar_email":"Email address","login.recuperar_btn":"Send instructions","login.recuperar_enviado":"If that address is registered in the system, you will receive instructions shortly. Also check your spam folder.","login.recuperar_volver":"Back to login","login.recuperar_preparado":"Ready for endpoint: /api/auth/forgot-password",
src/App.jsx:2466:    "home.club_operativo":"Padel club","home.hero_accent":"operational",
src/App.jsx:2467:    "home.hero_subtitle":"SaaS by roles: player, reception, administration and support.",
src/App.jsx:2646:    "login.olvide_pwd":"Forgot your password?","login.recuperar_title":"Recover access","login.recuperar_desc":"Enter your email address and, if the account exists, you will receive instructions to reset your access.","login.recuperar_email":"Email address","login.recuperar_btn":"Send instructions","login.recuperar_enviado":"If that address is registered in the system, you will receive instructions shortly. Also check your spam folder.","login.recuperar_volver":"Back to login","login.recuperar_preparado":"Ready for endpoint: /api/auth/forgot-password",
src/App.jsx:2668:    "home.club_operativo":"Padel club","home.hero_accent":"operational",
src/App.jsx:2669:    "home.hero_subtitle":"SaaS by roles: player, front desk, administration and support.",
src/App.jsx:2870:    "home.club_operativo":"Club de padel","home.hero_accent":"opérationnel",
src/App.jsx:2871:    "home.hero_subtitle":"SaaS par rôles: joueur, accueil, administration et support.",
src/App.jsx:3068:    "home.club_operativo":"Club di padel","home.hero_accent":"operativo",
src/App.jsx:3069:    "home.hero_subtitle":"SaaS per ruoli: giocatore, reception, amministrazione e supporto.",
src/App.jsx:3266:    "home.club_operativo":"Clube de padel","home.hero_accent":"operacional",
src/App.jsx:3267:    "home.hero_subtitle":"SaaS por funções: jogador, receção, administração e suporte.",
src/App.jsx:3464:    "home.club_operativo":"Clube de padel","home.hero_accent":"operacional",
src/App.jsx:3465:    "home.hero_subtitle":"SaaS por perfis: jogador, recepção, administração e suporte.",
src/App.jsx:3662:    "home.club_operativo":"Padel-Club","home.hero_accent":"in Betrieb",
src/App.jsx:3663:    "home.hero_subtitle":"SaaS nach Rollen: Spieler, Empfang, Verwaltung und Support.",
src/App.jsx:4210:      {/* HERO */}
src/App.jsx:4218:            {tx("home.club_operativo")}<br /><span style={{ color: T.accent }}>{tx("home.hero_accent")}</span>
src/App.jsx:4221:            {tx("home.hero_subtitle")}
src/App.jsx:7024:              ? <img src={avatarSrc} alt="Avatar" style={{ width:96, height:96, borderRadius:"50%", objectFit:"cover", border:`3px solid ${T.accent}`, boxShadow:accentGlow }} />
src/App.jsx:7071:                <img src={avatarPreview} alt="Vista previa" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`2px solid ${T.warning}`, marginBottom:8 }} />
src/data/tutorialSteps.js:4:    { step: 1, title: "Panel Principal", text: "Este es tu panel principal como jugador. Aquí verás tus reservas y actividad.", selector: "[data-tour='inicio-hero']", targetModule: "inicio" },
src/internal-module-backgrounds.css:11:  background-image:
src/internal-module-backgrounds.css:19:  background-size: cover !important;
src/torcal-role-background.css:26:  background-size: cover;
src/torcal-role-background.css:96:  background-image:
src/torcal-role-background.css:104:  background-size: cover !important;
src/torcal-role-background.css:134:  background-image: none !important;
src/torcal-role-background.css:179:  background-image:
src/torcal-role-background.css:187:  background-size: cover !important;
src/role-background-detector.js:20:      el.style.backgroundImage = bgImage;
src/role-background-detector.js:21:      el.style.backgroundSize = 'cover';
src/role-background-detector.js:28:      el.style.backgroundImage = '';
src/tournament-module.css:7:.cp04-tournament-hero {
```

## C. Referencias a selección de rol
```text
src/App.jsx:809:  return <Card><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.04em" }}>{tx("auth.roles_title")}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginTop: 8 }}>{tx("auth.pending_desc")}</p></div><span className="cp04-badge" style={{ color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{tx("auth.pending_badge")}</span></div><div className={compact ? undefined : "cp04-grid-2"} style={compact ? { display: "grid", gap: 12 } : undefined}>{ROLES.map((role) => <div key={role.id} style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 16, background: "rgba(255,255,255,.035)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong style={{ color: T.accent }}>{role.id}</strong><span style={{ color: T.warning, fontSize: ".82rem", fontWeight: 900 }}>{role.access}</span></div><div style={{ marginTop: 8, fontWeight: 900 }}>{role.label}</div><div style={{ color: T.textDim, marginTop: 6, lineHeight: 1.55 }}>{tx("auth.secciones")} {role.sections}</div>{!compact && <PanelList items={role.permissions} />}</div>)}</div></Card>;
src/App.jsx:2235:    "login.title":"Iniciar como rol","login.entrar":"Entrar","login.cancelar":"Cancelar",
src/App.jsx:2239:    "login.error_rol":"Selecciona un rol válido.","login.error_pwd":"Contraseña incorrecta para este rol.",
src/App.jsx:2244:    "login.subtitle":"Selecciona cómo quieres entrar a la aplicación. Cada rol tendrá una experiencia orientada a sus permisos: jugador, recepción, administrador o soporte técnico.",
src/App.jsx:2415:    "auth.roles_title":"Roles y accesos","auth.pending_badge":"Pendiente de configurar",
src/App.jsx:2617:    "auth.roles_title":"Roles and access","auth.pending_badge":"Pending configuration",
src/App.jsx:2819:    "auth.roles_title":"Roles and access","auth.pending_badge":"Pending configuration",
src/App.jsx:3017:    "auth.roles_title":"Rôles et accès","auth.pending_badge":"Configuration en attente",
src/App.jsx:3215:    "auth.roles_title":"Ruoli e accessi","auth.pending_badge":"Configurazione in attesa",
src/App.jsx:3413:    "auth.roles_title":"Funções e acessos","auth.pending_badge":"Configuração pendente",
src/App.jsx:3611:    "auth.roles_title":"Perfis e acessos","auth.pending_badge":"Configuração pendente",
src/App.jsx:3809:    "auth.roles_title":"Rollen und Zugriffe","auth.pending_badge":"Konfiguration ausstehend",
src/App.jsx:6792:  return <div style={{ padding: "42px 24px", maxWidth: 1180, margin: "0 auto" }}><SectionTitle eyebrow={tx("soporte.eyebrow")} title={tx("soporte.title")} desc={tx("soporte.desc")} /><AuthStatusPanel /><Card style={{ marginTop: 24, marginBottom: 24 }}><h3 style={{ marginTop: 0 }}><span style={{ color: T.accent }}>{tx("soporte.proteccion_h3")}</span></h3><PanelList items={[`${tx("auth.secciones")} ${PROTECTED_SECTIONS.join(", ")}`, tx("soporte.proteccion"), tx("soporte.estado_tec_desc"), tx("soporte.worker_item")]} /></Card><div className="cp04-grid-2" style={{ marginBottom: 24 }}><RolePanel eyebrow={tx("soporte.estado_tec_eyebrow")} title={tx("soporte.estado_tec_title")} desc={tx("soporte.estado_tec_desc")} items={[tx("soporte.worker_item"), tx("soporte.make_item"), tx("soporte.airtable_item"), tx("soporte.stripe_item")]} /><RolePanel eyebrow={tx("soporte.obs_eyebrow")} title={tx("soporte.obs_title")} desc={tx("soporte.obs_desc")} items={[tx("soporte.logs_worker"), tx("soporte.logs_validaciones"), tx("soporte.logs_errores"), tx("soporte.logs_alertas")]} /></div><IntegrationMatrix /><AuthProductionStatusPanel /><Card style={{ marginTop: 24 }}><h3 style={{ marginTop: 0 }}>{tx("soporte.vars_h3")}</h3><pre style={{ overflow: "auto", color: T.textDim, background: "rgba(5,8,13,.72)", padding: 18, borderRadius: 16, border: `1px solid ${T.line}` }}>{`ALLOWED_ORIGIN=privado_en_worker\nRESERVAS_WEBHOOK=privado_en_worker\nDB_API_KEY=privado_en_backend\nDB_BASE_ID=privado_en_backend\nDB_RESERVAS_TABLE=privado_en_backend\nPAGOS_CLAVE_PRIVADA=solo_backend\nPAGOS_FIRMA_WEBHOOK=solo_backend\nMESSAGING_PROVIDER_TOKEN=privado_en_backend\nMESSAGING_PHONE_NUMBER_ID=privado_en_backend\nCALENDAR_CREDENTIALS=privado_en_backend\nSTORAGE_CREDENTIALS=privado_en_backend\nAUTH_PROVIDER=privado_en_backend\nAUTH_ISSUER_URL=privado_en_backend\nAUTH_AUDIENCE=privado_en_backend\nVITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas`}</pre><p style={{ color: T.textDim, lineHeight: 1.6 }}>Documentación: <code>docs/backend-reservas.md</code>, <code>docs/integraciones.md</code> y <code>docs/auth-roles.md</code>. El frontend solo debe recibir variables públicas <code>VITE_</code>.</p></Card></div>;
src/App.jsx:7432:  const [rolePassword, setRolePassword] = useState("");
src/App.jsx:7435:  const [roleError, setRoleError] = useState("");
src/App.jsx:7543:  function selectRole(roleId) {
src/App.jsx:7545:    setRolePassword("");
src/App.jsx:7547:    setRoleError("");
src/App.jsx:7555:      setRoleError("Selecciona un rol válido.");
src/App.jsx:7560:      setRoleError("Contraseña incorrecta para este rol.");
src/App.jsx:7572:    setRolePassword("");
src/App.jsx:7574:    setRoleError("");
src/App.jsx:7587:    setRolePassword("");
src/App.jsx:7588:    setRoleError("");
src/App.jsx:8012:                  <button key={roleId} type="button" className={roleId==="PLAYER" ? "cp04-player-role-card" : undefined} onClick={() => selectRole(roleId)}
src/App.jsx:8031:                  onChange={e => setRolePassword(e.target.value)}
src/App.jsx:8057:                    onClick={() => { setPendingRole(""); setRolePassword(""); setRoleError(""); }}
src/role-background-detector.js:44:    pageText.includes('iniciar como rol') ||
```
