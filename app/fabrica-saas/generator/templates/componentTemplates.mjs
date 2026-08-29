/**
 * GENERATOR · Templates V1.2 · Generadores de componentes React desde manifest
 * Produce JSX/JS completo y funcional para cada módulo de un cliente.
 * Sin dependencias externas. Retorna strings (contenido de archivo).
 */

import { getBrandingHeadTags } from '../../core/branding/faviconGenerator.js';

// ── Utilidades ────────────────────────────────────────────────────────────────

export function toPascalCase(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function jsStr(v) {
  return JSON.stringify(String(v ?? ''));
}

// ── Metadatos por vertical ────────────────────────────────────────────────────

const VERTICAL_META = {
  dental: {
    configConst:   'DENTAL_VERTICAL',
    detectFunc:    'detectaSensible',
    chatbotIcon:   '🦷',
    entityLabel:   'Paciente',
    entityPlural:  'Pacientes',
    serviceLabel:  'Tratamiento',
    crmLabel:      'CRM · Pacientes',
    dashLabel:     'Dashboard · Dental',
  },
  fisioterapia: {
    configConst:   'FISIO_VERTICAL',
    detectFunc:    'detectaSensibleFisio',
    chatbotIcon:   '🏥',
    entityLabel:   'Paciente',
    entityPlural:  'Pacientes',
    serviceLabel:  'Tratamiento',
    crmLabel:      'CRM · Pacientes',
    dashLabel:     'Dashboard · Fisio',
  },
  estetica: {
    configConst:   'ESTETICA_VERTICAL',
    detectFunc:    'detectaSensibleEstetica',
    chatbotIcon:   '✨',
    entityLabel:   'Cliente',
    entityPlural:  'Clientes',
    serviceLabel:  'Tratamiento',
    crmLabel:      'CRM · Clientes',
    dashLabel:     'Dashboard · Estética',
  },
  abogados: {
    configConst:   'ABOGADOS_VERTICAL',
    detectFunc:    'detectaSensibleAbogados',
    chatbotIcon:   '⚖️',
    entityLabel:   'Cliente',
    entityPlural:  'Clientes',
    serviceLabel:  'Consulta',
    crmLabel:      'CRM · Clientes',
    dashLabel:     'Dashboard · Servicios',
  },
};

function getMeta(vertical) {
  return VERTICAL_META[vertical] ?? {
    configConst:  'VERTICAL_CONFIG',
    detectFunc:   'detectaSensible',
    chatbotIcon:  '🤖',
    entityLabel:  'Cliente',
    entityPlural: 'Clientes',
    serviceLabel: 'Servicio',
    crmLabel:     'CRM · Clientes',
    dashLabel:    'Dashboard',
  };
}

// ── 1. MockData ───────────────────────────────────────────────────────────────

export function genMockData(manifest) {
  const biz    = manifest.business;
  const sedes  = manifest.sedes ?? [];
  const dd     = manifest.demoData ?? {};
  const pros   = dd.professionals ?? [];
  const slots  = dd.slots ?? [];
  const clients = dd.clients ?? [];
  const leads  = dd.leads_abandono ?? [];
  const metrics = dd.metrics ?? {};

  const sedesJson  = JSON.stringify(sedes, null, 2);
  const prosArr    = [...pros, { id: 'cualquiera', nombre: 'Primer profesional disponible', especialidad: null }];
  const prosJson   = JSON.stringify(prosArr, null, 2);
  const slotsJson  = JSON.stringify(slots, null, 2);
  const clientsJson = JSON.stringify(clients, null, 2);
  const leadsJson  = JSON.stringify(leads, null, 2);

  const porSede = sedes.map((s, i) => ({
    sede: s.nombre?.split(' ').slice(-1)[0] ?? `Sede ${i + 1}`,
    consultas: Math.round((metrics.consultas_mes ?? 20) / sedes.length),
  }));

  const metricsObj = {
    consultas_mes:   metrics.consultas_mes    ?? 0,
    tasa_conversion: metrics.tasa_conversion  ?? 0,
    valor_pipeline:  metrics.valor_pipeline   ?? '0 € (ficticio)',
    ingresos_mes:    metrics.ingresos_mes     ?? '0 € (ficticio)',
    por_sede: porSede,
  };
  const metricsJson = JSON.stringify(metricsObj, null, 2);

  return `/**
 * OUTPUT GENERADO · ${biz.name} · Datos demo
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * Datos 100% ficticios. No representan personas ni casos reales.
 * No usar en producción. No incluir datos personales reales.
 */

export const MOCK_SEDES = ${sedesJson};

export const MOCK_PROFESIONALES = ${prosJson};

export const MOCK_SLOTS = ${slotsJson};

export const MOCK_CLIENTES = ${clientsJson};

export const MOCK_LEADS_ABANDONO = ${leadsJson};

export const MOCK_METRICAS = ${metricsJson};
`;
}

// ── 2. App.jsx ────────────────────────────────────────────────────────────────

export function genApp(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const meta   = getMeta(biz.vertical);
  const nombre = jsStr(br.nombre_visible ?? biz.name);
  const inicial = jsStr(br.inicial ?? (biz.name?.[0] ?? 'A').toUpperCase());
  const emoji  = jsStr(br.emoji_sector ?? meta.chatbotIcon);
  const color  = jsStr(br.primaryColor ?? '#2563eb');

  const modules = manifest.modules ?? ['chatbot_ia', 'crm', 'recuperacion_leads', 'dashboard'];
  const tabs = [];
  if (modules.includes('chatbot_ia')) tabs.push(`{ id: 'chatbot',   label: 'Asistente IA',  icon: ${emoji} }`);
  if (modules.includes('crm'))        tabs.push(`{ id: 'crm',       label: 'Clientes',       icon: '📋' }`);
  if (modules.includes('recuperacion_leads')) tabs.push(`{ id: 'recovery',  label: 'Recuperación',  icon: '🔄' }`);
  if (modules.includes('dashboard'))  tabs.push(`{ id: 'dashboard', label: 'Dashboard',      icon: '📊' }`);

  const imports = [];
  if (modules.includes('chatbot_ia')) imports.push(`import { ${pascal}Chatbot }   from './${pascal}Chatbot.jsx';`);
  if (modules.includes('crm'))        imports.push(`import { ${pascal}Crm }        from './${pascal}Crm.jsx';`);
  if (modules.includes('recuperacion_leads')) imports.push(`import { ${pascal}Recovery }    from './${pascal}Recovery.jsx';`);
  if (modules.includes('dashboard'))  imports.push(`import { ${pascal}Dashboard }  from './${pascal}Dashboard.jsx';`);

  const cases = [];
  if (modules.includes('chatbot_ia')) cases.push(`      case 'chatbot':   return <${pascal}Chatbot />;`);
  if (modules.includes('crm'))        cases.push(`      case 'crm':       return <${pascal}Crm />;`);
  if (modules.includes('recuperacion_leads')) cases.push(`      case 'recovery':  return <${pascal}Recovery />;`);
  if (modules.includes('dashboard'))  cases.push(`      case 'dashboard': return <${pascal}Dashboard />;`);
  const defaultCase = modules[0] === 'chatbot_ia' ? 'chatbot' : modules[0] ?? 'chatbot';
  cases.push(`      default:          return <${pascal}${modules[0] === 'chatbot_ia' ? 'Chatbot' : toPascalCase(modules[0] ?? 'chatbot')} />;`);

  return `/**
 * OUTPUT GENERADO · ${biz.name} · App Shell
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
${imports.join('\n')}

const BRANDING = {
  nombre: ${nombre},
  inicial: ${inicial},
  color: ${color},
};

const TABS = [
  ${tabs.join(',\n  ')},
];

export function ${pascal}App() {
  const [activeTab, setActiveTab] = useState(${jsStr(defaultCase)});
  const renderTab = () => {
    switch (activeTab) {
${cases.join('\n')}
    }
  };
  return (
    <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} branding={BRANDING}>
      {renderTab()}
    </AppShell>
  );
}
`;
}

// ── 3. Chatbot.jsx ────────────────────────────────────────────────────────────

export function genChatbot(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const meta   = getMeta(biz.vertical);
  const nombre = biz.name;
  const emoji  = br.emoji_sector ?? meta.chatbotIcon;

  const hasSedes = Array.isArray(manifest.sedes) && manifest.sedes.length > 0;
  const hasPros  = Array.isArray(manifest.demoData?.professionals) && manifest.demoData.professionals.length > 0;

  const sedeStep = hasSedes
    ? `{ id: 'sede', label: 'Sede' },` : '';
  const proStep  = hasPros
    ? `{ id: 'profesional', label: 'Profesional' },` : '';

  // Next step after intencion (normal flow)
  const nextAfterServicio = hasSedes ? 'sede' : hasPros ? 'profesional' : 'franja';
  // Next step after sede
  const nextAfterSede = hasPros ? 'profesional' : 'franja';

  const sedeBlock = hasSedes ? `
        {step === 'sede' && (
          <>
            <UserBubble>{intencion?.label}</UserBubble>
            {intencion?.sensible && (
              <SensibleAlert
                titulo="Consulta especializada"
                mensaje={intencion.mensaje_derivacion_especifico ?? 'Te derivaremos con el especialista adecuado.'}
                color="orange"
              />
            )}
            <BotBubble icon="📍">¿Qué sede prefieres?</BotBubble>
            {MOCK_SEDES.map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <OptionBtn onClick={() => elegirSede(s)} emoji="🏢" label={s.nombre} desc={s.horario} />
              </div>
            ))}
          </>
        )}
` : '';

  const proBlock = hasPros ? `
        {step === 'profesional' && (
          <>
            <UserBubble>{${hasSedes ? 'sede?.nombre' : 'intencion?.label'}}</UserBubble>
            <BotBubble icon="👤">¿Alguna preferencia de profesional?</BotBubble>
            {MOCK_PROFESIONALES.map(p => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirProfesional(p)}
                  emoji={p.id === 'cualquiera' ? '🎲' : '👤'}
                  label={p.nombre}
                  desc={p.especialidad ?? 'Sin preferencia'}
                />
              </div>
            ))}
          </>
        )}
` : '';

  const franjaContext = hasPros
    ? 'profesional?.nombre'
    : hasSedes
      ? 'sede?.nombre'
      : 'intencion?.label';

  return `/**
 * OUTPUT GENERADO · ${nombre} · Chatbot IA simulado
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Sin asesoramiento profesional real. Datos 100% ficticios. Sin llamadas externas.
 */
import { useState } from 'react';
import {
  StepIndicator, BotBubble, UserBubble, OptionBtn,
  SensibleAlert, ConfirmacionPanel,
} from '../../core/ChatComponents.jsx';
import { ${meta.configConst}, ${meta.detectFunc} } from '../../verticals/${biz.vertical}/config.js';
import { MOCK_SEDES, MOCK_PROFESIONALES, MOCK_SLOTS } from './${pascal}MockData.js';

const STEPS_ALL = [
  { id: 'servicio',    label: '${meta.serviceLabel}' },
  ${sedeStep}
  ${proStep}
  { id: 'franja',      label: 'Horario' },
  { id: 'slot',        label: 'Cita' },
  { id: 'confirmacion', label: '¡Listo!' },
];
const STEPS = STEPS_ALL.filter(Boolean);

const SEP = { height: 1, background: '#e5e7eb', margin: '12px 0' };
const BOX = { maxWidth: 560, margin: '0 auto', padding: '0 4px' };

export function ${pascal}Chatbot() {
  const [step, setStep]               = useState('servicio');
  const [intencion, setIntencion]     = useState(null);
  const [sede, setSede]               = useState(null);
  const [profesional, setProfesional] = useState(null);
  const [franja, setFranja]           = useState(null);
  const [slot, setSlot]               = useState(null);
  const [pregunta, setPregunta]       = useState('');

  const reset = () => {
    setStep('servicio'); setIntencion(null); setSede(null);
    setProfesional(null); setFranja(null); setSlot(null); setPregunta('');
  };

  const elegirServicio = (int) => {
    setIntencion(int);
    if (int.flujo_corto) { setStep('confirmacion'); return; }
    setStep(${jsStr(nextAfterServicio)});
  };
${hasSedes ? `
  const elegirSede = (s) => {
    setSede(s);
    setStep(${jsStr(nextAfterSede)});
  };
` : ''}${hasPros ? `
  const elegirProfesional = (p) => { setProfesional(p); setStep('franja'); };
` : ''}
  const elegirFranja = (f) => { setFranja(f); setStep('slot'); };
  const elegirSlot   = (s) => { setSlot(s); setStep('confirmacion'); };

  return (
    <div style={{ padding: 20 }}>
      <StepIndicator steps={STEPS} currentStep={step} />
      <div style={BOX}>

        {step === 'servicio' && (
          <>
            <BotBubble icon=${jsStr(emoji)}>
              ¡Hola! Soy el asistente virtual de <strong>${nombre}</strong>.<br />
              <em style={{ fontSize: 12, color: '#6b7280' }}>
                Solo orientamos y facilitamos la reserva. Sin asesoramiento profesional real.
                Datos demo 100% ficticios. Sin llamadas externas.
              </em>
              <br /><br />¿En qué podemos ayudarte hoy?
            </BotBubble>
            <div style={SEP} />
            {${meta.configConst}.intenciones.map(int => (
              <div key={int.id} style={{ marginBottom: 8 }}>
                <OptionBtn onClick={() => elegirServicio(int)} emoji={int.emoji} label={int.label} desc={int.descripcion} />
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <input
                value={pregunta}
                onChange={e => {
                  setPregunta(e.target.value);
                  if (${meta.detectFunc}(e.target.value)) {
                    const primera = ${meta.configConst}.intenciones.find(i => i.sensible);
                    if (primera) { setIntencion(primera); setStep(${jsStr(nextAfterServicio)}); }
                  }
                }}
                placeholder="O escribe tu consulta..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                  border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#374151',
                }}
              />
            </div>
          </>
        )}
${sedeBlock}${proBlock}
        {step === 'franja' && (
          <>
            <UserBubble>{${franjaContext}}</UserBubble>
            <BotBubble icon="🕐">¿Qué horario te viene mejor?</BotBubble>
            {${meta.configConst}.franjas_horarias.map(f => (
              <div key={f.id} style={{ marginBottom: 8 }}>
                <OptionBtn onClick={() => elegirFranja(f)} emoji="⏰" label={f.label} desc={f.rango} />
              </div>
            ))}
          </>
        )}

        {step === 'slot' && (
          <>
            <UserBubble>{franja?.label}</UserBubble>
            <BotBubble icon="📅">Próximas citas disponibles (ficticias):</BotBubble>
            {MOCK_SLOTS.filter(s => s.disponible).map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirSlot(s)}
                  emoji="🗓️"
                  label={s.fecha + ' · ' + s.hora}
                  desc={s.sede + ' · ' + (s.profesional ?? 'Disponible')}
                />
              </div>
            ))}
          </>
        )}

        {step === 'confirmacion' && intencion?.flujo_corto && (
          <ConfirmacionPanel
            titulo="Consulta registrada (simulación)"
            detalle={intencion.mensaje_flujo_corto}
            onReset={reset}
            resetLabel="Nueva consulta demo"
          />
        )}

        {step === 'confirmacion' && !intencion?.flujo_corto && slot && (
          <ConfirmacionPanel
            titulo="¡Cita reservada! (simulación)"
            detalle={
              '${meta.serviceLabel}: ' + (intencion?.label ?? '') +
              '\\nSede: ' + (slot.sede ?? '') +
              '\\nProfesional: ' + (slot.profesional ?? '') +
              '\\nFecha: ' + slot.fecha + ' a las ' + slot.hora
            }
            onReset={reset}
            resetLabel="Nueva consulta demo"
          />
        )}

        {step === 'confirmacion' && !intencion?.flujo_corto && !slot && (
          <ConfirmacionPanel
            titulo="Consulta registrada (simulación)"
            detalle="Nos pondremos en contacto para confirmar disponibilidad."
            onReset={reset}
            resetLabel="Nueva consulta demo"
          />
        )}

      </div>
    </div>
  );
}
`;
}

// ── 4. CRM.jsx ────────────────────────────────────────────────────────────────

export function genCrm(manifest) {
  const biz    = manifest.business;
  const pascal = toPascalCase(biz.slug);
  const meta   = getMeta(biz.vertical);
  const nombre = biz.name;

  return `/**
 * OUTPUT GENERADO · ${nombre} · CRM
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { MOCK_CLIENTES } from './${pascal}MockData.js';

const ESTADO_CONFIG = {
  nuevo:            { label: 'Nuevo',          color: '#dbeafe', text: '#1d4ed8' },
  contactado:       { label: 'Contactado',     color: '#fef9c3', text: '#a16207' },
  en_espera:        { label: 'En espera',      color: '#fde68a', text: '#92400e' },
  activo:           { label: 'Activo',         color: '#d1fae5', text: '#065f46' },
  en_tratamiento:   { label: 'En tratamiento', color: '#e0e7ff', text: '#3730a3' },
  pendiente_cita:   { label: 'Pend. cita',     color: '#fde68a', text: '#92400e' },
  completado:       { label: 'Completado',     color: '#dcfce7', text: '#166534' },
  perdido:          { label: 'Perdido',        color: '#fee2e2', text: '#991b1b' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: cfg.color, color: cfg.text,
    }}>
      {cfg.label}
    </span>
  );
}

export function ${pascal}Crm() {
  const [expanded, setExpanded] = useState(null);
  const [filtro, setFiltro]     = useState('todos');

  const estados = ['todos', ...new Set(MOCK_CLIENTES.map(c => c.estado))];
  const lista = filtro === 'todos'
    ? MOCK_CLIENTES
    : MOCK_CLIENTES.filter(c => c.estado === filtro);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
          ${meta.crmLabel} · <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}>${nombre}</span>
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {estados.map(e => (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: '1px solid',
                borderColor: filtro === e ? '#2563eb' : '#d1d5db',
                background: filtro === e ? '#eff6ff' : '#fff',
                color: filtro === e ? '#2563eb' : '#374151',
                cursor: 'pointer',
              }}
            >
              {e === 'todos' ? 'Todos' : ESTADO_CONFIG[e]?.label ?? e}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
          No hay registros con este filtro.
        </p>
      )}

      {lista.map(c => (
        <div
          key={c.id}
          style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            marginBottom: 10, overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{c.nombre}</span>
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{c.tratamiento_interes}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EstadoBadge estado={c.estado} />
              <span style={{ color: '#9ca3af', fontSize: 12 }}>{expanded === c.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === c.id && (
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 10 }}>
                {[
                  ['Email', c.email],
                  ['Teléfono', c.telefono],
                  ['Origen', c.origen],
                  ['Sesiones completadas', c.sesiones_completadas],
                  ['Sesiones restantes', c.sesiones_restantes],
                ].map(([k, v]) => v !== undefined && (
                  <div key={k}>
                    <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>{k}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
`;
}

// ── 5. Dashboard.jsx ──────────────────────────────────────────────────────────

export function genDashboard(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const meta   = getMeta(biz.vertical);
  const nombre = biz.name;
  const color  = br.primaryColor ?? '#2563eb';

  return `/**
 * OUTPUT GENERADO · ${nombre} · Dashboard
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { MOCK_METRICAS } from './${pascal}MockData.js';

const ACCENT = ${jsStr(color)};

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '16px 20px', borderTop: '3px solid ' + (accent ?? ACCENT),
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, labelKey = 'sede', valueKey = 'consultas', color: c = ACCENT }) {
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 90, fontSize: 12, color: '#374151', flexShrink: 0 }}>{d[labelKey]}</span>
          <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 10, overflow: 'hidden' }}>
            <div style={{ width: ((d[valueKey] ?? 0) / max * 100) + '%', background: c, height: '100%', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: '#6b7280', width: 28, textAlign: 'right' }}>{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function ${pascal}Dashboard() {
  const m = MOCK_METRICAS;
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
        ${meta.dashLabel} · <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}>${nombre}</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Consultas este mes" value={m.consultas_mes} sub="(ficticio)" />
        <MetricCard label="Tasa conversión" value={m.tasa_conversion + '%'} sub="(ficticio)" accent="#16a34a" />
        <MetricCard label="Valor pipeline" value={m.valor_pipeline} sub="estimado ficticio" accent="#7c3aed" />
        <MetricCard label="Ingresos mes" value={m.ingresos_mes} sub="(ficticio)" accent="#ea580c" />
      </div>

      {m.por_sede && m.por_sede.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Consultas por sede (ficticio)
          </div>
          <BarChart data={m.por_sede} labelKey="sede" valueKey="consultas" />
        </div>
      )}

      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
        Todos los datos mostrados son ficticios y solo sirven para demostración del prototipo.
      </p>
    </div>
  );
}
`;
}

// ── 6. Recovery.jsx ───────────────────────────────────────────────────────────

export function genRecovery(manifest) {
  const biz    = manifest.business;
  const pascal = toPascalCase(biz.slug);
  const nombre = biz.name;

  return `/**
 * OUTPUT GENERADO · ${nombre} · Recuperación de leads
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { MOCK_LEADS_ABANDONO } from './${pascal}MockData.js';

const ESTADO_COLOR = {
  en_proceso: { bg: '#fef9c3', text: '#a16207', label: 'En proceso' },
  recuperado: { bg: '#d1fae5', text: '#065f46', label: 'Recuperado' },
  perdido:    { bg: '#fee2e2', text: '#991b1b', label: 'Perdido' },
};

function DiasBadge({ dias }) {
  const color = dias >= 14 ? '#ef4444' : dias >= 7 ? '#f59e0b' : '#22c55e';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: color + '22', color,
    }}>
      {dias}d inactivo
    </span>
  );
}

export function ${pascal}Recovery() {
  const [leads, setLeads] = useState(MOCK_LEADS_ABANDONO.map(l => ({ ...l })));
  const [loading, setLoading] = useState(null);

  const simularAccion = (id) => {
    setLoading(id);
    setTimeout(() => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, estado: 'recuperado' } : l));
      setLoading(null);
    }, 1200);
  };

  const pendientes = leads.filter(l => l.estado !== 'recuperado' && l.estado !== 'perdido');
  const recuperados = leads.filter(l => l.estado === 'recuperado');

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
        Recuperación de Leads
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>
        ${nombre} · {pendientes.length} leads pendientes · {recuperados.length} recuperados
      </p>

      {leads.map(lead => {
        const ec = ESTADO_COLOR[lead.estado] ?? { bg: '#f3f4f6', text: '#374151', label: lead.estado };
        const isLoading = loading === lead.id;
        const isRecup = lead.estado === 'recuperado';
        return (
          <div
            key={lead.id}
            style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: '12px 16px', marginBottom: 10,
              borderLeft: isRecup ? '3px solid #16a34a' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{lead.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {lead.tratamiento} · {lead.email}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <DiasBadge dias={lead.dias_inactivo} />
                  <span style={{
                    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: ec.bg, color: ec.text,
                  }}>
                    {ec.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 6, fontStyle: 'italic' }}>
                  💡 {lead.accion_sugerida}
                </div>
              </div>
              {!isRecup && (
                <button
                  onClick={() => simularAccion(lead.id)}
                  disabled={isLoading}
                  style={{
                    padding: '6px 14px', background: isLoading ? '#e5e7eb' : '#2563eb',
                    color: isLoading ? '#9ca3af' : '#fff', border: 'none', borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {isLoading ? 'Enviando...' : 'Simular acción'}
                </button>
              )}
              {isRecup && (
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>✓ Recuperado</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
`;
}

// ── 7. main.jsx ───────────────────────────────────────────────────────────────

export function genMain(manifest) {
  const biz    = manifest.business;
  const pascal = toPascalCase(biz.slug);

  return `/**
 * OUTPUT GENERADO · ${biz.name} · Entry point
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ${pascal}App } from './${pascal}App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <${pascal}App />
  </StrictMode>
);
`;
}

// ── 8. HTML entry ─────────────────────────────────────────────────────────────

export function genHtml(manifest) {
  const biz         = manifest.business;
  const br          = manifest.branding ?? {};
  const title       = br.nombre_visible ?? biz.name;
  const version     = 'V1.2';
  const brandingTags = getBrandingHeadTags(manifest);

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    ${brandingTags}
    <title>${title} · Fábrica SaaS ${version}</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/fabrica-saas/output/${biz.slug}/main.jsx"></script>
  </body>
</html>
`;
}
