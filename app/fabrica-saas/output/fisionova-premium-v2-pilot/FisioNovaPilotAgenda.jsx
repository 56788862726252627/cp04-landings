/**
 * FisioNova Premium V2 Pilot — Agenda Premium
 * Transitions, drawer, loading states, interaction tokens
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState, useEffect } from 'react';
import { AGENDA_MOCK, BRANDING_V2 } from './FisioNovaPilotMockData.js';

const P = BRANDING_V2.primaryColor;
const A = BRANDING_V2.accentColor;
const S = BRANDING_V2.surfaceColor;

const DAYS  = ['Lun 26','Mar 27','Mié 28','Jue 29','Vie 30','Sáb 31'];
const ESTADO_COLORS = {
  confirmada: { bg: `${A}18`, text: '#059669', dot: A },
  pendiente:  { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  cancelada:  { bg: '#fee2e2', text: '#dc2626', dot: '#f87171' },
};

function Skeleton({ w = '100%', h = 16, radius = 6, style }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, #e8eef4 25%, #f3f7fb 50%, #e8eef4 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style,
    }} />
  );
}

/* ── Cita card en lista ───────────────────────────────────────────────── */
function CitaCard({ cita, onClick, index }) {
  const [hover, setHover] = useState(false);
  const col = ESTADO_COLORS[cita.estado] || ESTADO_COLORS.pendiente;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(cita)}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick(cita); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
        borderRadius: 12, cursor: 'pointer',
        background: hover ? `${P}08` : '#fff',
        border: `1.5px solid ${hover ? P + '44' : '#e9eef5'}`,
        transform: hover ? 'translateX(3px)' : 'none',
        transition: 'background .15s, border-color .15s, transform .18s cubic-bezier(.22,1,.36,1)',
        animation: `citaSlide .3s ${index * .06}s both`,
      }}
      aria-label={`Cita ${cita.paciente} a las ${cita.hora}`}
    >
      {/* Time block */}
      <div style={{
        width: 52, height: 52, borderRadius: 10, flexShrink: 0,
        background: `${P}12`, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: P, lineHeight: 1 }}>{cita.hora}</span>
        <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{cita.duracion}min</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cita.paciente}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cita.tratamiento}
        </div>
      </div>

      {/* Sala badge */}
      <div style={{
        background: `${P}12`, color: P, fontSize: 10, fontWeight: 700,
        borderRadius: 6, padding: '3px 8px',
      }}>Sala {cita.sala}</div>

      {/* Estado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: col.bg, borderRadius: 20, padding: '3px 10px' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: col.dot }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: col.text }}>{cita.estado}</span>
      </div>
    </div>
  );
}

/* ── Drawer detalle cita ──────────────────────────────────────────────── */
function CitaDrawer({ cita, onClose }) {
  if (!cita) return null;
  const col = ESTADO_COLORS[cita.estado] || ESTADO_COLORS.pendiente;
  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(12,27,51,.4)',
          backdropFilter: 'blur(3px)', zIndex: 100,
          animation: 'overlayIn .2s ease both',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog" aria-modal="true" aria-label="Detalle de cita"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 360, zIndex: 101,
          background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,.12)',
          animation: 'drawerIn .3s cubic-bezier(.22,1,.36,1) both',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${P}, #0284c7)`,
          padding: '24px 20px', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, opacity: .7, marginBottom: 4, letterSpacing: .5 }}>CITA</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{cita.paciente}</div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16 }}
              aria-label="Cerrar"
            >✕</button>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: col.bg, borderRadius: 20, padding: '4px 12px', marginTop: 12,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.dot }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: col.text, textTransform: 'capitalize' }}>{cita.estado}</span>
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Hora', value: cita.hora, icon: '🕐' },
            { label: 'Duración', value: `${cita.duracion} minutos`, icon: '⏱' },
            { label: 'Tratamiento', value: cita.tratamiento, icon: '🩺' },
            { label: 'Sala', value: `Sala ${cita.sala}`, icon: '🏥' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: S, borderRadius: 10,
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c1b33' }}>{value}</div>
              </div>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button style={{
              background: `${A}15`, color: '#059669', border: `1.5px solid ${A}44`,
              borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'background .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${A}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${A}15`; }}
            >✓ Confirmar</button>
            <button style={{
              background: '#fee2e210', color: '#dc2626', border: '1.5px solid #fca5a5',
              borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'background .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e230'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fee2e210'; }}
            >✕ Cancelar</button>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>Demo: acciones simuladas · Sin datos reales</div>
        </div>
      </div>
      <style>{`
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawerIn { from { transform: translateX(100%); } to { transform: none; } }
      `}</style>
    </>
  );
}

/* ── Loading state agenda ─────────────────────────────────────────────── */
function AgendaSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', background: '#fff', borderRadius: 12, border: '1.5px solid #e9eef5' }}>
          <Skeleton w={52} h={52} radius={10} />
          <div style={{ flex: 1 }}>
            <Skeleton w="50%" h={14} style={{ marginBottom: 8 }} />
            <Skeleton w="35%" h={11} />
          </div>
          <Skeleton w={55} h={22} radius={20} />
        </div>
      ))}
    </div>
  );
}

