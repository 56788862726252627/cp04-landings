/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Presupuestos V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { Card, Badge, SectionTitle, Table } from '../../core/AppShell.jsx';
import { MOCK_PRESUPUESTOS } from './ClinicaDentalAuroraDemoMockData.js';

const ACCENT = "#0c7873";

const ESTADO_BADGE = {
  borrador:   'gray',
  enviado:    'yellow',
  aceptado:   'teal',
  completado: 'green',
};

const PIPELINE = ['borrador', 'enviado', 'aceptado', 'completado'];

export function ClinicaDentalAuroraDemoPresupuestos() {
  const [filtro, setFiltro] = useState('todos');

  const lista = filtro === 'todos'
    ? MOCK_PRESUPUESTOS
    : MOCK_PRESUPUESTOS.filter(p => p.estado === filtro);

  const totales = PIPELINE.reduce((acc, e) => {
    acc[e] = MOCK_PRESUPUESTOS.filter(p => p.estado === e).length;
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle sub="Clínica Dental Aurora (Demo) · Gestión de presupuestos · Datos 100% ficticios">
        Presupuestos
      </SectionTitle>

      {/* Pipeline */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {PIPELINE.map((estado, i) => (
          <button key={estado} onClick={() => setFiltro(filtro === estado ? 'todos' : estado)} style={{
            flex: 1, padding: '16px 8px', border: 'none', borderRight: i < PIPELINE.length - 1 ? '1px solid #e2e8f0' : 'none',
            background: filtro === estado ? ACCENT : '#fff',
            color: filtro === estado ? '#fff' : '#0f172a', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.12s',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{totales[estado] ?? 0}</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: filtro === estado ? 1 : 0.6, textTransform: 'capitalize' }}>{estado}</div>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        <Table
          headers={['Paciente', 'Tratamiento', 'Importe', 'Estado', 'Fecha', 'Profesional']}
          rows={lista.map(p => [
            p.paciente,
            p.tratamiento,
            <span style={{ fontWeight: 700, color: ACCENT }}>{p.importe}</span>,
            <Badge color={ESTADO_BADGE[p.estado] ?? 'gray'}>{p.estado}</Badge>,
            p.fecha,
            p.profesional,
          ])}
          emptyMsg="No hay presupuestos con este filtro"
        />
      </Card>

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'center' }}>
        Presupuestos e importes 100% ficticios · Prototipo Fábrica SaaS V1.5
      </p>
    </div>
  );
}
