import type { Plugin } from '#app'

declare module '#imports' {
  export function defineNuxtPlugin(plugin: Plugin): Plugin
}
