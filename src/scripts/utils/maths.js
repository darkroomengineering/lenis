export function clamp(min, input, max) {
  return input < min ? min : input > max ? max : input
}

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function truncate(value, decimals) {
  return parseFloat(value.toFixed(decimals))
}
