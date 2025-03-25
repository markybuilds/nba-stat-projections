"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayerImageUrl, getTeamColor } from "@/lib/image-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface PlayerAvatarProps {
  playerId: string | number;
  playerName?: string;
  teamId?: string | number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTeamColor?: boolean;
}

export function PlayerAvatar({ 
  playerId, 
  playerName = "", 
  teamId,
  size = "md", 
  className,
  showTeamColor = true
}: PlayerAvatarProps) {
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
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
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
      <AvatarImage 
        src={playerImageUrl} 
        alt={playerName || `Player ${playerId}`} 
      />
      <AvatarFallback 
        className={cn(
          "bg-gray-200 text-gray-700",
          {
            "text-xs": size === "sm",
            "text-sm": size === "md",
            "text-base": size === "lg",
            "text-lg": size === "xl",
          }
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
} 