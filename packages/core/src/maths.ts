/**
 * Clamp a value between a minimum and maximum value
 *
 * @param min Minimum value
 * @param input Value to clamp
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(min: number, input: number, max: number) {
  return Math.max(min, Math.min(input, max))
}

/**
 * Truncate a floating-point number to a specified number of decimal places
 *
 * @param value Value to truncate
 * @param decimals Number of decimal places to truncate to
 * @returns Truncated value
 */
export function truncate(value: number, decimals = 0) {
  return parseFloat(value.toFixed(decimals))
}

/**
 *  Linearly interpolate between two values using an amount (0 <= t <= 1)
 *
 * @param x First value
 * @param y Second value
 * @param t Amount to interpolate (0 <= t <= 1)
 * @returns Interpolated value
 */
export function lerp(x: number, y: number, t: number) {
  return (1 - t) * x + t * y
}

/**
 * Damp a value over time using a damping factor
 * {@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}
 *
 * @param x Initial value
 * @param y Target value
 * @param lambda Damping factor
 * @param dt Time elapsed since the last update
 * @returns Damped value
 */
export function damp(x: number, y: number, lambda: number, deltaTime: number) {
  return lerp(x, y, 1 - Math.exp(-lambda * deltaTime))
}

/**
 * Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
 * {@link https://anguscroll.com/just/just-modulo}
 *
 * @param n Dividend
 * @param d Divisor
 * @returns Modulo
 */
export function modulo(n: number, d: number) {
  return ((n % d) + d) % d
}
