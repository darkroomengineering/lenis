# Lenis Svelte

lenis/svelte provides a `<SvelteLenis>` component that creates a [Lenis](https://github.com/darkroomengineering/lenis) instance and provides it to its children via context. This allows you to use Lenis in your Svelte app without worrying about passing the instance down through props. It also provides a `useLenis` hook that allows you to access the Lenis instance from any component in your app.


## Installation

```bash
npm i lenis
```

## Usage

### Basic

```jsx
import { SvelteLenis, useLenis } from 'lenis/svelte'

function App() {
  const lenis = useLenis(({ scroll }) => {
    // called every scroll
  })

  return (
    <SvelteLenis root>
      { /* content */ }
    </SvelteLenis>
  )
}
```

## Props
- `options`: [Lenis options](https://github.com/darkroomengineering/lenis#instance-settings).
- `root`: Lenis will be instanciate using `<html>` scroll. Default: `false`.

## Hooks
Once the Lenis context is set (components mounted inside `<SveltetLenis>`) you can use these handy hooks:

`useLenis` is a hook that returns the Lenis instance

The hook takes three argument:
- `callback`: The function to be called whenever a scroll event is emitted
- `priority`: Manage callback execution order