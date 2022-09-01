import { Link } from 'components/link'
import s from './footer.module.scss'

export const Footer = () => {
  return (
    <footer className={s.footer}>
      <div className="layout-block">
        <h2>
          <Link href="mailto:contact@studiofreight.com">mail</Link>
          <Link href="/contact">contact</Link>
          <Link href="https://twitter.com/studiofreight">twitter</Link>
        </h2>
      </div>
    </footer>
  )
}
