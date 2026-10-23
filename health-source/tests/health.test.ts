import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { HEALTH_STORAGE_KEY, loadHealthState, saveHealthRecord, deleteHealthRecord, saveHealthSettings, buildHealthWeeks, healthReminders } from '../src/features/health.ts'
import type { LifeRecord } from '../src/features/life.ts'
let stored: Map<string,string>
beforeEach(() => {
  stored = new Map([['myfit-life-v1','legacy'],['myfit-workout-history','workouts']])
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>stored.get(k) ?? null,setItem:(k:string,v:string)=>stored.set(k,v)}})
})
const at = (day:number,hour=8) => new Date(2026,9,day,hour).toISOString()
const now = new Date(2026,9,23,21)
const input = {kind:'waist' as const,at:at(23),value:85,text:''}
test('separate storage preserves legacy data; record deletion and settings retain other health fields', () => {
  const state = loadHealthState()
  assert.equal(stored.size,2)
  const record = saveHealthRecord(input).records[0]
  const configured = saveHealthSettings({...state.goals,mealDays:4},{enabled:true,time:'21:00'})
  assert.equal(configured.records[0].id,record.id)
  assert.equal(deleteHealthRecord(record.id).goals.mealDays,4)
  assert.equal(stored.get('myfit-life-v1'),'legacy')
  assert.equal(stored.get('myfit-workout-history'),'workouts')
})
test('malformed documents are never overwritten by any mutation', () => {
  const defaults = loadHealthState()
  for (const raw of ['{','', '{}',JSON.stringify({...defaults,records:[{...input,id:'x'},{...input,id:'x'}]}),JSON.stringify({...defaults,goals:{...defaults.goals,mealDays:8}})]) {
    stored.set(HEALTH_STORAGE_KEY,raw)
    assert.throws(()=>loadHealthState())
    assert.throws(()=>saveHealthRecord(input))
    assert.throws(()=>deleteHealthRecord('x'))
    assert.throws(()=>saveHealthSettings(defaults.goals,defaults.reminder))
    assert.equal(stored.get(HEALTH_STORAGE_KEY),raw)
  }
})
test('invalid values, read and write failures surface', () => {
  const s=loadHealthState()
  for (const value of [NaN,Infinity,-1,301]) assert.throws(()=>saveHealthRecord({...input,value}))
  assert.throws(()=>saveHealthSettings({...s.goals,mealDays:1.5},s.reminder))
  assert.throws(()=>saveHealthSettings(s.goals,{enabled:true,time:'24:00'}))
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>{throw Error('read')},setItem:()=>assert.fail('must not write')}})
  assert.throws(()=>saveHealthRecord(input),/read/)
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{throw Error('quota')}}})
  assert.throws(()=>saveHealthRecord(input),/quota/)
})
test('local Monday weeks combine sources, use daily latest, exclude future and count distinct days', () => {
  const state=loadHealthState()
  state.records=[{...input,id:'a',at:at(19),value:90},{...input,id:'b',at:at(20),value:88},{...input,id:'c',at:at(12),value:94},{...input,id:'d',at:at(13),value:92},{...input,id:'e',kind:'activity',at:at(20),value:15},{...input,id:'f',kind:'activity',at:at(20,9),value:20},{...input,id:'future',at:at(24),value:200}]
  const life:LifeRecord[]=[{id:'a',kind:'weight',at:at(19),value:100,text:''},{id:'b',kind:'meal',at:at(20),value:0,text:'昼食'},{id:'c',kind:'meal',at:at(20,9),value:500,text:''}]
  const weights=[{weightKg:80,measuredAt:at(19,9)},{weightKg:82,measuredAt:at(20)},{weightKg:84,measuredAt:at(12)},{weightKg:86,measuredAt:at(13)},{weightKg:200,measuredAt:at(24)}]
  const result=buildHealthWeeks([],life,weights,state,now)
  assert.equal(result.current.start,'2026-10-19')
  assert.equal(result.current.end,'2026-10-25')
  assert.equal(result.previous.start,'2026-10-12')
  assert.equal(result.current.weightMean,81)
  assert.equal(result.weightDelta,-4)
  assert.equal(result.waistDelta,-4)
  assert.equal(result.current.mealDays,1)
  assert.equal(result.current.activityDays,1)
  assert.equal(result.current.activityMinutes,35)
  assert.equal(buildHealthWeeks([],[],[],loadHealthState(),now).current.activityMinutes,null)
})
test('one measurement per week never produces a comparison',()=>{
  const result=buildHealthWeeks([],[],[{weightKg:80,measuredAt:at(19)},{weightKg:82,measuredAt:at(12)}],loadHealthState(),now)
  assert.equal(result.weightDelta,null)
})
test('reminders obey local clock, opt-in and fulfilled goals including API weight',()=>{
  const state=loadHealthState()
  let weeks=buildHealthWeeks([],[],[],state,now)
  assert.deepEqual(healthReminders(weeks,[],state,now),[])
  state.reminder={enabled:true,time:'22:00'}
  assert.deepEqual(healthReminders(weeks,[],state,now),[])
  state.reminder.time='20:00'
  assert.equal(healthReminders(weeks,[],state,now).length,5)
  const weights=[{weightKg:80,measuredAt:at(23)}]
  assert.equal(healthReminders(weeks,[],state,now,weights).length,4)
  state.goals={mealDays:0,activityDays:0,activityMinutes:0,weightDays:0,waistDays:0,workoutDays:0}
  weeks=buildHealthWeeks([],[],[],state,now)
  assert.deepEqual(healthReminders(weeks,[],state,now),[])
})
