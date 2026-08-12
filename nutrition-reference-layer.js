(() => {
  const PROFILE_KEY = 'myfit-nutrition-profile-v1';
  const SOURCE = Object.freeze({
    system:'Japan Dietary Reference Intakes 2025',
    authority:'Ministry of Health, Labour and Welfare, Japan',
    effectiveFrom:'2025-04-01',
    effectiveTo:'2030-03-31',
    verified:'2026-08-12'
  });

  const REFERENCE_SYSTEMS = Object.freeze({
    japan: { id:'japan', label:'Japan Dietary Reference Intakes 2025', status:'verified-partial' },
    custom: { id:'custom', label:'Custom references', status:'available' }
  });

  // First verified cohort. Other cohorts are intentionally not inferred.
  // Each entry keeps the official indicator type: recommended / adequate / target / upper.
  const JAPAN_DRI_2025 = Object.freeze({
    male: {
      '50-64': {
        vitaminAMcgRAE:{ value:900, unit:'mcg RAE', basis:'recommended', upper:2700 },
        vitaminB1Mg:{ value:1.1, unit:'mg', basis:'recommended' },
        vitaminB2Mg:{ value:1.6, unit:'mg', basis:'recommended' },
        vitaminB3MgNE:{ value:15, unit:'mg NE', basis:'recommended' },
        vitaminB5Mg:{ value:6.0, unit:'mg', basis:'adequate' },
        vitaminB6Mg:{ value:1.5, unit:'mg', basis:'recommended', upper:60 },
        vitaminB7Mcg:{ value:50, unit:'mcg', basis:'adequate' },
        vitaminB9McgDFE:{ value:240, unit:'mcg', basis:'recommended', upper:1000 },
        vitaminB12Mcg:{ value:4.0, unit:'mcg', basis:'adequate' },
        vitaminCMg:{ value:100, unit:'mg', basis:'recommended' },
        vitaminDMcg:{ value:9.0, unit:'mcg', basis:'adequate', upper:100 },
        vitaminEMgAlphaTE:{ value:6.5, unit:'mg alpha-TE', basis:'adequate', upper:800 },
        vitaminKMcg:{ value:150, unit:'mcg', basis:'adequate' },

        potassiumMg:{ value:3000, unit:'mg', basis:'target-min', adequate:2500 },
        calciumMg:{ value:750, unit:'mg', basis:'recommended', upper:2500 },
        magnesiumMg:{ value:370, unit:'mg', basis:'recommended' },
        phosphorusMg:{ value:1000, unit:'mg', basis:'adequate', upper:3000 },
        ironMg:{ value:7.0, unit:'mg', basis:'recommended' },
        zincMg:{ value:9.5, unit:'mg', basis:'recommended', upper:45 },
        copperMg:{ value:0.9, unit:'mg', basis:'recommended', upper:7 },
        manganeseMg:{ value:3.5, unit:'mg', basis:'adequate', upper:11 },
        chromiumMcg:{ value:10, unit:'mcg', basis:'adequate', upper:500 },
        molybdenumMcg:{ value:30, unit:'mcg', basis:'recommended', upper:600 }
      }
    }
  });

  function readProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : { referenceSystem:'japan', sex:null, age:null, pregnancy:false, lactation:false, customTargets:{} };
    } catch {
      return { referenceSystem:'japan', sex:null, age:null, pregnancy:false, lactation:false, customTargets:{} };
    }
  }

  function saveProfile(profile) {
    const next = { ...readProfile(), ...(profile || {}) };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  }

  function ageBand(age) {
    const n = Number(age);
    if (!Number.isFinite(n)) return null;
    if (n >= 50 && n <= 64) return '50-64';
    return null;
  }

  function customReference(nutrientKey, profile) {
    const entry = profile.customTargets?.[nutrientKey];
    if (!entry) return null;
    const value = Number(entry.value);
    if (!Number.isFinite(value)) return null;
    return { nutrientKey, value, unit:entry.unit || window.MyFitCockpit?.nutritionFields?.[nutrientKey]?.unit || null, basis:'custom', source:entry.source || 'user' };
  }

  function japanReference(nutrientKey, profile) {
    const sex = profile.sex === 'male' || profile.sex === 'female' ? profile.sex : null;
    const band = ageBand(profile.age);
    const entry = sex && band ? JAPAN_DRI_2025[sex]?.[band]?.[nutrientKey] : null;
    if (!entry) return null;
    return { nutrientKey, ...entry, ageBand:band, sex, source:SOURCE };
  }

  function getReference(nutrientKey, profileOverride) {
    const profile = { ...readProfile(), ...(profileOverride || {}) };
    if (profile.referenceSystem === 'custom') return customReference(nutrientKey, profile);
    return japanReference(nutrientKey, profile) || customReference(nutrientKey, profile);
  }

  function percentOfReference(nutrientKey, amount, profileOverride) {
    const reference = getReference(nutrientKey, profileOverride);
    const value = Number(amount);
    if (!reference || !Number.isFinite(value) || !reference.value) return null;
    return { nutrientKey, amount:value, reference, percent:(value / reference.value) * 100 };
  }

  const api = {
    referenceSystems:REFERENCE_SYSTEMS,
    source:SOURCE,
    getProfile:readProfile,
    saveProfile,
    getReference,
    percentOfReference,
    supportedProfile(profileOverride) {
      const p={...readProfile(),...(profileOverride||{})};
      return !!(JAPAN_DRI_2025[p.sex]?.[ageBand(p.age)]);
    }
  };

  window.MyFitNutritionReference = Object.freeze(api);
})();
