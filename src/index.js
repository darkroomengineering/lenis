import { clamp, lerp, truncate } from "./scripts/utils/maths"
import { offsetTop, offsetLeft, Rect } from "./scripts/utils/rect"

class ScrollElement extends Rect {
  constructor(element) {
    super(element)

    let speed = element.getAttribute("data-scroll-speed")
    speed = element.speed = parseFloat(speed)
    speed = !isNaN(speed) ? speed : 0
    this.speed = speed / 10

    this.delay = element.getAttribute("data-scroll-delay")
    this.delay = this.delay ? parseFloat(this.delay) : null
    this.repeat = element.getAttribute("data-scroll-repeat") !== null
    this.direction = element.getAttribute("data-scroll-direction")
    this.position = element.getAttribute("data-scroll-position")
    this.sticky = element.getAttribute("data-scroll-sticky") !== null
    this.offset = element.getAttribute("data-scroll-offset")
    if (this.offset) {
      this.offset = this.offset
        .split(",")
        .map((v) => (["top", "bottom"].includes(v) ? 0 : v))
    } else {
      this.offset = [0, 0]
    }

    this.offset = new Array(2).fill(0).map((_, i) => this.offset[i] || 0)

    this.target = element.getAttribute("data-scroll-target")
    this.target = this.target
      ? new Rect(document.querySelector(this.target))
      : new Rect(element)
  }

  update() {
    super.update()
  }
}

class Core {
  constructor({ wrapper, content, direction, smooth, lerp, effects }) {
    this.wrapperElement = wrapper
    this.contentElement = content
    this.direction = direction
    this.smooth = smooth
    this.lerp = lerp
    this.effects = effects

    this.delta = { x: window.scrollX, y: window.scrollY }
    this.scroll = { x: window.scrollX, y: window.scrollY }
    this.latestScroll = { x: window.scrollX, y: window.scrollY }

    this.update()

    this.onScroll = this.onScroll.bind(this)
    window.addEventListener("scroll", this.onScroll, false)

    this.update = this.update.bind(this)
    window.addEventListener("resize", this.update, false)

    // prevent anchor link click
    this.anchors = [
      ...document.querySelectorAll("a[href^='#'], [data-scroll-to]"),
    ]
    this.anchorsHandler = (event) => {
      event.preventDefault()

      const selector =
        event.currentTarget.getAttribute("href") ||
        event.currentTarget.getAttribute("data-scroll-to")
      const target = document.querySelector(selector)

      this.scrollTo(target)
    }
    this.anchors.forEach((element) => {
      element.addEventListener("click", this.anchorsHandler, false)
    })
  }

  get directionAxis() {
    return this.direction === "horizontal" ? "x" : "y"
  }

  get velocity() {
    return {
      x: this.scroll.x - this.latestScroll.x,
      y: this.scroll.y - this.latestScroll.y,
    }
  }

  get progress() {
    const x = truncate(this.scroll.x / this.limit.x, 4)
    const y = truncate(this.scroll.y / this.limit.y, 4)

    return {
      x: !isNaN(x) ? x : 0,
      y: !isNaN(y) ? y : 0,
    }
  }

  scrollTo(target, options = {}) {
    let offset = parseInt(options.offset) || 0
    let immediate = options.immediate || false

    if (typeof target === "string") {
      // Selector or boundaries
      if (target === "top") {
        target = 0
      } else if (target === "bottom") {
        target = this.limit.y
      } else if (target === "left") {
        target = 0
      } else if (target === "right") {
        target = this.limit.x
      } else {
        target = document.querySelector(target)
        // If the query fails, abort
        if (!target) {
          return
        }
      }
    } else if (typeof target === "number") {
      // Absolute coordinate
      target = parseInt(target)
    } else if (target && target.tagName) {
      // DOM Element
      // We good 👍
    } else {
      console.warn("`target` parameter is not valid")
      return
    }

    // We have a target that is not a coordinate yet, get it
    if (typeof target !== "number") {
      const top = offsetTop(target)
      const left = offsetLeft(target)

      if (this.direction === "horizontal") {
        target = left
      } else {
        target = top
      }
    }

    target += offset

    if (this.direction === "horizontal") {
      this.setScroll(target, this.delta.y, immediate)
    } else {
      this.setScroll(this.delta.x, target, immediate)
    }
  }

  onScroll() {
    this.delta = { x: window.scrollX, y: window.scrollY }

    this.isMoving = true
  }

  setScroll(x, y, immediate = true) {
    window.scrollTo(x, y)

    if (immediate) {
      this.delta = { x, y }
      this.scroll = { x, y }
      this.latestScroll = { x, y }
    }
  }

