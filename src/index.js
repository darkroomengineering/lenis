import { lerp, truncate } from "./scripts/utils/maths"
// import { offsetLeft, offsetTop } from "./scripts/utils/rect"
import EventEmitter from "events"

function getTranslate(element) {
  const matrix = new DOMMatrixReadOnly(
    window.getComputedStyle(element).getPropertyValue("transform")
  )

  return {
    translateX: matrix.m41,
    translateY: matrix.m42,
  }
}

class BoundingClientRect {
  constructor(element) {
    this.element = element
    this.update()
  }

  update() {
    const { width, height, top, left } = this.element.getBoundingClientRect()
    this.width = width
    this.height = height

    // this.offsetTop = offsetTop(this.element)
    // this.offsetLeft = offsetLeft(this.element)

    const { translateX, translateY } = getTranslate(this.element)

    this.offsetTop = top - translateY
    this.offsetLeft = left - translateX
  }
}

export default class Lenis extends EventEmitter {
  constructor({ wrapper, content, lerp = 0.1, smooth = true }) {
    super()
    this.setMaxListeners(Infinity)

    this.smooth = smooth
    this.lerp = lerp
    this.wrapper = wrapper
    this.content = content

    document.documentElement.classList.add("lenis")
    document.documentElement.classList.toggle("lenis-smooth", this.smooth)

    this.preventTransforms = false

    this.sections = [...document.querySelectorAll("[data-scroll-section]")].map(
      (element) => new BoundingClientRect(element)
    )

    this.onWindowResize()

    window.addEventListener("scroll", this.onWindowScroll, false)
    window.addEventListener("resize", this.onWindowResize, false)

    // supports TAB focus
    window.addEventListener("keydown", this.onKeyDown, false)

    // supports CMD+F focus
    this.focus = true
    // window.addEventListener("wheel", this.onWheel, false)
    window.addEventListener("focus", this.onFocus, false)
    window.addEventListener("blur", this.onBlur, false)
  }

  onKeyDown = (e) => {
    if (e.key === "Tab") {
      this.applyTransforms(true)
    }
  }

  // onWheel = () => {
  //   console.log("on wheel")
  //   this.focus = true
  // }

  onFocus = () => {
    this.focus = true
    this.applyTransforms(true)
  }

  onBlur = () => {
    this.focus = false
    this.applyTransforms(true)
  }

  destroy() {
    window.removeEventListener("scroll", this.onWindowScroll, false)
    window.removeEventListener("resize", this.onWindowResize, false)
    window.removeEventListener("keydown", this.onKeyDown, false)
    // window.removeEventListener("wheel", this.onWheel, false)
    window.removeEventListener("focus", this.onFocus, false)
    window.removeEventListener("blur", this.onBlur, false)

    document.documentElement.classList.remove("lenis")
    document.documentElement.classList.remove("lenis-smooth")
  }

  update() {
    this.height = this.content.offsetHeight

    document.body.style.height = this.height + "px"

    this.scroll = {
      x: window.scrollX,
      y: window.scrollY,
    }
    this.lerpedScroll = {
      x: window.scrollX,
      y: window.scrollY,
    }

    this.sections.forEach((section) => {
      section.update()
    })

    this.emit("scroll", {
      scroll: this.scroll,
      lerpedScroll: this.lerpedScroll,
    })

    this.applyTransforms(true)
  }

  onWindowResize = () => {
    this.windowWidth = Math.min(
      document.documentElement.clientWidth,
      window.innerWidth
    )
    this.windowHeight = Math.min(
      document.documentElement.clientHeight,
      window.innerHeight
    )
    this.update()
  }

  onWindowScroll = () => {
    this.scroll.x = window.scrollX
    this.scroll.y = window.scrollY

    if (this.focus === false || this.smooth === false) {
      this.lerpedScroll.x = this.scroll.x
      this.lerpedScroll.y = this.scroll.y

      this.applyTransforms(true)
    }
  }

  raf() {
    let needsUpdate = false

    if (truncate(this.lerpedScroll.y, 0) === this.scroll.y) {
      // stop on the exact scroll value
      this.lerpedScroll.x = this.scroll.x
      this.lerpedScroll.y = this.scroll.y

      if (!this.preventTransforms) {
        needsUpdate = true
        this.preventTransforms = true
      }
    } else {
      this.lerpedScroll.x = lerp(this.lerpedScroll.x, this.scroll.x, this.lerp)
      this.lerpedScroll.y = lerp(this.lerpedScroll.y, this.scroll.y, this.lerp)

      needsUpdate = true
      this.preventTransforms = false
    }

    if (needsUpdate) {
      this.emit("scroll", {
        scroll: this.scroll,
        lerpedScroll: this.lerpedScroll,
      })
      this.applyTransforms()
    }
  }

  applyTransforms(force = false) {
    if (this.smooth === true) {
      if (this.sections.length > 0) {
        this.sections.forEach(({ offsetTop, height, element }) => {
          const top = offsetTop - this.lerpedScroll.y
          const bottom = top + height

          const OFFSET = 500

          if (force || (top < this.windowHeight + OFFSET && bottom > -OFFSET)) {
            // element.style.removeProperty("opacity")
            // element.style.removeProperty("pointerEvents")
            element.style.transform = `translate3d(0,${-this.lerpedScroll
              .y}px,0)`
          } else {
            // element.style.removeProperty("transform")
            // element.style.opacity = 0
            // element.style.pointerEvents = "none"
          }
        })
      } else {
        this.content.style.transform = `translate3d(0,${-this.lerpedScroll
          .y}px,0)`
      }
    }
  }
}
