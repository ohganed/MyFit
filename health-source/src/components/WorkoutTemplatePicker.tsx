import {
  loadWorkoutTemplates,
  type WorkoutTemplate,
} from '../storage/workoutTemplateStorage'

type WorkoutTemplatePickerProps = {
  onStartTemplate: (
    template: WorkoutTemplate,
  ) => void
}

const TEMPLATE_ICONS: Record<
  WorkoutTemplate['category'],
  string
> = {
  push: '↗',
  pull: '↙',
  legs: '⬆',
  core: '◉',
}

function WorkoutTemplatePicker({
  onStartTemplate,
}: WorkoutTemplatePickerProps) {
  const templates =
    loadWorkoutTemplates()

  return (
    <section className="home-section">
      <div className="section-heading">
        <div>
          <p className="template-eyebrow">
            WORKOUT TEMPLATES
          </p>

          <h2>今日のトレーニング</h2>
        </div>
      </div>

      <div className="template-grid">
        {templates.map((template) => (
          <button
            className="template-card"
            type="button"
            key={template.id}
            onClick={() =>
              onStartTemplate(template)
            }
          >
            <span className="template-icon">
              {
                TEMPLATE_ICONS[
                  template.category
                ]
              }
            </span>

            <span className="template-card-content">
              <strong>{template.name}</strong>

              <small>
                {template.exerciseIds.length}
                種目
              </small>
            </span>

            <span
              className="template-arrow"
              aria-hidden="true"
            >
              ›
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default WorkoutTemplatePicker
