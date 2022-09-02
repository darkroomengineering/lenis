import cn from 'clsx'
import s from './card.module.scss'

export const Card = ({ number, text, className, inverted }) => {
  return (
    <div className={cn(className, s.wrapper, inverted && s.inverted)}>
      {number && <p className={s.number}>{number}</p>}
      {text && <p className={s.text}>{text}</p>}
    </div>
  )
}
