import cn from 'clsx'
import { Link } from 'components/link'
import dynamic from 'next/dynamic'
import s from './button.module.scss'

const Arrow = dynamic(() => import('icons/arrow-buttons.svg'), { ssr: false })

export const Button = ({
  icon,
  arrow,
  children,
  href,
  onClick,
  className,
  style,
}) => {
  return href ? (
    <Link
      href={href}
      className={cn(s.button, className, icon && s['has-icon'])}
      style={style}
    >
      {icon && <span className={s.icon}>{icon}</span>}
      <span className={s.text}>
        <span className={s.visible}>
          {children} {arrow && <Arrow className={s.arrow} />}
        </span>
        <span aria-hidden="true" className={s.hidden}>
          {children} {arrow && <Arrow className={s.arrow} />}
        </span>
      </span>
    </Link>
  ) : (
    <button
      className={cn(s.button, className, icon && s['has-icon'])}
      style={style}
      onClick={onClick}
    >
      {icon && <span className={s.icon}>{icon}</span>}
      <span className={s.text}>
        <span className={s.visible}>
          {children} {arrow && <Arrow className={s.arrow} />}
        </span>
        <span aria-hidden="true" className={s.hidden}>
          {children} {arrow && <Arrow className={s.arrow} />}
        </span>
      </span>
    </button>
  )
}
