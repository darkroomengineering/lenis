<script lang="ts">
    import Lenis from 'lenis'
    import { LenisContext } from '../instances/context'
    import { root } from '../instances/root.svelte'
    import type { LenisProps } from '../types'

	let props: LenisProps = $props();

    $effect.root(() => {
        const instance = new Lenis(props.options);

        root.value = instance;

        console.log(root.value)

        return () => instance.destroy();
    });

    LenisContext.set(() => root.value);
</script>

{@render props.children()}
