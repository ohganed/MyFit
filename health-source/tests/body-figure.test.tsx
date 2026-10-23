import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import BodyFigure from '../src/components/BodyFigure'
import { muscles } from '../src/features/body-explorer/anatomy'

const base = { side: 'front' as const, depth: 'surface' as const, onSelectMuscle: () => {} }
test('front surface renders an atlas with an explicit unverified notice', () => {
  const html = renderToStaticMarkup(<BodyFigure {...base} />)
  assert.match(html, /<image[^>]+href="[^"]*front-surface/)
  assert.match(html, /解剖学的正確さは未検証/)
})
test('atlas preserves all existing front targets and resolves every target to the muscle catalog', () => {
  const html = renderToStaticMarkup(<BodyFigure {...base} />)
  const ids = [...html.matchAll(/data-muscle-id="([^"]+)"/g)].map(m => m[1])
  for (const id of ['anterior-deltoid','serratus-anterior','rectus-abdominis','rectus-femoris','vastus-lateralis','vastus-medialis','tibialis-anterior']) assert.ok(ids.includes(id), id)
  for (const id of ids) assert.ok(muscles.some(m => m.id === id), id)
  assert.equal(new Set(ids).size, ids.length)
})
test('exercise roles and selection coexist on the same muscle', () => {
  const html = renderToStaticMarkup(<BodyFigure {...base} selectedId="vastus-lateralis" exerciseRoles={{'vastus-lateralis':'prime-mover', 'rectus-abdominis':'stabilizer'}} />)
  assert.match(html, /class="[^"]*selected[^"]*exercise-prime-mover/)
  assert.match(html, /exercise-stabilizer/)
  assert.match(html, /exercise-inactive/)
})
test('back and deep views retain their existing targets without the anterior image', () => {
  for (const [side, depth, label] of [['back','surface','広背筋'],['front','deep','中間広筋'],['back','deep','棘下筋']] as const) {
    const html = renderToStaticMarkup(<BodyFigure {...base} side={side} depth={depth} />)
    assert.ok(html.includes(label))
    assert.doesNotMatch(html, /front-surface/)
  }
})

test('chest and forearm targets resolve to selectable catalog muscles', () => {
  const html = renderToStaticMarkup(<BodyFigure {...base} />)
  for (const id of ['pectoralis-major', 'brachioradialis', 'flexor-carpi-radialis']) {
    assert.ok(muscles.some(m => m.id === id && m.visibleFrom.includes('front')), id)
    assert.ok(html.includes(`data-muscle-id="${id}"`), id)
  }
})

test('push-up variants highlight the registered chest muscle without changing squat roles', async () => {
  const { bodyweightExercises } = await import('../src/features/body-explorer/exerciseMap')
  for (const id of ['push-up', 'wall-push-up']) {
    const exercise = bodyweightExercises.find(e => e.id === id)!
    assert.deepEqual(exercise.muscleLinks.find(m => m.muscleId === 'pectoralis-major'), {muscleId:'pectoralis-major',role:'prime-mover'})
    const html = renderToStaticMarkup(<BodyFigure {...base} exerciseRoles={Object.fromEntries(exercise.muscleLinks.map(m => [m.muscleId,m.role]))} />)
    assert.match(html, /class="[^"]*exercise-prime-mover" data-muscle-id="pectoralis-major"/)
  }
  assert.ok(!bodyweightExercises.find(e => e.id === 'squat')!.muscleLinks.some(m => m.muscleId === 'pectoralis-major'))
})
