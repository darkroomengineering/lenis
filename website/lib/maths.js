function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max))
}

function mapRange(in_min, in_max, input, out_min, out_max) {
  return ((input - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

function lerp(x, y, t) {
  return (1 - t) * x + t * y
}

function truncate(value, decimals) {
  return parseFloat(value.toFixed(decimals))
}

const Maths = { lerp, clamp, mapRange, truncate }

export { lerp, clamp, mapRange, truncate }
export default Maths
