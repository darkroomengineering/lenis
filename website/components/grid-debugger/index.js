import { useMediaQuery } from '@studio-freight/hamo'
import cn from 'clsx'
import { useMemo, useState } from 'react'
import s from './grid-debugger.module.scss'

export const GridDebugger = () => {
  const [visible, setVisible] = useState(false)
  const isMobile = useMediaQuery('(max-width: 800px)')

  const columns = useMemo(() => {
    return parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--layout-columns-count'
      )
    )
  }, [isMobile])

  return (
    <div className={s.grid}>
      <button
        onClick={() => {
          setVisible(!visible)
        }}
      >
        🌐
      </button>
      {visible && (
        <div className={cn('layout-grid', s.debugger)}>
          {new Array(columns).fill(0).map((_, key) => (
            <span key={key}></span>
          ))}
        </div>
      )}
    </div>
  )
}
