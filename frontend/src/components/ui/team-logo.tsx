"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getTeamLogoUrl } from "@/lib/image-utils";

export interface TeamLogoProps {
  teamId: string | number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallback?: boolean;
}

export function TeamLogo({ 
  teamId, 
  size = "md", 
  className, 
  showFallback = true 
}: TeamLogoProps) {
  const [error, setError] = React.useState(false);
  const logoUrl = getTeamLogoUrl(teamId);
  
  // Define dimensions based on size
  const dimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 36, height: 36 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
  }[size];
  
  const handleError = () => {
    setError(true);
  };
  
  if (error && showFallback) {
    // Show team abbreviation as fallback
    return (
      <div 
        className={cn(
          "flex items-center justify-center rounded-full bg-gray-200",
          {
            "w-6 h-6 text-xs": size === "sm",
            "w-9 h-9 text-sm": size === "md",
            "w-12 h-12 text-base": size === "lg",
            "w-16 h-16 text-lg": size === "xl",
          },
          className
        )}
      >
        {typeof teamId === 'string' ? teamId.substring(0, 3).toUpperCase() : 'NBA'}
      </div>
    );
  }
  
  return (
    <div className={cn(
      "relative overflow-hidden",
      {
        "w-6 h-6": size === "sm",
        "w-9 h-9": size === "md",
        "w-12 h-12": size === "lg",
        "w-16 h-16": size === "xl",
      },
      className
    )}>
      <Image
        src={logoUrl}
        alt={`Team ${teamId} logo`}
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        onError={handleError}
        priority={size === "lg" || size === "xl"}
      />
    </div>
  );
} 