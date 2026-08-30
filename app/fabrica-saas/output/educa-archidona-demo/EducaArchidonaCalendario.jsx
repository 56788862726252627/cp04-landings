/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Calendario Academico
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState } from 'react';
import { CALENDARIO_EVENTOS } from './EducaArchidonaMockData.js';

const TIPO_CONFIG = {
  tarea:      { icon: '📝', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',  label: 'Tarea' },
  examen:     { icon: '📋', color: '#dc2626', bg: '#fef2f2', border: '#fecaca',  label: 'Examen' },
  evaluacion: { icon: '🎯', color: '#7c3aed', bg: '#faf5ff', border: '#ede9fe',  label: 'Evaluacion' },
  festivo:    { icon: '🎉', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',  label: 'Festivo' },
};

function EventoBadge({ tipo }) {
  const cfg = TIPO_CONFIG[tipo] || TIPO_CONFIG.tarea;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function EducaArchidonaCalendario() {
  const [filtro, setFiltro] = useState('todos');

  const eventosFiltrados = filtro === 'todos'
    ? CALENDARIO_EVENTOS
    : CALENDARIO_EVENTOS.filter(e => e.tipo === filtro);

  const contadores = ['tarea', 'examen', 'evaluacion'].reduce((acc, tipo) => {
    acc[tipo] = CALENDARIO_EVENTOS.filter(e => e.tipo === tipo).length;
    return acc;
  }, {});

  return (
    <div style={{ padding: 24, background: '#eff6ff', minHeight: '100vh' }}>

      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '📝', label: 'Tareas',     count: contadores.tarea,     color: '#1d4ed8' },
          { icon: '📋', label: 'Examenes',   count: contadores.examen,    color: '#dc2626' },
          { icon: '🎯', label: 'Evaluacion', count: contadores.evaluacion || 1, color: '#7c3aed' },
          { icon: '📅', label: 'Total',      count: CALENDARIO_EVENTOS.length, color: '#16a34a' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 12, padding: '14px 16px', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,.04)', borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {['todos', 'tarea', 'examen', 'evaluacion'].map(f => {
          const cfg = f === 'todos' ? { icon: '📅', label: 'Todos' } : {
            icon: TIPO_CONFIG[f]?.icon, label: TIPO_CONFIG[f]?.label,
          };
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: '2px solid',
                borderColor: filtro === f ? '#1d4ed8' : '#e2e8f0',
                background:  filtro === f ? '#1d4ed8' : '#fff',
                color:       filtro === f ? '#fff'    : '#334155',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
              aria-pressed={filtro === f}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Timeline de eventos */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 20px', color: '#1e3a8a', fontSize: 16, fontWeight: 700 }}>
          Septiembre 2026
        </h3>
        {eventosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            No hay eventos de este tipo
          </div>
        )}
        {eventosFiltrados.map((ev, i) => {
          const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG.tarea;
          const dia = ev.fecha.split('-')[2];
          return (
            <div key={i} style={{
              display: 'flex', gap: 16, paddingBottom: 16, marginBottom: 16,
              borderBottom: i < eventosFiltrados.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              {/* Fecha */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: cfg.bg,
                border: `2px solid ${cfg.border}`, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>{dia}</div>
                <div style={{ fontSize: 9, color: cfg.color, opacity: .7 }}>SEP</div>
              </div>
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>{ev.titulo}</span>
                  <EventoBadge tipo={ev.tipo} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  📚 {ev.materia} · {ev.fecha}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista proximas semanas */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 16, fontWeight: 700 }}>
          Proximas semanas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { semana: '1 - 7 Sep',  eventos: ['Entrega ejercicios Mat', 'Entrega redaccion Lengua'] },
            { semana: '8 - 14 Sep', eventos: ['Examen Matematicas', 'Examen Historia'] },
            { semana: '15 - 21 Sep',eventos: ['Examen Biologia'] },
            { semana: '22 - 28 Sep',eventos: ['1a Evaluacion Parcial'] },
          ].map((s, i) => (
            <div key={i} style={{
              background: i === 0 ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${i === 0 ? '#bfdbfe' : '#e2e8f0'}`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1e3a8a', marginBottom: 8 }}>
                📅 {s.semana}
              </div>
              {s.eventos.map((ev, j) => (
                <div key={j} style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  · {ev}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
          Demo · Fechas ficticias para ilustrar la funcionalidad del calendario academico.
        </p>
      </div>
    </div>
  );
}
