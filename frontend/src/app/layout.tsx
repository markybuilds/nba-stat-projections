import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WebSocketProvider } from "@/components/websocket-provider";
import { SWRProvider } from "@/providers/swr-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { RouteGuard } from "@/components/auth/route-guard";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";

// Dynamically import components with no SSR
const Prefetch = dynamic(() => import("@/components/prefetch"), { ssr: false });
const OfflineIndicator = dynamic(() => import("@/components/offline-indicator").then(mod => mod.OfflineIndicator), { ssr: false });
const ServiceWorkerRegister = dynamic(() => import("@/components/service-worker-register"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NBA Stat Projections",
  description: "Statistical projections for NBA players and games with advanced visualization and filtering.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NBA Stat Projections",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <WebSocketProvider>
          <AuthProvider>
            <ThemeProvider defaultTheme="system">
              <SWRProvider>
                <RouteGuard>
                  {children}
                </RouteGuard>
                <Toaster />
                <Prefetch />
                <OfflineIndicator />
                <ServiceWorkerRegister />
              </SWRProvider>
            </ThemeProvider>
          </AuthProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}
