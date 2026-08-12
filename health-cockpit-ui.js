(() => {
  if (!window.MyFitHealth || !window.MyFitCockpit) return;

  const style = document.createElement('style');
  style.textContent = `
    .cockpit-entry{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .cockpit-entry .muted{font-size:12px}.cockpit-entry button{white-space:nowrap}
    .cockpit-overlay{position:fixed;inset:0;z-index:3200;background:#f4f6f8;overflow:auto;padding:calc(16px + env(safe-area-inset-top)) 14px calc(28px + env(safe-area-inset-bottom))}
    .cockpit-overlay[hidden]{display:none!important}.cockpit-shell{max-width:620px;margin:0 auto}.cockpit-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.cockpit-head h2{font-size:26px}.cockpit-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cockpit-card{background:#fff;border-radius:18px;padding:14px;box-shadow:0 2px 14px rgba(17,24,39,.05)}
    .cockpit-card h3{font-size:15px;margin:0 0 10px}.cockpit-card .latest{font-size:22px;font-weight:900;margin-bottom:8px}.cockpit-card .latest small{font-size:12px;color:#6b7280;font-weight:700}.cockpit-card label{font-size:12px;margin-bottom:8px}.cockpit-card input,.cockpit-card textarea{padding:10px;margin-top:4px;border-radius:12px}.cockpit-card button{width:100%;padding:10px;margin-top:4px}.cockpit-wide{grid-column:1/-1}.cockpit-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.cockpit-status{font-size:12px;color:#64748b;min-height:18px;margin-top:8px}.cockpit-mini-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.cockpit-chip{background:#eef2ff;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:800;color:#3730a3}
    @media(max-width:430px){.cockpit-grid{grid-template-columns:1fr}.cockpit-wide{grid-column:auto}}
  `;
  document.head.appendChild(style);

  let entry = document.getElementById('healthCockpitEntry');
  if (!entry) {
    const hero = document.querySelector('#todayView .hero');
    if (!hero) return;
    entry = document.createElement('div');
    entry.id = 'healthCockpitEntry';
    entry.className = 'card cockpit-entry';
    entry.innerHTML = `<div><p class="eyebrow">HEALTH</p><h3 style="margin:0">Health Cockpit</h3><p class="muted" style="margin:4px 0 0">Body · Sleep · Nutrition · Recovery</p></div><button class="ghost small" id="openCockpitBtn">Open</button>`;
    hero.insertAdjacentElement('afterend', entry);
  }

  const overlay = document.createElement('section');
  overlay.className = 'cockpit-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="cockpit-shell">
      <div class="cockpit-head"><div><p class="eyebrow">TODAY</p><h2>Health Cockpit</h2></div><button class="ghost small" id="closeCockpitBtn">Close</button></div>
      <div class="cockpit-grid">
        <section class="cockpit-card"><h3>Weight</h3><div class="latest" id="hcWeightLatest">—</div><label>kg<input id="hcWeight" type="number" inputmode="decimal" step="0.1" min="0"></label><button class="primary" id="hcSaveWeight">Save</button><div class="cockpit-status" id="hcWeightStatus"></div></section>
        <section class="cockpit-card"><h3>Blood Pressure</h3><div class="latest" id="hcBpLatest">—</div><div class="cockpit-two"><label>Systolic<input id="hcSys" type="number" inputmode="numeric" min="0"></label><label>Diastolic<input id="hcDia" type="number" inputmode="numeric" min="0"></label></div><button class="primary" id="hcSaveBp">Save</button><div class="cockpit-status" id="hcBpStatus"></div></section>
        <section class="cockpit-card"><h3>Sleep</h3><div class="latest" id="hcSleepLatest">—</div><div class="cockpit-two"><label>Bedtime<input id="hcBed" type="datetime-local"></label><label>Wake<input id="hcWake" type="datetime-local"></label></div><button class="primary" id="hcSaveSleep">Save</button><div class="cockpit-status" id="hcSleepStatus"></div></section>
        <section class="cockpit-card"><h3>Energy</h3><div class="latest" id="hcEnergyLatest">—</div><label>1–5<input id="hcEnergy" type="range" min="1" max="5" step="1" value="3"></label><button class="primary" id="hcSaveEnergy">Save</button><div class="cockpit-status" id="hcEnergyStatus"></div></section>
        <section class="cockpit-card cockpit-wide"><h3>Meal</h3><div class="latest" id="hcMealLatest">—</div><label>Time<input id="hcMealTime" type="datetime-local"></label><label>What did you eat?<textarea id="hcMealDesc" rows="2" placeholder="rice, grilled fish, vegetables"></textarea></label><button class="primary" id="hcSaveMeal">Save Meal</button><div class="cockpit-status" id="hcMealStatus"></div><div class="cockpit-mini-row"><span class="cockpit-chip">Nutrition detail: next</span><span class="cockpit-chip">Vitamins / Minerals ready</span></div></section>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const $ = id => document.getElementById(id);
  const fmtDate = iso => iso ? new Date(iso).toLocaleString([], {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
  const localInputNow = () => { const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16); };
  $('hcMealTime').value = localInputNow();

  function status(id, text) { $(id).textContent = text; setTimeout(()=>{ if($(id).textContent===text) $(id).textContent=''; },1800); }

  async function refresh() {
    const [w,sys,dia,energy,sleep,meal] = await Promise.all([
      MyFitHealth.latest('weight'), MyFitHealth.latest('bloodPressureSystolic'), MyFitHealth.latest('bloodPressureDiastolic'), MyFitHealth.latest('energyLevel'), MyFitCockpit.latestEvent('sleep'), MyFitCockpit.latestEvent('meal')
    ]);
    $('hcWeightLatest').innerHTML = w ? `${w.value.toFixed(1)} <small>kg · ${fmtDate(w.measuredAt)}</small>` : '—';
    $('hcBpLatest').innerHTML = (sys&&dia) ? `${Math.round(sys.value)} / ${Math.round(dia.value)} <small>mmHg</small>` : '—';
    $('hcEnergyLatest').innerHTML = energy ? `${Math.round(energy.value)} / 5 <small>${fmtDate(energy.measuredAt)}</small>` : '—';
    if (sleep?.endAt) {
      const mins = Math.max(0, Math.round((new Date(sleep.endAt)-new Date(sleep.startAt))/60000));
      $('hcSleepLatest').innerHTML = `${Math.floor(mins/60)}h ${mins%60}m <small>${fmtDate(sleep.endAt)}</small>`;
    } else $('hcSleepLatest').textContent='—';
    $('hcMealLatest').innerHTML = meal ? `${meal.payload?.description || 'Meal'} <small>${fmtDate(meal.startAt)}</small>` : '—';
  }

  const openBtn = document.getElementById('openCockpitBtn');
  if (openBtn) openBtn.onclick = async () => { overlay.hidden=false; document.body.style.overflow='hidden'; await refresh(); };
  $('closeCockpitBtn').onclick = () => { overlay.hidden=true; document.body.style.overflow=''; };

  $('hcSaveWeight').onclick = async () => { const v=Number($('hcWeight').value); if(!Number.isFinite(v)||v<=0)return status('hcWeightStatus','Enter a value'); await MyFitHealth.saveSample({metric:'weight',value:v,source:'manual'}); $('hcWeight').value=''; status('hcWeightStatus','Saved'); refresh(); };
  $('hcSaveBp').onclick = async () => { const s=Number($('hcSys').value),d=Number($('hcDia').value); if(!Number.isFinite(s)||!Number.isFinite(d)||s<=0||d<=0)return status('hcBpStatus','Enter both values'); const at=new Date().toISOString(); await MyFitHealth.saveSample({metric:'bloodPressureSystolic',value:s,measuredAt:at,source:'manual'}); await MyFitHealth.saveSample({metric:'bloodPressureDiastolic',value:d,measuredAt:at,source:'manual'}); $('hcSys').value='';$('hcDia').value='';status('hcBpStatus','Saved');refresh(); };
  $('hcSaveEnergy').onclick = async () => { const v=Number($('hcEnergy').value); await MyFitHealth.saveSample({metric:'energyLevel',value:v,source:'manual'}); status('hcEnergyStatus','Saved');refresh(); };
  $('hcSaveSleep').onclick = async () => { const b=$('hcBed').value,w=$('hcWake').value;if(!b||!w)return status('hcSleepStatus','Enter bedtime and wake time'); const start=new Date(b),end=new Date(w); if(!(end>start))return status('hcSleepStatus','Wake time must be later'); await MyFitCockpit.saveEvent({type:'sleep',startAt:start.toISOString(),endAt:end.toISOString(),payload:{},source:'manual'}); $('hcBed').value='';$('hcWake').value='';status('hcSleepStatus','Saved');refresh(); };
  $('hcSaveMeal').onclick = async () => { const desc=$('hcMealDesc').value.trim(),t=$('hcMealTime').value;if(!desc)return status('hcMealStatus','Enter a meal'); await MyFitCockpit.saveEvent({type:'meal',startAt:t?new Date(t).toISOString():new Date().toISOString(),payload:{description:desc},source:'manual'}); $('hcMealDesc').value='';$('hcMealTime').value=localInputNow();status('hcMealStatus','Saved');refresh(); };

  window.MyFitHealthCockpitUI = { open: () => openBtn?.click(), refresh };
})();