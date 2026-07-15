function normalizeCp04Text(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function clearModuleBackgroundClasses() {
  document.body.classList.remove(
    'cp04-module-screen-active',
    'cp04-module-general',
    'cp04-module-user',
    'cp04-module-admin'
  );
}

function updateInternalModuleBackground() {
  const text = normalizeCp04Text(document.body?.innerText || '');

  const isLoginScreen =
    text.includes('inicio de sesion') &&
    text.includes('jugador / cliente') &&
    text.includes('staff / recepcion') &&
    text.includes('administrador / jefe') &&
    text.includes('soporte tecnico') &&
    !text.includes('cerrar sesion');

  if (isLoginScreen || document.body.classList.contains('cp04-role-screen-active')) {
    clearModuleBackgroundClasses();
    return;
  }

  const isInternalApp =
    text.includes('cerrar sesion') ||
    text.includes('modo seguro') ||
    text.includes('reservar pista') ||
    text.includes('centro tecnico') ||
    text.includes('panel') ||
    text.includes('ranking') ||
    text.includes('alta de jugador');

  if (!isInternalApp) {
    clearModuleBackgroundClasses();
    return;
  }

  clearModuleBackgroundClasses();
  document.body.classList.add('cp04-module-screen-active');

  const isAdminOrTechnical =
    text.includes('centro tecnico') ||
    text.includes('automatizaciones') ||
    text.includes('estado de make') ||
    text.includes('webhooks') ||
    text.includes('variables privadas') ||
    text.includes('seguridad') ||
    text.includes('backups') ||
    text.includes('auditoria') ||
    text.includes('operacion y seguridad') ||
    text.includes('administrador / jefe') ||
    text.includes('dashboard ejecutivo') ||
    text.includes('panel de administracion') ||
    text.includes('soporte tecnico');

  const isUserOrReservations =
    text.includes('reservar pista') ||
    text.includes('reservas') ||
    text.includes('reprogramar reserva') ||
    text.includes('cancelar reserva') ||
    text.includes('alta de jugador') ||
    text.includes('ranking') ||
    text.includes('torneos') ||
    text.includes('partidos') ||
    text.includes('perfil') ||
    text.includes('notificaciones') ||
    text.includes('monedero');

  if (isAdminOrTechnical) {
    document.body.classList.add('cp04-module-admin');
  } else if (isUserOrReservations) {
    document.body.classList.add('cp04-module-user');
  } else {
    document.body.classList.add('cp04-module-general');
  }
}

updateInternalModuleBackground();

setTimeout(updateInternalModuleBackground, 100);
setTimeout(updateInternalModuleBackground, 500);
setTimeout(updateInternalModuleBackground, 1200);

new MutationObserver(updateInternalModuleBackground).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

window.addEventListener('popstate', updateInternalModuleBackground);
window.addEventListener('hashchange', updateInternalModuleBackground);
window.addEventListener('load', updateInternalModuleBackground);
