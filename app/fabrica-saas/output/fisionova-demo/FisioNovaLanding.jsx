/**
 * OUTPUT GENERADO · FisioNova (Demo) · Landing Comercial V1.7
 * Fábrica SaaS V1.7 · Dynamic Experience Engine
 * Demo comercial · Datos 100% ficticios · NO producción
 */
import { useState, useEffect, useRef } from 'react';
import { SERVICIOS, PROFESIONALES, TESTIMONIOS, HERO_METRICS, BRANDING as BD } from './FisioNovaMockData.js';

// ── Tokens V1.7 ─────────────────────────────────────────────────────────────
const C = {
  primary:    '#4338ca',
  secondary:  '#059669',
  accent:     '#7c3aed',
  bg:         '#eef2ff',
  bgWhite:    '#ffffff',
  border:     '#e0e7ff',
  text:       '#1e1b4b',
  textMuted:  '#6b7280',
};


// ── Sección: Hero ───────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #3730a3 50%, ${C.accent} 100%)`, color: '#fff', padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.8rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
        🏆 +1.200 pacientes recuperados · Fisioterapia de élite
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.1 }}>
        {BD.tagline}
      </h1>
      <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
        Fisioterapia deportiva, rehabilitación avanzada y terapia manual para que recuperes tu mejor versión.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{ background: '#fff', color: C.primary, fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
          Pedir cita (demo) →
        </button>
        <button style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, padding: '0.875rem 2rem', borderRadius: '0.75rem', border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem' }}>
          Ver servicios
        </button>
      </div>
    </section>
  );
}

// ── Sección: Métricas ───────────────────────────────────────────────────────
function MetricRow() {
  return (
    <section style={{ background: C.bgWhite, padding: '2.5rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {HERO_METRICS.map(m => (
          <SimpleMetric key={m.label} {...m} />
        ))}
      </div>
    </section>
  );
}

