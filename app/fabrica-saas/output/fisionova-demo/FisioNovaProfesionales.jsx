/**
 * OUTPUT GENERADO · FisioNova (Demo) · Profesionales V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { PROFESIONALES, CITAS_HOY } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

const HORARIO_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00'];

function DisponibilidadMini({ profesional }) {
  const citasProf = CITAS_HOY.filter(c => c.profesional === profesional.id);
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      {HORARIO_SLOTS.slice(0, 6).map(hora => {
        const ocupada = citasProf.some(c => c.hora === hora);
        return (
          <div key={hora} style={{ padding: '0.15rem 0.4rem', borderRadius: '0.25rem', background: ocupada ? `${profesional.color}25` : '#f0fdf4', border: `1px solid ${ocupada ? profesional.color : '#bbf7d0'}`, fontSize: '0.65rem', color: ocupada ? profesional.color : C.secondary, fontWeight: 600 }}>
            {hora}
          </div>
        );
      })}
    </div>
  );
}

function PerfilCompleto({ profesional, onClose }) {
  const citasHoy = CITAS_HOY.filter(c => c.profesional === profesional.id);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ background: C.white, width: 'min(520px, 100vw)', height: '100%', overflowY: 'auto', padding: '2rem', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 800, color: C.text }}>Perfil profesional</h2>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Avatar + datos */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem', padding: '1.25rem', background: C.bg, borderRadius: '1rem' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: profesional.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0 }}>
            {profesional.iniciales}
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text, marginBottom: '0.25rem' }}>{profesional.nombre}</h3>
            <p style={{ color: profesional.color, fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{profesional.especialidad}</p>
            <p style={{ color: C.muted, fontSize: '0.82rem' }}>{profesional.titulo}</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { l: 'Valoración', v: profesional.valoracion, suf: '/5' },
            { l: 'Sesiones', v: profesional.sesiones },
            { l: 'Experiencia', v: profesional.experiencia },
          ].map(({ l, v, suf = '' }) => (
            <div key={l} style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.25rem' }}>{l}</div>
              <div style={{ fontWeight: 800, color: C.primary, fontSize: '1.1rem' }}>{v}{suf}</div>
            </div>
          ))}
        </div>

        {/* Disponibilidad */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, color: C.text, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Días disponibles</h4>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <span key={d} style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: profesional.disponibilidad.includes(d) ? `${profesional.color}20` : C.bg, color: profesional.disponibilidad.includes(d) ? profesional.color : C.muted, fontWeight: 700, fontSize: '0.8rem', border: `1px solid ${profesional.disponibilidad.includes(d) ? profesional.color : C.border}` }}>
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Idiomas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, color: C.text, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Idiomas</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {profesional.idiomas.map(l => <span key={l} style={{ background: C.bg, color: C.primary, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>{l}</span>)}
          </div>
        </div>

        {/* Citas hoy */}
        <div>
          <h4 style={{ fontWeight: 700, color: C.text, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Citas de hoy ({citasHoy.length})</h4>
          {citasHoy.length === 0
            ? <p style={{ color: C.muted, fontSize: '0.85rem' }}>Sin citas programadas para hoy</p>
            : citasHoy.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontWeight: 700, color: C.primary, minWidth: '3rem', fontSize: '0.85rem' }}>{c.hora}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>{c.paciente.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.75rem', color: C.muted }}>{c.servicio}</div>
                </div>
                <span style={{ fontSize: '0.72rem', color: C.muted }}>{c.sala}</span>
              </div>
            ))
          }
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button style={{ padding: '0.7rem', borderRadius: '0.6rem', background: C.primary, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Asignar cita (demo)</button>
          <button style={{ padding: '0.7rem', borderRadius: '0.6rem', background: C.white, color: C.text, fontWeight: 600, border: `1.5px solid ${C.border}`, cursor: 'pointer' }}>Editar perfil (demo)</button>
        </div>
      </div>
    </div>
  );
}

export function FisioNovaProfesionales() {
  const [activo, setActivo] = useState(null);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Profesionales</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>{PROFESIONALES.length} fisioterapeutas · Datos ficticios (demo)</p>
        </div>
        <button style={{ background: C.primary, color: '#fff', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
          + Añadir profesional (demo)
        </button>
      </div>

      {/* Stats globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Equipo', val: PROFESIONALES.length, color: C.primary },
          { label: 'Valoración media', val: (PROFESIONALES.reduce((s, p) => s + p.valoracion, 0) / PROFESIONALES.length).toFixed(1) + '/5', color: '#d97706' },
          { label: 'Sesiones totales', val: PROFESIONALES.reduce((s, p) => s + p.sesiones, 0), color: C.secondary },
          { label: 'Citas hoy', val: CITAS_HOY.length, color: C.accent },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, borderRadius: '0.875rem', padding: '1rem', border: `1.5px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.78rem', color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {PROFESIONALES.map(p => {
          const citasHoy = CITAS_HOY.filter(c => c.profesional === p.id).length;
          return (
            <div key={p.id} onClick={() => setActivo(p)} style={{ background: C.white, borderRadius: '1rem', padding: '1.5rem', border: `1.5px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              {/* Cabecera */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, flexShrink: 0 }}>
                  {p.iniciales}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{p.nombre}</h3>
                  <p style={{ color: p.color, fontSize: '0.78rem', fontWeight: 600 }}>{p.especialidad}</p>
                </div>
              </div>

              {/* Métricas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                  { l: 'Valoración', v: `${p.valoracion}⭐` },
                  { l: 'Sesiones', v: p.sesiones },
                  { l: 'Hoy', v: `${citasHoy} citas` },
                ].map(({ l, v }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: C.primary, fontSize: '0.9rem' }}>{v}</div>
                    <div style={{ fontSize: '0.65rem', color: C.muted }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Disponibilidad mini */}
              <DisponibilidadMini profesional={p} />

              {/* Experiencia */}
              <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.75rem' }}>{p.experiencia} de experiencia · {p.idiomas.join(', ')}</p>
            </div>
          );
        })}
      </div>

      {activo && <PerfilCompleto profesional={activo} onClose={() => setActivo(null)} />}
    </div>
  );
}
