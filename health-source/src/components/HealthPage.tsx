import { useEffect, useState } from 'react'
import { fetchWeightRecords, type WeightRecord } from '../api/weightApi'
import { loadLifeRecords, localDateKey, type LifeRecord } from '../features/life'
import { buildHealthWeeks, deleteHealthRecord, healthReminders, loadHealthState, saveHealthRecord, saveHealthSettings, type HealthGoals, type HealthState } from '../features/health'
import type { WorkoutRecord } from '../storage/workoutStorage'
import QuickAdd from './QuickAdd'
import './HealthPage.css'

const goalLabels: Record<keyof HealthGoals,string> = { mealDays:'食事を記録する日', activityDays:'歩行などを記録する日', activityMinutes:'歩行などの合計時間（分）', weightDays:'体重を測る日', waistDays:'腹囲を測る日', workoutDays:'筋トレをする日' }
const message = (e:unknown) => e instanceof Error ? e.message : '保存できませんでした。空き容量やブラウザの設定を確認してください。'
export default function HealthPage({history,onWorkout}:{history:WorkoutRecord[];onWorkout:()=>void}) {
  const [state,setState]=useState<HealthState|null>(null)
  const [life,setLife]=useState<LifeRecord[]>([])
  const [weights,setWeights]=useState<WeightRecord[]>([])
  const [error,setError]=useState('')
  const [apiError,setApiError]=useState('')
  const [status,setStatus]=useState('')
  const [clock,setClock]=useState(new Date())
  const [quick,setQuick]=useState<'meal'|'weight'|null>(null)
  const [kind,setKind]=useState<'waist'|'activity'>('waist')
  useEffect(()=>{
    let active=true
    const refresh=()=>{setClock(new Date());try {setState(loadHealthState());setLife(loadLifeRecords());setError('')}catch(e){setError(message(e))}}
    refresh()
    fetchWeightRecords({includeManual:false}).then(r=>{if(active)setWeights(r)}).catch(()=>{if(active)setApiError('体重サーバー未接続：週次集計には手入力の体重のみ含まれています。')})
    const timer=setInterval(refresh,30000)
    window.addEventListener('storage',refresh)
    return ()=>{active=false;clearInterval(timer);window.removeEventListener('storage',refresh)}
  },[])
  const weeks=state?buildHealthWeeks(history,life,weights,state,clock):null
  const today=localDateKey(clock)
  const format=(n:number|null,unit='')=>n===null?'—':`${Number(n.toFixed(2))}${unit}`
  return <section className="health-page">
    <header className="health-intro"><p>MYFIT / TOTAL HEALTH</p><h1>小さな習慣を、週ごとに。</h1><p>食事・運動・体重・腹囲をつなげて、全身の脂肪減少に向けた取り組みを振り返ります。</p></header>
    {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
    <div className="health-actions"><button onClick={()=>setQuick('meal')}>食事を記録</button><button onClick={()=>setQuick('weight')}>体重を記録</button><button onClick={onWorkout}>筋トレを記録 →</button></div>
    <p className="health-note">食事は内容・量・飲み物をメモ。体重・腹囲はできるだけ同じ時間帯・条件で。下腹だけの脂肪燃焼は目標にせず、短期の増減より数週間の記録を見ます。</p>
    {state&&weeks&&<>
      {healthReminders(weeks,life,state,clock,weights).length>0&&<aside className="health-reminder" aria-label="今日のリマインド"><strong>今日、できそうなことをひとつ</strong><ul>{healthReminders(weeks,life,state,clock,weights).map(r=><li key={r}>{r}</li>)}</ul><small>記録できない日があっても、次の日から再開できます。</small></aside>}
      <section className="health-card"><h2>腹囲・歩行などを記録</h2><form key={kind} onSubmit={e=>{
        e.preventDefault();const f=new FormData(e.currentTarget);const form=e.currentTarget
        try {const at=new Date(String(f.get('at')));if(!Number.isFinite(at.getTime())||at>new Date())throw new Error('日時は現在以前を指定してください。')
          setState(saveHealthRecord({kind,at:at.toISOString(),value:Number(f.get('value')),text:String(f.get('text')||'').trim()}));setClock(new Date());setError('');setStatus('記録を保存しました。');form.reset()
        }catch(err){setError(message(err))}
      }}>
        <label>記録の種類<select value={kind} onChange={e=>setKind(e.target.value as 'waist'|'activity')}><option value="waist">腹囲</option><option value="activity">歩行・有酸素運動</option></select></label>
        <label>日時<input name="at" type="datetime-local" required defaultValue={`${today}T${clock.toTimeString().slice(0,5)}`}/></label>
        <label>{kind==='waist'?'腹囲（cm）':'運動時間（分）'}<input name="value" type="number" required min={kind==='waist'?1:0} max={kind==='waist'?300:1440} step={kind==='waist'?0.1:1}/></label>
        <label>メモ（任意）<input name="text" maxLength={500} placeholder={kind==='waist'?'測定位置や時間帯':'散歩、自転車など'}/></label>
        <p className="health-note">{kind==='waist'?'測定位置を決め、毎回そろえて記録してください。皮膚をつまんだ厚さとは別の指標です。':'実際の時間だけを記録。筋トレは既存の筋トレ記録を使ってください。'}</p>
        <button type="submit" className="life-primary">保存</button>
      </form></section>
      <section className="health-card"><h2>週ごとの傾向</h2><p>月曜始まり・今週は途中経過。— は未記録です。</p>{apiError&&<p role="status">{apiError}</p>}
        <div className="health-table"><table><caption>今週と前週の実記録</caption><thead><tr><th>指標</th><th>前週<br/>{weeks.previous.start}〜{weeks.previous.end}</th><th>今週<br/>{weeks.current.start}〜{today}</th></tr></thead><tbody>
          <tr><th>体重平均 kg</th><td>{format(weeks.previous.weightMean)}（{weeks.previous.weightDays}日）</td><td>{format(weeks.current.weightMean)}（{weeks.current.weightDays}日）</td></tr>
          <tr><th>腹囲平均 cm</th><td>{format(weeks.previous.waistMean)}（{weeks.previous.waistDays}日）</td><td>{format(weeks.current.waistMean)}（{weeks.current.waistDays}日）</td></tr>
          <tr><th>食事の記録日</th><td>{weeks.previous.mealDays}日</td><td>{weeks.current.mealDays}日</td></tr>
          <tr><th>歩行などの合計</th><td>{format(weeks.previous.activityMinutes,'分')}</td><td>{format(weeks.current.activityMinutes,'分')}</td></tr>
          <tr><th>筋トレの記録日</th><td>{weeks.previous.workoutDays}日</td><td>{weeks.current.workoutDays}日</td></tr>
        </tbody></table></div>
        <p>前週との差：体重 {format(weeks.weightDelta,' kg')} ／ 腹囲 {format(weeks.waistDelta,' cm')}</p><small>平均は各日の最新値から算出。差は両週にそれぞれ2日以上の測定がある場合のみ表示します。測定時刻が違う記録も含まれるため、比較の目安です。脂肪の増減や原因は判定しません。</small>
      </section>
      <section className="health-card"><h2>今週の小さな目標</h2><p>下の初期値は始め方の例です。生活に合わせて減らせます。0でその目標をお休みできます。</p>
        <div className="health-progress">{(Object.keys(goalLabels) as (keyof HealthGoals)[]).filter(k=>state.goals[k]>0).map(k=><div key={k}><span>{goalLabels[k]}</span><strong>{weeks.current[k]??0} / {state.goals[k]}{k==='activityMinutes'?'分':'日'}</strong><progress value={Math.min(weeks.current[k]??0,state.goals[k])} max={state.goals[k]} aria-label={goalLabels[k]}/></div>)}</div>
        <details><summary>目標とリマインドを変更</summary><form key={JSON.stringify([state.goals,state.reminder])} onSubmit={e=>{
          e.preventDefault();const f=new FormData(e.currentTarget);try {const goals={...state.goals};for(const k of Object.keys(goalLabels) as (keyof HealthGoals)[])goals[k]=Number(f.get(k))
            setState(saveHealthSettings(goals,{enabled:f.get('enabled')==='on',time:String(f.get('time'))}));setError('');setStatus('目標とリマインドを保存しました。')
          }catch(err){setError(message(err))}
        }}>
          {(Object.keys(goalLabels) as (keyof HealthGoals)[]).map(k=><label key={k}>{goalLabels[k]}<input name={k} type="number" required min={0} max={k==='activityMinutes'?10080:7} step={1} defaultValue={state.goals[k]}/></label>)}
          <label className="health-check"><input name="enabled" type="checkbox" defaultChecked={state.reminder.enabled}/>アプリ内リマインドを使う</label><label>表示を始める時刻<input name="time" type="time" required defaultValue={state.reminder.time}/></label>
          <small>端末の時刻を使用。このページを開いている間だけ表示します。アプリを閉じている間の通知はありません。</small><button type="submit" className="life-primary">設定を保存</button>
        </form></details>
      </section>
      <section className="health-card"><h2>腹囲・歩行などの履歴</h2>{state.records.length===0?<p>まだ記録がありません。</p>:<ul className="health-history">{[...state.records].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).map(r=><li key={r.id}><div><time>{new Date(r.at).toLocaleString('ja-JP')}</time><strong>{r.kind==='waist'?'腹囲':'歩行・有酸素運動'} {r.value}{r.kind==='waist'?' cm':'分'}</strong><span>{r.text}</span></div><button onClick={()=>{if(window.confirm('この記録を削除しますか？'))try {setState(deleteHealthRecord(r.id));setStatus('削除しました。');setError('')}catch(e){setError(message(e))}}}>削除</button></li>)}</ul>}<p>食事・手入力体重はホームのTimelineから確認・削除できます。</p></section>
    </>}
    <details className="health-card"><summary>この機能の考え方</summary><p>下腹の見た目や皮膚をつまんだ厚さだけで、脂肪量や原因を判断しません。部分的に脂肪を落とす効果を約束せず、食事と運動の記録、続けられる行動目標を支援します。摂取カロリーや減量速度は自動指定しません。</p><p>記録と小さな行動目標の参考：<a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/" target="_blank" rel="noreferrer">CDC — Steps for Losing Weight</a></p></details>
    {quick&&<QuickAdd initialKind={quick} onClose={()=>setQuick(null)} onSaved={r=>{setLife(r);setClock(new Date());setStatus('記録を保存しました。')}} onWorkout={()=>{setQuick(null);onWorkout()}}/>}
  </section>
}
