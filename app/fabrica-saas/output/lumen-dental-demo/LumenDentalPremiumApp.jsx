/**
 * Lumen Dental — Premium V2
 * Experiencia comercial lista para vender a clínica (3.000–5.000 €)
 * Login multirol · Dashboard por rol · Landing premium
 * NO_REAL_EXTERNAL_ACTION=SI · isReal:false en todos los outputs
 */
import { useState, useEffect } from 'react';
import {
  SERVICIOS, PROFESIONALES, AGENDA_HOY, PACIENTES,
  PRESUPUESTOS, LEADS, METRICAS, AUTOMATIZACIONES,
  AGENTES_IA, EMAIL_TEMPLATES, SEO_DATA,
  SOCIAL_POSTS,
} from './LumenDentalMockData.js';

// ─── Diseño ──────────────────────────────────────────────────────────────────
const C = {
  primary:   '#0369A1',
  primaryL:  '#0EA5E9',
  accent:    '#F59E0B',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  bg:        '#0B1426',
  surface:   '#111827',
  card:      '#1A2438',
  border:    '#1E3A5F',
  text:      '#F1F5F9',
  muted:     '#94A3B8',
  white:     '#FFFFFF',
  // landing (light)
  lBg:       '#F8FAFC',
  lSurface:  '#FFFFFF',
  lText:     '#0F172A',
  lMuted:    '#64748B',
  lBorder:   '#E2E8F0',
};

// ─── Auth / Roles ─────────────────────────────────────────────────────────────
const ROLES = {
  admin: {
    id: 'admin', label: 'Administración', icon: '🏛️',
    color: C.primary,
    user: 'admin@lumen.demo', pass: 'Admin2026#',
    desc: 'Acceso total: dashboard ejecutivo, CRM, facturación, integraciones.',
    nav: [
      { id: 'overview',        icon: '📊', label: 'Dashboard' },
      { id: 'agenda',          icon: '📅', label: 'Agenda' },
      { id: 'pacientes',       icon: '🦷', label: 'Pacientes' },
      { id: 'facturacion',     icon: '💰', label: 'Facturación' },
      { id: 'marketing',       icon: '📣', label: 'Marketing' },
      { id: 'automatizaciones',icon: '⚡', label: 'Automatizaciones' },
      { id: 'agentes',         icon: '🤖', label: 'Agentes IA' },
      { id: 'integraciones',   icon: '🔌', label: 'Integraciones' },
    ],
  },
  staff: {
    id: 'staff', label: 'Recepción / Staff', icon: '🗂️',
    color: '#7C3AED',
    user: 'recepcion@lumen.demo', pass: 'Staff2026#',
    desc: 'Agenda, check-in pacientes, mensajes y presupuestos básicos.',
    nav: [
      { id: 'agenda',    icon: '📅', label: 'Agenda del día' },
      { id: 'pacientes', icon: '🦷', label: 'Pacientes' },
      { id: 'checkin',   icon: '✅', label: 'Check-in' },
      { id: 'mensajes',  icon: '💬', label: 'Mensajes' },
    ],
  },
  dentist: {
    id: 'dentist', label: 'Odontólogo/a', icon: '👩‍⚕️',
    color: C.success,
    user: 'dra.vidal@lumen.demo', pass: 'Dent2026#',
    desc: 'Agenda propia, historial clínico, tratamientos y presupuestos.',
    nav: [
      { id: 'mi_agenda',    icon: '📅', label: 'Mi Agenda' },
      { id: 'historial',    icon: '📋', label: 'Historial Clínico' },
      { id: 'tratamientos', icon: '💊', label: 'Tratamientos' },
      { id: 'presupuestos', icon: '📝', label: 'Presupuestos' },
    ],
  },
  marketing: {
    id: 'marketing', label: 'Marketing / Comercial', icon: '📊',
    color: C.accent,
    user: 'marketing@lumen.demo', pass: 'Mkt2026#',
    desc: 'KPIs, leads, campañas de email, social media y SEO.',
    nav: [
      { id: 'kpis',   icon: '📊', label: 'KPIs' },
      { id: 'leads',  icon: '👥', label: 'Leads' },
      { id: 'email',  icon: '📧', label: 'Email Campaigns' },
      { id: 'social', icon: '📣', label: 'Social Media' },
      { id: 'seo',    icon: '🔍', label: 'SEO' },
    ],
  },
  patient: {
    id: 'patient', label: 'Paciente Demo', icon: '🧑',
    color: '#EC4899',
    user: 'paciente@lumen.demo', pass: 'Pac2026#',
    desc: 'Mis citas, historial personal, documentos y facturas.',
    nav: [
      { id: 'mis_citas',   icon: '📅', label: 'Mis Citas' },
      { id: 'historial_p', icon: '📋', label: 'Mi Historial' },
      { id: 'facturas',    icon: '💳', label: 'Facturas' },
      { id: 'mensajes_p',  icon: '💬', label: 'Mensajes' },
    ],
  },
};

// ─── Fondos premium por rol (Login split-panel) ───────────────────────────────
const ROLE_BG = {
  _default: {
    grad: `linear-gradient(140deg, #071e3d 0%, ${C.primary} 60%, #0c3460 100%)`,
    overlay: 'radial-gradient(circle at 20% 80%, rgba(14,165,233,0.25) 0%, transparent 45%), radial-gradient(circle at 80% 15%, rgba(3,105,161,0.35) 0%, transparent 40%)',
    headline: 'Bienvenido/a a Lumen Dental',
    sub: 'La plataforma digital de tu clínica dental premium.',
    points: ['Gestión integral de pacientes', 'Automatizaciones inteligentes', 'Seguimiento en tiempo real', 'Datos 100% seguros'],
    accent: C.primaryL,
  },
  admin: {
    grad: 'linear-gradient(140deg, #071524 0%, #0B2545 45%, #0E3F6B 100%)',
    overlay: 'radial-gradient(circle at 15% 20%, rgba(3,105,161,0.4) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(6,182,212,0.2) 0%, transparent 35%)',
    headline: 'Control total.\nDecisiones inteligentes.',
    sub: 'Panel ejecutivo con visión 360° del negocio.',
    points: ['KPIs ejecutivos en tiempo real', 'CRM + pipeline de conversión', '20 automatizaciones activas', '16 integraciones auditadas'],
    accent: C.primaryL,
  },
  staff: {
    grad: 'linear-gradient(140deg, #1E1B4B 0%, #312E81 50%, #1e3a5f 100%)',
    overlay: 'radial-gradient(circle at 30% 70%, rgba(124,58,237,0.35) 0%, transparent 45%), radial-gradient(circle at 75% 15%, rgba(99,102,241,0.25) 0%, transparent 40%)',
    headline: 'La primera sonrisa\nempieza aquí.',
    sub: 'Recepción moderna. Gestión ágil. Pacientes felices.',
    points: ['Agenda del día en tiempo real', 'Check-in en un clic', 'Comunicación directa', 'Alertas automáticas'],
    accent: '#A78BFA',
  },
  dentist: {
    grad: 'linear-gradient(140deg, #052e16 0%, #065f46 45%, #0f2437 100%)',
    overlay: 'radial-gradient(circle at 25% 30%, rgba(16,185,129,0.3) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(5,150,105,0.2) 0%, transparent 40%)',
    headline: 'Tecnología al servicio\nde la salud.',
    sub: 'Tu consulta digital. Precisa, rápida y sin papeles.',
    points: ['Agenda propia filtrada', 'Historial clínico digital', 'Presupuestos en segundos', 'Seguimiento de tratamientos'],
    accent: '#34D399',
  },
  marketing: {
    grad: 'linear-gradient(140deg, #1c1007 0%, #78350f 45%, #1c0e2e 100%)',
    overlay: 'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 70%, rgba(251,191,36,0.2) 0%, transparent 40%)',
    headline: 'Convierte datos\nen pacientes.',
    sub: 'Pipeline de leads, campañas, SEO y social desde un panel.',
    points: ['KPIs de captación en vivo', 'Leads con scoring automático', 'Email + Social + SEO', 'ROI por canal de captación'],
    accent: '#FCD34D',
  },
  patient: {
    grad: 'linear-gradient(140deg, #0b1426 0%, #0c4a6e 50%, #0369a1 100%)',
    overlay: 'radial-gradient(circle at 50% 80%, rgba(14,165,233,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.15) 0%, transparent 40%)',
    headline: 'Tu salud,\nen tus manos.',
    sub: 'Tu espacio personal seguro. Citas, historial y facturas.',
    points: ['Citas online en segundos', 'Historial siempre disponible', 'Facturas y presupuestos PDF', 'Mensajes con tu clínica'],
    accent: '#F9A8D4',
  },
};

