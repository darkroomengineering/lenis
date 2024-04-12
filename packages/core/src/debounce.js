export function debounce(callback, delay) {
  let timer
  return function () {
    let args = arguments
    let context = this
    clearTimeout(timer)
    timer = setTimeout(function () {
      callback.apply(context, args)
    }, delay)
  }
}
