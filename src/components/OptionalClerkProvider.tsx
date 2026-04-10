import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const clerkAppearance = {
  variables: {
    colorPrimary: '#7AA2F7',
    colorText: '#1F2335',
    colorBackground: '#FFFFFF',
    colorInputText: '#1F2335',
    colorInputBackground: '#F8FAFF',
    borderRadius: '18px',
    fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif",
  },
};

export default function OptionalClerkProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) {
    return <>{children}</>;
  }

  return <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>;
}
