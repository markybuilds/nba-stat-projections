"use client";

import React from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { WebSocketProvider } from "./websocket-provider";
import { Toaster } from "./ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <WebSocketProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </div>
    </WebSocketProvider>
  );
} 