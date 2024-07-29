export function debounce<CB extends (...args: any[]) => void>(
  callback: CB,
  delay: number
) {
  let timer: number | undefined
  return function <T>(this: T, ...args: Parameters<typeof callback>) {
    let context = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      callback.apply(context, args)
    }, delay)
  }
}
