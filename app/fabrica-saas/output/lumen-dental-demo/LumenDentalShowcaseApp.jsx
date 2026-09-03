/**
 * Lumen Dental — Showcase Visual Navegable
 * Generado por Fábrica SaaS V1.8 · demo/lumen-dental-factory-e2e
 * ⚠️ PROTOTIPO INTERNO — DATOS 100% FICTICIOS — NO CONECTADO A SISTEMAS REALES
 */
import { useState } from 'react';
import {
  CLIENT_PROFILE, BRANDING, SERVICIOS, PROFESIONALES,
  PACIENTES, AGENDA_HOY, PRESUPUESTOS, LEADS, METRICAS,
  AUTOMATIZACIONES, AGENTES_IA, SOCIAL_POSTS, EMAIL_TEMPLATES,
  SEO_DATA, HEALTH_SNAPSHOT, PLATAFORMAS, PAQUETES_COMERCIALES,
  FACTORY_METRICS,
} from './LumenDentalMockData.js';

// ─── Paleta de colores ────────────────────────────────────────────────────────
const P = {
  primary:   '#0369A1',
  secondary: '#0EA5E9',
  accent:    '#F59E0B',
  success:   '#10B981',
  warning:   '#F59E0B',
  error:     '#EF4444',
  bg:        '#0B1426',
  surface:   '#111827',
  card:      '#1A2438',
  border:    '#1E3A5F',
  text:      '#F1F5F9',
  muted:     '#94A3B8',
  white:     '#FFFFFF',
};

