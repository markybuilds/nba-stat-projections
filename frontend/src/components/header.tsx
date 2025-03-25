"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { RealTimeIndicator } from "./real-time-indicator";

export function Header() {
  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <span className="text-primary">NBA</span> 
            <span>Stat Projections</span>
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/players" className="text-sm font-medium hover:text-primary transition-colors">
            Players
          </Link>
          <Link href="/games" className="text-sm font-medium hover:text-primary transition-colors">
            Games
          </Link>
          <Link href="/projections" className="text-sm font-medium hover:text-primary transition-colors">
            Projections
          </Link>
          <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors">
            Compare
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <RealTimeIndicator className="mr-4" />
          <Link 
            href="/api-docs" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
          >
            API Docs
          </Link>
        </div>
      </div>
    </header>
  );
} 