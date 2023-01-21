Parallax uses GSAP ScrollTrigger under the hood.

speed: parallax speed relative to viewport width.
position: use 'top' if element is visible on first screen of your page.

```javascript
import dynamic from 'next/dynamic'
const Parallax = dynamic(
  () => import('components/parallax').then((mod) => mod.Parallax),
  { ssr: false }
)

return (
  <Parallax speed={1}>
    <div></div>
  </Parallax>
)
```
