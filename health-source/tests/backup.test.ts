import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createBackup, parseBackup, restoreBackup, RESTORE_SNAPSHOT_KEY } from '../src/storage/backupStorage'
import { loadWorkoutHistory } from '../src/storage/workoutStorage'
class MemoryStorage {
  values = new Map<string, string>()
  failKey = ''
  get length() { return this.values.size }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) {
    if (this.failKey === key) { this.failKey = ''; throw new Error('quota') }
    this.values.set(key, value)
  }
  removeItem(key: string) { this.values.delete(key) }
}
test('raw strings round trip exactly including whitespace, unknown fields and malformed legacy values', () => {
  const source = new MemoryStorage()
  source.setItem('myfit-workout-history', ' [ { "unknown": "日本語\\n🥇" } ]\n')
  source.setItem('myfit-life-v1', '{broken')
  source.setItem('myfit-routines', '')
  source.setItem('unrelated', 'private')
  const restored = new MemoryStorage()
  restored.setItem('myfit-other', 'untouched')
  restored.setItem('unrelated', 'untouched')
  const backup = parseBackup(JSON.stringify(createBackup(source)))
  restoreBackup(backup, restored)
  for (const key of ['myfit-workout-history','myfit-life-v1','myfit-routines']) assert.equal(restored.getItem(key), source.getItem(key))
  assert.equal(restored.getItem('myfit-other'), 'untouched')
  assert.equal(restored.getItem('unrelated'), 'untouched')
  assert.equal(backup.entries.unrelated, undefined)
  assert.equal(createBackup(restored).entries[RESTORE_SNAPSHOT_KEY], undefined)
})
test('invalid envelope, foreign keys, snapshot injection and non-string values are rejected without writes', () => {
  const store = new MemoryStorage()
  const valid = createBackup(store)
  for (const data of [null, [], {}, {...valid, version:2}, {...valid, createdAt:'invalid'}, {...valid, entries:[]}, {...valid, entries:{foreign:'x'}}, {...valid, entries:{[RESTORE_SNAPSHOT_KEY]:'x'}}, {...valid, entries:{'myfit-life-v1':[]}}]) {
    assert.throws(() => parseBackup(JSON.stringify(data)))
  }
  assert.equal(store.length, 0)
})
test('failed restore rolls back changed and newly created keys, retaining safety snapshot', () => {
  const store = new MemoryStorage()
  store.setItem('myfit-a', 'old')
  store.setItem('other', 'safe')
  store.failKey = 'myfit-c'
  assert.throws(() => restoreBackup({...createBackup(store), entries:{'myfit-a':'new','myfit-b':'new','myfit-c':'fail'}}, store), /元に戻/)
  assert.equal(store.getItem('myfit-a'), 'old')
  assert.equal(store.getItem('myfit-b'), null)
  assert.equal(store.getItem('other'), 'safe')
  assert.equal(parseBackup(store.getItem(RESTORE_SNAPSHOT_KEY)!).entries['myfit-a'], 'old')
})
test('snapshot failure aborts before record writes', () => {
  const store = new MemoryStorage()
  store.setItem('myfit-a', 'old')
  store.failKey = RESTORE_SNAPSHOT_KEY
  assert.throws(() => restoreBackup({...createBackup(store),entries:{'myfit-a':'new'}},store))
  assert.equal(store.getItem('myfit-a'), 'old')
})
test('opening workout history never rewrites legacy raw storage', () => {
  const store = new MemoryStorage()
  const raw = ' [ {"exerciseName":"squat","sets":[{"weight":20,"reps":5,"custom":"keep"}],"savedAt":"2026-10-18","unknown":true}, {"legacy":"keep"} ] '
  store.setItem('myfit-workout-history', raw)
  Object.defineProperty(globalThis, 'localStorage', {value:store, configurable:true})
  assert.equal(loadWorkoutHistory().length, 1)
  assert.equal(store.getItem('myfit-workout-history'), raw)
})
