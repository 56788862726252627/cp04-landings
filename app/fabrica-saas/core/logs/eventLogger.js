/**
 * CORE V1.3 · EventLogger (Phase 4)
 * Logger estructurado con correlation IDs. Sin envío externo.
 */

import { LOG_LEVEL } from '../runtimeConfig.js';

const LEVELS = [LOG_LEVEL.DEBUG, LOG_LEVEL.INFO, LOG_LEVEL.WARN, LOG_LEVEL.ERROR];

export class EventLogger {
  constructor(config = {}) {
    this.level       = config.logLevel ?? LOG_LEVEL.INFO;
    this.clientId    = config.clientId ?? 'unknown';
    this._events     = [];
    this._maxEvents  = config.maxEvents ?? 1000;
  }

  log(level, event, data = {}) {
    if (LEVELS.indexOf(level) < LEVELS.indexOf(this.level)) return;
    const entry = {
      ts:           new Date().toISOString(),
      level,
      event,
      clientId:     this.clientId,
      correlationId: data.correlationId ?? this._genId(),
      data:          { ...data },
      _ficticio:     true,
    };
    this._events.push(entry);
    if (this._events.length > this._maxEvents) this._events.shift();
    return entry;
  }

  debug(event, data)  { return this.log(LOG_LEVEL.DEBUG, event, data); }
  info(event, data)   { return this.log(LOG_LEVEL.INFO,  event, data); }
  warn(event, data)   { return this.log(LOG_LEVEL.WARN,  event, data); }
  error(event, data)  { return this.log(LOG_LEVEL.ERROR, event, data); }

  withCorrelationId(id) {
    const child = new EventLogger({ logLevel: this.level, clientId: this.clientId, maxEvents: this._maxEvents });
    child._defaultCorrelationId = id;
    child._events = this._events;
    const origLog = child.log.bind(child);
    child.log = (level, event, data = {}) =>
      origLog(level, event, { correlationId: id, ...data });
    return child;
  }

  getEvents(filter = {}) {
    let evs = [...this._events];
    if (filter.level)   evs = evs.filter(e => e.level   === filter.level);
    if (filter.event)   evs = evs.filter(e => e.event   === filter.event);
    if (filter.clientId)evs = evs.filter(e => e.clientId=== filter.clientId);
    return evs;
  }

  getStatus() {
    return {
      system: 'event_logger', level: this.level,
      clientId: this.clientId, storedEvents: this._events.length,
    };
  }

  _genId() {
    return `cid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
