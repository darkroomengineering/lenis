import * as SelectPrimitive from '@radix-ui/react-select'
import { forwardRef } from 'react'

export const Root = forwardRef(function SelectFn(
  { children, ...props },
  forwardedRef
) {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger ref={forwardedRef}>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>⌄</SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content>
        <SelectPrimitive.ScrollUpButton>⌃</SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton>⌄</SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  )
})

export const Item = forwardRef(function SelectItemFn(
  { children, ...props },
  forwardedRef
) {
  return (
    <SelectPrimitive.Item {...props} ref={forwardedRef}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>✓</SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
})
