import { useState } from 'react'

import TodayPlan from './TodayPlan'
import WeightCard from './WeightCard'
import WorkoutTemplatePicker from './WorkoutTemplatePicker'

import type { WorkoutRecord } from '../storage/workoutStorage'
import type { WorkoutTemplate } from '../storage/workoutTemplateStorage'

type HomeDashboardProps = {
  history: WorkoutRecord[]
  onStartWorkout: () => void
  onStartTemplate: (
    template: WorkoutTemplate,
  ) => void
}

function isToday(dateText: string): boolean {
  const savedDate = new Date(dateText)
  const today = new Date()

  return (
    savedDate.getFullYear() ===
      today.getFullYear() &&
    savedDate.getMonth() ===
      today.getMonth() &&
    savedDate.getDate() ===
      today.getDate()
  )
}

function isWithinLastSevenDays(
  dateText: string,
): boolean {
  const savedDate = new Date(dateText)
  const now = new Date()

  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(
    now.getDate() - 6,
  )
  sevenDaysAgo.setHours(0, 0, 0, 0)

  return (
    savedDate >= sevenDaysAgo &&
    savedDate <= now
  )
}

type SummaryView =
  | 'today'
  | 'weekly-exercises'
  | 'weekly-sets'
  | null

function HomeDashboard({
  history,
  onStartWorkout,
  onStartTemplate,
}: HomeDashboardProps) {
  const [summaryView, setSummaryView] =
    useState<SummaryView>(null)

  const todayRecords = history.filter(
    (record) =>
      isToday(record.savedAt),
  )

  const weeklyRecords = history.filter(
    (record) =>
      isWithinLastSevenDays(
        record.savedAt,
      ),
  )

  const weeklySetCount =
    weeklyRecords.reduce(
      (total, record) =>
        total + record.sets.length,
      0,
    )

  const latestRecord = history[0]

  return (
    <section className="home-dashboard">
      <TodayPlan
        onStartWorkout={onStartWorkout}
      />

      <WeightCard />

      <WorkoutTemplatePicker
        onStartTemplate={onStartTemplate}
      />

      <div className="summary-grid">
        <button
          type="button"
          className={
            summaryView === 'today'
              ? 'summary-card active'
              : 'summary-card'
          }
          onClick={() =>
            setSummaryView(
              summaryView === 'today'
                ? null
                : 'today',
            )
          }
        >
          <span className="summary-icon">
            🔥
          </span>
          <span className="summary-value">
            {todayRecords.length}
          </span>
          <span className="summary-label">
            今日の種目
          </span>
        </button>

        <button
          type="button"
          className={
            summaryView === 'weekly-exercises'
              ? 'summary-card active'
              : 'summary-card'
          }
          onClick={() =>
            setSummaryView(
              summaryView === 'weekly-exercises'
                ? null
                : 'weekly-exercises',
            )
          }
        >
          <span className="summary-icon">
            📅
          </span>
          <span className="summary-value">
            {weeklyRecords.length}
          </span>
          <span className="summary-label">
            7日間の種目
          </span>
        </button>

        <button
          type="button"
          className={
            summaryView === 'weekly-sets'
              ? 'summary-card active'
              : 'summary-card'
          }
          onClick={() =>
            setSummaryView(
              summaryView === 'weekly-sets'
                ? null
                : 'weekly-sets',
            )
          }
        >
          <span className="summary-icon">
            💪
          </span>
          <span className="summary-value">
            {weeklySetCount}
          </span>
          <span className="summary-label">
            7日間のセット
          </span>
        </button>
      </div>

      {summaryView && (
        <section className="summary-detail-panel">
          <div className="summary-detail-heading">
            <h2>
              {summaryView === 'today'
                ? '今日の種目'
                : summaryView ===
                    'weekly-exercises'
                  ? '過去7日間の種目'
                  : '過去7日間のセット'}
            </h2>

            <button
              type="button"
              onClick={() =>
                setSummaryView(null)
              }
              aria-label="詳細を閉じる"
            >
              ×
            </button>
          </div>

          <div className="summary-detail-list">
            {(summaryView === 'today'
              ? todayRecords
              : weeklyRecords
            ).length > 0 ? (
              (summaryView === 'today'
                ? todayRecords
                : weeklyRecords
              ).map((record) => (
                <article key={record.id}>
                  <div>
                    <strong>
                      {record.exerciseName}
                    </strong>

                    <span>
                      {record.routineName ??
                        'Activity'}
                    </span>
                  </div>

                  <b>
                    {record.sets.length}
                    <small> セット</small>
                  </b>
                </article>
              ))
            ) : (
              <p className="summary-detail-empty">
                該当する運動記録はありません。
              </p>
            )}
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="section-heading">
          <h2>最近の記録</h2>
        </div>

        {latestRecord ? (
          <article className="latest-record-card">
            <div>
              <span className="routine-badge">
                {latestRecord.routineName ??
                  'Activity'}
              </span>

              <h3>
                {latestRecord.exerciseName}
              </h3>

              <p>
                {latestRecord.sets.length}
                セット
              </p>
            </div>

            <time>
              {new Date(
                latestRecord.savedAt,
              ).toLocaleDateString(
                'ja-JP',
                {
                  month: 'numeric',
                  day: 'numeric',
                },
              )}
            </time>
          </article>
        ) : (
          <div className="empty-home-card">
            <p>まだ記録がありません。</p>

            <p>
              最初の運動を記録してみましょう。
            </p>
          </div>
        )}
      </section>
    </section>
  )
}

export default HomeDashboard
