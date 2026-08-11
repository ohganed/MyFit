(() => {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 760px) {
      body.workout-active { overflow: hidden; }
      body.workout-active .app-shell { height: 100dvh; min-height: 0; padding-bottom: 0; overflow: hidden; }
      body.workout-active .topbar { padding: calc(7px + env(safe-area-inset-top)) 14px 5px; position: relative; }
      body.workout-active .topbar .eyebrow { display: none; }
      body.workout-active .topbar h1 { font-size: 20px; }
      body.workout-active .elapsed-wrap { font-size: 10px; }
      body.workout-active .elapsed-wrap strong { font-size: 16px; }
      body.workout-active main { height: calc(100dvh - 49px - env(safe-area-inset-top)); padding: 4px 10px calc(62px + env(safe-area-inset-bottom)); overflow: hidden; }
      body.workout-active #todayView,
      body.workout-active #workoutPanel { height: 100%; }
      body.workout-active #todayView > .hero { display: none; }
      body.workout-active #workoutPanel { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 6px; }
      body.workout-active #workoutPanel > .card:first-child { margin: 0; padding: 8px 10px; border-radius: 14px; }
      body.workout-active #workoutPanel > .card:first-child .section-title-row { display: none; }
      body.workout-active #exerciseSelect { margin: 0; padding: 10px 12px; }
      body.workout-active #previousRecord { display: none; }
      body.workout-active #workoutPanel > .card:nth-child(2) { margin: 0; padding: 10px; border-radius: 14px; overflow: hidden; }
      body.workout-active #workoutPanel > .card:nth-child(2) > h3 { font-size: 14px; margin: 0 0 5px; }
      body.workout-active label { font-size: 12px; margin-bottom: 6px; }
      body.workout-active input,
      body.workout-active select,
      body.workout-active textarea { padding: 10px; margin-top: 4px; }
      body.workout-active .input-grid { gap: 7px; }
      body.workout-active .memo-label { display: none; }
      body.workout-active .fast-set-panel { margin: 3px 0 7px; padding: 8px; }
      body.workout-active .fast-set-top { margin-bottom: 6px; }
      body.workout-active .fast-set-label { font-size: 10px; }
      body.workout-active .fast-set-last { font-size: 13px; }
      body.workout-active .fast-set-actions { gap: 5px; }
      body.workout-active .fast-set-actions button { min-height: 34px; padding: 6px 4px; font-size: 11px; }
      body.workout-active #completeSetBtn { padding: 11px; }
      body.workout-active #workoutPanel > .card:nth-child(3),
      body.workout-active #workoutPanel > .timer-card,
      body.workout-active #finishWorkoutBtn { display: none; }
      body.workout-active .bottom-nav { padding-top: 5px; padding-bottom: calc(5px + env(safe-area-inset-bottom)); }
      body.workout-active .bottom-nav button { padding: 4px 2px; }
      body.workout-active .bottom-nav button span { font-size: 15px; margin-bottom: 0; }
      body.workout-active .timer-fab { bottom: calc(57px + env(safe-area-inset-bottom)); right: 12px; padding: 10px 14px; }
    }
  `;
  document.head.appendChild(style);

  function syncCompactMode() {
    const active = !!window.data?.activeWorkout || !!document.getElementById("workoutPanel")?.classList.contains("hidden") === false;
    document.body.classList.toggle("workout-active", active);
  }

  const panel = document.getElementById("workoutPanel");
  if (panel) new MutationObserver(syncCompactMode).observe(panel, { attributes: true, attributeFilter: ["class"] });
  document.getElementById("startWorkoutBtn")?.addEventListener("click", () => setTimeout(syncCompactMode, 0));
  document.getElementById("finishWorkoutBtn")?.addEventListener("click", () => setTimeout(syncCompactMode, 0));
  syncCompactMode();
})();
