import {
  loadExercises,
  type Exercise,
} from './exerciseStorage'

export type WorkoutTemplate = {
  id: string
  name: string
  category: Exercise['category']
  exerciseIds: string[]
}

const STORAGE_KEY = 'myfit-workout-templates'

const TEMPLATE_NAMES: Record<
  Exercise['category'],
  string
> = {
  push: 'Push Day',
  pull: 'Pull Day',
  legs: 'Legs Day',
  core: 'Core Day',
}

function createDefaultTemplates(): WorkoutTemplate[] {
  const exercises = loadExercises()

  const categories: Exercise['category'][] = [
    'push',
    'pull',
    'legs',
    'core',
  ]

  return categories.map((category) => ({
    id: `${category}-day`,
    name: TEMPLATE_NAMES[category],
    category,
    exerciseIds: exercises
      .filter(
        (exercise) =>
          exercise.category === category,
      )
      .map((exercise) => exercise.id),
  }))
}

function isWorkoutTemplate(
  value: unknown,
): value is WorkoutTemplate {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false
  }

  const candidate =
    value as Partial<WorkoutTemplate>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    (
      candidate.category === 'push' ||
      candidate.category === 'pull' ||
      candidate.category === 'legs' ||
      candidate.category === 'core'
    ) &&
    Array.isArray(candidate.exerciseIds)
  )
}

export function loadWorkoutTemplates():
  WorkoutTemplate[] {
  try {
    const savedData =
      localStorage.getItem(STORAGE_KEY)

    if (!savedData) {
      const defaultTemplates =
        createDefaultTemplates()

      saveWorkoutTemplates(
        defaultTemplates,
      )

      return defaultTemplates
    }

    const parsedData: unknown =
      JSON.parse(savedData)

    if (!Array.isArray(parsedData)) {
      return createDefaultTemplates()
    }

    const templates =
      parsedData.filter(isWorkoutTemplate)

    if (templates.length === 0) {
      return createDefaultTemplates()
    }

    return templates
  } catch {
    return createDefaultTemplates()
  }
}

export function saveWorkoutTemplates(
  templates: WorkoutTemplate[],
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(templates),
  )
}
