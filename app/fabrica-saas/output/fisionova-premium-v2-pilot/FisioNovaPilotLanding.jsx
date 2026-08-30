/**
 * FisioNova Premium V2 Pilot — Landing Page
 * Preset: clinical-premium | Hero: split-content | Motion: low/spring
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState, useEffect, useRef } from 'react';
import {
  BRANDING_V2, HERO_METRICS_V2, TRUST_BADGES,
  SERVICIOS_V2, PROCESO_PASOS, TESTIMONIOS_V2,
  PROFESIONALES_V2, FAQ_V2,
} from './FisioNovaPilotMockData.js';

const P = BRANDING_V2.primaryColor;   // #0369a1
const A = BRANDING_V2.accentColor;    // #10b981
const S = BRANDING_V2.surfaceColor;   // #f0f9ff

/* ── Motion tokens (reduced-motion safe) ────────────────────────────── */
function useReducedMotion() {
  const mq = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  const [reduced, setReduced] = useState(mq?.matches ?? false);
  useEffect(() => {
    if (!mq) return;
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mq]);
  return reduced;
}

function useInViewFade(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeSlide({ children, delay = 0, direction = 'up', style }) {
  const reduced = useReducedMotion();
  const [ref, visible] = useInViewFade();
  const transform = {
    up: 'translateY(24px)',
    left: 'translateX(-24px)',
    right: 'translateX(24px)',
  }[direction] || 'translateY(24px)';

  return (
    <div
      ref={ref}
      style={{
        opacity: reduced || visible ? 1 : 0,
        transform: reduced || visible ? 'none' : transform,
        transition: reduced ? 'none' : `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s cubic-bezier(.22,1,.36,1)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Stagger container ────────────────────────────────────────────────── */
function StaggerGrid({ children, cols = 3, gap = 24 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(min(100%,${Math.floor(100 / cols) - 2}%), 1fr))`,
      gap,
    }}>
      {Array.isArray(children)
        ? children.map((child, i) => (
          <FadeSlide key={i} delay={i * 0.08}>{child}</FadeSlide>
        ))
        : children}
    </div>
  );
}

/* ── Nav ─────────────────────────────────────────────────────────────── */
function Nav({ onCita }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${P}22` : 'none',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
      transition: 'background .3s, border-color .3s, backdrop-filter .3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${P}, #0284c7)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 15,
        }}>FN</div>
        <span style={{ fontWeight: 700, fontSize: 17, color: scrolled ? '#0c1b33' : '#fff' }}>
          FisioNova
        </span>
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {['Servicios', 'Equipo', 'Proceso', 'Contacto'].map(item => (
          <span key={item} style={{
            fontSize: 14, color: scrolled ? '#4a5568' : 'rgba(255,255,255,.88)',
            cursor: 'pointer', fontWeight: 500,
            transition: 'color .2s',
          }}>{item}</span>
        ))}
        <button onClick={onCita} style={{
          background: A, color: '#fff', border: 'none',
          borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
          boxShadow: `0 2px 8px ${A}44`,
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${A}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 8px ${A}44`; }}
        >
          Pedir cita
        </button>
      </div>
    </nav>
  );
}

