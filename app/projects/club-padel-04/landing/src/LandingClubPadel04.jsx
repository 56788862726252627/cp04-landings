// Club Pádel 04 · Landing — versión componente React
//
// NO está importada ni enrutada en src/App.jsx todavía (fuera del alcance permitido
// de esta tarea). Es la traducción a JSX de projects/club-padel-04/landing/src/index.html,
// lista para copiarse a src/pages/ (o equivalente) cuando se autorice la integración.
//
// Copy: ver ../copy/LANDING_COPY_CLUB_PADEL_04.md (fuente de verdad del texto).
// Paleta/tipografía: ver ../figma/BRAND_SYSTEM_CLUB_PADEL_04.md.
// Imágenes: usa las mismas rutas que la app real ya usa en producción
// (/gallery/cp04/*.jpg, /images/torcal-padel-bg.png, /favicon.svg) en vez de las copias
// locales de ../assets/, para no duplicar binarios dentro del bundle de la app.

import { useState } from "react";
import "./styles.css";

const PROBLEMAS = [
  { icon: "💬", title: "Reservas por WhatsApp y llamadas", text: "Mensajes cruzados, confirmaciones que se pierden, nadie sabe qué pista está realmente libre." },
  { icon: "📋", title: "Excel y agenda en papel", text: "Sin trazabilidad, sin histórico, sin forma de saber quién reserva, cuándo y con qué frecuencia." },
  { icon: "⚠️", title: "Reservas duplicadas", text: "Dos personas reservan la misma pista a la misma hora porque nadie tiene visibilidad en tiempo real." },
  { icon: "📉", title: "Cero visibilidad para el club", text: "Sin datos claros de ocupación ni forma de organizar torneos o ranking de manera ordenada." },
];

const MODULOS = [
  "Reservas inteligentes en tiempo real",
  "Alta y gestión de jugadores",
  "Torneos con cuadro de eliminatorias",
  "Ranking de jugadores",
  "Panel de administración por roles",
  "Centro técnico y soporte",
  "Gestión de empleados",
  "Métricas de uso y ocupación",
];

const BENEFICIOS = [
  { title: "Para propietarios", items: ["Más control sobre la ocupación real de las instalaciones.", "Menos errores de doble reserva y confusión de horarios.", "Información clara y centralizada, sin depender de varios canales."] },
  { title: "Para empleados", items: ["Menos llamadas y mensajes repetitivos que atender.", "Panel sencillo para gestionar reservas y jugadores.", "Menos tiempo perdido en gestión manual del calendario."] },
  { title: "Para jugadores", items: ["Reservas rápidas desde el móvil, sin depender de llamadas.", "Acceso a torneos y ranking de forma ordenada.", "Perfil propio y experiencia moderna, sin coste adicional."] },
];

const TECNICO = [
  { icon: "🔐", title: "Autenticación real", text: "Cada usuario accede con su propia cuenta y su propio rol." },
  { icon: "🧩", title: "Roles diferenciados", text: "Jugador, personal y administración ven exactamente lo que necesitan, nada más." },
  { icon: "🛡️", title: "Copias de seguridad", text: "El trabajo del club queda protegido frente a errores o pérdidas de datos." },
  { icon: "👁️", title: "Demo real disponible", text: "Puedes probarlo tú mismo antes de decidir nada." },
];

const PROCESO = [
  { n: 1, title: "Preparación y ajuste inicial", text: "≈1 semana · Revisión de las necesidades concretas del club o instalación." },
  { n: 2, title: "Configuración y validación", text: "≈1 semana · Ajuste del sistema a la realidad del club (pistas, horarios, personal)." },
  { n: 3, title: "Demo y formación", text: "≈1 semana · Demostración práctica y formación al personal que va a usarlo." },
  { n: 4, title: "Puesta en marcha controlada", text: "≈1 semana · Arranque real, con soporte cercano durante los primeros días." },
];

