/**
 * Lumen Dental — Premium V5
 * Demo Comercial Interactiva · Booking Modal · Pipeline · Kanban Leads
 * NO_REAL_EXTERNAL_ACTION=SI · isReal:false en todos los outputs
 */
import { useState, useEffect } from 'react';
import {
  SERVICIOS, PROFESIONALES, AGENDA_HOY, PACIENTES,
  PRESUPUESTOS, LEADS, METRICAS, AUTOMATIZACIONES,
  AGENTES_IA, EMAIL_TEMPLATES, SEO_DATA, SOCIAL_POSTS,
  CLIENT_PROFILE, BRANDING, HEALTH_SNAPSHOT, PLATAFORMAS,
} from './LumenDentalMockData.js';

// ─── Assets ──────────────────────────────────────────────────────────────────
const IMGS = {
  A1: '/lumen-dental/assets/A1_hero_landing.png',
  A2: '/lumen-dental/assets/A2_consulta_odontologa.png',
  B1: '/lumen-dental/assets/B1_retrato_directora.png',
  B2: '/lumen-dental/assets/B2_retrato_dra_vidal.png',
  B3: '/lumen-dental/assets/B3_retrato_recepcionista.png',
  B4: '/lumen-dental/assets/B4_retrato_implantologo.png',
  C1: '/lumen-dental/assets/C1_recepcion.png',
  C2: '/lumen-dental/assets/C2_gabinete.png',
  C3: '/lumen-dental/assets/C3_sala_espera.png',
  D1: '/lumen-dental/assets/D1_login_administracion.png',
  D2: '/lumen-dental/assets/D2_login_recepcion_staff.png',
  D3: '/lumen-dental/assets/D3_login_odontologo.png',
  D4: '/lumen-dental/assets/D4_login_marketing_comercial.png',
  D5: '/lumen-dental/assets/D5_login_paciente_demo.png',
  E1: '/lumen-dental/assets/E1_escaner_3d.png',
  E2: '/lumen-dental/assets/E2_radiografia_digital.png',
};

// ─── Colores ──────────────────────────────────────────────────────────────────
const C = {
  primary:   '#0369A1',
  primaryL:  '#0EA5E9',
  primaryD:  '#075985',
  accent:    '#F59E0B',
  success:   '#10B981',
  danger:    '#EF4444',
  warning:   '#F59E0B',
  // App content — light
  appBg:     '#F0F4F8',
  card:      '#FFFFFF',
  border:    '#E2E8F0',
  text:      '#0F172A',
  muted:     '#64748B',
  subtle:    '#F8FAFC',
  // Sidebar — dark navy
  sb:        '#0B1726',
  sbText:    '#F1F5F9',
  sbMuted:   '#8BA3C0',
  sbActive:  '#1E3457',
  sbBorder:  '#1E3A5F',
  // Landing dark sections
  dark:      '#0B1426',
  darkCard:  '#1A2438',
  darkText:  '#F1F5F9',
  darkMuted: '#94A3B8',
  white:     '#FFFFFF',
};

// ─── Auth / Roles ─────────────────────────────────────────────────────────────
const ROLES = {
  admin: {
    id: 'admin', label: 'Administración', short: 'Admin',
    icon: '🏛️', img: IMGS.D1, color: C.primary,
    user: 'admin@lumen.demo', pass: 'Admin2026#',
    desc: 'Panel ejecutivo, CRM, facturación, automatizaciones.',
    nav: [
      { id: 'overview',         icon: '📊', label: 'Dashboard' },
      { id: 'agenda',           icon: '📅', label: 'Agenda' },
      { id: 'pacientes',        icon: '🦷', label: 'Pacientes' },
      { id: 'facturacion',      icon: '💰', label: 'Facturación' },
      { id: 'marketing',        icon: '📣', label: 'Marketing' },
      { id: 'automatizaciones', icon: '⚡', label: 'Automatizaciones' },
      { id: 'agentes',          icon: '🤖', label: 'Agentes IA' },
      { id: 'integraciones',    icon: '🔌', label: 'Integraciones' },
    ],
  },
  staff: {
    id: 'staff', label: 'Recepción / Staff', short: 'Recepción',
    icon: '🗂️', img: IMGS.D2, color: '#7C3AED',
    user: 'recepcion@lumen.demo', pass: 'Staff2026#',
    desc: 'Agenda, check-in, mensajes y presupuestos.',
    nav: [
      { id: 'agenda',    icon: '📅', label: 'Agenda del día' },
      { id: 'pacientes', icon: '🦷', label: 'Pacientes' },
      { id: 'checkin',   icon: '✅', label: 'Check-in' },
      { id: 'mensajes',  icon: '💬', label: 'Mensajes' },
    ],
  },
  dentist: {
    id: 'dentist', label: 'Odontólogo/a', short: 'Odontología',
    icon: '👩‍⚕️', img: IMGS.D3, color: C.success,
    user: 'dra.vidal@lumen.demo', pass: 'Dent2026#',
    desc: 'Agenda propia, historial clínico, tratamientos.',
    nav: [
      { id: 'mi_agenda',    icon: '📅', label: 'Mi Agenda' },
      { id: 'historial',    icon: '📋', label: 'Historial Clínico' },
      { id: 'tratamientos', icon: '💊', label: 'Tratamientos' },
      { id: 'presupuestos', icon: '📝', label: 'Presupuestos' },
    ],
  },
  marketing: {
    id: 'marketing', label: 'Marketing / Comercial', short: 'Marketing',
    icon: '📊', img: IMGS.D4, color: C.accent,
    user: 'marketing@lumen.demo', pass: 'Mkt2026#',
    desc: 'KPIs, leads, email, social media y SEO.',
    nav: [
      { id: 'kpis',   icon: '📊', label: 'KPIs' },
      { id: 'leads',  icon: '👥', label: 'Leads' },
      { id: 'email',  icon: '📧', label: 'Email' },
      { id: 'social', icon: '📣', label: 'Social Media' },
      { id: 'seo',    icon: '🔍', label: 'SEO' },
    ],
  },
  patient: {
    id: 'patient', label: 'Paciente Demo', short: 'Paciente',
    icon: '🧑', img: IMGS.D5, color: '#EC4899',
    user: 'paciente@lumen.demo', pass: 'Pac2026#',
    desc: 'Citas, historial personal, documentos y facturas.',
    nav: [
      { id: 'mis_citas',   icon: '📅', label: 'Mis Citas' },
      { id: 'historial_p', icon: '📋', label: 'Mi Historial' },
      { id: 'facturas',    icon: '💳', label: 'Facturas' },
      { id: 'mensajes_p',  icon: '💬', label: 'Mensajes' },
    ],
  },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function demoToast(msg) {
  const el = document.getElementById('ld-toast');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; }, 2600);
}

// ─── Hook responsive ──────────────────────────────────────────────────────────
function useMobile() {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mob;
}

// ─── Componentes base (tema light) ────────────────────────────────────────────
function Pill({ label, color, sm }) {
  const c = color || C.primary;
  return (
    <span style={{
      background: c + '18', color: c, border: `1px solid ${c}33`,
      borderRadius: 20, padding: sm ? '2px 8px' : '3px 10px',
      fontSize: sm ? 10 : 11, fontWeight: 700, display: 'inline-block',
    }}>{label}</span>
  );
}

function Kpi({ label, value, sub, color, icon, trend }) {
  const trendColor = trend?.dir === 'up' ? C.success : C.danger;
  const trendArrow = trend?.dir === 'up' ? '↑' : '↓';
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '20px 16px', textAlign: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: '0.2s',
    }}>
      {icon && <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>}
      <div style={{ fontSize: 28, fontWeight: 900, color: color || C.primary, letterSpacing: '-0.5px' }}>{value}</div>
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
    <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color || C.primary, borderRadius: 4, transition: '0.4s' }} />
    </div>
  );
}

function SectionTitle({ eyebrow, title, center }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 40 }}>
      {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: C.primary, textTransform: 'uppercase', marginBottom: 8 }}>{eyebrow}</div>}
      <h2 style={{ margin: 0, fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: C.text, lineHeight: 1.25 }}>{title}</h2>
    </div>
  );
}

