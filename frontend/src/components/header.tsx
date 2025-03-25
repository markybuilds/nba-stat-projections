"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { RealTimeIndicator } from "./real-time-indicator";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <span className="text-primary">NBA</span> 
            <span className="hidden xs:inline">Stat Projections</span>
            <span className="xs:hidden">Stats</span>
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
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
            className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
          >
            API Docs
          </Link>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] pr-0">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href="/" 
                    className="flex items-center px-2 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/players" 
                    className="flex items-center px-2 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Players
                  </Link>
                  <Link 
                    href="/games" 
                    className="flex items-center px-2 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Games
                  </Link>
                  <Link 
                    href="/projections" 
                    className="flex items-center px-2 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Projections
                  </Link>
                  <Link 
                    href="/compare" 
                    className="flex items-center px-2 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Compare
                  </Link>
                  <Link 
                    href="/api-docs" 
                    className="flex items-center px-2 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                    target="_blank"
                  >
                    API Docs
                  </Link>
                  
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between px-2 py-3">
                      <span className="text-sm text-muted-foreground">Real-time Updates</span>
                      <RealTimeIndicator />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 