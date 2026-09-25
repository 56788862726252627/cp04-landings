/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Profesionales V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { Card, Badge, SectionTitle } from '../../core/AppShell.jsx';

const ACCENT = "#0c7873";

const PROFESIONALES = [
  {
    "id": "prof-001",
    "nombre": "Dra. Martínez Ruiz (ficticio)",
    "especialidad": "Ortodoncia",
    "sede": "Aurora Centro (ficticio)",
    "pacientes_mes": 20,
    "proximas_citas": 8,
    "disponible": true
  },
  {
    "id": "prof-002",
    "nombre": "Dr. García Sánchez (ficticio)",
    "especialidad": "Implantes",
    "sede": "Aurora Norte (ficticio)",
    "pacientes_mes": 25,
    "proximas_citas": 10,
    "disponible": true
  },
  {
    "id": "prof-003",
    "nombre": "Dra. López Torres (ficticio)",
    "especialidad": "Endodoncia",
    "sede": "Aurora Centro (ficticio)",
    "pacientes_mes": 30,
    "proximas_citas": 12,
    "disponible": false
  }
];

function Avatar({ nombre, color: c = ACCENT }) {
  const initials = nombre
    .split(' ')
    .filter(w => w.length > 2 && !w.includes('('))
    .slice(0, 2)
    .map(w => w[0])
    .join('');
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', background: c,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
      boxShadow: `0 2px 8px ${c}55`,
    }}>{initials || '?'}</div>
  );
}

export function ClinicaDentalAuroraDemoProfesionales() {
  return (
    <div>
      <SectionTitle sub="Clínica Dental Aurora (Demo) · Equipo médico · Datos 100% ficticios">
        Nuestro equipo
      </SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {PROFESIONALES.map(pro => (
          <Card key={pro.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Avatar nombre={pro.nombre} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{pro.nombre}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{pro.especialidad ?? 'Odontología General'}</div>
                <div style={{ marginTop: 4 }}>
                  <Badge color={pro.disponible ? 'teal' : 'gray'} size="sm">
                    {pro.disponible ? '● Disponible' : '○ Ocupado'}
                  </Badge>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>📍 {pro.sede}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: ACCENT }}>{pro.pacientes_mes}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>pacientes/mes</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>{pro.proximas_citas}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>próximas citas</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 20, textAlign: 'center' }}>
        Equipo y estadísticas 100% ficticios · Prototipo Fábrica SaaS V1.5
      </p>
    </div>
  );
}
