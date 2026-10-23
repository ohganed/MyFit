import type {
  WeightRecord,
} from '../../api/weightApi'

export function getDateKey(
  measuredAt: string,
): string {
  return new Date(
    measuredAt,
  ).toLocaleDateString('sv-SE')
}

export function getDateLabel(
  measuredAt: string,
): string {
  return new Date(
    measuredAt,
  ).toLocaleDateString(
    'ja-JP',
    {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    },
  )
}

export function getTimingLabel(
  timing: WeightRecord['timing'],
): string {
  switch (timing) {
    case 'after_waking':
      return '起床時'

    case 'morning_reset':
      return '朝のリセット後'

    case 'before_breakfast':
      return '朝食前'

    default:
      return '未分類'
  }
}

export function getDailyBaseline(
  records: WeightRecord[],
): WeightRecord | undefined {
  return (
    records.find(
      (record) =>
        record.timing === 'morning_reset',
    ) ??
    records.find(
      (record) =>
        record.timing === 'before_breakfast',
    ) ??
    records.find(
      (record) =>
        record.timing === 'after_waking',
    )
  )
}

export function calculateMorningRange(
  records: WeightRecord[],
): {
  range: number | null
  count: number
} {
  const values = records
    .filter((record) =>
      [
        'after_waking',
        'morning_reset',
        'before_breakfast',
      ].includes(
        record.timing ?? '',
      ),
    )
    .map(
      (record) =>
        record.weightKg,
    )

  if (values.length === 0) {
    return {
      range: null,
      count: 0,
    }
  }

  return {
    range:
      Math.max(...values) -
      Math.min(...values),
    count: values.length,
  }
}

export function calculateMorningDifferences(
  records: WeightRecord[],
) {
  const afterWaking =
    records.find(
      (record) =>
        record.timing === 'after_waking',
    )

  const morningReset =
    records.find(
      (record) =>
        record.timing === 'morning_reset',
    )

  const beforeBreakfast =
    records.find(
      (record) =>
        record.timing ===
        'before_breakfast',
    )

  if (
    !afterWaking ||
    !morningReset ||
    !beforeBreakfast
  ) {
    return null
  }

  return {
    wakingToReset:
      morningReset.weightKg -
      afterWaking.weightKg,

    resetToBreakfast:
      beforeBreakfast.weightKg -
      morningReset.weightKg,

    total:
      Math.max(
        afterWaking.weightKg,
        morningReset.weightKg,
        beforeBreakfast.weightKg,
      ) -
      Math.min(
        afterWaking.weightKg,
        morningReset.weightKg,
        beforeBreakfast.weightKg,
      ),
  }
}

export type WeightTrendPoint = {
  dateKey: string
  weightKg: number
}

export type MovingAveragePoint =
  WeightTrendPoint & {
    dayCount: number
  }

export function calculateMovingAverage(
  dailyBaselines: WeightTrendPoint[],
  windowSize = 7,
): MovingAveragePoint[] {
  const sorted = [...dailyBaselines].sort(
    (a, b) =>
      a.dateKey.localeCompare(
        b.dateKey,
      ),
  )

  return sorted.map(
    (point, index) => {
      const startIndex =
        Math.max(
          0,
          index - (windowSize - 1),
        )

      const window =
        sorted.slice(
          startIndex,
          index + 1,
        )

      const average =
        window.reduce(
          (sum, item) =>
            sum + item.weightKg,
          0,
        ) / window.length

      return {
        dateKey: point.dateKey,
        weightKg: average,
        dayCount: window.length,
      }
    },
  )
}

export type MovingAverageDirection =
  | 'up'
  | 'down'
  | 'stable'
  | 'insufficient'

export type MovingAverageTrend = {
  latest: number | null
  change: number | null
  direction: MovingAverageDirection
}

export function calculateMovingAverageTrend(
  movingAverageData: MovingAveragePoint[],
): MovingAverageTrend {
  if (movingAverageData.length === 0) {
    return {
      latest: null,
      change: null,
      direction: 'insufficient',
    }
  }

  const latest =
    movingAverageData[
      movingAverageData.length - 1
    ]

  if (movingAverageData.length < 2) {
    return {
      latest: latest.weightKg,
      change: null,
      direction: 'insufficient',
    }
  }

  const previous =
    movingAverageData[
      movingAverageData.length - 2
    ]

  const change =
    latest.weightKg -
    previous.weightKg

  const direction:
    MovingAverageDirection =
      Math.abs(change) < 0.05
        ? 'stable'
        : change < 0
          ? 'down'
          : 'up'

  return {
    latest: latest.weightKg,
    change,
    direction,
  }
}

