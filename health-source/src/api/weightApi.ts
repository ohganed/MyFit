import { loadLifeRecords } from '../features/life'

export type WeightTiming =
  | 'after_waking'
  | 'morning_reset'
  | 'before_breakfast'

export type WeightSource =
  | 'manual'
  | 'apple-health'
  | 'elecom'

export type WeightRecord = {
  id: string
  weightKg: number
  measuredAt: string
  timing: WeightTiming | null
  source: WeightSource
  bodyFatPercent: number | null
  bmi: number | null
  skeletalMusclePercent: number | null
  visceralFatLevel: number | null
  bodyWaterPercent: number | null
}

export type WeightFetchStatus = { apiAvailable: boolean; manualAvailable: boolean }
export type WeightFetchOptions = {
  includeManual?: boolean
  onStatus?: (status: WeightFetchStatus) => void
}

export async function fetchWeightRecords({ includeManual = true, onStatus }: WeightFetchOptions = {}): Promise<WeightRecord[]> {
  let manualAvailable = true
  let manual: WeightRecord[] = []
  if (includeManual) {
    try {
      manual = loadLifeRecords().filter(r => r.kind === 'weight').map(r => ({
        id: `life:${r.id}`, weightKg: r.value, measuredAt: r.at,
        timing: null, source: 'manual', bodyFatPercent: null, bmi: null,
        skeletalMusclePercent: null, visceralFatLevel: null, bodyWaterPercent: null,
      }))
    } catch { manualAvailable = false }
  }
  // GitHub Pages has no private SQLite API. Never request HTTP from the public site.
  if (window.location.hostname.endsWith('.github.io')) {
    onStatus?.({ apiAvailable: false, manualAvailable })
    return manual.sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt))
  }
  let api: WeightRecord[]
  try {
    const response = await fetch(`http://${window.location.hostname}:8787/api/weights`)
    if (!response.ok) throw new Error(`体重データを取得できませんでした: ${response.status}`)
    const data: unknown = await response.json()
    if (!Array.isArray(data) || !data.every(r => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.weightKg === 'number' && Number.isFinite(r.weightKg) && r.weightKg > 0 && typeof r.measuredAt === 'string' && Number.isFinite(Date.parse(r.measuredAt)))) {
      throw new Error('体重データの形式を確認できませんでした。')
    }
    api = data as WeightRecord[]
  } catch (error) {
    onStatus?.({ apiAvailable: false, manualAvailable })
    if (!manual.length) throw error
    return manual.sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt))
  }
  onStatus?.({ apiAvailable: true, manualAvailable })
  return [...api, ...manual].sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt))
}
