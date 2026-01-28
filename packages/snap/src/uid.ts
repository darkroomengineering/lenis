// SSR-safe UID generation
// Uses a monotonically increasing counter prefixed with a random base to avoid hydration mismatches
let index = 0
const base =
  typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
    ? crypto.getRandomValues(new Uint32Array(1))[0] ?? 0
    : Math.floor(Math.random() * 0xffffffff)

export type UID = number

export function uid(): UID {
  return base + index++
}
