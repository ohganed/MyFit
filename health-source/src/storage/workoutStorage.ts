export type WorkoutSet = {
  id: string
  weight?: string
  reps?: string
  durationSeconds?: string
  addedWeight?: string
  assistanceWeight?: string
}

export type WorkoutRecord = {
  id: string
  routineName?: string
  exerciseId?: string
  exerciseName: string
  sets: WorkoutSet[]
  savedAt: string
}

export type NewWorkoutRecord = {
  routineName?: string
  exerciseId?: string
  exerciseName: string
  sets: WorkoutSet[]
}

const STORAGE_KEY = 'myfit-workout-history'

function createId(): string {
  return crypto.randomUUID()
}

function normalizeTextValue(
  value: unknown,
): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return undefined
}

function hasRecordedValue(
  set: WorkoutSet,
): boolean {
  return Boolean(
    set.weight ||
      set.reps ||
      set.durationSeconds ||
      set.addedWeight ||
      set.assistanceWeight,
  )
}

function normalizeWorkoutSet(
  value: unknown,
  index: number,
): WorkoutSet | null {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return null
  }

  const set = value as {
    id?: unknown
    weight?: unknown
    reps?: unknown
    durationSeconds?: unknown
    addedWeight?: unknown
    assistanceWeight?: unknown
  }

  const normalizedSet: WorkoutSet = {
    id:
      typeof set.id === 'string'
        ? set.id
        : typeof set.id === 'number'
          ? String(set.id)
          : `migrated-set-${index}-${createId()}`,

    weight: normalizeTextValue(set.weight),
    reps: normalizeTextValue(set.reps),

    durationSeconds: normalizeTextValue(
      set.durationSeconds,
    ),

    addedWeight: normalizeTextValue(
      set.addedWeight,
    ),

    assistanceWeight: normalizeTextValue(
      set.assistanceWeight,
    ),
  }

  if (!hasRecordedValue(normalizedSet)) {
    return null
  }

  return normalizedSet
}

function normalizeWorkoutRecord(
  value: unknown,
): WorkoutRecord | null {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return null
  }

  const record = value as {
    id?: unknown
    routineName?: unknown
    exerciseId?: unknown
    exerciseName?: unknown
    sets?: unknown
    savedAt?: unknown
  }

  if (
    typeof record.exerciseName !== 'string' ||
    record.exerciseName.trim() === '' ||
    !Array.isArray(record.sets) ||
    record.sets.length === 0 ||
    typeof record.savedAt !== 'string'
  ) {
    return null
  }

  const normalizedSets = record.sets
    .map(normalizeWorkoutSet)
    .filter(
      (set): set is WorkoutSet =>
        set !== null,
    )

  if (normalizedSets.length === 0) {
    return null
  }

  return {
    id:
      typeof record.id === 'string'
        ? record.id
        : typeof record.id === 'number'
          ? String(record.id)
          : createId(),

    routineName:
      typeof record.routineName === 'string'
        ? record.routineName
        : undefined,

    exerciseId:
      typeof record.exerciseId === 'string'
        ? record.exerciseId
        : undefined,

    exerciseName: record.exerciseName,
    sets: normalizedSets,
    savedAt: record.savedAt,
  }
}

export function loadWorkoutHistory(): WorkoutRecord[] {
  try {
    const savedData =
      localStorage.getItem(STORAGE_KEY)

    if (!savedData) {
      return []
    }

    const parsedData: unknown =
      JSON.parse(savedData)

    if (!Array.isArray(parsedData)) {
      return []
    }

    const validHistory = parsedData
      .map(normalizeWorkoutRecord)
      .filter(
        (
          record,
        ): record is WorkoutRecord =>
          record !== null,
      )

    // Reading must not rewrite legacy or unrecognized raw records.
    return validHistory
  } catch {
    return []
  }
}

export function saveWorkoutRecord(
  record: NewWorkoutRecord,
): WorkoutRecord[] {
  const currentHistory =
    loadWorkoutHistory()

  const newRecord: WorkoutRecord = {
    ...record,
    id: createId(),
    savedAt: new Date().toISOString(),
  }

  const updatedHistory = [
    newRecord,
    ...currentHistory,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedHistory),
  )

  return updatedHistory
}

export function deleteWorkoutRecord(
  recordId: string,
): WorkoutRecord[] {
  const currentHistory =
    loadWorkoutHistory()

  const updatedHistory =
    currentHistory.filter(
      (record) => record.id !== recordId,
    )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedHistory),
  )

  return updatedHistory
}

export function clearWorkoutHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
