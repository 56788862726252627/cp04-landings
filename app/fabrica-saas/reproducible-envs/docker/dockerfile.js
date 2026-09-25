// Dockerfile Foundation — ADV-15
// Generates safe multi-stage Dockerfile content as a string template

export const DOCKERFILE_STAGE = Object.freeze({
  DEPENDENCIES: 'dependencies',
  BUILD:        'build',
  RUNTIME:      'runtime',
});

export function generateDockerfileContent(config = {}) {
  const {
    nodeVersion = '22',
    workdir      = '/app',
    buildCommand = 'npm run build',
    distDir      = 'dist',
    port         = 5180,
    user         = 'appuser',
    packageManager = 'npm',
  } = config;

  const installCmd = packageManager === 'pnpm'
    ? 'pnpm install --frozen-lockfile'
    : packageManager === 'yarn'
      ? 'yarn install --frozen-lockfile'
      : 'npm ci';

  // Never include COPY .env or real secrets
  const content = `# syntax=docker/dockerfile:1
# ADV-15 — Generated reproducible Dockerfile (FACTORY_AGENCY_SCOPE_ONLY=SI)
# NO_REAL_SECRETS=SI | NO_REAL_PRODUCTION_DEPLOY=SI

ARG NODE_VERSION=${nodeVersion}

# ── Stage 1: dependencies ──────────────────────────────────────────────────────
FROM node:$\{NODE_VERSION}-alpine AS dependencies
WORKDIR ${workdir}
COPY package.json package-lock.json* ./
RUN ${installCmd} --ignore-scripts

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM dependencies AS build
COPY . .
RUN ${buildCommand}

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:$\{NODE_VERSION}-alpine AS runtime
WORKDIR ${workdir}

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \\
    adduser  -u 1001 -S ${user} -G appgroup

COPY --from=build --chown=${user}:appgroup ${workdir}/${distDir} ./${distDir}
COPY --from=dependencies --chown=${user}:appgroup ${workdir}/package.json ./

USER ${user}
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${port}/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
`;

  return Object.freeze({
    content,
    stages: Object.freeze([DOCKERFILE_STAGE.DEPENDENCIES, DOCKERFILE_STAGE.BUILD, DOCKERFILE_STAGE.RUNTIME]),
    port,
    user,
    nodeVersion,
    noRealSecrets:    true,
    multiStage:       true,
    nonRootUser:      true,
    isReal:           false,
  });
}

export const DOCKERFILE_FOUNDATION_VERSION = '1.0.0';
