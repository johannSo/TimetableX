declare global {
  interface Window {
    umami?: {
      track: (event: string, props?: Record<string, unknown>) => void
    }
  }
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(event, props)
  }
}
