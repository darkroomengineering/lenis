export function debounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return function <T>(this: T, ...args: Parameters<typeof callback>): void {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}
