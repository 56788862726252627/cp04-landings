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
  const biz     = manifest.business;
  const br      = manifest.branding ?? {};
  const sedes   = manifest.sedes ?? [];
  const dd      = manifest.demoData ?? {};
  const pros    = dd.professionals ?? [];
  const slots   = dd.slots ?? [];
  const clients = dd.clients ?? [];
  const leads   = dd.leads_abandono ?? [];
  const metrics = dd.metrics ?? {};
  const isV15   = manifest.modules && manifest.modules.some(m => ['landing','agenda','tratamientos','profesionales','presupuestos'].includes(m));

  const sedesJson   = JSON.stringify(sedes, null, 2);
  const prosArr     = [...pros, { id: 'cualquiera', nombre: 'Primer profesional disponible', especialidad: null }];
  const prosJson    = JSON.stringify(prosArr, null, 2);
  const slotsJson   = JSON.stringify(slots, null, 2);
  const clientsJson = JSON.stringify(clients, null, 2);
  const leadsJson   = JSON.stringify(leads, null, 2);

  const porSede = sedes.map((s, i) => ({
    sede: (s.nombre ?? `Sede ${i + 1}`).replace(/\s*\(ficticio\)$/i, '').replace(/\s*\(demo\)$/i, '').trim(),
    consultas: Math.round((metrics.consultas_mes ?? 147) / Math.max(sedes.length, 1)),
  }));

  const metricsObj = {
    consultas_mes:    metrics.consultas_mes    ?? 147,
    tasa_conversion:  metrics.tasa_conversion  ?? 68,
    valor_pipeline:   metrics.valor_pipeline   ?? '38.500 € (ficticio)',
    ingresos_mes:     metrics.ingresos_mes     ?? '24.800 € (ficticio)',
    citas_hoy:        metrics.citas_hoy        ?? 12,
    nuevos_pacientes: metrics.nuevos_pacientes ?? 8,
    por_sede: porSede,
  };
  const metricsJson = JSON.stringify(metricsObj, null, 2);

  const v15Extras = isV15 ? `
export const MOCK_TRATAMIENTOS = [
  { id: 'trat-001', categoria: 'General', nombre: 'Revisión y limpieza', descripcion: 'Revisión bucodental completa con higiene profesional', duracion: '60 min', precio_desde: '45 €', icono: '🪥', destacado: true },
  { id: 'trat-002', categoria: 'Ortodoncia', nombre: 'Brackets metálicos', descripcion: 'Ortodoncia fija tradicional de alta precisión', duracion: '24 meses', precio_desde: '2.400 €', icono: '🦷', destacado: true },
  { id: 'trat-003', categoria: 'Ortodoncia', nombre: 'Alineadores invisibles', descripcion: 'Ortodoncia invisible con férulas termoformadas', duracion: '12-18 meses', precio_desde: '3.200 €', icono: '😁', destacado: true },
  { id: 'trat-004', categoria: 'Implantes', nombre: 'Implante unitario', descripcion: 'Implante de titanio con corona cerámica', duracion: '3-6 meses', precio_desde: '1.800 €', icono: '🔩', destacado: true },
  { id: 'trat-005', categoria: 'Implantes', nombre: 'Implantes múltiples', descripcion: 'Rehabilitación completa con implantes', duracion: '6-12 meses', precio_desde: '8.500 €', icono: '💪', destacado: false },
  { id: 'trat-006', categoria: 'Estética', nombre: 'Blanqueamiento dental', descripcion: 'Blanqueamiento LED en clínica con resultado inmediato', duracion: '90 min', precio_desde: '280 €', icono: '✨', destacado: true },
  { id: 'trat-007', categoria: 'Estética', nombre: 'Carillas de porcelana', descripcion: 'Láminas de porcelana ultrafinas para sonrisa perfecta', duracion: '2 sesiones', precio_desde: '450 €/u', icono: '💎', destacado: false },
  { id: 'trat-008', categoria: 'Periodoncia', nombre: 'Tratamiento periodontal', descripcion: 'Tratamiento de encías y tejidos de soporte dental', duracion: '2-4 sesiones', precio_desde: '350 €', icono: '🩺', destacado: false },
  { id: 'trat-009', categoria: 'Periodoncia', nombre: 'Cirugía periodontal', descripcion: 'Intervención quirúrgica para enfermedad periodontal avanzada', duracion: '90 min', precio_desde: '600 €', icono: '🏥', destacado: false },
  { id: 'trat-010', categoria: 'General', nombre: 'Endodoncia', descripcion: 'Tratamiento de conductos para salvar la pieza dental', duracion: '2-3 sesiones', precio_desde: '320 €', icono: '💉', destacado: false },
  { id: 'trat-011', categoria: 'General', nombre: 'Empaste dental', descripcion: 'Obturación con composite de última generación', duracion: '45 min', precio_desde: '80 €', icono: '🔧', destacado: false },
  { id: 'trat-012', categoria: 'Estética', nombre: 'Diseño de sonrisa', descripcion: 'Planificación digital completa de tu sonrisa ideal', duracion: '60 min', precio_desde: '150 €', icono: '🎨', destacado: true },
];

export const MOCK_PRESUPUESTOS = [
  { id: 'pres-001', paciente: 'Ana García Martínez (ficticio)', tratamiento: 'Ortodoncia con alineadores', importe: '3.200 €', estado: 'aceptado', fecha: '2026-08-15', profesional: 'Dra. Martínez Ruiz', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'pres-002', paciente: 'Carlos López Pérez (ficticio)', tratamiento: 'Implante unitario x2', importe: '3.600 €', estado: 'enviado', fecha: '2026-08-20', profesional: 'Dr. García Sánchez', sede: '${biz.name.includes('Aurora') ? 'Aurora Norte' : 'Sede Principal'}' },
  { id: 'pres-003', paciente: 'María Rodríguez Silva (ficticio)', tratamiento: 'Blanqueamiento + carillas', importe: '2.100 €', estado: 'borrador', fecha: '2026-08-22', profesional: 'Dra. López Torres', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'pres-004', paciente: 'Juan Fernández Ruiz (ficticio)', tratamiento: 'Revisión + limpieza anual', importe: '90 €', estado: 'completado', fecha: '2026-08-10', profesional: 'Dra. Martínez Ruiz', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'pres-005', paciente: 'Laura Sánchez Torres (ficticio)', tratamiento: 'Endodoncia molar + corona', importe: '780 €', estado: 'aceptado', fecha: '2026-08-18', profesional: 'Dr. García Sánchez', sede: '${biz.name.includes('Aurora') ? 'Aurora Norte' : 'Sede Principal'}' },
  { id: 'pres-006', paciente: 'Pedro Moreno Díaz (ficticio)', tratamiento: 'Brackets metálicos adultos', importe: '2.600 €', estado: 'enviado', fecha: '2026-08-25', profesional: 'Dra. López Torres', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
];

export const MOCK_AGENDA = [
  { id: 'cita-001', paciente: 'Ana García Martínez (ficticio)', tratamiento: 'Control ortodoncia', profesional: 'Dra. Martínez Ruiz', hora: '09:00', duracion: '30 min', estado: 'confirmada', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'cita-002', paciente: 'Carlos López Pérez (ficticio)', tratamiento: 'Colocación implante fase 1', profesional: 'Dr. García Sánchez', hora: '10:00', duracion: '90 min', estado: 'confirmada', sede: '${biz.name.includes('Aurora') ? 'Aurora Norte' : 'Sede Principal'}' },
  { id: 'cita-003', paciente: 'María Rodríguez Silva (ficticio)', tratamiento: 'Blanqueamiento LED', profesional: 'Dra. López Torres', hora: '11:30', duracion: '90 min', estado: 'pendiente', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'cita-004', paciente: 'Nuevo paciente (ficticio)', tratamiento: 'Primera visita y diagnóstico', profesional: 'Dra. Martínez Ruiz', hora: '13:00', duracion: '60 min', estado: 'pendiente', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'cita-005', paciente: 'Laura Sánchez Torres (ficticio)', tratamiento: 'Endodoncia sesión 2', profesional: 'Dr. García Sánchez', hora: '15:00', duracion: '60 min', estado: 'confirmada', sede: '${biz.name.includes('Aurora') ? 'Aurora Norte' : 'Sede Principal'}' },
  { id: 'cita-006', paciente: 'Pedro Moreno Díaz (ficticio)', tratamiento: 'Revisión y toma de medidas', profesional: 'Dra. López Torres', hora: '16:30', duracion: '45 min', estado: 'cancelada', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'cita-007', paciente: 'Elena Vázquez Mora (ficticio)', tratamiento: 'Limpieza bucal semestral', profesional: 'Dra. Martínez Ruiz', hora: '17:30', duracion: '60 min', estado: 'confirmada', sede: '${biz.name.includes('Aurora') ? 'Aurora Centro' : 'Sede Principal'}' },
  { id: 'cita-008', paciente: 'Roberto Castro Gil (ficticio)', tratamiento: 'Control post-implante', profesional: 'Dr. García Sánchez', hora: '18:30', duracion: '30 min', estado: 'pendiente', sede: '${biz.name.includes('Aurora') ? 'Aurora Norte' : 'Sede Principal'}' },
];
` : '';

  return `/**
 * OUTPUT GENERADO · ${biz.name} · Datos demo
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * Datos 100% ficticios. No representan personas ni casos reales.
 * No usar en producción. No incluir datos personales reales.
 */

export const MOCK_SEDES = ${sedesJson};

export const MOCK_PROFESIONALES = ${prosJson};

export const MOCK_SLOTS = ${slotsJson};

export const MOCK_CLIENTES = ${clientsJson};

export const MOCK_LEADS_ABANDONO = ${leadsJson};

export const MOCK_METRICAS = ${metricsJson};
${v15Extras}`;
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
  const tagline = jsStr(br.tagline ?? '');

  const modules = manifest.modules ?? ['chatbot_ia', 'crm', 'recuperacion_leads', 'dashboard'];
  const tabs = [];
  if (modules.includes('landing'))            tabs.push(`{ id: 'landing',        label: 'Inicio',         icon: '🏠' }`);
  if (modules.includes('chatbot_ia'))         tabs.push(`{ id: 'chatbot',        label: 'Asistente IA',   icon: ${emoji} }`);
  if (modules.includes('agenda'))             tabs.push(`{ id: 'agenda',         label: 'Agenda',         icon: '📅' }`);
  if (modules.includes('tratamientos'))       tabs.push(`{ id: 'tratamientos',   label: 'Tratamientos',   icon: '🔬' }`);
  if (modules.includes('crm') || modules.includes('pacientes_crm')) tabs.push(`{ id: 'crm',            label: 'Pacientes',      icon: '👥' }`);
  if (modules.includes('profesionales'))      tabs.push(`{ id: 'profesionales',  label: 'Profesionales',  icon: '👨‍⚕️' }`);
  if (modules.includes('recuperacion_leads')) tabs.push(`{ id: 'recovery',       label: 'Leads',          icon: '🔄' }`);
  if (modules.includes('presupuestos'))       tabs.push(`{ id: 'presupuestos',   label: 'Presupuestos',   icon: '💼' }`);
  if (modules.includes('dashboard'))          tabs.push(`{ id: 'dashboard',      label: 'Dashboard',      icon: '📊' }`);

  const imports = [];
  if (modules.includes('landing'))            imports.push(`import { ${pascal}Landing }       from './${pascal}Landing.jsx';`);
  if (modules.includes('chatbot_ia'))         imports.push(`import { ${pascal}Chatbot }       from './${pascal}Chatbot.jsx';`);
  if (modules.includes('agenda'))             imports.push(`import { ${pascal}Agenda }        from './${pascal}Agenda.jsx';`);
  if (modules.includes('tratamientos'))       imports.push(`import { ${pascal}Tratamientos }  from './${pascal}Tratamientos.jsx';`);
  if (modules.includes('crm') || modules.includes('pacientes_crm')) imports.push(`import { ${pascal}Crm }           from './${pascal}Crm.jsx';`);
  if (modules.includes('profesionales'))      imports.push(`import { ${pascal}Profesionales } from './${pascal}Profesionales.jsx';`);
  if (modules.includes('recuperacion_leads')) imports.push(`import { ${pascal}Recovery }      from './${pascal}Recovery.jsx';`);
  if (modules.includes('presupuestos'))       imports.push(`import { ${pascal}Presupuestos }  from './${pascal}Presupuestos.jsx';`);
  if (modules.includes('dashboard'))          imports.push(`import { ${pascal}Dashboard }     from './${pascal}Dashboard.jsx';`);

  const cases = [];
  if (modules.includes('landing'))            cases.push(`      case 'landing':       return <${pascal}Landing />;`);
  if (modules.includes('chatbot_ia'))         cases.push(`      case 'chatbot':       return <${pascal}Chatbot />;`);
  if (modules.includes('agenda'))             cases.push(`      case 'agenda':        return <${pascal}Agenda />;`);
  if (modules.includes('tratamientos'))       cases.push(`      case 'tratamientos':  return <${pascal}Tratamientos />;`);
  if (modules.includes('crm') || modules.includes('pacientes_crm')) cases.push(`      case 'crm':           return <${pascal}Crm />;`);
  if (modules.includes('profesionales'))      cases.push(`      case 'profesionales': return <${pascal}Profesionales />;`);
  if (modules.includes('recuperacion_leads')) cases.push(`      case 'recovery':      return <${pascal}Recovery />;`);
  if (modules.includes('presupuestos'))       cases.push(`      case 'presupuestos':  return <${pascal}Presupuestos />;`);
  if (modules.includes('dashboard'))          cases.push(`      case 'dashboard':     return <${pascal}Dashboard />;`);

  const firstTab = modules.includes('landing') ? 'landing'
    : modules.includes('chatbot_ia') ? 'chatbot'
    : modules[0] ?? 'chatbot';
  cases.push(`      default:              return null;`);

  return `/**
 * OUTPUT GENERADO · ${biz.name} · App Shell
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
${imports.join('\n')}

const BRANDING = {
  nombre: ${nombre},
  inicial: ${inicial},
  color: ${color},
  tagline: ${tagline},
};

const TABS = [
  ${tabs.join(',\n  ')},
];

export function ${pascal}App() {
  const [activeTab, setActiveTab] = useState(${jsStr(firstTab)});
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
 * OUTPUT GENERADO · ${nombre} · Dashboard V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { MOCK_METRICAS, MOCK_LEADS_ABANDONO } from './${pascal}MockData.js';
import { HeroSection, MetricGrid, StatCard, Card, TimelineItem } from '../../core/AppShell.jsx';

const ACCENT = ${jsStr(color)};

function BarChart({ data, labelKey = 'sede', valueKey = 'consultas', color: c = ACCENT }) {
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 100, fontSize: 12, color: '#374151', flexShrink: 0 }}>{d[labelKey]}</span>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 10, overflow: 'hidden' }}>
            <div style={{ width: ((d[valueKey] ?? 0) / max * 100) + '%', background: c, height: '100%', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: '#64748b', width: 28, textAlign: 'right' }}>{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

const TIMELINE_ITEMS = [
  { icon: '🦷', title: 'Nueva cita confirmada', sub: 'Ana García · Ortodoncia', date: 'Hoy 09:15', color: ACCENT },
  { icon: '💼', title: 'Presupuesto aceptado', sub: 'Carlos López · Implante x2 · 3.600 €', date: 'Hoy 10:32', color: '#059669' },
  { icon: '🔄', title: 'Lead recuperado', sub: 'María Rodríguez via WhatsApp', date: 'Hoy 11:00', color: '#d97706' },
  { icon: '📅', title: 'Cita cancelada por paciente', sub: 'Pedro Moreno · Revisión 16:30', date: 'Hoy 14:20', color: '#dc2626' },
  { icon: '✅', title: 'Tratamiento completado', sub: 'Laura Sánchez · Endodoncia', date: 'Ayer 17:00', color: '#7c3aed' },
];

export function ${pascal}Dashboard() {
  const m = MOCK_METRICAS;
  const leadsActivos = MOCK_LEADS_ABANDONO.filter(l => l.estado !== 'recuperado').slice(0, 3);
  return (
    <div>
      <HeroSection
        color={ACCENT}
        badge="📊 Resumen del mes"
        title="Dashboard · ${nombre}"
        subtitle="Vista ejecutiva de actividad, ingresos y leads activos. Datos 100% ficticios."
      />

      <MetricGrid cols={4}>
        <StatCard label="Citas hoy" value={m.citas_hoy ?? 12} icon="📅" color={ACCENT} sub="programadas" trend="+3" trendUp={true} />
        <StatCard label="Nuevos pacientes" value={m.nuevos_pacientes ?? 8} icon="👥" color="#059669" sub="este mes" trend="+12%" trendUp={true} />
        <StatCard label="Ingresos mes" value={m.ingresos_mes} icon="💰" color="#7c3aed" sub="estimado" />
        <StatCard label="Tasa conversión" value={m.tasa_conversion + '%'} icon="📈" color="#d97706" sub="leads → cita" trend="+2%" trendUp={true} />
      </MetricGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {m.por_sede && m.por_sede.length > 0 && (
          <Card title="Actividad por sede" subtitle="Consultas este mes (ficticio)">
            <BarChart data={m.por_sede} labelKey="sede" valueKey="consultas" />
          </Card>
        )}

        <Card title="Actividad reciente" subtitle="Últimas acciones del sistema">
          {TIMELINE_ITEMS.map((item, i) => (
            <TimelineItem key={i} {...item} last={i === TIMELINE_ITEMS.length - 1} />
          ))}
        </Card>
      </div>

      {leadsActivos.length > 0 && (
        <Card title="Leads activos" subtitle="Requieren atención inmediata (ficticio)" style={{ marginBottom: 16 }}>
          {leadsActivos.map(lead => (
            <div key={lead.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{lead.nombre}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{lead.email} · {lead.fuente ?? 'web'}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: '#fef3c7', color: '#92400e',
              }}>Pendiente</span>
            </div>
          ))}
        </Card>
      )}

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
        Todos los datos mostrados son 100% ficticios. Prototipo generado por Fábrica SaaS V1.5.
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

// ── V1.5 · Landing.jsx ────────────────────────────────────────────────────────

export function genLanding(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const nombre = biz.name;
  const color  = br.primaryColor ?? '#0c7873';
  const tagline = br.tagline ?? 'Salud dental de excelencia para toda la familia';
  const cta    = manifest.experiencia?.booking_cta ?? 'Reservar cita gratis';

  return `/**
 * OUTPUT GENERADO · ${nombre} · Landing / Inicio V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { HeroSection, Card, Badge } from '../../core/AppShell.jsx';

const ACCENT = ${jsStr(color)};

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

export function ${pascal}Landing() {
  return (
    <div>
      <HeroSection
        color={ACCENT}
        badge="🦷 ${nombre}"
        title="${tagline}"
        subtitle="Más de 2.800 pacientes confían en nosotros. Primera visita de diagnóstico gratuita. Financiación sin intereses. · Datos ficticios"
        cta="${cta}"
        ctaSecondary="Conocer más"
      />

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28,
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
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
        }}>${cta}</button>
      </div>
    </div>
  );
}
`;
}

// ── V1.5 · Agenda.jsx ─────────────────────────────────────────────────────────

export function genAgenda(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const nombre = biz.name;
  const color  = br.primaryColor ?? '#0c7873';

  return `/**
 * OUTPUT GENERADO · ${nombre} · Agenda V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { Card, Badge, SectionTitle } from '../../core/AppShell.jsx';
import { MOCK_AGENDA } from './${pascal}MockData.js';

const ACCENT = ${jsStr(color)};

const ESTADO_BADGE = {
  confirmada: 'teal',
  pendiente:  'yellow',
  cancelada:  'red',
};

const SEMANA_DEMO = ['Lun 25/08', 'Mar 26/08', 'Mié 27/08', 'Jue 28/08', 'Vie 29/08'];

export function ${pascal}Agenda() {
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
      <SectionTitle sub="${nombre} · Semana demo ficticia · Datos 100% ficticios">
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
          <Card key={cita.id} style={{ borderLeft: \`3px solid \${ACCENT}\` }}>
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
`;
}

// ── V1.5 · Tratamientos.jsx ───────────────────────────────────────────────────

export function genTratamientos(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const nombre = biz.name;
  const color  = br.primaryColor ?? '#0c7873';

  return `/**
 * OUTPUT GENERADO · ${nombre} · Tratamientos V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { Card, Badge, SectionTitle, PillTabs } from '../../core/AppShell.jsx';
import { MOCK_TRATAMIENTOS } from './${pascal}MockData.js';

const ACCENT = ${jsStr(color)};

const CATEGORIAS = [
  { id: 'todos',      label: 'Todos',       icon: '🔬' },
  { id: 'General',    label: 'General',     icon: '🪥' },
  { id: 'Ortodoncia', label: 'Ortodoncia',  icon: '🦷' },
  { id: 'Implantes',  label: 'Implantes',   icon: '🔩' },
  { id: 'Estética',   label: 'Estética',    icon: '✨' },
  { id: 'Periodoncia',label: 'Periodoncia', icon: '🩺' },
];

export function ${pascal}Tratamientos() {
  const [cat, setCat] = useState('todos');

  const lista = cat === 'todos'
    ? MOCK_TRATAMIENTOS
    : MOCK_TRATAMIENTOS.filter(t => t.categoria === cat);

  return (
    <div>
      <SectionTitle sub="${nombre} · Catálogo de tratamientos · Datos 100% ficticios">
        Tratamientos disponibles
      </SectionTitle>

      <PillTabs tabs={CATEGORIAS} active={cat} onChange={setCat} color={ACCENT} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
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
`;
}

// ── V1.5 · Profesionales.jsx ──────────────────────────────────────────────────

export function genProfesionales(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const nombre = biz.name;
  const color  = br.primaryColor ?? '#0c7873';
  const sedes  = manifest.sedes ?? [{ nombre: 'Sede Principal (ficticio)' }];
  const pros   = (manifest.demoData?.professionals ?? []).slice(0, 6);

  const prosEnriquecidos = pros.map((p, i) => ({
    ...p,
    sede: sedes[i % sedes.length]?.nombre ?? 'Sede Principal (ficticio)',
    pacientes_mes: 20 + i * 5,
    proximas_citas: 8 + i * 2,
    disponible: i % 3 !== 2,
  }));
  const prosJson = JSON.stringify(prosEnriquecidos, null, 2);

  return `/**
 * OUTPUT GENERADO · ${nombre} · Profesionales V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { Card, Badge, SectionTitle } from '../../core/AppShell.jsx';

const ACCENT = ${jsStr(color)};

const PROFESIONALES = ${prosJson};

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
      boxShadow: \`0 2px 8px \${c}55\`,
    }}>{initials || '?'}</div>
  );
}

export function ${pascal}Profesionales() {
  return (
    <div>
      <SectionTitle sub="${nombre} · Equipo médico · Datos 100% ficticios">
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
`;
}

// ── V1.5 · Presupuestos.jsx ───────────────────────────────────────────────────

export function genPresupuestos(manifest) {
  const biz    = manifest.business;
  const br     = manifest.branding ?? {};
  const pascal = toPascalCase(biz.slug);
  const nombre = biz.name;
  const color  = br.primaryColor ?? '#0c7873';

  return `/**
 * OUTPUT GENERADO · ${nombre} · Presupuestos V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:${biz.slug}
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { Card, Badge, SectionTitle, Table } from '../../core/AppShell.jsx';
import { MOCK_PRESUPUESTOS } from './${pascal}MockData.js';

const ACCENT = ${jsStr(color)};

const ESTADO_BADGE = {
  borrador:   'gray',
  enviado:    'yellow',
  aceptado:   'teal',
  completado: 'green',
};

const PIPELINE = ['borrador', 'enviado', 'aceptado', 'completado'];

export function ${pascal}Presupuestos() {
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
      <SectionTitle sub="${nombre} · Gestión de presupuestos · Datos 100% ficticios">
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
