export class VirtualScroll {
  #event = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
  }

  #el = window

  #onScroll = (event) => {
    const { x, y } = this.#event
    const deltaX = event.deltaX
    const deltaY = event.deltaY

    this.#event = {
      x: x + deltaX,
      y: y + deltaY,
      deltaX,
      deltaY,
    }

    this.emit('scroll', this.#event)
  }

  constructor(el) {
    if (el) {
      this.#el = el
    }

    this.#el.addEventListener('scroll', this.#onScroll)
  }

  on(event, listener) {
    this.#el.addEventListener(event, listener)
  }

  off(event, listener) {
    this.#el.removeEventListener(event, listener)
  }

  emit(event, data) {
    const customEvent = new CustomEvent(event, { detail: data })
    this.#el.dispatchEvent(customEvent)
  }
}
