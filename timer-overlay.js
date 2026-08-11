(() => {
  const style = document.createElement("style");
  style.textContent = `
    .timer-fab {
      position: fixed;
      right: max(16px, calc((100vw - 760px) / 2 + 16px));
      bottom: calc(78px + env(safe-area-inset-bottom));
      z-index: 20;
      border: 0;
      border-radius: 999px;
      padding: 13px 17px;
      background: #111827;
      color: #fff;
      font-weight: 900;
      box-shadow: 0 8px 24px rgba(17,24,39,.24);
    }
    .timer-fab[hidden] { display: none !important; }
    .timer-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100dvh;
      padding: calc(18px + env(safe-area-inset-top)) 18px calc(18px + env(safe-area-inset-bottom));
      background: #111827;
      color: #fff;
      overscroll-behavior: none;
    }
    .timer-overlay[hidden] { display: none !important; }
    .timer-overlay.alarm {
      animation: myfitTimerFlash 1.2s steps(1, end) infinite;
    }
    @keyframes myfitTimerFlash {
      0%, 49% { background: #111827; color: #fff; }
      50%, 100% { background: #f8fafc; color: #111827; }
    }
    .timer-overlay-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .timer-overlay-label {
      margin: 0;
      font-size: 12px;
      letter-spacing: .16em;
      font-weight: 900;
      opacity: .72;
    }
    .timer-overlay-close {
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      border-radius: 999px;
      padding: 9px 12px;
      font-size: 13px;
      font-weight: 800;
    }
    .timer-overlay-main {
      text-align: center;
      width: 100%;
      max-width: 560px;
      margin: auto;
    }
    .timer-overlay-status {
      min-height: 28px;
      margin: 0 0 8px;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: .04em;
    }
    .timer-overlay-time {
      font-size: clamp(88px, 25vw, 160px);
      line-height: .95;
      font-weight: 950;
      letter-spacing: -.07em;
      font-variant-numeric: tabular-nums;
      margin: 18px 0 34px;
    }
    .timer-overlay-adjust {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    .timer-overlay button {
      min-height: 52px;
    }
    .timer-overlay-adjust button,
    .timer-overlay-toggle {
      border: 1px solid rgba(255,255,255,.28);
      background: rgba(255,255,255,.12);
      color: inherit;
      border-radius: 16px;
      font-weight: 900;
    }
    .timer-overlay.alarm .timer-overlay-adjust button,
    .timer-overlay.alarm .timer-overlay-toggle {
      border-color: rgba(17,24,39,.25);
      background: rgba(17,24,39,.08);
    }
    .timer-overlay-toggle {
      width: 100%;
      font-size: 18px;
    }
    .timer-overlay-stop {
      width: 100%;
      max-width: 560px;
      margin: 16px auto 0;
      border: 0;
      border-radius: 17px;
      background: #fff;
      color: #111827;
      font-size: 17px;
      font-weight: 950;
    }
    .timer-overlay.alarm .timer-overlay-stop {
      background: #111827;
      color: #fff;
    }
    @media (max-width: 380px) {
      .timer-fab { right: 12px; }
      .timer-overlay-time { font-size: 82px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .timer-overlay.alarm { animation: none; background: #f8fafc; color: #111827; }
    }
  `;
  document.head.appendChild(style);

  const fab = document.createElement("button");
  fab.id = "openRestTimerBtn";
  fab.className = "timer-fab";
  fab.type = "button";
  fab.textContent = "⏱ タイマー";
  fab.hidden = true;
  document.body.appendChild(fab);

  const overlay = document.createElement("section");
  overlay.id = "restTimerOverlay";
  overlay.className = "timer-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "休憩タイマー");
  overlay.innerHTML = `
    <div class="timer-overlay-top">
      <p class="timer-overlay-label">REST TIMER</p>
      <button id="timerOverlayClose" class="timer-overlay-close" type="button">戻る</button>
    </div>
    <div class="timer-overlay-main">
      <p id="timerOverlayStatus" class="timer-overlay-status">休憩</p>
      <div id="timerOverlayTime" class="timer-overlay-time">01:30</div>
      <div class="timer-overlay-adjust">
        <button id="timerOverlayMinus" type="button">−30秒</button>
        <button id="timerOverlayPlus" type="button">＋30秒</button>
      </div>
      <button id="timerOverlayToggle" class="timer-overlay-toggle" type="button">開始</button>
    </div>
    <button id="timerOverlayStop" class="timer-overlay-stop" type="button">タイマーを終了して戻る</button>
  `;
  document.body.appendChild(overlay);

  const overlayTime = document.getElementById("timerOverlayTime");
  const overlayStatus = document.getElementById("timerOverlayStatus");
  const overlayToggle = document.getElementById("timerOverlayToggle");
  const overlayMinus = document.getElementById("timerOverlayMinus");
  const overlayPlus = document.getElementById("timerOverlayPlus");
  const overlayStop = document.getElementById("timerOverlayStop");
  const overlayClose = document.getElementById("timerOverlayClose");

  let audioContext = null;
  let alarmInterval = null;
  let alarmActive = false;
  let previousRemaining = Number(restRemaining);

  function unlockAudio() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === "suspended") audioContext.resume();
    } catch {}
  }

  function ringBell() {
    if (!audioContext) return;
    try {
      const now = audioContext.currentTime;
      [0, 0.16, 0.34].forEach((delay, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime([880, 1174, 880][index], now + delay);
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.22, now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.22);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.24);
      });
    } catch {}
  }

  function startAlarm() {
    if (alarmActive) return;
    alarmActive = true;
    overlay.hidden = false;
    overlay.classList.add("alarm");
    overlayStatus.textContent = "休憩終了";
    overlayStop.textContent = "停止してトレーニングへ戻る";
    overlayToggle.disabled = true;
    overlayMinus.disabled = true;
    overlayPlus.disabled = true;
    ringBell();
    alarmInterval = setInterval(ringBell, 1500);
    if (navigator.vibrate) navigator.vibrate([250, 120, 250, 120, 400]);
  }

  function stopAlarm() {
    alarmActive = false;
    clearInterval(alarmInterval);
    alarmInterval = null;
    overlay.classList.remove("alarm");
    overlayToggle.disabled = false;
    overlayMinus.disabled = false;
    overlayPlus.disabled = false;
    if (navigator.vibrate) navigator.vibrate(0);
  }

  function updateOverlay() {
    overlayTime.textContent = formatTime(restRemaining);
    if (!alarmActive) {
      overlayStatus.textContent = restRunning ? "休憩中" : "休憩タイマー";
      overlayToggle.textContent = restRunning ? "一時停止" : (restRemaining > 0 ? "開始 / 再開" : "開始");
      overlayStop.textContent = "タイマーを終了して戻る";
    }
  }

  function openOverlay() {
    unlockAudio();
    overlay.hidden = false;
    updateOverlay();
  }

  function stopTimerAndReturn() {
    stopAlarm();
    clearInterval(restInterval);
    restRunning = false;
    const ex = typeof currentExercise === "function" ? currentExercise() : null;
    resetRest(ex?.restSeconds || 90);
    previousRemaining = Number(restRemaining);
    overlay.hidden = true;
  }

  function closeOverlayWithoutReset() {
    stopAlarm();
    overlay.hidden = true;
  }

  fab.addEventListener("click", openOverlay);
  overlayToggle.addEventListener("click", () => {
    unlockAudio();
    els.toggleTimerBtn.click();
    updateOverlay();
  });
  overlayMinus.addEventListener("click", () => {
    els.minus30Btn.click();
    updateOverlay();
  });
  overlayPlus.addEventListener("click", () => {
    els.plus30Btn.click();
    updateOverlay();
  });
  overlayStop.addEventListener("click", stopTimerAndReturn);
  overlayClose.addEventListener("click", () => {
    if (restRunning || alarmActive) stopTimerAndReturn();
    else closeOverlayWithoutReset();
  });

  els.completeSetBtn.addEventListener("click", () => {
    unlockAudio();
    setTimeout(() => {
      if (restRunning) openOverlay();
    }, 0);
  });

  setInterval(() => {
    const activeWorkoutVisible = !els.workoutPanel.classList.contains("hidden");
    fab.hidden = !activeWorkoutVisible || !overlay.hidden;

    const currentRemaining = Number(restRemaining);
    if (previousRemaining > 0 && currentRemaining <= 0 && !restRunning) {
      startAlarm();
    }
    previousRemaining = currentRemaining;

    if (!overlay.hidden) updateOverlay();
  }, 150);
})();
