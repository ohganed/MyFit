import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  fetchWeightRecords,
  type WeightRecord,
  type WeightFetchStatus,
  type WeightTiming,
} from '../api/weightApi'

const TIMINGS: {
  timing: WeightTiming
  icon: string
  label: string
}[] = [
  {
    timing: 'after_waking',
    icon: '🌅',
    label: '起床時',
  },
  {
    timing: 'morning_reset',
    icon: '💧',
    label: '朝のリセット後',
  },
  {
    timing: 'before_breakfast',
    icon: '🍽️',
    label: '朝食前',
  },
]

function isToday(measuredAt: string): boolean {
  const measured = new Date(measuredAt)
  const today = new Date()

  return (
    measured.getFullYear() === today.getFullYear() &&
    measured.getMonth() === today.getMonth() &&
    measured.getDate() === today.getDate()
  )
}

function WeightCard() {
  const [records, setRecords] =
    useState<WeightRecord[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(false)

  const [fetchStatus, setFetchStatus] = useState<WeightFetchStatus | null>(null)

  const [refreshing, setRefreshing] =
    useState(false)

  const loadWeights = useCallback(
    async (background = false) => {
      if (background) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const data = await fetchWeightRecords({ onStatus: setFetchStatus })
        setRecords(data)
        setError(false)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    void loadWeights()

    const timer = window.setInterval(() => {
      void loadWeights(true)
    }, 30_000)

    return () => {
      window.clearInterval(timer)
    }
  }, [loadWeights])

  const todayRecords =
    records.filter((record) =>
      isToday(record.measuredAt),
    )

  const getRecord = (
    timing: WeightTiming,
  ) =>
    todayRecords.find(
      (record) =>
        record.timing === timing,
    )

  const afterWaking =
    getRecord('after_waking')

  const morningReset =
    getRecord('morning_reset')

  const beforeBreakfast =
    getRecord('before_breakfast')

  const baseline =
    morningReset ??
    beforeBreakfast ??
    afterWaking

  const measurementCount =
    TIMINGS.filter(
      ({ timing }) => Boolean(getRecord(timing)),
    ).length

  return (
    <section className="weight-card">
      <div className="weight-card-heading">
        <div>
          <p className="weight-eyebrow">
            TODAY'S WEIGHT
          </p>

          <h2>今日の体重</h2>

          <p className="weight-count">
            {measurementCount} / 3 時間区分を記録
          </p>
        </div>

        <div className="weight-heading-actions">
          {baseline && (
            <strong className="weight-baseline">
              {baseline.weightKg.toFixed(1)}
              <small> kg</small>
            </strong>
          )}

          <button
            type="button"
            className="weight-refresh-button"
            disabled={refreshing}
            onClick={() => {
              void loadWeights(true)
            }}
            aria-label="体重データを更新"
          >
            {refreshing ? '更新中…' : '↻ 更新'}
          </button>
        </div>
      </div>

      {loading && (
        <p className="weight-status">
          読み込み中…
        </p>
      )}

      {error && (
        <p className="weight-status weight-error">
          体重データを取得できません
        </p>
      )}

      {!loading && fetchStatus && !fetchStatus.apiAvailable && !error && (
        <p className="weight-status">体重サーバーに接続できないため、この端末の手入力記録を表示しています。</p>
      )}
      {!loading && fetchStatus && !fetchStatus.manualAvailable && (
        <p className="weight-status weight-error">この端末の生活記録を読み込めません。保存済みデータは変更していません。</p>
      )}

      {!loading && !error && (
        <div className="weight-measurements">
          {TIMINGS.map(
            ({
              timing,
              icon,
              label,
            }) => {
              const record =
                getRecord(timing)

              return (
                <div
                  className="weight-row"
                  key={timing}
                >
                  <span className="weight-icon">
                    {icon}
                  </span>

                  <div className="weight-row-info">
                    <span className="weight-label">
                      {label}
                    </span>

                    {record && (
                      <time className="weight-time">
                        {new Date(
                          record.measuredAt,
                        ).toLocaleTimeString(
                          'ja-JP',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </time>
                    )}
                  </div>

                  <strong>
                    {record
                      ? record.weightKg.toFixed(1)
                      : '--.-'}
                    <small> kg</small>
                  </strong>
                </div>
              )
            },
          )}
        </div>
      )}

      {!loading && !error && todayRecords.some(record => record.timing === null) && (
        <div className="weight-measurements">
          <p className="weight-status">時間区分なしの記録（{todayRecords.filter(record => record.timing === null).length}件）</p>
          {todayRecords.filter(record => record.timing === null).map(record => (
            <div className="weight-row" key={record.id}>
              <span className="weight-icon">⚖️</span>
              <div className="weight-row-info">
                <span className="weight-label">{record.source === 'manual' ? '手入力' : '体重記録'}</span>
                <time className="weight-time" dateTime={record.measuredAt}>{new Date(record.measuredAt).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}</time>
              </div>
              <strong>{record.weightKg.toFixed(1)}<small> kg</small></strong>
            </div>
          ))}
        </div>
      )}

      {baseline && (
        <div className="weight-reference">
          <span>今日の基準体重</span>

          <strong>
            {baseline.weightKg.toFixed(1)}
            <small> kg</small>
          </strong>

          <span>
            {morningReset
              ? '朝のリセット後'
              : beforeBreakfast
                ? '朝食前（暫定）'
                : '起床時（暫定）'}
          </span>
        </div>
      )}
    </section>
  )
}

export default WeightCard
