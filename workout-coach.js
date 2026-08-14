(() => {
  const COPY={
    en:{ready:'Are you ready?',hint:'Get into position. Start only when you are ready.',ok:'I’m ready',go:'GO!',work:'Set',target:'Complete your Set at a comfortable pace.',done:'Done!',hard:'That was hard',rest:'Nice work. Time to Rest.',next:'Next Set',skip:'Not ready yet'},
    ja:{ready:'準備はいいですか？',hint:'姿勢と器具を確認して、準備ができてから始めましょう。',ok:'準備OK',go:'GO!',work:'Set',target:'無理のないペースで Set を行いましょう。',done:'できた！',hard:'きつかった',rest:'お疲れさまでした。Rest に入りましょう。',next:'Next Set',skip:'まだ準備中'},
    ru:{ready:'Готовы?',hint:'Проверьте положение и оборудование. Начинайте, когда будете готовы.',ok:'Я готов',go:'GO!',work:'Set',target:'Выполните Set в комфортном темпе.',done:'Готово!',hard:'Было тяжело',rest:'Отлично. Переходим к Rest.',next:'Next Set',skip:'Ещё не готов'},
    fr:{ready:'Prêt ?',hint:'Vérifiez votre position et le matériel. Commencez quand vous êtes prêt.',ok:'Je suis prêt',go:'GO!',work:'Set',target:'Effectuez votre Set à votre rythme.',done:'Terminé !',hard:'C’était difficile',rest:'Bravo. Passez au Rest.',next:'Next Set',skip:'Pas encore prêt'},
    es:{ready:'¿Listo?',hint:'Comprueba tu posición y el equipo. Empieza cuando estés preparado.',ok:'Estoy listo',go:'GO!',work:'Set',target:'Completa tu Set a un ritmo cómodo.',done:'¡Hecho!',hard:'Fue difícil',rest:'Buen trabajo. Ahora toca Rest.',next:'Next Set',skip:'Aún no'},
    de:{ready:'Bereit?',hint:'Prüfe Position und Gerät. Starte erst, wenn du bereit bist.',ok:'Ich bin bereit',go:'GO!',work:'Set',target:'Führe deinen Set in einem angenehmen Tempo aus.',done:'Geschafft!',hard:'Das war schwer',rest:'Gut gemacht. Jetzt kommt Rest.',next:'Next Set',skip:'Noch nicht'},
    pt:{ready:'Pronto?',hint:'Confira sua posição e o equipamento. Comece quando estiver pronto.',ok:'Estou pronto',go:'GO!',work:'Set',target:'Complete seu Set em um ritmo confortável.',done:'Consegui!',hard:'Foi difícil',rest:'Muito bem. Agora é Rest.',next:'Next Set',skip:'Ainda não'},
    zh:{ready:'准备好了吗？',hint:'确认姿势和器械，准备好后再开始。',ok:'准备好了',go:'GO!',work:'Set',target:'用舒适的节奏完成这个 Set。',done:'完成了！',hard:'有点吃力',rest:'做得好。现在进入 Rest。',next:'Next Set',skip:'还没准备好'},
    ko:{ready:'준비됐나요?',hint:'자세와 기구를 확인하고 준비되었을 때 시작하세요.',ok:'준비 완료',go:'GO!',work:'Set',target:'무리하지 않는 속도로 Set을 진행하세요.',done:'완료!',hard:'힘들었어요',rest:'잘했어요. 이제 Rest입니다.',next:'Next Set',skip:'아직 준비 중'}
  };
  const lang=()=>{const x=localStorage.getItem('myfit-language')||'en';return COPY[x]||COPY.en};

  // Compatibility: older saved Push up entries may still be classified as weighted exercises.
  function normalizeBodyweightExercises(){
    try{
      if(typeof data==='undefined'||!Array.isArray(data.exercises))return;
      let changed=false;
      data.exercises.forEach(ex=>{
        const n=String(ex.name||'').toLowerCase().replace(/[\s_-]+/g,'');
        const isPushUp=['pushup','pushups','腕立て伏せ','腕立て'].some(x=>n.includes(x));
        if(isPushUp&&ex.type!=='bodyweight'){
          ex.type='bodyweight';
          changed=true;
        }
      });
      if(changed){
        if(typeof saveData==='function')saveData();
        if(typeof updateExerciseInputs==='function')updateExerciseInputs();
      }
    }catch{}
  }
  normalizeBodyweightExercises();

  const style=document.createElement('style');style.textContent=`.coach-overlay{position:fixed;inset:0;z-index:1800;background:#111827;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:calc(24px + env(safe-area-inset-top)) 22px calc(24px + env(safe-area-inset-bottom))}.coach-overlay[hidden]{display:none!important}.coach-exercise{font-size:14px;opacity:.72;font-weight:800;margin:0 0 10px}.coach-title{font-size:clamp(30px,9vw,48px);line-height:1.08;margin:0 0 12px}.coach-hint{max-width:440px;font-size:15px;line-height:1.55;opacity:.8;margin:0 0 28px}.coach-count{font-size:clamp(120px,42vw,230px);font-weight:950;line-height:.9;font-variant-numeric:tabular-nums}.coach-actions{width:min(100%,460px);display:grid;gap:10px}.coach-actions button{min-height:58px;border-radius:18px;font-size:18px;font-weight:900}.coach-primary{border:0;background:#fff;color:#111827}.coach-secondary{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff}.coach-go{font-size:clamp(72px,25vw,140px);font-weight:950}.coach-set-info{font-size:17px;font-weight:800;margin:8px 0 26px;opacity:.82}`;document.head.appendChild(style);
  const o=document.createElement('section');o.className='coach-overlay';o.hidden=true;o.innerHTML=`<p id="coachExercise" class="coach-exercise"></p><h2 id="coachTitle" class="coach-title"></h2><p id="coachHint" class="coach-hint"></p><div id="coachCount" class="coach-count" hidden></div><div id="coachSetInfo" class="coach-set-info"></div><div id="coachActions" class="coach-actions"></div>`;document.body.appendChild(o);
  const exName=()=>document.getElementById('exerciseSelect')?.selectedOptions?.[0]?.textContent||'';
  const title=o.querySelector('#coachTitle'),hint=o.querySelector('#coachHint'),count=o.querySelector('#coachCount'),info=o.querySelector('#coachSetInfo'),actions=o.querySelector('#coachActions'),exercise=o.querySelector('#coachExercise');
  let countdownTimer=null,audioContext=null;
  function unlockAudio(){try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume()}catch{}}
  function beep(go=false){
    unlockAudio();
    if(!audioContext)return;
    try{
      const now=audioContext.currentTime;
      const o1=audioContext.createOscillator(),g=audioContext.createGain();
      o1.type='sine';
      o1.frequency.value=go?1046:660;
      g.gain.setValueAtTime(.0001,now);
      g.gain.exponentialRampToValueAtTime(go?.24:.16,now+.01);
      g.gain.exponentialRampToValueAtTime(.0001,now+(go?.22:.10));
      o1.connect(g);g.connect(audioContext.destination);o1.start(now);o1.stop(now+(go?.24:.12));
    }catch{}
  }
  function setInfo(){exercise.textContent=exName();const total=(typeof data!=='undefined'&&data.activeWorkout?.sets?.length)||0;info.textContent=`${total} ${total===1?'Set':'Sets'}`}
  function ready(){normalizeBodyweightExercises();clearInterval(countdownTimer);o.hidden=false;count.hidden=true;title.hidden=false;hint.hidden=false;actions.hidden=false;setInfo();title.textContent=lang().ready;hint.textContent=lang().hint;actions.innerHTML=`<button class="coach-primary" id="coachReady">${lang().ok}</button><button class="coach-secondary" id="coachLater">${lang().skip}</button>`;o.querySelector('#coachReady').onclick=startCountdown;o.querySelector('#coachLater').onclick=()=>o.hidden=true}
  function startCountdown(){unlockAudio();actions.hidden=true;title.hidden=true;hint.hidden=true;info.textContent='';count.hidden=false;let n=5;count.className='coach-count';count.textContent=n;beep(false);countdownTimer=setInterval(()=>{n--;if(n>0){count.textContent=n;beep(false);return}clearInterval(countdownTimer);count.className='coach-go';count.textContent=lang().go;beep(true);setTimeout(work,750)},1000)}
  function work(){count.hidden=true;count.className='coach-count';title.hidden=false;hint.hidden=false;actions.hidden=false;setInfo();title.textContent=lang().work;hint.textContent=lang().target;actions.innerHTML=`<button class="coach-primary" id="coachDone">${lang().done}</button><button class="coach-secondary" id="coachHard">${lang().hard}</button>`;const finish=hard=>{o.hidden=true;if(hard){const memo=document.getElementById('setMemo');if(memo&&!memo.value)memo.value=lang().hard}document.getElementById('completeSetBtn')?.click()};o.querySelector('#coachDone').onclick=()=>finish(false);o.querySelector('#coachHard').onclick=()=>finish(true)}
  function startForWorkout(){setTimeout(()=>{normalizeBodyweightExercises();if(!document.getElementById('workoutPanel')?.classList.contains('hidden'))ready()},80)}
  document.getElementById('startWorkoutBtn')?.addEventListener('click',startForWorkout);
  document.getElementById('exerciseSelect')?.addEventListener('change',()=>{normalizeBodyweightExercises();if(!document.getElementById('workoutPanel')?.classList.contains('hidden'))setTimeout(ready,50)});
  window.MyFitCoach={ready};
})();