  raf() {
    if (this.isMoving) {
      this.latestScroll = { x: this.scroll.x, y: this.scroll.y }
      this.scroll = {
        x: lerp(this.scroll.x, this.delta.x, this.lerp),
        y: lerp(this.scroll.y, this.delta.y, this.lerp),
      }

      if (
        truncate(this.velocity.x, 4) === 0 &&
        truncate(this.velocity.y, 4) === 0
      ) {
        // stop raf when velocity is 0, truncate to 4 decimals to avoid infinite decimals
        this.isMoving = false
      }

      this.applyTransforms()
    }
  }

  update() {
    console.log("lenis update")

    this.contentHeight = this.contentElement.offsetHeight
    this.contentWidth = this.contentElement.offsetWidth

    document.body.style.setProperty("height", this.contentHeight + "px")

    this.windowWidth = Math.min(
      document.documentElement.clientWidth,
      window.innerWidth
    )
    this.windowHeight = Math.min(
      document.documentElement.clientHeight,
      window.innerHeight
    )

    this.limit = {
      x: document.body.clientWidth - this.windowWidth,
      y: document.body.clientHeight - this.windowHeight,
    }

    // sections
    this.sections = [
      ...this.contentElement.querySelectorAll("[data-scroll-section]"),
    ].map((element) => new Rect(element))

    // scroll elements (speed, sticky, etc...)
    this.scrollElements = [
      ...this.contentElement.querySelectorAll(
        "[data-scroll],[data-scroll-speed],[data-scroll-sticky]"
      ),
    ].map((element) => new ScrollElement(element))

    this.applyTransforms()
  }

  applyTransforms() {
    if (this.smooth) {
      if (this.sections.length > 0) {
        this.sections.forEach((current) => {
          const inView = current.computeIntersection(
            this.scroll.x,
            this.scroll.y,
            0 // TODO: add optional margin
          )
          if (inView) {
            current.element.style.removeProperty("pointer-events")
            current.element.style.removeProperty("visibility")
            current.element.style.setProperty(
              "transform",
              `translate3d(${-this.scroll.x}px, ${-this.scroll.y}px, 0)`
            )
          } else {
            current.element.style.setProperty("pointer-events", "none")
            current.element.style.setProperty("visibility", "hidden")
            current.element.style.removeProperty("transform")
          }
        })
      } else {
        this.contentElement.style.setProperty(
          "transform",
          `translate3d(${-this.scroll.x}px, ${-this.scroll.y}px, 0)`
        )
      }
    }

    if (this.effects) {
      this.scrollElements.forEach((current) => {
        const scrollRight = this.scroll.x + this.windowWidth
        const scrollBottom = this.scroll.y + this.windowHeight

        const scrollMiddle = {
          x: this.scroll.x + this.windowWidth / 2,
          y: this.scroll.y + this.windowHeight / 2,
        }

        let translate = false

        if (current.speed) {
          // speed

          const shouldTransform = current.computeIntersection(
            this.scroll.x,
            this.scroll.y,
            this.windowHeight / 2
          )

          if (shouldTransform) {
            const { top, left, height } = current

            switch (current.position) {
              case "top":
                translate = this.scroll[this.directionAxis] * -current.speed
                break

              case "elementTop":
                translate = (scrollBottom - top) * -current.speed
                break

              case "bottom":
                translate =
                  (this.limit[this.directionAxis] -
                    scrollBottom +
                    this.windowHeight) *
                  current.speed
                break

              case "left":
                translate = this.scroll[this.directionAxis] * -current.speed
                break

              case "elementLeft":
                translate = (scrollRight - left) * -current.speed
                break

              case "right":
                translate =
                  (this.limit[this.directionAxis] -
                    scrollRight +
                    this.windowHeight) *
                  current.speed
                break

              default:
                translate =
                  (scrollMiddle[this.directionAxis] - (top + height / 2)) *
                  -current.speed
                break
            }
          }

          const inView = current.computeIntersection(
            this.scroll.x,
            this.scroll.y,
            -current.speed * (this.windowHeight / 2)
          )
          current.element.classList.toggle("is-inview", inView)
        } else if (current.sticky) {
          // sticky

          const shouldTransform = current.target.computeIntersection(
            this.scroll.x,
            this.scroll.y,
            this.windowHeight / 2
          )

          if (shouldTransform) {
            const { height, width } = current
            const {
              top: targetTop,
              height: targetHeight,
              left: targetLeft,
              width: targetWidth,
            } = current.target.computeRect(this.scroll.x, this.scroll.y)

            // convert % to px
            const offset = current.offset.map((v) =>
              typeof v === "string" && v.includes("%")
                ? (parseFloat(v) / 100) * this.direction === "horizontal"
                  ? this.windowWidth
                  : this.windowHeight
                : v
            )

            if (offset.includes("center")) {
              if (this.direction === "horizontal") {
                offset[0] = this.windowWidth / 2 - width / 2
                offset[1] = 0
              } else {
                offset[0] = this.windowHeight / 2 - height / 2
                offset[1] = 0
              }
            }
            // else {
            offset[0] = parseFloat(offset[0])
            offset[1] = parseFloat(offset[1])

            if (this.direction === "horizontal") {
              translate = clamp(
                0,
                -targetLeft + offset[0],
                targetWidth - width - offset[1]
              )
            } else {
              translate = clamp(
                0,
                -targetTop + offset[0],
                targetHeight - height - offset[1]
              )
            }
          }
        } else {
          // test inview for any other scroll element
          const inView = current.computeIntersection(
            this.scroll.x,
            this.scroll.y,
            0
          )
          current.element.classList.toggle("is-inview", inView)
        }

        // translate element
        if (translate !== false) {
          if (current.delay) {
            // delay
            const start = current.translate || 0
            translate = lerp(start, translate, current.delay)
            current.translate = translate
          }

          if (
            current.direction === "horizontal" ||
            (this.direction === "horizontal" &&
              current.direction !== "vertical")
          ) {
            current.element.style.setProperty(
              "transform",
              `translate3d(${translate}px, 0, 0)`
            )
          } else {
            current.element.style.setProperty(
              "transform",
              `translate3d(0, ${translate}px, 0)`
            )
          }
        }

        // TODO: inview

        // set inview class
        const inView = current.computeIntersection(
          this.scroll.x,
          this.scroll.y,
          0
        )
        // current.element.classList.toggle("is-inview", inView)
        // current.element.classList.toggle("is-inview", true)
      })
    } else {
      // if not effects
      this.scrollElements.forEach((current) => {
        const inView = current.computeIntersection(
          this.scroll.x,
          this.scroll.y,
          0
        )
        // current.element.classList.toggle("is-inview", inView)
        current.element.classList.toggle("is-inview", inView)
      })
    }
  }

