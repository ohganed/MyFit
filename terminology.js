(() => {
  const STANDARD_EXERCISE_NAMES = new Map([
    ['スクワット', 'Squat'],
    ['ダンベルベンチプレス', 'Dumbbell Bench Press'],
    ['ワンハンドロー', 'One-arm Dumbbell Row'],
    ['ダンベルカール', 'Dumbbell Curl'],
    ['腹筋', 'Crunch']
  ]);

  function migrateStandardExerciseNames() {
    if (typeof data === 'undefined' || !Array.isArray(data.exercises)) return;
    let changed = false;
    data.exercises.forEach(exercise => {
      const english = STANDARD_EXERCISE_NAMES.get(exercise.name);
      if (english) {
        exercise.name = english;
        changed = true;
      }
    });
    if (!changed) return;
    if (typeof saveData === 'function') saveData();
    if (typeof renderExerciseSelect === 'function') renderExerciseSelect();
    if (typeof renderExerciseList === 'function') renderExerciseList();
    if (typeof renderHistory === 'function') renderHistory();
  }

  function normalizeTrainingTerms() {
    const badge = document.getElementById('setCountBadge');
    if (badge) {
      const count = Number((badge.textContent.match(/\d+/) || ['0'])[0]);
      badge.textContent = `${count} ${count === 1 ? 'Set' : 'Sets'}`;
    }

    const timerLabel = document.querySelector('.timer-card .muted');
    if (timerLabel) timerLabel.textContent = 'Rest';

    const labels = document.querySelectorAll('#standardInputs label');
    if (labels[0]?.firstChild) labels[0].firstChild.textContent = 'Weight';
    if (labels[1]?.firstChild) labels[1].firstChild.textContent = 'Reps';
    const bodyweight = document.querySelector('#bodyweightInputs label');
    if (bodyweight?.firstChild) bodyweight.firstChild.textContent = 'Reps';

    const sided = document.querySelectorAll('#sidedInputs label');
    const names = ['Right Weight', 'Right Reps', 'Left Weight', 'Left Reps'];
    sided.forEach((label, index) => {
      if (label.firstChild) label.firstChild.textContent = names[index] || label.firstChild.textContent;
    });
  }

  migrateStandardExerciseNames();
  normalizeTrainingTerms();

  document.getElementById('completeSetBtn')?.addEventListener('click', () => setTimeout(normalizeTrainingTerms, 20));
  document.getElementById('importInput')?.addEventListener('change', () => setTimeout(() => {
    migrateStandardExerciseNames();
    normalizeTrainingTerms();
  }, 100));
  document.addEventListener('click', event => {
    if (event.target.closest('[data-delete-set]')) setTimeout(normalizeTrainingTerms, 20);
  });

  window.MyFitTerminology = Object.freeze({
    terms: ['Exercise', 'Weight', 'Reps', 'Set', 'Sets', 'Rest', 'PR', 'Warm-up'],
    exerciseNames: Object.fromEntries(STANDARD_EXERCISE_NAMES)
  });
})();
