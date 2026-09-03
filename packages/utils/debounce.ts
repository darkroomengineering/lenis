/**
 * Trailing debounce: `callback` runs once `delay` ms after the last call.
 * `cancel()` drops a pending call.
 */
export function debounce<CB extends (...args: unknown[]) => void>(
  callback: CB,
  delay: number
): {
  (...args: Parameters<CB>): void
  cancel: () => void
} {
  let timer: ReturnType<typeof setTimeout> | undefined
  const cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }
  function debounced<T>(this: T, ...args: Parameters<CB>): void {
    cancel()
    timer = setTimeout(() => {
      timer = undefined
      callback.apply(this, args)
    }, delay)
  }
  debounced.cancel = cancel
  return debounced
}
