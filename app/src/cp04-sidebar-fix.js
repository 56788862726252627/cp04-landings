function normalizeCp04SidebarText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Mejora 2.2 (2026-07-25): fixCp04SidebarOnly() vivía aquí y asignaba
   cp04-sidebar-soporte-btn / cp04-sidebar-logout-btn haciendo matching de
   texto en español ("soporte", "cerrar sesion") sobre el DOM ya renderizado.
   Es el mismo patrón de "tratamiento CSS/JS exclusivo" ya identificado como
   causa raíz real para "Perfil y ajustes" (ver
   docs/mejora-2-visual-identity-audit-20260724/12-*): en cualquier idioma
   distinto del español ("Support", "Sign out", "Support", "Suporte",
   "Supporto"...) el texto no contiene la subcadena española, así que el
   MutationObserver quitaba la clase (classList.remove primero) y nunca la
   volvía a poner — dejando "Cerrar sesión"/"Sign out" con el <button> por
   defecto del navegador (~19px de alto) en 6 de los 7 idiomas del selector.
   Sustituido por classNames estables en el propio JSX del Sidebar
   (id==="soporte" para Soporte; cp04-sidebar-logout-btn ya estaba fijo en
   el JSX del botón de logout), que no dependen del idioma activo. */

/* FIX FINAL: botón Entrar del login en blanco */
function fixCp04EntrarLoginButtonFinal() {
  const buttons = Array.from(document.querySelectorAll('button'));

  buttons.forEach((button) => {
    const text = normalizeCp04SidebarText(button.innerText || button.textContent || '');

    button.classList.remove('cp04-login-entrar-white-btn');

    if (text === 'entrar') {
      button.classList.add('cp04-login-entrar-white-btn');

      button.style.setProperty('color', '#ffffff', 'important');
      button.style.setProperty('fill', '#ffffff', 'important');
      button.style.setProperty('font-weight', '950', 'important');
      button.style.setProperty('opacity', '1', 'important');
      button.style.setProperty('text-shadow', '0 2px 12px rgba(0,0,0,0.80)', 'important');

      Array.from(button.querySelectorAll('*')).forEach((child) => {
        child.style.setProperty('color', '#ffffff', 'important');
        child.style.setProperty('fill', '#ffffff', 'important');
        child.style.setProperty('font-weight', '950', 'important');
        child.style.setProperty('opacity', '1', 'important');
        child.style.setProperty('text-shadow', '0 2px 12px rgba(0,0,0,0.80)', 'important');
      });
    }
  });
}

fixCp04EntrarLoginButtonFinal();

setTimeout(fixCp04EntrarLoginButtonFinal, 100);
setTimeout(fixCp04EntrarLoginButtonFinal, 500);
setTimeout(fixCp04EntrarLoginButtonFinal, 1200);
setTimeout(fixCp04EntrarLoginButtonFinal, 2500);

window.addEventListener('load', fixCp04EntrarLoginButtonFinal);
window.addEventListener('popstate', fixCp04EntrarLoginButtonFinal);
window.addEventListener('hashchange', fixCp04EntrarLoginButtonFinal);
