// MCP Registry — ADV-12

const _servers  = new Map();
const _tools    = new Map();
const _resources = new Map();
const _prompts  = new Map();

function _clientKey(id, clientId) { return `${clientId}::${id}`; }

export function registerServer(server, clientId = 'global') {
  if (!server || !server.id) throw new Error('registerServer: server.id required');
  _servers.set(_clientKey(server.id, clientId), { server, clientId });
  if (Array.isArray(server.tools)) {
    server.tools.forEach(t => _tools.set(_clientKey(t.id, clientId), { tool: t, serverId: server.id, clientId }));
  }
  if (Array.isArray(server.resources)) {
    server.resources.forEach(r => _resources.set(_clientKey(r.uri, clientId), { resource: r, serverId: server.id, clientId }));
  }
  if (Array.isArray(server.prompts)) {
    server.prompts.forEach(p => _prompts.set(_clientKey(p.id, clientId), { prompt: p, serverId: server.id, clientId }));
  }
  return Object.freeze({ registered: true, serverId: server.id, clientId, isReal: false });
}

export function unregisterServer(serverId, clientId = 'global') {
  const key = _clientKey(serverId, clientId);
  const entry = _servers.get(key);
  if (!entry) return Object.freeze({ removed: false, serverId, clientId, isReal: false });
  _servers.delete(key);
  for (const [k, v] of _tools)    { if (v.serverId === serverId && v.clientId === clientId) _tools.delete(k); }
  for (const [k, v] of _resources){ if (v.serverId === serverId && v.clientId === clientId) _resources.delete(k); }
  for (const [k, v] of _prompts)  { if (v.serverId === serverId && v.clientId === clientId) _prompts.delete(k); }
  return Object.freeze({ removed: true, serverId, clientId, isReal: false });
}

export function getServer(serverId, clientId = 'global') {
  const entry = _servers.get(_clientKey(serverId, clientId));
  return entry ? entry.server : null;
}

export function listServers(clientId = 'global') {
  const result = [];
  for (const [, v] of _servers) { if (v.clientId === clientId) result.push(v.server); }
  return Object.freeze(result);
}

export function listTools(clientId = 'global') {
  const result = [];
  for (const [, v] of _tools) { if (v.clientId === clientId) result.push(v.tool); }
  return Object.freeze(result);
}

export function listResources(clientId = 'global') {
  const result = [];
  for (const [, v] of _resources) { if (v.clientId === clientId) result.push(v.resource); }
  return Object.freeze(result);
}

export function listPrompts(clientId = 'global') {
  const result = [];
  for (const [, v] of _prompts) { if (v.clientId === clientId) result.push(v.prompt); }
  return Object.freeze(result);
}

export function findTool(toolId, clientId = 'global') {
  const entry = _tools.get(_clientKey(toolId, clientId));
  return entry ? entry.tool : null;
}

export function findCapability(capabilityType, clientId = 'global') {
  const matches = [];
  for (const [, v] of _tools) {
    if (v.clientId === clientId && Array.isArray(v.tool.requiredScopes) && v.tool.requiredScopes.includes(capabilityType)) {
      matches.push(v.tool);
    }
  }
  return Object.freeze(matches);
}

export function clearRegistry() {
  _servers.clear(); _tools.clear(); _resources.clear(); _prompts.clear();
}

export const MCP_REGISTRY_VERSION = '1.0.0';
