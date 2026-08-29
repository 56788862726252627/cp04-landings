/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Tratamientos V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { Card, Badge, SectionTitle, PillTabs } from '../../core/AppShell.jsx';
import { MOCK_TRATAMIENTOS } from './ClinicaDentalAuroraDemoMockData.js';

const ACCENT = "#0c7873";

const CATEGORIAS = [
  { id: 'todos',      label: 'Todos',       icon: '🔬' },
  { id: 'General',    label: 'General',     icon: '🪥' },
  { id: 'Ortodoncia', label: 'Ortodoncia',  icon: '🦷' },
  { id: 'Implantes',  label: 'Implantes',   icon: '🔩' },
  { id: 'Estética',   label: 'Estética',    icon: '✨' },
  { id: 'Periodoncia',label: 'Periodoncia', icon: '🩺' },
];

export function ClinicaDentalAuroraDemoTratamientos() {
  const [cat, setCat] = useState('todos');

  const lista = cat === 'todos'
    ? MOCK_TRATAMIENTOS
    : MOCK_TRATAMIENTOS.filter(t => t.categoria === cat);

  return (
    <div>
      <SectionTitle sub="Clínica Dental Aurora (Demo) · Catálogo de tratamientos · Datos 100% ficticios">
        Tratamientos disponibles
      </SectionTitle>

      <PillTabs tabs={CATEGORIAS} active={cat} onChange={setCat} color={ACCENT} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {lista.map(t => (
          <Card key={t.id} style={{ position: 'relative' }}>
            {t.destacado && (
              <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <Badge color="teal" size="sm">Más solicitado</Badge>
              </div>
            )}
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icono}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>{t.nombre}</div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>{t.descripcion}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>⏱ {t.duracion}</span>
              <span style={{ fontSize: 12, color: ACCENT, fontWeight: 700 }}>Desde {t.precio_desde}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                flex: 1, padding: '8px', background: ACCENT, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Solicitar cita</button>
              <button style={{
                flex: 1, padding: '8px', background: '#f1f5f9', color: '#64748b',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Más info</button>
            </div>
          </Card>
        ))}
      </div>

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 20, textAlign: 'center' }}>
        Catálogo y precios 100% ficticios · Prototipo Fábrica SaaS V1.5
      </p>
    </div>
  );
}
