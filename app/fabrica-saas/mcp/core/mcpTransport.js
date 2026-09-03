// MCP Transport — ADV-12 (foundation stubs — NO_REAL_MCP_CREDENTIALS=SI)

export const TRANSPORT_TYPE = Object.freeze({
  STDIO:           'STDIO',
  HTTP:            'HTTP',
  SSE:             'SSE',
  STREAMABLE_HTTP: 'STREAMABLE_HTTP',
});

export const TRANSPORT_STATUS = Object.freeze({
  CONNECTED:    'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR:        'ERROR',
  SIMULATED:    'SIMULATED',
});

export function createStdioTransport(config = {}) {
  return Object.freeze({
    type:       TRANSPORT_TYPE.STDIO,
    status:     TRANSPORT_STATUS.SIMULATED,
    command:    config.command    ?? null,
    args:       Object.freeze(config.args ?? []),
    env:        Object.freeze({}),
    connect:    async () => { throw new Error('NO_REAL_MCP_CREDENTIALS=SI — stdio transport simulated only'); },
    isReal: false,
  });
}

export function createHttpTransport(config = {}) {
  return Object.freeze({
    type:       TRANSPORT_TYPE.HTTP,
    status:     TRANSPORT_STATUS.SIMULATED,
    baseUrl:    config.baseUrl    ?? null,
    headers:    Object.freeze({}),
    connect:    async () => { throw new Error('NO_REAL_MCP_CREDENTIALS=SI — http transport simulated only'); },
    isReal: false,
  });
}

export function createSseTransport(config = {}) {
  return Object.freeze({
    type:       TRANSPORT_TYPE.SSE,
    status:     TRANSPORT_STATUS.SIMULATED,
    endpoint:   config.endpoint   ?? null,
    connect:    async () => { throw new Error('NO_REAL_MCP_CREDENTIALS=SI — sse transport simulated only'); },
    isReal: false,
  });
}

export function createStreamableHttpTransport(config = {}) {
  return Object.freeze({
    type:       TRANSPORT_TYPE.STREAMABLE_HTTP,
    status:     TRANSPORT_STATUS.SIMULATED,
    endpoint:   config.endpoint   ?? null,
    connect:    async () => { throw new Error('NO_REAL_MCP_CREDENTIALS=SI — streamable_http transport simulated only'); },
    isReal: false,
  });
}

export const MCP_TRANSPORT_VERSION = '1.0.0';
