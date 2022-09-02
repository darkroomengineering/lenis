import { Link } from 'components/link'
import dynamic from 'next/dynamic'
import s from './list-item.module.scss'

const Arrow = dynamic(() => import('icons/arrow-diagonal.svg'), { ssr: false })

export const ListItem = ({ title, source, href }) => {
  return (
    <Link href={href} className={s.item}>
      <span className={s.title}>
        <p className={s.text}>{title}</p>
        <Arrow className={s.arrow} />
      </span>
      <p className={s.source}>{source}</p>
    </Link>
  )
}
