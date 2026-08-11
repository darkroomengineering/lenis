// phase 0: initial state
// phase 1: middle pointerdown // autoscroll started
// phase 2: pointerup // sticky autoscroll continues
// phase 3: pointerup (any button) // autoscroll stops

import { Emitter } from './emitter'

export class AutoScrollDetection {
  private _phase = 0
  private _isEnabled = false
  private readonly emitter = new Emitter()

  constructor(private readonly wrapper: HTMLElement) {
    // native middle-click autoscroll only exists in Blink on Windows.
    // "Chrome" matches all Chromium browsers (Edge/Brave/Opera keep the
    // token) but not Firefox/Safari
    const ua = navigator.userAgent
    if (!(/Windows/.test(ua) && /Chrome/.test(ua))) return

    this.wrapper.addEventListener('pointerdown', this.onPointerDown)
    this.wrapper.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('blur', this.reset)
    window.addEventListener('keydown', this.reset)
  }

  destroy() {
    this.wrapper.removeEventListener('pointerdown', this.onPointerDown)
    this.wrapper.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('blur', this.reset)
    window.removeEventListener('keydown', this.reset)
    this.emitter.destroy()
  }

  private reset = () => {
    this.phase = 0
  }

  private onPointerDown = (event: PointerEvent) => {
    // while sticky autoscroll is active, this click is the exit click —
    // keep phase 2 so its pointerup resolves to phase 3
    if (this.phase === 2) return

    if (event.button !== 1) return

    // middle-click on a link opens a tab, no autoscroll starts
    const isLinkClick = event
      .composedPath()
      .some((target) => target instanceof HTMLElement && target.tagName === 'A')
    if (isLinkClick) return

    this.phase = 1
  }

  private onPointerUp = (event: PointerEvent) => {
    if (this.phase === 1 && event.button === 1) {
      this.phase = 2
    } else if (this.phase === 2) {
      // any button exits sticky autoscroll, not just middle
      this.phase = 3
    }
  }

  private set phase(value: number) {
    if (value === this._phase) return

    this._phase = value

    this.isEnabled = value === 1 || value === 2
  }

  private get phase() {
    return this._phase
  }

  get isEnabled() {
    return this._isEnabled
  }

  private set isEnabled(value: boolean) {
    if (value === this._isEnabled) return

    this._isEnabled = value
    this.emitter.emit('toggle')
  }

  on(event: 'toggle', callback: () => void): () => void {
    return this.emitter.on(event, callback)
  }

  off(event: 'toggle', callback: () => void): void {
    this.emitter.off(event, callback)
  }
}
