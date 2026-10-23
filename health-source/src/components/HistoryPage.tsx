import { useState } from 'react'

import BodyExplorer from './BodyExplorer'
import WeightHistory from './WeightHistory'
import WorkoutHistory from './WorkoutHistory'
import WeeklyMuscleMap from './WeeklyMuscleMap'

import type {
  WorkoutRecord,
} from '../storage/workoutStorage'

type HistoryPageProps = {
  history: WorkoutRecord[]
  onHistoryChange: (
    history: WorkoutRecord[],
  ) => void
}

type HistoryTab =
  | 'workout'
  | 'weight'
  | 'muscle'

type MuscleView =
  | 'weekly'
  | 'explore'

function HistoryPage({
  history,
  onHistoryChange,
}: HistoryPageProps) {
  const [tab, setTab] =
    useState<HistoryTab>('workout')

  const [muscleView, setMuscleView] =
    useState<MuscleView>('weekly')

  return (
    <section>
      <div className="history-tabs">
        <button
          type="button"
          className={
            tab === 'workout'
              ? 'history-tab active'
              : 'history-tab'
          }
          onClick={() =>
            setTab('workout')
          }
        >
          運動
        </button>

        <button
          type="button"
          className={
            tab === 'weight'
              ? 'history-tab active'
              : 'history-tab'
          }
          onClick={() =>
            setTab('weight')
          }
        >
          体重
        </button>

        <button
          type="button"
          className={
            tab === 'muscle'
              ? 'history-tab active'
              : 'history-tab'
          }
          onClick={() =>
            setTab('muscle')
          }
        >
          筋肉マップ
        </button>
      </div>

      {tab === 'workout' && (
        <WorkoutHistory
          history={history}
          onHistoryChange={
            onHistoryChange
          }
        />
      )}

      {tab === 'weight' && (
        <WeightHistory />
      )}

      {tab === 'muscle' && (
        <>
          <div className="muscle-view-tabs">
            <button
              type="button"
              className={
                muscleView === 'weekly'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMuscleView('weekly')
              }
            >
              7日間
            </button>

            <button
              type="button"
              className={
                muscleView === 'explore'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMuscleView('explore')
              }
            >
              身体を探索
            </button>
          </div>

          {muscleView === 'weekly' && (
            <WeeklyMuscleMap
              history={history}
            />
          )}

          {muscleView === 'explore' && (
            <BodyExplorer />
          )}
        </>
      )}
    </section>
  )
}

export default HistoryPage
