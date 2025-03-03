<script>
    import { LoremIpsum } from "lorem-ipsum"

    import { SvelteLenis, useLenis } from 'lenis/svelte'

    const lorem = new LoremIpsum().generateParagraphs(200);

    let lerp = $state(0.1);
    let autoRaf = $state(true);
    let options = $derived({ lerp, autoRaf });

    let lenis = useLenis(
        (lenis) => {
            console.log('root scroll', lenis.options.lerp, lenis.scroll)
        }
    );

    $effect(() => {
        console.log(lenis.current)
    })

</script>

<SvelteLenis root options={options}>
    <button onclick={() => lerp += 0.1}>more lerp</button>
    <button onclick={() => lerp -= 0.1}>less lerp</button>
    <button onclick={() => lenis.current.scrollTo(200)}>scroll to 200</button>
    <p>
        { lorem }
    </p>
</SvelteLenis>