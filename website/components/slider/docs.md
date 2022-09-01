# Slider

## Slots

- Slider: logic for Slider
- Slides: content for slides
- Order: Rendering order is determined explicitly by the order of declaration of the slots

## Embla-Carousel-React

-- Docs: https://www.embla-carousel.com/
-- Use emblaApi: to pass api library methods
-- autoScroll is the only method which not belongs to the library but is used in the same way, see example.

## Example

```javascript
<Slider
  emblaApi={{
    slidesToScroll: 1,
    skipSnaps: false,
    startIndex: 1,
    loop: true,
    autoScroll: true,
  }}
>
  {({ scrollPrev, scrollNext, emblaRef }) => {
    return (
      <Fragment>
        <Slider.Slides ref={emblaRef}>
          {devs.map((item, idx) => (
            <div className={s['slide']} key={`slide-item-${idx}`}>
              <div className={s['slide-inner']}>
                <img src={item.image} alt="" className={s['slide-img']} />
                <p className={s['slide-title']}>{item.name}</p>
                <p className={s['slide-text']}>{item.position}</p>
              </div>
            </div>
          ))}
        </Slider.Slides>
        <button onClick={scrollPrev} className={s['slide-buttons']}>
          previous
        </button>
        <button onClick={scrollPrev} className={s['slide-buttons']}>
          next
        </button>
      </Fragment>
    )
  }}
</Slider>
```
