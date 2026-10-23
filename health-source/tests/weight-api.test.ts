import {test, beforeEach} from 'node:test'
import assert from 'node:assert/strict'
import {fetchWeightRecords, type WeightFetchStatus} from '../src/api/weightApi.ts'
const manual = {id:'abc',kind:'weight',at:'2026-10-18T10:00:00Z',value:71,text:''}
const server = {id:'server',weightKg:72,measuredAt:'2026-10-17T10:00:00Z',timing:'after_waking',source:'elecom'}
beforeEach(() => {
  Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{hostname:'localhost'}}})
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>JSON.stringify([manual]),setItem:()=>{throw new Error('unexpected write')}}})
  globalThis.fetch = async () => new Response(JSON.stringify([server]))
})
test('merges manual weights without inventing measurement timing or body composition',async () => {
  const records = await fetchWeightRecords()
  assert.equal(records.length,2)
  assert.equal(records[0].id,'life:abc')
  assert.equal(records[0].timing,null)
  assert.equal(records[0].bmi,null)
  assert.equal(records[0].source,'manual')
})
test('manual opt-out returns server only and retains API errors',async () => {
  assert.equal((await fetchWeightRecords({includeManual:false})).length,1)
  globalThis.fetch = async () => {throw new Error('offline')}
  await assert.rejects(fetchWeightRecords({includeManual:false}),/offline/)
})
test('offline fallback retains local weights and reports incomplete source',async () => {
  globalThis.fetch = async () => {throw new Error('offline')}
  const statuses: WeightFetchStatus[] = []
  const records = await fetchWeightRecords({onStatus:s=>statuses.push(s)})
  assert.equal(records[0].weightKg,71)
  assert.deepEqual(statuses,[{apiAvailable:false,manualAvailable:true}])
})
test('corrupted local data does not hide working API or overwrite storage',async () => {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>'{',setItem:()=>{throw new Error('unexpected write')}}})
  const statuses: WeightFetchStatus[] = []
  assert.equal((await fetchWeightRecords({onStatus:s=>statuses.push(s)}))[0].id,'server')
  assert.deepEqual(statuses,[{apiAvailable:true,manualAvailable:false}])
})

test('GitHub Pages uses browser records without requesting the private HTTP API',async () => {
  Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{hostname:'ohganed.github.io'}}})
  globalThis.fetch = async () => {throw new Error('must not request network')}
  const statuses: WeightFetchStatus[]=[]
  assert.equal((await fetchWeightRecords({onStatus:s=>statuses.push(s)}))[0].weightKg,71)
  assert.deepEqual(await fetchWeightRecords({includeManual:false}),[])
  assert.deepEqual(statuses,[{apiAvailable:false,manualAvailable:true}])
})
