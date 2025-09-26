'use client';

import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

// Use environment variable or fallback to known deployment URL
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://outstanding-spider-744.convex.cloud';

// Initialize Convex client with explicit URL
const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
