// Clamp a value between a minimum and maximum value
export function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max))
}

// Truncate a floating-point number to a specified number of decimal places
export function truncate(value, decimals = 0) {
  return parseFloat(value.toFixed(decimals))
}

// Linearly interpolate between two values using an amount (0 <= amt <= 1)
export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

// Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
export function clampedModulo(dividend, divisor) {
  const remainder = dividend % divisor

  // If the remainder and divisor have different signs, adjust the remainder
  if ((divisor > 0 && remainder < 0) || (divisor < 0 && remainder > 0)) {
    return remainder + divisor
  }

  return remainder
}
