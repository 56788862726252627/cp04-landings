/**
 * OUTPUT GENERADO · FisioNova (Demo) · CRM Pacientes V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState, useMemo } from 'react';
import { PACIENTES, PROFESIONALES } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

const ESTADO_COLOR = {
  activo:  { bg: '#d1fae5', color: '#059669', label: 'Activo' },
  pausado: { bg: '#fef3c7', color: '#d97706', label: 'Pausado' },
  alta:    { bg: '#e0e7ff', color: '#4338ca', label: 'Alta' },
};

function BarraProgreso({ valor, color = C.primary, height = 6 }) {
  return (
    <div style={{ height, background: '#e0e7ff', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, valor)}%`, background: color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

function TimelineItem({ texto, hace, tipo }) {
  const colores = { sesion: C.primary, nota: C.accent, alta: C.secondary };
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0' }}>
      <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: colores[tipo] ?? C.muted, marginTop: '0.4rem', flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: '0.82rem', color: C.text, marginBottom: '0.1rem' }}>{texto}</p>
        <p style={{ fontSize: '0.72rem', color: C.muted }}>{hace}</p>
      </div>
    </div>
  );
}

function DrawerPaciente({ paciente, onClose }) {
  if (!paciente) return null;
  const prof = PROFESIONALES.find(p => p.id === paciente.profesional);
  const estadoStyle = ESTADO_COLOR[paciente.estado] ?? {};
  const dolorColor = paciente.dolor <= 3 ? C.secondary : paciente.dolor <= 6 ? '#d97706' : '#dc2626';
  const timeline = [
    { texto: `Sesión de ${paciente.tratamiento} completada`, hace: 'Hace 2 días', tipo: 'sesion' },
    { texto: 'Nota clínica: evolución positiva en rango de movimiento', hace: 'Hace 4 días', tipo: 'nota' },
    { texto: 'Sesión de ejercicios terapéuticos completada', hace: 'Hace 1 semana', tipo: 'sesion' },
    { texto: 'Inicio de tratamiento personalizado', hace: 'Hace 3 semanas', tipo: 'nota' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ background: C.white, width: 'min(480px, 100vw)', height: '100%', overflowY: 'auto', padding: '2rem', boxShadow: '-4px 0 30px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: C.text }}>Expediente</h2>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', color: C.muted }}>✕</button>
        </div>
        {/* Avatar + nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
            {paciente.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: C.text }}>{paciente.nombre}</h3>
            <p style={{ color: C.muted, fontSize: '0.85rem' }}>{paciente.edad} años · {paciente.email}</p>
          </div>
        </div>
        {/* Estado */}
        <span style={{ background: estadoStyle.bg, color: estadoStyle.color, fontWeight: 700, fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>{estadoStyle.label}</span>
        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.5rem 0' }}>
          {[
            { label: 'Sesiones', val: paciente.sesiones },
            { label: 'Última sesión', val: paciente.ultimaSesion.slice(5) },
            { label: 'Próxima cita', val: paciente.proximaCita.slice(5) },
            { label: 'Dolor actual', val: `${paciente.dolor}/10`, color: dolorColor },
          ].map(m => (
            <div key={m.label} style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem' }}>
              <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontWeight: 800, color: m.color ?? C.text }}>{m.val}</div>
            </div>
          ))}
        </div>
        {/* Evolución */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>Evolución global</span>
            <span style={{ fontWeight: 800, color: C.primary }}>{paciente.evolucion}%</span>
          </div>
          <BarraProgreso valor={paciente.evolucion} color={paciente.evolucion >= 80 ? C.secondary : paciente.evolucion >= 50 ? C.primary : '#d97706'} height={8} />
        </div>
        {/* Profesional */}
        {prof && (
          <div style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: prof.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{prof.iniciales}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>{prof.nombre}</div>
              <div style={{ fontSize: '0.78rem', color: C.muted }}>{prof.especialidad}</div>
            </div>
          </div>
        )}
        {/* Tratamiento */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: '0.5rem' }}>Tratamiento activo</div>
          <div style={{ background: `${C.primary}15`, color: C.primary, fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'inline-block' }}>{paciente.tratamiento}</div>
        </div>
        {/* Timeline */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: '0.75rem' }}>Historial reciente</div>
          {timeline.map((t, i) => <TimelineItem key={i} {...t} />)}
        </div>
        {/* Acciones */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
          {['Nueva cita', 'Añadir nota', 'Editar expediente', 'Dar de alta'].map(a => (
            <button key={a} style={{ padding: '0.65rem', borderRadius: '0.6rem', border: `1.5px solid ${C.border}`, background: a === 'Nueva cita' ? C.primary : C.white, color: a === 'Nueva cita' ? '#fff' : C.text, fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              {a} (demo)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FisioNovaPacientes() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroProfesional, setFiltroProfesional] = useState('');
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [orden, setOrden] = useState('nombre');

  const pacientesFiltrados = useMemo(() => {
    return PACIENTES
      .filter(p => {
        if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !p.tratamiento.toLowerCase().includes(busqueda.toLowerCase())) return false;
        if (filtroEstado && p.estado !== filtroEstado) return false;
        if (filtroProfesional && p.profesional !== filtroProfesional) return false;
        return true;
      })
      .sort((a, b) => {
        if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
        if (orden === 'evolucion') return b.evolucion - a.evolucion;
        if (orden === 'sesiones') return b.sesiones - a.sesiones;
        return 0;
      });
  }, [busqueda, filtroEstado, filtroProfesional, orden]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Pacientes</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>{PACIENTES.length} pacientes en base de datos (demo ficticio)</p>
        </div>
        <button style={{ background: C.primary, color: '#fff', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
          + Nuevo paciente (demo)
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Activos', val: PACIENTES.filter(p => p.estado === 'activo').length, color: C.secondary },
          { label: 'Alta médica', val: PACIENTES.filter(p => p.estado === 'alta').length, color: C.primary },
          { label: 'Pausados', val: PACIENTES.filter(p => p.estado === 'pausado').length, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, borderRadius: '0.875rem', padding: '1rem', border: `1.5px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.8rem', color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar paciente o tratamiento..."
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', outline: 'none' }} />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', background: C.white }}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_COLOR).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filtroProfesional} onChange={e => setFiltroProfesional(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', background: C.white }}>
          <option value="">Todos los profesionales</option>
          {PROFESIONALES.map(p => <option key={p.id} value={p.id}>{p.nombre.split(' ').slice(0,2).join(' ')}</option>)}
        </select>
        <select value={orden} onChange={e => setOrden(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', background: C.white }}>
          <option value="nombre">Ordenar: Nombre</option>
          <option value="evolucion">Ordenar: Evolución</option>
          <option value="sesiones">Ordenar: Sesiones</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: C.white, borderRadius: '1rem', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Paciente', 'Tratamiento', 'Sesiones', 'Evolución', 'Dolor', 'Estado', 'Próxima cita'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: C.muted, textAlign: 'left', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p, i) => {
                const estado = ESTADO_COLOR[p.estado] ?? {};
                const dolorColor = p.dolor <= 3 ? C.secondary : p.dolor <= 6 ? '#d97706' : '#dc2626';
                return (
                  <tr key={p.id} onClick={() => setPacienteActivo(p)}
                    style={{ borderTop: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.1s', background: i % 2 === 0 ? C.white : '#fafbff' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                          {p.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem' }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: C.muted }}>{p.edad} años</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: C.muted }}>{p.tratamiento}</td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, color: C.text }}>{p.sesiones}</td>
                    <td style={{ padding: '0.875rem 1rem', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}><BarraProgreso valor={p.evolucion} color={p.evolucion >= 80 ? C.secondary : p.evolucion >= 50 ? C.primary : '#d97706'} /></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.text, minWidth: '2.5rem' }}>{p.evolucion}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, color: dolorColor }}>{p.dolor}/10</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ background: estado.bg, color: estado.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{estado.label}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: C.muted }}>{p.proximaCita.slice(5)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DrawerPaciente paciente={pacienteActivo} onClose={() => setPacienteActivo(null)} />
    </div>
  );
}
