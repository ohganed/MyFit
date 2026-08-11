(() => {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 760px) {
      body.workout-active { overflow: hidden; }
      body.workout-active .app-shell { height:100dvh;min-height:0;padding-bottom:0;overflow:hidden; }
      body.workout-active .topbar { padding:calc(6px + env(safe-area-inset-top)) 12px 4px;position:relative; }
      body.workout-active .topbar .eyebrow { display:none; }
      body.workout-active .topbar h1 { font-size:19px; }
      body.workout-active .elapsed-wrap { font-size:9px; } body.workout-active .elapsed-wrap strong{font-size:15px}
      body.workout-active main { height:calc(100dvh - 45px - env(safe-area-inset-top));padding:3px 9px calc(60px + env(safe-area-inset-bottom));overflow:hidden; }
      body.workout-active #todayView,body.workout-active #workoutPanel{height:100%}
      body.workout-active #todayView>.hero{display:none}
      body.workout-active #workoutPanel{display:grid;grid-template-rows:auto minmax(0,1fr);gap:5px}
      body.workout-active #workoutPanel>.card:first-child{margin:0;padding:6px 9px;border-radius:13px}
      body.workout-active #workoutPanel>.card:first-child .section-title-row{display:none}
      body.workout-active #exerciseSelect{margin:0;padding:8px 10px;font-weight:800}
      body.workout-active #previousRecord{display:none}
      body.workout-active #workoutPanel>.card:nth-child(2){margin:0;padding:7px 9px;border-radius:13px;overflow:hidden}
      body.workout-active #workoutPanel>.card:nth-child(2)>h3{display:none}
      body.workout-active label{font-size:11px;margin-bottom:4px}
      body.workout-active input,body.workout-active select,body.workout-active textarea{padding:8px;margin-top:3px}
      body.workout-active .input-grid{gap:6px}
      body.workout-active .memo-label{display:none}
      body.workout-active .beginner-guide{padding:6px 8px;margin-bottom:4px}.workout-active .beginner-guide strong{font-size:10px}.workout-active .beginner-steps{font-size:9px}
      body.workout-active .dashboard-info{margin:3px 0 5px}.workout-active .dashboard-info>div{padding:4px}.workout-active .dashboard-info span{font-size:8px}.workout-active .dashboard-info strong{font-size:10px}
      body.workout-active .fast-set-panel{margin:2px 0 5px;padding:6px}.workout-active .fast-set-top{margin-bottom:4px}.workout-active .fast-set-label{font-size:9px}.workout-active .fast-set-last{font-size:11px}.workout-active .fast-set-actions{gap:4px}.workout-active .fast-set-actions button{min-height:30px;padding:4px 3px;font-size:10px}
      body.workout-active .beginner-tip{font-size:8px;margin:3px 0}
      body.workout-active #completeSetBtn{padding:9px}
      body.workout-active #workoutPanel>.card:nth-child(3),body.workout-active #workoutPanel>.timer-card,body.workout-active #finishWorkoutBtn{display:none}
      body.workout-active .bottom-nav{padding-top:4px;padding-bottom:calc(4px + env(safe-area-inset-bottom))}.workout-active .bottom-nav button{padding:3px 2px}.workout-active .bottom-nav button span{font-size:14px;margin-bottom:0}
      body.workout-active .timer-fab{bottom:calc(54px + env(safe-area-inset-bottom));right:10px;padding:9px 12px}
    }
  `;document.head.appendChild(style);
  function syncCompactMode(){const p=document.getElementById('workoutPanel');document.body.classList.toggle('workout-active',!!p&&!p.classList.contains('hidden'));}
  const panel=document.getElementById('workoutPanel');if(panel)new MutationObserver(syncCompactMode).observe(panel,{attributes:true,attributeFilter:['class']});
  document.getElementById('startWorkoutBtn')?.addEventListener('click',()=>setTimeout(syncCompactMode,0));document.getElementById('finishWorkoutBtn')?.addEventListener('click',()=>setTimeout(syncCompactMode,0));syncCompactMode();
})();
