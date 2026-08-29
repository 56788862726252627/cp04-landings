/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Agenda V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { Card, Badge, SectionTitle } from '../../core/AppShell.jsx';
import { MOCK_AGENDA } from './ClinicaDentalAuroraDemoMockData.js';

const ACCENT = "#0c7873";

const ESTADO_BADGE = {
  confirmada: 'teal',
  pendiente:  'yellow',
  cancelada:  'red',
};

const SEMANA_DEMO = ['Lun 25/08', 'Mar 26/08', 'Mié 27/08', 'Jue 28/08', 'Vie 29/08'];

export function ClinicaDentalAuroraDemoAgenda() {
  const [diaActivo, setDiaActivo] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const estadosFiltro = ['todos', 'confirmada', 'pendiente', 'cancelada'];
  const citasFiltradas = MOCK_AGENDA.filter(c =>
    filtroEstado === 'todos' || c.estado === filtroEstado
  );

  const confirmadas = MOCK_AGENDA.filter(c => c.estado === 'confirmada').length;
  const pendientes  = MOCK_AGENDA.filter(c => c.estado === 'pendiente').length;
  const canceladas  = MOCK_AGENDA.filter(c => c.estado === 'cancelada').length;

  return (
    <div>
      <SectionTitle sub="Clínica Dental Aurora (Demo) · Semana demo ficticia · Datos 100% ficticios">
        Agenda de citas
      </SectionTitle>

      {/* Selector semana */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {SEMANA_DEMO.map((dia, i) => (
          <button key={i} onClick={() => setDiaActivo(i)} style={{
            padding: '8px 16px', borderRadius: 8, flexShrink: 0,
            background: diaActivo === i ? ACCENT : '#fff',
            color: diaActivo === i ? '#fff' : '#64748b',
            border: diaActivo === i ? 'none' : '1px solid #e2e8f0',
            fontWeight: diaActivo === i ? 700 : 500, fontSize: 13, cursor: 'pointer',
          }}>{dia}</button>
        ))}
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Confirmadas', value: confirmadas, badge: 'teal' },
          { label: 'Pendientes',  value: pendientes,  badge: 'yellow' },
          { label: 'Canceladas',  value: canceladas,  badge: 'red' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            padding: '16px', textAlign: 'center',
          }}>
            <Badge color={s.badge}>{s.label}</Badge>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {estadosFiltro.map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)} style={{
            padding: '5px 12px', borderRadius: 20, border: 'none',
            background: filtroEstado === e ? ACCENT : '#f1f5f9',
            color: filtroEstado === e ? '#fff' : '#64748b',
            fontSize: 12, fontWeight: filtroEstado === e ? 700 : 500, cursor: 'pointer',
          }}>
            {e === 'todos' ? 'Todas' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {citasFiltradas.map(cita => (
          <Card key={cita.id} style={{ borderLeft: `3px solid ${ACCENT}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{cita.hora}</span>
                  <Badge color={ESTADO_BADGE[cita.estado] ?? 'gray'}>{cita.estado}</Badge>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{cita.duracion}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 3 }}>{cita.paciente}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  🔬 {cita.tratamiento} · 👨‍⚕️ {cita.profesional} · 📍 {cita.sede}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'center' }}>
        Agenda 100% ficticia · Prototipo Fábrica SaaS V1.5
      </p>
    </div>
  );
}
