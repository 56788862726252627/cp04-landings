/**
 * OUTPUT GENERADO · FisioNova (Demo) · Gestión de Leads V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { LEADS, PROFESIONALES } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

const ESTADO_LEAD = {
  pendiente:   { label: 'Pendiente',   bg: '#fef3c7', color: '#d97706' },
  contactado:  { label: 'Contactado',  bg: '#e0e7ff', color: C.primary },
  citado:      { label: 'Citado',      bg: '#d1fae5', color: '#059669' },
  perdido:     { label: 'Perdido',     bg: '#fee2e2', color: '#dc2626' },
};

const PRIORIDAD_COLOR = {
  alta:   '#dc2626',
  media:  '#d97706',
  baja:   '#059669',
};

const VIA_ICON = {
  web:       '🌐',
  instagram: '📷',
  google:    '🔍',
  referido:  '👥',
};

function KanbanCol({ estado, leads, onSelect }) {
  const cfg = ESTADO_LEAD[estado] ?? {};
  return (
    <div style={{ flex: 1, minWidth: '220px', background: C.bg, borderRadius: '1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem' }}>{cfg.label ?? estado}</span>
        <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{leads.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {leads.map(lead => (
          <div key={lead.id} onClick={() => onSelect(lead)} style={{ background: C.white, borderRadius: '0.75rem', padding: '0.875rem', border: `1.5px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.15s', borderLeft: `4px solid ${PRIORIDAD_COLOR[lead.prioridad] ?? C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 700, color: C.text, fontSize: '0.88rem' }}>{lead.nombre}</span>
              <span style={{ fontSize: '1rem' }}>{VIA_ICON[lead.via] ?? '💬'}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: C.muted, marginBottom: '0.5rem' }}>{lead.motivo}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: C.muted }}>{lead.fecha.slice(5)}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIORIDAD_COLOR[lead.prioridad], background: `${PRIORIDAD_COLOR[lead.prioridad]}15`, padding: '0.1rem 0.4rem', borderRadius: '0.5rem' }}>
                {lead.prioridad.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrawerLead({ lead, onClose }) {
  const [estado, setEstado] = useState(lead?.estado ?? 'pendiente');
  const [nota, setNota] = useState('');
  if (!lead) return null;
  const prof = PROFESIONALES.find(p => p.id === lead.profesional);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ background: C.white, width: 'min(480px, 100vw)', height: '100%', overflowY: 'auto', padding: '2rem', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, color: C.text }}>Detalle del lead</h2>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Info básica */}
        <div style={{ background: C.bg, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text, marginBottom: '0.5rem' }}>{lead.nombre}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { l: 'Vía', v: `${VIA_ICON[lead.via] ?? '💬'} ${lead.via}` },
              { l: 'Fecha', v: lead.fecha },
              { l: 'Motivo', v: lead.motivo },
              { l: 'Prioridad', v: <span style={{ color: PRIORIDAD_COLOR[lead.prioridad], fontWeight: 700 }}>{lead.prioridad}</span> },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.15rem' }}>{l}</div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: '0.85rem' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cambio de estado */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 700, color: C.text, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Estado del lead</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {Object.entries(ESTADO_LEAD).map(([k, v]) => (
              <button key={k} onClick={() => setEstado(k)}
                style={{ padding: '0.6rem', borderRadius: '0.5rem', border: `2px solid ${estado === k ? v.color : C.border}`, background: estado === k ? v.bg : C.white, color: estado === k ? v.color : C.muted, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asignar profesional */}
        {prof && (
          <div style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: prof.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{prof.iniciales}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.text }}>{prof.nombre}</div>
              <div style={{ fontSize: '0.75rem', color: C.muted }}>Fisioterapeuta asignado</div>
            </div>
          </div>
        )}
        {!prof && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, color: C.text, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Asignar fisioterapeuta</label>
            <select style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', background: C.white }}>
              <option value="">— Sin asignar —</option>
              {PROFESIONALES.map(p => <option key={p.id} value={p.id}>{p.nombre.split(' ').slice(0,2).join(' ')}</option>)}
            </select>
          </div>
        )}

        {/* Nota rápida */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 700, color: C.text, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Añadir nota</label>
          <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3} placeholder="Detalles del contacto, preferencias, horarios..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button style={{ padding: '0.7rem', borderRadius: '0.6rem', background: C.primary, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Guardar (demo)</button>
          <button style={{ padding: '0.7rem', borderRadius: '0.6rem', background: C.secondary, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Crear cita (demo)</button>
        </div>
      </div>
    </div>
  );
}

