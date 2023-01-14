export function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max))
}

export function truncate(value, decimals = 0) {
  return parseFloat(value.toFixed(decimals))
}

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function clampedModulo(dividend, divisor) {
  let remainder = dividend % divisor

  if ((divisor > 0 && remainder < 0) || (divisor < 0 && remainder > 0)) {
    remainder += divisor
  }

  return remainder
}
