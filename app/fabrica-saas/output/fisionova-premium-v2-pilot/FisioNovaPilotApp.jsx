/**
 * FisioNova Premium V2 Pilot — App Shell
 * Logo fix, mobile sidebar, BookingModal, role-aware nav, keyboard a11y
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState, useEffect, useCallback } from 'react';
import { BRANDING_V2, SERVICIOS_V2 } from './FisioNovaPilotMockData.js';
import { FisioNovaPilotDashboard } from './FisioNovaPilotDashboard.jsx';
import { FisioNovaPilotAgenda } from './FisioNovaPilotAgenda.jsx';
import { FisioNovaPilotPacientes } from './FisioNovaPilotPacientes.jsx';
import { FisioNovaPilotEvolucion } from './FisioNovaPilotEvolucion.jsx';
import { FisioNovaPilotEjercicios } from './FisioNovaPilotEjercicios.jsx';
import { FisioNovaPilotLanding } from './FisioNovaPilotLanding.jsx';

const P = BRANDING_V2.primaryColor;
const A = BRANDING_V2.accentColor;
const S = BRANDING_V2.surfaceColor;

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',   icon: '📊', roles: ['fisio', 'admin'] },
  { id: 'agenda',     label: 'Agenda',       icon: '📅', roles: ['fisio', 'admin', 'recepcion'] },
  { id: 'pacientes',  label: 'Pacientes',    icon: '👥', roles: ['fisio', 'admin'] },
  { id: 'evolucion',  label: 'Evolución',    icon: '📈', roles: ['fisio', 'admin'] },
  { id: 'ejercicios', label: 'Ejercicios',   icon: '🏋️', roles: ['fisio', 'admin', 'paciente'] },
  { id: 'landing',    label: 'Landing V2',   icon: '🌐', roles: ['fisio', 'admin', 'recepcion', 'paciente'] },
];

const ROLES = [
  { id: 'admin',     label: 'Admin',          icon: '👑', color: '#7c3aed' },
  { id: 'fisio',     label: 'Fisioterapeuta', icon: '🩺', color: P },
  { id: 'recepcion', label: 'Recepción',      icon: '📋', color: '#0ea5e9' },
  { id: 'paciente',  label: 'Paciente',       icon: '🧑', color: A },
];

const BOOKING_DATES = ['Lun 1 Sep', 'Mar 2 Sep', 'Mié 3 Sep', 'Jue 4 Sep', 'Vie 5 Sep'];
const BOOKING_TIMES = ['09:00', '09:30', '10:00', '11:00', '11:30', '12:00', '16:00', '17:00', '17:30', '18:00'];

/* ── Booking Modal (4-step) ────────────────────────────────────────────── */
function BookingModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState({ service: null, date: null, time: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep(4); }, 1200);
  };

  const canNext1 = !!sel.service;
  const canNext2 = !!sel.date && !!sel.time;

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(12,27,51,.5)', backdropFilter: 'blur(4px)', zIndex: 200, animation: 'overlayIn .2s ease both' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog" aria-modal="true" aria-label="Solicitar cita"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'min(540px, calc(100vw - 32px))', zIndex: 201,
          background: '#fff', borderRadius: 20, overflow: 'hidden',
          animation: 'modalIn .32s cubic-bezier(.22,1,.36,1) both',
          boxShadow: '0 24px 72px rgba(0,0,0,.2)',
          maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${P}, #0284c7)`, padding: '24px 24px 20px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, opacity: .75, letterSpacing: .5, marginBottom: 4 }}>
                {step === 4 ? 'RESERVA COMPLETADA' : `PASO ${step} DE 3`}
              </div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {step === 1 && 'Selecciona el servicio'}
                {step === 2 && 'Elige fecha y horario'}
                {step === 3 && 'Confirmar solicitud'}
                {step === 4 && '¡Solicitud enviada!'}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              aria-label="Cerrar"
            >✕</button>
          </div>
          {/* Step dots */}
          {step < 4 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  height: 4, flex: 1, borderRadius: 100,
                  background: step >= s ? '#fff' : 'rgba(255,255,255,.3)',
                  transition: 'background .3s',
                }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 24 }}>

          {/* Step 1: Service */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Selecciona el tipo de tratamiento</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {SERVICIOS_V2.map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => setSel(s => ({ ...s, service: srv.id }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 12, cursor: 'pointer', width: '100%', textAlign: 'left',
                      border: `1.5px solid ${sel.service === srv.id ? P : '#e2e8f0'}`,
                      background: sel.service === srv.id ? `${P}08` : '#fff',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{srv.icono}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33' }}>{srv.nombre}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{srv.duracion} · {srv.precio}</div>
                    </div>
                    {sel.service === srv.id && (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0 }}>✓</div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (canNext1) setStep(2); }}
                disabled={!canNext1}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  background: canNext1 ? `linear-gradient(135deg, ${P}, #0284c7)` : '#e2e8f0',
                  color: canNext1 ? '#fff' : '#94a3b8',
                  fontSize: 15, fontWeight: 700, cursor: canNext1 ? 'pointer' : 'default',
                  transition: 'background .2s, color .2s',
                  boxShadow: canNext1 ? `0 4px 16px ${P}44` : 'none',
                }}
              >Continuar →</button>
            </div>
          )}

          {/* Step 2: Date + Time */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>FECHA</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {BOOKING_DATES.map(d => (
                    <button
                      key={d}
                      onClick={() => setSel(s => ({ ...s, date: d }))}
                      style={{
                        padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${sel.date === d ? P : '#e2e8f0'}`,
                        background: sel.date === d ? `linear-gradient(135deg, ${P}, #0284c7)` : '#fff',
                        color: sel.date === d ? '#fff' : '#475569',
                        transition: 'all .15s',
                        boxShadow: sel.date === d ? `0 3px 10px ${P}44` : 'none',
                      }}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>HORARIO</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {BOOKING_TIMES.map(t => (
                    <button
                      key={t}
                      onClick={() => setSel(s => ({ ...s, time: t }))}
                      style={{
                        padding: '8px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'center',
                        border: `1.5px solid ${sel.time === t ? P : '#e2e8f0'}`,
                        background: sel.time === t ? `${P}12` : '#fff',
                        color: sel.time === t ? P : '#64748b',
                        transition: 'all .15s',
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >← Atrás</button>
                <button
                  onClick={() => { if (canNext2) setStep(3); }}
                  disabled={!canNext2}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                    background: canNext2 ? `linear-gradient(135deg, ${P}, #0284c7)` : '#e2e8f0',
                    color: canNext2 ? '#fff' : '#94a3b8',
                    fontSize: 14, fontWeight: 700, cursor: canNext2 ? 'pointer' : 'default',
                    transition: 'background .2s',
                    boxShadow: canNext2 ? `0 4px 16px ${P}44` : 'none',
                  }}
                >Continuar →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <div style={{ background: S, borderRadius: 14, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Servicio', value: SERVICIOS_V2.find(s => s.id === sel.service)?.nombre || '—', icon: '🩺' },
                  { label: 'Fecha', value: sel.date || '—', icon: '📅' },
                  { label: 'Hora', value: sel.time || '—', icon: '🕐' },
                  { label: 'Nombre', value: 'Demo Paciente · Datos ficticios', icon: '👤' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0c1b33' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 11, color: '#92400e' }}>
                ⚠ Demo: Esta solicitud no genera cita real. Sin datos clínicos ni personales.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >← Atrás</button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                    background: submitting ? '#e2e8f0' : `linear-gradient(135deg, ${A}, #059669)`,
                    color: submitting ? '#94a3b8' : '#fff',
                    fontSize: 14, fontWeight: 700, cursor: submitting ? 'default' : 'pointer',
                    boxShadow: submitting ? 'none' : `0 4px 16px ${A}44`,
                    transition: 'background .2s',
                  }}
                >{submitting ? 'Procesando...' : '✓ Confirmar solicitud'}</button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `linear-gradient(135deg, ${A}, #059669)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 32,
                boxShadow: `0 8px 24px ${A}44`,
                animation: 'successPop .5s cubic-bezier(.22,1,.36,1)',
              }}>✓</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#0c1b33', marginBottom: 8 }}>Solicitud preparada</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 6 }}>
                {SERVICIOS_V2.find(s => s.id === sel.service)?.nombre} · {sel.date} · {sel.time}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>Demo Pilot · Sin datos reales · Confirmación simulada</div>
              <button
                onClick={onClose}
                style={{
                  background: `linear-gradient(135deg, ${P}, #0284c7)`, color: '#fff',
                  border: 'none', borderRadius: 12, padding: '13px 32px',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: `0 4px 16px ${P}44`,
                }}
              >Cerrar</button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalIn { from { opacity: 0; transform: translate(-50%,-52%) scale(.96); } to { opacity: 1; transform: translate(-50%,-50%); } }
          @keyframes successPop { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    </>
  );
}

/* ── NavItem ──────────────────────────────────────────────────────────── */
function NavItem({ item, active, onClick, collapsed }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(item.id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '12px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10, border: 'none', cursor: 'pointer',
        background: active ? `linear-gradient(135deg, ${P}22, ${P}12)` : hover ? `${P}08` : 'transparent',
        color: active ? P : hover ? '#475569' : '#94a3b8',
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        transition: 'background .15s, color .15s',
        position: 'relative',
      }}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
    >
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 3, background: P, borderRadius: '0 3px 3px 0',
        }} />
      )}
      <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
    </button>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────── */
function Sidebar({ activeView, onNav, collapsed, onToggleCollapse, role, isMobile, onClose }) {
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  const roleInfo = ROLES.find(r => r.id === role);

  return (
    <aside
      style={{
        width: collapsed && !isMobile ? 56 : 220,
        flexShrink: 0,
        background: '#fff',
        borderRight: `1px solid ${P}18`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .25s cubic-bezier(.22,1,.36,1)',
        overflow: 'hidden',
        ...(isMobile ? {
          position: 'fixed', left: 0, top: 0, bottom: 0,
          zIndex: 150, width: 260,
          boxShadow: '4px 0 24px rgba(0,0,0,.15)',
        } : {}),
      }}
    >
      {/* Logo — FIXED: no overlap */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: (collapsed && !isMobile) ? 'center' : 'space-between',
        padding: (collapsed && !isMobile) ? 0 : '0 12px 0 16px',
        borderBottom: `1px solid ${P}12`,
        flexShrink: 0,
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          {/* FN icon — always visible */}
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${P}, #0284c7)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 13,
          }}>FN</div>
          {/* Brand name — hidden when collapsed */}
          {(!collapsed || isMobile) && (
            <span style={{
              fontWeight: 800, fontSize: 14, color: '#0c1b33',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0, flex: 1,
            }}>FisioNova</span>
          )}
        </div>
        {/* Collapse / close button */}
        <button
          onClick={isMobile ? onClose : onToggleCollapse}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: '4px 6px', fontSize: 16, flexShrink: 0,
            borderRadius: 6, transition: 'color .15s, background .15s',
            lineHeight: 1,
          }}
          aria-label={isMobile ? 'Cerrar menú' : collapsed ? 'Expandir menú' : 'Colapsar menú'}
          onMouseEnter={e => { e.currentTarget.style.color = P; e.currentTarget.style.background = `${P}10`; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
        >{isMobile ? '✕' : collapsed ? '→' : '←'}</button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }} aria-label="Navegación principal">
        {(!collapsed || isMobile) && (
          <div style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 700, letterSpacing: 1, marginBottom: 8, padding: '0 6px' }}>
            NAVEGACIÓN
          </div>
        )}
        {visibleItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={activeView === item.id}
            onClick={(id) => { onNav(id); if (isMobile) onClose(); }}
            collapsed={collapsed && !isMobile}
          />
        ))}
      </nav>

      {/* User badge */}
      {(!collapsed || isMobile) && (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${P}12` }}>
          <div style={{
            background: S, borderRadius: 10, padding: '10px 12px',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `${roleInfo?.color || P}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>{roleInfo?.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0c1b33', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {roleInfo?.label}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>V2 Pilot · Demo</div>
            </div>
          </div>
        </div>
      )}

      {/* Expand when collapsed desktop */}
      {collapsed && !isMobile && (
        <button
          onClick={onToggleCollapse}
          style={{
            margin: '8px auto', width: 36, height: 36,
            background: `${P}12`, border: 'none', borderRadius: 10,
            cursor: 'pointer', color: P, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Expandir sidebar"
        >→</button>
      )}
    </aside>
  );
}

/* ── Page transition wrapper ─────────────────────────────────────────── */
function PageView({ viewId, prevViewId, onOpenBooking, onNavigate }) {
  const entering = viewId !== prevViewId;
  const comps = {
    dashboard:  <FisioNovaPilotDashboard onOpenBooking={onOpenBooking} onNavigate={onNavigate} />,
    agenda:     <FisioNovaPilotAgenda onOpenBooking={onOpenBooking} />,
    pacientes:  <FisioNovaPilotPacientes />,
    evolucion:  <FisioNovaPilotEvolucion />,
    ejercicios: <FisioNovaPilotEjercicios />,
    landing:    <FisioNovaPilotLanding onOpenBooking={onOpenBooking} onNavigate={onNavigate} />,
  };
  return (
    <div style={{
      flex: 1, overflow: 'auto',
      animation: entering ? 'pageIn .3s cubic-bezier(.22,1,.36,1)' : 'none',
    }}>
      {comps[viewId] || (
        <div style={{ padding: 40, color: '#94a3b8', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Vista no disponible para este rol</div>
        </div>
      )}
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export function FisioNovaPilotApp() {
  const [role, setRole] = useState('fisio');
  const [activeView, setActiveView] = useState('dashboard');
  const [prevView, setPrevView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close mobile sidebar on escape
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setMobileSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileSidebarOpen]);

  const handleNav = useCallback((viewId) => {
    setPrevView(activeView);
    setActiveView(viewId);
  }, [activeView]);

  const handleRoleChange = useCallback((newRole) => {
    setRole(newRole);
    const firstAllowed = NAV_ITEMS.find(item => item.roles.includes(newRole));
    if (firstAllowed) {
      setPrevView(activeView);
      setActiveView(firstAllowed.id);
    }
  }, [activeView]);

  const handleOpenBooking = useCallback(() => setBookingOpen(true), []);
  const handleCloseBooking = useCallback(() => setBookingOpen(false), []);
  const handleNavigate = useCallback((viewId) => handleNav(viewId), [handleNav]);

  const roleInfo = ROLES.find(r => r.id === role);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", background: '#f8faff', overflow: 'hidden' }}>

      {/* Mobile overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(12,27,51,.45)', zIndex: 149, backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      {(!isMobile || mobileSidebarOpen) && (
        <Sidebar
          activeView={activeView}
          onNav={handleNav}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          role={role}
          isMobile={isMobile}
          onClose={() => setMobileSidebarOpen(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: '#fff', borderBottom: `1px solid ${P}12`,
          flexShrink: 0, gap: 8,
        }}>
          {/* Left: hamburger (mobile) or role switcher (desktop) */}
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <button
                onClick={() => setMobileSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 22, padding: '4px 6px', borderRadius: 8, flexShrink: 0, lineHeight: 1 }}
                aria-label="Abrir menú"
                aria-expanded={mobileSidebarOpen}
              >☰</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  background: `linear-gradient(135deg, ${P}, #0284c7)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 10,
                }}>FN</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>FisioNova</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto' }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    background: role === r.id ? `linear-gradient(135deg, ${r.color}, ${r.color}cc)` : '#f8faff',
                    color: role === r.id ? '#fff' : '#64748b',
                    border: `1px solid ${role === r.id ? 'transparent' : '#e2e8f0'}`,
                    borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center',
                    transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
                    boxShadow: role === r.id ? `0 2px 8px ${r.color}44` : 'none',
                  }}
                >
                  <span>{r.icon}</span> {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Right: mobile role selector + demo badge */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {isMobile && (
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value)}
                style={{
                  border: `1px solid ${P}44`, borderRadius: 8, padding: '5px 8px',
                  fontSize: 11, fontWeight: 600, color: P, background: `${P}08`,
                  cursor: 'pointer', outline: 'none',
                }}
                aria-label="Cambiar rol"
              >
                {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
              </select>
            )}
            <div style={{
              background: '#fef3c7', color: '#92400e',
              fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
              border: '1px solid #fde68a', whiteSpace: 'nowrap',
            }}>
              Demo V2 · Ficticios
            </div>
          </div>
        </header>

        {/* Content */}
        <PageView
          viewId={activeView}
          prevViewId={prevView}
          onOpenBooking={handleOpenBooking}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Booking modal */}
      {bookingOpen && <BookingModal onClose={handleCloseBooking} />}

      <style>{`
        @keyframes pageIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${P}44; border-radius: 3px; }
        button:focus-visible { outline: 2px solid ${P}; outline-offset: 2px; }
        input:focus-visible { outline: 2px solid ${P}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
