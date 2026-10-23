import { useState } from 'react'

import {
  calculatePlanProgress,
  loadTodayPlan,
  saveTodayPlan,
  type DailyPlan,
  type DailyPlanCategory,
} from '../storage/dailyPlanStorage'

type TodayPlanProps = {
  onStartWorkout: () => void
}

const CATEGORY_ICONS: Record<
  DailyPlanCategory,
  string
> = {
  strength: '💪',
  cardio: '🚶',
  mobility: '🧘',
  recovery: '🌿',
}

function TodayPlan({
  onStartWorkout,
}: TodayPlanProps) {
  const [plan, setPlan] =
    useState<DailyPlan>(
      () => loadTodayPlan(),
    )

  const progress =
    calculatePlanProgress(plan)

  const completedCount =
    plan.items.filter(
      (item) => item.completed,
    ).length

  const toggleItem = (
    itemId: string,
  ) => {
    const updatedPlan: DailyPlan = {
      ...plan,

      items: plan.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
            }
          : item,
      ),
    }

    setPlan(updatedPlan)
    saveTodayPlan(updatedPlan)
  }

  return (
    <section className="today-plan-card">
      <div className="today-plan-heading">
        <div>
          <p className="today-plan-eyebrow">
            TODAY'S PLAN
          </p>

          <h2>今日のプラン</h2>
        </div>

        <strong className="today-plan-percent">
          {progress}%
        </strong>
      </div>

      <div
        className="plan-progress-track"
        aria-label={`今日の達成率 ${progress}%`}
      >
        <div
          className="plan-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="plan-progress-text">
        {completedCount} / {plan.items.length}
        件完了
      </p>

      <div className="today-plan-list">
        {plan.items.map((item) => (
          <button
            className={
              item.completed
                ? 'today-plan-item completed'
                : 'today-plan-item'
            }
            type="button"
            key={item.id}
            onClick={() =>
              toggleItem(item.id)
            }
          >
            <span className="plan-category-icon">
              {CATEGORY_ICONS[item.category]}
            </span>

            <span className="plan-item-title">
              {item.title}
            </span>

            <span
              className="plan-check"
              aria-hidden="true"
            >
              {item.completed ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>

      <button
        className="plan-start-button"
        type="button"
        onClick={onStartWorkout}
      >
        ＋ 運動を記録する
      </button>
    </section>
  )
}

export default TodayPlan
