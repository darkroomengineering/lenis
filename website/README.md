# [Lenis Website]

## Setup

The usual process for Next.js based apps/websites:

1. Install node modules:

   `$ pnpm i`

2. Get the .env variables from Vercel (check `.env.template`), after [installing Vercel CLI](https://vercel.com/docs/cli):

   `$ vc link`

   `$ vc env pull`

3. run development environment:

   `$ pnpm dev`

## Stack

- [Lenis](https://github.com/studio-freight/lenis) // in this case we're using the local /bundled version, instead of the npm package.
- [Tempus](https://github.com/studio-freight/tempus)
- [Hamo](https://github.com/studio-freight/hamo)
- [PNPM](https://pnpm.io/)
- [Next.js](https://nextjs.org/)
- [Three.js](https://threejs.org/)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [GSAP](https://greensock.com/gsap/)
- [Embla Carousel](https://github.com/davidcetinkaya/embla-carousel)
- Sass (Modules)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- GraphQL (CMS API)
- [Next-Sitemap](https://github.com/iamvishnusankar/next-sitemap) (postbuild script)
- [@svgr/webpack](https://github.com/gregberge/svgr/tree/main) (SVG Imports in `next.config.js`)

## Code Style & Linting

- Eslint ([Next](https://nextjs.org/docs/basic-features/eslint#eslint-config) and [Prettier](https://github.com/prettier/eslint-config-prettier) plugins)
- [Prettier](https://prettier.io/) with the following settings available in `.pretierrc`:
  ```json
  {
    "endOfLine": "auto",
    "semi": false,
    "singleQuote": true
  }
  ```
- [Husky + lint-staged precommit hooks](https://github.com/okonet/lint-staged)

## Third Party

- [Vercel (Hosting & Continuous Deployment)](https://vercel.com/home)
- [GitHub Versioning](https://github.com/)

## Folder Structure

Alongside the usual Next.js folder structure (`/public`, `/pages`, etc.) We've added a few other folders to keep the code easier to read:

- **/assets:** General Images/Videos and SVGs
- **/components:** Reusable components with their respective Sass file
- **/contentful:** Fragments/Queries/Renderers
- **/config:** General settings (mostly Leva for now)
- **/hooks:** Reusable Custom Hooks
- **/layouts:** High level layout component
- **/lib:** Reusable Scripts and State Store
- **/styles:** Global styles and Sass partials
