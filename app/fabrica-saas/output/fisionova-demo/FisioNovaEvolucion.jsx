/**
 * OUTPUT GENERADO · FisioNova (Demo) · Evolución Clínica V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { PACIENTES, PROFESIONALES } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

// Datos de evolución ficticios por paciente
const EVOLUCION_DATA = {
  dolor:      [8, 7, 6, 5, 4, 4, 3, 2],
  movilidad:  [30, 40, 52, 60, 72, 78, 85, 90],
  fuerza:     [20, 30, 42, 55, 65, 72, 80, 88],
  adherencia: [60, 70, 75, 80, 90, 85, 95, 100],
};
const SEMANAS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

function MiniChart({ data, color, max = 100 }) {
  const w = 200, h = 60, pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v / max) * (h - 2 * pad));
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pts.split(' ')[0]} L${pts.split(' ').join(' L')} L${pad + (w - 2 * pad)},${h} L${pad},${h} Z`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((v / max) * (h - 2 * pad));
        return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2.5} fill={color} />;
      })}
    </svg>
  );
}

function ProgressRing({ valor, max = 100, color = C.primary, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (valor / max) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e0e7ff" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={color}>{valor}</text>
    </svg>
  );
}

function MetricCard({ titulo, valor, unidad, cambio, color, data, max }) {
  return (
    <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: C.muted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>{titulo}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{valor}<span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: '0.2rem' }}>{unidad}</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cambio > 0 ? C.secondary : '#dc2626' }}>
            {cambio > 0 ? '▲' : '▼'} {Math.abs(cambio)}{unidad}
          </span>
          <div style={{ fontSize: '0.7rem', color: C.muted }}>vs semana ant.</div>
        </div>
      </div>
      <MiniChart data={data} color={color} max={max} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        {SEMANAS.map(s => <span key={s} style={{ fontSize: '0.65rem', color: C.muted }}>{s}</span>)}
      </div>
    </div>
  );
}

function NotaClinica({ texto, fecha, autor, tipo }) {
  const colores = { positiva: C.secondary, neutra: C.primary, alerta: '#dc2626' };
  return (
    <div style={{ background: C.white, borderRadius: '0.875rem', padding: '1rem', border: `1.5px solid ${colores[tipo] ?? C.border}`, borderLeft: `4px solid ${colores[tipo] ?? C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colores[tipo] ?? C.muted }}>
          {tipo === 'positiva' ? '✅ Progreso positivo' : tipo === 'alerta' ? '⚠️ Observación' : '📝 Nota clínica'}
        </span>
        <span style={{ fontSize: '0.72rem', color: C.muted }}>{fecha}</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: C.text, lineHeight: 1.5, marginBottom: '0.5rem' }}>{texto}</p>
      <span style={{ fontSize: '0.75rem', color: C.muted }}>— {autor}</span>
    </div>
  );
}

export function FisioNovaEvolucion() {
  const [pacienteId, setPacienteId] = useState('pa1');
  const paciente = PACIENTES.find(p => p.id === pacienteId) ?? PACIENTES[0];
  const prof = PROFESIONALES.find(p => p.id === paciente.profesional);

  const notas = [
    { texto: 'Aumento notable en el rango de movimiento articular. Paciente refiere dolor 2/10 en actividad moderada. Se mantiene plan de ejercicios con progresión de carga.', fecha: '25 ago 2026', autor: prof?.nombre ?? '', tipo: 'positiva' },
    { texto: 'Sesión de terapia manual centrada en zona lumbar. Liberación miofascial con respuesta satisfactoria. Paciente toleró bien la técnica.', fecha: '22 ago 2026', autor: prof?.nombre ?? '', tipo: 'neutra' },
    { texto: 'Paciente refiere ligera molestia tras sesión de ejercicios. Se ajusta carga de trabajo al 80% del protocolo. Monitorizar próximas 48h.', fecha: '18 ago 2026', autor: prof?.nombre ?? '', tipo: 'alerta' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Evolución Clínica</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>Seguimiento de parámetros funcionales por paciente (demo ficticio)</p>
        </div>
        <select value={pacienteId} onChange={e => setPacienteId(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '0.75rem', border: `1.5px solid ${C.border}`, fontSize: '0.9rem', background: C.white, fontWeight: 600 }}>
          {PACIENTES.filter(p => p.estado !== 'alta').map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Resumen paciente */}
      <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}`, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, flexShrink: 0 }}>
          {paciente.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: C.text }}>{paciente.nombre}</div>
          <div style={{ fontSize: '0.85rem', color: C.muted }}>{paciente.tratamiento} · {paciente.sesiones} sesiones</div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Evolución global', el: <ProgressRing valor={paciente.evolucion} color={paciente.evolucion >= 80 ? C.secondary : C.primary} size={64} /> },
            { label: 'Dolor actual', el: <ProgressRing valor={paciente.dolor} max={10} color={paciente.dolor <= 3 ? C.secondary : paciente.dolor <= 6 ? '#d97706' : '#dc2626'} size={64} /> },
          ].map(({ label, el }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              {el}
              <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <MetricCard titulo="Nivel de dolor" valor={EVOLUCION_DATA.dolor[7]} unidad="/10" cambio={-1} color="#dc2626" data={EVOLUCION_DATA.dolor} max={10} />
        <MetricCard titulo="Movilidad articular" valor={EVOLUCION_DATA.movilidad[7]} unidad="%" cambio={5} color={C.secondary} data={EVOLUCION_DATA.movilidad} max={100} />
        <MetricCard titulo="Fuerza muscular" valor={EVOLUCION_DATA.fuerza[7]} unidad="%" cambio={8} color={C.primary} data={EVOLUCION_DATA.fuerza} max={100} />
        <MetricCard titulo="Adherencia al plan" valor={EVOLUCION_DATA.adherencia[7]} unidad="%" cambio={5} color={C.accent} data={EVOLUCION_DATA.adherencia} max={100} />
      </div>

      {/* Notas clínicas */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.text }}>Notas clínicas</h2>
          <button style={{ background: C.primary, color: '#fff', fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            + Añadir nota (demo)
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notas.map((n, i) => <NotaClinica key={i} {...n} />)}
        </div>
      </div>
    </div>
  );
}
