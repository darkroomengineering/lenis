import EventEmitter from "events"
import { clamp, lerp, truncate } from "./scripts/utils/maths"
import { offsetLeft, offsetTop, Rect } from "./scripts/utils/rect"

class ScrollElement extends Rect {
  constructor(element) {
    super(element)

    let speed = element.getAttribute("data-scroll-speed")
    speed = element.speed = parseFloat(speed)
    speed = !isNaN(speed) ? speed : 0
    this.speed = speed / 10

    this.inView = false
    this.id = element.getAttribute("data-scroll-id")
    this.call = element.getAttribute("data-scroll-call")
    this.delay = element.getAttribute("data-scroll-delay")
    this.delay = this.delay ? parseFloat(this.delay) : null
    this.repeat = element.getAttribute("data-scroll-repeat") !== null
    this.direction = element.getAttribute("data-scroll-direction")
    this.position = element.getAttribute("data-scroll-position")
    this.sticky = element.getAttribute("data-scroll-sticky") !== null
    this.offset = element.getAttribute("data-scroll-offset")
    if (this.offset) {
      this.offset = this.offset
        .replaceAll(" ", "")
        .split(",")
        .map((v) => (["top", "bottom"].includes(v) ? 0 : v))
    } else {
      this.offset = [0, 0]
    }

    this.offset = new Array(2).fill(0).map((_, i) => this.offset[i] || 0)

    this.target = document.querySelector(
      element.getAttribute("data-scroll-target")
    )
    if (this.target) {
      this.target = new Rect(this.target)
    }
  }

  update() {
    super.update()
  }
}

const defaultOptions = {
  autoRaf: true, // [Boolean] does Lenis should handle it's own raf or not
  smooth: 0.88, // [Boolean, Number] smoothness: 0 is native, 1 is smooth
  direction: "vertical", // [String] "vertical" or "horizontal"
  effects: true, // [Boolean] enable/disable effects (parallax, sticky)
}

