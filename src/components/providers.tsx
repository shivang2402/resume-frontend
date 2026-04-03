"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              error: "!bg-red-50 !text-red-800 !border-red-300 dark:!bg-red-950 dark:!text-red-200 dark:!border-red-800",
              warning: "!bg-amber-50 !text-amber-800 !border-amber-300 dark:!bg-amber-950 dark:!text-amber-200 dark:!border-amber-800",
              success: "!bg-green-50 !text-green-800 !border-green-300 dark:!bg-green-950 dark:!text-green-200 dark:!border-green-800",
              info: "!bg-blue-50 !text-blue-800 !border-blue-300 dark:!bg-blue-950 dark:!text-blue-200 dark:!border-blue-800",
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
