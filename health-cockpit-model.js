(() => {
  const STORAGE_KEY = 'myfit-health-events-v1';

  const DOMAINS = Object.freeze({
    movement: ['strength','walk','run','cycling','mobility','stretch','cardio','balance','yoga','recovery'],
    body: ['weight','waist','bloodPressure','restingHeartRate'],
    sleep: ['sleep'],
    food: ['meal'],
    recovery: ['energy','soreness','pain','note']
  });

  const EVENT_TYPES = Object.freeze({
    movement: { domain:'movement' },
    sleep: { domain:'sleep' },
    meal: { domain:'food' },
    recoveryCheck: { domain:'recovery' },
    note: { domain:'recovery' }
  });

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && Array.isArray(parsed.events)
        ? parsed
        : { schemaVersion: 1, events: [] };
    } catch {
      return { schemaVersion: 1, events: [] };
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function normalizeEvent(event, source = 'manual') {
    if (!event || !EVENT_TYPES[event.type]) throw new Error('Unsupported cockpit event type');
    const startAt = event.startAt || event.occurredAt || new Date().toISOString();
    return {
      id: event.id || crypto.randomUUID(),
      type: event.type,
      domain: EVENT_TYPES[event.type].domain,
      startAt,
      endAt: event.endAt || null,
      source: event.source || source,
      payload: event.payload || {},
      metadata: event.metadata || {},
      createdAt: event.createdAt || new Date().toISOString()
    };
  }

  class LocalEventProvider {
    constructor() { this.id = 'local-events'; }
    async isAvailable() { return true; }

    async saveEvent(event) {
      const store = readStore();
      const normalized = normalizeEvent(event, 'manual');
      store.events.push(normalized);
      writeStore(store);
      return normalized;
    }

    async queryEvents({ type, domain, from, to, limit } = {}) {
      let events = readStore().events.slice();
      if (type) events = events.filter(e => e.type === type);
      if (domain) events = events.filter(e => e.domain === domain);
      if (from) events = events.filter(e => new Date(e.startAt) >= new Date(from));
      if (to) events = events.filter(e => new Date(e.startAt) <= new Date(to));
      events.sort((a,b) => new Date(b.startAt) - new Date(a.startAt));
      if (Number.isFinite(limit)) events = events.slice(0, limit);
      return events;
    }

    async latestEvent(type) {
      const [event] = await this.queryEvents({ type, limit: 1 });
      return event || null;
    }
  }

  let eventProvider = new LocalEventProvider();

  const api = {
    domains: DOMAINS,
    eventTypes: EVENT_TYPES,
    getEventProvider: () => eventProvider,
    setEventProvider(nextProvider) {
      if (!nextProvider || typeof nextProvider.queryEvents !== 'function') {
        throw new Error('Invalid cockpit event provider');
      }
      eventProvider = nextProvider;
    },
    saveEvent: event => eventProvider.saveEvent(event),
    queryEvents: query => eventProvider.queryEvents(query),
    latestEvent: type => eventProvider.latestEvent(type),
    saveMetric: sample => window.MyFitHealth.saveSample(sample),
    queryMetrics: query => window.MyFitHealth.querySamples(query),
    latestMetric: metric => window.MyFitHealth.latest(metric)
  };

  /*
    Data model rule:
    - Numeric observations (Weight, Blood Pressure, Steps, HR, etc.) live in MyFitHealth.
    - Time-based life events (Meal, Sleep, Movement session, Recovery check) live here.
    - UI modules must talk to MyFitCockpit / MyFitHealth, never directly to localStorage.
    - A future Swift/HealthKit implementation can replace either provider independently.
  */

  window.MyFitCockpit = Object.freeze(api);
})();
