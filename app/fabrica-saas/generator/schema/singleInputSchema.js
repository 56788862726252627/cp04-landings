/**
 * GENERATOR · Schema V1.2 · Validación del manifest de un solo prompt
 * Extiende el contrato v1.0. Compatible hacia atrás con manifests v1.0.
 * Nuevo en V1.2: campos business, branding, demoData, modules extendidos.
 * Sin dependencias externas. Retorna { valid, errors[] }.
 */

export const VERTICALES_VALIDOS = [
  'dental', 'padel', 'fisioterapia', 'estetica',
  'abogados', 'legal', 'restaurante', 'peluqueria',
];

export const MODULES_VALIDOS = [
  'chatbot_ia', 'crm', 'reservas', 'recuperacion_leads',
  'dashboard', 'professionals', 'rbac', 'auth', 'logs', 'analytics',
];

const HEX_RE  = /^#[0-9a-fA-F]{6}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function validateSingleInputManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['El manifiesto debe ser un objeto válido'] };
  }
  const errors = [];

  // ── business (required in V1.2) ───────────────────────────────────────────
  const biz = manifest.business;
  if (!biz || typeof biz !== 'object') {
    errors.push('Campo requerido: business (objeto con name, slug, vertical)');
  } else {
    if (!biz.name || typeof biz.name !== 'string' || biz.name.trim().length < 3) {
      errors.push('business.name: requerido, string, mínimo 3 caracteres');
    }
    if (!biz.slug || typeof biz.slug !== 'string') {
      errors.push('business.slug: requerido (string, ej: mi-cliente-demo)');
    } else if (biz.slug.length < 4 || !SLUG_RE.test(biz.slug)) {
      errors.push('business.slug: solo minúsculas, números y guiones; mín 4 chars; no empieza/termina en guion');
    }
    if (!biz.vertical || typeof biz.vertical !== 'string') {
      errors.push('business.vertical: requerido (string)');
    } else if (!VERTICALES_VALIDOS.includes(biz.vertical)) {
      errors.push(`business.vertical "${biz.vertical}" inválido. Válidos: ${VERTICALES_VALIDOS.join(', ')}`);
    }
  }

  // ── branding (optional, validated if present) ─────────────────────────────
  const br = manifest.branding;
  if (br && typeof br === 'object') {
    if (br.inicial !== undefined) {
      if (typeof br.inicial !== 'string' || [...br.inicial].length !== 1) {
        errors.push('branding.inicial: debe ser exactamente 1 carácter');
      }
    }
    if (br.primaryColor !== undefined && typeof br.primaryColor === 'string') {
      if (!HEX_RE.test(br.primaryColor)) {
        errors.push('branding.primaryColor: color hex inválido — usar formato #rrggbb');
      }
    }
  }

  // ── modules (optional, validated if present) ──────────────────────────────
  if (manifest.modules !== undefined) {
    if (!Array.isArray(manifest.modules)) {
      errors.push('modules debe ser un array');
    } else {
      const invalidos = manifest.modules.filter(m => !MODULES_VALIDOS.includes(m));
      if (invalidos.length > 0) {
        errors.push(`Módulos inválidos: ${invalidos.join(', ')}. Válidos: ${MODULES_VALIDOS.join(', ')}`);
      }
    }
  }

  // ── sedes (required) ──────────────────────────────────────────────────────
  if (!Array.isArray(manifest.sedes) || manifest.sedes.length === 0) {
    errors.push('Campo requerido: sedes (array no vacío)');
  } else {
    manifest.sedes.forEach((s, i) => {
      if (!s.id)     errors.push(`sedes[${i}]: falta campo id`);
      if (!s.nombre) errors.push(`sedes[${i}]: falta campo nombre`);
    });
  }

  // ── modo_demo + integraciones + mock ──────────────────────────────────────
  if (manifest.modo_demo === true && manifest.integraciones?.reales === true) {
    errors.push('Conflicto: integraciones.reales=true con modo_demo=true');
  }
  if (manifest.modo_demo === true && manifest.mock?.obligatorio !== true) {
    errors.push('En modo_demo=true, mock.obligatorio debe ser true');
  }

  // ── demoData (optional, validated if present) ─────────────────────────────
  const dd = manifest.demoData;
  if (dd && typeof dd === 'object') {
    if (dd.professionals !== undefined && !Array.isArray(dd.professionals)) {
      errors.push('demoData.professionals debe ser un array');
    }
    if (Array.isArray(dd.professionals)) {
      dd.professionals.forEach((p, i) => {
        if (!p.id)     errors.push(`demoData.professionals[${i}]: falta id`);
        if (!p.nombre) errors.push(`demoData.professionals[${i}]: falta nombre`);
      });
    }
    if (dd.slots !== undefined && !Array.isArray(dd.slots)) {
      errors.push('demoData.slots debe ser un array');
    }
    if (dd.clients !== undefined && !Array.isArray(dd.clients)) {
      errors.push('demoData.clients debe ser un array');
    }
    if (dd.leads_abandono !== undefined && !Array.isArray(dd.leads_abandono)) {
      errors.push('demoData.leads_abandono debe ser un array');
    }
    // Safety: no real data leakage
    if (dd.clients && Array.isArray(dd.clients)) {
      dd.clients.forEach((c, i) => {
        if (c.email && !c.email.endsWith('@demo.ficticio')) {
          errors.push(`demoData.clients[${i}].email debe terminar en @demo.ficticio (datos demo únicamente)`);
        }
      });
    }
    if (dd.leads_abandono && Array.isArray(dd.leads_abandono)) {
      dd.leads_abandono.forEach((l, i) => {
        if (l.email && !l.email.endsWith('@demo.ficticio')) {
          errors.push(`demoData.leads_abandono[${i}].email debe terminar en @demo.ficticio`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
