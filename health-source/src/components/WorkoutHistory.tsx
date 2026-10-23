import {
  deleteWorkoutRecord,
  type WorkoutRecord,
} from '../storage/workoutStorage'

type WorkoutHistoryProps = {
  history: WorkoutRecord[]
  onHistoryChange: (
    history: WorkoutRecord[],
  ) => void
}

function formatDate(savedAt: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(savedAt))
}

function WorkoutHistory({
  history,
  onHistoryChange,
}: WorkoutHistoryProps) {
  const handleDelete = (
    record: WorkoutRecord,
  ) => {
    const shouldDelete = window.confirm(
      `${record.exerciseName}の記録を削除しますか？`,
    )

    if (!shouldDelete) {
      return
    }

    const updatedHistory =
      deleteWorkoutRecord(record.id)

    onHistoryChange(updatedHistory)
  }

  return (
    <section className="history-section">
      <h2>トレーニング履歴</h2>

      {history.length === 0 ? (
        <p className="empty-history">
          まだ記録がありません
        </p>
      ) : (
        <div className="history-list">
          {history.map((record) => (
            <article
              className="history-card"
              key={record.id}
            >
              <div className="history-card-header">
                <div>
                  <p className="routine-badge">
                    {record.routineName ??
                      '未分類'}
                  </p>

                  <h3>{record.exerciseName}</h3>

                  <time dateTime={record.savedAt}>
                    {formatDate(record.savedAt)}
                  </time>
                </div>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() =>
                    handleDelete(record)
                  }
                >
                  削除
                </button>
              </div>

              <div className="history-sets">
                {record.sets.map(
                  (set, index) => (
                    <div
                      className="history-set-row"
                      key={set.id}
                    >
                      <span>
                        {index + 1}セット目
                      </span>

                      <strong>
                        {set.weight || '―'} kg
                      </strong>

                      <strong>
                        {set.reps || '―'} 回
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default WorkoutHistory
