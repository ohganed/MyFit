import { useState } from 'react'

import './App.css'

import HealthPage from './components/HealthPage'
import Header from './components/Header'
import TodayHome from './components/TodayHome'
import HomeDashboard from './components/HomeDashboard'
import SettingsPage from './components/SettingsPage'
import WorkoutForm from './components/WorkoutForm'
import HistoryPage from './components/HistoryPage'
import WorkoutWizardHeader from './components/WorkoutWizardHeader'

import {
  loadWorkoutHistory,
  type WorkoutRecord,
} from './storage/workoutStorage'

import {
  loadExercises,
} from './storage/exerciseStorage'

import {
  completeTodayPlanItem,
} from './storage/dailyPlanStorage'

import type {
  WorkoutTemplate,
} from './storage/workoutTemplateStorage'

type PageName =
  | 'home'
  | 'workout'
  | 'activity'
  | 'history'
  | 'settings'
  | 'health'

const exercises = loadExercises()

function App() {
  const [history, setHistory] = useState<WorkoutRecord[]>(
    () => loadWorkoutHistory(),
  )

  const [currentPage, setCurrentPage] =
    useState<PageName>('home')

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] = useState<WorkoutTemplate | null>(
    null,
  )

  const [
    templateExerciseIndex,
    setTemplateExerciseIndex,
  ] = useState(0)

  const pageTitle = {
    home: 'MyFit',
    workout: 'Movement',
    activity: '運動を記録',
    history: '運動履歴',
    settings: '設定',
    health: '健康習慣',
  }[currentPage]

  const currentTemplateExerciseId =
    selectedTemplate?.exerciseIds[
      templateExerciseIndex
    ]

  const currentTemplateExercise =
    exercises.find(
      (exercise) =>
        exercise.id ===
        currentTemplateExerciseId,
    )

  const handleWorkoutSaved = () => {
    if (!selectedTemplate) {
      completeTodayPlanItem(
        'strength-training',
      )

      setCurrentPage('home')
      return
    }

    const isLastExercise =
      templateExerciseIndex >=
      selectedTemplate.exerciseIds.length - 1

    if (isLastExercise) {
      completeTodayPlanItem(
        'strength-training',
      )

      setSelectedTemplate(null)
      setTemplateExerciseIndex(0)
      setCurrentPage('home')
      return
    }

    setTemplateExerciseIndex(
      (currentIndex) =>
        currentIndex + 1,
    )
  }

  const handleStartFreeWorkout = () => {
    setSelectedTemplate(null)
    setTemplateExerciseIndex(0)
    setCurrentPage('activity')
  }

  return (
    <main className="app">
      {currentPage !== 'home' && currentPage !== 'health' && (
        <Header title={pageTitle} />
      )}

      <div className="page-content">
        {currentPage === 'home' && (
          <TodayHome
            onOpenHealth={() => setCurrentPage('health')}
            history={history}
            onStartWorkout={
              handleStartFreeWorkout
            }
            onOpenMovement={() =>
              setCurrentPage('workout')
            }
          />
        )}

        {currentPage === 'workout' && (
          <HomeDashboard
            history={history}
            onStartWorkout={
              handleStartFreeWorkout
            }
            onStartTemplate={(template) => {
              setSelectedTemplate(template)
              setTemplateExerciseIndex(0)
              setCurrentPage('activity')
            }}
          />
        )}

        {currentPage === 'activity' && (
          <>
            {selectedTemplate &&
              currentTemplateExercise && (
                <WorkoutWizardHeader
                  templateName={
                    selectedTemplate.name
                  }
                  exerciseName={
                    currentTemplateExercise.name
                  }
                  currentIndex={
                    templateExerciseIndex
                  }
                  totalCount={
                    selectedTemplate
                      .exerciseIds.length
                  }
                />
              )}

            <WorkoutForm
              key={
                selectedTemplate
                  ? `${selectedTemplate.id}-${templateExerciseIndex}`
                  : 'free-workout'
              }
              history={history}
              historyCount={history.length}
              onHistoryChange={setHistory}
              onWorkoutSaved={
                handleWorkoutSaved
              }
              initialCategory={
                selectedTemplate?.category
              }
              initialExerciseId={
                currentTemplateExerciseId
              }
            />
          </>
        )}

        {currentPage === 'history' && (
          <HistoryPage
            history={history}
            onHistoryChange={setHistory}
          />
        )}

        {currentPage === 'health' && <HealthPage history={history} onWorkout={handleStartFreeWorkout}/>}

        {currentPage === 'settings' && (
          <SettingsPage />
        )}
      </div>

      <nav
        className="bottom-nav"
        aria-label="メインナビゲーション"
      >
        <button
          className={
            currentPage === 'home'
              ? 'nav-item active'
              : 'nav-item'
          }
          type="button"
          onClick={() => setCurrentPage('home')}
        >
          <span className="nav-icon">⌂</span>
          <span>ホーム</span>
        </button>

        <button
          className={
            currentPage === 'activity'
              ? 'nav-item active'
              : 'nav-item'
          }
          type="button"
          onClick={
            handleStartFreeWorkout
          }
        >
          <span className="nav-icon">＋</span>
          <span>記録</span>
        </button>

        <button
          className={
            currentPage === 'history'
              ? 'nav-item active'
              : 'nav-item'
          }
          type="button"
          onClick={() =>
            setCurrentPage('history')
          }
        >
          <span className="nav-icon">☰</span>
          <span>履歴</span>
        </button>

        <button
          className={
            currentPage === 'settings'
              ? 'nav-item active'
              : 'nav-item'
          }
          type="button"
          onClick={() =>
            setCurrentPage('settings')
          }
        >
          <span className="nav-icon">⚙</span>
          <span>設定</span>
        </button>
      </nav>
    </main>
  )
}

export default App
