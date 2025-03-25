import React from "react";
import Layout from "@/components/layout";
import { getGames } from "@/lib/api";
import GamesClient from "./games-client";

// Server component that fetches initial data
export default async function GamesPage() {
  // Default to today's date
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get initial games data from the server
  const games = await getGames(dateString);
  
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">NBA Games</h1>
        
        {/* Client component that handles real-time updates */}
        <GamesClient initialGames={games} initialDate={dateString} />
      </div>
    </Layout>
  );
} 