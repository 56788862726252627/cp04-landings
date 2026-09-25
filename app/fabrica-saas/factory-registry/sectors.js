/**
 * Factory Registry — Sector Registry V2
 * All supported verticals with metadata for selection, hero, and palette hints.
 */

export const SECTOR_REGISTRY = Object.freeze([
  { id: 'dental',     label: 'Clínica Dental',   preset: 'clinical-premium',       icon: '🦷', color: '#0369a1' },
  { id: 'salud',      label: 'Salud General',     preset: 'clinical-premium',       icon: '🏥', color: '#0284c7' },
  { id: 'fisio',      label: 'Fisioterapia',      preset: 'clinical-premium',       icon: '🫁', color: '#0891b2' },
  { id: 'estetica',   label: 'Estética',          preset: 'luxury-editorial',       icon: '✨', color: '#d97706' },
  { id: 'spa',        label: 'Spa & Bienestar',   preset: 'luxury-editorial',       icon: '🧖', color: '#9333ea' },
  { id: 'padel',      label: 'Pádel / Deporte',   preset: 'sports-dynamic',         icon: '🎾', color: '#ef4444' },
  { id: 'fitness',    label: 'Fitness / Gym',     preset: 'sports-dynamic',         icon: '💪', color: '#f97316' },
  { id: 'tech',       label: 'SaaS / Tech',       preset: 'tech-futuristic',        icon: '🚀', color: '#6366f1' },
  { id: 'educacion',  label: 'Educación',         preset: 'education-interactive',  icon: '📚', color: '#1d4ed8' },
  { id: 'legal',      label: 'Legal / Abogados',  preset: 'professional-authority', icon: '⚖️', color: '#1e293b' },
  { id: 'consultoria',label: 'Consultoría',       preset: 'professional-authority', icon: '💼', color: '#334155' },
  { id: 'restaurante',label: 'Restaurante',       preset: 'friendly-human',         icon: '🍽️', color: '#16a34a' },
  { id: 'comercio',   label: 'Comercio Local',    preset: 'friendly-human',         icon: '🏪', color: '#15803d' },
  { id: 'portfolio',  label: 'Portfolio / Agencia',preset: 'immersive-showcase',    icon: '🎨', color: '#7c3aed' },
  { id: 'analytics',  label: 'Analítica / ERP',   preset: 'data-heavy-saas',        icon: '📊', color: '#3b82f6' },
  { id: 'veterinary', label: 'Clínica Veterinaria',preset: 'friendly-human',          icon: '🐾', color: '#0d9488' },
]);

export function getSectorById(id) {
  return SECTOR_REGISTRY.find(s => s.id === id) ?? null;
}

export function listSectorIds() {
  return SECTOR_REGISTRY.map(s => s.id);
}
