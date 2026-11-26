import { Dialog } from '@base-ui-components/react/dialog'
import type Lenis from 'lenis'

// Base UI only locks html/body; #scroller is the scroller, so lock Lenis
// itself. The portal is pointer-events: none, so wheel over the backdrop
// reaches #scroller and the lock has to swallow it.
const lenis = () => (window as unknown as { lenis: Lenis }).lenis

export default function Modal() {
  return (
    <Dialog.Root
      onOpenChange={(open) => (open ? lenis().lock() : lenis().unlock())}
    >
      <Dialog.Trigger>open modal</Dialog.Trigger>
      <Dialog.Portal style={{ pointerEvents: 'none' }}>
        <Dialog.Backdrop className="backdrop" />
        <Dialog.Popup className="popup">
          <Dialog.Title>Base UI modal</Dialog.Title>
          <Dialog.Description>
            page scroll should be locked; wheel here scrolls the popup only
          </Dialog.Description>
          {/* first tabbable: initial focus must not scroll the popup */}
          <Dialog.Close>close</Dialog.Close>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i}>line {i + 1}</p>
          ))}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
