/**
 * FisioNova Premium V2 Pilot — App Shell
 * Sidebar V2, navigation transitions, role switcher
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState } from 'react';
import { BRANDING_V2 } from './FisioNovaPilotMockData.js';
import { FisioNovaPilotDashboard } from './FisioNovaPilotDashboard.jsx';
import { FisioNovaPilotAgenda } from './FisioNovaPilotAgenda.jsx';
import { FisioNovaPilotPacientes } from './FisioNovaPilotPacientes.jsx';
import { FisioNovaPilotEvolucion } from './FisioNovaPilotEvolucion.jsx';
import { FisioNovaPilotEjercicios } from './FisioNovaPilotEjercicios.jsx';
import { FisioNovaPilotLanding } from './FisioNovaPilotLanding.jsx';

const P = BRANDING_V2.primaryColor;
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
  { id: 'admin',      label: 'Admin',      icon: '👑' },
  { id: 'fisio',      label: 'Fisioterapeuta', icon: '🩺' },
  { id: 'recepcion',  label: 'Recepción',  icon: '📋' },
  { id: 'paciente',   label: 'Paciente',   icon: '🧑' },
];

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
        background: active
          ? `linear-gradient(135deg, ${P}22, ${P}12)`
          : hover ? `${P}08` : 'transparent',
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
          transition: 'opacity .2s',
        }} />
      )}
      <span style={{ fontSize: 17 }}>{item.icon}</span>
      {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
    </button>
  );
}

function Sidebar({ activeView, onNav, collapsed, onToggleCollapse, role }) {
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside style={{
      width: collapsed ? 56 : 220, flexShrink: 0,
      background: '#fff', borderRight: `1px solid ${P}18`,
      display: 'flex', flexDirection: 'column',
      transition: 'width .25s cubic-bezier(.22,1,.36,1)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? 0 : '0 16px',
        borderBottom: `1px solid ${P}12`, flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${P}, #0284c7)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 13,
            }}>FN</div>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#0c1b33' }}>FisioNova</span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${P}, #0284c7)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 13,
          }}>FN</div>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, fontSize: 16 }}
            aria-label="Colapsar sidebar"
          >←</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflow: 'auto' }}>
        {!collapsed && (
          <div style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 700, letterSpacing: 1, marginBottom: 8, padding: '0 6px' }}>
            NAVEGACIÓN
          </div>
        )}
        {visibleItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={activeView === item.id}
            onClick={onNav}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User badge */}
      {!collapsed && (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${P}12` }}>
          <div style={{
            background: S, borderRadius: 10, padding: '10px 12px',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: `${P}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>{ROLES.find(r => r.id === role)?.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0c1b33' }}>
                {ROLES.find(r => r.id === role)?.label}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>V2 Pilot · Demo</div>
            </div>
          </div>
        </div>
      )}

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          style={{
            margin: '8px auto', width: 36, height: 36,
            background: `${P}12`, border: 'none', borderRadius: 10,
            cursor: 'pointer', color: P, fontSize: 16,
          }}
          aria-label="Expandir sidebar"
        >→</button>
      )}
    </aside>
  );
}

/* ── Page transition wrapper ─────────────────────────────────────────── */
function PageView({ viewId, prevViewId }) {
  const entering = viewId !== prevViewId;
  const comps = {
    dashboard:  <FisioNovaPilotDashboard />,
    agenda:     <FisioNovaPilotAgenda />,
    pacientes:  <FisioNovaPilotPacientes />,
    evolucion:  <FisioNovaPilotEvolucion />,
    ejercicios: <FisioNovaPilotEjercicios />,
    landing:    <FisioNovaPilotLanding />,
  };
  return (
    <div style={{
      flex: 1, overflow: 'auto',
      animation: entering ? 'pageIn .3s cubic-bezier(.22,1,.36,1)' : 'none',
    }}>
      {comps[viewId] || <div style={{ padding: 40, color: '#94a3b8' }}>Vista no disponible en esta demo</div>}
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export function FisioNovaPilotApp() {
  const [role, setRole] = useState('fisio');
  const [activeView, setActiveView] = useState('dashboard');
  const [prevView, setPrevView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (viewId) => {
    setPrevView(activeView);
    setActiveView(viewId);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const firstAllowed = NAV_ITEMS.find(item => item.roles.includes(newRole));
    if (firstAllowed) handleNav(firstAllowed.id);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", background: '#f8faff' }}>
      <Sidebar
        activeView={activeView}
        onNav={handleNav}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        role={role}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', background: '#fff', borderBottom: `1px solid ${P}12`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                style={{
                  background: role === r.id ? `linear-gradient(135deg, ${P}, #0284c7)` : '#f8faff',
                  color: role === r.id ? '#fff' : '#64748b',
                  border: `1px solid ${role === r.id ? 'transparent' : '#e2e8f0'}`,
                  borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center',
                  transition: 'all .15s',
                }}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <div style={{
            background: '#fef3c7', color: '#92400e',
            fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
            border: '1px solid #fde68a',
          }}>
            Demo V2 Pilot · Datos ficticios
          </div>
        </header>

        {/* Content */}
        <PageView viewId={activeView} prevViewId={prevView} />
      </div>

      <style>{`
        @keyframes pageIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
