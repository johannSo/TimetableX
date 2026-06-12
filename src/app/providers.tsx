'use client'

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import Script from "next/script"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HapticsProvider from '@/components/HapticsProvider'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import { readTrackingConsent, writeTrackingConsent, type TrackingConsent } from '@/lib/trackingConsent'

const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://umami.timetablex.space/script.js"
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "11bdbe02-20da-4968-aaab-be2b205522da"

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
  const [isConsentLoaded, setIsConsentLoaded] = useState(false);

  useEffect(() => {
    setTrackingConsent(readTrackingConsent());
    setIsConsentLoaded(true);
  }, []);

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
      {isConsentLoaded && trackingConsent === "accepted" ? (
        <Script src={UMAMI_SRC} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
      ) : null}
      <HapticsProvider />
      {children}
      {shouldShowBanner ? (
        <CookieConsentBanner
          onAccept={handleAcceptTracking}
          onReject={handleRejectTracking}
        />
      ) : null}
    </QueryClientProvider>
  )
}
