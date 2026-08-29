/**
 * OUTPUT GENERADO · FisioNova (Demo) · Agenda Interactiva V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { CITAS_HOY, ESTADOS_CITA, PROFESIONALES } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

const DIAS = ['Lun 25', 'Mar 26', 'Mié 27', 'Jue 28', 'Vie 29', 'Sáb 30', 'Dom 31'];
const HORAS = ['08:00','09:00','10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'];

function ProfesionalBadge({ id, small }) {
  const p = PROFESIONALES.find(pr => pr.id === id);
  if (!p) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: `${p.color}15`, color: p.color, borderRadius: '1rem', padding: small ? '0.15rem 0.5rem' : '0.25rem 0.75rem', fontSize: small ? '0.7rem' : '0.8rem', fontWeight: 600 }}>
      <span style={{ width: '1.2rem', height: '1.2rem', background: p.color, color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>{p.iniciales}</span>
      {!small && p.nombre.split(' ')[0] + ' ' + p.nombre.split(' ')[1]}
    </span>
  );
}

function EstadoBadge({ estado }) {
  const e = ESTADOS_CITA[estado] ?? { label: estado, color: '#94a3b8', bg: '#f1f5f9' };
  return <span style={{ background: e.bg, color: e.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{e.label}</span>;
}

function DrawerCita({ cita, onClose }) {
  if (!cita) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: '1.25rem 1.25rem 0 0', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 -4px 30px rgba(0,0,0,0.2)' }} onClick={e_ => e_.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text, marginBottom: '0.25rem' }}>{cita.paciente}</h3>
            <p style={{ color: C.muted, fontSize: '0.9rem' }}>{cita.servicio}</p>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', fontSize: '1rem', color: C.muted }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Hora', val: cita.hora },
            { label: 'Duración', val: `${cita.duracion} min` },
            { label: 'Sala', val: cita.sala },
            { label: 'Estado', val: <EstadoBadge estado={cita.estado} /> },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem' }}>
              <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
              <div style={{ fontWeight: 700, color: C.text }}>{val}</div>
            </div>
          ))}
        </div>
        <ProfesionalBadge id={cita.profesional} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
          {['Confirmar', 'Reprogramar', 'Cancelar'].map(a => (
            <button key={a} style={{ padding: '0.65rem', borderRadius: '0.6rem', border: `1.5px solid ${C.border}`, background: a === 'Confirmar' ? C.primary : C.white, color: a === 'Confirmar' ? '#fff' : C.text, fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              {a} (demo)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VistaLista({ citas, onSelect, filtroEstado, filtroProfesional }) {
  const filtradas = citas.filter(c => {
    if (filtroEstado && c.estado !== filtroEstado) return false;
    if (filtroProfesional && c.profesional !== filtroProfesional) return false;
    return true;
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {filtradas.length === 0 && <p style={{ textAlign: 'center', color: C.muted, padding: '3rem 0' }}>No hay citas con los filtros seleccionados</p>}
      {filtradas.map(cita => {
        const e = ESTADOS_CITA[cita.estado] ?? { color: '#94a3b8', bg: '#f1f5f9' };
        return (
          <div key={cita.id} onClick={() => onSelect(cita)}
            style={{ background: C.white, borderRadius: '0.875rem', padding: '1rem 1.25rem', border: `1.5px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.15s', borderLeft: `4px solid ${e.color}` }}>
            <div style={{ textAlign: 'center', minWidth: '3.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: C.primary }}>{cita.hora}</div>
              <div style={{ fontSize: '0.72rem', color: C.muted }}>{cita.duracion}min</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem' }}>{cita.paciente}</div>
              <div style={{ fontSize: '0.82rem', color: C.muted, marginTop: '0.15rem' }}>{cita.servicio} · {cita.sala}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
              <EstadoBadge estado={cita.estado} />
              <ProfesionalBadge id={cita.profesional} small />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VistaSemana({ citas, onSelect }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            <th style={{ width: '4rem', padding: '0.5rem', color: C.muted, fontSize: '0.75rem' }}></th>
            {DIAS.map(d => <th key={d} style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: C.text }}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {HORAS.map(hora => (
            <tr key={hora}>
              <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: C.muted, textAlign: 'right', verticalAlign: 'top', paddingTop: '0.5rem' }}>{hora}</td>
              {DIAS.map((dia, di) => {
                const cita = citas.find(c => c.hora === hora && di % 3 === 0);
                const e = cita ? ESTADOS_CITA[cita.estado] : null;
                return (
                  <td key={dia} style={{ border: `1px solid ${C.border}`, padding: '0.25rem', verticalAlign: 'top', minHeight: '3rem', height: '3rem' }}>
                    {cita && (
                      <div onClick={() => onSelect(cita)}
                        style={{ background: e?.bg ?? C.bg, borderRadius: '0.4rem', padding: '0.3rem 0.4rem', cursor: 'pointer', borderLeft: `3px solid ${e?.color ?? C.primary}` }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: e?.color ?? C.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cita.paciente.split(' ')[0]}</div>
                        <div style={{ fontSize: '0.65rem', color: C.muted }}>{cita.servicio.split(' ')[0]}</div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FisioNovaAgenda() {
  const [vista, setVista] = useState('lista');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroProfesional, setFiltroProfesional] = useState('');

  const stats = {
    total:     CITAS_HOY.length,
    confirmadas: CITAS_HOY.filter(c => c.estado === 'confirmada').length,
    completadas: CITAS_HOY.filter(c => c.estado === 'completada').length,
    pendientes: CITAS_HOY.filter(c => c.estado === 'pendiente').length,
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, marginBottom: '0.25rem' }}>Agenda · Hoy</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>Jueves 28 agosto 2026 (demo)</p>
        </div>
        <button style={{ background: C.primary, color: '#fff', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
          + Nueva cita (demo)
        </button>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: stats.total, color: C.primary },
          { label: 'Confirmadas', val: stats.confirmadas, color: '#059669' },
          { label: 'Completadas', val: stats.completadas, color: '#4338ca' },
          { label: 'Pendientes', val: stats.pendientes, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, borderRadius: '0.875rem', padding: '1rem', border: `1.5px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.78rem', color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros + toggle vista */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', color: C.text, background: C.white }}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_CITA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filtroProfesional} onChange={e => setFiltroProfesional(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', color: C.text, background: C.white }}>
          <option value="">Todos los profesionales</option>
          {PROFESIONALES.map(p => <option key={p.id} value={p.id}>{p.nombre.split(' ').slice(0,2).join(' ')}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {['lista', 'semana'].map(v => (
            <button key={v} onClick={() => setVista(v)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${vista === v ? C.primary : C.border}`, background: vista === v ? C.primary : C.white, color: vista === v ? '#fff' : C.muted, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              {v === 'lista' ? '☰ Lista' : '⊞ Semana'}
            </button>
          ))}
        </div>
      </div>

      {/* Vista */}
      <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
        {vista === 'lista'
          ? <VistaLista citas={CITAS_HOY} onSelect={setCitaSeleccionada} filtroEstado={filtroEstado} filtroProfesional={filtroProfesional} />
          : <VistaSemana citas={CITAS_HOY} onSelect={setCitaSeleccionada} />
        }
      </div>

      <DrawerCita cita={citaSeleccionada} onClose={() => setCitaSeleccionada(null)} />
    </div>
  );
}