// ─── LOGIN V4: role-cards con imagen D + panel formulario ─────────────────────
// ─── APPOINTMENT MODAL V5 ─────────────────────────────────────────────────────
const BOOK_STEPS = ['Tratamiento','Profesional','Día y hora','Tus datos','Confirmación'];
function AppointmentModal({ onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ trat:'', prof:'', dia:'', hora:'', nombre:'', tel:'', email:'' });
  const horas = ['09:00','09:30','10:00','10:30','11:00','11:30','16:00','16:30','17:00'];
  const dias  = ['Lun 8 Sep','Mar 9 Sep','Mié 10 Sep','Jue 11 Sep','Vie 12 Sep'];

  function next() {
    if (step < 4) setStep(s => s + 1);
    else { demoToast('¡Cita solicitada! Te llamamos en 2h (demo)'); onClose(); }
  }
  const canNext = [
    !!form.trat, !!form.prof, !!form.dia && !!form.hora,
    !!form.nombre && !!form.tel, true,
  ][step];

  const overlayStyle = { position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 };
  const boxStyle = { background:C.card, borderRadius:16, padding:28, width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,0.25)' };
  const inp = { width:'100%', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:14, color:C.text, boxSizing:'border-box', marginBottom:12 };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontWeight:800, color:C.text, fontSize:17 }}>Pide tu cita</div>
            <div style={{ fontSize:12, color:C.muted }}>Paso {step+1} de {BOOK_STEPS.length} · {BOOK_STEPS[step]}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:C.muted }}>×</button>
        </div>
        {/* Progress */}
        <div style={{ display:'flex', gap:4, marginBottom:24 }}>
          {BOOK_STEPS.map((_,i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= step ? C.primary : C.border, transition:'0.2s' }} />
          ))}
        </div>
        {/* Steps */}
        {step === 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {SERVICIOS.slice(0,6).map(s => (
              <button key={s.id} onClick={() => setForm(f=>({...f, trat:s.nombre}))} style={{ border:`2px solid ${form.trat===s.nombre?C.primary:C.border}`, borderRadius:10, padding:'10px 14px', background:form.trat===s.nombre?C.primary+'12':'none', cursor:'pointer', textAlign:'left' }}>
                <span style={{ fontWeight:700, color:C.text, fontSize:13 }}>{s.icono} {s.nombre}</span>
                <span style={{ color:C.muted, fontSize:11, marginLeft:8 }}>desde {s.precioDesde}</span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {PROFESIONALES.map(p => (
              <button key={p.id} onClick={() => setForm(f=>({...f, prof:p.nombre}))} style={{ border:`2px solid ${form.prof===p.nombre?C.primary:C.border}`, borderRadius:10, padding:'12px 14px', background:form.prof===p.nombre?C.primary+'12':'none', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>{p.avatar}</span>
                <div>
                  <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{p.nombre}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{p.especialidad}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              {dias.map(d => (
                <button key={d} onClick={() => setForm(f=>({...f, dia:d}))} style={{ border:`2px solid ${form.dia===d?C.primary:C.border}`, borderRadius:8, padding:'8px 14px', background:form.dia===d?C.primary:'none', color:form.dia===d?'#fff':C.text, fontWeight:600, fontSize:13, cursor:'pointer' }}>{d}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {horas.map(h => (
                <button key={h} onClick={() => setForm(f=>({...f, hora:h}))} style={{ border:`2px solid ${form.hora===h?C.primary:C.border}`, borderRadius:8, padding:'8px 14px', background:form.hora===h?C.primary:'none', color:form.hora===h?'#fff':C.text, fontWeight:600, fontSize:13, cursor:'pointer' }}>{h}</button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Tu nombre completo" style={inp} />
            <input value={form.tel} onChange={e=>setForm(f=>({...f,tel:e.target.value}))} placeholder="Teléfono de contacto" style={inp} />
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email (opcional)" style={inp} />
          </div>
        )}
        {step === 4 && (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🦷</div>
            <div style={{ fontWeight:800, color:C.text, fontSize:17, marginBottom:8 }}>¡Todo listo!</div>
            <div style={{ color:C.muted, fontSize:13, marginBottom:16, lineHeight:1.7 }}>
              <strong>{form.trat}</strong> con <strong>{form.prof?.split(' ').slice(0,2).join(' ')}</strong><br />
              <strong>{form.dia}</strong> a las <strong>{form.hora}</strong>
            </div>
            <div style={{ background:C.success+'15', border:`1px solid ${C.success}44`, borderRadius:10, padding:'10px 16px', fontSize:12, color:C.success, fontWeight:600 }}>
              Te confirmaremos por WhatsApp en menos de 2 horas (demo)
            </div>
          </div>
        )}
        {/* Footer */}
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          {step > 0 && (
            <button onClick={() => setStep(s=>s-1)} style={{ flex:1, background:C.subtle, border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 0', fontWeight:700, fontSize:14, cursor:'pointer', color:C.muted }}>← Atrás</button>
          )}
          <button onClick={next} disabled={!canNext} style={{ flex:2, background:canNext?C.primary:C.border, color:'#fff', border:'none', borderRadius:10, padding:'11px 0', fontWeight:800, fontSize:14, cursor:canNext?'pointer':'not-allowed' }}>
            {step === 4 ? '✅ Confirmar cita' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN V5 ─────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [sel, setSel] = useState(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const mob = useMobile();

  const roleList = Object.values(ROLES);

  function handleSel(r) {
    setSel(r);
    setUser(r.user);
    setPass(r.pass);
    setErr('');
  }

  function handleLogin(e) {
    e.preventDefault();
    const role = roleList.find(r => r.user === user.trim() && r.pass === pass);
    if (role) {
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin(role.id); }, 800);
    } else {
      setErr('Credenciales incorrectas. Usa las de la tarjeta seleccionada.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.dark, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: "'DM Sans','Inter',system-ui,sans-serif",
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 40, height: 40, background: C.primary, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🦷</div>
        <span style={{ fontSize: 24, fontWeight: 800, color: C.white }}>Lumen Dental</span>
        <span style={{ background: C.primary + '33', color: C.primaryL, borderRadius: 6, fontSize: 10, fontWeight: 700, padding: '2px 8px', marginLeft: 4 }}>DEMO</span>
      </div>

      <div style={{ maxWidth: 960, width: '100%' }}>
        <h2 style={{ color: C.white, textAlign: 'center', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>Selecciona tu rol de acceso</h2>
        <p style={{ color: C.darkMuted, textAlign: 'center', fontSize: 13, margin: '0 0 28px' }}>Credenciales pre-rellenadas. Haz clic en una tarjeta para continuar.</p>

        {/* Role cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(5,1fr)',
          gap: 12, marginBottom: 32,
        }}>
          {roleList.map(r => (
            <button key={r.id} onClick={() => handleSel(r)} style={{
              border: `2px solid ${sel?.id === r.id ? r.color : 'transparent'}`,
              borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
              background: 'transparent', padding: 0, position: 'relative',
              transform: sel?.id === r.id ? 'scale(1.03)' : 'scale(1)',
              transition: '0.18s', boxShadow: sel?.id === r.id ? `0 0 0 3px ${r.color}33` : 'none',
            }}>
              <img src={r.img} alt={r.label} style={{ width: '100%', height: 110, objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
              <div style={{
                background: 'rgba(0,0,0,0.72)', padding: '10px 10px 12px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: r.color, marginBottom: 2 }}>{r.short}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{r.desc}</div>
              </div>
              {sel?.id === r.id && (
                <div style={{ position: 'absolute', top: 8, right: 8, background: r.color, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        {sel && (
          <div style={{ maxWidth: 400, margin: '0 auto', background: C.darkCard, border: `1px solid ${C.sbBorder}`, borderRadius: 16, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 24 }}>{sel.icon}</div>
              <div>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>{sel.label}</div>
                <div style={{ color: C.darkMuted, fontSize: 11 }}>{sel.user}</div>
              </div>
            </div>
            <form onSubmit={handleLogin}>
              <input value={user} onChange={e => setUser(e.target.value)} placeholder="Email"
                style={{ width: '100%', background: C.dark, border: `1px solid ${C.sbBorder}`, borderRadius: 8, padding: '10px 14px', color: C.white, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
              <div style={{ position:'relative', marginBottom:16 }}>
                <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña"
                  style={{ width: '100%', background: C.dark, border: `1px solid ${C.sbBorder}`, borderRadius: 8, padding: '10px 40px 10px 14px', color: C.white, fontSize: 14, boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.sbMuted, fontSize:14 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {err && <div style={{ color: C.danger, fontSize: 12, marginBottom: 12 }}>{err}</div>}
              <button type="submit" disabled={loading} style={{
                width: '100%', background: loading ? C.sbBorder : sel.color, color: C.white, border: 'none',
                borderRadius: 10, padding: '12px 0', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              }}>{loading ? 'Verificando...' : `Entrar como ${sel.short} →`}</button>
            </form>
          </div>
        )}
        {!sel && (
          <p style={{ textAlign: 'center', color: C.darkMuted, fontSize: 13, marginTop: 8 }}>↑ Selecciona una tarjeta para ver el formulario</p>
        )}
      </div>

      <p style={{ color: C.sbMuted, fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        Entorno de demostración · Datos ficticios · NO_REAL_EXTERNAL_ACTION=SI
      </p>
    </div>
  );
}

// ─── LANDING V4 ───────────────────────────────────────────────────────────────
function LandingPage({ onLogin }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const mob = useMobile();
  const heroCta = BRANDING.ctas?.[0] || 'Pide tu cita gratis';

  const faqs = [
    { q: '¿Cuánto cuesta la primera visita?', a: 'La primera visita de diagnóstico es completamente gratuita y sin compromiso. Incluye revisión general y, si se necesita, una radiografía panorámica digital sin coste adicional.' },
    { q: '¿Ofrecéis financiación sin intereses?', a: 'Sí, disponemos de financiación hasta 24 meses al 0% de interés para tratamientos a partir de 500 €. Tramitación en la propia clínica, sin necesidad de acudir al banco.' },
    { q: '¿Atendéis urgencias el mismo día?', a: 'Sí. Reservamos franjas horarias diarias para urgencias. Llama antes de las 10:00 h y te damos cita ese mismo día.' },
    { q: '¿Qué tecnología utilizáis para el diagnóstico?', a: 'Contamos con escáner 3D intraoral, radiografía digital de baja radiación y software de planificación quirúrgica para implantes con precisión submilimétrica.' },
    { q: '¿Cuánto dura un tratamiento de ortodoncia?', a: 'Depende del caso. La ortodoncia invisible (Invisalign) oscila entre 6 y 18 meses. La ortodoncia fija convencional suele requerir entre 12 y 24 meses. Te lo concretamos en la primera visita.' },
    { q: '¿Realizáis tratamientos para niños?', a: 'Sí, nuestra especialista en odontopediatría atiende desde los 3 años. Creemos en la prevención temprana y trabajamos para que los niños no tengan miedo al dentista.' },
    { q: '¿Puedo pedir cita online?', a: 'Sí, a través de nuestra app o de la sección de reservas de esta web. Recibirás confirmación por email y recordatorio SMS 24 h antes de la cita.' },
    { q: '¿Qué seguros médicos aceptáis?', a: 'Trabajamos con los principales seguros dentales del mercado. Consúltanos tu caso concreto y te indicamos la cobertura exacta sin coste.' },
    { q: '¿Están seguros mis datos clínicos?', a: 'Absolutamente. Cumplimos con el RGPD y la normativa española de protección de datos. Tus datos se alojan en servidores europeos con cifrado de extremo a extremo.' },
  ];

  const servicios = SERVICIOS.slice(0, 6);
  const teamImgs = [IMGS.B1, IMGS.B2, IMGS.B3, IMGS.B4];
  const team = PROFESIONALES.slice(0, 4).map((p, i) => ({
    img: teamImgs[i], name: p.nombre, role: p.especialidad, esp: `${p.experiencia || ''} · (ficticio)`,
  }));
  const facilities = [
    { img: IMGS.C1, title: 'Recepción Premium', desc: 'Espacio diseñado para transmitir calma y confianza desde el primer momento.' },
    { img: IMGS.C2, title: 'Gabinete Digital', desc: 'Equipado con la tecnología más avanzada en diagnóstico y tratamiento.' },
    { img: IMGS.C3, title: 'Sala de Espera', desc: 'Ambiente cuidado, WiFi y atención personalizada mientras esperas.' },
  ];

  const svcIcon = ['🦷','😁','🔬','💉','🔵','🧹'];

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif", color: C.text, background: '#fff', overflowX: 'hidden' }}>
      {showBooking && <AppointmentModal onClose={() => setShowBooking(false)} />}

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        padding: `0 ${mob ? 20 : 40}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, background: C.primary, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🦷</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>Lumen Dental</span>
        </div>
        {!mob && (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {['Servicios','Equipo','Instalaciones','FAQ'].map(l => (
              <a key={l} href="#" style={{ color: C.muted, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{l}</a>
            ))}
          </div>
        )}
        <button onClick={onLogin} style={{
          background: C.primary, color: '#fff', border: 'none', borderRadius: 8,
          padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>Área Privada</button>
      </nav>

      {/* HERO — imagen A1 */}
      <section style={{ position: 'relative', minHeight: mob ? 420 : 580, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src={IMGS.A1} alt="Clínica dental premium" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,25,61,0.88) 0%, rgba(3,105,161,0.65) 60%, transparent 100%)' }} />
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: `0 ${mob ? 24 : 60}px`, width: '100%' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: 24, padding: '6px 16px', marginBottom: 20,
            fontSize: 12, fontWeight: 700, color: C.accent,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
            Primera visita gratuita · Sin compromiso
          </div>
          <h1 style={{
            margin: '0 0 18px', color: '#fff', fontWeight: 900,
            fontSize: mob ? 32 : 54, lineHeight: 1.1, letterSpacing: '-0.5px', maxWidth: 540,
          }}>
            Tu sonrisa merece<br />
            <span style={{ background: `linear-gradient(90deg,${C.accent},#FDE68A)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              el mejor cuidado
            </span>
          </h1>
          <p style={{ color: 'rgba(186,230,253,0.9)', fontSize: mob ? 15 : 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            {CLIENT_PROFILE.propuestaValor}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => setShowBooking(true)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {heroCta} →
            </button>
            <button onClick={onLogin} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Área privada
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: C.primary, padding: '16px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-around' }}>
          {[['⭐ 4.9/5', '800+ reseñas Google (ficticio)'], ['🦷', '+5.000 pacientes atendidos'], ['💉', 'Especialistas certificados'], ['📅', 'Cita en 24h garantizada']].map(([ic, tx]) => (
            <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <span style={{ fontSize: 18 }}>{ic}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICIOS */}
      <section style={{ background: '#F8FAFF', padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle eyebrow="Nuestros tratamientos" title="Todo lo que tu sonrisa necesita" center />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(3,1fr)', gap: 20 }}>
            {servicios.map((s, i) => (
              <div key={s.id} style={{
                background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: '0.2s',
              }}>
                <div style={{ width: 48, height: 48, background: C.primary + '14', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{svcIcon[i] || '🦷'}</div>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 16, marginBottom: 6 }}>{s.nombre}</div>
                <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{s.desc}</div>
                <div style={{ fontWeight: 800, color: C.primary, fontSize: 16 }}>desde {s.precioDesde}€</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ LUMEN */}
      <section style={{ background: C.dark, padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: mob ? 'block' : 'flex', gap: 60, alignItems: 'center' }}>
          <div style={{ flex: 1, marginBottom: mob ? 32 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: C.primaryL, textTransform: 'uppercase', marginBottom: 8 }}>¿Por qué elegir Lumen?</div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: mob ? 28 : 40, lineHeight: 1.2, margin: '0 0 20px' }}>
              No somos la clínica más barata.<br />Somos la mejor decisión.
            </h2>
            <p style={{ color: C.darkMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Combinamos años de experiencia clínica con tecnología de última generación. El resultado: tratamientos más rápidos, más precisos y con menos molestias.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { ic: '🔬', t: 'Tecnología 3D de precisión', d: 'Escáner intraoral y planificación digital para resultados predecibles.' },
                { ic: '🤝', t: 'Transparencia total', d: 'Presupuesto cerrado antes de empezar. Sin costes ocultos, nunca.' },
                { ic: '💳', t: 'Financiación sin intereses', d: 'Hasta 24 meses al 0%. Aprobación inmediata en clínica.' },
              ].map(({ ic, t, d }) => (
                <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 22, width: 36, flexShrink: 0, marginTop: 2 }}>{ic}</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{t}</div>
                    <div style={{ color: C.darkMuted, fontSize: 13, marginTop: 2 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['98%', 'satisfacción pacientes'], ['+5.000', 'pacientes atendidos'], ['15+', 'años de experiencia'], ['24h', 'cita garantizada']].map(([v, l]) => (
                <div key={l} style={{ background: C.darkCard, border: `1px solid ${C.sbBorder}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: C.primaryL, letterSpacing: '-1px' }}>{v}</div>
                  <div style={{ fontSize: 12, color: C.darkMuted, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TECNOLOGÍA — E1, E2 */}
      <section style={{ background: '#fff', padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle eyebrow="Tecnología" title="Diagnóstico digital de vanguardia" center />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 24 }}>
            {[
              { img: IMGS.E1, title: 'Escáner 3D Intraoral', desc: 'Captura la anatomía completa de tu boca en minutos. Sin molduras incómodas, con precisión submilimétrica.' },
              { img: IMGS.E2, title: 'Radiografía Digital Panorámica', desc: 'Imagen completa en baja radiación. Diagnóstico inmediato y archivado seguro en tu historial digital.' },
            ].map(({ img, title, desc }) => (
              <div key={title} style={{ background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                <img src={img} alt={title} style={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
                <div style={{ padding: 24 }}>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 17, marginBottom: 8 }}>{title}</div>
                  <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTA — A2 */}
      <section style={{ background: C.primary, padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: mob ? 'block' : 'flex', gap: 60, alignItems: 'center' }}>
          <div style={{ flex: 1, marginBottom: mob ? 28 : 0 }}>
            <img src={IMGS.A2} alt="Consulta dental premium" style={{ width: '100%', borderRadius: 16, display: 'block', maxHeight: 340, objectFit: 'cover', objectPosition: 'center 25%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 10 }}>Tu primera visita</div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: mob ? 26 : 36, lineHeight: 1.25, margin: '0 0 16px' }}>
              Empieza sin miedo.<br />Sin compromiso.
            </h2>
            <p style={{ color: 'rgba(186,230,253,0.85)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              En la primera visita revisamos tu boca en profundidad, te explicamos todo sin tecnicismos y te entregamos un plan de tratamiento con precios cerrados.
            </p>
            <ul style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.8, paddingLeft: 18 }}>
              {['Revisión completa gratuita', 'Radiografía panorámica incluida', 'Presupuesto personalizado sin coste', 'Sin listas de espera'].map(p => <li key={p}>{p}</li>)}
            </ul>
            <button onClick={() => setShowBooking(true)} style={{ marginTop: 28, background: '#fff', color: C.primary, border: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              Pedir primera cita →
            </button>
          </div>
        </div>
      </section>

      {/* EQUIPO — B1-B4 */}
      <section style={{ background: C.appBg, padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle eyebrow="Nuestro equipo" title="Especialistas que cuidan de tu sonrisa" center />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4,1fr)', gap: 20 }}>
            {team.map(({ img, name, role, esp }) => (
              <div key={name} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
                <img src={img} alt={name} style={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                <div style={{ padding: '16px 18px 18px' }}>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 15 }}>{name}</div>
                  <div style={{ color: C.primary, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{role}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{esp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALACIONES — C1-C3 */}
      <section style={{ background: '#fff', padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle eyebrow="Nuestras instalaciones" title="Un espacio diseñado para tu bienestar" center />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
            {facilities.map(({ img, title, desc }) => (
              <div key={title} style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.subtle }}>
                <img src={img} alt={title} style={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
                <div style={{ padding: '18px 20px 20px' }}>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 15, marginBottom: 6 }}>{title}</div>
                  <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ background: '#F8FAFF', padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle eyebrow="Testimonios" title="Lo que dicen nuestros pacientes" center />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
            {[
              { t: '"Llevo 3 años siendo paciente de Lumen Dental. El equipo es increíble y el resultado fue mejor de lo que esperaba."', n: 'Ana G. · Ortodoncia' },
              { t: '"Los implantes fueron la mejor decisión de mi vida. Sin dolor, sin esperas, con financiación real."', n: 'Luis M. · Implantología' },
              { t: '"Primera clínica donde no le tengo miedo al sillón. Los doctores son humanos de verdad."', n: 'Rosa F. · Revisión anual' },
            ].map(({ t, n }) => (
              <div key={n} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ color: C.primary, fontSize: 32, lineHeight: 1, marginBottom: 12 }}>"</div>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 16px' }}>{t}</p>
                <div style={{ color: C.muted, fontSize: 12, fontWeight: 700 }}>{n} <span style={{ fontWeight: 400 }}>(ficticio)</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#fff', padding: mob ? '56px 24px' : '80px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionTitle eyebrow="Preguntas frecuentes" title="Resuelve tus dudas" center />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: '100%', background: openFaq === i ? C.subtle : '#fff',
                  border: 'none', padding: '16px 20px', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14, color: C.text,
                }}>
                  {f.q}
                  <span style={{ color: C.primary, fontSize: 18, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: '0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', background: C.subtle, color: C.muted, fontSize: 14, lineHeight: 1.7 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: `linear-gradient(135deg, ${C.primaryD} 0%, ${C.primary} 60%, ${C.primaryL} 100%)`, padding: mob ? '64px 24px' : '88px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: mob ? 28 : 42, margin: '0 0 16px', lineHeight: 1.2 }}>
            ¿Listo para tu mejor sonrisa?
          </h2>
          <p style={{ color: 'rgba(186,230,253,0.88)', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Primera visita gratuita. Sin listas de espera. Presupuesto sin compromiso.
          </p>
          <button onClick={() => setShowBooking(true)} style={{
            background: '#fff', color: C.primary, border: 'none', borderRadius: 12,
            padding: '16px 40px', fontWeight: 800, fontSize: 17, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            Solicitar cita ahora →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.dark, padding: '36px 40px', color: C.darkMuted }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 22 }}>🦷</div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Lumen Dental</span>
          </div>
          <div style={{ fontSize: 12 }}>
            © 2026 Lumen Dental · C. Larios, 12, Málaga (ficticio) ·{' '}
            <a href="#" style={{ color: C.primaryL, textDecoration: 'none' }}>Privacidad</a> ·{' '}
            <a href="#" style={{ color: C.primaryL, textDecoration: 'none' }}>Aviso legal</a>
          </div>
          <button onClick={onLogin} style={{ background: 'transparent', color: C.primaryL, border: `1px solid ${C.sbBorder}`, borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Área Privada →
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell({ role, page, onPage, onLogout, children }) {
  const r = ROLES[role];
  const [collapsed, setCollapsed] = useState(false);
  const mob = useMobile();
  const sbW = collapsed ? 60 : 220;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.appBg }}>
      {/* Sidebar */}
      <div style={{
        width: mob ? 0 : sbW, flexShrink: 0, overflow: 'hidden',
        background: C.sb, display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${C.sbBorder}`, transition: '0.2s',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${C.sbBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: C.primary, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🦷</div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: 15, color: C.sbText, whiteSpace: 'nowrap' }}>Lumen Dental</span>}
        </div>
        {/* Role info */}
        {!collapsed && (
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.sbBorder}` }}>
            <div style={{ fontSize: 10, color: C.sbMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Acceso como</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: r.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{r.icon}</div>
              <div>
                <div style={{ color: C.sbText, fontWeight: 700, fontSize: 12 }}>{r.label}</div>
                <div style={{ color: C.sbMuted, fontSize: 10 }}>{r.user}</div>
              </div>
            </div>
          </div>
        )}
        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {r.nav.map(n => {
            const active = n.id === page;
            return (
              <button key={n.id} onClick={() => onPage(n.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 10px', borderRadius: 8, marginBottom: 2,
                background: active ? C.sbActive : 'transparent',
                border: 'none', cursor: 'pointer',
                color: active ? C.sbText : C.sbMuted,
                fontWeight: active ? 700 : 500, fontSize: 13, textAlign: 'left',
                transition: '0.15s',
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>}
              </button>
            );
          })}
        </nav>
        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${C.sbBorder}`, padding: 8 }}>
          <button onClick={() => setCollapsed(c => !c)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: C.sbMuted, padding: '8px 10px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{collapsed ? '→' : '←'}</span>
            {!collapsed && 'Colapsar'}
          </button>
          <button onClick={onLogout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: C.sbMuted, padding: '8px 10px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🚪</span>
            {!collapsed && 'Salir'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          height: 56, background: C.card, borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', padding: '0 24px',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {mob && (
              <div style={{ fontSize: 20 }}>🦷</div>
            )}
            <div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
                {r.nav.find(n => n.id === page)?.label || 'Dashboard'}
              </div>
              <div style={{ color: C.muted, fontSize: 11 }}>Lumen Dental · Demo</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => demoToast('Notificaciones — funcionalidad demo')} style={{ background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: C.muted }}>🔔</button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: r.color + '22', border: `2px solid ${r.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{r.icon}</div>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: mob ? 16 : 24 }}>
          {children}
        </div>
        {/* Mobile bottom tab nav */}
        {mob && (
          <div style={{ background:C.sb, borderTop:`1px solid ${C.sbBorder}`, display:'flex', overflowX:'auto', flexShrink:0 }}>
            {r.nav.map(n => {
              const active = n.id === page;
              return (
                <button key={n.id} onClick={() => onPage(n.id)} style={{
                  flex:'1 0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                  background: active ? C.sbActive : 'transparent', border:'none', cursor:'pointer',
                  color: active ? C.sbText : C.sbMuted,
                  padding:'8px 6px', minWidth:48,
                }}>
                  <span style={{ fontSize:16 }}>{n.icon}</span>
                  <span style={{ fontSize:9, fontWeight: active ? 700 : 400, whiteSpace:'nowrap' }}>{n.label}</span>
                </button>
              );
            })}
            <button onClick={onLogout} style={{ flex:'1 0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'transparent', border:'none', cursor:'pointer', color:C.sbMuted, padding:'8px 6px', minWidth:48 }}>
              <span style={{ fontSize:16 }}>🚪</span>
              <span style={{ fontSize:9, whiteSpace:'nowrap' }}>Salir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PÁGINAS ADMIN ─────────────────────────────────────────────────────────────
function AdminOverview() {
  const m = METRICAS;
  const activity = [
    { t:'09:15', msg:'Nueva cita confirmada — Ana Gómez', ic:'📅' },
    { t:'08:42', msg:'Lead captado desde Instagram', ic:'📱' },
    { t:'08:20', msg:'Presupuesto #pres-02 enviado a Javier Blanco', ic:'📄' },
    { t:'Ayer',  msg:'Informe semanal generado y enviado', ic:'📊' },
  ];
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: C.text, fontWeight: 800, fontSize: 20, margin: '0 0 4px' }}>Dashboard Ejecutivo — {CLIENT_PROFILE.nombre}</h2>
        <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})} · {CLIENT_PROFILE.localidad}</p>
      </div>
      {/* KPIs row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 14, marginBottom: 14 }}>
        <Kpi label="Ingresos mes" value={m.ingresosMes} color={C.success} icon="💰" trend={{ dir:'up', pct:'12%', label:'vs mes ant.' }} />
        <Kpi label="Pipeline valor" value={m.valorPipeline} color={C.primary} icon="📈" trend={{ dir:'up', pct:'8%' }} />
        <Kpi label="Ticket medio" value={m.ticketMedio} color={C.accent} icon="💶" />
        <Kpi label="NPS" value={m.netPromoterScore} color={C.success} icon="⭐" />
        <Kpi label="Lead→cita" value={m.lead_a_cita} color='#7C3AED' icon="🎯" />
        <Kpi label="Satisfacción" value={`${m.satisfaccion}/5`} color={C.success} icon="😊" />
      </div>
      {/* KPIs row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 14, marginBottom: 20 }}>
        <Kpi label="Consultas mes" value={m.consultasMes} color={C.primary} icon="🦷" />
        <Kpi label="Citas hoy" value={m.citasHoy} color={C.accent} icon="📅" />
        <Kpi label="Nuevos pacientes" value={m.nuevosPacientes} color={C.success} icon="👤" />
        <Kpi label="Conversión" value={`${m.tasaConversion}%`} color='#7C3AED' icon="🔄" />
      </div>
      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 14, fontSize: 14 }}>📅 Agenda de hoy</div>
          {AGENDA_HOY.slice(0,5).map(c => (
            <div key={c.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ background: C.primary+'18', color: C.primary, borderRadius:6, padding:'3px 9px', fontSize:11, fontWeight:800, minWidth:46, textAlign:'center' }}>{c.hora}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{c.paciente}</div>
                <div style={{ fontSize:11, color:C.muted }}>{c.tratamiento} · {c.prof}</div>
              </div>
              <Pill label={c.estado} color={c.estado==='urgente'?C.danger:c.estado==='confirmada'?C.success:C.primary} sm />
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:14, fontSize:14 }}>⚡ Actividad reciente</div>
          {activity.map((a,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:12 }}>
              <span style={{ fontSize:16 }}>{a.ic}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:C.text }}>{a.msg}</div>
                <div style={{ fontSize:10, color:C.muted }}>{a.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAgenda() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Agenda Clínica</h2>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr 120px', padding:'10px 20px', background:C.subtle, borderBottom:`1px solid ${C.border}`, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase' }}>
          {['Hora','Paciente','Tratamiento','Profesional','Estado'].map(h => <div key={h}>{h}</div>)}
        </div>
        {AGENDA_HOY.map(c => (
          <div key={c.id} style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr 120px', padding:'12px 20px', borderBottom:`1px solid ${C.border}`, alignItems:'center', fontSize:13 }}>
            <div style={{ color:C.primary, fontWeight:700 }}>{c.hora}</div>
            <div style={{ color:C.text, fontWeight:600 }}>{c.paciente}</div>
            <div style={{ color:C.muted }}>{c.tratamiento}</div>
            <div style={{ color:C.muted }}>{c.prof}</div>
            <Pill label={c.estado} color={c.estado==='urgente'?C.danger:c.estado==='confirmada'?C.success:C.primary} sm />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPacientes() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Gestión de Pacientes</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {PACIENTES.map(p => (
          <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:C.primary+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🦷</div>
              <div>
                <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{p.nombre}</div>
                <div style={{ fontSize:11, color:C.muted }}>{p.email}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <Pill label={p.tratamiento||'Sin trat.'} sm />
              <Pill label={p.estado} color={p.estado==='activo'?C.success:C.muted} sm />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminFacturacion() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Facturación</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        <Kpi label="Pipeline" value={METRICAS.valorPipeline} color={C.success} icon="💶" />
        <Kpi label="Presupuestos" value={PRESUPUESTOS.length} color={C.primary} icon="📄" />
        <Kpi label="Aceptados" value={PRESUPUESTOS.filter(p=>p.estado==='aceptado'||p.estado==='firmado').length} color={C.success} icon="✅" />
        <Kpi label="Ticket medio" value={METRICAS.ticketMedio} color={C.accent} icon="💰" />
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        {PRESUPUESTOS.map(p => (
          <div key={p.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 20px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{p.paciente}</div>
              <div style={{ fontSize:11, color:C.muted }}>{p.tratamiento}</div>
            </div>
            <div style={{ fontWeight:800, color:C.success, fontSize:15 }}>{p.importe}</div>
            <Pill label={p.estado} color={p.estado==='aceptado'||p.estado==='firmado'?C.success:p.estado==='borrador'?C.muted:C.warning} sm />
            <button onClick={()=>demoToast('PDF generado (demo)')} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer', color:C.muted }}>PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMarketing() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Panel de Marketing</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        <Kpi label="Leads este mes" value={LEADS.length} color={C.primary} icon="👥" trend={{dir:'up',pct:'18%'}} />
        <Kpi label="Conversión" value={`${METRICAS.tasaConversion}%`} color={C.success} icon="📈" />
        <Kpi label="Coste x lead" value="29€" color={C.accent} icon="💰" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:14, fontSize:14 }}>Leads recientes</div>
          {LEADS.map(l => (
            <div key={l.id} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ flex:1, fontSize:12, color:C.text }}>{l.nombre}</div>
              <Pill label={l.fuente} color={C.primary} sm />
              <div style={{ fontSize:10, color:C.muted }}>{l.diasInactivo}d</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:14, fontSize:14 }}>Posts programados</div>
          {SOCIAL_POSTS.slice(0,5).map(s => (
            <div key={s.id} style={{ padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>{s.red}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.copy?.substring(0,60)}...</div>
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
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Automatizaciones</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {AUTOMATIZACIONES.map(a => (
          <div key={a.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13, flex:1 }}>{a.nombre}</div>
              <Pill label={a.estado} color={a.estado==='MOCK'?C.success:C.accent} sm />
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>⚡ {a.trigger}</div>
            <div style={{ fontSize:10, color:C.muted, marginBottom:10 }}>{a.plataformas.join(' · ')}</div>
            <button onClick={()=>demoToast(`${a.nombre} — test (demo)`)} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'3px 10px', cursor:'pointer', color:C.primary, fontWeight:700, fontSize:11 }}>Probar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAgentes() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Agentes IA</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {AGENTES_IA.map(a => (
          <div key={a.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{a.nombre}</div>
              <Pill label={a.rol} color={C.primary} sm />
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:8, lineHeight:1.5 }}>{a.mision}</div>
            <div style={{ fontSize:10, color:C.danger+'bb', marginBottom:10 }}>⚠ {a.guardrail}</div>
            <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
              <span style={{ fontSize:10, color:C.muted }}>↑ {a.escalado?.substring(0,40)}…</span>
              <button onClick={()=>demoToast(`${a.nombre} — respuesta demo`)} style={{ background:C.primary+'18', border:'none', borderRadius:6, padding:'3px 10px', cursor:'pointer', color:C.primary, fontWeight:700, fontSize:11 }}>Ejecutar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminIntegraciones() {
  const hs = HEALTH_SNAPSHOT;
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Integraciones & Salud del Sistema</h2>
      {/* Health score banner */}
      <div style={{ background: hs.score>=85?C.success+'15':C.warning+'15', border:`1px solid ${hs.score>=85?C.success+'44':C.warning+'44'}`, borderRadius:12, padding:'14px 20px', marginBottom:20, display:'flex', gap:20, alignItems:'center' }}>
        <div style={{ fontSize:36, fontWeight:900, color:hs.score>=85?C.success:C.warning }}>{hs.score}</div>
        <div>
          <div style={{ fontWeight:800, color:C.text, fontSize:15 }}>Health Score — {hs.overallStatus}</div>
          <div style={{ fontSize:12, color:C.muted }}>Sistema en {hs.productionReadinessNote}</div>
        </div>
      </div>
      {/* Dimensiones */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12, marginBottom:24 }}>
        {hs.dimensiones.map(d => (
          <div key={d.nombre} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{d.nombre}</div>
              <span style={{ fontWeight:800, color:d.estado==='HEALTHY'?C.success:C.warning, fontSize:14 }}>{d.score}</span>
            </div>
            <Bar pct={d.score} color={d.estado==='HEALTHY'?C.success:C.warning} />
            <div style={{ fontSize:10, color:C.muted, marginTop:6 }}>{d.nota}</div>
          </div>
        ))}
      </div>
      {/* Plataformas table */}
      <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:12 }}>Plataformas</div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px 80px', padding:'8px 16px', background:C.subtle, borderBottom:`1px solid ${C.border}`, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase' }}>
          {['Plataforma','Estado','Usada','Modo'].map(h=><div key={h}>{h}</div>)}
        </div>
        {PLATAFORMAS.map(p => (
          <div key={p.nombre} style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px 80px', padding:'10px 16px', borderBottom:`1px solid ${C.border}`, alignItems:'center', fontSize:12 }}>
            <div style={{ color:C.text, fontWeight:600 }}>{p.nombre}</div>
            <Pill label={p.status==='AVAILABLE'?'OK':p.status==='REQUIRES_REAL_CREDS'?'Pendiente':'Mock'} color={p.status==='AVAILABLE'?C.success:p.status==='REQUIRES_REAL_CREDS'?C.warning:C.muted} sm />
            <div style={{ display:'flex', alignItems:'center' }}><StatusDot ok={p.usada} /></div>
            <Pill label={p.modo} color={p.modo==='REAL'?C.primary:C.muted} sm />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PÁGINAS STAFF ─────────────────────────────────────────────────────────────
function StaffAgenda() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 8px' }}>Agenda del Día</h2>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 20px' }}>{AGENDA_HOY.length} citas programadas hoy</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {AGENDA_HOY.map(c => (
          <div key={c.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 18px', display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ background:C.primary+'18', color:C.primary, borderRadius:8, padding:'8px 14px', fontWeight:800, fontSize:14, minWidth:56, textAlign:'center' }}>{c.hora}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{c.paciente}</div>
              <div style={{ fontSize:12, color:C.muted }}>{c.tratamiento} · {c.prof}</div>
            </div>
            <Pill label={c.estado} color={c.estado==='urgente'?C.danger:c.estado==='confirmada'?C.success:C.primary} sm />
            <button onClick={()=>demoToast(`Check-in ${c.paciente} registrado`)} style={{ background:C.success+'18', border:'none', borderRadius:8, padding:'6px 14px', color:C.success, fontWeight:700, fontSize:12, cursor:'pointer' }}>✅ Check-in</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffPacientes() { return <AdminPacientes />; }

function StaffCheckin() {
  const [q, setQ] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const results = q.length >= 2 ? PACIENTES.filter(p => p.nombre.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Check-in Pacientes</h2>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:24, maxWidth:520 }}>
        <div style={{ marginBottom:12, fontSize:13, color:C.muted }}>Escribe al menos 2 caracteres para buscar</div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Nombre del paciente..." style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:14, color:C.text, boxSizing:'border-box', marginBottom:q?12:0 }} />
        {results.length > 0 && (
          <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', marginBottom:14 }}>
            {results.map(p => (
              <button key={p.id} onClick={()=>{ setConfirmed(p); demoToast(`Check-in: ${p.nombre} (demo)`); setQ(''); }} style={{ display:'flex', gap:12, alignItems:'center', width:'100%', padding:'10px 14px', background:'none', border:'none', borderBottom:`1px solid ${C.border}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:C.primary+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🦷</div>
                <div>
                  <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{p.nombre}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{p.tratamiento} · {p.estado}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {q.length >= 2 && results.length === 0 && (
          <div style={{ fontSize:13, color:C.muted, padding:'8px 0 14px' }}>Sin coincidencias</div>
        )}
        {confirmed && (
          <div style={{ background:C.success+'15', border:`1px solid ${C.success}44`, borderRadius:10, padding:'12px 16px' }}>
            <div style={{ fontWeight:700, color:C.success, fontSize:13 }}>✅ Check-in registrado</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{confirmed.nombre} · {new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StaffMensajes() {
  const msgs = [
    { de:'Dra. Vidal', asunto:'Confirmar cita García mañana', hora:'09:14', leido:false },
    { de:'Sistema', asunto:'Recordatorio: 3 citas sin confirmar', hora:'08:00', leido:true },
    { de:'Administración', asunto:'Revisión de presupuestos pendientes', hora:'Ayer', leido:true },
  ];
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Mensajes</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ background:C.card, border:`1px solid ${m.leido?C.border:C.primary+'44'}`, borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:m.leido?600:800, color:C.text, fontSize:13 }}>{m.asunto}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>De: {m.de}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:C.muted }}>{m.hora}</div>
              {!m.leido && <div style={{ width:8, height:8, background:C.primary, borderRadius:'50%', marginLeft:'auto', marginTop:4 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PÁGINAS DENTIST ──────────────────────────────────────────────────────────
function DentistMiAgenda() {
  const propias = AGENDA_HOY.filter(c => c.prof?.includes('Vidal') || c.prof?.includes('Dr'));
  const citas = propias.length > 0 ? propias : AGENDA_HOY.slice(0,4);
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 8px' }}>Mi Agenda</h2>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 20px' }}>Dra. Carla Vidal · Hoy: {citas.length} citas</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {citas.map(c => (
          <div key={c.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 18px', display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ background:C.success+'18', color:C.success, borderRadius:8, padding:'8px 14px', fontWeight:800, fontSize:14, minWidth:56, textAlign:'center' }}>{c.hora}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{c.paciente}</div>
              <div style={{ fontSize:12, color:C.muted }}>{c.tratamiento}</div>
            </div>
            <Pill label={c.estado} color={c.estado==='urgente'?C.danger:C.success} sm />
            <button onClick={()=>demoToast('Historia clínica abierta (demo)')} style={{ background:C.success+'18', border:'none', borderRadius:8, padding:'6px 14px', color:C.success, fontWeight:700, fontSize:12, cursor:'pointer' }}>HC →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DentistHistorial() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Historial Clínico</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {PACIENTES.map(p => (
          <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:4 }}>{p.nombre}</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{p.email}</div>
            <div style={{ fontSize:12, color:C.text, marginBottom:10 }}>
              <span style={{ fontWeight:600 }}>Tratamiento: </span>{p.tratamiento || 'Ninguno activo'}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>demoToast('Historial completo (demo)')} style={{ background:C.primary+'18', border:'none', borderRadius:6, padding:'4px 10px', color:C.primary, fontWeight:700, fontSize:11, cursor:'pointer' }}>Ver HC</button>
              <button onClick={()=>demoToast('Rx digital abierta (demo)')} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 10px', color:C.muted, fontSize:11, cursor:'pointer' }}>Radiografía</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DentistTratamientos() {
  const progreso = [
    { pac:'María García', trat:'Ortodoncia invisible', pct:57, nota:'Cambio de alineadores #8. Próxima revisión en 3 semanas.' },
    { pac:'Luis Fernández', trat:'Implante unidad 36', pct:40, nota:'Fase osteointegración. Control RX en 6 semanas.' },
    { pac:'Ana Martínez', trat:'Blanqueamiento LED', pct:100, nota:'Completado. Alta. Control a los 6 meses.' },
    { pac:'Carlos López', trat:'Endodoncia molar', pct:70, nota:'Segunda sesión completada. Falta reconstrucción.' },
  ];
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Seguimiento de Tratamientos</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {progreso.map(({ pac, trat, pct, nota }) => (
          <div key={pac} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <div>
                <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{pac}</div>
                <div style={{ fontSize:12, color:C.muted }}>{trat}</div>
              </div>
              <span style={{ fontWeight:800, color:pct===100?C.success:C.primary, fontSize:20 }}>{pct}%</span>
            </div>
            <Bar pct={pct} color={pct===100?C.success:C.primary} />
            <div style={{ fontSize:11, color:C.muted, marginTop:8, fontStyle:'italic' }}>{nota}</div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={()=>demoToast('Historia clínica actualizada (demo)')} style={{ background:C.primary+'18', border:'none', borderRadius:6, padding:'4px 10px', color:C.primary, fontWeight:700, fontSize:11, cursor:'pointer' }}>HC</button>
              <button onClick={()=>demoToast('Rx visualizada (demo)')} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 10px', color:C.muted, fontSize:11, cursor:'pointer' }}>Rx</button>
              <button onClick={()=>demoToast('Nota añadida (demo)')} style={{ background:C.success+'18', border:'none', borderRadius:6, padding:'4px 10px', color:C.success, fontWeight:700, fontSize:11, cursor:'pointer' }}>+ Nota</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DentistPresupuestos() {
  const mios = PRESUPUESTOS.slice(0,4);
  const acept = mios.filter(p=>p.estado==='aceptado'||p.estado==='firmado').length;
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Mis Presupuestos</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        <Kpi label="Pipeline" value={METRICAS.valorPipeline} color={C.success} icon="💶" />
        <Kpi label="Emitidos" value={mios.length} color={C.primary} icon="📄" />
        <Kpi label="Aceptados" value={acept} color={C.success} icon="✅" />
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {mios.map(p => (
          <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{p.paciente}</div>
              <div style={{ fontSize:11, color:C.muted }}>{p.tratamiento}</div>
            </div>
            <div style={{ fontWeight:800, color:C.success, fontSize:15 }}>{p.importe}</div>
            <Pill label={p.estado} color={p.estado==='aceptado'||p.estado==='firmado'?C.success:p.estado==='borrador'?C.muted:C.warning} sm />
            <button onClick={()=>demoToast('PDF generado (demo)')} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer', color:C.muted }}>PDF</button>
            <button onClick={()=>demoToast('Enviado por email (demo)')} style={{ background:C.primary+'18', border:'none', borderRadius:6, padding:'4px 10px', color:C.primary, fontWeight:700, fontSize:11, cursor:'pointer' }}>Enviar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PÁGINAS MARKETING ────────────────────────────────────────────────────────
function MktKPIs() {
  const m = METRICAS;
  const embudo = [
    { et:'Visitas web', n:4820, color:C.primary },
    { et:'Leads captados', n:m.leadsMes||284, color:'#7C3AED' },
    { et:'Contactos calificados', n:141, color:C.accent },
    { et:'Citas reservadas', n:62, color:C.success },
    { et:'Pacientes nuevos', n:38, color:'#EC4899' },
  ];
  const max = embudo[0].n;
  const canales = [
    { n:'Google Ads', pct:42, gasto:'1.240€', cpl:'29€' },
    { n:'Instagram', pct:27, gasto:'540€', cpl:'20€' },
    { n:'SEO orgánico', pct:21, gasto:'0€', cpl:'0€' },
    { n:'Referidos', pct:10, gasto:'0€', cpl:'0€' },
  ];
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>KPIs de Captación</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        <Kpi label="Leads mes" value={LEADS.length} color={C.primary} icon="👥" trend={{dir:'up',pct:'18%'}} />
        <Kpi label="Conversión" value={`${m.tasaConversion}%`} color={C.success} icon="📈" />
        <Kpi label="Coste/lead" value="29€" color={C.accent} icon="💰" />
        <Kpi label="ROI Google" value="4.2x" color={C.success} icon="🎯" trend={{dir:'up',pct:'0.5x'}} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:16, fontSize:14 }}>Embudo de captación</div>
          {embudo.map(({ et, n, color }, i) => (
            <div key={et} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.muted, marginBottom:4 }}>
                <span>{et}</span><span style={{ fontWeight:700, color:C.text }}>{n.toLocaleString('es')}</span>
              </div>
              <div style={{ background:C.border, borderRadius:4, height:8, overflow:'hidden' }}>
                <div style={{ width:`${(n/max)*100}%`, height:'100%', background:color, borderRadius:4, opacity: 1-i*0.1 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:16, fontSize:14 }}>Rendimiento por canal</div>
          {canales.map(({ n, pct, gasto, cpl }) => (
            <div key={n} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span style={{ fontWeight:600, color:C.text }}>{n}</span>
                <span style={{ color:C.muted }}>{gasto} · CPL: {cpl}</span>
              </div>
              <Bar pct={pct} color={C.primary} />
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{pct}% de leads</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MktLeads() {
  const STAGES = [
    { id:'nuevo',       label:'Nuevo',        color:C.muted },
    { id:'contactado',  label:'Contactado',   color:C.primary },
    { id:'presupuesto', label:'Presupuesto',  color:C.accent },
    { id:'seguimiento', label:'Seguimiento',  color:'#7C3AED' },
    { id:'ganado',      label:'Ganado',       color:C.success },
  ];
  const assigned = LEADS.map((l,i) => ({ ...l, stage: STAGES[i % STAGES.length].id }));
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Pipeline de Leads</h2>
      <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
        {STAGES.map(st => {
          const cols = assigned.filter(l => l.stage === st.id);
          return (
            <div key={st.id} style={{ minWidth:200, background:C.subtle, borderRadius:12, padding:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontWeight:700, fontSize:12, color:st.color }}>{st.label}</span>
                <span style={{ background:st.color+'22', color:st.color, borderRadius:10, fontSize:11, padding:'2px 8px', fontWeight:700 }}>{cols.length}</span>
              </div>
              {cols.map(l => (
                <div key={l.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:12, marginBottom:8 }}>
                  <div style={{ fontWeight:700, color:C.text, fontSize:12, marginBottom:4 }}>{l.nombre}</div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>🎯 {l.tratamiento}</div>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>📍 {l.fuente} · {l.diasInactivo}d inactivo</div>
                  <div style={{ fontSize:10, color:C.primary+'cc', fontStyle:'italic', marginBottom:8 }}>{l.accion}</div>
                  <button onClick={()=>demoToast(`${l.nombre} → contactado (demo)`)} style={{ background:st.color+'18', border:'none', borderRadius:6, padding:'4px 10px', color:st.color, fontWeight:700, fontSize:10, cursor:'pointer', width:'100%' }}>Contactar</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MktEmail() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Email Campaigns</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {EMAIL_TEMPLATES.map(t => (
          <div key={t.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ fontWeight:700, color:C.text, fontSize:13, marginBottom:4 }}>{t.nombre}</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>📩 {t.asunto}</div>
            {t.resumen && <div style={{ fontSize:11, color:C.text, lineHeight:1.5, background:C.subtle, borderRadius:6, padding:'6px 8px', marginBottom:10 }}>{t.resumen}</div>}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>demoToast('Vista previa (demo)')} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer', color:C.muted }}>Preview</button>
              <button onClick={()=>demoToast(`Campaña "${t.nombre}" enviada (demo)`)} style={{ background:C.primary+'18', border:'none', borderRadius:6, padding:'4px 10px', color:C.primary, fontWeight:700, fontSize:11, cursor:'pointer' }}>Enviar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MktSocial() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Social Media</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {SOCIAL_POSTS.map(s => (
          <div key={s.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <Pill label={s.red} color={C.primary} sm />
              <Pill label={s.tipo||'Post'} color={C.accent} sm />
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>🎯 {s.tema}</div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.5, marginBottom:8 }}>{s.copy?.substring(0,100)}{s.copy?.length>100?'...':''}</div>
            <div style={{ fontSize:11, color:C.primary+'99' }}>{s.cta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MktSeo() {
  const d = SEO_DATA;
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>SEO Local</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        <Kpi label="Posición media" value={d.posicionMedia||'3.2'} color={C.success} icon="🔍" trend={{dir:'up',pct:'0.8p'}} />
        <Kpi label="Clics orgánicos" value={d.clicsOrganicos||'1.840'} color={C.primary} icon="👆" />
        <Kpi label="Impresiones" value={d.impresiones||'24.600'} color={C.accent} icon="👁️" />
        <Kpi label="CTR" value={`${d.ctr||7.5}%`} color={C.success} icon="📈" />
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 80px 120px', padding:'8px 16px', background:C.subtle, borderBottom:`1px solid ${C.border}`, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase' }}>
          {['Keyword','Volumen','Dificultad','Intención'].map(h=><div key={h}>{h}</div>)}
        </div>
        {(d.keywords_principales||[]).map((k,i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 90px 80px 120px', padding:'10px 16px', borderBottom:`1px solid ${C.border}`, alignItems:'center', fontSize:12 }}>
            <div style={{ color:C.text, fontWeight:600 }}>{k.keyword}</div>
            <div style={{ color:C.muted }}>{k.volumen}</div>
            <Pill label={k.dificultad} color={k.dificultad==='Alta'?C.danger:k.dificultad==='Media'?C.warning:C.success} sm />
            <Pill label={k['intención']||k.intencion} color={C.primary} sm />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PÁGINAS PATIENT ──────────────────────────────────────────────────────────
function PatientMisCitas() {
  const [showBook, setShowBook] = useState(false);
  const proxima = AGENDA_HOY[0];
  const citas = AGENDA_HOY.slice(0, 4);
  return (
    <div>
      {showBook && <AppointmentModal onClose={() => setShowBook(false)} />}
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 16px' }}>Mis Citas</h2>
      {/* Próxima cita — card prominente */}
      <div style={{ background:`linear-gradient(135deg,${C.primary},${C.primaryL})`, borderRadius:14, padding:20, marginBottom:20, color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:700, opacity:0.8, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Próxima cita</div>
        <div style={{ fontWeight:900, fontSize:22, marginBottom:4 }}>{proxima.hora} · {proxima.tratamiento}</div>
        <div style={{ fontSize:13, opacity:0.9, marginBottom:14 }}>{proxima.prof} · Hoy</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>demoToast('Recordatorio añadido (demo)')} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:8, padding:'7px 16px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>📅 Añadir</button>
          <button onClick={()=>demoToast('Cita cancelada (demo)')} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'7px 16px', color:'#fff', fontSize:12, cursor:'pointer' }}>Cancelar</button>
        </div>
      </div>
      {/* Invisalign progress */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>Tratamiento Invisalign en curso</div>
          <span style={{ fontWeight:800, color:C.primary, fontSize:18 }}>57%</span>
        </div>
        <Bar pct={57} color={C.primary} />
        <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>Alineador 8 de 14 · Próxima revisión: 22 sep</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {citas.slice(1).map(c => (
          <div key={c.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 16px', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ background:C.primary+'18', color:C.primary, borderRadius:8, padding:'6px 10px', fontWeight:800, fontSize:13, textAlign:'center', minWidth:54 }}>{c.hora}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{c.tratamiento}</div>
              <div style={{ fontSize:11, color:C.muted }}>{c.prof}</div>
            </div>
            <Pill label={c.estado} color={c.estado==='confirmada'?C.success:C.warning} sm />
          </div>
        ))}
      </div>
      <button onClick={() => setShowBook(true)} style={{ marginTop:20, background:C.primary, color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
        + Solicitar nueva cita
      </button>
    </div>
  );
}

function PatientHistorial() {
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Mi Historial Clínico</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {[
          { fecha:'12 ago 2026', trat:'Revisión + Limpieza', nota:'Sin caries. Se recomienda seguimiento en 6 meses.', doc:'Dra. Vidal' },
          { fecha:'3 jun 2026', trat:'Ortodoncia — control', nota:'Cambio a alineador #6. Evolución correcta.', doc:'Dra. Vidal' },
          { fecha:'15 ene 2026', trat:'Blanqueamiento', nota:'Tono inicial A3. Resultado B1 tras 3 sesiones.', doc:'Dr. Rueda' },
        ].map(({ fecha, trat, nota, doc }) => (
          <div key={fecha} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{trat}</div>
              <div style={{ fontSize:11, color:C.muted }}>{fecha}</div>
            </div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>{nota}</div>
            <div style={{ fontSize:11, color:C.primary, fontWeight:600 }}>{doc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientFacturas() {
  const mias = PRESUPUESTOS.slice(0,3);
  return (
    <div>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Mis Facturas</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {mias.map(p => (
          <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{p.tratamiento}</div>
              <div style={{ fontSize:11, color:C.muted }}>{p.fecha || '2026'}</div>
            </div>
            <div style={{ fontWeight:800, color:C.text, fontSize:15 }}>{p.importe}</div>
            <Pill label={p.estado==='aceptado'?'Pagada':'Pendiente'} color={p.estado==='aceptado'?C.success:C.warning} sm />
            <button onClick={()=>demoToast('PDF descargado (demo)')} style={{ background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer', color:C.muted }}>PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientMensajes() {
  const [texto, setTexto] = useState('');
  const msgs = [
    { de:'Dra. Vidal', texto:'Recuerda que el próximo alineador es el #9. Cualquier duda escríbeme.', hora:'10:32', yo:false },
    { de:'Lumen Dental', texto:'Tu cita del 22 sep está confirmada. Te esperamos a las 11:00h.', hora:'09:00', yo:false },
    { de:'Tú', texto:'Gracias, nos vemos el jueves.', hora:'Ayer', yo:true },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)' }}>
      <h2 style={{ color:C.text, fontWeight:800, fontSize:20, margin:'0 0 20px' }}>Mensajes</h2>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', flexDirection: m.yo ? 'row-reverse' : 'row', gap:10, alignItems:'flex-end' }}>
            <div style={{
              maxWidth:'70%', background: m.yo ? C.primary : C.card,
              border: m.yo ? 'none' : `1px solid ${C.border}`,
              color: m.yo ? '#fff' : C.text,
              borderRadius:12, padding:'10px 14px', fontSize:13, lineHeight:1.5,
            }}>
              {!m.yo && <div style={{ fontSize:10, fontWeight:700, color:C.primary, marginBottom:4 }}>{m.de}</div>}
              {m.texto}
              <div style={{ fontSize:10, color: m.yo ? 'rgba(255,255,255,0.6)' : C.muted, marginTop:4, textAlign:'right' }}>{m.hora}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <input value={texto} onChange={e=>setTexto(e.target.value)} placeholder="Escribe un mensaje..." style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, color:C.text }} />
        <button onClick={()=>{ demoToast('Mensaje enviado (demo)'); setTexto(''); }} style={{ background:C.primary, color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontWeight:700, cursor:'pointer' }}>Enviar</button>
      </div>
    </div>
  );
}

// ─── PAGE MAP (deny-by-default) ───────────────────────────────────────────────
const PAGE_MAP = {
  admin: {
    overview:         <AdminOverview />,
    agenda:           <AdminAgenda />,
    pacientes:        <AdminPacientes />,
    facturacion:      <AdminFacturacion />,
    marketing:        <AdminMarketing />,
    automatizaciones: <AdminAutomatizaciones />,
    agentes:          <AdminAgentes />,
    integraciones:    <AdminIntegraciones />,
  },
  staff: {
    agenda:    <StaffAgenda />,
    pacientes: <StaffPacientes />,
    checkin:   <StaffCheckin />,
    mensajes:  <StaffMensajes />,
  },
  dentist: {
    mi_agenda:    <DentistMiAgenda />,
    historial:    <DentistHistorial />,
    tratamientos: <DentistTratamientos />,
    presupuestos: <DentistPresupuestos />,
  },
  marketing: {
    kpis:   <MktKPIs />,
    leads:  <MktLeads />,
    email:  <MktEmail />,
    social: <MktSocial />,
    seo:    <MktSeo />,
  },
  patient: {
    mis_citas:   <PatientMisCitas />,
    historial_p: <PatientHistorial />,
    facturas:    <PatientFacturas />,
    mensajes_p:  <PatientMensajes />,
  },
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export function LumenDentalPremiumApp() {
  const hashRole = window.location.hash.replace('#', '');
  const initRole = ROLES[hashRole] ? hashRole : null;

  const [view, setView] = useState(initRole ? 'app' : 'landing');
  const [role, setRole] = useState(initRole);
  const [page, setPage] = useState(initRole ? ROLES[initRole].nav[0].id : null);

  useEffect(() => {
    if (role) window.location.hash = role;
    else window.location.hash = '';
  }, [role]);

  function handleLogin(roleId) {
    setRole(roleId);
    setPage(ROLES[roleId].nav[0].id);
    setView('app');
  }

  function handleLogout() {
    setRole(null);
    setPage(null);
    setView('landing');
  }

  const content = role ? (PAGE_MAP[role]?.[page] ?? (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:32, textAlign:'center', color:C.muted }}>
      <div style={{ fontSize:32, marginBottom:12 }}>🔒</div>
      <div style={{ fontWeight:700, color:C.text, marginBottom:8 }}>Acceso denegado</div>
      <div style={{ fontSize:13 }}>Esta sección no está disponible para tu rol.</div>
    </div>
  )) : null;

  return (
    <>
      {/* Toast */}
      <div id="ld-toast" style={{
        position:'fixed', bottom:24, right:24, zIndex:9999,
        background:C.sb, color:C.sbText,
        borderRadius:10, padding:'12px 20px', fontSize:13, fontWeight:600,
        boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
        opacity:0, transform:'translateY(8px)',
        transition:'opacity 0.3s, transform 0.3s', pointerEvents:'none',
      }} />

      {view === 'landing' && (
        <LandingPage onLogin={() => setView('login')} />
      )}
      {view === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      {view === 'app' && role && (
        <AppShell role={role} page={page} onPage={setPage} onLogout={handleLogout}>
          {content}
        </AppShell>
      )}
    </>
  );
}
