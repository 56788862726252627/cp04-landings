function normalizeCp04ButtonText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function applyWhiteButtonStyle(button) {
  button.classList.add('cp04-fix-white-action-btn');

  button.style.setProperty('color', '#ffffff', 'important');
  button.style.setProperty('text-shadow', '0 2px 10px rgba(0,0,0,0.75)', 'important');
  button.style.setProperty('font-weight', '950', 'important');
  button.style.setProperty('opacity', '1', 'important');

  Array.from(button.querySelectorAll('*')).forEach((child) => {
    child.style.setProperty('color', '#ffffff', 'important');
    child.style.setProperty('fill', '#ffffff', 'important');
    child.style.setProperty('text-shadow', '0 2px 10px rgba(0,0,0,0.75)', 'important');
    child.style.setProperty('font-weight', '950', 'important');
    child.style.setProperty('opacity', '1', 'important');
  });
}

function fixSelectedCp04ButtonsOnly() {
  const buttons = Array.from(document.querySelectorAll('button'));

  buttons.forEach((button) => {
    // PASO 07K (2026-07-19): este fix por texto estaba pensado para botones
    // de la pantalla Inicio ("Reprogramar reserva", "Reservar pista", etc.),
    // pero "Reprogramar reserva" también es el texto literal del item del
    // sidebar — que ya tiene su propio color coherente (texto oscuro sobre
    // el degradado lima/menta cuando está activo, igual que el resto de
    // items). Al forzar aquí `color:#ffffff !important` también sobre el
    // botón del sidebar, quedaba con texto blanco sobre fondo lima activo,
    // rompiendo la coherencia visual con los demás items. Se excluye
    // cualquier botón dentro de `.cp04-sidebar` de este fix heredado.
    if (button.closest('.cp04-sidebar')) return;

    const text = normalizeCp04ButtonText(button.innerText || button.textContent || '');

    button.classList.remove('cp04-fix-reservar-pista-btn');
    button.classList.remove('cp04-fix-ir-reservas-btn');
    button.classList.remove('cp04-fix-dar-alta-btn');
    button.classList.remove('cp04-fix-pista-1-btn');
    button.classList.remove('cp04-fix-reprogramar-reserva-btn');
    button.classList.remove('cp04-fix-consultar-reservas-btn');

    if (text.includes('reservar pista')) {
      button.classList.add('cp04-fix-reservar-pista-btn');
      applyWhiteButtonStyle(button);
    }

    if (text.includes('ir a reservas')) {
      button.classList.add('cp04-fix-ir-reservas-btn');
      applyWhiteButtonStyle(button);
    }

    if (text.includes('dar de alta')) {
      button.classList.add('cp04-fix-dar-alta-btn');
      applyWhiteButtonStyle(button);
    }

    if (text === 'pista 1') {
      button.classList.add('cp04-fix-pista-1-btn');
      applyWhiteButtonStyle(button);
    }

    if (text.includes('reprogramar reserva')) {
      button.classList.add('cp04-fix-reprogramar-reserva-btn');
      applyWhiteButtonStyle(button);
    }

    if (text.includes('consultar reservas')) {
      button.classList.add('cp04-fix-consultar-reservas-btn');
      applyWhiteButtonStyle(button);
    }
  });
}

fixSelectedCp04ButtonsOnly();

setTimeout(fixSelectedCp04ButtonsOnly, 100);
setTimeout(fixSelectedCp04ButtonsOnly, 500);
setTimeout(fixSelectedCp04ButtonsOnly, 1200);
setTimeout(fixSelectedCp04ButtonsOnly, 2500);

new MutationObserver(fixSelectedCp04ButtonsOnly).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

window.addEventListener('load', fixSelectedCp04ButtonsOnly);
window.addEventListener('popstate', fixSelectedCp04ButtonsOnly);
window.addEventListener('hashchange', fixSelectedCp04ButtonsOnly);
