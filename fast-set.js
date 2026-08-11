(() => {
  const style = document.createElement("style");
  style.textContent = `
    .fast-set-panel {
      margin: 0 0 16px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: #f8fafc;
    }
    .fast-set-panel[hidden] { display: none !important; }
    .fast-set-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }
    .fast-set-label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .04em;
    }
    .fast-set-last {
      font-size: 16px;
      font-weight: 900;
      text-align: right;
    }
    .fast-set-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .fast-set-actions button {
      min-height: 44px;
      padding: 10px 8px;
      background: #fff;
      border: 1px solid var(--line);
      color: var(--text);
      font-size: 13px;
    }
    .fast-set-actions button.primary-fast {
      grid-column: 1 / -1;
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    @media (max-width: 380px) {
      .fast-set-top { align-items: flex-start; flex-direction: column; }
      .fast-set-last { text-align: left; }
      .fast-set-actions { grid-template-columns: 1fr 1fr; }
      .fast-set-actions button.primary-fast { grid-column: 1 / -1; }
    }
  `;
  document.head.appendChild(style);

  const completeBtn = document.getElementById("completeSetBtn");
  const memo = document.querySelector(".memo-label");
  if (!completeBtn || !memo) return;

  const panel = document.createElement("div");
  panel.className = "fast-set-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="fast-set-top">
      <span class="fast-set-label">今日の直前セット</span>
      <span id="fastSetLast" class="fast-set-last"></span>
    </div>
    <div id="fastSetActions" class="fast-set-actions"></div>
  `;
  memo.parentNode.insertBefore(panel, memo);

  const lastEl = document.getElementById("fastSetLast");
  const actionsEl = document.getElementById("fastSetActions");

  function lastSetForCurrentExercise() {
    const ex = currentExercise();
    if (!ex || !data.activeWorkout) return null;
    const matches = data.activeWorkout.sets.filter(set => set.exerciseId === ex.id);
    return matches.length ? matches[matches.length - 1] : null;
  }

  function copyLastSet() {
    const ex = currentExercise();
    const set = lastSetForCurrentExercise();
    if (!ex || !set) return;

    if (ex.type === "standard") {
      els.weightInput.value = set.weight ?? "";
      els.repsInput.value = set.reps ?? "";
      els.weightInput.focus();
    } else if (ex.type === "bodyweight") {
      els.bodyweightRepsInput.value = set.reps ?? "";
      els.bodyweightRepsInput.focus();
    } else {
      els.rightWeightInput.value = set.rightWeight ?? "";
      els.rightRepsInput.value = set.rightReps ?? "";
      els.leftWeightInput.value = set.leftWeight ?? "";
      els.leftRepsInput.value = set.leftReps ?? "";
      els.rightWeightInput.focus();
    }
  }

  function numericValue(input, fallback) {
    const n = Number(input.value);
    return Number.isFinite(n) && input.value !== "" ? n : Number(fallback || 0);
  }

  function adjust(kind, amount) {
    const ex = currentExercise();
    const set = lastSetForCurrentExercise();
    if (!ex || !set) return;

    if (ex.type === "standard") {
      if (kind === "weight") {
        const next = Math.max(0, numericValue(els.weightInput, set.weight) + amount);
        els.weightInput.value = next;
        els.weightInput.focus();
      } else {
        const next = Math.max(1, numericValue(els.repsInput, set.reps) + amount);
        els.repsInput.value = next;
        els.repsInput.focus();
      }
    } else if (ex.type === "bodyweight") {
      const next = Math.max(1, numericValue(els.bodyweightRepsInput, set.reps) + amount);
      els.bodyweightRepsInput.value = next;
      els.bodyweightRepsInput.focus();
    } else {
      if (kind === "weight") {
        els.rightWeightInput.value = Math.max(0, numericValue(els.rightWeightInput, set.rightWeight) + amount);
        els.leftWeightInput.value = Math.max(0, numericValue(els.leftWeightInput, set.leftWeight) + amount);
        els.rightWeightInput.focus();
      } else {
        els.rightRepsInput.value = Math.max(1, numericValue(els.rightRepsInput, set.rightReps) + amount);
        els.leftRepsInput.value = Math.max(1, numericValue(els.leftRepsInput, set.leftReps) + amount);
        els.rightRepsInput.focus();
      }
    }
  }

  function button(label, handler, primary = false) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    if (primary) btn.classList.add("primary-fast");
    btn.addEventListener("click", handler);
    return btn;
  }

  function renderFastSet() {
    const ex = currentExercise();
    const set = lastSetForCurrentExercise();
    panel.hidden = !ex || !set;
    if (!ex || !set) return;

    lastEl.textContent = describeSet(set, ex);
    actionsEl.innerHTML = "";
    actionsEl.appendChild(button("同じ内容を使う", copyLastSet, true));

    if (ex.type === "standard") {
      actionsEl.appendChild(button("−2.5kg", () => adjust("weight", -2.5)));
      actionsEl.appendChild(button("＋2.5kg", () => adjust("weight", 2.5)));
      actionsEl.appendChild(button("−1回", () => adjust("reps", -1)));
      actionsEl.appendChild(button("＋1回", () => adjust("reps", 1)));
    } else if (ex.type === "bodyweight") {
      actionsEl.appendChild(button("−1回", () => adjust("reps", -1)));
      actionsEl.appendChild(button("＋1回", () => adjust("reps", 1)));
    } else {
      actionsEl.appendChild(button("重量 −2.5kg", () => adjust("weight", -2.5)));
      actionsEl.appendChild(button("重量 ＋2.5kg", () => adjust("weight", 2.5)));
      actionsEl.appendChild(button("回数 −1", () => adjust("reps", -1)));
      actionsEl.appendChild(button("回数 ＋1", () => adjust("reps", 1)));
    }
  }

  els.exerciseSelect.addEventListener("change", () => setTimeout(renderFastSet, 0));
  completeBtn.addEventListener("click", () => setTimeout(renderFastSet, 0));
  document.addEventListener("click", event => {
    if (event.target.closest("[data-delete-set]")) setTimeout(renderFastSet, 0);
  });

  const observer = new MutationObserver(renderFastSet);
  observer.observe(els.workoutPanel, { attributes: true, attributeFilter: ["class"] });

  renderFastSet();
})();
