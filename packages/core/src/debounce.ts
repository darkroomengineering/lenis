export function debounce(
  callback: (...args: unknown[]) => void,
  delay: number
) {
  let timer: number | undefined
  return function () {
    let args = arguments
    // @ts-expect-error - TS doesn't know about the context
    let context = this
    clearTimeout(timer)
    timer = setTimeout(function () {
      // @ts-expect-error - TS doesn't know about the context
      callback.apply(context, args)
    }, delay)
  }
}
