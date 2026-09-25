# ROLE BACKGROUND DETECTOR

```javascript
function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const bgImage = "linear-gradient(180deg, rgba(2,6,23,0.00) 0%, rgba(2,6,23,0.03) 45%, rgba(2,6,23,0.12) 100%), url(\'/images/torcal-padel-bg.png\')";

function applyRoleBackground(active) {
  const targets = [
    document.documentElement,
    document.body,
    document.getElementById('root'),
    document.getElementById('root')?.firstElementChild
  ].filter(Boolean);

  targets.forEach((el) => {
    if (active) {
      el.style.backgroundImage = bgImage;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center center';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundAttachment = 'fixed';
      el.style.backgroundColor = 'transparent';
      el.style.minHeight = '100vh';
    } else {
      el.style.backgroundImage = '';
      el.style.backgroundSize = '';
      el.style.backgroundPosition = '';
      el.style.backgroundRepeat = '';
      el.style.backgroundAttachment = '';
      el.style.backgroundColor = '';
    }
  });

  document.body.classList.toggle('cp04-role-screen-active', active);
}

function updateRoleBackground() {
  const pageText = normalizeText(document.body?.innerText || '');

  const isRoleScreen =
    pageText.includes('iniciar como rol') ||
    pageText.includes('acceso por rol') ||
    pageText.includes('selecciona como quieres entrar') ||
    (
      pageText.includes('jugador / cliente') &&
      pageText.includes('staff / recepcion') &&
      pageText.includes('administrador / jefe') &&
      pageText.includes('soporte tecnico')
    );

  applyRoleBackground(Boolean(isRoleScreen));
}

updateRoleBackground();

setTimeout(updateRoleBackground, 100);
setTimeout(updateRoleBackground, 500);
setTimeout(updateRoleBackground, 1200);

new MutationObserver(updateRoleBackground).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

window.addEventListener('popstate', updateRoleBackground);
window.addEventListener('hashchange', updateRoleBackground);
window.addEventListener('load', updateRoleBackground);
```
