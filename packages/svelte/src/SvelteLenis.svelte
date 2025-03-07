<script lang="ts">
    import type { LenisProps } from './types'

    import LenisByContext from './provider/LenisByContext.svelte'
    import LenisByRoot from './provider/LenisByRoot.svelte'

    type Props = LenisProps & { root: boolean; }

	let props: Props = $props();
</script>

{#if props.root}
    <LenisByRoot {...props} />
{:else}
    <LenisByContext {...props} />
{/if}
