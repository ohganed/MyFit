import type {
  WeightRecord,
} from '../api/weightApi'

import {
  getDailyBaseline,
  getTimingLabel,
} from '../features/weight/weightAnalysis'

type GroupedDay = {
  dateKey: string
  dateLabel: string
  records: WeightRecord[]
}

type WeightHistoryListProps = {
  groupedDays: GroupedDay[]
}

const TIMINGS: WeightRecord['timing'][] = [
  'after_waking',
  'morning_reset',
  'before_breakfast',
]

function WeightHistoryList({
  groupedDays,
}: WeightHistoryListProps) {
  if (groupedDays.length === 0) {
    return (
      <div className="empty-home-card">
        <p>
          まだ体重記録がありません。
        </p>
      </div>
    )
  }

  return (
    <div className="weight-history-list">
      {groupedDays.map((day) => {
        const baseline =
          getDailyBaseline(
            day.records,
          )

        return (
          <article
            className="weight-day-card"
            key={day.dateKey}
          >
            <div className="weight-day-header">
              <div>
                <span className="weight-day-date">
                  {day.dateLabel}
                </span>

                <small>
                  {day.records.length} 件
                </small>
              </div>

              {baseline && (
                <strong>
                  {baseline.weightKg.toFixed(1)}
                  <small> kg</small>
                </strong>
              )}
            </div>

            <div className="weight-day-records">
              {day.records.filter(r => r.timing === null).map(r => <div className="weight-history-row" key={r.id}><span>時間区分なし</span><strong>{r.weightKg.toFixed(1)} kg</strong><time>{new Date(r.measuredAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}</time></div>)}
              {TIMINGS.map((timing) => {
                const record =
                  day.records.find(
                    (item) =>
                      item.timing === timing,
                  )

                return (
                  <div
                    className="weight-history-row"
                    key={timing}
                  >
                    <span>
                      {getTimingLabel(timing)}
                    </span>

                    <strong>
                      {record
                        ? `${record.weightKg.toFixed(1)} kg`
                        : '--.- kg'}
                    </strong>

                    <time>
                      {record
                        ? new Date(
                            record.measuredAt,
                          ).toLocaleTimeString(
                            'ja-JP',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )
                        : '—'}
                    </time>
                  </div>
                )
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default WeightHistoryList