export type PeriodAverageStats = {
  average: number | null
  dayCount: number
}

export function calculatePeriodAverage(
  records: WeightRecord[],
  days: number,
  referenceDate = new Date(),
): PeriodAverageStats {
  const end = new Date(referenceDate)
  end.setHours(23, 59, 59, 999)

  const start = new Date(end)
  start.setDate(
    start.getDate() - (days - 1),
  )
  start.setHours(0, 0, 0, 0)

  const dailyGroups =
    new Map<string, WeightRecord[]>()

  records.forEach((record) => {
    const measured =
      new Date(record.measuredAt)

    if (
      measured < start ||
      measured > end
    ) {
      return
    }

    const key =
      getDateKey(record.measuredAt)

    const group =
      dailyGroups.get(key) ?? []

    group.push(record)
    dailyGroups.set(key, group)
  })

  const baselines =
    Array.from(
      dailyGroups.values(),
    )
      .map(getDailyBaseline)
      .filter(
        (
          record,
        ): record is WeightRecord =>
          Boolean(record),
      )

  if (baselines.length === 0) {
    return {
      average: null,
      dayCount: 0,
    }
  }

  const total =
    baselines.reduce(
      (sum, record) =>
        sum + record.weightKg,
      0,
    )

  return {
    average:
      total / baselines.length,
    dayCount: baselines.length,
  }
}

export type WeightTiming =
  | 'after_waking'
  | 'morning_reset'
  | 'before_breakfast'

export type TimingTrendSeries = {
  timing: WeightTiming
  points: WeightTrendPoint[]
}

function getPeriodBounds(
  days: number,
  referenceDate = new Date(),
) {
  const end = new Date(referenceDate)
  end.setHours(23, 59, 59, 999)

  const start = new Date(end)
  start.setDate(
    start.getDate() - (days - 1),
  )
  start.setHours(0, 0, 0, 0)

  return {
    start,
    end,
  }
}

export function createTimingTrendData(
  records: WeightRecord[],
  days: number,
  referenceDate = new Date(),
): TimingTrendSeries[] {
  const {
    start,
    end,
  } = getPeriodBounds(
    days,
    referenceDate,
  )

  const targetTimings: WeightTiming[] = [
    'after_waking',
    'morning_reset',
    'before_breakfast',
  ]

  return targetTimings.map(
    (timing) => ({
      timing,

      points: records
        .filter((record) => {
          const measured =
            new Date(record.measuredAt)

          return (
            record.timing === timing &&
            measured >= start &&
            measured <= end
          )
        })
        .map((record) => ({
          dateKey:
            getDateKey(record.measuredAt),

          weightKg:
            record.weightKg,
        }))
        .sort(
          (a, b) =>
            a.dateKey.localeCompare(
              b.dateKey,
            ),
        ),
    }),
  )
}

export function createBaselineTrendData(
  records: WeightRecord[],
  days: number,
  referenceDate = new Date(),
): WeightTrendPoint[] {
  const {
    start,
    end,
  } = getPeriodBounds(
    days,
    referenceDate,
  )

  const groups =
    new Map<string, WeightRecord[]>()

  records.forEach((record) => {
    const measured =
      new Date(record.measuredAt)

    if (
      measured < start ||
      measured > end
    ) {
      return
    }

    const dateKey =
      getDateKey(record.measuredAt)

    const group =
      groups.get(dateKey) ?? []

    group.push(record)
    groups.set(dateKey, group)
  })

  return Array.from(
    groups.entries(),
  )
    .map(([dateKey, dayRecords]) => {
      const baseline =
        getDailyBaseline(dayRecords)

      return baseline
        ? {
            dateKey,
            weightKg:
              baseline.weightKg,
          }
        : null
    })
    .filter(
      (
        point,
      ): point is WeightTrendPoint =>
        point !== null,
    )
    .sort(
      (a, b) =>
        a.dateKey.localeCompare(
          b.dateKey,
        ),
    )
}

export type DailyWeightComparison = {
  todayBaseline: WeightRecord | undefined
  yesterdayBaseline: WeightRecord | undefined
  differenceFromYesterday: number | null
  differenceFromAverage: number | null
}

