# Grid Debugger

## Usage

This is an abstraction on top of [Radix's Select implementation](https://www.radix-ui.com/docs/primitives/components/select) refer to their docs to customize the abstraction, or use the following example to

## Example

```javascript
import * as Select from 'components/select'

export default () => (
  <Select.Root defaultValue="2">
    <Select.Item value="1">Item 1</Select.Item>
    <Select.Item value="2">Item 2</Select.Item>
    <Select.Item value="3">Item 3</Select.Item>
  </Select.Root>
)
```
