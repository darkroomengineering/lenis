Sticky uses GSAP ScrollTrigger under the hood.
docs: https://greensock.com/docs/v3/Plugins/ScrollTrigger

start: pixel distance to viewport top.
end: pixel distance to parent element bottom.
target: element to be sticky, direct parent by default.
pinType: 'fixed' or 'transform'. 'fixed' by default.

```javascript
import { Sticky } from 'components/sticky'
;<Sticky start="200" end="0">
  <div></div>
</Sticky>
```
