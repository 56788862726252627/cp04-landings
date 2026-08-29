/**
 * OUTPUT GENERADO · FisioNova (Demo) · App Shell
 * Generado por Fábrica SaaS V1.7 · Dynamic Experience Engine
 * Demo comercial · Datos 100% ficticios · NO producción
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { FisioNovaLanding }       from './FisioNovaLanding.jsx';
import { FisioNovaAgenda }        from './FisioNovaAgenda.jsx';
import { FisioNovaPacientes }     from './FisioNovaPacientes.jsx';
import { FisioNovaTratamientos }  from './FisioNovaTratamientos.jsx';
import { FisioNovaProfesionales } from './FisioNovaProfesionales.jsx';
import { FisioNovaEvolucion }     from './FisioNovaEvolucion.jsx';
import { FisioNovaEjercicios }    from './FisioNovaEjercicios.jsx';
import { FisioNovaPresupuestos }  from './FisioNovaPresupuestos.jsx';
import { FisioNovaLeads }         from './FisioNovaLeads.jsx';
import { FisioNovaDashboard }     from './FisioNovaDashboard.jsx';
import { FisioNovaAsistente }     from './FisioNovaAsistente.jsx';

const BRANDING = {
  nombre:   'FisioNova',
  inicial:  'FN',
  color:    '#4338ca',
  tagline:  'Muévete mejor, vive sin dolor',
};

const TABS = [
  { id: 'inicio',        label: 'Inicio',         icon: '🏠' },
  { id: 'agenda',        label: 'Agenda',          icon: '📅' },
  { id: 'pacientes',     label: 'Pacientes',       icon: '👥' },
  { id: 'tratamientos',  label: 'Tratamientos',    icon: '🩺' },
  { id: 'profesionales', label: 'Profesionales',   icon: '👩‍⚕️' },
  { id: 'evolucion',     label: 'Evolución',       icon: '📈' },
  { id: 'ejercicios',    label: 'Ejercicios',      icon: '💪' },
  { id: 'presupuestos',  label: 'Presupuestos',    icon: '💼' },
  { id: 'leads',         label: 'Leads',           icon: '🎯' },
  { id: 'dashboard',     label: 'Dashboard',       icon: '📊' },
  { id: 'asistente',     label: 'Asistente IA',    icon: '🤖' },
];

export function FisioNovaApp() {
  const [activeTab, setActiveTab] = useState('inicio');

  const renderTab = () => {
    switch (activeTab) {
      case 'inicio':        return <FisioNovaLanding />;
      case 'agenda':        return <FisioNovaAgenda />;
      case 'pacientes':     return <FisioNovaPacientes />;
      case 'tratamientos':  return <FisioNovaTratamientos />;
      case 'profesionales': return <FisioNovaProfesionales />;
      case 'evolucion':     return <FisioNovaEvolucion />;
      case 'ejercicios':    return <FisioNovaEjercicios />;
      case 'presupuestos':  return <FisioNovaPresupuestos />;
      case 'leads':         return <FisioNovaLeads />;
      case 'dashboard':     return <FisioNovaDashboard />;
      case 'asistente':     return <FisioNovaAsistente />;
      default:              return null;
    }
  };

  return (
    <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} branding={BRANDING}>
      {renderTab()}
    </AppShell>
  );
}
