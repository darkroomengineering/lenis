import Lenis from 'lenis'
import type { LenisOptions } from 'lenis'

// Pick the mode with ?mode=false|true|smooth (default 'smooth') and
// ?syncTouch=1 to smooth touch as well
const params = new URLSearchParams(window.location.search)
const modeParam = params.get('mode') ?? 'smooth'
const allowNestedScroll: LenisOptions['allowNestedScroll'] =
  modeParam === 'smooth' ? 'smooth' : modeParam === 'true'
const syncTouch = params.get('syncTouch') === '1'

for (const list of document.querySelectorAll('.list')) {
  list.innerHTML = Array.from(
    { length: 40 },
    (_, i) => `<div class="item">Item ${i + 1}</div>`
  ).join('')
}

document.querySelector('#table')!.querySelector('table')!.innerHTML =
  Array.from(
    { length: 40 },
    (_, row) =>
      `<tr>${Array.from({ length: 20 }, (_, col) => `<td>${row + 1}:${col + 1}</td>`).join('')}</tr>`
  ).join('')

document.querySelector('.track')!.innerHTML = Array.from(
  { length: 20 },
  (_, i) => `<div class="slide">Slide ${i + 1}</div>`
).join('')

;(document.querySelector('#textarea') as HTMLTextAreaElement).value =
  Array.from({ length: 60 }, (_, i) => `Line ${i + 1}`).join('\n')

for (const link of document.querySelectorAll<HTMLAnchorElement>(
  '#controls a'
)) {
  const url = new URL(link.href)
  if (syncTouch) url.searchParams.set('syncTouch', '1')
  link.href = url.toString()
  link.classList.toggle('active', link.dataset.mode === modeParam)
}

const syncTouchInput = document.querySelector('#sync-touch') as HTMLInputElement
syncTouchInput.checked = syncTouch
syncTouchInput.addEventListener('change', () => {
  const url = new URL(window.location.href)
  if (syncTouchInput.checked) url.searchParams.set('syncTouch', '1')
  else url.searchParams.delete('syncTouch')
  window.location.href = url.toString()
})

const lenis = new Lenis({ autoRaf: true, allowNestedScroll, syncTouch })

// Show which scrollers have their own (adopted) Lenis instance
const status = document.querySelector('#status')!
const ids = ['vertical', 'outer', 'inner', 'table', 'prevented', 'carousel']
setInterval(() => {
  const adopted = ids.filter((id) => {
    const element = document.getElementById(id)
    return element && Lenis.get(element)
  })
  status.textContent = `adopted: ${adopted.join(', ') || 'none'}`
}, 250)

// @ts-expect-error - handy in the console
window.lenisInstance = lenis
