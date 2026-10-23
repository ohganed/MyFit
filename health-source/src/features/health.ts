import { localDateKey, type LifeRecord } from './life'
import type { WorkoutRecord } from '../storage/workoutStorage'

export type HealthRecord = { id: string; kind: 'waist' | 'activity'; at: string; value: number; text: string }
export type HealthGoals = { mealDays: number; activityDays: number; activityMinutes: number; weightDays: number; waistDays: number; workoutDays: number }
export type HealthReminder = { enabled: boolean; time: string }
export type HealthState = { records: HealthRecord[]; goals: HealthGoals; reminder: HealthReminder }
export const HEALTH_STORAGE_KEY = 'myfit-health-v1'
export const DEFAULT_HEALTH_GOALS: HealthGoals = { mealDays: 3, activityDays: 3, activityMinutes: 60, weightDays: 3, waistDays: 1, workoutDays: 2 }
const defaults = (): HealthState => ({ records: [], goals: { ...DEFAULT_HEALTH_GOALS }, reminder: { enabled: false, time: '20:00' } })
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
function validRecord(v: unknown): v is HealthRecord {
  if (!object(v) || typeof v.id !== 'string' || !v.id || typeof v.at !== 'string' || !Number.isFinite(Date.parse(v.at)) || typeof v.text !== 'string' || !finite(v.value)) return false
  return v.kind === 'waist' ? v.value > 0 && v.value <= 300 : v.kind === 'activity' && v.value >= 0 && v.value <= 1440
}
function validGoals(v: unknown): v is HealthGoals {
  return object(v) && Object.keys(DEFAULT_HEALTH_GOALS).every(k => finite(v[k]) && Number.isInteger(v[k]) && v[k] >= 0 && v[k] <= (k === 'activityMinutes' ? 10080 : 7))
}
function validReminder(v: unknown): v is HealthReminder {
  return object(v) && typeof v.enabled === 'boolean' && typeof v.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)
}
export function loadHealthState(): HealthState {
  const raw = localStorage.getItem(HEALTH_STORAGE_KEY)
  if (raw === null) return defaults()
  let v: unknown
  try { v = JSON.parse(raw) } catch { throw new Error('健康記録を読み取れません。保存済みデータは変更していません。') }
  if (!object(v) || !Array.isArray(v.records) || !v.records.every(validRecord) || new Set(v.records.map(r => r.id)).size !== v.records.length || !validGoals(v.goals) || !validReminder(v.reminder)) throw new Error('健康記録の形式が不正です。保存済みデータは変更していません。')
  return v as HealthState
}
function persist(state: HealthState): HealthState {
  localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(state))
  return state
}
export function saveHealthRecord(input: Omit<HealthRecord, 'id'>): HealthState {
  const record = { ...input, id: crypto.randomUUID() }
  if (!validRecord(record)) throw new Error('入力値と記録日時を確認してください。')
  const state = loadHealthState()
  return persist({ ...state, records: [record, ...state.records] })
}
export function deleteHealthRecord(id: string): HealthState {
  const state = loadHealthState()
  return persist({ ...state, records: state.records.filter(r => r.id !== id) })
}
export function saveHealthSettings(goals: HealthGoals, reminder: HealthReminder): HealthState {
  if (!validGoals(goals) || !validReminder(reminder)) throw new Error('目標とリマインド時刻を確認してください。')
  return persist({ ...loadHealthState(), goals, reminder })
}
export type HealthWeek = { start: string; end: string; mealDays: number; activityDays: number; activityMinutes: number | null; weightDays: number; waistDays: number; workoutDays: number; weightMean: number | null; waistMean: number | null }
export type HealthWeeks = { current: HealthWeek; previous: HealthWeek; weightDelta: number | null; waistDelta: number | null }
export type HealthWeight = { weightKg: number; measuredAt: string }
function dailyMean(records: { at: string; value: number }[]) {
  const daily = new Map<string, { at: string; value: number }>()
  for (const r of records) {
    const key = localDateKey(r.at)
    if (!daily.has(key) || Date.parse(r.at) > Date.parse(daily.get(key)!.at)) daily.set(key, r)
  }
  return { days: daily.size, mean: daily.size ? [...daily.values()].reduce((sum, r) => sum + r.value, 0) / daily.size : null }
}
export function buildHealthWeeks(history: WorkoutRecord[], life: LifeRecord[], weights: readonly HealthWeight[], health: HealthState, now = new Date()): HealthWeeks {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)
  const week = (offset: number): HealthWeek => {
    const start = new Date(monday); start.setDate(start.getDate() + offset)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    const included = (at: string) => { const t = Date.parse(at); return t >= start.getTime() && t < end.getTime() && t <= now.getTime() }
    const days = (dates: string[]) => new Set(dates.map(localDateKey)).size
    const records = health.records.filter(r => validRecord(r) && included(r.at))
    const activity = records.filter(r => r.kind === 'activity')
    const weight = dailyMean([
      ...life.filter(r => r.kind === 'weight' && finite(r.value) && r.value > 0 && r.value <= 500 && included(r.at)).map(r => ({ at: r.at, value: r.value })),
      ...weights.filter(r => finite(r.weightKg) && r.weightKg > 0 && r.weightKg <= 500 && included(r.measuredAt)).map(r => ({ at: r.measuredAt, value: r.weightKg })),
    ])
    const waist = dailyMean(records.filter(r => r.kind === 'waist'))
    const last = new Date(end); last.setDate(last.getDate() - 1)
    return { start: localDateKey(start), end: localDateKey(last), mealDays: days(life.filter(r => r.kind === 'meal' && finite(r.value) && r.value >= 0 && r.value <= 10000 && included(r.at)).map(r => r.at)), activityDays: days(activity.filter(r => r.value > 0).map(r => r.at)), activityMinutes: activity.length ? activity.reduce((sum, r) => sum + r.value, 0) : null, weightDays: weight.days, waistDays: waist.days, workoutDays: days(history.filter(r => included(r.savedAt)).map(r => r.savedAt)), weightMean: weight.mean, waistMean: waist.mean }
  }
  const current = week(0), previous = week(-7)
  return { current, previous, weightDelta: current.weightDays >= 2 && previous.weightDays >= 2 ? current.weightMean! - previous.weightMean! : null, waistDelta: current.waistDays >= 2 && previous.waistDays >= 2 ? current.waistMean! - previous.waistMean! : null }
}
// In-app prompts only; there is no notification permission request or background delivery.
export function healthReminders(weeks: HealthWeeks, life: LifeRecord[], health: HealthState, now = new Date(), weights: readonly HealthWeight[] = []): string[] {
  if (!health.reminder.enabled) return []
  const [hours, minutes] = health.reminder.time.split(':').map(Number)
  if (now.getHours() * 60 + now.getMinutes() < hours * 60 + minutes) return []
  const today = localDateKey(now)
  const isToday = (at: string) => localDateKey(at) === today && Date.parse(at) <= now.getTime()
  const prompts: string[] = [], w = weeks.current, g = health.goals
  if (w.mealDays < g.mealDays && !life.some(r => r.kind === 'meal' && isToday(r.at))) prompts.push('今日の食事をひとこと記録しましょう。')
  if ((w.activityDays < g.activityDays || (w.activityMinutes ?? 0) < g.activityMinutes) && !health.records.some(r => r.kind === 'activity' && isToday(r.at))) prompts.push('無理のない活動と、その時間を記録しましょう。')
  if (w.weightDays < g.weightDays && !life.some(r => r.kind === 'weight' && isToday(r.at)) && !weights.some(r => isToday(r.measuredAt))) prompts.push('体重はできるだけ同じ条件で記録しましょう。')
  if (w.waistDays < g.waistDays && !health.records.some(r => r.kind === 'waist' && isToday(r.at))) prompts.push('腹囲を同じ位置・条件で記録しましょう。')
  if (w.workoutDays < g.workoutDays) prompts.push('今週の筋トレ予定を確認し、休息も取りましょう。')
  return prompts
}
