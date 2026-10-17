// bun packages/core/src/inertia.check.ts — throws if the iOS release physics drift
import { glide, VelocityTracker } from './inertia'

const near = (a: number, b: number, eps: number, what: string) => {
  if (Math.abs(a - b) > eps) throw new Error(`${what}: ${a} !== ${b}`)
}

// 2000px/s at UIScrollView's normal rate lands (2 - 0.01) / -ln(0.998) px away
const fling = glide(2, 0.998)!
near(fling.distance, 1.99 / -Math.log(0.998), 1e-9, 'distance')
near(fling.duration, Math.log(0.005) / Math.log(0.998) / 1000, 1e-9, 'duration')
near(fling.easing(0), 0, 1e-12, 'easing(0)')
near(fling.easing(1), 1, 1e-12, 'easing(1)')
// the glide leaves at the release velocity (px/ms)
const slope =
  (fling.easing(1e-6) * fling.distance) / (1e-6 * fling.duration * 1000)
near(slope, 2, 1e-4, 'initial velocity')

// cut short by the scroll limit: same launch speed, stops at the limit
const cut = glide(-2, 0.998, 100)!
near(cut.distance, -100, 1e-9, 'room')
near(
  (cut.easing(1e-6) * 100) / (1e-6 * cut.duration * 1000),
  2,
  1e-4,
  'cut velocity'
)
if (glide(2, 0.998, 0) || glide(0.005, 0.998)) throw new Error('no-glide cases')

// a steady 2px/ms finger releases at 2px/ms, at 60Hz and 120Hz alike
for (const dt of [1000 / 60, 1000 / 120]) {
  const tracker = new VelocityTracker()
  tracker.reset(0)
  let t = 0
  for (let i = 0; i < 10; i++) {
    t += dt
    tracker.add(2 * dt, t)
  }
  near(tracker.release(t).velocity, 2, 1e-9, `release @${dt}ms`)
  near(tracker.release(t + 41).velocity, 0, 0, 'stale release')
}

// a single sample only counts 0.2× (no previous sample yet), like UIKit
const one = new VelocityTracker()
one.reset(0)
one.add(20, 10)
near(one.release(10).latest, 0.4, 1e-12, 'first sample weight')

console.log('inertia ok')
