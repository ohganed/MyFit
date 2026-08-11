(() => {
  "use strict";

  const LEGACY_KEY = "myfit-data-v1";
  const STORAGE_KEY = "lifeos.myfit.storage.v1";
  const SCHEMA_VERSION = "1.0";
  const APP_ID = "myfit";

  let lastLegacyRaw = null;
  let status = "initializing";

  function safeParse(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function validPayload(value) {
    return !!value && typeof value === "object" &&
      Array.isArray(value.exercises) && Array.isArray(value.workouts) &&
      (value.activeWorkout === null || typeof value.activeWorkout === "object");
  }

  function readEnvelope() {
    const envelope = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!envelope || envelope.schemaVersion !== SCHEMA_VERSION || envelope.appId !== APP_ID) return null;
    return validPayload(envelope.payload) ? envelope : null;
  }

  function writeEnvelope(payload, source = "legacy-sync") {
    if (!validPayload(payload)) return false;
    const envelope = {
      schemaVersion: SCHEMA_VERSION,
      appId: APP_ID,
      updatedAt: new Date().toISOString(),
      source,
      payload
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      return true;
    } catch (error) {
      console.warn("LifeOS Storage Layer: envelope save failed", error);
      return false;
    }
  }

  function bootstrap() {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    const legacy = safeParse(legacyRaw);
    const envelope = readEnvelope();

    if (validPayload(legacy)) {
      writeEnvelope(legacy, envelope ? "legacy-refresh" : "legacy-migration");
      lastLegacyRaw = legacyRaw;
      status = envelope ? "mirroring" : "migrated";
      return;
    }

    if (envelope) {
      try {
        const restored = JSON.stringify(envelope.payload);
        localStorage.setItem(LEGACY_KEY, restored);
        lastLegacyRaw = restored;
        status = "recovered-from-envelope";
        return;
      } catch (error) {
        console.warn("LifeOS Storage Layer: legacy recovery failed", error);
      }
    }

    lastLegacyRaw = legacyRaw;
    status = "empty";
  }

  function sync() {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw === lastLegacyRaw) return;
    lastLegacyRaw = legacyRaw;
    const legacy = safeParse(legacyRaw);
    if (validPayload(legacy) && writeEnvelope(legacy)) status = "mirroring";
  }

  bootstrap();
  const timer = window.setInterval(sync, 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sync();
  });
  window.addEventListener("pagehide", sync);

  window.LifeOSStorage = Object.freeze({
    appId: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    legacyKey: LEGACY_KEY,
    storageKey: STORAGE_KEY,
    getStatus: () => status,
    syncNow: sync,
    readEnvelope,
    stop: () => clearInterval(timer)
  });
})();
