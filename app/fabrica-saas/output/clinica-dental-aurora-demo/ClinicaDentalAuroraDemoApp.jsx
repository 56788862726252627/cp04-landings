/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · App Shell
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { ClinicaDentalAuroraDemoLanding }       from './ClinicaDentalAuroraDemoLanding.jsx';
import { ClinicaDentalAuroraDemoChatbot }       from './ClinicaDentalAuroraDemoChatbot.jsx';
import { ClinicaDentalAuroraDemoAgenda }        from './ClinicaDentalAuroraDemoAgenda.jsx';
import { ClinicaDentalAuroraDemoTratamientos }  from './ClinicaDentalAuroraDemoTratamientos.jsx';
import { ClinicaDentalAuroraDemoCrm }           from './ClinicaDentalAuroraDemoCrm.jsx';
import { ClinicaDentalAuroraDemoProfesionales } from './ClinicaDentalAuroraDemoProfesionales.jsx';
import { ClinicaDentalAuroraDemoRecovery }      from './ClinicaDentalAuroraDemoRecovery.jsx';
import { ClinicaDentalAuroraDemoPresupuestos }  from './ClinicaDentalAuroraDemoPresupuestos.jsx';
import { ClinicaDentalAuroraDemoDashboard }     from './ClinicaDentalAuroraDemoDashboard.jsx';

const BRANDING = {
  nombre: "Clínica Dental Aurora",
  inicial: "A",
  color: "#0c7873",
  tagline: "Salud dental de excelencia para toda la familia",
};

const TABS = [
  { id: 'landing',        label: 'Inicio',         icon: '🏠' },
  { id: 'chatbot',        label: 'Asistente IA',   icon: "🦷" },
  { id: 'agenda',         label: 'Agenda',         icon: '📅' },
  { id: 'tratamientos',   label: 'Tratamientos',   icon: '🔬' },
  { id: 'crm',            label: 'Pacientes',      icon: '👥' },
  { id: 'profesionales',  label: 'Profesionales',  icon: '👨‍⚕️' },
  { id: 'recovery',       label: 'Leads',          icon: '🔄' },
  { id: 'presupuestos',   label: 'Presupuestos',   icon: '💼' },
  { id: 'dashboard',      label: 'Dashboard',      icon: '📊' },
];

export function ClinicaDentalAuroraDemoApp() {
  const [activeTab, setActiveTab] = useState("landing");
  const renderTab = () => {
    switch (activeTab) {
      case 'landing':       return <ClinicaDentalAuroraDemoLanding />;
      case 'chatbot':       return <ClinicaDentalAuroraDemoChatbot />;
      case 'agenda':        return <ClinicaDentalAuroraDemoAgenda />;
      case 'tratamientos':  return <ClinicaDentalAuroraDemoTratamientos />;
      case 'crm':           return <ClinicaDentalAuroraDemoCrm />;
      case 'profesionales': return <ClinicaDentalAuroraDemoProfesionales />;
      case 'recovery':      return <ClinicaDentalAuroraDemoRecovery />;
      case 'presupuestos':  return <ClinicaDentalAuroraDemoPresupuestos />;
      case 'dashboard':     return <ClinicaDentalAuroraDemoDashboard />;
      default:              return null;
    }
  };
  return (
    <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} branding={BRANDING}>
      {renderTab()}
    </AppShell>
  );
}
