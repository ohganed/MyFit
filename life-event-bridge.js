(() => {
  const KEY = 'myfit-life-events-v1';
  let lastSeenSetId = null;

  function loadEvents(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  function saveEvents(events){
    localStorage.setItem(KEY, JSON.stringify(events.slice(-2000)));
  }
  function currentExerciseSafe(){
    try { return typeof currentExercise === 'function' ? currentExercise() : null; }
    catch { return null; }
  }
  function currentSetsSafe(){
    try { return typeof currentSets === 'function' ? currentSets() : []; }
    catch { return []; }
  }
  function setPayload(set, ex){
    if(!set || !ex) return {};
    if(ex.type === 'bodyweight') return { reps:set.reps };
    if(ex.type === 'standard') return { weight:set.weight, reps:set.reps };
    if(ex.type === 'sided') return {
      rightWeight:set.rightWeight,rightReps:set.rightReps,
      leftWeight:set.leftWeight,leftReps:set.leftReps
    };
    return {};
  }
  function writeLatestSet(){
    const sets = currentSetsSafe();
    const set = sets[sets.length - 1];
    if(!set || set.id === lastSeenSetId) return;
    lastSeenSetId = set.id;
    const ex = (typeof data !== 'undefined' && Array.isArray(data.exercises))
      ? data.exercises.find(e => e.id === set.exerciseId)
      : currentExerciseSafe();
    if(!ex) return;
    const events = loadEvents();
    if(events.some(e => e.sourceId === set.id)) return;
    events.push({
      id: crypto.randomUUID(),
      source:'workout',
      sourceId:set.id,
      kind:'move',
      subtype:'exercise-set',
      label:ex.name,
      at:set.createdAt || new Date().toISOString(),
      certainty:'recorded',
      value:setPayload(set,ex),
      context:{ exerciseId:ex.id, exerciseType:ex.type },
      significance:null
    });
    saveEvents(events);
    document.dispatchEvent(new CustomEvent('myfit-life-event-added',{detail:{kind:'move',sourceId:set.id}}));
  }

  document.getElementById('completeSetBtn')?.addEventListener('click',()=>setTimeout(writeLatestSet,30));

  window.MyFitLifeEvents = {
    all: loadEvents,
    add(event){
      const events=loadEvents();
      events.push({id:crypto.randomUUID(),at:new Date().toISOString(),certainty:'recorded',significance:null,...event});
      saveEvents(events);
      return events[events.length-1];
    }
  };
})();
