/**
 * Veterinary Vertical — Mock Data
 * All data is completely fictitious. No real persons, animals, or contacts.
 */

export const VETERINARY_MOCK_VERSION = '1.0.0';

export const DEMO_OWNERS = Object.freeze([
  { id: 'own-001', nombre: 'María García López',   telefono: '612 345 678', email: 'maria.garcia@demo.test',   mascotas: ['pet-001', 'pet-002'] },
  { id: 'own-002', nombre: 'Carlos Martínez Ruiz', telefono: '623 456 789', email: 'carlos.martinez@demo.test', mascotas: ['pet-003'] },
  { id: 'own-003', nombre: 'Ana Rodríguez Pérez',  telefono: '634 567 890', email: 'ana.rodriguez@demo.test',   mascotas: ['pet-004'] },
  { id: 'own-004', nombre: 'Luis Sánchez Díaz',    telefono: '645 678 901', email: 'luis.sanchez@demo.test',    mascotas: ['pet-005'] },
  { id: 'own-005', nombre: 'Elena Fernández Gil',  telefono: '656 789 012', email: 'elena.fernandez@demo.test', mascotas: ['pet-006'] },
]);

export const DEMO_PETS = Object.freeze([
  { id: 'pet-001', ownerId: 'own-001', nombre: 'Luna',  especie: 'Perro',  raza: 'Labrador Retriever', edad: '3 años',  peso: '28 kg',  microchip: 'DEMO-CHIP-001' },
  { id: 'pet-002', ownerId: 'own-001', nombre: 'Mochi', especie: 'Gato',   raza: 'Europeo Común',      edad: '5 años',  peso: '4.2 kg', microchip: 'DEMO-CHIP-002' },
  { id: 'pet-003', ownerId: 'own-002', nombre: 'Max',   especie: 'Perro',  raza: 'Golden Retriever',   edad: '7 años',  peso: '34 kg',  microchip: 'DEMO-CHIP-003' },
  { id: 'pet-004', ownerId: 'own-003', nombre: 'Bella', especie: 'Perro',  raza: 'Bulldog Francés',    edad: '2 años',  peso: '11 kg',  microchip: 'DEMO-CHIP-004' },
  { id: 'pet-005', ownerId: 'own-004', nombre: 'Thor',  especie: 'Perro',  raza: 'Husky Siberiano',    edad: '4 años',  peso: '25 kg',  microchip: 'DEMO-CHIP-005' },
  { id: 'pet-006', ownerId: 'own-005', nombre: 'Nala',  especie: 'Gato',   raza: 'Maine Coon',         edad: '6 años',  peso: '5.8 kg', microchip: 'DEMO-CHIP-006' },
]);

export const DEMO_APPOINTMENTS = Object.freeze([
  { id: 'apt-001', petId: 'pet-001', ownerId: 'own-001', fecha: '2026-09-01', hora: '09:00', motivo: 'Revisión anual',        estado: 'confirmada',  veterinario: 'Dr. Nexo' },
  { id: 'apt-002', petId: 'pet-003', ownerId: 'own-002', fecha: '2026-09-01', hora: '10:00', motivo: 'Vacunación antirrábica', estado: 'confirmada',  veterinario: 'Dra. Valle' },
  { id: 'apt-003', petId: 'pet-004', ownerId: 'own-003', fecha: '2026-09-01', hora: '11:00', motivo: 'Consulta piel',         estado: 'pendiente',   veterinario: 'Dr. Nexo' },
  { id: 'apt-004', petId: 'pet-005', ownerId: 'own-004', fecha: '2026-09-02', hora: '09:30', motivo: 'Desparasitación',       estado: 'confirmada',  veterinario: 'Dra. Valle' },
  { id: 'apt-005', petId: 'pet-006', ownerId: 'own-005', fecha: '2026-09-02', hora: '10:30', motivo: 'Revisión postoperatoria',estado: 'pendiente',  veterinario: 'Dr. Nexo' },
  { id: 'apt-006', petId: 'pet-002', ownerId: 'own-001', fecha: '2026-09-03', hora: '12:00', motivo: 'Nutrición y peso',      estado: 'pendiente',   veterinario: 'Dra. Valle' },
]);

export const DEMO_VACCINATIONS = Object.freeze([
  { id: 'vac-001', petId: 'pet-001', tipo: 'Antirrábica',           fecha: '2025-09-01', proxima: '2026-09-01', lote: 'DEMO-LOT-A1', veterinario: 'Dr. Nexo' },
  { id: 'vac-002', petId: 'pet-001', tipo: 'Polivalente canina',    fecha: '2025-09-01', proxima: '2026-09-01', lote: 'DEMO-LOT-B2', veterinario: 'Dr. Nexo' },
  { id: 'vac-003', petId: 'pet-003', tipo: 'Antirrábica',           fecha: '2025-08-15', proxima: '2026-08-15', lote: 'DEMO-LOT-C3', veterinario: 'Dra. Valle' },
  { id: 'vac-004', petId: 'pet-002', tipo: 'Triple felina',         fecha: '2026-01-10', proxima: '2027-01-10', lote: 'DEMO-LOT-D4', veterinario: 'Dra. Valle' },
  { id: 'vac-005', petId: 'pet-004', tipo: 'Polivalente canina',    fecha: '2025-12-01', proxima: '2026-12-01', lote: 'DEMO-LOT-E5', veterinario: 'Dr. Nexo' },
]);