function SimpleMetric({ valor, label, icon }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '1.5rem 1rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: C.primary }}>{valor}</div>
      <div style={{ fontSize: '0.8rem', color: C.textMuted, marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

// ── Sección: Servicios ──────────────────────────────────────────────────────
function Servicios() {
  const [filtro, setFiltro] = useState('todos');
  const [expandido, setExpandido] = useState(null);
  const filtros = [
    { id: 'todos', label: 'Todos' },
    { id: 'deporte', label: '🏃 Deporte' },
    { id: 'columna', label: '🦴 Columna' },
    { id: 'recuperación', label: '🔄 Recuperación' },
    { id: 'prevención', label: '🛡 Prevención' },
  ];
  const visibles = filtro === 'todos' ? SERVICIOS : SERVICIOS.filter(s => s.tags.includes(filtro));
  return (
    <section style={{ background: C.bg, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: C.text, marginBottom: '0.5rem' }}>Nuestros Servicios</h2>
        <p style={{ textAlign: 'center', color: C.textMuted, marginBottom: '2rem' }}>Tratamientos especializados con tecnología de punta y equipo experto</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {filtros.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              style={{ padding: '0.5rem 1.2rem', borderRadius: '2rem', border: `1.5px solid ${filtro === f.id ? C.primary : C.border}`, background: filtro === f.id ? C.primary : '#fff', color: filtro === f.id ? '#fff' : C.textMuted, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {visibles.map(s => (
            <div key={s.id} role="button" tabIndex={0} onClick={() => setExpandido(expandido === s.id ? null : s.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setExpandido(expandido === s.id ? null : s.id)}
              aria-expanded={expandido === s.id} aria-label={s.nombre}
              style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: `1.5px solid ${expandido === s.id ? C.primary : C.border}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: expandido === s.id ? '0 4px 20px rgba(67,56,202,0.15)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{s.icono}</span>
                {s.popular && <span style={{ background: C.secondary, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>POPULAR</span>}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: '0.5rem' }}>{s.nombre}</h3>
              <p style={{ fontSize: '0.85rem', color: C.textMuted, lineHeight: 1.5, marginBottom: '0.75rem' }}>{s.desc}</p>
              {expandido === s.id && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: C.text }}>
                    <span>⏱ {s.duracion}</span>
                    <span style={{ color: C.secondary, fontWeight: 700 }}>💶 {s.precio}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                    {s.tags.map(t => <span key={t} style={{ background: C.bg, color: C.primary, fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>#{t}</span>)}
                  </div>
                  <button style={{ marginTop: '1rem', width: '100%', background: C.primary, color: '#fff', fontWeight: 700, padding: '0.65rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Reservar (demo)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Componente: paso animado con scroll trigger (V1.7 stagger-reveal) ───────
function PasoAnimado({ paso, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.25 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s` }}>
      <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: C.bg, border: `2px solid ${C.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem' }}>{paso.icon}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.primary, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>PASO {paso.num}</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: '0.5rem' }}>{paso.titulo}</h3>
      <p style={{ fontSize: '0.85rem', color: C.textMuted, lineHeight: 1.5 }}>{paso.desc}</p>
    </div>
  );
}

// ── Sección: Proceso ────────────────────────────────────────────────────────
function Proceso() {
  const pasos = [
    { num: '01', titulo: 'Primera valoración', desc: 'Evaluación completa del estado físico, historial clínico y objetivos personales.', icon: '🔍' },
    { num: '02', titulo: 'Plan personalizado', desc: 'Diseñamos un protocolo de tratamiento adaptado a tu lesión y ritmo de vida.', icon: '📋' },
    { num: '03', titulo: 'Tratamiento activo', desc: 'Sesiones con seguimiento continuo, ajustando el plan según tu evolución.', icon: '💪' },
    { num: '04', titulo: 'Alta y prevención', desc: 'Ejercicios de mantenimiento y guía para evitar recaídas a largo plazo.', icon: '🎯' },
  ];
  return (
    <section style={{ background: C.bgWhite, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: C.text, marginBottom: '0.5rem' }}>Cómo trabajamos</h2>
        <p style={{ textAlign: 'center', color: C.textMuted, marginBottom: '3rem' }}>Un proceso claro, personalizado y orientado a resultados reales</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {pasos.map((p, i) => <PasoAnimado key={p.num} paso={p} delay={i * 0.12} />)}
        </div>
      </div>
    </section>
  );
}

// ── Sección: Por qué FisioNova (Instalaciones / Diferenciales) ──────────────
function PorQue() {
  const items = [
    { icon: '🏋️', titulo: 'Sala de ejercicio equipada', desc: '200m² de equipamiento terapéutico de alta gama: camillas eléctricas, electroestimulación, ultrasonido y área de ejercicio funcional.' },
    { icon: '📱', titulo: 'App de seguimiento', desc: 'Accede a tu plan de ejercicios, progreso, citas y mensajes con tu fisioterapeuta desde el móvil. (demo)' },
    { icon: '🎓', titulo: 'Equipo en constante formación', desc: 'Todos nuestros profesionales se actualizan anualmente en las últimas técnicas y evidencia científica.' },
    { icon: '🔬', titulo: 'Valoración funcional incluida', desc: 'Test de fuerza, rango articular, análisis de movimiento y planimetría postural digital en la primera visita.' },
    { icon: '📊', titulo: 'Informe de progreso mensual', desc: 'Recibirás un informe detallado de tu evolución: dolor, movilidad, fuerza y adherencia al plan.' },
    { icon: '🤝', titulo: 'Coordinación con tu médico', desc: 'Nos coordinamos con tu traumatólogo, médico de cabecera o cirujano para garantizar la mejor continuidad asistencial.' },
  ];
  return (
    <section style={{ background: C.bg, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: C.text, marginBottom: '0.5rem' }}>¿Por qué FisioNova?</h2>
        <p style={{ textAlign: 'center', color: C.textMuted, marginBottom: '3rem' }}>Tecnología, ciencia y vocación al servicio de tu recuperación</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {items.map((item, i) => (
            <FeatureCard key={i} item={item} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ item, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ background: C.bgWhite, borderRadius: '1rem', padding: '1.5rem', border: `1.5px solid ${C.border}`, display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s` }}>
      <div style={{ fontSize: '2rem', flexShrink: 0 }}>{item.icon}</div>
      <div>
        <h3 style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{item.titulo}</h3>
        <p style={{ fontSize: '0.83rem', color: C.textMuted, lineHeight: 1.55 }}>{item.desc}</p>
      </div>
    </div>
  );
}

// ── Sección: Equipo ─────────────────────────────────────────────────────────
function TarjetaProfesionalAnimada({ p, activo, setActivo, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} role="button" tabIndex={0} onClick={() => setActivo(activo === p.id ? null : p.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActivo(activo === p.id ? null : p.id)}
      aria-expanded={activo === p.id} aria-label={p.nombre}
      style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', border: `1.5px solid ${activo === p.id ? p.color : C.border}`, cursor: 'pointer', transition: `all 0.2s, opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`, boxShadow: activo === p.id ? `0 4px 20px ${p.color}30` : 'none', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
      <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, margin: '0 auto 1rem' }}>{p.iniciales}</div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, marginBottom: '0.25rem' }}>{p.nombre}</h3>
      <p style={{ fontSize: '0.8rem', color: p.color, fontWeight: 600, marginBottom: '0.5rem' }}>{p.especialidad}</p>
      <div style={{ fontSize: '0.78rem', color: C.textMuted }}>{'⭐'.repeat(Math.floor(p.valoracion))} {p.valoracion}</div>
      {activo === p.id && (
        <div style={{ marginTop: '1rem', textAlign: 'left', borderTop: `1px solid ${C.border}`, paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.78rem', color: C.textMuted, marginBottom: '0.5rem' }}>{p.titulo}</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {p.idiomas.map(l => <span key={l} style={{ background: C.bg, color: C.primary, fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>{l}</span>)}
          </div>
          <p style={{ fontSize: '0.78rem', color: C.textMuted, marginTop: '0.5rem' }}>📊 {p.sesiones} sesiones realizadas</p>
          <p style={{ fontSize: '0.78rem', color: C.textMuted }}>🕐 {p.experiencia} de experiencia</p>
        </div>
      )}
    </div>
  );
}

function Equipo() {
  const [activo, setActivo] = useState(null);
  return (
    <section style={{ background: C.bg, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: C.text, marginBottom: '0.5rem' }}>Nuestro Equipo</h2>
        <p style={{ textAlign: 'center', color: C.textMuted, marginBottom: '2.5rem' }}>Especialistas con formación de élite y vocación por la recuperación</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {PROFESIONALES.map((p, i) => (
            <TarjetaProfesionalAnimada key={p.id} p={p} activo={activo} setActivo={setActivo} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sección: Testimonios ────────────────────────────────────────────────────
function Testimonios() {
  const [idx, setIdx] = useState(0);
  const t = TESTIMONIOS[idx];
  return (
    <section style={{ background: C.primary, color: '#fff', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem' }}>Lo que dicen nuestros pacientes</h2>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1.25rem', padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{'⭐'.repeat(t.estrellas)}</div>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem' }}>"{t.texto}"</p>
          <div style={{ fontWeight: 700 }}>{t.nombre}</div>
          <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>{t.tratamiento} · {t.edad} años · (dato ficticio)</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {TESTIMONIOS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', border: 'none', background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sección: FAQ ────────────────────────────────────────────────────────────
function FAQ() {
  const [abierto, setAbierto] = useState(null);
  const items = [
    { q: '¿Necesito derivación médica para acudir a FisioNova?', a: 'No es necesaria derivación médica. Puedes solicitar cita directamente y nuestros fisioterapeutas realizarán una valoración inicial completa.' },
    { q: '¿Cuántas sesiones necesitaré?', a: 'Depende de la lesión y tu evolución. En la primera visita te explicaremos el plan estimado. La mayoría de lesiones agudas se resuelven en 6-12 sesiones.' },
    { q: '¿Tenéis convenio con seguros médicos?', a: 'Sí, trabajamos con los principales seguros médicos (dato demo). Consulta tu póliza o contáctanos para confirmar cobertura.' },
    { q: '¿Puedo anular o cambiar mi cita?', a: 'Sí, te pedimos que lo hagas con al menos 24 horas de antelación a través de la app o por teléfono para que podamos reasignar el horario.' },
    { q: '¿Qué debo traer a la primera visita?', a: 'Ropa cómoda y si tienes informes médicos previos (radiografías, resonancias, informes de alta) tráelos también. El resto lo ponemos nosotros.' },
  ];
  return (
    <section style={{ background: C.bgWhite, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: C.text, marginBottom: '2.5rem' }}>Preguntas frecuentes</h2>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${C.border}`, padding: '1rem 0' }}>
            <button onClick={() => setAbierto(abierto === i ? null : i)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.25rem 0', gap: '1rem' }}>
              <span style={{ fontWeight: 600, color: C.text, fontSize: '0.95rem' }}>{item.q}</span>
              <span style={{ color: C.primary, fontSize: '1.2rem', flexShrink: 0 }}>{abierto === i ? '−' : '+'}</span>
            </button>
            {abierto === i && <p style={{ color: C.textMuted, fontSize: '0.9rem', lineHeight: 1.6, marginTop: '0.75rem', paddingRight: '1.5rem' }}>{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Sección: CTA Final ──────────────────────────────────────────────────────
function CTAFinal() {
  const [clicked, setClicked] = useState(false);
  return (
    <section style={{ background: `linear-gradient(135deg, ${C.secondary} 0%, #047857 100%)`, color: '#fff', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>¿Listo para recuperarte?</h2>
        <p style={{ opacity: 0.9, fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Primera valoración gratuita para nuevos pacientes. Sin compromiso.
        </p>
        <button onClick={() => setClicked(true)}
          style={{ background: '#fff', color: C.secondary, fontWeight: 800, padding: '1rem 2.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: 'transform 0.1s', transform: clicked ? 'scale(0.97)' : 'scale(1)' }}>
          {clicked ? '✅ Solicitud registrada (demo)' : 'Pedir primera cita gratuita →'}
        </button>
        <p style={{ marginTop: '1.5rem', opacity: 0.75, fontSize: '0.85rem' }}>
          📍 Demo City, España · 📞 +34 900 000 000 (ficticio) · 📧 hola@fisionova-demo.local
        </p>
      </div>
    </section>
  );
}

// ── Export ───────────────────────────────────────────────────────────────────
export function FisioNovaLanding() {
  return (
    <div>
      <Hero />
      <MetricRow />
      <Servicios />
      <Proceso />
      <PorQue />
      <Equipo />
      <Testimonios />
      <FAQ />
      <CTAFinal />
    </div>
  );
}
