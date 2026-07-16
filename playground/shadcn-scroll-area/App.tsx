import * as React from "react"

import { cn } from "@/lib/utils"
import Lenis from "lenis"
import { loremIpsum } from "lorem-ipsum"

import { ScrollArea, type ScrollAreaProps } from "@/components/ui/scroll-area"

import "./App.css"

function App({className, ...props}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const paragraphs = Array.from({ length: 40 })

  React.useEffect(() => {
    if (!viewportRef.current) return

    const lenis = new Lenis({
      autoRaf: true,
      wrapper: viewportRef.current,
    })

    return () => lenis.destroy()
  }, [])


  return (
    <ScrollArea className={cn(className, "h-dvh")} viewportRef={viewportRef} {...props}>
      {paragraphs.map((_, index) => (
        <p key={index}>
          {loremIpsum({ count: 1, units: "paragraphs" })}
        </p>
      ))}
    </ScrollArea>
  )
}

export default App
