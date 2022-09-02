import { forwardRef } from 'react'
import s from './header.module.scss'

export const Header = forwardRef((_, ref) => {
  return (
    <header className={s.header} ref={ref}>
      <p className="layout-block">hi</p>
    </header>
  )
})

Header.displayName = 'Header'
