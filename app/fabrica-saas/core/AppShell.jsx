/**
 * CORE · AppShell
 * Layout reutilizable para todos los prototipos de la Fábrica SaaS.
 * Incluye: banner de demo obligatorio, cabecera de marca, navegación, área de contenido.
 */

const S = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: '#f8fafc',
  },
  banner: {
    background: '#b91c1c',
    color: '#fff',
    textAlign: 'center',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: {
    width: 34,
    height: 34,
    background: '#2563eb',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
  },
  appName: { fontWeight: 700, fontSize: 15, color: '#111827' },
  appSub: { fontSize: 11, color: '#9ca3af' },
  demoBadge: {
    fontSize: 11,
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '3px 10px',
    borderRadius: 20,
    fontWeight: 700,
  },
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    overflowX: 'auto',
  },
  main: { flex: 1, overflowY: 'auto', padding: '24px 20px', maxWidth: 1100, width: '100%', margin: '0 auto', boxSizing: 'border-box' },
};

function navBtnStyle(active) {
  return {
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 700 : 400,
    color: active ? '#2563eb' : '#4b5563',
    borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s, border-color 0.15s',
  };
}

export function AppShell({ tabs, activeTab, onTabChange, branding, children }) {
  return (
    <div style={S.shell}>
      <div style={S.banner}>
        ⚠️ DEMO INTERNA · DATOS FICTICIOS · NO ENVIAR · NO CONECTADO A SISTEMAS REALES
      </div>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoBox}>{branding?.inicial || 'D'}</div>
          <div>
            <div style={S.appName}>{branding?.nombre || 'Demo'}</div>
            <div style={S.appSub}>Prototipo Interno · Fábrica SaaS</div>
          </div>
        </div>
        <span style={S.demoBadge}>DEMO</span>
      </header>
      <nav style={S.nav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={navBtnStyle(activeTab === tab.id)}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
      <main style={S.main}>{children}</main>
    </div>
  );
}

export function Card({ title, subtitle, children, style, padding }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      padding: padding ?? '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 16 }}>
          {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>}
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

const BADGE_COLORS = {
  blue:   { bg: '#dbeafe', text: '#1d4ed8' },
  green:  { bg: '#dcfce7', text: '#15803d' },
  yellow: { bg: '#fef3c7', text: '#92400e' },
  red:    { bg: '#fee2e2', text: '#991b1b' },
  gray:   { bg: '#f3f4f6', text: '#374151' },
  purple: { bg: '#ede9fe', text: '#6d28d9' },
  indigo: { bg: '#e0e7ff', text: '#4338ca' },
};

export function Badge({ children, color = 'blue' }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.blue;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
    }}>
      {children}
    </span>
  );
}

export function FicticioLabel() {
  return (
    <span style={{
      fontSize: 10,
      background: '#f3f4f6',
      color: '#9ca3af',
      padding: '1px 5px',
      borderRadius: 3,
      fontWeight: 600,
      letterSpacing: '0.03em',
      verticalAlign: 'middle',
      marginLeft: 4,
    }}>
      FICTICIO
    </span>
  );
}

export function StatCard({ label, value, icon, color = '#2563eb', sub }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{sub} <FicticioLabel /></div>}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>{children}</h2>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: '#e5e7eb', margin: '20px 0' }} />;
}