/* ── Hero (split-content recipe) ─────────────────────────────────────── */
function HeroSplit({ onCita }) {
  const reduced = useReducedMotion();
  return (
    <section style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center',
      background: `linear-gradient(145deg, ${P} 0%, #0284c7 45%, #0ea5e9 100%)`,
      padding: '88px 48px 64px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(255,255,255,.06)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, right: 200,
        width: 200, height: 200, borderRadius: '50%',
        background: `rgba(16,185,129,.15)`, pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', gap: 64, alignItems: 'center' }}>

        {/* Left: text */}
        <div style={{ flex: 1 }}>
          <div style={{
            opacity: reduced ? 1 : undefined,
            animation: reduced ? 'none' : 'heroFadeLeft .7s cubic-bezier(.22,1,.36,1) both',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,.15)', borderRadius: 20,
              padding: '4px 14px', marginBottom: 20,
            }}>
              <span style={{ fontSize: 12, color: '#a5f3fc', fontWeight: 600, letterSpacing: .5 }}>
                ✦ FISIOTERAPIA CLÍNICA DE EXCELENCIA
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 800, color: '#fff', lineHeight: 1.15,
              marginBottom: 20, letterSpacing: -.02,
            }}>
              Tu recuperación,<br />
              <span style={{ color: '#a5f3fc' }}>nuestra misión</span>
            </h1>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.85)', lineHeight: 1.65, marginBottom: 32, maxWidth: 460 }}>
              Fisioterapeutas colegiados con más de 12 años de experiencia.
              Tratamos el dolor desde su origen con técnicas avaladas científicamente.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={onCita} style={{
                background: A, color: '#fff', border: 'none',
                borderRadius: 10, padding: '14px 28px', fontSize: 16, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${A}66`,
                transition: 'transform .15s, box-shadow .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                Solicitar primera cita
              </button>
              <button style={{
                background: 'rgba(255,255,255,.12)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,.35)',
                borderRadius: 10, padding: '14px 28px', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', transition: 'background .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
              >
                Ver servicios ↓
              </button>
            </div>
          </div>
        </div>

        {/* Right: metrics card */}
        <div style={{
          flex: '0 0 380px',
          animation: reduced ? 'none' : 'heroFadeRight .8s .15s cubic-bezier(.22,1,.36,1) both',
        }}>
          <div style={{
            background: 'rgba(255,255,255,.12)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,.2)',
            padding: 28,
          }}>
            <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: 600, letterSpacing: .5, marginBottom: 20 }}>
              RESULTADOS CLÍNICOS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {HERO_METRICS_V2.map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '16px 14px',
                  animation: reduced ? 'none' : `metricPop .4s ${.3 + i * .08}s both`,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{m.valor}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', marginTop: 4, lineHeight: 1.3 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFadeLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes heroFadeRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes metricPop {
          from { opacity: 0; transform: scale(.9); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}

/* ── Trust Strip ──────────────────────────────────────────────────────── */
function TrustStrip() {
  return (
    <FadeSlide>
      <div style={{
        background: '#fff', borderBottom: `1px solid ${P}18`,
        padding: '16px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap',
      }}>
        {TRUST_BADGES.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: P }}>
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{b.texto}</span>
          </div>
        ))}
      </div>
    </FadeSlide>
  );
}

/* ── Servicios ────────────────────────────────────────────────────────── */
function ServiciosSection() {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <section style={{ padding: '80px 48px', background: S }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeSlide>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: 12, color: A, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              NUESTROS SERVICIOS
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0c1b33', marginTop: 8, marginBottom: 12 }}>
              Tratamientos especializados
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
              Cada patología requiere un enfoque único. Nuestro equipo te ofrece el tratamiento más adecuado.
            </p>
          </div>
        </FadeSlide>

        <StaggerGrid cols={3} gap={20}>
          {SERVICIOS_V2.map((s) => (
            <div
              key={s.id}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: '#fff', borderRadius: 16, padding: 24,
                border: `1.5px solid ${hoveredId === s.id ? P : '#e2e8f0'}`,
                boxShadow: hoveredId === s.id ? `0 12px 32px ${P}1a` : '0 2px 8px rgba(0,0,0,.04)',
                transition: 'border-color .2s, box-shadow .2s, transform .2s',
                transform: hoveredId === s.id ? 'translateY(-4px)' : 'none',
                cursor: 'pointer', position: 'relative',
              }}
            >
              {s.popular && (
                <span style={{
                  position: 'absolute', top: 14, right: 14,
                  background: A, color: '#fff',
                  fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px',
                }}>Popular</span>
              )}
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icono}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0c1b33', marginBottom: 6 }}>{s.nombre}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55, marginBottom: 14 }}>{s.descripcion}</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ background: `${P}12`, color: P, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 8px' }}>
                  {s.duracion}
                </span>
                <span style={{ background: `${A}12`, color: '#059669', fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 8px' }}>
                  {s.precio}
                </span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {s.beneficios.map((b, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#475569', display: 'flex', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: A }}>✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

/* ── Proceso ──────────────────────────────────────────────────────────── */
function ProcesoSection() {
  return (
    <section style={{ padding: '80px 48px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeSlide>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: 12, color: A, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              CÓMO TRABAJAMOS
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0c1b33', marginTop: 8 }}>
              Tu proceso de recuperación
            </h2>
          </div>
        </FadeSlide>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, position: 'relative' }}>
          {PROCESO_PASOS.map((paso, i) => (
            <FadeSlide key={i} delay={i * 0.1} direction="up">
              <div style={{ textAlign: 'center', padding: '0 24px', position: 'relative' }}>
                {i < PROCESO_PASOS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 28, right: 0,
                    width: '50%', height: 2,
                    background: `linear-gradient(90deg, ${P}33, transparent)`,
                  }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${P}, #0284c7)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, margin: '0 auto 16px', position: 'relative',
                  boxShadow: `0 4px 16px ${P}33`,
                }}>
                  {paso.icon}
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 20, height: 20, background: A, borderRadius: '50%',
                    fontSize: 10, fontWeight: 800, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{paso.paso}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0c1b33', marginBottom: 8 }}>{paso.titulo}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{paso.desc}</div>
              </div>
            </FadeSlide>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonios ──────────────────────────────────────────────────────── */
function TestimoniosSection() {
  const [active, setActive] = useState(0);
  return (
    <section style={{ padding: '80px 48px', background: S }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeSlide>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, color: A, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              CASOS DE ÉXITO
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0c1b33', marginTop: 8 }}>
              Lo que dicen nuestros pacientes
            </h2>
          </div>
        </FadeSlide>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {TESTIMONIOS_V2.map((t, i) => (
            <FadeSlide key={i} delay={i * 0.1}>
              <div
                onClick={() => setActive(i)}
                style={{
                  background: active === i ? '#fff' : 'rgba(255,255,255,.6)',
                  borderRadius: 16, padding: 24,
                  border: `1.5px solid ${active === i ? P : '#e2e8f0'}`,
                  boxShadow: active === i ? `0 8px 24px ${P}18` : 'none',
                  transition: 'all .25s', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${P}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0c1b33' }}>{t.nombre}</div>
                    <div style={{ fontSize: 11, color: A, fontWeight: 600 }}>{t.tratamiento}</div>
                  </div>
                </div>
              </div>
            </FadeSlide>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Equipo ───────────────────────────────────────────────────────────── */
function EquipoSection() {
  return (
    <section style={{ padding: '80px 48px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeSlide>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, color: A, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              NUESTRO EQUIPO
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0c1b33', marginTop: 8 }}>
              Fisioterapeutas especializados
            </h2>
          </div>
        </FadeSlide>

        <StaggerGrid cols={3} gap={24}>
          {PROFESIONALES_V2.map((p) => (
            <div key={p.nombre} style={{
              background: S, borderRadius: 16, padding: 28, textAlign: 'center',
              border: '1.5px solid #e0f2fe',
              transition: 'box-shadow .2s, transform .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${P}1a`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `linear-gradient(135deg, ${P}22, ${A}22)`,
                border: `3px solid ${P}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, margin: '0 auto 16px',
              }}>{p.foto}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0c1b33', marginBottom: 4 }}>{p.nombre}</div>
              <div style={{ fontSize: 13, color: A, fontWeight: 600, marginBottom: 8 }}>{p.especialidad}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{p.bio}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: P }}>{p.pacientes}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>pacientes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b' }}>{p.valoracion}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>valoración</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: A }}>{p.años}a</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>experiencia</div>
                </div>
              </div>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */
function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section style={{ padding: '80px 48px', background: S }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <FadeSlide>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, color: A, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              PREGUNTAS FRECUENTES
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0c1b33', marginTop: 8 }}>
              Resolvemos tus dudas
            </h2>
          </div>
        </FadeSlide>

        {FAQ_V2.map((faq, i) => (
          <FadeSlide key={i} delay={i * 0.07}>
            <div style={{
              background: '#fff', borderRadius: 12, marginBottom: 12,
              border: `1.5px solid ${open === i ? P : '#e2e8f0'}`,
              overflow: 'hidden', transition: 'border-color .2s',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#0c1b33',
                }}
                aria-expanded={open === i}
              >
                {faq.pregunta}
                <span style={{
                  color: P, fontWeight: 700, fontSize: 20,
                  transform: open === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform .2s',
                }}>+</span>
              </button>
              <div style={{
                maxHeight: open === i ? 200 : 0,
                overflow: 'hidden',
                transition: 'max-height .3s cubic-bezier(.22,1,.36,1)',
              }}>
                <p style={{ padding: '0 20px 16px', fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 }}>
                  {faq.respuesta}
                </p>
              </div>
            </div>
          </FadeSlide>
        ))}
      </div>
    </section>
  );
}

/* ── CTA Final ────────────────────────────────────────────────────────── */
function CtaFinal({ onCita }) {
  return (
    <FadeSlide>
      <section style={{
        padding: '80px 48px',
        background: `linear-gradient(135deg, ${P} 0%, #0284c7 60%, #0ea5e9 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            ¿Listo para empezar tu recuperación?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', marginBottom: 32 }}>
            Primera evaluación gratuita. Sin compromiso. Cupo limitado.
          </p>
          <button onClick={onCita} style={{
            background: A, color: '#fff', border: 'none',
            borderRadius: 12, padding: '16px 40px', fontSize: 17, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: `0 6px 24px ${A}55`,
            transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${A}66`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${A}55`; }}
          >
            Solicitar cita gratuita →
          </button>
          <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
            Sin tarjeta · Sin compromiso · Demo solo
          </div>
        </div>
      </section>
    </FadeSlide>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background: '#0c1b33', padding: '40px 48px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${P}, #0284c7)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 13,
        }}>FN</div>
        <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 14 }}>FisioNova</span>
      </div>
      <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
        Demo comercial · Datos 100% ficticios · FisioNova Premium V2 Pilot
      </div>
      <div style={{ fontSize: 12, color: '#475569' }}>
        © 2026 FisioNova · Fábrica SaaS V2
      </div>
    </footer>
  );
}

