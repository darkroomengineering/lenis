import { useEffect, useState } from 'react'

export const ClientOnly = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (!isMounted) {
    return null
  }

  return children || null
}

export const ServerOnly = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (isMounted) {
    return null
  }

  return children || null
}
