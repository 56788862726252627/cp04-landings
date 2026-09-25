// MCP Tool Dependency Graph — ADV-12

export function createDependencyGraph() {
  const nodes = new Map();
  const edges = new Map(); // nodeId → Set of dependency nodeIds

  function addNode(id, meta = {}) {
    nodes.set(id, Object.freeze({ id, ...meta }));
    if (!edges.has(id)) edges.set(id, new Set());
  }

  function addDependency(nodeId, dependsOnId) {
    if (!nodes.has(nodeId))    throw new Error(`Node "${nodeId}" not in graph`);
    if (!nodes.has(dependsOnId)) throw new Error(`Node "${dependsOnId}" not in graph`);
    edges.get(nodeId).add(dependsOnId);
  }

  function hasCycle() {
    const visited  = new Set();
    const inStack  = new Set();
    function dfs(id) {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id); inStack.add(id);
      for (const dep of (edges.get(id) ?? [])) { if (dfs(dep)) return true; }
      inStack.delete(id);
      return false;
    }
    for (const id of nodes.keys()) { if (dfs(id)) return true; }
    return false;
  }

  function topologicalOrder() {
    const result  = [];
    const visited = new Set();
    function visit(id) {
      if (visited.has(id)) return;
      visited.add(id);
      for (const dep of (edges.get(id) ?? [])) visit(dep);
      result.push(id);
    }
    for (const id of nodes.keys()) visit(id);
    return result;
  }

  return Object.freeze({ addNode, addDependency, hasCycle, topologicalOrder, nodeCount: () => nodes.size, isReal: false });
}

export const MCP_DEPENDENCY_GRAPH_VERSION = '1.0.0';
