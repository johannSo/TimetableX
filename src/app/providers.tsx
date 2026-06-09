'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense, useState } from "react"
import type { ReactNode } from "react"
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HapticsProvider from '@/components/HapticsProvider'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import { readTrackingConsent, writeTrackingConsent, type TrackingConsent } from '@/lib/trackingConsent'

function PostHogPageView({ enabled }: { enabled: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!enabled) return
    if (pathname && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [enabled, pathname, searchParams])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));
  const [trackingConsent, setTrackingConsent] = useState<TrackingConsent>("pending");
  const [hasInitializedPostHog, setHasInitializedPostHog] = useState(false);
  const [isConsentLoaded, setIsConsentLoaded] = useState(false);

  useEffect(() => {
    setTrackingConsent(readTrackingConsent());
    setIsConsentLoaded(true);
  }, []);

  // Initialize PostHog once (opted out by default until consent is known)
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || hasInitializedPostHog) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://z.timetablex.space",
      person_profiles: 'always',
      capture_pageview: false,
      opt_out_capturing_by_default: true,
    });
    setHasInitializedPostHog(true);
  }, [hasInitializedPostHog]);

  // Apply consent decision once PostHog is initialized and consent is loaded
  useEffect(() => {
    if (!hasInitializedPostHog || !isConsentLoaded) return;

    if (trackingConsent === "accepted") {
      posthog.opt_in_capturing();
    } else if (trackingConsent === "rejected") {
      posthog.opt_out_capturing();
      posthog.reset();
    }
  }, [hasInitializedPostHog, isConsentLoaded, trackingConsent]);

  const handleAcceptTracking = () => {
    writeTrackingConsent("accepted");
    setTrackingConsent("accepted");
  };

  const handleRejectTracking = () => {
    writeTrackingConsent("rejected");
    setTrackingConsent("rejected");
  };

  const shouldShowBanner = isConsentLoaded && trackingConsent === "pending";

  return (
    <QueryClientProvider client={queryClient}>
      <PHProvider client={posthog}>
        <Suspense fallback={null}>
          <PostHogPageView enabled={trackingConsent === "accepted" && hasInitializedPostHog} />
        </Suspense>
        <HapticsProvider />
        {children}
        {shouldShowBanner ? (
          <CookieConsentBanner
            onAccept={handleAcceptTracking}
            onReject={handleRejectTracking}
          />
        ) : null}
      </PHProvider>
    </QueryClientProvider>
  )
}
