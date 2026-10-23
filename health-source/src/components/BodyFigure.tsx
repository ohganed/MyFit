import { useState } from 'react'
import { muscles } from '../features/body-explorer/anatomy'
import { frontSurfaceAtlasRegions } from '../features/body-explorer/frontSurfaceAtlas'

import type {
  BodySide,
  MuscleDepth,
  MuscleRole,
} from '../features/body-explorer/anatomy'

type BodyFigureProps = {
  side: Extract<BodySide, 'front' | 'back'>
  depth: Extract<MuscleDepth, 'surface' | 'deep'>
  selectedId?: string | null
  onSelectMuscle: (muscleId: string) => void
  exerciseRoles?: Partial<Record<string, MuscleRole>>
}

type MuscleShapeProps = {
  id: string
  label: string
  selectedId?: string | null
  onSelect: (id: string) => void
  children: React.ReactNode
  exerciseRoles?: Partial<Record<string, MuscleRole>>
}

function MuscleShape({
  id,
  label,
  selectedId,
  onSelect,
  children,
  exerciseRoles,
}: MuscleShapeProps) {
  return (
    <g
      className={[
        'body-figure-muscle',
        selectedId === id ? 'selected' : '',
        exerciseRoles
          ? exerciseRoles[id]
            ? `exercise-${exerciseRoles[id]}`
            : 'exercise-inactive'
          : '',
      ].filter(Boolean).join(' ')}
      data-muscle-id={id}
      aria-pressed={selectedId === id}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault()
          onSelect(id)
        }
      }}
    >
      {children}
    </g>
  )
}

