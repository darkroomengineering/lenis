<script lang="ts">
    import Lenis from 'lenis'
    import { LenisContext } from '../instances/context'
    import type { LenisProps } from '../types'

	let props: LenisProps = $props();

    let wrapper: HTMLDivElement;
    let content: HTMLDivElement;

    let lenis = $state<Lenis>();

    $effect(() => {
        const instance = new Lenis({
            ...props.options,
            wrapper,
            content
        });

        lenis = instance;

        return () => instance.destroy();
    })

    LenisContext.set(() => lenis);
</script>

<div bind:this={wrapper} class={props.class} {...props}>
    <div bind:this={content}>
        {@render props.children()}
    </div>
</div>