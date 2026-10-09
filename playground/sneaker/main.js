// KODO Pulse 01: a concept sneaker drop. Lenis drives the scroll, and every
// scroll-linked effect below reads lenis.scroll inside one RAF loop.

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const lerp = (a, b, t) => a + (b - a) * t
const range = (value, start, end) => clamp((value - start) / (end - start))
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const easeOut = (t) => 1 - (1 - t) ** 3
const pad = (n) => String(n).padStart(2, '0')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

/* ------------------------------------------------------------------ data */

const COLORWAYS = [
  {
    id: 'volt',
    name: 'Volt Rush',
    tag: 'Night intervals',
    bg: '#17181b',
    glow: '#d4ff3a',
    upper: '#1d1e22',
    overlay: '#2c2e34',
    accent: '#d4ff3a',
    mid: '#f2efe9',
    'mid-shade': '#cfc9bd',
    out: '#101012',
    lace: '#f2efe9',
    lining: '#d4ff3a',
    air: 'rgba(212,255,58,.55)',
  },
  {
    id: 'ember',
    name: 'Ember',
    tag: 'Tempo days',
    bg: '#2a120c',
    glow: '#ff5a36',
    upper: '#e8492b',
    overlay: '#c43a1f',
    accent: '#1b1c1f',
    mid: '#f6eee2',
    'mid-shade': '#dccfbd',
    out: '#2b1a14',
    lace: '#fff7ee',
    lining: '#1b1c1f',
    air: 'rgba(255,90,54,.45)',
  },
  {
    id: 'glacier',
    name: 'Glacier',
    tag: 'Cold starts',
    bg: '#0e1828',
    glow: '#6aa0ff',
    upper: '#e4ebf3',
    overlay: '#bccbdc',
    accent: '#3b6fff',
    mid: '#ffffff',
    'mid-shade': '#c9d4e2',
    out: '#7f93aa',
    lace: '#ffffff',
    lining: '#3b6fff',
    air: 'rgba(59,111,255,.4)',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    tag: 'Long weekends',
    bg: '#28121c',
    glow: '#ff8fb1',
    upper: '#f6c8d5',
    overlay: '#ea9db3',
    accent: '#7a1f3d',
    mid: '#fff6f0',
    'mid-shade': '#ead6cc',
    out: '#7a1f3d',
    lace: '#ffffff',
    lining: '#7a1f3d',
    air: 'rgba(255,143,177,.5)',
  },
  {
    id: 'moss',
    name: 'Moss',
    tag: 'Trail-curious',
    bg: '#121810',
    glow: '#d9bd72',
    upper: '#4b5a3d',
    overlay: '#36432b',
    accent: '#e6c27a',
    mid: '#ebe4d1',
    'mid-shade': '#cfc6ae',
    out: '#3a2f22',
    lace: '#ebe4d1',
    lining: '#e6c27a',
    air: 'rgba(230,194,122,.5)',
  },
]

const SHOE_KEYS = [
  'glow',
  'upper',
  'overlay',
  'accent',
  'mid',
  'mid-shade',
  'out',
  'lace',
  'lining',
  'air',
]

const SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14]
const SOLD_OUT = new Set([7.5, 10.5, 14])
const DROP_DATE = new Date('2026-11-14T10:00:00')

/* -------------------------------------------------------------- sneaker */

// Eyelets sit along the lace line from (312,92) to (470,168), nudged into the eyestay
const EYELETS = [
  [327, 109],
  [355.5, 122.9],
  [383.9, 136.6],
  [412.4, 150.3],
  [440.8, 163.9],
]

