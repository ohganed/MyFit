(() => {
  const UI = {
    en: {
      elapsed:'Elapsed', todayWorkout:"Today's workout", start:'Start', exercise:'Exercise', add:'+ Add',
      noPrevious:'No previous record', currentSet:'Current set', weight:'Weight', reps:'Reps', memo:'Memo', completeSet:'Complete Set',
      recordedSets:'Recorded sets', noRecords:'No sets recorded yet', restTimer:'Rest timer', startTimer:'Start', pause:'Pause', resume:'Resume',
      finishWorkout:'Finish Workout', history:'Workout History', export:'Export', exercises:'Exercise Management', exerciseName:'Exercise name',
      recordType:'Tracking type', standard:'Weight + reps', bodyweight:'Bodyweight (reps only)', sided:'Left / right separately',
      defaultRest:'Default rest time', registerExercise:'Add Exercise', settings:'Settings', dataManagement:'Data management',
      dataSavedLocal:'Your records are stored in this browser on this device.', importBackup:'Import backup', deleteAll:'Delete all data',
      addHome:'Add to Home Screen', addHomeHelp:'In Safari, tap Share and choose “Add to Home Screen”.', today:'Today', navHistory:'History', navExercises:'Exercises', navSettings:'Settings',
      workoutComplete:'Workout Complete', niceWork:'Nice work', close:'Close', kg:'kg', times:'reps', right:'Right', left:'Left', seconds:'sec', setsSuffix:'sets'
    },
    ja: {
      elapsed:'経過時間', todayWorkout:'今日のトレーニング', start:'開始する', exercise:'種目', add:'＋追加', noPrevious:'前回記録はありません',
      currentSet:'今回のセット', weight:'重量', reps:'回数', memo:'メモ', completeSet:'セット完了', recordedSets:'記録済みセット', noRecords:'まだ記録がありません',
      restTimer:'休憩タイマー', startTimer:'開始', pause:'一時停止', resume:'再開', finishWorkout:'トレーニング終了', history:'トレーニング履歴', export:'書き出し',
      exercises:'種目管理', exerciseName:'種目名', recordType:'記録形式', standard:'重量＋回数', bodyweight:'自重（回数のみ）', sided:'左右別', defaultRest:'標準休憩時間',
      registerExercise:'種目を登録', settings:'設定', dataManagement:'データ管理', dataSavedLocal:'記録はこの端末のブラウザ内に保存されます。', importBackup:'バックアップを読み込む',
      deleteAll:'すべてのデータを削除', addHome:'ホーム画面への追加', addHomeHelp:'Safariの共有ボタンから「ホーム画面に追加」を選んでください。',
      today:'今日', navHistory:'履歴', navExercises:'種目', navSettings:'設定', workoutComplete:'WORKOUT COMPLETE', niceWork:'お疲れさまでした', close:'閉じる', kg:'kg', times:'回', right:'右', left:'左', seconds:'秒', setsSuffix:'セット'
    }
  };

  let lastLang = null;
  const lang = () => {
    const value = localStorage.getItem('myfit-language') || ((navigator.language || 'en').slice(0,2));
    return value === 'ja' ? 'ja' : 'en';
  };
  const t = key => (UI[lang()] || UI.en)[key] || key;
  const text = (sel, value) => { const el=document.querySelector(sel); if(el) el.textContent=value; };

  function labelText(label, value) {
    if (!label) return;
    const first = Array.from(label.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (first) first.textContent = value;
  }

  function applyStatic() {
    document.documentElement.lang = lang();
    text('.elapsed-wrap span', t('elapsed'));
    text('#todayView .hero .muted', t('todayWorkout'));
    text('#startWorkoutBtn', t('start'));
    text('#workoutPanel > .card:first-child h3', t('exercise'));
    text('#addExerciseBtn', t('add'));
    const prev=document.getElementById('previousRecord'); if(prev && (!prev.dataset.i18nDynamic || /前回記録はありません|No previous record/.test(prev.textContent))) prev.textContent=t('noPrevious');
    text('#workoutPanel > .card:nth-child(2) > h3', t('currentSet'));

    labelText(document.querySelector('#standardInputs label:nth-child(1)'), t('weight'));
    labelText(document.querySelector('#standardInputs label:nth-child(2)'), t('reps'));
    labelText(document.querySelector('#bodyweightInputs label'), t('reps'));
    const sided = document.querySelectorAll('#sidedInputs label');
    if(sided[0]) labelText(sided[0], `${t('right')} ${t('weight')}`);
    if(sided[1]) labelText(sided[1], `${t('right')} ${t('reps')}`);
    if(sided[2]) labelText(sided[2], `${t('left')} ${t('weight')}`);
    if(sided[3]) labelText(sided[3], `${t('left')} ${t('reps')}`);
    labelText(document.querySelector('.memo-label'), t('memo'));
    text('#completeSetBtn', t('completeSet'));

    text('#workoutPanel > .card:nth-child(3) h3', t('recordedSets'));
    const list=document.getElementById('setsList'); if(list && list.classList.contains('empty')) list.textContent=t('noRecords');
    text('.timer-card .muted', t('restTimer'));
    const toggle=document.getElementById('toggleTimerBtn'); if(toggle && !/一時停止|再開|Pause|Resume/.test(toggle.textContent)) toggle.textContent=t('startTimer');
    text('#finishWorkoutBtn', t('finishWorkout'));

    text('#historyView h2', t('history')); text('#exportBtn', t('export'));
    text('#exercisesView h2', t('exercises'));
    labelText(document.querySelector('#exerciseForm label:nth-of-type(1)'), t('exerciseName'));
    labelText(document.querySelector('#exerciseForm label:nth-of-type(2)'), t('recordType'));
    labelText(document.querySelector('#exerciseForm label:nth-of-type(3)'), t('defaultRest'));
    const opts=document.querySelectorAll('#exerciseTypeInput option');
    if(opts[0]) opts[0].textContent=t('standard'); if(opts[1]) opts[1].textContent=t('bodyweight'); if(opts[2]) opts[2].textContent=t('sided');
    document.querySelectorAll('#restSecondsInput option').forEach(o => o.textContent=`${o.value} ${t('seconds')}`);
    text('#exerciseForm button[type="submit"]', t('registerExercise'));

    text('#settingsView h2', t('settings'));
    const cards=document.querySelectorAll('#settingsView .card');
    if(cards[0]) {
      text('#settingsView .card:nth-of-type(1) h3', t('dataManagement'));
      text('#settingsView .card:nth-of-type(1) .muted', t('dataSavedLocal'));
      labelText(document.querySelector('#settingsView .file-button'), t('importBackup'));
      text('#resetBtn', t('deleteAll'));
    }
    if(cards[1]) { text('#settingsView .card:nth-of-type(2) h3', t('addHome')); text('#settingsView .card:nth-of-type(2) .muted', t('addHomeHelp')); }

    const nav=document.querySelectorAll('.bottom-nav button');
    if(nav[0]) nav[0].childNodes[nav[0].childNodes.length-1].textContent=t('today');
    if(nav[1]) nav[1].childNodes[nav[1].childNodes.length-1].textContent=t('navHistory');
    if(nav[2]) nav[2].childNodes[nav[2].childNodes.length-1].textContent=t('navExercises');
    if(nav[3]) nav[3].childNodes[nav[3].childNodes.length-1].textContent=t('navSettings');

    text('#summaryDialog .eyebrow', t('workoutComplete')); text('#summaryDialog h2', t('niceWork')); text('#closeSummaryBtn', t('close'));
  }

  function applyDynamic() {
    const badge=document.getElementById('setCountBadge');
    if(badge) {
      const n=(badge.textContent.match(/\d+/)||['0'])[0];
      badge.textContent = lang()==='ja' ? `${n}${t('setsSuffix')}` : `${n} ${t('setsSuffix')}`;
    }
    document.querySelectorAll('.set-meta').forEach(el => {
      if(lang()==='en') el.textContent = el.textContent.replace(/回/g,' reps').replace(/右/g,'Right').replace(/左/g,'Left').replace(/メモ：/g,'Note: ');
    });
  }

  function apply() { applyStatic(); applyDynamic(); lastLang=lang(); }
  document.addEventListener('change', e => { if(e.target.matches('.lang-mini,#welcomeLang')) setTimeout(apply,0); });
  const observer=new MutationObserver(() => { if(document.body) applyDynamic(); });
  if(document.body) observer.observe(document.body,{childList:true,subtree:true});
  setInterval(() => { if(lang()!==lastLang) apply(); }, 250);
  apply();
})();
