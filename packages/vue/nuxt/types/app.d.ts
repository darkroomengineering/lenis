declare module '#app' {
  export interface Plugin {
    name?: string
    setup: (nuxtApp: any) => void
  }
}
