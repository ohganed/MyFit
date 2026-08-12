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

  const NUTRITION_FIELDS = Object.freeze({
    energyKcal: { unit:'kcal', group:'energy', label:'Energy' },
    proteinG: { unit:'g', group:'macro', label:'Protein' },
    fatG: { unit:'g', group:'macro', label:'Fat' },
    carbsG: { unit:'g', group:'macro', label:'Carbohydrate' },
    fiberG: { unit:'g', group:'macro', label:'Fiber' },
    sugarG: { unit:'g', group:'macro', label:'Sugar' },

    vitaminAMcgRAE: { unit:'mcg RAE', group:'vitamin', label:'Vitamin A' },
    vitaminB1Mg: { unit:'mg', group:'vitamin', label:'Vitamin B1 (Thiamin)' },
    vitaminB2Mg: { unit:'mg', group:'vitamin', label:'Vitamin B2 (Riboflavin)' },
    vitaminB3MgNE: { unit:'mg NE', group:'vitamin', label:'Vitamin B3 (Niacin)' },
    vitaminB5Mg: { unit:'mg', group:'vitamin', label:'Vitamin B5 (Pantothenic acid)' },
    vitaminB6Mg: { unit:'mg', group:'vitamin', label:'Vitamin B6' },
    vitaminB7Mcg: { unit:'mcg', group:'vitamin', label:'Vitamin B7 (Biotin)' },
    vitaminB9McgDFE: { unit:'mcg DFE', group:'vitamin', label:'Vitamin B9 (Folate)' },
    vitaminB12Mcg: { unit:'mcg', group:'vitamin', label:'Vitamin B12' },
    vitaminCMg: { unit:'mg', group:'vitamin', label:'Vitamin C' },
    vitaminDMcg: { unit:'mcg', group:'vitamin', label:'Vitamin D' },
    vitaminEMgAlphaTE: { unit:'mg alpha-TE', group:'vitamin', label:'Vitamin E' },
    vitaminKMcg: { unit:'mcg', group:'vitamin', label:'Vitamin K' },

    sodiumMg: { unit:'mg', group:'mineral', label:'Sodium' },
    potassiumMg: { unit:'mg', group:'mineral', label:'Potassium' },
    calciumMg: { unit:'mg', group:'mineral', label:'Calcium' },
    magnesiumMg: { unit:'mg', group:'mineral', label:'Magnesium' },
    phosphorusMg: { unit:'mg', group:'mineral', label:'Phosphorus' },
    ironMg: { unit:'mg', group:'mineral', label:'Iron' },
    zincMg: { unit:'mg', group:'mineral', label:'Zinc' },
    copperMg: { unit:'mg', group:'mineral', label:'Copper' },
    manganeseMg: { unit:'mg', group:'mineral', label:'Manganese' },
    iodineMcg: { unit:'mcg', group:'mineral', label:'Iodine' },
    seleniumMcg: { unit:'mcg', group:'mineral', label:'Selenium' },
    chromiumMcg: { unit:'mcg', group:'mineral', label:'Chromium' },
    molybdenumMcg: { unit:'mcg', group:'mineral', label:'Molybdenum' }
  });

  const NUTRITION_SOURCES = Object.freeze(['manual','database','barcode','photo-estimate','import','healthkit']);

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && Array.isArray(parsed.events)
        ? parsed
        : { schemaVersion: 2, events: [] };
    } catch {
      return { schemaVersion: 2, events: [] };
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function normalizeNutrition(nutrition) {
    if (!nutrition) return null;
    const nutrients = {};
    for (const [key, meta] of Object.entries(NUTRITION_FIELDS)) {
      if (nutrition.nutrients?.[key] == null && nutrition[key] == null) continue;
      const raw = nutrition.nutrients?.[key] ?? nutrition[key];
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      nutrients[key] = { value, unit: meta.unit };
    }
    const source = NUTRITION_SOURCES.includes(nutrition.source) ? nutrition.source : 'manual';
    return {
      source,
      confidence: nutrition.confidence == null ? null : Number(nutrition.confidence),
      servingDescription: nutrition.servingDescription || null,
      foodItems: Array.isArray(nutrition.foodItems) ? nutrition.foodItems : [],
      nutrients,
      metadata: nutrition.metadata || {}
    };
  }

  function normalizeEvent(event, source = 'manual') {
    if (!event || !EVENT_TYPES[event.type]) throw new Error('Unsupported cockpit event type');
    const startAt = event.startAt || event.occurredAt || new Date().toISOString();
    const payload = { ...(event.payload || {}) };
    if (event.type === 'meal') payload.nutrition = normalizeNutrition(payload.nutrition || event.nutrition);
    return {
      id: event.id || crypto.randomUUID(),
      type: event.type,
      domain: EVENT_TYPES[event.type].domain,
      startAt,
      endAt: event.endAt || null,
      source: event.source || source,
      payload,
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
      store.schemaVersion = 2;
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
    nutritionFields: NUTRITION_FIELDS,
    nutritionSources: NUTRITION_SOURCES,
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

  window.MyFitCockpit = Object.freeze(api);
})();
