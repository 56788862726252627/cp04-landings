/**
 * CORE V1.3 · RoleSystem (Phase 4)
 * RBAC básico: admin > staff > support > user. Sin dependencias externas.
 */

export const ROLES = Object.freeze({
  ADMIN:   'admin',
  STAFF:   'staff',
  SUPPORT: 'support',
  USER:    'user',
});

const ROLE_HIERARCHY = [ROLES.ADMIN, ROLES.STAFF, ROLES.SUPPORT, ROLES.USER];

const PERMISSIONS = {
  'admin':   ['read', 'write', 'delete', 'manage_users', 'manage_config', 'view_analytics'],
  'staff':   ['read', 'write', 'view_analytics'],
  'support': ['read', 'view_analytics'],
  'user':    ['read'],
};

export class RoleSystem {
  constructor() {
    this._customRules = new Map();
  }

  hasPermission(userRoles, permission) {
    if (!Array.isArray(userRoles)) return false;
    return userRoles.some(role => {
      const perms = PERMISSIONS[role] ?? [];
      return perms.includes(permission);
    });
  }

  isAtLeast(userRoles, minRole) {
    if (!Array.isArray(userRoles)) return false;
    const minIdx = ROLE_HIERARCHY.indexOf(minRole);
    if (minIdx === -1) return false;
    return userRoles.some(r => ROLE_HIERARCHY.indexOf(r) <= minIdx);
  }

  getPermissionsForRole(role) {
    return [...(PERMISSIONS[role] ?? [])];
  }

  addCustomRule(ruleName, checkFn) {
    this._customRules.set(ruleName, checkFn);
  }

  applyCustomRule(ruleName, context) {
    const rule = this._customRules.get(ruleName);
    if (!rule) throw new Error(`RoleSystem: regla desconocida '${ruleName}'`);
    return rule(context);
  }

  canAccess(userRoles, resource) {
    const resourcePerms = {
      'dashboard':  ['read'],
      'crm':        ['read'],
      'reservas':   ['read'],
      'config':     ['manage_config'],
      'admin_panel':['manage_users'],
    };
    const required = resourcePerms[resource];
    if (!required) return false;
    return required.every(p => this.hasPermission(userRoles, p));
  }

  getStatus() {
    return {
      system: 'roles', roles: Object.values(ROLES),
      customRules: this._customRules.size,
    };
  }
}
