/**
 * FisioNova Premium V2 Pilot — Evolución
 * AnimatedMetric, charts, timeline, progress bars
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState, useEffect, useRef } from 'react';
import { EVOLUCION_MOCK, BRANDING_V2 } from './FisioNovaPilotMockData.js';

const P = BRANDING_V2.primaryColor;
const A = BRANDING_V2.accentColor;
const S = BRANDING_V2.surfaceColor;

function AnimatedCounter({ target, delay = 0 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      started.current = true;
      obs.disconnect();
      const t = setTimeout(() => {
        const start = performance.now();
        const dur = 1000;
        const step = (now) => {
          const progress = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, delay);
      return () => clearTimeout(t);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, delay]);
  return <span ref={ref}>{value}</span>;
}

function ProgressBar({ label, value, max = 100, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const t = setTimeout(() => setWidth((value / max) * 100), delay);
      return () => clearTimeout(t);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, max, delay]);

  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          <AnimatedCounter target={value} delay={delay} />{max === 100 ? '%' : ''}
        </span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 100,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          width: `${width}%`,
          transition: `width 1s ${delay}ms cubic-bezier(.22,1,.36,1)`,
        }} />
      </div>
    </div>
  );
}

function MultiLineChart({ sessions }) {
  const w = 480, h = 160, pad = { t: 10, r: 10, b: 30, l: 30 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const n = sessions.length;

  const xScale = (i) => pad.l + (i / (n - 1)) * chartW;
  const yScale = (v, max) => pad.t + chartH - (v / max) * chartH;

  const toPath = (vals, max) => vals
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v, max).toFixed(1)}`)
    .join(' ');

  const dolorVals = sessions.map(s => s.dolor);
  const movilVals = sessions.map(s => s.movilidad);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <line key={v} x1={pad.l} y1={yScale(v, 100)} x2={w - pad.r} y2={yScale(v, 100)}
          stroke="#f1f5f9" strokeWidth={1} />
      ))}
      {/* Dolor line */}
      <path d={toPath(dolorVals, 10)} fill="none" stroke="#f87171" strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 800, strokeDashoffset: 800, animation: 'drawLine .8s ease forwards' }} />
      {/* Movilidad line */}
      <path d={toPath(movilVals, 100)} fill="none" stroke={A} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 800, strokeDashoffset: 800, animation: 'drawLine .8s .3s ease forwards' }} />
      {/* Dots — dolor */}
      {sessions.map((s, i) => (
        <circle key={`d${i}`} cx={xScale(i)} cy={yScale(s.dolor, 10)} r={3} fill="#fff" stroke="#f87171" strokeWidth={2} />
      ))}
      {/* Dots — movilidad */}
      {sessions.map((s, i) => (
        <circle key={`m${i}`} cx={xScale(i)} cy={yScale(s.movilidad, 100)} r={3} fill="#fff" stroke={A} strokeWidth={2} />
      ))}
      {/* X axis labels */}
      {sessions.map((s, i) => (
        <text key={`l${i}`} x={xScale(i)} y={h - 6} textAnchor="middle" fontSize={9} fill="#94a3b8">
          S{s.num}
        </text>
      ))}
    </svg>
  );
}

function TimelineItem({ sess, isLast }) {
  const dolorColor = sess.dolor > 5 ? '#f87171' : sess.dolor > 3 ? '#fb923c' : A;
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      {/* Vertical line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: 19, top: 40, bottom: -8, width: 2,
          background: `linear-gradient(${P}44, transparent)`,
        }} />
      )}
      {/* Dot */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${P}, #0284c7)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 13, boxShadow: `0 3px 8px ${P}44`,
      }}>S{sess.num}</div>
      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0c1b33' }}>{sess.fecha}</span>
          <span style={{
            background: `${dolorColor}18`, color: dolorColor,
            fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px',
          }}>Dolor: {sess.dolor}/10</span>
          <span style={{
            background: `${A}18`, color: '#059669',
            fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px',
          }}>Movil: {sess.movilidad}%</span>
        </div>
        <div style={{
          background: S, borderRadius: 10, padding: '10px 14px',
          fontSize: 13, color: '#475569', lineHeight: 1.5,
          border: `1px solid ${P}12`,
        }}>{sess.nota}</div>
      </div>
    </div>
  );
}

export function FisioNovaPilotEvolucion() {
  const { sesiones, paciente, diagnostico } = EVOLUCION_MOCK;
  const ultima = sesiones[sesiones.length - 1];
  const primera = sesiones[0];
  const mejoraDolor = primera.dolor - ultima.dolor;
  const mejoraMovil = ultima.movilidad - primera.movilidad;

  return (
    <div style={{ padding: 24, background: S, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0c1b33', marginBottom: 2 }}>Evolución clínica</h1>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>{paciente} · {diagnostico} · Demo datos ficticios</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Sesiones totales', value: sesiones.length, icon: '📋', color: P },
          { label: 'Reducción dolor', value: `${mejoraDolor} pts`, icon: '📉', color: '#10b981' },
          { label: 'Mejora movilidad', value: `+${mejoraMovil}%`, icon: '🦵', color: A },
          { label: 'Dolor actual', value: `${ultima.dolor}/10`, icon: '💚', color: '#059669' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            border: `1.5px solid ${kpi.color}22`,
            boxShadow: `0 2px 8px ${kpi.color}10`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{kpi.icon}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Chart + bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 20 }}>

        {/* Multi-line chart */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e9eef5' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 4 }}>Progresión por sesión</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, display: 'flex', gap: 16 }}>
            <span style={{ color: '#f87171' }}>● Dolor EVA</span>
            <span style={{ color: A }}>● Movilidad %</span>
          </div>
          <MultiLineChart sessions={sesiones} />
          <style>{`@keyframes drawLine { to { stroke-dashoffset: 0; } }`}</style>
        </div>

        {/* Progress bars */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e9eef5' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 16 }}>Estado actual</div>
          <ProgressBar label="Movilidad" value={ultima.movilidad} color={A} delay={0} />
          <ProgressBar label="Funcional" value={ultima.funcional} color={P} delay={100} />
          <ProgressBar label="Sin dolor (inverso)" value={100 - ultima.dolor * 10} color="#f59e0b" delay={200} />
          <div style={{ marginTop: 16, padding: 12, background: `${A}10`, borderRadius: 10, border: `1px solid ${A}30` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 4 }}>✓ Objetivo alcanzado</div>
            <div style={{ fontSize: 12, color: '#475569' }}>Paciente lista para alta con plan de prevención.</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e9eef5' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 20 }}>Notas clínicas por sesión</div>
        {sesiones.map((s, i) => (
          <TimelineItem key={i} sess={s} isLast={i === sesiones.length - 1} />
        ))}
      </div>
    </div>
  );
}
