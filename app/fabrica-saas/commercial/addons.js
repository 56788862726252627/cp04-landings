/**
 * Agency Add-Ons Catalog
 * Extras that can be added to any package. Prices are indicative ranges.
 */

export const ADDONS_VERSION = '1.0.0';

export const ADDON_CATALOG = Object.freeze([
  { id: 'extra-module',          name: 'Módulo adicional',              category: 'saas',      setupRange: [200, 400],  monthlyRange: [30, 50],  complexity: 'MEDIUM', requirements: ['saas-local-pro'], dependencies: [] },
  { id: 'extra-role',            name: 'Rol adicional',                 category: 'saas',      setupRange: [100, 200],  monthlyRange: [15, 30],  complexity: 'LOW',    requirements: ['saas-local-pro'], dependencies: [] },
  { id: 'extra-automation',      name: 'Automatización adicional',      category: 'automation', setupRange: [250, 450],  monthlyRange: [25, 40],  complexity: 'MEDIUM', requirements: ['make_subscription'], dependencies: ['automatizacion-negocio'] },
  { id: 'extra-ai-agent',        name: 'Agente IA adicional',           category: 'ai',        setupRange: [350, 600],  monthlyRange: [50, 80],  complexity: 'MEDIUM', requirements: ['anthropic_api_key'], dependencies: ['agente-ia'] },
  { id: 'extra-integration',     name: 'Integración adicional',         category: 'integration',setupRange: [300, 600],  monthlyRange: [35, 55],  complexity: 'HIGH',   requirements: ['external_api'], dependencies: ['saas-local-pro'] },
  { id: 'data-migration',        name: 'Migración de datos',            category: 'data',      setupRange: [400, 2000], monthlyRange: [0, 0],    complexity: 'HIGH',   requirements: ['data_source'], dependencies: [] },
  { id: 'multilingual',          name: 'Multiidioma (por idioma)',       category: 'content',   setupRange: [500, 800],  monthlyRange: [20, 40],  complexity: 'MEDIUM', requirements: ['saas-local-pro'], dependencies: [] },
  { id: 'advanced-dashboard',    name: 'Dashboard avanzado',            category: 'analytics', setupRange: [600, 1200], monthlyRange: [50, 80],  complexity: 'MEDIUM', requirements: ['saas-local-pro'], dependencies: [] },
  { id: 'whatsapp-channel',      name: 'Canal WhatsApp Business',       category: 'comms',     setupRange: [400, 700],  monthlyRange: [40, 70],  complexity: 'MEDIUM', requirements: ['whatsapp_business_account'], dependencies: [] },
  { id: 'payment-gateway',       name: 'Pasarela de pago',              category: 'payments',  setupRange: [500, 900],  monthlyRange: [40, 70],  complexity: 'HIGH',   requirements: ['stripe_account', 'legal_entity'], dependencies: [] },
  { id: 'custom-api',            name: 'API personalizada',             category: 'dev',       setupRange: [700, 1500], monthlyRange: [60, 100], complexity: 'HIGH',   requirements: ['technical_spec'], dependencies: ['saas-local-pro'] },
  { id: 'training-session',      name: 'Sesión de formación (2h)',       category: 'training',  setupRange: [150, 250],  monthlyRange: [0, 0],    complexity: 'LOW',    requirements: ['client_availability'], dependencies: [] },
  { id: 'content-creation',      name: 'Creación de contenido',         category: 'content',   setupRange: [400, 1500], monthlyRange: [0, 0],    complexity: 'MEDIUM', requirements: ['brand_assets'], dependencies: [] },
  { id: 'seo-setup',             name: 'SEO básico',                    category: 'marketing', setupRange: [500, 900],  monthlyRange: [0, 0],    complexity: 'MEDIUM', requirements: ['landing-comercial'], dependencies: [] },
  { id: 'priority-support-upgrade', name: 'Upgrade a soporte prioritario', category: 'support', setupRange: [0, 0],  monthlyRange: [100, 180], complexity: 'LOW',    requirements: ['maintenance_contract'], dependencies: [] },
  { id: 'branding-premium',      name: 'Branding premium (logo + guía)', category: 'branding', setupRange: [600, 1200], monthlyRange: [0, 0],    complexity: 'MEDIUM', requirements: ['brand_brief'], dependencies: [] },
  { id: 'multi-sede',            name: 'Multi-sede',                    category: 'saas',      setupRange: [800, 2000], monthlyRange: [80, 150], complexity: 'HIGH',   requirements: ['saas-local-pro'], dependencies: [] },
  { id: 'advanced-reporting',    name: 'Reporting avanzado',            category: 'analytics', setupRange: [500, 1000], monthlyRange: [40, 70],  complexity: 'MEDIUM', requirements: ['saas-local-pro'], dependencies: [] },
]);

export function getAddonById(id) {
  return ADDON_CATALOG.find(a => a.id === id) ?? null;
}

export function getAddonsByCategory(category) {
  return ADDON_CATALOG.filter(a => a.category === category);
}

export function listAddonIds() {
  return ADDON_CATALOG.map(a => a.id);
}
