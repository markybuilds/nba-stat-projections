import React from "react";
import Layout from "@/components/layout";
import { getGame, getGameProjections } from "@/lib/api";
import { notFound } from "next/navigation";
import GameDetailClient from "./game-detail-client";

interface GamePageProps {
  params: {
    id: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
  try {
    // Fetch game details and projections
    const game = await getGame(params.id);
    const projections = await getGameProjections(params.id);
    
    return (
      <Layout>
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Game Details</h1>
          
          {/* Client component that handles real-time updates */}
          <GameDetailClient 
            initialGame={game} 
            initialProjections={projections} 
          />
        </div>
      </Layout>
    );
  } catch (error) {
    console.error("Error loading game:", error);
    notFound();
  }
} 