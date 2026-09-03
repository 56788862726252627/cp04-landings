/**
 * Lumen Dental — Premium V2
 * Experiencia comercial lista para vender a clínica (3.000–5.000 €)
 * Login multirol · Dashboard por rol · Landing premium
 * NO_REAL_EXTERNAL_ACTION=SI · isReal:false en todos los outputs
 */
import { useState } from 'react';
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
function Kpi({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>}
      <div style={{ fontSize: 24, fontWeight: 800, color: color || C.primary }}>{value}</div>
      <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 3 }}>{label}</div>
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

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #0B2545 55%, #1a0e35 100%)`, padding: '80px 32px 90px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(14,165,233,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.1) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, padding: '5px 16px', marginBottom: 20, fontSize: 13, fontWeight: 600, color: C.accent }}>
            ✨ Primera visita gratuita · Sin compromiso
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, color: C.white, lineHeight: 1.15 }}>
            Tu sonrisa merece<br />
            <span style={{ background: `linear-gradient(90deg, ${C.accent}, #FDE68A)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              la mejor atención
            </span>
          </h1>
          <p style={{ color: '#BAE6FD', fontSize: 18, lineHeight: 1.6, marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
            Tecnología dental de vanguardia con el trato cercano que mereces. Sin esperas, sin letra pequeña y con financiación real hasta 24 meses.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {btn('Pedir cita gratis →', true, onLogin)}
            {btn('Ver tratamientos', false, () => {})}
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            {[['⭐ 4.8/5', '240+ reseñas'], ['🦷 +1.200', 'pacientes activos'], ['💳', 'Fin. 0% interés']].map(([v, l], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white }}>{v}</div>
                <div style={{ fontSize: 12, color: '#93C5FD' }}>{l}</div>
              </div>
            ))}
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

      {/* CTA FINAL */}
      <section style={{ background: C.lSurface, padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: C.lText, margin: '0 0 12px' }}>Tu primera visita es gratuita</h2>
          <p style={{ color: C.lMuted, fontSize: 16, marginBottom: 32 }}>Sin compromiso. Sin papeleos. Solo ven, conoce al equipo y descubre qué podemos hacer por tu sonrisa.</p>
          <button onClick={onLogin} style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 12, padding: '16px 40px', fontWeight: 800, fontSize: 17, cursor: 'pointer', boxShadow: `0 8px 24px ${C.primary}55` }}>
            Pedir cita gratis →
          </button>
          <div style={{ marginTop: 24, color: C.lMuted, fontSize: 13 }}>
            📞 +34 951 000 001 (demo) &nbsp;|&nbsp; 📧 hola@lumendental.demo
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
    if (pass === role.pass || pass === '') {
      onLogin(selected);
    } else {
      setError('Contraseña incorrecta. Usa la contraseña demo mostrada abajo.');
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🦷</div>
          <h1 style={{ color: C.white, fontSize: 26, fontWeight: 800, margin: 0 }}>Lumen Dental</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: '6px 0 0' }}>Selecciona tu perfil para acceder</p>
        </div>
        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12, marginBottom: 24 }}>
          {Object.values(ROLES).map(r => (
            <button key={r.id} onClick={() => { setSelected(r.id); setPass(''); setError(''); }} style={{
              background: selected === r.id ? r.color + '22' : C.card,
              border: `2px solid ${selected === r.id ? r.color : C.border}`,
              borderRadius: 12, padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
              transition: '0.15s',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 13, marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{r.desc.split('.')[0]}.</div>
              {selected === r.id && (
                <div style={{ marginTop: 8, fontSize: 10, color: r.color, fontWeight: 600 }}>
                  {r.user} · {r.pass}
                </div>
              )}
            </button>
          ))}
        </div>
        {/* Password + login */}
        {selected && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
              Accediendo como <span style={{ color: ROLES[selected].color, fontWeight: 700 }}>{ROLES[selected].label}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="password"
                placeholder={`Contraseña demo: ${ROLES[selected].pass}`}
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none' }}
              />
              <button onClick={handleLogin} style={{ background: ROLES[selected].color, color: C.white, border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Entrar →
              </button>
            </div>
            {error && <div style={{ color: C.danger, fontSize: 12, marginTop: 8 }}>⚠️ {error}</div>}
            <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>Pulsa Entrar sin contraseña para acceso rápido demo.</div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12 }}>
            ← Volver a la web de Lumen Dental
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL (autenticado) ──────────────────────────────────────────────────
function AppShell({ role, page, onPage, onLogout, children }) {
  const R = ROLES[role];
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🦷</span>
            <div>
              <div style={{ fontWeight: 800, color: C.white, fontSize: 14 }}>Lumen Dental</div>
              <div style={{ fontSize: 10, color: R.color, fontWeight: 600 }}>{R.label}</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {R.nav.map(item => (
            <button key={item.id} onClick={() => onPage(item.id)} style={{
              width: '100%', background: page === item.id ? R.color + '22' : 'transparent',
              border: 'none', borderLeft: `3px solid ${page === item.id ? R.color : 'transparent'}`,
              color: page === item.id ? R.color : C.muted,
              padding: '11px 16px', cursor: 'pointer', textAlign: 'left',
              fontSize: 13, fontWeight: page === item.id ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        {/* User + logout */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{ROLES[role].user}</div>
          <button onClick={onLogout} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, width: '100%' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: C.bg }}>
        {children}
      </main>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi icon="📅" label="Citas hoy" value={METRICAS.citasHoy} color={C.primary} />
        <Kpi icon="👥" label="Nuevos pacientes" value={METRICAS.nuevosPacientes} color={C.success} />
        <Kpi icon="💰" label="Ingresos mes" value={METRICAS.ingresosMes} color={C.accent} />
        <Kpi icon="📊" label="Pipeline" value={METRICAS.valorPipeline} color={C.primaryL} />
        <Kpi icon="⭐" label="Satisfacción" value={`${METRICAS.satisfaccion}/5`} color={C.accent} />
        <Kpi icon="🎯" label="Conversión" value={`${METRICAS.tasaConversion}%`} color={C.success} />
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
          <button style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Nueva cita</button>
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
              <button style={{ background: C.success, border: 'none', borderRadius: 6, padding: '6px 12px', color: C.white, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Check-in</button>
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
        <button style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' }}>
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
  return (
    <div>
      <PageHeader title="Tratamientos activos" subtitle="Protocolos y seguimiento clínico" badge="Odontólogo" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {SERVICIOS.slice(0, 6).map(s => (
          <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icono}</div>
            <div style={{ fontWeight: 700, color: C.text, fontSize: 13, marginBottom: 4 }}>{s.nombre}</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>{s.desc.substring(0, 80)}…</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Pill label={s.categoria} color={C.primaryL} sm />
              <span style={{ fontSize: 11, color: C.muted }}>{s.duracion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function DentistPresupuestos() { return <AdminFacturacion />; }

// ── MARKETING PAGES ──
function MktKPIs() {
  return (
    <div>
      <PageHeader title="KPIs Marketing" subtitle="Métricas de captación y conversión" badge="Marketing" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi icon="👁️" label="Visitas web" value="4.230" sub="mes actual" color={C.primary} />
        <Kpi icon="🎯" label="Lead→Cita" value={METRICAS.lead_a_cita} color={C.success} />
        <Kpi icon="⭐" label="Satisfacción" value={`${METRICAS.satisfaccion}/5`} color={C.accent} />
        <Kpi icon="💬" label="NPS" value={METRICAS.netPromoterScore} color={C.primaryL} />
        <Kpi icon="👥" label="Consultas" value={METRICAS.consultasMes} color={C.success} />
        <Kpi icon="📊" label="Conversión" value={`${METRICAS.tasaConversion}%`} color={C.primary} />
      </div>
      <AdminMarketing />
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
            <button style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Contactar</button>
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
  return (
    <div>
      <PageHeader title="Mis Citas" subtitle={`Área personal — ${p.nombre.split('(')[0].trim()}`} badge="Paciente" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Kpi label="Próxima cita" value="15 Sep" color={C.primary} />
        <Kpi label="Tratamiento" value={p.tratamiento} color={C.success} />
        <Kpi label="Historial" value={p.hc} color={C.muted} />
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 14 }}>Mis próximas citas</div>
        {AGENDA_HOY.slice(0, 3).map(c => (
          <div key={c.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}20`, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: C.primary, fontSize: 14, minWidth: 48 }}>{c.hora}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{c.tratamiento}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{c.prof}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer' }}>Añadir al calendario</button>
              <button style={{ background: '#EF444422', border: `1px solid #EF444444`, borderRadius: 6, padding: '5px 10px', color: C.danger, fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 10 }}>Pedir nueva cita</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13 }}>
            <option>Selecciona tratamiento…</option>
            {SERVICIOS.map(s => <option key={s.id}>{s.nombre}</option>)}
          </select>
          <button style={{ background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Solicitar →</button>
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
function PatientMensajes() { return <StaffMensajes />; }

// ─── ROUTING POR ROL ─────────────────────────────────────────────────────────
const PAGE_MAP = {
  admin:    { overview: AdminOverview, agenda: AdminAgenda, pacientes: AdminPacientes, facturacion: AdminFacturacion, marketing: AdminMarketing, automatizaciones: AdminAutomatizaciones, agentes: AdminAgentes, integraciones: AdminIntegraciones },
  staff:    { agenda: StaffAgenda, pacientes: StaffPacientes, checkin: StaffCheckin, mensajes: StaffMensajes },
  dentist:  { mi_agenda: DentistAgenda, historial: DentistHistorial, tratamientos: DentistTratamientos, presupuestos: DentistPresupuestos },
  marketing:{ kpis: MktKPIs, leads: MktLeads, email: MktEmail, social: MktSocial, seo: MktSEO },
  patient:  { mis_citas: PatientMisCitas, historial_p: PatientHistorial, facturas: PatientFacturas, mensajes_p: PatientMensajes },
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export function LumenDentalPremiumApp() {
  const [view, setView] = useState('landing'); // landing | login | app
  const [role, setRole] = useState(null);
  const [page, setPage] = useState(null);

  const handleLogin = (r) => {
    setRole(r);
    setPage(ROLES[r].nav[0].id);
    setView('app');
  };
  const handleLogout = () => { setRole(null); setPage(null); setView('landing'); };

  const PageComponent = role && page && PAGE_MAP[role]?.[page];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      {/* Demo Banner */}
      <div style={{ background: '#7C3AED', color: '#fff', textAlign: 'center', padding: '6px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', flexShrink: 0, zIndex: 100 }}>
        ⚠️ PROTOTIPO DEMO · DATOS 100% FICTICIOS · NO CONECTADO A SISTEMAS REALES · Fábrica SaaS V1.8 / ADV-01…ADV-21
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
