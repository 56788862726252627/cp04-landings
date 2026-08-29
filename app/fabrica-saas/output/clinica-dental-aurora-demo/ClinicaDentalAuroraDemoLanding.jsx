/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Landing / Inicio V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { HeroSection, Card, Badge } from '../../core/AppShell.jsx';

const ACCENT = "#0c7873";

const SERVICIOS = [
  { icono: '🦷', nombre: 'Ortodoncia', desc: 'Brackets, alineadores invisibles y contención para todas las edades.' },
  { icono: '🔩', nombre: 'Implantes', desc: 'Implantes de titanio con coronas cerámicas. Garantía permanente.' },
  { icono: '✨', nombre: 'Blanqueamiento', desc: 'Blanqueamiento LED profesional en clínica. Resultados inmediatos.' },
  { icono: '💉', nombre: 'Endodoncia', desc: 'Tratamiento de conductos para salvar y proteger tu pieza dental.' },
  { icono: '🩺', nombre: 'Periodoncia', desc: 'Tratamiento de encías y tejidos de soporte. Prevención esencial.' },
  { icono: '🎨', nombre: 'Estética Dental', desc: 'Diseño de sonrisa, carillas y composites para lucir tu mejor versión.' },
];

const PASOS = [
  { num: '01', titulo: 'Reserva tu cita', desc: 'Elige el tratamiento, profesional y horario que mejor te conviene.' },
  { num: '02', titulo: 'Diagnóstico gratuito', desc: 'Evaluación completa con el especialista y plan de tratamiento personalizado.' },
  { num: '03', titulo: 'Tu nueva sonrisa', desc: 'Tratamiento con los materiales más avanzados y seguimiento garantizado.' },
];

const STATS = [
  { valor: '+2.800', label: 'Pacientes activos (ficticio)' },
  { valor: '12+', label: 'Especialidades (ficticio)' },
  { valor: '3', label: 'Sedes (ficticio)' },
  { valor: '15 años', label: 'De experiencia (ficticio)' },
];

export function ClinicaDentalAuroraDemoLanding() {
  return (
    <div>
      <HeroSection
        color={ACCENT}
        badge="🦷 Clínica Dental Aurora (Demo)"
        title="Salud dental de excelencia para toda la familia"
        subtitle="Más de 2.800 pacientes confían en nosotros. Primera visita de diagnóstico gratuita. Financiación sin intereses. · Datos ficticios"
        cta="Reservar cita gratis"
        ctaSecondary="Conocer más"
      />

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            padding: '20px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT }}>{s.valor}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Servicios */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
          Nuestros servicios <Badge color="teal">Ficticios</Badge>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {SERVICIOS.map((s, i) => (
            <Card key={i} style={{ cursor: 'default' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icono}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>{s.nombre}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ marginTop: 12 }}>
                <span style={{
                  fontSize: 12, color: ACCENT, fontWeight: 700, cursor: 'pointer',
                }}>Solicitar info →</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cómo funciona */}
      <Card title="¿Cómo funciona?" subtitle="En 3 pasos sencillos" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {PASOS.map((p, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: ACCENT,
                color: '#fff', fontWeight: 800, fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>{p.num}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>{p.titulo}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA final */}
      <div style={{
        background: ACCENT, borderRadius: 16, padding: '28px 36px', textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>¿Listo para empezar?</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>Primera visita de diagnóstico sin coste · Datos ficticios · Prototipo demo</div>
        <button style={{
          background: '#fff', color: ACCENT, border: 'none', padding: '12px 28px',
          borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>Reservar cita gratis</button>
      </div>
    </div>
  );
}