function sneakerSVG({
  label = 'KODO Pulse 01 sneaker, side view',
  exploded = false,
} = {}) {
  const viewBox = exploded ? '30 -50 600 430' : '30 40 600 240'
  const eyelets = EYELETS.map(
    ([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6"/>`
  ).join('')
  const laces = EYELETS.map(([x, y]) => `<path d="M${x} ${y} l12 -19"/>`).join(
    ''
  )

  return `<svg class="sneaker${exploded ? ' sneaker--exploded' : ''}" viewBox="${viewBox}" role="img" aria-label="${label}">
    <g data-layer="upper">
      <path fill="var(--s-upper)" d="M62 196C48 160 46 122 64 94C70 86 82 82 96 86C118 94 132 108 152 114C184 122 214 114 236 96L262 58C276 52 296 56 302 70L456 150C490 168 560 186 600 220C608 230 602 238 590 236L400 222C300 218 210 210 150 202Z"/>
      <path fill="#fff" fill-opacity=".06" d="M70 120C140 132 220 128 290 104L300 114C230 142 140 148 72 140Z"/>
      <path fill="var(--s-overlay)" d="M62 196C48 160 46 122 64 94C70 86 82 82 96 86C92 120 100 160 124 200Z"/>
      <path fill="var(--s-overlay)" d="M486 168C540 186 580 200 600 220C608 230 602 238 590 236L520 230C500 214 488 192 486 168Z"/>
      <path fill="var(--s-overlay)" d="M312 92L470 168L462 184L304 108Z"/>
      <path fill="var(--s-accent)" d="M96 172C170 140 236 184 316 160C356 148 392 152 424 176L418 188C388 166 356 164 320 174C238 200 176 162 102 190Z"/>
      <path fill="none" stroke="var(--s-lining)" stroke-width="9" stroke-linecap="round" d="M70 92C88 84 110 96 130 106C160 120 200 120 232 100"/>
      <path fill="var(--s-accent)" d="M58 100L50 70C49 64 54 61 59 63L78 90Z"/>
      <rect fill="var(--s-accent)" x="268" y="64" width="22" height="11" rx="2" transform="rotate(18 279 70)"/>
      <path fill="none" stroke="var(--s-lace)" stroke-opacity=".35" stroke-width="1.4" stroke-dasharray="4 5" d="M80 186C200 200 380 212 584 226M490 176C498 198 508 216 522 226"/>
      <g fill="var(--s-lining)">${eyelets}</g>
    </g>
    <g data-layer="laces" fill="none" stroke="var(--s-lace)" stroke-linecap="round">
      <g stroke-width="7">${laces}</g>
      <path stroke-width="4" d="M333 99C318 124 310 146 318 168"/>
      <path stroke-width="4" d="M339 96C338 126 346 150 360 166"/>
      <path stroke="var(--s-out)" stroke-width="5" d="M318 168l1 8M360 166l5 6"/>
    </g>
    <g data-layer="midsole">
      <path fill="var(--s-mid)" d="M58 192C44 198 38 236 48 248C52 254 56 256 62 256L560 256C586 256 604 246 608 234C600 228 584 226 560 226L400 222C300 218 210 210 150 202Z"/>
      <rect x="86" y="214" width="98" height="28" rx="14" fill="var(--s-air)"/>
      <path fill="none" stroke="var(--s-mid-shade)" stroke-width="3" d="M106 218v20M126 218v20M146 218v20M166 218v20"/>
      <path fill="none" stroke="var(--s-mid-shade)" stroke-width="2" d="M200 238C300 244 420 246 592 240"/>
    </g>
    <g data-layer="outsole">
      <path fill="var(--s-out)" d="M48 246C42 258 46 270 62 270L560 270C592 270 612 256 618 236L606 234C600 248 584 256 560 256L62 256C56 256 50 252 48 246Z"/>
      <path fill="none" stroke="var(--s-mid-shade)" stroke-opacity=".25" stroke-width="3" stroke-dasharray="12 9" d="M72 264H556"/>
    </g>
  </svg>`
}

function paint(el, colorway) {
  for (const key of SHOE_KEYS) el.style.setProperty(`--s-${key}`, colorway[key])
}

/* ------------------------------------------------------------ build DOM */

const track = $('[data-cw-track]')
track.insertAdjacentHTML(
  'beforeend',
  COLORWAYS.map(
    (cw, i) => `
    <article class="cw" style="--cw-bg:${cw.bg}">
      <span class="cw__big" aria-hidden="true">${cw.name.split(' ')[0]}</span>
      <div class="cw__shoe"><div data-shoe="Pulse 01 in ${cw.name}"></div></div>
      <div class="cw__info">
        <div>
          <p class="cw__index">${pad(i + 1)} / ${pad(COLORWAYS.length)}</p>
          <h3>${cw.name}</h3>
          <p class="cw__tag">${cw.tag}</p>
        </div>
        <button class="cw__select" type="button" data-select="${cw.id}" aria-pressed="false">Select</button>
      </div>
    </article>`
  ).join('')
)
$$('.cw').forEach((card, i) => {
  paint(card, COLORWAYS[i])
})

for (const el of $$('[data-shoe]')) {
  el.innerHTML = sneakerSVG({ label: el.dataset.shoe || undefined })
}
$('[data-shoe-exploded]').innerHTML = sneakerSVG({
  exploded: true,
  label: 'Exploded view of the Pulse 01: laces, upper, midsole and outsole',
})

$('[data-swatches]').innerHTML = COLORWAYS.map(
  (cw) => `
  <label class="swatch" style="--a:${cw.upper};--b:${cw.glow}" title="${cw.name}">
    <input type="radio" name="colorway" value="${cw.id}" /><span class="sr">${cw.name}</span>
  </label>`
).join('')

$('[data-sizes]').innerHTML = SIZES.map(
  (size) => `
  <label class="size">
    <input type="radio" name="size" value="${size}" ${SOLD_OUT.has(size) ? 'disabled' : ''} />
    <span>${size}${SOLD_OUT.has(size) ? '<span class="sr"> (sold out)</span>' : ''}</span>
  </label>`
).join('')

const statementText = $('[data-words]')
statementText.innerHTML = statementText.textContent
  .trim()
  .split(/\s+/)
  .map(
    (word) =>
      `<span class="w${/\d/.test(word) ? ' w--hot' : ''}">${word}</span>`
  )
  .join(' ')

const marquees = $$('[data-marquee]').map((el, i) => {
  el.innerHTML = `<span>${el.dataset.marquee}</span>`.repeat(8)
  return { el, x: 0, half: 0, skew: 0, dir: i % 2 === 0 ? 1 : -1 }
})

/* ---------------------------------------------------------------- lenis */

if (!location.hash) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}

const lenis = new Lenis({ lerp: 0.085, anchors: true })
window.lenis = lenis // handy for poking at it from devtools

/* ------------------------------------------------------------- elements */

const nav = $('.nav')
const progressBar = $('.progress span')
const hero = $('.hero')
const heroTilt = $('.hero__tilt')
const anatomy = $('.anatomy')
const exploded = $('.sneaker--exploded')
const layers = Object.fromEntries(
  $$('g[data-layer]', exploded).map((g) => [g.dataset.layer, g])
)
const anatomyItems = $$('.anatomy__list li')
const anatomyStep = $('[data-anatomy-step]')
const colorways = $('.colorways')
const cwBar = $('.colorways__bar span')
const cwIndex = $('[data-cw-index]')
const statement = $('.statement')
const words = $$('.w', statementText)
const shop = $('.shop')
const shopShoe = $('.shop__shoe')
const shopRing = $('.shop__ring')
const footer = $('.footer')
const footLetters = $$('.footer__brand span')

/* -------------------------------------------------------------- measure */

let vw = 0
let vh = 0
let travel = 0
let cards = []
let needsRender = true
const boxes = new Map()

function measure() {
  vw = document.documentElement.clientWidth
  vh = window.innerHeight

  // horizontal distance the colorways track has to travel while pinned
  const last = track.lastElementChild
  const trackEnd =
    last.offsetLeft +
    last.offsetWidth +
    Number.parseFloat(getComputedStyle(track).paddingRight)
  travel = Math.max(0, trackEnd - vw)
  colorways.style.setProperty('--travel', `${travel}px`)

  const scrollY = window.scrollY
  for (const el of [anatomy, colorways, statement, shop, footer]) {
    const rect = el.getBoundingClientRect()
    boxes.set(el, { top: rect.top + scrollY, height: rect.height })
  }

  cards = $$('.cw').map((card) => ({
    card,
    shoe: $('.cw__shoe', card),
    left: card.offsetLeft,
    width: card.offsetWidth,
  }))

  for (const m of marquees) m.half = m.el.scrollWidth / 2

  lenis.resize()
  needsRender = true
}

// 0 when the pinned section reaches the top of the viewport, 1 when it unpins
function pinProgress(el, y) {
  const { top, height } = boxes.get(el)
  return clamp((y - top) / Math.max(1, height - vh))
}

// 0 when the element enters at the bottom, 1 when it leaves at the top
function passProgress(el, y) {
  const { top, height } = boxes.get(el)
  return clamp((y + vh - top) / (height + vh))
}

/* --------------------------------------------------------------- render */

let lastY = -1
let lastTime = 0
let currentStep = -2
let currentCard = -1
const wordOpacity = []
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

function renderScroll(y) {
  progressBar.style.transform = `scaleX(${lenis.progress})`
  nav.classList.toggle('is-hidden', y > vh * 0.6 && lenis.direction === 1)

  // hero: CSS turns --hp into the parallax, see .hero__* rules
  if (y < vh * 1.5) hero.style.setProperty('--hp', clamp(y / vh).toFixed(4))

  // anatomy: explode the layers, walk through them, then snap back together
  const ap = pinProgress(anatomy, y)
  const explode =
    easeInOut(range(ap, 0.02, 0.26)) * (1 - easeInOut(range(ap, 0.88, 1)))
  layers.laces.style.transform = `translate(0px, ${-120 * explode}px)`
  layers.upper.style.transform = `translate(0px, ${-50 * explode}px)`
  layers.midsole.style.transform = `translate(0px, ${30 * explode}px)`
  layers.outsole.style.transform = `translate(0px, ${95 * explode}px)`
  exploded.style.transform = `rotate(${lerp(-6, 3, ap)}deg)`

  const done = ap >= 0.88
  const step =
    ap < 0.26 || done ? -1 : Math.min(3, Math.floor(range(ap, 0.26, 0.88) * 4))
  if (step !== currentStep) {
    currentStep = step
    anatomyItems.forEach((li, i) => {
      li.classList.toggle('is-active', i === step || done)
      layers[li.dataset.layer].classList.toggle('is-focus', i === step)
    })
    exploded.classList.toggle('has-focus', step >= 0)
    anatomyStep.textContent = done ? '04' : pad(step + 1)
  }

  // colorways: vertical scroll becomes horizontal travel
  const cp = pinProgress(colorways, y)
  const x = -cp * travel
  track.style.transform = `translate3d(${x}px, 0, 0)`
  cwBar.style.transform = `scaleX(${cp})`
  let nearest = 0
  let nearestDistance = Number.POSITIVE_INFINITY
  cards.forEach((c, i) => {
    const offset = (c.left + x + c.width / 2 - vw / 2) / vw // 0 = centered
    c.shoe.style.transform = `translate3d(${offset * -22}%, 0, 0) rotate(${-8 - offset * 14}deg)`
    if (Math.abs(offset) < nearestDistance) {
      nearestDistance = Math.abs(offset)
      nearest = i
    }
  })
  if (nearest !== currentCard) {
    currentCard = nearest
    cwIndex.textContent = pad(nearest + 1)
  }

  // statement: light the words up one by one while pinned
  const lit = range(pinProgress(statement, y), 0.05, 0.8) * words.length
  words.forEach((word, i) => {
    const opacity = (0.14 + 0.86 * clamp(lit - i)).toFixed(3)
    if (wordOpacity[i] !== opacity) {
      wordOpacity[i] = opacity
      word.style.opacity = opacity
    }
  })

  // shop: shoe drifts and turns as the section passes
  const sp = passProgress(shop, y)
  shopShoe.style.transform = `translate3d(0, ${(0.5 - sp) * 36}%, 0) rotate(${-18 + sp * 22}deg)`
  shopRing.style.transform = `rotate(${y * 0.06}deg)`

  // footer: brand letters rise in a stagger
  const { top, height } = boxes.get(footer)
  const fp = clamp((y + vh - top) / height)
  footLetters.forEach((letter, i) => {
    const t = easeOut(range(fp, 0.15 + i * 0.07, 0.75 + i * 0.07))
    letter.style.transform = `translate3d(0, ${(1 - t) * 70}%, 0)`
  })
}

function frame(time) {
  lenis.raf(time)

  const dt = Math.min(64, time - (lastTime || time))
  lastTime = time
  const motion = !reducedMotion.matches

  // marquees drift on their own and get shoved along by scroll velocity
  for (const m of marquees) {
    if (!m.half) continue
    if (motion) {
      const direction = (lenis.direction || 1) * m.dir
      m.x -= direction * (0.05 * dt + Math.abs(lenis.velocity) * 0.6)
      m.x = ((m.x % m.half) - m.half) % m.half
    }
    m.skew = lerp(
      m.skew,
      motion ? clamp(lenis.velocity * -0.3, -10, 10) : 0,
      0.12
    )
    m.el.style.transform = `translate3d(${m.x}px, 0, 0) skewX(${m.skew.toFixed(2)}deg)`
  }

  // hero shoe leans toward the mouse
  if (motion) {
    pointer.x = lerp(pointer.x, pointer.tx, 0.06)
    pointer.y = lerp(pointer.y, pointer.ty, 0.06)
    heroTilt.style.transform = `translate3d(${pointer.x * 36}px, ${pointer.y * 24}px, 0) rotate(${pointer.x * 6}deg)`
  }

  const y = lenis.scroll
  if (y !== lastY || needsRender) {
    lastY = y
    needsRender = false
    renderScroll(y)
  }

  requestAnimationFrame(frame)
}

/* ---------------------------------------------------------- interaction */

hero.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return
  pointer.tx = e.clientX / vw - 0.5
  pointer.ty = e.clientY / vh - 0.5
})
hero.addEventListener('pointerleave', () => {
  pointer.tx = 0
  pointer.ty = 0
})