const FAQ = [
  { q: "¿Puedo probarlo antes de contratar?", a: "Sí. Puedes acceder a una demo interactiva con datos ficticios antes de tomar ninguna decisión." },
  { q: "¿Incluye pagos online para los jugadores?", a: "No todavía. La primera fase no incluye cobro online dentro de la aplicación; el uso es gratuito para el jugador. Esta función podrá incorporarse en fases posteriores." },
  { q: "¿Incluye avisos por WhatsApp?", a: "No todavía. La mensajería tipo WhatsApp Business no forma parte de la fase inicial, pero está contemplada como posible ampliación futura." },
  { q: "¿Cuánto tarda la implantación?", a: "Alrededor de 4 semanas desde el inicio, repartidas en preparación, configuración, demo/formación y puesta en marcha. El plazo puede variar según la disponibilidad de cada club." },
  { q: "¿Qué pasa con mis datos actuales (Excel, agendas, listados)?", a: "Se pueden incorporar al nuevo sistema durante la fase de configuración inicial. Lo revisamos caso a caso durante el diagnóstico previo." },
  { q: "¿Hay compromiso de permanencia?", a: "Las condiciones concretas de permanencia y cancelación se acuerdan por escrito antes de la implantación, según cada caso. Nuestro equipo te las explica con claridad durante el diagnóstico, sin letra pequeña." },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className={`accordion__item${isOpen ? " is-open" : ""}`}>
      <button className="accordion__trigger" onClick={onToggle}>
        {q} <span>+</span>
      </button>
      <div className="accordion__panel"><p>{a}</p></div>
    </div>
  );
}