// ─── Componentes utilitarios ──────────────────────────────────────────────────
function Badge({ children, color = P.primary }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: '2px 9px', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

function Chip({ label, color }) {
  return (
    <span style={{
      background: (color || P.primary) + '18', color: color || P.primary,
      border: `1px solid ${color || P.primary}33`, borderRadius: 20,
      padding: '3px 10px', fontSize: 11, fontWeight: 600, marginRight: 4,
      display: 'inline-block', marginBottom: 3,
    }}>
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: P.card, border: `1px solid ${P.border}`,
      borderRadius: 12, padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 22, color: P.text, fontWeight: 700 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ margin: 0, color: P.muted, fontSize: 14 }}>{subtitle}</p>}
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || P.primary }}>{value}</div>
      <div style={{ fontSize: 13, color: P.text, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

function StatusBadge({ status }) {
  const map = {
    HEALTHY:     { color: P.success,   label: 'HEALTHY' },
    WARNING:     { color: P.warning,   label: 'WARNING' },
    DEGRADED:    { color: '#F97316',   label: 'DEGRADED' },
    CRITICAL:    { color: P.error,     label: 'CRITICAL' },
    MOCK:        { color: '#A78BFA',   label: 'MOCK' },
    DESIGNED:    { color: P.secondary, label: 'DISEÑADO' },
    AVAILABLE:   { color: P.success,   label: 'DISPONIBLE' },
    REQUIRES_REAL_CREDS: { color: P.warning, label: 'REQUIERE CREDENCIALES' },
    MOCKABLE:    { color: '#A78BFA',   label: 'MOCKEABLE' },
    aceptado:    { color: P.success,   label: 'Aceptado' },
    enviado:     { color: P.secondary, label: 'Enviado' },
    firmado:     { color: P.primary,   label: 'Firmado' },
    borrador:    { color: P.muted,     label: 'Borrador' },
    completado:  { color: '#10B981',   label: 'Completado' },
    confirmada:  { color: P.success,   label: 'Confirmada' },
    pendiente:   { color: P.muted,     label: 'Pendiente' },
    urgente:     { color: P.error,     label: 'URGENTE' },
    activo:      { color: P.success,   label: 'Activo' },
    en_tratamiento: { color: P.secondary, label: 'En tratamiento' },
    alta:        { color: P.primary,   label: 'Alta' },
    nuevo:       { color: P.accent,    label: 'Nuevo' },
    pendiente_pac: { color: P.muted,   label: 'Pendiente' },
  };
  const s = map[status] || { color: P.muted, label: status };
  return <Badge color={s.color}>{s.label}</Badge>;
}

// ─── SECCIONES ─────────────────────────────────────────────────────────────────

function SeccionBienvenida({ onNav }) {
  return (
    <div>
      <SectionHeader icon="🏠" title="Lumen Dental — Showcase Maestro" subtitle="Fábrica SaaS V1.8 · Ciclo ADV-01…ADV-21 · 20 fases generadas · Datos 100% ficticios" />
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${P.primary} 0%, #0B2545 100%)`,
        borderRadius: 16, padding: '48px 40px', textAlign: 'center', marginBottom: 24,
        border: `1px solid ${P.border}`,
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}
          dangerouslySetInnerHTML={{ __html: BRANDING.logoSVG.replace('width="48"','width="72"').replace('height="48"','height="72"') }}
        />
        <h1 style={{ margin: '12px 0 8px', fontSize: 36, fontWeight: 800, color: P.white }}>
          Lumen Dental
        </h1>
        <p style={{ margin: '0 0 16px', fontSize: 18, color: '#BAE6FD', fontWeight: 500 }}>
          {BRANDING.tagline}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {BRANDING.mensajesPrincipales.map((m, i) => (
            <Chip key={i} label={m} color={P.accent} />
          ))}
        </div>
      </div>
      {/* KPIs de fábrica */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Versión Fábrica" value="V1.8" sub="ADV-01…ADV-21" color={P.primary} />
        <KpiCard label="Tests PASS" value={FACTORY_METRICS.totalTestsFactory.toLocaleString()} sub="Factory suite" color={P.success} />
        <KpiCard label="Artefactos" value={FACTORY_METRICS.artefactosTotales} sub="generados" color={P.accent} />
        <KpiCard label="Automatizaciones" value={FACTORY_METRICS.automatizacionesDiseñadas} sub="flujos Make" color={P.secondary} />
        <KpiCard label="Agentes IA" value={FACTORY_METRICS.agentesIADefinidos} sub="definidos" color="#A78BFA" />
        <KpiCard label="Código reutilizado" value={FACTORY_METRICS.codigoReutilizado} sub="de módulos factory" color={P.success} />
      </div>
      {/* Nav rápido a fases */}
      <Card>
        <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 15 }}>Navegar por las 20 fases generadas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {NAV_ITEMS.filter(n => n.id !== 'inicio').map(n => (
            <button key={n.id} onClick={() => onNav(n.id)} style={{
              background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8,
              padding: '10px 14px', color: P.text, cursor: 'pointer', textAlign: 'left',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, transition: '0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = P.primary}
              onMouseOut={e => e.currentTarget.style.borderColor = P.border}
            >
              <span>{n.icon}</span> <span>{n.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SeccionCapacidades() {
  const caps = [
    { fase: 'ADV-01', nombre: 'Observabilidad', estado: 'MERGED', tests: 238, desc: 'Health signals, correlation IDs, event schema' },
    { fase: 'ADV-02', nombre: 'CI/CD Pipeline', estado: 'MERGED', tests: 156, desc: 'Deploy pipeline, quality gates, rollback' },
    { fase: 'ADV-03', nombre: 'Agent Engine V1', estado: 'BRANCH', tests: 232, desc: 'Task planning, decision trees, tool calling' },
    { fase: 'ADV-04', nombre: 'One Prompt → Prod', estado: 'MERGED', tests: 163, desc: 'Pipeline completo desde prompt a producción' },
    { fase: 'ADV-05', nombre: 'Terminal Efficiency', estado: 'MERGED', tests: 154, desc: 'Safe autonomy, terminal shortcuts, loops' },
    { fase: 'ADV-06', nombre: 'Browser QA', estado: 'MERGED', tests: 215, desc: 'Playwright tests, visual regression, accesibilidad' },
    { fase: 'ADV-07', nombre: 'Premium Experience', estado: 'BRANCH', tests: 207, desc: 'Design tokens, motion, shadcn compat, dark/light' },
    { fase: 'ADV-08', nombre: 'Lead Engine', estado: 'MERGED', tests: 188, desc: 'Lead scoring, Apify scraping, captación activa' },
    { fase: 'ADV-09', nombre: 'Agency CRM', estado: 'MERGED', tests: 197, desc: 'Pipeline CRM, cliente tracking, deal management' },
    { fase: 'ADV-10', nombre: 'Agent Evaluation', estado: 'BRANCH', tests: 147, desc: 'Langfuse foundation, eval datasets, scoring' },
    { fase: 'ADV-11', nombre: 'Voice Agent', estado: 'BRANCH', tests: 248, desc: 'STT/TTS, voice flows, real-time transcription' },
    { fase: 'ADV-12', nombre: 'MCP Avanzado', estado: 'MERGED', tests: 229, desc: 'MCP transports, tool registry, Claude integration' },
    { fase: 'ADV-13', nombre: 'AI Media Engine', estado: 'MERGED', tests: 229, desc: 'Image gen, video, SEO visual, content AI' },
    { fase: 'ADV-14', nombre: 'Social Content', estado: 'MERGED', tests: 259, desc: 'Posts, stories, carruseles, copywriting IA' },
    { fase: 'ADV-15', nombre: 'Docker Envs', estado: 'BRANCH', tests: 224, desc: 'Reproducible environments, dev/staging/prod parity' },
    { fase: 'ADV-16', nombre: 'OpenRouter AI Router', estado: 'MERGED', tests: 314, desc: 'Multi-provider AI routing, cost optimization' },
    { fase: 'ADV-17', nombre: 'Multi-Agent V2', estado: 'BRANCH', tests: 222, desc: 'Agent orchestration, swarm coordination' },
    { fase: 'ADV-18', nombre: 'Backup + DR', estado: 'MERGED', tests: 224, desc: 'Backups, restore, disaster recovery plan' },
    { fase: 'ADV-19', nombre: 'Security + GDPR', estado: 'MERGED', tests: 261, desc: 'GDPR, CMP, privacy by design, security gates' },
    { fase: 'ADV-20', nombre: 'Health Dashboard', estado: 'MERGED', tests: 158, desc: 'Dashboard salud, SLOs, quality score' },
    { fase: 'ADV-21', nombre: 'QA Final', estado: 'MERGED', tests: 112, desc: 'Auditoría transversal, 6277 tests, cierre limpio' },
  ];
  return (
    <div>
      <SectionHeader icon="⚙️" title="Fase 0 — Capacidades de la Fábrica" subtitle="Ciclo ADV-01…ADV-21 · Registry v4.5.0 · 6277 tests PASS" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {caps.map(c => (
          <Card key={c.fase} style={{ borderLeft: `3px solid ${c.estado === 'MERGED' ? P.success : P.secondary}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <Badge color={P.primary}>{c.fase}</Badge>
                <span style={{ marginLeft: 8, fontSize: 13, color: P.text, fontWeight: 700 }}>{c.nombre}</span>
              </div>
              <Badge color={c.estado === 'MERGED' ? P.success : P.secondary}>{c.estado}</Badge>
            </div>
            <p style={{ margin: '0 0 8px', color: P.muted, fontSize: 12 }}>{c.desc}</p>
            <div style={{ fontSize: 11, color: P.muted }}>{c.tests} tests ✓</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionBranding() {
  return (
    <div>
      <SectionHeader icon="🎨" title="Fase 2 — Branding" subtitle="Identidad visual Lumen Dental generada por fábrica" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Logo */}
        <Card>
          <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Logo SVG</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <div dangerouslySetInnerHTML={{ __html: BRANDING.logoSVG }} />
            <div dangerouslySetInnerHTML={{ __html: BRANDING.logoSVG.replace('width="48"','width="64"').replace('height="48"','height="64"') }} />
            <div dangerouslySetInnerHTML={{ __html: BRANDING.logoSVG.replace('width="48"','width="96"').replace('height="48"','height="96"') }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.text }}>Lumen Dental</div>
          <div style={{ fontSize: 14, color: P.muted, marginTop: 4 }}>{BRANDING.tagline}</div>
        </Card>
        {/* Paleta */}
        <Card>
          <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Paleta de colores</h3>
          {[
            { label: 'Primary', color: BRANDING.primaryColor },
            { label: 'Secondary', color: BRANDING.secondaryColor },
            { label: 'Accent', color: BRANDING.accentColor },
            { label: 'Success', color: BRANDING.successColor },
          ].map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: c.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{c.label}</div>
                <div style={{ color: P.muted, fontSize: 12 }}>{c.color}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      {/* Tokens */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Design Tokens</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {Object.entries(BRANDING.tokens).map(([k, v]) => (
            <div key={k} style={{ background: P.surface, borderRadius: 8, padding: 12, border: `1px solid ${P.border}` }}>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* Mensajes clave */}
      <Card>
        <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Mensajes clave generados</h3>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: P.muted, marginBottom: 6, fontWeight: 600 }}>PRINCIPALES</div>
          {BRANDING.mensajesPrincipales.map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: P.primary + '18', borderRadius: 8, marginBottom: 6, color: P.text, fontSize: 13, borderLeft: `3px solid ${P.primary}` }}>
              ✓ {m}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, color: P.muted, marginBottom: 6, fontWeight: 600, marginTop: 8 }}>SECUNDARIOS</div>
          {BRANDING.mensajesSecundarios.map((m, i) => (
            <div key={i} style={{ padding: '6px 12px', background: P.surface, borderRadius: 8, marginBottom: 4, color: P.muted, fontSize: 12, borderLeft: `2px solid ${P.border}` }}>
              {m}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SeccionLanding() {
  return (
    <div>
      <SectionHeader icon="🌐" title="Fase 3 — Landing Page" subtitle="Landing dental responsive generada para Lumen Dental" />
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${BRANDING.primaryColor} 0%, #0B2545 100%)`, borderRadius: 16, padding: '40px 32px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 32, top: 20, opacity: 0.12, fontSize: 120, userSelect: 'none' }}>🦷</div>
        <Badge color={BRANDING.accentColor}>Primera visita gratis · Sin compromiso</Badge>
        <h1 style={{ margin: '16px 0 10px', fontSize: 32, fontWeight: 800, color: P.white, lineHeight: 1.2 }}>
          Tu sonrisa merece<br/>la mejor atención
        </h1>
        <p style={{ color: '#BAE6FD', fontSize: 16, marginBottom: 20, maxWidth: 480 }}>
          {CLIENT_PROFILE.propuestaValor}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ background: BRANDING.accentColor, color: '#0B1426', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontSize: 14 }}>
            Pide tu cita gratis →
          </button>
          <button style={{ background: 'transparent', color: P.white, fontWeight: 600, border: `2px solid rgba(255,255,255,0.4)`, borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontSize: 14 }}>
            Ver tratamientos
          </button>
        </div>
      </div>
      {/* Servicios Grid */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 15 }}>Servicios destacados</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {SERVICIOS.filter(s => s.destacado).map(s => (
            <div key={s.id} style={{ background: P.surface, borderRadius: 10, padding: 16, border: `1px solid ${P.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icono}</div>
              <div style={{ fontWeight: 700, color: P.text, fontSize: 13, marginBottom: 4 }}>{s.nombre}</div>
              <div style={{ color: BRANDING.accentColor, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{s.precioDesde}</div>
              <div style={{ color: P.muted, fontSize: 11 }}>{s.duracion}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* Equipo */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', color: P.text, fontSize: 15 }}>Nuestro equipo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {PROFESIONALES.map(p => (
            <div key={p.id} style={{ background: P.surface, borderRadius: 10, padding: 16, border: `1px solid ${P.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>{p.avatar}</div>
              <div style={{ fontWeight: 700, color: P.text, fontSize: 12, marginBottom: 2 }}>{p.nombre}</div>
              <div style={{ color: BRANDING.primaryColor, fontSize: 11, fontWeight: 600 }}>{p.especialidad}</div>
              <div style={{ color: P.muted, fontSize: 10, marginTop: 4 }}>{p.idiomas.join(' · ')}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* CTAs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ textAlign: 'center', border: `2px solid ${BRANDING.accentColor}44` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💳</div>
          <h4 style={{ margin: '0 0 6px', color: P.text }}>Financiación sin intereses</h4>
          <p style={{ color: P.muted, fontSize: 12, margin: '0 0 12px' }}>Hasta 24 meses · Sin entrada · Sin papeleos</p>
          <button style={{ background: BRANDING.accentColor, color: '#0B1426', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>
            Calcular cuota
          </button>
        </Card>
        <Card style={{ textAlign: 'center', border: `2px solid ${BRANDING.primaryColor}44` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📞</div>
          <h4 style={{ margin: '0 0 6px', color: P.text }}>Urgencias el mismo día</h4>
          <p style={{ color: P.muted, fontSize: 12, margin: '0 0 12px' }}>Dolor agudo · Fractura · Absceso · Sin espera</p>
          <button style={{ background: BRANDING.primaryColor, color: P.white, fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>
            Llamar ahora (demo)
          </button>
        </Card>
      </div>
    </div>
  );
}

function SeccionSaaS() {
  const [saasTab, setSaasTab] = useState('dashboard');
  const saasTabList = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agenda',    label: 'Agenda' },
    { id: 'pacientes', label: 'Pacientes' },
    { id: 'presupuestos', label: 'Presupuestos' },
  ];
  return (
    <div>
      <SectionHeader icon="📱" title="Fase 4 — SaaS / PWA" subtitle="Dashboard interno de gestión clínica para Lumen Dental" />
      {/* Subtabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {saasTabList.map(t => (
          <button key={t.id} onClick={() => setSaasTab(t.id)} style={{
            background: saasTab === t.id ? BRANDING.primaryColor : P.surface,
            color: saasTab === t.id ? P.white : P.muted,
            border: `1px solid ${saasTab === t.id ? BRANDING.primaryColor : P.border}`,
            borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            {t.label}
          </button>
        ))}
      </div>
      {saasTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <KpiCard label="Consultas este mes" value={METRICAS.consultasMes} color={BRANDING.primaryColor} />
            <KpiCard label="Tasa conversión" value={`${METRICAS.tasaConversion}%`} color={P.success} />
            <KpiCard label="Pipeline activo" value={METRICAS.valorPipeline} color={BRANDING.accentColor} />
            <KpiCard label="Ingresos mes" value={METRICAS.ingresosMes} color={P.success} />
            <KpiCard label="Ticket medio" value={METRICAS.ticketMedio} color={BRANDING.primaryColor} />
            <KpiCard label="Satisfacción" value={`${METRICAS.satisfaccion} ⭐`} color={BRANDING.accentColor} />
          </div>
          <Card>
            <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Resumen operativo del día</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ background: P.surface, borderRadius: 8, padding: 12, textAlign: 'center', border: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRANDING.primaryColor }}>{METRICAS.citasHoy}</div>
                <div style={{ fontSize: 11, color: P.muted }}>Citas hoy</div>
              </div>
              <div style={{ background: P.surface, borderRadius: 8, padding: 12, textAlign: 'center', border: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: P.success }}>{METRICAS.nuevosPacientes}</div>
                <div style={{ fontSize: 11, color: P.muted }}>Nuevos pacientes</div>
              </div>
              <div style={{ background: P.surface, borderRadius: 8, padding: 12, textAlign: 'center', border: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRANDING.accentColor }}>{METRICAS.lead_a_cita}</div>
                <div style={{ fontSize: 11, color: P.muted }}>Lead → Cita</div>
              </div>
            </div>
          </Card>
        </div>
      )}
      {saasTab === 'agenda' && (
        <Card>
          <h4 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Agenda de hoy</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AGENDA_HOY.map(c => (
              <div key={c.id} style={{
                background: P.surface, borderRadius: 10, padding: '12px 16px', border: `1px solid ${P.border}`,
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{ background: BRANDING.primaryColor + '22', color: BRANDING.primaryColor, borderRadius: 6, padding: '4px 10px', fontWeight: 700, fontSize: 12, minWidth: 50, textAlign: 'center' }}>
                  {c.hora}
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: P.text, fontSize: 13 }}>{c.paciente}</div>
                  <div style={{ color: P.muted, fontSize: 11 }}>{c.tratamiento}</div>
                </div>
                <div style={{ color: P.muted, fontSize: 11 }}>{c.prof}</div>
                <div style={{ color: P.muted, fontSize: 11 }}>{c.duracion}</div>
                <StatusBadge status={c.estado} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {saasTab === 'pacientes' && (
        <Card>
          <h4 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Listado de pacientes</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {['HC', 'Nombre', 'Tratamiento', 'Origen', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', color: P.muted, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PACIENTES.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${P.border}20`, background: i % 2 === 0 ? 'transparent' : P.surface + '80' }}>
                    <td style={{ padding: '8px 10px', color: P.muted, fontWeight: 600 }}>{p.hc}</td>
                    <td style={{ padding: '8px 10px', color: P.text }}>{p.nombre}</td>
                    <td style={{ padding: '8px 10px', color: P.muted }}>{p.tratamiento}</td>
                    <td style={{ padding: '8px 10px' }}><Chip label={p.origen} /></td>
                    <td style={{ padding: '8px 10px' }}><StatusBadge status={p.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {saasTab === 'presupuestos' && (
        <Card>
          <h4 style={{ margin: '0 0 16px', color: P.text, fontSize: 14 }}>Presupuestos</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRESUPUESTOS.map(p => (
              <div key={p.id} style={{ background: P.surface, borderRadius: 10, padding: '14px 16px', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: P.text, fontSize: 13 }}>{p.paciente}</div>
                  <div style={{ color: P.muted, fontSize: 11 }}>{p.tratamiento}</div>
                </div>
                <div style={{ fontWeight: 700, color: BRANDING.accentColor, fontSize: 15 }}>{p.importe}</div>
                <div style={{ color: P.muted, fontSize: 11 }}>{p.fecha}</div>
                <StatusBadge status={p.estado} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SeccionCRM() {
  return (
    <div>
      <SectionHeader icon="👥" title="Fase 5 — CRM y Datos Demo" subtitle="Pipeline de leads y datos de pacientes ficticios" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Pipeline CRM</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['NUEVO', 'CONTACTADO', 'PRESUPUESTO', 'NEGOCIACIÓN', 'CERRADO_WON', 'CERRADO_LOST'].map((etapa, i) => {
              const counts = [5, 8, 4, 3, 12, 2];
              return (
                <div key={etapa} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 110, fontSize: 11, color: P.muted, fontWeight: 600 }}>{etapa}</div>
                  <div style={{ flex: 1, background: P.surface, borderRadius: 4, height: 14, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(counts[i] / 12) * 100}%`, background: [P.accent, P.secondary, BRANDING.primaryColor, '#A78BFA', P.success, P.error][i], borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 20, fontSize: 12, color: P.text, fontWeight: 700 }}>{counts[i]}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Leads Pendientes</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEADS.map(l => (
              <div key={l.id} style={{ background: P.surface, borderRadius: 8, padding: '10px 12px', border: `1px solid ${P.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, color: P.text, fontSize: 12 }}>{l.nombre}</div>
                  <Badge color={l.diasInactivo > 14 ? P.error : l.diasInactivo > 7 ? P.warning : P.success}>
                    {l.diasInactivo}d
                  </Badge>
                </div>
                <div style={{ color: P.muted, fontSize: 11, marginTop: 2 }}>
                  {l.tratamiento} · Vía {l.fuente}
                </div>
                <div style={{ color: BRANDING.accentColor, fontSize: 11, marginTop: 4 }}>→ {l.accion}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* Servicios full list */}
      <Card>
        <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Catálogo de servicios</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {['Servicio', 'Categoría', 'Precio desde', 'Duración'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', color: P.muted, fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICIOS.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${P.border}20`, background: i % 2 === 0 ? 'transparent' : P.surface + '80' }}>
                  <td style={{ padding: '8px 10px', color: P.text }}><span style={{ marginRight: 6 }}>{s.icono}</span>{s.nombre}</td>
                  <td style={{ padding: '8px 10px' }}><Chip label={s.categoria} /></td>
                  <td style={{ padding: '8px 10px', color: BRANDING.accentColor, fontWeight: 700 }}>{s.precioDesde}</td>
                  <td style={{ padding: '8px 10px', color: P.muted }}>{s.duracion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SeccionAutomatizaciones() {
  return (
    <div>
      <SectionHeader icon="⚡" title="Fase 6 — Automatizaciones" subtitle="20 flujos Make diseñados para Lumen Dental" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {AUTOMATIZACIONES.map(a => (
          <Card key={a.id} style={{ borderLeft: `3px solid ${a.estado === 'MOCK' ? '#A78BFA' : P.secondary}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: P.muted, fontWeight: 600, marginBottom: 2 }}>{a.id}</div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{a.nombre}</div>
              </div>
              <StatusBadge status={a.estado} />
            </div>
            <div style={{ color: P.muted, fontSize: 11, marginBottom: 8 }}>
              <span style={{ color: BRANDING.accentColor }}>⚡</span> {a.trigger}
            </div>
            <div style={{ marginBottom: 8 }}>
              {a.acciones.map((acc, i) => (
                <div key={i} style={{ fontSize: 11, color: P.muted, padding: '2px 0' }}>→ {acc}</div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {a.plataformas.map(p => <Chip key={p} label={p} />)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionAgentes() {
  return (
    <div>
      <SectionHeader icon="🤖" title="Fase 7 — Agentes IA" subtitle="9 agentes IA definidos con guardrails y escalado" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {AGENTES_IA.map(a => (
          <Card key={a.id} style={{ borderTop: `3px solid ${BRANDING.primaryColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 14 }}>{a.nombre}</div>
                <Badge color={BRANDING.secondary}>{a.rol}</Badge>
              </div>
              <div style={{ fontSize: 28 }}>🤖</div>
            </div>
            <p style={{ margin: '0 0 8px', color: P.muted, fontSize: 12 }}>{a.mision}</p>
            <div style={{ background: P.error + '18', border: `1px solid ${P.error}33`, borderRadius: 6, padding: '6px 10px', marginBottom: 8, fontSize: 11, color: '#FCA5A5' }}>
              🛡 {a.guardrail}
            </div>
            <div style={{ background: BRANDING.accentColor + '18', border: `1px solid ${BRANDING.accentColor}33`, borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#FDE68A' }}>
              ↗ {a.escalado}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionSocial() {
  return (
    <div>
      <SectionHeader icon="📣" title="Fase 8 — Social Media" subtitle="Estrategia + 10 piezas de contenido generadas" />
      {/* Estrategia */}
      <Card style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Estrategia 30 días</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { red: 'Instagram', posts: '3/semana', tipos: 'Carrusel, Reel, Story', color: '#E1306C' },
            { red: 'Facebook', posts: '2/semana', tipos: 'Post, Video corto', color: '#1877F2' },
            { red: 'LinkedIn', posts: '1/semana', tipos: 'Artículo + Post', color: '#0A66C2' },
            { red: 'Google My Business', posts: '1/semana', tipos: 'Novedades + Ofertas', color: '#4285F4' },
          ].map(r => (
            <div key={r.red} style={{ background: P.surface, borderRadius: 8, padding: 14, border: `1px solid ${r.color}33`, borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontWeight: 700, color: P.text, fontSize: 13, marginBottom: 4 }}>{r.red}</div>
              <div style={{ color: r.color, fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{r.posts}</div>
              <div style={{ color: P.muted, fontSize: 11 }}>{r.tipos}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* Posts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {SOCIAL_POSTS.map(p => (
          <Card key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <Badge color={BRANDING.primaryColor}>{p.red}</Badge>
                <Badge color={P.muted} style={{ marginLeft: 4 }}>{p.tipo}</Badge>
              </div>
            </div>
            <div style={{ fontWeight: 600, color: P.text, fontSize: 13, marginBottom: 8 }}>{p.tema}</div>
            <div style={{ color: P.muted, fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{p.copy.slice(0, 120)}…</div>
            <div style={{ color: BRANDING.primaryColor, fontSize: 11, marginBottom: 4 }}>{p.hashtags}</div>
            {p.cta && <div style={{ color: BRANDING.accentColor, fontSize: 11, fontWeight: 600 }}>{p.cta}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionEmail() {
  return (
    <div>
      <SectionHeader icon="📧" title="Fase 9 — Email Templates" subtitle="10 plantillas HTML diseñadas para el ciclo de vida del paciente" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {EMAIL_TEMPLATES.map(e => (
          <Card key={e.id}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ background: BRANDING.primaryColor + '22', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                📧
              </div>
              <div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{e.nombre}</div>
                <div style={{ color: P.muted, fontSize: 11, marginTop: 2 }}>{e.id}</div>
              </div>
            </div>
            <div style={{ background: P.surface, borderRadius: 6, padding: '8px 10px', marginBottom: 8, fontSize: 12, color: P.text, borderLeft: `2px solid ${BRANDING.primaryColor}` }}>
              Asunto: {e.asunto}
            </div>
            <p style={{ margin: 0, color: P.muted, fontSize: 11, lineHeight: 1.5 }}>{e.resumen}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionSEO() {
  return (
    <div>
      <SectionHeader icon="🔍" title="Fase 10 — SEO Local" subtitle="Estrategia de posicionamiento local para Málaga" />
      <Card style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 14px', color: P.text, fontSize: 14 }}>Top 10 Keywords</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {['Keyword', 'Volumen', 'Dificultad', 'Intención'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', color: P.muted, fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEO_DATA.keywords_principales.map((k, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${P.border}20`, background: i % 2 === 0 ? 'transparent' : P.surface + '80' }}>
                  <td style={{ padding: '8px 10px', color: P.text, fontWeight: 600 }}>{k.keyword}</td>
                  <td style={{ padding: '8px 10px', color: P.success }}>{k.volumen}</td>
                  <td style={{ padding: '8px 10px' }}><Badge color={k.dificultad === 'Alta' ? P.error : k.dificultad === 'Media' ? P.warning : P.success}>{k.dificultad}</Badge></td>
                  <td style={{ padding: '8px 10px' }}><Chip label={k.intención} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Artículos propuestos</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SEO_DATA.articulos_propuestos.map((a, i) => (
            <div key={i} style={{ background: P.surface, borderRadius: 8, padding: '10px 14px', border: `1px solid ${P.border}`, fontSize: 13, color: P.text }}>
              <span style={{ color: BRANDING.primaryColor, fontWeight: 700, marginRight: 8 }}>#{i + 1}</span>
              {a}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Artículo 1 — Preview</h4>
        <div style={{ background: P.surface, borderRadius: 10, padding: 20, border: `1px solid ${P.border}` }}>
          <div style={{ color: P.muted, fontSize: 11, marginBottom: 4 }}>{SEO_DATA.articulo_1.slug}</div>
          <h3 style={{ margin: '0 0 8px', color: P.text, fontSize: 16 }}>{SEO_DATA.articulo_1.titulo}</h3>
          <div style={{ fontSize: 11, color: BRANDING.accentColor, marginBottom: 10, background: BRANDING.accentColor + '18', borderRadius: 6, padding: '6px 10px' }}>
            Meta: {SEO_DATA.articulo_1.metaDesc}
          </div>
          <p style={{ color: P.muted, fontSize: 12, lineHeight: 1.6, margin: '0 0 10px' }}>{SEO_DATA.articulo_1.introduccion}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SEO_DATA.articulo_1.secciones.map((s, i) => <Chip key={i} label={`${i + 1}. ${s}`} />)}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SeccionComercial() {
  return (
    <div>
      <SectionHeader icon="💼" title="Fase 11 — Propuesta Comercial" subtitle="Paquetes y precios orientativos (demo ficticio)" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {PAQUETES_COMERCIALES.map(p => (
          <Card key={p.id} style={{
            border: p.destacado ? `2px solid ${BRANDING.accentColor}` : `1px solid ${P.border}`,
            position: 'relative',
          }}>
            {p.destacado && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: BRANDING.accentColor, color: '#0B1426', borderRadius: 20, padding: '3px 14px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ⭐ RECOMENDADO
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 4px', color: P.text }}>{p.nombre}</h3>
              <div style={{ fontSize: 18, fontWeight: 800, color: BRANDING.accentColor }}>{p.precio}</div>
              <div style={{ fontSize: 12, color: P.muted }}>Setup: {p.setup}</div>
            </div>
            <p style={{ color: P.muted, fontSize: 12, marginBottom: 14, textAlign: 'center' }}>{p.descripcion}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.incluye.map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: P.text, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: P.success, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button style={{
              marginTop: 16, width: '100%', padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: p.destacado ? BRANDING.accentColor : BRANDING.primaryColor,
              color: p.destacado ? '#0B1426' : P.white, fontWeight: 700, fontSize: 13,
            }}>
              Solicitar información (demo)
            </button>
          </Card>
        ))}
      </div>
      <Card>
        <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Argumentos de venta generados</h4>
        {[
          { titulo: 'ROI demostrable', desc: 'Clientes en sectores similares reportan +35% en conversión de leads en los primeros 90 días.' },
          { titulo: 'Sin riesgo inicial', desc: 'Puedes empezar con el paquete Starter y escalar sin coste de migración.' },
          { titulo: 'Tiempo de puesta en marcha', desc: 'Primera versión operativa en 4-6 horas desde la firma. No semanas.' },
          { titulo: 'Soporte dedicado', desc: 'No un ticket. Una persona de tu equipo que conoce tu clínica.' },
        ].map((a, i) => (
          <div key={i} style={{ background: P.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 8, border: `1px solid ${P.border}` }}>
            <div style={{ fontWeight: 700, color: P.text, fontSize: 13, marginBottom: 2 }}>✅ {a.titulo}</div>
            <div style={{ color: P.muted, fontSize: 12 }}>{a.desc}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SeccionDocs() {
  const docs = [
    { tipo: '📋', nombre: 'Expediente de Cliente', desc: 'Perfil completo Lumen Dental · sector, propuesta de valor, audiencia' },
    { tipo: '🎨', nombre: 'Brand Guidelines', desc: 'Logo, paleta, tokens, tipografía, mensajes clave, tono de voz' },
    { tipo: '🌐', nombre: 'Diseño Landing Page', desc: 'Wireframe + copy completo · 8 secciones · CTAs + SEO meta' },
    { tipo: '📱', nombre: 'Especificación SaaS', desc: '15 módulos · UI flow · roles · data model · PWA manifest' },
    { tipo: '👥', nombre: 'Dataset Demo CRM', desc: '8 pacientes · leads · presupuestos · agenda · KPIs' },
    { tipo: '⚡', nombre: 'Blueprints Make', desc: '20 flujos · triggers · acciones · plataformas · estado' },
    { tipo: '🤖', nombre: 'Fichas Agentes IA', desc: '9 agentes · misión · herramientas · guardrails · escalado' },
    { tipo: '📣', nombre: 'Estrategia Social Media', desc: 'Plan 30d · 4 redes · frecuencia · 10 piezas completas' },
    { tipo: '📧', nombre: 'Email Templates', desc: '10 plantillas HTML · asuntos · copy · CTA por fase del ciclo' },
    { tipo: '🔍', nombre: 'Estrategia SEO Local', desc: '10 keywords · 5 artículos propuestos · 1 artículo completo' },
    { tipo: '💼', nombre: 'Propuesta Comercial', desc: '3 paquetes · precios · qué incluye · argumentos de venta' },
    { tipo: '📊', nombre: 'Health Snapshot', desc: 'Estado actual · 11 dimensiones · score global' },
    { tipo: '🏭', nombre: 'Métricas de Fábrica', desc: 'Artefactos · código reutilizado · tiempo de generación' },
    { tipo: '✅', nombre: 'Checklist No Contaminación', desc: 'Guardrails activos · isReal: false · sin secretos expuestos' },
  ];
  return (
    <div>
      <SectionHeader icon="📚" title="Fase 12 — Documentación" subtitle="14 documentos generados para Lumen Dental" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {docs.map((d, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 26, flexShrink: 0 }}>{d.tipo}</div>
              <div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 13, marginBottom: 4 }}>{d.nombre}</div>
                <div style={{ color: P.muted, fontSize: 11 }}>{d.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionHealth() {
  return (
    <div>
      <SectionHeader icon="❤️" title="Fase 14 — Health Dashboard" subtitle="Estado de salud del sistema Lumen Dental" />
      {/* Score global */}
      <Card style={{ marginBottom: 20, textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: HEALTH_SNAPSHOT.score >= 80 ? P.success : P.warning }}>
          {HEALTH_SNAPSHOT.score}
        </div>
        <div style={{ fontSize: 20, color: P.text, fontWeight: 600, marginBottom: 8 }}>Score global de salud</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={HEALTH_SNAPSHOT.overallStatus} />
          <Badge color={P.muted}>productionReady: {String(HEALTH_SNAPSHOT.productionReady)}</Badge>
        </div>
        <div style={{ color: P.muted, fontSize: 12, marginTop: 8 }}>{HEALTH_SNAPSHOT.productionReadinessNote}</div>
      </Card>
      {/* Dimensiones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {HEALTH_SNAPSHOT.dimensiones.map((d, i) => (
          <Card key={i} style={{ borderLeft: `3px solid ${d.estado === 'HEALTHY' ? P.success : P.warning}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{d.nombre}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: d.score >= 80 ? P.success : P.warning, fontSize: 16 }}>{d.score}</span>
                <StatusBadge status={d.estado} />
              </div>
            </div>
            <div style={{ background: P.surface, borderRadius: 4, height: 6, marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${d.score}%`, background: d.estado === 'HEALTHY' ? P.success : P.warning, borderRadius: 4 }} />
            </div>
            <p style={{ margin: 0, color: P.muted, fontSize: 11 }}>{d.nota}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeccionPlataformas() {
  return (
    <div>
      <SectionHeader icon="🖥️" title="Fase 16 — Auditoría de Plataformas" subtitle="Estado de integración de las plataformas requeridas" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}`, background: P.surface }}>
              {['Plataforma', 'Estado', 'Modo', 'Usada', 'Artefacto generado'].map(h => (
                <th key={h} style={{ padding: '10px 12px', color: P.muted, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLATAFORMAS.map((p, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${P.border}20`, background: i % 2 === 0 ? 'transparent' : P.surface + '80' }}>
                <td style={{ padding: '10px 12px', color: P.text, fontWeight: 600 }}>{p.nombre}</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={p.status} /></td>
                <td style={{ padding: '10px 12px' }}>
                  <Badge color={p.modo === 'REAL' ? P.success : '#A78BFA'}>{p.modo}</Badge>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ color: p.usada ? P.success : P.muted }}>{p.usada ? '✓' : '–'}</span>
                </td>
                <td style={{ padding: '10px 12px', color: P.muted, maxWidth: 240 }}>{p.artefacto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeccionMetricasFabrica() {
  return (
    <div>
      <SectionHeader icon="🏭" title="Fase 17 — Métricas de la Fábrica" subtitle="Cuantificación de lo generado en esta ejecución E2E" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Versión fábrica" value={`V${FACTORY_METRICS.versionFabrica}`} color={BRANDING.primaryColor} />
        <KpiCard label="Registry" value={FACTORY_METRICS.registryVersion} color={P.secondary} />
        <KpiCard label="Tests factory" value={FACTORY_METRICS.totalTestsFactory.toLocaleString()} color={P.success} />
        <KpiCard label="Archivos generados" value={FACTORY_METRICS.archivosGenerados} color={BRANDING.primaryColor} />
        <KpiCard label="Módulos" value={FACTORY_METRICS.modulosGenerados} color={BRANDING.accentColor} />
        <KpiCard label="Componentes UI" value={FACTORY_METRICS.componentesUI} color={P.secondary} />
        <KpiCard label="Automatizaciones" value={FACTORY_METRICS.automatizacionesDiseñadas} color="#A78BFA" />
        <KpiCard label="Agentes IA" value={FACTORY_METRICS.agentesIADefinidos} color={BRANDING.primaryColor} />
        <KpiCard label="Email templates" value={FACTORY_METRICS.emailsTemplates} color={P.success} />
        <KpiCard label="Piezas social" value={FACTORY_METRICS.piezasSocial} color={P.secondary} />
        <KpiCard label="Artefactos totales" value={FACTORY_METRICS.artefactosTotales} color={BRANDING.accentColor} />
        <KpiCard label="Código reutilizado" value={FACTORY_METRICS.codigoReutilizado} color={P.success} />
      </div>
      <Card>
        <h4 style={{ margin: '0 0 12px', color: P.text, fontSize: 14 }}>Tiempos estimados</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: P.surface, borderRadius: 8, padding: 14, border: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: BRANDING.accentColor }}>{FACTORY_METRICS.tiempoGeneracion}</div>
            <div style={{ color: P.muted, fontSize: 12 }}>Tiempo de generación completa</div>
          </div>
          <div style={{ background: P.surface, borderRadius: 8, padding: 14, border: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: P.success }}>{FACTORY_METRICS.timeToNewClient}</div>
            <div style={{ color: P.muted, fontSize: 12 }}>Time-to-new-client desde cero</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SeccionNoContaminacion() {
  const checks = [
    { ok: true,  label: 'NO_REAL_ALERT_SEND=SI',        desc: 'No se enviaron alertas reales' },
    { ok: true,  label: 'NO_REAL_EXTERNAL_ACTION=SI',   desc: 'No se realizaron acciones externas reales' },
    { ok: true,  label: 'NO_REAL_DEPLOY=SI',            desc: 'No se desplegó a producción' },
    { ok: true,  label: 'NO_REAL_COST=SI',              desc: 'No se generó ningún coste real' },
    { ok: true,  label: 'isReal: false',                desc: 'Todos los outputs marcados como no reales' },
    { ok: true,  label: 'NO emails reales enviados',    desc: 'Templates generados pero no enviados' },
    { ok: true,  label: 'NO WhatsApp reales',           desc: 'Mensajes diseñados pero no enviados' },
    { ok: true,  label: 'NO Stripe charges',            desc: 'Sin pagos ni cargos Stripe' },
    { ok: true,  label: 'NO posts reales publicados',   desc: 'Contenido generado, no publicado' },
    { ok: true,  label: 'NO datos personales reales',   desc: 'Todos los datos son ficticios y marcados' },
    { ok: true,  label: 'NO secretos expuestos',        desc: 'Sin credenciales en el código generado' },
    { ok: true,  label: 'Club Pádel 04 intacto',        desc: 'Ningún archivo de CP04 fue tocado' },
    { ok: true,  label: 'localhost:5175 respetado',     desc: 'Demo corre en 5180, no en 5175' },
    { ok: true,  label: 'NO merge automático a main',   desc: 'Branch demo/lumen-dental-factory-e2e, sin PR' },
    { ok: true,  label: 'FACTORY_AGENCY_SCOPE_ONLY=SI', desc: 'Scope limitado a la agencia IA' },
  ];
  const allOk = checks.every(c => c.ok);
  return (
    <div>
      <SectionHeader icon="🛡️" title="Fase 20 — No Contaminación" subtitle="Verificación de guardrails de seguridad y aislamiento" />
      <Card style={{ marginBottom: 20, textAlign: 'center', padding: 24, border: `2px solid ${allOk ? P.success : P.error}` }}>
        <div style={{ fontSize: 48 }}>{allOk ? '✅' : '❌'}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: allOk ? P.success : P.error, marginTop: 8 }}>
          {allOk ? 'TODOS LOS GUARDRAILS ACTIVOS' : 'GUARDRAILS CON INCIDENCIAS'}
        </div>
        <div style={{ color: P.muted, fontSize: 13, marginTop: 4 }}>
          {checks.filter(c => c.ok).length}/{checks.length} checks superados
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {checks.map((c, i) => (
          <div key={i} style={{
            background: P.surface, borderRadius: 8, padding: '12px 14px',
            border: `1px solid ${c.ok ? P.success + '44' : P.error + '44'}`,
            borderLeft: `3px solid ${c.ok ? P.success : P.error}`,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>{c.ok ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 12 }}>{c.label}</div>
                <div style={{ color: P.muted, fontSize: 11 }}>{c.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'inicio',        icon: '🏠', label: 'Inicio',            short: 'Inicio' },
  { id: 'capacidades',   icon: '⚙️', label: 'Capacidades F0',    short: 'Caps.' },
  { id: 'branding',      icon: '🎨', label: 'Branding F2',       short: 'Brand' },
  { id: 'landing',       icon: '🌐', label: 'Landing F3',        short: 'Landing' },
  { id: 'saas',          icon: '📱', label: 'SaaS / PWA F4',     short: 'SaaS' },
  { id: 'crm',           icon: '👥', label: 'CRM & Datos F5',    short: 'CRM' },
  { id: 'automatizaciones', icon: '⚡', label: 'Automations F6', short: 'Auto.' },
  { id: 'agentes',       icon: '🤖', label: 'Agentes IA F7',     short: 'IA' },
  { id: 'social',        icon: '📣', label: 'Social Media F8',   short: 'Social' },
  { id: 'email',         icon: '📧', label: 'Email F9',          short: 'Email' },
  { id: 'seo',           icon: '🔍', label: 'SEO Local F10',     short: 'SEO' },
  { id: 'comercial',     icon: '💼', label: 'Comercial F11',     short: 'Venta' },
  { id: 'docs',          icon: '📚', label: 'Docs F12',          short: 'Docs' },
  { id: 'health',        icon: '❤️', label: 'Health F14',        short: 'Health' },
  { id: 'plataformas',   icon: '🖥️', label: 'Plataformas F16',  short: 'Plat.' },
  { id: 'metricas',      icon: '🏭', label: 'Métricas F17',      short: 'KPI' },
  { id: 'nocontaminacion', icon: '🛡️', label: 'Guardrails F20', short: 'Guard' },
];

// ─── App principal ─────────────────────────────────────────────────────────────
export function LumenDentalShowcaseApp() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    const secs = {
      inicio:           <SeccionBienvenida onNav={setActiveSection} />,
      capacidades:      <SeccionCapacidades />,
      branding:         <SeccionBranding />,
      landing:          <SeccionLanding />,
      saas:             <SeccionSaaS />,
      crm:              <SeccionCRM />,
      automatizaciones: <SeccionAutomatizaciones />,
      agentes:          <SeccionAgentes />,
      social:           <SeccionSocial />,
      email:            <SeccionEmail />,
      seo:              <SeccionSEO />,
      comercial:        <SeccionComercial />,
      docs:             <SeccionDocs />,
      health:           <SeccionHealth />,
      plataformas:      <SeccionPlataformas />,
      metricas:         <SeccionMetricasFabrica />,
      nocontaminacion:  <SeccionNoContaminacion />,
    };
    return secs[activeSection] || <SeccionBienvenida onNav={setActiveSection} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: P.bg, color: P.text, fontFamily: "'DM Sans','Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Demo Banner */}
      <div style={{ background: '#7C3AED', color: P.white, textAlign: 'center', padding: '8px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', zIndex: 100, flexShrink: 0 }}>
        ⚠️ PROTOTIPO INTERNO · DATOS 100% FICTICIOS · NO CONECTADO A SISTEMAS REALES · Fábrica SaaS V1.8 / ADV-01…ADV-21
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 220, background: P.surface, borderRight: `1px solid ${P.border}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding: '20px 16px', borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div dangerouslySetInnerHTML={{ __html: BRANDING.logoSVG.replace('width="48"','width="36"').replace('height="48"','height="36"') }} />
              <div>
                <div style={{ fontWeight: 800, color: P.white, fontSize: 14 }}>Lumen Dental</div>
                <div style={{ color: P.muted, fontSize: 10 }}>Showcase Demo</div>
              </div>
            </div>
          </div>
          {/* Nav */}
          <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  width: '100%', background: activeSection === item.id ? BRANDING.primaryColor + '22' : 'transparent',
                  border: 'none', borderLeft: `3px solid ${activeSection === item.id ? BRANDING.primaryColor : 'transparent'}`,
                  color: activeSection === item.id ? BRANDING.secondaryColor : P.muted,
                  padding: '10px 16px', cursor: 'pointer', textAlign: 'left',
                  fontSize: 13, fontWeight: activeSection === item.id ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 10, transition: '0.12s',
                }}
                onMouseOver={e => { if (activeSection !== item.id) { e.currentTarget.style.background = P.card; e.currentTarget.style.color = P.text; } }}
                onMouseOut={e => { if (activeSection !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.muted; } }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          {/* Footer */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${P.border}`, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: P.muted }}>Factory v{FACTORY_METRICS.versionFabrica}</div>
            <div style={{ fontSize: 10, color: P.muted }}>Registry {FACTORY_METRICS.registryVersion}</div>
            <div style={{ fontSize: 10, color: P.muted }}>{FACTORY_METRICS.totalTestsFactory.toLocaleString()} tests ✓</div>
          </div>
        </div>
        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
