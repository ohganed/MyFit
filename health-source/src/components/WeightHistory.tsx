import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import WeightMorningAnalysis from './WeightMorningAnalysis'
import WeightTrendSection from './WeightTrendSection'
import WeightAverageSection from './WeightAverageSection'
import WeightHistoryList from './WeightHistoryList'
import WeightGoalCard from './WeightGoalCard'

import {
  getDateKey,
  createMovingAverageData,
  calculateMovingAverageTrend,
  calculateWeeklyWeightTrend,
  calculatePeriodAverage,
  createTimingTrendData,
  createBaselineTrendData,
  groupWeightRecordsByDay,
  calculateDailyWeightComparison,
  calculateMorningDifferences,
  calculateMorningRange,
} from '../features/weight/weightAnalysis'

import {
  fetchWeightRecords,
  type WeightRecord,
} from '../api/weightApi'

function WeightHistory() {
  const [offline, setOffline] = useState(false)
  const [trendDays, setTrendDays] =
    useState<7 | 30>(7)

  const [records, setRecords] =
    useState<WeightRecord[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(false)

  useEffect(() => {
    fetchWeightRecords({onStatus:s=>setOffline(!s.apiAvailable)})
      .then((data) => {
        setRecords(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const groupedDays = useMemo(
    () =>
      groupWeightRecordsByDay(
        records,
      ),
    [records],
  )

  const timingTrendData = useMemo(
    () =>
      createTimingTrendData(
        records,
        trendDays,
      ),
    [records, trendDays],
  )

  const trendData = useMemo(
    () =>
      createBaselineTrendData(
        records,
        trendDays,
      ),
    [records, trendDays],
  )

  const movingAverageData = useMemo(
    () =>
      createMovingAverageData(
        records,
        7,
      ),
    [records],
  )

  const movingAverageTrend = useMemo(
    () =>
      calculateMovingAverageTrend(
        movingAverageData,
      ),
    [movingAverageData],
  )

  const weeklyWeightTrend = useMemo(
    () =>
      calculateWeeklyWeightTrend(
        movingAverageData,
      ),
    [movingAverageData],
  )

  const sevenDayStats = useMemo(
    () =>
      calculatePeriodAverage(
        records,
        7,
      ),
    [records],
  )

  const dailyComparison = useMemo(
    () =>
      calculateDailyWeightComparison(
        records,
        sevenDayStats.average,
      ),
    [records, sevenDayStats.average],
  )

  const {
    todayBaseline,
    differenceFromYesterday,
    differenceFromAverage,
  } = dailyComparison

  const todayRecords = useMemo(() => {
    const todayKey =
      getDateKey(
        new Date().toISOString(),
      )

    return records.filter(
      (record) =>
        getDateKey(
          record.measuredAt,
        ) === todayKey,
    )
  }, [records])

  const todayMeasurementDifferences =
    useMemo(
      () =>
        calculateMorningDifferences(
          todayRecords,
        ),
      [todayRecords],
    )

  const todayMorningStats = useMemo(
    () =>
      calculateMorningRange(
        todayRecords,
      ),
    [todayRecords],
  )

  if (loading) {
    return (
      <section className="weight-history-page">
        <p>
          体重履歴を読み込み中…
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="weight-history-page">
        <p className="weight-error">
          体重履歴を取得できません
        </p>
      </section>
    )
  }

  return (
    <section className="weight-history-page">
      <div className="page-heading">
        <p className="page-eyebrow">
          WEIGHT HISTORY
        </p>

        <h2>体重履歴</h2>
        {offline && <p role="status">体重サーバー未接続：端末内の手入力記録のみ表示しています。</p>}

        <p>
          朝の3回測定を日ごとに確認します。
        </p>
      </div>

      <WeightGoalCard
        weeklyWeightTrend={
          weeklyWeightTrend
        }
      />

      {todayBaseline && (
        <WeightMorningAnalysis
          baselineKg={
            todayBaseline.weightKg
          }
          differenceFromYesterday={
            differenceFromYesterday
          }
          stats={
            todayMorningStats
          }
          differences={
            todayMeasurementDifferences
          }
        />
      )}

      <WeightTrendSection
        trendDays={trendDays}
        onTrendDaysChange={
          setTrendDays
        }
        trendData={trendData}
        movingAverageData={
          movingAverageData
        }
        timingTrendData={
          timingTrendData
        }
      />

      <WeightAverageSection
        sevenDayStats={
          sevenDayStats
        }
        movingAverageTrend={
          movingAverageTrend
        }
        weeklyWeightTrend={
          weeklyWeightTrend
        }
        differenceFromAverage={
          differenceFromAverage
        }
      />

      <WeightHistoryList
        groupedDays={groupedDays}
      />
    </section>
  )
}

export default WeightHistory
