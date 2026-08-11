(() => {
  "use strict";

  function parseJson(raw) {
    if (!raw) return { ok: false, value: null, error: null };
    try { return { ok: true, value: JSON.parse(raw), error: null }; }
    catch (error) { return { ok: false, value: null, error: String(error?.message || error) }; }
  }

  function snapshot() {
    const api = window.LifeOSStorage;
    const legacyKey = api?.legacyKey || null;
    const storageKey = api?.storageKey || null;
    const legacyRaw = legacyKey ? localStorage.getItem(legacyKey) : null;
    const envelopeRaw = storageKey ? localStorage.getItem(storageKey) : null;
    const legacy = parseJson(legacyRaw);
    const envelope = parseJson(envelopeRaw);

    return {
      appId: api?.appId || null,
      schemaVersion: api?.schemaVersion || envelope.value?.schemaVersion || null,
      status: api?.getStatus?.() || "storage-layer-unavailable",
      legacy: {
        key: legacyKey,
        detected: legacyRaw !== null,
        parseOk: legacyRaw === null ? null : legacy.ok
      },
      envelope: {
        key: storageKey,
        detected: envelopeRaw !== null,
        parseOk: envelopeRaw === null ? null : envelope.ok,
        updatedAt: envelope.value?.updatedAt || null,
        source: envelope.value?.source || null
      },
      errors: [legacy.error, envelope.error].filter(Boolean)
    };
  }

  window.LifeOSStorageDiagnostics = Object.freeze({ snapshot });
})();
