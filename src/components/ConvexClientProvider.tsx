"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ToastProvider } from "./ToastProvider";
import { ActivityWatcher } from "./ActivityWatcher";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ToastProvider>
        {children}
        <ActivityWatcher />
      </ToastProvider>
    </ConvexProviderWithClerk>
  );
}
