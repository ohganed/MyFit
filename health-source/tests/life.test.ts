import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { loadLifeRecords, saveLifeRecord, deleteLifeRecord, LIFE_STORAGE_KEY, buildFlow, detectWorkoutChanges, localDateKey } from '../src/features/life.ts'
import type { WorkoutRecord } from '../src/storage/workoutStorage.ts'
let stored: Map<string, string>
beforeEach(() => {
  stored = new Map([['myfit-workout-history', '[{"legacy":"preserve"}]'], ['myfit-weight-goal', '72']])
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (k: string) => stored.get(k) ?? null,
    setItem: (k: string, v: string) => stored.set(k, v),
  } })
})
const input = {kind: 'sleep' as const, at:'2026-10-18T08:00:00+09:00', value:7.5, text:'起床'}
test('reading absent records does not write; save/delete preserve unrelated keys and records', () => {
  assert.deepEqual(loadLifeRecords(), [])
  assert.equal(stored.size, 2)
  const first = saveLifeRecord(input)[0]
  const second = saveLifeRecord({...input, text:'次の日'})[0]
  assert.equal(loadLifeRecords().length, 2)
  assert.deepEqual(deleteLifeRecord(second.id), [first])
  assert.equal(stored.get('myfit-workout-history'), '[{"legacy":"preserve"}]')
  assert.equal(stored.get('myfit-weight-goal'), '72')
})
test('malformed storage cannot be overwritten by save or delete', () => {
  for (const raw of ['{', '{}', '[{"id":"damaged"}]', '']) {
    stored.set(LIFE_STORAGE_KEY, raw)
    assert.throws(() => loadLifeRecords())
    assert.throws(() => saveLifeRecord(input))
    assert.throws(() => deleteLifeRecord('anything'))
    assert.equal(stored.get(LIFE_STORAGE_KEY), raw)
  }
})
test('invalid input and write failures are explicit', () => {
  assert.throws(() => saveLifeRecord({...input, value:25}))
  assert.throws(() => saveLifeRecord({...input, at:'bad'}))
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{getItem:()=>null,setItem:()=>{throw new Error('quota')}}})
  assert.throws(() => saveLifeRecord(input), /quota/)
})
test('dates use local calendar and unknown metrics remain null over 21 days', () => {
  const now = new Date(2026,9,18,12)
  assert.equal(localDateKey(new Date(2026,9,18,0,1)), '2026-10-18')
  assert.equal(localDateKey('2026-10-18'), '2026-10-18')
  assert.equal(localDateKey('invalid'), '')
  const flow = buildFlow([],[],[],now)
  assert.equal(flow.length,21)
  assert.equal(flow[0].date, '2026-09-28')
  assert.equal(flow[20].date, '2026-10-18')
  assert.equal(flow[20].sleepHours,null)
  assert.equal(flow[20].weightKg,null)
})
test('Flow uses latest real daily value and excludes future entries', () => {
  const now = new Date(2026,9,18,12)
  const at = new Date(2026,9,18,8).toISOString()
  const flow = buildFlow([], [{...input,id:'a',at}, {...input,id:'b',at:new Date(2026,9,19,8).toISOString(),value:9}], [{weightKg:70,measuredAt:at}], now)
  assert.equal(flow[20].sleepHours,7.5)
  assert.equal(flow[20].weightKg,70)
})
const now = new Date('2026-10-18T12:00:00Z')
function workout(days: number, reps: number[], weight = '20'): WorkoutRecord {
 return {id:String(days), exerciseId:'press', exerciseName:'プレス',savedAt:new Date(now.getTime()-days*86400000).toISOString(),sets:reps.map((r,i)=>({id:String(i),reps:String(r),weight}))}
}
test('change detection requires five previous sessions, same exercise and load', () => {
  const baseline = [1,2,3,4,5].map(d=>workout(d,[10,10,10]))
  assert.equal(detectWorkoutChanges([workout(0,[6,6,6]),...baseline],now).length,1)
  assert.equal(detectWorkoutChanges([workout(0,[6,6,6]),...baseline.slice(1)],now).length,0)
  assert.equal(detectWorkoutChanges([workout(0,[6,6,6],'25'),...baseline],now).length,0)
  assert.equal(detectWorkoutChanges([workout(0,[8,8,8]),...baseline],now).length,0)
})
test('session medians resist outlier sets; old and future history excluded', () => {
  const baseline = [1,2,3,4,5].map(d=>workout(d,[10,10,100]))
  assert.equal(detectWorkoutChanges([workout(0,[10,10,1]),...baseline],now).length,0)
  assert.equal(detectWorkoutChanges([workout(0,[6]),...baseline.map(r=>({...r,savedAt:'2026-08-01T00:00:00Z'}))],now).length,0)
  assert.equal(detectWorkoutChanges([workout(-1,[1]),...baseline],now).length,0)
})
