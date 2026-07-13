function normalizeCp04SidebarText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fixCp04SidebarOnly() {
  const sidebar = document.querySelector('.cp04-sidebar');
  if (!sidebar) return;

  const buttons = Array.from(sidebar.querySelectorAll('button'));

  buttons.forEach((button) => {
    const text = normalizeCp04SidebarText(button.innerText || button.textContent || '');

    button.classList.remove('cp04-sidebar-soporte-btn');
    button.classList.remove('cp04-sidebar-logout-btn');

    if (text.includes('soporte')) {
      button.classList.add('cp04-sidebar-soporte-btn');
    }

    if (text.includes('cerrar sesion')) {
      button.classList.add('cp04-sidebar-logout-btn');
    }
  });
}

fixCp04SidebarOnly();

setTimeout(fixCp04SidebarOnly, 100);
setTimeout(fixCp04SidebarOnly, 500);
setTimeout(fixCp04SidebarOnly, 1200);

new MutationObserver(fixCp04SidebarOnly).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

window.addEventListener('load', fixCp04SidebarOnly);
window.addEventListener('popstate', fixCp04SidebarOnly);
window.addEventListener('hashchange', fixCp04SidebarOnly);

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
