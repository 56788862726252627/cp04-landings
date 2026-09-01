// CI/CD Barrel — ADV-02 CI/CD Automatizado
// Re-exporta todos los módulos CI/CD públicos.

export * from './pipelineModel.js';
export * from './jobModel.js';
export * from './qualityGateEngine.js';
export * from './secretScan.js';
export * from './dependencyScan.js';
export * from './regressionGate.js';
export * from './artifactValidation.js';
export * from './bundleGate.js';
export * from './branchPolicy.js';
export * from './releaseReadiness.js';
export * from './observabilityIntegration.js';
export * from './prPipeline.js';
export * from './mainPipeline.js';
export * from './failFast.js';
export * from './retryPolicy.js';
export * from './cacheStrategy.js';
export * from './failureReport.js';
export * from './ciSummary.js';
export * from './ciConfigGenerator.js';
export * from './matrixSupport.js';
export * from './localCIRunner.js';
export * from './ciTestFixture.js';
export * from './ciFailureScenarios.js';

export const CICD_VERSION = '1.0.0';
export const CICD_MODULES = Object.freeze([
  'pipelineModel', 'jobModel', 'qualityGateEngine', 'secretScan',
  'dependencyScan', 'regressionGate', 'artifactValidation', 'bundleGate',
  'branchPolicy', 'releaseReadiness', 'observabilityIntegration',
  'prPipeline', 'mainPipeline', 'failFast', 'retryPolicy', 'cacheStrategy',
  'failureReport', 'ciSummary', 'ciConfigGenerator', 'matrixSupport',
  'localCIRunner', 'ciTestFixture', 'ciFailureScenarios',
]);
