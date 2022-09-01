import cn from 'clsx'
import s from './marquee.module.scss'

const Marquee = ({
  children,
  repeat = 2,
  duration = 5,
  offset = 0,
  inverted = false,
  className,
}) => {
  return (
    <div
      className={cn(className, s.marquee, inverted && s.inverted)}
      style={{
        '--duration': duration + 's',
        '--offset': (offset % 100) + '%',
      }}
    >
      {new Array(repeat).fill(children).map((_, i) => (
        <div key={i} className={s.inner}>
          {children}
        </div>
      ))}
    </div>
  )
}

export { Marquee }