// ─── Componentes base ─────────────────────────────────────────────────────────
function Pill({ label, color, sm }) {
  const c = color || C.primary;
  return (
    <span style={{
      background: c + '22', color: c, border: `1px solid ${c}44`,
      borderRadius: 20, padding: sm ? '2px 8px' : '3px 10px',
      fontSize: sm ? 10 : 11, fontWeight: 700, display: 'inline-block',
    }}>{label}</span>
  );
}
function Kpi({ label, value, sub, color, icon, trend }) {
  // trend: { dir: 'up'|'down', pct: '12%', label?: 'vs mes ant.' }
  const trendColor = trend?.dir === 'up' ? C.success : C.danger;
  const trendArrow = trend?.dir === 'up' ? '↑' : '↓';
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', transition: '0.2s' }}>
      {icon && <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>}
      <div style={{ fontSize: 26, fontWeight: 900, color: color || C.primary, letterSpacing: '-0.5px' }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 11, color: trendColor, fontWeight: 700, marginTop: 2 }}>
          {trendArrow} {trend.pct}
          {trend.label && <span style={{ color: C.muted, fontWeight: 400 }}> {trend.label}</span>}
        </div>
      )}
      <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function StatusDot({ ok }) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: ok ? C.success : C.danger, marginRight: 6 }} />;
}
function Bar({ pct, color }) {
  return (
    <div style={{ background: C.surface, borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color || C.primary, borderRadius: 4, transition: '0.4s' }} />
    </div>
  );
}
// ─── LANDING PAGE (tema claro, comercial) ─────────────────────────────────────
function LandingPage({ onLogin }) {
  const [hoveredSvc, setHoveredSvc] = useState(null);
  const S = { color: C.lText, background: C.lBg, fontFamily: "'DM Sans','Inter',system-ui,sans-serif" };
  const btn = (label, primary, fn) => (
    <button onClick={fn} style={{
      background: primary ? C.primary : 'transparent',
      color: primary ? C.white : C.primary,
      border: `2px solid ${C.primary}`,
      borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
      transition: '0.15s',
    }}>{label}</button>
  );
  const testimonios = [
    { texto: '"Llevo 3 años siendo paciente de Lumen Dental. El equipo es increíble y el resultado fue mejor de lo que esperaba."', nombre: 'Ana G. · Ortodoncia (ficticio)' },
    { texto: '"Los implantes fueron la mejor decisión de mi vida. Sin dolor, sin esperas, con financiación real."', nombre: 'Luis M. · Implantología (ficticio)' },
    { texto: '"Primera clínica donde no le tengo miedo al sillón. Los doctores son humanos de verdad."', nombre: 'Rosa F. · Revisión anual (ficticio)' },
  ];
  return (
    <div style={S}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.lBorder}`, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🦷</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: C.primary }}>Lumen Dental</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Servicios', 'Equipo', 'Precios', 'Blog'].map(l => <a key={l} href="#" style={{ color: C.lMuted, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{l}</a>)}
          <button onClick={onLogin} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Área Privada
          </button>
        </div>
      </nav>

      {/* HERO — dual column */}
      <section style={{ background: `linear-gradient(135deg, #071e3d 0%, ${C.primary} 50%, #0c3460 100%)`, padding: '0 0 0', position: 'relative', overflow: 'hidden', minHeight: 560, display: 'flex', alignItems: 'stretch' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 10% 80%, rgba(14,165,233,0.18) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(245,158,11,0.12) 0%, transparent 45%)', pointerEvents: 'none' }} />
        {/* Decorative ring */}
        <div style={{ position: 'absolute', right: -120, top: '50%', transform: 'translateY(-50%)', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px', width: '100%', display: 'flex', gap: 48, alignItems: 'center', position: 'relative' }}>
          {/* Left column */}
          <div style={{ flex: '1 1 52%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 24, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: C.accent }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
              Primera visita gratuita · Sin compromiso
            </div>
            <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(34px, 4vw, 56px)', fontWeight: 900, color: C.white, lineHeight: 1.12, letterSpacing: '-0.5px' }}>
              Tu sonrisa merece<br />
              <span style={{ background: `linear-gradient(90deg, ${C.accent} 0%, #FDE68A 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                el mejor cuidado
              </span>
            </h1>
            <p style={{ color: 'rgba(186,230,253,0.9)', fontSize: 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Clínica dental de referencia en Málaga. Tecnología de vanguardia, especialistas con más de 15 años de experiencia y financiación hasta 24 meses sin intereses.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              {btn('Pedir cita gratis →', true, onLogin)}
              {btn('Ver tratamientos', false, () => {})}
            </div>
          </div>
          {/* Right column — visual card */}
          <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontWeight: 600 }}>Próximas citas disponibles</div>
              {AGENDA_HOY.slice(0, 3).map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ background: C.primary + '44', color: C.primaryL, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 800, minWidth: 50, textAlign: 'center' }}>{c.hora}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{c.tratamiento}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{c.prof}</div>
                  </div>
                  <Pill label={c.estado} color={c.estado === 'urgente' ? C.danger : c.estado === 'confirmada' ? C.success : C.muted} sm />
                </div>
              ))}
              <button onClick={onLogin} style={{ marginTop: 16, width: '100%', background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Solicitar cita →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['🔬', '3D Scan', 'Diagnóstico digital'], ['💳', '0% interés', '24 meses'], ['⚡', 'Urgencias', 'Mismo día'], ['📱', 'App propia', 'Sin papeles']].map(([ic, t, s]) => (
                <div key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{ic}</div>
                  <div style={{ fontSize: 12, color: C.white, fontWeight: 700 }}>{t}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section style={{ background: C.lBg, padding: '72px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: C.primary, textTransform: 'uppercase', marginBottom: 8 }}>Nuestros tratamientos</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.lText, margin: 0 }}>Todo lo que tu sonrisa necesita</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {SERVICIOS.map(s => (
              <div key={s.id}
                onMouseOver={() => setHoveredSvc(s.id)} onMouseOut={() => setHoveredSvc(null)}
                style={{
                  background: hoveredSvc === s.id ? C.primary : C.lSurface,
                  border: `1px solid ${hoveredSvc === s.id ? C.primary : C.lBorder}`,
                  borderRadius: 14, padding: 22, cursor: 'pointer', transition: '0.2s',
                  boxShadow: hoveredSvc === s.id ? `0 8px 24px ${C.primary}33` : '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icono}</div>
                <div style={{ fontWeight: 700, color: hoveredSvc === s.id ? C.white : C.lText, fontSize: 15, marginBottom: 4 }}>{s.nombre}</div>
                <div style={{ color: hoveredSvc === s.id ? '#BAE6FD' : C.primary, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>{s.precioDesde}</div>
                <div style={{ color: hoveredSvc === s.id ? 'rgba(255,255,255,0.75)' : C.lMuted, fontSize: 12, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section style={{ background: C.lSurface, padding: '72px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.lText, margin: '0 0 12px' }}>¿Por qué Lumen Dental?</h2>
            <p style={{ color: C.lMuted, fontSize: 16 }}>Porque la tecnología sin humanidad no sirve de nada.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { icon: '🔬', title: 'Diagnóstico 3D', desc: 'Escáner intraoral digital, radiografía panorámica y planificación 3D para resultados exactos.' },
              { icon: '💳', title: 'Financiación real', desc: 'Hasta 24 meses sin intereses con aprobación en clínica, sin bancos ni papeleo externo.' },
              { icon: '🏥', title: 'Sin dolor garantizado', desc: 'Anestesia digital y sedación consciente para pacientes con miedo al dentista.' },
              { icon: '⚡', title: 'Urgencias mismo día', desc: 'Atendemos dolor agudo, fracturas y abscesos sin esperar días. Llama y ven.' },
              { icon: '📱', title: 'Gestión digital', desc: 'Citas online, recordatorios automáticos, historial en tu móvil. Sin papeles.' },
              { icon: '⭐', title: 'Garantía de resultados', desc: 'Todos nuestros tratamientos cuentan con garantía escrita y seguimiento incluido.' },
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: C.primary + '12', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, color: C.lText, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: C.lMuted, fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section style={{ background: C.lBg, padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.lText, margin: '0 0 8px' }}>Nuestro equipo</h2>
          <p style={{ color: C.lMuted, marginBottom: 40 }}>Especialistas con más de 15 años de experiencia combinada.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {PROFESIONALES.map(p => (
              <div key={p.id} style={{ background: C.lSurface, border: `1px solid ${C.lBorder}`, borderRadius: 14, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>{p.avatar}</div>
                <div style={{ fontWeight: 700, color: C.lText, fontSize: 14, marginBottom: 4 }}>{p.nombre}</div>
                <div style={{ color: C.primary, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{p.especialidad}</div>
                <div style={{ fontSize: 11, color: C.lMuted }}>{p.colegiado}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ background: `linear-gradient(135deg, #0B2545 0%, ${C.primary} 100%)`, padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.white, margin: '0 0 40px' }}>Lo que dicen nuestros pacientes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {testimonios.map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: 24, textAlign: 'left' }}>
                <div style={{ fontSize: 24, marginBottom: 10, color: C.accent }}>★★★★★</div>
                <p style={{ color: '#E0F2FE', fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>{t.texto}</p>
                <div style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600 }}>{t.nombre}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: C.lBg, padding: '72px 32px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: C.primary, textTransform: 'uppercase', marginBottom: 8 }}>Preguntas frecuentes</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: C.lText, margin: 0 }}>Todo lo que quieres saber</h2>
          </div>
          {[
            { q: '¿Duele un implante dental?', a: 'El procedimiento se realiza bajo anestesia local. La mayoría de pacientes lo describen como indoloro durante la intervención y con molestias leves las primeras 24-48h.' },
            { q: '¿Cuánto tiempo dura un tratamiento de ortodoncia?', a: 'Depende del caso. Los alineadores Invisalign suelen durar entre 6 y 18 meses. La ortodoncia tradicional puede extenderse 18-24 meses en casos complejos.' },
            { q: '¿Ofrecéis financiación?', a: 'Sí. Ofrecemos financiación propia hasta 24 meses sin intereses, aprobada en clínica en el mismo día, sin trámites externos.' },
            { q: '¿Cuándo puedo pedir cita para urgencias?', a: 'Atendemos urgencias el mismo día. Llámanos y te asignamos el primer hueco disponible, habitualmente en menos de 2 horas.' },
            { q: '¿Tiene la clínica parking?', a: 'Disponemos de plazas de aparcamiento en el edificio y zona de parking gratuito en la calle adyacente.' },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.lBorder}`, padding: '20px 0' }}>
              <div style={{ fontWeight: 700, color: C.lText, fontSize: 15, marginBottom: 8 }}>
                <span style={{ color: C.primary, marginRight: 10 }}>Q.</span>{faq.q}
              </div>
              <div style={{ color: C.lMuted, fontSize: 14, lineHeight: 1.6, paddingLeft: 22 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: `linear-gradient(135deg, #071e3d 0%, ${C.primary} 100%)`, padding: '80px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(14,165,233,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 14, color: C.accent, fontWeight: 700, marginBottom: 12, letterSpacing: '0.04em' }}>PRIMERA CONSULTA GRATUITA</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: C.white, margin: '0 0 14px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Empieza hoy tu camino<br />hacia la sonrisa perfecta</h2>
          <p style={{ color: 'rgba(186,230,253,0.85)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>Sin compromiso. Sin papeleos. Ven, conoce al equipo y descubre qué podemos hacer.</p>
          <button onClick={onLogin} style={{ background: C.white, color: C.primary, border: 'none', borderRadius: 12, padding: '16px 44px', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.25)' }}>
            Pedir cita gratis →
          </button>
          <div style={{ marginTop: 24, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            📞 +34 951 000 001 &nbsp;·&nbsp; 📧 hola@lumendental.demo &nbsp;·&nbsp; C/ Larios 12, Málaga
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0B1120', padding: '40px 32px 24px', color: '#64748B' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🦷</span>
              <span style={{ color: C.white, fontWeight: 800 }}>Lumen Dental</span>
            </div>
            <p style={{ fontSize: 12, maxWidth: 240 }}>Clínica dental en Málaga. Tecnología de vanguardia, trato humano. (Demo ficticio)</p>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            {[['Servicios', ['Ortodoncia','Implantes','Estética','Odontopediatría']], ['Clínica', ['Equipo','Financiación','Blog','Contacto']]].map(([title, items]) => (
              <div key={title}>
                <div style={{ color: C.white, fontWeight: 700, marginBottom: 10, fontSize: 13 }}>{title}</div>
                {items.map(i => <div key={i} style={{ fontSize: 12, marginBottom: 6 }}><a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>{i}</a></div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 16, textAlign: 'center', fontSize: 11 }}>
          © 2026 Lumen Dental · Datos demo 100% ficticios · No conectado a sistemas reales · Fábrica SaaS V1.8
        </div>
      </footer>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onBack }) {
  const [selected, setSelected] = useState(null);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selected) return;
    const role = ROLES[selected];
    if (pass === role.pass || pass === '') { onLogin(selected); }
    else { setError('Contraseña incorrecta. Usa la mostrada en las credenciales demo.'); }
  };

  const bg = ROLE_BG[selected] || ROLE_BG._default;
  const roleColor = selected ? ROLES[selected].color : C.primaryL;

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: "'DM Sans','Inter',system-ui,sans-serif", overflow: 'hidden' }}>
      {/* LEFT — visual panel */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: bg.grad, transition: 'background 0.5s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 44px',
      }}>
        {/* Overlay pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: bg.overlay, pointerEvents: 'none', transition: '0.5s' }} />
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', border: `1px solid ${roleColor}22`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', border: `1px solid ${roleColor}18`, pointerEvents: 'none' }} />
        {/* Logo top-left */}
        <div style={{ position: 'absolute', top: 32, left: 44, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🦷</span>
          <span style={{ fontWeight: 800, color: C.white, fontSize: 18, letterSpacing: '-0.3px' }}>Lumen Dental</span>
        </div>
        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            margin: '0 0 12px', fontSize: 34, fontWeight: 900, color: C.white,
            lineHeight: 1.2, letterSpacing: '-0.5px', whiteSpace: 'pre-line',
          }}>{bg.headline}</h2>
          <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6 }}>{bg.sub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bg.points.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: bg.accent + '33', border: `1px solid ${bg.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: bg.accent, fontWeight: 800 }}>✓</span>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom badge */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: '8px 16px', width: 'fit-content' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, display: 'inline-block', boxShadow: `0 0 6px ${C.success}` }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Sistema activo · Datos 100% ficticios</span>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{ width: 420, background: C.surface, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 36px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: C.white }}>Acceso al sistema</h3>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Selecciona tu perfil para continuar</p>
        </div>

        {/* Role buttons — vertical list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {Object.values(ROLES).map(r => (
            <button key={r.id} onClick={() => { setSelected(r.id); setPass(''); setError(''); }} style={{
              background: selected === r.id ? r.color + '18' : 'transparent',
              border: `1.5px solid ${selected === r.id ? r.color : C.border}`,
              borderRadius: 10, padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12, transition: '0.15s',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: selected === r.id ? r.color : C.text, fontSize: 13 }}>{r.label}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{r.user}</div>
              </div>
              {selected === r.id && (
                <span style={{ fontSize: 10, color: r.color, fontWeight: 700, background: r.color + '18', padding: '2px 8px', borderRadius: 10 }}>activo</span>
              )}
            </button>
          ))}
        </div>

        {/* Credentials hint + password */}
        {selected && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: ROLES[selected].color + '12', border: `1px solid ${ROLES[selected].color}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12 }}>
              <span style={{ color: C.muted }}>Contraseña demo: </span>
              <span style={{ color: ROLES[selected].color, fontWeight: 800, letterSpacing: '0.05em' }}>{ROLES[selected].pass}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                placeholder="Contraseña (o deja vacío)"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ flex: 1, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '11px 14px', color: C.text, fontSize: 13, outline: 'none' }}
              />
              <button onClick={handleLogin} style={{
                background: ROLES[selected].color, color: C.white, border: 'none',
                borderRadius: 8, padding: '11px 20px', fontWeight: 800, cursor: 'pointer', fontSize: 13,
                whiteSpace: 'nowrap',
              }}>Entrar →</button>
            </div>
            {error && <div style={{ color: C.danger, fontSize: 12, marginTop: 8 }}>⚠️ {error}</div>}
          </div>
        )}

        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12, padding: 0, textAlign: 'left' }}>
          ← Volver a la landing de Lumen Dental
        </button>
      </div>
    </div>
  );
}

// ─── APP SHELL (autenticado) ──────────────────────────────────────────────────
function AppShell({ role, page, onPage, onLogout, children }) {
  const R = ROLES[role];
  const currentNav = R.nav.find(n => n.id === page);
  const notifCount = role === 'admin' ? 3 : role === 'staff' ? 2 : 0;
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 228, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryL})`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: `0 2px 8px ${C.primary}55` }}>🦷</div>
            <div>
              <div style={{ fontWeight: 800, color: C.white, fontSize: 14, letterSpacing: '-0.2px' }}>Lumen Dental</div>
              <div style={{ fontSize: 10, color: R.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{R.label}</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {R.nav.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => onPage(item.id)} style={{
                width: '100%', background: active ? R.color + '18' : 'transparent',
                border: 'none', borderRadius: 8,
                color: active ? R.color : C.muted,
                padding: '10px 12px', cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                fontSize: 13, fontWeight: active ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: active ? `inset 2px 0 0 ${R.color}` : 'none',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'overview' && notifCount > 0 && (
                  <span style={{ background: C.danger, color: C.white, fontSize: 9, fontWeight: 800, borderRadius: 10, padding: '1px 6px', minWidth: 16, textAlign: 'center' }}>{notifCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        {/* User footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, background: R.color + '22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, border: `1.5px solid ${R.color}44` }}>{R.icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, color: C.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{R.user.split('@')[0]}</div>
              <div style={{ fontSize: 10, color: C.muted }}>@lumen.demo</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, padding: '6px 0', cursor: 'pointer', fontSize: 11, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>↩</span> Cerrar sesión
          </button>
        </div>
      </div>
      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 52, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: C.muted }}>Lumen Dental</span>
            <span style={{ fontSize: 11, color: C.muted }}> / </span>
            <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{currentNav?.label || page}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: C.muted, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px' }}>
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {notifCount > 0 && (
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => demoToast(`🔔 ${notifCount} notificaciones pendientes`)}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔔</div>
                <span style={{ position: 'absolute', top: -4, right: -4, background: C.danger, color: C.white, fontSize: 9, fontWeight: 800, borderRadius: 8, padding: '1px 5px', minWidth: 14, textAlign: 'center' }}>{notifCount}</span>
              </div>
            )}
          </div>
        </div>
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: C.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── DASHBOARDS por rol ───────────────────────────────────────────────────────

// Shared header
function PageHeader({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>{title}</h2>
        {badge && <Pill label={badge} color={C.accent} />}
      </div>
      {subtitle && <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}

// ── ADMIN PAGES ──
function AdminOverview() {
  return (
    <div>
      <PageHeader title="Dashboard Ejecutivo" subtitle={`Lumen Dental · ${new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })}`} badge="Admin" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        <Kpi icon="📅" label="Citas hoy" value={METRICAS.citasHoy} color={C.primary} trend={{ dir: 'up', pct: '+2', label: 'vs ayer' }} />
        <Kpi icon="👥" label="Nuevos pacientes" value={METRICAS.nuevosPacientes} color={C.success} trend={{ dir: 'up', pct: '+18%', label: 'vs mes ant.' }} />
        <Kpi icon="💰" label="Ingresos mes" value={METRICAS.ingresosMes} color={C.accent} trend={{ dir: 'up', pct: '+11%', label: 'objetivo 95%' }} />
        <Kpi icon="📊" label="Pipeline leads" value={METRICAS.valorPipeline} color={C.primaryL} trend={{ dir: 'up', pct: '+4k€' }} />
        <Kpi icon="⭐" label="Satisfacción" value={`${METRICAS.satisfaccion}/5`} color={C.accent} trend={{ dir: 'up', pct: '+0.2', label: 'vs trim. ant.' }} />
        <Kpi icon="🎯" label="Conversión" value={`${METRICAS.tasaConversion}%`} color={C.success} trend={{ dir: 'down', pct: '-2pp', label: 'vs mes ant.' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Agenda resumen */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 14px', color: C.text, fontSize: 14 }}>Agenda de hoy</h4>
          {AGENDA_HOY.slice(0, 5).map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}20` }}>
              <span style={{ background: C.primary + '22', color: C.primary, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, minWidth: 44, textAlign: 'center' }}>{c.hora}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.paciente.split('(')[0].trim()}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{c.tratamiento}</div>
              </div>
              <Pill label={c.estado} color={c.estado === 'urgente' ? C.danger : c.estado === 'confirmada' ? C.success : C.muted} sm />
            </div>
          ))}
        </div>
        {/* Leads pipeline */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 14px', color: C.text, fontSize: 14 }}>Pipeline de leads</h4>
          {[['Nuevos', 5, C.accent], ['Contactados', 8, C.primaryL], ['Presupuesto', 4, C.primary], ['Cerrado ✓', 12, C.success], ['Cerrado ✗', 2, C.danger]].map(([stage, n, color]) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 90, fontSize: 11, color: C.muted, fontWeight: 600 }}>{stage}</div>
              <div style={{ flex: 1 }}><Bar pct={(n / 12) * 100} color={color} /></div>
              <div style={{ width: 20, fontSize: 12, color: C.text, fontWeight: 700 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Alertas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <h4 style={{ margin: '0 0 12px', color: C.text, fontSize: 14 }}>Alertas y acciones pendientes</h4>
        {[
          { tipo: 'warning', msg: '3 leads sin respuesta hace más de 7 días', accion: 'Ver en CRM' },
          { tipo: 'info', msg: '2 presupuestos pendientes de firma', accion: 'Ver presupuestos' },
          { tipo: 'success', msg: 'Backup diario completado a las 03:00', accion: 'Ver log' },
          { tipo: 'warning', msg: 'Integración WhatsApp: credenciales requeridas', accion: 'Configurar' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? `1px solid ${C.border}20` : 'none' }}>
            <StatusDot ok={a.tipo === 'success'} />
            <div style={{ flex: 1, fontSize: 12, color: C.text }}>{a.msg}</div>
            <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>{a.accion}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAgenda() {
  return (
    <div>
      <PageHeader title="Agenda" subtitle="Todas las citas del equipo — vista de hoy" />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Hoy', 'Semana', 'Mes'].map(v => (
              <button key={v} style={{ background: v === 'Hoy' ? C.primary : C.surface, color: v === 'Hoy' ? C.white : C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>{v}</button>
            ))}
          </div>
          <button onClick={() => demoToast('✅ Demo: abrir formulario nueva cita — disponible en producción')} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Nueva cita</button>
        </div>
        <div style={{ padding: 20 }}>
          {AGENDA_HOY.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.border}20` }}>
              <div style={{ width: 52, background: C.primary + '22', borderRadius: 8, padding: '6px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.primary }}>{c.hora}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{c.paciente.split('(')[0].trim()}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{c.tratamiento} · {c.prof} · {c.duracion}</div>
              </div>
              <Pill label={c.estado} color={c.estado === 'urgente' ? C.danger : c.estado === 'confirmada' ? C.success : C.muted} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>✏️</button>
                <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>💬</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPacientes() {
  const [search, setSearch] = useState('');
  const filtered = PACIENTES.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || p.tratamiento.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <PageHeader title="Pacientes" subtitle={`${PACIENTES.length} pacientes en el sistema`} />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o tratamiento…" style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', color: C.text, fontSize: 13, outline: 'none' }} />
          <button style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Nuevo</button>
        </div>
        <div style={{ overflowX: 'auto', padding: 20 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}20` }}>
              <div style={{ width: 36, height: 36, background: C.primary + '22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: C.primary, flexShrink: 0 }}>
                {p.nombre[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{p.nombre.split('(')[0].trim()}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{p.tratamiento} · {p.hc}</div>
              </div>
              <Pill label={p.origen} color={C.primaryL} sm />
              <Pill label={p.estado.replace('_', ' ')} color={p.estado === 'activo' || p.estado === 'en_tratamiento' ? C.success : C.muted} sm />
              <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>Ver HC</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminFacturacion() {
  return (
    <div>
      <PageHeader title="Facturación" subtitle="Presupuestos y pipeline de ingresos" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Kpi label="Ingresos mes" value={METRICAS.ingresosMes} color={C.success} />
        <Kpi label="Pipeline" value={METRICAS.valorPipeline} color={C.accent} />
        <Kpi label="Ticket medio" value={METRICAS.ticketMedio} color={C.primary} />
        <Kpi label="Presupuestos" value={PRESUPUESTOS.length} color={C.primaryL} />
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 14 }}>Presupuestos activos</div>
        {PRESUPUESTOS.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: `1px solid ${C.border}20` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{p.paciente.split('(')[0].trim()}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{p.tratamiento}</div>
            </div>
            <div style={{ fontWeight: 800, color: C.accent, fontSize: 16 }}>{p.importe}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>{p.fecha}</div>
            <Pill label={p.estado} color={['aceptado','firmado','completado'].includes(p.estado) ? C.success : p.estado === 'enviado' ? C.primaryL : C.muted} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMarketing() {
  return (
    <div>
      <PageHeader title="Marketing" subtitle="Leads, campañas y rendimiento" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Kpi icon="👥" label="Consultas mes" value={METRICAS.consultasMes} color={C.primary} />
        <Kpi icon="🎯" label="Lead→Cita" value={METRICAS.lead_a_cita} color={C.success} />
        <Kpi icon="💬" label="NPS" value={METRICAS.netPromoterScore} color={C.accent} />
        <Kpi icon="⭐" label="Satisfacción" value={`${METRICAS.satisfaccion}/5`} color={C.accent} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 12px', color: C.text, fontSize: 14 }}>Leads pendientes</h4>
          {LEADS.map(l => (
            <div key={l.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}20` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{l.nombre.split('(')[0].trim()}</div>
                <Pill label={`${l.diasInactivo}d`} color={l.diasInactivo > 14 ? C.danger : l.diasInactivo > 7 ? C.warning : C.success} sm />
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{l.tratamiento} · {l.fuente}</div>
              <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>→ {l.accion}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 12px', color: C.text, fontSize: 14 }}>Origen de pacientes</h4>
          {[['Búsqueda web', 38, C.primary], ['Instagram', 28, '#E1306C'], ['Referido', 22, C.success], ['Google Ads', 12, '#4285F4']].map(([source, pct, color]) => (
            <div key={source} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.text }}>{source}</span>
                <span style={{ fontSize: 12, color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <Bar pct={pct} color={color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAutomatizaciones() {
  return (
    <div>
      <PageHeader title="Automatizaciones" subtitle="20 flujos Make — estado de integración" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {AUTOMATIZACIONES.map(a => (
          <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, borderLeft: `3px solid ${a.estado === 'MOCK' ? '#A78BFA' : C.primaryL}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{a.nombre}</div>
              <Pill label={a.estado} color={a.estado === 'MOCK' ? '#A78BFA' : C.primaryL} sm />
            </div>
            <div style={{ fontSize: 11, color: C.accent, marginBottom: 4 }}>⚡ {a.trigger}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{a.plataformas.join(' · ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAgentes() {
  return (
    <div>
      <PageHeader title="Equipo IA" subtitle="9 agentes configurados para Lumen Dental" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {AGENTES_IA.map(a => (
          <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, borderTop: `3px solid ${C.primary}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{a.nombre}</div>
                <Pill label={a.rol} color={C.primaryL} sm />
              </div>
              <span style={{ fontSize: 22 }}>🤖</span>
            </div>
            <p style={{ margin: '0 0 6px', color: C.muted, fontSize: 12 }}>{a.mision}</p>
            <div style={{ fontSize: 11, color: '#FCA5A5', background: C.danger + '18', borderRadius: 5, padding: '4px 8px' }}>🛡 {a.guardrail.substring(0, 60)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminIntegraciones() {
  const integraciones = [
    { nombre: 'Make (Automatizaciones)', icon: '⚡', estado: 'CONECTADO', detalle: 'eu1.make.com · teamId: 1099976 · 0 escenarios Lumen Dental', color: C.success, accion: 'Ver escenarios' },
    { nombre: 'Airtable (CRM)',          icon: '🗃️', estado: 'CONECTADO', detalle: 'Solo base CP04 visible · Lumen Dental: pendiente nueva base', color: C.warning, accion: 'Crear base' },
    { nombre: 'Google Drive',            icon: '📁', estado: 'CONECTADO', detalle: 'Carpeta "Lumen Dental" creada · ID: 1Yxg-rHaEQ6uPcpiWT', color: C.success, accion: 'Ver carpeta' },
    { nombre: 'Gmail',                   icon: '📧', estado: 'CONECTADO', detalle: 'MCP disponible · Sin envíos reales (sandbox)', color: C.success, accion: 'Configurar' },
    { nombre: 'Google Calendar',         icon: '📅', estado: 'CONECTADO', detalle: 'MCP disponible · Sin eventos reales (sandbox)', color: C.success, accion: 'Configurar' },
    { nombre: 'Cloudflare Pages',        icon: '☁️', estado: 'CONECTADO', detalle: 'MCP disponible · Sin deploy real activo', color: C.success, accion: 'Ver workers' },
    { nombre: 'Canva',                   icon: '🎨', estado: 'CONECTADO', detalle: 'MCP disponible · Diseños listos para crear', color: C.success, accion: 'Abrir' },
    { nombre: 'Figma',                   icon: '🖌️', estado: 'CONECTADO', detalle: 'MCP disponible · Design system listo', color: C.success, accion: 'Abrir' },
    { nombre: 'Notion',                  icon: '📓', estado: 'CONECTADO', detalle: 'MCP disponible · Wiki Lumen Dental pendiente', color: C.success, accion: 'Crear wiki' },
    { nombre: 'Miro',                    icon: '🗂️', estado: 'CONECTADO', detalle: 'MCP disponible · Boards listos', color: C.success, accion: 'Abrir' },
    { nombre: 'Stripe (Pagos)',          icon: '💳', estado: 'NO CONECTADO', detalle: 'MCP_REQUIRED · CREDENTIAL_REQUIRED', color: C.danger, accion: 'Conectar' },
    { nombre: 'WhatsApp Business',       icon: '💬', estado: 'NO CONECTADO', detalle: 'MANUAL_CONNECTION_REQUIRED · API oficial necesaria', color: C.danger, accion: 'Conectar' },
    { nombre: 'Meta / Instagram',        icon: '📸', estado: 'NO CONECTADO', detalle: 'CREDENTIAL_REQUIRED · Meta Business Manager', color: C.danger, accion: 'Conectar' },
    { nombre: 'Google My Business',      icon: '📍', estado: 'NO CONECTADO', detalle: 'CREDENTIAL_REQUIRED · Google Business Profile API', color: C.danger, accion: 'Conectar' },
    { nombre: 'Semrush / SEO',           icon: '🔍', estado: 'NO CONECTADO', detalle: 'MCP_REQUIRED · API key Semrush necesaria', color: C.danger, accion: 'Conectar' },
    { nombre: 'Apollo.io (Leads)',       icon: '🎯', estado: 'CONECTADO', detalle: 'MCP disponible · Lead enrichment activo', color: C.success, accion: 'Ver leads' },
  ];
  const ok = integraciones.filter(i => i.estado === 'CONECTADO').length;
  return (
    <div>
      <PageHeader title="Integraciones" subtitle={`${ok}/${integraciones.length} conectadas`} badge={`${ok} activas`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {integraciones.map(int => (
          <div key={int.nombre} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, borderLeft: `3px solid ${int.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{int.icon}</span>
                <span style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{int.nombre}</span>
              </div>
              <Pill label={int.estado} color={int.color} sm />
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{int.detalle}</div>
            <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>{int.accion}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STAFF PAGES ──
function StaffAgenda() {
  return (
    <div>
      <PageHeader title="Agenda del día" subtitle="Vista de recepción — check-in y gestión de citas" badge="Staff" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Kpi icon="📅" label="Citas hoy" value={AGENDA_HOY.length} color={C.primary} />
        <Kpi icon="✅" label="Confirmadas" value={AGENDA_HOY.filter(c => c.estado === 'confirmada').length} color={C.success} />
        <Kpi icon="⏳" label="Pendientes" value={AGENDA_HOY.filter(c => c.estado === 'pendiente').length} color={C.warning} />
        <Kpi icon="🚨" label="Urgencias" value={AGENDA_HOY.filter(c => c.estado === 'urgente').length} color={C.danger} />
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {AGENDA_HOY.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${C.border}20`, background: c.estado === 'urgente' ? C.danger + '0A' : 'transparent' }}>
            <div style={{ background: C.primary + '22', color: C.primary, borderRadius: 8, padding: '6px 10px', fontWeight: 800, fontSize: 14, minWidth: 52, textAlign: 'center' }}>{c.hora}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{c.paciente.split('(')[0].trim()}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{c.tratamiento} · {c.prof} · {c.duracion}</div>
            </div>
            <Pill label={c.estado} color={c.estado === 'urgente' ? C.danger : c.estado === 'confirmada' ? C.success : C.muted} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => demoToast('✅ Check-in registrado (demo)')} style={{ background: C.success, border: 'none', borderRadius: 6, padding: '6px 12px', color: C.white, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Check-in</button>
              <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>📞</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffPacientes() { return <AdminPacientes />; }
function StaffCheckin() {
  return (
    <div>
      <PageHeader title="Check-in Rápido" subtitle="Registra la llegada del paciente" badge="Staff" />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 480 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', color: C.muted, fontSize: 12, marginBottom: 6 }}>Nombre o número de HC</label>
          <input placeholder="Buscar paciente…" style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button onClick={() => demoToast('✅ Llegada registrada — sistema notificado (demo)')} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' }}>
          ✅ Registrar llegada
        </button>
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16, fontSize: 12, color: C.muted }}>
          Próximas citas en 30 min:
          {AGENDA_HOY.slice(0, 3).map(c => <div key={c.id} style={{ padding: '6px 0', borderBottom: `1px solid ${C.border}20`, color: C.text }}>{c.hora} · {c.paciente.split('(')[0].trim()}</div>)}
        </div>
      </div>
    </div>
  );
}
function StaffMensajes() {
  return (
    <div>
      <PageHeader title="Mensajes" subtitle="Centro de comunicaciones (demo — no enviados reales)" badge="Staff" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { de: 'Ana Gómez (ficticio)', msg: '¿Puedo cambiar mi cita del lunes?', tiempo: 'hace 12 min', leido: false },
          { de: 'Lead demo web', msg: 'Solicitud de presupuesto Invisalign', tiempo: 'hace 1h', leido: false },
          { de: 'Sistema', msg: 'Recordatorio enviado a 6 pacientes', tiempo: 'hace 2h', leido: true },
        ].map((m, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: `3px solid ${m.leido ? C.border : C.primary}` }}>
            <div style={{ width: 36, height: 36, background: C.primary + '22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{m.de[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{m.de}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{m.msg}</div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{m.tiempo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DENTIST PAGES ──
function DentistAgenda() {
  const misCitas = AGENDA_HOY.filter(c => c.prof.includes('Vidal'));
  return (
    <div>
      <PageHeader title="Mi Agenda" subtitle="Dra. Clara Vidal Soler — hoy" badge="Odontólogo" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Kpi label="Mis citas" value={misCitas.length} color={C.success} />
        <Kpi label="Horas ocupadas" value="4.5h" color={C.primary} />
        <Kpi label="Pacientes nuevos" value={1} color={C.accent} />
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {(misCitas.length > 0 ? misCitas : AGENDA_HOY.slice(0, 3)).map(c => (
          <div key={c.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}20`, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ background: C.success + '22', color: C.success, fontWeight: 800, fontSize: 13, borderRadius: 8, padding: '6px 10px', minWidth: 50, textAlign: 'center' }}>{c.hora}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{c.paciente.split('(')[0].trim()}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{c.tratamiento} · {c.duracion}</div>
            </div>
            <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 12px', color: C.text, fontSize: 11, cursor: 'pointer' }}>Abrir HC</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function DentistHistorial() {
  return (
    <div>
      <PageHeader title="Historial Clínico" subtitle="Fichas de pacientes con tratamientos activos" badge="Odontólogo" />
      {PACIENTES.filter(p => p.estado === 'en_tratamiento' || p.estado === 'activo').slice(0, 4).map(p => (
        <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.nombre.split('(')[0].trim()}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{p.hc} · Alta: {p.fechaAlta}</div>
            </div>
            <Pill label={p.tratamiento} color={C.primary} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Historial', 'Radiografías', 'Notas', 'Presupuesto'].map(t => (
              <button key={t} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function DentistTratamientos() {
  const protocolos = [
    { pac: 'Ana Gómez Pérez', trat: 'Invisalign', pasoActual: 8, totalPasos: 14, proxCita: '15 Sep 2026', icon: '✨', color: C.primaryL, nota: 'Paso 8/14. Buen anclaje. Revisar alineador inferior derecho.' },
    { pac: 'Luis Martínez Font', trat: 'Implante x2 — Fase 2', pasoActual: 2, totalPasos: 4, proxCita: '22 Sep 2026', icon: '🔩', color: C.accent, nota: 'Colocación corona provisional. Esperar osteointegración 6 semanas.' },
    { pac: 'Carlos Díaz Ramos', trat: 'Ortodoncia metálica', pasoActual: 5, totalPasos: 18, proxCita: '28 Sep 2026', icon: '😁', color: C.success, nota: 'Cambio arco 0.17×0.25. Activar muelle canino superior.' },
    { pac: 'Javier Blanco Vera', trat: 'Carillas x6', pasoActual: 1, totalPasos: 3, proxCita: '10 Oct 2026', icon: '💎', color: C.primary, nota: 'Tallado completado. Cita provisional entregada. Esperar laboratorio.' },
  ];
  return (
    <div>
      <PageHeader title="Tratamientos activos" subtitle="Seguimiento clínico por paciente" badge="Odontólogo" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {protocolos.map((p, i) => {
          const pct = Math.round((p.pasoActual / p.totalPasos) * 100);
          return (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, borderTop: `3px solid ${p.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{p.pac.split(' ').slice(0,2).join(' ')} <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>(ficticio)</span></div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                    <Pill label={p.trat} color={p.color} sm />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: p.color, fontSize: 22 }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: C.muted }}>completado</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>Sesión {p.pasoActual} / {p.totalPasos}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>Próx: {p.proxCita}</span>
                </div>
                <div style={{ background: C.border + '55', borderRadius: 6, height: 8 }}>
                  <div style={{ width: `${pct}%`, height: 8, background: p.color, borderRadius: 6, transition: 'width 0.6s' }} />
                </div>
              </div>
              {/* Nota clínica */}
              <div style={{ background: C.surface, borderRadius: 8, padding: '8px 12px', fontSize: 11, color: C.muted, borderLeft: `2px solid ${p.color}`, fontStyle: 'italic' }}>
                {p.nota}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {['HC completa', 'Rx digitales', 'Añadir nota'].map(btn => (
                  <button key={btn} onClick={() => demoToast(`${btn} — módulo demo`)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>{btn}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function DentistPresupuestos() {
  const misPresupuestos = PRESUPUESTOS.filter(p => ['Invisalign', 'Ortodoncia', 'Higiene', 'Control Revisión'].some(t => p.tratamiento.includes(t))).slice(0, 4);
  const display = misPresupuestos.length > 0 ? misPresupuestos : PRESUPUESTOS.slice(0, 4);
  return (
    <div>
      <PageHeader title="Mis Presupuestos" subtitle="Presupuestos emitidos por Dra. Vidal" badge="Odontólogo" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Kpi label="Emitidos mes" value={display.length} color={C.primary} icon="📄" />
        <Kpi label="Valor total" value={`${display.reduce((s, p) => s + parseInt(p.importe.replace(/[^\d]/g, '') || 0), 0).toLocaleString('es-ES')} €`} color={C.accent} icon="💶" />
        <Kpi label="Aceptados" value={display.filter(p => ['aceptado','firmado','completado'].includes(p.estado)).length} color={C.success} icon="✅" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {display.map(p => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, background: C.primary + '20', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.tratamiento}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{p.paciente.split('(')[0].trim()} · {p.fecha}</div>
              {p.notas && <div style={{ fontSize: 11, color: C.primaryL, marginTop: 2, fontStyle: 'italic' }}>{p.notas}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: C.accent, fontSize: 18 }}>{p.importe}</div>
              <Pill label={p.estado} color={['aceptado','firmado','completado'].includes(p.estado) ? C.success : p.estado === 'pendiente' ? C.warning : C.muted} sm />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => demoToast('📄 PDF generado (demo)')} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 12px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>PDF</button>
              <button onClick={() => demoToast('✉️ Enviado al paciente (demo — sin envío real)')} style={{ background: C.primary + '22', border: `1px solid ${C.primary}44`, borderRadius: 6, padding: '6px 12px', color: C.primaryL, fontSize: 11, cursor: 'pointer' }}>Enviar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MARKETING PAGES ──
function MktKPIs() {
  const funnel = [
    { label: 'Visitas web', value: 4230, pct: 100, color: C.primary },
    { label: 'Leads captados', value: 312, pct: 74, color: C.primaryL },
    { label: 'Consultas realizadas', value: parseInt(METRICAS.consultasMes), pct: 46, color: C.accent },
    { label: 'Citas confirmadas', value: 87, pct: 21, color: C.success },
    { label: 'Pacientes activos', value: 34, pct: 8, color: '#10B981' },
  ];
  const campanas = [
    { nombre: 'Invisalign Septiembre', canal: 'Google Ads', estado: 'Activa', clics: 1240, leads: 28, coste: '380 €', roi: '+340%', color: C.success },
    { nombre: 'Implantes — Reactivación', canal: 'Email', estado: 'Activa', clics: 860, leads: 19, coste: '0 €', roi: '+∞', color: C.success },
    { nombre: 'Blanqueamiento Verano', canal: 'Instagram', estado: 'Pausada', clics: 3100, leads: 41, coste: '220 €', roi: '+180%', color: C.warning },
    { nombre: 'Primera Visita Gratis', canal: 'Web', estado: 'Activa', clics: 590, leads: 67, coste: '0 €', roi: '+∞', color: C.success },
  ];
  return (
    <div>
      <PageHeader title="KPIs Marketing" subtitle="Métricas de captación y conversión" badge="Marketing" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi icon="👁️" label="Visitas web" value="4.230" sub="mes actual" color={C.primary} trend={{ dir: 'up', pct: '+22%', label: 'vs ago' }} />
        <Kpi icon="🎯" label="Lead→Cita" value={METRICAS.lead_a_cita} color={C.success} trend={{ dir: 'up', pct: '+8%' }} />
        <Kpi icon="⭐" label="Satisfacción" value={`${METRICAS.satisfaccion}/5`} color={C.accent} trend={{ dir: 'up', pct: '+0.3' }} />
        <Kpi icon="💬" label="NPS" value={METRICAS.netPromoterScore} color={C.primaryL} trend={{ dir: 'up', pct: '+12' }} />
        <Kpi icon="👥" label="Consultas" value={METRICAS.consultasMes} color={C.success} trend={{ dir: 'up', pct: '+15%' }} />
        <Kpi icon="📊" label="Conversión" value={`${METRICAS.tasaConversion}%`} color={C.primary} trend={{ dir: 'up', pct: '+2.1pp' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Funnel captación */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 16 }}>Embudo de captación — sept.</div>
          {funnel.map((f, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{f.label}</span>
                <span style={{ fontSize: 12, color: f.color, fontWeight: 800 }}>{f.value.toLocaleString('es-ES')}</span>
              </div>
              <div style={{ background: C.border + '44', borderRadius: 4, height: 6 }}>
                <div style={{ width: `${f.pct}%`, height: 6, background: f.color, borderRadius: 4, transition: 'width 0.6s' }} />
              </div>
            </div>
          ))}
        </div>
        {/* Origen de leads */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 16 }}>Origen de leads</div>
          {[['Búsqueda orgánica', 38, C.primary], ['Instagram Ads', 28, '#E1306C'], ['Referidos', 22, C.success], ['Google Ads', 12, '#4285F4']].map(([src, pct, color]) => (
            <div key={src} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.text }}>{src}</span>
                <span style={{ fontSize: 12, color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <Bar pct={pct} color={color} />
            </div>
          ))}
        </div>
      </div>
      {/* Campañas activas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 14 }}>Campañas activas</div>
        {campanas.map((cam, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${C.border}20` }}>
            <Pill label={cam.estado} color={cam.color} sm />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{cam.nombre}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{cam.canal} · {cam.clics.toLocaleString('es-ES')} clics · {cam.leads} leads</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <div style={{ fontWeight: 800, color: C.success, fontSize: 13 }}>{cam.roi}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>ROI · {cam.coste}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MktLeads() {
  return (
    <div>
      <PageHeader title="Leads" subtitle="Pipeline comercial Lumen Dental" badge="Marketing" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEADS.map(l => (
          <div key={l.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, background: C.accent + '22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{l.nombre.split('(')[0].trim()}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{l.tratamiento} · {l.fuente} · {l.email}</div>
              <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>→ {l.accion}</div>
            </div>
            <Pill label={`${l.diasInactivo}d inactivo`} color={l.diasInactivo > 14 ? C.danger : l.diasInactivo > 7 ? C.warning : C.success} sm />
            <button onClick={() => demoToast('📧 Secuencia de contacto iniciada (demo — sin envío real)')} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Contactar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function MktEmail() {
  return (
    <div>
      <PageHeader title="Email Campaigns" subtitle="10 plantillas listas — sin envío real activo" badge="Marketing" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {EMAIL_TEMPLATES.map(e => (
          <div key={e.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ background: C.primary + '22', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📧</div>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{e.nombre}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{e.id}</div>
              </div>
            </div>
            <div style={{ background: C.surface, borderRadius: 6, padding: '8px 10px', marginBottom: 8, fontSize: 11, color: C.text, borderLeft: `2px solid ${C.primary}` }}>
              {e.asunto}
            </div>
            <p style={{ margin: '0 0 10px', color: C.muted, fontSize: 11 }}>{e.resumen}</p>
            <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>Vista previa</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function MktSocial() {
  return (
    <div>
      <PageHeader title="Social Media" subtitle="Estrategia + 10 piezas de contenido generadas" badge="Marketing" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {SOCIAL_POSTS.map(p => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Pill label={p.red} color={p.red === 'Instagram' ? '#E1306C' : p.red === 'LinkedIn' ? '#0A66C2' : C.primary} sm />
              <Pill label={p.tipo} color={C.muted} sm />
            </div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 13, marginBottom: 6 }}>{p.tema}</div>
            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{p.copy.substring(0, 100)}…</div>
            <div style={{ fontSize: 11, color: C.primaryL }}>{p.hashtags.split(' ').slice(0, 3).join(' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MktSEO() {
  return (
    <div>
      <PageHeader title="SEO Local" subtitle="Estrategia de posicionamiento en Málaga" badge="Marketing" />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 14 }}>Top keywords</div>
        {SEO_DATA.keywords_principales.slice(0, 6).map((k, i) => (
          <div key={i} style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border}20`, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, fontWeight: 600, color: C.text, fontSize: 12 }}>{k.keyword}</div>
            <div style={{ color: C.success, fontWeight: 700, fontSize: 12, minWidth: 80 }}>{k.volumen}</div>
            <Pill label={k.dificultad} color={k.dificultad === 'Alta' ? C.danger : k.dificultad === 'Media' ? C.warning : C.success} sm />
            <Pill label={k.intención} color={C.primaryL} sm />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PATIENT PAGES ──
function PatientMisCitas() {
  const p = PACIENTES[0];
  const misCitas = AGENDA_HOY.filter(c => c.paciente.startsWith('Ana Gómez'));
  const proximas = [
    { fecha: '15 sep 2026', hora: '09:00', trat: 'Control Invisalign — Paso 9/14', prof: 'Dra. Clara Vidal', sala: 'Gabinete 1', estado: 'confirmada' },
    { fecha: '10 oct 2026', hora: '10:30', trat: 'Higiene semestral', prof: 'Dra. Elena Pons', sala: 'Gabinete 2', estado: 'pendiente' },
  ];
  const progreso = Math.round((8 / 14) * 100);
  return (
    <div>
      <PageHeader title="Mis Citas" subtitle={`Área personal — ${p.nombre.split('(')[0].trim()}`} badge="Paciente" />
      {/* Progress Invisalign */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>Tratamiento activo: Invisalign</div>
            <div style={{ color: C.muted, fontSize: 12 }}>Dra. Clara Vidal · Inicio enero 2026</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, color: C.primaryL, fontSize: 24 }}>{progreso}%</div>
            <div style={{ fontSize: 11, color: C.muted }}>completado</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.muted }}>Paso 8 de 14 alineadores</span>
          <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>En curso ✓</span>
        </div>
        <div style={{ background: C.border + '44', borderRadius: 6, height: 10, marginBottom: 8 }}>
          <div style={{ width: `${progreso}%`, height: 10, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryL})`, borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>Fin estimado: marzo 2027 · Revisión cada 6 semanas</div>
      </div>
      {/* Próximas citas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 14 }}>Próximas citas</div>
        {(misCitas.length > 0 ? misCitas.map(c => ({ fecha: 'Hoy', hora: c.hora, trat: c.tratamiento, prof: c.prof, sala: 'Gabinete 1', estado: c.estado })) : proximas).map((c, i) => (
          <div key={i} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}20`, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ background: C.primary + '20', borderRadius: 8, padding: '6px 10px', minWidth: 60, textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: C.primary, fontSize: 13 }}>{c.hora}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{c.fecha}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{c.trat}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{c.prof} · {c.sala}</div>
            </div>
            <Pill label={c.estado} color={c.estado === 'confirmada' ? C.success : C.warning} sm />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => demoToast('📅 Añadido a Google Calendar (demo)')} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>📅</button>
              <button onClick={() => demoToast('❌ Solicitud de cancelación enviada (demo — sin acción real)')} style={{ background: '#EF444414', border: `1px solid #EF444430`, borderRadius: 6, padding: '5px 10px', color: C.danger, fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        ))}
      </div>
      {/* Pedir cita */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 10 }}>Pedir nueva cita</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13 }}>
            <option>Selecciona tratamiento…</option>
            {SERVICIOS.map(s => <option key={s.id}>{s.nombre}</option>)}
          </select>
          <button onClick={() => demoToast('📅 Solicitud enviada — confirmaremos en 24h (demo)')} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Solicitar →</button>
        </div>
      </div>
    </div>
  );
}
function PatientHistorial() {
  return (
    <div>
      <PageHeader title="Mi Historial" subtitle="Resumen de tu historial clínico" badge="Paciente" />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, background: C.primary + '22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🦷</div>
          <div>
            <div style={{ fontWeight: 800, color: C.text, fontSize: 16 }}>{PACIENTES[0].nombre.split('(')[0].trim()}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{PACIENTES[0].hc} · Alta: {PACIENTES[0].fechaAlta}</div>
          </div>
        </div>
        {[
          { fecha: '2026-08-15', evento: 'Control Invisalign — Paso 8/14', dr: 'Dra. Clara Vidal' },
          { fecha: '2026-06-10', evento: 'Higiene semestral', dr: 'Dra. Elena Pons' },
          { fecha: '2026-01-20', evento: 'Inicio tratamiento Invisalign', dr: 'Dra. Clara Vidal' },
          { fecha: '2025-09-05', evento: 'Revisión inicial + ortopantomografía', dr: 'Dra. Clara Vidal' },
        ].map((h, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}20`, display: 'flex', gap: 12 }}>
            <div style={{ minWidth: 80, color: C.muted, fontSize: 11 }}>{h.fecha}</div>
            <div>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{h.evento}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{h.dr} (ficticio)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function PatientFacturas() {
  return (
    <div>
      <PageHeader title="Mis Facturas" subtitle="Presupuestos y pagos (demo ficticio)" badge="Paciente" />
      {PRESUPUESTOS.slice(0, 3).map(p => (
        <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{p.tratamiento}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>{p.fecha}</div>
          </div>
          <div style={{ fontWeight: 800, color: C.accent, fontSize: 18 }}>{p.importe}</div>
          <Pill label={p.estado} color={['aceptado','firmado','completado'].includes(p.estado) ? C.success : C.muted} />
          <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 12px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>PDF</button>
        </div>
      ))}
    </div>
  );
}
function PatientMensajes() {
  const mensajes = [
    { de: 'Lumen Dental', tipo: 'clínica', msg: 'Recordatorio: su cita de control Invisalign es el 15 de septiembre a las 09:00.', tiempo: 'Hace 1 día', leido: true, color: C.primary },
    { de: 'Dra. Clara Vidal', tipo: 'odontóloga', msg: 'Ana, el alineador 8 va perfecto. Siga con el protocolo de 22h al día. Hasta pronto.', tiempo: 'Hace 3 días', leido: true, color: C.success },
    { de: 'Lumen Dental', tipo: 'clínica', msg: 'Su factura de agosto está disponible. Puede descargarla en el área de "Mis Facturas".', tiempo: 'Hace 1 semana', leido: false, color: C.primary },
    { de: 'Dra. Elena Pons', tipo: 'odontóloga', msg: 'Muy bien en la higiene semestral. Recuerde usar el hilo interdental a diario.', tiempo: 'Hace 3 meses', leido: true, color: C.success },
  ];
  return (
    <div>
      <PageHeader title="Mis mensajes" subtitle="Comunicaciones de su clínica (demo)" badge="Paciente" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mensajes.map((m, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `3px solid ${m.leido ? C.border : m.color}` }}>
            <div style={{ width: 40, height: 40, background: m.color + '20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {m.tipo === 'clínica' ? '🦷' : '👩‍⚕️'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{m.de} <span style={{ fontSize: 10, color: m.color, fontWeight: 500, marginLeft: 4 }}>{m.tipo}</span></div>
                {!m.leido && <div style={{ width: 7, height: 7, background: m.color, borderRadius: '50%', marginTop: 4 }} />}
              </div>
              <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{m.msg}</div>
              <div style={{ fontSize: 11, color: C.border, marginTop: 6 }}>{m.tiempo}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 10 }}>Enviar consulta</div>
        <textarea placeholder="Escriba su consulta aquí…" rows={3} style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        <button onClick={() => demoToast('💬 Consulta enviada — responderemos en 24h (demo — sin envío real)')} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 10 }}>Enviar consulta →</button>
      </div>
    </div>
  );
}

// ─── ROUTING POR ROL ─────────────────────────────────────────────────────────
const PAGE_MAP = {
  admin:    { overview: AdminOverview, agenda: AdminAgenda, pacientes: AdminPacientes, facturacion: AdminFacturacion, marketing: AdminMarketing, automatizaciones: AdminAutomatizaciones, agentes: AdminAgentes, integraciones: AdminIntegraciones },
  staff:    { agenda: StaffAgenda, pacientes: StaffPacientes, checkin: StaffCheckin, mensajes: StaffMensajes },
  dentist:  { mi_agenda: DentistAgenda, historial: DentistHistorial, tratamientos: DentistTratamientos, presupuestos: DentistPresupuestos },
  marketing:{ kpis: MktKPIs, leads: MktLeads, email: MktEmail, social: MktSocial, seo: MktSEO },
  patient:  { mis_citas: PatientMisCitas, historial_p: PatientHistorial, facturas: PatientFacturas, mensajes_p: PatientMensajes },
};

// ─── Toast global (DOM-based, sin prop-drilling) ─────────────────────────────
function demoToast(msg) {
  const el = document.getElementById('ld-toast');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; }, 2200);
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export function LumenDentalPremiumApp() {
  // Hash-based deep-link auto-login: #admin #staff #dentist #marketing #patient
  const initHash = () => {
    const h = window.location.hash.slice(1);
    return ROLES[h] ? h : null;
  };
  const initRole = initHash();
  const [view, setView] = useState(initRole ? 'app' : 'landing');
  const [role, setRole] = useState(initRole);
  const [page, setPage] = useState(initRole ? ROLES[initRole].nav[0].id : null);

  // Sync hash when role changes
  useEffect(() => {
    window.location.hash = role || '';
  }, [role]);

  const handleLogin = (r) => {
    setRole(r);
    setPage(ROLES[r].nav[0].id);
    setView('app');
  };
  const handleLogout = () => { setRole(null); setPage(null); setView('landing'); };

  const PageComponent = role && page && PAGE_MAP[role]?.[page];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      {/* Toast */}
      <div id="ld-toast" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translate(-50%, 8px)', background: '#1E293B', color: '#F1F5F9', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid #334155', zIndex: 9999, opacity: 0, transition: 'opacity 0.25s, transform 0.25s', pointerEvents: 'none' }} />
      {/* Demo Banner */}
      <div style={{ background: '#0F172A', borderBottom: '1px solid #1E3A5F', color: '#64748B', textAlign: 'center', padding: '5px 16px', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', flexShrink: 0, zIndex: 100 }}>
        PROTOTIPO DEMO · DATOS 100% FICTICIOS · Fábrica SaaS V1.8
        {role && <span style={{ marginLeft: 16, color: ROLES[role]?.color }}>● {ROLES[role]?.label}</span>}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {view === 'landing' && <div style={{ height: '100%', overflowY: 'auto' }}><LandingPage onLogin={() => setView('login')} /></div>}
        {view === 'login'   && <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />}
        {view === 'app' && role && (
          <AppShell role={role} page={page} onPage={setPage} onLogout={handleLogout}>
            {PageComponent
              ? <PageComponent />
              : <div style={{ color: C.danger, padding: 20 }}>⛔ Acceso denegado — módulo no disponible para este rol.</div>
            }
          </AppShell>
        )}
      </div>
    </div>
  );
}
