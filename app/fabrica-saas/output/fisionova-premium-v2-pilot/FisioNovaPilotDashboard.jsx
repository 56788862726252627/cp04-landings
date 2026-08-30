/**
 * FisioNova Premium V2 Pilot — Dashboard
 * AnimatedMetric, MotionCard, stagger, skeleton loading
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState, useEffect, useRef } from 'react';
import { DASHBOARD_STATS, AGENDA_MOCK, BRANDING_V2, EVOLUCION_MOCK } from './FisioNovaPilotMockData.js';

const P = BRANDING_V2.primaryColor;
const A = BRANDING_V2.accentColor;
const S = BRANDING_V2.surfaceColor;

/* ── AnimatedMetric (counter spring) ─────────────────────────────────── */
function AnimatedMetric({ value, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState('—');
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  const numericValue = parseFloat(String(value).replace(/[^\d.]/g, ''));
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isNumeric || hasAnimated.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      hasAnimated.current = true;
      obs.disconnect();
      const start = performance.now();
      const duration = 900;
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        const current = Math.round(ease * numericValue);
        setDisplay(`${prefix}${current.toLocaleString('es-ES')}${suffix}`);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [numericValue, isNumeric, prefix, suffix]);

  return (
    <span ref={ref}>
      {isNumeric ? display : `${prefix}${value}${suffix}`}
    </span>
  );
}

