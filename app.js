const STORAGE_KEY = "myfit-data-v1";

const defaultData = {
  exercises: [
    { id: crypto.randomUUID(), name: "スクワット", type: "bodyweight", restSeconds: 90 },
    { id: crypto.randomUUID(), name: "ダンベルベンチプレス", type: "standard", restSeconds: 90 },
    { id: crypto.randomUUID(), name: "ワンハンドロー", type: "sided", restSeconds: 90 },
    { id: crypto.randomUUID(), name: "ダンベルカール", type: "sided", restSeconds: 60 },
    { id: crypto.randomUUID(), name: "腹筋", type: "bodyweight", restSeconds: 60 }
  ],
  workouts: [],
  activeWorkout: null
};

let data = loadData();
let elapsedInterval = null;
let restInterval = null;
let restRemaining = 90;
let restRunning = false;

const $ = (id) => document.getElementById(id);
const els = {
  todayDate: $("todayDate"),
  elapsedTime: $("elapsedTime"),
  startWorkoutBtn: $("startWorkoutBtn"),
  workoutPanel: $("workoutPanel"),
  exerciseSelect: $("exerciseSelect"),
  previousRecord: $("previousRecord"),
  standardInputs: $("standardInputs"),
  bodyweightInputs: $("bodyweightInputs"),
  sidedInputs: $("sidedInputs"),
  weightInput: $("weightInput"),
  repsInput: $("repsInput"),
  bodyweightRepsInput: $("bodyweightRepsInput"),
  rightWeightInput: $("rightWeightInput"),
  rightRepsInput: $("rightRepsInput"),
  leftWeightInput: $("leftWeightInput"),
  leftRepsInput: $("leftRepsInput"),
  setMemo: $("setMemo"),
  completeSetBtn: $("completeSetBtn"),
  setsList: $("setsList"),
  setCountBadge: $("setCountBadge"),
  restTimer: $("restTimer"),
  toggleTimerBtn: $("toggleTimerBtn"),
  plus30Btn: $("plus30Btn"),
  minus30Btn: $("minus30Btn"),
  finishWorkoutBtn: $("finishWorkoutBtn"),
  addExerciseBtn: $("addExerciseBtn"),
  historyList: $("historyList"),
  exerciseForm: $("exerciseForm"),
  exerciseNameInput: $("exerciseNameInput"),
  exerciseTypeInput: $("exerciseTypeInput"),
  restSecondsInput: $("restSecondsInput"),
  exerciseList: $("exerciseList"),
  exportBtn: $("exportBtn"),
  importInput: $("importInput"),
  resetBtn: $("resetBtn"),
  summaryDialog: $("summaryDialog"),
  summaryContent: $("summaryContent"),
  closeSummaryBtn: $("closeSummaryBtn")
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.max(0, totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h ? `${h}時間${m}分` : `${m}分`;
}
function currentExercise() {
  return data.exercises.find(e => e.id === els.exerciseSelect.value);
}
function currentSets() {
  return data.activeWorkout?.sets || [];
}
function setTodayDate() {
  els.todayDate.textContent = new Intl.DateTimeFormat("ja-JP", {
    month:"long", day:"numeric", weekday:"short"
  }).format(new Date());
}

function renderExerciseSelect() {
  els.exerciseSelect.innerHTML = data.exercises
    .map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("");
  if (data.activeWorkout?.selectedExerciseId &&
      data.exercises.some(e => e.id === data.activeWorkout.selectedExerciseId)) {
    els.exerciseSelect.value = data.activeWorkout.selectedExerciseId;
  }
  updateExerciseInputs();
}
function updateExerciseInputs() {
  const ex = currentExercise();
  if (!ex) return;
  data.activeWorkout && (data.activeWorkout.selectedExerciseId = ex.id);
  els.standardInputs.classList.toggle("hidden", ex.type !== "standard");
  els.bodyweightInputs.classList.toggle("hidden", ex.type !== "bodyweight");
  els.sidedInputs.classList.toggle("hidden", ex.type !== "sided");

  const prev = findPreviousSet(ex.id);
  if (prev) {
    els.previousRecord.textContent = `前回：${describeSet(prev, ex)}`;
    if (ex.type === "standard") {
      els.weightInput.value = prev.weight ?? "";
      els.repsInput.value = prev.reps ?? "";
    } else if (ex.type === "bodyweight") {
      els.bodyweightRepsInput.value = prev.reps ?? "";
    } else {
      els.rightWeightInput.value = prev.rightWeight ?? "";
      els.rightRepsInput.value = prev.rightReps ?? "";
      els.leftWeightInput.value = prev.leftWeight ?? "";
      els.leftRepsInput.value = prev.leftReps ?? "";
    }
  } else {
    els.previousRecord.textContent = "前回記録はありません";
  }
  resetRest(ex.restSeconds);
  saveData();
}
function findPreviousSet(exerciseId) {
  for (let i = data.workouts.length - 1; i >= 0; i--) {
    const matches = data.workouts[i].sets.filter(s => s.exerciseId === exerciseId);
    if (matches.length) return matches[matches.length - 1];
  }
  return null;
}
function describeSet(set, exercise) {
  if (exercise.type === "standard") return `${set.weight}kg × ${set.reps}回`;
  if (exercise.type === "bodyweight") return `${set.reps}回`;
  return `右 ${set.rightWeight}kg × ${set.rightReps}回／左 ${set.leftWeight}kg × ${set.leftReps}回`;
}
function validatePositive(...values) {
  return values.every(v => Number.isFinite(Number(v)) && Number(v) > 0);
}
function completeSet() {
  if (!data.activeWorkout) return;
  const ex = currentExercise();
  if (!ex) return;

  const base = {
    id: crypto.randomUUID(),
    exerciseId: ex.id,
    createdAt: new Date().toISOString(),
    memo: els.setMemo.value.trim()
  };

  let set;
  if (ex.type === "standard") {
    if (!validatePositive(els.weightInput.value, els.repsInput.value)) return alert("重量と回数を入力してください。");
    set = { ...base, weight:Number(els.weightInput.value), reps:Number(els.repsInput.value) };
  } else if (ex.type === "bodyweight") {
    if (!validatePositive(els.bodyweightRepsInput.value)) return alert("回数を入力してください。");
    set = { ...base, reps:Number(els.bodyweightRepsInput.value) };
  } else {
    if (!validatePositive(
      els.rightWeightInput.value, els.rightRepsInput.value,
      els.leftWeightInput.value, els.leftRepsInput.value
    )) return alert("左右の重量と回数を入力してください。");
    set = {
      ...base,
      rightWeight:Number(els.rightWeightInput.value),
      rightReps:Number(els.rightRepsInput.value),
      leftWeight:Number(els.leftWeightInput.value),
      leftReps:Number(els.leftRepsInput.value)
    };
  }

  data.activeWorkout.sets.push(set);
  els.setMemo.value = "";
  saveData();
  renderSets();
  startRestTimer(ex.restSeconds);
  if (navigator.vibrate) navigator.vibrate(80);
}
function renderSets() {
  const sets = currentSets();
  els.setCountBadge.textContent = `${sets.length}セット`;
  if (!sets.length) {
    els.setsList.className = "empty";
    els.setsList.textContent = "まだ記録がありません";
    return;
  }
  els.setsList.className = "";
  els.setsList.innerHTML = sets.slice().reverse().map((set, idx) => {
    const ex = data.exercises.find(e => e.id === set.exerciseId);
    const actualIndex = sets.length - 1 - idx;
    return `<div class="set-item">
      <header>
        <div>
          <strong>${escapeHtml(ex?.name || "削除済み種目")}</strong>
          <div class="set-meta">${ex ? describeSet(set, ex) : ""}</div>
          ${set.memo ? `<div class="set-meta">メモ：${escapeHtml(set.memo)}</div>` : ""}
        </div>
        <button class="delete-btn" data-delete-set="${actualIndex}">削除</button>
      </header>
    </div>`;
  }).join("");
  document.querySelectorAll("[data-delete-set]").forEach(btn => {
    btn.addEventListener("click", () => {
      data.activeWorkout.sets.splice(Number(btn.dataset.deleteSet), 1);
      saveData(); renderSets();
    });
  });
}
function startWorkout() {
  if (!data.exercises.length) return alert("先に種目を登録してください。");
  data.activeWorkout = {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    selectedExerciseId: data.exercises[0].id,
    sets: []
  };
  saveData();
  syncWorkoutUI();
}
function syncWorkoutUI() {
  const active = !!data.activeWorkout;
  els.workoutPanel.classList.toggle("hidden", !active);
  els.startWorkoutBtn.classList.toggle("hidden", active);
  renderExerciseSelect();
  renderSets();
  updateElapsed();
  if (active) startElapsedClock();
}
function startElapsedClock() {
  clearInterval(elapsedInterval);
  elapsedInterval = setInterval(updateElapsed, 1000);
}
function updateElapsed() {
  if (!data.activeWorkout) {
    els.elapsedTime.textContent = "00:00";
    return;
  }
  const seconds = Math.floor((Date.now() - new Date(data.activeWorkout.startedAt).getTime()) / 1000);
  els.elapsedTime.textContent = formatTime(seconds);
}
function resetRest(seconds) {
  clearInterval(restInterval);
  restRunning = false;
  restRemaining = Number(seconds || 90);
  els.toggleTimerBtn.textContent = "開始";
  els.restTimer.textContent = formatTime(restRemaining);
}
function startRestTimer(seconds) {
  resetRest(seconds);
  restRunning = true;
  els.toggleTimerBtn.textContent = "一時停止";
  restInterval = setInterval(() => {
    restRemaining -= 1;
    els.restTimer.textContent = formatTime(restRemaining);
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      restRunning = false;
      els.toggleTimerBtn.textContent = "再開";
      if (navigator.vibrate) navigator.vibrate([200,100,200]);
      try { new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play(); } catch {}
    }
  }, 1000);
}
function toggleRestTimer() {
  if (restRunning) {
    clearInterval(restInterval);
    restRunning = false;
    els.toggleTimerBtn.textContent = "再開";
  } else {
    startRestTimer(restRemaining);
  }
}
function finishWorkout() {
  const w = data.activeWorkout;
  if (!w) return;
  if (!w.sets.length && !confirm("セット記録がありません。終了しますか？")) return;
  w.endedAt = new Date().toISOString();
  data.workouts.push(w);
  data.activeWorkout = null;
  saveData();
  clearInterval(elapsedInterval);
  clearInterval(restInterval);
  showSummary(w);
  renderHistory();
  syncWorkoutUI();
}
function setVolume(set, ex) {
  if (!ex) return 0;
  if (ex.type === "standard") return set.weight * set.reps;
  if (ex.type === "sided") return set.rightWeight * set.rightReps + set.leftWeight * set.leftReps;
  return 0;
}
function showSummary(w) {
  const exerciseIds = new Set(w.sets.map(s => s.exerciseId));
  const volume = w.sets.reduce((sum, s) => sum + setVolume(s, data.exercises.find(e => e.id === s.exerciseId)), 0);
  els.summaryContent.innerHTML = `<div class="summary-grid">
    <div class="summary-cell"><span>時間</span><strong>${formatDuration(new Date(w.endedAt)-new Date(w.startedAt))}</strong></div>
    <div class="summary-cell"><span>種目数</span><strong>${exerciseIds.size}</strong></div>
    <div class="summary-cell"><span>セット数</span><strong>${w.sets.length}</strong></div>
    <div class="summary-cell"><span>総ボリューム</span><strong>${Math.round(volume)}kg</strong></div>
  </div>`;
  els.summaryDialog.showModal();
}
function renderHistory() {
  if (!data.workouts.length) {
    els.historyList.innerHTML = `<div class="card empty">まだ履歴がありません</div>`;
    return;
  }
  els.historyList.innerHTML = data.workouts.slice().reverse().map(w => {
    const date = new Intl.DateTimeFormat("ja-JP", {year:"numeric",month:"long",day:"numeric",weekday:"short"}).format(new Date(w.startedAt));
    const exCount = new Set(w.sets.map(s => s.exerciseId)).size;
    const volume = Math.round(w.sets.reduce((sum, s) => sum + setVolume(s, data.exercises.find(e => e.id === s.exerciseId)), 0));
    const details = w.sets.map(s => {
      const ex = data.exercises.find(e => e.id === s.exerciseId);
      return `<div class="set-meta">${escapeHtml(ex?.name || "削除済み種目")}：${ex ? describeSet(s, ex) : ""}</div>`;
    }).join("");
    return `<div class="history-item">
      <header><strong>${date}</strong><span class="badge">${w.sets.length}セット</span></header>
      <div class="history-meta">${formatDuration(new Date(w.endedAt)-new Date(w.startedAt))}・${exCount}種目・総ボリューム ${volume}kg</div>
      <details><summary>詳細を見る</summary>${details}</details>
    </div>`;
  }).join("");
}
function renderExerciseList() {
  if (!data.exercises.length) {
    els.exerciseList.innerHTML = `<div class="card empty">種目がありません</div>`;
    return;
  }
  const labels = { standard:"重量＋回数", bodyweight:"自重", sided:"左右別" };
  els.exerciseList.innerHTML = data.exercises.map(ex => `
    <div class="exercise-item">
      <header>
        <div><strong>${escapeHtml(ex.name)}</strong>
        <div class="set-meta">${labels[ex.type]}・休憩${ex.restSeconds}秒</div></div>
        <button class="delete-btn" data-delete-exercise="${ex.id}">削除</button>
      </header>
    </div>`).join("");
  document.querySelectorAll("[data-delete-exercise]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm("この種目を削除しますか？ 過去の記録は残ります。")) return;
      data.exercises = data.exercises.filter(e => e.id !== btn.dataset.deleteExercise);
      saveData(); renderExerciseList(); renderExerciseSelect();
    });
  });
}
function addExercise(event) {
  event.preventDefault();
  const name = els.exerciseNameInput.value.trim();
  if (!name) return;
  data.exercises.push({
    id: crypto.randomUUID(),
    name,
    type: els.exerciseTypeInput.value,
    restSeconds: Number(els.restSecondsInput.value)
  });
  saveData();
  els.exerciseForm.reset();
  els.restSecondsInput.value = "90";
  renderExerciseList();
  renderExerciseSelect();
}
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `myfit-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
async function importData(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed.exercises || !parsed.workouts) throw new Error();
    data = parsed;
    saveData();
    renderAll();
    alert("バックアップを読み込みました。");
  } catch {
    alert("読み込みに失敗しました。");
  }
}
function resetAll() {
  if (!confirm("すべての種目と記録を削除します。元に戻せません。")) return;
  localStorage.removeItem(STORAGE_KEY);
  data = structuredClone(defaultData);
  saveData();
  renderAll();
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[c]);
}
function switchView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  if (id === "historyView") renderHistory();
  if (id === "exercisesView") renderExerciseList();
}
function renderAll() {
  setTodayDate();
  syncWorkoutUI();
  renderHistory();
  renderExerciseList();
}

els.startWorkoutBtn.addEventListener("click", startWorkout);
els.exerciseSelect.addEventListener("change", updateExerciseInputs);
els.completeSetBtn.addEventListener("click", completeSet);
els.toggleTimerBtn.addEventListener("click", toggleRestTimer);
els.plus30Btn.addEventListener("click", () => { restRemaining += 30; els.restTimer.textContent = formatTime(restRemaining); });
els.minus30Btn.addEventListener("click", () => { restRemaining = Math.max(0, restRemaining - 30); els.restTimer.textContent = formatTime(restRemaining); });
els.finishWorkoutBtn.addEventListener("click", finishWorkout);
els.exerciseForm.addEventListener("submit", addExercise);
els.addExerciseBtn.addEventListener("click", () => switchView("exercisesView"));
els.exportBtn.addEventListener("click", exportData);
els.importInput.addEventListener("change", e => e.target.files[0] && importData(e.target.files[0]));
els.resetBtn.addEventListener("click", resetAll);
els.closeSummaryBtn.addEventListener("click", () => els.summaryDialog.close());
document.querySelectorAll(".bottom-nav button").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
renderAll();