export default class Lenis extends EventEmitter {
  constructor(options = {}) {
    super()
    this.setMaxListeners(Infinity)

    this.options = { ...defaultOptions, ...options }

    if (!this.options.wrapper || !this.options.content) {
      console.warn("lenis: missing wrapper or content")
      return
    }

    // convert Boolean to Number
    this.options.lerp = this.options.smooth + 0

    // parse as Number
    this.options.lerp = !isNaN(parseFloat(this.options.lerp))
      ? parseFloat(this.options.lerp)
      : defaultOptions.lerp

    this.options.lerp = clamp(0.01, 1 - this.options.lerp, 1)
    this.options.smooth = this.options.lerp < 1

    document.documentElement.classList.add("has-scroll-init")

    const { wrapper, content, direction, smooth, lerp, effects } = this.options

    this.wrapperElement = wrapper
    this.wrapperElement.addEventListener("scroll", this.onWrapperScroll, false)

    this.contentElement = content
    this.direction = direction
    this.smooth = smooth
    this.lerp = lerp
    this.effects = effects

    this.delta = { x: window.pageXOffset, y: window.pageYOffset }
    this.scroll = { x: window.pageXOffset, y: window.pageYOffset }
    this.latestScroll = { x: window.pageXOffset, y: window.pageYOffset }

    this.update()

    window.addEventListener("scroll", this.onScroll, false)
    window.addEventListener("resize", this.update, false)

    window.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const y =
          offsetTop(document.activeElement) -
          this.windowHeight / 2 -
          document.activeElement.offsetHeight / 2

        this.scrollTo(y)
      }
    })

    // document.addEventListener("focus", this.onFocus, true)

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

    if (this.options.smooth === true) {
      document.documentElement.classList.add("has-scroll-smooth")
    }

    if (this.options.autoRaf) requestAnimationFrame(this.raf)
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

  onScroll = () => {
    this.delta = { x: window.pageXOffset, y: window.pageYOffset }

    this.isMoving = true
  }

  // onFocus = ({ target }) => {
  //   const top = offsetTop(target)
  //   this.scrollTo(top, {
  //     offset: -(this.windowHeight / 2 - target.offsetHeight / 2),
  //   })
  // }

  onWrapperScroll = () => {
    this.wrapperElement.scrollTo(0, 0)
  }

  setScroll(x, y, immediate = true) {
    window.scrollTo(x, y)

    if (immediate) {
      this.delta = { x, y }
      this.scroll = { x, y }
      this.latestScroll = { x, y }
    }
  }

  raf = () => {
    if (this.options.autoRaf) {
      requestAnimationFrame(this.raf)
    }

    if (this.isMoving) {
      this.latestScroll = { x: this.scroll.x, y: this.scroll.y }
      this.scroll = {
        x: lerp(this.scroll.x, this.delta.x, this.lerp),
        y: lerp(this.scroll.y, this.delta.y, this.lerp),
      }

      this.emit("scroll", {
        scroll: this.scroll,
        delta: this.delta,
        progress: this.progress,
        velocity: this.velocity,
        limit: this.limit,
        currentElements: this.scrollElements.filter(
          (current) => current.inView
        ),
      })

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

  update = () => {
    console.log("lenis update")

    this.contentHeight = this.contentElement.offsetHeight
    this.contentWidth = this.contentElement.offsetWidth

    if (this.smooth) {
      document.body.style.setProperty("height", this.contentHeight + "px")
    }

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
            current.element.style.setProperty(
              "transform",
              `translate3d(${-this.scroll.x}px, ${-this.scroll.y}px, 0)`
            )
            if (inView !== current.inView) {
              current.element.style.removeProperty("pointer-events")
              current.element.style.removeProperty("visibility")
            }
          } else {
            if (inView !== current.inView) {
              current.element.style.setProperty("pointer-events", "none")
              current.element.style.setProperty("visibility", "hidden")
              current.element.style.removeProperty("transform")
            }
          }

          current.inView = inView
        })
      } else {
        this.contentElement.style.setProperty(
          "transform",
          `translate3d(${-this.scroll.x}px, ${-this.scroll.y}px, 0)`
        )
      }
    }

    let inView = false

    this.scrollElements.forEach((current) => {
      if (this.effects) {
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

          const { top, left, height, width } = current

          if (shouldTransform) {
            switch (current.position) {
              case "top":
                translate = this.scroll.y * -current.speed
                break

              case "elementTop":
                translate = (scrollBottom - top) * -current.speed
                break

              case "bottom":
                translate =
                  (this.limit.y - scrollBottom + this.windowHeight) *
                  current.speed
                break

              case "left":
                translate = this.scroll.x * -current.speed
                break

              case "elementLeft":
                translate = (scrollRight - left) * -current.speed
                break

              case "right":
                translate =
                  (this.limit.x - scrollRight + this.windowHeight) *
                  current.speed
                break

              default:
                if (this.direction === "horizontal") {
                  translate =
                    (scrollMiddle.x - (left + width / 2)) * -current.speed
                } else {
                  translate =
                    (scrollMiddle.y - (top + height / 2)) * -current.speed
                }
                break
            }
          }

          if (this.direction === "horizontal") {
            inView = current.computeIntersection(
              this.scroll.x - translate,
              this.scroll.y
            )
          } else {
            inView = current.computeIntersection(
              this.scroll.x,
              this.scroll.y - translate
            )
          }
        } else if (current.sticky && current.target) {
          // sticky

          const shouldTransform = current.target.computeIntersection(
            this.scroll.x,
            this.scroll.y,
            this.windowHeight / 2
          )

          const { height, width, top, left } = current.computeRect(
            this.scroll.x,
            this.scroll.y
          )

          const {
            top: targetTop,
            height: targetHeight,
            left: targetLeft,
            right: targetRight,
            width: targetWidth,
            bottom: targetBottom,
          } = current.target.computeRect(this.scroll.x, this.scroll.y)

          let offset = current.offset

          if (offset.includes("center")) {
            if (this.direction === "horizontal") {
              offset[0] = this.windowWidth / 2 - width / 2
              offset[1] = 0
            } else {
              offset[0] = this.windowHeight / 2 - height / 2
              offset[1] = 0
            }
          } else {
            // convert % to px
            offset = offset.map((v) =>
              typeof v === "string" && v.includes("%")
                ? (parseFloat(v.replaceAll("%", "")) / 100) *
                  (this.direction === "horizontal"
                    ? this.windowWidth
                    : this.windowHeight)
                : v
            )
          }

          offset[0] = parseFloat(offset[0])
          offset[1] = parseFloat(offset[1])

          if (shouldTransform) {
            if (this.direction === "horizontal") {
              translate = clamp(
                0,
                -targetLeft + offset[0],
                targetWidth - width - offset[1] + (targetLeft - left)
              )
            } else {
              translate = clamp(
                0,
                -targetTop + offset[0],
                targetHeight - height - offset[1] + (targetTop - top)
              )
            }
          }

          if (this.direction === "horizontal") {
            inView =
              left + targetWidth > offset[1] && targetRight + targetWidth > 0
          } else {
            inView =
              top + targetHeight > offset[1] && targetBottom + targetHeight > 0
          }
        } else {
          // test inview for any other scroll element
          inView = current.computeIntersection(this.scroll.x, this.scroll.y, 0)
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
      } else {
        // test inview even if effects are disabled
        inView = current.computeIntersection(this.scroll.x, this.scroll.y, 0)
      }

      if (current.call && current.inView !== inView) {
        this.emit("call", current.call, inView, current)
      }

      current.inView = inView

      if (inView) {
        current.element.classList.add("is-inview")
      } else if (current.repeat) {
        current.element.classList.remove("is-inview")
      }
    })
  }

  destroy() {
    this.wrapperElement.removeEventListener(
      "scroll",
      this.onWrapperScroll,
      false
    )
    // document.removeEventListener("focus", this.onFocus, true)
    window.removeEventListener("scroll", this.onScroll, false)
    window.removeEventListener("resize", this.update, false)

    document.documentElement.classList.remove("has-scroll-init")
    document.documentElement.classList.remove("has-scroll-smooth")
    cancelAnimationFrame(this.raf)

    document.body.style.removeProperty("height")

    this.anchors.forEach((element) => {
      element.removeEventListener("click", this.anchorsHandler, false)
    })
    this.anchors = []

    this.sections.forEach((current) => {
      current.element.style.removeProperty("transform")
      current.element.style.removeProperty("pointer-events")
      current.element.style.removeProperty("visibility")
    })
    this.sections = []

    this.scrollElements.forEach((current) => {
      current.element.style.removeProperty("transform")
      current.element.classList.remove("is-inview")
    })
    this.scrollElements = []
  }
}
