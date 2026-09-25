/**
 * CORE V1.4 · DeploymentProvider (abstract)
 * Interfaz base para proveedores de despliegue.
 * Subclases implementan comandos específicos por proveedor.
 * Sin llamadas de red. Sin secretos reales.
 */

export class DeploymentProvider {
  constructor(config = {}) {
    this.providerName = config.providerName ?? 'abstract';
    this._config      = config;
  }

  getDeployCommands() {
    throw new Error(`${this.providerName}.getDeployCommands: no implementado en provider abstracto`);
  }

  getEnvVarMapping() {
    throw new Error(`${this.providerName}.getEnvVarMapping: no implementado en provider abstracto`);
  }

  getDryRunCommands() {
    throw new Error(`${this.providerName}.getDryRunCommands: no implementado en provider abstracto`);
  }

  getRollbackCommands() {
    throw new Error(`${this.providerName}.getRollbackCommands: no implementado en provider abstracto`);
  }

  generateEnvExample() {
    throw new Error(`${this.providerName}.generateEnvExample: no implementado en provider abstracto`);
  }

  getManualBoundary() {
    return {
      provider:      this.providerName,
      boundary:      'MANUAL_BOUNDARY',
      reason:        'Requiere credenciales del proveedor no disponibles en repo',
      prerequisites: [],
    };
  }

  getStatus() {
    return { provider: this.providerName, configured: false, _ficticio: true };
  }
}

export const SUPPORTED_PROVIDERS = Object.freeze(['cloudflare', 'vercel', 'netlify']);

export function isProviderSupported(name) {
  return SUPPORTED_PROVIDERS.includes(name);
}
