import Lenis from 'lenis'
import Stats from 'stats-js'

window.lenis = new Lenis({
  infinite: true,
  autoRaf: true,
  syncTouch: true,
})

function isPrime(num: number) {
  if (num < 2) return false
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false
  }
  return true
}

function sumPrimes(limit: number) {
  let sum = 0
  for (let i = 2; i <= limit; i++) {
    if (isPrime(i)) {
      sum += i
    }
  }
  return sum
}

// function raf() {
//   // const sum = sumPrimes(Math.random() * 500000)
//   // console.log(sum)
//   requestAnimationFrame(raf)
// }

// raf()

// setInterval(() => {
//   document.querySelector('#work').style.width = `${50 + Math.random() * 30}vw`
// }, 1000)

var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

function animate() {
  stats.begin()

  sumPrimes(300000)

  // monitored code goes here

  stats.end()

  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
