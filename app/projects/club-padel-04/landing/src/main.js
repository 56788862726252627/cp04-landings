// Club Pádel 04 · Landing — interacción mínima, sin dependencias ni llamadas externas.
// El formulario de contacto no envía datos a ningún sitio: el botón está deshabilitado
// a propósito hasta que se conecte un backend real (ver README_LANDING_CLUB_PADEL_04.md).

document.addEventListener('DOMContentLoaded', () => {
  // Menú móvil
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.querySelectorAll('.nav__links a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Acordeón FAQ: el icono cambia de "+" a "−" al abrir (nunca "×", para no leerse como error/cierre).
  const setAccordionIcon = (item, isOpen) => {
    const icon = item.querySelector('.accordion__trigger span');
    if (icon) icon.textContent = isOpen ? '−' : '+';
  };
  document.querySelectorAll('.accordion__item').forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.accordion__item').forEach((i) => {
        i.classList.remove('is-open');
        setAccordionIcon(i, false);
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        setAccordionIcon(item, true);
      }
    });
  });

  // Formulario: intencionalmente sin submit real todavía.
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  }
});
