export function debounce<CB extends (...args: any[]) => void>(
  callback: CB,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return function <T>(this: T, ...args: Parameters<typeof callback>): void {
    let context = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      callback.apply(context, args)
    }, delay)
  }
}
