import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WebSocketProvider } from "@/components/websocket-provider";
import { SWRProvider } from "@/providers/swr-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { RouteGuard } from "@/components/auth/route-guard";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NBA Stat Projections",
  description: "Statistical projections for NBA players and games with advanced visualization and filtering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0f172a" />
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
              </SWRProvider>
            </ThemeProvider>
          </AuthProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}
