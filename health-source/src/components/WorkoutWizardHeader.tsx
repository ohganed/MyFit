type WorkoutWizardHeaderProps = {
  templateName: string
  exerciseName: string
  currentIndex: number
  totalCount: number
}

function WorkoutWizardHeader({
  templateName,
  exerciseName,
  currentIndex,
  totalCount,
}: WorkoutWizardHeaderProps) {
  const currentNumber = currentIndex + 1

  const progress =
    totalCount === 0
      ? 0
      : Math.round(
          (currentNumber / totalCount) * 100,
        )

  return (
    <section className="wizard-header">
      <div className="wizard-heading">
        <div>
          <p className="wizard-eyebrow">
            TODAY'S SESSION
          </p>

          <h2>{templateName}</h2>
        </div>

        <strong className="wizard-count">
          {currentNumber} / {totalCount}
        </strong>
      </div>

      <div className="wizard-progress-track">
        <div
          className="wizard-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="wizard-current-exercise">
        <span>現在の種目</span>
        <strong>{exerciseName}</strong>
      </div>
    </section>
  )
}

export default WorkoutWizardHeader
