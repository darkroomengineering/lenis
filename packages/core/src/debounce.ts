export function debounce<CB extends (...args: unknown[]) => void>(
  callback: CB,
  delay: number
): {
  (...args: Parameters<CB>): void
  cancel: () => void
} {
  let timeout: ReturnType<typeof setTimeout> | undefined
  const cancel = () => {
    clearTimeout(timeout)
    timeout = undefined
  }
  const debounced = function <T>(
    this: T,
    ...args: Parameters<typeof callback>
  ) {
    cancel()
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = undefined
      callback.call(this, ...(args as Parameters<CB>))
    }, delay)
  }
  debounced.cancel = cancel
  return debounced
}
