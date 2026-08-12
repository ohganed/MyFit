(() => {
  const PROFILE_KEY = 'myfit-nutrition-profile-v1';

  const REFERENCE_SYSTEMS = Object.freeze({
    japan: {
      id: 'japan',
      label: 'Japan Dietary Reference Intakes',
      status: 'adapter-ready'
    },
    custom: {
      id: 'custom',
      label: 'Custom references',
      status: 'available'
    }
  });

  function readProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : {
        referenceSystem: 'japan',
        sex: null,
        age: null,
        pregnancy: false,
        lactation: false,
        customTargets: {}
      };
    } catch {
      return {
        referenceSystem: 'japan',
        sex: null,
        age: null,
        pregnancy: false,
        lactation: false,
        customTargets: {}
      };
    }
  }

  function saveProfile(profile) {
    const next = { ...readProfile(), ...(profile || {}) };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  }

  function customReference(nutrientKey, profile) {
    const entry = profile.customTargets?.[nutrientKey];
    if (!entry) return null;
    const value = Number(entry.value);
    if (!Number.isFinite(value)) return null;
    return {
      nutrientKey,
      value,
      unit: entry.unit || window.MyFitCockpit?.nutritionFields?.[nutrientKey]?.unit || null,
      basis: 'custom',
      source: entry.source || 'user'
    };
  }

  function getReference(nutrientKey, profileOverride) {
    const profile = { ...readProfile(), ...(profileOverride || {}) };
    if (profile.referenceSystem === 'custom') return customReference(nutrientKey, profile);

    // Official numeric reference tables intentionally live outside the core app model.
    // A verified Japan DRI adapter can be added later without changing UI or nutrition records.
    return customReference(nutrientKey, profile);
  }

  function percentOfReference(nutrientKey, amount, profileOverride) {
    const reference = getReference(nutrientKey, profileOverride);
    const value = Number(amount);
    if (!reference || !Number.isFinite(value) || !reference.value) return null;
    return {
      nutrientKey,
      amount: value,
      reference,
      percent: (value / reference.value) * 100
    };
  }

  const api = {
    referenceSystems: REFERENCE_SYSTEMS,
    getProfile: readProfile,
    saveProfile,
    getReference,
    percentOfReference
  };

  window.MyFitNutritionReference = Object.freeze(api);
})();
