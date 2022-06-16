export function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max))
}

export function mapRange(in_min, in_max, input, out_min, out_max) {
  return ((input - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function truncate(value, decimals) {
  return parseFloat(value.toFixed(decimals))
}
