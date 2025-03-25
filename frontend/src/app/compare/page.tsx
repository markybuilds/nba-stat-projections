import React from "react";
import { Layout } from "@/components/layout";
import { PlayerComparison } from "@/components/player/player-comparison";

export const metadata = {
  title: "Compare Players - NBA Stat Projections",
  description: "Compare statistical projections between NBA players to see how they stack up against each other.",
};

export default function ComparePage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-2">Player Comparison</h1>
        <p className="text-muted-foreground mb-6">
          Compare statistical projections between two NBA players to analyze their projected performance.
        </p>
        <PlayerComparison />
      </div>
    </Layout>
  );
} 