/* ── Week mini calendar ───────────────────────────────────────────────── */
function WeekNav({ selectedDay, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {DAYS.map((d, i) => (
        <button
          key={d}
          onClick={() => onSelect(i)}
          style={{
            flex: 1, padding: '8px 4px', borderRadius: 10,
            background: selectedDay === i ? `linear-gradient(135deg, ${P}, #0284c7)` : '#fff',
            border: `1.5px solid ${selectedDay === i ? 'transparent' : '#e9eef5'}`,
            color: selectedDay === i ? '#fff' : '#64748b',
            fontWeight: selectedDay === i ? 700 : 500,
            fontSize: 11, cursor: 'pointer', textAlign: 'center',
            transition: 'background .15s, color .15s',
            boxShadow: selectedDay === i ? `0 3px 10px ${P}44` : 'none',
          }}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export function FisioNovaPilotAgenda() {
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(4); // Viernes
  const [selectedCita, setSelectedCita] = useState(null);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => { if (!cancelled) setLoading(false); }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [selectedDay]);

  const citas = AGENDA_MOCK.filter(c =>
    filter === 'todas' || c.estado === filter
  );

  return (
    <div style={{ padding: 24, background: S, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0c1b33', marginBottom: 2 }}>Agenda</h1>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>{citas.length} citas · Demo datos ficticios</p>
        </div>
        <button style={{
          background: `linear-gradient(135deg, ${P}, #0284c7)`, color: '#fff',
          border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', boxShadow: `0 3px 12px ${P}44`,
        }}>+ Cita</button>
      </div>

      {/* Week nav */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, border: '1.5px solid #e9eef5' }}>
        <WeekNav selectedDay={selectedDay} onSelect={setSelectedDay} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'todas', label: 'Todas', count: AGENDA_MOCK.length },
          { key: 'confirmada', label: 'Confirmadas', count: AGENDA_MOCK.filter(c => c.estado === 'confirmada').length },
          { key: 'pendiente', label: 'Pendientes', count: AGENDA_MOCK.filter(c => c.estado === 'pendiente').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? P : '#fff',
              color: filter === f.key ? '#fff' : '#64748b',
              border: `1.5px solid ${filter === f.key ? P : '#e9eef5'}`,
              borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background .15s, color .15s',
            }}
          >
            {f.label}
            <span style={{
              background: filter === f.key ? 'rgba(255,255,255,.25)' : `${P}18`,
              color: filter === f.key ? '#fff' : P,
              borderRadius: 20, padding: '1px 7px', fontSize: 10,
            }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Citas list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? <AgendaSkeleton /> : citas.map((c, i) => (
          <CitaCard key={c.id} cita={c} onClick={setSelectedCita} index={i} />
        ))}
      </div>

      {/* Drawer */}
      {selectedCita && (
        <CitaDrawer cita={selectedCita} onClose={() => setSelectedCita(null)} />
      )}

      <style>{`
        @keyframes citaSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