// Lenis smooth-scrolls in-page anchors; also move focus so keyboard users land there
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]')
  const target = link && document.getElementById(link.hash.slice(1))
  if (target) target.focus({ preventScroll: true })
})

// keep keyboard focus visible inside the pinned horizontal track
track.addEventListener('focusin', (e) => {
  const c = cards.find(({ card }) => card.contains(e.target))
  if (!(c && travel)) return
  const { top, height } = boxes.get(colorways)
  const targetX = clamp(c.left - (vw - c.width) / 2, 0, travel)
  lenis.scrollTo(top + (targetX / travel) * (height - vh), { duration: 0.8 })
})

const toastEl = $('.toast')
let toastTimer
function toast(message) {
  toastEl.textContent = message
  toastEl.classList.add('is-visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600)
}

let current = COLORWAYS[0]
function selectColorway(id, announce = true) {
  current = COLORWAYS.find((cw) => cw.id === id) ?? COLORWAYS[0]
  paint(document.documentElement, current)
  for (const btn of $$('[data-select]')) {
    const on = btn.dataset.select === current.id
    btn.setAttribute('aria-pressed', String(on))
    btn.textContent = on ? 'Selected' : 'Select'
  }
  for (const input of $$('input[name="colorway"]')) {
    input.checked = input.value === current.id
  }
  for (const el of $$('[data-cw-name]')) el.textContent = current.name
  if (announce) toast(`Colorway set: ${current.name}`)
}

track.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-select]')
  if (btn) selectColorway(btn.dataset.select)
})
$('[data-swatches]').addEventListener('change', (e) =>
  selectColorway(e.target.value)
)

