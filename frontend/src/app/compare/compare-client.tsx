"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Dynamically import the PlayerComparison component
const PlayerComparison = dynamic(
  () => import("@/components/player/player-comparison").then(mod => ({ default: mod.PlayerComparison })),
  {
    loading: () => (
      <div className="w-full flex justify-center py-12">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
          <div className="h-48 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    ),
    ssr: false // Disable server-side rendering for this component
  }
);

export default function CompareClient() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-2">Player Comparison</h1>
      <p className="text-muted-foreground mb-6">
        Compare statistical projections between two NBA players to analyze their projected performance.
      </p>
      <Suspense fallback={
        <Card className="p-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </Card>
      }>
        <PlayerComparison />
      </Suspense>
    </div>
  );
} 