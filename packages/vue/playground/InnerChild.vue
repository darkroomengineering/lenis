<script setup>
import { nextTick, onMounted } from 'vue'
import { useLenis } from '../dist/lenis-vue'

const lenis = useLenis((lenis) => {
  console.log('innerchild scroll', lenis.scroll)
})

onMounted(() => {
  nextTick(() => {
    console.log('Inner Lenis lerp:', lenis.value?.options.lerp)
  })
})
</script>

<template>
  <p>
    Commodo non culpa cillum nulla adipisicing elit qui sunt sit ipsum qui. Amet
    do voluptate voluptate voluptate qui quis excepteur fugiat. Aliqua elit
    cillum culpa qui pariatur pariatur. Magna ex labore elit consequat
    cupidatat. Do non dolor dolore quis id labore consectetur ea ipsum occaecat.
    Commodo sit exercitation Lorem nisi incididunt voluptate Lorem proident amet
    ad. Laborum irure consequat dolor amet ex laborum veniam esse amet. Officia
    veniam in exercitation excepteur magna fugiat non. Labore occaecat id
    cupidatat non reprehenderit enim laborum sint ex ad. Consequat aliqua veniam
    deserunt sint ex id pariatur cillum elit fugiat culpa Lorem. Ut irure id
    proident irure do in tempor qui excepteur. Amet eu minim aute. Aute ea
    aliqua sit consectetur quis occaecat dolor elit nulla occaecat ullamco
    dolor. Excepteur ea in cillum. Dolore fugiat do elit culpa commodo non id
    nulla in eu adipisicing esse. Fugiat labore sunt occaecat in minim occaecat
    adipisicing pariatur fugiat aliquip veniam anim exercitation. Voluptate
    fugiat do pariatur fugiat elit ex officia anim ad nisi incididunt. Duis
    minim nulla officia anim ad mollit. Quis sit culpa pariatur elit sit
    incididunt aliqua nisi voluptate culpa dolor magna quis in nulla. Duis
    fugiat anim consequat nulla pariatur proident incididunt aliquip dolor minim
    qui ullamco nulla culpa id. Amet duis qui do elit non ut consequat deserunt
    nulla aliqua quis. Eiusmod ut tempor quis laboris consectetur ipsum dolore
    ex sit. Ea nulla anim aliqua. Ullamco do exercitation dolor enim. Consequat
    fugiat elit proident ut reprehenderit pariatur elit nostrud veniam. Duis
    velit anim sunt consectetur exercitation aliquip. Nulla aliqua enim ut ipsum
    sunt dolor sunt veniam ex tempor do aliquip laborum magna. Eu consectetur ad
    amet do mollit. Amet sit tempor deserunt ad tempor non. Do voluptate esse do
    sunt est sint voluptate ut est ad non deserunt adipisicing sit. Elit
    exercitation id voluptate enim est excepteur amet irure do sit eiusmod quis
    incididunt. Esse ut minim dolor. Aute magna do tempor sunt. Labore sunt ad
    commodo aliquip ut ex et amet. Aliqua dolor deserunt sunt officia sit
    nostrud amet ut ea id consequat mollit veniam commodo. Voluptate officia
    voluptate cupidatat consequat ex Lorem consectetur enim dolore occaecat qui
    duis commodo. Deserunt dolore enim ad excepteur cillum duis Lorem proident
    nisi consequat in nostrud elit non. Magna esse reprehenderit sit aliqua
    pariatur id adipisicing anim minim velit consectetur labore cupidatat do
    pariatur. Dolore aute est eiusmod voluptate culpa esse occaecat velit ipsum.
    Ipsum consectetur labore nostrud proident exercitation ea quis voluptate
    consectetur deserunt labore ex. Id tempor officia velit ad reprehenderit
    enim ad in magna reprehenderit magna anim incididunt esse. Cillum nisi sunt
    tempor cillum amet non aliqua duis aliqua. Sit commodo laboris tempor enim
    Lorem ad. Dolor pariatur anim aliquip eiusmod occaecat eu. Commodo non elit
    sint qui adipisicing officia sunt aliqua eu. Adipisicing laborum nisi
    incididunt elit veniam do est anim ad aliqua non exercitation reprehenderit.
    Ea exercitation amet sint dolor eiusmod voluptate minim magna cillum
    excepteur sunt irure ullamco fugiat. Cupidatat ullamco ipsum dolor officia
    labore proident. Incididunt amet mollit est qui ea sit dolor consequat elit
    aliquip. Dolor duis reprehenderit aute Lorem mollit do elit ipsum deserunt
    incididunt ea est aliqua exercitation. Ad esse qui qui pariatur mollit
    occaecat deserunt deserunt est magna enim. Consequat nostrud ut cupidatat
    et. Velit magna mollit id nulla irure ex consectetur. Consectetur culpa
    adipisicing amet voluptate reprehenderit deserunt veniam pariatur et dolor
    adipisicing nulla elit ad. Duis minim Lorem duis elit et id ad laborum
    consequat tempor enim dolore. Minim ut nulla reprehenderit ullamco magna
    consectetur reprehenderit mollit pariatur sunt qui consequat minim dolore.
    Voluptate excepteur irure consectetur non magna laboris consequat
    exercitation voluptate. Amet duis ad nostrud voluptate irure non sunt.
    Deserunt pariatur enim magna culpa qui non.
  </p>
</template>
