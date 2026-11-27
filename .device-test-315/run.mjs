// Drives the Lenis 315 test page with REAL touches (WebDriver pointer actions, pointerType "touch").
// Run after devices-up prints READY and serve.mjs is up.
//
//   node run.mjs --base http://<PC LAN IP>:5315                      iPhone, whole matrix
//   node run.mjs --base … --only main:native:lock-during-pan:none    one run (build:touch:case:interrupt), comma-separate several
//   node run.mjs --base … --repeat 3
//   node run.mjs --base http://localhost:5315 --device pixel --serial <adb serial> --chromedriver <path>
//
// Prints one summary line per run and writes runner-results.json (summaries + traces).
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]?.startsWith('--') ? true : (all[i + 1] ?? true)])
    return acc
  }, [])
)
const BASE = args.base
if (!BASE) throw new Error('--base http://<host>:<port> is required')
const DEVICE = args.device ?? 'iphone'
const REPEAT = Number(args.repeat ?? 1)

// webdriverio lives in the wdio-mcp install the device testing station uses
const WDIO_HOME = args.wdio ?? join(homedir(), '.cache', 'test-devices', 'wdio-mcp')
const require = createRequire(join(WDIO_HOME, 'package.json'))
let remote
try {
  ;({ remote } = await import(pathToFileURL(require.resolve('webdriverio')).href))
} catch {
  ;({ remote } = require('webdriverio'))
}

const CAPS = {
  iphone: {
    hostname: '127.0.0.1',
    port: 4446,
    capabilities: { browserName: 'safari', platformName: 'iOS', 'safari:deviceType': 'iPhone' },
  },
  pixel: {
    capabilities: {
      browserName: 'chrome',
      'wdio:chromedriverOptions': { binary: args.chromedriver },
      'goog:chromeOptions': { androidPackage: 'com.android.chrome', androidDeviceSerial: args.serial },
    },
  },
}[DEVICE]

// one finger at x=200; y in CSS px from the top of the viewport
const move = (y, duration) => ({ type: 'pointerMove', duration, x: 200, y, origin: 'viewport' })
const pause = (duration) => ({ type: 'pause', duration })
const wiggle = [450, 520, 400, 480, 360, 450, 330, 420, 300, 390, 280, 360].map((y) => move(y, 280))
const GESTURES = {
  // slow continuous drag for ~3.6 s: the finger never rests
  drag: [move(560, 0), { type: 'pointerDown', button: 0 }, pause(60), move(500, 200), ...wiggle, { type: 'pointerUp', button: 0 }],
  // finger down, held still 800 ms, then the same drag
  'hold-drag': [move(560, 0), { type: 'pointerDown', button: 0 }, pause(800), move(500, 200), ...wiggle, { type: 'pointerUp', button: 0 }],
  // fast flick up, released: native momentum follows
  flick: [move(600, 0), { type: 'pointerDown', button: 0 }, pause(30), move(250, 90), { type: 'pointerUp', button: 0 }],
}
const gestureFor = (kase) =>
  kase === 'lock-before-move' ? 'hold-drag' : kase === 'lock-during-momentum' ? 'flick' : 'drag'

const BUILDS = (args.builds ?? 'main,v2').split(',')
const MATRIX = BUILDS.flatMap((build) =>
  [
    ['native', 'control', 'none'], // sanity: do WebDriver touches scroll natively?
    ['native', 'lock-during-pan', 'none'], // the issue
    ['native', 'nolock-during-pan', 'none'],
    ['smooth', 'lock-during-pan', 'none'], // the suggested workaround
    ['native', 'lock-before-move', 'none'],
    ['native', 'lock-during-momentum', 'none'],
    ['native', 'stop-during-pan', 'none'],
    ['native', 'lock-during-pan', 'hidden'],
    ['native', 'lock-during-pan', 'clip'],
    ['native', 'lock-during-pan', 'hidden-frame'],
    ['native', 'lock-during-pan', 'body-hidden'],
    ['native', 'lock-during-pan', 'touchaction'],
    ['native', 'lock-during-pan', 'lockstart-hidden'],
    ['native', 'lock-during-momentum', 'lockstart-hidden'],
  ].map(([touch, kase, interrupt]) => ({ build, touch, kase, interrupt }))
)
const runs = args.only
  ? String(args.only).split(',').map((s) => {
      const [build, touch, kase, interrupt = 'none'] = s.split(':')
      return { build, touch, kase, interrupt }
    })
  : MATRIX

const browser = await remote({ logLevel: 'warn', ...CAPS })
const out = []
try {
  for (const r of runs) {
    for (let i = 0; i < REPEAT; i++) {
      const url = `${BASE}/index.html?build=${r.build}&touch=${r.touch}&case=${r.kase}&interrupt=${r.interrupt}&run=${Date.now()}`
      const label = `${r.build} ${r.touch} ${r.kase} ${r.interrupt}`
      try {
        await browser.url(url)
        await browser.waitUntil(() => browser.execute(() => window.__ready === true), { timeout: 15000 })
        await browser.pause(400)
        await browser.performActions([
          { type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' }, actions: GESTURES[gestureFor(r.kase)] },
        ])
        await browser.releaseActions().catch(() => {})
        await browser.waitUntil(() => browser.execute(() => window.__done === true), { timeout: 20000 }).catch(() => {})
        const full = await browser.execute(() => window.__report(true))
        const s = full.summary
        out.push({ ...r, ...full })
        console.log(
          `${label.padEnd(52)} conflict=${s.conflictFrames}/${s.writeFrames} maxConflict=${s.maxConflictPx} fights=${s.fightFrames}/${s.framesInWindow} maxFight=${s.maxFightPx} reversals=${s.scrollReversals} ` +
            `moves(inWindow/notCancelable/prevented)=${s.touchmovesInWindow}/${s.touchmovesInWindowNotCancelable}/${s.touchmovesInWindowPrevented} ` +
            `y:${s.yAtTrigger ?? '-'}->${s.yFinal} completed=${s.tComplete !== null} tTrigger=${s.tTrigger} tTouchEnd=${s.tTouchEnd} tComplete=${s.tComplete} overflowEnd=${s.rootOverflowAtEnd}`
        )
      } catch (error) {
        console.log(`${label.padEnd(52)} ERROR ${error.message}`)
        out.push({ ...r, error: String(error.message) })
      }
    }
  }
} finally {
  writeFileSync(new URL('./runner-results.json', import.meta.url), JSON.stringify(out))
  await browser.deleteSession().catch(() => {})
}
