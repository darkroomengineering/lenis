import cn from 'clsx'
import { Link } from 'components/link'
import dynamic from 'next/dynamic'
import s from './button.module.scss'

const Arrow = dynamic(() => import('icons/arrow-diagonal.svg'), { ssr: false })

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
      {children}
      {arrow && <Arrow className={s.arrow} />}
    </Link>
  ) : (
    <button
      className={cn(s.button, className, icon && s['has-icon'])}
      style={style}
      onClick={onClick}
    >
      {icon && <span className={s.icon}>{icon}</span>}
      {children}
      {arrow && <Arrow className={s.arrow} />}
    </button>
  )
}