const bagButton = $('.nav__bag')
const bagCount = $('[data-bag-count]')
const shopError = $('[data-shop-error]')
let bag = 0

bagButton.addEventListener('click', () => lenis.scrollTo('#shop'))

$('[data-shop]').addEventListener('submit', (e) => {
  e.preventDefault()
  const size = new FormData(e.currentTarget).get('size')
  if (!size) {
    shopError.textContent = 'Pick a size first.'
    $('input[name="size"]:not(:disabled)').focus()
    return
  }
  shopError.textContent = ''
  bag += 1
  bagCount.textContent = bag
  bagButton.setAttribute(
    'aria-label',
    `Bag, ${bag} item${bag === 1 ? '' : 's'}`
  )
  bagButton.classList.remove('bump')
  void bagButton.offsetWidth // restart the bump animation
  bagButton.classList.add('bump')
  toast(`Added: Pulse 01, ${current.name}, US ${size}`)
})

$('[data-top]').addEventListener('click', () =>
  lenis.scrollTo(0, { duration: 2.2 })
)

const countdown = $('[data-countdown]')
function tickCountdown() {
  const ms = DROP_DATE - Date.now()
  if (ms <= 0) {
    countdown.textContent = 'now. It is live.'
    return
  }
  const d = Math.floor(ms / 864e5)
  const h = Math.floor(ms / 36e5) % 24
  const m = Math.floor(ms / 6e4) % 60
  const s = Math.floor(ms / 1e3) % 60
  countdown.textContent = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
}
tickCountdown()
setInterval(tickCountdown, 1000)

// stats count up the first time they come into view
const counter = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      counter.unobserve(entry.target)
      const el = entry.target
      const end = Number(el.dataset.count)
      const start = performance.now()
      const tick = (now) => {
        const t = easeOut(clamp((now - start) / 1600))
        el.textContent = Math.round(end * t)
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  },
  { threshold: 0.6 }
)
if (!reducedMotion.matches) {
  for (const el of $$('[data-count]')) {
    el.textContent = '0'
    counter.observe(el)
  }
}

/* ----------------------------------------------------------------- boot */

selectColorway('volt', false)
measure()
requestAnimationFrame(frame)

let resizeFrame
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(measure)
})
window.addEventListener('load', measure)

// hold the page still while the intro plays, then hand scrolling to Lenis
lenis.stop()
Promise.race([
  document.fonts.ready,
  new Promise((r) => setTimeout(r, 1200)),
]).then(() => {
  measure()
  requestAnimationFrame(() => {
    document.documentElement.classList.add('is-ready')
    setTimeout(() => lenis.start(), reducedMotion.matches ? 0 : 900)
  })
})