/* ── Booking Modal ────────────────────────────────────────────────────── */
function BookingModal({ onClose }) {
  const reduced = useReducedMotion();
  const [form, setForm] = useState({ nombre: '', telefono: '', servicio: '', mensaje: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 600);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(12,27,51,.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: reduced ? 'none' : 'modalOverlay .25s ease both',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true" role="dialog" aria-label="Solicitar cita"
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480,
        animation: reduced ? 'none' : 'modalSlide .35s cubic-bezier(.22,1,.36,1) both',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: '#f1f5f9',
            border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            fontSize: 16, color: '#64748b',
          }}
          aria-label="Cerrar"
        >✕</button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: A, fontWeight: 800, marginBottom: 8 }}>¡Solicitud recibida!</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Te contactaremos en menos de 2 horas para confirmar tu cita. Demo: no se enviará nada.
            </p>
            <button onClick={onClose} style={{
              marginTop: 20, background: P, color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600,
            }}>Cerrar</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontWeight: 800, fontSize: 20, color: '#0c1b33', marginBottom: 4 }}>Solicitar cita</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Primera evaluación gratuita. Demo: no se envían datos.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'nombre', label: 'Nombre completo', placeholder: 'Ej: Carmen López' },
                { key: 'telefono', label: 'Teléfono', placeholder: '612 345 678' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8, boxSizing: 'border-box',
                      border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = P; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Servicio</label>
                <select
                  value={form.servicio}
                  onChange={e => setForm(f => ({ ...f, servicio: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1.5px solid #e2e8f0', fontSize: 14, background: '#fff',
                  }}
                >
                  <option value="">Seleccionar servicio</option>
                  {SERVICIOS_V2.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <button type="submit" style={{
                background: `linear-gradient(135deg, ${P}, #0284c7)`, color: '#fff',
                border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', marginTop: 4,
              }}>
                Enviar solicitud
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`
        @keyframes modalOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(24px) scale(.97); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export function FisioNovaPilotLanding() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", background: BRANDING_V2.bgColor }}>
      <Nav onCita={() => setShowModal(true)} />
      <HeroSplit onCita={() => setShowModal(true)} />
      <TrustStrip />
      <ServiciosSection />
      <ProcesoSection />
      <TestimoniosSection />
      <EquipoSection />
      <FaqSection />
      <CtaFinal onCita={() => setShowModal(true)} />
      <Footer />
      {showModal && <BookingModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