export function calculateDailyWeightComparison(
  records: WeightRecord[],
  average: number | null,
  referenceDate = new Date(),
): DailyWeightComparison {
  const todayKey =
    getDateKey(referenceDate.toISOString())

  const yesterday =
    new Date(referenceDate)

  yesterday.setDate(
    yesterday.getDate() - 1,
  )

  const yesterdayKey =
    getDateKey(yesterday.toISOString())

  const todayRecords =
    records.filter(
      (record) =>
        getDateKey(record.measuredAt) ===
        todayKey,
    )

  const yesterdayRecords =
    records.filter(
      (record) =>
        getDateKey(record.measuredAt) ===
        yesterdayKey,
    )

  const todayBaseline =
    getDailyBaseline(todayRecords)

  const yesterdayBaseline =
    getDailyBaseline(yesterdayRecords)

  const differenceFromYesterday =
    todayBaseline &&
    yesterdayBaseline
      ? todayBaseline.weightKg -
        yesterdayBaseline.weightKg
      : null

  const differenceFromAverage =
    todayBaseline &&
    average !== null
      ? todayBaseline.weightKg -
        average
      : null

  return {
    todayBaseline,
    yesterdayBaseline,
    differenceFromYesterday,
    differenceFromAverage,
  }
}

export type GroupedWeightDay = {
  dateKey: string
  dateLabel: string
  records: WeightRecord[]
}

export function groupWeightRecordsByDay(
  records: WeightRecord[],
): GroupedWeightDay[] {
  const groups =
    new Map<string, GroupedWeightDay>()

  records.forEach((record) => {
    const dateKey =
      getDateKey(record.measuredAt)

    const existing =
      groups.get(dateKey)

    if (existing) {
      existing.records.push(record)
      return
    }

    groups.set(dateKey, {
      dateKey,
      dateLabel:
        getDateLabel(record.measuredAt),
      records: [record],
    })
  })

  return Array.from(
    groups.values(),
  ).sort(
    (a, b) =>
      b.dateKey.localeCompare(
        a.dateKey,
      ),
  )
}

export function createMovingAverageData(
  records: WeightRecord[],
  windowSize = 7,
): MovingAveragePoint[] {
  const groups =
    groupWeightRecordsByDay(records)

  const dailyBaselines =
    groups
      .map((day) => {
        const baseline =
          getDailyBaseline(day.records)

        return baseline
          ? {
              dateKey: day.dateKey,
              weightKg:
                baseline.weightKg,
            }
          : null
      })
      .filter(
        (
          point,
        ): point is WeightTrendPoint =>
          point !== null,
      )

  return calculateMovingAverage(
    dailyBaselines,
    windowSize,
  )
}

export type WeeklyWeightTrend = {
  changePerWeek: number | null
  direction:
    | 'down'
    | 'up'
    | 'stable'
    | 'insufficient'
  daySpan: number
}

export function calculateWeeklyWeightTrend(
  movingAverageData: MovingAveragePoint[],
): WeeklyWeightTrend {
  if (movingAverageData.length < 2) {
    return {
      changePerWeek: null,
      direction: 'insufficient',
      daySpan: 0,
    }
  }

  const latest =
    movingAverageData[
      movingAverageData.length - 1
    ]

  const targetTime =
    new Date(latest.dateKey).getTime() -
    7 * 24 * 60 * 60 * 1000

  const candidates =
    movingAverageData.filter(
      (point) =>
        new Date(
          point.dateKey,
        ).getTime() <= targetTime,
    )

  const previous =
    candidates.length > 0
      ? candidates[
          candidates.length - 1
        ]
      : movingAverageData[0]

  const latestTime =
    new Date(latest.dateKey).getTime()

  const previousTime =
    new Date(previous.dateKey).getTime()

  const daySpan =
    Math.round(
      (latestTime - previousTime) /
        (24 * 60 * 60 * 1000),
    )

  if (daySpan <= 0) {
    return {
      changePerWeek: null,
      direction: 'insufficient',
      daySpan: 0,
    }
  }

  const change =
    latest.weightKg -
    previous.weightKg

  const changePerWeek =
    change * (7 / daySpan)

  const threshold = 0.1

  const direction =
    changePerWeek < -threshold
      ? 'down'
      : changePerWeek > threshold
        ? 'up'
        : 'stable'

  return {
    changePerWeek,
    direction,
    daySpan,
  }
}
