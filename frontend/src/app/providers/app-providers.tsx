import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/shared/theme/theme-provider";
import SocketProvider from "@/shared/realtime/socket-provider";
import { Toaster } from "@/shared/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 600_000,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SocketProvider>
            {children}
            <Toaster />
          </SocketProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