  destroy() {
    window.removeEventListener("scroll", this.onScroll, false)
    window.removeEventListener("resize", this.update, false)

    document.body.style.removeProperty("height")

    this.anchors.forEach((element) => {
      element.removeEventListener("click", this.anchorsHandler, false)
    })

    this.sections.forEach((current) => {
      current.element.style.removeProperty("transform")
      current.element.style.removeProperty("pointer-events")
      current.element.style.removeProperty("visibility")
    })

    this.scrollElements.forEach((current) => {
      current.element.style.removeProperty("transform")
      current.element.classList.remove("is-inview")
    })
  }
}

const defaultOptions = {
  autoRaf: true,
  lerp: 0.1,
  direction: "vertical",
  effects: true,
}

class Lenis {
  constructor(options = {}) {
    console.log("lenis init", options)

    this.options = { ...defaultOptions, ...options }

    if (!this.options.wrapper || !this.options.content) {
      console.warn("lenis: missing wrapper or content")
      return
    }

    this.options.lerp = !isNaN(parseFloat(this.options.lerp))
      ? parseFloat(this.options.lerp)
      : defaultOptions.lerp

    this.options.smooth = this.options.lerp < 1

    if (this.options.lerp <= 0 || this.options.lerp > 1) {
      this.options.lerp = defaultOptions.lerp
    }

    console.log(this.options)

    document.documentElement.classList.add("has-scroll-init")

    // this.scroll = this.options.smooth
    //   ? new Smooth(this.options)
    //   : new Native(this.options)
    this.scroll = new Core(this.options)

    if (this.options.smooth === true) {
      document.documentElement.classList.add("has-scroll-smooth")
    }

    this.raf = this.raf.bind(this)
    if (this.options.autoRaf) requestAnimationFrame(this.raf)
  }

  raf() {
    if (this.options.autoRaf) {
      this.scroll.raf()
      requestAnimationFrame(this.raf)
    }
  }

  scrollTo(target, options) {
    this.scroll.scrollTo(target, options)
  }

  setScroll(x, y, immediate) {
    this.scroll.setScroll(x, y, immediate)
  }

  update() {
    this.scroll.update()
  }

  destroy() {
    this.scroll.destroy()
    document.documentElement.classList.remove("has-scroll-init")
    document.documentElement.classList.remove("has-scroll-smooth")
    cancelAnimationFrame(this.raf)
  }
}

export default Lenis
