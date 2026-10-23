import FlowMiniChart from './FlowMiniChart'
import { useEffect, useState } from 'react'
import { fetchWeightRecords, type WeightRecord } from '../api/weightApi'
import type { WorkoutRecord } from '../storage/workoutStorage'
import { buildFlow, deleteLifeRecord, detectWorkoutChanges, loadLifeRecords, localDateKey, type LifeRecord } from '../features/life'
import QuickAdd, { lifeDetail, lifeLabels } from './QuickAdd'

export default function TodayHome({ history, onStartWorkout, onOpenMovement, onOpenHealth }: {history:WorkoutRecord[];onStartWorkout:()=>void;onOpenMovement:()=>void;onOpenHealth:()=>void}) {
  const [life,setLife]=useState<LifeRecord[]>([])
  const [weights,setWeights]=useState<WeightRecord[]>([])
  const [error,setError]=useState('')
  const [weightError,setWeightError]=useState('')
  const [adding,setAdding]=useState(false)
  const [day,setDay]=useState(localDateKey(new Date()))
  const [clock,setClock]=useState(new Date())
  useEffect(()=>{
    const refresh=()=>{setClock(new Date());try {setLife(loadLifeRecords());setError('')}catch(e){setError(String(e))}
      fetchWeightRecords({includeManual:false}).then(r=>{setWeights(r);setWeightError('')}).catch(()=>setWeightError('体重サーバー未接続：手入力の記録のみ表示しています。'))}
    refresh();const timer=setInterval(refresh,30000);window.addEventListener('storage',refresh)
    return ()=>{clearInterval(timer);window.removeEventListener('storage',refresh)}
  },[])
  const today=localDateKey(clock)
  const todayLife=life.filter(r=>localDateKey(r.at)===today).sort((a,b)=>b.at.localeCompare(a.at))
  const workouts=history.filter(r=>localDateKey(r.savedAt)===today)
  const last=(kind:LifeRecord['kind'])=>todayLife.find(r=>r.kind===kind)
  const manualWeights=life.filter(r=>r.kind==='weight').map(r=>({id:`life-${r.id}`,measuredAt:r.at,weightKg:r.value}))
  const allWeights=[...weights,...manualWeights].sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt))
  const weight=allWeights.find(r=>localDateKey(r.measuredAt)===today)
  const timeline=[...life.filter(r=>r.kind!=='weight').map(r=>({id:`life-${r.id}`,at:r.at,title:lifeLabels[r.kind],detail:lifeDetail(r)+(r.kind!=='meal'&&r.text?` · ${r.text}`:''),lifeId:r.id})),...allWeights.map(r=>({id:`weight-${r.id}`,at:r.measuredAt,title:'体重',detail:`${r.weightKg} kg`,lifeId:r.id.startsWith('life-')?r.id.slice(5):undefined})),...history.map(r=>({id:`workout-${r.id}`,at:r.savedAt,title:r.exerciseName,detail:`${r.sets.length} セット · ${r.sets.map(s=>s.reps?`${s.reps}回`:s.durationSeconds?`${s.durationSeconds}秒`:'重量記録').join(' / ')}`,lifeId:undefined}))].filter(r=>localDateKey(r.at)===day).sort((a,b)=>a.at.localeCompare(b.at))
  const flow=buildFlow(history,life,weights,clock)
  const changes=detectWorkoutChanges(history,clock)
  return <section className="today-home">
    <header className="today-home-hero"><div><p className="today-home-brand">MYFIT</p><h1>Today</h1><p className="today-home-tagline">自分の生活を、記録から知る。</p></div><button onClick={onOpenMovement}>Movement →</button></header>
    <section className="today-overview-card"><div className="today-card-heading"><div><h2>健康習慣</h2><p>食事・歩行・体重・腹囲を、週ごとに振り返る。</p></div><button onClick={onOpenHealth}>記録と目標 →</button></div></section>
    {window.location.hostname.endsWith('.github.io')&&<p role="status">オンライン版：記録はこのブラウザ内に保存します。Macとの自動同期・体重機器連携はありません。設定からバックアップできます。</p>}
    {error&&<p role="alert">{error} 元の保存データは変更していません。</p>}
    <section className="today-overview-card"><div className="today-card-heading"><h2>今日の記録</h2><span>{today}</span></div><div className="today-metric-grid">
      {(['sleep','energy','meal'] as const).map(kind=><article className="today-metric" key={kind}><span>{lifeLabels[kind]}</span><strong>{kind==='meal'?(todayLife.some(r=>r.kind==='meal')?`${todayLife.filter(r=>r.kind==='meal').length} 件`:'未記録'):last(kind)?lifeDetail(last(kind)!):'未記録'}</strong></article>)}
      <button className="today-metric today-metric-button" onClick={onOpenMovement}><span>Movement</span><strong>{workouts.length?`${workouts.length} 種目`:'未記録'}</strong><small>運動・テンプレート →</small></button>
      <article className="today-metric"><span>体重</span><strong>{weight?`${weight.weightKg} kg`:'未記録'}</strong><small>今日の最新記録</small></article>
      <article className="today-metric"><span>血圧</span><strong>{last('bp')?lifeDetail(last('bp')!):'未記録'}</strong></article>
    </div>{weightError&&<p role="status">{weightError}</p>}</section>
    <section className="today-insight-card"><h2>いつもとの違い</h2>{changes.length?changes.map(c=><details key={c.id}><summary>◆ {c.title}</summary><p>{c.detail}</p></details>):<p>表示できる変化はありません。同じ種目・負荷の過去の記録が5件以上ある場合に比較します。</p>}<small>違いを示すだけで、良し悪しや健康状態を判定しません。</small></section>
    <section className="today-timeline-section"><div className="today-card-heading"><h2>Timeline</h2><label>表示日<input type="date" value={day} max={today} onChange={e=>setDay(e.target.value)}/></label></div>
      {timeline.length?<div className="today-timeline">{timeline.map(r=><article key={r.id} className="today-timeline-item"><time>{new Date(r.at).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}</time><span className="today-timeline-dot"/><div className="today-timeline-content"><strong>{r.title}</strong><span>{r.detail}</span>{r.lifeId&&<button onClick={()=>{if(window.confirm('この生活記録を削除しますか？'))try{setLife(deleteLifeRecord(r.lifeId!));setError('')}catch(e){setError(String(e))}}}>削除</button>}</div></article>)}</div>:<p className="today-timeline-empty">この日の記録はありません。</p>}
    </section>
    <section className="today-overview-card"><div className="today-card-heading"><h2>Flow</h2><span>過去3週間</span></div><p>各日の実記録。— は未記録。睡眠・活力・体重はその日の最新値です。</p>
