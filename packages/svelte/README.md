# Lenis Svelte

Lenis Svelte provides an [action](https://svelte.dev/docs/svelte-action) that instantiate [Lenis](https://lenis.darkroom.engineering/) for you in a Svelte app.
This facilitate the use of Lenis in Svelte App without worry about how use it cross the component tree.

> If you are more interested realted to Lenis. Please check out their repository [here](https://github.com/darkroomengineering/lenis)

## Usage

### Using for global scrolling

If the action is just add iot

```svelte
<script>
    import { lenis } from "lenis/svelte";

    const root = lenis.instance('root');
    //        or lenis.root();

    onMount(() => {
        $root?.on('scroll', () => console.log(`[Lenis root] scrolling...`))
    });

</script>
<main use:lenis>
 {...}
</main>
```

### Using it for section scroll

```svelte
<script>
    import { lenis } from "lenis/svelte";

    const lenisInstance = lenis.instance('__identifier__');

    onMount(() => {
        $lenisInstance?.on('scroll', () => console.log(`[Lenis in section] scrolling...`))
    });

</script>
<div use:lenis={{ id: '__identifier__' }}>
 {...}
</div>
```

You can also use the `lenis.instance(<id>)` in sub components to get the instance that you want to manage.


## Metadata

### Action params

- `id`:
    This is used to identify the lenis instance. You can getting back using `lenis.instance(<id>)`
    - type: `string`
    - default: `"root"`

- `autoRaf`:
    If you want to run lenis.raf() by yourself, set it to `false`
    - type: `boolean`
    - default: `true`

- `options`:
    You can send any Lenis config here. [LenisOptions](https://github.com/darkroomengineering/lenis#instance-settings)
    - type: `LenisOptions`
    - default: none just the lib defaults

```svelte
<script>
    import { lenis } from "lenis/svelte";
</script>
<div use:lenis={/* action params */}>
 {...}
</div>
```

### Action extra methods

- `.instance`: Method use for get the intance by id
    - type: `instance(id: string): Readable<Lenis>`
    - default: none
- `.root`: Is just an alias for `lenis.instance('root')` which get global lenis instance.

Usage:
```js
    import { lenis } from "lenis/svelte";
    
    const box = lenis.instance('box-1');
    const root = lenis.root();
```

