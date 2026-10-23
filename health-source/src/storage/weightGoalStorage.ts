const GOAL_KEY =
  'myfit-weight-goal'

const START_KEY =
  'myfit-weight-start'

export function loadWeightGoalKg():
  number | null {
  try {
    const saved =
      localStorage.getItem(
        GOAL_KEY,
      )

    if (!saved) {
      return null
    }

    const value =
      Number(saved)

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return null
    }

    return value
  } catch {
    return null
  }
}

export function saveWeightGoalKg(
  weightKg: number,
): void {
  if (
    !Number.isFinite(weightKg) ||
    weightKg <= 0
  ) {
    return
  }

  localStorage.setItem(
    GOAL_KEY,
    String(weightKg),
  )
}

export function loadWeightStartKg():
  number | null {
  try {
    const saved =
      localStorage.getItem(
        START_KEY,
      )

    if (!saved) {
      return null
    }

    const value =
      Number(saved)

    return (
      Number.isFinite(value) &&
      value > 0
        ? value
        : null
    )
  } catch {
    return null
  }
}

export function saveWeightStartKg(
  weightKg: number,
): void {
  if (
    !Number.isFinite(weightKg) ||
    weightKg <= 0
  ) {
    return
  }

  localStorage.setItem(
    START_KEY,
    String(weightKg),
  )
}
