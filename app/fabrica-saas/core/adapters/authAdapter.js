/**
 * CORE V1.3 · AuthAdapter
 * mock: usuario ficticio, sesión local, sin red.
 * real-placeholder: interfaz preparada, falla seguro sin credenciales.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

const MOCK_USERS = [
  { userId: 'mock-admin-001', email: 'admin@demo.ficticio',   name: 'Admin Demo (ficticio)',   role: 'admin',   token: 'mock-token-admin-001' },
  { userId: 'mock-staff-001', email: 'staff@demo.ficticio',   name: 'Staff Demo (ficticio)',   role: 'staff',   token: 'mock-token-staff-001' },
  { userId: 'mock-user-001',  email: 'user@demo.ficticio',    name: 'Usuario Demo (ficticio)', role: 'user',    token: 'mock-token-user-001'  },
  { userId: 'mock-sup-001',   email: 'support@demo.ficticio', name: 'Soporte Demo (ficticio)', role: 'support', token: 'mock-token-sup-001'   },
];

export class AuthAdapter {
  constructor(config = {}) {
    this.mode   = config.authMode ?? AUTH_MODE.MOCK;
    this.status = 'initialized';
    this._sessions = new Map();
  }

  async login(email) {
    if (this.mode === AUTH_MODE.MOCK) return this._mockLogin(email);
    return this._realPlaceholder('login', 'AUTH_PROVIDER_URL, AUTH_CLIENT_ID');
  }

  async logout(token) {
    if (this.mode === AUTH_MODE.MOCK) {
      this._sessions.delete(token);
      return { success: true };
    }
    return this._realPlaceholder('logout', 'AUTH_PROVIDER_URL');
  }

  async getCurrentUser(token) {
    if (this.mode === AUTH_MODE.MOCK) {
      const user = [...this._sessions.values()].find(u => u.token === token);
      return user ?? null;
    }
    return this._realPlaceholder('getCurrentUser', 'AUTH_PROVIDER_URL');
  }

  async hasRole(token, role) {
    if (this.mode === AUTH_MODE.MOCK) {
      const user = await this.getCurrentUser(token);
      if (!user) return false;
      // Admin inherits all roles, staff inherits staff+user+support
      const HIERARCHY = { admin: ['admin','staff','support','user'], staff: ['staff','user'], support: ['support','user'], user: ['user'] };
      const effective = HIERARCHY[user.role] ?? [user.role];
      return effective.includes(role);
    }
    return this._realPlaceholder('hasRole', 'AUTH_PROVIDER_URL');
  }

  async refreshToken(token) {
    if (this.mode === AUTH_MODE.MOCK) {
      return { token: token + '-refreshed', expiresIn: 3600 };
    }
    return this._realPlaceholder('refreshToken', 'AUTH_PROVIDER_URL');
  }

  getStatus() {
    return { adapter: 'auth', mode: this.mode, status: this.status, sessions: this._sessions.size };
  }

  _mockLogin(email) {
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      const err = new Error('AUTH_INVALID_CREDENTIALS');
      err.code = 'AUTH_INVALID_CREDENTIALS'; throw err;
    }
    const session = { ...user, loginAt: new Date().toISOString() };
    this._sessions.set(session.token, session);
    return { user: { userId: session.userId, email: session.email, name: session.name, role: session.role }, token: session.token };
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`AuthAdapter.${method}: modo real no configurado. Variables requeridas: ${requiredEnvVars}. En modo demo usa AUTH_MODE=mock.`);
    err.code    = 'ADAPTER_NOT_CONFIGURED';
    err.adapter = 'auth';
    err.method  = method;
    throw err;
  }
}
