/**
 * GENERATOR · Schema · Validación del manifiesto
 * Valida la estructura del manifiesto YAML parseado.
 * Sin dependencias externas. Retorna {valid, errors[]}.
 */

const MODULOS_VALIDOS = ['chatbot_ia', 'crm', 'reservas', 'recuperacion_leads', 'dashboard', 'rbac', 'auth', 'logs'];
const VERTICALES_VALIDOS = ['dental', 'padel', 'fisioterapia', 'legal', 'restaurante', 'peluqueria'];

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['El manifiesto debe ser un objeto válido'] };
  }

  const errors = [];

  if (!manifest.cliente || typeof manifest.cliente !== 'string') {
    errors.push('Campo requerido: cliente (string)');
  }

  if (!manifest.vertical || typeof manifest.vertical !== 'string') {
    errors.push('Campo requerido: vertical (string)');
  } else if (!VERTICALES_VALIDOS.includes(manifest.vertical)) {
    errors.push(`vertical inválido: "${manifest.vertical}". Válidos: ${VERTICALES_VALIDOS.join(', ')}`);
  }

  if (typeof manifest.modo_demo !== 'boolean') {
    errors.push('Campo requerido: modo_demo (boolean)');
  }

  if (!Array.isArray(manifest.modulos) || manifest.modulos.length === 0) {
    errors.push('Campo requerido: modulos (array no vacío)');
  } else {
    const invalidos = manifest.modulos.filter(m => !MODULOS_VALIDOS.includes(m));
    if (invalidos.length > 0) {
      errors.push(`Módulos inválidos: ${invalidos.join(', ')}. Válidos: ${MODULOS_VALIDOS.join(', ')}`);
    }
  }

  if (!Array.isArray(manifest.sedes) || manifest.sedes.length === 0) {
    errors.push('Campo requerido: sedes (array no vacío)');
  } else {
    manifest.sedes.forEach((s, i) => {
      if (!s.id) errors.push(`sedes[${i}]: falta campo id`);
      if (!s.nombre) errors.push(`sedes[${i}]: falta campo nombre`);
    });
  }

  if (manifest.integraciones && typeof manifest.integraciones === 'object') {
    if (manifest.integraciones.reales === true && manifest.modo_demo === true) {
      errors.push('Conflicto: integraciones.reales=true con modo_demo=true. En demo las integraciones deben ser false.');
    }
  }

  if (manifest.mock && manifest.mock.obligatorio !== true && manifest.modo_demo === true) {
    errors.push('En modo_demo=true, mock.obligatorio debe ser true');
  }

  return { valid: errors.length === 0, errors };
}
