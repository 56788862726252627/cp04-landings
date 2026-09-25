// Media Experiment (A/B) — ADV-13

export const EXPERIMENT_STATUS = Object.freeze({
  DRAFT:    'DRAFT',
  ACTIVE:   'ACTIVE',
  PAUSED:   'PAUSED',
  COMPLETE: 'COMPLETE',
});

export function createMediaExperiment(config = {}) {
  if (!config.id)         throw new Error('MediaExperiment requires id');
  if (!config.projectIds || config.projectIds.length < 2) {
    throw new Error('MediaExperiment requires at least 2 projectIds');
  }
  return Object.freeze({
    id:           config.id,
    projectIds:   Object.freeze(config.projectIds),
    hypothesis:   config.hypothesis ?? '',
    metric:       config.metric     ?? 'ENGAGEMENT_RATE',
    status:       EXPERIMENT_STATUS.DRAFT,
    noRealAdSpend: true,
    isReal: false,
  });
}

export const MEDIA_EXPERIMENT_VERSION = '1.0.0';
