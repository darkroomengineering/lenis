export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function truncate(value, decimals) {
  return parseFloat(value.toFixed(decimals))
}
