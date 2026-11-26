import { Dialog } from '@base-ui-components/react/dialog'

// No lenis lock here: sync has none, and it doesn't need one. Base UI locks
// the viewport scroller (html, since sync gives it its own overflow), which
// freezes the target; body is fixed and mirrors it, so nothing moves.
export default function Modal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>open modal</Dialog.Trigger>
      <Dialog.Portal>
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
