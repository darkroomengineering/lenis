let index = 0

export type UID = number

export function uid(): UID {
  return index++
}
