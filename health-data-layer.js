(() => {
  const STORAGE_KEY = 'myfit-health-data-v1';

  const METRICS = Object.freeze({
    weight: { unit: 'kg', kind: 'quantity' },
    waist: { unit: 'cm', kind: 'quantity' },
    bloodPressureSystolic: { unit: 'mmHg', kind: 'quantity' },
    bloodPressureDiastolic: { unit: 'mmHg', kind: 'quantity' },
    restingHeartRate: { unit: 'bpm', kind: 'quantity' },
    sleepDuration: { unit: 'min', kind: 'quantity' },
    steps: { unit: 'count', kind: 'quantity' },
    walkingDistance: { unit: 'km', kind: 'quantity' },
    activeEnergy: { unit: 'kcal', kind: 'quantity' },
    energyLevel: { unit: 'score', kind: 'subjective' },
    soreness: { unit: 'score', kind: 'subjective' }
  });

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && Array.isArray(parsed.samples) ? parsed : { schemaVersion: 1, samples: [] };
    } catch {
      return { schemaVersion: 1, samples: [] };
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function normalizeSample(sample, source = 'manual') {
    if (!sample || !METRICS[sample.metric]) throw new Error('Unsupported health metric');
    const value = Number(sample.value);
    if (!Number.isFinite(value)) throw new Error('Health value must be numeric');
    return {
      id: sample.id || crypto.randomUUID(),
      metric: sample.metric,
      value,
      unit: sample.unit || METRICS[sample.metric].unit,
      measuredAt: sample.measuredAt || new Date().toISOString(),
      source: sample.source || source,
      metadata: sample.metadata || {}
    };
  }

  class LocalHealthProvider {
    constructor() { this.id = 'local'; }

    async isAvailable() { return true; }

    async saveSample(sample) {
      const store = readStore();
      const normalized = normalizeSample(sample, 'manual');
      store.samples.push(normalized);
      writeStore(store);
      return normalized;
    }

    async querySamples({ metric, from, to, limit } = {}) {
      let samples = readStore().samples.slice();
      if (metric) samples = samples.filter(s => s.metric === metric);
      if (from) samples = samples.filter(s => new Date(s.measuredAt) >= new Date(from));
      if (to) samples = samples.filter(s => new Date(s.measuredAt) <= new Date(to));
      samples.sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt));
      if (Number.isFinite(limit)) samples = samples.slice(0, limit);
      return samples;
    }

    async latest(metric) {
      const [sample] = await this.querySamples({ metric, limit: 1 });
      return sample || null;
    }
  }

  let provider = new LocalHealthProvider();

  const api = {
    metrics: METRICS,
    getProvider: () => provider,
    setProvider(nextProvider) {
      if (!nextProvider || typeof nextProvider.querySamples !== 'function') {
        throw new Error('Invalid health data provider');
      }
      provider = nextProvider;
    },
    saveSample: sample => provider.saveSample(sample),
    querySamples: query => provider.querySamples(query),
    latest: metric => provider.latest(metric)
  };

  /*
    Native migration contract:
    A future Swift/HealthKit bridge only needs to implement the same provider methods:
      isAvailable()
      saveSample(sample)
      querySamples(query)
      latest(metric)

    MyFit Core / MyFit Move should call window.MyFitHealth only and must not depend
    directly on localStorage, HealthKit, or any device-specific API.
  */

  window.MyFitHealth = Object.freeze(api);
})();