/* ── MotionCard ───────────────────────────────────────────────────────── */
function MotionCard({ children, style }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 14,
        border: `1.5px solid ${hover ? P + '44' : '#e9eef5'}`,
        boxShadow: hover ? `0 8px 24px ${P}18` : '0 2px 8px rgba(0,0,0,.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'box-shadow .2s, border-color .2s, transform .22s cubic-bezier(.22,1,.36,1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function Skeleton({ w = '100%', h = 16, radius = 6, style }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, #e8eef4 25%, #f3f7fb 50%, #e8eef4 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

/* ── BarChart (simple CSS) ────────────────────────────────────────────── */
function BarChart({ data, label = 'Citas por día' }) {
  const max = Math.max(...data.map(d => d.value));
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return (
    <div style={{ padding: '20px 0 8px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 16 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{d.value}</div>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: `${(d.value / max) * 80}px`,
              background: d.today
                ? `linear-gradient(180deg, ${A}, #059669)`
                : `linear-gradient(180deg, ${P}99, ${P}55)`,
              transition: 'height .6s cubic-bezier(.22,1,.36,1)',
            }} />
            <div style={{ fontSize: 10, color: d.today ? P : '#94a3b8', fontWeight: d.today ? 700 : 400 }}>
              {days[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Donut ────────────────────────────────────────────────────────────── */
function DonutChart({ value, max, color, label }) {
  const pct = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 36;
  const dash = pct * circumference;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="36" fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dasharray .8s cubic-bezier(.22,1,.36,1)' }}
        />
        <text x="44" y="49" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────────────────────────── */
function StatCard({ stat, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <MotionCard style={{
      padding: '20px 22px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(16px)',
      transition: `opacity .4s ${delay}ms ease, transform .4s ${delay}ms cubic-bezier(.22,1,.36,1), box-shadow .2s, border-color .2s`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${stat.color}18`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18,
        }}>{stat.icon}</div>
        <span style={{
          fontSize: 10, background: `${A}15`, color: '#059669',
          borderRadius: 20, padding: '2px 8px', fontWeight: 600,
        }}>{stat.delta}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0c1b33', lineHeight: 1 }}>
        <AnimatedMetric value={stat.valor} />
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
    </MotionCard>
  );
}

/* ── Activity feed ────────────────────────────────────────────────────── */
function AgendaFeed() {
  return (
    <MotionCard style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span>Agenda de hoy</span>
        <span style={{ fontSize: 11, color: A, fontWeight: 600 }}>
          {AGENDA_MOCK.filter(a => a.estado === 'confirmada').length} confirmadas
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AGENDA_MOCK.slice(0, 5).map((cita, i) => (
          <div
            key={cita.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              background: cita.estado === 'cancelada' ? '#fef2f2' : S,
              opacity: cita.estado === 'cancelada' ? .65 : 1,
              animation: `agendaIn .3s ${i * 0.07}s both`,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 8, flexShrink: 0,
              background: cita.estado === 'confirmada' ? `${P}18` : '#e2e8f0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: P }}>{cita.hora}</span>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>sala {cita.sala}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0c1b33', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cita.paciente}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cita.tratamiento}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '2px 8px',
              background: cita.estado === 'confirmada' ? `${A}18` : cita.estado === 'cancelada' ? '#fee2e2' : '#fef3c7',
              color: cita.estado === 'confirmada' ? '#059669' : cita.estado === 'cancelada' ? '#dc2626' : '#92400e',
            }}>{cita.estado}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes agendaIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </MotionCard>
  );
}

/* ── Evolucion mini ───────────────────────────────────────────────────── */
function EvolucionMini() {
  const s = EVOLUCION_MOCK.sesiones;
  const maxDolor = 10;
  return (
    <MotionCard style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 4 }}>
        Evolución reciente
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>{EVOLUCION_MOCK.paciente} · {EVOLUCION_MOCK.diagnostico}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70, marginBottom: 8 }}>
        {s.map((sess, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: '100%', borderRadius: '3px 3px 0 0',
              height: `${(sess.dolor / maxDolor) * 60}px`,
              background: sess.dolor > 5 ? '#f87171' : sess.dolor > 3 ? '#fb923c' : A,
              transition: `height .5s ${i * 0.06}s cubic-bezier(.22,1,.36,1)`,
            }} />
            <div style={{ fontSize: 8, color: '#94a3b8' }}>S{sess.num}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Dolor EVA: <span style={{ color: '#f87171', fontWeight: 700 }}>8/10</span> inicial → <span style={{ color: A, fontWeight: 700 }}>1/10</span> actual
      </div>
    </MotionCard>
  );
}

/* ── Dashboard Root ───────────────────────────────────────────────────── */
export function FisioNovaPilotDashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const barData = [
    { value: 8, today: false }, { value: 11, today: false }, { value: 9, today: false },
    { value: 14, today: false }, { value: 12, today: true }, { value: 6, today: false },
    { value: 3, today: false },
  ];

  return (
    <div style={{ padding: 24, background: S, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0c1b33', marginBottom: 2 }}>Panel de control</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Hoy, 30 agosto 2026 · Demo: datos ficticios</p>
        </div>
        <button style={{
          background: `linear-gradient(135deg, ${P}, #0284c7)`, color: '#fff',
          border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', boxShadow: `0 3px 12px ${P}44`,
        }}>+ Nueva cita</button>
      </div>

      {/* Stats row */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20 }}>
              <Skeleton w={40} h={40} radius={10} style={{ marginBottom: 12 }} />
              <Skeleton w="55%" h={24} style={{ marginBottom: 8 }} />
              <Skeleton w="40%" h={12} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {DASHBOARD_STATS.map((s, i) => (
            <StatCard key={i} stat={s} delay={i * 80} />
          ))}
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Bar chart */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20 }}>
            <Skeleton w="40%" h={14} style={{ marginBottom: 20 }} />
            <Skeleton w="100%" h={100} />
          </div>
        ) : (
          <MotionCard style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 4 }}>Citas esta semana</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Total: 63 sesiones · Pico: jueves</div>
            <BarChart data={barData} label="" />
          </MotionCard>
        )}

        {/* Agenda feed */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <Skeleton w={48} h={48} radius={8} />
                <div style={{ flex: 1 }}>
                  <Skeleton w="70%" h={12} style={{ marginBottom: 6 }} />
                  <Skeleton w="50%" h={10} />
                </div>
              </div>
            ))}
          </div>
        ) : <AgendaFeed />}

        {/* Donuts */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20 }}>
            <Skeleton w="60%" h={14} style={{ marginBottom: 20 }} />
            <Skeleton w={88} h={88} radius={44} style={{ margin: '0 auto 16px' }} />
          </div>
        ) : (
          <MotionCard style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 16 }}>Indicadores</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DonutChart value={94} max={100} color={A} label="Satisfacción" />
              <DonutChart value={78} max={100} color={P} label="Ocupación" />
            </div>
          </MotionCard>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <EvolucionMini />
        <MotionCard style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 14 }}>Acciones rápidas</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Nueva cita', icon: '📅', color: P },
              { label: 'Nuevo paciente', icon: '👤', color: A },
              { label: 'Registrar pago', icon: '💳', color: '#7c3aed' },
              { label: 'Ver informes', icon: '📊', color: '#f59e0b' },
            ].map((a, i) => (
              <button key={i} style={{
                background: `${a.color}12`, border: `1px solid ${a.color}22`,
                borderRadius: 10, padding: '12px 8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'background .15s, transform .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${a.color}22`; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${a.color}12`; e.currentTarget.style.transform = ''; }}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: a.color }}>{a.label}</span>
              </button>
            ))}
          </div>
        </MotionCard>
      </div>

      <style>{`@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>
    </div>
  );
}