<div className="flow-mini-grid">
  <FlowMiniChart data={flow} metric="sleepHours" title="睡眠" unit="h" color="#5b8def" />
  <FlowMiniChart data={flow} metric="mealCount" title="食事記録" unit="件" color="#e6a23c" type="bar" />
  <FlowMiniChart data={flow} metric="workoutCount" title="筋トレ記録" unit="件" color="#47a88b" type="bar" />
  <FlowMiniChart data={flow} metric="energy" title="活力" unit="/5" color="#9b78d0" />
  <FlowMiniChart data={flow} metric="weightKg" title="体重" unit="kg" color="#d77b91" />
</div>
<div className="life-flow-scroll"><table className="life-flow"><thead><tr><th>日付</th><th>睡眠 h</th><th>食事 件</th><th>運動 記録</th><th>活力 /5</th><th>体重 kg</th></tr></thead><tbody>{flow.map(d=><tr key={d.date}><th>{d.date.slice(5)}</th><td>{d.sleepHours??'—'}</td><td>{d.mealCount||'—'}</td><td>{d.workoutCount||'—'}</td><td>{d.energy??'—'}</td><td>{d.weightKg??'—'}</td></tr>)}</tbody></table></div></section>
    <button className="today-floating-add" onClick={()=>setAdding(true)} aria-label="Quick Add">＋</button>
    {adding&&<QuickAdd onClose={()=>setAdding(false)} onSaved={setLife} onWorkout={()=>{setAdding(false);onStartWorkout()}}/>}
  </section>
}