export default function LandingClubPadel04() {
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <header className={`nav${navOpen ? " is-open" : ""}`} id="nav">
        <div className="nav__inner container">
          <a className="nav__brand" href="#top">
            <img src="/favicon.svg" alt="" className="nav__logo" width={32} height={32} />
            <span>Club Pádel 04</span>
          </a>
          <nav className="nav__links">
            <a href="#solucion">Producto</a>
            <a href="#proceso">Cómo funciona</a>
            <a href="#precios">Precios</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav__cta">
            <a className="btn btn--primary btn--sm" href="#contacto">Solicitar demo</a>
          </div>
          <button
            className="nav__toggle"
            aria-label="Abrir menú"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__bg" style={{ backgroundImage: "url('/images/torcal-padel-bg.png')" }} />
          <div className="hero__overlay" />
          <div className="container hero__content">
            <span className="badge">Sistema en producción real</span>
            <h1>Sistema inteligente de reservas para clubes de pádel</h1>
            <p className="hero__subtitle">
              Automatiza reservas, jugadores, torneos, ranking y gestión interna desde una app
              moderna, ya en funcionamiento real — no un prototipo ni una promesa a futuro.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary btn--lg" href="#contacto">Solicitar demo</a>
              <a className="btn btn--secondary btn--lg" href="#solucion">Ver cómo funciona</a>
            </div>
          </div>
        </section>

        <section className="section" id="problema">
          <div className="container">
            <span className="eyebrow">El problema</span>
            <h2>Tu club merece algo mejor que un grupo de WhatsApp</h2>
            <p className="section__intro">
              La mayoría de clubes y polideportivos gestionan hoy sus reservas de forma manual.
              Y eso tiene un coste que casi nunca se mide.
            </p>
            <div className="grid grid--4">
              {PROBLEMAS.map((p) => (
                <div className="card card--icon" key={p.title}>
                  <div className="icon icon--danger">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--surface" id="solucion">
          <div className="container">
            <span className="eyebrow">La solución</span>
            <h2>Todo tu club, en un solo sistema</h2>
            <p className="section__intro">
              Club Pádel 04 centraliza reservas, jugadores, empleados, administración, torneos,
              ranking y soporte en una sola aplicación pensada para instalaciones deportivas
              reales — desde un club privado hasta un polideportivo municipal.
            </p>
            <div className="grid grid--4 grid--modules">
              {MODULOS.map((m) => (
                <div className="module" key={m}><span className="module__dot" />{m}</div>
              ))}
            </div>
            <div className="gallery">
              <figure className="gallery__item">
                <img src="/gallery/cp04/pistas.jpg" alt="Pistas del club" loading="lazy" />
                <figcaption>Pistas — vista real del club</figcaption>
              </figure>
              <figure className="gallery__item">
                <img src="/gallery/cp04/recepcion.jpg" alt="Recepción del club" loading="lazy" />
                <figcaption>Recepción — vista real del club</figcaption>
              </figure>
              <figure className="gallery__item">
                <img src="/gallery/cp04/torneos.jpg" alt="Torneos del club" loading="lazy" />
                <figcaption>Torneos — vista real del club</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section" id="beneficios">
          <div className="container">
            <span className="eyebrow">Beneficios</span>
            <h2>Pensado para las tres personas que realmente usan un club</h2>
            <div className="grid grid--3">
              {BENEFICIOS.map((b) => (
                <div className="card" key={b.title}>
                  <h3>{b.title}</h3>
                  <ul className="checklist">
                    {b.items.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--surface" id="tecnico">
          <div className="container">
            <span className="eyebrow">Cómo está construido</span>
            <h2>Software serio, no una plantilla genérica</h2>
            <p className="section__intro">
              No es una app improvisada: es la misma tecnología con la que ya opera un club real
              cada semana, con autenticación real, roles diferenciados por persona y copias de
              seguridad periódicas.
            </p>
            <div className="grid grid--4">
              {TECNICO.map((t) => (
                <div className="card card--icon" key={t.title}>
                  <div className="icon">{t.icon}</div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="caso-base">
          <div className="container container--narrow">
            <span className="eyebrow">Caso real</span>
            <h2>El caso real detrás de este sistema</h2>
            <p className="section__intro">
              Club Pádel 04 nace como el primer caso real de implantación de este sistema: un
              club de pádel en pleno funcionamiento, en el entorno del Torcal de Antequera, que
              usa esta misma aplicación para gestionar sus pistas, jugadores, torneos y ranking.
              Lo que ves en la demo es exactamente lo que ya funciona ahí — no una versión
              reducida ni una maqueta.
            </p>
          </div>
        </section>

        <section className="section section--surface" id="proceso">
          <div className="container">
            <span className="eyebrow">Proceso de trabajo</span>
            <h2>Cómo se implanta, paso a paso</h2>
            <div className="timeline">
              {PROCESO.map((s) => (
                <div className="timeline__step" key={s.n}>
                  <div className="timeline__number">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
            <p className="section__note">
              Duración estimada total: 4 semanas. El calendario puede ajustarse según la
              disponibilidad de cada club.
            </p>
          </div>
        </section>

        <section className="section" id="demo">
          <div className="container container--narrow">
            <div className="demo-card">
              <span className="eyebrow">Pruébalo tú mismo</span>
              <h2>No es una promesa, es una demo real</h2>
              <p>
                Accede a una demo interactiva con datos ficticios, sin ningún pago real ni
                riesgo para tu información. Es el mismo sistema, en un entorno seguro pensado
                para que lo pruebes con calma.
              </p>
              <a className="btn btn--primary btn--lg" href="#contacto">Acceder a la demo</a>
              <span className="demo-card__note">Demo segura · Datos de ejemplo · Sin compromiso</span>
            </div>
          </div>
        </section>

        <section className="section section--surface" id="precios">
          <div className="container">
            <span className="eyebrow">Precios</span>
            <h2>Precio claro, sin sorpresas</h2>
            <p className="section__intro">
              Cada club es distinto, por eso el precio final se ajusta tras un diagnóstico breve
              y gratuito. Estas son las condiciones de referencia actuales:
            </p>
            <div className="grid grid--2 grid--pricing">
              <div className="price-card price-card--featured">
                <span className="badge badge--accent">Precio de lanzamiento</span>
                <h3>Plan Piloto</h3>
                <div className="price-card__amount">2.700 € <span>+ IVA implantación</span></div>
                <div className="price-card__amount price-card__amount--sub">250 €/mes <span>+ IVA mantenimiento</span></div>
                <ul className="checklist">
                  <li>App completa de reservas</li>
                  <li>Panel de gestión</li>
                  <li>Torneos y ranking</li>
                  <li>Soporte de puesta en marcha</li>
                  <li>0 € de coste para jugadores</li>
                </ul>
                <p className="price-card__condition">
                  Precio especial de lanzamiento para las primeras implantaciones de una zona,
                  mientras dure el cupo de piloto.
                </p>
                <a className="btn btn--primary" href="#contacto">Solicitar mi diagnóstico gratuito</a>
              </div>
              <div className="price-card">
                <h3>Plan Estándar</h3>
                <div className="price-card__amount">Desde 3.500 € <span>+ IVA implantación</span></div>
                <div className="price-card__amount price-card__amount--sub">Desde 350 €/mes <span>+ IVA mantenimiento</span></div>
                <ul className="checklist">
                  <li>Todo lo del plan Piloto</li>
                  <li>Soporte estándar continuado</li>
                  <li>0 € de coste para jugadores</li>
                </ul>
                <p className="price-card__condition">Aplicable una vez agotado el cupo de precio piloto de la zona.</p>
                <a className="btn btn--secondary" href="#contacto">Hablar con el equipo</a>
              </div>
            </div>
            <p className="section__note">
              El precio piloto no es el precio estándar del servicio: es una condición especial
              y limitada para las primeras instalaciones que adopten el sistema. Proyectos
              multisede o de mayor escala se presupuestan de forma personalizada tras el
              diagnóstico.
            </p>
          </div>
        </section>

        <section className="section" id="transparencia">
          <div className="container">
            <span className="eyebrow">Transparencia</span>
            <h2>Qué incluye hoy, qué no incluye todavía</h2>
            <div className="grid grid--2 grid--transparency">
              <div className="card">
                <h3>Incluye hoy</h3>
                <ul className="checklist checklist--yes">
                  <li>Reservas en tiempo real, móvil y ordenador</li>
                  <li>Acceso diferenciado jugador / personal</li>
                  <li>Panel de gestión completo</li>
                  <li>Perfil de jugador, torneos y ranking</li>
                  <li>Adaptación visual básica (logo y colores)</li>
                  <li>Formación inicial y soporte de puesta en marcha</li>
                </ul>
              </div>
              <div className="card">
                <h3>No incluye todavía</h3>
                <ul className="checklist checklist--no">
                  <li>Pagos online reales dentro de la aplicación</li>
                  <li>Mensajería tipo WhatsApp Business integrada</li>
                  <li>Gestión multisede (varias instalaciones a la vez)</li>
                  <li>Funcionalidades no acordadas en el alcance inicial</li>
                </ul>
              </div>
            </div>
            <p className="section__note">
              Todo lo anterior puede incorporarse en fases posteriores, presupuestado de forma
              independiente, una vez validado el sistema.
            </p>
          </div>
        </section>

        <section className="section section--surface" id="faq">
          <div className="container container--narrow">
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2>Todo lo que necesitas saber</h2>
            <div className="accordion">
              {FAQ.map((item, idx) => (
                <FaqItem
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section cta-final" id="contacto">
          <div className="container container--narrow">
            <h2>¿Listo para dejar de gestionar tu club a mano?</h2>
            <p>
              Solicita tu diagnóstico gratuito. Sin compromiso, sin presión, con respuesta clara
              sobre qué encaja para tu club.
            </p>

            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <div className="form__row">
                <label>Nombre y apellidos*<input type="text" name="nombre" required /></label>
                <label>Nombre del club/instalación*<input type="text" name="club" required /></label>
              </div>
              <div className="form__row">
                <label>Número de pistas*<input type="number" name="pistas" min={1} required /></label>
                <label>Ciudad o localidad*<input type="text" name="ciudad" required /></label>
              </div>
              <div className="form__row">
                <label>
                  ¿Cómo gestionáis hoy las reservas?*
                  <select name="sistema_actual" required defaultValue="">
                    <option value="">Selecciona una opción</option>
                    <option>WhatsApp</option>
                    <option>Excel</option>
                    <option>Otro software</option>
                    <option>Ninguno</option>
                  </select>
                </label>
                <label>
                  ¿Cuándo os gustaría tenerlo funcionando?*
                  <select name="urgencia" required defaultValue="">
                    <option value="">Selecciona una opción</option>
                    <option>Lo antes posible</option>
                    <option>En 1-3 meses</option>
                    <option>Solo estoy explorando</option>
                  </select>
                </label>
              </div>
              <div className="form__row">
                <label>Email*<input type="email" name="email" required /></label>
                <label>Teléfono*<input type="tel" name="telefono" required /></label>
              </div>
              <label className="form__full">
                Comentario adicional (opcional)
                <textarea name="comentario" rows={3} />
              </label>

              <button type="submit" className="btn btn--primary btn--lg" disabled>
                Solicitar demo
              </button>
              <p className="form__note">
                Formulario no conectado todavía (sin backend ni envío real) — preparado para
                conectar más adelante. No conectamos ningún pago ni compartimos tus datos con
                terceros.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <img src="/favicon.svg" alt="" width={28} height={28} />
            <span>Club Pádel 04</span>
          </div>
          <nav className="footer__links">
            <a href="#solucion">Producto</a>
            <a href="#precios">Precios</a>
            <a href="#faq">FAQ</a>
            <a href="#demo">Demo</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <p className="footer__legal">
            Club Pádel 04 es un sistema de gestión deportiva desarrollado y mantenido por un
            equipo especializado en digitalización de instalaciones deportivas y municipales. No
            garantizamos resultados ni ingresos: te mostramos exactamente qué hace el sistema
            hoy, en una demo real, para que decidas con información clara.
          </p>
        </div>
      </footer>
    </>
  );
}