export default function BodyFigure({
  side,
  depth,
  selectedId,
  onSelectMuscle,
  exerciseRoles,
}: BodyFigureProps) {
  const front = side === 'front'
  const [atlasFailed, setAtlasFailed] = useState(false)

  if (front && depth === 'surface' && !atlasFailed) {
    return (
      <div className="body-atlas-panel">
        <div className="body-atlas-heading">
          <span>前面 · 表層</span><span>試験版</span>
        </div>
        <div className="body-figure body-figure-atlas">
          <svg viewBox="0 0 1024 1536" role="group" aria-label="人体筋肉図 前面・表層：選択可能な筋肉">
            <image
              href={`${import.meta.env?.BASE_URL ?? '/'}anatomy/front-surface-atlas-v1.png`}
              width="1024" height="1536" aria-hidden="true"
              onError={() => setAtlasFailed(true)}
            />
            {frontSurfaceAtlasRegions.map(({ id, path }) => (
              <MuscleShape key={id} id={id}
                label={muscles.find(muscle => muscle.id === id)!.nameJa}
                selectedId={selectedId} onSelect={onSelectMuscle} exerciseRoles={exerciseRoles}>
                <path d={path} />
                <path d={path} transform="translate(1024 0) scale(-1 1)" />
              </MuscleShape>
            ))}
          </svg>
        </div>
        <p className="body-atlas-note">
          AI生成画像・選択領域の解剖学的正確さは未検証です。
          選択・色分けは対応済みの{frontSurfaceAtlasRegions.length}筋のみです。未対応の部分は選択できません。
        </p>
      </div>
    )
  }

  return (
    <div className="body-figure">
      {front && depth === 'surface' && atlasFailed && <p role="status">画像を読み込めないため、従来の模式図を表示しています。</p>}
      <svg
        viewBox="0 0 260 560"
        role="img"
        aria-label={
          front
            ? '人体筋肉図 前面'
            : '人体筋肉図 背面'
        }
      >
        {/* Anatomical silhouette: schematic adult proportions */}
        <path
          className="body-figure-silhouette"
          d="
            M130 10
            C112 10 100 25 100 46
            C100 65 110 80 123 84
            L123 91
            C114 90 108 86 102 88
            C88 92 79 104 76 121
            C73 139 73 159 72 180
            L64 252
            Q63 261 69 263
            L79 265
            Q84 263 85 256
            L96 180
            C99 199 101 220 99 241
            C96 256 93 267 92 282
            C91 307 93 339 94 370
            L95 394
            Q97 403 101 408
            C99 428 97 449 96 470
            L91 495
            Q90 502 97 504
            L111 506
            Q116 505 117 498
            L123 455
            C125 431 127 411 129 390
            L130 319
            L131 390
            C133 411 135 431 137 455
            L143 498
            Q144 505 149 506
            L163 504
            Q170 502 169 495
            L164 470
            C163 449 161 428 159 408
            Q163 403 165 394
            L166 370
            C167 339 169 307 168 282
            C167 267 164 256 161 241
            C159 220 161 199 164 180
            L175 256
            Q176 263 181 265
            L191 263
            Q197 261 196 252
            L188 180
            C187 159 187 139 184 121
            C181 104 172 92 158 88
            C152 86 146 90 137 91
            L137 84
            C150 80 160 65 160 46
            C160 25 148 10 130 10
            Z
          "
        />

        {front && depth === 'surface' && (
          <>
            <MuscleShape
              id="anterior-deltoid"
              label="三角筋前部"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M104 94 C94 96 86 104 83 116 C82 128 88 139 96 143 C101 137 104 125 108 115 C111 105 110 98 104 94 Z" />
              <path d="M156 94 C166 96 174 104 177 116 C178 128 172 139 164 143 C159 137 156 125 152 115 C149 105 150 98 156 94 Z" />
            </MuscleShape>

            <MuscleShape
              id="serratus-anterior"
              label="前鋸筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M105 149 L96 156 L103 163 L92 169 L101 177 L91 183 L100 191 L93 200 Q99 207 105 213 L109 165 Z" />
              <path d="M155 149 L164 156 L157 163 L168 169 L159 177 L169 183 L160 191 L167 200 Q161 207 155 213 L151 165 Z" />
            </MuscleShape>

            <MuscleShape
              id="rectus-abdominis"
              label="腹直筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M114 159 Q121 155 127 158 L127 243 Q121 250 116 243 Z" />
              <path d="M133 158 Q139 155 146 159 L144 243 Q139 250 133 243 Z" />
            </MuscleShape>

            <MuscleShape
              id="rectus-femoris"
              label="大腿直筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M113 280 Q121 281 124 295 C125 319 120 349 119 374 Q117 391 112 400 Q106 387 105 368 C104 339 107 307 113 280 Z" />
              <path d="M147 280 Q139 281 136 295 C135 319 140 349 141 374 Q143 391 148 400 Q154 387 155 368 C156 339 153 307 147 280 Z" />
            </MuscleShape>

            {/* 大腿四頭筋：前面・表層の模式図 */}
            <MuscleShape
              id="vastus-lateralis"
              label="外側広筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M102 286 C94 299 92 324 94 349 C94 369 96 385 101 394 Q107 373 108 348 C108 322 108 302 102 286 Z" />
              <path d="M158 286 C166 299 168 324 166 349 C166 369 164 385 159 394 Q153 373 152 348 C152 322 152 302 158 286 Z" />
            </MuscleShape>

            <MuscleShape
              id="vastus-medialis"
              label="内側広筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M125 349 C119 356 116 371 116 385 Q116 398 122 401 Q127 396 128 387 C129 373 128 358 125 349 Z" />
              <path d="M135 349 C141 356 144 371 144 385 Q144 398 138 401 Q133 396 132 387 C131 373 132 358 135 349 Z" />
            </MuscleShape>

            <MuscleShape
              id="tibialis-anterior"
              label="前脛骨筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M103 407 Q111 404 114 415 C115 434 111 457 108 476 L105 490 L100 487 Q101 451 100 430 Q100 414 103 407 Z" />
              <path d="M157 407 Q149 404 146 415 C145 434 149 457 152 476 L155 490 L160 487 Q159 451 160 430 Q160 414 157 407 Z" />
            </MuscleShape>
          </>
        )}

        {!front && depth === 'surface' && (
          <>
            <MuscleShape
              id="posterior-deltoid"
              label="三角筋後部"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <ellipse cx="99" cy="116" rx="17" ry="22" />
              <ellipse cx="161" cy="116" rx="17" ry="22" />
            </MuscleShape>

            <MuscleShape
              id="latissimus-dorsi"
              label="広背筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M101 145 Q130 160 159 145 L151 232 Q130 249 109 232 Z" />
            </MuscleShape>

            <MuscleShape
              id="gluteus-maximus"
              label="大臀筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <ellipse cx="114" cy="273" rx="22" ry="25" />
              <ellipse cx="146" cy="273" rx="22" ry="25" />
            </MuscleShape>

            <MuscleShape
              id="biceps-femoris-long-head"
              label="大腿二頭筋長頭"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M101 301 Q112 291 124 302 L116 398 L99 394 Z" />
              <path d="M159 301 Q148 291 136 302 L144 398 L161 394 Z" />
            </MuscleShape>

            <MuscleShape
              id="gastrocnemius"
              label="腓腹筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <ellipse cx="107" cy="438" rx="14" ry="31" />
              <ellipse cx="153" cy="438" rx="14" ry="31" />
            </MuscleShape>
          </>
        )}

        {front && depth === 'deep' && (
          <>
            <MuscleShape
              id="subscapularis"
              label="肩甲下筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <ellipse cx="104" cy="125" rx="14" ry="19" />
              <ellipse cx="156" cy="125" rx="14" ry="19" />
            </MuscleShape>

            <MuscleShape
              id="transversus-abdominis"
              label="腹横筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M103 174 Q130 160 157 174 L151 230 Q130 242 109 230 Z" />
            </MuscleShape>

            {/* 大腿四頭筋：前面・深層の模式図 */}
            <MuscleShape
              id="vastus-intermedius"
              label="中間広筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M105 292 Q115 280 124 294 L119 390 Q111 400 103 390 Z" />
              <path d="M155 292 Q145 280 136 294 L141 390 Q149 400 157 390 Z" />
            </MuscleShape>

            <MuscleShape
              id="psoas-major"
              label="大腰筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M115 206 Q121 199 126 210 L119 282 L109 286 Z" />
              <path d="M145 206 Q139 199 134 210 L141 282 L151 286 Z" />
            </MuscleShape>
          </>
        )}

        {!front && depth === 'deep' && (
          <>
            <MuscleShape
              id="infraspinatus"
              label="棘下筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <ellipse cx="108" cy="129" rx="17" ry="20" />
              <ellipse cx="152" cy="129" rx="17" ry="20" />
            </MuscleShape>

            <MuscleShape
              id="multifidus"
              label="多裂筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M119 154 L128 149 L125 251 L115 245 Z" />
              <path d="M141 154 L132 149 L135 251 L145 245 Z" />
            </MuscleShape>

            <MuscleShape
              id="piriformis"
              label="梨状筋"
              selectedId={selectedId}
              onSelect={onSelectMuscle}
              exerciseRoles={exerciseRoles}
            >
              <path d="M126 258 L102 272 L105 286 L128 270 Z" />
              <path d="M134 258 L158 272 L155 286 L132 270 Z" />
            </MuscleShape>
          </>
        )}
      </svg>
    </div>
  )
}
