/**
 * CORE V1.3 · AuthSystem (Phase 4)
 * Sistema de auth local para la fábrica. Sin llamadas externas.
 * Provider interface: { login, logout, getCurrentUser, hasRole, refreshToken }
 */

import { AUTH_MODE } from '../runtimeConfig.js';

const MOCK_USERS = [
  { id: 'u-001', email: 'admin@demo.ficticio',   name: 'Admin Demo',   roles: ['admin','staff','user'], _ficticio: true },
  { id: 'u-002', email: 'staff@demo.ficticio',   name: 'Staff Demo',   roles: ['staff','user'],         _ficticio: true },
  { id: 'u-003', email: 'user@demo.ficticio',    name: 'Usuario Demo', roles: ['user'],                 _ficticio: true },
  { id: 'u-004', email: 'support@demo.ficticio', name: 'Soporte Demo', roles: ['support','user'],       _ficticio: true },
];

export class AuthSystem {
  constructor(config = {}) {
    this.mode     = config.authMode ?? AUTH_MODE.MOCK;
    this._tokens  = new Map();
    this._provider = config.provider ?? null;
  }

  async login(email, _password) {
    if (this.mode === AUTH_MODE.MOCK) {
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) { const e = new Error('AUTH_INVALID_CREDENTIALS'); e.code = 'AUTH_INVALID_CREDENTIALS'; throw e; }
      const token = `mock-token-${user.id}-${Date.now()}`;
      this._tokens.set(token, { user, expiresAt: Date.now() + 3_600_000 });
      return { token, user: { ...user } };
    }
    if (this._provider) return this._provider.login(email, _password);
    this._throwNotConfigured('login');
  }

  async logout(token) {
    if (this.mode === AUTH_MODE.MOCK) {
      const existed = this._tokens.has(token);
      this._tokens.delete(token);
      return { success: existed };
    }
    if (this._provider) return this._provider.logout(token);
    this._throwNotConfigured('logout');
  }

  async getCurrentUser(token) {
    if (this.mode === AUTH_MODE.MOCK) {
      const session = this._tokens.get(token);
      if (!session || session.expiresAt < Date.now()) return null;
      return { ...session.user };
    }
    if (this._provider) return this._provider.getCurrentUser(token);
    this._throwNotConfigured('getCurrentUser');
  }

  async hasRole(token, role) {
    const user = await this.getCurrentUser(token);
    return user?.roles?.includes(role) ?? false;
  }

  async refreshToken(token) {
    if (this.mode === AUTH_MODE.MOCK) {
      const session = this._tokens.get(token);
      if (!session) return null;
      const newToken = `mock-token-${session.user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      this._tokens.set(newToken, { user: session.user, expiresAt: Date.now() + 3_600_000 });
      this._tokens.delete(token);
      return { token: newToken };
    }
    if (this._provider) return this._provider.refreshToken(token);
    this._throwNotConfigured('refreshToken');
  }

  getStatus() {
    return { system: 'auth', mode: this.mode, activeSessions: this._tokens.size };
  }

  _throwNotConfigured(method) {
    const e = new Error(`AuthSystem.${method}: proveedor no configurado.`);
    e.code = 'AUTH_NOT_CONFIGURED'; throw e;
  }
}

export { MOCK_USERS };
