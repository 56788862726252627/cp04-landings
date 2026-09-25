/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Landing Page
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 * Normativa: Decretos 101/102/103-2023 Junta de Andalucia (LEGAL verificado)
 */
import { useState, useEffect, useRef } from 'react';
import {
  BRANDING, HERO_METRICS, ETAPAS, LANDING_FEATURES, MATERIAS
} from './EducaArchidonaMockData.js';

/* ── scroll-triggered visibility hook ─────────────────────────── */
function useVisible(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── animated counter ─────────────────────────────────────────── */
function AnimatedNumber({ target, suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useVisible(0.2);
  useEffect(() => {
    if (!visible) return;
    const num = parseFloat(target);
    if (isNaN(num)) { setTimeout(() => setVal(target), 0); return; }
    const start = Date.now();
    const tick = () => {
      const pct = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round(num * pct));
      if (pct < 1) requestAnimationFrame(tick);
      else setVal(num);
    };
    requestAnimationFrame(tick);
  }, [visible, target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── section wrapper with fade-in ─────────────────────────────── */
function Section({ children, style = {} }) {
  const [ref, visible] = useVisible();
  return (
    <section
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity .6s ease, transform .6s ease',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/* ── badge de normativa ────────────────────────────────────────── */
function NormativaBadge({ status, source }) {
  const colors = { LEGAL: '#16a34a', INFERRED: '#f59e0b', UNVERIFIED: '#ef4444' };
  return (
    <span style={{
      fontSize: 10, padding: '2px 6px', borderRadius: 4, marginLeft: 6,
      background: colors[status] || '#6b7280', color: '#fff', fontWeight: 700,
    }}>
      {status} · {source}
    </span>
  );
}

/* ── main component ────────────────────────────────────────────── */
export function EducaArchidonaLanding() {
  const [etapaActiva, setEtapaActiva] = useState('primaria');

  const materiasFiltradas = MATERIAS.filter(m => m.etapa === etapaActiva);

  return (
    <div style={{ background: BRANDING.bgColor, minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)',
        color: '#fff', padding: '64px 24px 48px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎓</div>
        <h1 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 8px', letterSpacing: -1 }}>
          {BRANDING.nombre}
        </h1>
        <p style={{ fontSize: 20, opacity: .85, margin: '0 0 24px' }}>
          {BRANDING.tagline}
        </p>
        <p style={{ fontSize: 15, opacity: .7, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Una plataforma educativa completa para Primaria, ESO y Bachillerato.
          Seguimiento por materia, Tutor IA y contenidos adaptados a cada etapa.
        </p>
        {/* Metrics */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32 }}>
          {HERO_METRICS.map((m, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {/^\d+$/.test(m.valor)
                  ? <AnimatedNumber target={Number(m.valor)} />
                  : m.valor}
              </div>
              <div style={{ fontSize: 12, opacity: .75 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <span style={{
            background: '#ffffff22', border: '1px solid #ffffff44',
            borderRadius: 20, padding: '6px 16px', fontSize: 12,
          }}>
            Demo comercial · Sin datos reales · Normativa Junta de Andalucia
          </span>
        </div>
      </div>

      {/* ETAPAS */}
      <Section style={{ padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1e3a8a', marginBottom: 8 }}>
          Tres etapas educativas
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 32 }}>
          Basadas en los Decretos 101, 102 y 103/2023 de la Junta de Andalucia
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {ETAPAS.map(e => (
            <button
              key={e.id}
              onClick={() => setEtapaActiva(e.id)}
              style={{
                padding: '14px 28px', borderRadius: 12, border: '2px solid',
                borderColor: etapaActiva === e.id ? e.color : '#e2e8f0',
                background:  etapaActiva === e.id ? e.color : '#fff',
                color:       etapaActiva === e.id ? '#fff'  : '#334155',
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                boxShadow: etapaActiva === e.id ? '0 4px 12px rgba(0,0,0,.15)' : 'none',
                transition: 'all .2s',
              }}
              aria-pressed={etapaActiva === e.id}
            >
              {e.icon} {e.nombre}
              <div style={{ fontSize: 11, opacity: .8, fontWeight: 400, marginTop: 2 }}>
                {e.cursos.length} cursos
              </div>
            </button>
          ))}
        </div>
        {/* Etapa detail */}
        {ETAPAS.filter(e => e.id === etapaActiva).map(e => (
          <div key={e.id} style={{
            background: '#fff', borderRadius: 16, padding: 28,
            boxShadow: '0 4px 20px rgba(0,0,0,.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{e.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: e.color }}>{e.nombre}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{e.normativa}
                  <NormativaBadge status={e.verificationStatus} source="BOJA 90/2023" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {e.cursos.map(c => (
                <span key={c} style={{
                  background: e.color + '15', color: e.color,
                  border: `1px solid ${e.color}30`,
                  borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 500,
                }}>
                  {c}
                </span>
              ))}
            </div>
            {e.modalidades && (
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Modalidades Bachillerato:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {e.modalidades.map(m => (
                    <span key={m.id} style={{
                      background: '#f0fdf4', color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: 8, padding: '4px 12px', fontSize: 13,
                    }}>
                      ✓ {m.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                Materias principales ({materiasFiltradas.filter(m => m.tipo === 'comun').length} comunes
                {materiasFiltradas.filter(m => m.tipo !== 'comun').length > 0
                  ? ` + ${materiasFiltradas.filter(m => m.tipo !== 'comun').length} especificas`
                  : ''}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {materiasFiltradas.slice(0, 8).map(m => (
                  <span key={m.id} style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#475569',
                  }}>
                    {m.icon} {m.nombre}
                    <NormativaBadge status={m.verificationStatus} source={m.normativaSource} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* FEATURES */}
      <Section style={{ background: '#fff', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1e3a8a', marginBottom: 8 }}>
            Todo lo que necesita tu centro
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 36 }}>
            Plataforma completa para alumnos, profesores y familias
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {LANDING_FEATURES.map((f, i) => (
              <div key={i} style={{
                background: '#eff6ff', borderRadius: 14, padding: '24px 20px',
                border: '1px solid #bfdbfe',
                transition: 'transform .2s, box-shadow .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,78,216,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: 6 }}>{f.titulo}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ROLES */}
      <Section style={{ padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1e3a8a', marginBottom: 8 }}>
          Experiencia adaptada a cada rol
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 36 }}>
          Selecciona tu rol en el menu superior para explorar la demo
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: '🧑‍🎓', rol: 'Alumno', desc: 'Mi Aula, progreso, Tutor IA, ejercicios, gamificacion', color: '#1d4ed8' },
            { icon: '👩‍🏫', rol: 'Profesor', desc: 'Vision de grupo, seguimiento, tareas y evaluacion', color: '#16a34a' },
            { icon: '👨‍👩‍👧', rol: 'Familia', desc: 'Progreso, calendario, asistencia y comunicaciones', color: '#f59e0b' },
            { icon: '⚙️', rol: 'Admin', desc: 'Gestion de cursos, usuarios, materias y configuracion', color: '#7c3aed' },
          ].map((r, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: 20,
              border: `2px solid ${r.color}20`,
              boxShadow: '0 2px 12px rgba(0,0,0,.05)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, color: r.color, fontSize: 16, marginBottom: 6 }}>{r.rol}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* AI TUTOR */}
      <Section style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Tutor IA Educativo</h2>
          <p style={{ opacity: .85, lineHeight: 1.7, marginBottom: 24 }}>
            Disponible 24/7 para explicar conceptos, dar pistas y preparar repasos.
            Disenado para menores con proteccion de datos y transparencia total.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Explicar conceptos', 'Dar pistas', 'Mini quizzes', 'Resumir temas'].map((cap, i) => (
              <span key={i} style={{
                background: '#ffffff20', border: '1px solid #ffffff30',
                borderRadius: 20, padding: '6px 16px', fontSize: 13,
              }}>
                ✓ {cap}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: 24, background: '#ffffff15', borderRadius: 12,
            padding: '12px 20px', border: '1px solid #ffffff25',
            display: 'inline-block',
          }}>
            <span style={{ fontSize: 12, opacity: .8 }}>
              Badge Demo · Sin IA real · Sin datos almacenados · RGPD compliant
            </span>
          </div>
        </div>
      </Section>

      {/* PRIVACIDAD */}
      <Section style={{ background: '#f0fdf4', padding: '36px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', color: '#166534', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            Privacidad y seguridad de menores
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: '🔒', texto: 'Cero datos reales de alumnos en la demo' },
              { icon: '📋', texto: 'RGPD + LOPD-GDD · Privacy by Design' },
              { icon: '👨‍👩‍👧', texto: 'Control parental para menores de 14' },
              { icon: '🏷️', texto: 'IA siempre identificada como asistente' },
            ].map((p, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 10, padding: '14px 16px',
                border: '1px solid #bbf7d0', display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>{p.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section style={{ background: '#1d4ed8', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ color: '#fff' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Prueba la demo completa
          </h2>
          <p style={{ opacity: .85, marginBottom: 28, fontSize: 15 }}>
            Explora todos los roles y funcionalidades. Sin registro, sin datos reales.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Como Alumno', 'Como Profesor', 'Como Familia', 'Panel Admin'].map((cta, i) => (
              <span key={i} style={{
                background: i === 0 ? '#fff' : '#ffffff20',
                color: i === 0 ? '#1d4ed8' : '#fff',
                border: '2px solid',
                borderColor: i === 0 ? '#fff' : '#ffffff40',
                borderRadius: 10, padding: '10px 22px',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>
                {['🧑‍🎓','👩‍🏫','👨‍👩‍👧','⚙️'][i]} {cta}
              </span>
            ))}
          </div>
          <p style={{ marginTop: 24, fontSize: 11, opacity: .6 }}>
            Fabrica SaaS V1.8 · Demo educativa · Datos 100% ficticios
          </p>
        </div>
      </Section>
    </div>
  );
}
