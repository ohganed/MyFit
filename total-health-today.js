(() => {
  'use strict';
  const mount = document.querySelector('#todayView .hero');
  if (!mount || !window.MyFitHealth || !window.MyFitCockpit) return;
  const style = document.createElement('style');
  style.textContent = `
    .th-dashboard{margin:14px 0 18px}.th-panel{background:#fff;border-radius:24px;padding:18px;margin-bottom:14px;box-shadow:0 4px 24px rgba(17,24,39,.035)}
    .th-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}.th-head h2{margin:0 0 14px;font-size:25px}.th-date{font-size:13px;color:#6b7280}
    .th-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.th-metric{border:1px solid #e5e7eb;border-radius:19px;padding:14px;min-height:105px}
    .th-metric span{color:#6b7280;font-weight:700;font-size:13px}.th-metric strong{display:block;font-size:24px;letter-spacing:-.04em;margin-top:8px;overflow-wrap:anywhere}
    .th-timeline{display:grid;gap:10px}.th-event{display:grid;grid-template-columns:64px 12px 1fr;gap:10px;align-items:start}
    .th-clock{font-size:12px;color:#6b7280;padding-top:13px}.th-dot{width:10px;height:10px;border-radius:50%;background:#64748b;margin-top:16px}
    .th-event-card{border:1px solid #e5e7eb;border-radius:16px;padding:12px}.th-event-card strong{display:block}.th-event-card small{color:#6b7280}
    .th-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.th-actions button{flex:1}
    @media(max-width:360px){.th-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  const panel = document.createElement('section');
  panel.className = 'th-dashboard';
  panel.setAttribute('aria-label', 'Total Health 今日の概要');
  panel.innerHTML = `<div class="th-panel"><div class="th-head"><h2>Today</h2><span class="th-date" id="thDate"></span></div>
    <div class="th-grid"><div class="th-metric"><span>Sleep</span><strong id="thSleep">—</strong></div>
    <div class="th-metric"><span>Energy</span><strong id="thEnergy">—</strong></div>
    <div class="th-metric"><span>Movement</span><strong id="thMovement">—</strong></div>
    <div class="th-metric"><span>Meals</span><strong id="thMeals">—</strong></div></div>
    <div class="th-actions"><button class="ghost small" id="thAddHealth" type="button">＋ 健康記録</button></div></div>
    <div class="th-panel"><div class="th-head"><h2>Timeline</h2><span class="th-date">今日の記録</span></div>
    <div id="thTimeline" class="th-timeline" aria-live="polite"></div></div>`;
  mount.insertAdjacentElement('afterend', panel);
  const $ = id => document.getElementById(id);
  const time = iso => new Date(iso).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
  const formatDate = d => d.toLocaleDateString('ja-JP',{month:'short',day:'numeric',weekday:'short'});
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function refresh() {
    const now = new Date(), start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const next = new Date(start); next.setDate(next.getDate()+1);
    const [events,samples] = await Promise.all([
      window.MyFitCockpit.queryEvents({from:start.toISOString(),to:next.toISOString()}),
      window.MyFitHealth.querySamples({from:start.toISOString(),to:next.toISOString()})
    ]);
    $('thDate').textContent = formatDate(now);
    const sleep = events.find(e=>e.type==='sleep' && e.endAt);
    const minutes = sleep ? Math.max(0,Math.round((new Date(sleep.endAt)-new Date(sleep.startAt))/60000)) : null;
    $('thSleep').textContent = minutes===null ? '未記録' : Math.floor(minutes/60)+'h '+minutes%60+'m';
    const energy = samples.find(s=>s.metric==='energyLevel');
    $('thEnergy').textContent = energy ? energy.value+' / 5' : '未記録';
    $('thMovement').textContent = events.filter(e=>e.type==='movement').length+' records';
    $('thMeals').textContent = events.filter(e=>e.type==='meal').length+' logged';
    const items = [
      ...events.map(e=>({at:e.startAt,title:({sleep:'Sleep',meal:'Meal',movement:'Movement',recoveryCheck:'Recovery',note:'Note'})[e.type]||e.type,detail:e.type==='meal'?(e.payload?.description||'食事記録'):''})),
      ...samples.filter(s=>s.metric==='weight').map(s=>({at:s.measuredAt,title:'Weight',detail:s.value+' kg'}))
    ].filter(e=>Number.isFinite(new Date(e.at).getTime())).sort((a,b)=>new Date(a.at)-new Date(b.at));
    $('thTimeline').innerHTML = items.length ? items.map(e=>`<div class="th-event"><span class="th-clock">${time(e.at)}</span><span class="th-dot"></span><div class="th-event-card"><strong>${escapeText(e.title)}</strong><small>${escapeText(e.detail)}</small></div></div>`).join('') : '<p class="muted">今日の記録はまだありません。</p>';
  }
  $('thAddHealth').addEventListener('click',()=>window.MyFitHealthCockpitUI?.open());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh().catch(console.error)});
  refresh().catch(console.error);
  window.MyFitToday = Object.freeze({refresh});
})();