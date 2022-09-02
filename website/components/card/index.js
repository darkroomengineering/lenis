import s from './card.module.scss'

export const Card = ({ number, text }) => {
  return (
    <div className={s.wrapper}>
      {number && <p className={s.number}>{number}</p>}
      {text && <p className={s.text}>{text}</p>}
    </div>
  )
}
