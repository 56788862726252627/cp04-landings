// CRM Lead Fixtures — ADV-09 (fictional B2B businesses, isReal: false)

import { createCRMLead, CRM_LEAD_STATUS, CRM_PRIORITY } from '../crmLead.js';

export const CRM_FIXTURE_COUNT = 40;

const RAW = [
  { businessName: 'FisioActiva Madrid',           sector: 'physiotherapy',   location: 'Madrid',     temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED, priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Dental Sonrisa Blanca',         sector: 'dental',          location: 'Barcelona',  temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,    priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Pilates Cuerpo Libre',          sector: 'wellness',        location: 'Valencia',   temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'AutoMáquina Sevilla',           sector: 'automotive',      location: 'Sevilla',    temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P2_MEDIUM },
  { businessName: 'Clínica Óptica Norte',          sector: 'optics',          location: 'Bilbao',     temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Academia Idiomas Plus',         sector: 'education',       location: 'Zaragoza',   temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Gym Force Málaga',              sector: 'fitness',         location: 'Málaga',     temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Peluquería Style Centro',       sector: 'beauty',          location: 'Madrid',     temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P2_MEDIUM },
  { businessName: 'Veterinaria Mascotas Felices',  sector: 'veterinary',      location: 'Barcelona',  temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Estudio Yoga Equilibrio',       sector: 'wellness',        location: 'Palma',      temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Consultoría Nexo Legal',        sector: 'legal',           location: 'Madrid',     temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Fisio Sport Girona',            sector: 'physiotherapy',   location: 'Girona',     temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P2_MEDIUM },
  { businessName: 'Clinica Dental Arco Iris',      sector: 'dental',          location: 'Valencia',   temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Centro Estética Glow',          sector: 'beauty',          location: 'Madrid',     temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Autoescuela Rumbo',             sector: 'automotive',      location: 'Alicante',   temperature: 'COLD', status: CRM_LEAD_STATUS.NURTURE,    priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Psicología Avanza',             sector: 'mental_health',   location: 'Barcelona',  temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Panadería Artesanal El Horno',  sector: 'food',            location: 'Sevilla',    temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Óptica Visión Clara',           sector: 'optics',          location: 'Murcia',     temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Restaurante Sabor Auténtico',   sector: 'hospitality',     location: 'Málaga',     temperature: 'COLD', status: CRM_LEAD_STATUS.NURTURE,    priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Academia Danza Ritmo',          sector: 'arts',            location: 'Madrid',     temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Electricidad Hogar Plus',       sector: 'home_services',   location: 'Valencia',   temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P2_MEDIUM },
  { businessName: 'Clínica Quiropráctica Palma',   sector: 'physiotherapy',   location: 'Palma',      temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Taller Mecánica Rápida',        sector: 'automotive',      location: 'Córdoba',    temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Centro Nutrición Equilibra',    sector: 'nutrition',       location: 'Barcelona',  temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Librería Cultural Página',      sector: 'retail',          location: 'Madrid',     temperature: 'COLD', status: CRM_LEAD_STATUS.NURTURE,    priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Clínica Podología Paso a Paso', sector: 'physiotherapy',   location: 'Zaragoza',   temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Guardería Pequeño Mundo',       sector: 'childcare',       location: 'Bilbao',     temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Fontanería Express',            sector: 'home_services',   location: 'Sevilla',    temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P2_MEDIUM },
  { businessName: 'Fisioterapia Respira',          sector: 'physiotherapy',   location: 'Alicante',   temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Peluquería Canina Happy Dog',   sector: 'veterinary',      location: 'Valencia',   temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Agencia Viajes Horizonte',      sector: 'travel',          location: 'Barcelona',  temperature: 'COLD', status: CRM_LEAD_STATUS.NURTURE,    priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Centro Logopedia Voz',          sector: 'health',          location: 'Madrid',     temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Estudio Pilates Core',          sector: 'wellness',        location: 'Málaga',     temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Escuela Música Armonía',        sector: 'arts',            location: 'Murcia',     temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Clínica Deportiva Sprint',      sector: 'sports_medicine', location: 'Barcelona',  temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
  { businessName: 'Centro Meditación Zen',         sector: 'wellness',        location: 'Palma',      temperature: 'COLD', status: CRM_LEAD_STATUS.NURTURE,    priority: CRM_PRIORITY.P3_LOW },
  { businessName: 'Inmobiliaria Costa Sol',        sector: 'real_estate',     location: 'Alicante',   temperature: 'WARM', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Peluquería Unisex Lumina',      sector: 'beauty',          location: 'Zaragoza',   temperature: 'COLD', status: CRM_LEAD_STATUS.ACTIVE,     priority: CRM_PRIORITY.P2_MEDIUM },
  { businessName: 'Clínica Acupuntura Herbal',     sector: 'alternative_health', location: 'Barcelona', temperature: 'WARM', status: CRM_LEAD_STATUS.QUALIFIED, priority: CRM_PRIORITY.P1_HIGH },
  { businessName: 'Fisio Extremadura Pro',         sector: 'physiotherapy',   location: 'Cáceres',    temperature: 'HOT',  status: CRM_LEAD_STATUS.QUALIFIED,  priority: CRM_PRIORITY.P0_CRITICAL },
];

export const CRM_FIXTURE_LEADS = Object.freeze(
  RAW.map((raw, i) => createCRMLead({
    id:           `crm_fixture_${String(i + 1).padStart(3, '0')}`,
    leadId:       `lead_fixture_${String(i + 1).padStart(3, '0')}`,
    businessName: raw.businessName,
    vertical:     raw.sector,
    location:     raw.location,
    source:       'FIXTURE',
    temperature:  raw.temperature,
    status:       raw.status,
    priority:     raw.priority,
    opportunityScore: raw.temperature === 'HOT' ? 82 : raw.temperature === 'WARM' ? 65 : 45,
    enteredCRMAt: '2026-09-01T09:00:00.000Z',
  }))
);
