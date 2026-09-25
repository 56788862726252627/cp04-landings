// Data Presentation Resolver — ADV-07

export const DATA_PATTERN = Object.freeze({
  TABLE:    'TABLE',
  CARDS:    'CARDS',
  LIST:     'LIST',
  KANBAN:   'KANBAN',
  TIMELINE: 'TIMELINE',
  CALENDAR: 'CALENDAR',
});

const SELECTION_RULES = Object.freeze([
  { condition: (c) => c.isMobile && c.columns > 4,                  pattern: DATA_PATTERN.CARDS     },
  { condition: (c) => c.dataType === 'appointment',                  pattern: DATA_PATTERN.CALENDAR  },
  { condition: (c) => c.dataType === 'task' && c.needsWorkflow,      pattern: DATA_PATTERN.KANBAN    },
  { condition: (c) => c.dataType === 'event',                        pattern: DATA_PATTERN.TIMELINE  },
  { condition: (c) => c.columns <= 3 && c.rows > 10,                 pattern: DATA_PATTERN.LIST      },
  { condition: (c) => c.columns > 5 && !c.isMobile,                  pattern: DATA_PATTERN.TABLE     },
  { condition: () => true,                                            pattern: DATA_PATTERN.LIST      },
]);

export function resolveDataPattern(context = {}) {
  const rule = SELECTION_RULES.find(r => r.condition(context));
  const pattern = rule?.pattern ?? DATA_PATTERN.LIST;
  return Object.freeze({
    pattern,
    mobilePattern: context.isMobile ? DATA_PATTERN.CARDS : pattern,
    requiresPagination: (context.rows ?? 0) > 20,
    isReal: false,
  });
}

export function buildDataConfig(pattern = DATA_PATTERN.LIST, options = {}) {
  return Object.freeze({
    pattern,
    pageSize:          options.pageSize ?? (pattern === DATA_PATTERN.TABLE ? 25 : 12),
    hasSearch:         options.hasSearch ?? true,
    hasFilters:        options.hasFilters ?? pattern !== DATA_PATTERN.CALENDAR,
    hasSorting:        pattern === DATA_PATTERN.TABLE || pattern === DATA_PATTERN.LIST,
    mobileTransform:   pattern === DATA_PATTERN.TABLE ? DATA_PATTERN.CARDS : null,
    isReal:            false,
  });
}

export const DATA_PRESENTATION_RESOLVER_VERSION = '1.0.0';
