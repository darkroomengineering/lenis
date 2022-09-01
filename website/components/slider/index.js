import cn from 'clsx'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import s from './slider.module.scss'

const Slides = forwardRef(({ children, className }, ref) => (
  <div className={cn(s.slider, className)} ref={ref}>
    <div className={s.container}>{[children].flat().map((child) => child)}</div>
  </div>
))
Slides.displayName = 'Slides'

const Slider = ({
  children,
  emblaApi = { autoplay: false },
  enabled = true,
}) => {
  // eslint-disable-next-line no-unused-vars
  const [_, setScrollSnaps] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoplay = Autoplay(
    { delay: emblaApi?.autoplay?.delay || null },
    (emblaRoot) => emblaRoot.parentElement
  )
  const [emblaRef, embla] = useEmblaCarousel(
    emblaApi,
    emblaApi.autoplay ? [autoplay] : []
  )

  const scrollPrev = useCallback(() => {
    embla && embla.scrollPrev()
  }, [embla])

  const scrollNext = useCallback(() => {
    embla && embla.scrollNext()
  }, [embla])

  const scrollTo = useCallback(
    (index) => {
      embla && embla.scrollTo(index)
    },
    [embla]
  )

  useEffect(() => {
    const onSelect = () => {
      setCurrentIndex(embla.selectedScrollSnap())
    }
    if (embla) {
      setScrollSnaps(embla.scrollSnapList())
      embla.on('select', onSelect)
      onSelect()
    }
  }, [embla])

  useEffect(() => {
    if (!enabled && embla) {
      embla.destroy()
    }
  }, [embla, enabled])

  return children
    ? children({
        emblaRef,
        currentIndex,
        setCurrentIndex,
        scrollPrev,
        scrollNext,
        scrollTo,
      })
    : null
}

Slider.Slides = Slides

export { Slider }
