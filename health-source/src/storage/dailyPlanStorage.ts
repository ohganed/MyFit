export type DailyPlanCategory =
  | 'strength'
  | 'cardio'
  | 'mobility'
  | 'recovery'

export type DailyPlanItem = {
  id: string
  title: string
  category: DailyPlanCategory
  completed: boolean
}

export type DailyPlan = {
  date: string
  items: DailyPlanItem[]
}

const STORAGE_KEY = 'myfit-daily-plans'

const DEFAULT_ITEMS: DailyPlanItem[] = [
  {
    id: 'strength-training',
    title: '筋力トレーニング',
    category: 'strength',
    completed: false,
  },
  {
    id: 'walking',
    title: 'ウォーキング',
    category: 'cardio',
    completed: false,
  },
  {
    id: 'stretch',
    title: 'ストレッチ',
    category: 'mobility',
    completed: false,
  },
]

function getLocalDateKey(): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    now.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createDefaultPlan(
  date: string,
): DailyPlan {
  return {
    date,
    items: DEFAULT_ITEMS.map((item) => ({
      ...item,
    })),
  }
}

function loadAllPlans(): DailyPlan[] {
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

    return parsedData.filter(
      (plan): plan is DailyPlan => {
        if (
          typeof plan !== 'object' ||
          plan === null
        ) {
          return false
        }

        const candidate =
          plan as Partial<DailyPlan>

        return (
          typeof candidate.date === 'string' &&
          Array.isArray(candidate.items)
        )
      },
    )
  } catch {
    return []
  }
}

function saveAllPlans(
  plans: DailyPlan[],
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(plans),
  )
}

export function loadTodayPlan(): DailyPlan {
  const today = getLocalDateKey()
  const plans = loadAllPlans()

  const existingPlan = plans.find(
    (plan) => plan.date === today,
  )

  if (existingPlan) {
    return existingPlan
  }

  const newPlan = createDefaultPlan(today)

  saveAllPlans([
    newPlan,
    ...plans,
  ])

  return newPlan
}

export function saveTodayPlan(
  plan: DailyPlan,
): void {
  const plans = loadAllPlans()

  const updatedPlans = [
    plan,
    ...plans.filter(
      (savedPlan) =>
        savedPlan.date !== plan.date,
    ),
  ]

  saveAllPlans(updatedPlans)
}

export function calculatePlanProgress(
  plan: DailyPlan,
): number {
  if (plan.items.length === 0) {
    return 0
  }

  const completedCount =
    plan.items.filter(
      (item) => item.completed,
    ).length

  return Math.round(
    (completedCount / plan.items.length) *
      100,
  )
}

export function completeTodayPlanItem(
  itemId: string,
): DailyPlan {
  const plan = loadTodayPlan()

  const updatedPlan: DailyPlan = {
    ...plan,
    items: plan.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            completed: true,
          }
        : item,
    ),
  }

  saveTodayPlan(updatedPlan)

  return updatedPlan
}
