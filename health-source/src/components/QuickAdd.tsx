import { useEffect, useRef, useState } from 'react'
import { localDateKey, saveLifeRecord, type LifeRecord } from '../features/life'
export const lifeLabels = { sleep: '睡眠', meal: '食事', energy: '気分・活力', bp: '血圧', weight: '体重' }
export function lifeDetail(r: LifeRecord) {
  return r.kind === 'sleep' ? `${r.value} 時間` : r.kind === 'energy' ? `${r.value} / 5` : r.kind === 'weight' ? `${r.value} kg` : r.kind === 'bp' ? `${r.value} / ${r.secondary} mmHg` : r.text
}
export default function QuickAdd({ onClose, onSaved, onWorkout, initialKind = 'sleep' }: {initialKind?:LifeRecord['kind']; onClose:()=>void; onSaved:(r:LifeRecord[])=>void; onWorkout:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [kind, setKind] = useState<LifeRecord['kind']>(initialKind)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="life-dialog" onCancel={onClose}>
    <div className="today-card-heading"><h2>Quick Add</h2><button type="button" onClick={onClose} aria-label="閉じる">×</button></div>
    <p>生活の記録を追加</p>
    <button type="button" onClick={onWorkout}>筋トレを記録 →</button>
    <form key={kind} onSubmit={e => {
      e.preventDefault()
      try {
        const f = new FormData(e.currentTarget)
        const at = new Date(String(f.get('at')))
        if (!Number.isFinite(at.getTime()) || at > new Date()) throw new Error('日時は現在以前を指定してください。')
        const records = saveLifeRecord({kind, at:at.toISOString(), value:kind==='meal'?1:Number(f.get('value')), text:String(f.get('text')||'').trim(), ...(kind==='bp'?{secondary:Number(f.get('secondary'))}:{})})
        onSaved(records); onClose()
      } catch (err) { setError(err instanceof Error ? err.message : '保存できませんでした') }
    }}>
      <label>種類<select value={kind} onChange={e=>{setKind(e.target.value as LifeRecord['kind']);setError('')}}>{Object.entries(lifeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label>日時（睡眠は起床日時）<input name="at" type="datetime-local" required defaultValue={`${localDateKey(new Date())}T${new Date().toTimeString().slice(0,5)}`} /></label>
      {kind !== 'meal' && <label>{kind==='sleep'?'睡眠時間（時間）':kind==='energy'?'気分・活力（1〜5）':kind==='weight'?'体重（kg）':'上の血圧（mmHg）'}<input name="value" type="number" required min={kind==='energy'?1:kind==='bp'?40:0.1} max={kind==='sleep'?24:kind==='energy'?5:kind==='weight'?500:300} step={kind==='sleep'||kind==='weight'?0.1:1}/></label>}
      {kind==='bp'&&<label>下の血圧（mmHg）<input name="secondary" type="number" min="20" max="200" required /></label>}
      <label>{kind==='meal'?'食事の内容':'メモ（任意）'}<input name="text" maxLength={500} required={kind==='meal'} /></label>
      {error&&<p role="alert">{error}</p>}
      <button type="submit" className="life-primary">保存</button>
    </form>
  </dialog>
}
