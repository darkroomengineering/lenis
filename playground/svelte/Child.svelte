<script lang="ts">
    import { LoremIpsum } from "lorem-ipsum"

    const lorem = new LoremIpsum().generateParagraphs(200);

    const lerp = $state(0.1);
    const autoRaf = $state(true);

</script>

<p>
    { lorem }
</p>

    