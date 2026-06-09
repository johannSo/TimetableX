import posthog from 'posthog-js'

export function track(event: string, props?: Record<string, unknown>) {
  posthog.capture(event, props)
}
