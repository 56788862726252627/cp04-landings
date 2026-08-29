/**
 * CORE · AppShell V1.5 · Premium SaaS Layout
 * Layout universal parametrizable por vertical. Sin dependencias externas.
 * Responsive: sidebar en desktop, bottom nav en móvil.
 */

import { useState } from 'react';

function hex2rgba(hex, a = 1) {
  const h = (hex || '#0c7873').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function AppShell({ tabs, activeTab, onTabChange, branding = {}, children }) {
  const [, setMobileOpen] = useState(false);
  const color  = branding.color || branding.primaryColor || '#0c7873';
  const nombre = branding.nombre || branding.nombre_visible || 'Demo';
  const inicial = branding.inicial || nombre.charAt(0).toUpperCase();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif", background: '#f8fafc',
    }}>
      {/* Demo banner */}
      <div style={{
        background: '#7c3aed', color: '#fff', textAlign: 'center',
        padding: '6px 16px', fontSize: '11px', fontWeight: 700,
        letterSpacing: '0.08em', zIndex: 200, flexShrink: 0,
      }}>
        ⚠️ PROTOTIPO INTERNO · DATOS 100% FICTICIOS · NO CONECTADO A SISTEMAS REALES
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar desktop */}
        <aside style={{
          width: 220, background: '#fff', borderRight: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{
            padding: '20px 16px 16px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0,
              boxShadow: `0 2px 8px ${hex2rgba(color, 0.35)}`,
            }}>{inicial}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontWeight: 700, fontSize: 13, color: '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{nombre}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Fábrica SaaS</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => { onTabChange(tab.id); setMobileOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none',
                  background: active ? hex2rgba(color, 0.10) : 'transparent',
                  color: active ? color : '#64748b',
                  fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer',
                  textAlign: 'left', marginBottom: 2,
                  boxSizing: 'border-box',
                }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{tab.icon}</span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.label}</span>
                  {active && (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#94a3b8' }}>
            <span style={{
              display: 'inline-block', background: '#f1f5f9', color: '#7c3aed',
              padding: '3px 8px', borderRadius: 20, fontWeight: 700,
              fontSize: 10, letterSpacing: '0.05em',
            }}>DEMO V1.5</span>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <header style={{
            background: '#fff', borderBottom: '1px solid #e2e8f0',
            padding: '12px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                {tabs.find(t => t.id === activeTab)?.label || 'Inicio'}
              </span>
            </div>
            <span style={{
              fontSize: 11, background: '#fef3c7', color: '#92400e',
              padding: '3px 10px', borderRadius: 20, fontWeight: 700,
            }}>
              DEMO · DATOS FICTICIOS
            </span>
          </header>

          <main style={{
            flex: 1, overflowY: 'auto', padding: '28px 28px',
            background: '#f8fafc',
          }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Componentes UI ───────────────────────────────────────────────────────────

export function Card({ title, subtitle, children, style, padding, action }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
      padding: padding ?? '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
      ...style,
    }}>
      {(title || subtitle || action) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

const BADGE_MAP = {
  blue:   ['#dbeafe', '#1d4ed8'],
  green:  ['#dcfce7', '#15803d'],
  yellow: ['#fef3c7', '#92400e'],
  red:    ['#fee2e2', '#991b1b'],
  gray:   ['#f3f4f6', '#374151'],
  purple: ['#ede9fe', '#6d28d9'],
  teal:   ['#ccfbf1', '#0f766e'],
  orange: ['#ffedd5', '#9a3412'],
  indigo: ['#e0e7ff', '#4338ca'],
};

export function Badge({ children, color = 'blue', size = 'md' }) {
  const [bg, text] = BADGE_MAP[color] || BADGE_MAP.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: size === 'sm' ? '2px 6px' : '3px 10px',
      borderRadius: 20, fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
      background: bg, color: text, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export function FicticioLabel() {
  return (
    <span style={{
      fontSize: 10, background: '#f1f5f9', color: '#94a3b8',
      padding: '1px 5px', borderRadius: 3, fontWeight: 600,
      letterSpacing: '0.03em', verticalAlign: 'middle', marginLeft: 4,
    }}>FICTICIO</span>
  );
}

function _hex2rgbaLocal(hex, a) { return hex2rgba(hex, a); }

export function StatCard({ label, value, icon, color = '#0c7873', sub, trend, trendUp }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
      padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{
          width: 32, height: 32, borderRadius: 8, background: _hex2rgbaLocal(color, 0.10),
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
        }}>{icon}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
      {(sub || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {trend && (
            <span style={{ fontSize: 12, color: trendUp ? '#059669' : '#dc2626', fontWeight: 600 }}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
          {sub && <span style={{ fontSize: 12, color: '#94a3b8' }}>{sub} <FicticioLabel /></span>}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ children, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{children}</h2>
        {sub && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Divider({ label }) {
  if (label) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  );
  return <div style={{ height: 1, background: '#e2e8f0', margin: '20px 0' }} />;
}

export function HeroSection({ title, subtitle, cta, ctaSecondary, color = '#0c7873', badge }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color} 0%, ${hex2rgba(color, 0.82)} 100%)`,
      borderRadius: 16, padding: '40px 36px', color: '#fff', position: 'relative',
      overflow: 'hidden', marginBottom: 24,
      boxShadow: `0 8px 24px ${hex2rgba(color, 0.28)}`,
    }}>
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -50, right: 60, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />
      {badge && (
        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.18)',
          borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: 12,
        }}>{badge}</div>
      )}
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.2, maxWidth: 480 }}>{title}</h1>
      {subtitle && (
        <p style={{ margin: '10px 0 0', fontSize: 14, opacity: 0.85, maxWidth: 440, lineHeight: 1.6 }}>{subtitle}</p>
      )}
      {(cta || ctaSecondary) && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {cta && (
            <button style={{
              background: '#fff', color, border: 'none', padding: '10px 20px',
              borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>{cta}</button>
          )}
          {ctaSecondary && (
            <button style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.30)', padding: '10px 20px',
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>{ctaSecondary}</button>
          )}
        </div>
      )}
    </div>
  );
}

export function MetricGrid({ children, cols = 4 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: 16, marginBottom: 24,
    }}>{children}</div>
  );
}

export function Table({ headers, rows, emptyMsg = 'Sin datos' }) {
  if (!rows || rows.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 14 }}>
      {emptyMsg}
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left', padding: '10px 12px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                fontSize: 11, fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '11px 12px', border: '1px solid #e2e8f0',
                  color: '#0f172a', verticalAlign: 'middle',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, sub, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      {title && <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</div>}
      {sub && <div style={{ fontSize: 13, color: '#64748b', maxWidth: 320 }}>{sub}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function Loader({ label = 'Cargando...' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '40px', color: '#64748b', fontSize: 13,
    }}>
      <div style={{
        width: 20, height: 20, border: '2px solid #e2e8f0',
        borderTopColor: '#0c7873', borderRadius: '50%',
      }} />
      {label}
    </div>
  );
}

export function PillTabs({ tabs, active, onChange, color = '#0c7873' }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none',
            background: isActive ? color : '#f1f5f9',
            color: isActive ? '#fff' : '#64748b',
            fontSize: 13, fontWeight: isActive ? 700 : 500,
            cursor: 'pointer',
          }}>{t.icon ? `${t.icon} ${t.label}` : t.label}</button>
        );
      })}
    </div>
  );
}

export function TimelineItem({ date, title, sub, icon, color = '#0c7873', last }) {
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: hex2rgba(color, 0.12),
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
        }}>{icon}</div>
        {!last && <div style={{ width: 1, flex: 1, background: '#e2e8f0', marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{sub}</div>}
        {date && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{date}</div>}
      </div>
    </div>
  );
}
