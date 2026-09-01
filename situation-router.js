(() => {
  const seedExercises = [
    {
      name: "椅子で膝伸ばし",
      type: "bodyweight",
      restSeconds: 30,
      positions: ["seated"],
      locations: ["home", "office", "train", "bus"],
      minMinutes: 1,
      intensity: "very-light",
      sweat: "none",
      targets: ["mobility", "wake-up"]
    },
    {
      name: "座ったまま足首ポンプ",
      type: "bodyweight",
      restSeconds: 20,
      positions: ["seated"],
      locations: ["home", "office", "train", "bus"],
      minMinutes: 1,
      intensity: "very-light",
      sweat: "none",
      targets: ["mobility", "wake-up"]
    },
    {
      name: "立ったままカーフレイズ",
      type: "bodyweight",
      restSeconds: 30,
      positions: ["standing"],
      locations: ["home", "office", "train", "outdoor"],
      minMinutes: 1,
      intensity: "light",
      sweat: "none",
      targets: ["strength", "balance"]
    },
    {
      name: "壁プッシュアップ",
      type: "bodyweight",
      restSeconds: 45,
      positions: ["standing"],
      locations: ["home", "office"],
      minMinutes: 3,
      intensity: "light",
      sweat: "low",
      targets: ["strength"]
    },
    {
      name: "プランク",
      type: "bodyweight",
      restSeconds: 60,
      positions: ["floor"],
      locations: ["home"],
      minMinutes: 3,
      intensity: "moderate",
      sweat: "low",
      targets: ["strength"]
    }
  ];

  const fallbackMeta = {
    positions: ["standing", "floor"],
    locations: ["home"],
    minMinutes: 5,
    intensity: "moderate",
    sweat: "normal",
    targets: ["strength"]
  };

  const intensityRank = { "very-light": 0, light: 1, moderate: 2 };
  const sweatRank = { none: 0, low: 1, normal: 2 };

  function normalizeExercise(exercise) {
    if (!exercise.positions) exercise.positions = [...fallbackMeta.positions];
    if (!exercise.locations) exercise.locations = [...fallbackMeta.locations];
    if (!exercise.minMinutes) exercise.minMinutes = fallbackMeta.minMinutes;
    if (!exercise.intensity) exercise.intensity = fallbackMeta.intensity;
    if (!exercise.sweat) exercise.sweat = fallbackMeta.sweat;
    if (!exercise.targets) exercise.targets = [...fallbackMeta.targets];
    return exercise;
  }

  function ensureSituationExercises() {
    data.exercises.forEach(normalizeExercise);
    let changed = false;
    for (const seed of seedExercises) {
      if (data.exercises.some(exercise => exercise.name === seed.name)) continue;
      data.exercises.push({ id: crypto.randomUUID(), ...seed });
      changed = true;
    }
    if (changed) saveData();
    renderExerciseSelect();
  }

  function matchesSituation(exercise, situation) {
    const ex = normalizeExercise(exercise);
    if (!ex.locations.includes(situation.location)) return false;
    if (situation.position !== "any" && !ex.positions.includes(situation.position)) return false;
    if (Number(ex.minMinutes) > situation.minutes) return false;
    if (intensityRank[ex.intensity] > intensityRank[situation.intensity]) return false;
    if (!situation.sweatAllowed && sweatRank[ex.sweat] > sweatRank.none) return false;
    return true;
  }

  function routeExercises(situation) {
    return data.exercises
      .filter(exercise => matchesSituation(exercise, situation))
      .sort((a, b) => Number(a.minMinutes) - Number(b.minMinutes))
      .slice(0, 5);
  }

  function installUI() {
    const todayView = document.getElementById("todayView");
    const workoutPanel = document.getElementById("workoutPanel");
    if (!todayView || !workoutPanel || document.getElementById("situationRouterCard")) return;

    const card = document.createElement("section");
    card.id = "situationRouterCard";
    card.className = "card";
    card.innerHTML = `
      <div class="section-title-row">
        <div><p class="eyebrow">QUICK ROUTER</p><h3 style="margin:0">今できる運動</h3></div>
      </div>
      <div class="input-grid">
        <label>場所<select id="srLocation"><option value="office">職場</option><option value="train">電車</option><option value="bus">バス</option><option value="home">自宅</option><option value="outdoor">屋外</option></select></label>
        <label>時間<select id="srMinutes"><option value="1">1分</option><option value="3" selected>3分</option><option value="5">5分</option><option value="10">10分</option></select></label>
        <label>姿勢<select id="srPosition"><option value="any">どれでも</option><option value="seated" selected>座ったまま</option><option value="standing">立ったまま</option><option value="floor">床</option></select></label>
        <label>強度<select id="srIntensity"><option value="very-light">とても軽い</option><option value="light" selected>軽い</option><option value="moderate">普通</option></select></label>
      </div>
      <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input id="srSweat" type="checkbox" style="width:auto;margin:0">汗をかいてもよい</label>
      <button id="srFind" class="secondary full" type="button">候補を見る</button>
      <div id="srResults" class="stack" style="margin-top:10px"></div>
    `;
    todayView.insertBefore(card, workoutPanel);

    const byId = id => document.getElementById(id);
    const results = byId("srResults");

    function renderResults() {
      const situation = {
        location: byId("srLocation").value,
        minutes: Number(byId("srMinutes").value),
        position: byId("srPosition").value,
        intensity: byId("srIntensity").value,
        sweatAllowed: byId("srSweat").checked
      };
      const matches = routeExercises(situation);
      if (!matches.length) {
        results.innerHTML = `<div class="empty">この条件に合う種目はありません。姿勢・時間・強度を少し広げてください。</div>`;
        return;
      }
      results.innerHTML = matches.map(exercise => `
        <button type="button" class="ghost full" data-sr-exercise="${exercise.id}" style="text-align:left">
          <strong>${escapeHtml(exercise.name)}</strong><br>
          <span class="muted">${exercise.minMinutes}分〜 · ${exercise.intensity} · 汗 ${exercise.sweat}</span>
        </button>
      `).join("");
      results.querySelectorAll("[data-sr-exercise]").forEach(button => {
        button.addEventListener("click", () => {
          const exerciseId = button.dataset.srExercise;
          if (!data.activeWorkout) startWorkout();
          data.activeWorkout.selectedExerciseId = exerciseId;
          saveData();
          renderExerciseSelect();
          document.getElementById("workoutPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    byId("srFind").addEventListener("click", renderResults);
  }

  ensureSituationExercises();
  installUI();
})();
