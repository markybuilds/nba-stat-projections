"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayerImageUrl, getTeamColor } from "@/lib/image-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface PlayerAvatarProps {
  playerId: string | number;
  playerName?: string;
  teamId?: string | number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showTeamColor?: boolean;
  priority?: boolean;
}

export function PlayerAvatar({ 
  playerId, 
  playerName = "", 
  teamId,
  size = "md", 
  className,
  showTeamColor = true,
  priority = false
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const playerImageUrl = getPlayerImageUrl(playerId);
  
  // Get player initials for fallback
  const initials = playerName
    ? playerName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '#';
  
  // Get team color if teamId is provided and showTeamColor is true
  const borderColor = teamId && showTeamColor ? getTeamColor(teamId) : undefined;
  
  // Define dimensions based on size
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  // Define dimensions in pixels for proper image sizing
  const dimensions = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };
  
  const ringClasses = showTeamColor && teamId 
    ? `ring-2 ${borderColor ? `ring-[${borderColor}]` : 'ring-primary'}` 
    : '';
    
  return (
    <Avatar className={cn(
      sizeClasses[size],
      ringClasses,
      className
    )}>
      {!imageError ? (
        <div className="w-full h-full relative overflow-hidden rounded-full">
          <Image 
            src={playerImageUrl} 
            alt={playerName || `Player ${playerId}`}
            width={dimensions[size]}
            height={dimensions[size]}
            className="object-cover"
            onError={() => setImageError(true)}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            sizes={`(max-width: 768px) ${dimensions[size]}px, ${dimensions[size]}px`}
          />
        </div>
      ) : (
        <AvatarFallback 
          className={cn(
            "bg-gray-200 text-gray-700",
            {
              "text-[10px]": size === "xs",
              "text-xs": size === "sm",
              "text-sm": size === "md",
              "text-base": size === "lg",
              "text-lg": size === "xl",
            }
          )}
        >
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
} 