export function FisioNovaLeads() {
  const [vista, setVista] = useState('kanban');
  const [leadActivo, setLeadActivo] = useState(null);

  const stats = {
    total:      LEADS.length,
    pendientes: LEADS.filter(l => l.estado === 'pendiente').length,
    citados:    LEADS.filter(l => l.estado === 'citado').length,
    perdidos:   LEADS.filter(l => l.estado === 'perdido').length,
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Gestión de Leads</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>Seguimiento comercial y conversión (demo ficticio)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['kanban', 'lista'].map(v => (
            <button key={v} onClick={() => setVista(v)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${vista === v ? C.primary : C.border}`, background: vista === v ? C.primary : C.white, color: vista === v ? '#fff' : C.muted, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              {v === 'kanban' ? '🗂 Kanban' : '☰ Lista'}
            </button>
          ))}
          <button style={{ background: C.primary, color: '#fff', fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            + Nuevo lead (demo)
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { l: 'Total leads', v: stats.total, c: C.primary },
          { l: 'Sin contactar', v: stats.pendientes, c: '#d97706' },
          { l: 'Citados', v: stats.citados, c: C.secondary },
          { l: 'Perdidos', v: stats.perdidos, c: '#dc2626' },
        ].map(s => (
          <div key={s.l} style={{ background: C.white, borderRadius: '0.875rem', padding: '1rem', border: `1.5px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.78rem', color: C.muted }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Vista Kanban */}
      {vista === 'kanban' && (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {Object.keys(ESTADO_LEAD).map(estado => (
            <KanbanCol key={estado} estado={estado} leads={LEADS.filter(l => l.estado === estado)} onSelect={setLeadActivo} />
          ))}
        </div>
      )}

      {/* Vista lista */}
      {vista === 'lista' && (
        <div style={{ background: C.white, borderRadius: '1rem', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', background: C.bg, display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '1rem', fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
            {['Nombre', 'Motivo', 'Vía', 'Prioridad', 'Estado', 'Fecha'].map(h => <span key={h}>{h}</span>)}
          </div>
          {LEADS.map((lead, i) => {
            const est = ESTADO_LEAD[lead.estado] ?? {};
            return (
              <div key={lead.id} onClick={() => setLeadActivo(lead)} style={{ padding: '0.875rem 1.25rem', borderTop: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: i % 2 ? '#fafbff' : C.white }}>
                <span style={{ fontWeight: 700, color: C.text }}>{lead.nombre}</span>
                <span style={{ fontSize: '0.85rem', color: C.muted }}>{lead.motivo}</span>
                <span style={{ fontSize: '0.85rem' }}>{VIA_ICON[lead.via] ?? '💬'} {lead.via}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: PRIORIDAD_COLOR[lead.prioridad] }}>{lead.prioridad}</span>
                <span style={{ background: est.bg, color: est.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem', display: 'inline-block' }}>{est.label}</span>
                <span style={{ fontSize: '0.82rem', color: C.muted }}>{lead.fecha.slice(5)}</span>
              </div>
            );
          })}
        </div>
      )}

      <DrawerLead lead={leadActivo} onClose={() => setLeadActivo(null)} />
    </div>
  );
}