export const DEMO_TREATMENTS = Object.freeze([
  { id: 'trt-001', petId: 'pet-001', tipo: 'Desparasitación interna', inicio: '2026-08-01', fin: '2026-08-07', medicacion: 'Milbemax (DEMO)',  dosis: '1 comprimido',   frecuencia: 'Única' },
  { id: 'trt-002', petId: 'pet-003', tipo: 'Antibiótico otitis',      inicio: '2026-07-20', fin: '2026-07-30', medicacion: 'Osurnia (DEMO)',    dosis: 'Según protocolo', frecuencia: 'Día 1 y 7' },
  { id: 'trt-003', petId: 'pet-006', tipo: 'Control de peso',         inicio: '2026-06-01', fin: null,         medicacion: 'Dieta Hills c/d (DEMO)', dosis: '55g/día',  frecuencia: 'Diaria' },
]);

export const DEMO_SERVICES = Object.freeze([
  { id: 'svc-001', nombre: 'Consulta General',        precio: '45 €',  duracion: '30 min', descripcion: 'Revisión completa de salud de tu mascota' },
  { id: 'svc-002', nombre: 'Vacunación',              precio: '35 €',  duracion: '15 min', descripcion: 'Vacunas según calendario sanitario oficial' },
  { id: 'svc-003', nombre: 'Desparasitación',         precio: '25 €',  duracion: '10 min', descripcion: 'Tratamiento antiparasitario interno y externo' },
  { id: 'svc-004', nombre: 'Cirugía',                 precio: 'Desde 350 €', duracion: 'Variable', descripcion: 'Procedimientos quirúrgicos con anestesia especializada' },
  { id: 'svc-005', nombre: 'Peluquería Animal',       precio: '30 €',  duracion: '60 min', descripcion: 'Baño, cepillado y corte adaptado a la raza' },
  { id: 'svc-006', nombre: 'Nutrición y Dieta',       precio: '40 €',  duracion: '30 min', descripcion: 'Asesoramiento nutricional personalizado para tu mascota' },
  { id: 'svc-007', nombre: 'Hospitalización',         precio: '80 €/día', duracion: '24h',  descripcion: 'Cuidados intensivos y vigilancia 24 horas' },
  { id: 'svc-008', nombre: 'Radiografía digital',     precio: '60 €',  duracion: '20 min', descripcion: 'Diagnóstico por imagen de alta resolución' },
]);

export const DASHBOARD_STATS = Object.freeze([
  { id: 'kpi-001', label: 'Citas hoy',          valor: 12,  tendencia: '+3',   icon: '📅', color: '#0d9488' },
  { id: 'kpi-002', label: 'Mascotas atendidas', valor: 287, tendencia: '+18',  icon: '🐾', color: '#0891b2' },
  { id: 'kpi-003', label: 'Vacunas pendientes', valor: 14,  tendencia: '-2',   icon: '💉', color: '#f59e0b' },
  { id: 'kpi-004', label: 'Nuevos propietarios',valor: 8,   tendencia: '+2',   icon: '👥', color: '#10b981' },
]);

export const DEMO_FAQ = Object.freeze([
  { id: 'faq-001', pregunta: '¿Con qué antelación debo pedir cita?', respuesta: 'Recomendamos pedir cita con al menos 24h de antelación. Para urgencias, llámanos directamente.' },
  { id: 'faq-002', pregunta: '¿Debo traer a mi mascota en ayunas?', respuesta: 'Solo si la visita implica sedación o cirugía. Para consultas rutinarias, no es necesario.' },
  { id: 'faq-003', pregunta: '¿Cuándo necesita vacunarse mi perro?', respuesta: 'El calendario base incluye la primera vacuna a las 6-8 semanas y refuerzos anuales. Tu veterinario te guiará según la especie y estilo de vida.' },
  { id: 'faq-004', pregunta: '¿Qué hago en caso de urgencia?', respuesta: 'Llámanos al número de urgencias. Si está fuera de horario, el contestador te indicará el protocolo de urgencias 24h.' },
  { id: 'faq-005', pregunta: '¿Aceptáis todas las razas y especies?', respuesta: 'Atendemos perros, gatos y otras especies habituales. Consulta para animales exóticos.' },
]);
