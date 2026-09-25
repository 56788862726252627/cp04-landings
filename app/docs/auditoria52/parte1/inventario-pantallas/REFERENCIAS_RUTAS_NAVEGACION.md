# INVENTARIO DE REFERENCIAS DE RUTAS Y NAVEGACIÓN

Generado: Sat Jul  4 10:25:26 CEST 2026

```text
src/App.jsx:6:import './cp04-sidebar-fix';
src/App.jsx:51: *   server action, Cloudflare Worker o API route usando variables de entorno privadas.
src/App.jsx:189:  .cp04-sidebar { position: sticky; top: 0; height: 100vh; padding: 24px; border-right: 1px solid ${T.line}; background: linear-gradient(180deg, rgba(10,16,28,.96), rgba(5,8,13,.90)); overflow: auto; backdrop-filter: blur(18px); }
src/App.jsx:192:  .cp04-sidebar-close { display: none; }
src/App.jsx:213:  @media (max-width: 980px) { .cp04-layout { grid-template-columns: 1fr; padding-top: 66px; } .cp04-mobilebar { position: fixed; z-index: 60; top: 0; left: 0; right: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-bottom: 1px solid ${T.line}; background: rgba(7,10,14,.88); backdrop-filter: blur(18px); } .cp04-menu-button { background: linear-gradient(135deg, ${T.accent}, ${T.accent2}); color: #06100a; border: 0; border-radius: 14px; padding: 10px 14px; font-family: ${T.fontDisplay}; font-weight: 900; cursor: pointer; } .cp04-sidebar-close { display: block; } .cp04-sidebar { position: fixed; z-index: 80; inset: 0 auto 0 0; width: min(88vw, 340px); height: 100dvh; visibility: hidden; transform: translateX(-105%); transition: transform .22s ease, visibility .22s ease; border-right: 1px solid ${T.line}; border-bottom: 0; box-shadow: 24px 0 80px rgba(0,0,0,.45); } .cp04-sidebar[data-open="true"] { visibility: visible; transform: translateX(0); } .cp04-overlay { display: block; position: fixed; z-index: 70; inset: 0; background: rgba(0,0,0,.62); border: 0; padding: 0; cursor: pointer; } .cp04-grid-2, .cp04-grid-3, .cp04-gallery { grid-template-columns: 1fr; } .cp04-gallery-item.featured { min-height: 340px; } }
src/App.jsx:2234:    "nav.cerrar_sesion":"Cerrar sesión","nav.saas_label":"SaaS seguro","nav.cerrar_menu":"Cerrar","nav.abrir_menu":"Menú",
src/App.jsx:2436:    "nav.cerrar_sesion":"Sign out","nav.saas_label":"Secure SaaS","nav.cerrar_menu":"Close","nav.abrir_menu":"Menu",
src/App.jsx:2638:    "nav.cerrar_sesion":"Sign out","nav.saas_label":"Secure SaaS","nav.cerrar_menu":"Close","nav.abrir_menu":"Menu",
src/App.jsx:2840:    "nav.cerrar_sesion":"Déconnexion","nav.saas_label":"SaaS sécurisé","nav.cerrar_menu":"Fermer","nav.abrir_menu":"Menu",
src/App.jsx:3038:    "nav.cerrar_sesion":"Disconnetti","nav.saas_label":"SaaS sicuro","nav.cerrar_menu":"Chiudi","nav.abrir_menu":"Menu",
src/App.jsx:3236:    "nav.cerrar_sesion":"Terminar sessão","nav.saas_label":"SaaS seguro","nav.cerrar_menu":"Fechar","nav.abrir_menu":"Menu",
src/App.jsx:3434:    "nav.cerrar_sesion":"Encerrar sessão","nav.saas_label":"SaaS seguro","nav.cerrar_menu":"Fechar","nav.abrir_menu":"Menu",
src/App.jsx:3632:    "nav.cerrar_sesion":"Abmelden","nav.saas_label":"Sicheres SaaS","nav.cerrar_menu":"Schließen","nav.abrir_menu":"Menü",
src/App.jsx:3968:function Sidebar({ current, selectedRole, onClearRole, mobileOpen, onNavigate, onClose }) {
src/App.jsx:3977:  const menuByRole = {
src/App.jsx:3983:  const allowedMenu = menuByRole[selectedRole] || menuByRole.PLAYER;
src/App.jsx:3984:  const visibleItems = navKeys.filter(([id]) => allowedMenu.includes(id));
src/App.jsx:3987:    <aside id="cp04-mobile-menu" className="cp04-sidebar" data-open={mobileOpen ? "true" : "false"} aria-label="Navegación principal">
src/App.jsx:3996:        <button className="cp04-menu-button cp04-sidebar-close" type="button" onClick={onClose} aria-label="Cerrar menú">{tx("nav.cerrar_menu")}</button>
src/App.jsx:4004:              data-tour={`sidebar-${id}`}
src/App.jsx:4082:              onClick={() => onNavigate(id)}
src/App.jsx:4159:              className={`cp04-menu-button ${current===id ? "is-active" : ""}`}
src/App.jsx:4183:        <button className="cp04-menu-button" type="button" onClick={onClearRole}
src/App.jsx:6226:        {/* Controls sidebar */}
src/App.jsx:7436:  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
src/App.jsx:7513:  const menuButtonRef = useRef(null);
src/App.jsx:7594:    setMobileMenuOpen(false);
src/App.jsx:7672:      setMobileMenuOpen(false);
src/App.jsx:7786:    if (!mobileMenuOpen) return undefined;
src/App.jsx:7790:    document.querySelector("#cp04-mobile-menu button")?.focus();
src/App.jsx:7794:        setMobileMenuOpen(false);
src/App.jsx:7795:        menuButtonRef.current?.focus();
src/App.jsx:7805:  }, [mobileMenuOpen]);
src/App.jsx:7807:  function navigate(section) {
src/App.jsx:7813:      setMobileMenuOpen(false);
src/App.jsx:7818:    setMobileMenuOpen(false);
src/App.jsx:7912:            <button type="submit" className="cp04-menu-button" style={{ width:"auto", borderColor:"rgba(182,255,0,.5)", background:T.accent, color:"#ffffff", fontWeight:900 }}>
src/App.jsx:7966:                        <button type="button" onClick={handleRegisterSubmit} className="cp04-menu-button" style={{ background:T.accent, color:"#ffffff", fontWeight:900 }}>
src/App.jsx:7969:                        <button type="button" className="cp04-menu-button" onClick={closeRegister} style={{ background:"transparent", border:`1px solid ${T.line}` }}>
src/App.jsx:7981:                      <button type="button" className="cp04-menu-button" onClick={closeRegister}>
src/App.jsx:8052:                  <button type="submit" className="cp04-menu-button"
src/App.jsx:8056:                  <button type="button" className="cp04-menu-button"
src/App.jsx:8082:                        <button type="submit" className="cp04-menu-button"
src/App.jsx:8086:                        <button type="button" className="cp04-menu-button" onClick={closeForgotPwd}
src/App.jsx:8099:                    <button type="button" className="cp04-menu-button" onClick={closeForgotPwd}
src/App.jsx:8128:        <button ref={menuButtonRef} className="cp04-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú de navegación" aria-controls="cp04-mobile-menu" aria-expanded={mobileMenuOpen}>{ltx("nav.abrir_menu")}</button>
src/App.jsx:8130:      {mobileMenuOpen && <button className="cp04-overlay" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú de navegación" />}
src/App.jsx:8132:        <Sidebar current={current} selectedRole={selectedRole} onClearRole={clearRole} mobileOpen={mobileMenuOpen} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} />
src/App.jsx:8137:        onNavigate={navigate}
src/components/CP04GuidedTutorial.jsx:8: *   onNavigate     — (section: string) => void
src/components/CP04GuidedTutorial.jsx:29:      target: "[data-tour='sidebar-inicio']",
src/components/CP04GuidedTutorial.jsx:35:      target: "[data-tour='sidebar-reservas']",
src/components/CP04GuidedTutorial.jsx:41:      target: "[data-tour='sidebar-torneos']",
src/components/CP04GuidedTutorial.jsx:47:      target: "[data-tour='sidebar-ranking']",
src/components/CP04GuidedTutorial.jsx:53:      target: "[data-tour='sidebar-perfil']",
src/components/CP04GuidedTutorial.jsx:61:      target: "[data-tour='sidebar-inicio']",
src/components/CP04GuidedTutorial.jsx:67:      target: "[data-tour='sidebar-reservas']",
src/components/CP04GuidedTutorial.jsx:73:      target: "[data-tour='sidebar-alta_jugador']",
src/components/CP04GuidedTutorial.jsx:79:      target: "[data-tour='sidebar-reprogramar']",
src/components/CP04GuidedTutorial.jsx:85:      target: "[data-tour='sidebar-cancelar']",
src/components/CP04GuidedTutorial.jsx:91:      target: "[data-tour='sidebar-gestion']",
src/components/CP04GuidedTutorial.jsx:97:      target: "[data-tour='sidebar-torneos']",
src/components/CP04GuidedTutorial.jsx:103:      target: "[data-tour='sidebar-perfil']",
src/components/CP04GuidedTutorial.jsx:111:      target: "[data-tour='sidebar-inicio']",
src/components/CP04GuidedTutorial.jsx:117:      target: "[data-tour='sidebar-reservas']",
src/components/CP04GuidedTutorial.jsx:123:      target: "[data-tour='sidebar-alta_jugador']",
src/components/CP04GuidedTutorial.jsx:129:      target: "[data-tour='sidebar-reprogramar']",
src/components/CP04GuidedTutorial.jsx:135:      target: "[data-tour='sidebar-cancelar']",
src/components/CP04GuidedTutorial.jsx:141:      target: "[data-tour='sidebar-gestion']",
src/components/CP04GuidedTutorial.jsx:147:      target: "[data-tour='sidebar-torneos']",
src/components/CP04GuidedTutorial.jsx:153:      target: "[data-tour='sidebar-ranking']",
src/components/CP04GuidedTutorial.jsx:159:      target: "[data-tour='sidebar-admin']",
src/components/CP04GuidedTutorial.jsx:165:      target: "[data-tour='sidebar-perfil']",
src/components/CP04GuidedTutorial.jsx:173:      target: "[data-tour='sidebar-inicio']",
src/components/CP04GuidedTutorial.jsx:179:      target: "[data-tour='sidebar-reservas']",
src/components/CP04GuidedTutorial.jsx:185:      target: "[data-tour='sidebar-alta_jugador']",
src/components/CP04GuidedTutorial.jsx:191:      target: "[data-tour='sidebar-reprogramar']",
src/components/CP04GuidedTutorial.jsx:197:      target: "[data-tour='sidebar-cancelar']",
src/components/CP04GuidedTutorial.jsx:203:      target: "[data-tour='sidebar-gestion']",
src/components/CP04GuidedTutorial.jsx:209:      target: "[data-tour='sidebar-torneos']",
src/components/CP04GuidedTutorial.jsx:215:      target: "[data-tour='sidebar-ranking']",
src/components/CP04GuidedTutorial.jsx:221:      target: "[data-tour='sidebar-admin']",
src/components/CP04GuidedTutorial.jsx:227:      target: "[data-tour='sidebar-flujos_make']",
src/components/CP04GuidedTutorial.jsx:233:      target: "[data-tour='sidebar-soporte']",
src/components/CP04GuidedTutorial.jsx:239:      target: "[data-tour='sidebar-perfil']",
src/components/CP04GuidedTutorial.jsx:275:  // 1. Derecha del target (ideal para sidebar en desktop)
src/components/CP04GuidedTutorial.jsx:299:export default function CP04GuidedTutorial({ selectedRole, onNavigate, openRevision }) {
src/components/CP04GuidedTutorial.jsx:343:    onNavigate(s.section);
src/hooks/useTutorialOrchestrator.js:6:export const useTutorialOrchestrator = (stepData, current, onNavigate) => {
src/hooks/useTutorialOrchestrator.js:15:        onNavigate(stepData.targetModule);
src/cp04-sidebar-fix.js:1:function normalizeCp04SidebarText(text) {
src/cp04-sidebar-fix.js:10:function fixCp04SidebarOnly() {
src/cp04-sidebar-fix.js:11:  const sidebar = document.querySelector('.cp04-sidebar');
src/cp04-sidebar-fix.js:12:  if (!sidebar) return;
src/cp04-sidebar-fix.js:14:  const buttons = Array.from(sidebar.querySelectorAll('button'));
src/cp04-sidebar-fix.js:17:    const text = normalizeCp04SidebarText(button.innerText || button.textContent || '');
src/cp04-sidebar-fix.js:19:    button.classList.remove('cp04-sidebar-soporte-btn');
src/cp04-sidebar-fix.js:20:    button.classList.remove('cp04-sidebar-logout-btn');
src/cp04-sidebar-fix.js:23:      button.classList.add('cp04-sidebar-soporte-btn');
src/cp04-sidebar-fix.js:27:      button.classList.add('cp04-sidebar-logout-btn');
src/cp04-sidebar-fix.js:32:fixCp04SidebarOnly();
src/cp04-sidebar-fix.js:34:setTimeout(fixCp04SidebarOnly, 100);
src/cp04-sidebar-fix.js:35:setTimeout(fixCp04SidebarOnly, 500);
src/cp04-sidebar-fix.js:36:setTimeout(fixCp04SidebarOnly, 1200);
src/cp04-sidebar-fix.js:38:new MutationObserver(fixCp04SidebarOnly).observe(document.body, {
src/cp04-sidebar-fix.js:44:window.addEventListener('load', fixCp04SidebarOnly);
src/cp04-sidebar-fix.js:45:window.addEventListener('popstate', fixCp04SidebarOnly);
src/cp04-sidebar-fix.js:46:window.addEventListener('hashchange', fixCp04SidebarOnly);
src/cp04-sidebar-fix.js:53:    const text = normalizeCp04SidebarText(button.innerText || button.textContent || '');
```
